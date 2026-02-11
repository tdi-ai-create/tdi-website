/**
 * Email templates for the TDI Learning Hub
 * These generate HTML strings for email sending (provider to be configured later)
 */

// TDI Brand colors for emails
const COLORS = {
  navy: '#2B3A67',
  gold: '#E8B84B',
  white: '#FFFFFF',
  lightGray: '#F5F5F5',
  textDark: '#333333',
  textMuted: '#666666',
};

// Base email wrapper
function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Teachers Deserve It Learning Hub</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: ${COLORS.lightGray};">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${COLORS.lightGray};">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; margin: 0 auto; background-color: ${COLORS.white}; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: ${COLORS.navy}; padding: 24px 32px; text-align: center;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <span style="font-size: 20px; font-weight: 700; color: ${COLORS.white}; letter-spacing: 0.5px;">TEACHERS DESERVE IT</span>
                    <span style="display: block; margin-top: 4px; font-size: 11px; font-weight: 600; color: ${COLORS.gold}; letter-spacing: 1px; text-transform: uppercase;">LEARNING HUB</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: ${COLORS.lightGray}; padding: 24px 32px; text-align: center; border-top: 1px solid #E0E0E0;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: ${COLORS.textMuted};">
                You are receiving this because you signed up for the TDI Learning Hub.
              </p>
              <p style="margin: 0; font-size: 12px; color: ${COLORS.textMuted};">
                <a href="https://www.teachersdeserveit.com/hub/settings/notifications" style="color: ${COLORS.navy}; text-decoration: underline;">Manage email preferences</a>
              </p>
              <p style="margin: 16px 0 0 0; font-size: 11px; color: ${COLORS.textMuted};">
                &copy; ${new Date().getFullYear()} Teachers Deserve It. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// CTA Button
function ctaButton(text: string, url: string): string {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0;">
  <tr>
    <td style="text-align: center;">
      <a href="${url}" style="display: inline-block; padding: 14px 32px; background-color: ${COLORS.gold}; color: ${COLORS.navy}; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 6px;">
        ${text}
      </a>
    </td>
  </tr>
</table>
  `.trim();
}

// Section heading
function sectionHeading(text: string): string {
  return `<h2 style="margin: 24px 0 12px 0; font-size: 18px; font-weight: 600; color: ${COLORS.navy};">${text}</h2>`;
}

// Stat block
function statBlock(stats: { label: string; value: string | number }[]): string {
  const statCells = stats
    .map(
      (stat) => `
    <td style="padding: 16px; text-align: center; background-color: ${COLORS.lightGray}; border-radius: 6px;">
      <div style="font-size: 28px; font-weight: 700; color: ${COLORS.navy};">${stat.value}</div>
      <div style="font-size: 12px; color: ${COLORS.textMuted}; margin-top: 4px;">${stat.label}</div>
    </td>
  `
    )
    .join('<td style="width: 12px;"></td>');

  return `
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 16px 0;">
  <tr>
    ${statCells}
  </tr>
</table>
  `.trim();
}

// Course card
function courseCard(title: string, reason: string, url: string): string {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 12px 0; border: 1px solid #E0E0E0; border-radius: 6px; overflow: hidden;">
  <tr>
    <td style="padding: 16px;">
      <a href="${url}" style="font-size: 16px; font-weight: 600; color: ${COLORS.navy}; text-decoration: none;">${title}</a>
      <p style="margin: 8px 0 0 0; font-size: 14px; color: ${COLORS.textMuted};">${reason}</p>
    </td>
  </tr>
</table>
  `.trim();
}

// ============================================
// EMAIL TEMPLATES
// ============================================

export interface WelcomeEmailData {
  displayName: string;
}

export function generateWelcomeEmail(data: WelcomeEmailData): string {
  const content = `
<h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 600; color: ${COLORS.textDark};">
  Welcome to your Learning Hub
</h1>
<p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: ${COLORS.textDark};">
  Hi ${data.displayName},
</p>
<p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: ${COLORS.textDark};">
  Your Learning Hub is ready. This is your space for professional development that actually fits your life.
</p>

${sectionHeading('Here is what you can do right now:')}

<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 16px 0;">
  <tr>
    <td style="padding: 12px 0; border-bottom: 1px solid #E0E0E0;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="width: 32px; vertical-align: top;">
            <span style="display: inline-block; width: 24px; height: 24px; background-color: ${COLORS.gold}; border-radius: 50%; text-align: center; line-height: 24px; font-size: 14px; font-weight: 600; color: ${COLORS.navy};">1</span>
          </td>
          <td style="vertical-align: top;">
            <strong style="color: ${COLORS.textDark};">Browse courses built by teachers, for teachers</strong>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: ${COLORS.textMuted};">Earn real PD hours at your own pace</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding: 12px 0; border-bottom: 1px solid #E0E0E0;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="width: 32px; vertical-align: top;">
            <span style="display: inline-block; width: 24px; height: 24px; background-color: ${COLORS.gold}; border-radius: 50%; text-align: center; line-height: 24px; font-size: 14px; font-weight: 600; color: ${COLORS.navy};">2</span>
          </td>
          <td style="vertical-align: top;">
            <strong style="color: ${COLORS.textDark};">Try a Quick Win (3-5 minutes, no prep)</strong>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: ${COLORS.textMuted};">Practical strategies you can use today</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding: 12px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="width: 32px; vertical-align: top;">
            <span style="display: inline-block; width: 24px; height: 24px; background-color: ${COLORS.gold}; border-radius: 50%; text-align: center; line-height: 24px; font-size: 14px; font-weight: 600; color: ${COLORS.navy};">3</span>
          </td>
          <td style="vertical-align: top;">
            <strong style="color: ${COLORS.textDark};">Take a stress check-in (private, just for you)</strong>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: ${COLORS.textMuted};">Track your wellbeing over time</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

${ctaButton('Go to my Hub', 'https://www.teachersdeserveit.com/hub')}
  `.trim();

  return emailWrapper(content);
}

export interface NudgeEmailData {
  displayName: string;
  courseCount: number;
  recommendedCourseTitle: string;
  recommendedCourseUrl: string;
}

export function generateNudgeEmail(data: NudgeEmailData): string {
  const content = `
<h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 600; color: ${COLORS.textDark};">
  Your PD hours are waiting
</h1>
<p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: ${COLORS.textDark};">
  Hi ${data.displayName},
</p>
<p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: ${COLORS.textDark};">
  It has been a couple weeks since you joined the Hub. No pressure, but we wanted you to know:
</p>

<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 16px 0; background-color: ${COLORS.lightGray}; border-radius: 8px; padding: 20px;">
  <tr>
    <td style="padding: 20px;">
      <p style="margin: 0 0 12px 0; font-size: 16px; color: ${COLORS.textDark};">
        <strong style="color: ${COLORS.navy};">${data.courseCount} courses</strong> are waiting for you
      </p>
      <p style="margin: 0 0 12px 0; font-size: 16px; color: ${COLORS.textDark};">
        Each one earns <strong style="color: ${COLORS.navy};">real PD hours</strong>
      </p>
      <p style="margin: 0; font-size: 16px; color: ${COLORS.textDark};">
        Most teachers start with <a href="${data.recommendedCourseUrl}" style="color: ${COLORS.navy}; font-weight: 600;">${data.recommendedCourseTitle}</a>
      </p>
    </td>
  </tr>
</table>

${ctaButton('Browse courses', 'https://www.teachersdeserveit.com/hub/courses')}

<p style="margin: 24px 0 0 0; font-size: 14px; color: ${COLORS.textMuted}; font-style: italic;">
  P.S. If you only have 5 minutes, try a <a href="https://www.teachersdeserveit.com/hub/quick-wins" style="color: ${COLORS.navy};">Quick Win</a>.
</p>
  `.trim();

  return emailWrapper(content);
}

export interface DigestEmailData {
  displayName: string;
  coursesInProgress: number;
  lessonsCompletedThisMonth: number;
  pdHoursEarned: number;
  stressTrend: 'up' | 'down' | 'stable';
  recommendedCourses: { title: string; reason: string; url: string }[];
  newCourses: { title: string; url: string }[];
}

export function generateDigestEmail(data: DigestEmailData): string {
  const trendText =
    data.stressTrend === 'up'
      ? 'Trending up (more stressed)'
      : data.stressTrend === 'down'
        ? 'Trending down (less stressed)'
        : 'Stable';

  const trendColor =
    data.stressTrend === 'down' ? '#22C55E' : data.stressTrend === 'up' ? '#EF4444' : COLORS.textMuted;

  const recommendedSection =
    data.recommendedCourses.length > 0
      ? `
${sectionHeading('Recommended for you')}
${data.recommendedCourses.map((c) => courseCard(c.title, c.reason, c.url)).join('')}
  `
      : '';

  const newCoursesSection =
    data.newCourses.length > 0
      ? `
${sectionHeading('New this month')}
${data.newCourses.map((c) => courseCard(c.title, 'Just added to the catalog', c.url)).join('')}
  `
      : '';

  const content = `
<h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 600; color: ${COLORS.textDark};">
  Your monthly Learning Hub update
</h1>
<p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: ${COLORS.textDark};">
  Hi ${data.displayName},
</p>
<p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: ${COLORS.textDark};">
  Here is your month in review:
</p>

${statBlock([
  { label: 'Courses in progress', value: data.coursesInProgress },
  { label: 'Lessons completed', value: data.lessonsCompletedThisMonth },
  { label: 'PD hours earned', value: data.pdHoursEarned },
])}

<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 16px 0;">
  <tr>
    <td style="padding: 12px 16px; background-color: ${COLORS.lightGray}; border-radius: 6px; text-align: center;">
      <span style="font-size: 14px; color: ${COLORS.textMuted};">Stress trend: </span>
      <span style="font-size: 14px; font-weight: 600; color: ${trendColor};">${trendText}</span>
    </td>
  </tr>
</table>

${recommendedSection}
${newCoursesSection}

${ctaButton('Continue learning', 'https://www.teachersdeserveit.com/hub')}
  `.trim();

  return emailWrapper(content);
}

// ============================================
// MAIN GENERATOR FUNCTION
// ============================================

export type EmailType = 'welcome' | 'nudge' | 'digest';

export type EmailData = WelcomeEmailData | NudgeEmailData | DigestEmailData;

export function generateEmailHTML(type: EmailType, data: EmailData): string {
  switch (type) {
    case 'welcome':
      return generateWelcomeEmail(data as WelcomeEmailData);
    case 'nudge':
      return generateNudgeEmail(data as NudgeEmailData);
    case 'digest':
      return generateDigestEmail(data as DigestEmailData);
    default:
      throw new Error(`Unknown email type: ${type}`);
  }
}

// ============================================
// EMAIL SUBJECT LINES
// ============================================

export function getEmailSubject(type: EmailType): string {
  switch (type) {
    case 'welcome':
      return 'Welcome to your Learning Hub';
    case 'nudge':
      return 'Your PD hours are waiting';
    case 'digest':
      return 'Your monthly Learning Hub update';
    default:
      return 'Teachers Deserve It Learning Hub';
  }
}

// Sample data for previews
export const sampleEmailData = {
  welcome: {
    displayName: 'Sarah',
  } as WelcomeEmailData,
  nudge: {
    displayName: 'Sarah',
    courseCount: 12,
    recommendedCourseTitle: 'Stress Management for Educators',
    recommendedCourseUrl: 'https://www.teachersdeserveit.com/hub/courses/stress-management',
  } as NudgeEmailData,
  digest: {
    displayName: 'Sarah',
    coursesInProgress: 2,
    lessonsCompletedThisMonth: 8,
    pdHoursEarned: 4.5,
    stressTrend: 'down' as const,
    recommendedCourses: [
      {
        title: 'Building Student Relationships',
        reason: 'Based on your interest in classroom management',
        url: 'https://www.teachersdeserveit.com/hub/courses/student-relationships',
      },
      {
        title: 'Time Management for Teachers',
        reason: 'Popular with educators like you',
        url: 'https://www.teachersdeserveit.com/hub/courses/time-management',
      },
    ],
    newCourses: [
      {
        title: 'AI Tools for the Classroom',
        url: 'https://www.teachersdeserveit.com/hub/courses/ai-tools',
      },
    ],
  } as DigestEmailData,
};
