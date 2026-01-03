import { Metadata } from 'next';
import { Section, Container } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Teachers Deserve It privacy policy. Learn how we collect, use, and protect your information.',
};

export default function PrivacyPolicyPage() {
  return (
    <Section background="white" className="pt-16 md:pt-24">
      <Container width="narrow">
        <h1 className="mb-8">Privacy Policy</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--tdi-charcoal)', opacity: 0.6 }}>
          Last Updated: January 2026
        </p>

        <div className="prose prose-lg max-w-none">
          <h2>Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you fill out a contact form, 
            sign up for our newsletter, or communicate with us. This may include:
          </p>
          <ul>
            <li>Name and email address</li>
            <li>Your role in education</li>
            <li>School or district information</li>
            <li>Messages you send us</li>
          </ul>
          <p>
            We also automatically collect certain information when you visit our website, including your 
            IP address, browser type, and pages visited. We use Google Analytics to understand how 
            visitors interact with our site.
          </p>

          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Respond to your inquiries and requests</li>
            <li>Send you information about our services</li>
            <li>Improve our website and services</li>
            <li>Analyze usage patterns and trends</li>
          </ul>

          <h2>Information Sharing</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. We may share your 
            information with service providers who assist us in operating our website and conducting our 
            business, such as:
          </p>
          <ul>
            <li>Formspree (form processing)</li>
            <li>Vercel (website hosting)</li>
            <li>Google Analytics (website analytics)</li>
          </ul>
          <p>
            We may also disclose your information if required by law or to protect our rights.
          </p>

          <h2>Data Retention</h2>
          <p>
            We retain your personal information for as long as necessary to fulfill the purposes for which 
            it was collected, including to satisfy any legal, accounting, or reporting requirements.
          </p>

          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Request access to your personal information</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Opt out of marketing communications</li>
          </ul>

          <h2>Cookies</h2>
          <p>
            We use cookies and similar tracking technologies to analyze website traffic and improve your 
            experience. You can control cookies through your browser settings.
          </p>

          <h2>Third-Party Links</h2>
          <p>
            Our website contains links to third-party sites, including our Learning Hub (hosted on Thinkific), 
            blog (hosted on Substack), and scheduling tool (Calendly). These sites have their own privacy 
            policies, and we are not responsible for their content or practices.
          </p>

          <h2>Children's Privacy</h2>
          <p>
            Our website is intended for educators and school administrators. We do not knowingly collect 
            personal information from children under 13.
          </p>

          <h2>Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of any changes by 
            posting the new policy on this page and updating the "Last Updated" date.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:{' '}
            <a href="mailto:info@teachersdeserveit.com">info@teachersdeserveit.com</a>
          </p>
        </div>
      </Container>
    </Section>
  );
}
