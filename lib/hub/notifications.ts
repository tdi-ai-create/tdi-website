import { createClient } from '@supabase/supabase-js';

const hubSupabase = createClient(
  process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL!,
  process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Create a notification for a user.
 * Fire-and-forget -- errors are logged but don't block the caller.
 */
export async function createNotification({
  userId,
  type,
  title,
  body,
  link,
  sourceUserId,
}: {
  userId: string;
  type: 'qa_reply' | 'helpful_marked' | 'post_pinned';
  title: string;
  body?: string;
  link?: string;
  sourceUserId?: string;
}) {
  // Don't notify yourself
  if (sourceUserId && sourceUserId === userId) return;

  try {
    await hubSupabase.from('hub_notifications').insert({
      user_id: userId,
      type,
      title,
      body: body || null,
      link: link || null,
      source_user_id: sourceUserId || null,
    });
  } catch (err) {
    console.error('[notifications] Failed to create:', err);
  }
}

/**
 * Notify the original poster when someone replies to their QA post.
 */
export async function notifyQAReply({
  parentPostId,
  replyUserId,
  replyBody,
  contentType,
  contentId,
}: {
  parentPostId: string;
  replyUserId: string;
  replyBody: string;
  contentType: string;
  contentId: string;
}) {
  try {
    // Get the parent post to find who to notify
    const { data: parentPost } = await hubSupabase
      .from('hub_qa_posts')
      .select('user_id')
      .eq('id', parentPostId)
      .single();

    if (!parentPost?.user_id) return;

    // Get replier's name
    const { data: replier } = await hubSupabase
      .from('hub_profiles')
      .select('display_name, first_name')
      .eq('id', replyUserId)
      .single();

    const replierName = replier?.display_name || replier?.first_name || 'Someone';
    const snippet = replyBody.length > 80 ? replyBody.slice(0, 80) + '...' : replyBody;

    // Build link based on content type
    const link = contentType === 'quick_win'
      ? `/hub/quick-wins/${contentId}`
      : contentType === 'course' || contentType === 'lesson'
      ? `/hub/courses/${contentId}`
      : '/hub';

    await createNotification({
      userId: parentPost.user_id,
      type: 'qa_reply',
      title: `${replierName} replied to your post`,
      body: snippet,
      link,
      sourceUserId: replyUserId,
    });
  } catch (err) {
    console.error('[notifications] Failed to notify QA reply:', err);
  }
}

/**
 * Notify when someone marks a post as helpful.
 */
export async function notifyHelpfulMarked({
  postId,
  markedByUserId,
}: {
  postId: string;
  markedByUserId: string;
}) {
  try {
    const { data: post } = await hubSupabase
      .from('hub_qa_posts')
      .select('user_id, body')
      .eq('id', postId)
      .single();

    if (!post?.user_id) return;

    await createNotification({
      userId: post.user_id,
      type: 'helpful_marked',
      title: 'Someone found your post helpful',
      body: post.body?.slice(0, 80) || undefined,
      sourceUserId: markedByUserId,
    });
  } catch (err) {
    console.error('[notifications] Failed to notify helpful:', err);
  }
}
