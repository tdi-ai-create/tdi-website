import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

function getHubServiceSupabase() {
  const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Learning Hub Supabase not configured');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * POST /api/tdi-admin/quiz-questions/generate
 *
 * AI-generates engagement checks for a lesson based on its content.
 * Reads lesson body_html, transcript, and title, then creates
 * comprehension checks, reflections, action steps, and a checkpoint.
 */
export async function POST(request: Request) {
  try {
    const supabase = getHubServiceSupabase();
    const { lesson_id } = await request.json();

    if (!lesson_id) {
      return NextResponse.json({ error: 'lesson_id is required' }, { status: 400 });
    }

    // Fetch the lesson
    const { data: lesson, error: lessonError } = await supabase
      .from('hub_lessons')
      .select('id, title, type, content, transcript, transcript_es')
      .eq('id', lesson_id)
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Extract available content for the AI to work with
    const contentObj = (typeof lesson.content === 'object' && lesson.content !== null)
      ? lesson.content as Record<string, unknown>
      : {};
    const bodyHtml = (contentObj.body_html as string) || '';
    const bodyText = (contentObj.text as string) || '';
    const markdown = (contentObj.markdown as string) || '';
    const transcript = lesson.transcript || '';
    const lessonContent = bodyHtml || bodyText || markdown || transcript;

    if (!lessonContent || lessonContent.trim().length < 50) {
      return NextResponse.json(
        { error: 'Lesson needs body content or a transcript (at least 50 characters) to generate engagement checks.' },
        { status: 400 }
      );
    }

    // Count existing sections in body_html for positioning
    let sectionCount = 0;
    if (bodyHtml) {
      const breakPattern = /(?=<h[23][^>]*>)|(?:<!--\s*section-break\s*-->)/gi;
      const sections = bodyHtml.split(breakPattern).filter((s: string) => s.trim().length > 0);
      sectionCount = sections.length;
    }

    // Build the prompt
    const prompt = `You are an instructional designer for Teachers Deserve It, an educator professional development platform. Your job is to create engagement checks for a lesson that will be interleaved with the lesson content.

LESSON TITLE: ${lesson.title}
LESSON TYPE: ${lesson.type}
NUMBER OF CONTENT SECTIONS: ${sectionCount}

LESSON CONTENT:
${lessonContent.substring(0, 8000)}

---

Generate engagement checks for this lesson. You MUST create:
- 2 multiple choice comprehension checks (3-4 options each, exactly 1 correct)
- 1 reflection prompt (a thoughtful question that connects the content to the educator's own practice)
- 1 action step (a specific, doable classroom action they can try this week)
- 1 checkpoint (3-4 key takeaways that summarize the lesson)

RULES:
- Comprehension checks should test real understanding, not surface recall. Avoid "which of these was mentioned" questions. Instead ask "based on this concept, which approach would be most effective?"
- The reflection should be personal and connect to their classroom. Start with phrases like "Think about..." or "Consider a time when..."
- The action step must be specific enough to do tomorrow. Not "improve your practice" but "Try greeting each student by name at the door for 3 consecutive days."
- Checkpoint takeaways should be concise, actionable statements -- not vague summaries.
- Explanations for correct answers should teach, not just confirm. Explain WHY.
- Tone: warm, professional, no emojis, no gamification language.

${sectionCount > 1 ? `POSITIONING: There are ${sectionCount} content sections. Distribute checks between sections. Use 0-based indexing for content_position. Place the first check after section 0, second check after section ${Math.min(1, sectionCount - 1)}, reflection after section ${Math.min(2, sectionCount - 1)}, action step after section ${Math.max(0, sectionCount - 2)}, and checkpoint at the end (content_position: null).` : 'POSITIONING: Set content_position to null for all questions (they will appear after the content).'}

Respond with ONLY a JSON array of objects. Each object must have exactly these fields:
{
  "question_text": "...",
  "question_type": "multiple_choice" | "true_false" | "reflection" | "action_step" | "checkpoint",
  "options": [...] | null,
  "correct_answer": "..." | null,
  "explanation": "..." | null,
  "content_position": number | null,
  "sort_order": number
}

For multiple_choice, options must be an array of {"text": "...", "is_correct": boolean}.
For checkpoint, options must be an array of {"text": "..."} representing key takeaways.
For reflection and action_step, options must be null.
For true_false, options must be null and correct_answer must be "true" or "false".

Return ONLY the JSON array, no markdown fences, no explanation.`;

    // Call Claude
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    });

    // Parse the response
    const responseText = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('');

    let questions;
    try {
      // Strip markdown fences if present
      const cleaned = responseText.replace(/^```json?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
      questions = JSON.parse(cleaned);
    } catch {
      console.error('[generate] Failed to parse AI response:', responseText.substring(0, 500));
      return NextResponse.json(
        { error: 'AI generated invalid JSON. Please try again.' },
        { status: 500 }
      );
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: 'AI returned no questions. Please try again.' },
        { status: 500 }
      );
    }

    // Get current max sort_order for this lesson
    const { data: existing } = await supabase
      .from('hub_quiz_questions')
      .select('sort_order')
      .eq('lesson_id', lesson_id)
      .order('sort_order', { ascending: false })
      .limit(1);

    let nextSortOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

    // Insert all questions
    const insertRows = questions.map((q: Record<string, unknown>) => ({
      lesson_id,
      question_text: q.question_text || '',
      question_type: q.question_type || 'multiple_choice',
      options: q.options || null,
      correct_answer: q.correct_answer || null,
      explanation: q.explanation || null,
      sort_order: q.sort_order ?? nextSortOrder++,
      content_position: q.content_position ?? null,
    }));

    const { data: created, error: insertError } = await supabase
      .from('hub_quiz_questions')
      .insert(insertRows)
      .select();

    if (insertError) {
      console.error('[generate] Insert error:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      questions: created,
      count: created?.length || 0,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[generate] Error:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
