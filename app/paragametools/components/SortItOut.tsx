'use client';

import { useState, useMemo } from 'react';
import { ChevronRight, ArrowLeft, RotateCcw, Check, X } from 'lucide-react';
import { GameWrapper, IntroScreen } from './GameWrapper';
import { ConfettiBurst } from './ConfettiBurst';
import { SORT_SETS, SORT_SET_COUNT } from '../data/sortItOutData';
import type { SortItem } from '../data/sortItOutData';
import { COLORS, shuffle } from '../data/gameConfig';
import { useLanguage } from '../context/LanguageContext';
import { useGameTracking } from '@/lib/hub/useGameTracking';
import { useGameBadgeCheck } from '@/components/hub/useGameBadgeCheck';
import { CommunityNudge } from './CommunityNudge';

type Screen = 'intro' | 'sort' | 'reveal' | 'results';

interface SortItOutProps {
  onBack: () => void;
}

interface PlacedItem {
  item: SortItem & { _origIndex: number }
  bucketId: string
}

export function SortItOut({ onBack }: SortItOutProps) {
  const { language } = useLanguage();
  const lang = language === 'es' ? 'es' : 'en';
  const { logCompletion, startSession, logGameResponse, completeSession } = useGameTracking();

  const sets = useMemo(() => shuffle(SORT_SETS).slice(0, SORT_SET_COUNT), []);

  const [screen, setScreen] = useState<Screen>('intro');
  const [currentSet, setCurrentSet] = useState(0);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [placements, setPlacements] = useState<PlacedItem[]>([]);
  const [unplaced, setUnplaced] = useState<(SortItem & { _origIndex: number })[]>([]);
  const [setScores, setSetScores] = useState<number[]>([]);
  const [currentScore, setCurrentScore] = useState(0);

  const set = sets[currentSet];
  const isLastSet = currentSet === sets.length - 1;
  const badgeCelebration = useGameBadgeCheck(screen === 'results');

  const initSet = () => {
    const items = set.items.map((item, i) => ({ ...item, _origIndex: i }));
    setUnplaced(shuffle(items));
    setPlacements([]);
    setSelectedItem(null);
    setCurrentScore(0);
  };

  const handleStart = async () => {
    setScreen('sort');
    setCurrentSet(0);
    setSetScores([]);
    await startSession('sort-it-out', sets.length, { language });
    // Init first set after state update
    setTimeout(() => {
      const items = sets[0].items.map((item, i) => ({ ...item, _origIndex: i }));
      setUnplaced(shuffle(items));
      setPlacements([]);
      setSelectedItem(null);
      setCurrentScore(0);
    }, 0);
  };

  const handleSelectItem = (index: number) => {
    setSelectedItem(selectedItem === index ? null : index);
  };

  const handlePlaceInBucket = (bucketId: string) => {
    if (selectedItem === null) return;
    const item = unplaced[selectedItem];
    setPlacements(prev => [...prev, { item, bucketId }]);
    setUnplaced(prev => prev.filter((_, i) => i !== selectedItem));
    setSelectedItem(null);
  };

  const handleRemoveFromBucket = (placementIndex: number) => {
    const removed = placements[placementIndex];
    setPlacements(prev => prev.filter((_, i) => i !== placementIndex));
    setUnplaced(prev => [...prev, removed.item]);
  };

  const handleSubmit = () => {
    let correct = 0;
    for (const p of placements) {
      if (p.bucketId === p.item.correctBucket) correct++;
    }
    setCurrentScore(correct);
    setSetScores(prev => [...prev, correct]);

    // Log each placement as a response
    for (const p of placements) {
      logGameResponse('sort-it-out', {
        itemId: `${set.id}_${p.item._origIndex}`,
        roundNumber: currentSet + 1,
        userAnswer: p.bucketId,
        correctAnswer: p.item.correctBucket,
        isCorrect: p.bucketId === p.item.correctBucket,
      });
    }

    setScreen('reveal');
  };

  const handleNextSet = () => {
    if (isLastSet) {
      setScreen('results');
      const totalCorrect = [...setScores, currentScore].reduce((a, b) => a + b, 0);
      const totalItems = sets.reduce((a, s) => a + s.items.length, 0);
      logCompletion({ tool: 'sort-it-out', score: totalCorrect, totalRounds: totalItems });
      completeSession(totalCorrect, 0);
    } else {
      setCurrentSet(c => c + 1);
      setScreen('sort');
      setTimeout(() => {
        const nextSet = sets[currentSet + 1];
        const items = nextSet.items.map((item, i) => ({ ...item, _origIndex: i }));
        setUnplaced(shuffle(items));
        setPlacements([]);
        setSelectedItem(null);
        setCurrentScore(0);
      }, 0);
    }
  };

  const handlePlayAgain = () => {
    setCurrentSet(0);
    setSetScores([]);
    setScreen('intro');
  };

  const accentColor = '#2563EB';
  const confettiColors = ['#2563EB', '#3B82F6', '#60A5FA', '#FFFFFF', '#27AE60'];

  const gameTitle = lang === 'es' ? 'Clasifica Esto' : 'Sort It Out';

  return (
    <GameWrapper gameId="knockout" title={gameTitle} color="blue" onBack={onBack}>
      {badgeCelebration}

      {/* ── INTRO ── */}
      {screen === 'intro' && (
        <IntroScreen
          gameId="knockout"
          title={gameTitle}
          color="blue"
          rules={lang === 'es'
            ? ['Lee cada item', 'Toca para seleccionar, luego toca un cubo para colocarlo', 'Clasifica todos los items antes de enviar', 'Ve cuales acertaste y cuales no', '5 categorias diferentes']
            : ['Read each item', 'Tap to select, then tap a bucket to place it', 'Sort all items before submitting', 'See which ones you got right and wrong', '5 different categories']
          }
          onStart={handleStart}
        />
      )}

      {/* ── SORT ── */}
      {screen === 'sort' && set && (
        <div className="flex flex-col items-center animate-fade-in">
          {/* Progress */}
          <div className="flex gap-1.5 mb-4">
            {sets.map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full" style={{ background: i === currentSet ? accentColor : i < currentSet ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.12)' }} />
            ))}
          </div>
          <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {lang === 'es' ? `Ronda ${currentSet + 1} de ${sets.length}` : `Set ${currentSet + 1} of ${sets.length}`}
          </p>
          <h3 className="text-lg font-bold text-white mb-1">{set.title[lang]}</h3>
          <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.5)' }}>{set.instruction[lang]}</p>

          {/* Unsorted items */}
          {unplaced.length > 0 && (
            <div className="w-full rounded-xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {lang === 'es' ? `Sin clasificar (${unplaced.length})` : `Unsorted (${unplaced.length})`}
              </p>
              <div className="flex flex-col gap-2">
                {unplaced.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectItem(i)}
                    className="text-left rounded-lg p-3 text-sm transition-all"
                    style={{
                      background: selectedItem === i ? `${accentColor}20` : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${selectedItem === i ? accentColor : 'rgba(255,255,255,0.12)'}`,
                      color: 'rgba(255,255,255,0.85)',
                      boxShadow: selectedItem === i ? `0 0 0 2px ${accentColor}30` : 'none',
                    }}
                  >
                    {item.text[lang]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Buckets */}
          <div className={`w-full grid gap-4 mb-4 ${set.buckets.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {set.buckets.map(bucket => {
              const bucketPlacements = placements.filter(p => p.bucketId === bucket.id);
              return (
                <button
                  key={bucket.id}
                  onClick={() => handlePlaceInBucket(bucket.id)}
                  disabled={selectedItem === null}
                  className="rounded-xl p-4 text-left transition-all min-h-[120px]"
                  style={{
                    border: `2px dashed ${selectedItem !== null ? `${bucket.color}60` : 'rgba(255,255,255,0.12)'}`,
                    background: selectedItem !== null ? `${bucket.color}08` : 'transparent',
                    cursor: selectedItem !== null ? 'pointer' : 'default',
                    opacity: selectedItem !== null ? 1 : 0.7,
                  }}
                >
                  <p className="text-sm font-bold mb-0.5" style={{ color: bucket.color }}>{bucket.label[lang]}</p>
                  <p className="text-[10px] mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>{bucket.description[lang]}</p>
                  <div className="flex flex-col gap-1.5">
                    {bucketPlacements.map((p, pi) => (
                      <div
                        key={pi}
                        onClick={(e) => { e.stopPropagation(); handleRemoveFromBucket(placements.indexOf(p)); }}
                        className="text-xs p-2 rounded-lg cursor-pointer hover:opacity-70"
                        style={{ background: `${bucket.color}15`, border: `1px solid ${bucket.color}25`, color: 'rgba(255,255,255,0.7)' }}
                      >
                        {p.item.text[lang]}
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={unplaced.length > 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all"
            style={{
              background: unplaced.length === 0 ? accentColor : 'rgba(255,255,255,0.1)',
              color: unplaced.length === 0 ? 'white' : 'rgba(255,255,255,0.3)',
              cursor: unplaced.length === 0 ? 'pointer' : 'not-allowed',
            }}
          >
            {unplaced.length === 0
              ? (lang === 'es' ? 'Enviar' : 'Submit')
              : (lang === 'es' ? `Clasifica los ${unplaced.length} restantes` : `Sort ${unplaced.length} remaining`)}
          </button>
        </div>
      )}

      {/* ── REVEAL ── */}
      {screen === 'reveal' && set && (
        <div className="flex flex-col items-center animate-fade-in">
          {/* Score */}
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ border: `4px solid ${currentScore >= set.items.length * 0.8 ? '#27AE60' : currentScore >= set.items.length * 0.5 ? '#F1C40F' : '#E74C3C'}` }}>
            <span className="text-2xl font-bold" style={{ color: currentScore >= set.items.length * 0.8 ? '#27AE60' : currentScore >= set.items.length * 0.5 ? '#F1C40F' : '#E74C3C', fontFamily: "'Source Serif 4', serif" }}>
              {currentScore}/{set.items.length}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mb-4">{set.title[lang]}</h3>

          {/* Results list */}
          <div className="w-full space-y-2 mb-4">
            {placements.map((p, i) => {
              const isCorrect = p.bucketId === p.item.correctBucket;
              const correctBucket = set.buckets.find(b => b.id === p.item.correctBucket);
              return (
                <div
                  key={i}
                  className="rounded-lg p-3 flex items-start gap-3"
                  style={{ background: isCorrect ? 'rgba(39,174,96,0.08)' : 'rgba(231,76,60,0.08)' }}
                >
                  {isCorrect
                    ? <Check size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#27AE60' }} />
                    : <X size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#E74C3C' }} />
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{p.item.text[lang]}</p>
                    {!isCorrect && (
                      <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{p.item.explanation[lang]}</p>
                    )}
                    <span
                      className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded"
                      style={{ background: `${correctBucket?.color}20`, color: correctBucket?.color }}
                    >
                      {correctBucket?.label[lang]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Research */}
          <div className="w-full rounded-xl p-4 mb-6" style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}20` }}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: accentColor }}>{lang === 'es' ? 'La investigacion dice' : 'Research says'}</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{set.research[lang]}</p>
          </div>

          <button
            onClick={handleNextSet}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
            style={{ background: accentColor, color: 'white' }}
          >
            {isLastSet ? (lang === 'es' ? 'Ver resultados' : 'See Results') : (lang === 'es' ? 'Siguiente categoria' : 'Next Category')}
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ── RESULTS ── */}
      {screen === 'results' && (
        <div className="flex flex-col items-center text-center animate-fade-in">
          <ConfettiBurst colors={confettiColors} particleCount={60} />

          {(() => {
            const totalCorrect = setScores.reduce((a, b) => a + b, 0);
            const totalItems = sets.reduce((a, s) => a + s.items.length, 0);
            const pct = Math.round((totalCorrect / totalItems) * 100);
            const title = pct >= 90 ? (lang === 'es' ? 'Maestro Clasificador' : 'Master Sorter')
              : pct >= 70 ? (lang === 'es' ? 'Ojo Agudo' : 'Sharp Eye')
              : (lang === 'es' ? 'Sigue Practicando' : 'Keep Sorting');

            return (
              <>
                <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4" style={{ border: `4px solid ${accentColor}` }}>
                  <span className="text-3xl font-bold" style={{ color: accentColor, fontFamily: "'Source Serif 4', serif" }}>{pct}%</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
                <p className="text-xs mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {totalCorrect}/{totalItems} {lang === 'es' ? 'correctos en 5 categorias' : 'correct across 5 categories'}
                </p>

                {/* Per-set breakdown */}
                <div className="w-full max-w-md space-y-2 mb-6">
                  {sets.map((s, i) => {
                    const score = setScores[i] ?? 0;
                    const total = s.items.length;
                    const scorePct = Math.round((score / total) * 100);
                    return (
                      <div key={s.id} className="flex items-center gap-3 px-4 py-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: scorePct >= 80 ? '#27AE60' : scorePct >= 50 ? '#F1C40F' : '#E74C3C' }} />
                        <span className="flex-1 text-sm text-left">{s.title[lang]}</span>
                        <span className="text-sm font-bold" style={{ color: scorePct >= 80 ? '#27AE60' : scorePct >= 50 ? '#F1C40F' : '#E74C3C' }}>
                          {score}/{total}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Weakest area */}
                {(() => {
                  let worstIdx = 0;
                  let worstPct = 1;
                  setScores.forEach((score, i) => {
                    const pct = score / sets[i].items.length;
                    if (pct < worstPct) { worstPct = pct; worstIdx = i; }
                  });
                  if (worstPct < 0.8) {
                    return (
                      <div className="w-full max-w-md rounded-xl p-4 mb-6" style={{ background: 'rgba(241,196,15,0.08)', border: '1px solid rgba(241,196,15,0.2)' }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#F1C40F' }}>{lang === 'es' ? 'Area para revisitar' : 'Area to revisit'}</p>
                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{sets[worstIdx].title[lang]}</p>
                      </div>
                    );
                  }
                  return null;
                })()}
              </>
            );
          })()}

          <div className="flex gap-3">
            <button onClick={handlePlayAgain} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105" style={{ background: accentColor, color: 'white' }}>
              <RotateCcw size={16} />
              {lang === 'es' ? 'Jugar de nuevo' : 'Play Again'}
            </button>
            <button onClick={onBack} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
              <ArrowLeft size={16} />
              {lang === 'es' ? 'Volver' : 'Back to Games'}
            </button>
          </div>

          <CommunityNudge gameSlug="sort-it-out" />
        </div>
      )}
    </GameWrapper>
  );
}
