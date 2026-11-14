# ⚡ KAGE CARROM — Master the Board. Outsmart the Shadows.

> A premium, physics-accurate 2D Carrom board game built with **React**, **Vite**, **HTML5 Canvas**, **Matter.js**, and **Tailwind CSS**, presented with the signature **VOIDKAGE** dark gaming aesthetic.

---

## 🎮 Overview

**KAGE CARROM** merges the traditional heritage of the classic wooden Carrom board with high-stakes, cinematic dark gaming visuals. Featuring real 2D rigid-body dynamics, boric acid powder friction simulation, authentic international carrom rules (including full Queen cover requirements and striker scratches), and three distinct AI personalities with raycasting geometry and bank-shot calculations.

---

## 🌟 Key Features

### 1. Authentic Physics Engine (Matter.js)
- **Top-Down 2D Physics**: Zero-gravity rigid-body simulation tuned specifically for carrom board dynamics.
- **Boric Acid Powder Simulation**: Configurable air friction modes:
  - *Tournament Standard* (accurate competition glide)
  - *Fast Glide* (ultra-slick speed)
  - *Vintage / Heavy* (classic solid friction)
- **Rebound Cushions**: 4 wooden frame borders with 94% restitution for clean carrom bank shots.
- **Smooth Pocket Capture**: 4 corner pockets with circular suction physics and spiral sink animations.

### 2. Complete Official Carrom Rules Referee
- **Turn Rotation**: Player 1 (White pieces) vs Player 2 / AI (Black pieces).
- **Turn Retention ("Break")**: Successfully pocketing one or more of your own coins retains your turn ("Strike Again!").
- **The Queen & The Cover Rule**:
  - The royal red Queen is worth **+3 bonus points**.
  - **Instant Cover**: Pocketing the Queen and your own coin on the exact same shot secures the Queen immediately.
  - **Sequential Cover**: Pocketing only the Queen grants a cover attempt on the immediate next stroke. If you pocket your coin, the Queen is secured!
  - **Cover Failure**: Failing to pocket your own coin returns the Queen to the center of the board, forfeiting the turn.
- **Fouls & Striker Scratches**:
  - Pocketing the striker incurs a **1 penalty coin deduction** (returned from your pocketed stash back to the center circle).
  - Scratching during a Queen cover attempt cancels the cover and returns the Queen to the center.
- **Scoring & Match End**:
  - Game ends when one player clears all 9 of their coins (and Queen is settled).
  - Winner receives points equal to opponent's remaining coins on the board + Queen bonus (+3 pts).

### 3. Three Intelligent AI Opponents
- 🟢 **ROOKIE (Easy)**: Basic line-of-sight targeting, relaxed angle noise (±10° to ±16°), occasional power overshoots/undershoots. Ideal for casual players.
- 🟡 **TACTICAL (Medium)**: Real-time obstacle raycasting to check pocket paths, optimal striker baseline positioning, Queen priority awareness, tight accuracy (±2.5° to ±4°).
- 🔴 **SHADOW MASTER (Expert)**:
  - Exhaustive shot evaluation: checks direct shots AND **1-cushion bank shots** if direct line is obstructed.
  - Strategic Queen cover urgency.
  - Razor-sharp execution (<0.4° noise).
  - Human-like pacing with deliberate positioning, visual aiming line display, and power charge-up.

### 4. Visuals & Procedural Web Audio Engine
- **Procedural Audio Synthesizer**: 100% offline, zero-asset Web Audio API:
  - Resonant wooden striker hit transient.
  - Ivory/acrylic coin-to-coin clacks with velocity-scaled frequency.
  - Low-mid wooden border rebound thud.
  - Deep leather pocket drop rumble & Queen mystical shimmer.
  - Foul warning buzzer.
  - Triumphant Queen cover major chord.
  - Victory celebration fanfare.
  - Dark ambient cinematic synth drone.
- **Canvas Rendering Engine**:
  - High-res retina / 4K canvas rendering with automatic DPR scaling.
  - Authentic wooden board with grain and radial spotlight vignette.
  - 19-piece rosette layout (9 White, 9 Black, 1 Red Queen with 8-pointed golden star).
  - Custom VOIDKAGE striker with metallic chrome finish and crosshairs.
  - Dynamic 3D drop shadows.
  - Dotted laser aiming line with collision ghost striker, target coin deflection arrow, and cushion bounce forecast.
  - Particle bursts: chalk powder puffs, golden pocket sparks, crimson Queen vortices.

---

## 🚀 Getting Started

### Installation & Launch

```bash
# Navigate to project directory
cd kage-carrom

# Install dependencies (already installed)
npm install

# Start local development server
npm run dev
```

Open your browser at:
```
http://localhost:5173/
```

### Controls

- **Desktop (Mouse)**:
  - **Striker Baseline Placement**: Drag the striker horizontally along the baseline or use the bottom slider / nudge buttons (`<` and `>`).
  - **Aiming**: Move the cursor or adjust the shot angle slider / fine-tune buttons (`-1°` and `+1°`).
  - **Target Snap**: Click `Snap Target` to automatically lock onto the nearest viable coin!
  - **Power & Shoot**: Adjust the power meter (10% - 100%) and click `STRIKE`, or click-and-drag directly on the board to aim and release!
- **Mobile / Touch**:
  - Full touch-friendly responsive interface. Touch and slide along the baseline to position striker, adjust angle, and tap `STRIKE`.

---

## 📁 Project Architecture

```
kage-carrom/
├── index.html                  # HTML entry point with Cinzel & Inter Google Fonts
├── tailwind.config.js          # Dark luxury VOIDKAGE palette & custom shadows
├── src/
│   ├── main.jsx                # React root mount
│   ├── index.css               # Base styles & glassmorphism utilities
│   ├── App.jsx                 # Screen router & state coordinator
│   ├── game/
│   │   ├── constants.js        # Board dimensions, piece geometry, physics configs
│   │   ├── physics.js          # Matter.js world, collisions, pocket detectors, resting logic
│   │   ├── rules.js            # Official Carrom rules referee & state machine
│   │   ├── ai.js               # 3 AI tiers (Rookie, Tactical, Shadow Master + Bank shots)
│   │   └── renderer.js         # Canvas rendering, wood textures, aiming forecast, particles
│   ├── utils/
│   │   ├── audio.js            # Pure Web Audio API procedural synthesizer
│   │   └── storage.js          # LocalStorage persistence for stats & settings
│   └── components/
│       ├── MainMenu.jsx        # Logo, floating pieces canvas, play modes, difficulty selector
│       ├── GameView.jsx        # Canvas host, pointer handlers, AI turn sequencing
│       ├── ScoreBoard.jsx      # Top HUD, player cards, coin counters, turn banner
│       ├── AimControls.jsx     # Striker slider, angle steppers, power gauge, strike button
│       ├── StatsModal.jsx      # Career statistics dashboard & win rates
│       ├── SettingsModal.jsx   # SFX/Music volumes, guideline assist, friction speed
│       ├── RulesModal.jsx      # Illustrated carrom rulebook (Queen cover, fouls, scoring)
│       └── GameOverModal.jsx   # Confetti celebration, match breakdown, rematches
```

---

## 🏆 Game Modes

1. **Play vs AI**: Challenge Rookie, Tactical, or Shadow Master AI.
2. **Pass & Play (2 Players)**: Local turn-based multiplayer on one device.
3. **Practice / Trickshot Mode**: Open sandbox to test angles, rebounds, and baseline shots.

---
*Created by VOIDKAGE Studios*
