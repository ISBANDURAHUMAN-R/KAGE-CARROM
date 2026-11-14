// KAGE CARROM - Minimalist RED / BLACK / WHITE Match Over Modal
import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home, ShieldAlert } from 'lucide-react';
import { sound } from '../utils/audio';

export default function GameOverModal({
  winner,
  score,
  mode,
  matchStats,
  queenStatus,
  onRematch,
  onMainMenu,
}) {
  const isP1Winner = winner === 'player1';
  const isAi = mode === 'vs-ai';

  useEffect(() => {
    if (isP1Winner) {
      sound.playVictory();
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ff0033', '#ffffff', '#111114'],
        });
      } catch {}
    } else {
      sound.playFoulSound();
    }
  }, [isP1Winner]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in font-mono">
      <div className="w-full max-w-sm bg-[#0e0e12] border border-[#2a2a32] rounded-xl p-6 shadow-2xl flex flex-col items-center text-center gap-4">
        {/* Trophy Icon */}
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${
            isP1Winner
              ? 'bg-white text-black border-white shadow-lg'
              : 'bg-[#ff0033] text-white border-[#ff0033] shadow-lg shadow-[#ff0033]/30'
          }`}
        >
          <Trophy className="w-7 h-7" />
        </div>

        {/* Victory / Defeat Title */}
        <div>
          <h2 className="text-2xl font-black tracking-widest text-white uppercase">
            {winner === 'draw'
              ? 'DRAW!'
              : isP1Winner
              ? 'YOU WIN!'
              : isAi
              ? 'ENEMY WINS!'
              : 'PLAYER 2 WINS!'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {winner === 'draw'
              ? 'Match ended in a draw.'
              : isP1Winner
              ? 'Master of the board.'
              : isAi
              ? 'The Shadow AI prevailed.'
              : 'Player 2 achieved victory.'}
          </p>
        </div>

        {/* Final Scoreboard */}
        <div className="w-full grid grid-cols-2 gap-2.5 p-3 rounded-lg bg-[#141418] border border-[#222228]">
          <div className="flex flex-col items-center p-2 rounded bg-[#0a0a0c]">
            <span className="text-[10px] text-neutral-400 font-bold">YOU (WHITE)</span>
            <span className="text-2xl font-black text-white mt-0.5">
              {score?.player1 || 0}
            </span>
            {queenStatus === 'covered_player1' && (
              <span className="text-[9px] text-[#ff0033] mt-0.5">👑 Queen (+2)</span>
            )}
          </div>

          <div className="flex flex-col items-center p-2 rounded bg-[#0a0a0c]">
            <span className="text-[10px] text-neutral-400 font-bold">
              {isAi ? 'CPU (BLACK)' : 'PLAYER 2'}
            </span>
            <span className="text-2xl font-black text-[#ff0033] mt-0.5">
              {score?.player2 || 0}
            </span>
            {queenStatus === 'covered_player2' && (
              <span className="text-[9px] text-[#ff0033] mt-0.5">👑 Queen (+2)</span>
            )}
          </div>
        </div>

        {/* Match Breakdown Stats */}
        <div className="w-full space-y-1 text-xs text-neutral-400">
          <div className="flex justify-between px-2 py-1 bg-[#141418] rounded">
            <span>Strokes:</span>
            <span className="text-white font-bold">{matchStats?.totalStrokes || 0}</span>
          </div>
          <div className="flex justify-between px-2 py-1 bg-[#141418] rounded">
            <span className="flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-[#ff0033]" /> P1 Fouls:
            </span>
            <span className="text-[#ff0033] font-bold">{matchStats?.player1Fouls || 0}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={() => {
              sound.playClick();
              onMainMenu();
            }}
            className="py-2.5 rounded-lg bg-[#18181c] hover:bg-white hover:text-black text-white border border-[#2a2a32] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>MENU</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onRematch();
            }}
            className="py-2.5 rounded-lg bg-[#ff0033] hover:bg-[#e0002d] text-white font-black text-xs shadow-lg shadow-[#ff0033]/30 flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>REMATCH</span>
          </button>
        </div>
      </div>
    </div>
  );
}
