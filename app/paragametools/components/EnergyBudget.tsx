'use client';

import { useState, useMemo } from 'react';
import { ChevronRight, Minus, Plus, Zap } from 'lucide-react';
import { COLORS, shuffle } from '../data/gameConfig';
import { useLanguage } from '../context/LanguageContext';
import { ENERGY_ROUNDS, ENERGY_ROUND_COUNT, TOTAL_ENERGY } from '../data/energyBudgetData';
import { GameWrapper, IntroScreen } from './GameWrapper';
import { ConfettiBurst } from './ConfettiBurst';
import { useGameTracking } from '@/lib/hub/useGameTracking';
import { useGameBadgeCheck } from '@/components/hub/useGameBadgeCheck';
import { CommunityNudge } from './CommunityNudge';

type Screen = 'intro' | 'allocate' | 'reveal' | 'results';

interface EnergyBudgetProps {
  onBack: () => void;
}

export function EnergyBudget({ onBack }: EnergyBudgetProps) {
  const { language } = useLanguage();
  const { logCompletion, startSession, logGameResponse, completeSession } = useGameTracking();
  const lang = language === 'es' ? 'es' : 'en';

  const roundsWithIds = useMemo(() => {
    const indexed = ENERGY_ROUNDS.map((r, i) => ({ ...r, _origIndex: i }));
    return shuffle(indexed).slice(0, ENERGY_ROUND_COUNT);
  }, []);

  const [screen, setScreen] = useState<Screen>('intro');
  const [current, setCurrent] = useState(0);
  const [allocations, setAllocations] = useState<number[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [roundScore, setRoundScore] = useState(0);

  const round = roundsWithIds[current];
  const isLast = current === roundsWithIds.length - 1;
  const remaining = TOTAL_ENERGY - allocations.reduce((sum, v) => sum + v, 0);

  const initRound = () => {
    // Start with equal distribution
    const taskCount = round.tasks.length;
    const base = Math.floor(TOTAL_ENERGY / taskCount);
    const remainder = TOTAL_ENERGY - (base * taskCount);
    const initial = round.tasks.map((_, i) => i === 0 ? base + remainder : base);
    setAllocations(initial);
  };

  const adjustAllocation = (idx: number, delta: number) => {
    const newAllocations = [...allocations];
    const newVal = newAllocations[idx] + delta;
    if (newVal < 0 || newVal > TOTAL_ENERGY) return;

    // Check if we have points to give (or are taking away)
    if (delta > 0 && remaining < delta) return;

    newAllocations[idx] = newVal;
    setAllocations(newAllocations);
  };

  const handleSubmit = () => {
    // Score: how close to expert allocation (lower diff = better)
    let totalDiff = 0;
    allocations.forEach((val, i) => {
      totalDiff += Math.abs(val - round.tasks[i].expertAllocation);
    });
    // Convert to 0-100 score (max diff would be 200 for 5 tasks)
    const maxDiff = TOTAL_ENERGY * 2;
    const score = Math.round(Math.max(0, (1 - totalDiff / maxDiff) * 100));
    setRoundScore(score);
    setTotalScore((s) => s + score);
    setScreen('reveal');

    logGameResponse('energy-budget', {
      itemId: `energybudget_${round._origIndex}`,
      roundNumber: current + 1,
      userAnswer: allocations.join(','),
      correctAnswer: round.tasks.map(t => t.expertAllocation).join(','),
      isCorrect: score >= 70,
    });
  };

  const handleNext = async () => {
    if (isLast) {
      setScreen('results');
      logCompletion({ tool: 'energy-budget', score: totalScore, totalRounds: roundsWithIds.length });
      await completeSession(totalScore, 0);
    } else {
      setCurrent((c) => c + 1);
      setScreen('allocate');
      setTimeout(() => {
        const taskCount = roundsWithIds[current + 1].tasks.length;
        const base = Math.floor(TOTAL_ENERGY / taskCount);
        const rem = TOTAL_ENERGY - (base * taskCount);
        setAllocations(roundsWithIds[current + 1].tasks.map((_, i) => i === 0 ? base + rem : base));
      }, 0);
    }
  };

  const handlePlayAgain = async () => {
    setCurrent(0);
    setTotalScore(0);
    setRoundScore(0);
    setScreen('intro');
    await startSession('energy-budget', roundsWithIds.length, { language });
  };

  const colorConfig = COLORS.teal;
  const confettiColors = ['#22b8bd', '#14b8a6', '#5eead4', '#99f6e4', '#FFFFFF'];
  const badgeCelebration = useGameBadgeCheck(screen === 'results');

  // ── Intro ──
  if (screen === 'intro') {
    return (
      <GameWrapper gameId="energybudget" title={lang === 'es' ? 'Presupuesto de Energia' : 'Energy Budget'} color="teal" onBack={onBack}>
        <IntroScreen
          gameId="energybudget"
          title={lang === 'es' ? 'Presupuesto de Energia' : 'Energy Budget'}
          color="teal"
          rules={lang === 'es'
            ? [
                `Tienes ${TOTAL_ENERGY} puntos de energia`,
                'Distribuyelos entre las tareas del dia',
                'Compara con lo que harian educadores expertos',
                `${ENERGY_ROUND_COUNT} escenarios reales`,
              ]
            : [
                `You have ${TOTAL_ENERGY} energy points`,
                'Distribute them across your day\'s tasks',
                'See how experienced educators would allocate',
                `${ENERGY_ROUND_COUNT} real scenarios`,
              ]
          }
          onStart={() => { setScreen('allocate'); initRound(); startSession('energy-budget', roundsWithIds.length, { language }); }}
        />
      </GameWrapper>
    );
  }

  // ── Results ──
  if (screen === 'results') {
    const avgScore = Math.round(totalScore / roundsWithIds.length);
    const title = avgScore >= 80 ? (lang === 'es' ? 'Maestro del equilibrio' : 'Balance Master')
      : avgScore >= 60 ? (lang === 'es' ? 'Buen equilibrio' : 'Good Balance')
      : (lang === 'es' ? 'Sigue ajustando' : 'Keep Adjusting');

    const message = avgScore >= 80
      ? (lang === 'es' ? 'Tu instinto para distribuir energia es impresionante. Sabes que merece tu atencion.' : 'Your instinct for where to put your energy is impressive. You know what deserves your attention and what can wait.')
      : avgScore >= 60
      ? (lang === 'es' ? 'Estas cerca. Las areas donde difiriste son exactamente las que vale la pena reflexionar.' : 'You are close. The areas where you differed from the experts are exactly the ones worth reflecting on.')
      : (lang === 'es' ? 'La distribucion de energia es una de las habilidades mas dificiles en la educacion. Cada ronda te hace mas intencional.' : 'Energy distribution is one of the hardest skills in education. Every round makes you more intentional about where you spend yourself.');

    return (
      <GameWrapper gameId="energybudget" title={lang === 'es' ? 'Presupuesto de Energia' : 'Energy Budget'} color="teal" onBack={onBack}>
        {badgeCelebration}
        {avgScore >= 70 && <ConfettiBurst colors={confettiColors} particleCount={60} />}
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
          <div className="w-28 h-28 rounded-full flex items-center justify-center mb-6"
            style={{ border: `4px solid ${colorConfig.accent}`, background: colorConfig.bg }}>
            <span className="text-3xl font-black text-white">{avgScore}%</span>
          </div>
          <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: colorConfig.accent }}>
            {lang === 'es' ? 'Promedio de alineacion' : 'Average alignment'}
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-3">{title}</h2>
          <p className="text-sm md:text-base text-white/70 max-w-md mb-8" style={{ lineHeight: 1.6 }}>{message}</p>
          <div className="flex gap-3">
            <button onClick={handlePlayAgain} className="px-5 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-80" style={{ background: colorConfig.accent, color: '#0f1a2e' }}>
              {lang === 'es' ? 'Jugar de nuevo' : 'Play Again'}
            </button>
            <button onClick={onBack} className="px-5 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-80" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
              {lang === 'es' ? 'Volver' : 'Back to Quick Wins'}
            </button>
          </div>
          <CommunityNudge gameSlug="energy-budget" score={totalScore} totalRounds={roundsWithIds.length} />
        </div>
      </GameWrapper>
    );
  }

  // ── Allocate ──
  if (screen === 'allocate') {
    return (
      <GameWrapper gameId="energybudget" title={lang === 'es' ? 'Presupuesto de Energia' : 'Energy Budget'} color="teal" onBack={onBack}>
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Progress */}
          <div className="flex justify-center gap-2 mb-6">
            {roundsWithIds.map((_, i) => (
              <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: i === current ? colorConfig.accent : i < current ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)' }} />
            ))}
          </div>

          {/* Situation */}
          <div className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-base text-white leading-relaxed" style={{ fontFamily: "'Source Serif 4', serif" }}>
              {round[lang].situation}
            </p>
          </div>

          {/* Energy remaining */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <Zap size={18} style={{ color: remaining > 0 ? colorConfig.accent : '#E74C3C' }} />
            <span className="text-lg font-black" style={{ color: remaining > 0 ? colorConfig.accent : '#E74C3C' }}>
              {remaining}
            </span>
            <span className="text-sm text-white/50">
              {lang === 'es' ? 'puntos restantes' : 'points remaining'}
            </span>
          </div>

          {/* Task sliders */}
          <div className="space-y-4 mb-6">
            {round.tasks.map((task, idx) => (
              <div key={idx} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-sm text-white/90 mb-3">{task[lang]}</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => adjustAllocation(idx, -5)}
                    disabled={allocations[idx] <= 0}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-opacity"
                    style={{ background: 'rgba(255,255,255,0.1)', opacity: allocations[idx] <= 0 ? 0.3 : 1 }}
                  >
                    <Minus size={14} style={{ color: 'white' }} />
                  </button>

                  {/* Visual bar */}
                  <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-200"
                      style={{
                        width: `${allocations[idx]}%`,
                        background: `linear-gradient(90deg, ${colorConfig.accent}, ${colorConfig.accent}99)`,
                      }}
                    />
                  </div>

                  <button
                    onClick={() => adjustAllocation(idx, 5)}
                    disabled={remaining <= 0}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-opacity"
                    style={{ background: 'rgba(255,255,255,0.1)', opacity: remaining <= 0 ? 0.3 : 1 }}
                  >
                    <Plus size={14} style={{ color: 'white' }} />
                  </button>

                  <span className="w-10 text-right text-sm font-bold" style={{ color: colorConfig.accent }}>
                    {allocations[idx]}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={remaining !== 0}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-80"
              style={{
                background: remaining === 0 ? colorConfig.accent : 'rgba(255,255,255,0.1)',
                color: remaining === 0 ? '#0f1a2e' : 'rgba(255,255,255,0.3)',
                cursor: remaining === 0 ? 'pointer' : 'not-allowed',
              }}
            >
              {remaining === 0
                ? (lang === 'es' ? 'Confirmar distribucion' : 'Lock In My Budget')
                : (lang === 'es' ? `Distribuye los ${remaining} puntos restantes` : `Allocate remaining ${remaining} points`)
              }
              {remaining === 0 && <Zap size={16} />}
            </button>
          </div>
        </div>
      </GameWrapper>
    );
  }

  // ── Reveal ──
  return (
    <GameWrapper gameId="energybudget" title={lang === 'es' ? 'Presupuesto de Energia' : 'Energy Budget'} color="teal" onBack={onBack}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Round score */}
        <div className="text-center mb-6">
          <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: colorConfig.accent }}>
            {lang === 'es' ? 'Alineacion con expertos' : 'Expert alignment'}
          </p>
          <p className="text-2xl font-black text-white">{roundScore}%</p>
        </div>

        {/* Comparison */}
        <div className="space-y-3 mb-6">
          {round.tasks.map((task, idx) => {
            const diff = Math.abs(allocations[idx] - task.expertAllocation);
            const isClose = diff <= 5;
            return (
              <div key={idx} className="rounded-xl p-4" style={{ background: isClose ? 'rgba(39,174,96,0.1)' : 'rgba(255,255,255,0.06)', border: `1px solid ${isClose ? 'rgba(39,174,96,0.3)' : 'rgba(255,255,255,0.1)'}` }}>
                <p className="text-sm text-white/90 font-medium mb-3">{task[lang]}</p>

                {/* Comparison bars */}
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] w-12 text-right" style={{ color: 'rgba(255,255,255,0.4)' }}>{lang === 'es' ? 'Tu' : 'You'}</span>
                    <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <div className="h-full rounded-full" style={{ width: `${allocations[idx]}%`, background: colorConfig.accent }} />
                    </div>
                    <span className="w-8 text-right text-xs font-bold" style={{ color: colorConfig.accent }}>{allocations[idx]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] w-12 text-right" style={{ color: 'rgba(255,255,255,0.4)' }}>{lang === 'es' ? 'Exp.' : 'Exp.'}</span>
                    <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <div className="h-full rounded-full" style={{ width: `${task.expertAllocation}%`, background: '#F1C40F' }} />
                    </div>
                    <span className="w-8 text-right text-xs font-bold" style={{ color: '#F1C40F' }}>{task.expertAllocation}</span>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed">{task.explanation[lang]}</p>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center">
          <button onClick={handleNext} className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-80" style={{ background: colorConfig.accent, color: '#0f1a2e' }}>
            {isLast ? (lang === 'es' ? 'Ver resultados' : 'See Results') : (lang === 'es' ? 'Siguiente ronda' : 'Next Round')}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </GameWrapper>
  );
}
