'use client';

import { useState, useMemo } from 'react';
import { GameWrapper, IntroScreen, DoneScreen } from './GameWrapper';
import { Timer, TimerControls } from './Timer';
import { FEEDBACK_MAKEOVERS, shuffleAndPick, GAME_COLORS } from './gameData';

type Screen = 'intro' | 'play' | 'done';

interface FeedbackMakeoverProps {
  onBack: () => void;
}

const TIMER_SECONDS = 120;

export function FeedbackMakeover({ onBack }: FeedbackMakeoverProps) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [currentRound, setCurrentRound] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [showHint, setShowHint] = useState(false);

  // Shuffle makeovers on mount
  const makeovers = useMemo(
    () => shuffleAndPick(FEEDBACK_MAKEOVERS, FEEDBACK_MAKEOVERS.length),
    []
  );

  const handleStart = () => {
    setScreen('play');
    setCurrentRound(0);
    setTimerRunning(false);
    setTimerKey(0);
    setShowHint(false);
  };

  const handleNext = () => {
    if (currentRound < makeovers.length - 1) {
      setCurrentRound((prev) => prev + 1);
      setTimerRunning(false);
      setTimerKey((prev) => prev + 1);
      setShowHint(false);
    } else {
      setScreen('done');
    }
  };

  const handleTimerStart = () => setTimerRunning(true);
  const handleTimerPause = () => setTimerRunning(false);
  const handleTimerComplete = () => setTimerRunning(false);
  const toggleHint = () => setShowHint((prev) => !prev);

  const colorConfig = GAME_COLORS.red;
  const current = makeovers[currentRound];

  return (
    <GameWrapper title="Feedback Makeover" icon="🔧" color="red" onBack={onBack}>
      {screen === 'intro' && (
        <IntroScreen
          icon="🔧"
          title="Feedback Makeover"
          color="red"
          rules={[
            "You'll see terrible feedback + the student context.",
            "Your table races to rewrite it as Level 3:",
          ]}
          onStart={handleStart}
          extraContent={
            <p className="text-lg mb-6" style={{ color: '#27AE60' }}>
              NOTICE → NAME → NEXT STEP
            </p>
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
            className="w-full rounded-xl p-5 md:p-6 mb-4"
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
            className="w-full rounded-xl p-5 md:p-6 mb-6"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
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
              totalSeconds={TIMER_SECONDS}
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
              className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: '#F1C40F', color: '#0a1628' }}
            >
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: colorConfig.accent, color: '#ffffff' }}
            >
              {currentRound < makeovers.length - 1 ? 'Next →' : 'Finish →'}
            </button>
          </div>

          {/* Hint box */}
          {showHint && (
            <div
              className="w-full rounded-xl p-4 mb-4"
              style={{ backgroundColor: 'rgba(241, 196, 15, 0.1)', border: '1px solid rgba(241, 196, 15, 0.3)' }}
            >
              <p className="text-xs uppercase tracking-wide mb-2" style={{ color: '#F1C40F' }}>
                💡 Hint
              </p>
              <p className="text-white">{current.hint}</p>
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
          icon="💪"
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
