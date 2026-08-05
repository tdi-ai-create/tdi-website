'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import {
  Search,
  Plus,
  BookOpen,
  Eye,
  EyeOff,
  Edit2,
  Copy,
  Trash2,
  MoreHorizontal,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  Mic,
  MessageSquare,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const theme = {
  accent: '#00B5AD',
  accentLight: '#E0F7F6',
};

// Course categories
const CATEGORIES = [
  'Stress Management',
  'Time & Planning',
  'Classroom Strategies',
  'Relationships & Culture',
  'Leadership',
  'Paraprofessional',
  'Joy & Wellness',
  'Other',
];

// Difficulty badge colors
const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-rose-100 text-rose-700',
};


interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: string;
  capacity?: 'low' | 'medium' | 'high' | null;
  estimated_minutes: number;
  pd_hours: number;
  is_published: boolean;
  is_free: boolean;
  price: number | null;
  thumbnail_url: string | null;
  module_count: number;
  lesson_count: number;
  origin_type: 'internal' | 'external_creator' | 'mixed' | null;
  danielson_domains?: string[];
  roles?: string[];
  video_total: number;
  video_uploaded: number;
  created_at: string;
  updated_at: string;
}

// Concise date formatter: "Jul 1" for current year, "Jun 2025" for older
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  if (date.getFullYear() === now.getFullYear()) {
    return `${months[date.getMonth()]} ${date.getDate()}`;
  }
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

// Stat Card Component (compact)
function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color?: 'teal' | 'green' | 'amber';
}) {
  const borderColors = {
    teal: '#00B5AD',
    green: '#22C55E',
    amber: '#F59E0B',
  };

  return (
    <div
      className="bg-white rounded-lg px-4 py-3 shadow-sm"
      style={{
        borderLeft: `3px solid ${borderColors[color || 'teal']}`,
      }}
    >
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

// Create Course Modal
function CreateCourseModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (courseId: string) => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Other',
    difficulty: 'beginner',
    capacity: '',
    estimated_minutes: 60,
    pd_hours: 1,
    is_free: true,
    price: '',
  });

  const handleSubmit = async () => {
    if (!form.title.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/tdi-admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          capacity: form.capacity || null,
          price: form.is_free ? null : parseFloat(form.price) || null,
        }),
      });

      const data = await response.json();
      if (data.course) {
        onCreated(data.course.id);
      }
    } catch (error) {
      console.error('Error creating course:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
        style={{ backdropFilter: 'blur(8px)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg text-gray-900">Create New Course</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B5AD]/50"
              placeholder="What's this course called?"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B5AD]/50 resize-none"
              rows={3}
              placeholder="Brief description for teachers"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B5AD]/50"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <div className="flex gap-3">
              {['beginner', 'intermediate', 'advanced'].map((level) => (
                <label key={level} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="difficulty"
                    value={level}
                    checked={form.difficulty === level}
                    onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                    className="w-4 h-4 text-[#00B5AD]"
                  />
                  <span className="text-sm capitalize">{level}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Effort Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Effort Level
            </label>
            <select
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B5AD]/50"
            >
              <option value="">Not set</option>
              <option value="low">Low — Grab-and-go, minimal prep</option>
              <option value="medium">Medium — Some prep, 1-2 sessions</option>
              <option value="high">High — Significant investment, multi-session</option>
            </select>
          </div>

          {/* Time fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Minutes
              </label>
              <input
                type="number"
                value={form.estimated_minutes}
                onChange={(e) =>
                  setForm({ ...form, estimated_minutes: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B5AD]/50"
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PD Hours
              </label>
              <input
                type="number"
                step="0.5"
                value={form.pd_hours}
                onChange={(e) =>
                  setForm({ ...form, pd_hours: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B5AD]/50"
                min={0}
              />
            </div>
          </div>

          {/* Pricing */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pricing
            </label>
            <div className="flex gap-4 mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pricing"
                  checked={form.is_free}
                  onChange={() => setForm({ ...form, is_free: true })}
                  className="w-4 h-4 text-[#00B5AD]"
                />
                <span className="text-sm">Free</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pricing"
                  checked={!form.is_free}
                  onChange={() => setForm({ ...form, is_free: false })}
                  className="w-4 h-4 text-[#00B5AD]"
                />
                <span className="text-sm">Paid</span>
              </label>
            </div>
            {!form.is_free && (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B5AD]/50"
                  placeholder="0.00"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!form.title.trim() || isSubmitting}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: theme.accent }}
          >
            {isSubmitting ? 'Creating...' : 'Create Course'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Actions Menu Component
function ActionsMenu({
  course,
  onEdit,
  onDuplicate,
  onTogglePublish,
  onDelete,
}: {
  course: Course;
  onEdit: () => void;
  onDuplicate: () => void;
  onTogglePublish: () => void;
  onDelete: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1.5 rounded hover:bg-gray-100 transition-colors"
      >
        <MoreHorizontal size={16} className="text-gray-500" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[160px]">
            <button
              onClick={() => {
                setIsOpen(false);
                onEdit();
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <Edit2 size={14} />
              Edit
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                onDuplicate();
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <Copy size={14} />
              Duplicate
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                onTogglePublish();
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              {course.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
              {course.is_published ? 'Unpublish' : 'Publish'}
            </button>
            <hr className="my-1 border-gray-100" />
            <button
              onClick={() => {
                setIsOpen(false);
                onDelete();
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Empty State Component
function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="text-center py-16">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ backgroundColor: theme.accentLight }}
      >
        <BookOpen size={32} style={{ color: theme.accent }} />
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">No courses yet</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
        Create your first course to start building your Learning Hub.
      </p>
      <button
        onClick={onCreateClick}
        className="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2 mx-auto"
        style={{ backgroundColor: theme.accent }}
      >
        <Plus size={16} />
        Create Course
      </button>
    </div>
  );
}

// Delete Confirmation Modal
function DeleteConfirmModal({
  isOpen,
  courseName,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  courseName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h3 className="font-semibold text-lg text-gray-900 mb-2">Delete Course</h3>
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to delete &ldquo;{courseName}&rdquo;? This will permanently
          delete this course and all its modules and lessons. This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            Delete Course
          </button>
        </div>
      </div>
    </div>
  );
}

// Coverage data per course
interface CourseCoverage {
  transcripts: { total: number; done: number };
  checks: { total: number; done: number };
}

// Main CoursesTab Component
export function CoursesTab() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    course: Course | null;
  }>({ isOpen: false, course: null });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Bulk operations state
  const [coverage, setCoverage] = useState<Record<string, CourseCoverage>>({});
  const [coverageLoading, setCoverageLoading] = useState(false);
  const [bulkAction, setBulkAction] = useState<{
    type: 'transcripts' | 'checks';
    courseId: string;
    courseName: string;
    status: 'idle' | 'running' | 'done' | 'error';
    message: string;
  } | null>(null);

  // Load coverage data for all courses
  const loadCoverage = async () => {
    setCoverageLoading(true);
    try {
      const [transcriptRes, checksRes] = await Promise.all([
        fetch('/api/tdi-admin/courses/all/bulk-transcripts'),
        fetch('/api/tdi-admin/courses/all/bulk-checks'),
      ]);
      const [transcriptData, checksData] = await Promise.all([
        transcriptRes.json(),
        checksRes.json(),
      ]);

      const coverageMap: Record<string, CourseCoverage> = {};

      // Build transcript coverage per course
      (transcriptData.lessons || []).forEach((l: { course_id: string; has_transcript: boolean }) => {
        if (!coverageMap[l.course_id]) {
          coverageMap[l.course_id] = { transcripts: { total: 0, done: 0 }, checks: { total: 0, done: 0 } };
        }
        coverageMap[l.course_id].transcripts.total++;
        if (l.has_transcript) coverageMap[l.course_id].transcripts.done++;
      });

      // Build check coverage per course
      (checksData.lessons || []).forEach((l: { course_id: string; has_content: boolean; meets_minimum: boolean }) => {
        if (!coverageMap[l.course_id]) {
          coverageMap[l.course_id] = { transcripts: { total: 0, done: 0 }, checks: { total: 0, done: 0 } };
        }
        if (l.has_content) {
          coverageMap[l.course_id].checks.total++;
          if (l.meets_minimum) coverageMap[l.course_id].checks.done++;
        }
      });

      setCoverage(coverageMap);
    } catch (error) {
      console.error('Error loading coverage:', error);
    } finally {
      setCoverageLoading(false);
    }
  };

  // Run bulk transcript generation for a course
  const runBulkTranscripts = async (courseId: string, courseName: string) => {
    setBulkAction({ type: 'transcripts', courseId, courseName, status: 'running', message: 'Generating transcripts...' });
    try {
      const res = await fetch(`/api/tdi-admin/courses/${courseId}/bulk-transcripts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: 'en' }),
      });
      const data = await res.json();
      if (res.ok) {
        setBulkAction({ type: 'transcripts', courseId, courseName, status: 'done', message: data.message });
        loadCoverage();
      } else {
        setBulkAction({ type: 'transcripts', courseId, courseName, status: 'error', message: data.error || 'Failed' });
      }
    } catch {
      setBulkAction({ type: 'transcripts', courseId, courseName, status: 'error', message: 'Network error' });
    }
  };

  // Run bulk check generation for a course
  const runBulkChecks = async (courseId: string, courseName: string) => {
    setBulkAction({ type: 'checks', courseId, courseName, status: 'running', message: 'Generating check-ins...' });
    try {
      const res = await fetch(`/api/tdi-admin/courses/${courseId}/bulk-checks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        setBulkAction({ type: 'checks', courseId, courseName, status: 'done', message: data.message });
        loadCoverage();
      } else {
        setBulkAction({ type: 'checks', courseId, courseName, status: 'error', message: data.error || 'Failed' });
      }
    } catch {
      setBulkAction({ type: 'checks', courseId, courseName, status: 'error', message: 'Network error' });
    }
  };

  // Load courses via API route (uses service key, bypasses RLS so all admins see courses)
  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter === 'published') params.set('status', 'published');
      else if (statusFilter === 'draft') params.set('status', 'draft');

      const res = await fetch(`/api/tdi-admin/courses?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        console.error('Error loading courses:', data.error);
        setCourses([]);
        return;
      }

      setCourses(data.courses || []);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
    loadCoverage();
  }, [statusFilter]);

  // Filter courses by search (client-side for responsiveness)
  const filteredCourses = courses.filter((c) => {
    return c.title.toLowerCase().includes(search.toLowerCase());
  });

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / pageSize);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Stats
  const stats = {
    total: courses.length,
    published: courses.filter((c) => c.is_published).length,
    drafts: courses.filter((c) => !c.is_published).length,
  };

  // Handlers
  const handleCourseCreated = (courseId: string) => {
    setShowCreateModal(false);
    router.push(`/tdi-admin/hub/production/courses/${courseId}`);
  };

  const handleEdit = (course: Course) => {
    router.push(`/tdi-admin/hub/production/courses/${course.id}`);
  };

  const handleDuplicate = async (course: Course) => {
    try {
      const response = await fetch(`/api/tdi-admin/courses/${course.id}/duplicate`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.course) {
        router.push(`/tdi-admin/hub/production/courses/${data.course.id}`);
      }
    } catch (error) {
      console.error('Error duplicating course:', error);
    }
  };

  const handleTogglePublish = async (course: Course) => {
    try {
      await fetch(`/api/tdi-admin/courses/${course.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: !course.is_published }),
      });
      loadCourses();
    } catch (error) {
      console.error('Error toggling publish:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.course) return;

    try {
      await fetch(`/api/tdi-admin/courses/${deleteConfirm.course.id}`, {
        method: 'DELETE',
      });
      setDeleteConfirm({ isOpen: false, course: null });
      loadCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center text-gray-500">
        <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-[#00B5AD] rounded-full mx-auto mb-3" />
        Loading courses...
      </div>
    );
  }

  return (
    <div>
      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Courses" value={stats.total} color="teal" />
        <StatCard label="Published" value={stats.published} color="green" />
        <StatCard label="Drafts" value={stats.drafts} color="amber" />
      </div>

      {/* Bulk Action Status Banner */}
      {bulkAction && bulkAction.status !== 'idle' && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-4 border ${
          bulkAction.status === 'running' ? 'bg-blue-50 border-blue-200' :
          bulkAction.status === 'done' ? 'bg-green-50 border-green-200' :
          'bg-red-50 border-red-200'
        }`}>
          {bulkAction.status === 'running' && <Loader2 size={16} className="text-blue-600 animate-spin" />}
          {bulkAction.status === 'done' && <CheckCircle2 size={16} className="text-green-600" />}
          {bulkAction.status === 'error' && <AlertCircle size={16} className="text-red-600" />}
          <div className="flex-1">
            <p className={`text-sm font-medium ${
              bulkAction.status === 'running' ? 'text-blue-900' :
              bulkAction.status === 'done' ? 'text-green-900' : 'text-red-900'
            }`}>
              {bulkAction.type === 'transcripts' ? 'Transcripts' : 'Check-ins'}: {bulkAction.courseName}
            </p>
            <p className={`text-xs ${
              bulkAction.status === 'running' ? 'text-blue-700' :
              bulkAction.status === 'done' ? 'text-green-700' : 'text-red-700'
            }`}>{bulkAction.message}</p>
          </div>
          {bulkAction.status !== 'running' && (
            <button onClick={() => setBulkAction(null)} className="p-1 rounded hover:bg-black/5">
              <X size={14} className="text-gray-500" />
            </button>
          )}
        </div>
      )}

      {/* Action Bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B5AD]/50"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(['all', 'published', 'draft'] as const).map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                statusFilter === status
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {status === 'draft' ? 'Drafts' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Create Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2 transition-colors hover:opacity-90"
          style={{ backgroundColor: theme.accent }}
        >
          <Plus size={16} />
          New Course
        </button>
      </div>

      {/* Courses Table or Empty State */}
      {filteredCourses.length === 0 ? (
        <EmptyState onCreateClick={() => setShowCreateModal(true)} />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">
                    Course
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Content
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Videos
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    <Mic size={12} className="inline mr-1" />
                    Transcripts
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    <MessageSquare size={12} className="inline mr-1" />
                    Check-ins
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Updated
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedCourses.map((course) => {
                  const cov = coverage[course.id];
                  const transcriptDone = cov?.transcripts.done ?? 0;
                  const transcriptTotal = cov?.transcripts.total ?? 0;
                  const checksDone = cov?.checks.done ?? 0;
                  const checksTotal = cov?.checks.total ?? 0;
                  const isRunningTranscripts = bulkAction?.status === 'running' && bulkAction.type === 'transcripts' && bulkAction.courseId === course.id;
                  const isRunningChecks = bulkAction?.status === 'running' && bulkAction.type === 'checks' && bulkAction.courseId === course.id;

                  return (
                  <tr
                    key={course.id}
                    onClick={() => handleEdit(course)}
                    className="hover:bg-[#F8FFFE] cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-900">{course.title}</p>
                      <p className="text-xs text-gray-400">
                        {course.module_count} module{course.module_count !== 1 ? 's' : ''} · {course.lesson_count} lesson{course.lesson_count !== 1 ? 's' : ''} · {course.pd_hours}h PD
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {course.category}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {course.video_total > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                course.video_uploaded === course.video_total ? 'bg-green-500' :
                                course.video_uploaded === 0 ? 'bg-red-400' : 'bg-amber-400'
                              }`}
                              style={{ width: `${(course.video_uploaded / course.video_total) * 100}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium ${
                            course.video_uploaded === course.video_total ? 'text-green-600' :
                            course.video_uploaded === 0 ? 'text-red-500' : 'text-amber-600'
                          }`}>
                            {course.video_uploaded}/{course.video_total}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300">--</span>
                      )}
                    </td>
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      {coverageLoading ? (
                        <span className="text-xs text-gray-300">...</span>
                      ) : transcriptTotal === 0 ? (
                        <span className="text-xs text-gray-300">--</span>
                      ) : transcriptDone === transcriptTotal ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                          <CheckCircle2 size={12} />
                          {transcriptDone}/{transcriptTotal}
                        </span>
                      ) : (
                        <button
                          onClick={() => runBulkTranscripts(course.id, course.title)}
                          disabled={isRunningTranscripts || bulkAction?.status === 'running'}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors border border-blue-200 text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                          title={`Generate transcripts for ${transcriptTotal - transcriptDone} lessons`}
                        >
                          {isRunningTranscripts ? <Loader2 size={12} className="animate-spin" /> : <Mic size={12} />}
                          {transcriptDone}/{transcriptTotal}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      {coverageLoading ? (
                        <span className="text-xs text-gray-300">...</span>
                      ) : checksTotal === 0 ? (
                        <span className="text-xs text-gray-300">--</span>
                      ) : checksDone === checksTotal ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                          <CheckCircle2 size={12} />
                          {checksDone}/{checksTotal}
                        </span>
                      ) : (
                        <button
                          onClick={() => runBulkChecks(course.id, course.title)}
                          disabled={isRunningChecks || bulkAction?.status === 'running'}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors border border-purple-200 text-purple-700 hover:bg-purple-50 disabled:opacity-50"
                          title={`Generate check-ins for ${checksTotal - checksDone} lessons`}
                        >
                          {isRunningChecks ? <Loader2 size={12} className="animate-spin" /> : <MessageSquare size={12} />}
                          {checksDone}/{checksTotal}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          course.is_published
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {course.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {formatDate(course.updated_at)}
                    </td>
                    <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <ActionsMenu
                        course={course}
                        onEdit={() => handleEdit(course)}
                        onDuplicate={() => handleDuplicate(course)}
                        onTogglePublish={() => handleTogglePublish(course)}
                        onDelete={() => setDeleteConfirm({ isOpen: true, course })}
                      />
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Showing {(currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, filteredCourses.length)} of{' '}
                {filteredCourses.length} courses
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateCourseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleCourseCreated}
      />

      <DeleteConfirmModal
        isOpen={deleteConfirm.isOpen}
        courseName={deleteConfirm.course?.title || ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, course: null })}
      />
    </div>
  );
}
