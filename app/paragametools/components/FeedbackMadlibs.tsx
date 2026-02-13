'use client';

import { useState, useMemo } from 'react';
import { Smile, ChevronRight, Eye, Award, ArrowLeft, RotateCcw } from 'lucide-react';
import { GameWrapper, DoneScreen } from './GameWrapper';
import { ConfettiBurst } from './ConfettiBurst';
import { MADLIBS_SCENARIOS, MADLIBS_SILLY_ROUNDS, MADLIBS_PROMPTS } from '../data/madlibsData';
import { COLORS, shuffle } from '../data/gameConfig';

type Screen = 'intro' | 'play' | 'done';
type PlayPhase = 'input' | 'comparison' | 'real-input' | 'real-check';

interface FeedbackMadlibsProps {
  onBack: () => void;
}

export function FeedbackMadlibs({ onBack }: FeedbackMadlibsProps) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [currentRound, setCurrentRound] = useState(0);
  const [playPhase, setPlayPhase] = useState<PlayPhase>('input');
  const [isAnimating, setIsAnimating] = useState(false);

  // Madlib inputs for silly rounds
  const [madlibInputs, setMadlibInputs] = useState({ verb: '', skill: '', action: '' });

  // Real feedback inputs for practice rounds
  const [realInputs, setRealInputs] = useState({ notice: '', name: '', nextStep: '' });

  // Shuffle scenarios on mount
  const scenarios = useMemo(() => shuffle(MADLIBS_SCENARIOS), []);

  const colorConfig = COLORS.purple;
  const isSillyRound = currentRound < MADLIBS_SILLY_ROUNDS;
  const scenario = scenarios[currentRound % scenarios.length];

  const handleStart = () => {
    setScreen('play');
    setCurrentRound(0);
    setPlayPhase('input');
    resetInputs();
  };

  const resetInputs = () => {
    setMadlibInputs({ verb: '', skill: '', action: '' });
    setRealInputs({ notice: '', name: '', nextStep: '' });
  };

  const handleMadlibReveal = () => {
    if (madlibInputs.verb && madlibInputs.skill && madlibInputs.action) {
      setPlayPhase('comparison');
    }
  };

  const handleRealCheck = () => {
    if (realInputs.notice && realInputs.name && realInputs.nextStep) {
      setPlayPhase('real-check');
    }
  };

  const handleNext = () => {
    if (currentRound < scenarios.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentRound((prev) => prev + 1);
        // Determine phase for next round
        const nextRound = currentRound + 1;
        if (nextRound < MADLIBS_SILLY_ROUNDS) {
          setPlayPhase('input');
        } else {
          setPlayPhase('real-input');
        }
        resetInputs();
        setIsAnimating(false);
      }, 200);
    } else {
      setScreen('done');
    }
  };

  const sillyFeedback = `I see that you ${madlibInputs.verb || '___'}. That's called ${madlibInputs.skill || '___'}. Now try ${madlibInputs.action || '___'}.`;
  const realFeedbackFull = `${scenario.realFeedback.notice}. ${scenario.realFeedback.name}. ${scenario.realFeedback.nextStep}.`;

  return (
    <GameWrapper gameId="madlibs" title="Feedback Madlibs" color="purple" onBack={onBack}>
      {/* INTRO SCREEN */}
      {screen === 'intro' && (
        <div className="flex flex-col items-center text-center animate-fade-in">
          <div
            className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-4 animate-bounce"
            style={{ backgroundColor: colorConfig.bg, border: `2px solid ${colorConfig.accent}` }}
          >
            <Smile size={48} style={{ color: colorConfig.accent }} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Feedback Madlibs</h2>
          <p className="text-xl text-purple-300 mb-6">Practice the formula... with a TWIST!</p>

          {/* Rules box */}
          <div
            className="w-full max-w-lg rounded-xl p-6 mb-4"
            style={{ backgroundColor: colorConfig.bg, border: `1px solid ${colorConfig.border}` }}
          >
            <ul className="space-y-3 text-left">
              <li className="flex items-start gap-3 text-white">
                <span style={{ color: colorConfig.accent }}>1.</span>
                <span>Fill in the MOST RIDICULOUS words you can think of</span>
              </li>
              <li className="flex items-start gap-3 text-white">
                <span style={{ color: colorConfig.accent }}>2.</span>
                <span>Read your creation OUT LOUD (no whispering!)</span>
              </li>
              <li className="flex items-start gap-3 text-white">
                <span style={{ color: colorConfig.accent }}>3.</span>
                <span>Then write REAL feedback for the same scenario</span>
              </li>
              <li className="flex items-start gap-3 text-white">
                <span style={{ color: colorConfig.accent }}>4.</span>
                <span>Watch: same formula works for everything!</span>
              </li>
            </ul>
          </div>

          {/* Humor hint */}
          <div
            className="w-full max-w-lg rounded-lg p-4 mb-6"
            style={{ backgroundColor: 'rgba(147, 51, 234, 0.2)' }}
          >
            <p className="text-sm text-purple-200 italic">
              If it works for "advanced chicken psychology," it works for actual students.
            </p>
          </div>

          {/* Formula Reminder */}
          <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
            <p className="text-slate-300 text-sm uppercase tracking-wide mb-2">The Formula</p>
            <div className="flex items-center justify-center gap-2 text-white font-medium">
              <span className="text-blue-400">NOTICE</span>
              <span className="text-slate-500">→</span>
              <span className="text-green-400">NAME</span>
              <span className="text-slate-500">→</span>
              <span className="text-purple-400">NEXT STEP</span>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95 animate-glow-pulse"
            style={{
              backgroundColor: colorConfig.accent,
              color: '#ffffff',
              ['--glow-color' as string]: colorConfig.accent + '40',
            }}
          >
            Let's Get Ridiculous! →
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
            {isSillyRound ? 'SILLY' : 'REAL'} ROUND {currentRound + 1} OF {scenarios.length}
          </p>

          {/* Scenario Card */}
          <div
            className={`w-full rounded-xl p-6 mb-6 transition-all duration-200 ${
              isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0 animate-slide-up'
            }`}
            style={{ backgroundColor: colorConfig.bg, border: `1px solid ${colorConfig.border}` }}
          >
            <p className="text-xs uppercase tracking-wide mb-2" style={{ color: colorConfig.accent }}>
              Scenario
            </p>
            <h3 className="text-lg md:text-xl font-semibold text-white mb-2">{scenario.text}</h3>
            <p className="text-slate-300 text-sm">{scenario.context}</p>
          </div>

          {/* SILLY ROUND - Input Phase */}
          {isSillyRound && playPhase === 'input' && (
            <div className="w-full space-y-6 animate-fade-in">
              <div className="text-center">
                <p className="text-lg text-purple-200 mb-1">
                  Fill these blanks with the MOST RIDICULOUS words:
                </p>
                <p className="text-sm text-purple-300 italic">
                  The weirder, the better! Go for genuine belly laughs.
                </p>
              </div>

              <div className="space-y-5">
                {/* Verb input */}
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <span className="text-white whitespace-nowrap font-medium">I see that you</span>
                    <input
                      type="text"
                      placeholder={MADLIBS_PROMPTS[0].placeholder}
                      value={madlibInputs.verb}
                      onChange={(e) => setMadlibInputs((prev) => ({ ...prev, verb: e.target.value }))}
                      className="bg-slate-700 border border-purple-500/50 rounded-lg px-3 py-2 text-white placeholder:text-slate-400 flex-1 w-full sm:w-auto focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                  <p className="text-xs text-purple-300 pl-0 sm:pl-32">
                    <span className="text-purple-400">{MADLIBS_PROMPTS[0].label}</span> — Try: {MADLIBS_PROMPTS[0].examples.slice(0, 2).join(', ')}
                  </p>
                </div>

                {/* Skill input */}
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <span className="text-white whitespace-nowrap font-medium">That's called</span>
                    <input
                      type="text"
                      placeholder={MADLIBS_PROMPTS[1].placeholder}
                      value={madlibInputs.skill}
                      onChange={(e) => setMadlibInputs((prev) => ({ ...prev, skill: e.target.value }))}
                      className="bg-slate-700 border border-purple-500/50 rounded-lg px-3 py-2 text-white placeholder:text-slate-400 flex-1 w-full sm:w-auto focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                  <p className="text-xs text-purple-300 pl-0 sm:pl-28">
                    <span className="text-purple-400">{MADLIBS_PROMPTS[1].label}</span> — Try: {MADLIBS_PROMPTS[1].examples.slice(0, 2).join(', ')}
                  </p>
                </div>

                {/* Action input */}
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <span className="text-white whitespace-nowrap font-medium">Now try</span>
                    <input
                      type="text"
                      placeholder={MADLIBS_PROMPTS[2].placeholder}
                      value={madlibInputs.action}
                      onChange={(e) => setMadlibInputs((prev) => ({ ...prev, action: e.target.value }))}
                      className="bg-slate-700 border border-purple-500/50 rounded-lg px-3 py-2 text-white placeholder:text-slate-400 flex-1 w-full sm:w-auto focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                  <p className="text-xs text-purple-300 pl-0 sm:pl-16">
                    <span className="text-purple-400">{MADLIBS_PROMPTS[2].label}</span> — Try: {MADLIBS_PROMPTS[2].examples.slice(0, 2).join(', ')}
                  </p>
                </div>
              </div>

              <button
                onClick={handleMadlibReveal}
                disabled={!madlibInputs.verb || !madlibInputs.skill || !madlibInputs.action}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ backgroundColor: colorConfig.accent, color: '#ffffff' }}
              >
                <Eye size={20} />
                Read It Out Loud! (No Whispering!)
              </button>
            </div>
          )}

          {/* SILLY ROUND - Comparison Phase */}
          {isSillyRound && playPhase === 'comparison' && (
            <div className="w-full space-y-6 animate-fade-in">
              <div className="text-center">
                <h3 className="text-xl font-bold text-purple-300 mb-2">
                  The Power of Pattern Recognition
                </h3>
                <p className="text-purple-200">
                  Read your silly version OUT LOUD, then compare:
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Silly Version */}
                <div
                  className="rounded-xl p-5"
                  style={{ backgroundColor: 'rgba(147, 51, 234, 0.1)', border: '1px solid rgba(147, 51, 234, 0.3)' }}
                >
                  <h4 className="text-purple-300 font-semibold mb-3 flex items-center gap-2">
                    <span className="text-2xl">😂</span> YOUR RIDICULOUS VERSION:
                  </h4>
                  <div className="bg-purple-800/30 rounded-lg p-4 mb-3">
                    <p className="text-white text-lg italic leading-relaxed">"{sillyFeedback}"</p>
                  </div>
                  <div className="text-sm text-purple-200 bg-purple-600/20 rounded p-2">
                    <strong>Absurd but notice:</strong> Still follows Notice → Name → Next Step!
                  </div>
                </div>

                {/* Real Version */}
                <div
                  className="rounded-xl p-5"
                  style={{ backgroundColor: 'rgba(39, 174, 96, 0.1)', border: '1px solid rgba(39, 174, 96, 0.3)' }}
                >
                  <h4 className="text-green-300 font-semibold mb-3 flex items-center gap-2">
                    <span className="text-xl">✓</span> THE PROFESSIONAL VERSION:
                  </h4>
                  <div className="bg-green-800/30 rounded-lg p-4 mb-3">
                    <p className="text-white text-lg leading-relaxed">"{realFeedbackFull}"</p>
                  </div>
                  <div className="text-sm text-green-200 bg-green-600/20 rounded p-2 flex items-center gap-1 flex-wrap">
                    <span className="font-semibold">Same pattern:</span>
                    <span className="text-blue-300">Notice</span>→
                    <span className="text-green-300">Name</span>→
                    <span className="text-purple-300">Next Step</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-5 text-center">
                <p className="text-slate-300 text-lg">
                  <strong className="text-white">Here's the magic:</strong> Both follow the exact same pattern!
                </p>
                <p className="text-slate-400 mt-2">
                  If it works for "{madlibInputs.skill}", it definitely works for real students.
                </p>
              </div>

              <button
                onClick={handleNext}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: colorConfig.accent, color: '#ffffff' }}
              >
                {currentRound < scenarios.length - 1 ? 'That Was Hilarious → Next Round' : 'Finish'}
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          {/* REAL ROUND - Input Phase */}
          {!isSillyRound && playPhase === 'real-input' && (
            <div className="w-full space-y-6 animate-fade-in">
              <p className="text-center text-lg text-green-200">
                NOW FOR REAL: Write Level 3 feedback using the formula
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    <span className="text-blue-400 mr-2">NOTICE</span> what they did
                  </label>
                  <textarea
                    placeholder="I see that you..."
                    value={realInputs.notice}
                    onChange={(e) => setRealInputs((prev) => ({ ...prev, notice: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-3 text-white placeholder:text-slate-400 h-20 resize-none focus:border-blue-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    <span className="text-green-400 mr-2">NAME</span> the skill
                  </label>
                  <textarea
                    placeholder="That's called..."
                    value={realInputs.name}
                    onChange={(e) => setRealInputs((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-3 text-white placeholder:text-slate-400 h-20 resize-none focus:border-green-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    <span className="text-purple-400 mr-2">NEXT STEP</span> forward
                  </label>
                  <textarea
                    placeholder="Now try..."
                    value={realInputs.nextStep}
                    onChange={(e) => setRealInputs((prev) => ({ ...prev, nextStep: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-3 text-white placeholder:text-slate-400 h-20 resize-none focus:border-purple-400 focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleRealCheck}
                disabled={!realInputs.notice || !realInputs.name || !realInputs.nextStep}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ backgroundColor: '#27AE60', color: '#ffffff' }}
              >
                Check My Formula
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          {/* REAL ROUND - Check Phase */}
          {!isSillyRound && playPhase === 'real-check' && (
            <div className="w-full space-y-6 animate-fade-in">
              <div className="grid md:grid-cols-2 gap-4">
                {/* User's Version */}
                <div
                  className="rounded-xl p-5"
                  style={{ backgroundColor: 'rgba(52, 152, 219, 0.1)', border: '1px solid rgba(52, 152, 219, 0.3)' }}
                >
                  <h4 className="text-blue-300 font-semibold mb-3">YOUR VERSION:</h4>
                  <p className="text-white">
                    {realInputs.notice}. {realInputs.name}. {realInputs.nextStep}.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">Notice ✓</span>
                    <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">Name ✓</span>
                    <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">Next Step ✓</span>
                  </div>
                </div>

                {/* Example Version */}
                <div
                  className="rounded-xl p-5"
                  style={{ backgroundColor: 'rgba(39, 174, 96, 0.1)', border: '1px solid rgba(39, 174, 96, 0.3)' }}
                >
                  <h4 className="text-green-300 font-semibold mb-3">EXAMPLE VERSION:</h4>
                  <p className="text-white">"{realFeedbackFull}"</p>
                  <p className="text-sm text-green-200 mt-3">Both work! The formula is flexible.</p>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: colorConfig.accent, color: '#ffffff' }}
              >
                {currentRound < scenarios.length - 1 ? 'Next Round' : 'Finish'}
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

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Formula = Bulletproof!</h2>
          <p className="text-xl text-purple-200 mb-6">
            You just proved Notice-Name-Next Step works for EVERYTHING.
          </p>

          <div
            className="w-full max-w-lg rounded-xl p-6 mb-6"
            style={{ backgroundColor: colorConfig.bg, border: `1px solid ${colorConfig.border}` }}
          >
            <p className="text-lg text-purple-100 leading-relaxed">
              From "advanced chicken psychology" to actual student feedback — same formula, same strength.
              That's how you know it's unbreakable.
            </p>
          </div>

          {/* Formula reminder */}
          <div className="flex items-center justify-center gap-2 text-white font-medium mb-6">
            <span className="text-blue-400">NOTICE</span>
            <span className="text-slate-500">→</span>
            <span className="text-green-400">NAME</span>
            <span className="text-slate-500">→</span>
            <span className="text-purple-400">NEXT STEP</span>
          </div>

          {/* Table Talk */}
          <div className="w-full max-w-lg bg-slate-800/50 rounded-xl p-6 mb-6">
            <p className="text-sm uppercase tracking-wider mb-3" style={{ color: colorConfig.accent }}>
              Table Talk
            </p>
            <div className="space-y-2 text-slate-300 text-left">
              <p>• Which ridiculous instruction would you most like to try?</p>
              <p>• What fake academic subject should universities offer?</p>
              <p>• Raise your hand if you'll remember the formula better now!</p>
            </div>
          </div>

          <button
            onClick={onBack}
            className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#ffffff' }}
          >
            <RotateCcw size={20} />
            Back to Games (Still Giggling)
          </button>
        </div>
      )}
    </GameWrapper>
  );
}
