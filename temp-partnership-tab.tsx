        {/* OUR PARTNERSHIP TAB */}
        {activeTab === 'partnership' && (
          <div className="space-y-6">
            {/* Jump-Scroll Navigation */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 sticky top-28 z-30">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {[
                  { id: 'our-goal', label: 'Our Goal' },
                  { id: 'observations', label: 'Observations' },
                  { id: 'hub-activity', label: 'Hub Activity' },
                  { id: 'school-context', label: 'School Context' },
                  { id: 'whats-ahead', label: "What's Ahead" },
                  { id: 'resources', label: 'Resources' },
                ].map((section) => (
                  <button
                    key={section.id}
                    onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-[#38618C] hover:bg-gray-50 rounded-lg whitespace-nowrap transition-colors"
                  >
                    {section.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SECTION 1: Our Goal */}
            <div id="our-goal" className="scroll-mt-36">
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                <p className="text-xl md:text-2xl text-[#1e2749] font-medium leading-relaxed max-w-3xl mx-auto">
                  &quot;Equip Allenwood teachers with practical strategies and resources to build calm, connected classrooms where every student - including those with autism, special needs, and multilingual learners - feels supported and seen.&quot;
                </p>
                <p className="text-gray-500 text-sm mt-4">
                  Aligned to Dr. Porter&apos;s 2025-26 theme: <span className="text-amber-600 font-medium">Together We Will Rise</span>
                </p>
              </div>
            </div>

            {/* SECTION 2: Observations */}
            <div id="observations" className="scroll-mt-36">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-[#1e2749] text-lg mb-2">Classroom Observations</h3>
                <p className="text-gray-600 text-sm mb-6">
                  On-campus visits with personalized Love Notes for every teacher observed
                </p>

                {/* Observation Day 1 Accordion */}
                <div className="border border-gray-200 rounded-xl mb-4 overflow-hidden">
                  <button
                    onClick={() => setObsDay1Open(!obsDay1Open)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="font-medium text-teal-700">Observation Day 1</span>
                      <span className="text-gray-500 text-sm ml-2">· 11 Classrooms · 11 Love Notes Delivered · October 15, 2025</span>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${obsDay1Open ? 'rotate-180' : ''}`} />
                  </button>

                  {obsDay1Open && (
                    <div className="p-4 pt-0 space-y-6 border-t border-gray-100">
                      {/* What We Did */}
                      <div className="pt-4">
                        <h4 className="font-semibold text-gray-800 mb-3">What We Did</h4>
                        <div className="space-y-2">
                          {[
                            'Visited 11 classrooms across grade levels',
                            'Observed teacher-student interactions, classroom environment, and routines',
                            'Delivered 11 personalized Love Notes to every teacher observed',
                            'All Love Notes emailed to teachers with leadership CC\'d',
                            'Debrief with school leadership',
                          ].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* What We Celebrated */}
                      <div className="bg-teal-50 rounded-xl p-5">
                        <h4 className="font-semibold text-gray-800 mb-4">Strengths We Saw Across Your Classrooms</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Heart className="w-4 h-4 text-teal-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">Calm, Connected Classrooms</p>
                                <p className="text-sm text-gray-600 mt-1">Teachers maintained warm, consistent environments where students felt safe and seen.</p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Users className="w-4 h-4 text-teal-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">Strong Teacher-Para Teamwork</p>
                                <p className="text-sm text-gray-600 mt-1">Adults in the room worked as true partners - seamless transitions, shared responsibility.</p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-4 h-4 text-teal-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">Student Independence &amp; Joy</p>
                                <p className="text-sm text-gray-600 mt-1">Students showed self-regulation, engagement, and genuine excitement about learning.</p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Shield className="w-4 h-4 text-teal-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">Adaptability Under Pressure</p>
                                <p className="text-sm text-gray-600 mt-1">When tech failed or schedules shifted, teachers pivoted without missing a beat.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Love Note Samples */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Love Notes from This Visit</h4>
                        <p className="text-gray-600 text-sm mb-4">
                          All 11 teachers received personalized Love Notes via email. Leadership was CC&apos;d on every note. Here are 6 examples.
                        </p>
                        <div className="space-y-3">
                          <div className="bg-amber-50 rounded-lg p-4" style={{ borderLeftWidth: '3px', borderLeftColor: '#FFBA06', borderLeftStyle: 'solid' }}>
                            <p className="text-gray-700 italic text-sm leading-relaxed">&quot;Within five minutes I found myself wishing I could be one of your students. You&apos;ve built a classroom where kids feel excited, safe, and seen.&quot;</p>
                            <p className="text-amber-600 text-sm mt-2 font-medium">— From Observation Day 1</p>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-4" style={{ borderLeftWidth: '3px', borderLeftColor: '#FFBA06', borderLeftStyle: 'solid' }}>
                            <p className="text-gray-700 italic text-sm leading-relaxed">&quot;Your color-coded station system had students moving with purpose. The countdowns kept everything calm and clear. When tech glitched, you pivoted to paper without missing a beat.&quot;</p>
                            <p className="text-amber-600 text-sm mt-2 font-medium">— From Observation Day 1</p>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-4" style={{ borderLeftWidth: '3px', borderLeftColor: '#FFBA06', borderLeftStyle: 'solid' }}>
                            <p className="text-gray-700 italic text-sm leading-relaxed">&quot;The alphabet sing-and-sign moment was absolutely adorable. Your space is clearly designed for movement and engagement. It feels like a room where learning lives.&quot;</p>
                            <p className="text-amber-600 text-sm mt-2 font-medium">— From Observation Day 1</p>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-4" style={{ borderLeftWidth: '3px', borderLeftColor: '#FFBA06', borderLeftStyle: 'solid' }}>
                            <p className="text-gray-700 italic text-sm leading-relaxed">&quot;Your call-and-response routines were easy, fun, and consistent. Students responded quickly to your calm tone and respectful redirections.&quot;</p>
                            <p className="text-amber-600 text-sm mt-2 font-medium">— From Observation Day 1</p>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-4" style={{ borderLeftWidth: '3px', borderLeftColor: '#FFBA06', borderLeftStyle: 'solid' }}>
                            <p className="text-gray-700 italic text-sm leading-relaxed">&quot;The laughter, smiles, and small celebrations showed genuine joy and connection. Your teamwork with the additional adults was seamless.&quot;</p>
                            <p className="text-amber-600 text-sm mt-2 font-medium">— From Observation Day 1</p>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-4" style={{ borderLeftWidth: '3px', borderLeftColor: '#FFBA06', borderLeftStyle: 'solid' }}>
                            <p className="text-gray-700 italic text-sm leading-relaxed">&quot;Low voice = high control. You modeled the volume you wanted, and students mirrored you. I&apos;d want to be a student in your classroom!&quot;</p>
                            <p className="text-amber-600 text-sm mt-2 font-medium">— From Observation Day 1</p>
                          </div>
                        </div>
                      </div>

                      {/* Where Small Shifts Could Make a Big Difference */}
                      <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                        <h4 className="font-semibold text-gray-800 mb-3">Where Small Shifts Could Make a Big Difference</h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">•</span>
                            <span>Transitions and predictable routines across all classrooms</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">•</span>
                            <span>Consistent para support strategies room to room</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">•</span>
                            <span>Protected time for professional exploration</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">•</span>
                            <span>Differentiation for diverse learner needs</span>
                          </li>
                        </ul>
                      </div>

                      {/* Follow-Up */}
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <MessageCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-green-800 font-medium">The conversation is already happening!</p>
                            <p className="text-gray-600 text-sm mt-1">
                              After our visit, Yvette reached out asking for more age-appropriate independent center activities for kindergarten. That&apos;s exactly the kind of engagement we love to see - and we delivered resources within days.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Recommendation */}
                      <div className="bg-blue-50 rounded-xl p-4" style={{ borderLeftWidth: '3px', borderLeftColor: '#3B82F6', borderLeftStyle: 'solid' }}>
                        <p className="text-gray-700 text-sm">
                          <span className="font-medium">Recommendation:</span> Share Love Notes aloud at your next staff meeting. It builds culture and shows teachers their work is seen. We recommend a 5-minute Hub walkthrough at that same meeting to spark curiosity.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Observation Day 2 Accordion */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setObsDay2Open(!obsDay2Open)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="font-medium text-teal-700">Observation Day 2</span>
                      <span className="text-gray-500 text-sm ml-2">· February 18, 2026</span>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${obsDay2Open ? 'rotate-180' : ''}`} />
                  </button>

                  {obsDay2Open && (
                    <div className="p-4 pt-0 border-t border-gray-100">
                      <div className="bg-teal-50 rounded-xl p-5 mt-4">
                        <div className="flex items-start gap-3">
                          <Eye className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-teal-800 font-medium">Observation complete. Full write-up and Love Notes coming soon.</p>
                            <p className="text-gray-600 text-sm mt-2">
                              Personalized Love Notes will be emailed to every teacher observed, with leadership CC&apos;d - just like Observation Day 1.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 3: Hub Activity */}
            <div id="hub-activity" className="scroll-mt-36">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-[#1e2749] text-lg mb-2">Hub Activity</h3>
                <p className="text-gray-500 text-sm mb-6">Updated February 18, 2026</p>

                {/* Hub Login Summary */}
                <div className="mb-6">
                  <div className="text-4xl font-bold text-[#38618C] mb-1">9 of 11</div>
                  <p className="text-gray-600">teachers have logged into the Learning Hub</p>
                </div>

                <p className="text-gray-700 mb-6">
                  Your team&apos;s first explorer has now completed their first full lesson in &apos;Supporting Students Through Their Daily Schedule&apos; and has spent time in 4 different courses including Teacher-Tested Hacks, Understanding Student Needs, and Parent Tools. That&apos;s real momentum from one person.
                </p>

                {/* Warm context note */}
                <div className="bg-blue-50 rounded-xl p-4" style={{ borderLeftWidth: '3px', borderLeftColor: '#3B82F6', borderLeftStyle: 'solid' }}>
                  <p className="text-gray-700 text-sm">
                    Hub engagement typically accelerates after the first virtual session when teachers get guided, protected time together. Your virtual sessions are tentatively scheduled - once your team experiences guided Hub time, this section will grow.
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION 4: School Context */}
            <div id="school-context" className="scroll-mt-36">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-[#1e2749] text-lg mb-2">The Context Behind Our Partnership</h3>
                <p className="text-gray-600 text-sm mb-6">
                  Your team works in one of the toughest environments in Maryland - and they show up every day. These numbers are the reason this partnership exists.
                </p>

                {/* Academic Comparison Bars */}
                <div className="space-y-6 mb-6">
                  {/* Math Proficiency */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Math Proficiency</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-24">Allenwood</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                          <div className="bg-amber-400 h-full rounded-full flex items-center justify-end pr-2" style={{ width: '8%', minWidth: '40px' }}>
                            <span className="text-xs font-bold text-amber-900">5-8%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-24">PGCPS District</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                          <div className="bg-gray-400 h-full rounded-full flex items-center justify-end pr-2" style={{ width: '13%', minWidth: '40px' }}>
                            <span className="text-xs font-bold text-white">13%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-24">Maryland State</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                          <div className="bg-teal-400 h-full rounded-full flex items-center justify-end pr-2" style={{ width: '27%', minWidth: '50px' }}>
                            <span className="text-xs font-bold text-teal-900">25-28%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reading Proficiency */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Reading Proficiency</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-24">Allenwood</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                          <div className="bg-amber-400 h-full rounded-full flex items-center justify-end pr-2" style={{ width: '27%', minWidth: '40px' }}>
                            <span className="text-xs font-bold text-amber-900">27%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-24">PGCPS District</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                          <div className="bg-gray-400 h-full rounded-full flex items-center justify-end pr-2" style={{ width: '33%', minWidth: '40px' }}>
                            <span className="text-xs font-bold text-white">33%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-24">Maryland State</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                          <div className="bg-teal-400 h-full rounded-full flex items-center justify-end pr-2" style={{ width: '44%', minWidth: '60px' }}>
                            <span className="text-xs font-bold text-teal-900">42-45%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Context Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                    <p className="text-lg font-bold text-amber-700">30%</p>
                    <p className="text-xs text-gray-600">novice teachers</p>
                    <p className="text-[10px] text-gray-400 mt-1">Nearly 1 in 3 teachers are in their first or second year</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                    <p className="text-lg font-bold text-amber-700">74-81%</p>
                    <p className="text-xs text-gray-600">FRPL</p>
                    <p className="text-[10px] text-gray-400 mt-1">High economic need across the student body</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                    <p className="text-lg font-bold text-amber-700">46-54%</p>
                    <p className="text-xs text-gray-600">Hispanic/EL</p>
                    <p className="text-[10px] text-gray-400 mt-1">Significant multilingual learner population</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                    <p className="text-lg font-bold text-amber-700">333</p>
                    <p className="text-xs text-gray-600">students</p>
                    <p className="text-[10px] text-gray-400 mt-1">Every one of them deserves supported teachers</p>
                  </div>
                </div>

                {/* Leading Indicator Benchmarks */}
                <div className="bg-teal-50 rounded-xl p-5 border border-teal-100">
                  <h4 className="font-semibold text-gray-800 mb-3">What Full-Year TDI Support Produces</h4>
                  <p className="text-gray-700 text-sm mb-3">
                    TDI partners typically see teacher stress drop from 8-9 to 5-7 on a 10-point scale, strategy implementation rates reach 65% versus 10% industry average, and retention intent increases measurably. These outcomes are verified after 3-4 months of implementation.
                  </p>
                  <p className="text-gray-700 text-sm mb-3">
                    We&apos;ll measure Allenwood&apos;s starting point at your first virtual session and track growth from there.
                  </p>
                  <p className="text-xs text-gray-500">
                    Industry data: RAND 2025, Learning Policy Institute. TDI data: Partner school surveys.
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION 5: What's Ahead */}
            <div id="whats-ahead" className="scroll-mt-36">
              {/* What We've Learned Together */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6" style={{ borderLeftWidth: '3px', borderLeftColor: '#0ea5a0', borderLeftStyle: 'solid' }}>
                <h3 className="font-bold text-[#1e2749] text-lg mb-4">What We&apos;ve Learned Together</h3>
                <div className="space-y-4 text-gray-700">
                  <p>
                    During our observation, we saw incredible classroom practices - calm environments, strong routines, and teachers who genuinely care. The foundation is there.
                  </p>
                  <p>
                    Here&apos;s what we&apos;ve noticed across schools like Allenwood: when staff are told to &quot;explore the Hub during planning time,&quot; that time gets consumed by the urgent - grading, emails, copies, putting out fires.
                  </p>
                  <p className="font-medium text-gray-800">
                    Meaningful PD happens when there&apos;s protected time with a specific resource in mind.
                  </p>
                  <p>
                    The good news? Even 15 minutes with a targeted course or download can create immediate classroom impact.
                  </p>
                </div>
              </div>

              {/* Phase Timeline */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                <h3 className="font-bold text-[#1e2749] text-lg mb-6">Your Partnership Year at a Glance</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* IGNITE Phase - Current */}
                  <div className="relative">
                    <div className="bg-gradient-to-br from-[#35A7FF] to-[#38618C] rounded-xl p-4 text-white h-full ring-4 ring-[#35A7FF]/30">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">PHASE 1</span>
                        <span className="text-xs font-bold bg-white text-[#35A7FF] px-2 py-1 rounded animate-pulse">YOU ARE HERE</span>
                      </div>
                      <h4 className="text-lg font-bold mb-1">IGNITE</h4>
                      <p className="text-xs text-white/80 mb-3">Jul 2025 - Mar 2026</p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <Check className="w-3 h-3 flex-shrink-0" />
                          <span>Pilot group identified</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3 h-3 flex-shrink-0" />
                          <span>Baseline observations complete</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3 h-3 flex-shrink-0" />
                          <span>Hub access activated</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full border border-white/60 flex-shrink-0"></div>
                          <span className="text-white/80">Building trust and exploring tools</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* ACCELERATE Phase - Upcoming */}
                  <div className="relative">
                    <div className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl p-4 text-gray-600 h-full">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold bg-white/50 px-2 py-1 rounded">PHASE 2</span>
                        <Clock className="w-5 h-5 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-bold mb-1 text-gray-700">ACCELERATE</h4>
                      <p className="text-xs text-gray-500 mb-3">Apr - May 2026</p>
                      <ul className="space-y-2 text-sm text-gray-500">
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full border border-gray-400 flex-shrink-0"></div>
                          <span>Expand to full staff (68 educators)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full border border-gray-400 flex-shrink-0"></div>
                          <span>Multiple observation cycles</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full border border-gray-400 flex-shrink-0"></div>
                          <span>Growth Groups formed</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full border border-gray-400 flex-shrink-0"></div>
                          <span>Deep implementation</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* SUSTAIN Phase - Future */}
                  <div className="relative">
                    <div className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl p-4 text-gray-600 h-full">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold bg-white/50 px-2 py-1 rounded">PHASE 3</span>
                        <Clock className="w-5 h-5 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-bold mb-1 text-gray-700">SUSTAIN</h4>
                      <p className="text-xs text-gray-500 mb-3">Jun 2026+</p>
                      <ul className="space-y-2 text-sm text-gray-500">
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full border border-gray-400 flex-shrink-0"></div>
                          <span>Internal leadership development</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full border border-gray-400 flex-shrink-0"></div>
                          <span>Self-sustaining systems</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full border border-gray-400 flex-shrink-0"></div>
                          <span>Culture embedded school-wide</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* What Success Looks Like */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-[#1e2749] text-lg mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  What Success Looks Like
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <p className="text-gray-800 font-medium">Pilot teachers report increased confidence in classroom strategies</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <p className="text-gray-800 font-medium">Measurable improvement in feeling supported by admin and peers</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <p className="text-gray-800 font-medium">Reduced stress levels compared to baseline</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <p className="text-gray-800 font-medium">Clear implementation of Hub strategies observed in classrooms</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 text-center">
                  These targets will be measured through the TDI Educator Survey, classroom observations, and Hub engagement data.
                </p>
              </div>
            </div>

            {/* SECTION 6: Resources */}
            <div id="resources" className="scroll-mt-36">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-[#1e2749] text-lg mb-2">
                  Curated Starting Points for Your Team
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  Based on our October classroom visits, here are resources that align with what your team is already doing well and where small shifts could make a big difference.
                </p>

                {/* Quick-Win Downloads */}
                <div className="mb-6">
                  <h4 className="text-gray-900 font-semibold mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-500" />
                    Quick-Win Downloads
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">5 min or less</span>
                  </h4>

                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-green-300 transition-colors">
                      <FileText className="w-5 h-5 text-green-500 mb-2" />
                      <p className="text-gray-900 font-medium text-sm">The Sentence Starter Guide</p>
                      <p className="text-gray-500 text-xs mt-1">We saw teachers using calm, clear phrasing. This takes it further.</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-green-300 transition-colors">
                      <FileText className="w-5 h-5 text-green-500 mb-2" />
                      <p className="text-gray-900 font-medium text-sm">No-Hands-Up Help Systems</p>
                      <p className="text-gray-500 text-xs mt-1">Perfect for classrooms managing multiple adults and student needs.</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-green-300 transition-colors">
                      <FileText className="w-5 h-5 text-green-500 mb-2" />
                      <p className="text-gray-900 font-medium text-sm">Daily Support Cheat Sheet</p>
                      <p className="text-gray-500 text-xs mt-1">Great for para consistency across all rooms.</p>
                    </div>
                  </div>
                </div>

                {/* Recommended First Courses */}
                <div className="mb-6">
                  <h4 className="text-gray-900 font-semibold mb-3 flex items-center gap-2">
                    <Play className="w-4 h-4 text-blue-500" />
                    Recommended First Courses
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">25-30 min each</span>
                  </h4>

                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-gray-900 font-medium">K-2 Station Rotation Routines</p>
                          <p className="text-gray-500 text-sm mt-1">Color-coded systems, transition countdowns. Matches what&apos;s already working in classrooms like Yvette&apos;s.</p>
                        </div>
                        <span className="text-gray-500 text-xs whitespace-nowrap">~25 min</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-gray-900 font-medium">Your Class Runs Smoother When the Flow Makes Sense</p>
                          <p className="text-gray-500 text-sm mt-1">Transitions and predictable routines. The most common growth area we identified.</p>
                        </div>
                        <span className="text-gray-500 text-xs whitespace-nowrap">~25 min</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-gray-900 font-medium">Classroom Management Toolkit</p>
                          <p className="text-gray-500 text-sm mt-1">Our most-recommended resource from observation feedback. Short videos perfect for lunch or commute.</p>
                        </div>
                        <span className="text-gray-500 text-xs whitespace-nowrap">~30 min</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-gray-900 font-medium">Building Strong Teacher-Para Partnerships</p>
                          <p className="text-gray-500 text-sm mt-1">We saw strong teamwork. This course deepens that foundation.</p>
                        </div>
                        <span className="text-gray-500 text-xs whitespace-nowrap">~30 min</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Autism Bundle */}
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-gray-900 font-semibold">Autism Support Bundle</h4>
                        <span className="text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full">NOW LIVE</span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Designed for exactly what we saw at Allenwood: visual routines, communication supports, and sensory-safe transitions. Built for both teachers and paras working with unique learners. Your team has full access. Perfect for classrooms like Carlita&apos;s and Rofiat&apos;s.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Real Inclusion */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-gray-900 font-semibold">Teachers Deserve Real Inclusion</h4>
                        <span className="text-xs bg-blue-200 text-blue-700 px-2 py-0.5 rounded-full">Added February 2026</span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        5 courses just added to your team&apos;s access focused on building truly inclusive classrooms. Pairs well with the support strategies your team is already exploring.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

