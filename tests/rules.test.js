import test from 'node:test';
import assert from 'node:assert/strict';
import { CarromRules, GAME_MODES, TURN_PHASES } from '../src/game/rules.js';
import { PIECE_TYPES } from '../src/game/constants.js';

test('CarromRules - initial state', () => {
  const rules = new CarromRules({ mode: GAME_MODES.VS_AI });
  assert.equal(rules.currentTurn, 'player1');
  assert.equal(rules.scorePlayer, 0);
  assert.equal(rules.scoreEnemy, 0);
  assert.equal(rules.phase, TURN_PHASES.PLACING_STRIKER);
});

test('CarromRules - register white coin pocket', () => {
  const rules = new CarromRules({ mode: GAME_MODES.VS_AI });
  rules.registerPocket(PIECE_TYPES.WHITE);
  assert.equal(rules.scorePlayer, 1);
  assert.equal(rules.pocketed.player1, 1);
});

test('CarromRules - register queen pocket scores 2 points', () => {
  const rules = new CarromRules({ mode: GAME_MODES.VS_AI });
  rules.registerPocket(PIECE_TYPES.QUEEN);
  assert.equal(rules.scorePlayer, 2);
  assert.equal(rules.queenStatus, 'covered_player1');
});

test('CarromRules - striker foul applies penalty', () => {
  const rules = new CarromRules({ mode: GAME_MODES.VS_AI });
  rules.scorePlayer = 3;
  rules.registerPocket(PIECE_TYPES.STRIKER);
  assert.equal(rules.scorePlayer, 2); // -1 penalty
  assert.equal(rules.matchStats.player1Fouls, 1);
});

test('CarromRules - evaluateStroke turn retention on legal pocket', () => {
  const rules = new CarromRules({ mode: GAME_MODES.VS_AI });
  rules.registerPocket(PIECE_TYPES.WHITE);
  const result = rules.evaluateStroke([]);
  assert.equal(result.isGameOver, true); // no coins remaining triggers win
  assert.equal(result.winner, 'player1');
});

test('CarromRules - evaluateStroke alternates turn on blank shot', () => {
  const rules = new CarromRules({ mode: GAME_MODES.VS_AI });
  const mockCoins = [
    { customType: PIECE_TYPES.WHITE },
    { customType: PIECE_TYPES.BLACK }
  ];
  const result = rules.evaluateStroke(mockCoins);
  assert.equal(result.isGameOver, false);
  assert.equal(result.keepTurn, false);
  assert.equal(result.nextTurn, 'player2');
});
