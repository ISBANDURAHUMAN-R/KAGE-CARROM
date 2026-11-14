// KAGE CARROM - Persistent Local Storage Manager

const STORAGE_KEYS = {
  STATS: 'kage_carrom_stats',
  SETTINGS: 'kage_carrom_settings',
};

const DEFAULT_STATS = {
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
  highestBreak: 0, // Most coins pocketed in a single continuous turn
  aiDifficultyWins: {
    rookie: 0,
    tactical: 0,
    shadow_master: 0,
  },
};

const DEFAULT_SETTINGS = {
  sfxEnabled: true,
  musicEnabled: true,
  sfxVolume: 0.8,
  musicVolume: 0.35,
  aiDifficulty: 'tactical', // 'rookie', 'tactical', 'shadow_master'
  guidelineAssist: 'full', // 'full', 'simple', 'off'
  powderFriction: 'standard', // 'fast', 'standard', 'vintage'
  hapticFeedback: true,
};

export function getStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    if (!raw) return { ...DEFAULT_STATS };
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

export function saveStats(stats) {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (err) {
    console.warn('Failed to save stats to localStorage', err);
  }
}

export function updateStatsOnMatchEnd({
  won,
  difficulty,
  whiteCoins,
  blackCoins,
  queenCovered,
  fouls,
  maxBreakInGame,
}) {
  const current = getStats();
  current.matchesPlayed += 1;

  if (won) {
    current.wins += 1;
    current.winStreak += 1;
    if (current.winStreak > current.bestStreak) {
      current.bestStreak = current.winStreak;
    }
    if (difficulty && current.aiDifficultyWins[difficulty] !== undefined) {
      current.aiDifficultyWins[difficulty] += 1;
    }
  } else {
    current.losses += 1;
    current.winStreak = 0;
  }

  current.coinsPocketedWhite += whiteCoins || 0;
  current.coinsPocketedBlack += blackCoins || 0;
  if (queenCovered) {
    current.queensCovered += 1;
  }
  current.foulsCommitted += fouls || 0;
  if (maxBreakInGame > current.highestBreak) {
    current.highestBreak = maxBreakInGame;
  }

  saveStats(current);
  return current;
}

export function getSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.warn('Failed to save settings to localStorage', err);
  }
}
