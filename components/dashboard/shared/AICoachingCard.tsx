'use client';

import { useState } from 'react';
import { Sparkles, RefreshCw, Copy, Check } from 'lucide-react';

const COACHING_PROMPTS = [
  {
    category: 'Staff Meeting Opener',
    prompt: 'Based on your team exploring 342 tools this month, try opening your next staff meeting with: "I have been watching our Hub data, and I want to celebrate something -- our team is actively investing in their own growth. Let me share what I am seeing..."',
  },
  {
    category: 'One-on-One Conversation',
    prompt: 'For a teacher who has been using the Hub regularly: "I noticed you have been spending time on the Learning Hub. What have you found most useful? I am curious what is resonating with you."',
  },
  {
    category: 'Team Appreciation',
    prompt: 'Your team earned 127 Field Notes this month. Consider: "I want to take 2 minutes to recognize something. Our team has earned over 100 recognitions on the Hub -- that means people are showing up, trying new things, and growing. That is not nothing."',
  },
  {
    category: 'Encouraging Non-Users',
    prompt: 'For staff who have not logged in: "I wanted to make sure you knew about this resource we have. It is called the TDI Learning Hub -- 5-minute tools you can use Monday morning. Your account is already set up. No pressure, just wanted you to know it is there."',
  },
  {
    category: 'Board Presentation',
    prompt: 'For your next board update: "Our partnership with TDI has resulted in X PD hours earned, Y tools explored, and a team wellness score of Z out of 5. This is professional development that teachers are choosing to engage with -- not being required to sit through."',
  },
  {
    category: 'Wellness Check-In',
    prompt: 'If your team\'s vibe scores are trending down: "I want to check the temperature in here. How are we really doing? Not the professional answer -- the real one. I am asking because I care, and because we have resources if people are struggling."',
  },
];

export default function AICoachingCard() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const current = COACHING_PROMPTS[currentIndex];

  const nextPrompt = () => {
    setCurrentIndex((currentIndex + 1) % COACHING_PROMPTS.length);
    setCopied(false);
  };

  const copyText = () => {
    navigator.clipboard.writeText(current.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1B2A4A, #38618C)' }}>
          <Sparkles className="w-5 h-5 text-[#FFBA06]" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold" style={{ color: '#1e2749' }}>AI Coaching</h3>
          <p className="text-xs text-gray-500">Conversation starters based on your building data</p>
        </div>
        <button
          onClick={nextPrompt}
          className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
          title="Next suggestion"
        >
          <RefreshCw size={16} className="text-gray-400" />
        </button>
      </div>

      <div className="p-4 rounded-xl" style={{ background: '#F9FAFB' }}>
        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#E8B84B' }}>{current.category}</p>
        <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>{current.prompt}</p>
      </div>

      <div className="flex items-center justify-between mt-3">
        <p className="text-[10px] text-gray-400">{currentIndex + 1} of {COACHING_PROMPTS.length} suggestions</p>
        <button
          onClick={copyText}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
          style={{ color: copied ? '#2A9D8F' : '#6B7280', background: copied ? '#D1FAE5' : '#F3F4F6' }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied!' : 'Copy text'}
        </button>
      </div>
    </div>
  );
}
