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
  const params = new URLSearchParams();
  params.set('view', 'cm');

  if (to) {
    const toStr = Array.isArray(to) ? to.join(',') : to;
    params.set('to', toStr);
  }
  if (bcc?.length) params.set('bcc', bcc.join(','));
  if (subject) params.set('su', subject);
  if (body) params.set('body', body);

  window.open(`https://mail.google.com/mail/?${params.toString()}`, '_blank');
}
