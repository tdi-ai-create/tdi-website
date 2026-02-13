'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { HomeScreen } from './components/HomeScreen';
import { FacilitatorHome } from './components/FacilitatorHome';
import { FacilitatorDashboard } from './components/FacilitatorDashboard';
import { SlangBreak } from './components/SlangBreak';
import { QuestionKnockout } from './components/QuestionKnockout';
import { TellOrAsk } from './components/TellOrAsk';
import { FeedbackLevelUp } from './components/FeedbackLevelUp';
import { FeedbackMadlibs } from './components/FeedbackMadlibs';
import { FeedbackMakeover } from './components/FeedbackMakeover';
import type { GameId } from './data/gameConfig';

type ViewState =
  | { type: 'player-home' }
  | { type: 'player-game'; gameId: GameId }
  | { type: 'facilitator-home' }
  | { type: 'facilitator-dashboard'; gameId: GameId }
  | { type: 'slang-break' };

function ParaGameToolsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [view, setView] = useState<ViewState>({ type: 'player-home' });

  // Check for ?mode=facilitator on mount
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'facilitator') {
      setView({ type: 'facilitator-home' });
    }
  }, [searchParams]);

  // Player Mode handlers
  const handleSelectPlayerGame = (gameId: GameId) => {
    setView({ type: 'player-game', gameId });
  };

  const handleBackToPlayerHome = () => {
    setView({ type: 'player-home' });
  };

  const handleEnterFacilitatorMode = () => {
    router.push('/paragametools?mode=facilitator');
    setView({ type: 'facilitator-home' });
  };

  // Facilitator Mode handlers
  const handleSelectFacilitatorGame = (gameId: GameId) => {
    setView({ type: 'facilitator-dashboard', gameId });
  };

  const handleBackToFacilitatorHome = () => {
    setView({ type: 'facilitator-home' });
  };

  const handleEnterPlayerMode = () => {
    router.push('/paragametools');
    setView({ type: 'player-home' });
  };

  const handleSlangBreak = () => {
    setView({ type: 'slang-break' });
  };

  const handleBackFromSlangBreak = () => {
    // Go back to facilitator home after slang break
    setView({ type: 'facilitator-home' });
  };

  // Render based on current view
  switch (view.type) {
    case 'player-home':
      return (
        <HomeScreen
          onSelectGame={handleSelectPlayerGame}
          onFacilitatorMode={handleEnterFacilitatorMode}
        />
      );

    case 'player-game':
      switch (view.gameId) {
        case 'knockout':
          return <QuestionKnockout onBack={handleBackToPlayerHome} />;
        case 'tellorask':
          return <TellOrAsk onBack={handleBackToPlayerHome} />;
        case 'levelup':
          return <FeedbackLevelUp onBack={handleBackToPlayerHome} />;
        case 'madlibs':
          return <FeedbackMadlibs onBack={handleBackToPlayerHome} />;
        case 'makeover':
          return <FeedbackMakeover onBack={handleBackToPlayerHome} />;
      }
      break;

    case 'facilitator-home':
      return (
        <FacilitatorHome
          onSelectGame={handleSelectFacilitatorGame}
          onPlayerMode={handleEnterPlayerMode}
          onSlangBreak={handleSlangBreak}
        />
      );

    case 'facilitator-dashboard':
      return (
        <FacilitatorDashboard
          gameId={view.gameId}
          onBack={handleBackToFacilitatorHome}
          onSlangBreak={handleSlangBreak}
        />
      );

    case 'slang-break':
      return <SlangBreak onBack={handleBackFromSlangBreak} />;
  }

  // Fallback
  return <HomeScreen onSelectGame={handleSelectPlayerGame} />;
}

// Loading fallback
function LoadingFallback() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #1a2d4a 50%, #0a1628 100%)',
      }}
    >
      <div className="text-center">
        <h1
          className="text-4xl md:text-6xl font-black text-white mb-4 animate-pulse"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          GAME TIME
        </h1>
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

export default function ParaGameToolsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ParaGameToolsContent />
    </Suspense>
  );
}
