'use client';

import React, { useRef, useEffect, useState } from 'react';

const Pong = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState({ player: 0, computer: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [difficulty, setDifficulty] = useState('medium');
  const [gameStarted, setGameStarted] = useState(false);

  // Game constants
  const PADDLE_HEIGHT = 60;
  const PADDLE_WIDTH = 10;
  const BALL_SIZE = 8;
  const WIN_SCORE = 5;
  
  // Difficulty settings
  const DIFFICULTY_SETTINGS = {
    easy: { ballSpeed: 2, computerSpeed: 1.5, computerAccuracy: 40 },
    medium: { ballSpeed: 3, computerSpeed: 2.5, computerAccuracy: 25 },
    hard: { ballSpeed: 4.5, computerSpeed: 4, computerAccuracy: 10 }
  };

  // Game state refs (mutable for loop)
  const gameState = useRef({
    playerY: 150,
    computerY: 150,
    ballX: 300,
    ballY: 200,
    ballSpeedX: DIFFICULTY_SETTINGS.medium.ballSpeed,
    ballSpeedY: DIFFICULTY_SETTINGS.medium.ballSpeed,
    computerSpeed: DIFFICULTY_SETTINGS.medium.computerSpeed,
    keys: { ArrowUp: false, ArrowDown: false }
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameStarted) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const update = () => {
      if (gameOver) return;

      const state = gameState.current;
      const width = canvas.width;
      const height = canvas.height;

      // Player Movement (Keyboard)
      if (state.keys.ArrowUp) {
          state.playerY -= 6;
      }
      if (state.keys.ArrowDown) {
          state.playerY += 6;
      }
      // Clamp Player
      state.playerY = Math.max(0, Math.min(height - PADDLE_HEIGHT, state.playerY));

      // Move Ball
      state.ballX += state.ballSpeedX;
      state.ballY += state.ballSpeedY;

      // Wall Collision (Top/Bottom)
      if (state.ballY <= 0 || state.ballY >= height) {
        state.ballSpeedY = -state.ballSpeedY;
      }

      // Paddle Collision (Player)
      if (
        state.ballX <= PADDLE_WIDTH + 10 &&
        state.ballY >= state.playerY &&
        state.ballY <= state.playerY + PADDLE_HEIGHT
      ) {
        state.ballSpeedX = -state.ballSpeedX;
        // Add some spin/variation
        const deltaY = state.ballY - (state.playerY + PADDLE_HEIGHT / 2);
        state.ballSpeedY = deltaY * 0.3;
        // Increase speed slightly
        state.ballSpeedX *= 1.05;
      }

      // Paddle Collision (Computer)
      if (
        state.ballX >= width - PADDLE_WIDTH - 10 &&
        state.ballY >= state.computerY &&
        state.ballY <= state.computerY + PADDLE_HEIGHT
      ) {
        state.ballSpeedX = -state.ballSpeedX;
        const deltaY = state.ballY - (state.computerY + PADDLE_HEIGHT / 2);
        state.ballSpeedY = deltaY * 0.3;
      }

      // AI Movement (Simple tracking with speed limit and accuracy)
      const computerCenter = state.computerY + PADDLE_HEIGHT / 2;
      const accuracy = DIFFICULTY_SETTINGS[difficulty].computerAccuracy;
      const targetY = state.ballY + (Math.random() - 0.5) * accuracy;
      
      if (computerCenter < targetY - 35) {
        state.computerY += state.computerSpeed;
      } else if (computerCenter > targetY + 35) {
        state.computerY -= state.computerSpeed;
      }
      // Clamp computer paddle
      state.computerY = Math.max(0, Math.min(height - PADDLE_HEIGHT, state.computerY));


      // Scoring
      if (state.ballX < 0) {
        // Computer scores
        setScore(prev => {
          const newScore = { ...prev, computer: prev.computer + 1 };
          if (newScore.computer >= WIN_SCORE) {
            setGameOver(true);
            setWinner('COMPUTER');
          }
          return newScore;
        });
        resetBall(state, width, height);
      } else if (state.ballX > width) {
        // Player scores
        setScore(prev => {
          const newScore = { ...prev, player: prev.player + 1 };
          if (newScore.player >= WIN_SCORE) {
            setGameOver(true);
            setWinner('PLAYER');
          }
          return newScore;
        });
        resetBall(state, width, height);
      }

      draw(ctx, width, height, state);
      animationFrameId = requestAnimationFrame(update);
    };

    const draw = (ctx, width, height, state) => {
      // Clear background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // Draw Net
      ctx.strokeStyle = '#38ef7d';
      ctx.setLineDash([5, 15]);
      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Paddles
      ctx.fillStyle = '#38ef7d';
      ctx.fillRect(10, state.playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
      ctx.fillRect(width - PADDLE_WIDTH - 10, state.computerY, PADDLE_WIDTH, PADDLE_HEIGHT);

      // Draw Ball
      ctx.beginPath();
      ctx.arc(state.ballX, state.ballY, BALL_SIZE, 0, Math.PI * 2);
      ctx.fill();
    };

    const resetBall = (state, width, height) => {
      state.ballX = width / 2;
      state.ballY = height / 2;
      state.ballSpeedX = -state.ballSpeedX; // Serve to winner/loser
      state.ballSpeedY = 4 * (Math.random() > 0.5 ? 1 : -1);
      // Reset speed magnitude based on difficulty
      const settings = DIFFICULTY_SETTINGS[difficulty];
      state.ballSpeedX = Math.sign(state.ballSpeedX) * settings.ballSpeed;
    };

    // Input Handling
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseY = e.clientY - rect.top;
      gameState.current.playerY = mouseY - PADDLE_HEIGHT / 2;
      // Clamp
      gameState.current.playerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, gameState.current.playerY));
    };
    
    const handleTouchMove = (e) => {
        e.preventDefault(); // Prevent scrolling
        const rect = canvas.getBoundingClientRect();
        const touchY = e.touches[0].clientY - rect.top;
        gameState.current.playerY = touchY - PADDLE_HEIGHT / 2;
        gameState.current.playerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, gameState.current.playerY));
    };

    const handleKeyDown = (e) => {
        if (e.code === 'ArrowUp') gameState.current.keys.ArrowUp = true;
        if (e.code === 'ArrowDown') gameState.current.keys.ArrowDown = true;
    };

    const handleKeyUp = (e) => {
        if (e.code === 'ArrowUp') gameState.current.keys.ArrowUp = false;
        if (e.code === 'ArrowDown') gameState.current.keys.ArrowDown = false;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    animationFrameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameOver, difficulty, gameStarted]);

  const resetGame = () => {
    setScore({ player: 0, computer: 0 });
    setGameOver(false);
    setWinner(null);
    const settings = DIFFICULTY_SETTINGS[difficulty];
    gameState.current = {
      playerY: 150,
      computerY: 150,
      ballX: 300,
      ballY: 200,
      ballSpeedX: settings.ballSpeed,
      ballSpeedY: settings.ballSpeed,
      computerSpeed: settings.computerSpeed,
      keys: { ArrowUp: false, ArrowDown: false }
    };
  };
  
  const startGame = () => {
    setGameStarted(true);
    resetGame();
  };

  return (
    <div className="flex flex-col items-center">
      {!gameStarted ? (
        <div className="text-center">
          <h2 className="text-2xl text-green-400 font-bold mb-6">SELECT DIFFICULTY</h2>
          <div className="space-y-4 mb-6">
            {Object.entries(DIFFICULTY_SETTINGS).map(([level, settings]) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`block w-full px-6 py-3 font-mono text-lg border-2 transition-colors ${
                  difficulty === level 
                    ? 'bg-green-600 text-black border-green-400' 
                    : 'bg-black text-green-400 border-green-600 hover:bg-green-900'
                }`}
              >
                {level.toUpperCase()} - Speed: {settings.ballSpeed} | AI: {settings.computerSpeed}
              </button>
            ))}
          </div>
          <button
            onClick={startGame}
            className="px-8 py-3 bg-green-600 text-black font-bold text-xl rounded hover:bg-green-500"
          >
            START GAME
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-between w-full max-w-[600px] mb-4 font-mono text-green-400 text-xl">
            <span>PLAYER: {score.player}</span>
            <span>DIFFICULTY: {difficulty.toUpperCase()}</span>
            <span>COMPUTER: {score.computer}</span>
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
        </>
      )}

      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <h2 className="text-3xl text-green-400 font-bold mb-4">
              {winner} WINS!
            </h2>
            <div className="flex flex-col items-center space-y-2">
              <button
                onClick={resetGame}
                className="px-6 py-2 bg-green-600 text-black font-bold rounded hover:bg-green-500"
              >
                PLAY AGAIN
              </button>
              <button
                onClick={() => { setGameStarted(false); setGameOver(false); }}
                className="px-6 py-2 bg-green-600 text-black font-bold rounded hover:bg-green-500"
              >
                CHANGE DIFFICULTY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pong;
