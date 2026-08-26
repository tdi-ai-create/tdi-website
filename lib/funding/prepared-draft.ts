/**
 * Builds the draft email or script that sits on a funding action item.
 *
 * Bella's report on 25 Aug was that clicking a task no longer hands her
 * something to send. It never did. The four tasks that carry prepared_materials
 * were all seeded by hand on 30 June and their "materials" are notes pointing
 * at Google Docs a person wrote, such as "Email was ready to copy-paste-send
 * from the May 18 packet". The only generator in the codebase was added on
 * 17 Aug, covers one escalation path, and has produced zero rows in production.
 *
 * So this is the thing she assumed existed. Templates rather than a model call,
 * matching the direction the AI routes already moved in: a grant chaser has to
 * be the same every time and has to be wrong in ways a human can see.
 *
 * Nothing here invents a fact. Every value is either passed in from the record
 * or the sentence is left out.
 */

export type DraftContext = {
  title: string;
  description?: string | null;
  category?: string | null;
  ownerType?: string | null;
  clientLabel?: string | null;
  pursuitName?: string | null;
  districtName?: string | null;
  funderLabel?: string | null;
  clientContactName?: string | null;
  clientContactRole?: string | null;
  opportunityName?: string | null;
  opportunityAmount?: number | null;
  deadline?: string | null;
};

export type PreparedDraft = {
  /** email: ready to send. script: what to do, for work with no recipient. */
  kind: 'email' | 'script';
  subject: string | null;
  body: string;
};

function firstName(full?: string | null): string | null {
  const t = (full ?? '').trim();
  if (!t) return null;
  return t.split(/\s+/)[0];
}

function greeting(name?: string | null): string {
  const f = firstName(name);
  return f ? `Hi ${f},` : 'Hi,';
}

/** The grant, by whatever name we actually have. Never a placeholder. */
function grantName(c: DraftContext): string | null {
  return c.opportunityName?.trim() || c.funderLabel?.trim() || c.pursuitName?.trim() || null;
}

function money(amount?: number | null): string | null {
  if (amount == null || !Number.isFinite(amount) || amount <= 0) return null;
  return `$${Math.round(amount).toLocaleString('en-US')}`;
}

/**
 * Written out so nobody has to decode an ISO string mid sentence.
 *
 * Built from parts rather than `new Date(iso)`. A bare YYYY-MM-DD parses as UTC
 * midnight and then renders in Central time, so 2026-09-15 came out as
 * "September 14, 2026". These dates go to schools in emails about deadlines,
 * and a deadline that is a day early is worse than no deadline at all.
 */
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

function longDate(iso?: string | null): string | null {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso.trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}

/** Drops empty lines left behind by a missing value, keeps deliberate blanks. */
function assemble(lines: (string | null)[]): string {
  return lines.filter((l) => l !== null).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

const SIGN_OFF = ['Thank you,', 'Bella'];

/**
 * Only `client_label` is safe to show a school. `description` and `title` are
 * written internally and in the third person, so pasting them into an email
 * addressed to that same person produces things like "Paula sent the letter to
 * her LEA and we have heard nothing" sent to Paula. When there is no
 * client_label the ask line is omitted and the email asks for a status instead,
 * which is vaguer but never embarrassing.
 */
function clientSafeAsk(c: DraftContext): string | null {
  const label = c.clientLabel?.trim();
  return label ? label : null;
}

function clientEmail(c: DraftContext): PreparedDraft {
  const grant = grantName(c);
  const ask = clientSafeAsk(c);
  const due = longDate(c.deadline);

  return {
    kind: 'email',
    subject: grant ? `Quick thing we need for ${grant}` : 'Quick thing we need from you',
    body: assemble([
      greeting(c.clientContactName),
      '',
      ask
        ? (grant
            ? `We are working on the ${grant} application for you and there is one thing we need from your side before we can finish it:`
            : 'We are moving your application forward and there is one thing we need from your side before we can finish it:')
        : (grant
            ? `We are working on the ${grant} application for you and I want to make sure it is not waiting on anything from us.`
            : 'We are moving your application forward and I want to make sure it is not waiting on anything from us.'),
      ask ? '' : null,
      ask,
      '',
      due ? `The deadline on this one is ${due}, so the sooner we have it the more room we have.` : null,
      due ? '' : null,
      'As soon as we have that we will pick it straight back up. Happy to jump on a quick call if that is easier than writing it out.',
      '',
      ...SIGN_OFF,
    ]),
  };
}

function chaseEmail(c: DraftContext): PreparedDraft {
  const grant = grantName(c);
  const school = c.districtName?.trim() || null;
  const subjectBits = grant ? `Checking in on ${grant}` : 'Checking in';

  return {
    kind: 'email',
    subject: school ? `${subjectBits} for ${school}` : subjectBits,
    body: assemble([
      greeting(c.clientContactName),
      '',
      grant
        ? `Following up on ${grant}. Nothing urgent, I just want to make sure it is not waiting on us.`
        : 'Following up on where we left things. Nothing urgent, I just want to make sure it is not waiting on us.',
      '',
      // Deliberately no description here. See clientSafeAsk.
      clientSafeAsk(c),
      clientSafeAsk(c) ? '' : null,
      'If there is anything you need from me to move it along, tell me and I will get it over today.',
      '',
      ...SIGN_OFF,
    ]),
  };
}

function documentEmail(c: DraftContext): PreparedDraft {
  const grant = grantName(c);
  const item = clientSafeAsk(c);
  const due = longDate(c.deadline);

  return {
    kind: 'email',
    subject: grant ? `One document for ${grant}` : 'One document we need',
    body: assemble([
      greeting(c.clientContactName),
      '',
      item
        ? (grant
            ? `To submit ${grant} we need one document from your side:`
            : 'We need one document from your side to keep this moving:')
        : (grant
            ? `We need one document from your side before we can submit ${grant}. I will follow this note with the specifics.`
            : 'We need one document from your side before we can submit. I will follow this note with the specifics.'),
      item ? '' : null,
      item,
      '',
      due ? `We are working to ${due}.` : null,
      due ? '' : null,
      'A photo or a scan is completely fine, it does not need to be tidy.',
      '',
      ...SIGN_OFF,
    ]),
  };
}

/** Internal work with no recipient. A checklist beats a fake email. */
function internalScript(c: DraftContext, opening: string): PreparedDraft {
  const grant = grantName(c);
  const amount = money(c.opportunityAmount);
  const due = longDate(c.deadline);
  const who = c.clientContactName?.trim()
    ? `${c.clientContactName.trim()}${c.clientContactRole?.trim() ? `, ${c.clientContactRole.trim()}` : ''}`
    : null;

  return {
    kind: 'script',
    subject: null,
    body: assemble([
      opening,
      '',
      c.description?.trim() || c.title.trim(),
      '',
      'What you have on file:',
      grant ? `Grant: ${grant}` : null,
      c.districtName?.trim() ? `School or district: ${c.districtName.trim()}` : null,
      amount ? `Amount: ${amount}` : null,
      due ? `Deadline: ${due}` : null,
      who ? `Contact: ${who}` : null,
      '',
      'When you have the answer, put it on the task so the next step opens. If the answer closes this path, cancel the task with the reason rather than leaving it open.',
    ]),
  };
}

/**
 * Returns null when there is genuinely nothing useful to say, which is better
 * than filling the field with something Bella has to read and discard.
 */
export function buildPreparedDraft(c: DraftContext): PreparedDraft | null {
  if (!c.title?.trim()) return null;

  const category = (c.category ?? '').toLowerCase();
  const isClient = (c.ownerType ?? '').toLowerCase() === 'client';

  if (isClient) {
    if (category === 'documentation') return documentEmail(c);
    if (category === 'follow_up') return chaseEmail(c);
    return clientEmail(c);
  }

  switch (category) {
    case 'follow_up':
      // Owned by us, but the work is still a message to a person.
      return chaseEmail(c);
    case 'documentation':
      return documentEmail(c);
    case 'research':
      return internalScript(c, 'Research task. Answer this before the application can move:');
    case 'gate':
      return internalScript(c, 'This is a gate. The application cannot proceed until it is answered:');
    case 'approval':
      return internalScript(c, 'Approval needed before this goes out:');
    case 'submission':
      return internalScript(c, 'Submission step. Work through this and record the outcome:');
    default:
      return internalScript(c, 'Next step on this pursuit:');
  }
}

/** Flattens a draft into the single text column the table has. */
export function draftToStoredText(d: PreparedDraft): string {
  return d.subject ? `Subject: ${d.subject}\n\n${d.body}` : d.body;
}
