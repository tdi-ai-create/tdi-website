'use client';

import { useState, useMemo } from 'react';
import { ChevronRight, RefreshCw, Bell } from 'lucide-react';
import { GameWrapper, IntroScreen, DoneScreen } from './GameWrapper';
import { Timer, TimerControls } from './Timer';
import { KNOCKOUT_SCENARIOS, KNOCKOUT_TIMER_SECONDS, KNOCKOUT_ROUNDS } from '../data/scenarios';
import { COLORS, shuffleAndPick } from '../data/gameConfig';

type Screen = 'intro' | 'play' | 'done';

interface QuestionKnockoutProps {
  onBack: () => void;
}

export function QuestionKnockout({ onBack }: QuestionKnockoutProps) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [currentRound, setCurrentRound] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Shuffle scenarios on mount
  const scenarios = useMemo(
    () => shuffleAndPick(KNOCKOUT_SCENARIOS, KNOCKOUT_ROUNDS),
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
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentRound((prev) => prev + 1);
        setTimerRunning(false);
        setTimerKey((prev) => prev + 1);
        setIsAnimating(false);
      }, 200);
    } else {
      setScreen('done');
    }
  };

  const handleTimerStart = () => setTimerRunning(true);
  const handleTimerPause = () => setTimerRunning(false);
  const handleTimerComplete = () => setTimerRunning(false);

  const colorConfig = COLORS.orange;

  // Show "Switch Roles!" reminder at round 5
  const showSwitchReminder = currentRound === 4;

  return (
    <GameWrapper gameId="knockout" title="Question Knockout" color="orange" onBack={onBack}>
      {screen === 'intro' && (
        <IntroScreen
          gameId="knockout"
          title="Question Knockout"
          color="orange"
          rules={[
            "Partner up. One person plays the student scenario.",
            "The other is the para -  but you can ONLY ask questions.",
            "If you accidentally TELL... you're out!",
          ]}
          onStart={handleStart}
          extraContent={
            <div className="flex items-center gap-2 mb-4 text-orange-400">
              <Bell size={18} />
              <span className="text-sm">Ring the bell if you hear a TELL!</span>
            </div>
          }
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

          {/* Switch Roles reminder */}
          {showSwitchReminder && (
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full mb-4 animate-scale-in"
              style={{ backgroundColor: 'rgba(241, 196, 15, 0.2)', border: '1px solid rgba(241, 196, 15, 0.4)' }}
            >
              <RefreshCw size={18} className="text-yellow-400" />
              <span className="text-yellow-400 font-semibold">Switch Roles!</span>
            </div>
          )}

          {/* Scenario card */}
          <div
            className={`w-full rounded-xl p-6 md:p-8 mb-6 transition-all duration-200 ${
              isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0 animate-slide-up'
            }`}
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
              totalSeconds={KNOCKOUT_TIMER_SECONDS}
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
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: colorConfig.accent, color: '#ffffff' }}
            >
              {currentRound < scenarios.length - 1 ? 'Next Scenario' : 'Finish'}
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Footer reminder */}
          <div className="flex items-center gap-2 text-sm text-center" style={{ color: '#8899aa' }}>
            <span>Remember:</span>
            <span style={{ color: colorConfig.accent }}>QUESTIONS ONLY!</span>
            <span>If you tell... you're out!</span>
            <Bell size={16} style={{ color: colorConfig.accent }} />
          </div>
        </div>
      )}

      {screen === 'done' && (
        <DoneScreen
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
