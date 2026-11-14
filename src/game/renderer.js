// KAGE CARROM - Minimalist RED / BLACK / WHITE Canvas Renderer
import {
  CANVAS_SIZE,
  FRAME_WIDTH,
  BOARD,
  POCKETS,
  COIN_RADIUS,
  STRIKER_RADIUS,
  PIECE_TYPES,
  BASELINES,
  RED_BLACK_WHITE_PALETTE,
} from './constants';

export class CarromRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.dpr = window.devicePixelRatio || 1;
  }

  resize(displaySize) {
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = displaySize * this.dpr;
    this.canvas.height = displaySize * this.dpr;
    this.canvas.style.width = `${displaySize}px`;
    this.canvas.style.height = `${displaySize}px`;
  }

  render({
    coins = [],
    striker = null,
    sinkingPieces = [],
    aimingState = null,
    validStrikerPlacement = true,
    guidelineLevel = 'full',
    isCharging = false,
  }) {
    const ctx = this.ctx;
    ctx.save();
    const scale = (this.canvas.width / this.dpr) / CANVAS_SIZE;
    ctx.scale(this.dpr * scale, this.dpr * scale);

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // 1. Board & Markings (Red, Black & White)
    this._drawBoardFrame(ctx);
    this._drawPlayingSurface(ctx);
    this._drawPockets(ctx);
    this._drawMarkings(ctx);

    // 2. Drop Shadows
    coins.forEach((c) => this._drawPieceShadow(ctx, c.position.x, c.position.y, COIN_RADIUS));
    if (striker) {
      this._drawPieceShadow(ctx, striker.position.x, striker.position.y, STRIKER_RADIUS);
    }

    // 3. Aiming Guide & Red Force Field Arrow
    if (aimingState && aimingState.active && striker && guidelineLevel !== 'off') {
      this._drawAimingGuide(ctx, striker, coins, aimingState, guidelineLevel, isCharging);
    }

    // 4. Draw Coins
    coins.forEach((c) => {
      this._drawPiece(ctx, c.position.x, c.position.y, COIN_RADIUS, c.customType);
    });

    // 5. Draw Striker
    if (striker) {
      this._drawStriker(ctx, striker.position.x, striker.position.y, STRIKER_RADIUS, validStrikerPlacement, isCharging);
    }

    // 6. Draw Sinking Pieces
    sinkingPieces.forEach((sp) => {
      const radius = sp.type === PIECE_TYPES.STRIKER ? STRIKER_RADIUS : COIN_RADIUS;
      this._drawSinkingPiece(ctx, sp, radius);
    });

    // 7. Update Particles
    this._updateAndDrawParticles(ctx);

    ctx.restore();
  }

  // 1. Outer Frame (Minimalist Jet Black with Red Accent Trim)
  _drawBoardFrame(ctx) {
    const w = CANVAS_SIZE;
    const fw = FRAME_WIDTH;

    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(0, 0, w, w);

    // Outer Red Accent Line
    ctx.strokeStyle = '#ff0033';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(6, 6, w - 12, w - 12);

    // Inner White Frame Border
    ctx.strokeStyle = '#222228';
    ctx.lineWidth = 3;
    ctx.strokeRect(fw - 2, fw - 2, w - 2 * fw + 4, w - 2 * fw + 4);
  }

  // 2. Playing Surface (Clean Dark Charcoal)
  _drawPlayingSurface(ctx) {
    const fw = FRAME_WIDTH;
    const playSize = CANVAS_SIZE - 2 * fw;

    ctx.fillStyle = '#111114';
    ctx.fillRect(fw, fw, playSize, playSize);

    // Subtle radial spotlight
    const vignette = ctx.createRadialGradient(400, 400, 100, 400, 400, 430);
    vignette.addColorStop(0, 'rgba(255, 255, 255, 0.03)');
    vignette.addColorStop(0.7, 'rgba(0, 0, 0, 0.3)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
    ctx.fillStyle = vignette;
    ctx.fillRect(fw, fw, playSize, playSize);
  }

  // 3. Pockets (Pure Black with Red Rings)
  _drawPockets(ctx) {
    POCKETS.forEach((p) => {
      // Outer Red Ring
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius + 3, 0, Math.PI * 2);
      ctx.fillStyle = '#1c1c22';
      ctx.fill();
      ctx.strokeStyle = '#ff0033';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Deep Black Well
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.fill();
    });
  }

  // 4. Clean Red & White Board Markings
  _drawMarkings(ctx) {
    const cx = BOARD.CENTER.x;
    const cy = BOARD.CENTER.y;

    // Center Inner Queen Circle (Radius 40)
    ctx.beginPath();
    ctx.arc(cx, cy, BOARD.CENTER_INNER_RADIUS, 0, Math.PI * 2);
    ctx.strokeStyle = '#ff0033';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Center Outer Circle (Radius 130)
    ctx.beginPath();
    ctx.arc(cx, cy, BOARD.CENTER_OUTER_RADIUS, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Center Rosette Petals (White & Red)
    ctx.save();
    ctx.translate(cx, cy);
    for (let i = 0; i < 8; i++) {
      ctx.rotate((Math.PI * 2) / 8);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(12, 50, 0, BOARD.CENTER_OUTER_RADIUS - 8);
      ctx.quadraticCurveTo(-12, 50, 0, 0);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, BOARD.CENTER_OUTER_RADIUS - 16, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ff0033';
      ctx.fill();
    }
    ctx.restore();

    // Baselines (Bottom & Top)
    this._drawBaseline(ctx, BASELINES.bottom);
    this._drawBaseline(ctx, BASELINES.top);

    // Side baselines
    this._drawSideBaselines(ctx, 140, 210, 590);
    this._drawSideBaselines(ctx, 660, 210, 590);

    // Diagonal Foul Lines with Red End Arrows
    this._drawFoulLines(ctx);
  }

  _drawBaseline(ctx, b) {
    const y1 = b.y - b.lineSpacing;
    const y2 = b.y + b.lineSpacing;

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(b.minX, y1);
    ctx.lineTo(b.maxX, y1);
    ctx.moveTo(b.minX, y2);
    ctx.lineTo(b.maxX, y2);
    ctx.stroke();

    // Left Circle (Solid Red)
    ctx.beginPath();
    ctx.arc(b.leftCircle.x, b.leftCircle.y, b.leftCircle.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ff0033';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Right Circle (Solid Red)
    ctx.beginPath();
    ctx.arc(b.rightCircle.x, b.rightCircle.y, b.rightCircle.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ff0033';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  _drawSideBaselines(ctx, x, minY, maxY) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x - 11, minY);
    ctx.lineTo(x - 11, maxY);
    ctx.moveTo(x + 11, minY);
    ctx.lineTo(x + 11, maxY);
    ctx.stroke();

    [minY, maxY].forEach((y) => {
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.fillStyle = '#ff0033';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }

  _drawFoulLines(ctx) {
    const cx = BOARD.CENTER.x;
    const cy = BOARD.CENTER.y;

    POCKETS.forEach((p) => {
      const angle = Math.atan2(p.y - cy, p.x - cx);
      const startDist = BOARD.CENTER_OUTER_RADIUS + 12;
      const endDist = Math.hypot(p.x - cx, p.y - cy) - 48;

      const sx = cx + Math.cos(angle) * startDist;
      const sy = cy + Math.sin(angle) * startDist;
      const ex = cx + Math.cos(angle) * endDist;
      const ey = cy + Math.sin(angle) * endDist;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Red Arrow Head
      const size = 10;
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - size * Math.cos(angle - Math.PI / 6), ey - size * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(ex - size * Math.cos(angle + Math.PI / 6), ey - size * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fillStyle = '#ff0033';
      ctx.fill();

      // Red Mid Circle
      const midDist = (startDist + endDist) * 0.58;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(angle) * midDist, cy + Math.sin(angle) * midDist, 11, 0, Math.PI * 2);
      ctx.strokeStyle = '#ff0033';
      ctx.lineWidth = 1.6;
      ctx.stroke();
    });
  }

  _drawPieceShadow(ctx, x, y, radius) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x + 2, y + 3.5, radius * 1.05, radius * 0.95, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.filter = 'blur(2.5px)';
    ctx.fill();
    ctx.restore();
  }

  _drawPiece(ctx, x, y, radius, type) {
    ctx.save();

    if (type === PIECE_TYPES.WHITE) {
      // Pure White Carrom Man
      const grad = ctx.createRadialGradient(x - radius * 0.35, y - radius * 0.35, radius * 0.1, x, y, radius);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.7, '#f4f4f8');
      grad.addColorStop(1, '#d0d0d8');

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, radius * 0.62, 0, Math.PI * 2);
      ctx.strokeStyle = '#a0a0aa';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, radius * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = '#b0b0ba';
      ctx.fill();
    } else if (type === PIECE_TYPES.BLACK) {
      // Jet Black with Red Accent Rim
      const grad = ctx.createRadialGradient(x - radius * 0.35, y - radius * 0.35, radius * 0.1, x, y, radius);
      grad.addColorStop(0, '#26262a');
      grad.addColorStop(0.7, '#121214');
      grad.addColorStop(1, '#050506');

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = '#ff0033';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, radius * 0.62, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 0, 51, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, radius * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = '#ff0033';
      ctx.fill();
    } else if (type === PIECE_TYPES.QUEEN) {
      // Royal Blood Red Queen with Stark White Star
      const grad = ctx.createRadialGradient(x - radius * 0.35, y - radius * 0.35, radius * 0.1, x, y, radius);
      grad.addColorStop(0, '#ff3355');
      grad.addColorStop(0.7, '#ff0033');
      grad.addColorStop(1, '#b30024');

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      this._drawStar(ctx, x, y, 8, radius * 0.55, radius * 0.24, '#ffffff', '#ffffff');
    }

    ctx.restore();
  }

  _drawStriker(ctx, x, y, radius, isValidPlacement = true, isCharging = false) {
    ctx.save();

    if (!isValidPlacement) {
      ctx.beginPath();
      ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 0, 51, 0.4)';
      ctx.fill();
    }

    if (isCharging) {
      ctx.beginPath();
      ctx.arc(x, y, radius + 7, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 0, 51, 0.45)';
      ctx.shadowColor = '#ff0033';
      ctx.shadowBlur = 12;
      ctx.fill();
    }

    // Striker Body (Obsidian Black)
    const grad = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, radius * 0.1, x, y, radius);
    grad.addColorStop(0, '#2e2e36');
    grad.addColorStop(0.5, '#121216');
    grad.addColorStop(1, '#050506');

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Red Outer Rim
    ctx.strokeStyle = isValidPlacement ? '#ff0033' : '#ff4d6d';
    ctx.lineWidth = 2.4;
    ctx.stroke();

    // White Inner Rim
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.65, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // White Center Crosshairs
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x - radius * 0.45, y);
    ctx.lineTo(x + radius * 0.45, y);
    ctx.moveTo(x, y - radius * 0.45);
    ctx.lineTo(x, y + radius * 0.45);
    ctx.stroke();

    // Center Red Dot
    ctx.beginPath();
    ctx.arc(x, y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ff0033';
    ctx.shadowColor = '#ff0033';
    ctx.shadowBlur = 8;
    ctx.fill();

    ctx.restore();
  }

  _drawSinkingPiece(ctx, sp, radius) {
    ctx.save();
    ctx.globalAlpha = sp.opacity;
    const r = radius * sp.scale;
    if (r > 1) {
      this._drawPiece(ctx, sp.x, sp.y, r, sp.type);
    }
    ctx.restore();
  }

  // Aiming Guide & Red Force Field Arrow (matching Unity strikerForceField)
  _drawAimingGuide(ctx, striker, coins, aimingState, guidelineLevel, isCharging) {
    const sx = striker.position.x;
    const sy = striker.position.y;
    const angle = aimingState.angle;
    const power = aimingState.power;

    const dirX = Math.cos(angle);
    const dirY = Math.sin(angle);
    const maxRayDist = 650;

    let closestHit = null;
    let minT = maxRayDist;

    // Coins collision check
    coins.forEach((coin) => {
      const cx = coin.position.x;
      const cy = coin.position.y;
      const rSum = STRIKER_RADIUS + COIN_RADIUS;

      const ox = sx - cx;
      const oy = sy - cy;

      const a = dirX * dirX + dirY * dirY;
      const b = 2 * (ox * dirX + oy * dirY);
      const c = ox * ox + oy * oy - rSum * rSum;

      const disc = b * b - 4 * a * c;
      if (disc >= 0) {
        const sqrtDisc = Math.sqrt(disc);
        const t1 = (-b - sqrtDisc) / (2 * a);
        if (t1 > 0 && t1 < minT) {
          minT = t1;
          closestHit = { type: 'coin', t: t1, coin, hitX: sx + dirX * t1, hitY: sy + dirY * t1 };
        }
      }
    });

    // Wall collision check
    const playMin = BOARD.PLAY_MIN + STRIKER_RADIUS;
    const playMax = BOARD.PLAY_MAX - STRIKER_RADIUS;

    if (dirX > 0) {
      const t = (playMax - sx) / dirX;
      if (t > 0 && t < minT) minT = t;
    }
    if (dirX < 0) {
      const t = (playMin - sx) / dirX;
      if (t > 0 && t < minT) minT = t;
    }
    if (dirY > 0) {
      const t = (playMax - sy) / dirY;
      if (t > 0 && t < minT) minT = t;
    }
    if (dirY < 0) {
      const t = (playMin - sy) / dirY;
      if (t > 0 && t < minT) minT = t;
    }

    const endX = sx + dirX * minT;
    const endY = sy + dirY * minT;

    // Crisp White Laser Line
    ctx.save();
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = isCharging ? '#ff0033' : '#ffffff';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    if (closestHit && closestHit.type === 'coin') {
      const hitX = closestHit.hitX;
      const hitY = closestHit.hitY;
      const targetCoin = closestHit.coin;

      ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(hitX, hitY, STRIKER_RADIUS, 0, Math.PI * 2);
      ctx.stroke();

      if (guidelineLevel === 'full') {
        const normX = targetCoin.position.x - hitX;
        const normY = targetCoin.position.y - hitY;
        const normDist = Math.hypot(normX, normY) || 1;
        const uNormX = normX / normDist;
        const uNormY = normY / normDist;

        const trajectoryLen = Math.min(220, Math.max(70, power * 2.4));
        const cEndX = targetCoin.position.x + uNormX * trajectoryLen;
        const cEndY = targetCoin.position.y + uNormY * trajectoryLen;

        ctx.strokeStyle = '#ff0033';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(targetCoin.position.x, targetCoin.position.y);
        ctx.lineTo(cEndX, cEndY);
        ctx.stroke();

        this._drawArrowHead(ctx, cEndX, cEndY, Math.atan2(uNormY, uNormX), '#ff0033');
      }
    }

    // --- Dynamic Force Field Arrow (matching Unity strikerForceField) ---
    this._drawStrikerForceField(ctx, sx, sy, angle, power, isCharging);

    ctx.restore();
  }

  // Draw Striker Force Field Arrow (matching Unity strikerForceField)
  _drawStrikerForceField(ctx, sx, sy, angle, power, isCharging) {
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(angle);

    const normPower = Math.max(0, Math.min(1, (power - 20) / 80));
    const arrowLength = STRIKER_RADIUS + 10 + normPower * 65;
    const arrowWidth = 8 + normPower * 6;

    ctx.shadowColor = '#ff0033';
    ctx.shadowBlur = 10;

    ctx.fillStyle = isCharging ? '#ff0033' : '#ffffff';
    ctx.beginPath();
    ctx.moveTo(STRIKER_RADIUS + 2, -arrowWidth * 0.4);
    ctx.lineTo(arrowLength - 14, -arrowWidth * 0.4);
    ctx.lineTo(arrowLength - 14, -arrowWidth);
    ctx.lineTo(arrowLength, 0);
    ctx.lineTo(arrowLength - 14, arrowWidth);
    ctx.lineTo(arrowLength - 14, arrowWidth * 0.4);
    ctx.lineTo(STRIKER_RADIUS + 2, arrowWidth * 0.4);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  _drawArrowHead(ctx, x, y, angle, color) {
    const size = 9;
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - size * Math.cos(angle - Math.PI / 6), y - size * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x - size * Math.cos(angle + Math.PI / 6), y - size * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  _drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius, strokeColor, fillColor) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  emitCollisionDust(x, y, speed = 5) {
    const count = Math.min(14, Math.max(4, Math.floor(speed * 1.1)));
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const v = (1 + Math.random() * 3) * (speed / 10);
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * v,
        vy: Math.sin(angle) * v,
        radius: 1 + Math.random() * 2,
        color: Math.random() > 0.5 ? 'rgba(255, 0, 51, ' : 'rgba(255, 255, 255, ',
        alpha: 0.85,
        decay: 0.035,
      });
    }
  }

  emitPocketSparks(pocket, isQueen = false) {
    const count = isQueen ? 35 : 18;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4;
      this.particles.push({
        x: pocket.x,
        y: pocket.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 1.5 + Math.random() * 2,
        color: isQueen ? 'rgba(255, 0, 51, ' : 'rgba(255, 255, 255, ',
        alpha: 1,
        decay: 0.035,
      });
    }
  }

  emitFoulSparks(x, y) {
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2,
        color: 'rgba(255, 0, 51, ',
        alpha: 1,
        decay: 0.045,
      });
    }
  }

  _updateAndDrawParticles(ctx) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.94;
      p.vy *= 0.94;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `${p.color}${p.alpha})`;
      ctx.fill();
      ctx.restore();
    }
  }
}
