// ---------------------------------------------------------------------------
// Shared Creator Studio email template
// Consistent branding across all creator-facing emails.
// Professional, warm, mission-forward, fun.
// ---------------------------------------------------------------------------

export interface CreatorEmailOptions {
  firstName: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  /** Optional tagline under the header — changes per email type */
  tagline?: string;
  /** Whether to show the mission footer block */
  showMission?: boolean;
  /** Whether to show the nomination CTA in footer */
  showNominate?: boolean;
}

const DASHBOARD_URL = 'https://www.teachersdeserveit.com/creator-portal/dashboard';
const NOMINATE_URL = 'https://www.teachersdeserveit.com/create-with-us';

export function creatorEmailTemplate(options: CreatorEmailOptions): string {
  const {
    body,
    ctaLabel,
    ctaUrl = DASHBOARD_URL,
    tagline,
    showMission = false,
    showNominate = false,
  } = options;

  const ctaBlock = ctaLabel
    ? `
      <div style="text-align: center; margin: 28px 0 24px;">
        <a href="${ctaUrl}" style="display: inline-block; background-color: #1e2749; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; letter-spacing: 0.3px;">
          ${ctaLabel}
        </a>
      </div>
    `
    : '';

  const missionBlock = showMission
    ? `
      <div style="background: #fefce8; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 3px solid #eab308;">
        <p style="margin: 0; font-size: 13px; color: #854d0e; line-height: 1.6;">
          <strong>Why we do this:</strong> Every educator has hard-won knowledge that deserves to be shared.
          The Creator Studio exists to make that happen — you bring the expertise, we handle the rest.
        </p>
      </div>
    `
    : '';

  const nominateBlock = showNominate
    ? `
      <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 20px;">
        <p style="font-size: 13px; color: #374151; margin: 0 0 6px;">
          <strong>Know an educator who should create with us?</strong>
        </p>
        <p style="font-size: 12px; color: #6b7280; margin: 0 0 8px;">
          Great content comes from great educators. If someone comes to mind, send them our way.
        </p>
        <a href="${NOMINATE_URL}" style="font-size: 12px; color: #1e2749; font-weight: 600; text-decoration: underline;">
          Share the Creator Application
        </a>
      </div>
    `
    : '';

  return `
    <div style="font-family: 'Segoe UI', -apple-system, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff;">
      <!-- Header -->
      <div style="background: #1e2749; padding: 20px 28px; border-radius: 12px 12px 0 0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td>
              <p style="margin: 0; font-size: 18px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px;">
                TDI Creator Studio
              </p>
              ${tagline ? `<p style="margin: 4px 0 0; font-size: 12px; color: #94a3b8;">${tagline}</p>` : ''}
            </td>
            <td align="right" style="vertical-align: middle;">
              <div style="width: 36px; height: 36px; background: #ffba06; border-radius: 8px; display: inline-block; text-align: center; line-height: 36px;">
                <span style="color: #1e2749; font-weight: 800; font-size: 16px;">T</span>
              </div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Body -->
      <div style="padding: 28px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <div style="font-size: 15px; line-height: 1.7; color: #374151;">
          ${body}
        </div>

        ${ctaBlock}
        ${missionBlock}
        ${nominateBlock}

        <!-- Signature -->
        <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #f3f4f6;">
          <p style="margin: 0; font-size: 13px; color: #6b7280;">
            Bella Duran | Creator Success<br/>
            <span style="color: #9ca3af;">Teachers Deserve It</span>
          </p>
          <p style="margin: 8px 0 0; font-size: 11px; color: #9ca3af;">
            Questions? Just reply to this email — I read every one.
          </p>
        </div>
      </div>
    </div>
  `;
}
