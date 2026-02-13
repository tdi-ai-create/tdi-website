'use client';

import { useState, useMemo } from 'react';
import { ChevronRight, RefreshCw, Bell } from 'lucide-react';
import { GameWrapper, IntroScreen, DoneScreen } from './GameWrapper';
import { Timer, TimerControls } from './Timer';
import { KNOCKOUT_SCENARIOS, KNOCKOUT_TIMER_SECONDS, KNOCKOUT_ROUNDS } from '../data/scenarios';
import { COLORS, shuffleAndPick } from '../data/gameConfig';
import { useLanguage } from '../context/LanguageContext';
import { UI_TRANSLATIONS } from '../data/translations';

type Screen = 'intro' | 'play' | 'done';

interface QuestionKnockoutProps {
  onBack: () => void;
}

export function QuestionKnockout({ onBack }: QuestionKnockoutProps) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [currentRound, setCurrentRound] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [switches, setSwitches] = useState(0);
  const [showBuzzerEffect, setShowBuzzerEffect] = useState(false);

  const { language } = useLanguage();
  const t = UI_TRANSLATIONS;

  // Shuffle scenarios on mount
  const scenarios = useMemo(
    () => shuffleAndPick(KNOCKOUT_SCENARIOS, KNOCKOUT_ROUNDS),
    []
  );

  const handleStart = () => {
    setScreen('play');
    setCurrentRound(0);
    setTimerRunning(false);
    setTimerKey(0);
    setSwitches(0);
  };

  const triggerBuzzer = () => {
    setSwitches((prev) => prev + 1);
    setShowBuzzerEffect(true);
    setTimeout(() => setShowBuzzerEffect(false), 1000);
  };

  const handleNext = () => {
    if (currentRound < scenarios.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentRound((prev) => prev + 1);
        setTimerRunning(false);
        setTimerKey((prev) => prev + 1);
        setIsAnimating(false);
      }, 200);
    } else {
      setScreen('done');
    }
  };

  const handleTimerStart = () => setTimerRunning(true);
  const handleTimerPause = () => setTimerRunning(false);
  const handleTimerComplete = () => setTimerRunning(false);

  const colorConfig = COLORS.orange;

  // Show "Switch Roles!" reminder at round 5
  const showSwitchReminder = currentRound === 4;

  const gameTitle = t.games.knockout.title[language];

  return (
    <GameWrapper gameId="knockout" title={gameTitle} color="orange" onBack={onBack}>
      {screen === 'intro' && (
        <IntroScreen
          gameId="knockout"
          title={gameTitle}
          color="orange"
          rules={t.knockout_rules[language]}
          onStart={handleStart}
          extraContent={
            <div className="flex items-center gap-2 mb-4 text-orange-400">
              <Bell size={18} />
              <span className="text-sm">{t.knockout_bellHint[language]}</span>
            </div>
          }
        />
      )}

      {screen === 'play' && (
        <div className="flex flex-col items-center">
          {/* Round indicator */}
          <p
            className="text-xs uppercase tracking-widest mb-4"
            style={{ color: 'rgba(255, 120, 71, 0.5)' }}
          >
            {t.scenario[language]} {currentRound + 1} {t.of[language]} {scenarios.length}
          </p>

          {/* Switch Roles reminder */}
          {showSwitchReminder && (
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full mb-4 animate-scale-in"
              style={{ backgroundColor: 'rgba(241, 196, 15, 0.2)', border: '1px solid rgba(241, 196, 15, 0.4)' }}
            >
              <RefreshCw size={18} className="text-yellow-400" />
              <span className="text-yellow-400 font-semibold">{t.knockout_switchRoles[language]}</span>
            </div>
          )}

          {/* Scenario card */}
          <div
            className={`w-full rounded-xl p-6 md:p-8 mb-6 transition-all duration-200 ${
              isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0 animate-slide-up'
            }`}
            style={{ backgroundColor: colorConfig.bg, border: `1px solid ${colorConfig.border}` }}
          >
            <p className="text-xl md:text-2xl lg:text-3xl text-white leading-relaxed text-center">
              {scenarios[currentRound][language]}
            </p>
          </div>

          {/* Timer */}
          <div className="mb-6">
            <Timer
              key={timerKey}
              totalSeconds={KNOCKOUT_TIMER_SECONDS}
              isRunning={timerRunning}
              onComplete={handleTimerComplete}
            />
          </div>

          {/* Buzzer Button */}
          <button
            onClick={triggerBuzzer}
            className={`w-full mb-4 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-lg transition-all ${
              showBuzzerEffect ? 'animate-pulse scale-105' : 'hover:scale-105 active:scale-95'
            }`}
            style={{
              backgroundColor: showBuzzerEffect ? '#C0392B' : '#E74C3C',
              color: '#ffffff',
            }}
          >
            <Bell size={24} />
            {t.knockout_buzzer[language]}
          </button>

          {switches > 0 && (
            <div className="text-center mb-4">
              <span className="text-orange-300 font-medium">{t.knockout_roleSwitches[language]}: {switches}</span>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <TimerControls
              isRunning={timerRunning}
              onStart={handleTimerStart}
              onPause={handleTimerPause}
            />
            <button
              onClick={handleNext}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: colorConfig.accent, color: '#ffffff' }}
            >
              {currentRound < scenarios.length - 1 ? t.knockout_nextScenario[language] : t.finish[language]}
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Footer reminder */}
          <div className="flex items-center gap-2 text-sm text-center" style={{ color: '#8899aa' }}>
            <span>{t.knockout_remember[language]}</span>
            <span style={{ color: colorConfig.accent }}>{t.knockout_questionsOnly[language]}</span>
            <span>{t.knockout_ifYouTell[language]}</span>
            <Bell size={16} style={{ color: colorConfig.accent }} />
          </div>

                  </div>
      )}

      {screen === 'done' && (
        <DoneScreen
          title={t.knockout_doneTitle[language]}
          message={t.knockout_doneMessage[language]}
          tableTalk={t.knockout_tableTalk[language]}
          color="orange"
          onBack={onBack}
          extraContent={
            <>
              {switches > 0 && (
                <div
                  className="w-full max-w-lg rounded-xl p-4 mb-4 text-center"
                  style={{ backgroundColor: 'rgba(255, 120, 71, 0.1)', border: '1px solid rgba(255, 120, 71, 0.3)' }}
                >
                  <p className="text-orange-300">
                    {t.knockout_roleSwitchesToday[language]} <strong>{switches}</strong> {switches !== 1 ? (language === 'es' ? 'cambios de rol' : 'role switches') : (language === 'es' ? 'cambio de rol' : 'role switch')} {language === 'es' ? 'hoy' : 'today'}!
                  </p>
                </div>
              )}
              <div
                className="w-full max-w-lg rounded-xl p-4 mb-4 text-center"
                style={{ backgroundColor: 'rgba(241, 196, 15, 0.1)', border: '1px solid rgba(241, 196, 15, 0.3)' }}
              >
                <p className="text-yellow-400 font-semibold mb-1">{t.knockout_victoryChallengeTitle[language]}</p>
                <p className="text-yellow-200 text-sm">
                  {t.knockout_victoryChallenge[language]}
                </p>
              </div>
            </>
          }
        />
      )}
    </GameWrapper>
  );
}
