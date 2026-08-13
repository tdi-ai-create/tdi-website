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
 * Compute which lesson index each check-in appears on.
 *
 * Each question has a `lesson_id` that ties it to a specific lesson. We place
 * the check-in on that lesson so it renders after the content the learner just
 * watched. This works naturally for any course length: a 3-lesson course might
 * have 1-2 check-ins, a 10-lesson course might have 5. The content creator
 * controls placement, not an algorithm.
 *
 * If multiple questions share the same lesson_id, only the first (by
 * sort_order) becomes the gate. The rest are skipped to keep one gate per
 * lesson.
 */
export function computeGatePositions(
  questions: QuizQuestion[],
  totalLessons: number,
  lessonIds?: string[]
): Map<number, QuizQuestion> {
  const gates = new Map<number, QuizQuestion>();
  if (questions.length === 0 || totalLessons === 0) return gates;

  // If we have the ordered lesson IDs, place each question on its own lesson
  if (lessonIds && lessonIds.length > 0) {
    const lessonIndexMap = new Map<string, number>();
    lessonIds.forEach((id, idx) => lessonIndexMap.set(id, idx));

    // Sort by sort_order so first question per lesson wins the gate slot
    const sorted = [...questions].sort((a, b) => a.sort_order - b.sort_order);

    for (const q of sorted) {
      const idx = lessonIndexMap.get(q.lesson_id);
      if (idx !== undefined && !gates.has(idx)) {
        gates.set(idx, q);
      }
    }
    return gates;
  }

  // Fallback for callers that don't pass lessonIds: distribute by sort_order
  // across the course length evenly. This path should not normally be hit.
  const sorted = [...questions].sort((a, b) => a.sort_order - b.sort_order);
  const step = totalLessons / (sorted.length + 1);
  sorted.forEach((q, i) => {
    const idx = Math.min(Math.floor(step * (i + 1)), totalLessons - 1);
    let finalIdx = idx;
    while (gates.has(finalIdx) && finalIdx < totalLessons - 1) {
      finalIdx++;
    }
    gates.set(finalIdx, q);
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
