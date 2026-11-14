// KAGE CARROM - Rock-Solid Physics Engine (Matter.js)
// Zero-Crash Architecture: Queued Mutex Body Operations & Active Velocity Damping
import Matter from 'matter-js';
import {
  BOARD,
  POCKETS,
  POCKET_CAPTURE_RADIUS,
  COIN_RADIUS,
  STRIKER_RADIUS,
  PIECE_TYPES,
  PHYSICS_CONFIG,
  BASELINES,
} from './constants';

const { Engine, World, Bodies, Body, Events } = Matter;

export class CarromPhysics {
  constructor({ onPocketed, onCollision, onRest, frictionMode = 'standard' }) {
    this.onPocketed = onPocketed;
    this.onCollision = onCollision;
    this.onRest = onRest;
    this.frictionMode = frictionMode;

    // Matter Engine (top-down 2D zero gravity)
    this.engine = Engine.create({
      gravity: { x: 0, y: 0, scale: 0 },
      enableSleeping: false,
    });
    this.world = this.engine.world;

    this.coins = [];
    this.striker = null;
    this.sinkingPieces = [];

    // Safe queues to prevent Matter.js iterator crashes
    this.pendingRemovals = [];
    this.pendingAdditions = [];

    this.isShotInProgress = false;
    this.shotStartTime = 0;
    this.restCounter = 0;
    this.cushions = [];

    this._initBoundaries();
    this._setupCollisionEvents();
  }

  // Create frame walls with corner pocket openings
  _initBoundaries() {
    const wallThickness = 60;
    const playMin = BOARD.PLAY_MIN; // 52
    const playMax = BOARD.PLAY_MAX; // 748
    const pocketOpening = 96;

    const wallOptions = {
      isStatic: true,
      restitution: PHYSICS_CONFIG.restitution,
      friction: PHYSICS_CONFIG.friction,
      render: { visible: false },
    };

    const topWall = Bodies.rectangle(
      BOARD.CENTER.x,
      playMin - wallThickness / 2,
      playMax - playMin - pocketOpening * 2,
      wallThickness,
      wallOptions
    );

    const bottomWall = Bodies.rectangle(
      BOARD.CENTER.x,
      playMax + wallThickness / 2,
      playMax - playMin - pocketOpening * 2,
      wallThickness,
      wallOptions
    );

    const leftWall = Bodies.rectangle(
      playMin - wallThickness / 2,
      BOARD.CENTER.y,
      wallThickness,
      playMax - playMin - pocketOpening * 2,
      wallOptions
    );

    const rightWall = Bodies.rectangle(
      playMax + wallThickness / 2,
      BOARD.CENTER.y,
      wallThickness,
      playMax - playMin - pocketOpening * 2,
      wallOptions
    );

    this.cushions = [topWall, bottomWall, leftWall, rightWall];
    World.add(this.world, this.cushions);
  }

  // Collision callback with sound & particle emission
  _setupCollisionEvents() {
    Events.on(this.engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        const vx = bodyA.velocity.x - bodyB.velocity.x;
        const vy = bodyA.velocity.y - bodyB.velocity.y;
        const relSpeed = Math.hypot(vx, vy);

        const isWallA = this.cushions.includes(bodyA);
        const isWallB = this.cushions.includes(bodyB);

        const contactPoint = {
          x: (bodyA.position.x + bodyB.position.x) / 2,
          y: (bodyA.position.y + bodyB.position.y) / 2,
        };

        if (this.onCollision && relSpeed > 0.4) {
          this.onCollision({
            isWall: isWallA || isWallB,
            speed: relSpeed,
            point: contactPoint,
            bodyA,
            bodyB,
          });
        }
      });
    });
  }

  // Set friction
  setFrictionMode(mode) {
    this.frictionMode = mode;
    const airFriction = PHYSICS_CONFIG.frictionAir[mode] || PHYSICS_CONFIG.frictionAir.standard;
    this.coins.forEach((c) => {
      c.frictionAir = airFriction;
    });
    if (this.striker) {
      this.striker.frictionAir = airFriction;
    }
  }

  // Setup standard 19-piece carrom rosette
  setupCoins() {
    // Clear all existing bodies
    this.coins.forEach((c) => World.remove(this.world, c));
    this.coins = [];
    if (this.striker) {
      World.remove(this.world, this.striker);
      this.striker = null;
    }
    this.sinkingPieces = [];
    this.pendingRemovals = [];
    this.pendingAdditions = [];
    this.isShotInProgress = false;
    this.restCounter = 0;

    const airFriction =
      PHYSICS_CONFIG.frictionAir[this.frictionMode] || PHYSICS_CONFIG.frictionAir.standard;

    const r = COIN_RADIUS;
    const dx = r * 2.03;
    const dy = dx * (Math.sqrt(3) / 2);
    const cx = BOARD.CENTER.x;
    const cy = BOARD.CENTER.y;

    const hexLayout = [
      { row: -2, cols: [-1, 0, 1] },
      { row: -1, cols: [-1.5, -0.5, 0.5, 1.5] },
      { row: 0, cols: [-2, -1, 0, 1, 2] },
      { row: 1, cols: [-1.5, -0.5, 0.5, 1.5] },
      { row: 2, cols: [-1, 0, 1] },
    ];

    let whiteCount = 0;
    let blackCount = 0;
    let pieceIndex = 0;

    hexLayout.forEach((rowSpec) => {
      rowSpec.cols.forEach((colOffset) => {
        const x = cx + colOffset * dx;
        const y = cy + rowSpec.row * dy;

        let pieceType;
        if (rowSpec.row === 0 && colOffset === 0) {
          pieceType = PIECE_TYPES.QUEEN;
        } else {
          if ((pieceIndex % 2 === 0 && whiteCount < 9) || blackCount >= 9) {
            pieceType = PIECE_TYPES.WHITE;
            whiteCount++;
          } else {
            pieceType = PIECE_TYPES.BLACK;
            blackCount++;
          }
          pieceIndex++;
        }

        const coinBody = Bodies.circle(x, y, r, {
          restitution: PHYSICS_CONFIG.restitution,
          friction: PHYSICS_CONFIG.friction,
          frictionAir: airFriction,
          mass: PHYSICS_CONFIG.coinMass,
          label: pieceType,
          customType: pieceType,
        });

        this.coins.push(coinBody);
        World.add(this.world, coinBody);
      });
    });
  }

  // Set striker position along player's baseline
  setStrikerPosition(x, player = 'player1') {
    const baseline = player === 'player1' ? BASELINES.bottom : BASELINES.top;
    const clampedX = Math.max(baseline.minX, Math.min(baseline.maxX, x));
    const targetY = baseline.y;

    if (!this.striker) {
      const airFriction =
        PHYSICS_CONFIG.frictionAir[this.frictionMode] || PHYSICS_CONFIG.frictionAir.standard;

      this.striker = Bodies.circle(clampedX, targetY, STRIKER_RADIUS, {
        restitution: PHYSICS_CONFIG.restitution,
        friction: PHYSICS_CONFIG.friction,
        frictionAir: airFriction,
        mass: PHYSICS_CONFIG.strikerMass,
        label: PIECE_TYPES.STRIKER,
        customType: PIECE_TYPES.STRIKER,
      });
      World.add(this.world, this.striker);
    } else {
      Body.setPosition(this.striker, { x: clampedX, y: targetY });
      Body.setVelocity(this.striker, { x: 0, y: 0 });
      Body.setAngularVelocity(this.striker, 0);
    }
  }

  // Apply launch impulse to striker
  shoot(angleRad, powerPercent) {
    if (!this.striker || this.isShotInProgress) return false;

    const minForce = PHYSICS_CONFIG.minImpulseForce;
    const maxForce = PHYSICS_CONFIG.maxImpulseForce;
    const forceMagnitude = minForce + (maxForce - minForce) * (powerPercent / 100);

    const forceVector = {
      x: Math.cos(angleRad) * forceMagnitude,
      y: Math.sin(angleRad) * forceMagnitude,
    };

    Body.applyForce(this.striker, this.striker.position, forceVector);
    this.isShotInProgress = true;
    this.shotStartTime = performance.now();
    this.restCounter = 0;
    return true;
  }

  // Return a coin to center
  returnCoinToCenter(pieceType) {
    const cx = BOARD.CENTER.x;
    const cy = BOARD.CENTER.y;
    const r = COIN_RADIUS;
    const airFriction =
      PHYSICS_CONFIG.frictionAir[this.frictionMode] || PHYSICS_CONFIG.frictionAir.standard;

    let targetX = cx;
    let targetY = cy;
    let attempt = 0;
    while (attempt < 12) {
      const occupied = this.coins.some(
        (c) => Math.hypot(c.position.x - targetX, c.position.y - targetY) < r * 2.2
      );
      if (!occupied) break;
      const angle = (attempt * Math.PI) / 6;
      const dist = (attempt + 1) * 18;
      targetX = cx + Math.cos(angle) * dist;
      targetY = cy + Math.sin(angle) * dist;
      attempt++;
    }

    const coinBody = Bodies.circle(targetX, targetY, r, {
      restitution: PHYSICS_CONFIG.restitution,
      friction: PHYSICS_CONFIG.friction,
      frictionAir: airFriction,
      mass: PHYSICS_CONFIG.coinMass,
      label: pieceType,
      customType: pieceType,
    });

    this.pendingAdditions.push(coinBody);
  }

  // Main physics loop update
  update(deltaMs = 16.667) {
    // 1. Process safe additions
    while (this.pendingAdditions.length > 0) {
      const body = this.pendingAdditions.shift();
      this.coins.push(body);
      World.add(this.world, body);
    }

    // 2. Process safe removals
    while (this.pendingRemovals.length > 0) {
      const body = this.pendingRemovals.shift();
      World.remove(this.world, body);
    }

    // 3. Step Matter.js Engine
    Engine.update(this.engine, deltaMs);

    // 4. Update sinking pieces animations
    for (let i = this.sinkingPieces.length - 1; i >= 0; i--) {
      const sp = this.sinkingPieces[i];
      sp.progress += 0.085;
      sp.scale = Math.max(0, 1 - sp.progress);
      sp.opacity = Math.max(0, 1 - sp.progress * 1.15);
      sp.x += (sp.targetPocket.x - sp.x) * 0.22;
      sp.y += (sp.targetPocket.y - sp.y) * 0.22;

      if (sp.progress >= 1) {
        this.sinkingPieces.splice(i, 1);
      }
    }

    // 5. Active Velocity Damping: actively slow down crawling pieces to prevent infinite hangs
    const cutoff = PHYSICS_CONFIG.linearDampingCutoff;
    const restThresh = PHYSICS_CONFIG.restVelocityThreshold;

    this.coins.forEach((c) => {
      const speed = Math.hypot(c.velocity.x, c.velocity.y);
      if (speed < cutoff && speed > 0.001) {
        Body.setVelocity(c, { x: c.velocity.x * 0.88, y: c.velocity.y * 0.88 });
      }
      if (speed < restThresh) {
        Body.setVelocity(c, { x: 0, y: 0 });
        Body.setAngularVelocity(c, 0);
      }
    });

    if (this.striker) {
      const speed = Math.hypot(this.striker.velocity.x, this.striker.velocity.y);
      if (speed < cutoff && speed > 0.001) {
        Body.setVelocity(this.striker, {
          x: this.striker.velocity.x * 0.88,
          y: this.striker.velocity.y * 0.88,
        });
      }
      if (speed < restThresh) {
        Body.setVelocity(this.striker, { x: 0, y: 0 });
        Body.setAngularVelocity(this.striker, 0);
      }
    }

    // 6. Pocket detection for active coins
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      for (const pocket of POCKETS) {
        const dist = Math.hypot(coin.position.x - pocket.x, coin.position.y - pocket.y);
        if (dist <= POCKET_CAPTURE_RADIUS) {
          const type = coin.customType;
          this.sinkingPieces.push({
            type,
            x: coin.position.x,
            y: coin.position.y,
            targetPocket: pocket,
            scale: 1,
            opacity: 1,
            progress: 0,
          });

          this.pendingRemovals.push(coin);
          this.coins.splice(i, 1);

          if (this.onPocketed) {
            this.onPocketed({ type, pocket });
          }
          break;
        }
      }
    }

    // 7. Pocket detection for striker
    if (this.striker) {
      for (const pocket of POCKETS) {
        const dist = Math.hypot(this.striker.position.x - pocket.x, this.striker.position.y - pocket.y);
        if (dist <= POCKET_CAPTURE_RADIUS) {
          this.sinkingPieces.push({
            type: PIECE_TYPES.STRIKER,
            x: this.striker.position.x,
            y: this.striker.position.y,
            targetPocket: pocket,
            scale: 1,
            opacity: 1,
            progress: 0,
          });

          this.pendingRemovals.push(this.striker);
          this.striker = null;

          if (this.onPocketed) {
            this.onPocketed({ type: PIECE_TYPES.STRIKER, pocket });
          }
          break;
        }
      }
    }

    // 8. Resting State & Timeout Watchdog
    if (this.isShotInProgress) {
      const elapsed = performance.now() - this.shotStartTime;
      const isTimedOut = elapsed > PHYSICS_CONFIG.maxShotDurationMs;

      let isMoving = false;
      if (this.striker) {
        const v = Math.hypot(this.striker.velocity.x, this.striker.velocity.y);
        if (v > restThresh) isMoving = true;
      }

      if (!isMoving) {
        for (const coin of this.coins) {
          const v = Math.hypot(coin.velocity.x, coin.velocity.y);
          if (v > restThresh) {
            isMoving = true;
            break;
          }
        }
      }

      // If stopped OR exceeded maximum timeout, finalize stroke
      if ((!isMoving && this.sinkingPieces.length === 0) || isTimedOut) {
        this.restCounter++;
        if (this.restCounter > 6 || isTimedOut) {
          this.isShotInProgress = false;
          this.restCounter = 0;

          // Force stop all micro movements
          if (this.striker) {
            Body.setVelocity(this.striker, { x: 0, y: 0 });
            Body.setAngularVelocity(this.striker, 0);
          }
          this.coins.forEach((c) => {
            Body.setVelocity(c, { x: 0, y: 0 });
            Body.setAngularVelocity(c, 0);
          });

          if (this.onRest) {
            this.onRest();
          }
        }
      } else {
        this.restCounter = 0;
      }
    }
  }

  destroy() {
    Events.off(this.engine);
    World.clear(this.world);
    Engine.clear(this.engine);
  }
}
