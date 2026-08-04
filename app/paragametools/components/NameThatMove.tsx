'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, Award, Check, BookOpen } from 'lucide-react';
import { COLORS } from '../data/gameConfig';
import { useLanguage } from '../context/LanguageContext';
import {
  SCENARIOS,
  SCENARIO_COUNT,
  CATEGORY_LABELS,
  type MoveScenario,
  type Role,
  type GradeBand,
  type Experience,
  type MoveCategory,
} from '../data/nameThatMove';
import { GameWrapper } from './GameWrapper';
import { ConfettiBurst } from './ConfettiBurst';
import { useGameTracking } from '@/lib/hub/useGameTracking';
import { useGameBadgeCheck } from '@/components/hub/useGameBadgeCheck';
import { CommunityNudge } from './CommunityNudge';

type Screen = 'setup' | 'play' | 'results';
type Phase = 'scene' | 'choose' | 'reveal';

const GOLD = COLORS.gold;

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

const EXPERIENCE_OPTIONS: { value: Experience; en: string; es: string }[] = [
  { value: 'first_year', en: 'First Year', es: 'Primer Ano' },
  { value: '2-5', en: '2-5 Years', es: '2-5 Anos' },
  { value: '6-15', en: '6-15 Years', es: '6-15 Anos' },
  { value: '16+', en: '16+ Years', es: '16+ Anos' },
];

interface PlaybookEntry {
  scenario: MoveScenario;
  correct: boolean;
  iUseThis: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function NameThatMove({ onBack }: { onBack: () => void }) {
  const { language } = useLanguage();
  const lang = language === 'es' ? 'es' : 'en';
  const { logCompletion, startSession, logGameResponse, completeSession } = useGameTracking();

  const [screen, setScreen] = useState<Screen>('setup');
  const [selectedRole, setSelectedRole] = useState<Role>('teacher');
  const [selectedGrade, setSelectedGrade] = useState<GradeBand>('3-5');
  const [selectedExperience, setSelectedExperience] = useState<Experience>('2-5');

  const [gameScenarios, setGameScenarios] = useState<MoveScenario[]>([]);
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState<Phase>('scene');
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [playbook, setPlaybook] = useState<PlaybookEntry[]>([]);
  const [shuffledOptions, setShuffledOptions] = useState<{ text: string; isCorrect: boolean; originalIdx: number }[]>([]);

  const scenario = gameScenarios[current];
  const data = scenario ? scenario[lang] : null;
  const isLast = current === SCENARIO_COUNT - 1;

  const handleStart = async () => {
    const filtered = SCENARIOS.filter(
      (s) => s.roles.includes(selectedRole) && s.gradeBands.includes(selectedGrade)
    );
    const picked = shuffle(filtered).slice(0, SCENARIO_COUNT);
    if (picked.length < SCENARIO_COUNT) {
      const remaining = SCENARIOS.filter((s) => !picked.includes(s));
      picked.push(...shuffle(remaining).slice(0, SCENARIO_COUNT - picked.length));
    }
    const final = picked.slice(0, SCENARIO_COUNT);
    setGameScenarios(final);
    setCurrent(0);
    setPhase('scene');
    setSelected(null);
    setScore(0);
    setPlaybook([]);
    // Shuffle options for first scenario
    const firstData = final[0][lang];
    const opts = firstData.options.map((o, i) => ({ ...o, originalIdx: i }));
    setShuffledOptions(shuffle(opts));
    setScreen('play');
    await startSession('name-that-move', SCENARIO_COUNT, { language, role: selectedRole, gradeBand: selectedGrade });
  };

  const handleReadScene = () => setPhase('choose');

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setPhase('reveal');
    const option = shuffledOptions[idx];
    const isCorrect = option.isCorrect;
    if (isCorrect) setScore((s) => s + 1);

    setPlaybook((prev) => [...prev, { scenario: scenario!, correct: isCorrect, iUseThis: false }]);

    logGameResponse('name-that-move', {
      itemId: scenario!.id,
      roundNumber: current + 1,
      userAnswer: option.text,
      correctAnswer: data!.correctName,
      isCorrect,
    });
  };

  const handleToggleIUseThis = () => {
    setPlaybook((prev) => {
      const updated = [...prev];
      const last = updated[updated.length - 1];
      if (last) {
        updated[updated.length - 1] = { ...last, iUseThis: !last.iUseThis };
      }
      return updated;
    });
  };

  const handleNext = async () => {
    if (isLast) {
      setScreen('results');
      logCompletion({ tool: 'name-that-move', score, totalRounds: SCENARIO_COUNT });
      await completeSession(score, 0);
    } else {
      const nextIdx = current + 1;
      setCurrent(nextIdx);
      setPhase('scene');
      setSelected(null);
      // Shuffle options for next scenario
      const nextData = gameScenarios[nextIdx][lang];
      const opts = nextData.options.map((o, i) => ({ ...o, originalIdx: i }));
      setShuffledOptions(shuffle(opts));
    }
  };

  const handlePlayAgain = () => setScreen('setup');
  const gameTitle = lang === 'es' ? 'Nombra Ese Movimiento' : 'Name That Move';
  const badgeCelebration = useGameBadgeCheck(screen === 'results');

  // Category stats for results
  const categoryStats: Record<MoveCategory, { total: number; correct: number; iUseThis: number }> = {} as Record<MoveCategory, { total: number; correct: number; iUseThis: number }>;
  for (const entry of playbook) {
    const cat = entry.scenario.category;
    if (!categoryStats[cat]) categoryStats[cat] = { total: 0, correct: 0, iUseThis: 0 };
    categoryStats[cat].total += 1;
    if (entry.correct) categoryStats[cat].correct += 1;
    if (entry.iUseThis) categoryStats[cat].iUseThis += 1;
  }

  const iUseThisCount = playbook.filter((p) => p.iUseThis).length;
  const currentIUseThis = playbook.length > 0 ? playbook[playbook.length - 1]?.iUseThis : false;

  return (
    <GameWrapper gameId="namethatmove" title={gameTitle} color="gold" onBack={onBack}>
      {badgeCelebration}

      {/* ─── SETUP ─────────────────────────────────────────────────────── */}
      {screen === 'setup' && (
        <div className="flex flex-col items-center text-center animate-fade-in">
          <div
            className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: GOLD.bg, border: `2px solid ${GOLD.accent}` }}
          >
            <Award size={36} style={{ color: GOLD.accent }} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{gameTitle}</h2>
          <p className="text-lg mb-6" style={{ color: GOLD.accent }}>
            {lang === 'es' ? 'Ve lo que hicieron. Nombra la estrategia.' : 'See what they did. Name the strategy.'}
          </p>

          <div
            className="w-full max-w-lg rounded-xl p-6 mb-6"
            style={{ backgroundColor: GOLD.bg, border: `1px solid ${GOLD.border}` }}
          >
            <p className="text-white text-base leading-relaxed mb-5">
              {lang === 'es'
                ? 'Observas lo que un educador hizo en una situacion real. Tu trabajo: nombrar la estrategia que usaron. Construyes un "manual de jugadas" personal de movimientos mientras identificas cada uno correctamente.'
                : 'You watch what an educator did in a real situation. Your job: name the strategy they used. You build a personal "playbook" of moves as you identify each one correctly.'}
            </p>

            <div className="space-y-4 text-left">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: GOLD.accent }}>
                  {lang === 'es' ? 'Tu rol' : 'Your role'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {ROLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedRole(opt.value)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                      style={{
                        backgroundColor: selectedRole === opt.value ? GOLD.accent : 'rgba(255,255,255,0.08)',
                        color: selectedRole === opt.value ? '#fff' : 'rgba(255,255,255,0.7)',
                        border: `1px solid ${selectedRole === opt.value ? GOLD.accent : 'rgba(255,255,255,0.15)'}`,
                      }}
                    >
                      {opt[lang]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: GOLD.accent }}>
                  {lang === 'es' ? 'Tu nivel de grado' : 'Your grade band'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {GRADE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedGrade(opt.value)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                      style={{
                        backgroundColor: selectedGrade === opt.value ? GOLD.accent : 'rgba(255,255,255,0.08)',
                        color: selectedGrade === opt.value ? '#fff' : 'rgba(255,255,255,0.7)',
                        border: `1px solid ${selectedGrade === opt.value ? GOLD.accent : 'rgba(255,255,255,0.15)'}`,
                      }}
                    >
                      {opt[lang]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: GOLD.accent }}>
                  {lang === 'es' ? 'Tu experiencia' : 'Your experience'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {EXPERIENCE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedExperience(opt.value)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                      style={{
                        backgroundColor: selectedExperience === opt.value ? GOLD.accent : 'rgba(255,255,255,0.08)',
                        color: selectedExperience === opt.value ? '#fff' : 'rgba(255,255,255,0.7)',
                        border: `1px solid ${selectedExperience === opt.value ? GOLD.accent : 'rgba(255,255,255,0.15)'}`,
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
            style={{ backgroundColor: GOLD.accent, color: '#fff', ['--glow-color' as string]: GOLD.accent + '40' }}
          >
            {lang === 'es' ? 'Comenzar' : 'Start'} <ArrowRight size={20} className="inline ml-1" />
          </button>
        </div>
      )}

      {/* ─── PLAY ──────────────────────────────────────────────────────── */}
      {screen === 'play' && data && (
        <div className="animate-fade-in">
          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {Array.from({ length: SCENARIO_COUNT }).map((_, i) => (
              <div key={i} className="w-3 h-3 rounded-full transition-all duration-300" style={{ backgroundColor: i <= current ? GOLD.accent : 'rgba(255,255,255,0.15)' }} />
            ))}
          </div>
          <p className="text-center text-sm mb-2" style={{ color: '#8899aa' }}>
            {lang === 'es' ? `Movimiento ${current + 1} de ${SCENARIO_COUNT}` : `Move ${current + 1} of ${SCENARIO_COUNT}`}
          </p>

          {/* Category badge */}
          <div className="flex justify-center mb-4">
            <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{
              backgroundColor: CATEGORY_LABELS[scenario!.category].color + '20',
              color: CATEGORY_LABELS[scenario!.category].color,
              border: `1px solid ${CATEGORY_LABELS[scenario!.category].color}40`,
            }}>
              {CATEGORY_LABELS[scenario!.category][lang]}
            </span>
          </div>

          {/* SCENE PHASE */}
          {phase === 'scene' && (
            <div>
              <div className="rounded-xl p-5 mb-4" style={{ backgroundColor: 'rgba(232,184,75,0.08)', border: '1px solid rgba(232,184,75,0.2)' }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: GOLD.accent }}>
                  {lang === 'es' ? 'La escena' : 'The scene'}
                </p>
                <p className="text-white text-base leading-relaxed">{data.vignette}</p>
              </div>
              <button onClick={handleReadScene} className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.01]" style={{ backgroundColor: GOLD.accent, color: '#fff' }}>
                {lang === 'es' ? 'Nombra ese movimiento' : 'Name That Move'} <ArrowRight size={16} className="inline ml-1" />
              </button>
            </div>
          )}

          {/* CHOOSE PHASE */}
          {phase === 'choose' && (
            <div>
              <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: 'rgba(232,184,75,0.06)', border: '1px solid rgba(232,184,75,0.15)' }}>
                <p className="text-white text-sm leading-relaxed">{data.vignette}</p>
              </div>
              <p className="text-white font-semibold mb-4">
                {lang === 'es' ? 'Que estrategia uso este educador?' : 'What strategy did this educator use?'}
              </p>
              <div className="flex flex-col gap-3 mb-4">
                {shuffledOptions.map((option, idx) => (
                  <button key={idx} onClick={() => handleSelect(idx)} className="text-left rounded-xl p-4 transition-all hover:scale-[1.01]" style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)' }}>
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold" style={{ backgroundColor: GOLD.bg, color: GOLD.accent, border: `1px solid ${GOLD.border}` }}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <p className="text-white text-sm leading-relaxed">{option.text}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* REVEAL PHASE */}
          {phase === 'reveal' && selected !== null && (
            <div className="animate-fade-in">
              {/* Selected answer feedback */}
              <div className="rounded-xl p-4 mb-4" style={{
                backgroundColor: shuffledOptions[selected].isCorrect ? 'rgba(39,174,96,0.15)' : 'rgba(231,76,60,0.15)',
                border: `1px solid ${shuffledOptions[selected].isCorrect ? 'rgba(39,174,96,0.4)' : 'rgba(231,76,60,0.4)'}`,
              }}>
                <div className="flex items-center gap-2 mb-2">
                  {shuffledOptions[selected].isCorrect ? (
                    <Check size={18} style={{ color: '#27AE60' }} />
                  ) : (
                    <span className="text-sm" style={{ color: '#E74C3C' }}>X</span>
                  )}
                  <p className="text-white text-sm font-semibold">
                    {shuffledOptions[selected].isCorrect
                      ? (lang === 'es' ? 'Correcto.' : 'Correct!')
                      : (lang === 'es' ? `No exactamente. La respuesta correcta es: ${data.correctName}` : `Not quite. The correct answer is: ${data.correctName}`)}
                  </p>
                </div>
              </div>

              {/* Strategy description */}
              <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: 'rgba(232,184,75,0.08)', border: '1px solid rgba(232,184,75,0.2)' }}>
                <p className="text-sm font-bold mb-2" style={{ color: GOLD.accent }}>{data.correctName}</p>
                <p className="text-white text-sm leading-relaxed">{data.description}</p>
              </div>

              {/* Research */}
              <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: 'rgba(232,184,75,0.06)', borderLeft: `3px solid ${GOLD.accent}` }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: GOLD.accent }}>
                  {lang === 'es' ? 'La investigacion' : 'The research'}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>{data.research}</p>
              </div>

              {/* I Use This One toggle */}
              <button
                onClick={handleToggleIUseThis}
                className="w-full rounded-xl p-3 mb-4 flex items-center justify-center gap-2 transition-all"
                style={{
                  backgroundColor: currentIUseThis ? 'rgba(39,174,96,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${currentIUseThis ? 'rgba(39,174,96,0.4)' : 'rgba(255,255,255,0.1)'}`,
                }}
              >
                <BookOpen size={16} style={{ color: currentIUseThis ? '#27AE60' : 'rgba(255,255,255,0.5)' }} />
                <span className="text-sm font-medium" style={{ color: currentIUseThis ? '#27AE60' : 'rgba(255,255,255,0.6)' }}>
                  {currentIUseThis
                    ? (lang === 'es' ? 'Ya uso este movimiento' : 'I use this one')
                    : (lang === 'es' ? 'Toca si ya usas este movimiento' : 'Tap if you already use this move')}
                </span>
                {currentIUseThis && <Check size={14} style={{ color: '#27AE60' }} />}
              </button>

              {/* Next */}
              <button onClick={handleNext} className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.01]" style={{ backgroundColor: GOLD.accent, color: '#fff' }}>
                {isLast ? (lang === 'es' ? 'Ver mi manual de jugadas' : 'See My Playbook') : (lang === 'es' ? 'Siguiente movimiento' : 'Next Move')}
                <ArrowRight size={16} className="inline ml-1" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── RESULTS ───────────────────────────────────────────────────── */}
      {screen === 'results' && (
        <div className="animate-fade-in">
          {score >= SCENARIO_COUNT * 0.7 && <ConfettiBurst colors={[GOLD.accent, '#27AE60', '#F1C40F']} />}

          <div className="text-center mb-6">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: GOLD.bg, border: `3px solid ${GOLD.accent}` }}>
              <span className="text-3xl font-black" style={{ color: GOLD.accent }}>{score}/{SCENARIO_COUNT}</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {lang === 'es' ? 'Tu Manual de Jugadas' : 'Your Playbook'}
            </h2>
            <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {score >= SCENARIO_COUNT * 0.7
                ? (lang === 'es' ? 'Reconocimiento fuerte de estrategias. Tu manual de jugadas esta creciendo.' : 'Strong strategy recognition. Your playbook is growing.')
                : score >= SCENARIO_COUNT * 0.4
                ? (lang === 'es' ? 'Buen comienzo. Las que fallaste son tu ventaja de crecimiento.' : 'Good start. The ones you missed are your growth edge.')
                : (lang === 'es' ? 'Cada movimiento que aprendes expande tu repertorio. Juega de nuevo para fortalecer.' : 'Every move you learn expands your repertoire. Play again to strengthen.')}
            </p>
            <p className="text-sm font-semibold" style={{ color: '#27AE60' }}>
              {lang === 'es' ? `Ya uso ${iUseThisCount} de ${SCENARIO_COUNT} movimientos` : `I use ${iUseThisCount} of ${SCENARIO_COUNT} moves`}
            </p>
          </div>

          {/* Category gap analysis */}
          <div className="rounded-xl p-5 mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: GOLD.accent }}>
              {lang === 'es' ? 'Analisis por Categoria' : 'Category Analysis'}
            </p>
            <div className="space-y-3">
              {Object.entries(categoryStats).map(([cat, stats]) => {
                const label = CATEGORY_LABELS[cat as MoveCategory];
                const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                return (
                  <div key={cat}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white text-sm">{label[lang]}</span>
                      <span className="text-xs" style={{ color: pct >= 50 ? '#27AE60' : '#F59E0B' }}>{stats.correct}/{stats.total}</span>
                    </div>
                    <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                      <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: label.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Playbook grid */}
          <div className="rounded-xl p-5 mb-6" style={{ backgroundColor: 'rgba(232,184,75,0.06)', border: '1px solid rgba(232,184,75,0.15)' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: GOLD.accent }}>
              {lang === 'es' ? 'Tu Coleccion de Movimientos' : 'Your Move Collection'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {playbook.map((entry, idx) => {
                const entryData = entry.scenario[lang];
                const catLabel = CATEGORY_LABELS[entry.scenario.category];
                return (
                  <div
                    key={idx}
                    className="rounded-lg p-3"
                    style={{
                      backgroundColor: entry.correct ? 'rgba(39,174,96,0.08)' : 'rgba(231,76,60,0.08)',
                      border: `1px solid ${entry.correct ? 'rgba(39,174,96,0.2)' : 'rgba(231,76,60,0.2)'}`,
                    }}
                  >
                    <p className="text-xs font-semibold text-white mb-1">{entryData.correctName}</p>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: catLabel.color + '20', color: catLabel.color }}>
                        {catLabel[lang]}
                      </span>
                      {entry.iUseThis && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(39,174,96,0.2)', color: '#27AE60' }}>
                          {lang === 'es' ? 'Lo uso' : 'I use this'}
                        </span>
                      )}
                    </div>
                    {!entry.correct && (
                      <p className="text-[10px] mt-1" style={{ color: '#F59E0B' }}>
                        {lang === 'es' ? 'Ventaja de crecimiento' : 'Growth edge'}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={handlePlayAgain} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.01]" style={{ backgroundColor: GOLD.accent, color: '#fff' }}>
              <RotateCcw size={16} /> {lang === 'es' ? 'Jugar de Nuevo' : 'Play Again'}
            </button>
            <button onClick={onBack} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all" style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}>
              <ArrowLeft size={16} /> {lang === 'es' ? 'Volver a Juegos' : 'Back to Games'}
            </button>
          </div>

          <CommunityNudge gameSlug="name-that-move" score={score} totalRounds={SCENARIO_COUNT} />
        </div>
      )}
    </GameWrapper>
  );
}
