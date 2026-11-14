// KAGE CARROM - Responsive Minimalist Top HUD (Mobile, Tablet & Desktop)
import React from 'react';
import { Volume2, VolumeX, Music, RotateCcw, Home, Clock } from 'lucide-react';
import { sound } from '../utils/audio';

export default function ScoreBoard({
  mode,
  aiDifficulty,
  currentTurn,
  scorePlayer = 0,
  scoreEnemy = 0,
  timeLeft = 120,
  announcement,
  sfxEnabled,
  musicEnabled,
  onToggleSfx,
  onToggleMusic,
  onRestart,
  onOpenMenu,
}) {
  const isP1Turn = currentTurn === 'player1';
  const isAi = mode === 'vs-ai';

  const minutes = Math.floor(timeLeft / 60);
  const seconds = Math.floor(timeLeft % 60);
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  const isTimeLow = timeLeft <= 10;

  return (
    <div className="w-full flex flex-col gap-1 z-20">
      <div className="w-full bg-[#0d0d10] border border-[#222228] rounded-xl px-2.5 sm:px-4 py-1.5 flex items-center justify-between gap-1.5 sm:gap-3 shadow-2xl">
        {/* Navigation & Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              onOpenMenu();
            }}
            className="px-2 sm:px-2.5 py-1 rounded-lg bg-[#18181c] hover:bg-white hover:text-black text-white text-[10px] sm:text-[11px] font-mono font-bold transition-all border border-[#2a2a32] flex items-center gap-1"
            title="Main Menu"
          >
            <Home className="w-3 h-3 sm:hidden" />
            <span className="hidden sm:inline">MENU</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="px-2 sm:px-2.5 py-1 rounded-lg bg-[#18181c] hover:bg-[#ff0033] hover:text-white text-white text-[10px] sm:text-[11px] font-mono font-bold transition-all border border-[#2a2a32] flex items-center gap-1"
            title="Restart Match"
          >
            <RotateCcw className="w-3 h-3 sm:hidden" />
            <span className="hidden sm:inline">RESTART</span>
          </button>

          <button
            onClick={onToggleSfx}
            className={`p-1 rounded-lg border transition-colors ${
              sfxEnabled
                ? 'bg-[#ff0033]/20 border-[#ff0033] text-[#ff0033]'
                : 'bg-[#18181c] border-white/10 text-neutral-500'
            }`}
            title="Toggle SFX"
          >
            {sfxEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onToggleMusic}
            className={`p-1 rounded-lg border transition-colors ${
              musicEnabled
                ? 'bg-white/20 border-white text-white'
                : 'bg-[#18181c] border-white/10 text-neutral-500'
            }`}
            title="Toggle Music"
          >
            <Music className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center: Turn Pill & Announcements */}
        <div className="flex items-center justify-center min-w-0 flex-1 px-1">
          {announcement ? (
            <div className="animate-pulse truncate text-center">
              <span className="text-[10px] sm:text-xs font-black tracking-wider text-[#ff0033] uppercase font-mono">
                {announcement.message}
              </span>
            </div>
          ) : (
            <div
              className={`px-2.5 sm:px-3.5 py-0.5 rounded-full border text-[10px] sm:text-[11px] font-black tracking-wider uppercase font-mono truncate text-center ${
                isP1Turn
                  ? 'bg-white text-black border-white'
                  : 'bg-[#ff0033] text-white border-[#ff0033]'
              }`}
            >
              {mode === 'practice'
                ? 'PRACTICE'
                : isP1Turn
                ? 'YOUR TURN'
                : isAi
                ? 'CPU TURN'
                : 'P2 TURN'}
            </div>
          )}
        </div>

        {/* Right: Scores & Match Timer */}
        <div className="flex items-center gap-2 sm:gap-3 font-mono shrink-0">
          {/* Match Timer */}
          <div
            className={`flex items-center gap-1 text-[11px] sm:text-xs font-bold ${
              isTimeLow ? 'text-[#ff0033] animate-pulse font-black' : 'text-neutral-300'
            }`}
          >
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>{timeFormatted}</span>
          </div>

          {/* Scores */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
            <span className="text-white font-bold">
              <span className="hidden sm:inline">YOU: </span><b className="text-white text-xs sm:text-sm">{scorePlayer}</b>
            </span>
            <span className="text-neutral-600 font-bold">|</span>
            <span className="text-[#ff0033] font-bold">
              <span className="hidden sm:inline">CPU: </span><b className="text-[#ff0033] text-xs sm:text-sm">{scoreEnemy}</b>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
