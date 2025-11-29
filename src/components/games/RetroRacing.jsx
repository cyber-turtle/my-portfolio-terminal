'use client';

import React, { useRef, useEffect, useState } from 'react';

const RetroRacing = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('start'); // start, playing, gameover
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const gameRef = useRef({
    playerX: 0,
    playerSpeed: 5,
    obstacles: [],
    roadMarkers: [],
    speed: 5,
    score: 0,
    lastObstacleTime: 0,
    keys: { ArrowLeft: false, ArrowRight: false },
    width: 400,
    height: 600
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const g = gameRef.current;
    g.width = canvas.width;
    g.height = canvas.height;
    g.playerX = g.width / 2 - 20;

    const spawnObstacle = (timestamp) => {
      if (timestamp - g.lastObstacleTime > 15000 / g.speed) {
        const laneWidth = g.width / 3;
        const lane = Math.floor(Math.random() * 3);
        const x = lane * laneWidth + (laneWidth - 40) / 2;
        g.obstacles.push({ x, y: -60, width: 40, height: 60, type: Math.random() > 0.5 ? 'car' : 'rock' });
        g.lastObstacleTime = timestamp;
      }
    };

    const update = (timestamp) => {
      if (gameState !== 'playing') return;

      ctx.fillStyle = '#1a1a1a'; // Dark road
      ctx.fillRect(0, 0, g.width, g.height);

      // Road Markers
      ctx.fillStyle = '#ffffff';
      g.roadMarkers.forEach(m => {
        m.y += g.speed;
        ctx.fillRect(g.width / 3 - 2, m.y, 4, 40);
        ctx.fillRect(g.width * 2 / 3 - 2, m.y, 4, 40);
      });
      
      // Recycle markers
      if (g.roadMarkers.length === 0 || g.roadMarkers[g.roadMarkers.length - 1].y > 80) {
          g.roadMarkers.push({ y: -40 });
      }
      g.roadMarkers = g.roadMarkers.filter(m => m.y < g.height);

      // Player Movement
      if (g.keys.ArrowLeft && g.playerX > 0) g.playerX -= g.playerSpeed;
      if (g.keys.ArrowRight && g.playerX < g.width - 40) g.playerX += g.playerSpeed;

      // Draw Player
      ctx.fillStyle = '#00ff00'; // Retro Green Car
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00ff00';
      ctx.fillRect(g.playerX, g.height - 80, 40, 60);
      // Car details
      ctx.fillStyle = '#003300';
      ctx.fillRect(g.playerX + 5, g.height - 75, 30, 10); // Windshield
      ctx.shadowBlur = 0;

      // Obstacles
      spawnObstacle(timestamp);
      g.obstacles.forEach(o => {
        o.y += g.speed;
        if (o.type === 'car') {
            ctx.fillStyle = '#ff0000';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ff0000';
            ctx.fillRect(o.x, o.y, o.width, o.height);
            ctx.shadowBlur = 0;
        } else {
            ctx.fillStyle = '#888888';
            ctx.fillRect(o.x, o.y, o.width, o.width); // Rock is square
        }
      });
      g.obstacles = g.obstacles.filter(o => o.y < g.height);

      // Collision Detection
      const playerRect = { x: g.playerX, y: g.height - 80, width: 40, height: 60 };
      for (let o of g.obstacles) {
        if (
          playerRect.x < o.x + o.width &&
          playerRect.x + playerRect.width > o.x &&
          playerRect.y < o.y + o.height &&
          playerRect.y + playerRect.height > o.y
        ) {
          setGameState('gameover');
          setHighScore(prev => Math.max(prev, Math.floor(g.score)));
        }
      }

      // Score & Difficulty
      g.score += 0.1;
      g.speed += 0.001; // Accelerate slowly
      setScore(Math.floor(g.score));

      animationFrameId = requestAnimationFrame(update);
    };

    if (gameState === 'playing') {
      animationFrameId = requestAnimationFrame(update);
    } else {
        // Draw Start/Game Over Screen
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, g.width, g.height);
        ctx.fillStyle = '#00ff00';
        ctx.font = '20px monospace';
        ctx.textAlign = 'center';
        
        if (gameState === 'start') {
            ctx.fillText('RETRO RACER', g.width / 2, g.height / 2 - 40);
            ctx.fillText('PRESS SPACE TO START', g.width / 2, g.height / 2);
            ctx.font = '12px monospace';
            ctx.fillText('Use Arrow Keys to Steer', g.width / 2, g.height / 2 + 40);
        } else {
            ctx.fillStyle = '#ff0000';
            ctx.fillText('GAME OVER', g.width / 2, g.height / 2 - 40);
            ctx.fillStyle = '#ffffff';
            ctx.fillText(`SCORE: ${Math.floor(g.score)}`, g.width / 2, g.height / 2);
            ctx.fillText('PRESS SPACE TO RESTART', g.width / 2, g.height / 2 + 40);
        }
    }

    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        if (gameState !== 'playing') {
          g.obstacles = [];
          g.score = 0;
          g.speed = 5;
          g.playerX = g.width / 2 - 20;
          setGameState('playing');
        }
      }
      if (e.key === 'ArrowLeft') g.keys.ArrowLeft = true;
      if (e.key === 'ArrowRight') g.keys.ArrowRight = true;
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft') g.keys.ArrowLeft = false;
      if (e.key === 'ArrowRight') g.keys.ArrowRight = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Mobile Controls
  const handleTouch = (key, pressed) => (e) => {
      e.preventDefault();
      if (key === 'left') gameRef.current.keys.ArrowLeft = pressed;
      if (key === 'right') gameRef.current.keys.ArrowRight = pressed;
      if (key === 'start' && pressed && gameState !== 'playing') {
          gameRef.current.obstacles = [];
          gameRef.current.score = 0;
          gameRef.current.speed = 5;
          gameRef.current.playerX = gameRef.current.width / 2 - 20;
          setGameState('playing');
      }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-black p-4">
      <div className="relative border-4 border-green-800 rounded-lg overflow-hidden shadow-[0_0_20px_rgba(0,255,0,0.3)]">
        <canvas
            ref={canvasRef}
            width={400}
            height={600}
            className="bg-black block"
        />
        <div className="absolute top-4 left-4 text-white font-mono font-bold text-xl drop-shadow-md">
            SCORE: {score}
        </div>
        {highScore > 0 && (
            <div className="absolute top-4 right-4 text-yellow-400 font-mono font-bold text-sm drop-shadow-md">
                HI: {highScore}
            </div>
        )}
      </div>

      {/* Mobile Controls */}
      <div className="flex justify-between w-full max-w-[400px] mt-6 px-4">
          <button 
            className="w-20 h-20 bg-green-900/50 border-2 border-green-500 rounded-full text-3xl text-green-400 active:bg-green-700 transition-colors"
            onPointerDown={handleTouch('left', true)} onPointerUp={handleTouch('left', false)} onPointerLeave={handleTouch('left', false)}
          >
              ◀
          </button>
          
          {gameState !== 'playing' && (
              <button 
                className="w-32 h-16 self-center bg-blue-900/50 border-2 border-blue-500 rounded text-xl font-bold text-blue-400 active:bg-blue-700 transition-colors"
                onPointerDown={handleTouch('start', true)}
              >
                  START
              </button>
          )}

          <button 
            className="w-20 h-20 bg-green-900/50 border-2 border-green-500 rounded-full text-3xl text-green-400 active:bg-green-700 transition-colors"
            onPointerDown={handleTouch('right', true)} onPointerUp={handleTouch('right', false)} onPointerLeave={handleTouch('right', false)}
          >
              ▶
          </button>
      </div>
    </div>
  );
};

export default RetroRacing;
