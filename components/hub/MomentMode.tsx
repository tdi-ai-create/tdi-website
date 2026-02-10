'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Wind, Heart, Sparkles, BookOpen } from 'lucide-react';
import { incrementHardDayCount } from '@/lib/hub-auth';
import { useMomentMode } from './MomentModeContext';

type MomentState = 'entry' | 'pause' | 'affirmation' | 'gentle' | 'journal';
type JournalTab = 'private' | 'anonymous';

interface MomentModeProps {
  isOpen: boolean;
  onClose: () => void;
}

// Placeholder affirmations (to be replaced with approved content)
const AFFIRMATIONS = [
  'You are making a difference, even on the hard days.',
  'Your dedication matters more than you know.',
  'It is okay to take things one moment at a time.',
  'You bring light to your students every single day.',
  'Rest is not a reward. It is a requirement.',
  'You are doing better than you think.',
  'Your patience today plants seeds for tomorrow.',
  'This feeling will pass. Your impact will not.',
  'Taking care of yourself is part of the job.',
  'You were made for this, even when it feels hard.',
];

const GENTLE_TOOLS = [
  {
    title: 'Two-Minute Reset',
    description: 'A quick breathing exercise to center yourself',
    type: 'quick-win',
  },
  {
    title: 'Desk Stretch Routine',
    description: 'Simple stretches you can do without leaving your space',
    type: 'quick-win',
  },
  {
    title: 'Grounding Exercise',
    description: 'Notice 5 things you can see, 4 you can touch...',
    type: 'quick-win',
  },
  {
    title: 'Positive Note Template',
    description: 'Write a quick note to yourself for later',
    type: 'download',
  },
  {
    title: 'End of Day Reflection',
    description: 'Three questions to close out a tough day',
    type: 'download',
  },
  {
    title: 'Tomorrow is New',
    description: 'A simple planning template for fresh starts',
    type: 'download',
  },
];

export default function MomentMode({ isOpen, onClose }: MomentModeProps) {
  const [state, setState] = useState<MomentState>('entry');
  const [affirmationIndex, setAffirmationIndex] = useState(0);
  const [journalTab, setJournalTab] = useState<JournalTab>('private');
  const [privateJournal, setPrivateJournal] = useState('');
  const [anonymousVent, setAnonymousVent] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds
  const [hasIncremented, setHasIncremented] = useState(false);

  // Access global Moment Mode context to suppress notifications
  const { setMomentModeActive } = useMomentMode();

  // Handle escape key
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';

      // Signal to global context that Moment Mode is active
      // This suppresses all toast notifications and popups
      setMomentModeActive(true);

      // Increment hard day count only once per open
      if (!hasIncremented) {
        incrementHardDayCount();
        setHasIncremented(true);
      }
    } else {
      // Signal that Moment Mode is no longer active
      setMomentModeActive(false);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape, hasIncremented, setMomentModeActive]);

  // Timer for breathing exercise
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (state === 'pause' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state, timeRemaining]);

  const handleClose = () => {
    setState('entry');
    setTimeRemaining(300);
    setHasIncremented(false);
    onClose();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const cycleAffirmation = () => {
    setAffirmationIndex((prev) => (prev + 1) % AFFIRMATIONS.length);
  };

  const handleAnonymousSubmit = () => {
    // In a real implementation, this would send to a secure endpoint
    // For now, just clear and show confirmation
    setAnonymousVent('');
    alert('Your message has been received. Take care of yourself.');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in-overlay"
      style={{ backgroundColor: 'rgba(43, 58, 103, 0.95)' }}
    >
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
        aria-label="Close Moment Mode"
      >
        <X size={24} />
      </button>

      {/* Content Card */}
      <div
        className="w-full max-w-md bg-white rounded-xl p-8 shadow-2xl"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Entry State */}
        {state === 'entry' && (
          <div className="text-center">
            <h2
              className="text-2xl font-semibold mb-4"
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                color: '#2B3A67',
              }}
            >
              Moment Mode.
            </h2>
            <p
              className="text-gray-600 mb-6"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Take a breath. This is a space just for you.
              Choose what feels right.
            </p>
            <p
              className="text-sm text-gray-400 mb-8"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Nothing is tracked individually. This is a sacred space.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => setState('pause')}
                className="w-full flex items-center justify-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-[#E8B84B] hover:bg-[#FFF8E7] transition-all"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                <Wind size={20} style={{ color: '#2B3A67' }} />
                <span style={{ color: '#2B3A67' }}>Breathing exercise</span>
              </button>

              <button
                onClick={() => setState('affirmation')}
                className="w-full flex items-center justify-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-[#E8B84B] hover:bg-[#FFF8E7] transition-all"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                <Heart size={20} style={{ color: '#2B3A67' }} />
                <span style={{ color: '#2B3A67' }}>Show me an affirmation</span>
              </button>

              <button
                onClick={() => setState('gentle')}
                className="w-full flex items-center justify-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-[#E8B84B] hover:bg-[#FFF8E7] transition-all"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                <Sparkles size={20} style={{ color: '#2B3A67' }} />
                <span style={{ color: '#2B3A67' }}>Gentle tools</span>
              </button>

              <button
                onClick={() => setState('journal')}
                className="w-full flex items-center justify-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-[#E8B84B] hover:bg-[#FFF8E7] transition-all"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                <BookOpen size={20} style={{ color: '#2B3A67' }} />
                <span style={{ color: '#2B3A67' }}>Write it out</span>
              </button>
            </div>
          </div>
        )}

        {/* Breathing/Pause State */}
        {state === 'pause' && (
          <div className="text-center">
            <button
              onClick={() => setState('entry')}
              className="text-sm text-gray-400 hover:text-gray-600 mb-6"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Back
            </button>

            <div className="relative w-48 h-48 mx-auto mb-8">
              {/* Breathing circle */}
              <div
                className="absolute inset-0 rounded-full animate-breathe"
                style={{ backgroundColor: '#E8B84B' }}
              />
              <div
                className="absolute inset-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'white' }}
              >
                <span
                  className="text-[28px] font-semibold"
                  style={{
                    fontFamily: "'Source Serif 4', Georgia, serif",
                    color: '#2B3A67',
                  }}
                >
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>

            <p
              className="text-gray-600 mb-2"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Breathe in as it grows. Breathe out as it shrinks.
            </p>
            <p
              className="text-sm text-gray-400"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Take your time. There is no rush.
            </p>

            {timeRemaining === 0 && (
              <button
                onClick={() => setTimeRemaining(300)}
                className="mt-6 hub-btn-primary"
              >
                Start again
              </button>
            )}
          </div>
        )}

        {/* Affirmation State */}
        {state === 'affirmation' && (
          <div className="text-center">
            <button
              onClick={() => setState('entry')}
              className="text-sm text-gray-400 hover:text-gray-600 mb-6"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Back
            </button>

            <div
              className="p-8 rounded-lg mb-8"
              style={{ backgroundColor: '#FFF8E7' }}
            >
              <p
                className="text-xl leading-relaxed"
                style={{
                  fontFamily: "'Source Serif 4', Georgia, serif",
                  color: '#2B3A67',
                }}
              >
                {AFFIRMATIONS[affirmationIndex]}
              </p>
            </div>

            <button
              onClick={cycleAffirmation}
              className="hub-btn-secondary"
            >
              Show me another
            </button>
          </div>
        )}

        {/* Gentle Tools State */}
        {state === 'gentle' && (
          <div>
            <button
              onClick={() => setState('entry')}
              className="text-sm text-gray-400 hover:text-gray-600 mb-4"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Back
            </button>

            <h3
              className="text-xl font-semibold mb-6"
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                color: '#2B3A67',
              }}
            >
              Gentle tools for right now
            </h3>

            <div className="space-y-3">
              {GENTLE_TOOLS.map((tool, index) => (
                <button
                  key={index}
                  className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-[#E8B84B] hover:bg-[#FFF8E7] transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p
                        className="font-medium"
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          color: '#2B3A67',
                        }}
                      >
                        {tool.title}
                      </p>
                      <p
                        className="text-sm text-gray-500 mt-1"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {tool.description}
                      </p>
                    </div>
                    <span
                      className="text-xs px-2 py-1 rounded"
                      style={{
                        backgroundColor: tool.type === 'quick-win' ? '#E8B84B' : '#2B3A67',
                        color: tool.type === 'quick-win' ? '#2B3A67' : 'white',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {tool.type === 'quick-win' ? 'Quick Win' : 'Download'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Journal State */}
        {state === 'journal' && (
          <div>
            <button
              onClick={() => setState('entry')}
              className="text-sm text-gray-400 hover:text-gray-600 mb-4"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Back
            </button>

            <h3
              className="text-xl font-semibold mb-6"
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                color: '#2B3A67',
              }}
            >
              Write it out
            </h3>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setJournalTab('private')}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                  journalTab === 'private'
                    ? 'border-[#E8B84B] text-[#2B3A67]'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Private journal
              </button>
              <button
                onClick={() => setJournalTab('anonymous')}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                  journalTab === 'anonymous'
                    ? 'border-[#E8B84B] text-[#2B3A67]'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Anonymous vent
              </button>
            </div>

            {journalTab === 'private' && (
              <div>
                <p
                  className="text-sm text-gray-500 mb-4"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  This stays on your device only. Nothing is saved to the cloud.
                </p>
                <textarea
                  value={privateJournal}
                  onChange={(e) => setPrivateJournal(e.target.value)}
                  placeholder="Write whatever you need to get out..."
                  className="w-full h-40 p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-[#E8B84B]"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                />
              </div>
            )}

            {journalTab === 'anonymous' && (
              <div>
                <p
                  className="text-sm text-gray-500 mb-4"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Send an anonymous message. No name, no tracking, just release.
                </p>
                <textarea
                  value={anonymousVent}
                  onChange={(e) => setAnonymousVent(e.target.value)}
                  placeholder="Let it out..."
                  className="w-full h-40 p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-[#E8B84B] mb-4"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                />
                <button
                  onClick={handleAnonymousSubmit}
                  disabled={!anonymousVent.trim()}
                  className="w-full hub-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send anonymously
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
