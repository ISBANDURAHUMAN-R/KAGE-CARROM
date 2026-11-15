import { PIECE_TYPES } from './constants.js';

export const GAME_MODES = {
  VS_AI: 'vs-ai',
  PASS_AND_PLAY: 'pass-and-play',
  PRACTICE: 'practice',
};

export const TURN_PHASES = {
  PLACING_STRIKER: 'placing_striker',
  AIMING: 'aiming',
  IN_MOTION: 'in_motion',
  EVALUATING: 'evaluating',
  GAME_OVER: 'game_over',
};

export class CarromRules {
  constructor({ mode = GAME_MODES.VS_AI, aiDifficulty = 'tactical', onEvent }) {
    this.mode = mode;
    this.aiDifficulty = aiDifficulty;
    this.onEvent = onEvent;
    this.reset();
  }

  reset() {
    this.currentTurn = 'player1'; // 'player1' (White) | 'player2' (Black/Enemy)
    this.phase = TURN_PHASES.PLACING_STRIKER;

    this.scorePlayer = 0;
    this.scoreEnemy = 0;
    this.pocketed = { player1: 0, player2: 0 };

    this.timeLeft = 120.0;
    this.isTimerRunning = true;

    this.targetScore = 8;
    this.strokePocketed = [];
    this.queenStatus = 'on_board';

    this.matchStats = {
      player1Fouls: 0,
      player2Fouls: 0,
      totalStrokes: 0,
      winner: null,
      finalScore: { player1: 0, player2: 0 },
    };
  }

  registerPocket(type) {
    this.strokePocketed.push(type);
    const isPlayer = this.currentTurn === 'player1';

    let popupMessage = '';
    let popupType = 'info';

    switch (type) {
      case PIECE_TYPES.WHITE:
        this.scorePlayer += 1;
        this.pocketed.player1 = (this.pocketed.player1 || 0) + 1;
        popupMessage = 'White Coin Pocketed! +1 Player';
        popupType = 'coin_white';
        break;

      case PIECE_TYPES.BLACK:
        this.scoreEnemy += 1;
        this.pocketed.player2 = (this.pocketed.player2 || 0) + 1;
        popupMessage = 'Black Coin Pocketed! +1 Enemy';
        popupType = 'coin_black';
        break;

      case PIECE_TYPES.QUEEN:
        if (isPlayer) {
          this.scorePlayer += 2;
          this.queenStatus = 'covered_player1';
        } else {
          this.scoreEnemy += 2;
          this.queenStatus = 'covered_player2';
        }
        popupMessage = `Queen Entered! +2 to ${isPlayer ? 'Player' : 'Enemy'}`;
        popupType = 'queen';
        break;

      case PIECE_TYPES.STRIKER:
        if (isPlayer) {
          this.scorePlayer = Math.max(0, this.scorePlayer - 1); // -1 penalty
          this.matchStats.player1Fouls++;
        } else {
          this.scoreEnemy = Math.max(0, this.scoreEnemy - 1);
          this.matchStats.player2Fouls++;
        }
        popupMessage = `Striker Lost! -1 to ${isPlayer ? 'Player' : 'Enemy'}`;
        popupType = 'foul';
        break;
    }

    if (this.onEvent && popupMessage) {
      this.onEvent({
        type: popupType,
        title: popupType === 'foul' ? 'STRIKER FOUL' : 'POCKET SCORED',
        message: popupMessage,
        scorePlayer: this.scorePlayer,
        scoreEnemy: this.scoreEnemy,
      });
    }
  }

  evaluateStroke(coinsRemaining) {
    this.matchStats.totalStrokes += 1;
    const isPlayer = this.currentTurn === 'player1';

    const whiteCount = coinsRemaining.filter((c) => c.customType === PIECE_TYPES.WHITE).length;
    const blackCount = coinsRemaining.filter((c) => c.customType === PIECE_TYPES.BLACK).length;
    const isBoardCleared = whiteCount === 0 || blackCount === 0;

    let winner = null;

    if (
      this.scorePlayer >= this.targetScore ||
      this.scoreEnemy >= this.targetScore ||
      this.timeLeft <= 0 ||
      isBoardCleared
    ) {
      if (this.scorePlayer > this.scoreEnemy) {
        winner = 'player1';
      } else if (this.scoreEnemy > this.scorePlayer) {
        winner = 'player2';
      } else {
        winner = 'draw';
      }

      this.phase = TURN_PHASES.GAME_OVER;
      this.isTimerRunning = false;
      this.matchStats.winner = winner;
      this.matchStats.finalScore = {
        player1: this.scorePlayer,
        player2: this.scoreEnemy,
      };

      if (this.onEvent) {
        this.onEvent({
          type: 'game_over',
          winner,
          score: this.matchStats.finalScore,
        });
      }

      return {
        isGameOver: true,
        winner,
      };
    }

    // Turn rotation: pocketing player coin without foul retains turn, otherwise alternates to opponent
    const pocketedOwn = this.strokePocketed.filter(
      (t) => t === (isPlayer ? PIECE_TYPES.WHITE : PIECE_TYPES.BLACK)
    ).length;
    const pocketedFoul = this.strokePocketed.includes(PIECE_TYPES.STRIKER);

    let keepTurn = pocketedOwn > 0 && !pocketedFoul;
    if (this.mode === GAME_MODES.PRACTICE) {
      this.currentTurn = 'player1';
    } else if (!keepTurn) {
      this.currentTurn = isPlayer ? 'player2' : 'player1';
    }

    this.phase = TURN_PHASES.PLACING_STRIKER;
    this.strokePocketed = [];

    return {
      isGameOver: false,
      nextTurn: this.currentTurn,
      keepTurn,
    };
  }
}
