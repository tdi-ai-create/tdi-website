'use client';

import { useState, useMemo } from 'react';
import { GameWrapper, IntroScreen, DoneScreen } from './GameWrapper';
import { Timer, TimerControls } from './Timer';
import { KNOCKOUT_SCENARIOS, shuffleAndPick, GAME_COLORS } from './gameData';

type Screen = 'intro' | 'play' | 'done';

interface QuestionKnockoutProps {
  onBack: () => void;
}

const TIMER_SECONDS = 90;
const SCENARIOS_PER_GAME = 10;

export function QuestionKnockout({ onBack }: QuestionKnockoutProps) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [currentRound, setCurrentRound] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerKey, setTimerKey] = useState(0);

  // Shuffle scenarios on mount
  const scenarios = useMemo(
    () => shuffleAndPick(KNOCKOUT_SCENARIOS, SCENARIOS_PER_GAME),
    []
  );

  const handleStart = () => {
    setScreen('play');
    setCurrentRound(0);
    setTimerRunning(false);
    setTimerKey(0);
  };

  const handleNext = () => {
    if (currentRound < scenarios.length - 1) {
      setCurrentRound((prev) => prev + 1);
      setTimerRunning(false);
      setTimerKey((prev) => prev + 1);
    } else {
      setScreen('done');
    }
  };

  const handleTimerStart = () => setTimerRunning(true);
  const handleTimerPause = () => setTimerRunning(false);
  const handleTimerComplete = () => setTimerRunning(false);

  const colorConfig = GAME_COLORS.orange;

  return (
    <GameWrapper title="Question Knockout" icon="🥊" color="orange" onBack={onBack}>
      {screen === 'intro' && (
        <IntroScreen
          icon="🥊"
          title="Question Knockout"
          color="orange"
          rules={[
            "Partner up. One person plays the student scenario.",
            "The other is the para — but you can ONLY ask questions.",
            "If you accidentally TELL... you're out! 🔔",
          ]}
          onStart={handleStart}
        />
      )}

      {screen === 'play' && (
        <div className="flex flex-col items-center">
          {/* Round indicator */}
          <p
            className="text-xs uppercase tracking-widest mb-4"
            style={{ color: 'rgba(255, 120, 71, 0.5)' }}
          >
            Scenario {currentRound + 1} of {scenarios.length}
          </p>

          {/* Scenario card */}
          <div
            className="w-full rounded-xl p-6 md:p-8 mb-6"
            style={{ backgroundColor: colorConfig.bg, border: `1px solid ${colorConfig.border}` }}
          >
            <p className="text-xl md:text-2xl lg:text-3xl text-white leading-relaxed text-center">
              {scenarios[currentRound]}
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
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <TimerControls
              isRunning={timerRunning}
              onStart={handleTimerStart}
              onPause={handleTimerPause}
            />
            <button
              onClick={handleNext}
              className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: colorConfig.accent, color: '#ffffff' }}
            >
              {currentRound < scenarios.length - 1 ? 'Next Scenario →' : 'Finish →'}
            </button>
          </div>

          {/* Footer reminder */}
          <p className="text-sm text-center" style={{ color: '#8899aa' }}>
            Remember: <span style={{ color: colorConfig.accent }}>QUESTIONS ONLY!</span> If you tell... you're out! 🔔
          </p>
        </div>
      )}

      {screen === 'done' && (
        <DoneScreen
          icon="🏆"
          title="Nice Work!"
          message="That urge to TELL? That's the muscle you're retraining. It gets easier with practice."
          tableTalk="What was the hardest scenario to stay in questions?"
          color="orange"
          onBack={onBack}
        />
      )}
    </GameWrapper>
  );
}
