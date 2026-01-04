import Link from 'next/link';

export default function FundingPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="section" style={{ backgroundColor: 'var(--tdi-teal)' }}>
        <div className="container-default text-center">
          <p className="text-sm uppercase tracking-wider mb-4" style={{ color: 'white', opacity: 0.8 }}>
            Professional Development
          </p>
          <h1 className="mb-4" style={{ color: 'white' }}>Without the Price Tag</h1>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: 'white', opacity: 0.9 }}>
            Teachers Deserve It helps schools deliver PD that teachers love — and we help secure the funding to pay for it.
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="section py-12" style={{ backgroundColor: 'var(--tdi-navy)' }}>
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
            <div>
              <p className="text-5xl font-bold mb-2" style={{ color: 'var(--tdi-yellow)' }}>80%</p>
              <p style={{ color: 'white', opacity: 0.8 }}>of schools we work with secure external funds to cover PD</p>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2" style={{ color: 'var(--tdi-yellow)' }}>30%</p>
              <p style={{ color: 'white', opacity: 0.8 }}>increase in teacher implementation of new strategies</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Challenge */}
      <section className="section bg-white">
        <div className="container-default">
          <h2 className="text-center mb-8">The Challenge You're Facing</h2>
          <div className="max-w-2xl mx-auto">
            <p className="text-lg mb-6">You're asked to deliver PD that inspires. But all too often:</p>
            <ul className="space-y-3 text-lg mb-8">
              <li className="flex items-start gap-3">
                <span style={{ color: 'var(--tdi-coral)' }}>—</span>
                <span>PD eats staff time without changing practice.</span>
              </li>
              <li className="flex items-start gap-3">
                <span style={{ color: 'var(--tdi-coral)' }}>—</span>
                <span>Budgets are already stretched too thin.</span>
              </li>
              <li className="flex items-start gap-3">
                <span style={{ color: 'var(--tdi-coral)' }}>—</span>
                <span>Teachers roll their eyes, and you're left apologizing for wasted hours.</span>
              </li>
            </ul>
            <p className="text-lg font-semibold" style={{ color: 'var(--tdi-teal)' }}>
              It doesn't have to be that way.
            </p>
          </div>
        </div>
      </section>

      {/* How TDI Makes It Easy */}
      <section className="section" style={{ backgroundColor: 'var(--tdi-peach)' }}>
        <div className="container-default">
          <h2 className="text-center mb-12">How TDI Makes It Easy</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="card">
              <h3 className="text-xl mb-3">We Design a Plan</h3>
              <p style={{ opacity: 0.7 }}>
                Built around your staff's priorities and goals — for teachers and paraprofessionals alike.
              </p>
            </div>
            <div className="card">
              <h3 className="text-xl mb-3">We Find the Funding</h3>
              <p style={{ opacity: 0.7 }}>
                We align your plan with local, state, and national grants and draft the language for you.
              </p>
            </div>
            <div className="card">
              <h3 className="text-xl mb-3">We Deliver the PD</h3>
              <p style={{ opacity: 0.7 }}>
                Teacher-approved, immediately actionable strategies that improve classrooms and culture.
              </p>
            </div>
            <div className="card">
              <h3 className="text-xl mb-3">We Stay With You</h3>
              <p style={{ opacity: 0.7 }}>
                Reporting and renewal support keeps funding flowing year after year.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="section bg-white">
        <div className="container-default">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-2xl italic mb-6" style={{ color: 'var(--tdi-charcoal)' }}>
              "This was the first PD I didn't have to apologize for. Our teachers actually thanked me."
            </p>
            <p className="font-semibold">— School Principal</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section" style={{ backgroundColor: 'var(--tdi-navy)' }}>
        <div className="container-default">
          <h2 className="text-center mb-12" style={{ color: 'white' }}>How It Works</h2>
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: 'var(--tdi-yellow)', color: 'var(--tdi-charcoal)' }}>1</div>
              <div>
                <h3 className="text-xl mb-2" style={{ color: 'white' }}>Discovery & Alignment</h3>
                <p style={{ color: 'white', opacity: 0.8 }}>
                  We start by listening — learning your district's goals, challenges, and timelines. Then we align those priorities with available grant opportunities.
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: 'var(--tdi-yellow)', color: 'var(--tdi-charcoal)' }}>2</div>
              <div>
                <h3 className="text-xl mb-2" style={{ color: 'white' }}>Build Your Options</h3>
                <p style={{ color: 'white', opacity: 0.8 }}>
                  We create two paths: a Baseline Package that fits within your current budget, and a Dream Package fully supported by grant funding.
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: 'var(--tdi-yellow)', color: 'var(--tdi-charcoal)' }}>3</div>
              <div>
                <h3 className="text-xl mb-2" style={{ color: 'white' }}>Grant Mapping</h3>
                <p style={{ color: 'white', opacity: 0.8 }}>
                  We provide a curated list of grants aligned to your plan — with deadlines, requirements, and best-fit matches.
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: 'var(--tdi-yellow)', color: 'var(--tdi-charcoal)' }}>4</div>
              <div>
                <h3 className="text-xl mb-2" style={{ color: 'white' }}>Grant-Ready Language</h3>
                <p style={{ color: 'white', opacity: 0.8 }}>
                  We prepare outcomes, impact data, and budget justification that can be dropped directly into applications.
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: 'var(--tdi-yellow)', color: 'var(--tdi-charcoal)' }}>5</div>
              <div>
                <h3 className="text-xl mb-2" style={{ color: 'white' }}>Application Support</h3>
                <p style={{ color: 'white', opacity: 0.8 }}>
                  You submit (as required by funders), while we edit, refine, and provide supplemental materials.
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: 'var(--tdi-yellow)', color: 'var(--tdi-charcoal)' }}>6</div>
              <div>
                <h3 className="text-xl mb-2" style={{ color: 'white' }}>Delivery & Renewal</h3>
                <p style={{ color: 'white', opacity: 0.8 }}>
                  Once funded, we align the PD calendar with the grant cycle. We make reporting simple so you can secure renewal funding year after year.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Administrators Choose TDI */}
      <section className="section bg-white">
        <div className="container-default">
          <h2 className="text-center mb-12">Why Administrators Choose TDI</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
            <div>
              <h3 className="text-xl mb-3">Less Work on Your Plate</h3>
              <p style={{ opacity: 0.7 }}>
                We handle the grant research, language, and alignment.
              </p>
            </div>
            <div>
              <h3 className="text-xl mb-3">Data You Can Report</h3>
              <p style={{ opacity: 0.7 }}>
                Outcomes tied directly to student impact and district goals.
              </p>
            </div>
            <div>
              <h3 className="text-xl mb-3">Staff Retention & Morale</h3>
              <p style={{ opacity: 0.7 }}>
                Teachers and paras feel supported instead of burned out.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Second Testimonial */}
      <section className="section" style={{ backgroundColor: 'var(--tdi-peach)' }}>
        <div className="container-default">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-2xl italic mb-6" style={{ color: 'var(--tdi-charcoal)' }}>
              "TDI helped us unlock funding we didn't even know was possible."
            </p>
            <p className="font-semibold">— District Leader</p>
          </div>
        </div>
      </section>

      {/* Why Funding Isn't the Barrier */}
      <section className="section bg-white">
        <div className="container-default">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-center mb-8">Why Funding Isn't the Barrier</h2>
            <p className="text-lg mb-6">
              Schools across the country qualify for multiple grants designed to support professional learning.
            </p>
            <p className="text-lg mb-6">
              TDI does the heavy lifting — aligning your PD plan to opportunities, drafting ready-to-use language, and supporting your final submission.
            </p>
            <p className="text-lg font-semibold" style={{ color: 'var(--tdi-teal)' }}>
              That means your teachers and paras get the support they deserve — without your team carrying the burden of research or paperwork.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ backgroundColor: 'var(--tdi-navy)' }}>
        <div className="container-default text-center">
          <h2 className="mb-4" style={{ color: 'white' }}>Design Your Plan</h2>
          <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: 'white', opacity: 0.8 }}>
            Your teachers deserve PD that works. Your district deserves funding that makes it possible. Let's make both happen.
          </p>
          <Link href="/for-schools/schedule-call" className="btn-primary inline-block">
            Schedule a Conversation
          </Link>
        </div>
      </section>
    </main>
  );
}
