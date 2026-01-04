export default function PrivacyPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="section" style={{ backgroundColor: 'var(--tdi-navy)' }}>
        <div className="container-default">
          <h1 style={{ color: 'white' }}>Privacy Policy</h1>
          <p className="mt-4" style={{ color: 'white', opacity: 0.8 }}>
            Last updated: January 2025
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="section bg-white">
        <div className="container-default">
          <div className="max-w-3xl mx-auto prose prose-lg">
            <h2>Our Commitment to Privacy</h2>
            <p>
              Teachers Deserve It ("TDI," "we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our services, or engage with our content.
            </p>

            <h2>Information We Collect</h2>
            <h3>Information You Provide</h3>
            <p>We may collect information you voluntarily provide, including:</p>
            <ul>
              <li>Name and email address when you subscribe to our newsletter</li>
              <li>Contact information when you fill out forms</li>
              <li>Professional information (school, role, district) when you request services</li>
              <li>Payment information when you purchase courses or memberships</li>
            </ul>

            <h3>Information Collected Automatically</h3>
            <p>When you visit our website, we may automatically collect:</p>
            <ul>
              <li>Device and browser information</li>
              <li>IP address and location data</li>
              <li>Pages visited and time spent on site</li>
              <li>Referring website information</li>
            </ul>

            <h2>How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide and improve our services</li>
              <li>Send you newsletters, updates, and educational content</li>
              <li>Respond to your inquiries and requests</li>
              <li>Process transactions and send related information</li>
              <li>Analyze usage patterns to improve our website and offerings</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2>Information Sharing</h2>
            <p>
              We do not sell your personal information. We may share information with:
            </p>
            <ul>
              <li>Service providers who assist in operating our website and services</li>
              <li>Partners when you explicitly request services that involve them</li>
              <li>Legal authorities when required by law</li>
            </ul>

            <h2>Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>

            <h2>Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt out of marketing communications</li>
              <li>Withdraw consent where applicable</li>
            </ul>

            <h2>Cookies</h2>
            <p>
              We use cookies and similar technologies to enhance your experience, analyze usage, and assist in our marketing efforts. You can control cookies through your browser settings.
            </p>

            <h2>Children's Privacy</h2>
            <p>
              Our services are designed for educators and educational institutions. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.
            </p>

            <h2>Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our practices, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> privacy@teachersdeserveit.com<br />
              <strong>Website:</strong> teachersdeserveit.com/contact
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
