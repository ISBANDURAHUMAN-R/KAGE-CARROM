import React from 'react';
import { X, Trophy, Award, ShieldAlert, RotateCcw } from 'lucide-react';
import { sound } from '../utils/audio';

export default function StatsModal({ stats, onClose, onResetStats }) {
  const winRate =
    stats.matchesPlayed > 0
      ? Math.round((stats.wins / stats.matchesPlayed) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in font-mono">
      <div className="w-full max-w-sm bg-[#0e0e12] border border-[#2a2a32] rounded-xl p-5 shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#222228] pb-2.5">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#ff0033]" />
            <h2 className="text-sm font-bold tracking-wider text-white uppercase">
              CAREER STATS
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 rounded bg-[#18181c] text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Highlight Cards Grid */}
        <div className="grid grid-cols-4 gap-2">
          <div className="p-2 rounded-lg bg-[#141418] border border-[#222228] flex flex-col items-center text-center">
            <span className="text-[9px] text-neutral-500 uppercase">Played</span>
            <span className="text-lg font-black text-white mt-0.5">{stats.matchesPlayed}</span>
          </div>

          <div className="p-2 rounded-lg bg-[#141418] border border-[#ff0033]/30 flex flex-col items-center text-center">
            <span className="text-[9px] text-neutral-500 uppercase">Win %</span>
            <span className="text-lg font-black text-[#ff0033] mt-0.5">{winRate}%</span>
          </div>

          <div className="p-2 rounded-lg bg-[#141418] border border-[#222228] flex flex-col items-center text-center">
            <span className="text-[9px] text-neutral-500 uppercase">Wins</span>
            <span className="text-lg font-black text-white mt-0.5">{stats.wins}</span>
          </div>

          <div className="p-2 rounded-lg bg-[#141418] border border-[#222228] flex flex-col items-center text-center">
            <span className="text-[9px] text-neutral-500 uppercase">Losses</span>
            <span className="text-lg font-black text-neutral-400 mt-0.5">{stats.losses}</span>
          </div>
        </div>

        {/* Detailed Stats List */}
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between p-2 rounded bg-[#141418] border border-[#222228]">
            <span className="text-neutral-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-white" /> White Coins Pocketed
            </span>
            <span className="font-bold text-white">{stats.coinsPocketedWhite || 0}</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-[#141418] border border-[#222228]">
            <span className="text-neutral-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#ff0033]" /> Black Coins Pocketed
            </span>
            <span className="font-bold text-[#ff0033]">{stats.coinsPocketedBlack || 0}</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-[#141418] border border-[#222228]">
            <span className="text-neutral-400 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#ff0033]" /> Total Fouls
            </span>
            <span className="font-bold text-[#ff0033]">{stats.totalFouls || 0}</span>
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={() => {
            sound.playClick();
            if (window.confirm('Reset all career statistics?')) {
              onResetStats();
            }
          }}
          className="w-full py-1.5 rounded bg-[#141418] hover:bg-[#1e1214] text-neutral-400 hover:text-[#ff0033] border border-[#222228] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>RESET STATS</span>
        </button>
      </div>
    </div>
  );
}
