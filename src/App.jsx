// KAGE CARROM - Root Application Component
import React, { useState, useEffect } from 'react';
import MainMenu from './components/MainMenu';
import GameView from './components/GameView';
import StatsModal from './components/StatsModal';
import SettingsModal from './components/SettingsModal';
import RulesModal from './components/RulesModal';
import { getSettings, saveSettings, getStats, saveStats } from './utils/storage';
import { sound } from './utils/audio';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('menu'); // 'menu' | 'game'
  const [gameMode, setGameMode] = useState('vs-ai');
  const [aiDifficulty, setAiDifficulty] = useState('tactical');

  // Persistent settings & stats
  const [settings, setSettings] = useState(() => getSettings());
  const [stats, setStats] = useState(() => getStats());

  // Modals
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRules, setShowRules] = useState(false);

  // Sync sound engine on load and whenever settings change
  useEffect(() => {
    sound.setSfxEnabled(settings.sfxEnabled);
    sound.setMusicEnabled(settings.musicEnabled);
    sound.setSfxVolume(settings.sfxVolume);
    sound.setMusicVolume(settings.musicVolume);
  }, [settings]);

  // First interaction audio unlock
  useEffect(() => {
    const handleFirstClick = () => {
      sound.init();
      if (settings.musicEnabled) {
        sound.startAmbientDrone();
      }
      window.removeEventListener('click', handleFirstClick);
      window.removeEventListener('touchstart', handleFirstClick);
    };

    window.addEventListener('click', handleFirstClick);
    window.addEventListener('touchstart', handleFirstClick);

    return () => {
      window.removeEventListener('click', handleFirstClick);
      window.removeEventListener('touchstart', handleFirstClick);
    };
  }, [settings.musicEnabled]);

  const handleStartGame = (mode, difficulty = aiDifficulty) => {
    setGameMode(mode);
    setAiDifficulty(difficulty);
    setCurrentScreen('game');
  };

  const handleUpdateSettings = (newSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleResetStats = () => {
    const freshStats = {
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      winStreak: 0,
      bestStreak: 0,
      coinsPocketedWhite: 0,
      coinsPocketedBlack: 0,
      queensPocketed: 0,
      queensCovered: 0,
      foulsCommitted: 0,
      highestBreak: 0,
      aiDifficultyWins: { rookie: 0, tactical: 0, shadow_master: 0 },
    };
    setStats(freshStats);
    saveStats(freshStats);
  };

  const handleToggleSfx = () => {
    const updated = !settings.sfxEnabled;
    handleUpdateSettings({ ...settings, sfxEnabled: updated });
    sound.setSfxEnabled(updated);
  };

  const handleToggleMusic = () => {
    const updated = !settings.musicEnabled;
    handleUpdateSettings({ ...settings, musicEnabled: updated });
    sound.setMusicEnabled(updated);
  };

  return (
    <div className="w-full h-screen max-h-screen overflow-hidden bg-void-950 font-sans text-slate-100 flex flex-col items-center justify-between">
      {currentScreen === 'menu' ? (
        <MainMenu
          onStartGame={handleStartGame}
          onOpenStats={() => {
            setStats(getStats());
            setShowStats(true);
          }}
          onOpenSettings={() => setShowSettings(true)}
          onOpenRules={() => setShowRules(true)}
          sfxEnabled={settings.sfxEnabled}
          musicEnabled={settings.musicEnabled}
          onToggleSfx={handleToggleSfx}
          onToggleMusic={handleToggleMusic}
          currentAiDifficulty={aiDifficulty}
          onSelectAiDifficulty={setAiDifficulty}
        />
      ) : (
        <GameView
          mode={gameMode}
          aiDifficulty={aiDifficulty}
          settings={settings}
          onOpenMenu={() => {
            setStats(getStats());
            setCurrentScreen('menu');
          }}
          onToggleSfx={handleToggleSfx}
          onToggleMusic={handleToggleMusic}
        />
      )}

      {/* Stats Modal */}
      {showStats && (
        <StatsModal
          stats={stats}
          onClose={() => setShowStats(false)}
          onResetStats={handleResetStats}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Rules Modal */}
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </div>
  );
}
