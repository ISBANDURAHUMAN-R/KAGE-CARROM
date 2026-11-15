import test from 'node:test';
import assert from 'node:assert/strict';
import { CarromAI } from '../src/game/ai.js';
import { BASELINES, PIECE_TYPES } from '../src/game/constants.js';

test('CarromAI - default difficulty and shot initialization', () => {
  const ai = new CarromAI('tactical');
  assert.equal(ai.difficulty, 'tactical');
  
  // Empty board fallback
  const emptyShot = ai.calculateShot({ coins: [], queenStatus: 'covered_player1' });
  assert.ok(emptyShot.strikerX >= BASELINES.top.minX && emptyShot.strikerX <= BASELINES.top.maxX);
  assert.ok(emptyShot.power >= 30 && emptyShot.power <= 95);
});

test('CarromAI - baseline striker clamping and target resolution', () => {
  const ai = new CarromAI('shadow_master');
  const mockCoins = [
    {
      customType: PIECE_TYPES.BLACK,
      position: { x: 300, y: 350 }
    },
    {
      customType: PIECE_TYPES.WHITE,
      position: { x: 500, y: 450 }
    }
  ];

  const shot = ai.calculateShot({ coins: mockCoins, queenStatus: 'on_board' });
  assert.ok(shot.strikerX >= BASELINES.top.minX && shot.strikerX <= BASELINES.top.maxX);
  assert.ok(shot.power >= 30 && shot.power <= 98);
  assert.ok(typeof shot.angle === 'number');
});

test('CarromAI - difficulty switching', () => {
  const ai = new CarromAI('rookie');
  assert.equal(ai.difficulty, 'rookie');
  ai.setDifficulty('shadow_master');
  assert.equal(ai.difficulty, 'shadow_master');
});
