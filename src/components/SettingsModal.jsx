// KAGE CARROM - Minimalist RED / BLACK / WHITE Settings
import React from 'react';
import { X, Sliders, Volume2, Music, Eye } from 'lucide-react';
import { sound } from '../utils/audio';

export default function SettingsModal({
  settings,
  onUpdateSettings,
  onClose,
}) {
  const handleChange = (key, value) => {
    sound.playClick();
    onUpdateSettings({ ...settings, [key]: value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in font-mono">
      <div className="w-full max-w-sm bg-[#0e0e12] border border-[#2a2a32] rounded-xl p-5 shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#222228] pb-2.5">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#ff0033]" />
            <h2 className="text-sm font-bold tracking-wider text-white uppercase">
              SETTINGS
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

        {/* Audio Section */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            Audio Settings
          </span>

          <div className="flex flex-col gap-2 p-3 rounded-lg bg-[#141418] border border-[#222228]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#ff0033]" />
                Sound FX
              </span>
              <input
                type="checkbox"
                checked={settings.sfxEnabled}
                onChange={(e) => handleChange('sfxEnabled', e.target.checked)}
                className="w-4 h-4 accent-[#ff0033] rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 p-3 rounded-lg bg-[#141418] border border-[#222228]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Music className="w-4 h-4 text-white" />
                Music
              </span>
              <input
                type="checkbox"
                checked={settings.musicEnabled}
                onChange={(e) => handleChange('musicEnabled', e.target.checked)}
                className="w-4 h-4 accent-[#ff0033] rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Visual Assist Section */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            Aim Assist
          </span>

          <div className="p-3 rounded-lg bg-[#141418] border border-[#222228] flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#ff0033]" />
              Guideline Assist
            </span>
            <select
              value={settings.guidelineAssist || 'full'}
              onChange={(e) => handleChange('guidelineAssist', e.target.value)}
              className="bg-[#18181c] border border-[#2a2a32] text-white text-xs rounded px-2 py-1 outline-none"
            >
              <option value="full">Full Extended</option>
              <option value="short">Short</option>
              <option value="off">Off (Pro)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
