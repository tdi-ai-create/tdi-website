export default function TermsPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="section" style={{ backgroundColor: 'var(--tdi-navy)' }}>
        <div className="container-default">
          <h1 style={{ color: 'white' }}>Terms of Service</h1>
          <p className="mt-4" style={{ color: 'white', opacity: 0.8 }}>
            Last updated: January 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="section bg-white">
        <div className="container-default">
          <div className="max-w-3xl mx-auto prose prose-lg">
            <h2>Agreement to Terms</h2>
            <p>
              By accessing or using the Teachers Deserve It ("TDI") website, services, or content, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>

            <h2>Description of Services</h2>
            <p>
              TDI provides professional development resources, courses, coaching, and related services for educators, paraprofessionals, and educational institutions. Our services include but are not limited to:
            </p>
            <ul>
              <li>Online courses and learning materials</li>
              <li>Newsletter and blog content</li>
              <li>Podcast content</li>
              <li>School and district partnership programs</li>
              <li>Live workshops and coaching sessions</li>
            </ul>

            <h2>User Accounts</h2>
            <p>
              Some services may require you to create an account. You are responsible for:
            </p>
            <ul>
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>

            <h2>Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use our services for any unlawful purpose</li>
              <li>Share, distribute, or reproduce our paid content without authorization</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt our services</li>
              <li>Impersonate any person or entity</li>
            </ul>

            <h2>Intellectual Property</h2>
            <p>
              All content, materials, and resources provided by TDI are protected by copyright and other intellectual property laws. You may not reproduce, distribute, modify, or create derivative works without our express written permission, except as permitted for personal, non-commercial educational use.
            </p>

            <h2>Payment and Refunds</h2>
            <p>
              For paid services:
            </p>
            <ul>
              <li>Prices are listed in US dollars unless otherwise specified</li>
              <li>Payment is due at the time of purchase or as specified in your agreement</li>
              <li>Refund policies vary by service and will be communicated at the time of purchase</li>
              <li>School and district partnerships are governed by separate agreements</li>
            </ul>

            <h2>Disclaimer of Warranties</h2>
            <p>
              Our services are provided "as is" without warranties of any kind, either express or implied. We do not guarantee that our services will be uninterrupted, error-free, or meet your specific requirements.
            </p>

            <h2>Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, TDI shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.
            </p>

            <h2>Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless TDI and its officers, directors, employees, and agents from any claims, damages, or expenses arising from your use of our services or violation of these terms.
            </p>

            <h2>Termination</h2>
            <p>
              We reserve the right to suspend or terminate your access to our services at any time, with or without cause or notice, if we believe you have violated these terms.
            </p>

            <h2>Changes to Terms</h2>
            <p>
              We may modify these Terms of Service at any time. Continued use of our services after changes constitutes acceptance of the new terms.
            </p>

            <h2>Governing Law</h2>
            <p>
              These terms shall be governed by and construed in accordance with the laws of the State of Illinois, without regard to its conflict of law provisions.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have questions about these Terms of Service, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> legal@teachersdeserveit.com<br />
              <strong>Website:</strong> teachersdeserveit.com/contact
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
