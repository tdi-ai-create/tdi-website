'use client';

import { useState, useMemo } from 'react';
import { Check, X, ChevronRight } from 'lucide-react';
import { COLORS, shuffle } from '../data/gameConfig';
import { useLanguage } from '../context/LanguageContext';
import { CLASSROOM_SCENARIOS, SCENARIO_COUNT } from '../data/classroomScenarios';
import { GameWrapper, IntroScreen, DoneScreen } from './GameWrapper';
import { ConfettiBurst } from './ConfettiBurst';
import { useGameTracking } from '@/lib/hub/useGameTracking';
import { useGameBadgeCheck } from '@/components/hub/useGameBadgeCheck';
import { CommunityNudge } from './CommunityNudge';
import { GameSettingsPanel } from './GameSettingsPanel';
import { type GameSettings, DEFAULT_SETTINGS, filterBySettings } from '../data/gameSettings';

type Screen = 'intro' | 'play' | 'results';

interface ClassroomShuffleProps {
  onBack: () => void;
}

export function ClassroomShuffle({ onBack }: ClassroomShuffleProps) {
  const { language } = useLanguage();
  const { logCompletion, startSession, logGameResponse, completeSession } = useGameTracking();
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);

  const scenariosWithIds = useMemo(() => {
    const indexed = CLASSROOM_SCENARIOS.map((s, i) => ({ ...s, _origIndex: i }));
    const filtered = filterBySettings(indexed, settings);
    const pool = filtered.length >= 4 ? filtered : indexed;
    return shuffle(pool).slice(0, Math.min(SCENARIO_COUNT, pool.length));
  }, [settings]);

  const [screen, setScreen] = useState<Screen>('intro');
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const scenario = scenariosWithIds[current];
  const data = scenario[language === 'es' ? 'es' : 'en'];
  const isLast = current === scenariosWithIds.length - 1;

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const isCorrect = scenario.choices[idx].correct;
    if (isCorrect) {
      setScore((s) => s + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak((prev) => Math.max(prev, newStreak));
    } else {
      setStreak(0);
    }

    const correctIdx = scenario.choices.findIndex(c => c.correct);
    logGameResponse('classroom-shuffle', {
      itemId: `classroomshuffle_${scenario._origIndex}`,
      roundNumber: current + 1,
      userAnswer: String(idx),
      correctAnswer: String(correctIdx),
      isCorrect,
    });
  };

  const handleNext = async () => {
    if (isLast) {
      setScreen('results');
      logCompletion({ tool: 'classroom-shuffle', score, totalRounds: scenariosWithIds.length });
      await completeSession(score, bestStreak);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
    }
  };

  const handlePlayAgain = async () => {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setScreen('intro');
    await startSession('classroom-shuffle', scenariosWithIds.length, { language });
  };

  const colorConfig = COLORS.blue;
  const confettiColors = ['#3498DB', '#2980B9', '#5DADE2', '#AED6F1', '#FFFFFF'];
  const badgeCelebration = useGameBadgeCheck(screen === 'results');

  // ── Intro ──
  if (screen === 'intro') {
    return (
      <GameWrapper gameId="classroomshuffle" title={language === 'es' ? 'Escenario de Aula' : 'Classroom Scenario Shuffle'} color="blue" onBack={onBack}>
        <IntroScreen
          gameId="classroomshuffle"
          title={language === 'es' ? 'Escenario de Aula' : 'Classroom Scenario Shuffle'}
          color="blue"
          rules={language === 'es'
            ? [
                'Lee el escenario',
                'Elige la mejor respuesta',
                'Aprende por que funciona',
                `${SCENARIO_COUNT} escenarios reales del salon`,
              ]
            : [
                'Read the scenario',
                'Choose the best response',
                'Learn why it works',
                `${SCENARIO_COUNT} real classroom situations`,
              ]
          }
          onStart={() => { setScreen('play'); startSession('classroom-shuffle', scenariosWithIds.length, { language, difficulty: settings.difficulty, gradeBand: settings.gradeBand, role: settings.role }); }}
          extraContent={
            <GameSettingsPanel
              settings={settings}
              onChange={setSettings}
              language={language}
              accentColor="#3498DB"
            />
          }
        />
      </GameWrapper>
    );
  }

  // ── Results ──
  if (screen === 'results') {
    const title = score >= 7 ? (language === 'es' ? 'Maestro del salon' : 'Classroom Pro')
      : score >= 5 ? (language === 'es' ? 'Buen instinto' : 'Solid Instincts')
      : (language === 'es' ? 'Sigue practicando' : 'Keep Growing');

    const message = score >= 7
      ? (language === 'es' ? 'Tus instintos son fuertes. Confias en la relacion primero y eso se nota.' : 'Your instincts are strong. You lead with relationship and it shows.')
      : score >= 5
      ? (language === 'es' ? 'Buen ojo. Estas en el camino correcto y cada escenario te hace mas agudo.' : 'Good eye. You are on the right track and every scenario sharpens your instincts.')
      : (language === 'es' ? 'Estos escenarios son complicados a proposito. Cada uno que analizas construye tu repertorio.' : 'These scenarios are tricky on purpose. Every one you analyze builds your repertoire.');

    return (
      <GameWrapper gameId="classroomshuffle" title={language === 'es' ? 'Escenario de Aula' : 'Classroom Scenario Shuffle'} color="blue" onBack={onBack}>
        {badgeCelebration}
        {score >= 6 && <ConfettiBurst colors={confettiColors} particleCount={60} />}
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
          {/* Score ring */}
          <div className="w-28 h-28 rounded-full flex items-center justify-center mb-6"
            style={{ border: `4px solid ${colorConfig.accent}`, background: colorConfig.bg }}>
            <span className="text-4xl md:text-5xl font-black text-white">{score}</span>
          </div>
          <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: colorConfig.accent }}>
            {score}/{scenariosWithIds.length}
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-3">{title}</h2>
          <p className="text-sm md:text-base text-white/70 max-w-md mb-8" style={{ lineHeight: 1.6 }}>{message}</p>
          <div className="flex gap-3">
            <button
              onClick={handlePlayAgain}
              className="px-5 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-80"
              style={{ background: colorConfig.accent, color: '#0f1a2e' }}
            >
              {language === 'es' ? 'Jugar de nuevo' : 'Play Again'}
            </button>
            <button
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-80"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              {language === 'es' ? 'Volver' : 'Back to Quick Wins'}
            </button>
          </div>
          <CommunityNudge gameSlug="classroom-shuffle" score={score} totalRounds={scenariosWithIds.length} />
        </div>
      </GameWrapper>
    );
  }

  // ── Play ──
  const choiceData = scenario.choices[selected!];
  const isCorrect = selected !== null && scenario.choices[selected].correct;

  return (
    <GameWrapper gameId="classroomshuffle" title={language === 'es' ? 'Escenario de Aula' : 'Classroom Scenario Shuffle'} color="blue" onBack={onBack}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {scenariosWithIds.map((_, i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full transition-all"
              style={{
                background: i === current ? colorConfig.accent
                  : i < current ? 'rgba(255,255,255,0.5)'
                  : 'rgba(255,255,255,0.15)',
                transform: i === current ? 'scale(1.3)' : 'scale(1)',
              }}
            />
          ))}
        </div>

        {/* Scenario card */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-base md:text-lg text-white leading-relaxed mb-4" style={{ fontFamily: "'Source Serif 4', serif" }}>
            {data.context}
          </p>
          <p className="text-sm font-bold" style={{ color: colorConfig.accent }}>
            {data.question}
          </p>
        </div>

        {/* Choices */}
        <div className="space-y-3 mb-6">
          {scenario.choices.map((choice, idx) => {
            const text = language === 'es' ? choice.es : choice.en;
            const isSelected = selected === idx;
            const isRevealed = selected !== null;
            const thisCorrect = choice.correct;

            let bg = 'rgba(255,255,255,0.06)';
            let border = 'rgba(255,255,255,0.1)';
            if (isRevealed && thisCorrect) {
              bg = 'rgba(39, 174, 96, 0.15)';
              border = 'rgba(39, 174, 96, 0.5)';
            } else if (isRevealed && isSelected && !thisCorrect) {
              bg = 'rgba(231, 76, 60, 0.15)';
              border = 'rgba(231, 76, 60, 0.5)';
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={selected !== null}
                className="w-full text-left rounded-xl p-4 transition-all"
                style={{ background: bg, border: `1px solid ${border}`, cursor: selected !== null ? 'default' : 'pointer' }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-white/90">{text}</p>
                  </div>
                  {isRevealed && thisCorrect && <Check size={18} style={{ color: '#27AE60', flexShrink: 0, marginTop: 2 }} />}
                  {isRevealed && isSelected && !thisCorrect && <X size={18} style={{ color: '#E74C3C', flexShrink: 0, marginTop: 2 }} />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation (after selection) */}
        {selected !== null && (
          <div className="rounded-xl p-4 mb-6" style={{ background: isCorrect ? 'rgba(39,174,96,0.1)' : 'rgba(231,76,60,0.1)', border: `1px solid ${isCorrect ? 'rgba(39,174,96,0.3)' : 'rgba(231,76,60,0.3)'}` }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: isCorrect ? '#27AE60' : '#E74C3C' }}>
              {isCorrect ? (language === 'es' ? 'Correcto' : 'Correct') : (language === 'es' ? 'No exactamente' : 'Not quite')}
            </p>
            <p className="text-sm text-white/80 leading-relaxed">
              {language === 'es'
                ? scenario.choices[selected].explanation.es
                : scenario.choices[selected].explanation.en
              }
            </p>
          </div>
        )}

        {/* Next button */}
        {selected !== null && (
          <div className="flex justify-center">
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-80"
              style={{ background: colorConfig.accent, color: '#0f1a2e' }}
            >
              {isLast ? (language === 'es' ? 'Ver resultados' : 'See Results') : (language === 'es' ? 'Siguiente' : 'Next')}
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </GameWrapper>
  );
}
