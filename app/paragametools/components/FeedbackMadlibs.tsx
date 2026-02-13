'use client';

import { useState, useMemo } from 'react';
import { Smile, ChevronRight, Sparkles, Award, RotateCcw, Volume2 } from 'lucide-react';
import { GameWrapper } from './GameWrapper';
import { ConfettiBurst } from './ConfettiBurst';
import { MADLIBS_SCENARIOS, MADLIBS_SILLY_ROUNDS, SILLY_ROUND_PROMPTS } from '../data/madlibsData';
import { COLORS, shuffle } from '../data/gameConfig';
import { useLanguage } from '../context/LanguageContext';
import { UI_TRANSLATIONS } from '../data/translations';

type Screen = 'intro' | 'play' | 'done';

// Silly round phases: blind input → reveal silly → show real
// Real round phases: scenario → compare
type SillyPhase = 'blind_input' | 'reveal_silly' | 'show_real';
type RealPhase = 'scenario' | 'compare';

interface FeedbackMadlibsProps {
  onBack: () => void;
}

export function FeedbackMadlibs({ onBack }: FeedbackMadlibsProps) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [currentRound, setCurrentRound] = useState(0);
  const [sillyPhase, setSillyPhase] = useState<SillyPhase>('blind_input');
  const [realPhase, setRealPhase] = useState<RealPhase>('scenario');
  const [isAnimating, setIsAnimating] = useState(false);

  // Blind inputs for silly rounds (user doesn't see the sentence)
  const [blindInputs, setBlindInputs] = useState({ verb: '', skill: '', action: '' });

  // Real feedback inputs for practice rounds
  const [realInputs, setRealInputs] = useState({ notice: '', name: '', nextStep: '' });

  const { language } = useLanguage();
  const t = UI_TRANSLATIONS;

  // Shuffle scenarios on mount
  const scenarios = useMemo(() => shuffle(MADLIBS_SCENARIOS), []);

  const colorConfig = COLORS.purple;
  const isSillyRound = currentRound < MADLIBS_SILLY_ROUNDS;
  const scenario = scenarios[currentRound % scenarios.length];

  // Get prompts for current silly round
  const currentPrompts = isSillyRound ? SILLY_ROUND_PROMPTS[currentRound % SILLY_ROUND_PROMPTS.length].prompts : [];

  const gameTitle = t.games.madlibs.title[language];

  const handleStart = () => {
    setScreen('play');
    setCurrentRound(0);
    setSillyPhase('blind_input');
    setRealPhase('scenario');
    resetInputs();
  };

  const resetInputs = () => {
    setBlindInputs({ verb: '', skill: '', action: '' });
    setRealInputs({ notice: '', name: '', nextStep: '' });
  };

  // Silly round: reveal the madlib
  const handleReveal = () => {
    if (blindInputs.verb && blindInputs.skill && blindInputs.action) {
      setSillyPhase('reveal_silly');
    }
  };

  // Silly round: show real version
  const handleShowReal = () => {
    setSillyPhase('show_real');
  };

  // Real round: show comparison
  const handleCompare = () => {
    if (realInputs.notice && realInputs.name && realInputs.nextStep) {
      setRealPhase('compare');
    }
  };

  const handleNext = () => {
    if (currentRound < scenarios.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentRound((prev) => prev + 1);
        const nextRound = currentRound + 1;
        if (nextRound < MADLIBS_SILLY_ROUNDS) {
          setSillyPhase('blind_input');
        } else {
          setRealPhase('scenario');
        }
        resetInputs();
        setIsAnimating(false);
      }, 200);
    } else {
      setScreen('done');
    }
  };

  // The revealed silly feedback sentence
  const sillyFeedback = language === 'es'
    ? `Veo que ${blindInputs.verb}. Eso se llama ${blindInputs.skill}. Ahora intenta ${blindInputs.action}.`
    : `I see that you ${blindInputs.verb}. That's called ${blindInputs.skill}. Now try ${blindInputs.action}.`;

  const realFeedbackFull = `${scenario.realFeedback.notice[language]}. ${scenario.realFeedback.name[language]}. ${scenario.realFeedback.nextStep[language]}.`;

  return (
    <GameWrapper gameId="madlibs" title={gameTitle} color="purple" onBack={onBack}>
      {/* INTRO SCREEN */}
      {screen === 'intro' && (
        <div className="flex flex-col items-center text-center animate-fade-in">
          <div
            className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-4 animate-bounce"
            style={{ backgroundColor: colorConfig.bg, border: `2px solid ${colorConfig.accent}` }}
          >
            <Smile size={48} style={{ color: colorConfig.accent }} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#ffffff' }}>{gameTitle}</h2>
          <p className="text-xl text-purple-300 mb-6">
            {language === 'es' ? '¡Llena palabras A CIEGAS, luego mira la magia!' : 'Fill in words BLIND, then watch the magic!'}
          </p>

          {/* Rules box */}
          <div
            className="w-full max-w-lg rounded-xl p-6 mb-4"
            style={{ backgroundColor: colorConfig.bg, border: `1px solid ${colorConfig.border}` }}
          >
            <ul className="space-y-3 text-left">
              {t.madlibs_rules[language].map((rule, i) => (
                <li key={i} className="flex items-start gap-3" style={{ color: '#ffffff' }}>
                  <span style={{ color: colorConfig.accent }}>{i + 1}.</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Hint */}
          <div
            className="w-full max-w-lg rounded-lg p-4 mb-6"
            style={{ backgroundColor: 'rgba(147, 51, 234, 0.2)' }}
          >
            <p className="text-sm text-purple-200 italic">
              {language === 'es'
                ? 'Entre más tontas tus respuestas, más te vas a reír. Confía en nosotros.'
                : 'The sillier your answers, the harder you\'ll laugh. Trust us.'}
            </p>
          </div>

          <button
            onClick={handleStart}
            className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: colorConfig.accent, color: '#ffffff' }}
          >
            {language === 'es' ? '¡Vamos a lo Ridículo!' : "Let's Get Ridiculous!"}
          </button>
        </div>
      )}

      {/* PLAY SCREEN */}
      {screen === 'play' && (
        <div className="flex flex-col items-center">
          {/* Round indicator */}
          <p
            className="text-xs uppercase tracking-widest mb-4"
            style={{ color: 'rgba(147, 51, 234, 0.5)' }}
          >
            {isSillyRound
              ? (language === 'es' ? 'RONDA TONTA' : 'SILLY ROUND')
              : (language === 'es' ? 'PRÁCTICA REAL' : 'REAL PRACTICE')
            } {currentRound + 1} {t.of[language]} {scenarios.length}
          </p>

          {/* ============ SILLY ROUNDS ============ */}

          {/* PHASE 1: BLIND INPUT - No sentence visible! */}
          {isSillyRound && sillyPhase === 'blind_input' && (
            <div className={`w-full space-y-6 transition-all duration-200 ${
              isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0 animate-slide-up'
            }`}>
              {/* Big fun header */}
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🎲</div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: '#ffffff' }}>
                  {language === 'es' ? '¡Llena estas palabras!' : 'Fill in these words!'}
                </h3>
                <p className="text-purple-300">
                  {language === 'es'
                    ? 'No te preocupes por qué — ¡solo sé lo más TONTO posible!'
                    : "Don't worry about why — just be as SILLY as possible!"}
                </p>
              </div>

              {/* Blind prompt inputs - NO SENTENCE TEMPLATE VISIBLE */}
              <div className="space-y-5">
                {currentPrompts.map((prompt, index) => (
                  <div
                    key={prompt.id}
                    className="rounded-xl p-5"
                    style={{ backgroundColor: 'rgba(147, 51, 234, 0.1)', border: '1px solid rgba(147, 51, 234, 0.3)' }}
                  >
                    <label className="block text-lg font-medium mb-3" style={{ color: '#ffffff' }}>
                      {index + 1}. {prompt.label[language]}:
                    </label>
                    <input
                      type="text"
                      placeholder={prompt.placeholder[language]}
                      value={blindInputs[prompt.id as keyof typeof blindInputs]}
                      onChange={(e) => setBlindInputs((prev) => ({ ...prev, [prompt.id]: e.target.value }))}
                      className="w-full bg-slate-700 border-2 border-purple-500/50 rounded-lg px-4 py-3 text-white text-lg placeholder:text-slate-400 focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={handleReveal}
                disabled={!blindInputs.verb || !blindInputs.skill || !blindInputs.action}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ backgroundColor: colorConfig.accent, color: '#ffffff' }}
              >
                <Sparkles size={20} />
                {language === 'es' ? '¡REVELAR MI RETROALIMENTACIÓN!' : 'REVEAL MY FEEDBACK!'}
              </button>
            </div>
          )}

          {/* PHASE 2: REVEAL SILLY - The big laugh moment */}
          {isSillyRound && sillyPhase === 'reveal_silly' && (
            <div className="w-full space-y-6 animate-fade-in">
              {/* Read aloud instruction */}
              <div
                className="rounded-xl p-4 text-center"
                style={{ backgroundColor: 'rgba(251, 146, 60, 0.2)', border: '1px solid rgba(251, 146, 60, 0.4)' }}
              >
                <div className="flex items-center justify-center gap-2 text-orange-300 font-bold text-lg mb-1">
                  <Volume2 size={24} />
                  {language === 'es' ? '¡LEE ESTO EN VOZ ALTA A TU MESA!' : 'READ THIS OUT LOUD TO YOUR TABLE!'}
                </div>
                <p className="text-orange-200 text-sm">
                  {language === 'es' ? '¡No se permite susurrar!' : 'No whispering allowed!'}
                </p>
              </div>

              {/* The reveal - their silly feedback */}
              <div
                className="rounded-2xl p-6 md:p-8"
                style={{ backgroundColor: 'rgba(147, 51, 234, 0.15)', border: '2px solid rgba(147, 51, 234, 0.4)' }}
              >
                <p className="text-2xl md:text-3xl leading-relaxed font-medium text-center" style={{ color: '#ffffff' }}>
                  "{sillyFeedback}"
                </p>
              </div>

              {/* Formula breakdown */}
              <div className="flex flex-wrap items-center justify-center gap-3 text-base">
                <span className="bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded-lg font-medium">
                  {language === 'es' ? 'Observar' : 'Notice'}
                </span>
                <span className="text-slate-500">→</span>
                <span className="bg-green-500/20 text-green-300 px-3 py-1.5 rounded-lg font-medium">
                  {language === 'es' ? 'Nombrar' : 'Name'}
                </span>
                <span className="text-slate-500">→</span>
                <span className="bg-purple-500/20 text-purple-300 px-3 py-1.5 rounded-lg font-medium">
                  {language === 'es' ? 'Siguiente Paso' : 'Next Step'}
                </span>
              </div>

              {/* Insight */}
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <p className="text-slate-300">
                  <span className="text-xl mr-2">😂</span>
                  {language === 'es'
                    ? '¡Aunque sea COMPLETAMENTE ABSURDA, la fórmula funciona!'
                    : "Even when it's COMPLETELY ABSURD, the formula still works!"}
                </p>
              </div>

              <button
                onClick={handleShowReal}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: '#27AE60', color: '#ffffff' }}
              >
                {language === 'es' ? 'Ver la Versión REAL' : 'See the REAL Version'}
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          {/* PHASE 3: SHOW REAL - Compare silly to professional */}
          {isSillyRound && sillyPhase === 'show_real' && (
            <div className="w-full space-y-6 animate-fade-in">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2" style={{ color: '#ffffff' }}>
                  {language === 'es'
                    ? 'Ahora aquí está la retroalimentación REAL para el mismo escenario:'
                    : "Now here's REAL feedback for the same scenario:"}
                </h3>
              </div>

              {/* Scenario context */}
              <div
                className="rounded-xl p-5"
                style={{ backgroundColor: colorConfig.bg, border: `1px solid ${colorConfig.border}` }}
              >
                <p className="text-xs uppercase tracking-wide mb-2" style={{ color: colorConfig.accent }}>
                  {language === 'es' ? 'Escenario' : 'Scenario'}
                </p>
                <p style={{ color: '#ffffff' }}>{scenario.text[language]}</p>
                <p className="text-slate-400 text-sm mt-2">{scenario.context[language]}</p>
              </div>

              {/* Side by side comparison */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Their silly version */}
                <div
                  className="rounded-xl p-5"
                  style={{ backgroundColor: 'rgba(147, 51, 234, 0.1)', border: '1px solid rgba(147, 51, 234, 0.3)' }}
                >
                  <h4 className="text-purple-300 font-semibold mb-3 flex items-center gap-2">
                    <span className="text-xl">😂</span> {language === 'es' ? 'TU VERSIÓN TONTA:' : 'YOUR SILLY VERSION:'}
                  </h4>
                  <p className="italic" style={{ color: '#ffffff' }}>"{sillyFeedback}"</p>
                </div>

                {/* Real professional version */}
                <div
                  className="rounded-xl p-5"
                  style={{ backgroundColor: 'rgba(39, 174, 96, 0.1)', border: '1px solid rgba(39, 174, 96, 0.3)' }}
                >
                  <h4 className="text-green-300 font-semibold mb-3 flex items-center gap-2">
                    <span className="text-xl">✓</span> {language === 'es' ? 'VERSIÓN PROFESIONAL:' : 'PROFESSIONAL VERSION:'}
                  </h4>
                  <p style={{ color: '#ffffff' }}>"{realFeedbackFull}"</p>
                </div>
              </div>

              {/* Key insight */}
              <div className="bg-slate-800/50 rounded-lg p-5 text-center">
                <p className="text-lg font-medium mb-2" style={{ color: '#ffffff' }}>
                  🎯 {language === 'es' ? '¡MISMO PATRÓN!' : 'SAME PATTERN!'}
                </p>
                <p className="text-slate-300">
                  {language === 'es'
                    ? `Observar → Nombrar → Siguiente Paso funciona ya sea que estés hablando de "${blindInputs.skill}" o del aprendizaje real del estudiante.`
                    : `Notice → Name → Next Step works whether you're talking about "${blindInputs.skill}" or actual student learning.`}
                </p>
              </div>

              <button
                onClick={handleNext}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: colorConfig.accent, color: '#ffffff' }}
              >
                {currentRound < scenarios.length - 1
                  ? (language === 'es' ? '¡Siguiente Ronda!' : 'Next Round!')
                  : (language === 'es' ? '¡Terminar!' : 'Finish!')}
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          {/* ============ REAL ROUNDS ============ */}

          {/* PHASE 1: SCENARIO - Write real feedback */}
          {!isSillyRound && realPhase === 'scenario' && (
            <div className={`w-full space-y-6 transition-all duration-200 ${
              isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0 animate-slide-up'
            }`}>
              {/* Scenario Card */}
              <div
                className="rounded-xl p-6"
                style={{ backgroundColor: colorConfig.bg, border: `1px solid ${colorConfig.border}` }}
              >
                <p className="text-xs uppercase tracking-wide mb-2" style={{ color: colorConfig.accent }}>
                  {language === 'es' ? 'Escenario' : 'Scenario'}
                </p>
                <h3 className="text-lg md:text-xl font-semibold mb-2" style={{ color: '#ffffff' }}>{scenario.text[language]}</h3>
                <p className="text-slate-300 text-sm">{scenario.context[language]}</p>
              </div>

              <div className="text-center">
                <p className="text-lg text-green-300 font-medium">
                  {language === 'es'
                    ? 'AHORA TÚ INTENTA: ¡Escribe retroalimentación Nivel 3 real!'
                    : 'NOW YOU TRY: Write real Level 3 feedback!'}
                </p>
              </div>

              {/* Real feedback inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    <span className="text-blue-400 font-medium mr-2">{language === 'es' ? 'OBSERVAR' : 'NOTICE'}</span>
                    {language === 'es' ? '¿Qué viste que hizo el estudiante?' : 'What did you see the student do?'}
                  </label>
                  <textarea
                    placeholder={language === 'es' ? 'Veo que tú...' : 'I see that you...'}
                    value={realInputs.notice}
                    onChange={(e) => setRealInputs((prev) => ({ ...prev, notice: e.target.value }))}
                    className="w-full bg-slate-700 border border-blue-500/50 rounded-lg px-4 py-3 text-white placeholder:text-slate-400 h-20 resize-none focus:border-blue-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    <span className="text-green-400 font-medium mr-2">{language === 'es' ? 'NOMBRAR' : 'NAME'}</span>
                    {language === 'es' ? '¿Qué habilidad o estrategia es esa?' : 'What skill or strategy is that?'}
                  </label>
                  <textarea
                    placeholder={language === 'es' ? 'Eso se llama...' : "That's called..."}
                    value={realInputs.name}
                    onChange={(e) => setRealInputs((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-700 border border-green-500/50 rounded-lg px-4 py-3 text-white placeholder:text-slate-400 h-20 resize-none focus:border-green-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    <span className="text-purple-400 font-medium mr-2">{language === 'es' ? 'SIGUIENTE PASO' : 'NEXT STEP'}</span>
                    {language === 'es' ? '¿Qué deberían intentar ahora?' : 'What should they try now?'}
                  </label>
                  <textarea
                    placeholder={language === 'es' ? 'Ahora intenta...' : 'Now try...'}
                    value={realInputs.nextStep}
                    onChange={(e) => setRealInputs((prev) => ({ ...prev, nextStep: e.target.value }))}
                    className="w-full bg-slate-700 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder:text-slate-400 h-20 resize-none focus:border-purple-400 focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleCompare}
                disabled={!realInputs.notice || !realInputs.name || !realInputs.nextStep}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ backgroundColor: '#27AE60', color: '#ffffff' }}
              >
                {language === 'es' ? 'Ver un Ejemplo' : 'See an Example'}
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          {/* PHASE 2: COMPARE - Show their version vs example */}
          {!isSillyRound && realPhase === 'compare' && (
            <div className="w-full space-y-6 animate-fade-in">
              <div className="grid md:grid-cols-2 gap-4">
                {/* User's Version */}
                <div
                  className="rounded-xl p-5"
                  style={{ backgroundColor: 'rgba(52, 152, 219, 0.1)', border: '1px solid rgba(52, 152, 219, 0.3)' }}
                >
                  <h4 className="text-blue-300 font-semibold mb-3">{language === 'es' ? 'TU VERSIÓN:' : 'YOUR VERSION:'}</h4>
                  <p className="mb-3" style={{ color: '#ffffff' }}>
                    {realInputs.notice}. {realInputs.name}. {realInputs.nextStep}.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">{language === 'es' ? 'Observar ✓' : 'Notice ✓'}</span>
                    <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">{language === 'es' ? 'Nombrar ✓' : 'Name ✓'}</span>
                    <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">{language === 'es' ? 'Siguiente ✓' : 'Next Step ✓'}</span>
                  </div>
                </div>

                {/* Example Version */}
                <div
                  className="rounded-xl p-5"
                  style={{ backgroundColor: 'rgba(39, 174, 96, 0.1)', border: '1px solid rgba(39, 174, 96, 0.3)' }}
                >
                  <h4 className="text-green-300 font-semibold mb-3">{language === 'es' ? 'VERSIÓN EJEMPLO:' : 'EXAMPLE VERSION:'}</h4>
                  <p style={{ color: '#ffffff' }}>"{realFeedbackFull}"</p>
                  <p className="text-sm text-green-200 mt-3">
                    {language === 'es' ? '¡Ambas funcionan! La fórmula es flexible.' : 'Both work! The formula is flexible.'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: colorConfig.accent, color: '#ffffff' }}
              >
                {currentRound < scenarios.length - 1
                  ? (language === 'es' ? '¡Siguiente Ronda!' : 'Next Round!')
                  : (language === 'es' ? '¡Terminar!' : 'Finish!')}
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* DONE SCREEN */}
      {screen === 'done' && (
        <div className="flex flex-col items-center text-center">
          <ConfettiBurst colors={['#9333ea', '#a855f7', '#c084fc']} />

          <div
            className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-4 animate-bounce"
            style={{ backgroundColor: colorConfig.bg, border: `2px solid ${colorConfig.accent}` }}
          >
            <Award size={48} style={{ color: colorConfig.accent }} />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: '#ffffff' }}>
            {language === 'es' ? '¡Fórmula = Infalible!' : 'Formula = Bulletproof!'}
          </h2>
          <p className="text-xl text-purple-200 mb-6">
            {language === 'es'
              ? 'Acabas de probar que Observar → Nombrar → Siguiente Paso funciona para TODO.'
              : 'You just proved Notice → Name → Next Step works for EVERYTHING.'}
          </p>

          <div
            className="w-full max-w-lg rounded-xl p-6 mb-6"
            style={{ backgroundColor: colorConfig.bg, border: `1px solid ${colorConfig.border}` }}
          >
            <p className="text-lg text-purple-100 leading-relaxed">
              {language === 'es'
                ? 'Desde "psicología avanzada de pollos" hasta retroalimentación real para estudiantes — misma fórmula, misma fuerza. Así es como sabes que es inquebrantable.'
                : 'From "advanced chicken psychology" to actual student feedback — same formula, same strength. That\'s how you know it\'s unbreakable.'}
            </p>
          </div>

          {/* Formula reminder */}
          <div className="flex items-center justify-center gap-2 font-medium mb-6" style={{ color: '#ffffff' }}>
            <span className="text-blue-400">{language === 'es' ? 'OBSERVAR' : 'NOTICE'}</span>
            <span className="text-slate-500">→</span>
            <span className="text-green-400">{language === 'es' ? 'NOMBRAR' : 'NAME'}</span>
            <span className="text-slate-500">→</span>
            <span className="text-purple-400">{language === 'es' ? 'SIGUIENTE' : 'NEXT STEP'}</span>
          </div>

          {/* Table Talk */}
          <div className="w-full max-w-lg bg-slate-800/50 rounded-xl p-6 mb-6">
            <p className="text-sm uppercase tracking-wider mb-3" style={{ color: colorConfig.accent }}>
              {t.tableTalk[language]}
            </p>
            <div className="space-y-2 text-slate-300 text-left">
              <p>• {language === 'es' ? '¿Cuál retroalimentación ridícula causó más risas?' : 'Which ridiculous feedback got the biggest laugh?'}</p>
              <p>• {language === 'es' ? '¿Qué materia falsa deberían ofrecer las universidades?' : 'What fake subject should universities offer?'}</p>
              <p>• {language === 'es' ? '¡Levanta la mano si vas a recordar mejor la fórmula ahora!' : "Raise your hand if you'll remember the formula better now!"}</p>
            </div>
          </div>

          <button
            onClick={onBack}
            className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#ffffff' }}
          >
            <RotateCcw size={20} />
            {t.backToGames[language]}
          </button>
        </div>
      )}
    </GameWrapper>
  );
}
