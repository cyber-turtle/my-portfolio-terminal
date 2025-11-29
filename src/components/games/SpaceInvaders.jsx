'use client';

import React, { useRef, useEffect, useState } from 'react';

const SpaceInvaders = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);

  // Game constants
  const CANVAS_WIDTH = 600;
  const CANVAS_HEIGHT = 400;
  const PLAYER_WIDTH = 40;
  const PLAYER_HEIGHT = 20;
  const ALIEN_WIDTH = 30;
  const ALIEN_HEIGHT = 20;
  const BULLET_SPEED = 7;
  const ALIEN_SPEED = 1;

  const gameState = useRef({
    playerX: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
    bullets: [], // { x, y }
    aliens: [], // { x, y, alive }
    alienDirection: 1, // 1 = right, -1 = left
    lastShotTime: 0,
    keys: { ArrowLeft: false, ArrowRight: false, Space: false }
  });

  useEffect(() => {
    // Initialize Aliens
    const rows = 4;
    const cols = 8;
    const aliens = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        aliens.push({
          x: 50 + c * (ALIEN_WIDTH + 15),
          y: 30 + r * (ALIEN_HEIGHT + 15),
          alive: true
        });
      }
    }
    gameState.current.aliens = aliens;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const update = () => {
      if (gameOver || victory) return;

      const state = gameState.current;

      // Player Movement
      if (state.keys.ArrowLeft) state.playerX -= 5;
      if (state.keys.ArrowRight) state.playerX += 5;
      state.playerX = Math.max(0, Math.min(CANVAS_WIDTH - PLAYER_WIDTH, state.playerX));

      // Shooting
      if (state.keys.Space && Date.now() - state.lastShotTime > 300) {
        state.bullets.push({
          x: state.playerX + PLAYER_WIDTH / 2 - 2,
          y: CANVAS_HEIGHT - PLAYER_HEIGHT
        });
        state.lastShotTime = Date.now();
      }

      // Update Bullets
      state.bullets.forEach(b => b.y -= BULLET_SPEED);
      state.bullets = state.bullets.filter(b => b.y > 0);

      // Update Aliens
      let hitWall = false;
      state.aliens.forEach(alien => {
        if (!alien.alive) return;
        alien.x += ALIEN_SPEED * state.alienDirection;
        if (alien.x <= 0 || alien.x + ALIEN_WIDTH >= CANVAS_WIDTH) {
          hitWall = true;
        }
      });

      if (hitWall) {
        state.alienDirection *= -1;
        state.aliens.forEach(alien => {
           if (alien.alive) alien.y += 20;
        });
      }

      // Collision Detection
      state.bullets.forEach((bullet, bIndex) => {
        state.aliens.forEach((alien, aIndex) => {
          if (!alien.alive) return;
          if (
            bullet.x < alien.x + ALIEN_WIDTH &&
            bullet.x + 4 > alien.x &&
            bullet.y < alien.y + ALIEN_HEIGHT &&
            bullet.y + 10 > alien.y
          ) {
            // Hit
            alien.alive = false;
            state.bullets.splice(bIndex, 1);
            setScore(prev => prev + 100);
          }
        });
      });

      // Check Win/Loss
      const activeAliens = state.aliens.filter(a => a.alive);
      if (activeAliens.length === 0) {
        setVictory(true);
      }

      activeAliens.forEach(alien => {
        if (alien.y + ALIEN_HEIGHT >= CANVAS_HEIGHT - PLAYER_HEIGHT) {
          setGameOver(true);
        }
      });

      draw(ctx, state);
      animationFrameId = requestAnimationFrame(update);
    };

    const draw = (ctx, state) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Player
      ctx.fillStyle = '#38ef7d';
      ctx.fillRect(state.playerX, CANVAS_HEIGHT - PLAYER_HEIGHT, PLAYER_WIDTH, PLAYER_HEIGHT);
      // Turret
      ctx.fillRect(state.playerX + PLAYER_WIDTH/2 - 4, CANVAS_HEIGHT - PLAYER_HEIGHT - 8, 8, 8);

      // Aliens
      state.aliens.forEach(alien => {
        if (alien.alive) {
          ctx.fillStyle = '#ff4757';
          ctx.fillRect(alien.x, alien.y, ALIEN_WIDTH, ALIEN_HEIGHT);
          // Eyes
          ctx.fillStyle = '#000';
          ctx.fillRect(alien.x + 5, alien.y + 5, 4, 4);
          ctx.fillRect(alien.x + ALIEN_WIDTH - 9, alien.y + 5, 4, 4);
        }
      });

      // Bullets
      ctx.fillStyle = '#fff';
      state.bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, 4, 10);
      });
    };

    const handleKeyDown = (e) => {
      if (e.code === 'ArrowLeft') gameState.current.keys.ArrowLeft = true;
      if (e.code === 'ArrowRight') gameState.current.keys.ArrowRight = true;
      if (e.code === 'Space') gameState.current.keys.Space = true;
    };

    const handleKeyUp = (e) => {
      if (e.code === 'ArrowLeft') gameState.current.keys.ArrowLeft = false;
      if (e.code === 'ArrowRight') gameState.current.keys.ArrowRight = false;
      if (e.code === 'Space') gameState.current.keys.Space = false;
    };
    
    // Touch Controls
    const handleTouchStart = (e) => {
        const touchX = e.touches[0].clientX;
        const width = window.innerWidth;
        if (touchX < width / 2) gameState.current.keys.ArrowLeft = true;
        else gameState.current.keys.ArrowRight = true;
        gameState.current.keys.Space = true; // Auto shoot on touch
    };
    
    const handleTouchEnd = () => {
        gameState.current.keys.ArrowLeft = false;
        gameState.current.keys.ArrowRight = false;
        gameState.current.keys.Space = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvasRef.current.addEventListener('touchstart', handleTouchStart);
    canvasRef.current.addEventListener('touchend', handleTouchEnd);
    
    animationFrameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (canvasRef.current) {
          canvasRef.current.removeEventListener('touchstart', handleTouchStart);
          canvasRef.current.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [gameOver, victory]);

  const resetGame = () => {
    setScore(0);
    setGameOver(false);
    setVictory(false);
    
    // Re-init aliens
    const rows = 4;
    const cols = 8;
    const aliens = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        aliens.push({
          x: 50 + c * (ALIEN_WIDTH + 15),
          y: 30 + r * (ALIEN_HEIGHT + 15),
          alive: true
        });
      }
    }

    gameState.current = {
        playerX: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
        bullets: [],
        aliens: aliens,
        alienDirection: 1,
        lastShotTime: 0,
        keys: { ArrowLeft: false, ArrowRight: false, Space: false }
    };
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 font-mono text-green-400 text-xl">
        SCORE: {score}
      </div>
      
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="border border-green-500 bg-black max-w-full"
      />
      
      <div className="mt-2 text-green-600 text-sm">
          ARROWS to Move • SPACE to Shoot (Touch sides to move/shoot)
      </div>

      {(gameOver || victory) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <h2 className={`text-3xl font-bold mb-4 ${victory ? 'text-green-400' : 'text-red-500'}`}>
              {victory ? 'VICTORY!' : 'GAME OVER'}
            </h2>
            <p className="text-green-400 mb-4">Final Score: {score}</p>
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-green-600 text-black font-bold rounded hover:bg-green-500"
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}
      
      {/* Mobile Controls */}
      <div className="flex justify-between w-full max-w-[600px] mt-4 px-4">
          <div className="flex gap-4">
              <button 
                className="w-16 h-16 bg-green-900/50 border border-green-500 rounded flex items-center justify-center text-green-400 active:bg-green-700 text-2xl select-none"
                onPointerDown={(e) => { e.preventDefault(); gameState.current.keys.ArrowLeft = true; }}
                onPointerUp={(e) => { e.preventDefault(); gameState.current.keys.ArrowLeft = false; }}
                onPointerLeave={(e) => { e.preventDefault(); gameState.current.keys.ArrowLeft = false; }}
              >◀</button>
              <button 
                className="w-16 h-16 bg-green-900/50 border border-green-500 rounded flex items-center justify-center text-green-400 active:bg-green-700 text-2xl select-none"
                onPointerDown={(e) => { e.preventDefault(); gameState.current.keys.ArrowRight = true; }}
                onPointerUp={(e) => { e.preventDefault(); gameState.current.keys.ArrowRight = false; }}
                onPointerLeave={(e) => { e.preventDefault(); gameState.current.keys.ArrowRight = false; }}
              >▶</button>
          </div>
          <button 
            className="w-20 h-20 bg-red-900/50 border border-red-500 rounded-full flex items-center justify-center text-red-400 active:bg-red-700 font-bold select-none"
            onPointerDown={(e) => { e.preventDefault(); gameState.current.keys.Space = true; }}
            onPointerUp={(e) => { e.preventDefault(); gameState.current.keys.Space = false; }}
            onPointerLeave={(e) => { e.preventDefault(); gameState.current.keys.Space = false; }}
          >
            FIRE
          </button>
      </div>
    </div>
  );
};

export default SpaceInvaders;
