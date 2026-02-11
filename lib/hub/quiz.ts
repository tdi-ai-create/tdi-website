import { getSupabase } from '@/lib/supabase';

export type QuestionType = 'multiple_choice' | 'true_false' | 'reflection' | 'action_step' | 'checkpoint';

export interface QuizOption {
  text: string;
  is_correct?: boolean;
}

export interface QuizQuestion {
  id: string;
  lesson_id: string;
  question_text: string;
  question_type: QuestionType;
  options: QuizOption[] | null;
  correct_answer: string | null;
  explanation: string | null;
  sort_order: number;
}

export interface QuizResponse {
  id: string;
  user_id: string;
  question_id: string;
  lesson_id: string;
  response: string;
  is_correct: boolean | null;
  created_at: string;
}

/**
 * Get all questions for a lesson
 */
export async function getLessonQuestions(lessonId: string): Promise<QuizQuestion[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('hub_quiz_questions')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching questions:', error);
    return [];
  }

  return data || [];
}

/**
 * Get user responses for a lesson
 */
export async function getUserResponses(
  userId: string,
  lessonId: string
): Promise<Record<string, QuizResponse>> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('hub_quiz_responses')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId);

  if (error) {
    console.error('Error fetching responses:', error);
    return {};
  }

  // Convert to map keyed by question_id
  const responseMap: Record<string, QuizResponse> = {};
  data?.forEach((response) => {
    responseMap[response.question_id] = response;
  });

  return responseMap;
}

/**
 * Save a quiz response
 */
export async function saveQuizResponse(
  userId: string,
  questionId: string,
  lessonId: string,
  response: string,
  isCorrect: boolean | null
): Promise<boolean> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('hub_quiz_responses')
    .upsert(
      {
        user_id: userId,
        question_id: questionId,
        lesson_id: lessonId,
        response,
        is_correct: isCorrect,
      },
      {
        onConflict: 'user_id,question_id',
      }
    );

  if (error) {
    console.error('Error saving response:', error);
    return false;
  }

  return true;
}

/**
 * Check if a multiple choice answer is correct
 */
export function checkMultipleChoiceAnswer(
  options: QuizOption[],
  selectedIndex: number
): boolean {
  return options[selectedIndex]?.is_correct === true;
}

/**
 * Check if a true/false answer is correct
 */
export function checkTrueFalseAnswer(
  correctAnswer: string,
  userAnswer: string
): boolean {
  return correctAnswer.toLowerCase() === userAnswer.toLowerCase();
}

/**
 * Get lesson type based on questions
 */
export function getLessonType(questions: QuizQuestion[]): QuestionType | 'video' {
  if (!questions || questions.length === 0) {
    return 'video'; // Default to video if no questions
  }

  // Return the type of the first question
  return questions[0].question_type;
}
