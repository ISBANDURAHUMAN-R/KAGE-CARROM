// KAGE CARROM - Minimalist RED / BLACK / WHITE Main Menu
import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Bot,
  Users,
  Target,
  BarChart2,
  Sliders,
  HelpCircle,
  Volume2,
  VolumeX,
  Music,
  Shield,
  Flame,
} from 'lucide-react';
import { sound } from '../utils/audio';

export default function MainMenu({
  onStartGame,
  onOpenStats,
  onOpenSettings,
  onOpenRules,
  sfxEnabled,
  musicEnabled,
  onToggleSfx,
  onToggleMusic,
  currentAiDifficulty,
  onSelectAiDifficulty,
}) {
  const canvasRef = useRef(null);
  const [showAiModal, setShowAiModal] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Minimal floating carrom coins (White, Black & Crimson Queen)
    const pieces = [];
    const count = Math.min(20, Math.floor(window.innerWidth / 60));
    for (let i = 0; i < count; i++) {
      const type = i % 3 === 0 ? 'white' : i % 3 === 1 ? 'black' : 'queen';
      pieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: 12 + Math.random() * 12,
        type,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.015,
        alpha: 0.15 + Math.random() * 0.2,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Pitch Black & Charcoal Vignette
      const bgGrad = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        60,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height) * 0.8
      );
      bgGrad.addColorStop(0, '#101014');
      bgGrad.addColorStop(0.6, '#08080a');
      bgGrad.addColorStop(1, '#040405');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle Kanji 影 in background
      ctx.save();
      ctx.font = 'bold 360px Cinzel, serif';
      ctx.fillStyle = 'rgba(255, 0, 51, 0.03)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('影', canvas.width / 2, canvas.height / 2);
      ctx.restore();

      // Render floating minimalist pieces
      pieces.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vRot;

        if (p.x < -30) p.x = canvas.width + 30;
        if (p.x > canvas.width + 30) p.x = -30;
        if (p.y < -30) p.y = canvas.height + 30;
        if (p.y > canvas.height + 30) p.y = -30;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);

        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);

        if (p.type === 'white') {
          ctx.fillStyle = '#f5f5f7';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else if (p.type === 'black') {
          ctx.fillStyle = '#111114';
          ctx.fill();
          ctx.strokeStyle = '#ff0033';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        } else {
          ctx.fillStyle = '#ff0033';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.8;
          ctx.stroke();
        }

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col justify-between items-center text-white select-none bg-[#050505]">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* Header */}
      <header className="w-full max-w-5xl px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#111114] border border-[#ff0033] flex items-center justify-center font-bold text-[#ff0033] text-sm shadow-lg font-serif">
            影
          </div>
          <div className="flex flex-col text-left font-mono">
            <span className="text-xs font-bold tracking-widest text-white uppercase">
              VOIDKAGE
            </span>
            <span className="text-[9px] tracking-widest text-[#ff0033] uppercase">
              CARROM
            </span>
          </div>
        </div>

        {/* Audio Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              onToggleSfx();
            }}
            className={`p-2 rounded-lg border transition-colors ${
              sfxEnabled
                ? 'bg-[#18181c] border-[#ff0033] text-[#ff0033]'
                : 'bg-[#121215] border-[#222228] text-neutral-600'
            }`}
            title={sfxEnabled ? 'Mute SFX' : 'Enable SFX'}
          >
            {sfxEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onToggleMusic();
            }}
            className={`p-2 rounded-lg border transition-colors ${
              musicEnabled
                ? 'bg-[#18181c] border-white text-white'
                : 'bg-[#121215] border-[#222228] text-neutral-600'
            }`}
            title={musicEnabled ? 'Pause Music' : 'Play Music'}
          >
            <Music className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Hero & Actions */}
      <main className="flex flex-col items-center justify-center text-center px-4 z-10 max-w-md w-full">
        {/* Emblem */}
        <div className="relative mb-3">
          <div className="w-20 h-20 rounded-2xl bg-[#0f0f13] border-2 border-[#ff0033] flex items-center justify-center shadow-2xl shadow-[#ff0033]/20">
            <span className="text-white font-black text-4xl font-serif">影</span>
          </div>
        </div>

        {/* Title & Tagline */}
        <h1 className="text-4xl sm:text-5xl font-black font-display tracking-widest text-white drop-shadow-md">
          KAGE <span className="text-[#ff0033]">CARROM</span>
        </h1>
        <p className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.25em] text-neutral-400 mt-1 uppercase">
          Master the Board. Outsmart the Shadows.
        </p>

        {/* Play Action Buttons */}
        <div className="w-full flex flex-col gap-2.5 mt-6 font-mono">
          <button
            onClick={() => {
              sound.playClick();
              setShowAiModal(true);
            }}
            className="w-full py-3.5 px-6 rounded-lg font-black text-sm tracking-wider uppercase transition-all bg-[#ff0033] hover:bg-[#e0002d] text-white shadow-lg shadow-[#ff0033]/30 active:scale-95 flex items-center justify-center gap-2.5"
          >
            <Bot className="w-4 h-4 fill-white" />
            <span>PLAY VS SHADOW AI</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onStartGame('pass-and-play');
            }}
            className="w-full py-3 px-6 rounded-lg font-bold text-xs tracking-wider uppercase transition-all bg-[#121216] hover:bg-[#1a1a20] border border-[#2a2a32] hover:border-white text-white active:scale-95 flex items-center justify-center gap-2.5"
          >
            <Users className="w-4 h-4" />
            <span>PASS & PLAY (2 PLAYERS)</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onStartGame('practice');
            }}
            className="w-full py-2.5 px-6 rounded-lg font-bold text-xs tracking-wider uppercase transition-all bg-[#121216] hover:bg-[#1a1a20] border border-[#2a2a32] text-neutral-400 hover:text-white active:scale-95 flex items-center justify-center gap-2.5"
          >
            <Target className="w-4 h-4 text-[#ff0033]" />
            <span>PRACTICE MODE</span>
          </button>
        </div>

        {/* Secondary Buttons */}
        <div className="grid grid-cols-3 gap-2 w-full mt-3 font-mono">
          <button
            onClick={() => {
              sound.playClick();
              onOpenStats();
            }}
            className="py-2 px-2.5 rounded bg-[#101014] hover:bg-[#181820] border border-[#222228] text-neutral-300 hover:text-white transition-colors text-[11px] font-bold flex items-center justify-center gap-1.5"
          >
            <BarChart2 className="w-3 h-3 text-[#ff0033]" />
            <span>STATS</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenRules();
            }}
            className="py-2 px-2.5 rounded bg-[#101014] hover:bg-[#181820] border border-[#222228] text-neutral-300 hover:text-white transition-colors text-[11px] font-bold flex items-center justify-center gap-1.5"
          >
            <HelpCircle className="w-3 h-3 text-white" />
            <span>RULES</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenSettings();
            }}
            className="py-2 px-2.5 rounded bg-[#101014] hover:bg-[#181820] border border-[#222228] text-neutral-300 hover:text-white transition-colors text-[11px] font-bold flex items-center justify-center gap-1.5"
          >
            <Sliders className="w-3 h-3 text-white" />
            <span>SETTINGS</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-3 text-center text-[10px] font-mono text-neutral-600 z-10">
        VOIDKAGE (影) © 2026 • RED / BLACK / WHITE EDITION
      </footer>

      {/* AI Difficulty Selector Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-[#0e0e12] border border-[#2a2a32] rounded-xl p-5 shadow-2xl flex flex-col gap-3 font-mono">
            <div className="flex items-center justify-between border-b border-[#222228] pb-2.5">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#ff0033]" />
                <h3 className="font-bold text-white tracking-wider text-xs uppercase">
                  SELECT SHADOW AI
                </h3>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-neutral-500 hover:text-white text-xs px-2 py-0.5 rounded border border-[#222228]"
              >
                CLOSE
              </button>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  sound.playClick();
                  onSelectAiDifficulty('rookie');
                  setShowAiModal(false);
                  onStartGame('vs-ai', 'rookie');
                }}
                className={`w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between ${
                  currentAiDifficulty === 'rookie'
                    ? 'bg-[#181820] border-white'
                    : 'bg-[#111114] border-[#222228] hover:border-neutral-500'
                }`}
              >
                <div>
                  <div className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-neutral-400" />
                    ROOKIE (EASY)
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    Casual angles, slight inaccuracies.
                  </p>
                </div>
                <Play className="w-3.5 h-3.5 text-white" />
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onSelectAiDifficulty('tactical');
                  setShowAiModal(false);
                  onStartGame('vs-ai', 'tactical');
                }}
                className={`w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between ${
                  currentAiDifficulty === 'tactical'
                    ? 'bg-[#181820] border-[#ff0033]'
                    : 'bg-[#111114] border-[#222228] hover:border-[#ff0033]/50'
                }`}
              >
                <div>
                  <div className="font-bold text-[#ff0033] text-xs flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-[#ff0033]" />
                    TACTICAL (BALANCED)
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    Geometric ghost-ball targeting & cut angles.
                  </p>
                </div>
                <Play className="w-3.5 h-3.5 text-[#ff0033]" />
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onSelectAiDifficulty('shadow_master');
                  setShowAiModal(false);
                  onStartGame('vs-ai', 'shadow_master');
                }}
                className={`w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between ${
                  currentAiDifficulty === 'shadow_master'
                    ? 'bg-[#201014] border-[#ff0033]'
                    : 'bg-[#111114] border-[#222228] hover:border-[#ff0033]'
                }`}
              >
                <div>
                  <div className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-[#ff0033]" />
                    SHADOW MASTER 影 (EXPERT)
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    Deadly ghost-ball precision & power control.
                  </p>
                </div>
                <Play className="w-3.5 h-3.5 text-[#ff0033]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
