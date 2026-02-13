'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTDIAdmin } from '@/lib/tdi-admin/context';
import { hasPermission } from '@/lib/tdi-admin/permissions';
import { getAdminCourses, toggleCoursePublished } from '@/lib/hub/admin';
import { getSupabase } from '@/lib/supabase';
import ExampleDataBanner from '@/components/tdi-admin/ExampleDataBanner';
import {
  ArrowLeft,
  BookOpen,
  Zap,
  FolderOpen,
  Calendar,
  Star,
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Edit2,
  Trash2,
  Copy,
  Archive,
  Eye,
  EyeOff,
  Upload,
  Image,
  FileText,
  Video,
  File,
  Download,
  AlertCircle,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  GripVertical,
  Check,
  X,
} from 'lucide-react';

type Tab = 'courses' | 'quick-wins' | 'media' | 'calendar' | 'feedback';

// Tab Button Component
function TabButton({ active, onClick, children, disabled }: { active: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
        active
          ? 'border-[#E8B84B] text-[#2B3A67]'
          : disabled
          ? 'border-transparent text-gray-300 cursor-not-allowed'
          : 'border-transparent text-gray-500 hover:text-[#2B3A67] hover:border-gray-200'
      }`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {children}
    </button>
  );
}

// Empty State Component
function EmptyState({ icon: Icon, title, description, action }: { icon: React.ElementType; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
        <Icon size={24} className="text-gray-400" />
      </div>
      <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      {action}
    </div>
  );
}

// ============= TAB COMPONENTS =============

// COURSES TAB
function CoursesTab() {
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    slug: '',
    description: '',
    category: 'Classroom Management',
    pd_hours: 1,
    difficulty: 'beginner',
    author_name: '',
    author_bio: '',
    is_published: false,
  });

  useEffect(() => {
    async function load() {
      const data = await getAdminCourses();
      setCourses(data || []);
      setIsLoading(false);
    }
    load();
  }, []);

  const handleTogglePublished = async (courseId: string, currentStatus: boolean) => {
    await toggleCoursePublished(courseId, !currentStatus);
    setCourses(courses.map(c => c.id === courseId ? { ...c, is_published: !currentStatus } : c));
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const filtered = courses.filter(c => {
    if (!search) return true;
    return c.title?.toLowerCase().includes(search.toLowerCase());
  });

  if (isLoading) {
    return <div className="py-8 text-center text-gray-500">Loading courses...</div>;
  }

  return (
    <div>
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B84B]/50"
          />
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2"
          style={{ backgroundColor: '#E8B84B' }}
        >
          <Plus size={16} />
          Create Course
        </button>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg" style={{ color: '#2B3A67' }}>Create New Course</h3>
              <button onClick={() => setShowCreateForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value, slug: generateSlug(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B84B]/50"
                  placeholder="Course title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={newCourse.slug}
                  onChange={(e) => setNewCourse({ ...newCourse, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B84B]/50 bg-gray-50"
                  placeholder="course-slug"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B84B]/50 resize-none"
                  rows={3}
                  placeholder="Course description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newCourse.category}
                    onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
                  >
                    <option>Classroom Management</option>
                    <option>Student Engagement</option>
                    <option>Teacher Wellbeing</option>
                    <option>Instructional Strategies</option>
                    <option>Leadership</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PD Hours</label>
                  <input
                    type="number"
                    value={newCourse.pd_hours}
                    onChange={(e) => setNewCourse({ ...newCourse, pd_hours: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B84B]/50"
                    min={0}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  value={newCourse.difficulty}
                  onChange={(e) => setNewCourse({ ...newCourse, difficulty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author Name</label>
                <input
                  type="text"
                  value={newCourse.author_name}
                  onChange={(e) => setNewCourse({ ...newCourse, author_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B84B]/50"
                  placeholder="Author name"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={newCourse.is_published}
                  onChange={(e) => setNewCourse({ ...newCourse, is_published: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <label htmlFor="is_published" className="text-sm text-gray-700">Publish immediately</label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                style={{ backgroundColor: '#E8B84B' }}
              >
                Create Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Courses Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#FAFAF8]">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">PD Hours</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Lessons</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Enrollments</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">No courses found</td>
              </tr>
            ) : (
              filtered.map((course, i) => (
                <tr key={course.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAF8]'}>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
                      className="text-left"
                    >
                      <p className="text-sm font-medium text-gray-900 hover:text-[#E8B84B]">{course.title}</p>
                      <p className="text-xs text-gray-500">{course.slug}</p>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{course.category}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{course.pd_hours || 0}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{course.lessons_count || 0}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{course.enrollments_count || 0}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      course.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {course.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTogglePublished(course.id, course.is_published)}
                        className="p-1.5 rounded hover:bg-gray-100"
                        title={course.is_published ? 'Unpublish' : 'Publish'}
                      >
                        {course.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button className="p-1.5 rounded hover:bg-gray-100" title="Edit">
                        <Edit2 size={14} />
                      </button>
                      <button className="p-1.5 rounded hover:bg-gray-100" title="Duplicate">
                        <Copy size={14} />
                      </button>
                      <button className="p-1.5 rounded hover:bg-gray-100 text-red-500" title="Archive">
                        <Archive size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// QUICK WINS TAB
function QuickWinsTab() {
  const [quickWins, setQuickWins] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();
      const { data } = await supabase
        .from('hub_quick_wins')
        .select('*')
        .order('created_at', { ascending: false });
      setQuickWins(data || []);
      setIsLoading(false);
    }
    load();
  }, []);

  const filtered = quickWins.filter(qw => {
    if (!search) return true;
    return qw.title?.toLowerCase().includes(search.toLowerCase());
  });

  const typeIcons: Record<string, React.ElementType> = {
    read: FileText,
    watch: Video,
    do: Check,
    download: Download,
    reflect: Edit2,
  };

  if (isLoading) {
    return <div className="py-8 text-center text-gray-500">Loading Quick Wins...</div>;
  }

  return (
    <div>
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Quick Wins..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B84B]/50"
          />
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2"
          style={{ backgroundColor: '#E8B84B' }}
        >
          <Plus size={16} />
          Create Quick Win
        </button>
      </div>

      {/* Quick Wins Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#FAFAF8]">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Duration</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    icon={Zap}
                    title="No Quick Wins Yet"
                    description="Create your first Quick Win to get started."
                  />
                </td>
              </tr>
            ) : (
              filtered.map((qw, i) => {
                const TypeIcon = typeIcons[qw.type] || FileText;
                return (
                  <tr key={qw.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAF8]'}>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{qw.title}</p>
                      <p className="text-xs text-gray-500">{qw.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{qw.category || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        <TypeIcon size={12} />
                        {qw.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{qw.duration_minutes || '-'} min</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        qw.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {qw.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 rounded hover:bg-gray-100" title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button className="p-1.5 rounded hover:bg-gray-100 text-red-500" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// MEDIA LIBRARY TAB
function MediaTab() {
  const [filter, setFilter] = useState('all');

  const mockMedia = [
    { id: '1', name: 'intro-video.mp4', type: 'video', size: '45 MB', date: '2024-01-15' },
    { id: '2', name: 'course-thumbnail.png', type: 'image', size: '1.2 MB', date: '2024-01-14' },
    { id: '3', name: 'resource-guide.pdf', type: 'pdf', size: '2.5 MB', date: '2024-01-13' },
  ];

  const typeIcons: Record<string, React.ElementType> = {
    video: Video,
    image: Image,
    pdf: FileText,
  };

  const typeColors: Record<string, string> = {
    video: 'bg-purple-100 text-purple-700',
    image: 'bg-green-100 text-green-700',
    pdf: 'bg-red-100 text-red-700',
  };

  return (
    <div>
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {['all', 'videos', 'images', 'pdfs'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <button
          className="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2"
          style={{ backgroundColor: '#E8B84B' }}
        >
          <Upload size={16} />
          Upload Files
        </button>
      </div>

      {/* Upload Zone */}
      <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 mb-6 text-center hover:border-[#E8B84B] transition-colors cursor-pointer">
        <Upload size={32} className="mx-auto mb-3 text-gray-400" />
        <p className="text-sm text-gray-600 mb-1">Drag and drop files here, or click to browse</p>
        <p className="text-xs text-gray-400">Supports videos, images, and PDFs</p>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {mockMedia.map((file) => {
          const TypeIcon = typeIcons[file.type] || File;
          return (
            <div key={file.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-square bg-gray-50 flex items-center justify-center">
                <TypeIcon size={32} className="text-gray-400" />
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${typeColors[file.type]}`}>
                    {file.type}
                  </span>
                  <span className="text-xs text-gray-400">{file.size}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Placeholder Note */}
      <div className="mt-8 p-4 rounded-lg border border-amber-200 bg-amber-50">
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> Full media upload functionality will be enabled once Mux/Cloudflare integration is complete.
        </p>
      </div>
    </div>
  );
}

// CONTENT CALENDAR TAB
function CalendarTab() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Mock scheduled content
  const scheduled: Record<number, { type: 'course' | 'quick-win' | 'download'; title: string }[]> = {
    5: [{ type: 'course', title: 'New Course Launch' }],
    12: [{ type: 'quick-win', title: 'Quick Win: Morning Routine' }],
    18: [{ type: 'course', title: 'Course Update' }, { type: 'download', title: 'Resource Pack' }],
    25: [{ type: 'quick-win', title: 'Quick Win: Stress Relief' }],
  };

  const typeColors: Record<string, string> = {
    course: 'bg-blue-500',
    'quick-win': 'bg-[#E8B84B]',
    download: 'bg-green-500',
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50" />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const daySchedule = scheduled[day] || [];
    const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth.getMonth() && new Date().getFullYear() === currentMonth.getFullYear();

    days.push(
      <div
        key={day}
        className={`h-24 border border-gray-100 p-1 ${isToday ? 'bg-blue-50' : 'bg-white'} hover:bg-gray-50 cursor-pointer`}
      >
        <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>{day}</span>
        <div className="mt-1 space-y-0.5">
          {daySchedule.map((item, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${typeColors[item.type]}`} />
              <span className="text-xs text-gray-600 truncate">{item.title}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100">
            <ChevronDown size={20} className="rotate-90" />
          </button>
          <h2 className="text-lg font-semibold" style={{ color: '#2B3A67' }}>
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100">
            <ChevronDown size={20} className="-rotate-90" />
          </button>
        </div>
        <button
          className="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2"
          style={{ backgroundColor: '#E8B84B' }}
        >
          <Plus size={16} />
          Schedule Content
        </button>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-sm text-gray-600">Courses</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#E8B84B]" />
          <span className="text-sm text-gray-600">Quick Wins</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm text-gray-600">Downloads</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-7 bg-[#FAFAF8]">
          {dayNames.map((day) => (
            <div key={day} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days}
        </div>
      </div>
    </div>
  );
}

// FEEDBACK & RATINGS TAB
function FeedbackTab() {
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();
      const { data } = await supabase
        .from('hub_courses')
        .select('id, title, slug')
        .eq('is_published', true)
        .order('title');
      setCourses(data || []);
      setIsLoading(false);
    }
    load();
  }, []);

  // Mock ratings data
  const mockRatings = [
    { course: 'Classroom Management Fundamentals', rating: 4.8, count: 156, trend: 'up' },
    { course: 'Student Engagement Strategies', rating: 4.6, count: 89, trend: 'stable' },
    { course: 'Teacher Wellbeing Essentials', rating: 4.9, count: 203, trend: 'up' },
    { course: 'Effective Feedback Methods', rating: 4.2, count: 45, trend: 'down' },
    { course: 'Inclusive Teaching Practices', rating: 4.5, count: 67, trend: 'stable' },
  ];

  const trendIcons: Record<string, React.ElementType> = {
    up: TrendingUp,
    down: TrendingDown,
    stable: Minus,
  };

  const trendColors: Record<string, string> = {
    up: 'text-green-500',
    down: 'text-red-500',
    stable: 'text-gray-400',
  };

  if (isLoading) {
    return <div className="py-8 text-center text-gray-500">Loading feedback data...</div>;
  }

  return (
    <div>
      {/* Overview Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FFF8E7' }}>
              <Star size={24} style={{ color: '#E8B84B' }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: '#2B3A67' }}>4.6</p>
              <p className="text-sm text-gray-500">Average Rating</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-50">
              <Users size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: '#2B3A67' }}>560</p>
              <p className="text-sm text-gray-500">Total Ratings</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-50">
              <BookOpen size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: '#2B3A67' }}>{courses.length}</p>
              <p className="text-sm text-gray-500">Published Courses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ratings Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Course Ratings Overview</h3>
        </div>
        <table className="w-full">
          <thead className="bg-[#FAFAF8]">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Course</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Avg Rating</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase"># Ratings</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockRatings.map((item, i) => {
              const TrendIcon = trendIcons[item.trend];
              const isLowRated = item.rating < 3.0;
              return (
                <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAF8]'} ${isLowRated ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.course}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-[#E8B84B] fill-[#E8B84B]" />
                      <span className="text-sm font-medium text-gray-900">{item.rating}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.count}</td>
                  <td className="px-4 py-3">
                    <TrendIcon size={16} className={trendColors[item.trend]} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Satisfaction Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Satisfaction Breakdown</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Great</span>
                <span className="font-medium">72%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '72%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">OK</span>
                <span className="font-medium">21%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#E8B84B] rounded-full" style={{ width: '21%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Needs Work</span>
                <span className="font-medium">7%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: '7%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Feedback</h3>
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={12} className={star <= 5 ? 'text-[#E8B84B] fill-[#E8B84B]' : 'text-gray-300'} />
                  ))}
                </div>
                <span className="text-xs text-gray-500">2 hours ago</span>
              </div>
              <p className="text-sm text-gray-600">&ldquo;Great strategies! Already using them in my classroom.&rdquo;</p>
              <p className="text-xs text-gray-400 mt-1">Classroom Management Fundamentals</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={12} className={star <= 4 ? 'text-[#E8B84B] fill-[#E8B84B]' : 'text-gray-300'} />
                  ))}
                </div>
                <span className="text-xs text-gray-500">1 day ago</span>
              </div>
              <p className="text-sm text-gray-600">&ldquo;Helpful content, would love more examples.&rdquo;</p>
              <p className="text-xs text-gray-400 mt-1">Student Engagement Strategies</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============= MAIN PAGE COMPONENT =============

export default function HubProductionPage() {
  const { permissions } = useTDIAdmin();
  const [activeTab, setActiveTab] = useState<Tab>('courses');

  const canManageCourses = hasPermission(permissions, 'learning_hub', 'manage_courses');
  const canManageQuickWins = hasPermission(permissions, 'learning_hub', 'manage_quick_wins');
  const canManageContent = hasPermission(permissions, 'learning_hub', 'manage_content');
  const canViewAnalytics = hasPermission(permissions, 'learning_hub', 'view_analytics');

  // Default to first available tab
  useEffect(() => {
    if (!canManageCourses && activeTab === 'courses') {
      if (canManageQuickWins) setActiveTab('quick-wins');
      else if (canManageContent) setActiveTab('media');
      else if (canViewAnalytics) setActiveTab('feedback');
    }
  }, [canManageCourses, canManageQuickWins, canManageContent, canViewAnalytics, activeTab]);

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
      {/* Example Data Banner */}
      <ExampleDataBanner />

      {/* Page Header */}
      <div className="mb-6">
        <Link
          href="/tdi-admin/hub"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft size={16} />
          Back to Hub
        </Link>
        <h1
          className="font-bold mb-2"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            fontSize: '28px',
            color: '#2B3A67',
          }}
        >
          Production
        </h1>
        <p className="text-gray-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Create and manage courses, Quick Wins, and content.
        </p>
      </div>

      {/* Tab Bar */}
      <div className="border-b border-gray-200 mb-6 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          <TabButton
            active={activeTab === 'courses'}
            onClick={() => setActiveTab('courses')}
            disabled={!canManageCourses}
          >
            <BookOpen size={16} className="mr-2 inline" />
            Courses
          </TabButton>
          <TabButton
            active={activeTab === 'quick-wins'}
            onClick={() => setActiveTab('quick-wins')}
            disabled={!canManageQuickWins}
          >
            <Zap size={16} className="mr-2 inline" />
            Quick Wins
          </TabButton>
          <TabButton
            active={activeTab === 'media'}
            onClick={() => setActiveTab('media')}
            disabled={!canManageContent}
          >
            <FolderOpen size={16} className="mr-2 inline" />
            Media Library
          </TabButton>
          <TabButton
            active={activeTab === 'calendar'}
            onClick={() => setActiveTab('calendar')}
            disabled={!canManageContent}
          >
            <Calendar size={16} className="mr-2 inline" />
            Content Calendar
          </TabButton>
          <TabButton
            active={activeTab === 'feedback'}
            onClick={() => setActiveTab('feedback')}
            disabled={!canViewAnalytics}
          >
            <Star size={16} className="mr-2 inline" />
            Feedback & Ratings
          </TabButton>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'courses' && canManageCourses && <CoursesTab />}
        {activeTab === 'quick-wins' && canManageQuickWins && <QuickWinsTab />}
        {activeTab === 'media' && canManageContent && <MediaTab />}
        {activeTab === 'calendar' && canManageContent && <CalendarTab />}
        {activeTab === 'feedback' && canViewAnalytics && <FeedbackTab />}

        {/* No Permission State */}
        {!canManageCourses && !canManageQuickWins && !canManageContent && !canViewAnalytics && (
          <EmptyState
            icon={AlertCircle}
            title="No Access"
            description="You don't have permission to view any production data. Contact your admin for access."
          />
        )}
      </div>
    </div>
  );
}
