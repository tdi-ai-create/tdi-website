'use client';

import { useState } from 'react';
import Image from 'next/image';

const NAVY = '#1e2749';
const YELLOW = '#ffba06';
const LIGHT_BLUE = '#E8F0FD';
const BLUE = '#80a4ed';

const MOVES = [
  {
    n: '01',
    title: 'Schedule the return before you deliver the first session',
    body: 'The follow up date goes on the calendar at the same moment the training date does, and it carries the same weight.',
    test: 'If it can be cancelled because something came up, it is not a follow up. It is an intention.',
  },
  {
    n: '02',
    title: 'One action, one context, one time, in writing',
    body: 'Before anyone leaves, they name one specific thing they will do. Not "I will build more relationships." Something like "Monday at the 10:40 transition I will meet Marcus at the door and give him a job to carry."',
    test: 'Specific enough that you could ask about it by name three weeks later.',
  },
  {
    n: '03',
    title: 'Ask what happened, not whether they liked it',
    body: 'The return conversation is "you said you would meet Marcus at the door. Did you? What happened?" Offer five answers, not two: I tried it, I adapted it, I am still trying, I got stuck, it did not land.',
    test: 'Three of your five answers are failure states, and saying one out loud costs the person nothing.',
  },
  {
    n: '04',
    title: 'What the adult writes never reaches their evaluator',
    body: 'If someone writes "I froze, I did not know what to say," and a supervisor might read it in an evaluation context, you will never get a true answer from that person again. Worse, you will not know it stopped.',
    test: 'Leadership sees counts. Leadership never sees the text. Settle it before the first session.',
  },
  {
    n: '05',
    title: 'Somebody watches the work',
    body: 'It does not have to be an instructional coach. It can be a peer, or the person down the hall who is good at the thing you are bad at, for fifteen minutes.',
    test: 'It cannot be nobody, and "their teacher will support them" is nobody, because the teacher is teaching.',
  },
];

const TOOLS: { title: string; roles: ('PARA' | 'TEACHER')[] }[] = [
  { title: 'The First 10 Minutes Framework', roles: ['TEACHER'] },
  { title: 'Calm Response Scripts', roles: ['PARA', 'TEACHER'] },
  { title: 'The Noise Level System', roles: ['TEACHER'] },
  { title: 'Lesson Flow Checklist', roles: ['TEACHER'] },
  { title: '2x10 Strategy, PA Edition', roles: ['PARA'] },
  { title: 'Strategic Planning: A Teacher-First Tool', roles: ['TEACHER'] },
  { title: 'Para Quick-Start Confidence Kit', roles: ['PARA'] },
  { title: 'Classroom Scenario Shuffle', roles: ['PARA', 'TEACHER'] },
  { title: 'The Shift Kit', roles: ['PARA', 'TEACHER'] },
  { title: 'Know Your Learners: Student Profile Builder', roles: ['TEACHER'] },
  { title: 'PA Quick Wins Menu', roles: ['PARA'] },
  { title: 'Morning Meeting Framework', roles: ['TEACHER'] },
  { title: '10 Low-Lift Ways to Be Part of the Solution', roles: ['PARA', 'TEACHER'] },
  { title: 'The Awesome Audit', roles: ['PARA', 'TEACHER'] },
  { title: 'Burnout Early Warning System', roles: ['PARA', 'TEACHER'] },
  { title: 'Time-Saving Prompts for Teachers', roles: ['TEACHER'] },
  { title: 'The Language Playbook', roles: ['PARA', 'TEACHER'] },
  { title: 'PA Observation Guide', roles: ['PARA'] },
  { title: 'No-Hands-Up Help Systems', roles: ['PARA', 'TEACHER'] },
  { title: 'De-Escalation Language Guide', roles: ['PARA', 'TEACHER'] },
];

const GAMES = [
  { title: 'Classroom Scenario Shuffle', mins: '10 min' },
  { title: "What's Your Move?", mins: '10 min' },
  { title: 'Reset Roulette', mins: '8 min' },
  { title: 'Conversation Compass', mins: '12 min' },
  { title: 'Question Knockout', mins: '15 min' },
  { title: 'Partner Up', mins: '15 min' },
];

export default function BrccPageClient() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === 'sending') return;

    setState('sending');
    setMessage('');

    try {
      const res = await fetch('/api/brcc/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      // A failed request must never render as success. The whole page is a
      // promise to follow up, so a silent failure here breaks the actual point.
      if (!res.ok) {
        setState('error');
        setMessage(data?.error || 'That did not save. Try again in a moment.');
        return;
      }

      setState('done');
      setMessage(
        data?.alreadySignedUp
          ? 'You were already on the list. One email, three weeks from now.'
          : 'You are on the list. One email, three weeks from now.'
      );
    } catch {
      setState('error');
      setMessage('That did not save. Try again in a moment.');
    }
  }

  return (
    <main className="bg-[#FAFAF8] text-[#3E4148]">
      {/* Hero */}
      <section style={{ backgroundColor: NAVY }} className="text-white py-14 md:py-20">
        <div className="max-w-3xl mx-auto px-6">
          <span
            className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.13em] rounded-full px-3 py-1.5 mb-6"
            style={{ color: YELLOW, backgroundColor: 'rgba(249,185,27,0.13)', border: '1px solid rgba(249,185,27,0.4)' }}
          >
            <span className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: YELLOW }} />
            Bridging Resilient Communities for Children
          </span>

          <h1 className="font-serif text-4xl md:text-5xl leading-[1.1] font-semibold mb-4 text-balance">
            You were in the room. Here is what is yours.
          </h1>

          <p className="text-lg leading-relaxed text-[#C9CFDE] max-w-2xl">
            Thank you for spending part of your Friday morning on the adults who get
            forgotten. Everything on this page is free because you were at the conference.
            No catch, and nothing that turns into a bill later.
          </p>

          <p className="text-sm text-[#8892AC] mt-6 pt-4 border-t border-[#38446A] max-w-2xl">
            Someone forwarded you this? You are welcome to all of it too. It was built for
            the people at the session, but we are not going to make you prove you were there.
          </p>
        </div>
      </section>

      {/* Gifts */}
      <section className="py-14" style={{ backgroundColor: '#FFF8E7' }}>
        <div className="max-w-3xl mx-auto px-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] mb-3" style={{ color: NAVY, opacity: 0.65 }}>
            Your gifts
          </p>
          <h2 className="font-serif text-3xl font-semibold mb-3" style={{ color: NAVY }}>
            Yours to keep
          </h2>

          <div className="grid gap-4 mt-7">
            <div className="bg-white border border-[#E0E0DA] rounded-md p-6 md:flex md:items-center md:gap-6" style={{ borderLeft: `4px solid ${YELLOW}` }}>
              <div className="flex-1">
                <h3 className="font-serif text-xl font-semibold mb-2" style={{ color: NAVY }}>
                  The five moves, and everything else, on four pages
                </h3>
                <p className="text-[15px] mb-2">
                  What to do if you run professional learning, what to ask for if you do
                  not, five questions worth answering for yourself, and the twenty tools
                  educators actually reach for.
                </p>
                <p className="font-mono text-[11px] uppercase tracking-wider text-[#6B7079]">
                  No email. No account. Just the file.
                </p>
              </div>
              <a
                href="/downloads/the-five-moves-brcc.pdf"
                className="inline-block mt-4 md:mt-0 font-bold text-[15px] rounded-md px-6 py-3 whitespace-nowrap"
                style={{ backgroundColor: YELLOW, color: '#241B00' }}
              >
                Download
              </a>
            </div>

            <div className="bg-white border border-[#E0E0DA] rounded-md p-6" style={{ borderLeft: `4px solid ${YELLOW}` }}>
              <h3 className="font-serif text-xl font-semibold mb-2" style={{ color: NAVY }}>
                Somebody checking on you in three weeks
              </h3>
              <p className="text-[15px] mb-4">
                The whole session argued that the failure is nobody following up. So we will
                follow up. One email, three weeks from now, asking how it went. That is the
                entire list.
              </p>

              {state === 'done' ? (
                <p className="text-[15px] font-semibold" style={{ color: '#1F6153' }}>
                  {message}
                </p>
              ) : (
                <form onSubmit={submit} className="flex flex-wrap gap-2">
                  <label htmlFor="brcc-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="brcc-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@school.org"
                    className="flex-1 min-w-[220px] border border-[#CFCFC6] rounded-md px-4 py-3 text-[15px] bg-white text-[#2D2D2D]"
                  />
                  <button
                    type="submit"
                    disabled={state === 'sending'}
                    className="rounded-md px-6 py-3 font-semibold text-[15px] text-white disabled:opacity-60"
                    style={{ backgroundColor: NAVY }}
                  >
                    {state === 'sending' ? 'Saving...' : 'Send me the check in'}
                  </button>
                </form>
              )}

              {state === 'error' && (
                <p className="text-[14px] mt-3" style={{ color: '#98352C' }} role="alert">
                  {message}
                </p>
              )}

              {state !== 'done' && (
                <p className="text-[13px] text-[#6B7079] mt-3">One message, once. Not a newsletter.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* The gap. Navy band, because the brand yellow only clears 3:1 contrast
          on a dark surface. Both bars carry direct labels, so identity never
          depends on colour alone. */}
      <section style={{ backgroundColor: NAVY }} className="py-14 text-white">
        <div className="max-w-3xl mx-auto px-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] mb-3" style={{ color: YELLOW }}>
            Why the five moves and not better content
          </p>
          <h2 className="font-serif text-3xl font-semibold mb-4 text-white">
            How much training actually reaches a classroom
          </h2>
          <p className="text-[16px] leading-relaxed text-[#C9CFDE] mb-9 max-w-2xl">
            Teach somebody a skill in a workshop, then go and measure whether it shows up in
            their practice. Almost none of it does. Add sustained coaching in the real
            setting and almost all of it does.
          </p>

          <div className="space-y-7">
            <div>
              <div className="flex items-baseline justify-between mb-2 gap-4">
                <span className="text-[15px] text-white">Training alone</span>
                <span className="font-mono text-[20px] font-bold" style={{ color: LIGHT_BLUE }}>
                  5 to 10%
                </span>
              </div>
              <div className="h-3 rounded-sm" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                <div className="h-3 rounded-sm" style={{ width: '8%', backgroundColor: BLUE }} />
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-2 gap-4">
                <span className="text-[15px] text-white">Training plus sustained coaching</span>
                <span className="font-mono text-[20px] font-bold" style={{ color: YELLOW }}>
                  Above 90%
                </span>
              </div>
              <div className="h-3 rounded-sm" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                <div className="h-3 rounded-sm" style={{ width: '92%', backgroundColor: YELLOW }} />
              </div>
            </div>
          </div>

          <p className="text-[13px] text-[#8892AC] mt-8 pt-4 border-t border-[#38446A]">
            Joyce, B. and Showers, B. <em>Student Achievement Through Staff Development.</em>{' '}
            Replicated since the early 1980s. The gap is not about content, budget or the
            speaker. It is about what happens in the two weeks after.
          </p>
        </div>
      </section>

      {/* Five moves */}
      <section className="py-14">
        <div className="max-w-3xl mx-auto px-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] mb-3" style={{ color: NAVY, opacity: 0.65 }}>
            A reminder
          </p>
          <h2 className="font-serif text-3xl font-semibold mb-3" style={{ color: NAVY }}>
            The five moves
          </h2>
          <p className="text-[17px] text-[#2D2D2D] mb-7 max-w-2xl">
            Every one is a calendar decision rather than a budget decision. Not one of them
            requires new money.
          </p>

          <div className="border-t border-[#E0E0DA]">
            {MOVES.map((m) => (
              <div key={m.n} className="grid grid-cols-[36px_1fr] gap-x-4 py-5 border-b border-[#E0E0DA]">
                <span className="font-mono text-[13px] font-bold pt-1" style={{ color: YELLOW }}>
                  {m.n}
                </span>
                <div>
                  <h3 className="font-serif text-xl font-semibold mb-2" style={{ color: NAVY }}>
                    {m.title}
                  </h3>
                  <p className="text-[15px] mb-3">{m.body}</p>
                  <p
                    className="text-[14px] text-[#6B7079] pl-3"
                    style={{ borderLeft: `3px solid ${YELLOW}` }}
                  >
                    <b className="text-[#2D2D2D]">The test.</b> {m.test}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className="py-14" style={{ backgroundColor: '#F2F2EE' }}>
        <div className="max-w-3xl mx-auto px-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] mb-3" style={{ color: NAVY, opacity: 0.65 }}>
            More to explore
          </p>
          <h2 className="font-serif text-3xl font-semibold mb-3" style={{ color: NAVY }}>
            The twenty most used
          </h2>
          <p className="text-[17px] text-[#2D2D2D] mb-6 max-w-2xl">
            Ranked by what people open and save in our library, not by what we would like to
            sell you.
          </p>

          <div className="grid sm:grid-cols-2 gap-x-8 bg-white border border-[#E0E0DA] rounded-md px-6 py-2">
            {TOOLS.map((t, i) => (
              <div key={t.title} className="grid grid-cols-[26px_1fr] gap-x-2 py-2.5 border-b border-[#EFEFE9] items-baseline">
                <span className="font-mono text-[11px] text-[#99A0A8]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-[14.5px] leading-snug text-[#2D2D2D]">
                  <b className="font-semibold">{t.title}</b>
                  {t.roles.map((r) => (
                    <span
                      key={r}
                      className="font-mono text-[9px] tracking-wider ml-1.5 px-1.5 py-0.5 rounded align-middle"
                      style={{
                        backgroundColor: r === 'PARA' ? YELLOW : LIGHT_BLUE,
                        color: NAVY,
                      }}
                    >
                      {r}
                    </span>
                  ))}
                </p>
              </div>
            ))}
          </div>

          {/* 13 of 20, as countable units. Each square carries a navy hairline so
              the shape reads on a light surface regardless of fill contrast. */}
          <div className="mt-7 bg-white border border-[#E0E0DA] rounded-md p-6">
            <div className="sm:flex sm:items-center sm:gap-7">
              <div className="flex-none mb-4 sm:mb-0">
                <span className="font-serif text-5xl font-semibold leading-none" style={{ color: NAVY }}>
                  13
                </span>
                <span className="font-serif text-2xl" style={{ color: NAVY, opacity: 0.5 }}>
                  {' '}of 20
                </span>
              </div>
              <div>
                <div className="flex flex-wrap gap-1.5 mb-3" role="img" aria-label="Thirteen of the twenty most used tools are built for paraprofessionals and support staff">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <span
                      key={i}
                      className="w-5 h-5 rounded-sm"
                      style={{
                        backgroundColor: i < 13 ? YELLOW : LIGHT_BLUE,
                        border: `1px solid ${NAVY}22`,
                      }}
                    />
                  ))}
                </div>
                <p className="text-[14.5px] text-[#3E4148]">
                  of the most used tools are built for{' '}
                  <b style={{ color: NAVY }}>paraprofessionals and support staff</b>. That is
                  not curation. It is what the usage data says.
                </p>
              </div>
            </div>
          </div>

          <p className="text-[13px] text-[#6B7079] mt-4">
            <a href="/hub" className="underline underline-offset-4" style={{ color: NAVY }}>
              Browse the library
            </a>
            . Opening a tool needs a Hub account, so the four page handout above stays the
            version with nothing in the way.
          </p>

          <h3 className="font-serif text-2xl font-semibold mt-10 mb-2" style={{ color: NAVY }}>
            And the games, because practice beats reading
          </h3>
          <p className="text-[15px] mb-4">
            Short scenario games staff can run alone or in a staff meeting. Twenty six in
            total, and Classroom Scenario Shuffle is the most saved item in the whole library.
          </p>
          <div className="grid sm:grid-cols-3 gap-x-6">
            {GAMES.map((g) => (
              <div key={g.title} className="py-2.5 border-b border-[#E0E0DA]">
                <b className="block text-[14.5px] font-semibold text-[#2D2D2D] leading-snug">
                  {g.title}
                </b>
                <em className="not-italic font-mono text-[11px] text-[#99A0A8]">{g.mins}</em>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Straight answer */}
      <section className="py-14">
        <div className="max-w-3xl mx-auto px-6">
          <div className="pl-5" style={{ borderLeft: '3px solid #E0E0DA' }}>
            <p className="font-mono text-[11.5px] uppercase tracking-[0.13em] text-[#6B7079] font-semibold mb-3">
              A straight answer about what is inside
            </p>
            <p className="text-[15px] text-[#6B7079] mb-3">
              This is <b className="text-[#2D2D2D]">not a trauma curriculum or an SEL program</b>,
              and we would rather say that here than have you find out after signing up.
            </p>
            <p className="text-[15px] text-[#6B7079]">
              What it is: practical development for the adults standing closest to the kids.
              There is real de-escalation, regulation and behavior material in there, and it
              is written for the person in the hallway rather than for a training day. If you
              came looking for a trauma framework, that is not us yet.
            </p>
          </div>
        </div>
      </section>

      {/* Who this came from */}
      <section className="pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-white border border-[#E0E0DA] rounded-md p-6 sm:flex sm:gap-6 sm:items-start">
            <Image
              src="/team/rae-hughart.jpg"
              alt="Rae Hughart"
              width={96}
              height={96}
              className="rounded-full object-cover w-20 h-20 flex-none mb-4 sm:mb-0"
            />
            <div className="min-w-0">
              <h3 className="font-serif text-xl font-semibold mb-1" style={{ color: NAVY }}>
                Rae Hughart
              </h3>
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] mb-3" style={{ color: NAVY, opacity: 0.55 }}>
                Founder, Teachers Deserve It
              </p>
              <p className="text-[15px] mb-4">
                Rae grew up on an IEP, and the people who got her through were a special
                education teacher and a series of paraprofessionals. Nobody had trained
                them to do the part that mattered most. That is why she spends her time on
                the adults standing closest to the kids.
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-[14px]">
                <a href="https://www.linkedin.com/in/rae-hughart/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4" style={{ color: NAVY }}>
                  LinkedIn
                </a>
                <a href="https://www.instagram.com/raehughart/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4" style={{ color: NAVY }}>
                  Instagram
                </a>
                <a href="https://raehughart.substack.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4" style={{ color: NAVY }}>
                  Read the newsletter
                </a>
                <a href="/about" className="underline underline-offset-4" style={{ color: NAVY }}>
                  Meet the rest of the team
                </a>
              </div>
              <p className="text-[14px] text-[#6B7079] mt-4">
                Questions, or want to talk about what this looks like in your building?{' '}
                <a href="mailto:hello@teachersdeserveit.com" className="underline underline-offset-4" style={{ color: NAVY }}>
                  hello@teachersdeserveit.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
