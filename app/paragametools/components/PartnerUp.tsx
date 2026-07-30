'use client';

import { useState } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { COLORS } from '../data/gameConfig';
import { useLanguage } from '../context/LanguageContext';
import { PARTNER_SCENARIOS, PARTNER_SCENARIO_COUNT, type PartnerUpScenario } from '../data/partnerUp';
import { GameWrapper } from './GameWrapper';
import { ConfettiBurst } from './ConfettiBurst';
import { useGameTracking } from '@/lib/hub/useGameTracking';
import { useGameBadgeCheck } from '@/components/hub/useGameBadgeCheck';
import { CommunityNudge } from './CommunityNudge';

type Screen = 'intro' | 'play' | 'results';
type Phase = 'para' | 'teacher' | 'insight';

const GREEN = COLORS.green;

export function PartnerUp({ onBack }: { onBack: () => void }) {
  const { language } = useLanguage();
  const { logCompletion, startSession, logGameResponse, completeSession } = useGameTracking();
  const [screen, setScreen] = useState<Screen>('intro');
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState<Phase>('para');
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [streak, setStreak] = useState(0);
  const [skillResults, setSkillResults] = useState<Record<string, { total: number; correct: number }>>({});
  const [gameScenarios, setGameScenarios] = useState<PartnerUpScenario[]>([]);
  // Track which perspective comes first (randomized per scenario)
  const [firstPerspective, setFirstPerspective] = useState<('para' | 'teacher')[]>([]);

  const shuffleScenarios = () => {
    const shuffled = [...PARTNER_SCENARIOS];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const picked = shuffled.slice(0, PARTNER_SCENARIO_COUNT);
    setGameScenarios(picked);
    // Randomize which perspective shows first for each scenario
    setFirstPerspective(picked.map(() => (Math.random() > 0.5 ? 'para' : 'teacher')));
  };

  const scenario = gameScenarios[current];
  const data = scenario ? scenario[language] : null;
  const isLast = current === PARTNER_SCENARIO_COUNT - 1;

  // Get the current perspective order for this scenario
  const getFirstPhase = (): 'para' | 'teacher' => firstPerspective[current] || 'para';
  const getSecondPhase = (): 'para' | 'teacher' => getFirstPhase() === 'para' ? 'teacher' : 'para';

  const getCurrentView = () => {
    if (!data) return null;
    if (phase === 'para') return data.paraView;
    if (phase === 'teacher') return data.teacherView;
    return null;
  };

  const handleSelect = (idx: number) => {
    if (selected !== null || !data) return;
    const view = getCurrentView();
    if (!view) return;

    setSelected(idx);
    const isCorrect = view.choices[idx].best;
    if (isCorrect) {
      setScore((s) => s + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak((prev) => Math.max(prev, newStreak));
    } else {
      setStreak(0);
    }

    // Track skill results
    const skill = data.partnershipSkill;
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

    const bestIdx = view.choices.findIndex((c) => c.best);
    const phaseLabel = phase === 'para' ? 'para' : 'teacher';
    logGameResponse('partner-up', {
      itemId: `partnerup_${current}_${phaseLabel}`,
      roundNumber: current + 1,
      userAnswer: String(idx),
      correctAnswer: String(bestIdx),
      isCorrect,
    });
  };

  const handleNext = async () => {
    if (phase === getFirstPhase()) {
      // Move to second perspective
      setPhase(getSecondPhase());
      setSelected(null);
    } else if (phase === getSecondPhase()) {
      // Move to insight
      setPhase('insight');
    } else if (phase === 'insight') {
      // Move to next scenario or results
      if (isLast) {
        setScreen('results');
        logCompletion({ tool: 'partner-up', score, totalRounds: PARTNER_SCENARIO_COUNT * 2 });
        await completeSession(score, bestStreak);
      } else {
        setCurrent((c) => c + 1);
        setPhase(firstPerspective[current + 1] || 'para');
        setSelected(null);
      }
    }
  };

  const handlePlayAgain = async () => {
    setCurrent(0);
    setPhase('para');
    setSelected(null);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setSkillResults({});
    shuffleScenarios();
    setScreen('intro');
    await startSession('partner-up', PARTNER_SCENARIO_COUNT * 2, { language });
  };

  const gameTitle = language === 'es' ? 'Alianza en Accion' : 'Partner Up';
  const badgeCelebration = useGameBadgeCheck(screen === 'results');

  return (
    <GameWrapper gameId="partnerup" title={gameTitle} color="green" onBack={onBack}>
      {badgeCelebration}
      {screen === 'intro' && (
        <IntroScreen
          onStart={() => {
            shuffleScenarios();
            setScreen('play');
            startSession('partner-up', PARTNER_SCENARIO_COUNT * 2, { language });
          }}
          language={language}
        />
      )}
      {screen === 'play' && data && (
        <PlayScreen
          language={language}
          current={current}
          phase={phase}
          data={data}
          selected={selected}
          onSelect={handleSelect}
          onNext={handleNext}
          isLast={isLast}
          getFirstPhase={getFirstPhase}
          getSecondPhase={getSecondPhase}
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
        style={{ backgroundColor: GREEN.bg, border: `2px solid ${GREEN.accent}` }}
      >
        <span className="text-4xl font-black" style={{ color: GREEN.accent }}>PU</span>
      </div>
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
        {language === 'es' ? 'Alianza en Accion' : 'Partner Up'}
      </h2>
      <p className="text-lg mb-6" style={{ color: GREEN.accent }}>
        {language === 'es' ? 'Mismo momento. Dos perspectivas.' : 'Same moment. Two perspectives.'}
      </p>

      <div
        className="w-full max-w-lg rounded-xl p-6 mb-6"
        style={{ backgroundColor: GREEN.bg, border: `1px solid ${GREEN.border}` }}
      >
        <p className="text-white text-base leading-relaxed mb-4">
          {language === 'es'
            ? '10 escenarios reales de la relacion maestra y para. Cada escenario tiene dos lados. Primero ves una perspectiva y eliges tu respuesta. Luego ves el mismo momento desde el otro lado. Construye empatia a traves de la division de roles.'
            : '10 real scenarios from the teacher and para relationship. Every scenario has two sides. First you see one perspective and choose your response. Then you see the same moment from the other side. Build empathy across the role divide.'}
        </p>
        <ul className="space-y-2 text-left">
          {(language === 'es'
            ? [
                'Lee cada escenario desde la perspectiva de la para.',
                'Elige la mejor respuesta de tres opciones.',
                'Luego ve el mismo momento desde la perspectiva de la maestra.',
                'Despues de ambos lados, descubre lo que hace funcionar este momento.',
              ]
            : [
                'Read each scenario from the para\'s perspective.',
                'Choose the best response from three options.',
                'Then see the same moment from the teacher\'s perspective.',
                'After both sides, discover what makes this moment work.',
              ]
          ).map((rule, i) => (
            <li key={i} className="flex items-start gap-3 text-white text-sm">
              <span style={{ color: GREEN.accent }}>*</span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={onStart}
        className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95 animate-glow-pulse"
        style={{
          backgroundColor: GREEN.accent,
          color: '#ffffff',
          ['--glow-color' as string]: GREEN.accent + '40',
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
  phase,
  data,
  selected,
  onSelect,
  onNext,
  isLast,
  getFirstPhase,
  getSecondPhase,
}: {
  language: 'en' | 'es';
  current: number;
  phase: Phase;
  data: {
    context: string;
    paraView: {
      setup: string;
      choices: { text: string; best: boolean }[];
    };
    teacherView: {
      setup: string;
      choices: { text: string; best: boolean }[];
    };
    insight: string;
    partnershipSkill: string;
  };
  selected: number | null;
  onSelect: (idx: number) => void;
  onNext: () => void;
  isLast: boolean;
  getFirstPhase: () => 'para' | 'teacher';
  getSecondPhase: () => 'para' | 'teacher';
}) {
  const isInsight = phase === 'insight';
  const view = phase === 'para' ? data.paraView : phase === 'teacher' ? data.teacherView : null;

  const perspectiveLabel = (p: 'para' | 'teacher') => {
    if (p === 'para') return language === 'es' ? 'Perspectiva de la Para' : "Para's Perspective";
    return language === 'es' ? 'Perspectiva de la Maestra' : "Teacher's Perspective";
  };

  // Determine pip progress: each scenario has first perspective, second perspective, insight
  const isFirstDone = phase === getSecondPhase() || phase === 'insight';
  const isSecondDone = phase === 'insight';

  return (
    <div className="animate-fade-in" key={`${current}-${phase}`}>
      {/* Progress pips */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {Array.from({ length: PARTNER_SCENARIO_COUNT }).map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i <= current ? GREEN.accent : 'rgba(255,255,255,0.15)',
            }}
          />
        ))}
      </div>

      {/* Counter */}
      <p className="text-center text-sm mb-2" style={{ color: '#8899aa' }}>
        {language === 'es'
          ? `Escenario ${current + 1} de ${PARTNER_SCENARIO_COUNT}`
          : `Scenario ${current + 1} of ${PARTNER_SCENARIO_COUNT}`}
      </p>

      {/* Perspective indicator */}
      {!isInsight && (
        <div className="flex items-center justify-center gap-3 mb-4">
          <div
            className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
            style={{
              backgroundColor: phase === getFirstPhase() ? GREEN.accent : isFirstDone ? 'rgba(39, 174, 96, 0.3)' : 'rgba(255,255,255,0.1)',
              color: phase === getFirstPhase() ? '#ffffff' : isFirstDone ? GREEN.accent : '#8899aa',
            }}
          >
            {perspectiveLabel(getFirstPhase())}
          </div>
          <span style={{ color: '#8899aa' }}>&rarr;</span>
          <div
            className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
            style={{
              backgroundColor: phase === getSecondPhase() ? GREEN.accent : isSecondDone ? 'rgba(39, 174, 96, 0.3)' : 'rgba(255,255,255,0.1)',
              color: phase === getSecondPhase() ? '#ffffff' : isSecondDone ? GREEN.accent : '#8899aa',
            }}
          >
            {perspectiveLabel(getSecondPhase())}
          </div>
        </div>
      )}

      {/* Context line */}
      <p className="text-center text-sm mb-4 italic" style={{ color: GREEN.accent, opacity: 0.8 }}>
        {data.context}
      </p>

      {/* Insight phase */}
      {isInsight && (
        <div className="animate-reveal-bounce">
          {/* Partnership insight card with green left border */}
          <div
            className="rounded-xl p-6 mb-6"
            style={{
              backgroundColor: 'rgba(39, 174, 96, 0.08)',
              borderLeft: `4px solid ${GREEN.accent}`,
              border: `1px solid rgba(39, 174, 96, 0.3)`,
              borderLeftWidth: '4px',
              borderLeftColor: GREEN.accent,
            }}
          >
            <p className="font-bold text-base mb-3" style={{ color: GREEN.accent }}>
              {language === 'es' ? 'Lo que hace funcionar este momento:' : 'What makes this moment work:'}
            </p>
            <p className="text-white text-base leading-relaxed mb-4">{data.insight}</p>

            {/* Partnership Skill pill */}
            <div className="flex items-center gap-2">
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                style={{
                  backgroundColor: GREEN.bg,
                  border: `1px solid ${GREEN.border}`,
                  color: GREEN.accent,
                }}
              >
                {language === 'es' ? 'Habilidad de Alianza' : 'Partnership Skill'}: {data.partnershipSkill}
              </span>
            </div>
          </div>

          {/* Next button */}
          <div className="flex justify-center">
            <button
              onClick={onNext}
              className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: GREEN.accent, color: '#ffffff' }}
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
        </div>
      )}

      {/* Scenario card and choices (for para/teacher phases) */}
      {!isInsight && view && (
        <>
          <div
            className="rounded-xl p-6 mb-6"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <p className="text-white text-base md:text-lg leading-relaxed">{view.setup}</p>
          </div>

          {/* Choices (3 per perspective) */}
          <div className="flex flex-col gap-3 mb-6">
            {view.choices.map((choice, idx) => {
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

              const letters = ['A', 'B', 'C'];

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
                      backgroundColor: isRevealed && isBest ? '#27AE60' : isRevealed && isSelected ? '#E8B84B' : GREEN.accent,
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
                        {language === 'es' ? 'Mejor opcion' : 'Best choice'}
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

          {/* Next perspective / insight button */}
          {selected !== null && (
            <div className="flex justify-center">
              <button
                onClick={onNext}
                className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: GREEN.accent, color: '#ffffff' }}
              >
                {phase === getFirstPhase()
                  ? language === 'es'
                    ? `Ver ${perspectiveLabel(getSecondPhase())} \u2192`
                    : `See ${perspectiveLabel(getSecondPhase())} \u2192`
                  : language === 'es'
                    ? 'Ver Reflexion \u2192'
                    : 'See Insight \u2192'}
              </button>
            </div>
          )}
        </>
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
  const totalPossible = PARTNER_SCENARIO_COUNT * 2;
  const confettiColors = [GREEN.accent, '#10B981', '#FFFFFF'];
  const { title, message } = getScoreContent(score, totalPossible, language);

  return (
    <div className="flex flex-col items-center text-center">
      {score >= 14 && <ConfettiBurst colors={confettiColors} particleCount={60} />}

      {/* Score ring */}
      <div
        className="w-28 h-28 md:w-32 md:h-32 rounded-full flex flex-col items-center justify-center mb-6 animate-scale-in"
        style={{ backgroundColor: GREEN.bg, border: `3px solid ${GREEN.accent}` }}
      >
        <span className="text-4xl md:text-5xl font-black text-white">{score}</span>
        <span className="text-sm" style={{ color: GREEN.accent }}>
          {language === 'es' ? `de ${totalPossible}` : `of ${totalPossible}`}
        </span>
      </div>

      <p className="text-sm mb-1" style={{ color: '#8899aa' }}>
        {language === 'es' ? 'respuestas alineadas con la alianza' : 'partnership-aligned responses'}
      </p>

      <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{title}</h2>
      <p className="text-lg text-white mb-8 max-w-lg leading-relaxed">{message}</p>

      {/* Partnership Skill Breakdown */}
      {Object.keys(skillResults).length > 0 && (
        <div
          className="w-full max-w-lg rounded-xl p-5 mb-6"
          style={{ backgroundColor: GREEN.bg, border: `1px solid ${GREEN.border}` }}
        >
          <p className="text-sm uppercase tracking-wider mb-3 font-bold" style={{ color: GREEN.accent }}>
            {language === 'es' ? 'Tu Perfil de Alianza' : 'Your Partnership Profile'}
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
        style={{ backgroundColor: 'rgba(39, 174, 96, 0.1)', border: '1px solid rgba(39, 174, 96, 0.4)' }}
      >
        <p className="text-white text-base">
          {language === 'es'
            ? 'Cada escenario tiene multiples respuestas razonables. La clave es ver el mismo momento desde ambos lados. Cuando entiendes lo que la otra persona experimenta, las conversaciones dificiles se vuelven mas faciles.'
            : 'Every scenario has multiple reasonable responses. The key is seeing the same moment from both sides. When you understand what the other person is experiencing, the hard conversations become easier.'}
        </p>
      </div>

      {/* Resource links */}
      <div className="w-full max-w-lg flex flex-col gap-3 mb-8">
        <a
          href="https://teachersdeserveit.com/paragametools"
          className="flex items-center justify-center gap-2 rounded-xl py-3 px-6 font-medium transition-all hover:brightness-110"
          style={{ backgroundColor: GREEN.bg, border: `1px solid ${GREEN.border}`, color: GREEN.accent }}
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
        style={{ backgroundColor: GREEN.accent, color: '#ffffff' }}
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
      <CommunityNudge gameSlug="partner-up" score={score} totalRounds={PARTNER_SCENARIO_COUNT * 2} />
    </div>
  );
}

// Score content helper
function getScoreContent(score: number, total: number, lang: 'en' | 'es') {
  const pct = score / total;
  if (pct >= 0.85) {
    return lang === 'es'
      ? {
          title: 'Aliado/a natural.',
          message: 'Ves ambos lados del momento. Esa es la base de toda alianza fuerte entre maestra y para. Llevas empatia a cada interaccion.',
        }
      : {
          title: 'Natural partner.',
          message: 'You see both sides of the moment. That is the foundation of every strong teacher and para partnership. You bring empathy to every interaction.',
        };
  }
  if (pct >= 0.6) {
    return lang === 'es'
      ? {
          title: 'Construyendo puentes.',
          message: 'Estas tomando decisiones fuertes la mayoria de las veces. Los escenarios que fallaste revelan donde la perspectiva del otro lado cambiaria tu respuesta.',
        }
      : {
          title: 'Building bridges.',
          message: 'You are making strong calls most of the time. The scenarios you missed reveal where the other side\'s perspective would change your response.',
        };
  }
  return lang === 'es'
    ? {
        title: 'Inicio reflexivo.',
        message: 'Estos escenarios son dificiles a proposito porque no hay villanos, solo dos personas tratando de hacer bien su trabajo. La diferencia la hace ver el mismo momento a traves de los ojos de tu companero/a.',
      }
    : {
        title: 'Thoughtful start.',
        message: 'These scenarios are hard on purpose because there are no villains, just two people trying to do their jobs well. The difference is seeing the same moment through your partner\'s eyes.',
      };
}
