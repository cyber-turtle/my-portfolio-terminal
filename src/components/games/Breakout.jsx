'use client';

import React, { useRef, useEffect, useState } from 'react';

const Breakout = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);

  // Game Constants
  const CANVAS_WIDTH = 600;
  const CANVAS_HEIGHT = 400;
  const PADDLE_HEIGHT = 10;
  const PADDLE_WIDTH = 75;
  const BALL_RADIUS = 6;
  const BRICK_ROW_COUNT = 5;
  const BRICK_COLUMN_COUNT = 9;
  const BRICK_WIDTH = 55; // (600 - (10*8)) / 9 approx
  const BRICK_HEIGHT = 20;
  const BRICK_PADDING = 10;
  const BRICK_OFFSET_TOP = 30;
  const BRICK_OFFSET_LEFT = 30;

  const gameState = useRef({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 30,
    dx: 1.5,
    dy: -1.5,
    paddleX: (CANVAS_WIDTH - PADDLE_WIDTH) / 2,
    rightPressed: false,
    leftPressed: false,
    bricks: [],
  });

  useEffect(() => {
    // Initialize Bricks
    const bricks = [];
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
      bricks[c] = [];
      for (let r = 0; r < BRICK_ROW_COUNT; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
      }
    }
    gameState.current.bricks = bricks;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const keyDownHandler = (e) => {
      if (e.key === 'Right' || e.key === 'ArrowRight') {
        gameState.current.rightPressed = true;
      } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        gameState.current.leftPressed = true;
      }
    };

    const keyUpHandler = (e) => {
      if (e.key === 'Right' || e.key === 'ArrowRight') {
        gameState.current.rightPressed = false;
      } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        gameState.current.leftPressed = false;
      }
    };

    const mouseMoveHandler = (e) => {
      const relativeX = e.clientX - canvas.offsetLeft;
      if (relativeX > 0 && relativeX < canvas.width) {
        gameState.current.paddleX = relativeX - PADDLE_WIDTH / 2;
      }
    };
    
    const touchMoveHandler = (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const relativeX = e.touches[0].clientX - rect.left;
        if (relativeX > 0 && relativeX < canvas.width) {
            gameState.current.paddleX = relativeX - PADDLE_WIDTH / 2;
        }
    };

    const collisionDetection = () => {
      for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
          const b = gameState.current.bricks[c][r];
          if (b.status === 1) {
            if (
              gameState.current.x > b.x &&
              gameState.current.x < b.x + BRICK_WIDTH &&
              gameState.current.y > b.y &&
              gameState.current.y < b.y + BRICK_HEIGHT
            ) {
              gameState.current.dy = -gameState.current.dy;
              b.status = 0;
              setScore((prev) => prev + 10);
              
              // Check Win
              let activeBricks = 0;
              gameState.current.bricks.flat().forEach(brick => activeBricks += brick.status);
              if (activeBricks === 0) {
                  setVictory(true);
              }
            }
          }
        }
      }
    };

    const drawBall = () => {
      ctx.beginPath();
      ctx.arc(gameState.current.x, gameState.current.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = '#38ef7d';
      ctx.fill();
      ctx.closePath();
    };

    const drawPaddle = () => {
      ctx.beginPath();
      ctx.rect(gameState.current.paddleX, CANVAS_HEIGHT - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT);
      ctx.fillStyle = '#38ef7d';
      ctx.fill();
      ctx.closePath();
    };

    const drawBricks = () => {
      for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
          if (gameState.current.bricks[c][r].status === 1) {
            const brickX = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT;
            const brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;
            gameState.current.bricks[c][r].x = brickX;
            gameState.current.bricks[c][r].y = brickY;
            ctx.beginPath();
            ctx.rect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT);
            // Gradient color based on row
            const colors = ['#FF0D72', '#0DC2FF', '#0DFF72', '#F538FF', '#FF8E0D'];
            ctx.fillStyle = colors[r % colors.length];
            ctx.fill();
            ctx.closePath();
          }
        }
      }
    };

    const draw = () => {
      if (gameOver || victory) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawBricks();
      drawBall();
      drawPaddle();
      collisionDetection();

      // Wall Collision
      if (gameState.current.x + gameState.current.dx > canvas.width - BALL_RADIUS || gameState.current.x + gameState.current.dx < BALL_RADIUS) {
        gameState.current.dx = -gameState.current.dx;
      }
      if (gameState.current.y + gameState.current.dy < BALL_RADIUS) {
        gameState.current.dy = -gameState.current.dy;
      } else if (gameState.current.y + gameState.current.dy > canvas.height - BALL_RADIUS) {
        if (gameState.current.x > gameState.current.paddleX && gameState.current.x < gameState.current.paddleX + PADDLE_WIDTH) {
          gameState.current.dy = -gameState.current.dy;
          // Add spin based on where it hit paddle
          const deltaX = gameState.current.x - (gameState.current.paddleX + PADDLE_WIDTH/2);
          gameState.current.dx = deltaX * 0.15;
        } else {
          // Life Lost
          setLives((prev) => {
              const newLives = prev - 1;
              if (newLives <= 0) {
                  setGameOver(true);
                  return 0;
              } else {
                  // Reset Ball
                  gameState.current.x = canvas.width / 2;
                  gameState.current.y = canvas.height - 30;
                  gameState.current.dx = 1.5;
                  gameState.current.dy = -1.5;
                  gameState.current.paddleX = (canvas.width - PADDLE_WIDTH) / 2;
                  return newLives;
              }
          });
        }
      }

      // Paddle Movement
      if (gameState.current.rightPressed && gameState.current.paddleX < canvas.width - PADDLE_WIDTH) {
        gameState.current.paddleX += 7;
      } else if (gameState.current.leftPressed && gameState.current.paddleX > 0) {
        gameState.current.paddleX -= 7;
      }

      gameState.current.x += gameState.current.dx;
      gameState.current.y += gameState.current.dy;

      animationFrameId = requestAnimationFrame(draw);
    };

    document.addEventListener('keydown', keyDownHandler, false);
    document.addEventListener('keyup', keyUpHandler, false);
    document.addEventListener('mousemove', mouseMoveHandler, false);
    canvas.addEventListener('touchmove', touchMoveHandler, { passive: false });

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener('keydown', keyDownHandler);
      document.removeEventListener('keyup', keyUpHandler);
      document.removeEventListener('mousemove', mouseMoveHandler);
      canvas.removeEventListener('touchmove', touchMoveHandler);
    };
  }, [gameOver, victory]);

  const resetGame = () => {
      setScore(0);
      setLives(3);
      setGameOver(false);
      setVictory(false);
      
      gameState.current.x = CANVAS_WIDTH / 2;
      gameState.current.y = CANVAS_HEIGHT - 30;
      gameState.current.dx = 1.5;
      gameState.current.dy = -1.5;
      gameState.current.paddleX = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
      
      // Reset Bricks
      for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
          gameState.current.bricks[c][r].status = 1;
        }
      }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full max-w-[600px] mb-4 font-mono text-green-400 text-xl">
        <span>SCORE: {score}</span>
        <span>LIVES: {lives}</span>
      </div>

      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="border border-green-500 bg-black cursor-none touch-none max-w-full"
      />
      
      <div className="mt-2 text-green-600 text-sm">
          ARROWS/MOUSE to Move
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
    </div>
  );
};

export default Breakout;
