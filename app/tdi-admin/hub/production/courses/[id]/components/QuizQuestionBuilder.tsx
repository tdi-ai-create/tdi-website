'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  HelpCircle,
  MessageSquare,
  Zap,
  Flag,
  Save,
  Loader2,
  AlertCircle,
} from 'lucide-react';

type QuestionType = 'multiple_choice' | 'true_false' | 'reflection' | 'action_step' | 'checkpoint';

interface QuizOption {
  text: string;
  is_correct?: boolean;
}

interface QuizQuestion {
  id: string;
  lesson_id: string;
  question_text: string;
  question_type: QuestionType;
  options: QuizOption[] | null;
  correct_answer: string | null;
  explanation: string | null;
  sort_order: number;
  content_position: number | null;
}

interface QuizQuestionBuilderProps {
  lessonId: string;
  contentSectionCount: number;
  contentSectionPreviews: string[];
}

const QUESTION_TYPES: { value: QuestionType; label: string; icon: typeof HelpCircle; description: string }[] = [
  { value: 'multiple_choice', label: 'Multiple Choice', icon: CheckCircle2, description: 'Comprehension check with options' },
  { value: 'true_false', label: 'True / False', icon: HelpCircle, description: 'Binary comprehension check' },
  { value: 'reflection', label: 'Reflection', icon: MessageSquare, description: 'Private free-text reflection' },
  { value: 'action_step', label: 'Try It', icon: Zap, description: 'Implementation prompt for the classroom' },
  { value: 'checkpoint', label: 'Checkpoint', icon: Flag, description: 'Lesson summary with key takeaways' },
];

function QuestionTypeIcon({ type }: { type: QuestionType }) {
  const config = QUESTION_TYPES.find((t) => t.value === type);
  if (!config) return null;
  const Icon = config.icon;
  const colors: Record<QuestionType, string> = {
    multiple_choice: '#FFBA06',
    true_false: '#FFBA06',
    reflection: '#4ecdc4',
    action_step: '#34D399',
    checkpoint: '#8B5CF6',
  };
  return <Icon size={14} style={{ color: colors[type] }} />;
}

export default function QuizQuestionBuilder({
  lessonId,
  contentSectionCount,
  contentSectionPreviews,
}: QuizQuestionBuilderProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generateStatus, setGenerateStatus] = useState('');

  // Fetch questions on mount
  const fetchQuestions = useCallback(async () => {
    try {
      const res = await fetch(`/api/tdi-admin/quiz-questions?lesson_id=${lessonId}`);
      const data = await res.json();
      if (data.questions) {
        setQuestions(data.questions);
      }
    } catch (err) {
      setError('Failed to load questions');
    } finally {
      setIsLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // AI-generate engagement checks
  const handleGenerate = async () => {
    setGenerating(true);
    setGenerateStatus('Analyzing lesson content...');
    setError(null);
    try {
      const res = await fetch('/api/tdi-admin/quiz-questions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lesson_id: lessonId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Generation failed');
        setGenerateStatus('');
        return;
      }

      setGenerateStatus(`Created ${data.count} engagement checks`);
      // Refresh the question list
      await fetchQuestions();
      setTimeout(() => setGenerateStatus(''), 3000);
    } catch {
      setError('Failed to generate checks. Please try again.');
      setGenerateStatus('');
    } finally {
      setGenerating(false);
    }
  };

  // Add a new question
  const handleAdd = async (type: QuestionType) => {
    setShowAddMenu(false);
    const defaultText: Record<QuestionType, string> = {
      multiple_choice: 'New comprehension check',
      true_false: 'New true/false question',
      reflection: 'What stood out to you from this section?',
      action_step: 'Try this in your classroom this week',
      checkpoint: "Here's what we covered in this lesson",
    };

    const defaultOptions: Record<QuestionType, QuizOption[] | null> = {
      multiple_choice: [
        { text: 'Option A', is_correct: true },
        { text: 'Option B', is_correct: false },
        { text: 'Option C', is_correct: false },
      ],
      true_false: null,
      reflection: null,
      action_step: null,
      checkpoint: [
        { text: 'Key takeaway 1' },
        { text: 'Key takeaway 2' },
      ],
    };

    try {
      const res = await fetch('/api/tdi-admin/quiz-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lesson_id: lessonId,
          question_text: defaultText[type],
          question_type: type,
          options: defaultOptions[type],
          correct_answer: type === 'true_false' ? 'true' : null,
          explanation: type === 'multiple_choice' || type === 'true_false' ? 'Explanation goes here...' : null,
        }),
      });
      const data = await res.json();
      if (data.question) {
        setQuestions((prev) => [...prev, data.question]);
        setExpandedId(data.question.id);
      }
    } catch {
      setError('Failed to create question');
    }
  };

  // Save a question
  const handleSave = async (question: QuizQuestion) => {
    setSaving((prev) => ({ ...prev, [question.id]: true }));
    try {
      const res = await fetch('/api/tdi-admin/quiz-questions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: question.id,
          question_text: question.question_text,
          question_type: question.question_type,
          options: question.options,
          correct_answer: question.correct_answer,
          explanation: question.explanation,
          sort_order: question.sort_order,
          content_position: question.content_position,
        }),
      });
      const data = await res.json();
      if (data.question) {
        setQuestions((prev) => prev.map((q) => (q.id === data.question.id ? data.question : q)));
      }
    } catch {
      setError('Failed to save question');
    } finally {
      setSaving((prev) => ({ ...prev, [question.id]: false }));
    }
  };

  // Delete a question
  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/tdi-admin/quiz-questions?id=${id}`, { method: 'DELETE' });
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch {
      setError('Failed to delete question');
    }
  };

  // Update local question state
  const updateQuestion = (id: string, updates: Partial<QuizQuestion>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  // Move question up/down
  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const idx = questions.findIndex((q) => q.id === id);
    if (
      (direction === 'up' && idx === 0) ||
      (direction === 'down' && idx === questions.length - 1)
    )
      return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const newQuestions = [...questions];
    const tempOrder = newQuestions[idx].sort_order;
    newQuestions[idx] = { ...newQuestions[idx], sort_order: newQuestions[swapIdx].sort_order };
    newQuestions[swapIdx] = { ...newQuestions[swapIdx], sort_order: tempOrder };
    [newQuestions[idx], newQuestions[swapIdx]] = [newQuestions[swapIdx], newQuestions[idx]];
    setQuestions(newQuestions);

    // Save both
    await Promise.all([
      handleSave(newQuestions[idx]),
      handleSave(newQuestions[swapIdx]),
    ]);
  };

  // Render multiple choice options editor
  const renderOptionsEditor = (question: QuizQuestion) => {
    const options = (question.options as QuizOption[]) || [];
    return (
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-600">Answer Options</label>
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              onClick={() => {
                const updated = options.map((o, j) => ({ ...o, is_correct: j === i }));
                updateQuestion(question.id, { options: updated });
              }}
              className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
              style={{
                borderColor: opt.is_correct ? '#10B981' : '#D1D5DB',
                backgroundColor: opt.is_correct ? '#10B981' : 'transparent',
              }}
              title={opt.is_correct ? 'Correct answer' : 'Mark as correct'}
            >
              {opt.is_correct && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </button>
            <input
              type="text"
              value={opt.text}
              onChange={(e) => {
                const updated = options.map((o, j) => (j === i ? { ...o, text: e.target.value } : o));
                updateQuestion(question.id, { options: updated });
              }}
              className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
            <button
              onClick={() => {
                const updated = options.filter((_, j) => j !== i);
                updateQuestion(question.id, { options: updated });
              }}
              className="text-gray-400 hover:text-red-500"
              title="Remove option"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        <button
          onClick={() => {
            const updated = [...options, { text: '', is_correct: false }];
            updateQuestion(question.id, { options: updated });
          }}
          className="text-xs text-teal-600 hover:underline flex items-center gap-1"
        >
          <Plus size={10} /> Add option
        </button>
      </div>
    );
  };

  // Render checkpoint takeaways editor
  const renderTakeawaysEditor = (question: QuizQuestion) => {
    const items = (question.options as QuizOption[]) || [];
    return (
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-600">Key Takeaways</label>
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-4 text-center">{i + 1}.</span>
            <input
              type="text"
              value={item.text}
              onChange={(e) => {
                const updated = items.map((t, j) => (j === i ? { ...t, text: e.target.value } : t));
                updateQuestion(question.id, { options: updated });
              }}
              className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
            <button
              onClick={() => {
                const updated = items.filter((_, j) => j !== i);
                updateQuestion(question.id, { options: updated });
              }}
              className="text-gray-400 hover:text-red-500"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        <button
          onClick={() => {
            const updated = [...items, { text: '' }];
            updateQuestion(question.id, { options: updated });
          }}
          className="text-xs text-teal-600 hover:underline flex items-center gap-1"
        >
          <Plus size={10} /> Add takeaway
        </button>
      </div>
    );
  };

  // Render content position selector
  const renderPositionSelector = (question: QuizQuestion) => {
    return (
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Position in Lesson
        </label>
        <select
          value={question.content_position !== null && question.content_position !== undefined ? String(question.content_position) : 'end'}
          onChange={(e) => {
            const val = e.target.value;
            updateQuestion(question.id, {
              content_position: val === 'end' ? null : parseInt(val),
            });
          }}
          className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
        >
          <option value="end">After all content (end of lesson)</option>
          {Array.from({ length: contentSectionCount }, (_, i) => (
            <option key={i} value={i}>
              After section {i + 1}
              {contentSectionPreviews[i] ? `: ${contentSectionPreviews[i]}` : ''}
            </option>
          ))}
        </select>
        {contentSectionCount === 0 && (
          <p className="text-xs text-amber-600 mt-1">
            Add lesson body content with headings to enable positioning between sections.
          </p>
        )}
      </div>
    );
  };

  // Render expanded question editor
  const renderQuestionEditor = (question: QuizQuestion) => {
    const isSaving = saving[question.id];

    return (
      <div className="p-3 space-y-3 border-t border-gray-100">
        {/* Question text */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            {question.question_type === 'action_step' ? 'Action Step Description' :
             question.question_type === 'checkpoint' ? 'Checkpoint Summary' :
             question.question_type === 'reflection' ? 'Reflection Prompt' :
             'Question'}
          </label>
          <textarea
            value={question.question_text}
            onChange={(e) => updateQuestion(question.id, { question_text: e.target.value })}
            className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
            rows={2}
          />
        </div>

        {/* Type-specific editors */}
        {question.question_type === 'multiple_choice' && renderOptionsEditor(question)}

        {question.question_type === 'true_false' && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Correct Answer</label>
            <div className="flex gap-2">
              <button
                onClick={() => updateQuestion(question.id, { correct_answer: 'true' })}
                className="flex-1 py-1.5 rounded text-sm font-medium border-2 transition-colors"
                style={{
                  borderColor: question.correct_answer === 'true' ? '#10B981' : '#E5E7EB',
                  backgroundColor: question.correct_answer === 'true' ? '#D1FAE5' : '#fff',
                  color: question.correct_answer === 'true' ? '#065F46' : '#6B7280',
                }}
              >
                True
              </button>
              <button
                onClick={() => updateQuestion(question.id, { correct_answer: 'false' })}
                className="flex-1 py-1.5 rounded text-sm font-medium border-2 transition-colors"
                style={{
                  borderColor: question.correct_answer === 'false' ? '#10B981' : '#E5E7EB',
                  backgroundColor: question.correct_answer === 'false' ? '#D1FAE5' : '#fff',
                  color: question.correct_answer === 'false' ? '#065F46' : '#6B7280',
                }}
              >
                False
              </button>
            </div>
          </div>
        )}

        {question.question_type === 'checkpoint' && renderTakeawaysEditor(question)}

        {/* Explanation (for comprehension checks) */}
        {(question.question_type === 'multiple_choice' || question.question_type === 'true_false') && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Explanation (shown after answering)
            </label>
            <textarea
              value={question.explanation || ''}
              onChange={(e) => updateQuestion(question.id, { explanation: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
              rows={2}
              placeholder="Why this answer is correct..."
            />
          </div>
        )}

        {/* Content position */}
        {renderPositionSelector(question)}

        {/* Save button */}
        <div className="flex justify-end">
          <button
            onClick={() => handleSave(question)}
            disabled={isSaving}
            className="px-4 py-1.5 rounded text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 flex items-center gap-1.5"
          >
            {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-3 text-center">
        <Loader2 size={16} className="animate-spin text-gray-400 mx-auto" />
        <p className="text-xs text-gray-400 mt-1">Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
          <HelpCircle size={12} />
          Engagement Checks ({questions.length})
        </p>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="text-xs font-medium disabled:opacity-50 flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors"
          style={{
            background: generating ? '#F3F4F6' : 'linear-gradient(135deg, #FFBA06, #4ecdc4)',
            color: generating ? '#6B7280' : '#fff',
          }}
        >
          {generating ? (
            <Loader2 size={11} className="animate-spin" />
          ) : (
            <Zap size={11} />
          )}
          {generating ? (generateStatus || 'Generating...') : 'Auto-Generate'}
        </button>
      </div>
      {generateStatus && !generating && (
        <p className="text-xs text-green-600 font-medium">{generateStatus}</p>
      )}

      {error && (
        <div className="flex items-center gap-2 p-2 bg-red-50 rounded text-xs text-red-700">
          <AlertCircle size={12} />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">dismiss</button>
        </div>
      )}

      {/* Question list */}
      {questions.map((question, index) => {
        const isExpanded = expandedId === question.id;
        const typeConfig = QUESTION_TYPES.find((t) => t.value === question.question_type);

        return (
          <div
            key={question.id}
            className="border border-gray-200 rounded-lg overflow-hidden bg-white"
          >
            {/* Question header row */}
            <div
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedId(isExpanded ? null : question.id)}
            >
              <GripVertical size={12} className="text-gray-300 flex-shrink-0" />
              <QuestionTypeIcon type={question.question_type} />
              <span className="text-xs font-medium text-gray-700 flex-1 truncate">
                {question.question_text}
              </span>
              <span className="text-[10px] text-gray-400 flex-shrink-0">
                {question.content_position !== null
                  ? `after sec ${question.content_position + 1}`
                  : 'end'}
              </span>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); handleReorder(question.id, 'up'); }}
                  disabled={index === 0}
                  className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <ChevronUp size={12} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleReorder(question.id, 'down'); }}
                  disabled={index === questions.length - 1}
                  className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <ChevronDown size={12} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(question.id); }}
                  className="p-0.5 text-gray-400 hover:text-red-500 ml-1"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            {/* Expanded editor */}
            {isExpanded && renderQuestionEditor(question)}
          </div>
        );
      })}

      {/* Add question button */}
      <div className="relative">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-xs text-gray-500 hover:border-teal-400 hover:text-teal-600 transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus size={12} />
          Add Engagement Check
        </button>

        {showAddMenu && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
            {QUESTION_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => handleAdd(type.value)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left transition-colors"
                >
                  <Icon size={14} className="text-gray-500 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-medium text-gray-700">{type.label}</div>
                    <div className="text-[10px] text-gray-400">{type.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Interleaving preview */}
      {questions.length > 0 && contentSectionCount > 0 && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-2">
            Lesson Flow Preview
          </p>
          <div className="flex items-center gap-1">
            {(() => {
              const flow: { type: 'content' | QuestionType; label: string }[] = [];
              const positioned = new Map<number, QuizQuestion[]>();
              const trailing: QuizQuestion[] = [];

              questions.forEach((q) => {
                if (q.content_position !== null) {
                  const group = positioned.get(q.content_position) || [];
                  group.push(q);
                  positioned.set(q.content_position, group);
                } else {
                  trailing.push(q);
                }
              });

              for (let i = 0; i < contentSectionCount; i++) {
                flow.push({ type: 'content', label: `Sec ${i + 1}` });
                const qs = positioned.get(i);
                if (qs) {
                  qs.forEach((q) => flow.push({ type: q.question_type, label: q.question_type.charAt(0).toUpperCase() }));
                }
              }
              trailing.forEach((q) => flow.push({ type: q.question_type, label: q.question_type.charAt(0).toUpperCase() }));

              const colors: Record<string, string> = {
                content: 'linear-gradient(90deg, #FFBA06, #4ecdc4)',
                multiple_choice: '#FFBA06',
                true_false: '#FFBA06',
                reflection: '#4ecdc4',
                action_step: '#34D399',
                checkpoint: '#8B5CF6',
              };

              return flow.map((item, i) => (
                <div
                  key={i}
                  className="rounded-full"
                  title={item.type === 'content' ? item.label : `${item.type}`}
                  style={{
                    flex: item.type === 'content' ? 1 : 0.4,
                    minWidth: item.type === 'content' ? '20px' : '12px',
                    height: '6px',
                    background: colors[item.type] || '#E5E7EB',
                    opacity: item.type === 'content' ? 0.4 : 1,
                  }}
                />
              ));
            })()}
          </div>
          <div className="flex gap-3 mt-2 flex-wrap">
            {[
              { color: 'linear-gradient(90deg, #FFBA06, #4ecdc4)', label: 'Content' },
              { color: '#FFBA06', label: 'Check' },
              { color: '#4ecdc4', label: 'Reflection' },
              { color: '#34D399', label: 'Try It' },
              { color: '#8B5CF6', label: 'Checkpoint' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm" style={{ background: item.color }} />
                <span className="text-[9px] text-gray-500">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
