'use client';

import { useState, useMemo } from 'react';
import { Star, ChevronRight, Hand } from 'lucide-react';
import { GameWrapper, IntroScreen, DoneScreen } from './GameWrapper';
import { StreakCounter } from './StreakCounter';
import { FEEDBACK_LEVELS, LEVEL_INFO } from '../data/feedbackLevels';
import { COLORS, shuffle } from '../data/gameConfig';

type Screen = 'intro' | 'play' | 'done';

interface FeedbackLevelUpProps {
  onBack: () => void;
}

export function FeedbackLevelUp({ onBack }: FeedbackLevelUpProps) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [currentRound, setCurrentRound] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [userGuess, setUserGuess] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Shuffle feedback examples on mount
  const feedbacks = useMemo(
    () => shuffle(FEEDBACK_LEVELS),
    []
  );

  const handleStart = () => {
    setScreen('play');
    setCurrentRound(0);
    setRevealed(false);
    setUserGuess(null);
    setStreak(0);
  };

  const handleGuess = (level: number) => {
    setUserGuess(level);
    setRevealed(true);

    const isCorrect = level === feedbacks[currentRound].level;
    if (isCorrect) {
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentRound < feedbacks.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentRound((prev) => prev + 1);
        setRevealed(false);
        setUserGuess(null);
        setIsAnimating(false);
      }, 200);
    } else {
      setScreen('done');
    }
  };

  const colorConfig = COLORS.green;
  const current = feedbacks[currentRound];
  const levelConfig = LEVEL_INFO[current.level];
  const isCorrect = userGuess === current.level;

  return (
    <GameWrapper gameId="levelup" title="Feedback Level Up" color="green" onBack={onBack}>
      {screen === 'intro' && (
        <IntroScreen
          gameId="levelup"
          title="Feedback Level Up"
          color="green"
          rules={[
            "I'll show you a piece of feedback a para gave a student.",
            "Your table holds up fingers: 1, 2, 3, or 4.",
          ]}
          onStart={handleStart}
          extraContent={
            <div className="w-full max-w-lg mb-6">
              {/* Level reference grid */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {([1, 2, 3, 4] as const).map((level) => {
                  const config = LEVEL_INFO[level];
                  return (
                    <div
                      key={level}
                      className="p-3 rounded-lg text-center"
                      style={{ backgroundColor: `${config.color}20`, border: `1px solid ${config.color}40` }}
                    >
                      <p className="text-2xl font-bold" style={{ color: config.color }}>
                        {level}
                      </p>
                      <p className="text-xs font-medium flex items-center justify-center gap-1" style={{ color: config.color }}>
                        {config.name}
                        {config.star && <Star size={12} fill={config.color} />}
                      </p>
                    </div>
                  );
                })}
              </div>
              <p className="text-sm text-center" style={{ color: '#27AE60' }}>
                NOTICE → NAME → NEXT STEP = Level 3 (The Goal)
              </p>
            </div>
          }
        />
      )}

      {screen === 'play' && (
        <div className="flex flex-col items-center">
          {/* Round indicator */}
          <p
            className="text-xs uppercase tracking-widest mb-2"
            style={{ color: 'rgba(39, 174, 96, 0.5)' }}
          >
            Round {currentRound + 1} of {feedbacks.length}
          </p>

          {/* Streak counter */}
          <div className="mb-4">
            <StreakCounter count={streak} color="#27AE60" />
          </div>

          {/* Feedback card */}
          <div
            className={`w-full rounded-xl p-6 md:p-8 mb-6 transition-all duration-200 ${
              isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0 animate-slide-up'
            }`}
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
          >
            <p className="text-lg md:text-xl lg:text-2xl text-white italic leading-relaxed text-center">
              "{current.feedback}"
            </p>
          </div>

          {/* Pre-reveal state - Level voting buttons */}
          {!revealed && (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-xl" style={{ color: '#8899aa' }}>
                <Hand size={24} />
                <span>Hold up your fingers: 1, 2, 3, or 4!</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {([1, 2, 3, 4] as const).map((level) => {
                  const config = LEVEL_INFO[level];
                  return (
                    <button
                      key={level}
                      onClick={() => handleGuess(level)}
                      className="flex flex-col items-center gap-1 px-6 py-4 rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
                      style={{
                        backgroundColor: `${config.color}20`,
                        border: `2px solid ${config.color}`,
                        color: config.color,
                      }}
                    >
                      <span className="text-3xl">{level}</span>
                      <span className="text-xs flex items-center gap-1">
                        {config.name}
                        {config.star && <Star size={10} fill={config.color} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Post-reveal state */}
          {revealed && (
            <div className="flex flex-col items-center gap-4 w-full">
              {/* Result box */}
              <div
                className={`w-full rounded-xl p-6 text-center animate-reveal-bounce ${!isCorrect ? 'animate-shake' : ''}`}
                style={{
                  backgroundColor: `${levelConfig.color}15`,
                  border: `2px solid ${levelConfig.color}`,
                }}
              >
                <p
                  className="text-5xl md:text-6xl font-bold mb-2"
                  style={{ color: levelConfig.color }}
                >
                  {current.level}
                </p>
                <p
                  className="text-xl font-bold mb-3 flex items-center justify-center gap-2"
                  style={{ color: levelConfig.color }}
                >
                  {levelConfig.name}
                  {levelConfig.star && <Star size={20} fill={levelConfig.color} />}
                </p>
                <p className="text-white">{current.why}</p>
              </div>

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: colorConfig.accent, color: '#ffffff' }}
              >
                {currentRound < feedbacks.length - 1 ? 'Next' : 'Finish'}
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      )}

      {screen === 'done' && (
        <DoneScreen
          title="Level Up Complete!"
          message="Level 2 is the trap — it sounds good but doesn't give students enough to grow."
          tableTalk="Where do you honestly land most days?"
          color="green"
          onBack={onBack}
        />
      )}
    </GameWrapper>
  );
}
