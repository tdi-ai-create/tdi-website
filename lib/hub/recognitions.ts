import type { SupabaseClient } from '@supabase/supabase-js';

export interface Recognition {
  id: string;
  title: string;
  description: string;
  personalNote: string;
  category: 'growth' | 'showing_up' | 'community';
  threshold: number;
  action: string;
  icon: string;
}

export const RECOGNITIONS: Recognition[] = [
  {
    id: 'hub_pioneer',
    title: 'Hub Pioneer',
    description: 'You joined the new Learning Hub',
    personalNote: 'You are one of the first educators to explore this space. That says everything about who you are.',
    category: 'showing_up',
    threshold: 1,
    action: 'hub_login',
    icon: 'Star',
  },
  {
    id: 'first_tool',
    title: 'First Step',
    description: 'You downloaded your first tool',
    personalNote: 'Every journey starts somewhere. You started yours today.',
    category: 'growth',
    threshold: 1,
    action: 'quick_win_viewed',
    icon: 'Sparkles',
  },
  {
    id: 'toolkit_builder',
    title: 'Toolkit Builder',
    description: 'You explored 5 tools for your classroom',
    personalNote: 'You are building something real. Five tools deep and growing.',
    category: 'growth',
    threshold: 5,
    action: 'quick_win_viewed',
    icon: 'Wrench',
  },
  {
    id: 'ten_tools',
    title: 'Resource Collector',
    description: 'You explored 10 tools',
    personalNote:
      'Ten tools in your toolkit. Your students are lucky to have someone who never stops learning.',
    category: 'growth',
    threshold: 10,
    action: 'quick_win_viewed',
    icon: 'Library',
  },
  {
    id: 'first_save',
    title: 'Curator',
    description: 'You saved your first tool to your library',
    personalNote: 'You know what you need. Trust that instinct.',
    category: 'growth',
    threshold: 1,
    action: 'quick_win_saved',
    icon: 'Bookmark',
  },
  {
    id: 'self_care_champion',
    title: 'Self-Care Champion',
    description: 'You used Moment Mode 5 times',
    personalNote:
      'Taking care of yourself is not selfish. It is necessary. And you are doing it.',
    category: 'showing_up',
    threshold: 5,
    action: 'moment_mode_completed',
    icon: 'Heart',
  },
  {
    id: 'pause_pro',
    title: 'Pause Pro',
    description: 'You used Moment Mode 15 times',
    personalNote:
      'You have made pausing a practice. That takes real strength.',
    category: 'showing_up',
    threshold: 15,
    action: 'moment_mode_completed',
    icon: 'Coffee',
  },
  {
    id: 'rising_voice',
    title: 'Rising Voice',
    description: 'You shared your first experience with the community',
    personalNote:
      'Your voice matters. And now others get to learn from your story.',
    category: 'community',
    threshold: 1,
    action: 'quick_win_experience',
    icon: 'MessageCircle',
  },
  {
    id: 'connector',
    title: 'Connector',
    description: 'You shared 3 tools with colleagues',
    personalNote:
      'You did not just find something good. You made sure others found it too. That is leadership.',
    category: 'community',
    threshold: 3,
    action: 'share_used',
    icon: 'Share2',
  },
  {
    id: 'showing_up',
    title: 'Showing Up',
    description: 'You logged in and explored on 3 different days',
    personalNote:
      'Consistency is quiet power. You keep showing up. We notice.',
    category: 'showing_up',
    threshold: 3,
    action: 'daily_login',
    icon: 'Calendar',
  },
  {
    id: 'time_reclaimed',
    title: 'Time Reclaimed',
    description: 'You saved an estimated 2 hours with quick tools',
    personalNote:
      'That is 2 hours back in your life. Use them however you want. You earned it.',
    category: 'growth',
    threshold: 24,
    action: 'quick_win_viewed',
    icon: 'Clock',
  },
];

export interface EarnedRecognition {
  recognition: Recognition;
  earnedAt: string;
  count: number;
}

export interface RecognitionProgress {
  recognition: Recognition;
  current: number;
}

export interface RecognitionResult {
  earned: EarnedRecognition[];
  available: Recognition[];
  progress: RecognitionProgress[];
}

export async function checkRecognitions(
  userId: string,
  supabase: SupabaseClient
): Promise<RecognitionResult> {
  // Count actions from hub_activity_log
  const { data: activityCounts } = await supabase
    .from('hub_activity_log')
    .select('action')
    .eq('user_id', userId);

  const counts: Record<string, number> = {};
  for (const row of activityCounts || []) {
    counts[row.action] = (counts[row.action] || 0) + 1;
  }

  // Count community posts from quick_win_responses
  const { count: responseCount } = await supabase
    .from('quick_win_responses')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  counts['quick_win_experience'] = responseCount || 0;

  // Count distinct login dates
  const { data: loginDates } = await supabase
    .from('hub_activity_log')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  const uniqueDays = new Set(
    (loginDates || []).map((r: { created_at: string }) =>
      new Date(r.created_at).toISOString().split('T')[0]
    )
  );
  counts['daily_login'] = uniqueDays.size;

  const earned: EarnedRecognition[] = [];
  const available: Recognition[] = [];
  const progress: RecognitionProgress[] = [];

  for (const rec of RECOGNITIONS) {
    const current = counts[rec.action] || 0;
    if (current >= rec.threshold) {
      earned.push({
        recognition: rec,
        earnedAt: new Date().toISOString(),
        count: current,
      });
    } else if (current > 0) {
      progress.push({ recognition: rec, current });
    } else {
      available.push(rec);
    }
  }

  return { earned, available, progress };
}
