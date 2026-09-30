-- 164: Media pipeline. Podcast and publication targets, and the pitches sent to
-- them.
--
-- Why this exists. There is no media infrastructure in this repo at all, and a
-- Paperclip agent cannot write code or touch a database: it calls a sync
-- endpoint, is handed work, and writes results back. So an agent created before
-- this table exists would run hourly and report "no work assigned" forever.
-- That is exactly what Amara did for twenty four days while nine funders she had
-- already found sat untouched. The work source comes first.
--
-- Why not sales_opportunities. It is structurally close and it was tempting.
-- But its stage vocabulary is district-sales specific, it deliberately has no
-- lost stage, and dropping podcasts into it corrupts revenue reporting on the
-- sales board. Two pipelines that look alike are not one pipeline.
--
-- The two tracks are the whole design. Rae asked for both a considered motion
-- and a volume motion, and they have different economics: Track A is five to
-- ten hand written pitches a month aimed at district decision makers, Track B is
-- capped volume aimed at smaller teacher audience shows. A Track A target
-- pitched with a Track B template is worse than not pitching it, so track is
-- not nullable and every read path branches on it.
--
-- Standard is documented in tdi-paperclip-skills/margot/PITCH-STANDARD.md.

create table if not exists media_targets (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  kind          text not null default 'podcast'
                  check (kind in ('podcast', 'publication', 'outlet')),
  -- 'a' considered, 'b' volume. See the header. Required on purpose.
  track         text not null
                  check (track in ('a', 'b')),

  url             text,
  -- Where a pitch is supposed to go. Many publications take contributions only
  -- through a form, in which case there is no address to email and the agent
  -- must not invent one.
  submission_url  text,
  contact_name    text,
  contact_email   text,
  contact_role    text,

  -- Who listens, in the agent's own words. This is what the angle is chosen
  -- from, so it is prose rather than a taxonomy.
  audience_note   text,
  -- Which of Rae's four angles fits this target. Chosen per target and never
  -- fixed globally, because picking wrong is the most common way a good pitch
  -- fails. 'tdi_company' on a teacher audience show reads as a sales pitch.
  angle           text
                  check (angle in ('systemic_pd', 'rae_story',
                                   'paraprofessionals', 'tdi_company')),

  -- Drives the "has not published in six months" disqualifier. Null means we
  -- have not looked, which is different from knowing it is dormant.
  last_published_at date,

  -- No 'lost'. A host who passes this season is a host worth asking next
  -- season, and the sales board already learned this lesson. 'passed' carries
  -- revisit_after so declining is a pause rather than a headstone.
  status        text not null default 'prospect'
                  check (status in ('prospect', 'qualified', 'pitched',
                                    'replied', 'booked', 'recorded',
                                    'published', 'passed', 'cold')),
  revisit_after date,

  -- A hard disqualifier is not a status. A show that charges for guest slots is
  -- never pitched again, and that is a different fact from where it sits in the
  -- funnel.
  disqualified        boolean not null default false,
  disqualified_reason text,

  -- THIS COLUMN IS THE POINT. Only a write of status, revisit_after or
  -- disqualified moves it. find_work floors on it rather than on updated_at,
  -- because every unrelated job that touches a row moves updated_at too. That
  -- assumption is exactly what stranded six funding opportunities in September:
  -- the agent's queue read empty while the work sat in plain sight.
  status_checked_at timestamptz,

  last_activity_at  timestamptz,
  next_action       text,
  notes             text,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

create index if not exists media_targets_work_idx
  on media_targets (status, track, status_checked_at)
  where deleted_at is null and disqualified = false;

create index if not exists media_targets_contact_idx
  on media_targets (lower(contact_email))
  where deleted_at is null;

-- ---------------------------------------------------------------------------

create table if not exists media_pitches (
  id          uuid primary key default gen_random_uuid(),
  target_id   uuid not null references media_targets(id) on delete cascade,

  angle       text,
  subject     text not null,
  body        text not null,
  -- Which attempt this is. Two attempts total, then the target goes cold and
  -- waits a quarter. There is no third email.
  attempt     integer not null default 1 check (attempt between 1 and 2),

  -- draft   the agent is still working
  -- queued  finished, waiting on a human for Track A
  -- approved a human said yes; nothing has left yet
  -- sent
  -- skipped the agent or a human killed it, reason in skip_reason
  status      text not null default 'draft'
                check (status in ('draft', 'queued', 'approved', 'sent',
                                  'skipped')),
  skip_reason text,

  -- Attributed and timestamped, same as the funding gate's approve_anyway. An
  -- approval that cannot be traced to a person is not an approval.
  approved_by text,
  approved_at timestamptz,

  sent_at     timestamptz,
  -- Idempotency. An agent that retries after a timeout must not pitch a host
  -- twice, and "we saw a 200" is not proof the first one failed.
  send_key    text unique,
  reply_to    text,

  -- The pre-send checklist, recorded rather than asserted: which lines passed,
  -- which failed, and every number the draft contains so a claim can be traced
  -- back after the fact.
  checklist   jsonb,

  created_by  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists media_pitches_target_idx
  on media_pitches (target_id, created_at desc);

create index if not exists media_pitches_queue_idx
  on media_pitches (status, created_at)
  where status in ('draft', 'queued', 'approved');

-- One live pitch per target at a time. Without this, an agent that loses track
-- of itself queues three drafts for the same host and a human approving the
-- queue top to bottom sends all three. That is the Gary Doughan failure, six
-- emails to one man about two things, and it is cheaper to make it impossible
-- than to remember not to do it.
create unique index if not exists media_pitches_one_open_per_target
  on media_pitches (target_id)
  where status in ('draft', 'queued', 'approved');
