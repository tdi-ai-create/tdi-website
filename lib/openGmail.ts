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
  let url = 'https://mail.google.com/mail/?view=cm';

  if (to) {
    const toStr = Array.isArray(to) ? to.join(',') : to;
    url += '&to=' + toStr;
  }
  if (bcc?.length) {
    url += '&bcc=' + bcc.join(',');
  }
  if (subject) {
    url += '&su=' + encodeURIComponent(subject);
  }
  if (body) {
    url += '&body=' + encodeURIComponent(body);
  }

  window.open(url, '_blank');
}
