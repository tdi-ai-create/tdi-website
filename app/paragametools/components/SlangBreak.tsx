'use client';

import { useState } from 'react';
import { ArrowLeft, ChevronRight, ChevronLeft, Sparkles, Coffee } from 'lucide-react';
import { STUDENT_SLANG } from '../data/slang';
import { shuffle } from '../data/gameConfig';

interface SlangBreakProps {
  onBack: () => void;
}

export function SlangBreak({ onBack }: SlangBreakProps) {
  const [slangTerms] = useState(() => shuffle(STUDENT_SLANG));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const handleNext = () => {
    if (currentIndex < slangTerms.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setRevealed(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setRevealed(false);
    }
  };

  const handleReveal = () => {
    setRevealed(true);
  };

  const current = slangTerms[currentIndex];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #1a2d4a 50%, #0a1628 100%)',
        color: '#ffffff',
      }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid rgba(155, 89, 182, 0.3)' }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-medium transition-colors hover:opacity-80"
          style={{ color: '#8899aa' }}
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="flex items-center gap-2">
          <Coffee size={24} style={{ color: '#9B59B6' }} />
          <h1 className="text-lg font-bold" style={{ color: '#9B59B6' }}>
            Slang Break
          </h1>
        </div>

        <div className="w-20" />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Progress indicator */}
        <p
          className="text-xs uppercase tracking-widest mb-6"
          style={{ color: 'rgba(155, 89, 182, 0.5)' }}
        >
          Term {currentIndex + 1} of {slangTerms.length}
        </p>

        {/* Intro text */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Do you know what this means?
          </h2>
          <p className="text-lg" style={{ color: '#8899aa' }}>
            Test your student slang knowledge!
          </p>
        </div>

        {/* Slang term card */}
        <div
          className="w-full max-w-lg rounded-2xl p-8 mb-6 text-center animate-scale-in"
          style={{
            backgroundColor: 'rgba(155, 89, 182, 0.1)',
            border: '2px solid rgba(155, 89, 182, 0.4)',
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles size={24} style={{ color: '#9B59B6' }} />
          </div>
          <p
            className="text-4xl md:text-5xl font-bold mb-2"
            style={{ color: '#9B59B6' }}
          >
            "{current.term}"
          </p>
        </div>

        {/* Reveal button / Definition */}
        {!revealed ? (
          <button
            onClick={handleReveal}
            className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95 animate-glow-pulse"
            style={{
              backgroundColor: '#9B59B6',
              color: '#ffffff',
              ['--glow-color' as string]: '#9B59B640',
            }}
          >
            Reveal Definition
          </button>
        ) : (
          <div className="flex flex-col items-center gap-6 w-full max-w-lg">
            <div
              className="w-full rounded-xl p-6 text-center animate-reveal-bounce"
              style={{
                backgroundColor: 'rgba(39, 174, 96, 0.15)',
                border: '2px solid #27AE60',
              }}
            >
              <p className="text-xl md:text-2xl text-white">
                {current.definition}
              </p>
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-30 disabled:hover:scale-100"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                }}
              >
                <ChevronLeft size={20} />
                Previous
              </button>
              {currentIndex < slangTerms.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
                  style={{
                    backgroundColor: '#9B59B6',
                    color: '#ffffff',
                  }}
                >
                  Next
                  <ChevronRight size={20} />
                </button>
              ) : (
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
                  style={{
                    backgroundColor: '#27AE60',
                    color: '#ffffff',
                  }}
                >
                  Done
                  <ChevronRight size={20} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Fun callout */}
        <p className="mt-8 text-sm text-center" style={{ color: '#8899aa' }}>
          Pro tip: Ask your students to teach you more!
        </p>
      </main>
    </div>
  );
}
