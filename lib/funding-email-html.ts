/**
 * Shared HTML wrapper for funding outreach.
 *
 * Extracted from app/api/funding/send-email so the outreach approval queue
 * sends mail that looks identical to mail sent by hand. Two copies of this
 * would drift, and the client would see two different Teachers Deserve It.
 */
/**
 * The body is written as plain text and then dropped into HTML. It used to go
 * in raw, which meant two things.
 *
 * An ampersand or an angle bracket anywhere in the wording, including in a
 * share link, went into the markup as markup.
 *
 * And the application package link sat there as bare text with no anchor. Some
 * clients turn a bare URL into a link and some do not, so whether the school
 * could click the thing the email exists to deliver depended on their mail
 * client. It is now a real link, and its visible text is the whole URL, so
 * anyone reading the email or a copy of it can see exactly where it points.
 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Bare http(s) URLs become anchors that still read as the full URL. */
function linkify(escaped: string): string {
  // Runs on already-escaped text, so the only entities present are ours. A
  // trailing . or ) is sentence punctuation rather than part of the address.
  return escaped.replace(
    /(https?:\/\/[^\s<]+?)([.,)]?)(?=\s|$)/g,
    (_m, url: string, trailing: string) =>
      `<a href="${url}" style="color: #2C5F86; text-decoration: underline;">${url}</a>${trailing}`
  )
}

export function buildFundingEmailHtml(plainText: string): string {
  const paragraphs = plainText
    .split('\n\n')
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(
      p =>
        `<p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">${linkify(escapeHtml(p)).replace(/\n/g, '<br>')}</p>`
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
