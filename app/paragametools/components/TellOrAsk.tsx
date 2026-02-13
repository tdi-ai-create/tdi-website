'use client';

import { useState, useMemo } from 'react';
import { Check, X, ChevronRight, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { GameWrapper, IntroScreen, DoneScreen, ResultCard } from './GameWrapper';
import { StreakCounter } from './StreakCounter';
import { TELL_OR_ASK_STATEMENTS, TELL_OR_ASK_ROUNDS } from '../data/tellOrAsk';
import { COLORS, shuffleAndPick } from '../data/gameConfig';
import { useLanguage } from '../context/LanguageContext';
import { UI_TRANSLATIONS } from '../data/translations';

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
  const [confidence, setConfidence] = useState<number | null>(null);

  const { language } = useLanguage();
  const t = UI_TRANSLATIONS;

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
    setConfidence(null);
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
        setConfidence(null);
        setIsAnimating(false);
      }, 200);
    } else {
      setScreen('done');
    }
  };

  const colorConfig = COLORS.yellow;
  const current = statements[currentRound];
  const isCorrect = userGuess === current.type;

  const gameTitle = t.games.tellorask.title[language];

  return (
    <GameWrapper gameId="tellorask" title={gameTitle} color="yellow" onBack={onBack}>
      {screen === 'intro' && (
        <IntroScreen
          gameId="tellorask"
          title={gameTitle}
          color="yellow"
          rules={t.tellorask_rules[language]}
          onStart={handleStart}
          extraContent={
            <div className="flex items-center gap-2 mb-4 text-yellow-400">
              <AlertTriangle size={18} />
              <span className="text-sm">{t.tellorask_warning[language]}</span>
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
            {t.round[language]} {currentRound + 1} {t.of[language]} {statements.length}
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
              "{current.statement[language]}"
            </p>
          </div>

          {/* Pre-reveal state - Voting buttons */}
          {!revealed && (
            <div className="flex flex-col items-center gap-4 w-full">
              {/* Confidence Meter */}
              <div
                className="w-full rounded-lg p-4"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
              >
                <h4 className="text-white text-center mb-3">{t.tellorask_confidence[language]}</h4>
                <div className="flex justify-between gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => setConfidence(level)}
                      className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${
                        confidence === level
                          ? 'bg-yellow-500 text-black'
                          : 'bg-slate-600 hover:bg-slate-500 text-white'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>{t.tellorask_guessing[language]}</span>
                  <span>{t.tellorask_verySure[language]}</span>
                </div>
              </div>

              <p className="text-lg" style={{ color: '#8899aa' }}>
                {t.tellorask_discuss[language]}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => handleGuess('ASK')}
                  className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
                  style={{ backgroundColor: 'rgba(39, 174, 96, 0.2)', border: '2px solid #27AE60', color: '#27AE60' }}
                >
                  <Check size={24} />
                  {t.tellorask_ask[language]}
                </button>
                <button
                  onClick={() => handleGuess('TELL')}
                  className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
                  style={{ backgroundColor: 'rgba(231, 76, 60, 0.2)', border: '2px solid #E74C3C', color: '#E74C3C' }}
                >
                  <X size={24} />
                  {t.tellorask_tell[language]}
                </button>
              </div>
            </div>
          )}

          {/* Post-reveal state */}
          {revealed && (
            <div className="flex flex-col items-center gap-4 w-full">
              <ResultCard
                isCorrect={isCorrect}
                title={current.type === 'ASK' ? t.tellorask_realQuestion[language] : t.tellorask_tellInDisguise[language]}
                explanation={current.why[language]}
                shake={!isCorrect}
              />

              {/* Confidence Feedback */}
              {confidence !== null && confidence >= 4 && !isCorrect && (
                <div
                  className="w-full rounded-lg p-3 flex items-center justify-center gap-2"
                  style={{ backgroundColor: 'rgba(241, 196, 15, 0.1)', border: '1px solid rgba(241, 196, 15, 0.3)' }}
                >
                  <AlertCircle size={20} className="text-yellow-400" />
                  <span className="text-yellow-200">{t.tellorask_overconfident[language]}</span>
                </div>
              )}
              {confidence !== null && confidence <= 2 && isCorrect && (
                <div
                  className="w-full rounded-lg p-3 flex items-center justify-center gap-2"
                  style={{ backgroundColor: 'rgba(39, 174, 96, 0.1)', border: '1px solid rgba(39, 174, 96, 0.3)' }}
                >
                  <CheckCircle size={20} className="text-green-400" />
                  <span className="text-green-200">{t.tellorask_humble[language]}</span>
                </div>
              )}

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: colorConfig.accent, color: '#0a1628' }}
              >
                {currentRound < statements.length - 1 ? t.next[language] : t.finish[language]}
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      )}

      {screen === 'done' && (
        <DoneScreen
          title={t.tellorask_doneTitle[language]}
          message={t.tellorask_doneMessage[language]}
          subMessage={t.tellorask_doneSubMessage[language]}
          tableTalk={t.tellorask_tableTalk[language]}
          color="yellow"
          onBack={onBack}
        />
      )}
    </GameWrapper>
  );
}
