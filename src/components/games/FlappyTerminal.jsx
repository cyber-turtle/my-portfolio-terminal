'use client';

import React, { useRef, useEffect, useState } from 'react';

const FlappyTerminal = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Game Constants
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 600;
  const GRAVITY = 0.25;
  const JUMP_FORCE = -5.5;
  const PIPE_SPEED = 2.5;
  const PIPE_SPAWN_RATE = 100; // Frames
  const PIPE_GAP = 160;
  const BIRD_SIZE = 20;

  const gameState = useRef({
    bird: { x: 50, y: 300, vy: 0 },
    pipes: [], // { x, topHeight, passed }
    frame: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const update = () => {
      if (gameOver) return;
      if (!gameStarted) {
          draw(ctx, gameState.current);
          animationFrameId = requestAnimationFrame(update);
          return;
      }

      const state = gameState.current;
      state.frame++;

      // Bird Physics
      state.bird.vy += GRAVITY;
      state.bird.y += state.bird.vy;

      // Pipe Spawning
      if (state.frame % PIPE_SPAWN_RATE === 0) {
        const minHeight = 50;
        const maxHeight = CANVAS_HEIGHT - PIPE_GAP - 50;
        const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
        
        state.pipes.push({
          x: CANVAS_WIDTH,
          topHeight: topHeight,
          passed: false
        });
      }

      // Pipe Movement & Collision
      state.pipes.forEach((pipe, index) => {
        pipe.x -= PIPE_SPEED;

        // Collision
        if (
          state.bird.x < pipe.x + 50 &&
          state.bird.x + BIRD_SIZE > pipe.x &&
          (state.bird.y < pipe.topHeight || state.bird.y + BIRD_SIZE > pipe.topHeight + PIPE_GAP)
        ) {
          setGameOver(true);
        }

        // Score
        if (pipe.x + 50 < state.bird.x && !pipe.passed) {
          pipe.passed = true;
          setScore(prev => prev + 1);
        }

        // Remove off-screen pipes
        if (pipe.x < -50) {
            state.pipes.splice(index, 1);
        }
      });

      // Ground/Ceiling Collision
      if (state.bird.y + BIRD_SIZE >= CANVAS_HEIGHT || state.bird.y <= 0) {
        setGameOver(true);
      }

      draw(ctx, state);
      animationFrameId = requestAnimationFrame(update);
    };

    const draw = (ctx, state) => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Pipes
      ctx.fillStyle = '#38ef7d';
      state.pipes.forEach(pipe => {
        // Top Pipe
        ctx.fillRect(pipe.x, 0, 50, pipe.topHeight);
        // Bottom Pipe
        ctx.fillRect(pipe.x, pipe.topHeight + PIPE_GAP, 50, CANVAS_HEIGHT - (pipe.topHeight + PIPE_GAP));
        
        // Pipe Caps
        ctx.fillStyle = '#1a5e35';
        ctx.fillRect(pipe.x - 2, pipe.topHeight - 20, 54, 20);
        ctx.fillRect(pipe.x - 2, pipe.topHeight + PIPE_GAP, 54, 20);
        ctx.fillStyle = '#38ef7d';
      });

      // Bird
      ctx.fillStyle = '#FFE138'; // Yellow
      ctx.fillRect(state.bird.x, state.bird.y, BIRD_SIZE, BIRD_SIZE);
      // Eye
      ctx.fillStyle = '#000';
      ctx.fillRect(state.bird.x + 12, state.bird.y + 4, 4, 4);
      
      // Ground Line
      ctx.fillStyle = '#38ef7d';
      ctx.fillRect(0, CANVAS_HEIGHT - 10, CANVAS_WIDTH, 10);
    };

    const jump = () => {
        if (!gameStarted) {
            setGameStarted(true);
        }
        if (!gameOver) {
            gameState.current.bird.vy = JUMP_FORCE;
        }
    };

    const handleKeyDown = (e) => {
      if (e.code === 'Space') jump();
    };
    
    const handleTouch = (e) => {
        e.preventDefault();
        jump();
    };
    
    const handleMouseDown = (e) => {
        e.preventDefault();
        jump();
    };

    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('touchstart', handleTouch, { passive: false });
    canvas.addEventListener('mousedown', handleMouseDown);
    
    animationFrameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('touchstart', handleTouch);
      canvas.removeEventListener('mousedown', handleMouseDown);
    };
  }, [gameOver, gameStarted]);
  
  const resetGame = () => {
      if (score > highScore) setHighScore(score);
      setScore(0);
      setGameOver(false);
      setGameStarted(false);
      gameState.current = {
        bird: { x: 50, y: 300, vy: 0 },
        pipes: [],
        frame: 0,
      };
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full max-w-[400px] mb-4 font-mono text-green-400 text-xl">
        <span>SCORE: {score}</span>
        <span>BEST: {highScore}</span>
      </div>

      <canvas
        ref={canvasRef}
        width={400}
        height={600}
        className="border border-green-500 bg-black cursor-pointer max-w-full"
      />
      
      <div className="mt-2 text-green-600 text-sm">
          TAP / CLICK / SPACE to Jump
      </div>

      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <h2 className="text-3xl text-red-500 font-bold mb-4">CRASHED!</h2>
            <p className="text-green-400 mb-4">Score: {score}</p>
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-green-600 text-black font-bold rounded hover:bg-green-500"
            >
              TRY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlappyTerminal;
