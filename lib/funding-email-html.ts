/**
 * Shared HTML wrapper for funding outreach.
 *
 * Extracted from app/api/funding/send-email so the outreach approval queue
 * sends mail that looks identical to mail sent by hand. Two copies of this
 * would drift, and the client would see two different Teachers Deserve It.
 */
export function buildFundingEmailHtml(plainText: string): string {
  const paragraphs = plainText
    .split('\n\n')
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(
      p =>
        `<p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">${p.replace(/\n/g, '<br>')}</p>`
    )
    .join('')

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Helvetica Neue', Arial, sans-serif; background: #F9FAFB; margin: 0; padding: 0;">
  <div style="max-width: 580px; margin: 0 auto; padding: 32px 24px;">
    <div style="background: white; border-radius: 12px; padding: 32px; border: 1px solid #E5E7EB;">
      <div style="margin-bottom: 24px;">
        <img src="https://www.teachersdeserveit.com/tdi-logo.png" alt="Teachers Deserve It" style="height: 40px;" />
      </div>
      ${paragraphs}
    </div>
    <div style="text-align: center; padding: 16px; color: #9CA3AF; font-size: 11px;">
      Teachers Deserve It | hello@teachersdeserveit.com
    </div>
  </div>
</body>
</html>`
}
