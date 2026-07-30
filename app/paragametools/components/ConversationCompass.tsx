'use client';

import { useState } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { COLORS } from '../data/gameConfig';
import { useLanguage } from '../context/LanguageContext';
import { COMPASS_SCENARIOS, COMPASS_SCENARIO_COUNT, type CompassScenario } from '../data/conversationCompass';
import { GameWrapper } from './GameWrapper';
import { ConfettiBurst } from './ConfettiBurst';
import { useGameTracking } from '@/lib/hub/useGameTracking';
import { useGameBadgeCheck } from '@/components/hub/useGameBadgeCheck';
import { CommunityNudge } from './CommunityNudge';

type Screen = 'intro' | 'play' | 'results';

const TEAL = COLORS.teal;

export function ConversationCompass({ onBack }: { onBack: () => void }) {
  const { language } = useLanguage();
  const { logCompletion, startSession, logGameResponse, completeSession } = useGameTracking();
  const [screen, setScreen] = useState<Screen>('intro');
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [streak, setStreak] = useState(0);
  const [skillResults, setSkillResults] = useState<Record<string, { total: number; correct: number }>>({});
  const [gameScenarios, setGameScenarios] = useState<CompassScenario[]>([]);

  const shuffleScenarios = () => {
    const shuffled = [...COMPASS_SCENARIOS];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setGameScenarios(shuffled.slice(0, COMPASS_SCENARIO_COUNT));
  };

  const scenario = gameScenarios[current];
  const data = scenario ? scenario[language] : null;
  const isLast = current === COMPASS_SCENARIO_COUNT - 1;

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

    const skill = data.commSkill;
    setSkillResults((prev) => {
      const existing = prev[skill] || { total: 0, correct: 0 };
      return {
        ...prev,
        [skill]: {
          total: existing.total + 1,
          correct: existing.correct + (isCorrect ? 1 : 0),
        },
      };
    });

    const bestIdx = data.choices.findIndex((c) => c.best);
    logGameResponse('conversation-compass', {
      itemId: `conversationcompass_${current}`,
      roundNumber: current + 1,
      userAnswer: String(idx),
      correctAnswer: String(bestIdx),
      isCorrect,
    });
  };

  const handleNext = async () => {
    if (isLast) {
      setScreen('results');
      logCompletion({ tool: 'conversation-compass', score, totalRounds: COMPASS_SCENARIO_COUNT });
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
    setSkillResults({});
    shuffleScenarios();
    setScreen('intro');
    await startSession('conversation-compass', COMPASS_SCENARIO_COUNT, { language });
  };

  const gameTitle = language === 'es' ? 'Brujula de Conversacion' : 'Conversation Compass';
  const badgeCelebration = useGameBadgeCheck(screen === 'results');

  return (
    <GameWrapper gameId="conversationcompass" title={gameTitle} color="teal" onBack={onBack}>
      {badgeCelebration}
      {screen === 'intro' && (
        <IntroScreen
          onStart={() => {
            shuffleScenarios();
            setScreen('play');
            startSession('conversation-compass', COMPASS_SCENARIO_COUNT, { language });
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
          skillResults={skillResults}
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
        style={{ backgroundColor: TEAL.bg, border: `2px solid ${TEAL.accent}` }}
      >
        <span className="text-4xl font-black" style={{ color: TEAL.accent }}>C</span>
      </div>
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
        {language === 'es' ? 'Brujula de Conversacion' : 'Conversation Compass'}
      </h2>
      <p className="text-lg mb-6" style={{ color: TEAL.accent }}>
        {language === 'es' ? 'La conversacion dificil llego. Tu decides la direccion.' : 'The tough conversation just landed. You choose the direction.'}
      </p>

      <div
        className="w-full max-w-lg rounded-xl p-6 mb-6"
        style={{ backgroundColor: TEAL.bg, border: `1px solid ${TEAL.border}` }}
      >
        <p className="text-white text-base leading-relaxed mb-4">
          {language === 'es'
            ? '10 dilemas de comunicacion reales que enfrentan los educadores. Cuatro direcciones para tomarlo. Ninguna respuesta perfecta. Descubre lo que los educadores experimentados sugieren.'
            : '10 real communication dilemmas educators face. Four directions to take it. No perfect answer. See what experienced educators suggest.'}
        </p>
        <ul className="space-y-2 text-left">
          {(language === 'es'
            ? [
                'Lee cada dilema de comunicacion.',
                'Elige una direccion de cuatro opciones.',
                'Descubre lo que dicen los educadores experimentados.',
              ]
            : [
                'Read each communication dilemma.',
                'Choose a direction from four options.',
                'See what experienced educators say.',
              ]
          ).map((rule, i) => (
            <li key={i} className="flex items-start gap-3 text-white text-sm">
              <span style={{ color: TEAL.accent }}>*</span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={onStart}
        className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95 animate-glow-pulse"
        style={{
          backgroundColor: TEAL.accent,
          color: '#0a1628',
          ['--glow-color' as string]: TEAL.accent + '40',
        }}
      >
        {language === 'es' ? '\u00a1Vamos! \u2192' : "Let's Go \u2192"}
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
    choices: { direction: string; text: string; best: boolean }[];
    experienced: string;
    commSkill: string;
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
        {Array.from({ length: COMPASS_SCENARIO_COUNT }).map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i <= current ? TEAL.accent : 'rgba(255,255,255,0.15)',
            }}
          />
        ))}
      </div>

      {/* Counter */}
      <p className="text-center text-sm mb-2" style={{ color: '#8899aa' }}>
        {language === 'es'
          ? `Escenario ${current + 1} de ${COMPASS_SCENARIO_COUNT}`
          : `Scenario ${current + 1} of ${COMPASS_SCENARIO_COUNT}`}
      </p>

      {/* Context line */}
      <p className="text-center text-sm mb-4 italic" style={{ color: TEAL.accent, opacity: 0.8 }}>
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
              bg = 'rgba(34, 184, 189, 0.15)';
              border = TEAL.accent;
            } else {
              opacity = 0.4;
            }
          }

          return (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              disabled={isRevealed}
              className="w-full text-left rounded-xl p-4 transition-all duration-200"
              style={{
                backgroundColor: bg,
                border: `2px solid ${border}`,
                opacity,
                cursor: isRevealed ? 'default' : 'pointer',
              }}
            >
              <div className="flex flex-col gap-1">
                <span
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: isRevealed && isBest ? '#27AE60' : TEAL.accent }}
                >
                  {choice.direction}
                </span>
                <span className="text-white text-base">{choice.text}</span>
                {isRevealed && isBest && (
                  <span
                    className="inline-block mt-1 self-start px-2 py-0.5 rounded text-xs font-bold"
                    style={{ backgroundColor: 'rgba(39, 174, 96, 0.3)', color: '#27AE60' }}
                  >
                    {language === 'es' ? 'Los experimentados concuerdan' : 'Experienced educators agree'}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Experienced educators reveal */}
      {selected !== null && (
        <div className="animate-reveal-bounce mb-6">
          <div
            className="rounded-xl p-6"
            style={{
              backgroundColor: 'rgba(34, 184, 189, 0.08)',
              borderLeft: `4px solid ${TEAL.accent}`,
              border: `1px solid rgba(34, 184, 189, 0.3)`,
              borderLeftWidth: '4px',
              borderLeftColor: TEAL.accent,
            }}
          >
            <p className="font-bold text-base mb-3" style={{ color: TEAL.accent }}>
              {language === 'es' ? 'Los educadores experimentados dicen:' : 'Experienced educators say:'}
            </p>
            <p className="text-white text-base leading-relaxed mb-4">{data.experienced}</p>

            {/* Communication Skill pill */}
            <div className="flex items-center gap-2">
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                style={{
                  backgroundColor: TEAL.bg,
                  border: `1px solid ${TEAL.border}`,
                  color: TEAL.accent,
                }}
              >
                {language === 'es' ? 'Habilidad' : 'Skill'}: {data.commSkill}
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
            style={{ backgroundColor: TEAL.accent, color: '#0a1628' }}
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
  skillResults,
  onPlayAgain,
  onBack,
}: {
  language: 'en' | 'es';
  score: number;
  skillResults: Record<string, { total: number; correct: number }>;
  onPlayAgain: () => void;
  onBack: () => void;
}) {
  const confettiColors = [TEAL.accent, '#22B8BD', '#FFFFFF'];
  const { title, message } = getScoreContent(score, language);

  return (
    <div className="flex flex-col items-center text-center">
      {score >= 7 && <ConfettiBurst colors={confettiColors} particleCount={60} />}

      {/* Score ring */}
      <div
        className="w-28 h-28 md:w-32 md:h-32 rounded-full flex flex-col items-center justify-center mb-6 animate-scale-in"
        style={{ backgroundColor: TEAL.bg, border: `3px solid ${TEAL.accent}` }}
      >
        <span className="text-4xl md:text-5xl font-black text-white">{score}</span>
        <span className="text-sm" style={{ color: TEAL.accent }}>
          {language === 'es' ? `de ${COMPASS_SCENARIO_COUNT}` : `of ${COMPASS_SCENARIO_COUNT}`}
        </span>
      </div>

      <p className="text-sm mb-1" style={{ color: '#8899aa' }}>
        {language === 'es' ? 'alineado con educadores experimentados' : 'aligned with experienced educators'}
      </p>

      <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{title}</h2>
      <p className="text-lg text-white mb-8 max-w-lg leading-relaxed">{message}</p>

      {/* Communication Skill Breakdown */}
      {Object.keys(skillResults).length > 0 && (
        <div
          className="w-full max-w-lg rounded-xl p-5 mb-6"
          style={{ backgroundColor: TEAL.bg, border: `1px solid ${TEAL.border}` }}
        >
          <p className="text-sm uppercase tracking-wider mb-3 font-bold" style={{ color: TEAL.accent }}>
            {language === 'es' ? 'Tu perfil de comunicacion' : 'Your Communication Profile'}
          </p>
          <div className="flex flex-col gap-2">
            {Object.entries(skillResults).map(([skill, { total, correct }]) => (
              <div key={skill} className="flex items-center justify-between">
                <span className="text-white text-sm">{skill}</span>
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
        style={{ backgroundColor: 'rgba(34, 184, 189, 0.1)', border: '1px solid rgba(34, 184, 189, 0.4)' }}
      >
        <p className="text-white text-base">
          {language === 'es'
            ? 'Cada escenario tiene multiples respuestas defendibles. Los educadores experimentados apuntan en una direccion, pero tu contexto importa. Reflexiona sobre cual escenario se sintio mas cercano a tu realidad diaria.'
            : 'Every scenario has multiple defensible responses. Experienced educators point in a direction, but your context matters. Reflect on which scenario felt closest to your daily reality.'}
        </p>
      </div>

      {/* Resource links */}
      <div className="w-full max-w-lg flex flex-col gap-3 mb-8">
        <a
          href="https://teachersdeserveit.com/paragametools"
          className="flex items-center justify-center gap-2 rounded-xl py-3 px-6 font-medium transition-all hover:brightness-110"
          style={{ backgroundColor: TEAL.bg, border: `1px solid ${TEAL.border}`, color: TEAL.accent }}
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
        style={{ backgroundColor: TEAL.accent, color: '#0a1628' }}
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
      <CommunityNudge gameSlug="conversation-compass" score={score} totalRounds={COMPASS_SCENARIO_COUNT} />
    </div>
  );
}

// Score content helper
function getScoreContent(score: number, lang: 'en' | 'es') {
  if (score >= 9) {
    return lang === 'es'
      ? {
          title: 'Instintos de comunicador.',
          message: 'Tu brujula se alinea con lo que sugieren los educadores experimentados. Escuchas antes de reaccionar, estableces limites con calidez y eliges el momento adecuado para las conversaciones dificiles.',
        }
      : {
          title: 'Communicator instincts.',
          message: 'Your compass aligns with what experienced educators suggest. You listen before reacting, set boundaries with warmth, and choose the right moment for tough conversations.',
        };
  }
  if (score >= 6) {
    return lang === 'es'
      ? {
          title: 'Base solida.',
          message: 'Estas navegando la mayoria de estas conversaciones bien. Los escenarios que fallaste revelan tus puntos ciegos en comunicacion, y eso es exactamente donde sucede el crecimiento.',
        }
      : {
          title: 'Solid foundation.',
          message: 'You are navigating most of these conversations well. The scenarios you missed reveal your communication blind spots, and that is exactly where growth happens.',
        };
  }
  return lang === 'es'
    ? {
        title: 'Comienzo reflexivo.',
        message: 'Estos dilemas son dificiles a proposito. Cada "respuesta incorrecta" es algo que un educador real ha hecho en el calor del momento. La diferencia es la pausa, la reflexion y saber lo que funciona antes de que llegue la conversacion.',
      }
    : {
        title: 'Thoughtful start.',
        message: 'These dilemmas are hard on purpose. Every "wrong answer" is something a real educator has done in the heat of the moment. The difference is the pause, the reflection, and knowing what works before the conversation arrives.',
      };
}
