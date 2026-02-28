'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowLeft,
  Plus,
  GripVertical,
  MoreHorizontal,
  Video,
  FileText,
  HelpCircle,
  Paperclip,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Trash2,
  Eye,
  EyeOff,
  Save,
} from 'lucide-react';

const theme = {
  primary: '#0D9488',
  light: '#CCFBF1',
};

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

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  type: 'video' | 'text' | 'quiz' | 'resource';
  content: Record<string, unknown>;
  video_id: string | null;
  audio_url: string | null;
  transcript_text: string | null;
  duration_seconds: number;
  is_free_preview: boolean;
  is_quick_win: boolean;
  sort_order: number;
}

interface Module {
  id: string;
  course_id: string;
  title: string;
  sort_order: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: string;
  estimated_minutes: number;
  pd_hours: number;
  is_published: boolean;
  is_free: boolean;
  price: number | null;
  thumbnail_url: string | null;
  modules: Module[];
}

// Lesson type icons
const LESSON_ICONS: Record<string, React.ElementType> = {
  video: Video,
  text: FileText,
  quiz: HelpCircle,
  resource: Paperclip,
};

// Sortable Lesson Item
function SortableLesson({
  lesson,
  isSelected,
  onSelect,
  onMenuAction,
}: {
  lesson: Lesson;
  isSelected: boolean;
  onSelect: () => void;
  onMenuAction: (action: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lesson.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = LESSON_ICONS[lesson.type] || FileText;
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
        isSelected ? 'bg-teal-50' : 'hover:bg-gray-50'
      }`}
      onClick={onSelect}
    >
      <button {...attributes} {...listeners} className="cursor-grab hover:text-gray-600">
        <GripVertical size={14} className="text-gray-400" />
      </button>
      <Icon size={14} className="text-gray-500" />
      <span className={`flex-1 text-sm truncate ${isSelected ? 'font-medium text-teal-700' : 'text-gray-700'}`}>
        {lesson.title}
      </span>
      {lesson.is_free_preview && (
        <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700">Free</span>
      )}
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-1 rounded hover:bg-gray-200"
        >
          <MoreHorizontal size={14} className="text-gray-400" />
        </button>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-6 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[120px]">
              <button
                onClick={() => {
                  setShowMenu(false);
                  onMenuAction('delete');
                }}
                className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 size={12} />
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Sortable Module Card
function SortableModule({
  module,
  isExpanded,
  onToggleExpand,
  selectedLessonId,
  onSelectLesson,
  onAddLesson,
  onRenameModule,
  onDeleteModule,
  onDeleteLesson,
  onReorderLessons,
}: {
  module: Module;
  isExpanded: boolean;
  onToggleExpand: () => void;
  selectedLessonId: string | null;
  onSelectLesson: (lesson: Lesson) => void;
  onAddLesson: (moduleId: string, title: string, type: string) => void;
  onRenameModule: (moduleId: string, title: string) => void;
  onDeleteModule: (moduleId: string) => void;
  onDeleteLesson: (lessonId: string) => void;
  onReorderLessons: (moduleId: string, lessons: Lesson[]) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: module.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(module.title);
  const [showMenu, setShowMenu] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState('video');

  const handleRename = () => {
    if (renameValue.trim()) {
      onRenameModule(module.id, renameValue.trim());
    }
    setIsRenaming(false);
  };

  const handleAddLesson = () => {
    if (newLessonTitle.trim()) {
      onAddLesson(module.id, newLessonTitle.trim(), newLessonType);
      setNewLessonTitle('');
      setShowAddLesson(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleLessonDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = module.lessons.findIndex((l) => l.id === active.id);
      const newIndex = module.lessons.findIndex((l) => l.id === over.id);
      const newLessons = arrayMove(module.lessons, oldIndex, newIndex).map((l, i) => ({
        ...l,
        sort_order: i,
      }));
      onReorderLessons(module.id, newLessons);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
    >
      {/* Module Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
        <button {...attributes} {...listeners} className="cursor-grab hover:text-gray-600">
          <GripVertical size={16} className="text-gray-400" />
        </button>
        <button onClick={onToggleExpand} className="p-1">
          {isExpanded ? (
            <ChevronUp size={16} className="text-gray-500" />
          ) : (
            <ChevronDown size={16} className="text-gray-500" />
          )}
        </button>

        {isRenaming ? (
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              autoFocus
            />
            <button onClick={handleRename} className="p-1 text-green-600 hover:bg-green-50 rounded">
              <Check size={16} />
            </button>
            <button
              onClick={() => {
                setIsRenaming(false);
                setRenameValue(module.title);
              }}
              className="p-1 text-gray-400 hover:bg-gray-100 rounded"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <span className="flex-1 font-medium text-gray-900">{module.title}</span>
        )}

        <span className="text-xs text-gray-500">{module.lessons.length} lessons</span>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded hover:bg-gray-200"
          >
            <MoreHorizontal size={16} className="text-gray-500" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[140px]">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setIsRenaming(true);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  Rename
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDeleteModule(module.id);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Module Content (Lessons) */}
      {isExpanded && (
        <div className="p-3">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleLessonDragEnd}>
            <SortableContext items={module.lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1">
                {module.lessons.map((lesson) => (
                  <SortableLesson
                    key={lesson.id}
                    lesson={lesson}
                    isSelected={lesson.id === selectedLessonId}
                    onSelect={() => onSelectLesson(lesson)}
                    onMenuAction={(action) => {
                      if (action === 'delete') onDeleteLesson(lesson.id);
                    }}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Add Lesson */}
          {showAddLesson ? (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <input
                type="text"
                placeholder="Lesson title"
                value={newLessonTitle}
                onChange={(e) => setNewLessonTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddLesson()}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 mb-2"
                autoFocus
              />
              <div className="flex gap-2 mb-3">
                {Object.keys(LESSON_ICONS).map((type) => {
                  const Icon = LESSON_ICONS[type];
                  return (
                    <button
                      key={type}
                      onClick={() => setNewLessonType(type)}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                        newLessonType === type
                          ? 'bg-teal-100 text-teal-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Icon size={12} />
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddLesson}
                  disabled={!newLessonTitle.trim()}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddLesson(false);
                    setNewLessonTitle('');
                  }}
                  className="px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddLesson(true)}
              className="mt-3 w-full py-2 text-sm text-teal-600 hover:bg-teal-50 rounded-lg flex items-center justify-center gap-1 transition-colors"
            >
              <Plus size={14} />
              Add Lesson
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Course Settings Panel
function CourseSettingsPanel({
  course,
  onUpdate,
  isSaving,
}: {
  course: Course;
  onUpdate: (updates: Partial<Course>) => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState({
    title: course.title,
    description: course.description,
    category: course.category,
    difficulty: course.difficulty,
    estimated_minutes: course.estimated_minutes,
    pd_hours: course.pd_hours,
    is_free: course.is_free,
    price: course.price?.toString() || '',
    thumbnail_url: course.thumbnail_url || '',
  });

  const handleSave = () => {
    onUpdate({
      ...form,
      price: form.is_free ? null : parseFloat(form.price) || null,
      thumbnail_url: form.thumbnail_url || null,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
        <div className="flex gap-3">
          {['beginner', 'intermediate', 'advanced'].map((level) => (
            <label key={level} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="difficulty"
                value={level}
                checked={form.difficulty === level}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                className="w-4 h-4 text-teal-600"
              />
              <span className="text-sm capitalize">{level}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Est. Minutes</label>
          <input
            type="number"
            value={form.estimated_minutes}
            onChange={(e) => setForm({ ...form, estimated_minutes: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            min={0}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">PD Hours</label>
          <input
            type="number"
            step="0.5"
            value={form.pd_hours}
            onChange={(e) => setForm({ ...form, pd_hours: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            min={0}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
        <input
          type="text"
          value={form.thumbnail_url}
          onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="https://..."
        />
        {form.thumbnail_url && (
          <div className="mt-2 w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={form.thumbnail_url}
              alt="Thumbnail preview"
              className="w-full h-full object-cover"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          </div>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full py-2 rounded-lg text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Save size={16} />
        {isSaving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}

// Lesson Editor Panel
function LessonEditorPanel({
  lesson,
  onUpdate,
  onDelete,
  onBack,
  isSaving,
}: {
  lesson: Lesson;
  onUpdate: (updates: Partial<Lesson>) => void;
  onDelete: () => void;
  onBack: () => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState({
    title: lesson.title,
    type: lesson.type,
    video_id: lesson.video_id || '',
    duration_minutes: Math.floor(lesson.duration_seconds / 60),
    transcript_text: lesson.transcript_text || '',
    content: typeof lesson.content === 'object' ? JSON.stringify(lesson.content, null, 2) : lesson.content || '',
    is_free_preview: lesson.is_free_preview,
  });

  const handleSave = () => {
    onUpdate({
      ...form,
      duration_seconds: form.duration_minutes * 60,
      content: form.type === 'text' ? { text: form.content } : {},
    });
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-teal-600 hover:underline flex items-center gap-1">
        <ArrowLeft size={14} />
        Back to Course Settings
      </button>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Title</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Video Lesson Fields */}
      {lesson.type === 'video' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Video ID</label>
            <input
              type="text"
              value={form.video_id}
              onChange={(e) => setForm({ ...form, video_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Mux/Cloudflare asset ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
            <input
              type="number"
              value={form.duration_minutes}
              onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              min={0}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transcript</label>
            <textarea
              value={form.transcript_text}
              onChange={(e) => setForm({ ...form, transcript_text: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              rows={6}
              placeholder="Paste transcript here..."
            />
          </div>
        </>
      )}

      {/* Text Lesson Fields */}
      {lesson.type === 'text' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none font-mono"
            rows={10}
          />
        </div>
      )}

      {/* Quiz Lesson Fields */}
      {lesson.type === 'quiz' && (
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-sm text-amber-800">
            Quiz builder coming in a future update. For now, describe the quiz in the content field below.
          </p>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full mt-3 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            rows={6}
            placeholder="Describe the quiz questions and answers..."
          />
        </div>
      )}

      {/* Resource Lesson Fields */}
      {lesson.type === 'resource' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resource URL</label>
            <input
              type="text"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="https://..."
            />
          </div>
        </>
      )}

      {/* Free Preview Toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="free_preview"
          checked={form.is_free_preview}
          onChange={(e) => setForm({ ...form, is_free_preview: e.target.checked })}
          className="w-4 h-4 rounded border-gray-300 text-teal-600"
        />
        <label htmlFor="free_preview" className="text-sm text-gray-700">
          Free Preview (visible to non-enrolled users)
        </label>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 py-2 rounded-lg text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Save size={16} />
          {isSaving ? 'Saving...' : 'Save Lesson'}
        </button>
        <button
          onClick={onDelete}
          className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

// Main Course Detail Page
export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showAddModule, setShowAddModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');

  // Load course
  useEffect(() => {
    async function loadCourse() {
      try {
        const response = await fetch(`/api/tdi-admin/courses/${resolvedParams.id}`);
        const data = await response.json();
        if (data.course) {
          setCourse(data.course);
          // Expand all modules by default
          setExpandedModules(new Set(data.course.modules.map((m: Module) => m.id)));
        }
      } catch (error) {
        console.error('Error loading course:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadCourse();
  }, [resolvedParams.id]);

  // Update course
  const updateCourse = async (updates: Partial<Course>) => {
    if (!course) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/tdi-admin/courses/${course.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      if (data.course) {
        setCourse((prev) => (prev ? { ...prev, ...data.course } : null));
      }
    } catch (error) {
      console.error('Error updating course:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle publish
  const togglePublish = () => {
    if (course) {
      updateCourse({ is_published: !course.is_published });
    }
  };

  // Add module
  const addModule = async () => {
    if (!course || !newModuleTitle.trim()) return;
    try {
      const response = await fetch('/api/tdi-admin/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: course.id, title: newModuleTitle.trim() }),
      });
      const data = await response.json();
      if (data.module) {
        setCourse((prev) =>
          prev
            ? {
                ...prev,
                modules: [...prev.modules, { ...data.module, lessons: [] }],
              }
            : null
        );
        setExpandedModules((prev) => new Set([...prev, data.module.id]));
        setNewModuleTitle('');
        setShowAddModule(false);
      }
    } catch (error) {
      console.error('Error adding module:', error);
    }
  };

  // Rename module
  const renameModule = async (moduleId: string, title: string) => {
    try {
      await fetch('/api/tdi-admin/modules', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: moduleId, title }),
      });
      setCourse((prev) =>
        prev
          ? {
              ...prev,
              modules: prev.modules.map((m) => (m.id === moduleId ? { ...m, title } : m)),
            }
          : null
      );
    } catch (error) {
      console.error('Error renaming module:', error);
    }
  };

  // Delete module
  const deleteModule = async (moduleId: string) => {
    try {
      await fetch(`/api/tdi-admin/modules?id=${moduleId}`, { method: 'DELETE' });
      setCourse((prev) =>
        prev
          ? {
              ...prev,
              modules: prev.modules.filter((m) => m.id !== moduleId),
            }
          : null
      );
    } catch (error) {
      console.error('Error deleting module:', error);
    }
  };

  // Add lesson
  const addLesson = async (moduleId: string, title: string, type: string) => {
    try {
      const response = await fetch('/api/tdi-admin/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module_id: moduleId, title, type }),
      });
      const data = await response.json();
      if (data.lesson) {
        setCourse((prev) =>
          prev
            ? {
                ...prev,
                modules: prev.modules.map((m) =>
                  m.id === moduleId ? { ...m, lessons: [...m.lessons, data.lesson] } : m
                ),
              }
            : null
        );
      }
    } catch (error) {
      console.error('Error adding lesson:', error);
    }
  };

  // Delete lesson
  const deleteLesson = async (lessonId: string) => {
    try {
      await fetch(`/api/tdi-admin/lessons?id=${lessonId}`, { method: 'DELETE' });
      setCourse((prev) =>
        prev
          ? {
              ...prev,
              modules: prev.modules.map((m) => ({
                ...m,
                lessons: m.lessons.filter((l) => l.id !== lessonId),
              })),
            }
          : null
      );
      if (selectedLesson?.id === lessonId) {
        setSelectedLesson(null);
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
    }
  };

  // Update lesson
  const updateLesson = async (updates: Partial<Lesson>) => {
    if (!selectedLesson) return;
    setIsSaving(true);
    try {
      const response = await fetch('/api/tdi-admin/lessons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedLesson.id, ...updates }),
      });
      const data = await response.json();
      if (data.lesson) {
        setCourse((prev) =>
          prev
            ? {
                ...prev,
                modules: prev.modules.map((m) => ({
                  ...m,
                  lessons: m.lessons.map((l) => (l.id === data.lesson.id ? data.lesson : l)),
                })),
              }
            : null
        );
        setSelectedLesson(data.lesson);
      }
    } catch (error) {
      console.error('Error updating lesson:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Reorder lessons within a module
  const reorderLessons = async (moduleId: string, lessons: Lesson[]) => {
    setCourse((prev) =>
      prev
        ? {
            ...prev,
            modules: prev.modules.map((m) => (m.id === moduleId ? { ...m, lessons } : m)),
          }
        : null
    );
    try {
      await fetch('/api/tdi-admin/lessons/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessons: lessons.map((l, i) => ({ id: l.id, module_id: moduleId, sort_order: i })),
        }),
      });
    } catch (error) {
      console.error('Error reordering lessons:', error);
    }
  };

  // Reorder modules
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleModuleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!course || !over || active.id === over.id) return;

    const oldIndex = course.modules.findIndex((m) => m.id === active.id);
    const newIndex = course.modules.findIndex((m) => m.id === over.id);
    const newModules = arrayMove(course.modules, oldIndex, newIndex).map((m, i) => ({
      ...m,
      sort_order: i,
    }));

    setCourse((prev) => (prev ? { ...prev, modules: newModules } : null));

    try {
      await fetch('/api/tdi-admin/modules/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modules: newModules.map((m, i) => ({ id: m.id, sort_order: i })),
        }),
      });
    } catch (error) {
      console.error('Error reordering modules:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-teal-600 rounded-full" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Course not found</p>
          <Link href="/tdi-admin/hub/production" className="text-teal-600 hover:underline">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/tdi-admin/hub/production"
                className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <ArrowLeft size={16} />
                Back to Courses
              </Link>
              <div className="h-6 border-l border-gray-200" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">{course.title}</h1>
                <p className="text-sm text-gray-500">/{course.slug}</p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  course.is_published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}
              >
                {course.is_published ? 'Published' : 'Draft'}
              </span>
            </div>
            <button
              onClick={togglePublish}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                course.is_published
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-teal-600 text-white hover:bg-teal-700'
              }`}
            >
              {course.is_published ? (
                <>
                  <EyeOff size={16} />
                  Unpublish
                </>
              ) : (
                <>
                  <Eye size={16} />
                  Publish
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6 flex-col lg:flex-row">
          {/* Left: Module/Lesson Tree (60%) */}
          <div className="flex-1 lg:w-[60%]">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleModuleDragEnd}>
              <SortableContext items={course.modules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {course.modules.map((module) => (
                    <SortableModule
                      key={module.id}
                      module={module}
                      isExpanded={expandedModules.has(module.id)}
                      onToggleExpand={() => {
                        setExpandedModules((prev) => {
                          const next = new Set(prev);
                          if (next.has(module.id)) {
                            next.delete(module.id);
                          } else {
                            next.add(module.id);
                          }
                          return next;
                        });
                      }}
                      selectedLessonId={selectedLesson?.id || null}
                      onSelectLesson={setSelectedLesson}
                      onAddLesson={addLesson}
                      onRenameModule={renameModule}
                      onDeleteModule={deleteModule}
                      onDeleteLesson={deleteLesson}
                      onReorderLessons={reorderLessons}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {/* Add Module */}
            {showAddModule ? (
              <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200">
                <input
                  type="text"
                  placeholder="Module title"
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addModule()}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 mb-3"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={addModule}
                    disabled={!newModuleTitle.trim()}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50"
                  >
                    Add Module
                  </button>
                  <button
                    onClick={() => {
                      setShowAddModule(false);
                      setNewModuleTitle('');
                    }}
                    className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddModule(true)}
                className="mt-4 w-full py-3 text-sm text-teal-600 hover:bg-teal-50 rounded-xl border-2 border-dashed border-teal-200 flex items-center justify-center gap-2 transition-colors"
              >
                <Plus size={16} />
                Add Module
              </button>
            )}
          </div>

          {/* Right: Editor Panel (40%) */}
          <div className="lg:w-[40%]">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
              <h2 className="font-semibold text-gray-900 mb-4">
                {selectedLesson ? 'Edit Lesson' : 'Course Settings'}
              </h2>

              {selectedLesson ? (
                <LessonEditorPanel
                  lesson={selectedLesson}
                  onUpdate={updateLesson}
                  onDelete={() => deleteLesson(selectedLesson.id)}
                  onBack={() => setSelectedLesson(null)}
                  isSaving={isSaving}
                />
              ) : (
                <CourseSettingsPanel course={course} onUpdate={updateCourse} isSaving={isSaving} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
