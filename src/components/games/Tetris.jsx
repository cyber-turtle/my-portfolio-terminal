'use client';

import React, { useRef, useEffect, useState } from 'react';

const Tetris = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);

  // Game Constants
  const COLS = 10;
  const ROWS = 20;
  const BLOCK_SIZE = 20;
  const COLORS = [
    null,
    '#FF0D72', // T
    '#0DC2FF', // O
    '#0DFF72', // S
    '#F538FF', // Z
    '#FF8E0D', // J
    '#FFE138', // L
    '#3877FF', // I
  ];

  const SHAPES = [
    [],
    [[0, 0, 0], [1, 1, 1], [0, 1, 0]], // T
    [[2, 2], [2, 2]], // O
    [[0, 3, 3], [3, 3, 0], [0, 0, 0]], // S
    [[4, 4, 0], [0, 4, 4], [0, 0, 0]], // Z
    [[5, 0, 0], [5, 5, 5], [0, 0, 0]], // J
    [[0, 0, 6], [6, 6, 6], [0, 0, 0]], // L
    [[0, 7, 0, 0], [0, 7, 0, 0], [0, 7, 0, 0], [0, 7, 0, 0]], // I
  ];

  const gameState = useRef({
    grid: Array.from({ length: ROWS }, () => Array(COLS).fill(0)),
    player: {
      pos: { x: 0, y: 0 },
      matrix: null,
      score: 0,
    },
    dropCounter: 0,
    dropInterval: 1000,
    lastTime: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.scale(1, 1); // Reset scale just in case

    const resetGame = () => {
      gameState.current.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
      gameState.current.player.score = 0;
      gameState.current.dropInterval = 1000;
      setScore(0);
      setLevel(1);
      setGameOver(false);
      playerReset();
    };

    const playerReset = () => {
      const pieces = 'ILJOTSZ';
      const typeId = Math.floor(Math.random() * (SHAPES.length - 1)) + 1;
      gameState.current.player.matrix = SHAPES[typeId];
      gameState.current.player.pos.y = 0;
      gameState.current.player.pos.x =
        Math.floor(COLS / 2) - Math.floor(gameState.current.player.matrix[0].length / 2);

      if (collide(gameState.current.grid, gameState.current.player)) {
        setGameOver(true);
      }
    };

    const collide = (grid, player) => {
      const m = player.matrix;
      const o = player.pos;
      for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
          if (m[y][x] !== 0 && (grid[y + o.y] && grid[y + o.y][x + o.x]) !== 0) {
            return true;
          }
        }
      }
      return false;
    };

    const drawMatrix = (matrix, offset) => {
      matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            ctx.fillStyle = COLORS[value];
            ctx.fillRect((x + offset.x) * BLOCK_SIZE, (y + offset.y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.strokeRect((x + offset.x) * BLOCK_SIZE, (y + offset.y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
          }
        });
      });
    };

    const draw = () => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawMatrix(gameState.current.grid, { x: 0, y: 0 });
      drawMatrix(gameState.current.player.matrix, gameState.current.player.pos);
    };

    const merge = (grid, player) => {
      player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            grid[y + player.pos.y][x + player.pos.x] = value;
          }
        });
      });
    };

    const rotate = (matrix, dir) => {
      for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
          [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
      }
      if (dir > 0) {
        matrix.forEach((row) => row.reverse());
      } else {
        matrix.reverse();
      }
    };

    const playerDrop = () => {
      gameState.current.player.pos.y++;
      if (collide(gameState.current.grid, gameState.current.player)) {
        gameState.current.player.pos.y--;
        merge(gameState.current.grid, gameState.current.player);
        playerReset();
        arenaSweep();
      }
      gameState.current.dropCounter = 0;
    };

    const playerMove = (offset) => {
      gameState.current.player.pos.x += offset;
      if (collide(gameState.current.grid, gameState.current.player)) {
        gameState.current.player.pos.x -= offset;
      }
    };

    const playerRotate = (dir) => {
      const pos = gameState.current.player.pos.x;
      let offset = 1;
      rotate(gameState.current.player.matrix, dir);
      while (collide(gameState.current.grid, gameState.current.player)) {
        gameState.current.player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > gameState.current.player.matrix[0].length) {
          rotate(gameState.current.player.matrix, -dir);
          gameState.current.player.pos.x = pos;
          return;
        }
      }
    };

    const arenaSweep = () => {
      let rowCount = 1;
      outer: for (let y = ROWS - 1; y > 0; --y) {
        for (let x = 0; x < COLS; ++x) {
          if (gameState.current.grid[y][x] === 0) {
            continue outer;
          }
        }
        const row = gameState.current.grid.splice(y, 1)[0].fill(0);
        gameState.current.grid.unshift(row);
        ++y;

        gameState.current.player.score += rowCount * 10;
        rowCount *= 2;
      }
      setScore(gameState.current.player.score);
      
      // Level up every 100 points
      const newLevel = Math.floor(gameState.current.player.score / 100) + 1;
      if (newLevel > level) {
          setLevel(newLevel);
          gameState.current.dropInterval = Math.max(100, 1000 - (newLevel - 1) * 100);
      }
    };

    const update = (time = 0) => {
      if (gameOver) return;

      const deltaTime = time - gameState.current.lastTime;
      gameState.current.lastTime = time;

      gameState.current.dropCounter += deltaTime;
      if (gameState.current.dropCounter > gameState.current.dropInterval) {
        playerDrop();
      }

      draw();
      requestAnimationFrame(update);
    };

    const handleKeyDown = (event) => {
      if (gameOver) return;
      
      if (event.keyCode === 37) { // Left
        playerMove(-1);
      } else if (event.keyCode === 39) { // Right
        playerMove(1);
      } else if (event.keyCode === 40) { // Down
        playerDrop();
      } else if (event.keyCode === 81) { // Q
        playerRotate(-1);
      } else if (event.keyCode === 87 || event.keyCode === 38) { // W or Up
        playerRotate(1);
      }
    };
    
    // Touch Controls
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
        
        if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal Swipe
            if (dx > 30) playerMove(1);
            else if (dx < -30) playerMove(-1);
        } else {
            // Vertical Swipe
            if (dy > 30) playerDrop();
            else if (dy < -30) playerRotate(1); // Swipe up to rotate
        }
    };

    // Expose controls to window for button clicks
    window.tetrisControls = {
        moveLeft: () => playerMove(-1),
        moveRight: () => playerMove(1),
        rotate: () => playerRotate(1),
        drop: () => playerDrop()
    };

    document.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    resetGame();
    update();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handleTouchEnd);
      delete window.tetrisControls;
    };
  }, [gameOver]); // Re-run effect when gameOver changes to stop loop

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full max-w-[240px] mb-4 font-mono text-green-400 text-sm">
        <span>SCORE: {score}</span>
        <span>LEVEL: {level}</span>
      </div>

      <canvas
        ref={canvasRef}
        width={200}
        height={400}
        className="border border-green-500 bg-black"
      />
      
      <div className="mt-2 text-green-600 text-xs text-center">
          ARROWS to Move/Rotate • Q/W to Rotate
      </div>

      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <h2 className="text-3xl text-red-500 font-bold mb-4">GAME OVER</h2>
            <p className="text-green-400 mb-4">Final Score: {score}</p>
            <button
              onClick={() => setGameOver(false)} // This triggers re-run of useEffect which calls resetGame
              className="px-4 py-2 bg-green-600 text-black font-bold rounded hover:bg-green-500"
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}
      
      {/* Mobile Controls */}
      <div className="grid grid-cols-3 gap-2 mt-4 w-full max-w-[240px]">
          <div />
          <button 
            className="w-12 h-12 bg-green-900/50 border border-green-500 rounded flex items-center justify-center text-green-400 active:bg-green-700 text-xl select-none"
            onPointerDown={(e) => { e.preventDefault(); if(window.tetrisControls) window.tetrisControls.rotate(); }}
          >↻</button>
          <div />
          <button 
            className="w-12 h-12 bg-green-900/50 border border-green-500 rounded flex items-center justify-center text-green-400 active:bg-green-700 text-xl select-none"
            onPointerDown={(e) => { e.preventDefault(); if(window.tetrisControls) window.tetrisControls.moveLeft(); }}
          >◀</button>
          <button 
            className="w-12 h-12 bg-green-900/50 border border-green-500 rounded flex items-center justify-center text-green-400 active:bg-green-700 text-xl select-none"
            onPointerDown={(e) => { e.preventDefault(); if(window.tetrisControls) window.tetrisControls.drop(); }}
          >▼</button>
          <button 
            className="w-12 h-12 bg-green-900/50 border border-green-500 rounded flex items-center justify-center text-green-400 active:bg-green-700 text-xl select-none"
            onPointerDown={(e) => { e.preventDefault(); if(window.tetrisControls) window.tetrisControls.moveRight(); }}
          >▶</button>
      </div>
    </div>
  );
};

export default Tetris;
