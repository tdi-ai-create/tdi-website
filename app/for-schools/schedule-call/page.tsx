import { Metadata } from 'next';
import { Section, Container } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Schedule a Call',
  description: 'Book a 30-minute call to explore TDI school partnerships. No pressure, no pitch deck—just a conversation about what your teachers need.',
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
              A 30-minute conversation to explore if TDI is the right fit—no pressure, no pitch deck.
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
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-lg">💬</span>
                    <span>What's working (and not working) with your current PD</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg">🎯</span>
                    <span>Your goals for teacher support and retention</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg">📅</span>
                    <span>Whether TDI's phased model fits your timeline and budget</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="mb-4">You'll walk away with:</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-lg">✅</span>
                    <span>Clarity on next steps (even if TDI isn't the right fit)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg">❓</span>
                    <span>Answers to your questions about pricing and implementation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg">💡</span>
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
