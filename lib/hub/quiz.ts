import { getHubSupabase as getSupabase } from '@/lib/supabase-hub';

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
  content_position: number | null;
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
 * Get all quiz questions for a course (across all its lessons).
 * Used for course-level check-in gates.
 */
export async function getCourseQuestions(lessonIds: string[]): Promise<QuizQuestion[]> {
  if (lessonIds.length === 0) return [];
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('hub_quiz_questions')
    .select('*')
    .in('lesson_id', lessonIds)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching course questions:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all user responses for a set of questions (course-wide).
 */
export async function getCourseResponses(
  userId: string,
  questionIds: string[]
): Promise<Record<string, QuizResponse>> {
  if (questionIds.length === 0) return {};
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('hub_quiz_responses')
    .select('*')
    .eq('user_id', userId)
    .in('question_id', questionIds);

  if (error) {
    console.error('Error fetching course responses:', error);
    return {};
  }

  const responseMap: Record<string, QuizResponse> = {};
  data?.forEach((response) => {
    responseMap[response.question_id] = response;
  });

  return responseMap;
}

/**
 * Compute which lesson index each check-in gates.
 * Distributes 5 checks across N lessons:
 * - Comprehension 1 at ~20%
 * - Comprehension 2 at ~40%
 * - Reflection at ~60%
 * - Action step at ~80%
 * - Checkpoint at final lesson
 */
export function computeGatePositions(
  questions: QuizQuestion[],
  totalLessons: number
): Map<number, QuizQuestion> {
  const gates = new Map<number, QuizQuestion>();
  if (questions.length === 0 || totalLessons === 0) return gates;

  // Sort by type priority for proper distribution
  const typeOrder: Record<string, number> = {
    multiple_choice: 0,
    true_false: 0,
    reflection: 1,
    action_step: 2,
    checkpoint: 3,
  };

  const sorted = [...questions].sort((a, b) => {
    const aOrder = typeOrder[a.question_type] ?? 0;
    const bOrder = typeOrder[b.question_type] ?? 0;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.sort_order - b.sort_order;
  });

  // Distribute across lessons
  const positions = [0.2, 0.4, 0.6, 0.8, 1.0];
  sorted.forEach((q, i) => {
    if (i >= positions.length) return;
    const lessonIndex = Math.min(
      Math.floor(positions[i] * totalLessons) - 1,
      totalLessons - 1
    );
    // Ensure no two gates on the same lesson
    let finalIndex = Math.max(0, lessonIndex);
    while (gates.has(finalIndex) && finalIndex < totalLessons - 1) {
      finalIndex++;
    }
    gates.set(finalIndex, q);
  });

  return gates;
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
