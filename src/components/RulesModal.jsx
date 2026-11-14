// KAGE CARROM - Minimalist RED / BLACK / WHITE Rules Guide
import React, { useState } from 'react';
import { X, BookOpen, ShieldAlert, Award, Crosshair } from 'lucide-react';
import { sound } from '../utils/audio';

export default function RulesModal({ onClose }) {
  const [tab, setTab] = useState('objective'); // 'objective', 'queen', 'fouls', 'scoring'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in font-mono">
      <div className="w-full max-w-lg bg-[#0e0e12] border border-[#2a2a32] rounded-xl p-5 shadow-2xl flex flex-col gap-3.5 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#222228] pb-2.5">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#ff0033]" />
            <h2 className="text-sm font-bold tracking-wider text-white uppercase">
              CARROM RULES & MECHANICS
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

        {/* Tab Selector */}
        <div className="grid grid-cols-4 gap-1 p-1 rounded-lg bg-[#141418] border border-[#222228] text-xs font-bold">
          {[
            { id: 'objective', label: 'Basics' },
            { id: 'queen', label: 'Queen' },
            { id: 'fouls', label: 'Fouls' },
            { id: 'scoring', label: 'Rules' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                sound.playClick();
                setTab(t.id);
              }}
              className={`py-1 rounded transition-colors ${
                tab === t.id
                  ? 'bg-[#ff0033] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Objective & Striking */}
        {tab === 'objective' && (
          <div className="space-y-2.5 text-xs text-neutral-300 leading-relaxed animate-fade-in">
            <div className="p-2.5 rounded bg-[#141418] border border-[#222228] flex gap-2.5 items-start">
              <Crosshair className="w-4 h-4 text-[#ff0033] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-white mb-0.5">Striker Placement</h3>
                <p className="text-[11px] text-neutral-400">
                  Slide your striker horizontally along your baseline. Both baseline circles must be respected, and the striker must not overlap any existing coins.
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded bg-[#141418] border border-[#222228] flex gap-2.5 items-start">
              <Award className="w-4 h-4 text-white shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-white mb-0.5">Aiming & Power Charging</h3>
                <p className="text-[11px] text-neutral-400">
                  Drag on the board to aim and pull back for power, or hold the <b>STRIKE</b> button to smoothly charge from 30% to 100%. Releasing triggers the shot.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: The Queen */}
        {tab === 'queen' && (
          <div className="space-y-2.5 text-xs text-neutral-300 leading-relaxed animate-fade-in">
            <div className="p-2.5 rounded bg-[#141418] border border-[#ff0033]/40">
              <h3 className="font-bold text-[#ff0033] mb-1">The Crimson Queen</h3>
              <p className="text-[11px] text-neutral-400">
                The Queen is worth <b>+2 points</b>. In standard competitive rules, capturing the Queen requires pocketing another coin of your color immediately on the same or next stroke.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Fouls */}
        {tab === 'fouls' && (
          <div className="space-y-2.5 text-xs text-neutral-300 leading-relaxed animate-fade-in">
            <div className="p-2.5 rounded bg-[#141418] border border-[#ff0033]/40 flex gap-2.5 items-start">
              <ShieldAlert className="w-4 h-4 text-[#ff0033] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-white mb-0.5">Striker Scratch (Foul)</h3>
                <p className="text-[11px] text-neutral-400">
                  If the striker falls into any pocket, a foul is declared! A <b>-1 point</b> penalty is applied, and turn passes immediately to the opponent.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Scoring */}
        {tab === 'scoring' && (
          <div className="space-y-2.5 text-xs text-neutral-300 leading-relaxed animate-fade-in">
            <div className="p-2.5 rounded bg-[#141418] border border-[#222228]">
              <h3 className="font-bold text-white mb-1">Match Win Conditions</h3>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-neutral-400">
                <li>First player to reach <b>8 points</b> wins.</li>
                <li>When the <b>120s match timer</b> expires, highest score wins.</li>
                <li>When all coins of one color are cleared from the board.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
