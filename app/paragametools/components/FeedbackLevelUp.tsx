'use client';

import { useState, useMemo } from 'react';
import { GameWrapper, IntroScreen, DoneScreen } from './GameWrapper';
import { FEEDBACK_LEVELS, shuffleAndPick, GAME_COLORS, LEVEL_COLORS } from './gameData';

type Screen = 'intro' | 'play' | 'done';

interface FeedbackLevelUpProps {
  onBack: () => void;
}

export function FeedbackLevelUp({ onBack }: FeedbackLevelUpProps) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [currentRound, setCurrentRound] = useState(0);
  const [revealed, setRevealed] = useState(false);

  // Shuffle feedback examples on mount
  const feedbacks = useMemo(
    () => shuffleAndPick(FEEDBACK_LEVELS, FEEDBACK_LEVELS.length),
    []
  );

  const handleStart = () => {
    setScreen('play');
    setCurrentRound(0);
    setRevealed(false);
  };

  const handleReveal = () => setRevealed(true);

  const handleNext = () => {
    if (currentRound < feedbacks.length - 1) {
      setCurrentRound((prev) => prev + 1);
      setRevealed(false);
    } else {
      setScreen('done');
    }
  };

  const colorConfig = GAME_COLORS.green;
  const current = feedbacks[currentRound];
  const levelConfig = LEVEL_COLORS[current.level as keyof typeof LEVEL_COLORS];

  return (
    <GameWrapper title="Feedback Level Up" icon="📊" color="green" onBack={onBack}>
      {screen === 'intro' && (
        <IntroScreen
          icon="📊"
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
                {[1, 2, 3, 4].map((level) => {
                  const config = LEVEL_COLORS[level as keyof typeof LEVEL_COLORS];
                  return (
                    <div
                      key={level}
                      className="p-3 rounded-lg text-center"
                      style={{ backgroundColor: `${config.color}20`, border: `1px solid ${config.color}40` }}
                    >
                      <p className="text-2xl font-bold" style={{ color: config.color }}>
                        {level}
                      </p>
                      <p className="text-xs font-medium" style={{ color: config.color }}>
                        {config.name}
                        {level === 3 && ' ⭐'}
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
            className="text-xs uppercase tracking-widest mb-4"
            style={{ color: 'rgba(39, 174, 96, 0.5)' }}
          >
            Round {currentRound + 1} of {feedbacks.length}
          </p>

          {/* Feedback card */}
          <div
            className="w-full rounded-xl p-6 md:p-8 mb-6"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
          >
            <p className="text-lg md:text-xl lg:text-2xl text-white italic leading-relaxed text-center">
              "{current.feedback}"
            </p>
          </div>

          {/* Pre-reveal state */}
          {!revealed && (
            <div className="flex flex-col items-center gap-4">
              <p className="text-xl" style={{ color: '#8899aa' }}>
                🖐️ Hold up your fingers: 1, 2, 3, or 4!
              </p>
              <button
                onClick={handleReveal}
                className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: colorConfig.accent, color: '#ffffff' }}
              >
                Reveal Level
              </button>
            </div>
          )}

          {/* Post-reveal state */}
          {revealed && (
            <div className="flex flex-col items-center gap-4 w-full">
              {/* Result box */}
              <div
                className="w-full rounded-xl p-6 text-center"
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
                  className="text-xl font-bold mb-3"
                  style={{ color: levelConfig.color }}
                >
                  {levelConfig.name}
                  {current.level === 3 && ' ⭐'}
                </p>
                <p className="text-white">{current.why}</p>
              </div>

              <button
                onClick={handleNext}
                className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: colorConfig.accent, color: '#ffffff' }}
              >
                {currentRound < feedbacks.length - 1 ? 'Next →' : 'Finish →'}
              </button>
            </div>
          )}
        </div>
      )}

      {screen === 'done' && (
        <DoneScreen
          icon="🏆"
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
