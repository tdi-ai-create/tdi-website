'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Wind, Heart, Sparkles, BookOpen, Download, UserCircle, Send, Heart as HeartIcon, Clock } from 'lucide-react';
import { incrementHardDayCount } from '@/lib/hub-auth';
import { useMomentMode } from './MomentModeContext';
import { useHub } from './HubContext';
import { getSupabase } from '@/lib/supabase';

type MomentState = 'entry' | 'pause' | 'affirmation' | 'gentle' | 'journal';
type JournalTab = 'private' | 'anonymous';
type BreathPhase = 'inhale' | 'hold1' | 'exhale' | 'hold2' | 'complete';

interface MomentModeProps {
  isOpen: boolean;
  onClose: () => void;
}

// Warm color palette for affirmation icons
const AFFIRMATION_COLORS = [
  '#7C9CBF', // soft blue
  '#E8B84B', // soft gold
  '#6BA368', // soft green
  '#9B7CB8', // soft purple
  '#E8927C', // soft coral
  '#5BBEC4', // soft teal
];

// Placeholder affirmations (fallback if no tips found)
const FALLBACK_AFFIRMATIONS = [
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

// Box breathing constants
const BREATH_DURATION = 4; // 4 seconds per phase
const TOTAL_CYCLES = 6; // 6 cycles of box breathing

export default function MomentMode({ isOpen, onClose }: MomentModeProps) {
  const { user } = useHub();
  const [state, setState] = useState<MomentState>('entry');
  const [journalTab, setJournalTab] = useState<JournalTab>('private');
  const [privateJournal, setPrivateJournal] = useState('');
  const [anonymousVent, setAnonymousVent] = useState('');
  const [hasIncremented, setHasIncremented] = useState(false);

  // 3-minute global timer
  const [globalTimer, setGlobalTimer] = useState(180); // 3 minutes in seconds
  const [showTimerNudge, setShowTimerNudge] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Box breathing state
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('inhale');
  const [breathCycle, setBreathCycle] = useState(1);
  const [phaseTimer, setPhaseTimer] = useState(BREATH_DURATION);
  const breathingRef = useRef<NodeJS.Timeout | null>(null);

  // Affirmation state
  const [affirmations, setAffirmations] = useState<string[]>(FALLBACK_AFFIRMATIONS);
  const [affirmationIndex, setAffirmationIndex] = useState(0);
  const [affirmationColor, setAffirmationColor] = useState(AFFIRMATION_COLORS[0]);
  const [affirmationSide, setAffirmationSide] = useState<'left' | 'right'>('left');
  const [affirmationKey, setAffirmationKey] = useState(0); // for fade animation

  // Note to team state
  const [noteText, setNoteText] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [noteSent, setNoteSent] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);

  // Access global Moment Mode context to suppress notifications
  const { setMomentModeActive } = useMomentMode();

  // Fetch affirmations from TDI tips on mount
  useEffect(() => {
    async function fetchAffirmations() {
      try {
        const supabase = getSupabase();
        const { data } = await supabase
          .from('hub_tdi_tips')
          .select('content')
          .eq('approval_status', 'approved')
          .or('category.eq.motivation,category.eq.self-care')
          .limit(50);

        if (data && data.length > 0) {
          setAffirmations(data.map((t) => t.content));
        }
      } catch {
        // Use fallback affirmations
      }
    }
    fetchAffirmations();
  }, []);

  // Handle escape key
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  }, []);

  // Start/reset global timer when modal opens
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      setMomentModeActive(true);

      // Reset timer on open
      setGlobalTimer(180);
      setShowTimerNudge(false);

      // Start the global timer
      timerRef.current = setInterval(() => {
        setGlobalTimer((prev) => {
          if (prev <= 1) {
            setShowTimerNudge(true);
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Increment hard day count only once per open
      if (!hasIncremented) {
        incrementHardDayCount();
        setHasIncremented(true);
      }
    } else {
      setMomentModeActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, handleEscape, hasIncremented, setMomentModeActive]);

  // Box breathing timer
  useEffect(() => {
    if (state === 'pause' && breathPhase !== 'complete') {
      breathingRef.current = setInterval(() => {
        setPhaseTimer((prev) => {
          if (prev <= 1) {
            // Move to next phase
            setBreathPhase((currentPhase) => {
              if (currentPhase === 'inhale') return 'hold1';
              if (currentPhase === 'hold1') return 'exhale';
              if (currentPhase === 'exhale') return 'hold2';
              if (currentPhase === 'hold2') {
                // End of cycle
                setBreathCycle((currentCycle) => {
                  if (currentCycle >= TOTAL_CYCLES) {
                    return currentCycle; // Stay at max
                  }
                  return currentCycle + 1;
                });
                // Check if we completed all cycles
                if (breathCycle >= TOTAL_CYCLES) {
                  return 'complete';
                }
                return 'inhale';
              }
              return currentPhase;
            });
            return BREATH_DURATION;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (breathingRef.current) clearInterval(breathingRef.current);
    };
  }, [state, breathPhase, breathCycle]);

  const handleClose = () => {
    setState('entry');
    resetBreathing();
    setHasIncremented(false);
    setShowTimerNudge(false);
    setNoteText('');
    setNoteSent(false);
    setShowNoteForm(false);
    if (timerRef.current) clearInterval(timerRef.current);
    onClose();
  };

  const resetBreathing = () => {
    setBreathPhase('inhale');
    setBreathCycle(1);
    setPhaseTimer(BREATH_DURATION);
    if (breathingRef.current) clearInterval(breathingRef.current);
  };

  const handleNeedMoreTime = () => {
    setShowTimerNudge(false);
    setGlobalTimer(180); // Reset to 3 more minutes

    // Restart the timer
    timerRef.current = setInterval(() => {
      setGlobalTimer((prev) => {
        if (prev <= 1) {
          setShowTimerNudge(true);
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const cycleAffirmation = () => {
    const newIndex = (affirmationIndex + 1) % affirmations.length;
    const newColorIndex = Math.floor(Math.random() * AFFIRMATION_COLORS.length);
    setAffirmationIndex(newIndex);
    setAffirmationColor(AFFIRMATION_COLORS[newColorIndex]);
    setAffirmationSide((prev) => (prev === 'left' ? 'right' : 'left'));
    setAffirmationKey((prev) => prev + 1); // Trigger fade animation
  };

  const handleSubmitNote = async () => {
    if (!noteText.trim() || isSubmittingNote) return;

    setIsSubmittingNote(true);

    try {
      const supabase = getSupabase();
      await supabase.from('hub_activity_log').insert({
        user_id: user?.id || null,
        action: 'moment_note',
        metadata: {
          message: noteText.trim(),
          submitted_at: new Date().toISOString(),
        },
      });

      setNoteSent(true);
      setNoteText('');
      setShowNoteForm(false);
    } catch {
      // Silently fail - this is a safe space
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleAnonymousSubmit = () => {
    setAnonymousVent('');
    alert('Your message has been received. Take care of yourself.');
  };

  const getBreathPhaseText = (): string => {
    switch (breathPhase) {
      case 'inhale':
        return 'Breathe in...';
      case 'hold1':
        return 'Hold...';
      case 'exhale':
        return 'Breathe out...';
      case 'hold2':
        return 'Hold...';
      case 'complete':
        return '';
      default:
        return '';
    }
  };

  const isCircleExpanded = breathPhase === 'inhale' || breathPhase === 'hold1';

  if (!isOpen) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen flex flex-col items-center justify-center p-4 animate-fade-in-overlay overflow-hidden"
      style={{
        backgroundColor: 'rgba(43, 58, 103, 0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 9999,
      }}
    >
      {/* Global Timer Display - Top Center */}
      {!showTimerNudge && (
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.6)',
          }}
        >
          <Clock size={14} />
          {formatTime(globalTimer)} remaining
        </div>
      )}

      {/* Timer Nudge Card - Top (stays white as a popup) */}
      {showTimerNudge && (
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg p-4 text-center max-w-sm mx-4"
          style={{ animation: 'fadeIn 0.3s ease-out' }}
        >
          <p
            className="mb-3"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '15px',
              color: '#2B3A67',
            }}
          >
            Your 3 minutes are up. Feeling better?
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={handleNeedMoreTime}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: '#FFF8E7',
                color: '#2B3A67',
                border: '1px solid #E8B84B',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              I need more time
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: '#E8B84B',
                color: '#2B3A67',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Back to the Hub
            </button>
          </div>
        </div>
      )}

      {/* Close Button - White */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 p-2 transition-colors hover:opacity-80"
        style={{ color: 'white' }}
        aria-label="Close Moment Mode"
      >
        <X size={24} />
      </button>

      {/* Content Area - No Card, Direct on Gradient */}
      <div
        className="w-full max-w-md text-center"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Entry State */}
        {state === 'entry' && (
          <div className="text-center">
            <h2
              className="font-semibold mb-4"
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                fontSize: '28px',
                color: 'white',
              }}
            >
              Moment Mode.
            </h2>
            <p
              className="mb-4 leading-relaxed"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '15px',
                color: 'rgba(255, 255, 255, 0.8)',
              }}
            >
              Research shows that just 3 minutes of intentional pause can lower cortisol and reset your nervous system. This is your time. No one is tracking this. No one is watching. Choose what feels right, and when your 3 minutes are up, we will gently invite you back.
            </p>
            <p
              className="text-sm mb-8"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: 'rgba(255, 255, 255, 0.5)',
              }}
            >
              This is a sacred space built by Teachers Deserve It because you deserve to pause without guilt.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  resetBreathing();
                  setState('pause');
                }}
                className="w-full flex items-center justify-center gap-3 p-4 rounded-lg transition-all hover:bg-white/20"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                }}
              >
                <Wind size={20} />
                <span>Breathing exercise</span>
              </button>

              <button
                onClick={() => setState('affirmation')}
                className="w-full flex items-center justify-center gap-3 p-4 rounded-lg transition-all hover:bg-white/20"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                }}
              >
                <Heart size={20} />
                <span>Show me an affirmation</span>
              </button>

              <button
                onClick={() => setState('gentle')}
                className="w-full flex items-center justify-center gap-3 p-4 rounded-lg transition-all hover:bg-white/20"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                }}
              >
                <Sparkles size={20} />
                <span>Gentle tools</span>
              </button>

              <button
                onClick={() => setState('journal')}
                className="w-full flex items-center justify-center gap-3 p-4 rounded-lg transition-all hover:bg-white/20"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                }}
              >
                <BookOpen size={20} />
                <span>Write it out</span>
              </button>
            </div>
          </div>
        )}

        {/* Breathing/Pause State - Box Breathing */}
        {state === 'pause' && (
          <div className="text-center">
            <button
              onClick={() => {
                resetBreathing();
                setState('entry');
              }}
              className="text-sm mb-6 transition-colors hover:opacity-80"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: 'rgba(255, 255, 255, 0.6)',
              }}
            >
              ← Back
            </button>

            {breathPhase !== 'complete' ? (
              <>
                {/* Breathing Circle */}
                <div className="relative mx-auto mb-6" style={{ width: '180px', height: '180px' }}>
                  <div
                    className="absolute top-1/2 left-1/2 rounded-full flex items-center justify-center transition-all duration-1000 ease-in-out"
                    style={{
                      width: isCircleExpanded ? '180px' : '120px',
                      height: isCircleExpanded ? '180px' : '120px',
                      transform: 'translate(-50%, -50%)',
                      border: '2px solid white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <span
                      className="text-center px-4"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '16px',
                        color: 'white',
                      }}
                    >
                      {getBreathPhaseText()}
                    </span>
                  </div>
                </div>

                {/* Cycle Counter */}
                <p
                  className="mb-6"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  Breath {breathCycle} of {TOTAL_CYCLES}
                </p>

                <p
                  className="mb-2"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: 'rgba(255, 255, 255, 0.8)',
                  }}
                >
                  Box breathing: 4 seconds each phase
                </p>
                <p
                  className="text-sm"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: 'rgba(255, 255, 255, 0.5)',
                  }}
                >
                  In → Hold → Out → Hold
                </p>
              </>
            ) : (
              <>
                {/* Completion State */}
                <div
                  className="mb-8 p-6 rounded-xl"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <p
                    className="text-xl mb-2"
                    style={{
                      fontFamily: "'Source Serif 4', Georgia, serif",
                      color: 'white',
                    }}
                  >
                    Well done.
                  </p>
                  <p
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '15px',
                      color: 'rgba(255, 255, 255, 0.8)',
                    }}
                  >
                    Take one more breath on your own.
                  </p>
                </div>

                <button
                  onClick={() => {
                    resetBreathing();
                    setState('entry');
                  }}
                  className="px-8 py-3 rounded-lg font-medium transition-all hover:bg-white/20"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    backgroundColor: '#E8B84B',
                    color: '#2B3A67',
                  }}
                >
                  Done
                </button>
              </>
            )}
          </div>
        )}

        {/* Affirmation State */}
        {state === 'affirmation' && (
          <div>
            <button
              onClick={() => setState('entry')}
              className="text-sm mb-6 block transition-colors hover:opacity-80"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: 'rgba(255, 255, 255, 0.6)',
              }}
            >
              ← Back
            </button>

            {/* Affirmation with Person Icon */}
            <div
              key={affirmationKey}
              className={`flex items-start gap-4 mb-6 ${affirmationSide === 'right' ? 'flex-row-reverse' : ''}`}
              style={{ animation: 'fadeIn 0.3s ease-out' }}
            >
              {/* Person Icon in Colored Circle */}
              <div
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: affirmationColor }}
              >
                <UserCircle size={24} style={{ color: 'white' }} />
              </div>

              {/* Speech Bubble - White at 15% opacity */}
              <div
                className="flex-1 p-4 rounded-xl text-left"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                }}
              >
                <p
                  className="text-lg leading-relaxed"
                  style={{
                    fontFamily: "'Source Serif 4', Georgia, serif",
                    color: 'white',
                  }}
                >
                  {affirmations[affirmationIndex]}
                </p>
              </div>
            </div>

            <button
              onClick={cycleAffirmation}
              className="w-full mb-8 px-6 py-3 rounded-lg font-medium transition-all hover:bg-white/10"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                backgroundColor: 'transparent',
                border: '1px solid white',
                color: 'white',
              }}
            >
              Next affirmation
            </button>

            {/* Note to Team Section */}
            <div
              className="pt-6"
              style={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}
            >
              {noteSent ? (
                <div className="text-center py-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <HeartIcon size={16} style={{ color: '#E8B84B' }} />
                    <span
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '14px',
                        color: 'rgba(255, 255, 255, 0.8)',
                      }}
                    >
                      Sent. Someone from our team will read this.
                    </span>
                  </div>
                </div>
              ) : !showNoteForm ? (
                <p
                  className="text-center"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '13px',
                    color: 'rgba(255, 255, 255, 0.5)',
                  }}
                >
                  Need to talk?{' '}
                  <button
                    onClick={() => setShowNoteForm(true)}
                    className="underline transition-colors hover:opacity-80"
                    style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                  >
                    Click here
                  </button>{' '}
                  to send a note to the team.
                </p>
              ) : (
                <div className="space-y-3" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value.slice(0, 500))}
                    placeholder="What's on your mind?"
                    className="w-full h-20 p-3 rounded-lg resize-none focus:outline-none text-sm"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: 'white',
                    }}
                    autoFocus
                  />
                  <div className="flex justify-between items-center">
                    <span
                      className="text-xs"
                      style={{
                        color: 'rgba(255, 255, 255, 0.4)',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {noteText.length}/500
                    </span>
                    <button
                      onClick={handleSubmitNote}
                      disabled={!noteText.trim() || isSubmittingNote}
                      className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10"
                      style={{
                        border: '1px solid rgba(255, 255, 255, 0.5)',
                        color: 'white',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      <Send size={14} />
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Gentle Tools State */}
        {state === 'gentle' && (
          <div>
            <button
              onClick={() => setState('entry')}
              className="text-sm mb-4 transition-colors hover:opacity-80"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: 'rgba(255, 255, 255, 0.6)',
              }}
            >
              ← Back
            </button>

            <h3
              className="font-semibold mb-6"
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                fontSize: '20px',
                color: 'white',
              }}
            >
              Gentle tools for right now
            </h3>

            <div>
              {GENTLE_TOOLS.map((tool, index) => (
                <button
                  key={index}
                  className="w-full text-left transition-all hover:bg-white/20"
                  style={{
                    padding: '12px 16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    marginBottom: '8px',
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '15px',
                          fontWeight: 600,
                          color: 'white',
                          lineHeight: '1.3',
                        }}
                      >
                        {tool.title}
                      </p>
                      <p
                        className="truncate"
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '13px',
                          color: 'rgba(255, 255, 255, 0.6)',
                          marginTop: '2px',
                        }}
                      >
                        {tool.description}
                      </p>
                    </div>
                    <span
                      className="flex-shrink-0 inline-flex items-center gap-1"
                      style={{
                        backgroundColor: 'rgba(232, 184, 75, 0.2)',
                        color: '#E8B84B',
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: '12px',
                        border: '1px solid #E8B84B',
                      }}
                    >
                      {tool.type === 'download' && <Download size={12} />}
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
              className="text-sm mb-4 transition-colors hover:opacity-80"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: 'rgba(255, 255, 255, 0.6)',
              }}
            >
              ← Back
            </button>

            <h3
              className="font-semibold mb-6"
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                fontSize: '20px',
                color: 'white',
              }}
            >
              Write it out
            </h3>

            {/* Tabs */}
            <div
              className="flex mb-6"
              style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}
            >
              <button
                onClick={() => setJournalTab('private')}
                className="flex-1 py-3 text-sm font-medium transition-colors"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: journalTab === 'private' ? 'white' : 'rgba(255, 255, 255, 0.5)',
                  borderBottom: journalTab === 'private' ? '2px solid #E8B84B' : '2px solid transparent',
                }}
              >
                Private journal
              </button>
              <button
                onClick={() => setJournalTab('anonymous')}
                className="flex-1 py-3 text-sm font-medium transition-colors"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: journalTab === 'anonymous' ? 'white' : 'rgba(255, 255, 255, 0.5)',
                  borderBottom: journalTab === 'anonymous' ? '2px solid #E8B84B' : '2px solid transparent',
                }}
              >
                Anonymous vent
              </button>
            </div>

            {journalTab === 'private' && (
              <div>
                <p
                  className="text-sm mb-4"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  This stays on your device only. Nothing is saved to the cloud.
                </p>
                <textarea
                  value={privateJournal}
                  onChange={(e) => setPrivateJournal(e.target.value)}
                  placeholder="Write whatever you need to get out..."
                  className="w-full h-40 p-4 rounded-lg resize-none focus:outline-none"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                  }}
                />
              </div>
            )}

            {journalTab === 'anonymous' && (
              <div>
                <p
                  className="text-sm mb-4"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  Send an anonymous message. No name, no tracking, just release.
                </p>
                <textarea
                  value={anonymousVent}
                  onChange={(e) => setAnonymousVent(e.target.value)}
                  placeholder="Let it out..."
                  className="w-full h-40 p-4 rounded-lg resize-none focus:outline-none mb-4"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                  }}
                />
                <button
                  onClick={handleAnonymousSubmit}
                  disabled={!anonymousVent.trim()}
                  className="w-full py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    backgroundColor: '#E8B84B',
                    color: '#2B3A67',
                  }}
                >
                  Send anonymously
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Animation keyframes and placeholder styling */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        textarea::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
      `}</style>
    </div>
  );
}
