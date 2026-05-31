'use client';

import { useState } from 'react';
import { User, Bell, HelpCircle, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useHub } from '@/components/hub/HubContext';
import { useTranslation } from '@/lib/hub/useTranslation';

const FAQ_SECTIONS = [
  {
    title: 'Getting Started',
    items: [
      {
        q: 'How do I navigate the Learning Hub?',
        a: 'Your dashboard is home base. From there you can browse courses, quick wins, and community conversations. Use the sidebar on desktop or the menu on mobile to jump between sections.',
      },
      {
        q: 'What is a Quick Win?',
        a: 'Quick Wins are downloadable PDF resources you can use immediately - no course commitment required. They cover everything from classroom tools to communication templates to wellness strategies.',
      },
      {
        q: 'How do courses work?',
        a: 'Each course is broken into short lessons you can complete at your own pace. Your progress is saved automatically. When you finish all lessons in a course, you earn a certificate.',
      },
      {
        q: 'What is the Conversation tab on courses and quick wins?',
        a: 'The Conversation section is where educators share how they used a resource - whether they tried it, adapted it, or got stuck. It is peer-to-peer sharing, not instructor-led. Your story helps the next teacher.',
      },
      {
        q: 'What is the Q&A tab?',
        a: 'Q&A is where you can ask questions about a course or quick win and get answers from other educators in the community. Anyone can reply - it is a space for collaborative problem-solving.',
      },
    ],
  },
  {
    title: 'Membership & Billing',
    items: [
      {
        q: 'What are the membership tiers?',
        a: 'Free gives you a rotating selection of content each week plus community access. Essentials ($5/mo) expands your course access. Professional ($10/mo) unlocks the full library. All-Access ($25/mo) gives you everything in the Hub.',
      },
      {
        q: 'Can I cancel or change my plan?',
        a: 'Yes, anytime. You can upgrade, downgrade, or cancel from your account settings. Changes take effect at the end of your current billing period. Your progress and certificates are never lost.',
      },
      {
        q: 'Does my school or district qualify for group access?',
        a: 'Yes! TDI partners with schools and districts to provide Hub access for all staff. Visit teachersdeserveit.com/for-schools to learn more about partnership options.',
      },
    ],
  },
  {
    title: 'Certificates & PD Credit',
    items: [
      {
        q: 'How do I earn a certificate?',
        a: 'Complete all lessons in a course and your certificate is generated automatically. You can download it from your profile under the Recognitions tab.',
      },
      {
        q: 'Can I use certificates for PD credit?',
        a: 'Each course lists its estimated PD hours. Your certificate documents those hours, the course title, and your completion date. Check with your district on their specific PD credit requirements.',
      },
    ],
  },
  {
    title: 'Account & Privacy',
    items: [
      {
        q: 'How do I update my profile?',
        a: 'Go to Settings then Profile. You can update your display name, role, school, and profile photo.',
      },
      {
        q: 'Is my data private?',
        a: 'Your personal information is never shared. Your community contributions (conversations and Q&A posts) use your display name. Your course progress, certificates, and account details are private to you.',
      },
      {
        q: 'How do I get help with something not listed here?',
        a: 'Use the Desi chat widget on any page - she can answer most questions instantly. For account-specific issues, visit teachersdeserveit.com/contact.',
      },
    ],
  },
];

function FAQAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div>
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} style={{ borderBottom: i < items.length - 1 ? '1px solid #E5E7EB' : 'none' }}>
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between py-3.5 text-left"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <span className="font-medium text-gray-900 text-sm pr-4">{item.q}</span>
              <ChevronDown
                size={15}
                className="flex-shrink-0 text-gray-400 transition-transform"
                style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            </button>
            {isOpen && (
              <p
                className="text-gray-600 text-sm pb-4 leading-relaxed"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {item.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function HelpPage() {
  const { user } = useHub();
  const { tUI } = useTranslation();

  return (
    <div style={{ background: '#F0EEE9', minHeight: '100vh' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 md:px-8 pt-8 pb-6">
          <h1
            className="text-2xl font-bold mb-1"
            style={{ color: '#1B2A4A', fontFamily: "'Source Serif 4', Georgia, serif" }}
          >
            {tUI('Help & FAQ')}
          </h1>
          <p className="text-sm" style={{ color: '#6B7280', fontFamily: "'DM Sans', sans-serif" }}>
            {tUI('Answers to common questions about the Learning Hub.')}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-6">
        {/* Settings-level tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 pb-1">
          <Link
            href="/hub/settings/profile"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition-colors"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <User size={18} />
            {tUI('Profile')}
          </Link>
          <Link
            href="/hub/settings/notifications"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition-colors"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <Bell size={18} />
            {tUI('Notifications')}
          </Link>
          <Link
            href="/hub/settings/help"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors"
            style={{
              borderColor: '#E8B84B',
              color: '#2B3A67',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <HelpCircle size={18} />
            {tUI('Help & FAQ')}
          </Link>
        </div>

        {/* FAQ sections */}
        <div className="space-y-6">
          {FAQ_SECTIONS.map((section) => (
            <div
              key={section.title}
              className="bg-white rounded-xl p-5 md:p-6"
              style={{ border: '0.5px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            >
              <h2
                className="font-bold text-base mb-3"
                style={{ color: '#1B2A4A', fontFamily: "'Source Serif 4', Georgia, serif" }}
              >
                {tUI(section.title)}
              </h2>
              <FAQAccordion items={section.items} />
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div
          className="mt-8 bg-white rounded-xl p-6 text-center"
          style={{ border: '0.5px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
        >
          <p
            className="text-sm font-semibold mb-1"
            style={{ color: '#1B2A4A', fontFamily: "'DM Sans', sans-serif" }}
          >
            {tUI('Still have questions?')}
          </p>
          <p
            className="text-xs mb-4"
            style={{ color: '#6B7280', fontFamily: "'DM Sans', sans-serif" }}
          >
            {tUI('Our team is here to help.')}
          </p>
          <Link
            href="https://www.teachersdeserveit.com/contact"
            className="inline-block px-6 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
            style={{
              background: '#E8B84B',
              color: '#1B2A4A',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {tUI('Contact Us')}
          </Link>
        </div>
      </div>
    </div>
  );
}
