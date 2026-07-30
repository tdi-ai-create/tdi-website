'use client';

import { useState } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { COLORS } from '../data/gameConfig';
import { useLanguage } from '../context/LanguageContext';
import { PLAYBOOK_SCENARIOS, PLAYBOOK_SCENARIO_COUNT } from '../data/principalPlaybook';
import { GameWrapper } from './GameWrapper';
import { ConfettiBurst } from './ConfettiBurst';
import { useGameTracking } from '@/lib/hub/useGameTracking';
import { useGameBadgeCheck } from '@/components/hub/useGameBadgeCheck';
import { CommunityNudge } from './CommunityNudge';

type Screen = 'intro' | 'play' | 'results';

const GOLD = COLORS.gold;

export function PrincipalPlaybook({ onBack }: { onBack: () => void }) {
  const { language } = useLanguage();
  const { logCompletion, startSession, logGameResponse, completeSession } = useGameTracking();
  const [screen, setScreen] = useState<Screen>('intro');
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lensResults, setLensResults] = useState<Record<string, { total: number; correct: number }>>({});

  const scenario = PLAYBOOK_SCENARIOS[current];
  const data = scenario[language];
  const isLast = current === PLAYBOOK_SCENARIO_COUNT - 1;

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const isCorrect = data.choices[idx].best;
    if (isCorrect) {
      setScore((s) => s + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak((prev) => Math.max(prev, newStreak));
    } else {
      setStreak(0);
    }

    // Track leadership lens results
    const lens = data.leadershipLens;
    setLensResults((prev) => {
      const existing = prev[lens] || { total: 0, correct: 0 };
      return {
        ...prev,
        [lens]: {
          total: existing.total + 1,
          correct: existing.correct + (isCorrect ? 1 : 0),
        },
      };
    });

    const bestIdx = data.choices.findIndex((c) => c.best);
    logGameResponse('principal-playbook', {
      itemId: `principalplaybook_${current}`,
      roundNumber: current + 1,
      userAnswer: String(idx),
      correctAnswer: String(bestIdx),
      isCorrect,
    });
  };

  const handleNext = async () => {
    if (isLast) {
      setScreen('results');
      logCompletion({ tool: 'principal-playbook', score, totalRounds: PLAYBOOK_SCENARIO_COUNT });
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
    setLensResults({});
    setScreen('intro');
    await startSession('principal-playbook', PLAYBOOK_SCENARIO_COUNT, { language });
  };

  const gameTitle = language === 'es' ? 'Manual del Director' : 'Principal Playbook';
  const badgeCelebration = useGameBadgeCheck(screen === 'results');

  return (
    <GameWrapper gameId="principalplaybook" title={gameTitle} color="gold" onBack={onBack}>
      {badgeCelebration}
      {screen === 'intro' && (
        <IntroScreen
          onStart={() => {
            setScreen('play');
            startSession('principal-playbook', PLAYBOOK_SCENARIO_COUNT, { language });
          }}
          language={language}
        />
      )}
      {screen === 'play' && (
        <PlayScreen
          language={language}
          current={current}
          data={data}
          selected={selected}
          onSelect={handleSelect}
          onNext={handleNext}
          isLast={isLast}
        />
      )}
      {screen === 'results' && (
        <ResultsScreen
          language={language}
          score={score}
          lensResults={lensResults}
          onPlayAgain={handlePlayAgain}
          onBack={onBack}
        />
      )}
    </GameWrapper>
  );
}

// Intro Screen
function IntroScreen({ onStart, language }: { onStart: () => void; language: 'en' | 'es' }) {
  return (
    <div className="flex flex-col items-center text-center animate-fade-in">
      <div
        className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: GOLD.bg, border: `2px solid ${GOLD.accent}` }}
      >
        <span className="text-4xl font-black" style={{ color: GOLD.accent }}>P</span>
      </div>
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
        {language === 'es' ? 'Manual del Director' : 'Principal Playbook'}
      </h2>
      <p className="text-lg mb-6" style={{ color: GOLD.accent }}>
        {language === 'es' ? 'Tu edificio. Tu decision.' : 'Your building. Your call.'}
      </p>

      <div
        className="w-full max-w-lg rounded-xl p-6 mb-6"
        style={{ backgroundColor: GOLD.bg, border: `1px solid ${GOLD.border}` }}
      >
        <p className="text-white text-base leading-relaxed mb-4">
          {language === 'es'
            ? '10 escenarios reales que llegan al escritorio de un director. Toma la decision, mira lo que dice la investigacion. No hay respuestas perfectas, solo mejores instintos.'
            : '10 real scenarios that land on a principal\'s desk. Make the call, see what research says. No perfect answers, just better instincts.'}
        </p>
        <ul className="space-y-2 text-left">
          {(language === 'es'
            ? [
                'Lee cada escenario de liderazgo.',
                'Elige la mejor respuesta de cuatro opciones.',
                'Descubre lo que dice la investigacion.',
              ]
            : [
                'Read each leadership scenario.',
                'Choose the best response from four options.',
                'See what the research says.',
              ]
          ).map((rule, i) => (
            <li key={i} className="flex items-start gap-3 text-white text-sm">
              <span style={{ color: GOLD.accent }}>*</span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={onStart}
        className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95 animate-glow-pulse"
        style={{
          backgroundColor: GOLD.accent,
          color: '#0a1628',
          ['--glow-color' as string]: GOLD.accent + '40',
        }}
      >
        {language === 'es' ? '¡Vamos! \u2192' : "Let's Go \u2192"}
      </button>
    </div>
  );
}

// Play Screen
function PlayScreen({
  language,
  current,
  data,
  selected,
  onSelect,
  onNext,
  isLast,
}: {
  language: 'en' | 'es';
  current: number;
  data: {
    context: string;
    scenario: string;
    choices: { letter: string; text: string; best: boolean }[];
    researchSays: string;
    leadershipLens: string;
  };
  selected: number | null;
  onSelect: (idx: number) => void;
  onNext: () => void;
  isLast: boolean;
}) {
  return (
    <div className="animate-fade-in">
      {/* Progress pips */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {Array.from({ length: PLAYBOOK_SCENARIO_COUNT }).map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i <= current ? GOLD.accent : 'rgba(255,255,255,0.15)',
            }}
          />
        ))}
      </div>

      {/* Counter */}
      <p className="text-center text-sm mb-2" style={{ color: '#8899aa' }}>
        {language === 'es'
          ? `Escenario ${current + 1} de ${PLAYBOOK_SCENARIO_COUNT}`
          : `Scenario ${current + 1} of ${PLAYBOOK_SCENARIO_COUNT}`}
      </p>

      {/* Context line */}
      <p className="text-center text-sm mb-4 italic" style={{ color: GOLD.accent, opacity: 0.8 }}>
        {data.context}
      </p>

      {/* Scenario card */}
      <div
        className="rounded-xl p-6 mb-6"
        style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <p className="text-white text-base md:text-lg leading-relaxed">{data.scenario}</p>
      </div>

      {/* Choices */}
      <div className="flex flex-col gap-3 mb-6">
        {data.choices.map((choice, idx) => {
          const isSelected = selected === idx;
          const isBest = choice.best;
          const isRevealed = selected !== null;

          let bg = 'rgba(255,255,255,0.06)';
          let border = 'rgba(255,255,255,0.15)';
          let opacity = 1;

          if (isRevealed) {
            if (isBest) {
              bg = 'rgba(39, 174, 96, 0.2)';
              border = '#27AE60';
            } else if (isSelected && !isBest) {
              bg = 'rgba(232, 184, 75, 0.15)';
              border = '#E8B84B';
            } else {
              opacity = 0.4;
            }
          }

          return (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              disabled={isRevealed}
              className="w-full text-left rounded-xl p-4 transition-all duration-200 flex items-start gap-3"
              style={{
                backgroundColor: bg,
                border: `2px solid ${border}`,
                opacity,
                cursor: isRevealed ? 'default' : 'pointer',
              }}
            >
              <span
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                style={{
                  backgroundColor: isRevealed && isBest ? '#27AE60' : isRevealed && isSelected ? '#E8B84B' : GOLD.accent,
                  color: isRevealed && isSelected && !isBest ? '#0a1628' : '#fff',
                }}
              >
                {choice.letter}
              </span>
              <div className="flex-1">
                <span className="text-white text-base">{choice.text}</span>
                {isRevealed && isBest && (
                  <span
                    className="inline-block ml-2 px-2 py-0.5 rounded text-xs font-bold"
                    style={{ backgroundColor: 'rgba(39, 174, 96, 0.3)', color: '#27AE60' }}
                  >
                    {language === 'es' ? 'La investigacion concuerda' : 'Research agrees'}
                  </span>
                )}
                {isRevealed && isSelected && !isBest && (
                  <span
                    className="inline-block ml-2 px-2 py-0.5 rounded text-xs font-bold"
                    style={{ backgroundColor: 'rgba(232, 184, 75, 0.2)', color: '#E8B84B' }}
                  >
                    {language === 'es' ? 'Defendible, pero...' : 'Defensible, but...'}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Research reveal */}
      {selected !== null && (
        <div className="animate-reveal-bounce mb-6">
          {/* Research card with gold left border */}
          <div
            className="rounded-xl p-6"
            style={{
              backgroundColor: 'rgba(232, 184, 75, 0.08)',
              borderLeft: `4px solid ${GOLD.accent}`,
              border: `1px solid rgba(232, 184, 75, 0.3)`,
              borderLeftWidth: '4px',
              borderLeftColor: GOLD.accent,
            }}
          >
            <p className="font-bold text-base mb-3" style={{ color: GOLD.accent }}>
              {language === 'es' ? 'La investigacion dice:' : 'Research says:'}
            </p>
            <p className="text-white text-base leading-relaxed mb-4">{data.researchSays}</p>

            {/* Leadership Lens pill */}
            <div className="flex items-center gap-2">
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                style={{
                  backgroundColor: GOLD.bg,
                  border: `1px solid ${GOLD.border}`,
                  color: GOLD.accent,
                }}
              >
                {language === 'es' ? 'Lente de Liderazgo' : 'Leadership Lens'}: {data.leadershipLens}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Next button */}
      {selected !== null && (
        <div className="flex justify-center">
          <button
            onClick={onNext}
            className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: GOLD.accent, color: '#0a1628' }}
          >
            {isLast
              ? language === 'es'
                ? 'Ver Resultados'
                : 'See Results'
              : language === 'es'
                ? 'Siguiente Escenario \u2192'
                : 'Next Scenario \u2192'}
          </button>
        </div>
      )}
    </div>
  );
}

// Results Screen
function ResultsScreen({
  language,
  score,
  lensResults,
  onPlayAgain,
  onBack,
}: {
  language: 'en' | 'es';
  score: number;
  lensResults: Record<string, { total: number; correct: number }>;
  onPlayAgain: () => void;
  onBack: () => void;
}) {
  const confettiColors = [GOLD.accent, '#FFD700', '#FFFFFF'];
  const { title, message } = getScoreContent(score, language);

  return (
    <div className="flex flex-col items-center text-center">
      {score >= 7 && <ConfettiBurst colors={confettiColors} particleCount={60} />}

      {/* Score ring */}
      <div
        className="w-28 h-28 md:w-32 md:h-32 rounded-full flex flex-col items-center justify-center mb-6 animate-scale-in"
        style={{ backgroundColor: GOLD.bg, border: `3px solid ${GOLD.accent}` }}
      >
        <span className="text-4xl md:text-5xl font-black text-white">{score}</span>
        <span className="text-sm" style={{ color: GOLD.accent }}>
          {language === 'es' ? `de ${PLAYBOOK_SCENARIO_COUNT}` : `of ${PLAYBOOK_SCENARIO_COUNT}`}
        </span>
      </div>

      <p className="text-sm mb-1" style={{ color: '#8899aa' }}>
        {language === 'es' ? 'alineado con la investigacion' : 'aligned with research'}
      </p>

      <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{title}</h2>
      <p className="text-lg text-white mb-8 max-w-lg leading-relaxed">{message}</p>

      {/* Leadership Lens Breakdown */}
      {Object.keys(lensResults).length > 0 && (
        <div
          className="w-full max-w-lg rounded-xl p-5 mb-6"
          style={{ backgroundColor: GOLD.bg, border: `1px solid ${GOLD.border}` }}
        >
          <p className="text-sm uppercase tracking-wider mb-3 font-bold" style={{ color: GOLD.accent }}>
            {language === 'es' ? 'Tu perfil de liderazgo' : 'Your Leadership Profile'}
          </p>
          <div className="flex flex-col gap-2">
            {Object.entries(lensResults).map(([lens, { total, correct }]) => (
              <div key={lens} className="flex items-center justify-between">
                <span className="text-white text-sm">{lens}</span>
                <span
                  className="text-sm font-bold"
                  style={{ color: correct === total ? '#27AE60' : '#8899aa' }}
                >
                  {correct}/{total}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat prompt card */}
      <div
        className="w-full max-w-lg rounded-xl p-5 mb-6"
        style={{ backgroundColor: 'rgba(232, 184, 75, 0.1)', border: '1px solid rgba(232, 184, 75, 0.4)' }}
      >
        <p className="text-white text-base">
          {language === 'es'
            ? 'Cada escenario tiene multiples respuestas defendibles. La investigacion sugiere una direccion, pero tu contexto importa. Reflexiona sobre cual escenario se sintio mas cercano a tu realidad diaria.'
            : 'Every scenario has multiple defensible responses. Research points in a direction, but your context matters. Reflect on which scenario felt closest to your daily reality.'}
        </p>
      </div>

      {/* Resource links */}
      <div className="w-full max-w-lg flex flex-col gap-3 mb-8">
        <a
          href="https://teachersdeserveit.com/paragametools"
          className="flex items-center justify-center gap-2 rounded-xl py-3 px-6 font-medium transition-all hover:brightness-110"
          style={{ backgroundColor: GOLD.bg, border: `1px solid ${GOLD.border}`, color: GOLD.accent }}
        >
          <ExternalLink size={16} />
          {language === 'es' ? 'Mas Juegos de Practica' : 'More Practice Games'}
        </a>
        <a
          href="https://www.teachersdeserveit.com/hub"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl py-3 px-6 font-medium transition-all hover:brightness-110"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#8899aa' }}
        >
          <ExternalLink size={16} />
          {language === 'es' ? 'Centro de Aprendizaje' : 'Learning Hub'}
        </a>
      </div>

      {/* Play again */}
      <button
        onClick={onPlayAgain}
        className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95 mb-4"
        style={{ backgroundColor: GOLD.accent, color: '#0a1628' }}
      >
        {language === 'es' ? 'Jugar de Nuevo' : 'Play Again'}
      </button>

      <button
        onClick={onBack}
        className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 active:scale-95"
        style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#ffffff' }}
      >
        <ArrowLeft size={18} />
        {language === 'es' ? 'Volver a Juegos' : 'Back to Games'}
      </button>
      <CommunityNudge gameSlug="principal-playbook" score={score} totalRounds={PLAYBOOK_SCENARIO_COUNT} />
    </div>
  );
}

// Score content helper
function getScoreContent(score: number, lang: 'en' | 'es') {
  if (score >= 9) {
    return lang === 'es'
      ? {
          title: 'Instintos de lider.',
          message: 'Tu brujula se alinea con lo que dice la investigacion. Confias en los procesos, proteges a tu gente y tomas decisiones que construyen confianza a largo plazo.',
        }
      : {
          title: 'Leader instincts.',
          message: 'Your compass aligns with what research says. You trust process, protect your people, and make decisions that build trust over time.',
        };
  }
  if (score >= 6) {
    return lang === 'es'
      ? {
          title: 'Base solida.',
          message: 'Estas tomando decisiones fuertes la mayoria de las veces. Los que fallaste revelan tus puntos ciegos, y eso es exactamente donde sucede el crecimiento.',
        }
      : {
          title: 'Solid foundation.',
          message: 'You are making strong calls most of the time. The ones you missed reveal your blind spots, and that is exactly where growth happens.',
        };
  }
  return lang === 'es'
    ? {
        title: 'Comienzo reflexivo.',
        message: 'Estos escenarios son dificiles a proposito. Cada "respuesta incorrecta" es algo que un director real ha hecho. La diferencia es la pausa, la reflexion y saber lo que dice la investigacion antes de que llegue el momento.',
      }
    : {
        title: 'Thoughtful start.',
        message: 'These scenarios are hard on purpose. Every "wrong answer" is something a real principal has done. The difference is the pause, the reflection, and knowing what research says before the moment arrives.',
      };
}
