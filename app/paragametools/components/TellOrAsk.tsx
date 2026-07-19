'use client';

import { useState, useMemo } from 'react';
import { Check, X, ChevronRight, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { GameWrapper, IntroScreen, DoneScreen, ResultCard } from './GameWrapper';
import { StreakCounter } from './StreakCounter';
import { TELL_OR_ASK_STATEMENTS, TELL_OR_ASK_ROUNDS } from '../data/tellOrAsk';
import { COLORS, shuffleAndPick } from '../data/gameConfig';
import { useLanguage } from '../context/LanguageContext';
import { UI_TRANSLATIONS } from '../data/translations';
import { useGameTracking, type WeakItem } from '@/lib/hub/useGameTracking';
import { useGameBadgeCheck } from '@/components/hub/useGameBadgeCheck';
import { GameSettingsPanel } from './GameSettingsPanel';
import { ReviewModeBanner } from './ReviewModeBanner';
import { buildReviewPool } from '@/lib/hub/gameReviewMode';
import { type GameSettings, DEFAULT_SETTINGS, filterBySettings } from '../data/gameSettings';

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
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [reviewItems, setReviewItems] = useState<(typeof TELL_OR_ASK_STATEMENTS[number] & { _origIndex: number })[] | null>(null);

  const { logCompletion, startSession, logGameResponse, completeSession } = useGameTracking();
  const { language } = useLanguage();
  const t = UI_TRANSLATIONS;

  // Filter and shuffle statements based on settings, preserving original indices
  const statementsWithIds = useMemo(() => {
    const indexed = TELL_OR_ASK_STATEMENTS.map((s, i) => ({ ...s, _origIndex: i }));
    const filtered = filterBySettings(indexed, settings);
    const pool = filtered.length >= 6 ? filtered : indexed;
    return shuffleAndPick(pool, Math.min(TELL_OR_ASK_ROUNDS, pool.length));
  }, [settings]);

  // Use review items if set, otherwise use normal shuffled items
  const activeStatements = reviewItems ?? statementsWithIds;

  const handleStart = async () => {
    setReviewItems(null);
    setScreen('play');
    setCurrentRound(0);
    setRevealed(false);
    setUserGuess(null);
    setStreak(0);
    setBestStreak(0);
    setConfidence(null);
    await startSession('tell-or-ask', statementsWithIds.length, {
      language,
      difficulty: settings.difficulty,
      gradeBand: settings.gradeBand,
      role: settings.role,
    });
  };

  const handleStartReview = async (weakItems: WeakItem[]) => {
    const indexed = TELL_OR_ASK_STATEMENTS.map((s, i) => ({ ...s, _origIndex: i }));
    const { items } = buildReviewPool(
      indexed,
      weakItems,
      Math.min(TELL_OR_ASK_ROUNDS, indexed.length),
      (item) => `tellorask_${item._origIndex}`
    );
    setReviewItems(items);
    setScreen('play');
    setCurrentRound(0);
    setRevealed(false);
    setUserGuess(null);
    setStreak(0);
    setBestStreak(0);
    setConfidence(null);
    await startSession('tell-or-ask', items.length, { language, isReviewMode: true });
  };

  const handleGuess = (guess: 'TELL' | 'ASK') => {
    setUserGuess(guess);
    setRevealed(true);

    const current = activeStatements[currentRound];
    const isCorrect = guess === current.type;
    const newStreak = isCorrect ? streak + 1 : 0;

    if (isCorrect) {
      setStreak(newStreak);
      setCorrectCount((prev) => prev + 1);
      setBestStreak((prev) => Math.max(prev, newStreak));
    } else {
      setStreak(0);
    }

    logGameResponse('tell-or-ask', {
      itemId: `tellorask_${current._origIndex}`,
      roundNumber: currentRound + 1,
      userAnswer: guess,
      correctAnswer: current.type,
      isCorrect,
      confidence: confidence ?? undefined,
    });
  };

  const handleNext = async () => {
    if (currentRound < activeStatements.length - 1) {
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
      logCompletion({ tool: 'tell-or-ask', score: correctCount, totalRounds: activeStatements.length, streak });
      await completeSession(correctCount, bestStreak);
    }
  };

  const colorConfig = COLORS.yellow;
  const current = activeStatements[currentRound];
  const isCorrect = userGuess === current.type;

  const gameTitle = t.games.tellorask.title[language];
  const badgeCelebration = useGameBadgeCheck(screen === 'done');

  return (
    <GameWrapper gameId="tellorask" title={gameTitle} color="yellow" onBack={onBack}>
      {badgeCelebration}
      {screen === 'intro' && (
        <IntroScreen
          gameId="tellorask"
          title={gameTitle}
          color="yellow"
          rules={t.tellorask_rules[language]}
          onStart={handleStart}
          extraContent={
            <>
              <GameSettingsPanel
                settings={settings}
                onChange={setSettings}
                language={language}
                accentColor="#F1C40F"
                show={['difficulty', 'gradeBand']}
              />
              <ReviewModeBanner
                gameId="tell-or-ask"
                accentColor="#F1C40F"
                onStartReview={handleStartReview}
              />
              <div className="flex items-center gap-2 mb-4 text-yellow-400">
                <AlertTriangle size={18} />
                <span className="text-sm">{t.tellorask_warning[language]}</span>
              </div>
            </>
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
            {t.round[language]} {currentRound + 1} {t.of[language]} {activeStatements.length}
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
                {currentRound < activeStatements.length - 1 ? t.next[language] : t.finish[language]}
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
          onPlayAgain={handleStart}
        />
      )}
    </GameWrapper>
  );
}
