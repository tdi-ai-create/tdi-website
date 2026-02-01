'use client';

import { useState } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { QuestionKnockout } from './components/QuestionKnockout';
import { TellOrAsk } from './components/TellOrAsk';
import { FeedbackLevelUp } from './components/FeedbackLevelUp';
import { FeedbackMakeover } from './components/FeedbackMakeover';
import type { GameId } from './components/gameData';

export default function ParaGameToolsPage() {
  const [currentGame, setCurrentGame] = useState<GameId | null>(null);

  const handleSelectGame = (gameId: GameId) => {
    setCurrentGame(gameId);
  };

  const handleBack = () => {
    setCurrentGame(null);
  };

  // Render the appropriate game or home screen
  if (currentGame === 'knockout') {
    return <QuestionKnockout onBack={handleBack} />;
  }

  if (currentGame === 'tellorask') {
    return <TellOrAsk onBack={handleBack} />;
  }

  if (currentGame === 'levelup') {
    return <FeedbackLevelUp onBack={handleBack} />;
  }

  if (currentGame === 'makeover') {
    return <FeedbackMakeover onBack={handleBack} />;
  }

  return <HomeScreen onSelectGame={handleSelectGame} />;
}
