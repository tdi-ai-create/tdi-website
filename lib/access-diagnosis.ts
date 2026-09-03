// ---------------------------------------------------------------------------
// Why can this person not sign in, and what fixes it.
//
// Every access problem this year has been one of a small number of shapes, and
// each time it was diagnosed from scratch by a person reading the database:
//
//   Thirteen of twenty creators had never signed in. Not one had ever been
//   sent a link. Nothing in the product said so and it ran for three months.
//
//   Fifteen accounts were created with SQL and had NULL instance_id, aud and
//   token columns. Every sign in method failed for all of them. Hillary at
//   St. Mary spent her own time on it before anyone knew.
//
//   Rebecca Blahus was closed by the agreement gate the day after she was
//   re-accepted, so her account worked but her status said withdrawn.
//
// The point of this module is that the diagnosis is written once, both systems
// use it, and Bella can act on it without asking anybody.
// ---------------------------------------------------------------------------

export type Surface = 'creator_studio' | 'hub';

export type Blocker =
  | 'no_account'
  | 'auth_row_broken'
  | 'never_invited'
  | 'invite_unused'
  | 'account_inactive'
  | 'no_profile';

export type RemedyAction = 'create_account' | 'repair_auth' | 'send_link' | 'reactivate' | 'create_profile';

export interface Remedy {
  action: RemedyAction;
  /** The button, in the words of the person pressing it. */
  label: string;
  /** What pressing it does, said plainly enough to be safe to press. */
  effect: string;
}

export interface Finding {
  blocker: Blocker;
  /** What is wrong, in one sentence a person can repeat to the educator. */
  what: string;
  /** Why it happened, where we know. */
  why: string;
  remedy: Remedy;
}

/** The facts a diagnosis needs. Everything nullable, because absence is a fact. */
export interface AccessFacts {
  email: string;
  surface: Surface;
  /** The auth user, if one exists at all. */
  auth: {
    id: string;
    lastSignInAt: string | null;
    recoverySentAt: string | null;
    invitedAt: string | null;
    emailConfirmedAt: string | null;
    /** True when the row is missing the columns Supabase needs to authenticate. */
    malformed: boolean;
  } | null;
  /** The application-side record: a creator, or a Hub profile. */
  record: {
    exists: boolean;
    /** withdrawn, paused, inactive. Null means active or not applicable. */
    inactiveReason: string | null;
  };
}

const REMEDIES: Record<RemedyAction, Omit<Remedy, 'action'>> = {
  create_account: {
    label: 'Create their account and get a link',
    effect: 'Creates a sign in account for this address, then gives you a link to send them.',
  },
  repair_auth: {
    label: 'Repair the account and get a link',
    effect: 'Fills in what the account is missing so sign in can work at all, then gives you a fresh link to send.',
  },
  send_link: {
    label: 'Get a sign in link for them',
    effect: 'Gives you a link that signs them straight in. Nothing is emailed: you send it. Safe to repeat.',
  },
  reactivate: {
    label: 'Reactivate them',
    effect: 'Puts the record back to active. Their existing work and steps are untouched.',
  },
  create_profile: {
    label: 'Create their Hub profile',
    effect: 'Creates the missing profile row so the Hub has somewhere to put them after sign in.',
  },
};

function remedy(action: RemedyAction): Remedy {
  return { action, ...REMEDIES[action] };
}

/**
 * All the reasons this person cannot get in, most blocking first.
 *
 * Returns every finding rather than the first, because these stack: an account
 * can be both malformed and attached to a withdrawn record, and fixing one
 * leaves the person still locked out and nobody any wiser.
 */
export function diagnose(f: AccessFacts): Finding[] {
  const findings: Finding[] = [];

  if (!f.auth) {
    findings.push({
      blocker: 'no_account',
      what: 'There is no sign in account for this address.',
      why: 'Nothing was ever created for them, so there is nothing to sign in to and no link would work.',
      remedy: remedy('create_account'),
    });
  } else if (f.auth.malformed) {
    findings.push({
      blocker: 'auth_row_broken',
      what: 'Their account exists but is missing the fields needed to authenticate.',
      why: 'Accounts created directly with SQL end up this way. Every sign in method fails, no matter what the person tries, and the screen gives them no clue.',
      remedy: remedy('repair_auth'),
    });
  } else if (!f.auth.lastSignInAt) {
    const everContacted = !!(f.auth.recoverySentAt || f.auth.invitedAt);
    findings.push(
      everContacted
        ? {
            blocker: 'invite_unused',
            what: 'They were sent a link and have never signed in.',
            why: 'The link may have expired, gone to spam, or reached an address they do not read. Sending a fresh one is safe.',
            remedy: remedy('send_link'),
          }
        : {
            blocker: 'never_invited',
            what: 'They have an account but were never sent a link.',
            why: 'Creating the account does not contact anybody. This is the single most common reason someone has never appeared.',
            remedy: remedy('send_link'),
          },
    );
  }

  if (f.record.exists && f.record.inactiveReason) {
    findings.push({
      blocker: 'account_inactive',
      what: `Their record is marked ${f.record.inactiveReason}, so the portal will turn them away even if sign in works.`,
      why: 'Status and sign in are separate. An account can work perfectly while the record says the person is gone.',
      remedy: remedy('reactivate'),
    });
  }

  if (f.surface === 'hub' && f.auth && !f.record.exists) {
    findings.push({
      blocker: 'no_profile',
      what: 'They can sign in, but the Hub has no profile for them.',
      why: 'Sign in succeeds and then the Hub has nowhere to put them, which usually shows as a blank or broken page.',
      remedy: remedy('create_profile'),
    });
  }

  return findings;
}

/**
 * NOTE ON SENDING. Nothing in this module sends anything. The remedies that
 * involve a sign in link generate it and hand it back on screen for a person to
 * send. The copy used to say "emails a link", which was untrue and would have
 * had somebody press a button and then wait for a delivery that never happened.
 *
 * Blockers that belong to the sign in account, not to a particular product.
 *
 * Someone who was never sent a link has one problem, not one per surface. The
 * first version of this listed it once for Creator Studio and again for the
 * Hub, with two identical buttons, which invites the reasonable question of
 * whether you have to press both.
 */
export const ACCOUNT_LEVEL: Blocker[] = ['no_account', 'auth_row_broken', 'never_invited', 'invite_unused'];

export function isAccountLevel(b: Blocker): boolean {
  return ACCOUNT_LEVEL.includes(b);
}

/** True when nothing is standing between this person and the front door. */
export function canSignIn(f: AccessFacts): boolean {
  return diagnose(f).length === 0;
}
