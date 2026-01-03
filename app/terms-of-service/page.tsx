import { Metadata } from 'next';
import { Section, Container } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for the Teachers Deserve It website. Please read before using our site.',
};

export default function TermsOfServicePage() {
  return (
    <Section background="white" className="pt-16 md:pt-24">
      <Container width="narrow">
        <h1 className="mb-8">Terms of Service</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--tdi-charcoal)', opacity: 0.6 }}>
          Last Updated: January 2026
        </p>

        <div className="prose prose-lg max-w-none">
          <h2>Acceptance of Terms</h2>
          <p>
            By accessing and using the Teachers Deserve It website (teachersdeserveit.com), you accept 
            and agree to be bound by these Terms of Service. If you do not agree to these terms, please 
            do not use our website.
          </p>

          <h2>Use of Website</h2>
          <p>You agree to use this website only for lawful purposes and in a way that does not:</p>
          <ul>
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on the rights of others</li>
            <li>Interfere with or disrupt the website's operation</li>
            <li>Attempt to gain unauthorized access to any part of the website</li>
          </ul>

          <h2>Intellectual Property</h2>
          <p>
            All content on this website, including text, graphics, logos, images, and software, is the 
            property of Teachers Deserve It LLC and is protected by copyright and other intellectual 
            property laws. You may not reproduce, distribute, modify, or create derivative works from 
            any content without our express written permission.
          </p>

          <h2>Third-Party Links</h2>
          <p>
            Our website contains links to third-party websites and services, including:
          </p>
          <ul>
            <li>Thinkific (Learning Hub and courses)</li>
            <li>Substack (blog and newsletter)</li>
            <li>Calendly (scheduling)</li>
            <li>Social media platforms</li>
          </ul>
          <p>
            These third-party sites have their own terms of service and privacy policies. We are not 
            responsible for the content, practices, or availability of these external sites.
          </p>

          <h2>Learning Hub Terms</h2>
          <p>
            Access to our Learning Hub (hosted on Thinkific) is subject to separate terms of service 
            provided by Thinkific and our Learning Hub-specific policies. By accessing the Learning Hub, 
            you agree to those additional terms.
          </p>

          <h2>Disclaimer</h2>
          <p>
            The information provided on this website is for general informational purposes only. While 
            we strive to provide accurate and up-to-date information, we make no warranties or 
            representations about the accuracy, completeness, or suitability of the content.
          </p>
          <p>
            Teachers Deserve It provides professional development resources, but our content is not a 
            substitute for professional educational, legal, or medical advice.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, Teachers Deserve It LLC and its officers, directors, 
            employees, and agents shall not be liable for any indirect, incidental, special, consequential, 
            or punitive damages arising out of or relating to your use of this website.
          </p>

          <h2>Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless Teachers Deserve It LLC from any claims, damages, 
            losses, or expenses arising from your use of the website or violation of these terms.
          </p>

          <h2>Governing Law</h2>
          <p>
            These Terms of Service are governed by and construed in accordance with the laws of the 
            State of Illinois, without regard to its conflict of law provisions.
          </p>

          <h2>Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms of Service at any time. Changes will be effective 
            immediately upon posting to the website. Your continued use of the website after any changes 
            constitutes acceptance of the new terms.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at:{' '}
            <a href="mailto:info@teachersdeserveit.com">info@teachersdeserveit.com</a>
          </p>
        </div>
      </Container>
    </Section>
  );
}
