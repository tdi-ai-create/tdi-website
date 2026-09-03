import Link from 'next/link';
import './love-notes.css';

export default function LoveNotesPage() {
  return (
    <div className="ln-page">
      {/* SECTION 1: Hero */}
      <header className="ln-hero">
        <div className="ln-wrap">
          <p className="ln-kicker ln-kicker-light">Only in a Blueprint partnership</p>
          <h1>Every teacher we observe gets a Love Note.</h1>
          <p className="ln-sub">
            Not a score. Not a rubric. A note naming three to five specific things we watched them
            do well, sent after we have been in their classroom.
          </p>
          <div className="ln-flags">
            <div className="ln-flag">
              <b>The thing schools ask us for most</b>
              <span>More districts ask about Love Notes than any other part of a partnership.</span>
            </div>
            <div className="ln-flag">
              <b>Two to three visits a year</b>
              <span>Enough for staff to feel it as a rhythm rather than a one-off.</span>
            </div>
          </div>
        </div>
      </header>

      {/* SECTION 2: The rules */}
      <section className="ln-sec">
        <div className="ln-wrap">
          <div className="ln-grid">
            <div>
              <p className="ln-kicker">What makes it a Love Note</p>
              <h2>Five rules, every time.</h2>
              <p className="ln-lede">
                These are not a description written for a website. They are the rules the notes are
                actually written to.
              </p>
              <ul className="ln-rules">
                <li>Addressed to the teacher by first name</li>
                <li>Three to five specific moments we watched, never generic praise</li>
                <li>Warm and personal. Never evaluative, never a rubric</li>
                <li>Ends with one or two Hub resources for what they are already doing</li>
                <li>150 to 250 words</li>
              </ul>
              <p className="ln-note">
                Observations are separate from evaluation. Nothing in a Love Note reaches an
                appraisal, and a teacher is never compared to a colleague.
              </p>
            </div>

            <div>
              <p className="ln-kicker">What lands in their inbox</p>
              <div className="ln-mail">
                <div className="ln-mailhead">
                  <div><b>From</b> Teachers Deserve It &lt;hello@teachersdeserveit.com&gt;</div>
                  <div><b>To</b> d.reyes@example.k12.us</div>
                  <div><b>Subject</b> A note from your visit</div>
                </div>
                <div className="ln-mailbody">
                  <div className="ln-mailhdr">
                    <h3>A note from your visit</h3>
                    <p>Tuesday, 14 October</p>
                  </div>
                  <p>Hi Danielle,</p>
                  <p>
                    I spent about twenty minutes in your room during small group rotations and left
                    with a full page of notes.
                  </p>
                  <p>
                    When Marcus started to drift, you moved beside him and dropped your voice
                    instead of calling across the room. He came back on his own, and the other
                    students never looked up. That is not a small thing. Most of us learn to
                    redirect loudly long before we learn to redirect quietly.
                  </p>
                  <p>
                    Your materials were pre-sorted by group before the block started. Watching the
                    transition, that saved you close to three minutes, and more than the time, your
                    students knew exactly where to go without asking you.
                  </p>
                  <p>
                    You gave the two-choice out to a student who was stuck, and then you walked
                    away. You trusted them to take it. They did.
                  </p>
                  <p>
                    Near the end you asked a student to explain their thinking to the group rather
                    than confirming the answer yourself. That is the harder version of checking for
                    understanding, and you made it look ordinary.
                  </p>
                  <p>
                    If you want more in this direction, two things in the Hub are worth your time:
                    The 2-Minute Reset, and Questioning That Gets Past One-Word Answers.
                  </p>
                  <p>Thank you for letting me be in your room.</p>
                  <div className="ln-sig">The team at Teachers Deserve It</div>
                </div>
              </div>
              <p className="ln-caption">
                Example note. The teacher, school and date are invented. The format, sender, subject
                line and signature are exactly what sends.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: What the leader sees */}
      <section className="ln-sec ln-sec-alt">
        <div className="ln-wrap">
          <div className="ln-head">
            <p className="ln-kicker">What a leader sees</p>
            <h2>The teacher gets the note. You get the pattern.</h2>
            <p className="ln-lede">
              Every observation is tagged as it is written, so a visit produces something a
              principal can act on rather than an impression. The tags never appear in the
              teacher&apos;s email.
            </p>
          </div>

          <div className="ln-tagblock">
            <div>
              <h4>Strategies we look for</h4>
              <div className="ln-tags">
                <span>Proximity</span>
                <span>Small Group Facilitation</span>
                <span>De-escalation</span>
                <span>Checking for Understanding</span>
                <span>Routine Building</span>
                <span>Communication with Teacher</span>
                <span>Student Engagement</span>
                <span>Differentiation</span>
                <span>Positive Reinforcement</span>
                <span>Hub Content in Action</span>
                <span>Independent Initiative</span>
                <span>Questioning Techniques</span>
              </div>
            </div>
            <div>
              <h4>Growth we name</h4>
              <div className="ln-tags ln-tags-alt">
                <span>Saw Confidence</span>
                <span>Saw Independence</span>
                <span>Saw Collaboration</span>
                <span>Saw Hub Content Applied</span>
                <span>Saw Student Responsiveness</span>
                <span>Saw Reflection and Self-Awareness</span>
              </div>
            </div>
          </div>

          <p className="ln-note ln-note-wide">
            Across a visit these roll up into coaching themes and key wins on your leadership
            dashboard, alongside a summary written for a board packet.
          </p>
        </div>
      </section>


      {/* SECTION: What changes after a visit */}
      <section className="ln-sec">
        <div className="ln-wrap">
          <div className="ln-head">
            <p className="ln-kicker">What changes after a visit</p>
            <h2>A note lands, and the week looks different.</h2>
            <p className="ln-lede">
              Both charts below are example data, shown at the size and shape a leader would see
              them on their dashboard. We have not yet run enough observation visits through the
              system to publish measured figures, and we would rather say that than round it.
            </p>
          </div>

          <div className="ln-grid">
            <div className="ln-chart">
              <h4>Hub activity, the two weeks either side of a visit</h4>
              <p>A Love Note ends with one or two Hub resources, so the visit tends to pull staff back into the thing they already have.</p>
              <svg viewBox="0 0 520 210" width="100%" role="img" aria-label="Bar chart of weekly Hub sessions across four weeks, rising in the two weeks after a visit day.">
                <line x1="44" y1="20" x2="44" y2="168" stroke="#E2E5EA" strokeWidth="1" />
                <line x1="44" y1="168" x2="505" y2="168" stroke="#E2E5EA" strokeWidth="1" />
                <g fill="#5A6273" fontFamily="Inter, sans-serif" fontSize="11">
                  <text x="10" y="26">40</text>
                  <text x="10" y="99">20</text>
                  <text x="16" y="172">0</text>
                </g>
                <rect x="70" y="121" width="72" height="47" fill="#80a4ed" rx="3" />
                <rect x="178" y="114" width="72" height="54" fill="#80a4ed" rx="3" />
                <rect x="286" y="52" width="72" height="116" fill="#1e2749" rx="3" />
                <rect x="394" y="74" width="72" height="94" fill="#1e2749" rx="3" />
                <line x1="268" y1="20" x2="268" y2="168" stroke="#ffba06" strokeWidth="2" strokeDasharray="5 4" />
                <text x="272" y="32" fill="#B0651F" fontFamily="Inter, sans-serif" fontSize="11" fontWeight="700">visit day</text>
                <g fill="#5A6273" fontFamily="Inter, sans-serif" fontSize="11.5">
                  <text x="82" y="186">2 wks before</text>
                  <text x="196" y="186">1 wk before</text>
                  <text x="306" y="186">1 wk after</text>
                  <text x="414" y="186">2 wks after</text>
                </g>
              </svg>
              <p className="ln-caption">Example data. Navy bars are the weeks following the visit.</p>
            </div>

            <div className="ln-chart">
              <h4>Feeling of support, across a year with three visits</h4>
              <p>The vibe check runs weekly regardless. On a Blueprint you can see what a visit does to it, and whether it holds.</p>
              <svg viewBox="0 0 520 210" width="100%" role="img" aria-label="Line chart of staff feeling of support across a school year, stepping up after each of three visit days and holding.">
                <line x1="44" y1="20" x2="44" y2="168" stroke="#E2E5EA" strokeWidth="1" />
                <line x1="44" y1="168" x2="505" y2="168" stroke="#E2E5EA" strokeWidth="1" />
                <g fill="#5A6273" fontFamily="Inter, sans-serif" fontSize="11">
                  <text x="16" y="26">10</text>
                  <text x="22" y="99">5</text>
                  <text x="22" y="172">0</text>
                </g>
                <line x1="132" y1="20" x2="132" y2="168" stroke="#ffba06" strokeWidth="2" strokeDasharray="5 4" />
                <line x1="278" y1="20" x2="278" y2="168" stroke="#ffba06" strokeWidth="2" strokeDasharray="5 4" />
                <line x1="424" y1="20" x2="424" y2="168" stroke="#ffba06" strokeWidth="2" strokeDasharray="5 4" />
                <polyline fill="none" stroke="#1e2749" strokeWidth="3" strokeLinejoin="round"
                  points="60,128 96,124 132,120 168,92 204,95 240,99 278,94 314,70 350,74 386,78 424,72 460,54 496,58" />
                <g fill="#5A6273" fontFamily="Inter, sans-serif" fontSize="11.5">
                  <text x="96" y="186">Oct visit</text>
                  <text x="244" y="186">Jan visit</text>
                  <text x="392" y="186">Apr visit</text>
                </g>
              </svg>
              <p className="ln-caption">Example data. Gold dashed lines are visit days.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Where it fits */}
      <section className="ln-sec">
        <div className="ln-wrap">
          <div className="ln-head">
            <p className="ln-kicker">Where this fits</p>
            <h2>Love Notes come with a Blueprint.</h2>
            <p className="ln-lede">
              They require someone from our team to be in your classrooms, so they are the one thing
              the smaller offerings do not include. The Pulse, The Focus and The Cohort each stand
              alone and reach your staff a different way.
            </p>
          </div>

          <div className="ln-visit">
            <h4>What a visit day looks like</h4>
            <ul className="ln-rules">
              <li>Up to 15 classrooms observed in a single visit</li>
              <li>On-campus days happen while students are in session, in real classrooms</li>
              <li>We meet with teachers one-to-one after observing them</li>
              <li>A leadership debrief at the end of each day</li>
            </ul>
          </div>

          <div className="ln-btnrow">
            <Link className="ln-btn ln-btn-navy" href="/for-schools">
              See the four ways to work with us
            </Link>
            <Link className="ln-btn ln-btn-gold" href="/get-started">
              Get Your Free PD Plan
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
