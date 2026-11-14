// KAGE CARROM - Responsive Minimalist Striker Baseline Controller
// Fully Touch-Optimized for Mobile, Tablet & Desktop
import React from 'react';
import { ChevronLeft, ChevronRight, Crosshair, Zap } from 'lucide-react';
import { sound } from '../utils/audio';

export default function AimControls({
  phase,
  isAiTurn,
  strikerX,
  onStrikerXChange,
  onShoot,
  minX = 210,
  maxX = 590,
}) {
  const isControlsDisabled = isAiTurn || phase === 'in_motion' || phase === 'evaluating';

  return (
    <div className="w-full z-20 flex justify-center">
      <div className="w-full max-w-xl bg-[#0a0a0c] border border-[#222228] rounded-xl px-2.5 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between gap-2 sm:gap-4 shadow-2xl">
        {/* Striker Position Slider */}
        <div className="flex-1 flex items-center gap-1.5 sm:gap-3 min-w-0">
          <div className="flex items-center gap-1 text-[10px] sm:text-xs font-mono font-bold text-white shrink-0">
            <Crosshair className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ff0033]" />
            <span className="hidden md:inline">STRIKER</span>
            <span className="text-[#ff0033]">{Math.round(strikerX)}</span>
          </div>

          <button
            type="button"
            disabled={isControlsDisabled}
            onClick={() => {
              sound.playClick();
              onStrikerXChange(Math.max(minX, strikerX - 12));
            }}
            className="p-1 sm:p-1.5 rounded-lg bg-[#16161c] hover:bg-white hover:text-black disabled:opacity-25 text-white border border-[#2a2a32] transition-colors shrink-0 active:scale-95"
            title="Slide Left"
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <input
            type="range"
            disabled={isControlsDisabled}
            min={minX}
            max={maxX}
            step={1}
            value={strikerX}
            onChange={(e) => onStrikerXChange(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-[#181820] rounded-lg appearance-none cursor-pointer accent-[#ff0033] disabled:opacity-25 outline-none"
            style={{ touchAction: 'pan-x' }}
          />

          <button
            type="button"
            disabled={isControlsDisabled}
            onClick={() => {
              sound.playClick();
              onStrikerXChange(Math.min(maxX, strikerX + 12));
            }}
            className="p-1 sm:p-1.5 rounded-lg bg-[#16161c] hover:bg-white hover:text-black disabled:opacity-25 text-white border border-[#2a2a32] transition-colors shrink-0 active:scale-95"
            title="Slide Right"
          >
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Action Strike Button */}
        <button
          type="button"
          disabled={isControlsDisabled}
          onClick={() => {
            sound.playClick();
            onShoot();
          }}
          className="px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-lg bg-[#ff0033] hover:bg-[#e0002d] text-white font-mono font-black text-[11px] sm:text-xs tracking-wider uppercase transition-all shadow-lg shadow-[#ff0033]/30 active:scale-95 disabled:opacity-25 disabled:pointer-events-none flex items-center gap-1 sm:gap-1.5 shrink-0"
        >
          <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white" />
          <span>STRIKE</span>
        </button>
      </div>
    </div>
  );
}
