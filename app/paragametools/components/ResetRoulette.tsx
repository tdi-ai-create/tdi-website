'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, RotateCcw, Play, Check } from 'lucide-react';
import { COLORS } from '../data/gameConfig';
import { useLanguage } from '../context/LanguageContext';
import { RESET_ACTIVITIES, CATEGORY_INFO, type ResetCategory, type ResetActivity } from '../data/resetRoulette';
import { GameWrapper } from './GameWrapper';
import { useGameTracking } from '@/lib/hub/useGameTracking';
import { CommunityNudge } from './CommunityNudge';

type Screen = 'intro' | 'spin' | 'activity' | 'checkin' | 'done';

const ROSE = COLORS.rose;

const ALL_CATEGORIES: ResetCategory[] = ['breathwork', 'movement', 'gratitude', 'grounding', 'laugh', 'reframe'];

function getRandomActivity(category: ResetCategory, exclude?: ResetActivity): ResetActivity {
  const pool = RESET_ACTIVITIES.filter((a) => a.category === category && a !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function ResetRoulette({ onBack }: { onBack: () => void }) {
  const { language } = useLanguage();
  const { logCompletion, startSession, completeSession } = useGameTracking();
  const [screen, setScreen] = useState<Screen>('intro');
  const [selectedCategory, setSelectedCategory] = useState<ResetCategory | null>(null);
  const [currentActivity, setCurrentActivity] = useState<ResetActivity | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerDone, setTimerDone] = useState(false);
  const [activitiesCompleted, setActivitiesCompleted] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            setTimerDone(true);
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [timerRunning, timeLeft]);

  const handleStart = () => {
    startSession('reset-roulette', 4);
    setScreen('spin');
  };

  const handleSpin = useCallback(() => {
    if (spinning) return;
    setSpinning(true);
    setTimerDone(false);
    setTimerRunning(false);

    let count = 0;
    const totalFlashes = 18 + Math.floor(Math.random() * 8);
    const interval = setInterval(() => {
      setHighlightIndex(count % 6);
      count++;
      if (count >= totalFlashes) {
        clearInterval(interval);
        const finalCategory = ALL_CATEGORIES[Math.floor(Math.random() * ALL_CATEGORIES.length)];
        const finalIndex = ALL_CATEGORIES.indexOf(finalCategory);
        setHighlightIndex(finalIndex);
        setSelectedCategory(finalCategory);

        const activity = getRandomActivity(finalCategory, currentActivity || undefined);
        setCurrentActivity(activity);

        setTimeout(() => {
          setSpinning(false);
          setTimeLeft(activity[language].duration);
          setScreen('activity');
        }, 600);
      }
    }, 80 + count * 4);
  }, [spinning, currentActivity, language]);

  const handleStartTimer = () => {
    setTimerRunning(true);
    setTimerDone(false);
  };

  const handleActivityDone = () => {
    setActivitiesCompleted((prev) => prev + 1);
    setTimerRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setScreen('checkin');
  };

  const handleCheckinResponse = async (response: 'better' | 'same' | 'another') => {
    if (response === 'another') {
      setTimerDone(false);
      setScreen('spin');
    } else {
      await logCompletion({ tool: 'reset-roulette', score: activitiesCompleted, totalRounds: activitiesCompleted });
      await completeSession(activitiesCompleted, 0);
      setScreen('done');
    }
  };

  const handlePlayAgain = () => {
    setScreen('intro');
    setSelectedCategory(null);
    setCurrentActivity(null);
    setActivitiesCompleted(0);
    setTimerDone(false);
    setTimerRunning(false);
    setHighlightIndex(null);
  };

  const gameTitle = language === 'es' ? 'Ruleta de Reinicio' : 'Reset Roulette';

  // Timer display helpers
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const totalDuration = currentActivity ? currentActivity[language].duration : 1;
  const progress = totalDuration > 0 ? (totalDuration - timeLeft) / totalDuration : 0;
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <GameWrapper gameId="resetroulette" title={gameTitle} color="rose" onBack={onBack}>
      {/* INTRO SCREEN */}
      {screen === 'intro' && (
        <div className="flex flex-col items-center text-center animate-fade-in">
          <div
            className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: ROSE.bg, border: `2px solid ${ROSE.accent}` }}
          >
            <RotateCcw size={48} style={{ color: ROSE.accent }} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{gameTitle}</h2>
          <p className="text-lg text-gray-300 mb-8 max-w-md leading-relaxed">
            {language === 'es'
              ? 'Tu cuerpo lleva la cuenta. Dale algo bueno.'
              : 'Your body keeps score. Give it something good.'}
          </p>

          <div
            className="w-full max-w-lg rounded-xl p-6 mb-8"
            style={{ backgroundColor: ROSE.bg, border: `1px solid ${ROSE.border}` }}
          >
            <ul className="space-y-3 text-left">
              {(language === 'es'
                ? [
                    'Gira para obtener una categoria de reinicio.',
                    'Sigue la actividad guiada de 2 minutos.',
                    'Hazla de verdad. No solo la leas.',
                    'Funciona solo o como apertura de reunion.',
                  ]
                : [
                    'Spin to get a reset category.',
                    'Follow the guided 2 minute activity.',
                    'Actually do it. Do not just read it.',
                    'Works solo or as a meeting opener.',
                  ]
              ).map((rule, i) => (
                <li key={i} className="flex items-start gap-3 text-white">
                  <span style={{ color: ROSE.accent }}>&#8226;</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={handleStart}
            className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95 animate-glow-pulse"
            style={{
              backgroundColor: ROSE.accent,
              color: '#ffffff',
              ['--glow-color' as string]: ROSE.accent + '40',
            }}
          >
            {language === 'es' ? '!Vamos! \u2192' : "Let's Go \u2192"}
          </button>
        </div>
      )}

      {/* SPIN SCREEN */}
      {screen === 'spin' && (
        <div className="flex flex-col items-center text-center animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {language === 'es' ? 'Elige tu reinicio' : 'Pick your reset'}
          </h2>
          <p className="text-gray-400 mb-8">
            {language === 'es'
              ? 'Presiona girar y deja que el destino decida.'
              : 'Hit spin and let fate decide.'}
          </p>

          {/* Category grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-lg mb-8">
            {ALL_CATEGORIES.map((cat, idx) => {
              const info = CATEGORY_INFO[cat];
              const isHighlighted = highlightIndex === idx;
              const isSelected = !spinning && selectedCategory === cat;
              return (
                <div
                  key={cat}
                  className="rounded-xl p-4 text-center transition-all duration-150"
                  style={{
                    backgroundColor: isHighlighted || isSelected
                      ? `${info.color}25`
                      : 'rgba(255, 255, 255, 0.05)',
                    border: isHighlighted || isSelected
                      ? `2px solid ${info.color}`
                      : '2px solid rgba(255, 255, 255, 0.1)',
                    transform: isHighlighted ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: isHighlighted || isSelected
                      ? `0 0 20px ${info.color}30`
                      : 'none',
                  }}
                >
                  <p
                    className="font-bold text-sm md:text-base"
                    style={{ color: isHighlighted || isSelected ? info.color : '#ffffff' }}
                  >
                    {info[language].label}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {info[language].description}
                  </p>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleSpin}
            disabled={spinning}
            className="px-10 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: ROSE.accent, color: '#ffffff' }}
          >
            <span className="flex items-center gap-2">
              <RotateCcw size={20} className={spinning ? 'animate-spin' : ''} />
              {spinning
                ? (language === 'es' ? 'Girando...' : 'Spinning...')
                : (language === 'es' ? 'Girar' : 'Spin')}
            </span>
          </button>
        </div>
      )}

      {/* ACTIVITY SCREEN */}
      {screen === 'activity' && currentActivity && selectedCategory && (
        <div className="flex flex-col items-center text-center animate-fade-in">
          {/* Category badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
            style={{
              backgroundColor: `${CATEGORY_INFO[selectedCategory].color}20`,
              color: CATEGORY_INFO[selectedCategory].color,
              border: `1px solid ${CATEGORY_INFO[selectedCategory].color}40`,
            }}
          >
            {CATEGORY_INFO[selectedCategory][language].label}
          </div>

          {/* Activity name */}
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            {currentActivity[language].name}
          </h2>

          {/* Instruction card */}
          <div
            className="w-full max-w-lg rounded-xl p-6 mb-8 text-left"
            style={{
              backgroundColor: `${CATEGORY_INFO[selectedCategory].color}10`,
              border: `1px solid ${CATEGORY_INFO[selectedCategory].color}30`,
            }}
          >
            <p className="text-white text-lg leading-relaxed">
              {currentActivity[language].instruction}
            </p>
          </div>

          {/* Circular timer */}
          <div className="relative w-36 h-36 md:w-40 md:h-40 mb-6">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              {/* Background circle */}
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="6"
              />
              {/* Progress circle */}
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke={timerDone ? '#10B981' : CATEGORY_INFO[selectedCategory].color}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {timerDone ? (
                <div className="flex flex-col items-center">
                  <Check size={32} style={{ color: '#10B981' }} />
                  <p className="text-sm text-green-400 mt-1">
                    {language === 'es' ? 'Listo' : 'Done'}
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-3xl md:text-4xl font-bold text-white font-mono">
                    {timerDisplay}
                  </p>
                  {!timerRunning && timeLeft > 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      {language === 'es' ? 'Listo cuando tu lo estes' : 'Ready when you are'}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Timer controls */}
          {!timerRunning && !timerDone && (
            <button
              onClick={handleStartTimer}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95 mb-6"
              style={{ backgroundColor: CATEGORY_INFO[selectedCategory].color, color: '#ffffff' }}
            >
              <Play size={20} />
              {language === 'es' ? 'Iniciar Temporizador' : 'Start Timer'}
            </button>
          )}

          {timerDone && (
            <button
              onClick={handleActivityDone}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95 mb-6"
              style={{ backgroundColor: '#10B981', color: '#ffffff' }}
            >
              <Check size={20} />
              {language === 'es' ? 'Continuar' : 'Continue'}
            </button>
          )}

          {/* Tip */}
          <div
            className="w-full max-w-lg rounded-lg p-4 text-left"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: CATEGORY_INFO[selectedCategory].color }}>
              {language === 'es' ? 'Consejo' : 'Tip'}
            </p>
            <p className="text-sm text-gray-300">{currentActivity[language].tip}</p>
          </div>
        </div>
      )}

      {/* CHECK-IN SCREEN */}
      {screen === 'checkin' && (
        <div className="flex flex-col items-center text-center animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            {language === 'es' ? 'Como te sientes?' : 'How do you feel?'}
          </h2>
          <p className="text-gray-400 mb-8">
            {language === 'es' ? 'Se honesto. No hay respuesta incorrecta.' : 'Be honest. There is no wrong answer.'}
          </p>

          <div className="flex flex-col gap-3 w-full max-w-sm">
            <button
              onClick={() => handleCheckinResponse('better')}
              className="w-full py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '2px solid rgba(16, 185, 129, 0.4)', color: '#10B981' }}
            >
              {language === 'es' ? 'Mejor' : 'Better'}
            </button>
            <button
              onClick={() => handleCheckinResponse('same')}
              className="w-full py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '2px solid rgba(255, 255, 255, 0.2)', color: '#ffffff' }}
            >
              {language === 'es' ? 'Igual' : 'Same'}
            </button>
            <button
              onClick={() => handleCheckinResponse('another')}
              className="w-full py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: `${ROSE.accent}15`, border: `2px solid ${ROSE.accent}40`, color: ROSE.accent }}
            >
              {language === 'es' ? 'Necesito otro' : 'Need Another'}
            </button>
          </div>
        </div>
      )}

      {/* DONE SCREEN */}
      {screen === 'done' && (
        <div className="flex flex-col items-center text-center animate-fade-in">
          <div
            className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '2px solid #10B981' }}
          >
            <Check size={48} style={{ color: '#10B981' }} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {language === 'es' ? 'Buen trabajo.' : 'Nice work.'}
          </h2>
          <p className="text-lg text-gray-300 mb-2 max-w-md">
            {language === 'es'
              ? 'Vuelve cuando lo necesites.'
              : 'Come back anytime.'}
          </p>
          <p className="text-sm text-gray-500 mb-8">
            {activitiesCompleted === 1
              ? (language === 'es' ? '1 actividad completada' : '1 activity completed')
              : (language === 'es'
                  ? `${activitiesCompleted} actividades completadas`
                  : `${activitiesCompleted} activities completed`)}
          </p>

          <div className="flex gap-3">
            <button
              onClick={handlePlayAgain}
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: ROSE.accent, color: '#ffffff' }}
            >
              <RotateCcw size={20} />
              {language === 'es' ? 'Jugar de nuevo' : 'Play Again'}
            </button>
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#ffffff' }}
            >
              <ArrowLeft size={20} />
              {language === 'es' ? 'Volver a Juegos' : 'Back to Games'}
            </button>
          </div>

          <CommunityNudge gameSlug="reset-roulette" score={activitiesCompleted} totalRounds={activitiesCompleted} />
        </div>
      )}
    </GameWrapper>
  );
}
