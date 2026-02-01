'use client';

import { useState, useMemo } from 'react';
import { Check, X, ChevronRight, AlertTriangle } from 'lucide-react';
import { GameWrapper, IntroScreen, DoneScreen, ResultCard } from './GameWrapper';
import { StreakCounter } from './StreakCounter';
import { TELL_OR_ASK_STATEMENTS, TELL_OR_ASK_ROUNDS } from '../data/tellOrAsk';
import { COLORS, shuffleAndPick } from '../data/gameConfig';

type Screen = 'intro' | 'play' | 'done';

interface TellOrAskProps {
  onBack: () => void;
}

export function TellOrAsk({ onBack }: TellOrAskProps) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [currentRound, setCurrentRound] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [userGuess, setUserGuess] = useState<'TELL' | 'ASK' | null>(null);
  const [streak, setStreak] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Shuffle statements on mount
  const statements = useMemo(
    () => shuffleAndPick(TELL_OR_ASK_STATEMENTS, TELL_OR_ASK_ROUNDS),
    []
  );

  const handleStart = () => {
    setScreen('play');
    setCurrentRound(0);
    setRevealed(false);
    setUserGuess(null);
    setStreak(0);
  };

  const handleGuess = (guess: 'TELL' | 'ASK') => {
    setUserGuess(guess);
    setRevealed(true);

    const isCorrect = guess === statements[currentRound].type;
    if (isCorrect) {
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentRound < statements.length - 1) {
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

  const colorConfig = COLORS.yellow;
  const current = statements[currentRound];
  const isCorrect = userGuess === current.type;

  return (
    <GameWrapper gameId="tellorask" title="Tell or Ask?" color="yellow" onBack={onBack}>
      {screen === 'intro' && (
        <IntroScreen
          gameId="tellorask"
          title="Tell or Ask?"
          color="yellow"
          rules={[
            "I'll show you something a para says to a student.",
            "Your table decides: Is it a real question or a tell in disguise?",
            "Some of these are tricky!",
          ]}
          onStart={handleStart}
          extraContent={
            <div className="flex items-center gap-2 mb-4 text-yellow-400">
              <AlertTriangle size={18} />
              <span className="text-sm">A question mark doesn't always make it a question!</span>
            </div>
          }
        />
      )}

      {screen === 'play' && (
        <div className="flex flex-col items-center">
          {/* Round indicator */}
          <p
            className="text-xs uppercase tracking-widest mb-2"
            style={{ color: 'rgba(241, 196, 15, 0.5)' }}
          >
            Round {currentRound + 1} of {statements.length}
          </p>

          {/* Streak counter */}
          <div className="mb-4">
            <StreakCounter count={streak} color="#F1C40F" />
          </div>

          {/* Statement card */}
          <div
            className={`w-full rounded-xl p-6 md:p-8 mb-6 transition-all duration-200 ${
              isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0 animate-slide-up'
            }`}
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
          >
            <p className="text-2xl md:text-3xl lg:text-4xl text-white italic leading-relaxed text-center">
              "{current.statement}"
            </p>
          </div>

          {/* Pre-reveal state - Voting buttons */}
          {!revealed && (
            <div className="flex flex-col items-center gap-4 w-full">
              <p className="text-lg" style={{ color: '#8899aa' }}>
                Tables: discuss and decide!
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => handleGuess('ASK')}
                  className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
                  style={{ backgroundColor: 'rgba(39, 174, 96, 0.2)', border: '2px solid #27AE60', color: '#27AE60' }}
                >
                  <Check size={24} />
                  ASK
                </button>
                <button
                  onClick={() => handleGuess('TELL')}
                  className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
                  style={{ backgroundColor: 'rgba(231, 76, 60, 0.2)', border: '2px solid #E74C3C', color: '#E74C3C' }}
                >
                  <X size={24} />
                  TELL
                </button>
              </div>
            </div>
          )}

          {/* Post-reveal state */}
          {revealed && (
            <div className="flex flex-col items-center gap-4 w-full">
              <ResultCard
                isCorrect={isCorrect}
                title={current.type === 'ASK' ? 'REAL QUESTION' : 'TELL IN DISGUISE'}
                explanation={current.why}
                shake={!isCorrect}
              />

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: colorConfig.accent, color: '#0a1628' }}
              >
                {currentRound < statements.length - 1 ? 'Next' : 'Finish'}
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      )}

      {screen === 'done' && (
        <DoneScreen
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
