'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  UserCheck,
  UserX,
  Award,
  Search,
  ArrowUpDown,
  ShieldCheck,
  BookOpen,
  Plus,
  X,
  ChevronDown,
} from 'lucide-react';
import { getCurrentUser } from '@/lib/hub-auth';
import {
  isChampion,
  getChampionOrganization,
  getTeamMembers,
  getTeamStats,
  getSchoolRecommendedCourses,
  getPublishedCourses,
  addSchoolRecommendation,
  removeSchoolRecommendation,
  type TeamMember,
  type TeamStats,
} from '@/lib/hub/champion';

type SortField = 'name' | 'status';
type SortDirection = 'asc' | 'desc';

interface Course {
  id: string;
  title: string;
  slug: string;
  category: string;
  pd_hours: number;
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon size={24} style={{ color }} />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default function ChampionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push('/hub/login');
          return;
        }

        const championStatus = await isChampion(user.id);
        if (!championStatus) {
          router.push('/hub');
          return;
        }

        const orgId = await getChampionOrganization(user.id);
        if (!orgId) {
          // Champion without organization - show empty state
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        setOrganizationId(orgId);
        setIsAuthorized(true);

        // Load data
        const [members, teamStats, recommended, courses] = await Promise.all([
          getTeamMembers(orgId),
          getTeamStats(orgId),
          getSchoolRecommendedCourses(orgId),
          getPublishedCourses(),
        ]);

        setTeamMembers(members);
        setStats(teamStats);
        setRecommendedCourses(recommended as Course[]);
        setAllCourses(courses);
      } catch (error) {
        console.error('Auth error:', error);
        router.push('/hub');
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  // Filter and sort team members
  const filteredMembers = useMemo(() => {
    let result = [...teamMembers];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.display_name?.toLowerCase().includes(query) ||
          m.email.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        const nameA = a.display_name || a.email;
        const nameB = b.display_name || b.email;
        comparison = nameA.localeCompare(nameB);
      } else if (sortField === 'status') {
        comparison = Number(b.is_enrolled) - Number(a.is_enrolled);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [teamMembers, searchQuery, sortField, sortDirection]);

  // Available courses for recommendation (not already recommended)
  const availableCourses = useMemo(() => {
    const recommendedIds = new Set(recommendedCourses.map((c) => c.id));
    return allCourses.filter((c) => !recommendedIds.has(c.id));
  }, [allCourses, recommendedCourses]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAddRecommendation = async (courseId: string) => {
    if (!organizationId) return;
    const success = await addSchoolRecommendation(organizationId, courseId);
    if (success) {
      const course = allCourses.find((c) => c.id === courseId);
      if (course) {
        setRecommendedCourses([...recommendedCourses, course]);
      }
    }
    setCourseDropdownOpen(false);
  };

  const handleRemoveRecommendation = async (courseId: string) => {
    if (!organizationId) return;
    const success = await removeSchoolRecommendation(organizationId, courseId);
    if (success) {
      setRecommendedCourses(recommendedCourses.filter((c) => c.id !== courseId));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B3A67]" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  if (!organizationId) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] pt-[60px]">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            No Organization Linked
          </h1>
          <p className="text-gray-600">
            Your account is not linked to a school organization yet. Please
            contact support to set up your school dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] pt-[60px]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#2B3A67]">School Dashboard</h1>
          <p className="text-gray-600 mt-1">
            See who on your team has enrolled. Individual progress is private.
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Users}
              label="Total team members"
              value={stats.totalMembers}
              color="#2B3A67"
            />
            <StatCard
              icon={UserCheck}
              label="Enrolled"
              value={stats.enrolled}
              color="#22C55E"
            />
            <StatCard
              icon={UserX}
              label="Not yet enrolled"
              value={stats.notEnrolled}
              color="#EAB308"
            />
            <StatCard
              icon={Award}
              label="Completed 1+ course"
              value={stats.completedAtLeastOne}
              color="#8B5CF6"
            />
          </div>
        )}

        {/* Team List */}
        <div className="bg-white rounded-xl border border-gray-200 mb-8">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>

              {/* Search */}
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B3A67]/20 focus:border-[#2B3A67]"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                    >
                      Name
                      <ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-left py-3 px-4">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                    >
                      Status
                      <ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Courses Enrolled
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900">
                        {member.display_name || 'Unnamed'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{member.email}</td>
                    <td className="py-3 px-4">
                      {member.is_enrolled ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <UserCheck size={12} />
                          Enrolled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          <UserX size={12} />
                          Not Enrolled
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {member.enrollment_count}
                    </td>
                  </tr>
                ))}
                {filteredMembers.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-gray-500"
                    >
                      No team members found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* School Recommendations */}
        <div className="bg-white rounded-xl border border-gray-200 mb-8">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Recommended by School
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Courses you recommend will show a badge in your
                  team&apos;s catalog
                </p>
              </div>

              {/* Add Recommendation Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setCourseDropdownOpen(!courseDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 bg-[#2B3A67] text-white text-sm rounded-lg hover:bg-[#1e2a4a] transition-colors"
                  disabled={availableCourses.length === 0}
                >
                  <Plus size={16} />
                  Add Course
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${courseDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {courseDropdownOpen && availableCourses.length > 0 && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                    {availableCourses.map((course) => (
                      <button
                        key={course.id}
                        onClick={() => handleAddRecommendation(course.id)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900 text-sm">
                          {course.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {course.category} &bull; {course.pd_hours} PD hours
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-4">
            {recommendedCourses.length > 0 ? (
              <div className="space-y-3">
                {recommendedCourses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen size={20} className="text-[#2B3A67]" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {course.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {course.category} &bull; {course.pd_hours} PD hours
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveRecommendation(course.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove recommendation"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No courses recommended yet. Add courses to help guide your
                team&apos;s learning.
              </p>
            )}
          </div>
        </div>

        {/* Privacy Banner */}
        <div className="bg-[#2B3A67]/5 rounded-xl p-6 border border-[#2B3A67]/10">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <ShieldCheck size={24} className="text-[#2B3A67]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#2B3A67] mb-1">
                Teacher Privacy
              </h3>
              <p className="text-sm text-gray-600">
                Individual progress, assessment scores, and check-in data are
                never visible to school administrators. You can only see
                enrollment status.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
