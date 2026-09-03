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
            Not a score. Not a rubric. Everything specific we watched them do well, written down
            and sent after we have been in their classroom.
          </p>
          <div className="ln-flags">
            <div className="ln-flag">
              <span className="ln-pill">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11.5 2.5 14 8l6 .8-4.4 4.2 1.1 6-5.2-2.9L6.3 19l1.1-6L3 8.8 9 8z" /></svg>
                Most requested
              </span>
              <b>The thing schools ask us for most</b>
              <span className="ln-flag-body">More districts ask about Love Notes than any other part of a partnership.</span>
            </div>
            <div className="ln-flag">
              <span className="ln-pill">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m17 2 4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14" /><path d="m7 22-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" /></svg>
                Recommended
              </span>
              <b>Two to three visits a year</b>
              <span className="ln-flag-body">Enough for staff to feel it as a rhythm rather than a one-off.</span>
            </div>
          </div>
        </div>
      </header>

      {/* SECTION 2: The example note */}
      <section className="ln-sec ln-sec-alt">
        <div className="ln-wrap">
          <div className="ln-head">
            <p className="ln-kicker">What lands in their inbox</p>
            <h2>A real one, start to finish.</h2>
            <p className="ln-lede">
              Written after a visit, sent to the teacher, and nobody else. Hover any moment to see
              how it was tagged.
            </p>
          </div>

          <div className="ln-mailcol">
              <div className="ln-mailwrapouter">
                <div className="ln-mail">
                <div className="ln-mailhead">
                  <div className="ln-avatar" aria-hidden="true">TDI</div>
                  <div className="ln-mailfrom">
                    <b>Teachers Deserve It</b>
                    <span>hello@teachersdeserveit.com</span>
                  </div>
                  <div className="ln-mailmeta">Tue 14 Oct, 4:12 PM</div>
                </div>
                <div className="ln-mailsubject">
                  <span>Subject</span>A note from your visit
                </div>
                <div className="ln-mailscroll">
                <div className="ln-mailbody">
                  <p>Hi Danielle,</p>
                  <p>
                    Thanks for letting me pop in on Tuesday. You are an amazing teacher, and I want
                    you to see what I saw, because you were too busy doing it to notice.
                  </p>

                  <p className="ln-mail-h">Here is what I wrote down</p>
                  <ul className="ln-mail-list">
                    <li tabIndex={0} data-tags="Proximity, De-escalation">You moved beside Marcus and dropped your voice instead of calling across the room. He came back on his own.<span className="ln-tagtip">Tagged <b>Proximity, De-escalation</b></span></li>
                    <li tabIndex={0} data-tags="Routine Building">Materials were pre-sorted by group before the block started. The whole transition took under ninety seconds.<span className="ln-tagtip">Tagged <b>Routine Building</b></span></li>
                    <li tabIndex={0} data-tags="Independent Initiative, Student Engagement">You gave a stuck student the two-choice out, then walked away and let them take it.<span className="ln-tagtip">Tagged <b>Independent Initiative, Student Engagement</b></span></li>
                    <li tabIndex={0} data-tags="Checking for Understanding, Questioning Techniques">You asked a student to explain their thinking to the group rather than confirming the answer yourself.<span className="ln-tagtip">Tagged <b>Checking for Understanding, Questioning Techniques</b></span></li>
                    <li tabIndex={0} data-tags="Positive Reinforcement">You thanked a student for waiting. Out loud, in front of everyone.<span className="ln-tagtip">Tagged <b>Positive Reinforcement</b></span></li>
                  </ul>

                  <p className="ln-mail-h">Three things I heard</p>
                  <ul className="ln-mail-quotes">
                    <li>&ldquo;Can I show you the way I did it?&rdquo;<em>a student, unprompted, mid-rotation</em></li>
                    <li>&ldquo;I am not going to tell you the answer, but I will sit here while you find it.&rdquo;<em>you, at the red table</em></li>
                    <li>&ldquo;Just check the chart, that is what it is for.&rdquo;<em>one student to another</em></li>
                  </ul>

                  <p className="ln-mail-h">Two things in the Hub, if you want them</p>
                  <ul className="ln-mail-links">
                    <li>
                      <Link href="/hub/quick-wins/k-2-station-rotation-routines">K-2 Station Rotation Routines</Link>
                      <span>Because your transitions are already good and this is the version that survives a sub.</span>
                    </li>
                    <li>
                      <Link href="/hub/practice/question-knockout">Question Knockout</Link>
                      <span>Ten minutes, and it is built around exactly the move you made at the red table.</span>
                    </li>
                  </ul>

                  <p>
                    I am here all day if you want to talk any of this through. If today is not the
                    day, that is completely fine, catch me on the next visit or email whenever.
                    Either way, I am in your corner.
                  </p>
                  <div className="ln-sig">The team at Teachers Deserve It</div>
                </div>
                </div>
              </div>
              </div>
              <p className="ln-scrollhint">Scroll inside the note to read all of it.</p>
              <p className="ln-caption">
                Example note. The teacher, school and date are invented. The format, sender, subject
                line and signature are exactly what sends.
              </p>
              <p className="ln-caption ln-tagnote">
                Hover or tab through any moment above to see how it was tagged. Those tags never
                appear in the teacher&apos;s email. They roll up on your leadership dashboard into
                coaching themes and key wins, alongside a summary written for a board packet.
              </p>
          </div>
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

          <div className="ln-chartgrid">
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
      <section className="ln-sec ln-sec-alt">
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
