export default function SecurityPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="section" style={{ backgroundColor: 'var(--tdi-navy)' }}>
        <div className="container-default">
          <h1 style={{ color: 'white' }}>Security & Data Protection</h1>
          <p className="mt-4 text-xl" style={{ color: 'white', opacity: 0.9 }}>
            Your trust is our priority. Here's how we protect your data.
          </p>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="section py-12" style={{ backgroundColor: 'var(--tdi-navy)' }}>
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-2xl font-bold mb-2" style={{ color: 'white' }}>SSL Encrypted</p>
              <p style={{ color: 'white', opacity: 0.8 }}>All data transmitted securely</p>
            </div>
            <div>
              <p className="text-2xl font-bold mb-2" style={{ color: 'white' }}>FERPA Aware</p>
              <p style={{ color: 'white', opacity: 0.8 }}>Education privacy standards respected</p>
            </div>
            <div>
              <p className="text-2xl font-bold mb-2" style={{ color: 'white' }}>No Data Selling</p>
              <p style={{ color: 'white', opacity: 0.8 }}>Your information stays yours</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section bg-white">
        <div className="container-default">
          <div className="max-w-3xl mx-auto">
            <h2 className="mb-8">Our Security Practices</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xl mb-3">Data Encryption</h3>
                <p style={{ opacity: 0.7 }}>
                  All data transmitted between your browser and our servers is encrypted using industry-standard SSL/TLS protocols. This ensures that your information cannot be intercepted or read by unauthorized parties.
                </p>
              </div>

              <div>
                <h3 className="text-xl mb-3">Secure Infrastructure</h3>
                <p style={{ opacity: 0.7 }}>
                  Our website and services are hosted on secure, enterprise-grade infrastructure with regular security updates, monitoring, and backup procedures.
                </p>
              </div>

              <div>
                <h3 className="text-xl mb-3">Access Controls</h3>
                <p style={{ opacity: 0.7 }}>
                  We implement strict access controls to ensure that only authorized personnel can access sensitive systems and data. All access is logged and regularly audited.
                </p>
              </div>

              <div>
                <h3 className="text-xl mb-3">Payment Security</h3>
                <p style={{ opacity: 0.7 }}>
                  All payment processing is handled by trusted, PCI-compliant payment processors. We never store your full credit card information on our servers.
                </p>
              </div>

              <div>
                <h3 className="text-xl mb-3">Third-Party Services</h3>
                <p style={{ opacity: 0.7 }}>
                  We carefully vet all third-party services we use and ensure they meet our security standards. Our primary partners include Thinkific (learning platform), Substack (newsletter), and Vercel (website hosting).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Schools */}
      <section className="section" style={{ backgroundColor: 'var(--tdi-pink)' }}>
        <div className="container-default">
          <div className="max-w-3xl mx-auto">
            <h2 className="mb-8">For Schools & Districts</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl mb-3">FERPA Compliance</h3>
                <p style={{ opacity: 0.7 }}>
                  We understand the importance of student and educator data privacy in educational settings. While TDI does not directly collect student data, we design our systems with FERPA principles in mind and are committed to supporting your compliance requirements.
                </p>
              </div>

              <div>
                <h3 className="text-xl mb-3">Data Agreements</h3>
                <p style={{ opacity: 0.7 }}>
                  For school and district partnerships, we provide Data Protection Agreements (DPAs) that outline our commitments and responsibilities regarding data handling.
                </p>
              </div>

              <div>
                <h3 className="text-xl mb-3">School Network Compatibility</h3>
                <p style={{ opacity: 0.7 }}>
                  Our website and services are designed to work with common school network filters and security systems. If you experience access issues, please contact your IT department or reach out to us.
                </p>
              </div>

              <div>
                <h3 className="text-xl mb-3">IT Administrator Support</h3>
                <p style={{ opacity: 0.7 }}>
                  We're happy to provide technical documentation, answer security questionnaires, or schedule calls with your IT team. Contact us at security@teachersdeserveit.com.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Collect */}
      <section className="section bg-white">
        <div className="container-default">
          <div className="max-w-3xl mx-auto">
            <h2 className="mb-8">What We Collect (And Don't)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="card" style={{ borderTop: '4px solid var(--tdi-navy)' }}>
                <h3 className="text-xl mb-4">What We Collect</h3>
                <ul className="space-y-2" style={{ opacity: 0.7 }}>
                  <li>Email address (for newsletters and accounts)</li>
                  <li>Name and professional role</li>
                  <li>School/district name (for partnerships)</li>
                  <li>Course progress and completion data</li>
                  <li>Basic analytics (pages visited, etc.)</li>
                </ul>
              </div>

              <div className="card" style={{ borderTop: '4px solid var(--tdi-coral)' }}>
                <h3 className="text-xl mb-4">What We Don't Collect</h3>
                <ul className="space-y-2" style={{ opacity: 0.7 }}>
                  <li>Student personally identifiable information</li>
                  <li>Social security numbers</li>
                  <li>Financial information (handled by payment processors)</li>
                  <li>Sensitive health information</li>
                  <li>Location tracking data</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="section" style={{ backgroundColor: 'var(--tdi-navy)' }}>
        <div className="container-default text-center">
          <h2 className="mb-4" style={{ color: 'white' }}>Questions About Security?</h2>
          <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: 'white', opacity: 0.8 }}>
            We're happy to answer questions from IT administrators, provide documentation, or complete security questionnaires.
          </p>
          <a 
            href="mailto:security@teachersdeserveit.com" 
            className="btn-primary inline-block"
          >
            Contact Our Team
          </a>
        </div>
      </section>
    </main>
  );
}
