'use client';

import { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Check,
  ArrowRight,
  Lightbulb,
  Lock,
} from 'lucide-react';
import {
  type QuizQuestion,
  type QuizResponse,
  type QuizOption,
  saveQuizResponse,
  checkMultipleChoiceAnswer,
  checkTrueFalseAnswer,
} from '@/lib/hub/quiz';

interface LessonContentProps {
  lessonId: string;
  lessonTitle: string;
  lessonDescription?: string;
  questions: QuizQuestion[];
  userResponses: Record<string, QuizResponse>;
  userId: string;
  onComplete: () => Promise<void>;
  isCompleted: boolean;
}

export default function LessonContent({
  lessonId,
  lessonTitle,
  lessonDescription,
  questions,
  userResponses,
  userId,
  onComplete,
  isCompleted,
}: LessonContentProps) {
  const [responses, setResponses] = useState<Record<string, QuizResponse>>(userResponses);
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  // Initialize responses from props
  useEffect(() => {
    setResponses(userResponses);
    // Initialize show results for already answered questions
    const initialShowResults: Record<string, boolean> = {};
    Object.keys(userResponses).forEach((qId) => {
      initialShowResults[qId] = true;
    });
    setShowResults(initialShowResults);
  }, [userResponses]);

  // Check if all questions are answered
  const allQuestionsAnswered = questions.every(
    (q) => responses[q.id] || showResults[q.id]
  );

  // Handle multiple choice selection
  const handleMultipleChoiceSelect = async (question: QuizQuestion, optionIndex: number) => {
    if (showResults[question.id] || isSubmitting) return;

    setIsSubmitting(true);
    const options = question.options as QuizOption[];
    const isCorrect = checkMultipleChoiceAnswer(options, optionIndex);
    const response = String(optionIndex);

    const success = await saveQuizResponse(
      userId,
      question.id,
      lessonId,
      response,
      isCorrect
    );

    if (success) {
      setResponses((prev) => ({
        ...prev,
        [question.id]: {
          id: '',
          user_id: userId,
          question_id: question.id,
          lesson_id: lessonId,
          response,
          is_correct: isCorrect,
          created_at: new Date().toISOString(),
        },
      }));
      setShowResults((prev) => ({ ...prev, [question.id]: true }));
    }
    setIsSubmitting(false);
  };

  // Handle true/false selection
  const handleTrueFalseSelect = async (question: QuizQuestion, answer: string) => {
    if (showResults[question.id] || isSubmitting) return;

    setIsSubmitting(true);
    const isCorrect = checkTrueFalseAnswer(question.correct_answer || '', answer);

    const success = await saveQuizResponse(
      userId,
      question.id,
      lessonId,
      answer,
      isCorrect
    );

    if (success) {
      setResponses((prev) => ({
        ...prev,
        [question.id]: {
          id: '',
          user_id: userId,
          question_id: question.id,
          lesson_id: lessonId,
          response: answer,
          is_correct: isCorrect,
          created_at: new Date().toISOString(),
        },
      }));
      setShowResults((prev) => ({ ...prev, [question.id]: true }));
    }
    setIsSubmitting(false);
  };

  // Handle reflection submit
  const handleReflectionSubmit = async (question: QuizQuestion) => {
    const text = currentAnswers[question.id] || '';
    if (text.length < 50 || isSubmitting) return;

    setIsSubmitting(true);
    const success = await saveQuizResponse(
      userId,
      question.id,
      lessonId,
      text,
      null
    );

    if (success) {
      setResponses((prev) => ({
        ...prev,
        [question.id]: {
          id: '',
          user_id: userId,
          question_id: question.id,
          lesson_id: lessonId,
          response: text,
          is_correct: null,
          created_at: new Date().toISOString(),
        },
      }));
      setShowResults((prev) => ({ ...prev, [question.id]: true }));
    }
    setIsSubmitting(false);
  };

  // Handle action step completion
  const handleActionStepComplete = async (question: QuizQuestion) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    const notes = currentAnswers[question.id] || '';
    const success = await saveQuizResponse(
      userId,
      question.id,
      lessonId,
      `completed|${notes}`,
      null
    );

    if (success) {
      setResponses((prev) => ({
        ...prev,
        [question.id]: {
          id: '',
          user_id: userId,
          question_id: question.id,
          lesson_id: lessonId,
          response: `completed|${notes}`,
          is_correct: null,
          created_at: new Date().toISOString(),
        },
      }));
      setShowResults((prev) => ({ ...prev, [question.id]: true }));
    }
    setIsSubmitting(false);
  };

  // Handle checkpoint continue
  const handleCheckpointContinue = async (question: QuizQuestion) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    const success = await saveQuizResponse(
      userId,
      question.id,
      lessonId,
      'acknowledged',
      null
    );

    if (success) {
      setResponses((prev) => ({
        ...prev,
        [question.id]: {
          id: '',
          user_id: userId,
          question_id: question.id,
          lesson_id: lessonId,
          response: 'acknowledged',
          is_correct: null,
          created_at: new Date().toISOString(),
        },
      }));
      setShowResults((prev) => ({ ...prev, [question.id]: true }));
      // Auto-complete for checkpoints
      await onComplete();
    }
    setIsSubmitting(false);
  };

  // Handle mark complete
  const handleMarkComplete = async () => {
    if (isMarking) return;
    setIsMarking(true);
    await onComplete();
    setIsMarking(false);
  };

  // Render multiple choice question
  const renderMultipleChoice = (question: QuizQuestion) => {
    const options = question.options as QuizOption[];
    const response = responses[question.id];
    const answered = showResults[question.id];
    const selectedIndex = response ? parseInt(response.response) : -1;

    return (
      <div className="space-y-3">
        {options.map((option, index) => {
          const isSelected = selectedIndex === index;
          const isCorrect = option.is_correct;
          const showCorrectness = answered;

          let bgColor = '#FFFFFF';
          let borderColor = '#E5E5E5';
          let textColor = '#374151';

          if (showCorrectness) {
            if (isSelected && isCorrect) {
              bgColor = '#D1FAE5';
              borderColor = '#10B981';
              textColor = '#065F46';
            } else if (isSelected && !isCorrect) {
              bgColor = '#FEE2E2';
              borderColor = '#EF4444';
              textColor = '#991B1B';
            } else if (isCorrect) {
              bgColor = '#D1FAE5';
              borderColor = '#10B981';
              textColor = '#065F46';
            }
          } else if (isSelected) {
            bgColor = '#FFF8E7';
            borderColor = '#E8B84B';
          }

          return (
            <button
              key={index}
              onClick={() => handleMultipleChoiceSelect(question, index)}
              disabled={answered || isSubmitting}
              className="w-full text-left p-4 rounded-lg border-2 transition-all flex items-center gap-3 disabled:cursor-default"
              style={{
                backgroundColor: bgColor,
                borderColor,
                color: textColor,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <span
                className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{ borderColor }}
              >
                {showCorrectness && isCorrect && (
                  <CheckCircle size={16} className="text-green-600" />
                )}
                {showCorrectness && isSelected && !isCorrect && (
                  <XCircle size={16} className="text-red-600" />
                )}
              </span>
              <span>{option.text}</span>
            </button>
          );
        })}

        {answered && question.explanation && (
          <div
            className="mt-4 p-4 rounded-lg flex gap-3"
            style={{ backgroundColor: '#FFF8E7' }}
          >
            <Lightbulb size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p
              className="text-sm text-gray-700"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {question.explanation}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Render true/false question
  const renderTrueFalse = (question: QuizQuestion) => {
    const response = responses[question.id];
    const answered = showResults[question.id];
    const selectedAnswer = response?.response;

    const renderButton = (value: string, label: string) => {
      const isSelected = selectedAnswer === value;
      const isCorrect = question.correct_answer?.toLowerCase() === value;
      const showCorrectness = answered;

      let bgColor = '#FFFFFF';
      let borderColor = '#E5E5E5';
      let textColor = '#374151';

      if (showCorrectness) {
        if (isSelected && isCorrect) {
          bgColor = '#D1FAE5';
          borderColor = '#10B981';
          textColor = '#065F46';
        } else if (isSelected && !isCorrect) {
          bgColor = '#FEE2E2';
          borderColor = '#EF4444';
          textColor = '#991B1B';
        } else if (isCorrect) {
          bgColor = '#D1FAE5';
          borderColor = '#10B981';
          textColor = '#065F46';
        }
      } else if (isSelected) {
        bgColor = '#FFF8E7';
        borderColor = '#E8B84B';
      }

      return (
        <button
          onClick={() => handleTrueFalseSelect(question, value)}
          disabled={answered || isSubmitting}
          className="flex-1 p-6 rounded-lg border-2 font-semibold text-lg transition-all disabled:cursor-default"
          style={{
            backgroundColor: bgColor,
            borderColor,
            color: textColor,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {showCorrectness && isCorrect && (
            <CheckCircle size={20} className="inline mr-2 text-green-600" />
          )}
          {showCorrectness && isSelected && !isCorrect && (
            <XCircle size={20} className="inline mr-2 text-red-600" />
          )}
          {label}
        </button>
      );
    };

    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          {renderButton('true', 'True')}
          {renderButton('false', 'False')}
        </div>

        {answered && question.explanation && (
          <div
            className="p-4 rounded-lg flex gap-3"
            style={{ backgroundColor: '#FFF8E7' }}
          >
            <Lightbulb size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p
              className="text-sm text-gray-700"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {question.explanation}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Render reflection question
  const renderReflection = (question: QuizQuestion) => {
    const response = responses[question.id];
    const answered = showResults[question.id];
    const currentText = currentAnswers[question.id] || '';

    if (answered) {
      return (
        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: '#FAFAF8', border: '1px solid #E5E5E5' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={18} className="text-green-600" />
            <span
              className="text-sm font-medium text-green-700"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Reflection saved
            </span>
          </div>
          <p
            className="text-sm text-gray-600 italic"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            &quot;{response.response}&quot;
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <textarea
          value={currentText}
          onChange={(e) =>
            setCurrentAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))
          }
          placeholder="Write your reflection here..."
          className="w-full p-4 border rounded-lg resize-none focus:outline-none focus:border-[#E8B84B]"
          style={{
            minHeight: '150px',
            fontFamily: "'DM Sans', sans-serif",
            borderColor: '#E5E5E5',
          }}
        />
        <div className="flex items-center justify-between">
          <p
            className="text-xs text-gray-400"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {currentText.length}/50 characters minimum
            {currentText.length >= 50 && (
              <span className="text-green-600 ml-2">Ready to submit</span>
            )}
          </p>
          <button
            onClick={() => handleReflectionSubmit(question)}
            disabled={currentText.length < 50 || isSubmitting}
            className="px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            style={{
              backgroundColor: currentText.length >= 50 ? '#E8B84B' : '#E5E5E5',
              color: currentText.length >= 50 ? '#2B3A67' : '#9CA3AF',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {isSubmitting ? 'Saving...' : 'Save Reflection'}
          </button>
        </div>
        <p
          className="text-xs text-gray-400 flex items-center gap-1"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <Lock size={12} />
          This is just for you. We will never share your reflections.
        </p>
      </div>
    );
  };

  // Render action step
  const renderActionStep = (question: QuizQuestion) => {
    const response = responses[question.id];
    const answered = showResults[question.id];
    const notes = currentAnswers[question.id] || '';

    if (answered) {
      const savedNotes = response.response.split('|')[1] || '';
      return (
        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: '#D1FAE5', border: '1px solid #10B981' }}
        >
          <div className="flex items-center gap-2">
            <CheckCircle size={20} className="text-green-600" />
            <span
              className="font-medium text-green-700"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Action step completed!
            </span>
          </div>
          {savedNotes && (
            <p
              className="mt-2 text-sm text-green-700 italic"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Your notes: &quot;{savedNotes}&quot;
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: '#FFF8E7', border: '1px solid #E8B84B' }}
        >
          <p
            className="font-medium mb-2"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: '#2B3A67',
            }}
          >
            Your Action Step:
          </p>
          <p
            className="text-gray-700"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {question.question_text}
          </p>
        </div>

        <textarea
          value={notes}
          onChange={(e) =>
            setCurrentAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))
          }
          placeholder="Optional: Add notes about how this went..."
          className="w-full p-4 border rounded-lg resize-none focus:outline-none focus:border-[#E8B84B]"
          style={{
            minHeight: '100px',
            fontFamily: "'DM Sans', sans-serif",
            borderColor: '#E5E5E5',
          }}
        />

        <button
          onClick={() => handleActionStepComplete(question)}
          disabled={isSubmitting}
          className="w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          style={{
            backgroundColor: '#E8B84B',
            color: '#2B3A67',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <Check size={18} />
          {isSubmitting ? 'Saving...' : 'I completed this action step'}
        </button>
      </div>
    );
  };

  // Render checkpoint
  const renderCheckpoint = (question: QuizQuestion) => {
    const answered = showResults[question.id];
    const takeaways = question.options as QuizOption[] | null;

    return (
      <div className="space-y-6">
        {/* Summary text */}
        <p
          className="text-gray-700"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {question.question_text}
        </p>

        {/* Key takeaways */}
        {takeaways && takeaways.length > 0 && (
          <div
            className="p-5 rounded-lg"
            style={{ backgroundColor: '#FFF8E7' }}
          >
            <h4
              className="font-bold mb-3"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: '#2B3A67',
              }}
            >
              Key Takeaways
            </h4>
            <ul className="space-y-2">
              {takeaways.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  <CheckCircle
                    size={16}
                    className="text-green-600 mt-0.5 flex-shrink-0"
                  />
                  <span className="text-gray-700">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Continue button or completion message */}
        {answered ? (
          <div
            className="p-4 rounded-lg text-center"
            style={{ backgroundColor: '#D1FAE5' }}
          >
            <CheckCircle size={24} className="text-green-600 mx-auto mb-2" />
            <p
              className="font-medium text-green-700"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Checkpoint complete!
            </p>
          </div>
        ) : (
          <button
            onClick={() => handleCheckpointContinue(question)}
            disabled={isSubmitting}
            className="w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            style={{
              backgroundColor: '#E8B84B',
              color: '#2B3A67',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {isSubmitting ? 'Saving...' : 'Ready to continue'}
            <ArrowRight size={18} />
          </button>
        )}
      </div>
    );
  };

  // Render question based on type
  const renderQuestion = (question: QuizQuestion, index: number) => {
    let content;
    let showQuestionText = true;

    switch (question.question_type) {
      case 'multiple_choice':
        content = renderMultipleChoice(question);
        break;
      case 'true_false':
        content = renderTrueFalse(question);
        break;
      case 'reflection':
        content = renderReflection(question);
        break;
      case 'action_step':
        content = renderActionStep(question);
        showQuestionText = false; // Action step shows text inside the component
        break;
      case 'checkpoint':
        content = renderCheckpoint(question);
        showQuestionText = false; // Checkpoint shows text inside
        break;
      default:
        content = null;
    }

    return (
      <div key={question.id} className="mb-8">
        {questions.length > 1 && (
          <p
            className="text-xs text-gray-400 mb-2"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Question {index + 1} of {questions.length}
          </p>
        )}
        {showQuestionText && (
          <h3
            className="font-semibold mb-4"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '18px',
              color: '#2B3A67',
            }}
          >
            {question.question_text}
          </h3>
        )}
        {content}
      </div>
    );
  };

  // If no questions, show empty state (video lesson placeholder)
  if (questions.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2
            className="font-bold mb-2"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontSize: '24px',
              color: '#2B3A67',
            }}
          >
            {lessonTitle}
          </h2>
          {lessonDescription && (
            <p
              className="text-gray-600"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {lessonDescription}
            </p>
          )}
        </div>

        <div
          className="p-8 rounded-lg text-center"
          style={{ backgroundColor: '#FAFAF8', border: '1px dashed #E5E5E5' }}
        >
          <p
            className="text-gray-500"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Video content coming soon
          </p>
        </div>

        {/* Mark complete button */}
        {!isCompleted && (
          <button
            onClick={handleMarkComplete}
            disabled={isMarking}
            className="w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            style={{
              backgroundColor: '#E8B84B',
              color: '#2B3A67',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {isMarking ? 'Saving...' : 'Mark as complete'}
            <Check size={18} />
          </button>
        )}

        {isCompleted && (
          <div
            className="p-4 rounded-lg text-center"
            style={{ backgroundColor: '#D1FAE5' }}
          >
            <CheckCircle size={24} className="text-green-600 mx-auto mb-2" />
            <p
              className="font-medium text-green-700"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Lesson completed!
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Lesson header */}
      <div>
        <h2
          className="font-bold mb-2"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            fontSize: '24px',
            color: '#2B3A67',
          }}
        >
          {lessonTitle}
        </h2>
        {lessonDescription && (
          <p
            className="text-gray-600"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {lessonDescription}
          </p>
        )}
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((question, index) => renderQuestion(question, index))}
      </div>

      {/* Mark complete button (for non-checkpoint lessons) */}
      {allQuestionsAnswered &&
        !isCompleted &&
        questions[0]?.question_type !== 'checkpoint' && (
          <button
            onClick={handleMarkComplete}
            disabled={isMarking}
            className="w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            style={{
              backgroundColor: '#E8B84B',
              color: '#2B3A67',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {isMarking ? 'Saving...' : 'Mark as complete'}
            <Check size={18} />
          </button>
        )}

      {isCompleted && (
        <div
          className="p-4 rounded-lg text-center"
          style={{ backgroundColor: '#D1FAE5' }}
        >
          <CheckCircle size={24} className="text-green-600 mx-auto mb-2" />
          <p
            className="font-medium text-green-700"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Lesson completed!
          </p>
        </div>
      )}
    </div>
  );
}
