'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, MessageCircle, PenLine } from 'lucide-react';
import { COLORS } from '../data/gameConfig';
import { useLanguage } from '../context/LanguageContext';
import {
  SCENARIOS,
  SCENARIO_COUNT,
  FRAMEWORK_LABELS,
  RESPONSE_LEVEL_LABELS,
  type Scenario,
  type Role,
  type GradeBand,
  type Experience,
  type FrameworkTag,
  type ResponseLevel,
} from '../data/whatWouldYouSay';
import { GameWrapper } from './GameWrapper';
import { ConfettiBurst } from './ConfettiBurst';
import { useGameTracking } from '@/lib/hub/useGameTracking';
import { useGameBadgeCheck } from '@/components/hub/useGameBadgeCheck';
import { CommunityNudge } from './CommunityNudge';

type Screen = 'setup' | 'play' | 'results';
type Phase = 'quote' | 'write' | 'options' | 'reveal';

const AMBER = COLORS.amber;

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

const EXP_OPTIONS: { value: Experience; en: string; es: string }[] = [
  { value: 'first_year', en: 'First year', es: 'Primer ano' },
  { value: '2-5', en: '2-5 years', es: '2-5 anos' },
  { value: '6-15', en: '6-15 years', es: '6-15 anos' },
  { value: '16+', en: '16+ years', es: '16+ anos' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function WhatWouldYouSay({ onBack }: { onBack: () => void }) {
  const { language } = useLanguage();
  const lang = language === 'es' ? 'es' : 'en';
  const { logCompletion, startSession, logGameResponse, completeSession } = useGameTracking();

  const [screen, setScreen] = useState<Screen>('setup');
  const [selectedRole, setSelectedRole] = useState<Role>('teacher');
  const [selectedGrade, setSelectedGrade] = useState<GradeBand>('3-5');
  const [selectedExp, setSelectedExp] = useState<Experience>('2-5');

  const [gameScenarios, setGameScenarios] = useState<Scenario[]>([]);
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState<Phase>('quote');
  const [userResponse, setUserResponse] = useState('');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [frameworkTally, setFrameworkTally] = useState<Record<FrameworkTag, number>>({
    nvc: 0,
    crucial_conversations: 0,
    coaching_stance: 0,
    restorative: 0,
  });
  const [levelTally, setLevelTally] = useState<Record<ResponseLevel, number>>({
    reactive: 0,
    measured: 0,
    reflective: 0,
  });

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
    setPhase('quote');
    setUserResponse('');
    setSelectedOption(null);
    setScore(0);
    setFrameworkTally({ nvc: 0, crucial_conversations: 0, coaching_stance: 0, restorative: 0 });
    setLevelTally({ reactive: 0, measured: 0, reflective: 0 });
    setScreen('play');
    await startSession('what-would-you-say', SCENARIO_COUNT, { language, role: selectedRole, gradeBand: selectedGrade });
  };

  const handleWriteDone = () => setPhase('options');

  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    setPhase('reveal');

    const option = data!.options[idx];
    const isReflective = option.level === 'reflective';
    if (isReflective) setScore((s) => s + 1);

    setFrameworkTally((prev) => ({
      ...prev,
      [option.framework]: prev[option.framework] + 1,
    }));
    setLevelTally((prev) => ({
      ...prev,
      [option.level]: prev[option.level] + 1,
    }));

    logGameResponse('what-would-you-say', {
      itemId: scenario!.id,
      roundNumber: current + 1,
      userAnswer: option.level,
      correctAnswer: 'reflective',
      isCorrect: isReflective,
    });
  };

  const handleNext = async () => {
    if (isLast) {
      setScreen('results');
      logCompletion({ tool: 'what-would-you-say', score, totalRounds: SCENARIO_COUNT });
      await completeSession(score, 0);
    } else {
      setCurrent((c) => c + 1);
      setPhase('quote');
      setUserResponse('');
      setSelectedOption(null);
    }
  };

  const handlePlayAgain = () => setScreen('setup');
  const gameTitle = lang === 'es' ? 'Que Dirias Tu?' : 'What Would You Say?';
  const badgeCelebration = useGameBadgeCheck(screen === 'results');

  // Determine which spectrum level the user's typed response would fall on
  const getUserResponseLevel = (): ResponseLevel | null => {
    if (!userResponse.trim()) return null;
    const words = wordCount(userResponse);
    if (words <= 5) return 'reactive';
    if (words <= 15) return 'measured';
    return 'reflective';
  };

  return (
    <GameWrapper gameId="whatwouldyousay" title={gameTitle} color="amber" onBack={onBack}>
      {badgeCelebration}

      {/* SETUP */}
      {screen === 'setup' && (
        <div className="flex flex-col items-center text-center animate-fade-in">
          <div
            className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: AMBER.bg, border: `2px solid ${AMBER.accent}` }}
          >
            <MessageCircle size={36} style={{ color: AMBER.accent }} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{gameTitle}</h2>
          <p className="text-lg mb-6" style={{ color: AMBER.accent }}>
            {lang === 'es' ? 'Pausa antes de responder. Esa pausa lo cambia todo.' : 'Pause before you respond. That pause changes everything.'}
          </p>

          <div
            className="w-full max-w-lg rounded-xl p-6 mb-6"
            style={{ backgroundColor: AMBER.bg, border: `1px solid ${AMBER.border}` }}
          >
            <p className="text-white text-base leading-relaxed mb-5">
              {lang === 'es'
                ? 'Aparece una cita. Algo que un estudiante dijo, un padre escribio, un colega susurro o un admin anuncio. Tu escribes TU respuesta primero. Luego ves 3 opciones en un espectro de reactivo a reflexivo. Cada una etiquetada con un marco de comunicacion. Construye el musculo de pausar antes de responder.'
                : 'A quote appears. Something a student said, a parent emailed, a colleague whispered, or an admin announced. You type YOUR response first. Then see 3 options ranging from reactive to reflective. Each tagged with a communication framework. Build the pause before responding muscle.'}
            </p>

            <div className="space-y-4 text-left">
              {/* Role */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: AMBER.accent }}>
                  {lang === 'es' ? 'Tu rol' : 'Your role'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {ROLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedRole(opt.value)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                      style={{
                        backgroundColor: selectedRole === opt.value ? AMBER.accent : 'rgba(255,255,255,0.08)',
                        color: selectedRole === opt.value ? '#000' : 'rgba(255,255,255,0.7)',
                        border: `1px solid ${selectedRole === opt.value ? AMBER.accent : 'rgba(255,255,255,0.15)'}`,
                      }}
                    >
                      {opt[lang]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grade Band */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: AMBER.accent }}>
                  {lang === 'es' ? 'Tu nivel de grado' : 'Your grade band'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {GRADE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedGrade(opt.value)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                      style={{
                        backgroundColor: selectedGrade === opt.value ? AMBER.accent : 'rgba(255,255,255,0.08)',
                        color: selectedGrade === opt.value ? '#000' : 'rgba(255,255,255,0.7)',
                        border: `1px solid ${selectedGrade === opt.value ? AMBER.accent : 'rgba(255,255,255,0.15)'}`,
                      }}
                    >
                      {opt[lang]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: AMBER.accent }}>
                  {lang === 'es' ? 'Tu experiencia' : 'Your experience'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {EXP_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedExp(opt.value)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                      style={{
                        backgroundColor: selectedExp === opt.value ? AMBER.accent : 'rgba(255,255,255,0.08)',
                        color: selectedExp === opt.value ? '#000' : 'rgba(255,255,255,0.7)',
                        border: `1px solid ${selectedExp === opt.value ? AMBER.accent : 'rgba(255,255,255,0.15)'}`,
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
            style={{ backgroundColor: AMBER.accent, color: '#000', ['--glow-color' as string]: AMBER.accent + '40' }}
          >
            {lang === 'es' ? 'Comenzar' : 'Start'} <ArrowRight size={20} className="inline ml-1" />
          </button>
        </div>
      )}

      {/* PLAY */}
      {screen === 'play' && data && (
        <div className="animate-fade-in">
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {Array.from({ length: SCENARIO_COUNT }).map((_, i) => (
              <div key={i} className="w-3 h-3 rounded-full transition-all duration-300" style={{ backgroundColor: i <= current ? AMBER.accent : 'rgba(255,255,255,0.15)' }} />
            ))}
          </div>
          <p className="text-center text-sm mb-4" style={{ color: '#8899aa' }}>
            {lang === 'es' ? `Escenario ${current + 1} de ${SCENARIO_COUNT}` : `Scenario ${current + 1} of ${SCENARIO_COUNT}`}
          </p>

          {/* QUOTE PHASE */}
          {phase === 'quote' && (
            <div>
              <div className="rounded-xl p-5 mb-4" style={{ backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#8899aa' }}>
                  {data.source}
                </p>
                <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {data.context}
                </p>
                <div className="border-l-4 pl-4 py-2" style={{ borderColor: AMBER.accent }}>
                  <p className="text-xl md:text-2xl font-bold text-white italic">
                    &ldquo;{data.quote}&rdquo;
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPhase('write')}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.01]"
                style={{ backgroundColor: AMBER.accent, color: '#000' }}
              >
                {lang === 'es' ? 'Que dirias tu?' : 'What would you say?'} <PenLine size={16} className="inline ml-1" />
              </button>
            </div>
          )}

          {/* WRITE PHASE */}
          {phase === 'write' && (
            <div>
              <div className="rounded-xl p-5 mb-4" style={{ backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <div className="border-l-4 pl-4 py-1 mb-3" style={{ borderColor: AMBER.accent }}>
                  <p className="text-lg font-bold text-white italic">
                    &ldquo;{data.quote}&rdquo;
                  </p>
                </div>
                <p className="text-xs" style={{ color: '#8899aa' }}>{data.source}</p>
              </div>

              <div className="mb-3">
                <textarea
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  placeholder={lang === 'es' ? 'Escribe tu respuesta aqui...' : 'Type your response here...'}
                  className="w-full rounded-xl p-4 text-white text-base leading-relaxed resize-none focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    minHeight: '120px',
                  }}
                  autoFocus
                />
              </div>

              {/* Word count display */}
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: '#8899aa' }}>
                    {lang === 'es' ? 'Palabras' : 'Words'}: <span className="font-bold" style={{ color: wordCount(userResponse) <= scenario!.wordCountTarget ? '#27AE60' : AMBER.accent }}>{wordCount(userResponse)}</span>
                  </span>
                </div>
                <span className="text-xs" style={{ color: '#8899aa' }}>
                  {lang === 'es' ? 'Objetivo' : 'Target'}: {scenario!.wordCountTarget} {lang === 'es' ? 'palabras' : 'words'}
                </span>
              </div>

              <button
                onClick={handleWriteDone}
                disabled={!userResponse.trim()}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.01] disabled:opacity-40 disabled:hover:scale-100"
                style={{ backgroundColor: AMBER.accent, color: '#000' }}
              >
                {lang === 'es' ? 'Ver las opciones' : 'See the options'} <ArrowRight size={16} className="inline ml-1" />
              </button>
            </div>
          )}

          {/* OPTIONS PHASE */}
          {phase === 'options' && (
            <div>
              <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: AMBER.accent }}>
                  {lang === 'es' ? 'Tu respondiste' : 'You said'}
                </p>
                <p className="text-white text-sm italic">&ldquo;{userResponse}&rdquo;</p>
                <p className="text-xs mt-1" style={{ color: '#8899aa' }}>{wordCount(userResponse)} {lang === 'es' ? 'palabras' : 'words'}</p>
              </div>

              {/* Spectrum label */}
              <div className="flex items-center justify-between mb-3 px-2">
                <span className="text-xs font-semibold" style={{ color: RESPONSE_LEVEL_LABELS.reactive.color }}>
                  {RESPONSE_LEVEL_LABELS.reactive[lang]}
                </span>
                <div className="flex-1 mx-3 h-1 rounded-full" style={{ background: 'linear-gradient(to right, #E74C3C, #F59E0B, #27AE60)' }} />
                <span className="text-xs font-semibold" style={{ color: RESPONSE_LEVEL_LABELS.reflective.color }}>
                  {RESPONSE_LEVEL_LABELS.reflective[lang]}
                </span>
              </div>

              <p className="text-white font-semibold mb-3 text-sm">
                {lang === 'es' ? 'Cual elegiras?' : 'Which would you choose?'}
              </p>

              <div className="flex flex-col gap-3">
                {data.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className="text-left rounded-xl p-4 transition-all hover:scale-[1.01]"
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)' }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold"
                        style={{ backgroundColor: AMBER.bg, color: AMBER.accent, border: `1px solid ${AMBER.border}` }}
                      >
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <div>
                        <p className="text-white text-sm leading-relaxed">{option.text}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* REVEAL PHASE */}
          {phase === 'reveal' && selectedOption !== null && (
            <div className="animate-fade-in">
              {/* Selected option with level color */}
              {data.options.map((option, idx) => {
                const levelColor = RESPONSE_LEVEL_LABELS[option.level].color;
                const isSelected = idx === selectedOption;
                return (
                  <div
                    key={idx}
                    className="rounded-xl p-4 mb-3"
                    style={{
                      backgroundColor: isSelected ? `${levelColor}15` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isSelected ? `${levelColor}40` : 'rgba(255,255,255,0.08)'}`,
                      opacity: isSelected ? 1 : 0.7,
                    }}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold"
                        style={{ backgroundColor: `${levelColor}20`, color: levelColor, border: `1px solid ${levelColor}40` }}
                      >
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: `${levelColor}20`, color: levelColor, border: `1px solid ${levelColor}40` }}>
                            {RESPONSE_LEVEL_LABELS[option.level][lang]}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: `${FRAMEWORK_LABELS[option.framework].color}20`, color: FRAMEWORK_LABELS[option.framework].color, border: `1px solid ${FRAMEWORK_LABELS[option.framework].color}40` }}>
                            {FRAMEWORK_LABELS[option.framework][lang]} ({FRAMEWORK_LABELS[option.framework].researcher})
                          </span>
                          {isSelected && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
                              {lang === 'es' ? 'Tu eleccion' : 'Your pick'}
                            </span>
                          )}
                        </div>
                        <p className="text-white text-sm leading-relaxed mb-1">{option.text}</p>
                        {isSelected && (
                          <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>{option.why}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Word count comparison */}
              {userResponse.trim() && (
                <div className="rounded-xl p-4 mb-3" style={{ backgroundColor: 'rgba(245,158,11,0.06)', border: `1px solid ${AMBER.border}` }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: AMBER.accent }}>
                    {lang === 'es' ? 'Tu respuesta' : 'Your response'}
                  </p>
                  <p className="text-white text-sm italic mb-2">&ldquo;{userResponse}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs" style={{ color: '#8899aa' }}>
                      {wordCount(userResponse)} {lang === 'es' ? 'palabras' : 'words'} ({lang === 'es' ? 'objetivo' : 'target'}: {scenario!.wordCountTarget})
                    </span>
                    {wordCount(userResponse) <= scenario!.wordCountTarget && (
                      <span className="text-xs font-semibold" style={{ color: '#27AE60' }}>
                        {lang === 'es' ? 'Conciso' : 'Concise'}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Research */}
              <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: 'rgba(245,158,11,0.06)', borderLeft: `3px solid ${AMBER.accent}` }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: AMBER.accent }}>
                  {lang === 'es' ? 'La investigacion' : 'The research'}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>{data.research}</p>
              </div>

              {/* Next */}
              <button
                onClick={handleNext}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.01]"
                style={{ backgroundColor: AMBER.accent, color: '#000' }}
              >
                {isLast ? (lang === 'es' ? 'Ver resultados' : 'See Results') : (lang === 'es' ? 'Siguiente escenario' : 'Next Scenario')}
                <ArrowRight size={16} className="inline ml-1" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* RESULTS */}
      {screen === 'results' && (
        <div className="animate-fade-in">
          {score >= SCENARIO_COUNT * 0.7 && <ConfettiBurst colors={[AMBER.accent, '#27AE60', '#F1C40F']} />}

          <div className="text-center mb-6">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: AMBER.bg, border: `3px solid ${AMBER.accent}` }}>
              <span className="text-3xl font-black" style={{ color: AMBER.accent }}>{score}/{SCENARIO_COUNT}</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {lang === 'es' ? 'Tu Perfil de Comunicacion' : 'Your Communication Profile'}
            </h2>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {score >= SCENARIO_COUNT * 0.7
                ? (lang === 'es' ? 'Tus instintos de comunicacion son fuertes. Pausas, escuchas y respondes con intencion.' : 'Your communication instincts are strong. You pause, listen, and respond with intention.')
                : score >= SCENARIO_COUNT * 0.4
                ? (lang === 'es' ? 'Tienes buenos instintos. Las areas donde elegiste reaccionar muestran donde puedes crecer.' : 'You have good instincts. The areas where you chose to react show where you can grow.')
                : (lang === 'es' ? 'La pausa antes de responder es un musculo. Cada ronda de practica lo fortalece.' : 'The pause before responding is a muscle. Every round of practice strengthens it.')}
            </p>
          </div>

          {/* Response level breakdown */}
          <div className="rounded-xl p-5 mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: AMBER.accent }}>
              {lang === 'es' ? 'Espectro de Respuestas' : 'Response Spectrum'}
            </p>
            <div className="space-y-3">
              {(['reactive', 'measured', 'reflective'] as ResponseLevel[]).map((level) => {
                const label = RESPONSE_LEVEL_LABELS[level];
                const count = levelTally[level];
                const pct = SCENARIO_COUNT > 0 ? Math.round((count / SCENARIO_COUNT) * 100) : 0;
                return (
                  <div key={level}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white text-sm">{label[lang]}</span>
                      <span className="text-xs font-semibold" style={{ color: label.color }}>{count}/{SCENARIO_COUNT}</span>
                    </div>
                    <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                      <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: label.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Framework breakdown */}
          <div className="rounded-xl p-5 mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: AMBER.accent }}>
              {lang === 'es' ? 'Marcos de Comunicacion' : 'Communication Frameworks'}
            </p>
            <div className="space-y-3">
              {(Object.keys(FRAMEWORK_LABELS) as FrameworkTag[]).map((fw) => {
                const label = FRAMEWORK_LABELS[fw];
                const count = frameworkTally[fw];
                if (count === 0) return null;
                return (
                  <div key={fw} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: label.color }} />
                      <span className="text-white text-sm">{label[lang]}</span>
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>({label.researcher})</span>
                    </div>
                    <span className="text-xs font-semibold" style={{ color: label.color }}>{count}x</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handlePlayAgain}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.01]"
              style={{ backgroundColor: AMBER.accent, color: '#000' }}
            >
              <RotateCcw size={16} /> {lang === 'es' ? 'Jugar de Nuevo' : 'Play Again'}
            </button>
            <button
              onClick={onBack}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}
            >
              <ArrowLeft size={16} /> {lang === 'es' ? 'Volver a Juegos' : 'Back to Games'}
            </button>
          </div>

          <CommunityNudge gameSlug="what-would-you-say" score={score} totalRounds={SCENARIO_COUNT} />
        </div>
      )}
    </GameWrapper>
  );
}
