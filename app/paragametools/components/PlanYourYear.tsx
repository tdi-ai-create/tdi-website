'use client';

import { useState } from 'react';
import { ArrowLeft, RotateCcw, Check, TrendingUp } from 'lucide-react';
import { COLORS } from '../data/gameConfig';
import { useLanguage } from '../context/LanguageContext';
import { YEAR_ROUNDS, type MonthRound } from '../data/planYourYear';
import { GameWrapper } from './GameWrapper';
import { ConfettiBurst } from './ConfettiBurst';
import { useGameTracking } from '@/lib/hub/useGameTracking';
import { useGameBadgeCheck } from '@/components/hub/useGameBadgeCheck';
import { CommunityNudge } from './CommunityNudge';

type Screen = 'intro' | 'play' | 'results';

const BLUE = COLORS.blue;
const MONTHS_COUNT = 9;
const PICKS_PER_MONTH = 2;
const TOTAL_PRIORITIES = 18; // 9 months * 2 priority items each

const BURNOUT_COLORS = {
  low: { color: '#27AE60', label: { en: 'Low', es: 'Bajo' } },
  medium: { color: '#F59E0B', label: { en: 'Medium', es: 'Medio' } },
  high: { color: '#E74C3C', label: { en: 'High', es: 'Alto' } },
} as const;

const MONTH_NAMES_ES: Record<string, string> = {
  September: 'Septiembre',
  October: 'Octubre',
  November: 'Noviembre',
  December: 'Diciembre',
  January: 'Enero',
  February: 'Febrero',
  March: 'Marzo',
  April: 'Abril',
  May: 'Mayo',
};

export function PlanYourYear({ onBack }: { onBack: () => void }) {
  const { language } = useLanguage();
  const { logCompletion, startSession, logGameResponse, completeSession } = useGameTracking();
  const [screen, setScreen] = useState<Screen>('intro');
  const [currentMonth, setCurrentMonth] = useState(0);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [allSelections, setAllSelections] = useState<Record<number, Set<string>>>({});
  const [showInsights, setShowInsights] = useState(false);

  const handleStart = () => {
    setCurrentMonth(0);
    setSelectedItems(new Set());
    setAllSelections({});
    setShowInsights(false);
    setScreen('play');
    startSession('plan-your-year', MONTHS_COUNT, { language });
  };

  const handleToggleItem = (id: string) => {
    if (showInsights) return;
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < PICKS_PER_MONTH) {
        next.add(id);
      }
      return next;
    });
  };

  const handleConfirmMonth = () => {
    setShowInsights(true);
  };

  const handleNextMonth = () => {
    const round = YEAR_ROUNDS[currentMonth];
    const data = round[language];

    // Log responses for this month
    data.demands.forEach((demand, idx) => {
      logGameResponse('plan-your-year', {
        itemId: demand.id,
        roundNumber: currentMonth * 4 + idx + 1,
        userAnswer: selectedItems.has(demand.id) ? 'selected' : 'skipped',
        correctAnswer: demand.priority ? 'selected' : 'skipped',
        isCorrect: demand.priority === selectedItems.has(demand.id),
      });
    });

    // Store selections
    setAllSelections((prev) => ({ ...prev, [currentMonth]: new Set(selectedItems) }));

    if (currentMonth < MONTHS_COUNT - 1) {
      setCurrentMonth((prev) => prev + 1);
      setSelectedItems(new Set());
      setShowInsights(false);
    } else {
      // Calculate final score
      const finalSelections = { ...allSelections, [currentMonth]: new Set(selectedItems) };
      let aligned = 0;
      YEAR_ROUNDS.forEach((round, monthIdx) => {
        const monthData = round[language];
        const monthSels = finalSelections[monthIdx] || new Set();
        monthData.demands.forEach((demand) => {
          if (demand.priority && monthSels.has(demand.id)) {
            aligned++;
          }
        });
      });

      setAllSelections(finalSelections);
      setScreen('results');
      logCompletion({ tool: 'plan-your-year', score: aligned, totalRounds: TOTAL_PRIORITIES });
      void completeSession(aligned, aligned);
    }
  };

  const handlePlayAgain = () => {
    setSelectedItems(new Set());
    setAllSelections({});
    setCurrentMonth(0);
    setShowInsights(false);
    setScreen('intro');
  };

  const gameTitle = language === 'es' ? 'Planifica Tu Ano' : 'Plan Your Year';
  const badgeCelebration = useGameBadgeCheck(screen === 'results');

  return (
    <GameWrapper gameId="planyouryear" title={gameTitle} color="blue" onBack={onBack}>
      {badgeCelebration}
      {screen === 'intro' && <IntroScreen onStart={handleStart} language={language} />}
      {screen === 'play' && (
        <PlayScreen
          language={language}
          round={YEAR_ROUNDS[currentMonth]}
          currentMonth={currentMonth}
          selectedItems={selectedItems}
          showInsights={showInsights}
          onToggle={handleToggleItem}
          onConfirm={handleConfirmMonth}
          onNext={handleNextMonth}
          isLastMonth={currentMonth === MONTHS_COUNT - 1}
        />
      )}
      {screen === 'results' && (
        <ResultsScreen
          language={language}
          allSelections={allSelections}
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
        style={{ backgroundColor: BLUE.bg, border: `2px solid ${BLUE.accent}` }}
      >
        <TrendingUp size={48} style={{ color: BLUE.accent }} />
      </div>
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
        {language === 'es' ? 'Planifica Tu Ano' : 'Plan Your Year'}
      </h2>
      <p className="text-lg mb-6" style={{ color: BLUE.accent }}>
        {language === 'es'
          ? '9 meses. Energia limitada. Elige sabiamente.'
          : '9 months. Limited energy. Choose wisely.'}
      </p>

      <div
        className="w-full max-w-lg rounded-xl p-6 mb-6"
        style={{ backgroundColor: BLUE.bg, border: `1px solid ${BLUE.border}` }}
      >
        <p className="text-white text-base leading-relaxed mb-4">
          {language === 'es'
            ? 'Cada mes, 4 cosas demandan tu atencion pero solo puedes dar enfoque real a 2. Elige tus 2 prioridades y descubre lo que dice la investigacion sobre los momentos criticos de cada mes.'
            : 'Each month, 4 things demand your attention but you can only give real focus to 2. Pick your 2 priorities and see what research says about that month\'s critical moments.'}
        </p>
        <ul className="space-y-2 text-left">
          {(language === 'es'
            ? [
                '9 rondas: septiembre a mayo.',
                '4 demandas por mes. Elige solo 2.',
                'Descubre cuando tipicamente golpea el agotamiento.',
                'Aprende cuando proteger tu energia.',
              ]
            : [
                '9 rounds: September through May.',
                '4 demands per month. Pick only 2.',
                'Discover when burnout typically hits.',
                'Learn when to protect your energy.',
              ]
          ).map((rule, i) => (
            <li key={i} className="flex items-start gap-3 text-white text-sm">
              <span style={{ color: BLUE.accent }}>*</span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={onStart}
        className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
        style={{ backgroundColor: BLUE.accent, color: '#ffffff' }}
      >
        {language === 'es' ? 'Comenzar' : 'Start Planning'}
      </button>
    </div>
  );
}

// Play Screen
function PlayScreen({
  language,
  round,
  currentMonth,
  selectedItems,
  showInsights,
  onToggle,
  onConfirm,
  onNext,
  isLastMonth,
}: {
  language: 'en' | 'es';
  round: MonthRound;
  currentMonth: number;
  selectedItems: Set<string>;
  showInsights: boolean;
  onToggle: (id: string) => void;
  onConfirm: () => void;
  onNext: () => void;
  isLastMonth: boolean;
}) {
  const data = round[language];
  const canConfirm = selectedItems.size === PICKS_PER_MONTH;
  const burnout = BURNOUT_COLORS[data.burnoutRisk];
  const monthName = language === 'es' ? MONTH_NAMES_ES[round.month] || round.month : round.month;

  return (
    <div className="animate-fade-in">
      {/* Month header */}
      <div className="text-center mb-4">
        <p className="text-sm uppercase tracking-wider mb-1" style={{ color: '#8899aa' }}>
          {language === 'es' ? 'Mes' : 'Month'} {currentMonth + 1} {language === 'es' ? 'de' : 'of'} {MONTHS_COUNT}
        </p>
        <div className="flex items-center justify-center gap-3 mb-2">
          <h3 className="text-3xl font-bold text-white">{monthName}</h3>
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: burnout.color }}
            />
            <span className="text-xs font-medium" style={{ color: burnout.color }}>
              {language === 'es' ? 'Riesgo de agotamiento:' : 'Burnout risk:'} {burnout.label[language]}
            </span>
          </div>
        </div>
        <p className="text-sm italic" style={{ color: BLUE.accent, opacity: 0.8 }}>
          {data.context}
        </p>
      </div>

      {/* Selection counter */}
      {!showInsights && (
        <div
          className="rounded-xl p-3 mb-5 text-center"
          style={{ backgroundColor: BLUE.bg, border: `1px solid ${BLUE.border}` }}
        >
          <p className="text-white font-bold text-lg">
            <span style={{ color: canConfirm ? '#27AE60' : BLUE.accent }}>{selectedItems.size}</span>
            {' '}{language === 'es' ? 'de' : 'of'} {PICKS_PER_MONTH} {language === 'es' ? 'seleccionados' : 'selected'}
          </p>
          {selectedItems.size < PICKS_PER_MONTH && (
            <p className="text-xs mt-1" style={{ color: '#8899aa' }}>
              {language === 'es'
                ? `Selecciona ${PICKS_PER_MONTH - selectedItems.size} mas`
                : `Select ${PICKS_PER_MONTH - selectedItems.size} more`}
            </p>
          )}
        </div>
      )}

      {/* Demand cards */}
      <div className="flex flex-col gap-3 mb-6">
        {data.demands.map((demand) => {
          const isSelected = selectedItems.has(demand.id);
          const isDisabled = !showInsights && !isSelected && selectedItems.size >= PICKS_PER_MONTH;

          // After confirmation, show color coding
          const cardBg = showInsights
            ? demand.priority
              ? 'rgba(39, 174, 96, 0.15)'
              : 'rgba(107, 114, 128, 0.15)'
            : isSelected
              ? 'rgba(52, 152, 219, 0.15)'
              : 'rgba(255,255,255,0.06)';

          const cardBorder = showInsights
            ? demand.priority
              ? '2px solid #27AE60'
              : '2px solid #6B7280'
            : isSelected
              ? `2px solid ${BLUE.accent}`
              : '2px solid rgba(255,255,255,0.15)';

          return (
            <div key={demand.id}>
              <button
                onClick={() => onToggle(demand.id)}
                disabled={isDisabled || showInsights}
                className="w-full text-left rounded-xl p-4 transition-all duration-200"
                style={{
                  backgroundColor: cardBg,
                  border: cardBorder,
                  opacity: isDisabled ? 0.4 : 1,
                  cursor: isDisabled || showInsights ? 'default' : 'pointer',
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 transition-all"
                    style={{
                      backgroundColor: isSelected
                        ? showInsights
                          ? demand.priority ? '#27AE60' : '#6B7280'
                          : BLUE.accent
                        : 'rgba(255,255,255,0.1)',
                      border: isSelected ? 'none' : '2px solid rgba(255,255,255,0.3)',
                    }}
                  >
                    {isSelected && <Check size={18} style={{ color: '#0a1628' }} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-base">{demand.task}</p>
                    <p className="text-sm mt-1" style={{ color: '#8899aa' }}>{demand.description}</p>
                    {showInsights && (
                      <div className="mt-2">
                        <p className="text-xs font-bold mb-1" style={{
                          color: demand.priority ? '#27AE60' : '#6B7280',
                        }}>
                          {demand.priority
                            ? (isSelected
                              ? (language === 'es' ? 'Buena decision.' : 'Great call.')
                              : (language === 'es' ? 'Esta importa mas de lo que piensas.' : 'This one matters more than you think.'))
                            : (isSelected
                              ? (language === 'es' ? 'Esto puede esperar. Mira por que.' : 'This can wait. Here is why.')
                              : (language === 'es' ? 'Inteligente. Esto puede esperar.' : 'Smart. This can wait.'))
                          }
                        </p>
                        <p className="text-sm leading-relaxed" style={{ color: '#c0c8d4' }}>
                          {demand.insight}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Month insight (after confirming) */}
      {showInsights && (
        <div
          className="rounded-xl p-5 mb-6 animate-fade-in"
          style={{ backgroundColor: BLUE.bg, border: `1px solid ${BLUE.border}` }}
        >
          <p className="text-white text-base font-medium leading-relaxed">
            {data.monthInsight}
          </p>
        </div>
      )}

      {/* Action button */}
      <div className="flex justify-center">
        {!showInsights ? (
          <button
            onClick={onConfirm}
            disabled={!canConfirm}
            className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
            style={{
              backgroundColor: canConfirm ? BLUE.accent : 'rgba(255,255,255,0.1)',
              color: canConfirm ? '#ffffff' : '#666',
              cursor: canConfirm ? 'pointer' : 'not-allowed',
            }}
          >
            {language === 'es' ? 'Confirmar Elecciones' : 'Lock In Choices'}
          </button>
        ) : (
          <button
            onClick={onNext}
            className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: BLUE.accent, color: '#ffffff' }}
          >
            {isLastMonth
              ? (language === 'es' ? 'Ver Resultados' : 'See Results')
              : (language === 'es' ? 'Siguiente Mes' : 'Next Month')}
          </button>
        )}
      </div>
    </div>
  );
}

// Results Screen
function ResultsScreen({
  language,
  allSelections,
  onPlayAgain,
  onBack,
}: {
  language: 'en' | 'es';
  allSelections: Record<number, Set<string>>;
  onPlayAgain: () => void;
  onBack: () => void;
}) {
  // Calculate score
  let aligned = 0;
  let highBurnoutProtected = 0;
  let highBurnoutTotal = 0;

  YEAR_ROUNDS.forEach((round, monthIdx) => {
    const data = round[language];
    const monthSels = allSelections[monthIdx] || new Set();
    data.demands.forEach((demand) => {
      if (demand.priority && monthSels.has(demand.id)) {
        aligned++;
      }
    });
    if (data.burnoutRisk === 'high') {
      highBurnoutTotal++;
      const priorityHits = data.demands.filter(
        (d) => d.priority && monthSels.has(d.id)
      ).length;
      if (priorityHits === 2) highBurnoutProtected++;
    }
  });

  const confettiColors = [BLUE.accent, '#FFD700', '#FFFFFF'];
  const { title, message } = getScoreContent(aligned, language);

  return (
    <div className="flex flex-col items-center text-center animate-fade-in">
      {aligned >= 14 && <ConfettiBurst colors={confettiColors} particleCount={60} />}

      {/* Score ring */}
      <div
        className="w-28 h-28 md:w-32 md:h-32 rounded-full flex flex-col items-center justify-center mb-6 animate-scale-in"
        style={{ backgroundColor: BLUE.bg, border: `3px solid ${BLUE.accent}` }}
      >
        <span className="text-4xl md:text-5xl font-black text-white">{aligned}</span>
        <span className="text-sm" style={{ color: BLUE.accent }}>
          {language === 'es' ? `de ${TOTAL_PRIORITIES} alineados` : `of ${TOTAL_PRIORITIES} aligned`}
        </span>
      </div>

      <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{title}</h2>
      <p className="text-lg text-white mb-8 max-w-lg leading-relaxed">{message}</p>

      {/* Timeline view */}
      <div className="w-full max-w-lg mb-8">
        <h3 className="text-lg font-bold text-white mb-4 text-left">
          {language === 'es' ? 'Tu Ano' : 'Your Year'}
        </h3>
        <div className="flex flex-col gap-3">
          {YEAR_ROUNDS.map((round, monthIdx) => {
            const data = round[language];
            const monthSels = allSelections[monthIdx] || new Set();
            const monthAligned = data.demands.filter(
              (d) => d.priority && monthSels.has(d.id)
            ).length;
            const burnout = BURNOUT_COLORS[data.burnoutRisk];
            const monthName = language === 'es'
              ? MONTH_NAMES_ES[round.month] || round.month
              : round.month;

            return (
              <div
                key={round.month}
                className="rounded-xl p-4"
                style={{
                  backgroundColor: monthAligned === 2
                    ? 'rgba(39, 174, 96, 0.1)'
                    : monthAligned === 1
                      ? 'rgba(245, 158, 11, 0.1)'
                      : 'rgba(231, 76, 60, 0.1)',
                  borderLeft: `4px solid ${
                    monthAligned === 2 ? '#27AE60' : monthAligned === 1 ? '#F59E0B' : '#E74C3C'
                  }`,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm">{monthName}</span>
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: burnout.color }}
                    />
                  </div>
                  <span className="text-xs font-bold" style={{
                    color: monthAligned === 2 ? '#27AE60' : monthAligned === 1 ? '#F59E0B' : '#E74C3C',
                  }}>
                    {monthAligned}/2 {language === 'es' ? 'alineados' : 'aligned'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {data.demands.map((demand) => {
                    const wasSelected = monthSels.has(demand.id);
                    return (
                      <span
                        key={demand.id}
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: wasSelected
                            ? demand.priority
                              ? 'rgba(39, 174, 96, 0.25)'
                              : 'rgba(231, 76, 60, 0.2)'
                            : 'rgba(255,255,255,0.05)',
                          color: wasSelected
                            ? demand.priority ? '#27AE60' : '#E74C3C'
                            : '#667788',
                          border: `1px solid ${
                            wasSelected
                              ? demand.priority ? '#27AE6040' : '#E74C3C40'
                              : 'rgba(255,255,255,0.1)'
                          }`,
                        }}
                      >
                        {wasSelected ? (demand.priority ? '* ' : '~ ') : ''}
                        {demand.task.length > 30 ? demand.task.slice(0, 30) + '...' : demand.task}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Burnout pattern */}
      <div
        className="w-full max-w-lg rounded-xl p-5 mb-6"
        style={{ backgroundColor: 'rgba(231, 76, 60, 0.1)', border: '1px solid rgba(231, 76, 60, 0.3)' }}
      >
        <p className="text-sm uppercase tracking-wider mb-2" style={{ color: '#E74C3C' }}>
          {language === 'es' ? 'Patron de Agotamiento' : 'Burnout Pattern'}
        </p>
        <p className="text-white text-base leading-relaxed">
          {language === 'es'
            ? `Protegiste ${highBurnoutProtected} de ${highBurnoutTotal} meses de alto riesgo. Los meses de mayor riesgo son noviembre, diciembre, febrero y marzo.`
            : `You protected ${highBurnoutProtected} of ${highBurnoutTotal} high-risk months. The highest-risk months are November, December, February, and March.`}
        </p>
      </div>

      {/* Key insight */}
      <div
        className="w-full max-w-lg rounded-xl p-5 mb-8"
        style={{ backgroundColor: BLUE.bg, border: `1px solid ${BLUE.border}` }}
      >
        <p className="text-white text-base font-medium leading-relaxed">
          {language === 'es'
            ? 'Los educadores que perduran son los que protegen febrero y noviembre.'
            : 'The educators who last are the ones who protect February and November.'}
        </p>
      </div>

      {/* Play again / back */}
      <button
        onClick={onPlayAgain}
        className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95 mb-4"
        style={{ backgroundColor: BLUE.accent, color: '#ffffff' }}
      >
        <RotateCcw size={20} />
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

      <CommunityNudge gameSlug="plan-your-year" score={aligned} totalRounds={TOTAL_PRIORITIES} />
    </div>
  );
}

function getScoreContent(aligned: number, lang: 'en' | 'es') {
  if (aligned >= 16) {
    return lang === 'es'
      ? {
          title: 'Instinto de supervivencia.',
          message: 'Sabes cuando enfocarte y cuando protegerte. Ese equilibrio es lo que mantiene a los educadores en la profesion.',
        }
      : {
          title: 'Survivor instinct.',
          message: 'You know when to focus and when to protect yourself. That balance is what keeps educators in the profession.',
        };
  }
  if (aligned >= 12) {
    return lang === 'es'
      ? {
          title: 'Base solida.',
          message: 'Captaste la mayoria de los momentos criticos. Los que fallaste revelan patrones comunes sobre cuando los educadores se agotan.',
        }
      : {
          title: 'Strong foundation.',
          message: 'You caught most of the critical moments. The ones you missed reveal common patterns about when educators burn out.',
        };
  }
  if (aligned >= 8) {
    return lang === 'es'
      ? {
          title: 'Reflexion valiosa.',
          message: 'Muchos educadores priorizan la productividad sobre la sostenibilidad. Este juego revela donde el ritmo importa mas que la velocidad.',
        }
      : {
          title: 'Valuable reflection.',
          message: 'Many educators prioritize productivity over sustainability. This game reveals where pace matters more than speed.',
        };
  }
  return lang === 'es'
    ? {
        title: 'Perspectiva nueva.',
        message: 'El ano escolar tiene un ritmo. Aprender ese ritmo es la diferencia entre sobrevivir y prosperar. Mira el desglose arriba.',
      }
    : {
        title: 'Fresh perspective.',
        message: 'The school year has a rhythm. Learning that rhythm is the difference between surviving and thriving. See the breakdown above.',
      };
}
