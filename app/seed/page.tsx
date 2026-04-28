import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Seed Round | Teachers Deserve It',
  description: 'TDI seed round investor brief — $1.5–2M raise at $11M pre-money.',
  robots: 'noindex, nofollow',
};

export default function SeedPage() {
  return (
    <main style={{ fontFamily: 'inherit' }}>
      {/* Hero */}
      <section
        className="py-20 md:py-28 text-center"
        style={{ backgroundColor: '#1e2749' }}
      >
        <div className="container-default">
          <p
            className="text-sm font-semibold uppercase tracking-widest mb-4"
            style={{ color: '#ffba06' }}
          >
            Seed Round — April 2026
          </p>
          <h1 className="text-3xl md:text-5xl font-bold mb-6" style={{ color: '#ffffff' }}>
            Teachers Deserve It
          </h1>
          <p className="text-lg max-w-2xl mx-auto mb-8" style={{ color: '#ffffff', opacity: 0.85 }}>
            The professional development infrastructure for America&rsquo;s 3.7M teachers.
            27:1 LTV:CAC. 98% renewal. 100K+ organic community. Zero paid acquisition.
          </p>
          <a
            href="/documents/TDI-Seed-Funding-Deck.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 rounded-lg font-bold text-lg transition-all hover:opacity-90"
            style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
          >
            Download Pitch Deck (PDF)
          </a>
        </div>
      </section>

      {/* The Ask */}
      <section className="py-16" style={{ backgroundColor: '#ffba06' }}>
        <div className="container-default">
          <h2
            className="text-2xl md:text-3xl font-bold text-center mb-10"
            style={{ color: '#1e2749' }}
          >
            The Ask
          </h2>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div
              className="rounded-xl p-6"
              style={{ backgroundColor: '#1e2749' }}
            >
              <p className="text-4xl font-bold mb-2" style={{ color: '#ffba06' }}>
                $1.5–2M
              </p>
              <p className="font-semibold" style={{ color: '#ffffff' }}>
                Seed Raise
              </p>
            </div>
            <div
              className="rounded-xl p-6"
              style={{ backgroundColor: '#1e2749' }}
            >
              <p className="text-4xl font-bold mb-2" style={{ color: '#ffba06' }}>
                $11M
              </p>
              <p className="font-semibold" style={{ color: '#ffffff' }}>
                Pre-Money Valuation
              </p>
            </div>
            <div
              className="rounded-xl p-6"
              style={{ backgroundColor: '#1e2749' }}
            >
              <p className="text-4xl font-bold mb-2" style={{ color: '#ffba06' }}>
                $13M
              </p>
              <p className="font-semibold" style={{ color: '#ffffff' }}>
                Post-Money (at $2M)
              </p>
            </div>
            <div
              className="rounded-xl p-6"
              style={{ backgroundColor: '#1e2749' }}
            >
              <p className="text-4xl font-bold mb-2" style={{ color: '#ffba06' }}>
                ~15.4%
              </p>
              <p className="font-semibold" style={{ color: '#ffffff' }}>
                Dilution (at $2M)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Current Metrics */}
      <section className="py-16" style={{ backgroundColor: '#ffffff' }}>
        <div className="container-default max-w-4xl">
          <h2
            className="text-2xl md:text-3xl font-bold text-center mb-4"
            style={{ color: '#1e2749' }}
          >
            Where TDI Stands Today
          </h2>
          <p
            className="text-center mb-10"
            style={{ color: '#1e2749', opacity: 0.7 }}
          >
            8 districts. $105K ARR. 100% organic growth. Zero paid acquisition.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { label: 'Confirmed ARR', value: '$105,000' },
              { label: 'Active District Partners', value: '8' },
              { label: 'Blended ACV', value: '~$20,000' },
              { label: 'Contract Range', value: '$15K–$54K (by Blueprint phase)' },
              { label: 'LTV:CAC', value: '27:1 (gross-margin-adjusted)' },
              { label: 'CAC', value: '$1,992' },
              { label: '5-Year LTV', value: '$55,000' },
              { label: 'Renewal Rate', value: '98%' },
              { label: 'Gross Margins', value: '85–94% (88% blended)' },
              { label: 'Community', value: '100,000+ educators · 50 states · 100 countries' },
              { label: 'Growth Channel', value: '100% organic — zero paid acquisition' },
              { label: 'Ignite→Accelerate Upgrade Rate', value: '90%+ (confirmed)' },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex justify-between items-center rounded-lg px-5 py-4 border"
                style={{ borderColor: '#e5e7eb' }}
              >
                <span className="font-medium text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                  {label}
                </span>
                <span className="font-bold text-sm text-right ml-4" style={{ color: '#1e2749' }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blueprint Phase Economics */}
      <section className="py-16" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="container-default max-w-4xl">
          <h2
            className="text-2xl md:text-3xl font-bold text-center mb-4"
            style={{ color: '#1e2749' }}
          >
            Blueprint Phase Economics
          </h2>
          <p
            className="text-center mb-10"
            style={{ color: '#1e2749', opacity: 0.7 }}
          >
            A district that completes the full Blueprint generates $121K+ in lifetime revenue.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                phase: 'Ignite',
                acv: '$33,000',
                desc: 'District launches TDI framework, coaches trained',
              },
              {
                phase: 'Accelerate',
                acv: '$34,000',
                desc: 'Expansion to more schools, deeper integration',
              },
              {
                phase: 'Sustain',
                acv: '$54,000+',
                desc: 'Full-district adoption, multi-school, platform-driven',
              },
            ].map(({ phase, acv, desc }) => (
              <div
                key={phase}
                className="rounded-xl p-6 text-center"
                style={{ backgroundColor: '#1e2749' }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: '#ffba06' }}
                >
                  {phase}
                </p>
                <p className="text-3xl font-bold mb-3" style={{ color: '#ffffff' }}>
                  {acv}
                </p>
                <p className="text-sm" style={{ color: '#ffffff', opacity: 0.8 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Growth Scenarios */}
      <section className="py-16" style={{ backgroundColor: '#ffffff' }}>
        <div className="container-default max-w-5xl">
          <h2
            className="text-2xl md:text-3xl font-bold text-center mb-4"
            style={{ color: '#1e2749' }}
          >
            Year-by-Year Growth Path
          </h2>
          <p
            className="text-center mb-10"
            style={{ color: '#1e2749', opacity: 0.7 }}
          >
            Two scenarios. Both validated.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Conservative */}
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#e5e7eb' }}>
              <div
                className="px-6 py-4"
                style={{ backgroundColor: '#f5f5f5' }}
              >
                <h3 className="font-bold text-lg" style={{ color: '#1e2749' }}>
                  Conservative (No New Funding)
                </h3>
                <p className="text-sm mt-1" style={{ color: '#1e2749', opacity: 0.6 }}>
                  Organic growth · founder-led sales
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: '#1e2749' }}>
                      {['Year', 'Districts', 'ARR'].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left font-semibold"
                          style={{ color: '#ffba06' }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { year: 'Current', districts: '8', arr: '$105K' },
                      { year: 'Year 1', districts: '32', arr: '$704K' },
                      { year: 'Year 2', districts: '71', arr: '$1.92M' },
                      { year: 'Year 3', districts: '124', arr: '$3.97M' },
                      { year: 'Year 4', districts: '191', arr: '$7.1M' },
                    ].map((row, i) => (
                      <tr
                        key={row.year}
                        style={{ backgroundColor: i % 2 === 0 ? '#ffffff' : '#f9f9f9' }}
                      >
                        <td className="px-4 py-3 font-medium" style={{ color: '#1e2749' }}>
                          {row.year}
                        </td>
                        <td className="px-4 py-3" style={{ color: '#1e2749' }}>
                          {row.districts}
                        </td>
                        <td className="px-4 py-3 font-semibold" style={{ color: '#1e2749' }}>
                          {row.arr}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Funded */}
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: '2px solid #ffba06' }}
            >
              <div
                className="px-6 py-4"
                style={{ backgroundColor: '#1e2749' }}
              >
                <h3 className="font-bold text-lg" style={{ color: '#ffba06' }}>
                  Fully Funded ($2M Seed)
                </h3>
                <p className="text-sm mt-1" style={{ color: '#ffffff', opacity: 0.7 }}>
                  4× BD capacity · marketing engine
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: '#1e2749' }}>
                      {['Year', 'Districts', 'ARR', 'EBITDA'].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left font-semibold"
                          style={{ color: '#ffba06' }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { year: 'Current', districts: '8', arr: '$105K', ebitda: '—' },
                      { year: 'Year 1', districts: '52', arr: '$1.36M', ebitda: '-$620K' },
                      { year: 'Year 2', districts: '150', arr: '$4.70M', ebitda: '+$940K' },
                      { year: 'Year 3', districts: '321', arr: '$12.0M', ebitda: '+$4.2M' },
                      { year: 'Year 4', districts: '594', arr: '$26.7M', ebitda: '+$13.0M' },
                    ].map((row, i) => (
                      <tr
                        key={row.year}
                        style={{
                          backgroundColor:
                            row.year === 'Year 4' ? '#fff9e6' : i % 2 === 0 ? '#ffffff' : '#f9f9f9',
                        }}
                      >
                        <td
                          className="px-4 py-3 font-medium"
                          style={{
                            color: '#1e2749',
                            fontWeight: row.year === 'Year 4' ? 700 : 500,
                          }}
                        >
                          {row.year}
                        </td>
                        <td className="px-4 py-3" style={{ color: '#1e2749' }}>
                          {row.districts}
                        </td>
                        <td
                          className="px-4 py-3 font-semibold"
                          style={{
                            color: '#1e2749',
                            fontWeight: row.year === 'Year 4' ? 700 : 600,
                          }}
                        >
                          {row.arr}
                        </td>
                        <td
                          className="px-4 py-3"
                          style={{
                            color: row.ebitda.startsWith('+') ? '#16a34a' : '#1e2749',
                            fontWeight: 600,
                          }}
                        >
                          {row.ebitda}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <p
            className="text-center text-sm mt-6"
            style={{ color: '#1e2749', opacity: 0.6 }}
          >
            594 districts = less than 5% of 13,000+ US districts. EBITDA positive in Year 2.
            $2M seed generates 9×+ return by Year 4 via EBITDA alone.
          </p>
        </div>
      </section>

      {/* LTV:CAC at Scale */}
      <section className="py-16" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="container-default max-w-4xl">
          <h2
            className="text-2xl md:text-3xl font-bold text-center mb-4"
            style={{ color: '#1e2749' }}
          >
            LTV:CAC at Scale
          </h2>
          <p
            className="text-center mb-10"
            style={{ color: '#1e2749', opacity: 0.7 }}
          >
            The ratio compresses as CAC rises — but stays well above 3:1 SaaS benchmark at every stage.
          </p>

          <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid #e5e7eb' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: '#1e2749' }}>
                  {['Scale', 'Blended ACV', '5-Year LTV', 'CAC', 'LTV:CAC'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-4 text-left font-semibold"
                      style={{ color: '#ffba06' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    scale: '8 districts (today)',
                    acv: '$13K',
                    ltv: '$55K',
                    cac: '$1,992',
                    ratio: '27:1',
                    highlight: true,
                  },
                  {
                    scale: '100 districts',
                    acv: '$30K',
                    ltv: '$126K',
                    cac: '$5,000',
                    ratio: '25:1',
                    highlight: false,
                  },
                  {
                    scale: '500 districts',
                    acv: '$40K',
                    ltv: '$169K',
                    cac: '$10,000',
                    ratio: '17:1',
                    highlight: false,
                  },
                  {
                    scale: '1,000 districts',
                    acv: '$46K',
                    ltv: '$194K',
                    cac: '$20,000',
                    ratio: '10:1',
                    highlight: false,
                  },
                ].map((row, i) => (
                  <tr
                    key={row.scale}
                    style={{
                      backgroundColor: row.highlight ? '#fff9e6' : i % 2 === 0 ? '#ffffff' : '#f9f9f9',
                    }}
                  >
                    <td
                      className="px-5 py-4 font-medium"
                      style={{ color: '#1e2749', fontWeight: row.highlight ? 700 : 500 }}
                    >
                      {row.scale}
                    </td>
                    <td className="px-5 py-4" style={{ color: '#1e2749' }}>
                      {row.acv}
                    </td>
                    <td className="px-5 py-4" style={{ color: '#1e2749' }}>
                      {row.ltv}
                    </td>
                    <td className="px-5 py-4" style={{ color: '#1e2749' }}>
                      {row.cac}
                    </td>
                    <td
                      className="px-5 py-4 font-bold"
                      style={{ color: '#1e2749' }}
                    >
                      {row.ratio}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p
            className="text-center text-xs mt-4"
            style={{ color: '#1e2749', opacity: 0.5 }}
          >
            LTV formula: ACV × 4.81 retention years × 88% gross margin. Derived from 98% annual renewal rate over a 5-year horizon.
          </p>
        </div>
      </section>

      {/* SOM / Market */}
      <section className="py-16" style={{ backgroundColor: '#1e2749' }}>
        <div className="container-default max-w-4xl">
          <h2
            className="text-2xl md:text-3xl font-bold text-center mb-10"
            style={{ color: '#ffffff' }}
          >
            The Market Opportunity
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="rounded-xl p-6" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#ffba06' }}>
                Serviceable Obtainable (24-Month)
              </p>
              <p className="text-4xl font-bold mb-2" style={{ color: '#ffffff' }}>
                $4.70M ARR
              </p>
              <p className="text-sm" style={{ color: '#ffffff', opacity: 0.65 }}>
                Funded Y2 — 150 districts at $31K blended ACV
              </p>
            </div>
            <div className="rounded-xl p-6" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#ffba06' }}>
                Year 4 Target (Funded)
              </p>
              <p className="text-4xl font-bold mb-2" style={{ color: '#ffffff' }}>
                $26.7M ARR
              </p>
              <p className="text-sm" style={{ color: '#ffffff', opacity: 0.65 }}>
                594 districts · &lt;5% of 13,000+ US districts
              </p>
            </div>
            <div className="rounded-xl p-6" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#ffba06' }}>
                Year 4 (Conservative)
              </p>
              <p className="text-4xl font-bold mb-2" style={{ color: '#ffffff' }}>
                $7.1M ARR
              </p>
              <p className="text-sm" style={{ color: '#ffffff', opacity: 0.65 }}>
                191 districts · no new capital deployed
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use of Funds */}
      <section className="py-16" style={{ backgroundColor: '#ffffff' }}>
        <div className="container-default max-w-3xl">
          <h2
            className="text-2xl md:text-3xl font-bold text-center mb-10"
            style={{ color: '#1e2749' }}
          >
            Use of Funds ($2M Seed)
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { bucket: 'Regional BD leads (4 hires)', amount: '$800K', pct: '40%', detail: '~$200K fully-loaded each · 4 regions' },
              { bucket: 'Marketing & demand gen', amount: '$400K', pct: '20%', detail: 'Conferences, content, digital' },
              { bucket: 'Product & tech team', amount: '$400K', pct: '20%', detail: 'Data platform, Blueprint tooling' },
              { bucket: 'Working capital & ops', amount: '$400K', pct: '20%', detail: 'Runway buffer, admin' },
            ].map(({ bucket, amount, pct, detail }) => (
              <div
                key={bucket}
                className="rounded-xl p-5 border"
                style={{ borderColor: '#e5e7eb' }}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-sm" style={{ color: '#1e2749' }}>
                    {bucket}
                  </span>
                  <span
                    className="text-sm font-bold ml-3 whitespace-nowrap"
                    style={{ color: '#ffba06', backgroundColor: '#1e2749', padding: '2px 8px', borderRadius: 99 }}
                  >
                    {pct}
                  </span>
                </div>
                <p className="text-xl font-bold mb-1" style={{ color: '#1e2749' }}>
                  {amount}
                </p>
                <p className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>
                  {detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center" style={{ backgroundColor: '#ffba06' }}>
        <div className="container-default">
          <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#1e2749' }}>
            Ready to go deeper?
          </h2>
          <p className="mb-8 max-w-xl mx-auto" style={{ color: '#1e2749', opacity: 0.8 }}>
            Download the full pitch deck or reach out directly to Rae Hughart.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/documents/TDI-Seed-Funding-Deck.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 rounded-lg font-bold text-lg transition-all hover:opacity-90"
              style={{ backgroundColor: '#1e2749', color: '#ffffff' }}
            >
              Download Full Deck
            </a>
            <a
              href="/contact"
              className="inline-block px-8 py-4 rounded-lg font-bold text-lg border-2 transition-all hover:opacity-90"
              style={{ borderColor: '#1e2749', color: '#1e2749' }}
            >
              Contact Rae
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
