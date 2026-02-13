'use client';

import { useState, useMemo } from 'react';
import { Lightbulb, ChevronRight, Eye, EyeOff, Camera, ArrowRight, X, CheckCircle } from 'lucide-react';
import { GameWrapper, IntroScreen, DoneScreen } from './GameWrapper';
import { Timer, TimerControls } from './Timer';
import { FEEDBACK_MAKEOVERS, MAKEOVER_TIMER_SECONDS } from '../data/makeovers';
import { COLORS, shuffle } from '../data/gameConfig';

type Screen = 'intro' | 'play' | 'done';

interface FeedbackMakeoverProps {
  onBack: () => void;
}

export function FeedbackMakeover({ onBack }: FeedbackMakeoverProps) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [currentRound, setCurrentRound] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [userMakeover, setUserMakeover] = useState('');
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  const [savedMakeovers, setSavedMakeovers] = useState<{ bad: string; after: string }[]>([]);

  // Shuffle makeovers on mount
  const makeovers = useMemo(
    () => shuffle(FEEDBACK_MAKEOVERS),
    []
  );

  const handleStart = () => {
    setScreen('play');
    setCurrentRound(0);
    setTimerRunning(false);
    setTimerKey(0);
    setShowHint(false);
    setUserMakeover('');
    setShowBeforeAfter(false);
    setSavedMakeovers([]);
  };

  const handleNext = () => {
    // Save the makeover if user entered one
    if (userMakeover.trim()) {
      setSavedMakeovers((prev) => [...prev, { bad: current.bad, after: userMakeover }]);
    }

    if (currentRound < makeovers.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentRound((prev) => prev + 1);
        setTimerRunning(false);
        setTimerKey((prev) => prev + 1);
        setShowHint(false);
        setUserMakeover('');
        setShowBeforeAfter(false);
        setIsAnimating(false);
      }, 200);
    } else {
      setScreen('done');
    }
  };

  const handleShowBeforeAfter = () => {
    if (userMakeover.trim()) {
      setShowBeforeAfter(true);
    }
  };

  const handleTimerStart = () => setTimerRunning(true);
  const handleTimerPause = () => setTimerRunning(false);
  const handleTimerComplete = () => setTimerRunning(false);
  const toggleHint = () => setShowHint((prev) => !prev);

  const colorConfig = COLORS.red;
  const current = makeovers[currentRound];

  return (
    <GameWrapper gameId="makeover" title="Feedback Makeover" color="red" onBack={onBack}>
      {screen === 'intro' && (
        <IntroScreen
          gameId="makeover"
          title="Feedback Makeover"
          color="red"
          rules={[
            "You'll see terrible feedback + the student context.",
            "Your table races to rewrite it as Level 3:",
          ]}
          onStart={handleStart}
          extraContent={
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="flex gap-3">
                {['NOTICE', 'NAME', 'NEXT STEP'].map((step, i) => (
                  <div
                    key={step}
                    className="px-3 py-2 rounded-lg text-center"
                    style={{ backgroundColor: 'rgba(39, 174, 96, 0.15)', border: '1px solid rgba(39, 174, 96, 0.4)' }}
                  >
                    <p className="text-sm font-bold" style={{ color: '#27AE60' }}>
                      {i + 1}. {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          }
        />
      )}

      {screen === 'play' && (
        <div className="flex flex-col items-center">
          {/* Round indicator */}
          <p
            className="text-xs uppercase tracking-widest mb-4"
            style={{ color: 'rgba(231, 76, 60, 0.5)' }}
          >
            Makeover {currentRound + 1} of {makeovers.length}
          </p>

          {/* Bad feedback card */}
          <div
            className={`w-full rounded-xl p-5 md:p-6 mb-4 transition-all duration-200 ${
              isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0 animate-slide-up'
            }`}
            style={{ backgroundColor: colorConfig.bg, border: `1px solid ${colorConfig.border}` }}
          >
            <p className="text-xs uppercase tracking-wide mb-2" style={{ color: colorConfig.accent }}>
              The para said:
            </p>
            <p className="text-xl md:text-2xl text-white italic text-center">
              "{current.bad}"
            </p>
          </div>

          {/* Context card */}
          <div
            className={`w-full rounded-xl p-5 md:p-6 mb-6 transition-all duration-200 ${
              isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
            }`}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              animationDelay: '0.1s'
            }}
          >
            <p className="text-xs uppercase tracking-wide mb-2" style={{ color: '#8899aa' }}>
              What the student actually did:
            </p>
            <p className="text-base md:text-lg text-white">
              {current.context}
            </p>
          </div>

          {/* Timer */}
          <div className="mb-6">
            <Timer
              key={timerKey}
              totalSeconds={MAKEOVER_TIMER_SECONDS}
              isRunning={timerRunning}
              onComplete={handleTimerComplete}
            />
          </div>

          {/* Controls */}
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            <TimerControls
              isRunning={timerRunning}
              onStart={handleTimerStart}
              onPause={handleTimerPause}
            />
            <button
              onClick={toggleHint}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: '#F1C40F', color: '#0a1628' }}
            >
              {showHint ? <EyeOff size={20} /> : <Eye size={20} />}
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: colorConfig.accent, color: '#ffffff' }}
            >
              {currentRound < makeovers.length - 1 ? 'Next' : 'Finish'}
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Hint box */}
          {showHint && (
            <div
              className="w-full rounded-xl p-4 mb-4 animate-reveal-bounce"
              style={{ backgroundColor: 'rgba(241, 196, 15, 0.1)', border: '1px solid rgba(241, 196, 15, 0.3)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb size={18} style={{ color: '#F1C40F' }} />
                <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: '#F1C40F' }}>
                  Hint
                </p>
              </div>
              <p className="text-white">{current.hint}</p>
            </div>
          )}

          {/* User Makeover Input */}
          <div className="w-full mb-4">
            <label className="block text-sm text-slate-300 mb-2">
              Type your Level 3 makeover (optional):
            </label>
            <textarea
              value={userMakeover}
              onChange={(e) => setUserMakeover(e.target.value)}
              placeholder="I see that you... That's called... Now try..."
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-3 text-white placeholder:text-slate-400 h-24 resize-none"
            />
            {userMakeover.trim() && !showBeforeAfter && (
              <button
                onClick={handleShowBeforeAfter}
                className="mt-2 flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 text-sm"
                style={{ backgroundColor: 'rgba(39, 174, 96, 0.2)', border: '1px solid #27AE60', color: '#27AE60' }}
              >
                <Eye size={16} />
                Show Before/After
              </button>
            )}
          </div>

          {/* Before/After Card */}
          {showBeforeAfter && userMakeover.trim() && (
            <div
              className="w-full rounded-xl p-5 mb-4 animate-reveal-bounce"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              <div className="text-center mb-4">
                <h4 className="text-lg font-semibold text-white">Makeover Complete!</h4>
              </div>

              <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-3 md:gap-4 md:items-center">
                <div
                  className="rounded-lg p-4"
                  style={{ backgroundColor: 'rgba(231, 76, 60, 0.1)', border: '1px solid rgba(231, 76, 60, 0.3)' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <X size={16} className="text-red-400" />
                    <span className="text-red-300 font-medium text-sm">BEFORE</span>
                  </div>
                  <p className="text-white text-sm italic">"{current.bad}"</p>
                </div>

                <div className="text-center hidden md:block">
                  <ArrowRight size={24} className="text-slate-400 mx-auto" />
                </div>

                <div
                  className="rounded-lg p-4"
                  style={{ backgroundColor: 'rgba(39, 174, 96, 0.1)', border: '1px solid rgba(39, 174, 96, 0.3)' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={16} className="text-green-400" />
                    <span className="text-green-300 font-medium text-sm">AFTER</span>
                  </div>
                  <p className="text-white text-sm">"{userMakeover}"</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded text-xs">Notice</span>
                    <span className="bg-green-500/20 text-green-300 px-2 py-0.5 rounded text-xs">Name</span>
                    <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-xs">Next Step</span>
                  </div>
                </div>
              </div>

              <p className="text-center text-xs text-slate-400 mt-3">
                <Camera size={14} className="inline mr-1" />
                Screenshot this card to keep!
              </p>
            </div>
          )}

          {/* Footer reminder */}
          <p className="text-sm text-center" style={{ color: '#8899aa' }}>
            Tables: say your Level 3 version out loud. Does it have all 3 parts?
          </p>
        </div>
      )}

      {screen === 'done' && (
        <DoneScreen
          title="Makeover Complete!"
          message="You can turn ANY vague feedback into something powerful. The formula works every time."
          tableTalk="Which makeover was the hardest to improve?"
          color="red"
          onBack={onBack}
          extraContent={
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              {['NOTICE', 'NAME', 'NEXT STEP'].map((step, i) => (
                <div
                  key={step}
                  className="px-4 py-3 rounded-lg text-center"
                  style={{ backgroundColor: 'rgba(39, 174, 96, 0.15)', border: '1px solid rgba(39, 174, 96, 0.4)' }}
                >
                  <p className="text-sm font-bold" style={{ color: '#27AE60' }}>
                    {i + 1}. {step}
                  </p>
                </div>
              ))}
            </div>
          }
        />
      )}
    </GameWrapper>
  );
}
