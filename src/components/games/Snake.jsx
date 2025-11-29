'use client';

import React, { useRef, useEffect, useState } from 'react';

const Snake = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Game constants
  const GRID_SIZE = 20;
  const TILE_COUNT = 20; // 400x400 canvas
  const GAME_SPEED = 100;

  // Game state refs
  const gameState = useRef({
    snake: [{ x: 10, y: 10 }],
    velocity: { x: 0, y: 0 },
    food: { x: 15, y: 15 },
    nextVelocity: { x: 0, y: 0 }, // Buffer for next move to prevent self-collision on quick turns
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let gameInterval;

    // Initial random food
    gameState.current.food = {
        x: Math.floor(Math.random() * TILE_COUNT),
        y: Math.floor(Math.random() * TILE_COUNT)
    };

    const update = () => {
      if (gameOver) return;

      const state = gameState.current;
      
      // Update velocity from buffer
      state.velocity = state.nextVelocity;

      // Move Snake
      const head = { 
          x: state.snake[0].x + state.velocity.x, 
          y: state.snake[0].y + state.velocity.y 
      };

      // Wall Collision (Wrap around or Die? Let's die for retro feel)
      if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        setGameOver(true);
        return;
      }

      // Self Collision
      for (let i = 0; i < state.snake.length; i++) {
        if (head.x === state.snake[i].x && head.y === state.snake[i].y) {
            // Only die if we are actually moving
            if (state.velocity.x !== 0 || state.velocity.y !== 0) {
                setGameOver(true);
                return;
            }
        }
      }

      state.snake.unshift(head);

      // Eat Food
      if (head.x === state.food.x && head.y === state.food.y) {
        setScore(prev => prev + 1);
        // New Food
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * TILE_COUNT),
                y: Math.floor(Math.random() * TILE_COUNT)
            };
        } while (state.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        state.food = newFood;
      } else {
        // Remove tail if not eating
        // Only remove if we are moving, otherwise snake grows indefinitely at start
        if (state.velocity.x !== 0 || state.velocity.y !== 0) {
             state.snake.pop();
        } else {
            // If not moving, we just added a head at same spot, so remove duplicate
             state.snake.shift();
        }
      }

      draw(ctx, state);
    };

    const draw = (ctx, state) => {
      // Clear
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Snake
      ctx.fillStyle = '#38ef7d';
      state.snake.forEach((segment, index) => {
          // Head is slightly different color
          if (index === 0) ctx.fillStyle = '#2ecc71';
          else ctx.fillStyle = '#38ef7d';
          
          ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
      });

      // Draw Food
      ctx.fillStyle = '#ff4757';
      ctx.fillRect(state.food.x * GRID_SIZE, state.food.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
    };

    const handleKeyDown = (e) => {
        const state = gameState.current;
        switch (e.key) {
            case 'ArrowUp':
                if (state.velocity.y !== 1) state.nextVelocity = { x: 0, y: -1 };
                break;
            case 'ArrowDown':
                if (state.velocity.y !== -1) state.nextVelocity = { x: 0, y: 1 };
                break;
            case 'ArrowLeft':
                if (state.velocity.x !== 1) state.nextVelocity = { x: -1, y: 0 };
                break;
            case 'ArrowRight':
                if (state.velocity.x !== -1) state.nextVelocity = { x: 1, y: 0 };
                break;
        }
    };
    
    // Touch controls for mobile
    let touchStartX = 0;
    let touchStartY = 0;
    
    const handleTouchStart = (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    };
    
    const handleTouchEnd = (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        
        const state = gameState.current;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal
            if (dx > 0 && state.velocity.x !== -1) state.nextVelocity = { x: 1, y: 0 };
            else if (dx < 0 && state.velocity.x !== 1) state.nextVelocity = { x: -1, y: 0 };
        } else {
            // Vertical
            if (dy > 0 && state.velocity.y !== -1) state.nextVelocity = { x: 0, y: 1 };
            else if (dy < 0 && state.velocity.y !== 1) state.nextVelocity = { x: 0, y: -1 };
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    gameInterval = setInterval(update, GAME_SPEED);

    return () => {
      clearInterval(gameInterval);
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gameOver]);

  const resetGame = () => {
    setScore(0);
    setGameOver(false);
    gameState.current = {
        snake: [{ x: 10, y: 10 }],
        velocity: { x: 0, y: 0 },
        food: { x: 15, y: 15 },
        nextVelocity: { x: 0, y: 0 },
    };
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 font-mono text-green-400 text-xl">
        SCORE: {score}
      </div>
      
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="border border-green-500 bg-black max-w-full"
      />
      
      {!gameState.current?.velocity?.x && !gameState.current?.velocity?.y && !gameOver && (
          <div className="mt-2 text-green-600 text-sm">Press Arrow Keys or Swipe to Start</div>
      )}

      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <h2 className="text-3xl text-red-500 font-bold mb-4">GAME OVER</h2>
            <p className="text-green-400 mb-4">Final Score: {score}</p>
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-green-600 text-black font-bold rounded hover:bg-green-500"
            >
              TRY AGAIN
            </button>
          </div>
        </div>
      )}
      
      {/* Mobile Controls */}
      <div className="grid grid-cols-3 gap-2 mt-4">
          <div />
          <button 
            className="w-12 h-12 bg-green-900/50 border border-green-500 rounded flex items-center justify-center text-green-400 active:bg-green-700 select-none"
            onPointerDown={(e) => { e.preventDefault(); if (gameState.current.velocity.y === 0) gameState.current.nextVelocity = { x: 0, y: -1 }; }}
          >▲</button>
          <div />
          <button 
            className="w-12 h-12 bg-green-900/50 border border-green-500 rounded flex items-center justify-center text-green-400 active:bg-green-700 select-none"
            onPointerDown={(e) => { e.preventDefault(); if (gameState.current.velocity.x === 0) gameState.current.nextVelocity = { x: -1, y: 0 }; }}
          >◀</button>
          <button 
            className="w-12 h-12 bg-green-900/50 border border-green-500 rounded flex items-center justify-center text-green-400 active:bg-green-700 select-none"
            onPointerDown={(e) => { e.preventDefault(); if (gameState.current.velocity.y === 0) gameState.current.nextVelocity = { x: 0, y: 1 }; }}
          >▼</button>
          <button 
            className="w-12 h-12 bg-green-900/50 border border-green-500 rounded flex items-center justify-center text-green-400 active:bg-green-700 select-none"
            onPointerDown={(e) => { e.preventDefault(); if (gameState.current.velocity.x === 0) gameState.current.nextVelocity = { x: 1, y: 0 }; }}
          >▶</button>
      </div>
    </div>
  );
};

export default Snake;
