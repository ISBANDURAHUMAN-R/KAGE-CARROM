// KAGE CARROM - Crash-Proof Procedural Web Audio Engine
// 100% Offline, Zero-Latency, Fully Throttled & Guarded for Mobile & Desktop
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.sfxEnabled = true;
    this.musicEnabled = true;
    this.sfxVolume = 0.8;
    this.musicVolume = 0.35;
    this.ambientOsc1 = null;
    this.ambientOsc2 = null;
    this.ambientGain = null;
    this.ambientFilter = null;
    this.isAmbientPlaying = false;
    this.lastCollisionTime = 0;
  }

  init() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch {
      // AudioContext creation guarded
    }
  }

  setSfxEnabled(val) {
    this.sfxEnabled = val;
  }

  setMusicEnabled(val) {
    this.musicEnabled = val;
    if (val) {
      if (!this.isAmbientPlaying) this.startAmbientDrone();
    } else {
      this.stopAmbientDrone();
    }
  }

  setSfxVolume(vol) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
  }

  setMusicVolume(vol) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    try {
      if (this.ambientGain && this.ctx) {
        this.ambientGain.gain.setTargetAtTime(this.musicVolume * 0.15, this.ctx.currentTime, 0.1);
      }
    } catch {}
  }

  // 1. Striker Hit Sound
  playStrikerHit(power = 1) {
    if (!this.sfxEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const normPower = Math.min(1.5, Math.max(0.2, power));

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260 + Math.random() * 40, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400 * normPower, now);
      filter.frequency.exponentialRampToValueAtTime(200, now + 0.12);

      const hitVol = Math.min(1, 0.4 * normPower * this.sfxVolume);
      gain.gain.setValueAtTime(hitVol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {}
  }

  // 2. Coin to Coin Collision (Throttled to prevent audio thread starvation)
  playCoinCollision(velocity = 5) {
    if (!this.sfxEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      if (now - this.lastCollisionTime < 0.035) return; // 35ms throttle
      this.lastCollisionTime = now;

      const normSpeed = Math.min(1, Math.max(0.05, velocity / 18));
      if (normSpeed < 0.05) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const baseFreq = 850 + Math.random() * 300;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, now + 0.04);

      const vol = Math.min(0.8, normSpeed * 0.45 * this.sfxVolume);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {}
  }

  // 3. Cushion / Border Wall Bounce
  playCushionBounce(velocity = 5) {
    if (!this.sfxEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const normSpeed = Math.min(1, Math.max(0.1, velocity / 16));
      if (normSpeed < 0.08) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(180 + Math.random() * 30, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.09);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, now);

      const vol = Math.min(0.7, normSpeed * 0.4 * this.sfxVolume);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.11);
    } catch {}
  }

  // 4. Pocket Drop Sound
  playPocketSound(isQueen = false) {
    if (!this.sfxEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.22);

      gain.gain.setValueAtTime(0.6 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);

      if (isQueen) {
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
          const qOsc = this.ctx.createOscillator();
          const qGain = this.ctx.createGain();
          qOsc.type = 'sine';
          qOsc.frequency.setValueAtTime(freq, now + idx * 0.06);

          qGain.gain.setValueAtTime(0.25 * this.sfxVolume, now + idx * 0.06);
          qGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);

          qOsc.connect(qGain);
          qGain.connect(this.ctx.destination);

          qOsc.start(now + idx * 0.06);
          qOsc.stop(now + idx * 0.06 + 0.27);
        });
      }
    } catch {}
  }

  // 5. Striker Foul / Scratch Sound
  playFoulSound() {
    if (!this.sfxEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(60, now + 0.35);

      gain.gain.setValueAtTime(0.35 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {}
  }

  // 6. UI Click Sound
  playClick() {
    if (!this.sfxEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.03);

      gain.gain.setValueAtTime(0.15 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {}
  }

  // 7. Victory Fanfare
  playVictory() {
    if (!this.sfxEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const chord = [261.63, 329.63, 392.0, 523.25];
      chord.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0.25 * this.sfxVolume, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.55);
      });
    } catch {}
  }

  playCoverSuccess() {
    this.playPocketSound(true);
  }

  // Ambient Drone Music
  startAmbientDrone() {
    if (!this.musicEnabled || this.isAmbientPlaying) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.001, now);
      this.ambientGain.gain.exponentialRampToValueAtTime(this.musicVolume * 0.12, now + 2);

      this.ambientFilter = this.ctx.createBiquadFilter();
      this.ambientFilter.type = 'lowpass';
      this.ambientFilter.frequency.setValueAtTime(280, now);

      this.ambientOsc1 = this.ctx.createOscillator();
      this.ambientOsc1.type = 'sawtooth';
      this.ambientOsc1.frequency.setValueAtTime(55, now);

      this.ambientOsc2 = this.ctx.createOscillator();
      this.ambientOsc2.type = 'triangle';
      this.ambientOsc2.frequency.setValueAtTime(82.4, now);

      this.ambientOsc1.connect(this.ambientFilter);
      this.ambientOsc2.connect(this.ambientFilter);
      this.ambientFilter.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      this.ambientOsc1.start();
      this.ambientOsc2.start();
      this.isAmbientPlaying = true;
    } catch {}
  }

  stopAmbientDrone() {
    try {
      if (this.ambientGain && this.ctx) {
        const now = this.ctx.currentTime;
        this.ambientGain.gain.setTargetAtTime(0.001, now, 0.4);
        setTimeout(() => {
          if (this.ambientOsc1) {
            try { this.ambientOsc1.stop(); this.ambientOsc1.disconnect(); } catch {}
            this.ambientOsc1 = null;
          }
          if (this.ambientOsc2) {
            try { this.ambientOsc2.stop(); this.ambientOsc2.disconnect(); } catch {}
            this.ambientOsc2 = null;
          }
          this.isAmbientPlaying = false;
        }, 500);
      }
    } catch {}
  }
}

export const sound = new SoundEngine();
