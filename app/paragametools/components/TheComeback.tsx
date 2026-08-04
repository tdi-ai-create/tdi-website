'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, RefreshCw, Zap, Heart } from 'lucide-react';
import { COLORS } from '../data/gameConfig';
import { useLanguage } from '../context/LanguageContext';
import {
  SCENARIOS,
  SCENARIO_COUNT,
  RECOVERY_LABELS,
  type Scenario,
  type Role,
  type GradeBand,
  type RecoveryType,
} from '../data/theComeback';
import { GameWrapper } from './GameWrapper';
import { ConfettiBurst } from './ConfettiBurst';
import { useGameTracking } from '@/lib/hub/useGameTracking';
import { useGameBadgeCheck } from '@/components/hub/useGameBadgeCheck';
import { CommunityNudge } from './CommunityNudge';

type Screen = 'setup' | 'play' | 'results';
type Phase = 'situation' | 'choose' | 'reveal';

const ROSE = COLORS.rose;

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

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function TheComeback({ onBack }: { onBack: () => void }) {
  const { language } = useLanguage();
  const lang = language === 'es' ? 'es' : 'en';
  const { logCompletion, startSession, logGameResponse, completeSession } = useGameTracking();

  const [screen, setScreen] = useState<Screen>('setup');
  const [selectedRole, setSelectedRole] = useState<Role>('teacher');
  const [selectedGrade, setSelectedGrade] = useState<GradeBand>('3-5');

  const [gameScenarios, setGameScenarios] = useState<Scenario[]>([]);
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState<Phase>('situation');
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [totalSpeed, setTotalSpeed] = useState(0);
  const [totalRelationship, setTotalRelationship] = useState(0);
  const [recoveryResults, setRecoveryResults] = useState<Record<RecoveryType, { total: number; strong: number }>>({} as Record<RecoveryType, { total: number; strong: number }>);

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
    setGameScenarios(picked.slice(0, SCENARIO_COUNT));
    setCurrent(0);
    setPhase('situation');
    setSelected(null);
    setScore(0);
    setTotalSpeed(0);
    setTotalRelationship(0);
    setRecoveryResults({} as Record<RecoveryType, { total: number; strong: number }>);
    setScreen('play');
    await startSession('the-comeback', SCENARIO_COUNT, { language, role: selectedRole, gradeBand: selectedGrade });
  };

  const handleReadyToChoose = () => setPhase('choose');

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setPhase('reveal');
    const move = data!.forwardMoves[idx];
    if (move.quality === 'strong') setScore((s) => s + 1);
    setTotalSpeed((s) => s + move.recoveryScore.speed);
    setTotalRelationship((s) => s + move.recoveryScore.relationship);

    const type = scenario!.recoveryType;
    setRecoveryResults((prev) => {
      const existing = prev[type] || { total: 0, strong: 0 };
      return { ...prev, [type]: { total: existing.total + 1, strong: existing.strong + (move.quality === 'strong' ? 1 : 0) } };
    });

    logGameResponse('the-comeback', {
      itemId: scenario!.id,
      roundNumber: current + 1,
      userAnswer: String.fromCharCode(65 + idx),
      correctAnswer: String.fromCharCode(65 + data!.forwardMoves.findIndex((m) => m.quality === 'strong')),
      isCorrect: move.quality === 'strong',
    });
  };

  const handleNext = async () => {
    if (isLast) {
      setScreen('results');
      logCompletion({ tool: 'the-comeback', score, totalRounds: SCENARIO_COUNT });
      await completeSession(score, 0);
    } else {
      setCurrent((c) => c + 1);
      setPhase('situation');
      setSelected(null);
    }
  };

  const handlePlayAgain = () => setScreen('setup');
  const gameTitle = lang === 'es' ? 'El Regreso' : 'The Comeback';
  const badgeCelebration = useGameBadgeCheck(screen === 'results');

  const avgSpeed = current > 0 || screen === 'results' ? Math.round((totalSpeed / Math.max(current + (screen === 'results' ? 0 : 0), 1)) * 20) : 0;
  const avgRelationship = current > 0 || screen === 'results' ? Math.round((totalRelationship / Math.max(current + (screen === 'results' ? 0 : 0), 1)) * 20) : 0;

  return (
    <GameWrapper gameId="readtheroom" title={gameTitle} color="rose" onBack={onBack}>
      {badgeCelebration}

      {/* ─── SETUP ─────────────────────────────────────────────────────── */}
      {screen === 'setup' && (
        <div className="flex flex-col items-center text-center animate-fade-in">
          <div
            className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: ROSE.bg, border: `2px solid ${ROSE.accent}` }}
          >
            <RefreshCw size={36} style={{ color: ROSE.accent }} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{gameTitle}</h2>
          <p className="text-lg mb-6" style={{ color: ROSE.accent }}>
            {lang === 'es' ? 'No puedes rehacerlo. Solo puedes avanzar.' : 'You can\'t redo it. You can only move forward.'}
          </p>

          <div
            className="w-full max-w-lg rounded-xl p-6 mb-6"
            style={{ backgroundColor: ROSE.bg, border: `1px solid ${ROSE.border}` }}
          >
            <p className="text-white text-base leading-relaxed mb-5">
              {lang === 'es'
                ? 'Algo salio mal. Un error, un momento que quisieras devolver. No hay opcion de rehacerlo. Solo opciones hacia adelante. Elige tu recuperacion y ve como equilibra velocidad con preservacion de relaciones.'
                : 'Something went wrong. A mistake, a moment you wish you could take back. There is no redo option. Only forward moves. Choose your recovery and see how it balances speed with relationship preservation.'}
            </p>

            <div className="space-y-4 text-left">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: ROSE.accent }}>
                  {lang === 'es' ? 'Tu rol' : 'Your role'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {ROLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedRole(opt.value)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                      style={{
                        backgroundColor: selectedRole === opt.value ? ROSE.accent : 'rgba(255,255,255,0.08)',
                        color: selectedRole === opt.value ? '#fff' : 'rgba(255,255,255,0.7)',
                        border: `1px solid ${selectedRole === opt.value ? ROSE.accent : 'rgba(255,255,255,0.15)'}`,
                      }}
                    >
                      {opt[lang]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: ROSE.accent }}>
                  {lang === 'es' ? 'Tu nivel de grado' : 'Your grade band'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {GRADE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedGrade(opt.value)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                      style={{
                        backgroundColor: selectedGrade === opt.value ? ROSE.accent : 'rgba(255,255,255,0.08)',
                        color: selectedGrade === opt.value ? '#fff' : 'rgba(255,255,255,0.7)',
                        border: `1px solid ${selectedGrade === opt.value ? ROSE.accent : 'rgba(255,255,255,0.15)'}`,
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
            style={{ backgroundColor: ROSE.accent, color: '#fff', ['--glow-color' as string]: ROSE.accent + '40' }}
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
              <div key={i} className="w-3 h-3 rounded-full transition-all duration-300" style={{ backgroundColor: i <= current ? ROSE.accent : 'rgba(255,255,255,0.15)' }} />
            ))}
          </div>
          <p className="text-center text-sm mb-2" style={{ color: '#8899aa' }}>
            {lang === 'es' ? `Escenario ${current + 1} de ${SCENARIO_COUNT}` : `Scenario ${current + 1} of ${SCENARIO_COUNT}`}
          </p>

          {/* Recovery type badge */}
          <div className="flex justify-center mb-4">
            <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{ backgroundColor: RECOVERY_LABELS[scenario!.recoveryType].color + '20', color: RECOVERY_LABELS[scenario!.recoveryType].color, border: `1px solid ${RECOVERY_LABELS[scenario!.recoveryType].color}40` }}>
              {RECOVERY_LABELS[scenario!.recoveryType][lang]}
            </span>
          </div>

          {/* SITUATION PHASE */}
          {phase === 'situation' && (
            <div>
              <div className="rounded-xl p-5 mb-4" style={{ backgroundColor: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: ROSE.accent }}>
                  {lang === 'es' ? 'Lo que paso' : 'What happened'}
                </p>
                <p className="text-white text-base leading-relaxed">{data.whatHappened}</p>
              </div>
              <div className="rounded-xl p-5 mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#F59E0B' }}>
                  {lang === 'es' ? 'La sacudida' : 'The aftershock'}
                </p>
                <p className="text-white text-base leading-relaxed">{data.theAftershock}</p>
              </div>
              <button onClick={handleReadyToChoose} className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.01]" style={{ backgroundColor: ROSE.accent, color: '#fff' }}>
                {lang === 'es' ? 'Que haces ahora?' : 'What do you do now?'} <ArrowRight size={16} className="inline ml-1" />
              </button>
            </div>
          )}

          {/* CHOOSE PHASE */}
          {phase === 'choose' && (
            <div>
              <p className="text-sm mb-1 italic" style={{ color: ROSE.accent }}>
                {lang === 'es' ? 'No puedes rehacerlo. Solo avanzar.' : 'You can\'t redo it. Only move forward.'}
              </p>
              <p className="text-white font-semibold mb-4">
                {lang === 'es' ? 'Elige tu movimiento hacia adelante:' : 'Choose your forward move:'}
              </p>
              <div className="flex flex-col gap-3 mb-4">
                {data.forwardMoves.map((move, idx) => (
                  <button key={idx} onClick={() => handleSelect(idx)} className="text-left rounded-xl p-4 transition-all hover:scale-[1.01]" style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)' }}>
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold" style={{ backgroundColor: ROSE.bg, color: ROSE.accent, border: `1px solid ${ROSE.border}` }}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <p className="text-white text-sm leading-relaxed">{move.text}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* REVEAL PHASE */}
          {phase === 'reveal' && selected !== null && (
            <div className="animate-fade-in">
              {/* Selected move with color */}
              <div className="rounded-xl p-4 mb-4" style={{
                backgroundColor: data.forwardMoves[selected].quality === 'strong' ? 'rgba(39,174,96,0.15)' : data.forwardMoves[selected].quality === 'okay' ? 'rgba(245,158,11,0.15)' : 'rgba(231,76,60,0.15)',
                border: `1px solid ${data.forwardMoves[selected].quality === 'strong' ? 'rgba(39,174,96,0.4)' : data.forwardMoves[selected].quality === 'okay' ? 'rgba(245,158,11,0.4)' : 'rgba(231,76,60,0.4)'}`,
              }}>
                <p className="text-white text-sm leading-relaxed mb-2">{data.forwardMoves[selected].text}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>{data.forwardMoves[selected].why}</p>
              </div>

              {/* Recovery Score */}
              <div className="flex gap-3 mb-4">
                <div className="flex-1 rounded-lg p-3 text-center" style={{ backgroundColor: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.15)' }}>
                  <Zap size={16} className="mx-auto mb-1" style={{ color: ROSE.accent }} />
                  <p className="text-xs font-semibold" style={{ color: ROSE.accent }}>{lang === 'es' ? 'Velocidad' : 'Speed'}</p>
                  <div className="flex justify-center gap-1 mt-1">
                    {[1,2,3,4,5].map((i) => (
                      <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: i <= data.forwardMoves[selected].recoveryScore.speed ? ROSE.accent : 'rgba(255,255,255,0.15)' }} />
                    ))}
                  </div>
                </div>
                <div className="flex-1 rounded-lg p-3 text-center" style={{ backgroundColor: 'rgba(39,174,96,0.08)', border: '1px solid rgba(39,174,96,0.15)' }}>
                  <Heart size={16} className="mx-auto mb-1" style={{ color: '#27AE60' }} />
                  <p className="text-xs font-semibold" style={{ color: '#27AE60' }}>{lang === 'es' ? 'Relacion' : 'Relationship'}</p>
                  <div className="flex justify-center gap-1 mt-1">
                    {[1,2,3,4,5].map((i) => (
                      <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: i <= data.forwardMoves[selected].recoveryScore.relationship ? '#27AE60' : 'rgba(255,255,255,0.15)' }} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Research */}
              <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: 'rgba(244,63,94,0.06)', borderLeft: `3px solid ${ROSE.accent}` }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: ROSE.accent }}>
                  {lang === 'es' ? 'La investigacion' : 'The research'}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>{data.research}</p>
              </div>

              {/* Real Story */}
              <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#F59E0B' }}>
                  {lang === 'es' ? 'Historia real' : 'Real story'}
                </p>
                <p className="text-white text-sm leading-relaxed italic mb-2">{data.realStory}</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{data.realStoryRole}</p>
              </div>

              {/* Next */}
              <button onClick={handleNext} className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.01]" style={{ backgroundColor: ROSE.accent, color: '#fff' }}>
                {isLast ? (lang === 'es' ? 'Ver resultados' : 'See Results') : (lang === 'es' ? 'Siguiente escenario' : 'Next Scenario')}
                <ArrowRight size={16} className="inline ml-1" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── RESULTS ───────────────────────────────────────────────────── */}
      {screen === 'results' && (
        <div className="animate-fade-in">
          {score >= SCENARIO_COUNT * 0.7 && <ConfettiBurst colors={[ROSE.accent, '#27AE60', '#F1C40F']} />}

          <div className="text-center mb-6">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: ROSE.bg, border: `3px solid ${ROSE.accent}` }}>
              <span className="text-3xl font-black" style={{ color: ROSE.accent }}>{score}/{SCENARIO_COUNT}</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {lang === 'es' ? 'Tu Perfil de Recuperacion' : 'Your Recovery Profile'}
            </h2>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {score >= SCENARIO_COUNT * 0.7
                ? (lang === 'es' ? 'Tus instintos de recuperacion son fuertes. Priorizas la relacion sin sacrificar la velocidad.' : 'Your recovery instincts are strong. You prioritize relationship without sacrificing speed.')
                : score >= SCENARIO_COUNT * 0.4
                ? (lang === 'es' ? 'Buenos instintos de recuperacion. Tus puntos ciegos muestran donde puedes crecer.' : 'Good recovery instincts. Your blind spots show where you can grow.')
                : (lang === 'es' ? 'La recuperacion es una habilidad, no un talento. Juega de nuevo para fortalecer tus instintos.' : 'Recovery is a skill, not a talent. Play again to strengthen your instincts.')}
            </p>
          </div>

          {/* Speed vs Relationship summary */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 rounded-xl p-4 text-center" style={{ backgroundColor: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.15)' }}>
              <Zap size={20} className="mx-auto mb-2" style={{ color: ROSE.accent }} />
              <p className="text-xs font-semibold mb-1" style={{ color: ROSE.accent }}>{lang === 'es' ? 'Velocidad Promedio' : 'Avg Speed'}</p>
              <p className="text-2xl font-bold text-white">{Math.round(totalSpeed / SCENARIO_COUNT * 20)}%</p>
            </div>
            <div className="flex-1 rounded-xl p-4 text-center" style={{ backgroundColor: 'rgba(39,174,96,0.08)', border: '1px solid rgba(39,174,96,0.15)' }}>
              <Heart size={20} className="mx-auto mb-2" style={{ color: '#27AE60' }} />
              <p className="text-xs font-semibold mb-1" style={{ color: '#27AE60' }}>{lang === 'es' ? 'Relacion Promedio' : 'Avg Relationship'}</p>
              <p className="text-2xl font-bold text-white">{Math.round(totalRelationship / SCENARIO_COUNT * 20)}%</p>
            </div>
          </div>

          {/* Recovery type breakdown */}
          <div className="rounded-xl p-5 mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: ROSE.accent }}>
              {lang === 'es' ? 'Tipos de Recuperacion' : 'Recovery Types'}
            </p>
            <div className="space-y-3">
              {Object.entries(recoveryResults).map(([type, result]) => {
                const label = RECOVERY_LABELS[type as RecoveryType];
                const pct = result.total > 0 ? Math.round((result.strong / result.total) * 100) : 0;
                return (
                  <div key={type}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white text-sm">{label[lang]}</span>
                      <span className="text-xs" style={{ color: pct >= 50 ? '#27AE60' : '#F59E0B' }}>{result.strong}/{result.total}</span>
                    </div>
                    <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                      <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: label.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={handlePlayAgain} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.01]" style={{ backgroundColor: ROSE.accent, color: '#fff' }}>
              <RotateCcw size={16} /> {lang === 'es' ? 'Jugar de Nuevo' : 'Play Again'}
            </button>
            <button onClick={onBack} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all" style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}>
              <ArrowLeft size={16} /> {lang === 'es' ? 'Volver a Juegos' : 'Back to Games'}
            </button>
          </div>

          <CommunityNudge gameSlug="the-comeback" score={score} totalRounds={SCENARIO_COUNT} />
        </div>
      )}
    </GameWrapper>
  );
}
