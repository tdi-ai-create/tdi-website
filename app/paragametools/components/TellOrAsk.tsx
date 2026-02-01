'use client';

import { useState, useMemo } from 'react';
import { GameWrapper, IntroScreen, DoneScreen } from './GameWrapper';
import { TELL_OR_ASK_STATEMENTS, shuffleAndPick, GAME_COLORS } from './gameData';

type Screen = 'intro' | 'play' | 'done';

interface TellOrAskProps {
  onBack: () => void;
}

const ROUNDS_PER_GAME = 12;

export function TellOrAsk({ onBack }: TellOrAskProps) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [currentRound, setCurrentRound] = useState(0);
  const [revealed, setRevealed] = useState(false);

  // Shuffle statements on mount
  const statements = useMemo(
    () => shuffleAndPick(TELL_OR_ASK_STATEMENTS, ROUNDS_PER_GAME),
    []
  );

  const handleStart = () => {
    setScreen('play');
    setCurrentRound(0);
    setRevealed(false);
  };

  const handleReveal = () => setRevealed(true);

  const handleNext = () => {
    if (currentRound < statements.length - 1) {
      setCurrentRound((prev) => prev + 1);
      setRevealed(false);
    } else {
      setScreen('done');
    }
  };

  const colorConfig = GAME_COLORS.yellow;
  const current = statements[currentRound];

  return (
    <GameWrapper title="Tell or Ask?" icon="⚡" color="yellow" onBack={onBack}>
      {screen === 'intro' && (
        <IntroScreen
          icon="⚡"
          title="Tell or Ask?"
          color="yellow"
          rules={[
            "I'll show you something a para says to a student.",
            "Your table decides: Is it a real question or a tell in disguise?",
            "⚠️ Some of these are tricky!",
          ]}
          onStart={handleStart}
        />
      )}

      {screen === 'play' && (
        <div className="flex flex-col items-center">
          {/* Round indicator */}
          <p
            className="text-xs uppercase tracking-widest mb-4"
            style={{ color: 'rgba(241, 196, 15, 0.5)' }}
          >
            Round {currentRound + 1} of {statements.length}
          </p>

          {/* Statement card */}
          <div
            className="w-full rounded-xl p-6 md:p-8 mb-6"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
          >
            <p className="text-2xl md:text-3xl lg:text-4xl text-white italic leading-relaxed text-center">
              "{current.statement}"
            </p>
          </div>

          {/* Pre-reveal state */}
          {!revealed && (
            <div className="flex flex-col items-center gap-4">
              <p className="text-lg" style={{ color: '#8899aa' }}>
                Tables: discuss and decide!
              </p>
              <button
                onClick={handleReveal}
                className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: colorConfig.accent, color: '#0a1628' }}
              >
                Reveal Answer
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
                  backgroundColor: current.type === 'ASK'
                    ? 'rgba(39, 174, 96, 0.15)'
                    : 'rgba(231, 76, 60, 0.15)',
                  border: `2px solid ${current.type === 'ASK' ? '#27AE60' : '#E74C3C'}`,
                }}
              >
                <p
                  className="text-2xl md:text-3xl font-bold mb-2"
                  style={{ color: current.type === 'ASK' ? '#27AE60' : '#E74C3C' }}
                >
                  {current.type === 'ASK' ? '✓ REAL QUESTION' : '✗ TELL IN DISGUISE'}
                </p>
                <p className="text-white">{current.why}</p>
              </div>

              <button
                onClick={handleNext}
                className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: colorConfig.accent, color: '#0a1628' }}
              >
                {currentRound < statements.length - 1 ? 'Next →' : 'Finish →'}
              </button>
            </div>
          )}
        </div>
      )}

      {screen === 'done' && (
        <DoneScreen
          icon="🎯"
          title="The Takeaway"
          message="A question mark doesn't make it a question."
          subMessage="'Don't you think...' and 'Shouldn't you...' are commands wearing question costumes."
          tableTalk="Which ones tricked you?"
          color="yellow"
          onBack={onBack}
        />
      )}
    </GameWrapper>
  );
}
