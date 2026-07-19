'use client';

import { useState, useMemo } from 'react';
import { ChevronRight, ArrowLeft, RotateCcw } from 'lucide-react';
import { GameWrapper } from './GameWrapper';
import { ConfettiBurst } from './ConfettiBurst';
import { THIS_OR_THAT_SCENARIOS, THIS_OR_THAT_ROUNDS, PROFILE_TAGS } from '../data/thisOrThatData';
import type { ThisOrThatScenario } from '../data/thisOrThatData';
import { COLORS, shuffle } from '../data/gameConfig';
import { useLanguage } from '../context/LanguageContext';
import { useGameTracking } from '@/lib/hub/useGameTracking';
import { useGameBadgeCheck } from '@/components/hub/useGameBadgeCheck';
import { CommunityNudge } from './CommunityNudge';
import type { GradeBand } from '../data/gameSettings';

type Screen = 'grade-select' | 'play' | 'reveal' | 'reflect' | 'results';

interface ThisOrThatProps {
  onBack: () => void;
}

export function ThisOrThat({ onBack }: ThisOrThatProps) {
  const { language } = useLanguage();
  const lang = language === 'es' ? 'es' : 'en';
  const { logCompletion, startSession, logGameResponse, completeSession } = useGameTracking();

  const [screen, setScreen] = useState<Screen>('grade-select');
  const [gradeBand, setGradeBand] = useState<GradeBand>('all');
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<'a' | 'b' | null>(null);
  const [choices, setChoices] = useState<('a' | 'b')[]>([]);
  const [matchedMajority, setMatchedMajority] = useState(0);

  const scenarios = useMemo(() => {
    const filtered = THIS_OR_THAT_SCENARIOS.filter(
      s => s.gradeBands.includes('all') || s.gradeBands.includes(gradeBand)
    );
    return shuffle(filtered).slice(0, Math.min(THIS_OR_THAT_ROUNDS, filtered.length));
  }, [gradeBand]);

  const scenario = scenarios[current];
  const isLast = current === scenarios.length - 1;
  const badgeCelebration = useGameBadgeCheck(screen === 'results');

  // Get peer percentage for option A based on grade band
  const getPeerPctA = (s: ThisOrThatScenario): number => {
    return s.seedData[gradeBand] ?? s.seedData['all'] ?? 50;
  };

  const handleStart = async () => {
    setScreen('play');
    setCurrent(0);
    setSelected(null);
    setChoices([]);
    setMatchedMajority(0);
    await startSession('this-or-that', scenarios.length, { language, gradeBand });
  };

  const handleSelect = (choice: 'a' | 'b') => {
    if (selected) return;
    setSelected(choice);

    const pctA = getPeerPctA(scenario);
    const majorityIsA = pctA >= 50;
    const userPickedMajority = (choice === 'a' && majorityIsA) || (choice === 'b' && !majorityIsA);
    if (userPickedMajority) setMatchedMajority(prev => prev + 1);

    setChoices(prev => [...prev, choice]);

    logGameResponse('this-or-that', {
      itemId: scenario.id,
      roundNumber: current + 1,
      userAnswer: choice,
      correctAnswer: 'none',
      isCorrect: true, // no wrong answers in this game
    });

    setScreen('reveal');
  };

  const handleNext = () => {
    // Show reflection pause every 3 rounds (after round 3, 6)
    if ((current + 1) % 3 === 0 && !isLast) {
      setScreen('reflect');
      return;
    }

    if (isLast) {
      setScreen('results');
      logCompletion({ tool: 'this-or-that', totalRounds: scenarios.length });
      completeSession(matchedMajority, 0);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setScreen('play');
    }
  };

  const handleContinueFromReflect = () => {
    if (isLast) {
      setScreen('results');
      logCompletion({ tool: 'this-or-that', totalRounds: scenarios.length });
      completeSession(matchedMajority, 0);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setScreen('play');
    }
  };

  const handlePlayAgain = async () => {
    setCurrent(0);
    setSelected(null);
    setChoices([]);
    setMatchedMajority(0);
    setScreen('grade-select');
  };

  const accentColor = '#E8B84B';
  const confettiColors = ['#E8B84B', '#3498DB', '#FFFFFF', '#27AE60', '#9333EA'];

  const gradeBandOptions: { value: GradeBand; label: string }[] = [
    { value: 'all', label: lang === 'es' ? 'Todos los grados' : 'All Grades' },
    { value: 'k-2', label: 'K-2' },
    { value: '3-5', label: '3-5' },
    { value: '6-8', label: '6-8' },
    { value: '9-12', label: '9-12' },
  ];

  const gameTitle = lang === 'es' ? 'Esto o Aquello' : 'This or That';

  return (
    <GameWrapper gameId="knockout" title={gameTitle} color="orange" onBack={onBack}>
      {badgeCelebration}

      {/* ── GRADE SELECT ── */}
      {screen === 'grade-select' && (
        <div className="flex flex-col items-center text-center animate-fade-in">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: `${accentColor}15`, border: `2px solid ${accentColor}` }}
          >
            <span className="text-4xl" style={{ color: accentColor }}>?</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: "'Source Serif 4', serif" }}>
            {gameTitle}
          </h2>
          <p className="text-sm mb-6 max-w-md" style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
            {lang === 'es'
              ? 'Dos enfoques. Sin respuesta correcta. Elige el tuyo, luego ve como responden otros educadores.'
              : 'Two approaches. No right answer. Pick yours, then see how other educators respond.'}
          </p>

          <div
            className="w-full max-w-md rounded-xl p-5 mb-6"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {lang === 'es' ? 'Compara con educadores de tu nivel' : 'Compare with educators at your level'}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {gradeBandOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setGradeBand(opt.value)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    backgroundColor: gradeBand === opt.value ? `${accentColor}25` : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${gradeBand === opt.value ? accentColor : 'rgba(255,255,255,0.1)'}`,
                    color: gradeBand === opt.value ? accentColor : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: accentColor, color: '#0a1628' }}
          >
            {lang === 'es' ? 'Jugar' : "Let's Go"}
          </button>
        </div>
      )}

      {/* ── PLAY (CHOOSE) ── */}
      {screen === 'play' && scenario && (
        <div className="flex flex-col items-center animate-fade-in">
          {/* Progress dots */}
          <div className="flex gap-1.5 mb-4">
            {scenarios.map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ background: i === current ? accentColor : i < current ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.12)' }}
              />
            ))}
          </div>
          <p className="text-xs mb-6" style={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {lang === 'es' ? `Ronda ${current + 1} de ${scenarios.length}` : `Round ${current + 1} of ${scenarios.length}`}
          </p>

          {/* Scenario */}
          <div
            className="w-full rounded-xl p-6 mb-6"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <p className="text-base text-white leading-relaxed text-center" style={{ fontFamily: "'Source Serif 4', serif" }}>
              {scenario.context[lang]}
            </p>
            <p className="text-sm font-bold text-center mt-3" style={{ color: accentColor }}>
              {scenario.question[lang]}
            </p>
          </div>

          {/* Choices */}
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <button
              onClick={() => handleSelect('a')}
              className="flex-1 rounded-xl p-5 text-left transition-all hover:scale-[1.02] relative"
              style={{ backgroundColor: 'rgba(52,152,219,0.08)', border: '2px solid rgba(52,152,219,0.25)' }}
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center mb-3" style={{ background: '#3498DB', fontSize: 12, fontWeight: 800, color: 'white' }}>A</div>
              <p className="text-sm text-white leading-relaxed">{scenario.optionA[lang]}</p>
              <p className="text-xs mt-3 italic" style={{ color: 'rgba(255,255,255,0.4)' }}>{scenario.optionA.tag[lang]}</p>
            </button>

            <div className="flex items-center justify-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>OR</span>
              </div>
            </div>

            <button
              onClick={() => handleSelect('b')}
              className="flex-1 rounded-xl p-5 text-left transition-all hover:scale-[1.02] relative"
              style={{ backgroundColor: 'rgba(231,76,60,0.08)', border: '2px solid rgba(231,76,60,0.25)' }}
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center mb-3" style={{ background: '#E74C3C', fontSize: 12, fontWeight: 800, color: 'white' }}>B</div>
              <p className="text-sm text-white leading-relaxed">{scenario.optionB[lang]}</p>
              <p className="text-xs mt-3 italic" style={{ color: 'rgba(255,255,255,0.4)' }}>{scenario.optionB.tag[lang]}</p>
            </button>
          </div>
        </div>
      )}

      {/* ── REVEAL ── */}
      {screen === 'reveal' && scenario && selected && (
        <div className="flex flex-col items-center animate-fade-in">
          <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {lang === 'es' ? `Ronda ${current + 1} de ${scenarios.length}` : `Round ${current + 1} of ${scenarios.length}`}
          </p>

          {/* Peer compare bar */}
          <div className="w-full rounded-xl p-5 mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex w-full h-9 rounded-lg overflow-hidden mb-4">
              <div
                className="flex items-center justify-center text-sm font-bold text-white transition-all duration-1000"
                style={{ width: `${getPeerPctA(scenario)}%`, background: 'linear-gradient(90deg, #3498DB, #2980B9)', minWidth: 40 }}
              >
                {getPeerPctA(scenario)}%
              </div>
              <div
                className="flex items-center justify-center text-sm font-bold text-white transition-all duration-1000"
                style={{ width: `${100 - getPeerPctA(scenario)}%`, background: 'linear-gradient(90deg, #C0392B, #E74C3C)', minWidth: 40 }}
              >
                {100 - getPeerPctA(scenario)}%
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <p className="text-xs mb-1" style={{ color: '#3498DB' }}>A: {scenario.optionA.tag[lang]}</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{scenario.optionA[lang]}</p>
                {selected === 'a' && (
                  <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(52,152,219,0.2)', color: '#3498DB' }}>
                    {lang === 'es' ? 'Tu eleccion' : 'Your pick'}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs mb-1" style={{ color: '#E74C3C' }}>B: {scenario.optionB.tag[lang]}</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{scenario.optionB[lang]}</p>
                {selected === 'b' && (
                  <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(231,76,60,0.2)', color: '#E74C3C' }}>
                    {lang === 'es' ? 'Tu eleccion' : 'Your pick'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Insight */}
          <div className="w-full rounded-xl p-4 mb-4" style={{ backgroundColor: `${accentColor}10`, border: `1px solid ${accentColor}30` }}>
            <p className="text-xs font-bold mb-1" style={{ color: accentColor }}>{lang === 'es' ? 'El matiz' : 'The nuance'}</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{scenario.insight.nuance[lang]}</p>
          </div>

          {/* Research + What your choice reveals */}
          <div className="flex gap-3 w-full mb-4">
            <div className="flex-1 rounded-xl p-4" style={{ backgroundColor: 'rgba(52,152,219,0.06)', border: '1px solid rgba(52,152,219,0.15)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#3498DB' }}>{lang === 'es' ? 'La investigacion dice' : 'Research says'}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{scenario.insight.research[lang]}</p>
            </div>
            <div className="flex-1 rounded-xl p-4" style={{ backgroundColor: `${accentColor}08`, border: `1px solid ${accentColor}15` }}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: accentColor }}>{lang === 'es' ? 'Tu eleccion revela' : 'Your choice reveals'}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                {selected === 'a' ? scenario.insight.choiceReveals.a[lang] : scenario.insight.choiceReveals.b[lang]}
              </p>
            </div>
          </div>

          {/* Reflection */}
          <div className="w-full rounded-xl p-4 mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.12)' }}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{lang === 'es' ? 'Reflexion rapida' : 'Quick reflection'}</p>
            <p className="text-xs italic" style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{scenario.insight.reflection[lang]}</p>
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: accentColor, color: '#0a1628' }}
          >
            {isLast ? (lang === 'es' ? 'Ver resultados' : 'See Results') : (lang === 'es' ? 'Siguiente' : 'Next')}
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ── REFLECT PAUSE ── */}
      {screen === 'reflect' && (
        <div className="flex flex-col items-center text-center animate-fade-in">
          <p className="text-2xl mb-4">&#9998;</p>
          <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {lang === 'es' ? 'Pausa y reflexiona' : 'Pause and Reflect'}
          </p>
          <p className="text-base mb-5 max-w-md" style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, fontFamily: "'Source Serif 4', serif" }}>
            {lang === 'es'
              ? 'Mirando tus primeras elecciones, hay un patron en como respondes? Que te dice eso sobre tus instintos como educador?'
              : 'Looking at your choices so far -- is there a pattern in how you respond? What does that tell you about your teaching instincts?'}
          </p>
          <textarea
            placeholder={lang === 'es' ? 'Opcional: anota un pensamiento...' : 'Optional: jot down a thought...'}
            className="w-full max-w-md rounded-lg p-3 mb-2 resize-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: 13, height: 70, fontFamily: "'DM Sans', sans-serif" }}
          />
          <p className="text-[10px] mb-6" style={{ color: 'rgba(255,255,255,0.25)' }}>
            {lang === 'es' ? 'Privado. Solo tu puedes ver esto.' : 'Private. Only you can see this.'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleContinueFromReflect}
              className="px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
              style={{ backgroundColor: accentColor, color: '#0a1628' }}
            >
              {lang === 'es' ? 'Continuar' : 'Continue'}
            </button>
            <button
              onClick={handleContinueFromReflect}
              className="px-6 py-3 rounded-xl font-bold text-sm"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }}
            >
              {lang === 'es' ? 'Saltar' : 'Skip'}
            </button>
          </div>
        </div>
      )}

      {/* ── RESULTS ── */}
      {screen === 'results' && (
        <div className="flex flex-col items-center text-center animate-fade-in">
          <ConfettiBurst colors={confettiColors} particleCount={60} />

          <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {lang === 'es' ? 'Tu perfil de educador' : 'Your Educator Profile'}
          </p>

          {/* Stats */}
          <div className="flex gap-8 mb-6">
            <div className="text-center">
              <p className="text-4xl font-bold" style={{ color: accentColor, fontFamily: "'Source Serif 4', serif" }}>{matchedMajority}</p>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {lang === 'es' ? 'Con la mayoria' : 'Matched majority'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold" style={{ color: '#9333EA', fontFamily: "'Source Serif 4', serif" }}>{scenarios.length - matchedMajority}</p>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {lang === 'es' ? 'Contra la corriente' : 'Against the grain'}
              </p>
            </div>
          </div>

          {/* Profile tags */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {(() => {
              // Count tag frequency from choices
              const tagCounts = new Map<string, number>();
              choices.forEach((choice, i) => {
                if (i < scenarios.length) {
                  const tagKey = choice === 'a' ? scenarios[i].profileTags.a : scenarios[i].profileTags.b;
                  tagCounts.set(tagKey, (tagCounts.get(tagKey) ?? 0) + 1);
                }
              });
              // Show top 3 tags
              const sortedTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
              return sortedTags.map(([tagId]) => {
                const tag = PROFILE_TAGS[tagId];
                if (!tag) return null;
                return (
                  <div
                    key={tagId}
                    className="rounded-lg px-3 py-2"
                    style={{ background: `${tag.color}15`, border: `1px solid ${tag.color}30` }}
                  >
                    <p className="text-xs font-bold" style={{ color: tag.color }}>{tag.title[lang]}</p>
                    <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{tag.description[lang]}</p>
                  </div>
                );
              });
            })()}
          </div>

          {/* Summary */}
          <p className="text-sm mb-6 max-w-md" style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
            {matchedMajority >= 6
              ? (lang === 'es' ? 'Tus instintos se alinean con la mayoria de los educadores. Eso significa que tus enfoques son ampliamente validados y tu pensamiento es solido.' : 'Your instincts align with most educators. That means your approaches are widely validated and your thinking is solid.')
              : matchedMajority >= 4
              ? (lang === 'es' ? 'Coincidiste con la mayoria la mayor parte del tiempo, pero tus momentos contra la corriente muestran pensamiento independiente. Esa mezcla es poderosa.' : 'You matched the majority most of the time, but your against-the-grain moments show independent thinking. That mix is powerful.')
              : (lang === 'es' ? 'Fuiste contra la corriente mas que la mayoria. Eso no significa que estes equivocado -- significa que ves angulos que otros pierden. Eso es valioso en un equipo.' : 'You went against the grain more than most. That does not mean you are wrong -- it means you see angles others miss. That is valuable on a team.')}
          </p>

          {/* Final reflection */}
          <div className="w-full max-w-md rounded-xl p-4 mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.12)' }}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {lang === 'es' ? 'Reflexion final' : 'Final reflection'}
            </p>
            <p className="text-sm italic mb-3" style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, fontFamily: "'Source Serif 4', serif" }}>
              {lang === 'es'
                ? 'Que es una cosa que quieres intentar el lunes por la manana basado en lo que notaste sobre tus instintos hoy?'
                : 'What is one thing you want to try Monday morning based on what you noticed about your instincts today?'}
            </p>
            <textarea
              placeholder={lang === 'es' ? 'Tu compromiso del lunes...' : 'Your Monday commitment...'}
              className="w-full rounded-lg p-3 resize-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: 13, height: 60, fontFamily: "'DM Sans', sans-serif" }}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handlePlayAgain}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
              style={{ backgroundColor: accentColor, color: '#0a1628' }}
            >
              <RotateCcw size={16} />
              {lang === 'es' ? 'Jugar de nuevo' : 'Play Again'}
            </button>
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }}
            >
              <ArrowLeft size={16} />
              {lang === 'es' ? 'Volver' : 'Back to Games'}
            </button>
          </div>

          <CommunityNudge gameSlug="this-or-that" />
        </div>
      )}
    </GameWrapper>
  );
}
