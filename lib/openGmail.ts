export function openGmail({
  to,
  bcc,
  subject,
  body,
}: {
  to?: string | string[];
  bcc?: string[];
  subject?: string;
  body?: string;
}) {
  const params: string[] = ['view=cm'];

  if (to) {
    const toStr = Array.isArray(to) ? to.join(',') : to;
    params.push(`to=${encodeURIComponent(toStr)}`);
  }
  if (bcc?.length) {
    params.push(`bcc=${encodeURIComponent(bcc.join(','))}`);
  }
  if (subject) {
    params.push(`su=${encodeURIComponent(subject)}`);
  }
  if (body) {
    params.push(`body=${encodeURIComponent(body)}`);
  }

  window.open(`https://mail.google.com/mail/?${params.join('&')}`, '_blank');
}
