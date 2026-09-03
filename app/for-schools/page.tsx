import './for-schools.css';

export default function ForSchoolsPage() {
  return (
    <div className="fs-page">
      {/* HERO */}
      <header className="fs-hero">
        <div className="fs-wrap fs-hero-grid">
          <div>
            <h1>PD you can still defend in April.</h1>
            <p className="fs-sub">Four ways to work with TDI, from a single building to a full district partnership. Every one hands you a one-page result before the budget conversation, not a promise that one is coming.</p>
            <div className="fs-btnrow">
              <a className="fs-btn fs-btn-gold" href="#achieves">What a school gets out of this</a>
              <a className="fs-btn fs-btn-ghost" href="/get-started">Request a quote</a>
            </div>
            <p className="fs-hero-note">Working with us starts at $2,500 a year.</p>
          </div>
          <div className="fs-yearcard">
            <h4>The four ways</h4>
            <p className="fs-cap">Each one stands alone. None is a trial run for another.</p>
            <div className="fs-fourlist">
              <div className="fs-frow" style={{"--a": "#5FBDB8"} as React.CSSProperties}><b>The Pulse</b><span>A weekly three-second check on how staff are actually doing.</span></div>
              <div className="fs-frow" style={{"--a": "#E9A96A"} as React.CSSProperties}><b>The Focus</b><span>13 ready-built tools for the initiative you already chose.</span></div>
              <div className="fs-frow" style={{"--a": "#A99AD8"} as React.CSSProperties}><b>The Cohort</b><span>10 people, four sessions, measured before session one.</span></div>
              <div className="fs-frow" style={{"--a": "#F9B91B"} as React.CSSProperties}><b>The Blueprint</b><span>All of it, working as one system across the district.</span></div>
            </div>
          </div>
        </div>
      </header>

      {/* THE PROBLEM */}
      <section className="fs-sec fs-sec-white">
        <div className="fs-wrap">
          <div className="fs-head-narrow">
            <p className="fs-kicker">Why every one of these is built the same way</p>
            <h2>Most PD gets dropped in year two because nobody can prove it worked.</h2>
            <p className="fs-lede">Not because it failed. Because when the line item comes up in April, the only evidence is a survey nobody trusts and a memory of a good PD day in October. Every TDI offering is built backwards from that meeting.</p>
          </div>
          <div className="fs-stats">
            <div className="fs-stat"><b>$15–20K</b><span>Typical annual school PD spend</span></div>
            <div className="fs-stat"><b>10%</b><span>Industry implementation rate</span></div>
            <div className="fs-stat"><b>74%</b><span>Implementation rate across TDI partners</span></div>
            <div className="fs-stat"><b>94%</b><span>Of teachers would recommend TDI</span></div>
          </div>
          <p style={{"fontSize": ".85rem", "color": "var(--muted)", "marginTop": "26px", "maxWidth": "76ch"}}>Implementation baseline: Joyce &amp; Showers (1980, 2002) found traditional sit-and-get PD produces 5–10% classroom transfer, and sustained coaching models produce 80–90%. TDI’s 74% reflects real partner data inside that range.</p>
        </div>
      </section>

      {/* WHAT A SCHOOL ACHIEVES */}
      <section className="fs-sec" id="achieves">
        <div className="fs-wrap">
          <div className="fs-head-narrow">
            <p className="fs-kicker">What this is for</p>
            <h2>10 things a school gets out of working with us.</h2>
            <p className="fs-lede">Sorted by what your building achieves rather than by what we deliver. The four offerings below are different routes into this list. The Blueprint is all of it at once.</p>
          </div>
          <div className="fs-ocgrid">
            <div className="fs-oc">
              <span className="fs-ocicon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></span>
              <h4>Teacher time back</h4>
              <p>Find a resource at the moment of need instead of waiting for the next PD day. Borrow a colleague&apos;s work instead of building from scratch. Stop rebuilding what another teacher in the district already made.</p>
              <span className="fs-via">Cohort, Blueprint</span>
            </div>
            <div className="fs-oc">
              <span className="fs-ocicon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/></svg></span>
              <h4>Stress relief</h4>
              <p>Lighten the daily load with small practical changes rather than new initiatives. Support between formal PD days, not only on the calendar. An end to being the only person in your role in the building.</p>
              <span className="fs-via">Pulse, Cohort, Blueprint</span>
            </div>
            <div className="fs-oc">
              <span className="fs-ocicon" aria-hidden="true"><svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></span>
              <h4>Staff culture monitoring</h4>
              <p>Take the pulse of staff across five areas in under two minutes per person. Watch culture trend across a year instead of guessing. Surface honest input without asking staff to say it to a leader&apos;s face.</p>
              <span className="fs-via">Pulse, Blueprint</span>
            </div>
            <div className="fs-oc">
              <span className="fs-ocicon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span>
              <h4>Retention and staff investment</h4>
              <p>Identify what is driving staff to stay or leave, area by area. Show staff that their input produced visible change. Track retention risk with data rather than instinct.</p>
              <span className="fs-via">Pulse, Cohort, Blueprint</span>
            </div>
            <div className="fs-oc">
              <span className="fs-ocicon" aria-hidden="true"><svg viewBox="0 0 24 24"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg></span>
              <h4>Instructional growth</h4>
              <p>See what is actually happening in classrooms instead of assuming. Name what is already working before naming what is not. Set goals staff believe are achievable.</p>
              <span className="fs-via">Focus, Cohort, Blueprint</span>
            </div>
            <div className="fs-oc">
              <span className="fs-ocicon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/></svg></span>
              <h4>New teacher support</h4>
              <p>Ramp new hires without pulling veteran staff off their own work. Give first-year teachers on-demand answers at the moment of confusion. Provide feedback that is not attached to evaluation.</p>
              <span className="fs-via">Cohort, Blueprint</span>
            </div>
            <div className="fs-oc">
              <span className="fs-ocicon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg></span>
              <h4>Leadership capacity</h4>
              <p>Think through decisions with someone outside the building. Prepare for the conversations that keep getting postponed. Decide which PD to say no to.</p>
              <span className="fs-via">Cohort, Blueprint</span>
            </div>
            <div className="fs-oc">
              <span className="fs-ocicon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg></span>
              <h4>PD coherence</h4>
              <p>Map the PD already in place and see where it overlaps. Identify the real gaps instead of stacking on another initiative. Fit development into the existing calendar rather than on top of it.</p>
              <span className="fs-via">Focus, Blueprint</span>
            </div>
            <div className="fs-oc">
              <span className="fs-ocicon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg></span>
              <h4>Collaboration and shared practice</h4>
              <p>Share materials across grades, buildings and roles without adding a meeting. Keep staff work in the system when people leave the district. Build a shared library that grows every year instead of resetting.</p>
              <span className="fs-via">Cohort, Blueprint</span>
            </div>
            <div className="fs-oc">
              <span className="fs-ocicon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg></span>
              <h4>Proof and budget defense</h4>
              <p>Turn qualitative work into numbers. Show a superintendent or board what changed and by how much. Defend the line item with evidence when budget season arrives.</p>
              <span className="fs-via">All four</span>
            </div>
          </div>
        </div>
      </section>

      {/* FOUR WAYS TO GET THERE */}
      <section className="fs-sec fs-sec-white" id="offerings">
        <div className="fs-wrap">
          <div className="fs-head-narrow">
            <p className="fs-kicker">Four ways to get there</p>
            <h2>Pick the one that matches the problem you would name first.</h2>
            <p className="fs-lede">Each one stands alone. A school with a culture problem and a school losing new teachers need different things, and neither has to buy the other first. Every card below is written as what a leader can say by March.</p>
          </div>
          <div className="fs-offer-grid">

            <article className="fs-offer" style={{"--c": "var(--pulse)"} as React.CSSProperties}>
              <h3>The Pulse</h3>
              <p className="fs-who">For the leader who cannot tell how staff are actually doing until someone resigns.</p>
              <p className="fs-ican-h">What a leader can say by March</p>
              <ul className="fs-ican"><li>I can see where my staff are struggling, dimension by dimension, and whether it is improving or sliding week to week</li><li>I can find out what my staff are actually asking for, ranked</li><li>I can find out which grade levels or roles are carrying the problem</li><li>I can know whether my numbers are normal for a school like mine</li><li>I can close the loop with staff without writing it myself, and show leadership something quantitative</li></ul>
              <div className="fs-mech">
                <b>How it runs.</b> One question every Tuesday, three seconds to answer, rotating through Mood, Energy, Belonging, Purpose and Needs. Delivered by email, outside the hub, so no account is required.
                <br /><b>How it is measured.</b> Movement across the five areas, what staff ask for under Needs ranked month to month, and weekly response rate.
              </div>
              <div className="fs-foot"><a className="fs-go" href="/get-started">Request a quote</a></div>
            </article>

            <article className="fs-offer" style={{"--c": "var(--focus)"} as React.CSSProperties}>
              <h3>The Focus</h3>
              <p className="fs-who">For the district already committed to an initiative with nothing practical behind it.</p>
              <p className="fs-ican-h">What a leader can say by March</p>
              <ul className="fs-ican"><li>I can put real tools behind the initiative I already committed to</li><li>I can see whether my staff are actually using what we send</li><li>I can find out which parts of our focus staff are struggling with most</li><li>I can catch a focus that is not working in November instead of June</li><li>I can add support without adding a meeting, a PD day, or a new priority</li><li>I can get told what to do next instead of handed another dashboard to interpret</li><li>I can sit down twice a year with someone outside the building and decide what to change</li></ul>
              <div className="fs-mech">
                <b>How it runs.</b> You name the area your district is already working on. 13 tools across the year, one every three weeks, built for it and sent inside the email with a printable version underneath. All 13 dates are set when you sign. One tap back: planning it, skipping it, or want help. Two 45-minute sessions with your leadership team, mid-November and early March, both booked at signing. Those two conversations are your whole time commitment for the year.
                <br /><b>How it is measured.</b> Planned-use rate across the year, skip rate by tool and by group, and the volume and clustering of help requests.
              </div>
              <div className="fs-foot"><a className="fs-go" href="/get-started">Request a quote</a></div>
            </article>

            <article className="fs-offer" style={{"--c": "var(--cohort)"} as React.CSSProperties}>
              <h3>The Cohort</h3>
              <p className="fs-who">For the group carrying the most and getting the least. Paras, new teachers, whoever you would name.</p>
              <p className="fs-ican-h">What a leader can say by March</p>
              <ul className="fs-ican"><li>I can give a specific group real support instead of hoping they figure it out</li><li>I can see whether that group moved from where they started</li><li>I can tell whether the people I invested in actually stayed</li><li>I can support paras or new teachers without building a program myself</li><li>I can point to a number when someone asks whether it worked</li></ul>
              <div className="fs-mech">
                <b>How it runs.</b> You choose who is in it. 10 standard, 15 maximum, from one building or across a district. Four virtual sessions shaped to that group, full hub and paid blog access all year, optional office hours, and a named team member they can email directly.
                <br /><b>How it is measured.</b> Retention within the cohort, stress and feeling of support measured at baseline and again in March, hub implementation rate, and session attendance.
              </div>
              <div className="fs-foot"><a className="fs-go" href="/get-started">Request a quote</a></div>
            </article>
          </div>

          <div className="fs-blueprint-band">
            <div>
              <h3>The Blueprint</h3>
              <p className="fs-per" style={{"margin": "6px 0 14px"}}>Scoped to your district</p>
              <p style={{"color": "var(--muted)", "fontSize": ".98rem"}}>The hub, leadership coaching, classroom observations, the vibe check, the dashboard and the blog, working as one system. It is the only one that reaches all 10 outcomes above, because it is the only one with people in your buildings.</p>
              <div className="fs-phases">
                <div className="fs-phase"><b>Ignite</b><span>Leadership team and a pilot group of 10 to 25 educators. Early wins.</span></div>
                <div className="fs-phase"><b>Accelerate</b><span>Full staff. Strategies get implemented school-wide.</span></div>
                <div className="fs-phase"><b>Sustain</b><span>Systems hold through turnover. You run it yourselves.</span></div>
              </div>
              <p style={{"fontSize": ".86rem", "color": "var(--muted)", "marginTop": "16px"}}>The three phases are how a Blueprint partnership unfolds over time. They are not a ladder the other offerings sit on.</p>
            </div>
            <div>
              <a className="fs-btn fs-btn-navy" href="/get-started">Request a quote</a>
            </div>
          </div>

          <div className="fs-notladder">These are not steps. The Pulse, The Focus and The Cohort are not smaller versions of the Blueprint or trial runs for it. Schools run one of them for years without ever buying anything else.</div>

          <div className="fs-tablewrap">
            <table>
              <caption className="fs-sr">Comparison of the four TDI offerings</caption>
              <thead><tr><th scope="col">&nbsp;</th><th scope="col">The Pulse</th><th scope="col">The Focus</th><th scope="col">The Cohort</th><th scope="col">The Blueprint</th></tr></thead>
              <tbody>
                <tr><th scope="row">Who it reaches</th><td>All staff</td><td>All staff</td><td>10 to 15 named people</td><td>Whole district</td></tr>
                <tr><th scope="row">Ask of staff</th><td>3 seconds, weekly</td><td>One tap, monthly</td><td>Four sessions a year</td><td>Varies by phase</td></tr>
                <tr><th scope="row">Live team time</th><td>None</td><td>Two leadership sessions</td><td>Yes, with staff</td><td>Yes</td></tr>
                <tr><th scope="row">Hub access</th><td>No</td><td>No</td><td>Yes, all members</td><td>Yes, all staff</td></tr>
                <tr><th scope="row">Outcomes it reaches</th><td>Culture, retention, stress</td><td>Coherence, instructional growth</td><td>New teachers, instructional growth, collaboration, retention</td><td><b>All 10</b></td></tr>
                <tr><th scope="row">March proof report</th><td>Yes</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
              </tbody>
            </table>
          </div>
          <p style={{"fontSize": ".85rem", "color": "var(--muted)", "marginTop": "14px"}}>The outcomes row maps each offering to the list above. It is our reading of which route reaches which outcome, not a contractual guarantee.</p>
        </div>
      </section>

      {/* WHAT WE ACTUALLY DO */}
      <section className="fs-sec">
        <div className="fs-wrap">
          <div className="fs-head-narrow">
            <p className="fs-kicker">What we actually do</p>
            <h2>You are not buying software. Somebody reads your data and tells you what to do about it.</h2>
            <p className="fs-lede">The delivery is automated so it never depends on a facilitator showing up. The thinking is not. Here is the work that happens on our side of it.</p>
          </div>
          <div className="fs-grid3">
            <div className="fs-card">
              <h4>We read it every month and write the report</h4>
              <p>Not a dashboard for you to interpret. One suggested move, with alternates underneath, generated from your own response data. Nothing for your team to assemble.</p>
            </div>
            <div className="fs-card">
              <h4>We build the tools for the area you named</h4>
              <p>You do not pick from a library. The tools are built for your focus, already prepped, print first, with an entry point simple enough that a teacher can use one without planning time.</p>
            </div>
            <div className="fs-card">
              <h4>We write the copy that closes the loop with staff</h4>
              <p>Monthly newsletter language drawn from what your own people said, so they can see their input went somewhere. Edit it and send it.</p>
            </div>
            <div className="fs-card">
              <h4>We measure before we start</h4>
              <p>For a cohort, retention, stress and feeling of support are measured before the first session. That is what makes the change across the year proof rather than a claim.</p>
            </div>
            <div className="fs-card">
              <h4>We tell you what it cannot tell you</h4>
              <p>Every report carries one honest line naming what the data still does not show. Three weeks of a dip is not enough to know whether it is workload or one grade band, and we say so rather than rounding it into a finding.</p>
            </div>
            <div className="fs-card">
              <h4>We go get the money</h4>
              <p>We find the funding, write the grant, and build the evidence the application needs, so outside money covers what your own budget cannot. Helping you get it costs you nothing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: What a leader can prove with it, carried from the retired /learning */}
      <section className="fs-sec fs-sec-white">
        <div className="fs-wrap">
          <div className="fs-head-narrow">
            <p className="fs-kicker">Included with every offering</p>
            <h2>The evidence assembles itself.</h2>
            <p className="fs-lede">
              Everything your staff do in the Hub flows into your dashboard. Popular topics, survey
              responses, what got submitted. Board-ready and audit-ready, without your team building
              a spreadsheet the week before a meeting.
            </p>
          </div>

          <div className="fs-grid2 fs-align-start" style={{"marginTop": "34px"}}>
            <div>
              <h3 style={{"fontSize": "1.15rem", "marginBottom": "14px"}}>What it is built to survive</h3>
              <ul className="fs-ican" style={{"marginBottom": "0"}}>
                <li>A board presentation, in a format that pastes into someone else&apos;s deck</li>
                <li>A grant application, and the renewal evidence a funder asks for</li>
                <li>State accountability and compliance documentation</li>
                <li>An accreditation review</li>
                <li>Year over year continuous improvement documentation</li>
              </ul>
            </div>
            <div>
              <h3 style={{"fontSize": "1.15rem", "marginBottom": "14px"}}>What you can see</h3>
              <ul className="fs-ican" style={{"marginBottom": "0"}}>
                <li>Building-level dashboards with per-school drill-downs</li>
                <li>Classroom implementation rate tracking</li>
                <li>Observation timelines, on a Blueprint</li>
                <li>Leading indicators, before they become a resignation</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: In your building, Blueprint only */}
      <section className="fs-sec">
        <div className="fs-wrap">
          <div className="fs-head-narrow">
            <p className="fs-kicker">Only in a Blueprint</p>
            <h2>When we are actually in your building.</h2>
            <p className="fs-lede">The other three offerings reach your staff through their inbox. A Blueprint puts our people in your classrooms while students are in session. This is the part no other offering includes, and the part schools tell us they remember.</p>
          </div>

          <div className="fs-grid2 fs-align-start">
            <div>
              <h3 style={{"fontSize": "1.15rem", "marginBottom": "14px"}}>What a visit day looks like</h3>
              <ul className="fs-ican" style={{"marginBottom": "0"}}>
                <li>Up to 15 classrooms observed in a single visit</li>
                <li>On-campus days happen while students are in session, in real classrooms</li>
                <li>Observations are growth-focused, not evaluative, and separate from your appraisal process</li>
                <li>We meet with teachers one-to-one after observing them</li>
                <li>A leadership debrief at the end of each day</li>
              </ul>
            </div>
            <div>
              <h3 style={{"fontSize": "1.15rem", "marginBottom": "14px"}}>Love Notes</h3>
              <p style={{"fontSize": ".95rem", "color": "var(--muted)"}}>Every teacher we observe receives one. Not generic praise. A specific note about something we watched them do well.</p>
              <blockquote className="fs-lovenote">
                &ldquo;During your small group rotation today, I noticed how you used proximity and a calm voice to redirect Marcus without stopping instruction. The other students did not even look up. That is classroom management mastery. The way you had materials pre-sorted for each group saved at least 3 minutes of transition time. Your students knew exactly where to go and what to grab. Keep leaning into those systems.&rdquo;
              </blockquote>
              <p style={{"fontSize": ".9rem", "color": "var(--muted)", "marginTop": "14px"}}>Love Notes are what teachers tell us they remember months later. Not the PD slides. Not the data. The moment someone noticed what they were doing right.</p>
              <p style={{"marginTop": "14px"}}><a className="fs-go" href="/love-notes">Click to see how these notes are structured</a></p>
            </div>
          </div>
        </div>
      </section>

      <section className="fs-sec fs-sec-white">
        <div className="fs-wrap">
          <div className="fs-head-narrow">
            <p className="fs-kicker">What lands on your dashboard</p>
            <h2>Numbers a board understands, from questions staff answer in seconds.</h2>
            <p className="fs-lede">Every figure below is example data, shown at the size and shape you&apos;d actually see it.</p>
          </div>

          <div className="fs-grid2">
            <div>
              <h4 style={{"color": "var(--pulse)", "marginBottom": "6px"}}>Mood, week by week (The Pulse)</h4>
              <p style={{"fontSize": ".95rem", "color": "var(--muted)"}}>The late-October dip and the February slide are exactly what a quarterly survey averages away.</p>
              <svg viewBox="0 0 520 240" width="100%" role="img" aria-label="Line chart of staff mood across a school year, showing dips in late October and February.">
                <g stroke="#E2E5EA" strokeWidth="1">
                  <line x1="44" y1="30" x2="500" y2="30"/><line x1="44" y1="80" x2="500" y2="80"/>
                  <line x1="44" y1="130" x2="500" y2="130"/><line x1="44" y1="180" x2="500" y2="180"/>
                </g>
                <g fill="#5A6273" fontFamily="Inter, sans-serif" fontSize="11">
                  <text x="14" y="34">8</text><text x="14" y="84">6</text><text x="14" y="134">4</text><text x="14" y="184">2</text>
                </g>
                <polyline fill="none" stroke="#1F6F6B" strokeWidth="3" strokeLinejoin="round"
                  points="60,74 105,68 150,86 195,138 240,120 285,104 330,112 375,158 420,126 465,96 500,88"/>
                <g fill="#1F6F6B">
                  <circle cx="195" cy="138" r="5"/><circle cx="375" cy="158" r="5"/>
                </g>
                <line x1="44" y1="98" x2="500" y2="98" stroke="#F9B91B" strokeWidth="2" strokeDasharray="6 5"/>
                <g fill="#5A6273" fontFamily="Inter, sans-serif" fontSize="11.5">
                  <text x="52" y="212">AUG</text><text x="142" y="212">OCT</text><text x="232" y="212">DEC</text>
                  <text x="322" y="212">FEB</text><text x="412" y="212">APR</text>
                </g>
                <text x="44" y="232" fill="#5A6273" fontFamily="Inter, sans-serif" fontSize="11.5">Teal is your building. Gold dashed line is the benchmark.</text>
              </svg>
            </div>

            <div>
              <h4 style={{"color": "var(--focus)", "marginBottom": "6px"}}>Planned use, month by month (The Focus)</h4>
              <p style={{"fontSize": ".95rem", "color": "var(--muted)"}}>October&apos;s dip is the signal. A tool most of your building skips tells you the focus is wrong, or the tool is.</p>
              <svg viewBox="0 0 520 240" width="100%" role="img" aria-label="Bar chart of planned-use rate by month, dipping in October and recovering through the spring.">
                <g stroke="#E2E5EA" strokeWidth="1">
                  <line x1="44" y1="40" x2="500" y2="40"/><line x1="44" y1="90" x2="500" y2="90"/><line x1="44" y1="140" x2="500" y2="140"/>
                </g>
                <g fill="#5A6273" fontFamily="Inter, sans-serif" fontSize="11">
                  <text x="10" y="44">80%</text><text x="10" y="94">60%</text><text x="10" y="144">40%</text>
                </g>
                <g fill="#B0651F">
                  <rect x="58" y="55" width="38" height="135" rx="3"/>
                  <rect x="108" y="92" width="38" height="98" rx="3"/>
                  <rect x="158" y="70" width="38" height="120" rx="3"/>
                  <rect x="208" y="62" width="38" height="128" rx="3"/>
                  <rect x="258" y="48" width="38" height="142" rx="3"/>
                  <rect x="308" y="58" width="38" height="132" rx="3"/>
                  <rect x="358" y="43" width="38" height="147" rx="3"/>
                  <rect x="408" y="50" width="38" height="140" rx="3"/>
                </g>
                <rect x="108" y="92" width="38" height="98" rx="3" fill="none" stroke="#1E2A4A" strokeWidth="2" strokeDasharray="4 3"/>
                <g fill="#5A6273" fontFamily="Inter, sans-serif" fontSize="11.5">
                  <text x="63" y="208">SEP</text><text x="113" y="208">OCT</text><text x="163" y="208">NOV</text><text x="213" y="208">DEC</text>
                  <text x="263" y="208">JAN</text><text x="313" y="208">FEB</text><text x="363" y="208">MAR</text><text x="413" y="208">APR</text>
                </g>
                <text x="44" y="230" fill="#5A6273" fontFamily="Inter, sans-serif" fontSize="11.5">42 of 51 staff responded in November.</text>
              </svg>
            </div>
          </div>

          <div className="fs-grid2" style={{"marginTop": "56px"}}>
            <div>
              <h4 style={{"color": "var(--cohort)", "marginBottom": "6px"}}>Where they started against March (The Cohort)</h4>
              <p style={{"fontSize": ".95rem", "color": "var(--muted)"}}>Measured before the first session, so the change across the year is the proof.</p>
              <svg viewBox="0 0 520 210" width="100%" role="img" aria-label="Bar chart comparing September baseline to March results for feeling of support, stress, and intent to return.">
                <g fontFamily="Inter, sans-serif" fontSize="12.5" fill="#1E2A4A">
                  <text x="0" y="34">Feeling of support</text><text x="0" y="94">Stress</text><text x="0" y="154">Intent to return</text>
                </g>
                <g fill="#EEF0F3">
                  <rect x="150" y="20" width="340" height="20" rx="4"/>
                  <rect x="150" y="80" width="340" height="20" rx="4"/>
                  <rect x="150" y="140" width="340" height="20" rx="4"/>
                </g>
                <g fill="#5A4A87">
                  <rect x="150" y="20" width="241" height="20" rx="4"/>
                  <rect x="150" y="80" width="184" height="20" rx="4"/>
                  <rect x="150" y="140" width="258" height="20" rx="4"/>
                </g>
                <g stroke="#F9B91B" strokeWidth="3">
                  <line x1="279" y1="16" x2="279" y2="44"/>
                  <line x1="418" y1="76" x2="418" y2="104"/>
                  <line x1="293" y1="136" x2="293" y2="164"/>
                </g>
                <g fontFamily="Inter, sans-serif" fontSize="12.5" fontWeight="700" fill="#1E2A4A">
                  <text x="400" y="36">3.8 → 7.1</text><text x="343" y="96">7.9 → 5.4</text><text x="417" y="156">4.2 → 7.6</text>
                </g>
                <text x="0" y="196" fill="#5A6273" fontFamily="Inter, sans-serif" fontSize="11.5">Plum bar is March. Gold line is where they started in September. Cohort of 10.</text>
              </svg>
            </div>
            <div>
              <div className="fs-card" style={{"borderLeft": "4px solid var(--cohort)"}}>
                <h4>What leadership took to the board</h4>
                <p style={{"color": "var(--ink)", "fontSize": "1.02rem"}}>10 paras started the year at 4.2 out of 10 on intent to return. By March they were at 7.6. Nine of the 10 are coming back next year, and the district knows exactly what that cost.</p>
                <p style={{"marginTop": "14px", "fontSize": ".9rem"}}>Pulled from the dashboard in one click, formatted to forward.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="fs-sec" id="dashboard">
        <div className="fs-wrap">
          <div className="fs-head-narrow">
            <p className="fs-kicker">Your leadership dashboard</p>
            <h2>One place, populated automatically, whichever offering you bought.</h2>
            <p className="fs-lede">Live engagement data, trend lines, observation reports where they apply, certificates and board-ready exports. Nothing for your team to assemble.</p>
          </div>
          <div className="fs-grid3">
            <div className="fs-card"><h4>For your board</h4><p>Board-ready reports in one click. Exported in a format that survives being pasted into someone else&apos;s deck.</p></div>
            <div className="fs-card"><h4>For your coaches</h4><p>Implementation tracking and role-based breakdowns, filtered by grade, role and building.</p></div>
            <div className="fs-card"><h4>For your team</h4><p>Certificates, PD clock hours, celebration tools and automated check-ins that keep momentum going.</p></div>
          </div>
          <div className="fs-btnrow" style={{"marginTop": "36px"}}>
            <a className="fs-btn fs-btn-navy" href="/Example-Dashboard">Explore a live example dashboard</a>
          </div>
        </div>
      </section>

      <section className="fs-sec fs-sec-white">
        <div className="fs-wrap">
          <div className="fs-head-narrow">
            <p className="fs-kicker">Verified results from partner schools</p>
            <h2>What changed in buildings that stayed a full year.</h2>
          </div>
          <div className="fs-tablewrap">
            <table>
              <thead><tr><th scope="col">What changed</th><th scope="col">Before TDI</th><th scope="col">After TDI</th></tr></thead>
              <tbody>
                <tr><th scope="row">Weekly planning time</th><td>12 hours</td><td><b>6–8 hours</b></td></tr>
                <tr><th scope="row">Staff stress levels</th><td>9 out of 10</td><td><b>5–7 out of 10</b></td></tr>
                <tr><th scope="row">Teacher retention intent</th><td>2–4 out of 10</td><td><b>5–7 out of 10</b></td></tr>
                <tr><th scope="row">Strategy implementation</th><td>10% industry average</td><td><b>74% with TDI</b></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="fs-sec" id="funding">
        <div className="fs-wrap fs-fundband">
          <div>
            <h2>Most of our schools don&apos;t pay the full cost of this themselves.</h2>
            <p className="fs-lede">We find the funding, write the grant, and build the evidence the application needs, so outside money covers what your own budget can&apos;t. Helping you get it costs you nothing.</p>
          </div>
          <div>
            <a className="fs-btn fs-btn-navy" href="/funding">See how we help you fund it</a>
          </div>
        </div>
      </section>

      <section className="fs-sec fs-sec-white" id="questions">
        <div className="fs-wrap">
          <div className="fs-head-narrow">
            <p className="fs-kicker">What other leaders asked first</p>
            <h2>The questions administrators actually open with.</h2>
          </div>
          <div className="fs-faq">
            <details>
              <summary>We don&apos;t have the budget for this.</summary>
              <div className="fs-ans"><p>Then start with The Pulse. Working with us starts at $2,500 for a year, and most of our schools don&apos;t cover the full cost themselves, because we help them go get outside funding for it. We&apos;ll give you your exact number in a 20-minute call, and if it doesn&apos;t prove itself by March you&apos;ll know before you have to decide about next year.</p></div>
            </details>
            <details>
              <summary>We need to see results before committing to a full partnership.</summary>
              <div className="fs-ans"><p>That&apos;s how these are designed. The Pulse, The Focus and The Cohort each stand alone at a size a principal can approve, and each one produces a one-page proof report in early March. Nothing about starting small obligates you to anything bigger.</p></div>
            </details>
            <details>
              <summary>We&apos;ve tried coaching partnerships before and they didn&apos;t stick.</summary>
              <div className="fs-ans"><p>Most of what we do now doesn&apos;t depend on a coach showing up. The Pulse and The Focus run on automated delivery and reporting. No facilitator to lose, no session to reschedule, nothing that stops working when a person leaves.</p></div>
            </details>
            <details>
              <summary>Our staff are already overloaded. This is one more thing.</summary>
              <div className="fs-ans"><p>Three seconds a week for The Pulse. One tap a month for The Focus. No survey day, no staff meeting, no new login. The Focus specifically is built around the initiative you already chose, so it adds tools rather than priorities.</p></div>
            </details>
            <details>
              <summary>Our union won&apos;t support observation-based PD.</summary>
              <div className="fs-ans"><p>Observations only exist inside The Blueprint, and they&apos;re separate from evaluation with fixed look-fors and strengths named before gaps. The other three offerings involve no observation at all.</p></div>
            </details>
            <details>
              <summary>Will staff answers be traceable back to individuals?</summary>
              <div className="fs-ans"><p>No. Staff are told this in the first message and again in the footer of every check-in. Individual answers are never shown to anyone at their school, results roll up as group averages, and non-responders stay invisible. Leaders see a response rate, never a list of who skipped.</p></div>
            </details>
            <details>
              <summary>We already have an instructional coach on staff.</summary>
              <div className="fs-ans"><p>Good. None of this replaces them. The Pulse gives them culture data they can&apos;t collect themselves, and The Focus gives them ready-built tools so their time goes to the conversations instead of the prep.</p></div>
            </details>
            <details>
              <summary>What happens to our data if we don&apos;t renew?</summary>
              <div className="fs-ans"><p>We keep it for 12 months, then delete it. If you come back within a year you pick up your own trend line. Anonymized data stays in the benchmark pool either way.</p></div>
            </details>
          </div>
        </div>
      </section>

      <section className="fs-sec" id="downloads">
        <div className="fs-wrap">
          <div className="fs-head-narrow">
            <p className="fs-kicker">Take it to your team</p>
            <h2>Everything on this page, on paper.</h2>
            <p className="fs-lede">No email required. Built to be printed, forwarded, or dropped into a board packet as-is.</p>
          </div>
          <div className="fs-dl-grid">
            <a className="fs-dl" href="/downloads/the-pulse.pdf" target="_blank" rel="noopener noreferrer" style={{"--c":"var(--pulse)"} as React.CSSProperties}><b>The Pulse</b><span>Three pages &middot; what staff get, what you see, and the twenty questions</span></a>
            <a className="fs-dl" href="/downloads/the-focus.pdf" target="_blank" rel="noopener noreferrer" style={{"--c":"var(--focus)"} as React.CSSProperties}><b>The Focus</b><span>Three pages &middot; the 13 dates, the three answers, and how it runs</span></a>
            <a className="fs-dl" href="/downloads/the-cohort.pdf" target="_blank" rel="noopener noreferrer" style={{"--c":"var(--cohort)"} as React.CSSProperties}><b>The Cohort</b><span>Two pages &middot; the year, baseline against March, and how it runs</span></a>
            <a className="fs-dl" href="/downloads/the-blueprint.pdf" target="_blank" rel="noopener noreferrer" style={{"--c":"var(--blueprint)"} as React.CSSProperties}><b>The Blueprint</b><span>Two pages &middot; what a school achieves, and what it is made of</span></a>
          </div>
        </div>
      </section>

      <section className="fs-finale">
        <div className="fs-wrap">
          <h2>Ready to start the conversation?</h2>
          <p>No pressure and no pitch. Tell us the problem you&apos;d name first and we&apos;ll tell you which of the four fits, including when the answer is none of them yet.</p>
          <div className="fs-btnrow">
            <a className="fs-btn fs-btn-gold" href="/get-started">Get your free PD plan</a>
          </div>
          <p className="fs-hero-note">Or email us at hello@teachersdeserveit.com</p>
        </div>
      </section>


      <div className="fs-stickybar">
        <a className="fs-btn fs-btn-outline" href="#achieves">What you get</a>
        <a className="fs-btn fs-btn-navy" href="/get-started">Request a quote</a>
      </div>
    </div>
  );
}
