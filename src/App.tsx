/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TikTokLiveProvider, useTikTokLive } from './context/TikTokLiveContext';
import { BackgroundContainer } from './components/BackgroundContainer';
import { Header } from './components/Header';
import { LiveGiftsRow } from './components/LiveGiftsRow';
import { HorizontalCommentsBar } from './components/HorizontalCommentsBar';
import { VictoryModal } from './components/VictoryModal';
import { HintModal } from './components/HintModal';
import { HonorBoardModal } from './components/HonorBoardModal';
import { SettingsModal } from './components/SettingsModal';
import { LobbyGrid } from './components/LobbyGrid';
import { soundEffects } from './services/soundEffects';
import { ThemeBackground, GameId } from './types';

// Game Components
import { ScrambledLettersGame } from './components/games/ScrambledLettersGame';
import { GuessingGame } from './components/games/GuessingGame';
import { WriteThingsGame } from './components/games/WriteThingsGame';
import { RouletteGame } from './components/games/RouletteGame';
import { ProverbsGame } from './components/games/ProverbsGame';
import { IqGame } from './components/games/IqGame';
import { CountryBattleGame } from './components/games/CountryBattleGame';
import { TugOfWarGame } from './components/games/TugOfWarGame';
import { PrinterGame } from './components/games/PrinterGame';
import { ClashArenaGame } from './components/games/ClashArenaGame';
import { MemoryCardsGame } from './components/games/MemoryCardsGame';
import { GrandChallengeGame } from './components/games/GrandChallengeGame';

const AppContent: React.FC = () => {
  const { activeGame, setActiveGame } = useTikTokLive();

  const [theme, setTheme] = useState<ThemeBackground>('cyber');
  const [isMobileHorizontal, setIsMobileHorizontal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHonorBoardOpen, setIsHonorBoardOpen] = useState(false);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundEffects.enabled = next;
    if (next) soundEffects.playClick();
  };

  const toggleFullscreen = () => {
    soundEffects.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const toggleMobileHorizontal = () => {
    soundEffects.playClick();
    setIsMobileHorizontal(prev => !prev);
  };

  const handleBackToLobby = () => {
    soundEffects.playClick();
    setActiveGame('none');
  };

  return (
    <BackgroundContainer theme={theme}>
      <div className={`flex flex-col min-h-screen ${isMobileHorizontal ? 'landscape-mode max-w-[1280px] mx-auto w-full' : ''}`}>
        {/* Fixed Header Bar */}
        <Header
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenHonorBoard={() => setIsHonorBoardOpen(true)}
          isMobileHorizontal={isMobileHorizontal}
          onToggleMobileHorizontal={toggleMobileHorizontal}
          onToggleFullscreen={toggleFullscreen}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
        />

        {/* Live Gifts Row moving from left to right */}
        <LiveGiftsRow />

        {/* Active Stage: Main Lobby or Chosen Game */}
        <main className="flex-1 flex flex-col relative z-10 overflow-y-auto">
          {activeGame === 'none' && (
            <LobbyGrid onSelectGame={(gameId: GameId) => setActiveGame(gameId)} />
          )}

          {activeGame === 'scrambled_letters' && (
            <ScrambledLettersGame onBackToLobby={handleBackToLobby} />
          )}

          {activeGame === 'guessing' && (
            <GuessingGame onBackToLobby={handleBackToLobby} />
          )}

          {activeGame === 'write_things' && (
            <WriteThingsGame
              onBackToLobby={handleBackToLobby}
              onOpenHonorBoard={() => setIsHonorBoardOpen(true)}
            />
          )}

          {activeGame === 'roulette' && (
            <RouletteGame
              onBackToLobby={handleBackToLobby}
              onOpenHonorBoard={() => setIsHonorBoardOpen(true)}
            />
          )}

          {activeGame === 'proverbs' && (
            <ProverbsGame onBackToLobby={handleBackToLobby} />
          )}

          {activeGame === 'iq_game' && (
            <IqGame onBackToLobby={handleBackToLobby} />
          )}

          {activeGame === 'country_battle' && (
            <CountryBattleGame
              onBackToLobby={handleBackToLobby}
              onOpenHonorBoard={() => setIsHonorBoardOpen(true)}
            />
          )}

          {activeGame === 'tug_of_war' && (
            <TugOfWarGame
              onBackToLobby={handleBackToLobby}
              onOpenHonorBoard={() => setIsHonorBoardOpen(true)}
            />
          )}

          {activeGame === 'printer' && (
            <PrinterGame
              onBackToLobby={handleBackToLobby}
              onOpenHonorBoard={() => setIsHonorBoardOpen(true)}
            />
          )}

          {activeGame === 'clash_arena' && (
            <ClashArenaGame
              onBackToLobby={handleBackToLobby}
              onOpenHonorBoard={() => setIsHonorBoardOpen(true)}
            />
          )}

          {activeGame === 'memory_cards' && (
            <MemoryCardsGame
              onBackToLobby={handleBackToLobby}
              onOpenHonorBoard={() => setIsHonorBoardOpen(true)}
            />
          )}

          {activeGame === 'grand_challenge' && (
            <GrandChallengeGame onBackToLobby={handleBackToLobby} />
          )}
        </main>

        {/* Horizontal Audience Comments Bar at bottom of screen */}
        <HorizontalCommentsBar />

        {/* Global Interactive Modals */}
        <VictoryModal />
        <HintModal />
        <HonorBoardModal
          isOpen={isHonorBoardOpen}
          onClose={() => setIsHonorBoardOpen(false)}
        />
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onOpenHonorBoard={() => setIsHonorBoardOpen(true)}
          currentTheme={theme}
          onChangeTheme={setTheme}
          isMobileHorizontal={isMobileHorizontal}
          onToggleMobileHorizontal={toggleMobileHorizontal}
          onToggleFullscreen={toggleFullscreen}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
        />
      </div>
    </BackgroundContainer>
  );
};

export default function App() {
  return (
    <TikTokLiveProvider>
      <AppContent />
    </TikTokLiveProvider>
  );
}
