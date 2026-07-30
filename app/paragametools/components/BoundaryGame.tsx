'use client';

import { useState } from 'react';
import { ArrowLeft, ExternalLink, Shield } from 'lucide-react';
import { COLORS } from '../data/gameConfig';
import { useLanguage } from '../context/LanguageContext';
import { BOUNDARY_SCENARIOS, BOUNDARY_SCENARIO_COUNT, type BoundaryScenario } from '../data/boundaryGame';
import { GameWrapper } from './GameWrapper';
import { ConfettiBurst } from './ConfettiBurst';
import { useGameTracking } from '@/lib/hub/useGameTracking';
import { useGameBadgeCheck } from '@/components/hub/useGameBadgeCheck';
import { CommunityNudge } from './CommunityNudge';

type Screen = 'intro' | 'play' | 'results';

const ROSE = COLORS.rose;

export function BoundaryGame({ onBack }: { onBack: () => void }) {
  const { language } = useLanguage();
  const { logCompletion, startSession, logGameResponse, completeSession } = useGameTracking();
  const [screen, setScreen] = useState<Screen>('intro');
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [streak, setStreak] = useState(0);
  const [typeResults, setTypeResults] = useState<Record<string, { total: number; correct: number }>>({});
  const [gameScenarios, setGameScenarios] = useState<BoundaryScenario[]>([]);

  const shuffleScenarios = () => {
    const shuffled = [...BOUNDARY_SCENARIOS];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setGameScenarios(shuffled.slice(0, BOUNDARY_SCENARIO_COUNT));
  };

  const scenario = gameScenarios[current];
  const data = scenario ? scenario[language] : null;
  const isLast = current === BOUNDARY_SCENARIO_COUNT - 1;

  const handleSelect = (idx: number) => {
    if (selected !== null || !data) return;
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

    const bType = data.boundaryType;
    setTypeResults((prev) => {
      const existing = prev[bType] || { total: 0, correct: 0 };
      return {
        ...prev,
        [bType]: {
          total: existing.total + 1,
          correct: existing.correct + (isCorrect ? 1 : 0),
        },
      };
    });

    const bestIdx = data.choices.findIndex((c) => c.best);
    logGameResponse('boundary-game', {
      itemId: `boundarygame_${current}`,
      roundNumber: current + 1,
      userAnswer: String(idx),
      correctAnswer: String(bestIdx),
      isCorrect,
    });
  };

  const handleNext = async () => {
    if (isLast) {
      setScreen('results');
      logCompletion({ tool: 'boundary-game', score, totalRounds: BOUNDARY_SCENARIO_COUNT });
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
    setTypeResults({});
    shuffleScenarios();
    setScreen('intro');
    await startSession('boundary-game', BOUNDARY_SCENARIO_COUNT, { language });
  };

  const gameTitle = language === 'es' ? 'El Juego de Limites' : 'The Boundary Game';
  const badgeCelebration = useGameBadgeCheck(screen === 'results');

  return (
    <GameWrapper gameId="boundarygame" title={gameTitle} color="rose" onBack={onBack}>
      {badgeCelebration}
      {screen === 'intro' && (
        <IntroScreen
          onStart={() => {
            shuffleScenarios();
            setScreen('play');
            startSession('boundary-game', BOUNDARY_SCENARIO_COUNT, { language });
          }}
          language={language}
        />
      )}
      {screen === 'play' && data && (
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
          typeResults={typeResults}
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
        style={{ backgroundColor: ROSE.bg, border: `2px solid ${ROSE.accent}` }}
      >
        <Shield size={36} style={{ color: ROSE.accent }} />
      </div>
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
        {language === 'es' ? 'El Juego de Limites' : 'The Boundary Game'}
      </h2>
      <p className="text-lg mb-6" style={{ color: ROSE.accent }}>
        {language === 'es' ? 'Protegerte no es egoismo. Es una habilidad.' : 'Protecting yourself is not selfish. It is a skill.'}
      </p>

      <div
        className="w-full max-w-lg rounded-xl p-6 mb-6"
        style={{ backgroundColor: ROSE.bg, border: `1px solid ${ROSE.border}` }}
      >
        <p className="text-white text-base leading-relaxed mb-4">
          {language === 'es'
            ? '10 dilemas reales donde necesitas establecer un limite pero te sientes culpable por hacerlo. Elige tu respuesta, descubre lo que dice la investigacion sobre limites saludables.'
            : '10 real dilemmas where you need to set a boundary but feel guilty about it. Pick your response, see what healthy boundary research says.'}
        </p>
        <ul className="space-y-2 text-left">
          {(language === 'es'
            ? [
                'Lee cada situacion de limites.',
                'Elige la mejor respuesta de tres opciones.',
                'Descubre por que ese limite importa.',
              ]
            : [
                'Read each boundary situation.',
                'Choose the best response from three options.',
                'See why that boundary matters.',
              ]
          ).map((rule, i) => (
            <li key={i} className="flex items-start gap-3 text-white text-sm">
              <span style={{ color: ROSE.accent }}>*</span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={onStart}
        className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95 animate-glow-pulse"
        style={{
          backgroundColor: ROSE.accent,
          color: '#ffffff',
          ['--glow-color' as string]: ROSE.accent + '40',
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
    choices: { text: string; best: boolean }[];
    healthyBoundary: string;
    boundaryType: string;
  };
  selected: number | null;
  onSelect: (idx: number) => void;
  onNext: () => void;
  isLast: boolean;
}) {
  const letters = ['A', 'B', 'C'];

  return (
    <div className="animate-fade-in">
      {/* Progress pips */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {Array.from({ length: BOUNDARY_SCENARIO_COUNT }).map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i <= current ? ROSE.accent : 'rgba(255,255,255,0.15)',
            }}
          />
        ))}
      </div>

      {/* Counter */}
      <p className="text-center text-sm mb-2" style={{ color: '#8899aa' }}>
        {language === 'es'
          ? `Escenario ${current + 1} de ${BOUNDARY_SCENARIO_COUNT}`
          : `Scenario ${current + 1} of ${BOUNDARY_SCENARIO_COUNT}`}
      </p>

      {/* Context line */}
      <p className="text-center text-sm mb-4 italic" style={{ color: ROSE.accent, opacity: 0.8 }}>
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
              bg = 'rgba(244, 63, 94, 0.15)';
              border = ROSE.accent;
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
                  backgroundColor: isRevealed && isBest ? '#27AE60' : isRevealed && isSelected ? ROSE.accent : ROSE.accent,
                  color: '#fff',
                }}
              >
                {letters[idx]}
              </span>
              <div className="flex-1">
                <span className="text-white text-base">{choice.text}</span>
                {isRevealed && isBest && (
                  <span
                    className="inline-block ml-2 px-2 py-0.5 rounded text-xs font-bold"
                    style={{ backgroundColor: 'rgba(39, 174, 96, 0.3)', color: '#27AE60' }}
                  >
                    {language === 'es' ? 'Limite saludable' : 'Healthy boundary'}
                  </span>
                )}
                {isRevealed && isSelected && !isBest && (
                  <span
                    className="inline-block ml-2 px-2 py-0.5 rounded text-xs font-bold"
                    style={{ backgroundColor: 'rgba(244, 63, 94, 0.2)', color: ROSE.accent }}
                  >
                    {language === 'es' ? 'Comprensible, pero...' : 'Understandable, but...'}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Boundary reveal */}
      {selected !== null && (
        <div className="animate-reveal-bounce mb-6">
          <div
            className="rounded-xl p-6"
            style={{
              backgroundColor: 'rgba(244, 63, 94, 0.08)',
              borderLeft: `4px solid ${ROSE.accent}`,
              border: `1px solid rgba(244, 63, 94, 0.3)`,
              borderLeftWidth: '4px',
              borderLeftColor: ROSE.accent,
            }}
          >
            <p className="font-bold text-base mb-3" style={{ color: ROSE.accent }}>
              {language === 'es' ? 'Por que este limite importa:' : 'Why this boundary matters:'}
            </p>
            <p className="text-white text-base leading-relaxed mb-4">{data.healthyBoundary}</p>

            {/* Boundary Type pill */}
            <div className="flex items-center gap-2">
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                style={{
                  backgroundColor: ROSE.bg,
                  border: `1px solid ${ROSE.border}`,
                  color: ROSE.accent,
                }}
              >
                {data.boundaryType}
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
            style={{ backgroundColor: ROSE.accent, color: '#ffffff' }}
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
  typeResults,
  onPlayAgain,
  onBack,
}: {
  language: 'en' | 'es';
  score: number;
  typeResults: Record<string, { total: number; correct: number }>;
  onPlayAgain: () => void;
  onBack: () => void;
}) {
  const confettiColors = [ROSE.accent, '#FF6B8A', '#FFFFFF'];
  const { title, message } = getScoreContent(score, language);

  return (
    <div className="flex flex-col items-center text-center">
      {score >= 7 && <ConfettiBurst colors={confettiColors} particleCount={60} />}

      {/* Score ring */}
      <div
        className="w-28 h-28 md:w-32 md:h-32 rounded-full flex flex-col items-center justify-center mb-6 animate-scale-in"
        style={{ backgroundColor: ROSE.bg, border: `3px solid ${ROSE.accent}` }}
      >
        <span className="text-4xl md:text-5xl font-black text-white">{score}</span>
        <span className="text-sm" style={{ color: ROSE.accent }}>
          {language === 'es' ? `de ${BOUNDARY_SCENARIO_COUNT}` : `of ${BOUNDARY_SCENARIO_COUNT}`}
        </span>
      </div>

      <p className="text-sm mb-1" style={{ color: '#8899aa' }}>
        {language === 'es' ? 'limites saludables elegidos' : 'healthy boundaries chosen'}
      </p>

      <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{title}</h2>
      <p className="text-lg text-white mb-8 max-w-lg leading-relaxed">{message}</p>

      {/* Boundary Type Breakdown */}
      {Object.keys(typeResults).length > 0 && (
        <div
          className="w-full max-w-lg rounded-xl p-5 mb-6"
          style={{ backgroundColor: ROSE.bg, border: `1px solid ${ROSE.border}` }}
        >
          <p className="text-sm uppercase tracking-wider mb-3 font-bold" style={{ color: ROSE.accent }}>
            {language === 'es' ? 'Tu perfil de limites' : 'Your Boundary Profile'}
          </p>
          <div className="flex flex-col gap-2">
            {Object.entries(typeResults).map(([bType, { total, correct }]) => (
              <div key={bType} className="flex items-center justify-between">
                <span className="text-white text-sm">{bType}</span>
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

      {/* Reflection card */}
      <div
        className="w-full max-w-lg rounded-xl p-5 mb-6"
        style={{ backgroundColor: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.4)' }}
      >
        <p className="text-white text-base">
          {language === 'es'
            ? 'Establecer limites no es ser dificil. Es decidir que puedes dar lo mejor de ti cuando proteges tu energia, tu tiempo y tu bienestar. ¿Cual escenario se sintio mas cercano a algo que enfrentas en tu vida real?'
            : 'Setting boundaries is not being difficult. It is deciding that you can give your best when you protect your energy, your time, and your wellbeing. Which scenario felt closest to something you face in your real life?'}
        </p>
      </div>

      {/* Resource links */}
      <div className="w-full max-w-lg flex flex-col gap-3 mb-8">
        <a
          href="https://teachersdeserveit.com/paragametools"
          className="flex items-center justify-center gap-2 rounded-xl py-3 px-6 font-medium transition-all hover:brightness-110"
          style={{ backgroundColor: ROSE.bg, border: `1px solid ${ROSE.border}`, color: ROSE.accent }}
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
        style={{ backgroundColor: ROSE.accent, color: '#ffffff' }}
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
      <CommunityNudge gameSlug="boundary-game" score={score} totalRounds={BOUNDARY_SCENARIO_COUNT} />
    </div>
  );
}

// Score content helper
function getScoreContent(score: number, lang: 'en' | 'es') {
  if (score >= 9) {
    return lang === 'es'
      ? {
          title: 'Maestro/a de limites.',
          message: 'Sabes cuando decir que no y como decirlo con gracia. Eso no es egoismo. Es autoconservacion profesional. Tu escuela necesita que sigas apareciendo, y eso requiere que te protejas.',
        }
      : {
          title: 'Boundary pro.',
          message: 'You know when to say no and how to say it with grace. That is not selfishness. It is professional self-preservation. Your school needs you to keep showing up, and that requires you to protect yourself.',
        };
  }
  if (score >= 6) {
    return lang === 'es'
      ? {
          title: 'Construyendo fortaleza.',
          message: 'Reconoces los limites saludables la mayoria de las veces. Los que fallaste revelan donde la culpa o el habito todavia ganan. Esos son los que mas necesitas practicar.',
        }
      : {
          title: 'Building strength.',
          message: 'You recognize healthy boundaries most of the time. The ones you missed reveal where guilt or habit still wins. Those are the ones you most need to practice.',
        };
  }
  return lang === 'es'
    ? {
        title: 'Trabajo valiente.',
        message: 'Estos escenarios son dificiles porque reflejan la presion real que sienten los educadores. Cada limite que identificaste es un paso. Cada uno que no lo fue es una oportunidad de practicar. Los limites son un musculo, no un rasgo de personalidad.',
      }
    : {
        title: 'Brave work.',
        message: 'These scenarios are hard because they mirror the real pressure educators feel. Every boundary you identified is a step. Every one you did not is a chance to practice. Boundaries are a muscle, not a personality trait.',
      };
}
