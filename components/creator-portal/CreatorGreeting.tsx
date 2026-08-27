'use client';

/**
 * Who they are and what they are making. That is all.
 *
 * The block this replaces was a full-width navy hero carrying a percentage ring
 * and a line reading "You've completed 11 of 34 milestones. You're making good
 * progress!". Three problems with that, and they are the reasons this is small.
 *
 * The number was wrong, counting steps retired on 26 August against a journey
 * that read 7 of 27. A percentage is also the least useful framing available
 * here: a creator does not need to know they are 26 per cent of the way through
 * a course, they need to know the one thing in front of them. And telling
 * somebody they are making good progress when they have been stalled since May
 * is the kind of cheerfulness that makes a product feel like it is not paying
 * attention.
 *
 * The journey carries progress properly now, stage by stage, so this does not
 * need to.
 */

const NAVY = '#1e2749';
const INK_3 = '#7e88a6';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 18) return 'Afternoon';
  return 'Evening';
}

export function CreatorGreeting({
  name,
  courseTitle,
  contentPath,
}: {
  name: string;
  courseTitle?: string | null;
  contentPath?: string | null;
}) {
  const first = (name || '').trim().split(' ')[0] || 'there';
  const what = courseTitle
    ? courseTitle
    : contentPath === 'download'
      ? 'Your download'
      : contentPath === 'course'
        ? 'Your course'
        : null;

  return (
    <div style={{ marginBottom: 26 }}>
      <h1 style={{
        margin: 0,
        fontSize: 27,
        fontWeight: 670,
        letterSpacing: '-.022em',
        color: NAVY,
        lineHeight: 1.15,
      }}>
        {greeting()}, {first}
      </h1>
      {what && (
        <p style={{ margin: '5px 0 0', fontSize: 14.5, color: INK_3 }}>
          {what}
        </p>
      )}
    </div>
  );
}
