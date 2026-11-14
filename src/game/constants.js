// KAGE CARROM - Board Geometry, Red/Black/White Minimalist Styling & Physics Constants

export const CANVAS_SIZE = 800;
export const FRAME_WIDTH = 50;

export const BOARD = {
  SIZE: CANVAS_SIZE,
  FRAME_WIDTH: FRAME_WIDTH,
  PLAY_MIN: FRAME_WIDTH,
  PLAY_MAX: CANVAS_SIZE - FRAME_WIDTH,
  CENTER: { x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 },
  CENTER_INNER_RADIUS: 40,
  CENTER_OUTER_RADIUS: 130,
};

// 4 Corner Pockets
export const POCKET_RADIUS = 32;
export const POCKET_CAPTURE_RADIUS = 28;
export const POCKETS = [
  { id: 'top-left', x: 74, y: 74, radius: POCKET_RADIUS },
  { id: 'top-right', x: CANVAS_SIZE - 74, y: 74, radius: POCKET_RADIUS },
  { id: 'bottom-left', x: 74, y: CANVAS_SIZE - 74, radius: POCKET_RADIUS },
  { id: 'bottom-right', x: CANVAS_SIZE - 74, y: CANVAS_SIZE - 74, radius: POCKET_RADIUS },
];

// Pieces
export const COIN_RADIUS = 15.5;
export const STRIKER_RADIUS = 21.5;

export const PIECE_TYPES = {
  WHITE: 'white',
  BLACK: 'black',
  QUEEN: 'queen',
  STRIKER: 'striker',
};

// Baselines
export const BASELINES = {
  bottom: {
    player: 'player1',
    y: 660,
    minX: 210,
    maxX: 590,
    lineSpacing: 11,
    leftCircle: { x: 210, y: 660, radius: 21 },
    rightCircle: { x: 590, y: 660, radius: 21 },
  },
  top: {
    player: 'player2',
    y: 140,
    minX: 210,
    maxX: 590,
    lineSpacing: 11,
    leftCircle: { x: 210, y: 140, radius: 21 },
    rightCircle: { x: 590, y: 140, radius: 21 },
  },
};

// Physics Tuning (Crash-proof, smooth deceleration)
export const PHYSICS_CONFIG = {
  restitution: 0.94,
  friction: 0.0008,
  frictionAir: {
    fast: 0.012,
    standard: 0.016,
    vintage: 0.022,
  },
  strikerMass: 3.6,
  coinMass: 1.0,
  maxImpulseForce: 0.092,
  minImpulseForce: 0.012,
  restVelocityThreshold: 0.16,
  linearDampingCutoff: 0.35,
  maxShotDurationMs: 4500,
};

// PURE RED / BLACK / WHITE PALETTE
export const RED_BLACK_WHITE_PALETTE = {
  blackPitch: '#050505',
  blackDark: '#0e0e10',
  frameBorder: '#1c1c20',
  boardSurface: '#121214',
  whitePure: '#ffffff',
  whiteMuted: '#e2e2e6',
  redAccent: '#ff0033',
  redBright: '#ff1744',
  redGlow: 'rgba(255, 0, 51, 0.65)',
  coinWhite: {
    base: '#f8f8fa',
    gradTop: '#ffffff',
    gradBot: '#d8d8de',
    rim: '#ffffff',
    groove: '#b0b0b8',
  },
  coinBlack: {
    base: '#141416',
    gradTop: '#26262a',
    gradBot: '#08080a',
    rim: '#ff0033', // Red rim accent
    groove: '#2c2c30',
  },
  coinQueen: {
    base: '#ff0033',
    gradTop: '#ff3355',
    gradBot: '#cc0029',
    star: '#ffffff',
    starCore: '#ffffff',
  },
  striker: {
    base: '#0c0c0e',
    gradTop: '#222228',
    gradBot: '#08080a',
    rimRed: '#ff0033',
    rimWhite: '#ffffff',
  },
};
