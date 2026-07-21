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
  type: 'qa_reply' | 'helpful_marked' | 'post_pinned' | 'badge_earned' | 'certificate_ready' | 'new_content' | 'streak_milestone' | 'profile_quiz' | 'community_highlight';
  title: string;
  body?: string;
  link?: string;
  sourceUserId?: string;
}) {
  // Don't notify yourself
  if (sourceUserId && sourceUserId === userId) return;

  // Throttle: max 2 notifications per user per day
  // High-priority types (certificate, badge) bypass throttle
  const highPriority = ['certificate_ready', 'badge_earned', 'profile_quiz'];
  if (!highPriority.includes(type)) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { count } = await hubSupabase
        .from('hub_notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', today + 'T00:00:00Z');

      if ((count || 0) >= 2) return; // Skip, already sent 2 today
    } catch {
      // If throttle check fails, still send
    }
  }

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

/**
 * Notify when a badge or Field Note is earned.
 */
export async function notifyBadgeEarned({
  userId,
  badgeName,
  badgeDescription,
}: {
  userId: string;
  badgeName: string;
  badgeDescription?: string;
}) {
  await createNotification({
    userId,
    type: 'badge_earned',
    title: `You earned: ${badgeName}`,
    body: badgeDescription || 'Keep going! Your growth is being recognized.',
    link: '/hub/certificates',
  });
}

/**
 * Notify when a PD certificate is ready.
 */
export async function notifyCertificateReady({
  userId,
  courseName,
  pdHours,
  verificationCode,
}: {
  userId: string;
  courseName: string;
  pdHours: number;
  verificationCode: string;
}) {
  await createNotification({
    userId,
    type: 'certificate_ready',
    title: `Certificate ready: ${courseName}`,
    body: `You earned ${pdHours} PD hours. Verification code: ${verificationCode}`,
    link: '/hub/certificates',
  });
}

/**
 * Notify when new content matches a user's interests.
 */
export async function notifyNewContent({
  userId,
  contentTitle,
  category,
  slug,
  contentType,
}: {
  userId: string;
  contentTitle: string;
  category: string;
  slug: string;
  contentType: 'quick_win' | 'course';
}) {
  const link = contentType === 'quick_win' ? `/hub/quick-wins/${slug}` : `/hub/courses/${slug}`;
  await createNotification({
    userId,
    type: 'new_content',
    title: `New in ${category}: ${contentTitle}`,
    body: 'A new tool was just added that matches your interests.',
    link,
  });
}

/**
 * Notify on streak milestones.
 */
export async function notifyStreakMilestone({
  userId,
  days,
}: {
  userId: string;
  days: number;
}) {
  const messages: Record<number, string> = {
    3: 'Three days in a row! You are building a habit.',
    7: 'A full week! Your consistency is making a difference.',
    14: 'Two weeks strong! Your students are lucky to have you.',
    30: 'One month streak! You are in the top 5% of educators on the Hub.',
  };

  await createNotification({
    userId,
    type: 'streak_milestone',
    title: `${days}-day streak!`,
    body: messages[days] || `${days} days of growth. Keep going.`,
    link: '/hub',
  });
}

/**
 * Suggest profile quiz to a user.
 */
export async function notifyProfileQuiz({
  userId,
}: {
  userId: string;
}) {
  await createNotification({
    userId,
    type: 'profile_quiz',
    title: 'Personalize your Hub experience',
    body: 'Take a 2-minute quiz so we can recommend tools that match your classroom, your role, and your goals.',
    link: '/hub/settings/profile',
  });
}

/**
 * Notify when someone at their school posts in the community.
 */
export async function notifyCommunityHighlight({
  userId,
  posterName,
  postSnippet,
  link,
}: {
  userId: string;
  posterName: string;
  postSnippet: string;
  link: string;
}) {
  await createNotification({
    userId,
    type: 'community_highlight',
    title: `${posterName} from your school shared something`,
    body: postSnippet.slice(0, 80),
    link,
  });
}
