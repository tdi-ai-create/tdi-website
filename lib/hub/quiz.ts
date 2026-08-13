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
  is_active?: boolean;
}

export interface QuizResponse {
  id: string;
  user_id: string;
  question_id: string;
  lesson_id: string;
  response: string;
  is_correct: boolean | null;
  /** What the educator wrote after getting this question wrong. */
  follow_up?: string | null;
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
    .eq('is_active', true)
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
 * Save the reflection an educator writes after answering a question wrong.
 *
 * It belongs to the answer that prompted it, so it updates that row rather
 * than creating a second one. The previous version invented a question_id of
 * "<uuid>_reflection", which is not a uuid, so every write failed and the
 * player thanked the educator for words it had just thrown away.
 */
export async function saveFollowUpReflection(
  userId: string,
  questionId: string,
  text: string
): Promise<boolean> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('hub_quiz_responses')
    .update({ follow_up: text })
    .eq('user_id', userId)
    .eq('question_id', questionId)
    .select('id');

  if (error) {
    console.error('Error saving follow-up reflection:', error);
    return false;
  }

  // No row means the answer it belongs to was never recorded. Report that
  // rather than letting the UI claim the reflection was kept.
  return (data?.length ?? 0) > 0;
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
    .eq('is_active', true)
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
 * A check-in is the whole set of questions attached to one lesson, not a single
 * question. A well-formed check-in confirms the educator understood the lesson
 * (a comprehension question) and then asks them to reflect on it or plan how
 * they will use it. Those parts belong together, on the lesson they came from,
 * so the learner answers them right after watching that content.
 *
 * Placement comes from each question's `lesson_id`, never from an algorithm
 * spreading questions across percentage positions. A 4-lesson course might have
 * 2 check-ins and a 20-lesson course 3. Whoever builds the content decides.
 *
 * Returns lesson index -> that lesson's questions in sort_order. Every question
 * is returned; nothing is silently dropped.
 */
export function computeGatePositions(
  questions: QuizQuestion[],
  totalLessons: number,
  lessonIds?: string[]
): Map<number, QuizQuestion[]> {
  const gates = new Map<number, QuizQuestion[]>();
  if (questions.length === 0 || totalLessons === 0) return gates;

  const sorted = [...questions].sort((a, b) => a.sort_order - b.sort_order);

  // Without the ordered lesson IDs we cannot know where a question belongs, and
  // guessing is what put check-ins on the wrong lessons in the first place.
  if (!lessonIds || lessonIds.length === 0) return gates;

  const lessonIndexMap = new Map<string, number>();
  lessonIds.forEach((id, idx) => lessonIndexMap.set(id, idx));

  for (const q of sorted) {
    const idx = lessonIndexMap.get(q.lesson_id);
    if (idx === undefined) continue;
    const existing = gates.get(idx);
    if (existing) existing.push(q);
    else gates.set(idx, [q]);
  }

  return gates;
}

/**
 * How many check-ins a course actually has: one per lesson that carries
 * questions, not one per question. This is the number the course page promises
 * and the number the lesson player counts through.
 */
export function countCheckIns(
  questions: QuizQuestion[],
  lessonIds: string[]
): number {
  const lessonSet = new Set(lessonIds);
  const lessonsWithQuestions = new Set(
    questions.filter((q) => lessonSet.has(q.lesson_id)).map((q) => q.lesson_id)
  );
  return lessonsWithQuestions.size;
}

/**
 * Plain-language description of what a check-in asks of the educator, built
 * from the parts it actually contains. Used on the course outline so the
 * promise on the overview matches the experience in the player.
 */
export function describeCheckIn(questions: QuizQuestion[]): string {
  const types = new Set(questions.map((q) => q.question_type));
  const parts: string[] = [];

  if (types.has('multiple_choice') || types.has('true_false')) {
    parts.push('a quick check on what you just learned');
  }
  if (types.has('reflection')) parts.push('a reflection');
  if (types.has('action_step')) parts.push('a plan for using it');
  if (types.has('checkpoint')) parts.push('the big ideas so far');

  if (parts.length === 0) return 'Check-in';
  if (parts.length === 1) return `Check-in: ${parts[0]}`;
  return `Check-in: ${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

/**
 * What a course's check-ins ask of an educator overall, for the course page's
 * summary copy. Derived from the questions the course actually has, so a course
 * whose only applied prompt is a plan does not promise a reflection too.
 */
export function summarizeCheckIns(questions: QuizQuestion[]): {
  /** Trailing phrase for "3 check-ins ___" */
  feature: string;
  /** Sentence for the "How This Course Works" step */
  detail: string;
} {
  const types = new Set(questions.map((q) => q.question_type));
  const reflects = types.has('reflection');
  const plans = types.has('action_step');

  if (reflects && plans) {
    return {
      feature: 'with a reflection and a plan',
      detail:
        'Each one confirms the ideas landed, then asks you to think through what they mean for your own room and what you will try.',
    };
  }
  if (plans) {
    return {
      feature: 'with a plan for what you will try',
      detail:
        'Each one confirms the ideas landed, then asks you to write down what you will try and when.',
    };
  }
  if (reflects) {
    return {
      feature: 'with a reflection',
      detail:
        'Each one confirms the ideas landed, then asks you to think through what they mean for your own room.',
    };
  }
  return {
    feature: '',
    detail: 'Each one confirms the ideas landed before you move on.',
  };
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
