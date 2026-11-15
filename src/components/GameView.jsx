import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CarromPhysics } from '../game/physics';
import { CarromRenderer } from '../game/renderer';
import { CarromRules, GAME_MODES, TURN_PHASES } from '../game/rules';
import { CarromAI } from '../game/ai';
import { CANVAS_SIZE, BASELINES, STRIKER_RADIUS, COIN_RADIUS, PIECE_TYPES } from '../game/constants';
import { sound } from '../utils/audio';
import { updateStatsOnMatchEnd } from '../utils/storage';

import ScoreBoard from './ScoreBoard';
import AimControls from './AimControls';
import GameOverModal from './GameOverModal';
import RulesModal from './RulesModal';

export default function GameView({
  mode = GAME_MODES.VS_AI,
  aiDifficulty = 'tactical',
  settings,
  onOpenMenu,
  onToggleSfx,
  onToggleMusic,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const footerRef = useRef(null);

  // Engine references
  const physicsRef = useRef(null);
  const rendererRef = useRef(null);
  const rulesRef = useRef(null);
  const aiRef = useRef(null);
  const animFrameRef = useRef(null);
  const aiTimerRef = useRef(null);
  const handlePiecesAtRestRef = useRef(null);
  const handleGameRuleEventRef = useRef(null);

  // Real-time Aiming State Ref (Eliminates closure lag in requestAnimationFrame)
  const aimStateRef = useRef({
    angleRad: -Math.PI / 2, // 270 deg (pointing straight up into board)
    power: 65,
    strikerX: 400,
    isCharging: false,
    isValidStrikerPlacement: true,
    phase: TURN_PHASES.PLACING_STRIKER,
  });

  // Gameplay State
  const [currentTurn, setCurrentTurn] = useState('player1');
  const [phase, setPhase] = useState(TURN_PHASES.PLACING_STRIKER);
  const [whiteRemaining, setWhiteRemaining] = useState(9);
  const [blackRemaining, setBlackRemaining] = useState(9);
  const [queenStatus, setQueenStatus] = useState('on_board');
  const [pocketedWhite, setPocketedWhite] = useState(0);
  const [pocketedBlack, setPocketedBlack] = useState(0);
  const [scorePlayer, setScorePlayer] = useState(0);
  const [scoreEnemy, setScoreEnemy] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [announcement, setAnnouncement] = useState(null);
  const [strikerX, setStrikerX] = useState(400);

  // Modals
  const [showGameOver, setShowGameOver] = useState(false);
  const [gameOverData, setGameOverData] = useState(null);
  const [showRules, setShowRules] = useState(false);

  // Drag interaction
  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
  });

  // Calculate exact available height between header and footer
  const handleResize = useCallback(() => {
    const container = containerRef.current;
    if (!container || !rendererRef.current) return;

    const headerEl = headerRef.current;
    const footerEl = footerRef.current;

    const headerHeight = headerEl ? headerEl.offsetHeight : 44;
    const footerHeight = footerEl ? footerEl.offsetHeight : 48;
    const safetyMargin = 10;

    const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    const viewportWidth = window.visualViewport ? window.visualViewport.width : container.clientWidth;

    const availableHeight = viewportHeight - headerHeight - footerHeight - safetyMargin;
    const availableWidth = viewportWidth - 12;

    const size = Math.min(availableWidth, availableHeight);
    rendererRef.current.resize(Math.max(220, Math.floor(size)));
  }, []);

  // 1. Initialize Engines
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new CarromRenderer(canvas);
    rendererRef.current = renderer;

    const rules = new CarromRules({
      mode,
      aiDifficulty,
      onEvent: (event) => {
        handleGameRuleEventRef.current?.(event);
      },
    });
    rulesRef.current = rules;

    const ai = new CarromAI(aiDifficulty);
    aiRef.current = ai;

    const physics = new CarromPhysics({
      frictionMode: settings.powderFriction || 'standard',
      onCollision: ({ isWall, speed, point }) => {
        if (isWall) {
          sound.playCushionBounce(speed);
        } else {
          sound.playCoinCollision(speed);
          renderer.emitCollisionDust(point.x, point.y, speed);
        }
      },
      onPocketed: ({ type, pocket }) => {
        const isQueen = type === PIECE_TYPES.QUEEN;
        sound.playPocketSound(isQueen);
        renderer.emitPocketSparks(pocket, isQueen);
        if (type === PIECE_TYPES.STRIKER) {
          renderer.emitFoulSparks(pocket.x, pocket.y);
        }
        rules.registerPocket(type);
      },
      onRest: () => {
        handlePiecesAtRestRef.current?.();
      },
    });
    physicsRef.current = physics;

    physics.setupCoins();
    physics.setStrikerPosition(400, 'player1');

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    let resizeObserver;
    if (window.ResizeObserver && containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(containerRef.current);
    }

    let lastTime = performance.now();
    const tick = (now) => {
      const delta = Math.min(32, now - lastTime);
      lastTime = now;

      physics.update(delta);

      // Read real-time live aiming ref values
      const {
        angleRad,
        power: curPower,
        strikerX: curX,
        isCharging: curCharging,
        isValidStrikerPlacement: curValid,
        phase: curPhase,
      } = aimStateRef.current;

      renderer.render({
        coins: physics.coins,
        striker: physics.striker,
        sinkingPieces: physics.sinkingPieces,
        aimingState: {
          active: curPhase !== TURN_PHASES.IN_MOTION && curPhase !== TURN_PHASES.GAME_OVER,
          angle: angleRad,
          power: curPower,
          strikerX: curX,
          player: rules.currentTurn,
        },
        validStrikerPlacement: curValid,
        guidelineLevel: settings.guidelineAssist || 'full',
        isCharging: curCharging,
      });

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
      physics.destroy();
    };
  }, [mode, aiDifficulty, handleResize]);

  // Decoupled Match Countdown Timer (Ticking at 1Hz, zero 60fps React thrash)
  useEffect(() => {
    const timerInterval = setInterval(() => {
      const rules = rulesRef.current;
      if (!rules || !rules.isTimerRunning || rules.phase === TURN_PHASES.GAME_OVER) return;

      if (rules.timeLeft > 0) {
        rules.timeLeft = Math.max(0, rules.timeLeft - 1);
        setTimeLeft(Math.ceil(rules.timeLeft));

        if (rules.timeLeft <= 0) {
          handlePiecesAtRestRef.current?.();
        }
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  // Update friction
  useEffect(() => {
    if (physicsRef.current && settings.powderFriction) {
      physicsRef.current.setFrictionMode(settings.powderFriction);
    }
  }, [settings.powderFriction]);

  // Striker placement collision validation
  const validatePlacement = useCallback((x, player) => {
    if (!physicsRef.current) return true;
    const baseline = player === 'player1' ? BASELINES.bottom : BASELINES.top;
    const y = baseline.y;

    const overlap = physicsRef.current.coins.some((c) => {
      const d = Math.hypot(c.position.x - x, c.position.y - y);
      return d < STRIKER_RADIUS + COIN_RADIUS - 2;
    });

    aimStateRef.current.isValidStrikerPlacement = !overlap;
    return !overlap;
  }, []);

  // Striker position adjustment along baseline
  const handleStrikerXChange = (newX) => {
    setStrikerX(newX);
    aimStateRef.current.strikerX = newX;
    if (physicsRef.current && rulesRef.current) {
      physicsRef.current.setStrikerPosition(newX, rulesRef.current.currentTurn);
      validatePlacement(newX, rulesRef.current.currentTurn);
    }
  };

  // Safe canvas coordinate translation across touch, changedTouches and mouse
  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 400, y: 660 };
    const rect = canvas.getBoundingClientRect();

    let clientX = e.clientX;
    let clientY = e.clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    }

    if (clientX === undefined || clientY === undefined) {
      return { x: 400, y: 660 };
    }

    const scaleX = CANVAS_SIZE / (rect.width || 1);
    const scaleY = CANVAS_SIZE / (rect.height || 1);

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Live aim angle and impulse force calculation
  const updateAimFromPointer = (pointerX, pointerY) => {
    if (!physicsRef.current || !physicsRef.current.striker) return;
    const sx = physicsRef.current.striker.position.x;
    const sy = physicsRef.current.striker.position.y;

    let dx, dy;
    // Slingshot pull: When pulling downwards behind the striker, impulse fires forwards into board
    if (pointerY > sy + 6) {
      dx = sx - pointerX;
      dy = sy - pointerY;
    } else {
      // Forward aiming towards coins
      dx = pointerX - sx;
      dy = pointerY - sy;
    }

    const dist = Math.hypot(dx, dy);
    if (dist > 8) {
      const rad = Math.atan2(dy, dx);
      const calculatedPower = Math.min(100, Math.max(30, (dist / 140) * 100));

      aimStateRef.current.angleRad = rad;
      aimStateRef.current.power = Math.round(calculatedPower);
      aimStateRef.current.isCharging = true;
    }
  };

  const handleShoot = () => {
    if (!physicsRef.current || aimStateRef.current.phase === TURN_PHASES.IN_MOTION) return;
    if (!aimStateRef.current.isValidStrikerPlacement) {
      setAnnouncement({
        type: 'warning',
        title: 'ILLEGAL POSITION',
        message: 'Striker overlaps an existing coin! Slide along baseline.',
      });
      return;
    }

    const angle = aimStateRef.current.angleRad;
    const power = aimStateRef.current.power;

    const shotSuccess = physicsRef.current.shoot(angle, power);
    if (shotSuccess) {
      sound.playStrikerHit(power / 65);
      aimStateRef.current.phase = TURN_PHASES.IN_MOTION;
      aimStateRef.current.isCharging = false;
      setPhase(TURN_PHASES.IN_MOTION);
    }
  };

  // Turn settlement after all pieces come to rest
  const handlePiecesAtRest = () => {
    const physics = physicsRef.current;
    const rules = rulesRef.current;
    if (!physics || !rules) return;

    aimStateRef.current.phase = TURN_PHASES.EVALUATING;
    setPhase(TURN_PHASES.EVALUATING);

    const result = rules.evaluateStroke(physics.coins);

    const wCount = physics.coins.filter((c) => c.customType === PIECE_TYPES.WHITE).length;
    const bCount = physics.coins.filter((c) => c.customType === PIECE_TYPES.BLACK).length;
    setWhiteRemaining(wCount);
    setBlackRemaining(bCount);
    setQueenStatus(rules.queenStatus);
    setPocketedWhite(rules.pocketed?.player1 ?? 0);
    setPocketedBlack(rules.pocketed?.player2 ?? 0);

    if (result.penaltyCoinToReturn) {
      physics.returnCoinToCenter(result.penaltyCoinToReturn);
    }
    if (result.queenToReturn) {
      physics.returnCoinToCenter(PIECE_TYPES.QUEEN);
    }

    if (result.isGameOver) {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
      aimStateRef.current.phase = TURN_PHASES.GAME_OVER;
      setPhase(TURN_PHASES.GAME_OVER);
      setGameOverData({
        winner: result.winner,
        score: rules.matchStats.finalScore,
        matchStats: rules.matchStats,
        queenStatus: rules.queenStatus,
      });

      updateStatsOnMatchEnd({
        won: result.winner === 'player1',
        difficulty: mode === 'vs-ai' ? aiDifficulty : null,
        whiteCoins: rules.pocketed?.player1 ?? 0,
        blackCoins: rules.pocketed?.player2 ?? 0,
        queenCovered: rules.queenStatus === 'covered_player1',
        fouls: rules.matchStats.player1Fouls,
        maxBreakInGame: 0,
      });

      setShowGameOver(true);
      return;
    }

    // Set next turn
    setCurrentTurn(result.nextTurn);
    aimStateRef.current.phase = TURN_PHASES.PLACING_STRIKER;
    setPhase(TURN_PHASES.PLACING_STRIKER);

    const defaultX = 400;
    setStrikerX(defaultX);
    aimStateRef.current.strikerX = defaultX;
    physics.setStrikerPosition(defaultX, result.nextTurn);
    validatePlacement(defaultX, result.nextTurn);

    aimStateRef.current.angleRad = result.nextTurn === 'player1' ? -Math.PI / 2 : Math.PI / 2;

    if (mode === GAME_MODES.VS_AI && result.nextTurn === 'player2') {
      triggerAiTurn();
    }
  };

  // AI turn execution
  const triggerAiTurn = () => {
    const ai = aiRef.current;
    const physics = physicsRef.current;
    const rules = rulesRef.current;
    if (!ai || !physics || !rules) return;

    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);

    setAnnouncement({
      type: 'ai_thinking',
      title: 'SHADOW CALCULATING 影',
      message: 'Aiming target vector...',
    });

    aiTimerRef.current = setTimeout(() => {
      const shot = ai.calculateShot({
        coins: physics.coins,
        queenStatus: rules.queenStatus,
      });

      if (!shot) return;

      setStrikerX(shot.strikerX);
      aimStateRef.current.strikerX = shot.strikerX;
      physics.setStrikerPosition(shot.strikerX, 'player2');
      validatePlacement(shot.strikerX, 'player2');

      aimStateRef.current.angleRad = shot.angle;
      aimStateRef.current.power = shot.power;
      aimStateRef.current.isCharging = true;

      setAnnouncement(null);

      aiTimerRef.current = setTimeout(() => {
        const shotSuccess = physics.shoot(shot.angle, shot.power);
        if (shotSuccess) {
          sound.playStrikerHit(shot.power / 65);
          aimStateRef.current.phase = TURN_PHASES.IN_MOTION;
          aimStateRef.current.isCharging = false;
          setPhase(TURN_PHASES.IN_MOTION);
        }
      }, 650);
    }, 750);
  };

  const handleGameRuleEvent = (event) => {
    setAnnouncement(event);
    if (event.scorePlayer !== undefined) setScorePlayer(event.scorePlayer);
    if (event.scoreEnemy !== undefined) setScoreEnemy(event.scoreEnemy);

    if (event.type === 'queen') {
      sound.playCoverSuccess();
    } else if (event.type === 'foul') {
      sound.playFoulSound();
    }
    setTimeout(() => {
      setAnnouncement(null);
    }, 3200);
  };

  const handleRestart = () => {
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    if (!physicsRef.current || !rulesRef.current) return;
    rulesRef.current.reset();
    physicsRef.current.setupCoins();
    physicsRef.current.setStrikerPosition(400, 'player1');
    setCurrentTurn('player1');
    aimStateRef.current.phase = TURN_PHASES.PLACING_STRIKER;
    aimStateRef.current.strikerX = 400;
    aimStateRef.current.angleRad = -Math.PI / 2;
    aimStateRef.current.power = 65;
    aimStateRef.current.isCharging = false;
    setPhase(TURN_PHASES.PLACING_STRIKER);
    setStrikerX(400);
    setWhiteRemaining(9);
    setBlackRemaining(9);
    setQueenStatus('on_board');
    setPocketedWhite(0);
    setPocketedBlack(0);
    setScorePlayer(0);
    setScoreEnemy(0);
    setTimeLeft(120);
    setAnnouncement(null);
    setShowGameOver(false);
  };

  useEffect(() => {
    handlePiecesAtRestRef.current = handlePiecesAtRest;
    handleGameRuleEventRef.current = handleGameRuleEvent;
  });

  // Pointer interaction handlers
  const handlePointerDown = (e) => {
    if (e.cancelable) e.preventDefault();
    if (phase === TURN_PHASES.IN_MOTION || (mode === 'vs-ai' && currentTurn === 'player2')) return;
    const { x, y } = getCanvasCoords(e);
    dragRef.current = {
      isDragging: true,
      startX: x,
      startY: y,
    };
    aimStateRef.current.isCharging = true;
    updateAimFromPointer(x, y);
  };

  const handlePointerMove = (e) => {
    if (e.cancelable) e.preventDefault();
    if (!dragRef.current.isDragging) return;
    const { x, y } = getCanvasCoords(e);
    updateAimFromPointer(x, y);
  };

  const handlePointerUp = (e) => {
    if (e.cancelable) e.preventDefault();
    if (!dragRef.current.isDragging) return;
    dragRef.current.isDragging = false;
    aimStateRef.current.isCharging = false;

    if (!physicsRef.current || !physicsRef.current.striker) return;
    const { x, y } = getCanvasCoords(e);
    const sx = physicsRef.current.striker.position.x;
    const sy = physicsRef.current.striker.position.y;
    const dist = Math.hypot(x - sx, y - sy);

    if (dist > 16) {
      handleShoot();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[100dvh] max-h-[100dvh] flex flex-col items-center justify-between p-1 sm:p-2 text-white select-none overflow-hidden bg-[#050505]"
    >
      {/* Top HUD */}
      <div ref={headerRef} className="w-full max-w-4xl shrink-0">
        <ScoreBoard
          mode={mode}
          aiDifficulty={aiDifficulty}
          currentTurn={currentTurn}
          whiteRemaining={whiteRemaining}
          blackRemaining={blackRemaining}
          queenStatus={queenStatus}
          pocketedWhite={pocketedWhite}
          pocketedBlack={pocketedBlack}
          scorePlayer={scorePlayer}
          scoreEnemy={scoreEnemy}
          timeLeft={timeLeft}
          announcement={announcement}
          sfxEnabled={settings.sfxEnabled}
          musicEnabled={settings.musicEnabled}
          onToggleSfx={onToggleSfx}
          onToggleMusic={onToggleMusic}
          onRestart={handleRestart}
          onOpenRules={() => setShowRules(true)}
          onOpenMenu={onOpenMenu}
        />
      </div>

      {/* Board Canvas Area */}
      <div className="relative flex-1 min-h-0 flex items-center justify-center p-0.5 w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          onTouchCancel={handlePointerUp}
          className="rounded-2xl cursor-crosshair shadow-2xl border-2 border-[#ff0033]/40 active:cursor-grabbing bg-black touch-none"
          style={{ touchAction: 'none' }}
        />
      </div>

      {/* Bottom Controls */}
      <div ref={footerRef} className="w-full max-w-xl shrink-0 px-2 py-1">
        <AimControls
          phase={phase}
          isAiTurn={mode === 'vs-ai' && currentTurn === 'player2'}
          strikerX={strikerX}
          onStrikerXChange={handleStrikerXChange}
          onShoot={handleShoot}
          minX={BASELINES.bottom.minX}
          maxX={BASELINES.bottom.maxX}
        />
      </div>

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}

      {showGameOver && gameOverData && (
        <GameOverModal
          winner={gameOverData.winner}
          score={gameOverData.score}
          mode={mode}
          matchStats={gameOverData.matchStats}
          queenStatus={gameOverData.queenStatus}
          onRematch={handleRestart}
          onMainMenu={onOpenMenu}
        />
      )}
    </div>
  );
}
