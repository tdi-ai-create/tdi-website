'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTDIAdmin } from '@/lib/tdi-admin/context';
import { hasPermission } from '@/lib/tdi-admin/permissions';
import { PORTAL_THEMES } from '@/lib/tdi-admin/theme';
import { getHubSupabase as getSupabase } from '@/lib/supabase-hub';
import { CoursesTab } from '@/components/tdi-admin/hub/CoursesTab';
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
  Info,
  RefreshCw,
  Sparkles,
  BarChart3,
  MessageSquare,
} from 'lucide-react';
import {
  TYPE_PAGE_TITLE,
  TYPE_PAGE_SUBTITLE,
  TYPE_SECTION_HEADER,
  TYPE_CARD_TITLE,
  TYPE_STAT_VALUE,
  TYPE_STAT_LABEL,
  TYPE_TABLE_HEADER,
} from '@/components/tdi-admin/ui/design-tokens';

// Tab configuration for top nav
const HUB_TABS = [
  { id: 'overview', label: 'Overview', href: '/tdi-admin/hub' },
  { id: 'operations', label: 'Operations', href: '/tdi-admin/hub/operations' },
  { id: 'production', label: 'Production', href: '/tdi-admin/hub/production' },
];

// Hub theme colors
const theme = PORTAL_THEMES.hub;

type Tab = 'courses' | 'quick-wins' | 'media' | 'calendar' | 'feedback' | 'free-rotation';

// Tab Button Component
function TabButton({ active, onClick, children, disabled }: { active: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        borderColor: active ? theme.accent : 'transparent',
        color: active ? theme.accent : disabled ? '#D1D5DB' : '#6B7280',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  );
}

// Empty State Component
function EmptyState({ icon: Icon, title, description, action }: { icon: React.ElementType; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: theme.accentLight }}>
        <Icon size={24} style={{ color: theme.accent }} />
      </div>
      <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      {action}
    </div>
  );
}

// ============= TAB COMPONENTS =============

// QUICK WINS TAB
const QW_CATEGORIES = ['Stress Relief', 'Time Savers', 'Classroom Tools', 'Communication', 'Self-Care', 'Other'];
const QW_TYPES = ['read', 'watch', 'do', 'download', 'reflect'] as const;

function titleToSlug(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').trim();
}

const EMPTY_QW_FORM = { title: '', slug: '', description: '', category: 'Classroom Tools', type: 'do', duration_minutes: 10, capacity: '', is_published: false };

function QuickWinsTab() {
  const [quickWins, setQuickWins] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingQW, setEditingQW] = useState<any | null>(null);
  const [form, setForm] = useState(EMPTY_QW_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const openCreate = () => {
    setForm(EMPTY_QW_FORM);
    setEditingQW(null);
    setShowCreateForm(true);
  };

  const openEdit = (qw: any) => {
    setForm({
      title: qw.title || '',
      slug: qw.slug || '',
      description: qw.description || '',
      category: qw.category || 'Classroom Tools',
      type: qw.type || 'do',
      duration_minutes: qw.duration_minutes || 10,
      capacity: qw.capacity || '',
      is_published: qw.is_published || false,
    });
    setEditingQW(qw);
    setShowCreateForm(false);
  };

  const closeModal = () => {
    setShowCreateForm(false);
    setEditingQW(null);
    setForm(EMPTY_QW_FORM);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.slug.trim()) return;
    setIsSubmitting(true);
    const supabase = getSupabase();
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      description: form.description || null,
      category: form.category || null,
      type: form.type,
      duration_minutes: form.duration_minutes || null,
      capacity: form.capacity || null,
      is_published: form.is_published,
    };
    try {
      if (editingQW) {
        const { error } = await supabase.from('hub_quick_wins').update(payload).eq('id', editingQW.id);
        if (!error) {
          setQuickWins(prev => prev.map(qw => qw.id === editingQW.id ? { ...qw, ...payload } : qw));
          closeModal();
        }
      } else {
        const { data, error } = await supabase.from('hub_quick_wins').insert(payload).select().single();
        if (!error && data) {
          setQuickWins(prev => [data, ...prev]);
          closeModal();
        }
      }
    } catch (err) {
      console.error('Error saving quick win:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isModalOpen = showCreateForm || !!editingQW;

  if (isLoading) {
    return <div className="py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: theme.accent }}></div><p className="text-gray-400 mt-3 text-sm">Loading Quick Wins...</p></div>;
  }

  return (
    <div>
      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 style={{ ...TYPE_SECTION_HEADER }}>
                {editingQW ? 'Edit Quick Win' : 'Create Quick Win'}
              </h3>
              <button onClick={closeModal} className="p-1 rounded-lg hover:bg-gray-100">
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm(f => ({ ...f, title: e.target.value, slug: editingQW ? f.slug : titleToSlug(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B5AD]/50"
                  placeholder="Quick win title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B5AD]/50 font-mono"
                  placeholder="url-friendly-slug"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B5AD]/50 resize-none"
                  rows={3}
                  placeholder="Brief description for educators"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B5AD]/50"
                  >
                    {QW_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B5AD]/50"
                  >
                    {QW_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    min={1}
                    value={form.duration_minutes}
                    onChange={(e) => setForm(f => ({ ...f, duration_minutes: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B5AD]/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lift</label>
                  <select
                    value={form.capacity}
                    onChange={(e) => setForm(f => ({ ...f, capacity: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B5AD]/50"
                  >
                    <option value="">Not set</option>
                    <option value="low">Low — Grab-and-go</option>
                    <option value="medium">Medium — Some prep</option>
                    <option value="high">High — Significant investment</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) => setForm(f => ({ ...f, is_published: e.target.checked }))}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-gray-700">Published</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting || !form.title.trim() || !form.slug.trim()}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50"
                style={{ backgroundColor: theme.accent }}
              >
                {isSubmitting ? 'Saving...' : editingQW ? 'Save Changes' : 'Create Quick Win'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Quick Wins..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B5AD]/50"
          />
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2"
          style={{ backgroundColor: theme.accent }}
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
              <th className="text-left px-4 py-3" style={TYPE_TABLE_HEADER}>Title</th>
              <th className="text-left px-4 py-3" style={TYPE_TABLE_HEADER}>Category</th>
              <th className="text-left px-4 py-3" style={TYPE_TABLE_HEADER}>Lift</th>
              <th className="text-left px-4 py-3" style={TYPE_TABLE_HEADER}>Type</th>
              <th className="text-left px-4 py-3" style={TYPE_TABLE_HEADER}>Duration</th>
              <th className="text-left px-4 py-3" style={TYPE_TABLE_HEADER}>Status</th>
              <th className="text-left px-4 py-3" style={TYPE_TABLE_HEADER}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7}>
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
                      {qw.capacity ? (
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium capitalize"
                          style={{
                            backgroundColor: qw.capacity === 'low' ? '#6BA36822' : qw.capacity === 'medium' ? '#E8B84B22' : '#E8927C22',
                            color: qw.capacity === 'low' ? '#6BA368' : qw.capacity === 'medium' ? '#E8B84B' : '#E8927C',
                          }}
                        >
                          {qw.capacity}
                        </span>
                      ) : <span className="text-gray-400 text-xs">-</span>}
                    </td>
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
                        <button onClick={() => openEdit(qw)} className="p-1.5 rounded hover:bg-gray-100" title="Edit">
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
          style={{ backgroundColor: theme.accent }}
        >
          <Upload size={16} />
          Upload Files
        </button>
      </div>

      {/* Upload Zone */}
      <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 mb-6 text-center hover:border-[#00B5AD] transition-colors cursor-pointer">
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

// CONTENT CALENDAR TAB -- pulls real data from courses + quick wins
function CalendarTab() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [contentItems, setContentItems] = useState<{ date: string; type: 'course' | 'quick-win'; title: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();
      const [{ data: courses }, { data: quickWins }] = await Promise.all([
        supabase.from('hub_courses').select('title, created_at, is_published').order('created_at', { ascending: false }).limit(100),
        supabase.from('hub_quick_wins').select('title, created_at, is_published').order('created_at', { ascending: false }).limit(200),
      ]);

      const items: { date: string; type: 'course' | 'quick-win'; title: string }[] = [];
      (courses || []).forEach((c: { title: string; created_at: string }) => {
        items.push({ date: c.created_at.split('T')[0], type: 'course', title: c.title });
      });
      (quickWins || []).forEach((qw: { title: string; created_at: string }) => {
        items.push({ date: qw.created_at.split('T')[0], type: 'quick-win', title: qw.title });
      });
      setContentItems(items);
      setIsLoading(false);
    }
    load();
  }, []);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const typeColors: Record<string, string> = { course: 'bg-blue-500', 'quick-win': 'bg-[#00B5AD]' };

  // Group content by day for current month
  const monthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
  const byDay: Record<number, typeof contentItems> = {};
  contentItems.forEach(item => {
    if (item.date.startsWith(monthKey)) {
      const day = parseInt(item.date.split('-')[2]);
      if (!byDay[day]) byDay[day] = [];
      byDay[day].push(item);
    }
  });

  if (isLoading) {
    return <div className="py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: theme.accent }}></div><p className="text-gray-400 mt-3 text-sm">Loading calendar...</p></div>;
  }

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50" />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dayItems = byDay[day] || [];
    const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth.getMonth() && new Date().getFullYear() === currentMonth.getFullYear();

    days.push(
      <div key={day} className={`h-24 border border-gray-100 p-1 ${isToday ? 'bg-blue-50' : 'bg-white'} hover:bg-gray-50`}>
        <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>{day}</span>
        <div className="mt-1 space-y-0.5 overflow-hidden" style={{ maxHeight: 56 }}>
          {dayItems.slice(0, 3).map((item, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${typeColors[item.type]}`} />
              <span className="text-[10px] text-gray-600 truncate">{item.title}</span>
            </div>
          ))}
          {dayItems.length > 3 && (
            <span className="text-[10px] text-gray-400">+{dayItems.length - 3} more</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-2 rounded-lg hover:bg-gray-100">
            <ChevronDown size={20} className="rotate-90" />
          </button>
          <h2 style={TYPE_SECTION_HEADER}>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h2>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-2 rounded-lg hover:bg-gray-100">
            <ChevronDown size={20} className="-rotate-90" />
          </button>
        </div>
        <span className="text-xs text-gray-400">{contentItems.length} items total</span>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-sm text-gray-600">Courses</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#00B5AD]" /><span className="text-sm text-gray-600">Quick Wins</span></div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-7 bg-[#FAFAF8]">
          {dayNames.map((d) => (<div key={d} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase">{d}</div>))}
        </div>
        <div className="grid grid-cols-7">{days}</div>
      </div>
    </div>
  );
}

// FEEDBACK & RATINGS TAB
function FeedbackTab() {
  const [capacityData, setCapacityData] = useState<{ high: number; medium: number; low: number; total: number }>({ high: 0, medium: 0, low: 0, total: 0 });
  const [contentRequests, setContentRequests] = useState<{ request: string; date: string }[]>([]);
  const [vibeAvg, setVibeAvg] = useState<string>('--');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/tdi-admin/hub-connections?section=creators');
        const data = await res.json();
        setContentRequests((data.contentRequests || []).slice(0, 10));
      } catch {}

      // Get capacity feedback from hub_activity_log
      const supabase = getSupabase();
      const { data: capacityEntries } = await supabase
        .from('hub_activity_log')
        .select('metadata')
        .eq('action', 'capacity_feedback')
        .limit(5000);

      const counts = { high: 0, medium: 0, low: 0, total: 0 };
      (capacityEntries || []).forEach((e: { metadata: Record<string, unknown> | null }) => {
        const level = e.metadata?.capacity as string;
        if (level === 'high') counts.high++;
        else if (level === 'medium') counts.medium++;
        else if (level === 'low') counts.low++;
        counts.total++;
      });
      setCapacityData(counts);

      // Get vibe check average
      const { data: vibeData } = await supabase
        .from('hub_activity_log')
        .select('metadata')
        .eq('action', 'wellbeing_check')
        .order('created_at', { ascending: false })
        .limit(500);

      const scores = (vibeData || [])
        .map((v: { metadata: { score?: number } }) => v.metadata?.score)
        .filter((s): s is number => typeof s === 'number');
      if (scores.length > 0) {
        setVibeAvg((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1));
      }

      setIsLoading(false);
    }
    load();
  }, []);

  if (isLoading) {
    return <div className="py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: theme.accent }}></div><p className="text-gray-400 mt-3 text-sm">Loading feedback data...</p></div>;
  }

  return (
    <div>
      {/* Overview Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FFF8E7' }}>
              <BarChart3 size={24} style={{ color: theme.accent }} />
            </div>
            <div>
              <p style={{ ...TYPE_STAT_VALUE, color: '#2B3A67' }}>{capacityData.total}</p>
              <p className="text-sm text-gray-500">Capacity Responses</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-50">
              <Star size={24} className="text-green-600" />
            </div>
            <div>
              <p style={{ ...TYPE_STAT_VALUE, color: '#2B3A67' }}>{vibeAvg}</p>
              <p className="text-sm text-gray-500">Avg Vibe Score (1-5)</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-50">
              <MessageSquare size={24} className="text-blue-600" />
            </div>
            <div>
              <p style={{ ...TYPE_STAT_VALUE, color: '#2B3A67' }}>{contentRequests.length}</p>
              <p className="text-sm text-gray-500">Content Requests</p>
            </div>
          </div>
        </div>
      </div>

      {/* Capacity Distribution */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="mb-4" style={TYPE_CARD_TITLE}>Educator Capacity Distribution</h3>
          <p className="text-xs text-gray-500 mb-4">When educators interact with resources, we ask how much capacity they have. This shows the aggregate picture.</p>
          {capacityData.total === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No capacity feedback collected yet. Data appears as educators use the Hub.</p>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'High capacity', value: capacityData.high, color: '#2A9D8F', bg: '#D1FAE5' },
                { label: 'Medium capacity', value: capacityData.medium, color: '#E8B84B', bg: '#FEF3C7' },
                { label: 'Low capacity', value: capacityData.low, color: '#EF4444', bg: '#FEE2E2' },
              ].map((level) => {
                const pct = capacityData.total > 0 ? (level.value / capacityData.total) * 100 : 0;
                return (
                  <div key={level.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{level.label}</span>
                      <span className="font-medium">{level.value} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: level.bg }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: level.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="mb-4" style={TYPE_CARD_TITLE}>Content Requests from Educators</h3>
          {contentRequests.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No content requests yet.</p>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {contentRequests.map((req, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">{String(req.request)}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(req.date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// FREE ROTATION TAB
function FreeRotationTab() {
  const [courses, setCourses] = useState<any[]>([]);
  const [quickWins, setQuickWins] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();

      // Fetch courses with their rotation status
      const { data: courseData } = await supabase
        .from('hub_courses')
        .select('id, title, slug, is_free_rotating, free_rotation_start, access_tier, is_published')
        .eq('is_published', true)
        .order('title');

      // Fetch quick wins with their rotation status
      const { data: quickWinData } = await supabase
        .from('hub_quick_wins')
        .select('id, title, slug, is_free_rotating, free_rotation_start, access_tier, is_published')
        .eq('is_published', true)
        .order('title');

      setCourses(courseData || []);
      setQuickWins(quickWinData || []);
      setIsLoading(false);
    }
    load();
  }, []);

  const toggleFreeRotation = async (type: 'course' | 'quick_win', id: string, currentValue: boolean) => {
    setUpdating(id);
    const supabase = getSupabase();
    const table = type === 'course' ? 'hub_courses' : 'hub_quick_wins';

    const updateData = currentValue
      ? { is_free_rotating: false, free_rotation_start: null }
      : { is_free_rotating: true, free_rotation_start: new Date().toISOString() };

    const { error } = await supabase
      .from(table)
      .update(updateData)
      .eq('id', id);

    if (!error) {
      if (type === 'course') {
        setCourses(prev => prev.map(c => c.id === id ? { ...c, ...updateData } : c));
      } else {
        setQuickWins(prev => prev.map(qw => qw.id === id ? { ...qw, ...updateData } : qw));
      }
    }
    setUpdating(null);
  };

  const freeRotatingCourses = courses.filter(c => c.is_free_rotating);
  const freeRotatingQuickWins = quickWins.filter(qw => qw.is_free_rotating);
  const totalFreeRotating = freeRotatingCourses.length + freeRotatingQuickWins.length;

  const tierColors: Record<string, string> = {
    'free_rotating': 'bg-green-100 text-green-700',
    'essentials': 'bg-blue-100 text-blue-700',
    'professional': 'bg-purple-100 text-purple-700',
    'all_access': 'bg-amber-100 text-amber-700',
  };

  if (isLoading) {
    return <div className="py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: theme.accent }}></div><p className="text-gray-400 mt-3 text-sm">Loading content...</p></div>;
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-50">
              <Sparkles size={24} className="text-green-600" />
            </div>
            <div>
              <p style={{ ...TYPE_STAT_VALUE, color: '#2B3A67' }}>{totalFreeRotating}</p>
              <p className="text-sm text-gray-500">Currently Free</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-50">
              <BookOpen size={24} className="text-blue-600" />
            </div>
            <div>
              <p style={{ ...TYPE_STAT_VALUE, color: '#2B3A67' }}>{freeRotatingCourses.length}</p>
              <p className="text-sm text-gray-500">Free Courses</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FFF8E7' }}>
              <Zap size={24} style={{ color: theme.accent }} />
            </div>
            <div>
              <p style={{ ...TYPE_STAT_VALUE, color: '#2B3A67' }}>{freeRotatingQuickWins.length}</p>
              <p className="text-sm text-gray-500">Free Quick Wins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-100 mb-6">
        <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-900 font-medium">Free Rotation</p>
          <p className="text-sm text-blue-700 mt-0.5">
            Content marked as &ldquo;Free This Week&rdquo; is accessible to all users, regardless of their membership tier.
            Use this to give free users a taste of premium content.
          </p>
        </div>
      </div>

      {/* Currently Free Section */}
      {totalFreeRotating > 0 && (
        <div className="mb-8">
          <h3 className="mb-4 flex items-center gap-2" style={TYPE_SECTION_HEADER}>
            <Sparkles size={18} className="text-green-600" />
            Currently Free
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...freeRotatingCourses.map(c => ({ ...c, type: 'course' as const })),
              ...freeRotatingQuickWins.map(qw => ({ ...qw, type: 'quick_win' as const }))].map((item) => (
              <div key={`${item.type}-${item.id}`} className="bg-white rounded-lg border-2 border-green-200 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {item.type === 'course' ? (
                      <BookOpen size={16} className="text-blue-500" />
                    ) : (
                      <Zap size={16} className="text-amber-500" />
                    )}
                    <span className="text-xs font-medium text-gray-500 uppercase">
                      {item.type === 'course' ? 'Course' : 'Quick Win'}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Free
                  </span>
                </div>
                <p className="font-medium text-gray-900 mb-2">{item.title}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Since {item.free_rotation_start ? new Date(item.free_rotation_start).toLocaleDateString() : 'N/A'}
                  </span>
                  <button
                    onClick={() => toggleFreeRotation(item.type, item.id, true)}
                    disabled={updating === item.id}
                    className="px-3 py-1 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {updating === item.id ? 'Updating...' : 'Remove'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Content Sections */}
      <div className="space-y-8">
        {/* Courses */}
        <div>
          <h3 className="mb-4 flex items-center gap-2" style={TYPE_SECTION_HEADER}>
            <BookOpen size={18} className="text-blue-600" />
            Courses ({courses.length})
          </h3>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#FAFAF8]">
                <tr>
                  <th className="text-left px-4 py-3" style={TYPE_TABLE_HEADER}>Course</th>
                  <th className="text-left px-4 py-3" style={TYPE_TABLE_HEADER}>Access Tier</th>
                  <th className="text-left px-4 py-3" style={TYPE_TABLE_HEADER}>Status</th>
                  <th className="text-right px-4 py-3" style={TYPE_TABLE_HEADER}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {courses.map((course, i) => (
                  <tr key={course.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAF8]'}>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{course.title}</p>
                      <p className="text-xs text-gray-500">{course.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${tierColors[course.access_tier] || 'bg-gray-100 text-gray-600'}`}>
                        {course.access_tier?.replace('_', ' ') || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {course.is_free_rotating ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <Sparkles size={12} />
                          Free This Week
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">Paid</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => toggleFreeRotation('course', course.id, course.is_free_rotating)}
                        disabled={updating === course.id}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
                          course.is_free_rotating
                            ? 'border border-red-200 text-red-600 hover:bg-red-50'
                            : 'text-white hover:opacity-90'
                        }`}
                        style={!course.is_free_rotating ? { backgroundColor: theme.accent } : undefined}
                      >
                        {updating === course.id ? 'Updating...' : course.is_free_rotating ? 'Remove from Free' : 'Make Free'}
                      </button>
                    </td>
                  </tr>
                ))}
                {courses.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      No published courses yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Wins */}
        <div>
          <h3 className="mb-4 flex items-center gap-2" style={TYPE_SECTION_HEADER}>
            <Zap size={18} className="text-amber-600" />
            Quick Wins ({quickWins.length})
          </h3>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#FAFAF8]">
                <tr>
                  <th className="text-left px-4 py-3" style={TYPE_TABLE_HEADER}>Quick Win</th>
                  <th className="text-left px-4 py-3" style={TYPE_TABLE_HEADER}>Access Tier</th>
                  <th className="text-left px-4 py-3" style={TYPE_TABLE_HEADER}>Status</th>
                  <th className="text-right px-4 py-3" style={TYPE_TABLE_HEADER}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quickWins.map((qw, i) => (
                  <tr key={qw.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAF8]'}>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{qw.title}</p>
                      <p className="text-xs text-gray-500">{qw.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${tierColors[qw.access_tier] || 'bg-gray-100 text-gray-600'}`}>
                        {qw.access_tier?.replace('_', ' ') || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {qw.is_free_rotating ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <Sparkles size={12} />
                          Free This Week
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">Paid</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => toggleFreeRotation('quick_win', qw.id, qw.is_free_rotating)}
                        disabled={updating === qw.id}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
                          qw.is_free_rotating
                            ? 'border border-red-200 text-red-600 hover:bg-red-50'
                            : 'text-white hover:opacity-90'
                        }`}
                        style={!qw.is_free_rotating ? { backgroundColor: theme.accent } : undefined}
                      >
                        {updating === qw.id ? 'Updating...' : qw.is_free_rotating ? 'Remove from Free' : 'Make Free'}
                      </button>
                    </td>
                  </tr>
                ))}
                {quickWins.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      No published Quick Wins yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
  const [showExampleNotice, setShowExampleNotice] = useState(true);

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
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Sticky Tab Bar */}
      <div
        className="sticky top-0 z-10 bg-white border-b border-gray-100"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        <div className="flex items-center gap-0 px-6">
          {HUB_TABS.map(tab => (
            <Link
              key={tab.id}
              href={tab.href}
              className="px-4 py-3 text-sm font-medium transition-colors relative"
              style={{
                color: tab.id === 'production' ? '#111827' : '#6B7280',
                borderBottom: tab.id === 'production'
                  ? '2px solid #00B5AD'
                  : '2px solid transparent',
              }}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Page Content */}
      <div className="px-6 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 style={TYPE_PAGE_TITLE}>Production</h1>
          <p className="mt-1" style={TYPE_PAGE_SUBTITLE}>Create and manage courses, Quick Wins, and content</p>
        </div>
          {/* Example Data Notice (subtle) */}
          {showExampleNotice && (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-amber-50 border border-amber-200 mb-6">
              <Info size={16} className="text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-700 flex-1">
                Viewing example data for demonstration purposes.
              </p>
              <button
                onClick={() => setShowExampleNotice(false)}
                className="p-1 rounded hover:bg-amber-100 transition-colors"
                title="Dismiss"
              >
                <X size={14} className="text-amber-600" />
              </button>
            </div>
          )}

        {/* Tab Bar */}
        <div className="border-b border-gray-200 mb-6 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            <TabButton
              active={activeTab === 'courses'}
              onClick={() => setActiveTab('courses')}
              disabled={!canManageCourses}
            >
              Courses
            </TabButton>
            <TabButton
              active={activeTab === 'quick-wins'}
              onClick={() => setActiveTab('quick-wins')}
              disabled={!canManageQuickWins}
            >
              Quick Wins
            </TabButton>
            <TabButton
              active={activeTab === 'media'}
              onClick={() => setActiveTab('media')}
              disabled={!canManageContent}
            >
              Media Library
            </TabButton>
            <TabButton
              active={activeTab === 'calendar'}
              onClick={() => setActiveTab('calendar')}
              disabled={!canManageContent}
            >
              Content Calendar
            </TabButton>
            <TabButton
              active={activeTab === 'feedback'}
              onClick={() => setActiveTab('feedback')}
              disabled={!canViewAnalytics}
            >
              Feedback & Ratings
            </TabButton>
            <TabButton
              active={activeTab === 'free-rotation'}
              onClick={() => setActiveTab('free-rotation')}
              disabled={!canManageContent}
            >
              Free Rotation
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
          {activeTab === 'free-rotation' && canManageContent && <FreeRotationTab />}

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
    </div>
  );
}
