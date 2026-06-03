'use client';

import { useState, useMemo } from 'react';
import { ChevronRight, ArrowUp, ArrowDown, Check } from 'lucide-react';
import { COLORS, shuffle } from '../data/gameConfig';
import { useLanguage } from '../context/LanguageContext';
import { PRIORITIZE_ROUNDS, PRIORITIZE_ROUND_COUNT } from '../data/prioritizeData';
import { GameWrapper, IntroScreen } from './GameWrapper';
import { ConfettiBurst } from './ConfettiBurst';
import { useGameTracking } from '@/lib/hub/useGameTracking';

type Screen = 'intro' | 'rank' | 'reveal' | 'results';

interface PrioritizeThisProps {
  onBack: () => void;
}

export function PrioritizeThis({ onBack }: PrioritizeThisProps) {
  const { language } = useLanguage();
  const { logCompletion } = useGameTracking();
  const lang = language === 'es' ? 'es' : 'en';

  const rounds = useMemo(() => shuffle(PRIORITIZE_ROUNDS).slice(0, PRIORITIZE_ROUND_COUNT), []);

  const [screen, setScreen] = useState<Screen>('intro');
  const [current, setCurrent] = useState(0);
  const [userOrder, setUserOrder] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [roundScore, setRoundScore] = useState(0);

  const round = rounds[current];
  const isLast = current === rounds.length - 1;

  const initRound = () => {
    // Shuffle task indices for user to reorder
    const indices = round.tasks.map((_, i) => i);
    setUserOrder(shuffle(indices));
  };

  const moveUp = (pos: number) => {
    if (pos === 0) return;
    const newOrder = [...userOrder];
    [newOrder[pos - 1], newOrder[pos]] = [newOrder[pos], newOrder[pos - 1]];
    setUserOrder(newOrder);
  };

  const moveDown = (pos: number) => {
    if (pos === userOrder.length - 1) return;
    const newOrder = [...userOrder];
    [newOrder[pos], newOrder[pos + 1]] = [newOrder[pos + 1], newOrder[pos]];
    setUserOrder(newOrder);
  };

  const handleSubmitRank = () => {
    // Score: count how many tasks are in the correct position
    let correct = 0;
    userOrder.forEach((taskIdx, position) => {
      if (round.tasks[taskIdx].rank === position + 1) correct++;
    });
    setRoundScore(correct);
    setScore((s) => s + correct);
    setScreen('reveal');
  };

  const handleNext = () => {
    if (isLast) {
      setScreen('results');
      logCompletion({ tool: 'prioritize-this', score, totalRounds: rounds.length * 4 });
    } else {
      setCurrent((c) => c + 1);
      setScreen('rank');
      // Init next round after state update
      setTimeout(() => {
        const indices = rounds[current + 1].tasks.map((_, i) => i);
        setUserOrder(shuffle(indices));
      }, 0);
    }
  };

  const handlePlayAgain = () => {
    setCurrent(0);
    setScore(0);
    setRoundScore(0);
    setScreen('intro');
  };

  const colorConfig = COLORS.purple;
  const confettiColors = ['#9333EA', '#A855F7', '#C084FC', '#E9D5FF', '#FFFFFF'];

  // ── Intro ──
  if (screen === 'intro') {
    return (
      <GameWrapper gameId="prioritize" title={lang === 'es' ? 'Prioriza Esto' : 'Prioritize This'} color="purple" onBack={onBack}>
        <IntroScreen
          gameId="prioritize"
          title={lang === 'es' ? 'Prioriza Esto' : 'Prioritize This'}
          color="purple"
          rules={lang === 'es'
            ? [
                'Lee la situacion',
                'Ordena las 4 tareas por prioridad',
                'Mira como lo harian los expertos',
                `${PRIORITIZE_ROUND_COUNT} rondas`,
              ]
            : [
                'Read the situation',
                'Rank the 4 tasks by priority',
                'See how the experts would rank them',
                `${PRIORITIZE_ROUND_COUNT} rounds`,
              ]
          }
          onStart={() => { setScreen('rank'); initRound(); }}
        />
      </GameWrapper>
    );
  }

  // ── Results ──
  if (screen === 'results') {
    const maxScore = rounds.length * 4;
    const pct = Math.round((score / maxScore) * 100);
    const title = pct >= 80 ? (lang === 'es' ? 'Experto en prioridades' : 'Priority Pro')
      : pct >= 50 ? (lang === 'es' ? 'Buen juicio' : 'Good Judgment')
      : (lang === 'es' ? 'Sigue reflexionando' : 'Keep Reflecting');

    const message = pct >= 80
      ? (lang === 'es' ? 'Tu sentido de lo urgente vs. lo importante es fuerte.' : 'Your sense of urgent vs. important is sharp. You know what matters most.')
      : pct >= 50
      ? (lang === 'es' ? 'Tu instinto es solido. Cada ronda te ayuda a pensar mas claramente.' : 'Your instinct is solid. Each round helps you think more clearly about what comes first.')
      : (lang === 'es' ? 'Priorizar es una habilidad, no un talento. Cada ronda construye tu criterio.' : 'Prioritizing is a skill, not a talent. Every round builds your judgment.');

    return (
      <GameWrapper gameId="prioritize" title={lang === 'es' ? 'Prioriza Esto' : 'Prioritize This'} color="purple" onBack={onBack}>
        {pct >= 70 && <ConfettiBurst colors={confettiColors} particleCount={60} />}
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
          <div className="w-28 h-28 rounded-full flex items-center justify-center mb-6"
            style={{ border: `4px solid ${colorConfig.accent}`, background: colorConfig.bg }}>
            <span className="text-3xl font-black text-white">{pct}%</span>
          </div>
          <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: colorConfig.accent }}>
            {score}/{maxScore} {lang === 'es' ? 'correctas' : 'correct'}
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
        </div>
      </GameWrapper>
    );
  }

  // ── Rank (drag-to-order via up/down buttons) ──
  if (screen === 'rank') {
    return (
      <GameWrapper gameId="prioritize" title={lang === 'es' ? 'Prioriza Esto' : 'Prioritize This'} color="purple" onBack={onBack}>
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Progress */}
          <div className="flex justify-center gap-2 mb-6">
            {rounds.map((_, i) => (
              <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: i === current ? colorConfig.accent : i < current ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)' }} />
            ))}
          </div>

          {/* Situation */}
          <div className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-base text-white leading-relaxed" style={{ fontFamily: "'Source Serif 4', serif" }}>
              {round[lang].situation}
            </p>
          </div>

          <p className="text-xs font-bold uppercase tracking-wider mb-4 text-center" style={{ color: colorConfig.accent }}>
            {lang === 'es' ? 'Ordena de mayor a menor prioridad' : 'Rank from highest to lowest priority'}
          </p>

          {/* Sortable tasks */}
          <div className="space-y-2 mb-6">
            {userOrder.map((taskIdx, pos) => {
              const task = round.tasks[taskIdx];
              return (
                <div key={taskIdx} className="flex items-center gap-2 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: colorConfig.bg }}>
                    <span className="text-sm font-bold" style={{ color: colorConfig.accent }}>{pos + 1}</span>
                  </div>
                  <p className="flex-1 text-sm text-white/90">{task[lang]}</p>
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moveUp(pos)} disabled={pos === 0} className="p-1 rounded transition-opacity" style={{ opacity: pos === 0 ? 0.2 : 0.7 }}>
                      <ArrowUp size={14} style={{ color: 'white' }} />
                    </button>
                    <button onClick={() => moveDown(pos)} disabled={pos === userOrder.length - 1} className="p-1 rounded transition-opacity" style={{ opacity: pos === userOrder.length - 1 ? 0.2 : 0.7 }}>
                      <ArrowDown size={14} style={{ color: 'white' }} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center">
            <button onClick={handleSubmitRank} className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-80" style={{ background: colorConfig.accent, color: '#0f1a2e' }}>
              {lang === 'es' ? 'Confirmar orden' : 'Lock In My Ranking'}
              <Check size={16} />
            </button>
          </div>
        </div>
      </GameWrapper>
    );
  }

  // ── Reveal ──
  return (
    <GameWrapper gameId="prioritize" title={lang === 'es' ? 'Prioriza Esto' : 'Prioritize This'} color="purple" onBack={onBack}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Round score */}
        <div className="text-center mb-6">
          <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: colorConfig.accent }}>
            {lang === 'es' ? 'Esta ronda' : 'This round'}
          </p>
          <p className="text-2xl font-black text-white">{roundScore}/4 {lang === 'es' ? 'correctas' : 'correct'}</p>
        </div>

        {/* Expert ranking with explanations */}
        <div className="space-y-3 mb-6">
          {round.tasks
            .slice()
            .sort((a, b) => a.rank - b.rank)
            .map((task, idx) => {
              const userPos = userOrder.indexOf(round.tasks.indexOf(task));
              const isCorrect = userPos === task.rank - 1;
              return (
                <div key={idx} className="rounded-xl p-4" style={{ background: isCorrect ? 'rgba(39,174,96,0.1)' : 'rgba(255,255,255,0.06)', border: `1px solid ${isCorrect ? 'rgba(39,174,96,0.3)' : 'rgba(255,255,255,0.1)'}` }}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: isCorrect ? 'rgba(39,174,96,0.2)' : colorConfig.bg }}>
                      <span className="text-sm font-bold" style={{ color: isCorrect ? '#27AE60' : colorConfig.accent }}>{task.rank}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white/90 font-medium mb-1">{task[lang]}</p>
                      <p className="text-xs text-white/60 leading-relaxed">{task.explanation[lang]}</p>
                      {!isCorrect && (
                        <p className="text-xs mt-1" style={{ color: '#E74C3C' }}>
                          {lang === 'es' ? `Tu pusiste esto en #${userPos + 1}` : `You ranked this #${userPos + 1}`}
                        </p>
                      )}
                    </div>
                    {isCorrect && <Check size={16} style={{ color: '#27AE60', flexShrink: 0 }} />}
                  </div>
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
