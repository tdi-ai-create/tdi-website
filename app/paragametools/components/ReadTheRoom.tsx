'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, Eye, EyeOff, Check, X } from 'lucide-react';
import { COLORS } from '../data/gameConfig';
import { useLanguage } from '../context/LanguageContext';
import {
  SCENARIOS,
  SCENARIO_COUNT,
  OBSERVATION_TIME,
  CUE_LABELS,
  type Scenario,
  type Role,
  type GradeBand,
  type CueCategory,
} from '../data/readTheRoom';
import { GameWrapper } from './GameWrapper';
import { ConfettiBurst } from './ConfettiBurst';
import { useGameTracking } from '@/lib/hub/useGameTracking';
import { useGameBadgeCheck } from '@/components/hub/useGameBadgeCheck';
import { CommunityNudge } from './CommunityNudge';

type Screen = 'setup' | 'play' | 'results';
type Phase = 'observe' | 'identify' | 'respond' | 'reveal';

const PURPLE = COLORS.purple;

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

export function ReadTheRoom({ onBack }: { onBack: () => void }) {
  const { language } = useLanguage();
  const lang = language === 'es' ? 'es' : 'en';
  const { logCompletion, startSession, logGameResponse, completeSession } = useGameTracking();

  const [screen, setScreen] = useState<Screen>('setup');
  const [selectedRole, setSelectedRole] = useState<Role>('teacher');
  const [selectedGrade, setSelectedGrade] = useState<GradeBand>('3-5');

  const [gameScenarios, setGameScenarios] = useState<Scenario[]>([]);
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState<Phase>('observe');
  const [timeLeft, setTimeLeft] = useState(OBSERVATION_TIME);
  const [sceneVisible, setSceneVisible] = useState(true);
  const [selectedObs, setSelectedObs] = useState<Set<number>>(new Set());
  const [obsRevealed, setObsRevealed] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [obsScore, setObsScore] = useState(0);
  const [cueCards, setCueCards] = useState<Record<CueCategory, { found: number; total: number }>>({} as Record<CueCategory, { found: number; total: number }>);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scenario = gameScenarios[current];
  const data = scenario ? scenario[lang] : null;
  const isLast = current === SCENARIO_COUNT - 1;

  // Timer for observation phase
  useEffect(() => {
    if (phase !== 'observe' || !sceneVisible) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setSceneVisible(false);
          setPhase('identify');
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, sceneVisible]);

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
    setPhase('observe');
    setTimeLeft(OBSERVATION_TIME);
    setSceneVisible(true);
    setSelectedObs(new Set());
    setObsRevealed(false);
    setSelectedResponse(null);
    setScore(0);
    setObsScore(0);
    setCueCards({} as Record<CueCategory, { found: number; total: number }>);
    setScreen('play');
    await startSession('read-the-room', SCENARIO_COUNT, { language, role: selectedRole, gradeBand: selectedGrade });
  };

  const handleSkipTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSceneVisible(false);
    setTimeLeft(0);
    setPhase('identify');
  };

  const handleToggleObs = (idx: number) => {
    if (obsRevealed) return;
    setSelectedObs((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleRevealObs = () => {
    setObsRevealed(true);
    // Score observations
    const keyObs = data!.observations.filter((o) => o.isKey);
    const correctPicks = data!.observations.filter((o, i) => o.isKey && selectedObs.has(i)).length;
    setObsScore((prev) => prev + correctPicks);

    // Update cue cards
    const cat = scenario!.cueCategory;
    setCueCards((prev) => {
      const existing = prev[cat] || { found: 0, total: 0 };
      return {
        ...prev,
        [cat]: {
          found: existing.found + (correctPicks > 0 ? 1 : 0),
          total: existing.total + 1,
        },
      };
    });
  };

  const handleGoToRespond = () => {
    setPhase('respond');
  };

  const handleSelectResponse = (idx: number) => {
    if (selectedResponse !== null) return;
    setSelectedResponse(idx);
    const quality = data!.responses[idx].quality;
    if (quality === 'strong') setScore((s) => s + 1);
    setPhase('reveal');
    logGameResponse('read-the-room', {
      itemId: scenario!.id,
      roundNumber: current + 1,
      userAnswer: String.fromCharCode(65 + idx),
      correctAnswer: String.fromCharCode(65 + data!.responses.findIndex((r) => r.quality === 'strong')),
      isCorrect: quality === 'strong',
    });
  };

  const handleNext = async () => {
    if (isLast) {
      setScreen('results');
      logCompletion({ tool: 'read-the-room', score, totalRounds: SCENARIO_COUNT });
      await completeSession(score, 0);
    } else {
      setCurrent((c) => c + 1);
      setPhase('observe');
      setTimeLeft(OBSERVATION_TIME);
      setSceneVisible(true);
      setSelectedObs(new Set());
      setObsRevealed(false);
      setSelectedResponse(null);
    }
  };

  const handlePlayAgain = () => setScreen('setup');

  const gameTitle = lang === 'es' ? 'Lee el Salon' : 'Read the Room';
  const badgeCelebration = useGameBadgeCheck(screen === 'results');

  return (
    <GameWrapper gameId="firstconversation" title={gameTitle} color="purple" onBack={onBack}>
      {badgeCelebration}

      {/* ─── SETUP ─────────────────────────────────────────────────────── */}
      {screen === 'setup' && (
        <div className="flex flex-col items-center text-center animate-fade-in">
          <div
            className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: PURPLE.bg, border: `2px solid ${PURPLE.accent}` }}
          >
            <Eye size={36} style={{ color: PURPLE.accent }} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{gameTitle}</h2>
          <p className="text-lg mb-6" style={{ color: PURPLE.accent }}>
            {lang === 'es' ? 'Ve lo que otros no ven.' : 'See what others miss.'}
          </p>

          <div
            className="w-full max-w-lg rounded-xl p-6 mb-6"
            style={{ backgroundColor: PURPLE.bg, border: `1px solid ${PURPLE.border}` }}
          >
            <p className="text-white text-base leading-relaxed mb-5">
              {lang === 'es'
                ? 'Caminas a una situacion a mitad de camino. Lee la escena, identifica las senales clave, elige tu respuesta. Colecciona tarjetas de senales mientras juegas.'
                : 'You walk into a situation mid-stream. Read the scene, identify the key cues, choose your response. Collect cue cards as you play.'}
            </p>

            <div className="space-y-4 text-left">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: PURPLE.accent }}>
                  {lang === 'es' ? 'Tu rol' : 'Your role'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {ROLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedRole(opt.value)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                      style={{
                        backgroundColor: selectedRole === opt.value ? PURPLE.accent : 'rgba(255,255,255,0.08)',
                        color: selectedRole === opt.value ? '#fff' : 'rgba(255,255,255,0.7)',
                        border: `1px solid ${selectedRole === opt.value ? PURPLE.accent : 'rgba(255,255,255,0.15)'}`,
                      }}
                    >
                      {opt[lang]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: PURPLE.accent }}>
                  {lang === 'es' ? 'Tu nivel de grado' : 'Your grade band'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {GRADE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedGrade(opt.value)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                      style={{
                        backgroundColor: selectedGrade === opt.value ? PURPLE.accent : 'rgba(255,255,255,0.08)',
                        color: selectedGrade === opt.value ? '#fff' : 'rgba(255,255,255,0.7)',
                        border: `1px solid ${selectedGrade === opt.value ? PURPLE.accent : 'rgba(255,255,255,0.15)'}`,
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
            style={{ backgroundColor: PURPLE.accent, color: '#fff', ['--glow-color' as string]: PURPLE.accent + '40' }}
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
              <div
                key={i}
                className="w-3 h-3 rounded-full transition-all duration-300"
                style={{ backgroundColor: i <= current ? PURPLE.accent : 'rgba(255,255,255,0.15)' }}
              />
            ))}
          </div>
          <p className="text-center text-sm mb-2" style={{ color: '#8899aa' }}>
            {lang === 'es' ? `Escenario ${current + 1} de ${SCENARIO_COUNT}` : `Scenario ${current + 1} of ${SCENARIO_COUNT}`}
          </p>

          {/* Cue category badge */}
          <div className="flex justify-center mb-4">
            <span
              className="text-xs px-3 py-1 rounded-full font-semibold"
              style={{
                backgroundColor: CUE_LABELS[scenario!.cueCategory].color + '20',
                color: CUE_LABELS[scenario!.cueCategory].color,
                border: `1px solid ${CUE_LABELS[scenario!.cueCategory].color}40`,
              }}
            >
              {CUE_LABELS[scenario!.cueCategory][lang]}
            </span>
          </div>

          {/* OBSERVE PHASE */}
          {phase === 'observe' && (
            <div>
              {/* Setting */}
              <p className="text-sm mb-3 italic" style={{ color: PURPLE.accent }}>{data.setting}</p>

              {/* Timer */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Eye size={16} style={{ color: PURPLE.accent }} />
                  <span className="text-sm font-semibold" style={{ color: PURPLE.accent }}>
                    {lang === 'es' ? 'Lee la escena' : 'Read the scene'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: timeLeft <= 3 ? '#E74C3C' : PURPLE.accent }}>
                    {timeLeft}s
                  </span>
                  <button
                    onClick={handleSkipTimer}
                    className="text-xs px-2 py-1 rounded"
                    style={{ color: 'rgba(255,255,255,0.5)', backgroundColor: 'rgba(255,255,255,0.05)' }}
                  >
                    {lang === 'es' ? 'Listo' : 'Ready'}
                  </button>
                </div>
              </div>

              {/* Timer bar */}
              <div className="w-full h-1.5 rounded-full mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <div
                  className="h-1.5 rounded-full transition-all duration-1000"
                  style={{
                    width: `${(timeLeft / OBSERVATION_TIME) * 100}%`,
                    backgroundColor: timeLeft <= 3 ? '#E74C3C' : PURPLE.accent,
                  }}
                />
              </div>

              {/* Scene */}
              {sceneVisible && (
                <div
                  className="rounded-xl p-5"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <p className="text-white text-base leading-relaxed">{data.scene}</p>
                </div>
              )}
            </div>
          )}

          {/* IDENTIFY PHASE */}
          {phase === 'identify' && (
            <div>
              <p className="text-sm mb-1 italic" style={{ color: PURPLE.accent }}>{data.setting}</p>

              <div className="flex items-center gap-2 mb-4">
                <EyeOff size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {lang === 'es' ? 'La escena se ha ido. Que notaste?' : 'The scene is gone. What did you notice?'}
                </span>
              </div>

              <p className="text-white font-semibold mb-3">
                {lang === 'es' ? 'Selecciona las 2 observaciones MAS importantes:' : 'Select the 2 MOST important observations:'}
              </p>

              <div className="flex flex-col gap-3 mb-4">
                {data.observations.map((obs, idx) => {
                  const isSelected = selectedObs.has(idx);
                  const isRevealed = obsRevealed;
                  const isKey = obs.isKey;

                  let bg = 'rgba(255,255,255,0.06)';
                  let border = 'rgba(255,255,255,0.15)';

                  if (isRevealed) {
                    if (isKey && isSelected) { bg = 'rgba(39,174,96,0.2)'; border = '#27AE60'; }
                    else if (isKey && !isSelected) { bg = 'rgba(245,158,11,0.15)'; border = '#F59E0B'; }
                    else if (!isKey && isSelected) { bg = 'rgba(231,76,60,0.15)'; border = '#E74C3C'; }
                  } else if (isSelected) {
                    bg = PURPLE.bg; border = PURPLE.accent;
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleToggleObs(idx)}
                      disabled={obsRevealed || (!isSelected && selectedObs.size >= 2)}
                      className="text-left rounded-xl p-4 transition-all"
                      style={{ backgroundColor: bg, border: `1px solid ${border}`, opacity: (!obsRevealed && !isSelected && selectedObs.size >= 2) ? 0.4 : 1 }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{
                            backgroundColor: isSelected ? (isRevealed ? (isKey ? '#27AE60' : '#E74C3C') : PURPLE.accent) : 'rgba(255,255,255,0.1)',
                            border: `1px solid ${isSelected ? 'transparent' : 'rgba(255,255,255,0.2)'}`,
                          }}
                        >
                          {isSelected && <Check size={12} color="#fff" />}
                        </div>
                        <div>
                          <p className="text-white text-sm leading-relaxed">{obs.text}</p>
                          {isRevealed && (
                            <p className="text-xs mt-2 leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                              {obs.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {!obsRevealed ? (
                <button
                  onClick={handleRevealObs}
                  disabled={selectedObs.size === 0}
                  className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
                  style={{
                    backgroundColor: selectedObs.size > 0 ? PURPLE.accent : 'rgba(255,255,255,0.1)',
                    color: selectedObs.size > 0 ? '#fff' : 'rgba(255,255,255,0.3)',
                  }}
                >
                  {lang === 'es' ? 'Revelar' : 'Reveal'}
                </button>
              ) : (
                <button
                  onClick={handleGoToRespond}
                  className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
                  style={{ backgroundColor: PURPLE.accent, color: '#fff' }}
                >
                  {lang === 'es' ? 'Ahora, que haces?' : 'Now, what do you do?'} <ArrowRight size={16} className="inline ml-1" />
                </button>
              )}
            </div>
          )}

          {/* RESPOND PHASE */}
          {phase === 'respond' && (
            <div>
              <p className="text-sm mb-1 italic" style={{ color: PURPLE.accent }}>{data.setting}</p>
              <p className="text-white font-semibold mb-4">
                {lang === 'es' ? 'Que haces?' : 'What do you do?'}
              </p>
              <div className="flex flex-col gap-3 mb-4">
                {data.responses.map((resp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectResponse(idx)}
                    className="text-left rounded-xl p-4 transition-all hover:scale-[1.01]"
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)' }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold"
                        style={{ backgroundColor: PURPLE.bg, color: PURPLE.accent, border: `1px solid ${PURPLE.border}` }}
                      >
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <p className="text-white text-sm leading-relaxed">{resp.text}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* REVEAL PHASE */}
          {phase === 'reveal' && selectedResponse !== null && (
            <div className="animate-fade-in">
              <p className="text-sm mb-3 italic" style={{ color: PURPLE.accent }}>{data.setting}</p>

              {/* Selected response with color */}
              <div
                className="rounded-xl p-4 mb-4"
                style={{
                  backgroundColor: data.responses[selectedResponse].quality === 'strong'
                    ? 'rgba(39,174,96,0.15)' : data.responses[selectedResponse].quality === 'okay'
                    ? 'rgba(245,158,11,0.15)' : 'rgba(231,76,60,0.15)',
                  border: `1px solid ${data.responses[selectedResponse].quality === 'strong'
                    ? 'rgba(39,174,96,0.4)' : data.responses[selectedResponse].quality === 'okay'
                    ? 'rgba(245,158,11,0.4)' : 'rgba(231,76,60,0.4)'}`,
                }}
              >
                <p className="text-white text-sm leading-relaxed">{data.responses[selectedResponse].text}</p>
                <p className="text-xs mt-2 leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {data.responses[selectedResponse].why}
                </p>
              </div>

              {/* Expert Eye */}
              <div
                className="rounded-xl p-4 mb-4"
                style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: PURPLE.accent }}>
                  {lang === 'es' ? 'Ojo Experto' : 'Expert Eye'}
                </p>
                <p className="text-white text-sm leading-relaxed">{data.expertEye}</p>
              </div>

              {/* Research */}
              <div
                className="rounded-xl p-4 mb-4"
                style={{ backgroundColor: 'rgba(147,51,234,0.08)', borderLeft: `3px solid ${PURPLE.accent}` }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: PURPLE.accent }}>
                  {lang === 'es' ? 'La investigacion' : 'The research'}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>{data.research}</p>
              </div>

              {/* Missed cue stat */}
              <p className="text-center text-xs mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {data.missedCueStat}
              </p>

              {/* Next */}
              <button
                onClick={handleNext}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.01]"
                style={{ backgroundColor: PURPLE.accent, color: '#fff' }}
              >
                {isLast
                  ? (lang === 'es' ? 'Ver resultados' : 'See Results')
                  : (lang === 'es' ? 'Siguiente escenario' : 'Next Scenario')}
                <ArrowRight size={16} className="inline ml-1" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── RESULTS ───────────────────────────────────────────────────── */}
      {screen === 'results' && (
        <div className="animate-fade-in">
          {score >= SCENARIO_COUNT * 0.7 && <ConfettiBurst colors={[PURPLE.accent, '#27AE60', '#F1C40F']} />}

          <div className="text-center mb-6">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: PURPLE.bg, border: `3px solid ${PURPLE.accent}` }}
            >
              <span className="text-3xl font-black" style={{ color: PURPLE.accent }}>
                {score}/{SCENARIO_COUNT}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {lang === 'es' ? 'Tus Tarjetas de Senales' : 'Your Cue Cards'}
            </h2>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {score >= SCENARIO_COUNT * 0.7
                ? (lang === 'es' ? 'Tienes ojo de educador experimentado. Ves lo que otros pierden.' : 'You have an experienced educator\'s eye. You see what others miss.')
                : score >= SCENARIO_COUNT * 0.4
                ? (lang === 'es' ? 'Buenos instintos. Tus puntos ciegos te muestran donde crecer.' : 'Good instincts. Your blind spots show you where to grow.')
                : (lang === 'es' ? 'Cada senal perdida es una oportunidad de aprendizaje. Juega de nuevo para agudizar tu lectura.' : 'Every missed cue is a learning opportunity. Play again to sharpen your read.')}
            </p>
          </div>

          {/* Cue card collection */}
          <div
            className="rounded-xl p-5 mb-6"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: PURPLE.accent }}>
              {lang === 'es' ? 'Tarjetas Coleccionadas' : 'Cards Collected'}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(cueCards).map(([cat, result]) => {
                const label = CUE_LABELS[cat as CueCategory];
                return (
                  <div
                    key={cat}
                    className="rounded-lg p-3"
                    style={{ backgroundColor: label.color + '15', border: `1px solid ${label.color}30` }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: label.color }} />
                      <span className="text-xs font-semibold" style={{ color: label.color }}>{label[lang]}</span>
                    </div>
                    <p className="text-white text-sm">
                      {result.found}/{result.total} {lang === 'es' ? 'detectadas' : 'spotted'}
                    </p>
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
              style={{ backgroundColor: PURPLE.accent, color: '#fff' }}
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

          <CommunityNudge gameSlug="read-the-room" score={score} totalRounds={SCENARIO_COUNT} />
        </div>
      )}
    </GameWrapper>
  );
}
