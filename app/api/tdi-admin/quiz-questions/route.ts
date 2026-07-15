import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getHubServiceSupabase() {
  const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Learning Hub Supabase not configured');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

/**
 * GET /api/tdi-admin/quiz-questions?lesson_id=...
 * Fetch all quiz questions for a lesson
 */
export async function GET(request: Request) {
  try {
    const supabase = getHubServiceSupabase();
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lesson_id');

    if (!lessonId) {
      return NextResponse.json({ error: 'lesson_id is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('hub_quiz_questions')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('[quiz-questions] Error fetching:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ questions: data || [] });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST /api/tdi-admin/quiz-questions
 * Create a new quiz question
 */
export async function POST(request: Request) {
  try {
    const supabase = getHubServiceSupabase();
    const body = await request.json();

    const { lesson_id, question_text, question_type, options, correct_answer, explanation, sort_order, content_position } = body;

    if (!lesson_id || !question_text || !question_type) {
      return NextResponse.json(
        { error: 'lesson_id, question_text, and question_type are required' },
        { status: 400 }
      );
    }

    // Validate content_position if provided
    if (content_position !== undefined && content_position !== null) {
      if (typeof content_position !== 'number' || !Number.isInteger(content_position) || content_position < 0) {
        return NextResponse.json(
          { error: 'content_position must be a non-negative integer or null' },
          { status: 400 }
        );
      }
    }

    // Auto-assign sort_order if not provided
    let finalSortOrder = sort_order;
    if (finalSortOrder === undefined) {
      const { data: existing } = await supabase
        .from('hub_quiz_questions')
        .select('sort_order')
        .eq('lesson_id', lesson_id)
        .order('sort_order', { ascending: false })
        .limit(1);

      finalSortOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;
    }

    const { data, error } = await supabase
      .from('hub_quiz_questions')
      .insert({
        lesson_id,
        question_text,
        question_type,
        options: options || null,
        correct_answer: correct_answer || null,
        explanation: explanation || null,
        sort_order: finalSortOrder,
        content_position: content_position ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error('[quiz-questions] Error creating:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ question: data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * PATCH /api/tdi-admin/quiz-questions
 * Update a quiz question
 */
export async function PATCH(request: Request) {
  try {
    const supabase = getHubServiceSupabase();
    const body = await request.json();

    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json({ error: 'Question id is required' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (fields.question_text !== undefined) updates.question_text = fields.question_text;
    if (fields.question_type !== undefined) updates.question_type = fields.question_type;
    if (fields.options !== undefined) updates.options = fields.options;
    if (fields.correct_answer !== undefined) updates.correct_answer = fields.correct_answer;
    if (fields.explanation !== undefined) updates.explanation = fields.explanation;
    if (fields.sort_order !== undefined) updates.sort_order = fields.sort_order;
    if ('content_position' in fields) updates.content_position = fields.content_position;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('hub_quiz_questions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[quiz-questions] Error updating:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ question: data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * DELETE /api/tdi-admin/quiz-questions?id=...
 * Delete a quiz question
 */
export async function DELETE(request: Request) {
  try {
    const supabase = getHubServiceSupabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Question id is required' }, { status: 400 });
    }

    const { error } = await supabase.from('hub_quiz_questions').delete().eq('id', id);

    if (error) {
      console.error('[quiz-questions] Error deleting:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
