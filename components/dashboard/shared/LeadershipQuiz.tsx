'use client';

import { useState } from 'react';
import { ChevronRight, RotateCcw, Share2 } from 'lucide-react';

const LEADERSHIP_TYPES = {
  architect: {
    name: 'The Architect',
    color: '#2563EB',
    description: 'You build systems that outlast you. Your strength is creating structures that support your team long after any single conversation ends.',
    strength: 'You see the big picture and design processes that scale.',
    challenge: 'Sometimes the system matters more to you than the person in front of you. Pause and ask: "How are you?" before "Where are we on this?"',
  },
  cheerleader: {
    name: 'The Cheerleader',
    color: '#E8B84B',
    description: 'You see potential everywhere. Your team feels seen because you notice the small wins most leaders miss.',
    strength: 'You create a culture where people want to try new things because they know you will celebrate the effort.',
    challenge: 'Celebration without accountability can feel hollow. Pair your praise with specific feedback: "I loved how you handled that transition -- here is one thing to try next time."',
  },
  strategist: {
    name: 'The Strategist',
    color: '#8B5CF6',
    description: 'You think three moves ahead. You connect today\'s PD to next year\'s school improvement plan without breaking a sweat.',
    strength: 'You turn data into action and action into results.',
    challenge: 'Not everyone thinks in spreadsheets. Translate your strategy into stories: "Here is what this means for a 3rd-grade teacher on a Tuesday."',
  },
  connector: {
    name: 'The Connector',
    color: '#2A9D8F',
    description: 'You build bridges between people. Your hallway conversations are more powerful than most formal PD sessions.',
    strength: 'You know who needs to talk to whom, and you make it happen naturally.',
    challenge: 'Connecting people is not the same as solving their problems. Sometimes the best thing you can do is listen without fixing.',
  },
  guardian: {
    name: 'The Guardian',
    color: '#F97316',
    description: 'You protect your team\'s time, energy, and wellbeing. When district mandates rain down, you are the umbrella.',
    strength: 'Your teachers trust you because you fight for what matters and filter out what does not.',
    challenge: 'Protecting your team from everything can prevent growth. Let some productive discomfort through -- that is where transformation happens.',
  },
  visionary: {
    name: 'The Visionary',
    color: '#EC4899',
    description: 'You paint a picture of what school could be. Your energy is contagious and your teachers catch the spark.',
    strength: 'You inspire action by showing people what is possible, not just what is required.',
    challenge: 'Vision without follow-through creates burnout. For every big idea, assign one small next step that happens this week.',
  },
};

const QUESTIONS = [
  {
    question: 'A new district initiative lands on your desk. Your first instinct is to...',
    options: [
      { text: 'Map out how it fits into existing systems and create an implementation plan', type: 'architect' },
      { text: 'Think about which teachers will be excited and how to frame it as an opportunity', type: 'cheerleader' },
      { text: 'Analyze the data behind it and figure out what success looks like in 12 months', type: 'strategist' },
      { text: 'Decide what to protect your team from and what to actually pass along', type: 'guardian' },
    ],
  },
  {
    question: 'A teacher is struggling with classroom management. You...',
    options: [
      { text: 'Connect them with a colleague who has strong management skills', type: 'connector' },
      { text: 'Share your vision of what their classroom could look like and get them excited', type: 'visionary' },
      { text: 'Celebrate what IS working and build from there', type: 'cheerleader' },
      { text: 'Create a structured support plan with clear milestones', type: 'architect' },
    ],
  },
  {
    question: 'At a staff meeting, you are most likely to...',
    options: [
      { text: 'Share a story about a student or teacher that captures why we do this work', type: 'visionary' },
      { text: 'Walk through data and what it means for our next steps', type: 'strategist' },
      { text: 'Highlight individual teacher wins and give public recognition', type: 'cheerleader' },
      { text: 'Facilitate a conversation between teachers who need to collaborate', type: 'connector' },
    ],
  },
  {
    question: 'When your best teacher comes to you overwhelmed and considering leaving, you...',
    options: [
      { text: 'Remove something from their plate immediately -- protect their energy', type: 'guardian' },
      { text: 'Remind them of the impact they have had and what they would be walking away from', type: 'visionary' },
      { text: 'Connect them with someone who went through similar feelings and came back stronger', type: 'connector' },
      { text: 'Build a sustainability plan so this does not happen again', type: 'architect' },
    ],
  },
  {
    question: 'Your school just got recognized for improvement. You...',
    options: [
      { text: 'Analyze what specifically drove the improvement so you can replicate it', type: 'strategist' },
      { text: 'Throw a celebration and make sure every teacher knows they were part of it', type: 'cheerleader' },
      { text: 'Use the momentum to push for something bigger next year', type: 'visionary' },
      { text: 'Make sure the credit goes to the right people and the right partnerships', type: 'connector' },
    ],
  },
];

type LeadershipType = keyof typeof LEADERSHIP_TYPES;

export default function LeadershipQuiz() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<LeadershipType[]>([]);
  const [result, setResult] = useState<LeadershipType | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);

  const handleAnswer = (type: LeadershipType) => {
    const newAnswers = [...answers, type];
    setAnswers(newAnswers);

    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      // Calculate result
      const counts: Record<string, number> = {};
      newAnswers.forEach(a => { counts[a] = (counts[a] || 0) + 1; });
      const winner = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as LeadershipType;
      setResult(winner);
    }
  };

  const reset = () => {
    setCurrentQ(0);
    setAnswers([]);
    setResult(null);
  };

  if (!showQuiz) {
    return (
      <div
        className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all"
        onClick={() => setShowQuiz(true)}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #E8B84B20, #8B5CF620)' }}>
            <span style={{ fontSize: 28 }}>&#9733;</span>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold" style={{ color: '#1e2749' }}>What Kind of Leader Are You?</h3>
            <p className="text-xs text-gray-500 mt-0.5">5 quick questions. Discover your leadership style and how to use it.</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    );
  }

  if (result) {
    const type = LEADERSHIP_TYPES[result];
    return (
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        <div className="p-6 text-center" style={{ background: `linear-gradient(135deg, ${type.color}15, ${type.color}05)` }}>
          <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: type.color }}>
            <span className="text-2xl text-white">&#9733;</span>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: type.color }}>Your Leadership Style</p>
          <h3 className="text-2xl font-bold mb-2" style={{ color: '#1e2749' }}>{type.name}</h3>
          <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">{type.description}</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-xl" style={{ background: '#F0FDF4' }}>
            <p className="text-xs font-bold uppercase tracking-wider text-green-700 mb-1">Your Strength</p>
            <p className="text-sm text-gray-700 leading-relaxed">{type.strength}</p>
          </div>
          <div className="p-4 rounded-xl" style={{ background: '#FFFBEB' }}>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">Your Growth Edge</p>
            <p className="text-sm text-gray-700 leading-relaxed">{type.challenge}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={reset}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <RotateCcw size={14} /> Take Again
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-white transition-colors"
              style={{ background: type.color }}
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: `I'm ${type.name}!`, text: `My TDI leadership style: ${type.name} -- ${type.description}`, url: 'https://teachersdeserveit.com' });
                }
              }}
            >
              <Share2 size={14} /> Share Result
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = QUESTIONS[currentQ];

  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Question {currentQ + 1} of {QUESTIONS.length}</p>
        <div className="flex gap-1">
          {QUESTIONS.map((_, i) => (
            <div key={i} className="w-6 h-1 rounded-full" style={{ background: i <= currentQ ? '#E8B84B' : '#E5E7EB' }} />
          ))}
        </div>
      </div>
      <h3 className="text-base font-bold mb-4" style={{ color: '#1e2749' }}>{q.question}</h3>
      <div className="space-y-2">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(opt.type as LeadershipType)}
            className="w-full text-left p-4 rounded-xl border border-gray-100 hover:border-[#E8B84B] hover:bg-[#FFF8E7] transition-all text-sm leading-relaxed"
            style={{ color: '#374151' }}
          >
            {opt.text}
          </button>
        ))}
      </div>
    </div>
  );
}
