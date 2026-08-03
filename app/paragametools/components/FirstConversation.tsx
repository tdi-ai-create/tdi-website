'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, Check, ChevronRight } from 'lucide-react';
import { COLORS } from '../data/gameConfig';
import { useLanguage } from '../context/LanguageContext';
import {
  SCENARIOS,
  SCENARIO_COUNT,
  SKILL_TAGS,
  type Scenario,
  type Role,
  type GradeBand,
  type Season,
} from '../data/firstConversation';
import { GameWrapper } from './GameWrapper';
import { ConfettiBurst } from './ConfettiBurst';
import { useGameTracking } from '@/lib/hub/useGameTracking';
import { useGameBadgeCheck } from '@/components/hub/useGameBadgeCheck';
import { CommunityNudge } from './CommunityNudge';

type Screen = 'setup' | 'play' | 'results';
type RipplePhase = 'choice' | 'moment' | 'week' | 'month';

const TEAL = COLORS.teal;

const ROLE_OPTIONS: { value: Role; en: string; es: string }[] = [
  { value: 'teacher', en: 'Teacher', es: 'Maestro/a' },
  { value: 'para', en: 'Para', es: 'Para' },
  { value: 'coach', en: 'Coach', es: 'Coach' },
  { value: 'leader', en: 'Leader', es: 'Lider' },
];

const GRADE_OPTIONS: { value: GradeBand; en: string; es: string }[] = [
  { value: 'pk-2', en: 'PK-2', es: 'PK-2' },
  { value: '3-5', en: '3-5', es: '3-5' },
  { value: '6-8', en: '6-8', es: '6-8' },
  { value: '9-12', en: '9-12', es: '9-12' },
];

const SEASON_OPTIONS: { value: Season; en: string; es: string }[] = [
  { value: 'first_year', en: 'First year', es: 'Primer ano' },
  { value: '2-5', en: '2-5 years', es: '2-5 anos' },
  { value: '6-15', en: '6-15 years', es: '6-15 anos' },
  { value: '16+', en: '16+ years', es: '16+ anos' },
];

const RIPPLE_LABELS = {
  moment: { en: 'That moment', es: 'Ese momento' },
  week: { en: 'That week', es: 'Esa semana' },
  month: { en: 'That month', es: 'Ese mes' },
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function FirstConversation({ onBack }: { onBack: () => void }) {
  const { language } = useLanguage();
  const lang = language === 'es' ? 'es' : 'en';
  const { logCompletion, startSession, logGameResponse, completeSession } = useGameTracking();

  const [screen, setScreen] = useState<Screen>('setup');

  // Setup state
  const [selectedRole, setSelectedRole] = useState<Role>('teacher');
  const [selectedGrade, setSelectedGrade] = useState<GradeBand>('3-5');
  const [selectedSeason, setSelectedSeason] = useState<Season>('2-5');

  // Play state
  const [gameScenarios, setGameScenarios] = useState<Scenario[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [ripplePhase, setRipplePhase] = useState<RipplePhase>('choice');
  const [beenThere, setBeenThere] = useState(false);
  const [score, setScore] = useState(0);
  const [beenThereCount, setBeenThereCount] = useState(0);
  const [skillResults, setSkillResults] = useState<Record<string, { total: number; strong: number }>>({});

  const scenario = gameScenarios[current];
  const data = scenario ? scenario[lang] : null;
  const isLast = current === SCENARIO_COUNT - 1;

  const handleStart = async () => {
    // Filter scenarios by role and grade band, then shuffle and pick SCENARIO_COUNT
    const filtered = SCENARIOS.filter(
      (s) => s.roles.includes(selectedRole) && s.gradeBands.includes(selectedGrade)
    );
    const picked = shuffle(filtered).slice(0, SCENARIO_COUNT);
    // If not enough filtered, pad with any remaining
    if (picked.length < SCENARIO_COUNT) {
      const remaining = SCENARIOS.filter((s) => !picked.includes(s));
      picked.push(...shuffle(remaining).slice(0, SCENARIO_COUNT - picked.length));
    }
    setGameScenarios(picked.slice(0, SCENARIO_COUNT));
    setCurrent(0);
    setSelected(null);
    setRipplePhase('choice');
    setBeenThere(false);
    setScore(0);
    setBeenThereCount(0);
    setSkillResults({});
    setScreen('play');
    await startSession('first-conversation', SCENARIO_COUNT, { language, role: selectedRole, gradeBand: selectedGrade });
  };

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setRipplePhase('moment');
    const choiceScore = data!.choices[idx].score;
    if (choiceScore === 'strong') {
      setScore((s) => s + 1);
    }
    const tag = data!.skillTag;
    setSkillResults((prev) => {
      const existing = prev[tag] || { total: 0, strong: 0 };
      return {
        ...prev,
        [tag]: {
          total: existing.total + 1,
          strong: existing.strong + (choiceScore === 'strong' ? 1 : 0),
        },
      };
    });
    logGameResponse('first-conversation', {
      itemId: scenario!.id,
      roundNumber: current + 1,
      userAnswer: String.fromCharCode(65 + idx),
      correctAnswer: String.fromCharCode(65 + data!.choices.findIndex((c) => c.score === 'strong')),
      isCorrect: choiceScore === 'strong',
    });
  };

  const handleNextRipple = () => {
    if (ripplePhase === 'moment') setRipplePhase('week');
    else if (ripplePhase === 'week') setRipplePhase('month');
  };

  const handleNext = async () => {
    if (isLast) {
      setScreen('results');
      logCompletion({ tool: 'first-conversation', score, totalRounds: SCENARIO_COUNT });
      await completeSession(score, 0);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setRipplePhase('choice');
      setBeenThere(false);
    }
  };

  const handleBeenThere = () => {
    if (!beenThere) {
      setBeenThere(true);
      setBeenThereCount((c) => c + 1);
    }
  };

  const handlePlayAgain = async () => {
    setScreen('setup');
  };

  const gameTitle = lang === 'es' ? 'La Primera Conversacion' : 'The First Conversation';
  const badgeCelebration = useGameBadgeCheck(screen === 'results');

  return (
    <GameWrapper gameId="firstconversation" title={gameTitle} color="teal" onBack={onBack}>
      {badgeCelebration}

      {/* ─── SETUP SCREEN ──────────────────────────────────────────────── */}
      {screen === 'setup' && (
        <div className="flex flex-col items-center text-center animate-fade-in">
          <div
            className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: TEAL.bg, border: `2px solid ${TEAL.accent}` }}
          >
            <span className="text-4xl font-black" style={{ color: TEAL.accent }}>1</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{gameTitle}</h2>
          <p className="text-lg mb-6" style={{ color: TEAL.accent }}>
            {lang === 'es' ? 'Las primeras palabras importan mas de lo que crees.' : 'First words matter more than you think.'}
          </p>

          <div
            className="w-full max-w-lg rounded-xl p-6 mb-6"
            style={{ backgroundColor: TEAL.bg, border: `1px solid ${TEAL.border}` }}
          >
            <p className="text-white text-base leading-relaxed mb-5">
              {lang === 'es'
                ? 'Escenarios reales de la primera semana. Elige tu respuesta, luego mira el efecto dominó: que pasa en ese momento, esa semana y ese mes.'
                : 'Real opening-week scenarios. Choose your response, then watch the ripple effect: what happens in that moment, that week, and that month.'}
            </p>

            {/* Personalization */}
            <div className="space-y-4 text-left">
              {/* Role */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: TEAL.accent }}>
                  {lang === 'es' ? 'Tu rol' : 'Your role'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {ROLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedRole(opt.value)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                      style={{
                        backgroundColor: selectedRole === opt.value ? TEAL.accent : 'rgba(255,255,255,0.08)',
                        color: selectedRole === opt.value ? '#0a1628' : 'rgba(255,255,255,0.7)',
                        border: `1px solid ${selectedRole === opt.value ? TEAL.accent : 'rgba(255,255,255,0.15)'}`,
                      }}
                    >
                      {opt[lang]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grade band */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: TEAL.accent }}>
                  {lang === 'es' ? 'Tu nivel de grado' : 'Your grade band'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {GRADE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedGrade(opt.value)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                      style={{
                        backgroundColor: selectedGrade === opt.value ? TEAL.accent : 'rgba(255,255,255,0.08)',
                        color: selectedGrade === opt.value ? '#0a1628' : 'rgba(255,255,255,0.7)',
                        border: `1px solid ${selectedGrade === opt.value ? TEAL.accent : 'rgba(255,255,255,0.15)'}`,
                      }}
                    >
                      {opt[lang]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Season */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: TEAL.accent }}>
                  {lang === 'es' ? 'Tu experiencia' : 'Your experience'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {SEASON_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedSeason(opt.value)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                      style={{
                        backgroundColor: selectedSeason === opt.value ? TEAL.accent : 'rgba(255,255,255,0.08)',
                        color: selectedSeason === opt.value ? '#0a1628' : 'rgba(255,255,255,0.7)',
                        border: `1px solid ${selectedSeason === opt.value ? TEAL.accent : 'rgba(255,255,255,0.15)'}`,
                      }}
                    >
                      {opt[lang]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95 animate-glow-pulse"
            style={{
              backgroundColor: TEAL.accent,
              color: '#0a1628',
              ['--glow-color' as string]: TEAL.accent + '40',
            }}
          >
            {lang === 'es' ? 'Comenzar' : 'Start'} <ArrowRight size={20} className="inline ml-1" />
          </button>
        </div>
      )}

      {/* ─── PLAY SCREEN ───────────────────────────────────────────────── */}
      {screen === 'play' && data && (
        <div className="animate-fade-in">
          {/* Progress pips */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {Array.from({ length: SCENARIO_COUNT }).map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full transition-all duration-300"
                style={{ backgroundColor: i <= current ? TEAL.accent : 'rgba(255,255,255,0.15)' }}
              />
            ))}
          </div>

          <p className="text-center text-sm mb-2" style={{ color: '#8899aa' }}>
            {lang === 'es'
              ? `Escenario ${current + 1} de ${SCENARIO_COUNT}`
              : `Scenario ${current + 1} of ${SCENARIO_COUNT}`}
          </p>

          {/* Setup text */}
          <div
            className="rounded-xl p-5 mb-4"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <p className="text-white text-base leading-relaxed mb-3">{data.setup}</p>
            <div
              className="rounded-lg p-4"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderLeft: `3px solid ${TEAL.accent}` }}
            >
              <p className="text-white text-base italic leading-relaxed">{data.context}</p>
            </div>
          </div>

          {/* Choices (before selection) */}
          {ripplePhase === 'choice' && (
            <div className="flex flex-col gap-3 mb-6">
              {data.choices.map((choice, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className="text-left rounded-xl p-4 transition-all hover:scale-[1.01]"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold"
                      style={{ backgroundColor: TEAL.bg, color: TEAL.accent, border: `1px solid ${TEAL.border}` }}
                    >
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <p className="text-white text-sm leading-relaxed">{choice.text}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Ripple Effect Reveal */}
          {selected !== null && ripplePhase !== 'choice' && (
            <div className="mb-6 animate-fade-in">
              {/* Selected choice recap */}
              <div
                className="rounded-xl p-4 mb-4"
                style={{
                  backgroundColor: data.choices[selected].score === 'strong'
                    ? 'rgba(39,174,96,0.15)'
                    : data.choices[selected].score === 'okay'
                    ? 'rgba(245,158,11,0.15)'
                    : 'rgba(231,76,60,0.15)',
                  border: `1px solid ${
                    data.choices[selected].score === 'strong'
                      ? 'rgba(39,174,96,0.4)'
                      : data.choices[selected].score === 'okay'
                      ? 'rgba(245,158,11,0.4)'
                      : 'rgba(231,76,60,0.4)'
                  }`,
                }}
              >
                <p className="text-white text-sm leading-relaxed">{data.choices[selected].text}</p>
              </div>

              {/* Ripple timeline */}
              <div className="space-y-3">
                {(['moment', 'week', 'month'] as const).map((phase) => {
                  const isVisible =
                    phase === 'moment' ||
                    (phase === 'week' && (ripplePhase === 'week' || ripplePhase === 'month')) ||
                    (phase === 'month' && ripplePhase === 'month');

                  if (!isVisible) return null;

                  const ripple = data.choices[selected].ripple;
                  const colors = {
                    moment: { dot: TEAL.accent, bg: 'rgba(34,184,189,0.08)' },
                    week: { dot: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
                    month: { dot: '#9333EA', bg: 'rgba(147,51,234,0.08)' },
                  };

                  return (
                    <div
                      key={phase}
                      className="rounded-xl p-4 animate-fade-in"
                      style={{ backgroundColor: colors[phase].bg, border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: colors[phase].dot }}
                        />
                        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: colors[phase].dot }}>
                          {RIPPLE_LABELS[phase][lang]}
                        </p>
                      </div>
                      <p className="text-white text-sm leading-relaxed">{ripple[phase]}</p>
                    </div>
                  );
                })}
              </div>

              {/* Advance ripple or show research */}
              {ripplePhase !== 'month' ? (
                <button
                  onClick={handleNextRipple}
                  className="mt-4 w-full py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.01]"
                  style={{ backgroundColor: TEAL.accent, color: '#0a1628' }}
                >
                  {ripplePhase === 'moment'
                    ? (lang === 'es' ? 'Ver esa semana' : 'See that week')
                    : (lang === 'es' ? 'Ver ese mes' : 'See that month')}
                  <ChevronRight size={16} className="inline ml-1" />
                </button>
              ) : (
                <>
                  {/* Research + Why */}
                  <div
                    className="mt-4 rounded-xl p-4"
                    style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: TEAL.accent }}>
                      {lang === 'es' ? 'Por que importa' : 'Why it matters'}
                    </p>
                    <p className="text-white text-sm leading-relaxed mb-3">{data.choices[selected].why}</p>
                    <div
                      className="rounded-lg p-3"
                      style={{ backgroundColor: 'rgba(34,184,189,0.1)', borderLeft: `3px solid ${TEAL.accent}` }}
                    >
                      <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: TEAL.accent }}>
                        {lang === 'es' ? 'La investigacion' : 'The research'}
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
                        {data.choices[selected].research}
                      </p>
                    </div>
                  </div>

                  {/* Been there button */}
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      onClick={handleBeenThere}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all"
                      style={{
                        backgroundColor: beenThere ? 'rgba(34,184,189,0.2)' : 'rgba(255,255,255,0.06)',
                        color: beenThere ? TEAL.accent : 'rgba(255,255,255,0.6)',
                        border: `1px solid ${beenThere ? TEAL.accent : 'rgba(255,255,255,0.1)'}`,
                      }}
                    >
                      {beenThere ? <Check size={14} /> : null}
                      {lang === 'es' ? 'He estado ahi' : "I've been there"}
                    </button>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {data.beenThereStat}
                    </p>
                  </div>

                  {/* Skill tag */}
                  <div className="mt-3 flex justify-center">
                    <span
                      className="text-xs px-3 py-1 rounded-full"
                      style={{ backgroundColor: TEAL.bg, color: TEAL.accent, border: `1px solid ${TEAL.border}` }}
                    >
                      {SKILL_TAGS[lang][data.skillTag as keyof typeof SKILL_TAGS['en']]}
                    </span>
                  </div>

                  {/* Next button */}
                  <button
                    onClick={handleNext}
                    className="mt-4 w-full py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.01]"
                    style={{ backgroundColor: TEAL.accent, color: '#0a1628' }}
                  >
                    {isLast
                      ? (lang === 'es' ? 'Ver resultados' : 'See Results')
                      : (lang === 'es' ? 'Siguiente escenario' : 'Next Scenario')}
                    <ArrowRight size={16} className="inline ml-1" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── RESULTS SCREEN ────────────────────────────────────────────── */}
      {screen === 'results' && (
        <div className="animate-fade-in">
          {score >= SCENARIO_COUNT * 0.7 && <ConfettiBurst colors={[TEAL.accent, '#27AE60', '#F1C40F']} />}

          <div className="text-center mb-6">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: TEAL.bg, border: `3px solid ${TEAL.accent}` }}
            >
              <span className="text-3xl font-black" style={{ color: TEAL.accent }}>
                {score}/{SCENARIO_COUNT}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {lang === 'es' ? 'Tu Impacto en la Primera Semana' : 'Your First-Week Impact'}
            </h2>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {score >= SCENARIO_COUNT * 0.7
                ? (lang === 'es' ? 'Tus primeras conversaciones van a construir confianza desde el dia uno.' : 'Your first conversations will build trust from day one.')
                : score >= SCENARIO_COUNT * 0.4
                ? (lang === 'es' ? 'Buen instinto. Unas pocas mejoras y tu primera semana sera transformadora.' : 'Good instincts. A few adjustments and your first week will be transformative.')
                : (lang === 'es' ? 'Cada escenario es una oportunidad de aprendizaje. Juega de nuevo para fortalecer tus instintos.' : 'Every scenario is a learning moment. Play again to sharpen your instincts.')}
            </p>
          </div>

          {/* Been there count */}
          {beenThereCount > 0 && (
            <div
              className="rounded-xl p-4 mb-4 text-center"
              style={{ backgroundColor: TEAL.bg, border: `1px solid ${TEAL.border}` }}
            >
              <p className="text-white text-sm">
                {lang === 'es'
                  ? `Marcaste "He estado ahi" en ${beenThereCount} de ${SCENARIO_COUNT} escenarios. No estas solo/a.`
                  : `You hit "I've been there" on ${beenThereCount} of ${SCENARIO_COUNT} scenarios. You are not alone.`}
              </p>
            </div>
          )}

          {/* Skill breakdown */}
          <div
            className="rounded-xl p-5 mb-6"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: TEAL.accent }}>
              {lang === 'es' ? 'Tu Perfil de Primera Conversacion' : 'Your First Conversation Profile'}
            </p>
            <div className="space-y-3">
              {Object.entries(skillResults).map(([tag, result]) => {
                const pct = result.total > 0 ? Math.round((result.strong / result.total) * 100) : 0;
                const label = SKILL_TAGS[lang][tag as keyof typeof SKILL_TAGS['en']] || tag;
                return (
                  <div key={tag}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white text-sm">{label}</span>
                      <span className="text-xs" style={{ color: pct >= 50 ? '#27AE60' : '#F59E0B' }}>
                        {result.strong}/{result.total} {lang === 'es' ? 'fuerte' : 'strong'}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: pct >= 50 ? '#27AE60' : '#F59E0B',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handlePlayAgain}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.01]"
              style={{ backgroundColor: TEAL.accent, color: '#0a1628' }}
            >
              <RotateCcw size={16} />
              {lang === 'es' ? 'Jugar de Nuevo' : 'Play Again'}
            </button>
            <button
              onClick={onBack}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}
            >
              <ArrowLeft size={16} />
              {lang === 'es' ? 'Volver a Juegos' : 'Back to Games'}
            </button>
          </div>

          <CommunityNudge gameSlug="first-conversation" score={score} totalRounds={SCENARIO_COUNT} />
        </div>
      )}
    </GameWrapper>
  );
}
