// KAGE CARROM - Intelligent Tactical AI Engine
// Features: Geometric Ghost-Ball Targeting, Cut-Angle Optimization & Dynamic Power Scaling
import {
  BASELINES,
  POCKETS,
  COIN_RADIUS,
  STRIKER_RADIUS,
  PIECE_TYPES,
} from './constants.js';

export class CarromAI {
  constructor(difficulty = 'tactical') {
    this.difficulty = difficulty;
  }

  setDifficulty(diff) {
    this.difficulty = diff;
  }

  calculateShot({ coins, queenStatus }) {
    const baseline = BASELINES.top; // AI baseline: Y = 140, X in [210, 590]

    if (!coins || coins.length === 0) {
      return {
        strikerX: 400,
        angle: Math.PI / 2,
        power: 60,
        targetCoin: null,
        targetPocket: POCKETS[2],
      };
    }

    // 1. Identify target coins
    let targetCoins = coins.filter((c) => c.customType === PIECE_TYPES.BLACK);
    const queenCoin = coins.find((c) => c.customType === PIECE_TYPES.QUEEN);

    if (queenCoin && queenStatus === 'on_board') {
      if (this.difficulty !== 'rookie' || targetCoins.length === 0) {
        targetCoins.push(queenCoin);
      }
    }

    if (targetCoins.length === 0) {
      targetCoins = coins;
    }

    // 2. Evaluate all candidate shots (Coin + Pocket combinations)
    const evaluatedShots = [];

    targetCoins.forEach((coin) => {
      POCKETS.forEach((pocket) => {
        const shot = this._evaluatePocketShot(coin, pocket, coins, baseline);
        if (shot) {
          evaluatedShots.push(shot);
        }
      });
    });

    let bestShot = null;

    if (evaluatedShots.length > 0) {
      // Sort by shot score (highest feasibility and cleanest cut angle first)
      evaluatedShots.sort((a, b) => b.score - a.score);
      bestShot = evaluatedShots[0];
    }

    // Fallback: If no direct pocket shot has a good angle, perform a direct push
    if (!bestShot || bestShot.score < 0.2) {
      bestShot = this._calculateFallbackPush(targetCoins, coins, baseline);
    }

    // 3. Difficulty Tuning & Accuracy Jitter
    let finalAngle = bestShot.angle;
    let finalPower = bestShot.power;
    const finalStrikerX = bestShot.strikerX;

    if (this.difficulty === 'rookie') {
      // Rookie: Slight aiming error (±4.5°) and minor power variation
      finalAngle += ((Math.random() - 0.5) * 9 * Math.PI) / 180;
      finalPower = Math.round(finalPower + (Math.random() - 0.5) * 16);
    } else if (this.difficulty === 'tactical') {
      // Tactical: Near-perfect aim with minimal human-like imperfection (±1°)
      finalAngle += ((Math.random() - 0.5) * 2 * Math.PI) / 180;
      finalPower = Math.round(finalPower + (Math.random() - 0.5) * 6);
    }
    // shadow_master: surgical precision, zero error

    return {
      strikerX: Math.round(finalStrikerX),
      angle: finalAngle,
      power: Math.max(30, Math.min(95, finalPower)),
      targetCoin: bestShot.targetCoin,
      targetPocket: bestShot.targetPocket,
    };
  }

  // Geometric Ghost Ball Calculation
  _evaluatePocketShot(coin, pocket, allCoins, baseline) {
    const cpX = pocket.x - coin.position.x;
    const cpY = pocket.y - coin.position.y;
    const coinToPocketDist = Math.hypot(cpX, cpY);
    if (coinToPocketDist < 5) return null;

    const uX = cpX / coinToPocketDist;
    const uY = cpY / coinToPocketDist;

    // Contact point (Ghost Ball center)
    const collisionDist = COIN_RADIUS + STRIKER_RADIUS + 0.5;
    const ghostX = coin.position.x - uX * collisionDist;
    const ghostY = coin.position.y - uY * collisionDist;

    // The striker is positioned on the top baseline (y = 140) and fires downwards.
    // The ghost contact point must be below the baseline to be struck forward.
    if (ghostY <= baseline.y + 12) return null;

    // Optimal Striker X on the baseline along the line of centers:
    // S_x = ghostX - uX * (ghostY - baseline.y) / uY (when uY > 0.15)
    let idealStrikerX;
    if (uY > 0.15) {
      idealStrikerX = ghostX - uX * ((ghostY - baseline.y) / uY);
    } else {
      idealStrikerX = ghostX;
    }

    // Clamp ideal baseline position within reachable boundaries
    const clampedStrikerX = Math.max(baseline.minX, Math.min(baseline.maxX, idealStrikerX));
    const validStrikerX = this._findNonObstructedBaselineX(clampedStrikerX, allCoins, baseline);

    // Vector from striker to ghost point
    const sgX = ghostX - validStrikerX;
    const sgY = ghostY - baseline.y;
    const strikerToGhostDist = Math.hypot(sgX, sgY);
    if (strikerToGhostDist < 10) return null;

    const vX = sgX / strikerToGhostDist;
    const vY = sgY / strikerToGhostDist;

    // Cut angle alignment: dot product between striker trajectory and coin-to-pocket vector
    // cosTheta = 1.0 means straight on; cosTheta > 0.3 means cut angle < 72 degrees.
    const cosTheta = vX * uX + vY * uY;
    if (cosTheta < 0.25) return null; // Too sharp of a cut angle to pocket reliably

    // Obstruction check: Is there a coin blocking the path from striker to ghost point?
    const isStrikerPathBlocked = this._isPathObstructed(
      { x: validStrikerX, y: baseline.y },
      { x: ghostX, y: ghostY },
      allCoins,
      coin
    );

    // Obstruction check: Is there a coin blocking the path from coin to pocket?
    const isPocketPathBlocked = this._isPathObstructed(
      coin.position,
      pocket,
      allCoins,
      coin
    );

    // Calculate shot scoring metric
    let score = cosTheta * 1.5;
    // Prefer closer coins to pockets
    score += (1 - Math.min(1, coinToPocketDist / 700)) * 1.0;
    // Queen priority bonus
    if (coin.customType === PIECE_TYPES.QUEEN) {
      score += 0.8;
    }
    // Penalize obstructions
    if (isStrikerPathBlocked) score -= 1.2;
    if (isPocketPathBlocked) score -= 1.0;

    // Calibrated shot power
    const totalDistance = strikerToGhostDist + coinToPocketDist * 1.25;
    let power = Math.min(95, Math.max(35, 34 + (totalDistance / 750) * 58));

    // Slight power boost for steeper cuts
    if (cosTheta < 0.7) {
      power = Math.min(98, power + 8);
    }

    return {
      targetCoin: coin,
      targetPocket: pocket,
      strikerX: validStrikerX,
      angle: Math.atan2(sgY, sgX),
      power: Math.round(power),
      score,
    };
  }

  // Fallback: Pick closest viable coin and shoot directly through it towards bottom half
  _calculateFallbackPush(targetCoins, allCoins, baseline) {
    if (!targetCoins || targetCoins.length === 0 || !targetCoins[0]) {
      return {
        targetCoin: null,
        targetPocket: POCKETS[2],
        strikerX: 400,
        angle: Math.PI / 2,
        power: 60,
        score: 0.1,
      };
    }

    let closestCoin = targetCoins[0];
    let minDist = Infinity;

    targetCoins.forEach((c) => {
      const d = Math.hypot(c.position.x - 400, c.position.y - baseline.y);
      if (d < minDist) {
        minDist = d;
        closestCoin = c;
      }
    });

    const strikerX = this._findNonObstructedBaselineX(closestCoin.position.x, allCoins, baseline);
    const dx = closestCoin.position.x - strikerX;
    const dy = closestCoin.position.y - baseline.y;

    return {
      targetCoin: closestCoin,
      targetPocket: POCKETS[2], // Default bottom-left pocket
      strikerX,
      angle: Math.atan2(dy, dx),
      power: 65,
      score: 0.1,
    };
  }

  // Find clear, non-overlapping baseline position
  _findNonObstructedBaselineX(preferredX, allCoins, baseline) {
    const minX = baseline.minX;
    const maxX = baseline.maxX;
    const clampedPref = Math.max(minX, Math.min(maxX, preferredX));

    // Test positions outwards from preferredX
    const offsets = [0, -18, 18, -36, 36, -54, 54, -72, 72, -90, 90];

    for (const off of offsets) {
      const testX = Math.max(minX, Math.min(maxX, clampedPref + off));
      const hasOverlap = allCoins.some((c) => {
        const d = Math.hypot(c.position.x - testX, c.position.y - baseline.y);
        return d < STRIKER_RADIUS + COIN_RADIUS - 1;
      });

      if (!hasOverlap) {
        return testX;
      }
    }

    return clampedPref;
  }

  // Ray-circle line segment intersection check
  _isPathObstructed(p1, p2, allCoins, excludeCoin) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return false;

    const clearance = COIN_RADIUS + 4;

    for (const c of allCoins) {
      if (c === excludeCoin) continue;

      // Project point onto line segment
      const t = Math.max(0, Math.min(1, ((c.position.x - p1.x) * dx + (c.position.y - p1.y) * dy) / lenSq));
      const projX = p1.x + t * dx;
      const projY = p1.y + t * dy;

      const dist = Math.hypot(c.position.x - projX, c.position.y - projY);
      if (dist < clearance) {
        return true;
      }
    }

    return false;
  }
}
