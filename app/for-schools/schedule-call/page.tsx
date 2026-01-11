import { Metadata } from 'next';
import { Section, Container } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Schedule a Call',
  description: 'Book a 30-minute call to explore TDI school partnerships. No pressure, no pitch deck. Just a conversation about what your teachers need.',
};

export default function ScheduleCallPage() {
  return (
    <>
      {/* Hero Section */}
      <Section background="white" className="pt-16 md:pt-24">
        <Container width="default">
          <div className="text-center mb-12">
            <h1 className="mb-4">Let's Talk About Your School</h1>
            <p className="text-xl" style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
              A 30-minute conversation to explore if TDI is the right fit. No pressure, no pitch deck.
            </p>
          </div>
        </Container>
      </Section>

      {/* Calendly Embed */}
      <Section background="white" className="pt-0">
        <Container width="default">
          <div className="rounded-xl overflow-hidden border border-gray-200" style={{ minHeight: '700px' }}>
            <iframe
              src="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat?embed_domain=teachersdeserveit.com&embed_type=Inline"
              width="100%"
              height="700"
              frameBorder="0"
              title="Schedule a call with Teachers Deserve It"
            />
          </div>
        </Container>
      </Section>

      {/* What to Expect */}
      <Section background="pink">
        <Container width="default">
          <h2 className="text-center mb-8">What Happens on the Call</h2>
          <div className="max-w-2xl mx-auto">
            <p className="text-lg mb-8 text-center">
              This isn't a sales pitch. It's a conversation.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="mb-4">We'll talk about:</h4>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#ffba06' }}>
                      <svg className="w-4 h-4" fill="#1e2749" viewBox="0 0 24 24">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                      </svg>
                    </div>
                    <span>What's working (and not working) with your current PD</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#ffba06' }}>
                      <svg className="w-4 h-4" fill="#1e2749" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </div>
                    <span>Your goals for teacher support and retention</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#ffba06' }}>
                      <svg className="w-4 h-4" fill="#1e2749" viewBox="0 0 24 24">
                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
                      </svg>
                    </div>
                    <span>Whether TDI's phased model fits your timeline and budget</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="mb-4">You'll walk away with:</h4>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#ffba06' }}>
                      <svg className="w-4 h-4" fill="#1e2749" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <span>Clarity on next steps (even if TDI isn't the right fit)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#ffba06' }}>
                      <svg className="w-4 h-4" fill="#1e2749" viewBox="0 0 24 24">
                        <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>
                      </svg>
                    </div>
                    <span>Answers to your questions about pricing and implementation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#ffba06' }}>
                      <svg className="w-4 h-4" fill="#1e2749" viewBox="0 0 24 24">
                        <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6A4.997 4.997 0 017 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/>
                      </svg>
                    </div>
                    <span>A personalized recommendation based on your school's needs</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 p-6 rounded-xl text-center" style={{ backgroundColor: 'white' }}>
              <p className="font-semibold">Time: 30 minutes</p>
              <p style={{ color: 'var(--tdi-charcoal)', opacity: 0.7 }}>
                With: Rae Hughart, Founder & CEO
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
