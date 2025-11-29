'use client';

import React, { useRef, useEffect, useState } from 'react';

// Import Google Font
if (typeof document !== 'undefined') {
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
}

// --- IMPORTS FROM LOCAL LIB ---
import { Mario } from '../../lib/kongClimb/Mario.js';
import { DK } from '../../lib/kongClimb/DK.js';
import { Barrel } from '../../lib/kongClimb/Barrel.js';
import { Platform } from '../../lib/kongClimb/Platform.js';
import { Ladder } from '../../lib/kongClimb/Ladder.js';
import { sprites as Sprites } from '../../lib/kongClimb/sprites.js';

// --- ASSET PATHS ---
const SPRITE_SHEET_SRC = '/dkjs/mario_luigi_sprites2.png';  // For Mario sprites
const PLATFORM_LADDER_SRC = '/dkjs/mario_and_luigi_sprites.png';  // For platforms and ladders
const BARREL_SPRITE_SRC = '/dkjs/barrel_sprites.png';
const DK_SPRITE_SRC = '/dkjs/DK_sprites.png';
const TITLE_SRC = '/dkjs/dk_title.png';
const PAUSE_SRC = '/dkjs/pausemenu.png';

// --- MAIN COMPONENT ---

const KongClimb = () => {
  const canvasRef = useRef(null);
  // Removed manual scale state, using CSS instead
  const [gameState, setGameState] = useState("loading"); // loading, title, character, game
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [highScore, setHighScore] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Game State Ref to avoid re-renders
  const requestRef = useRef();
  const gameRef = useRef({
      width: 1350, // Original game width
      height: 757, // Original game height
      mario: null,
      dk: null,
      barrels: [],
      platforms: [],
      ladders: [],
      sprites: null,
      images: {},
      keys: {
          ArrowUp: { pressed: false },
          ArrowLeft: { pressed: false },
          ArrowDown: { pressed: false },
          ArrowRight: { pressed: false },
          space: { pressed: false },
      },
      character: "Mario",
      previousTime: 0,
      paused: false
  });

  // Load Images
  useEffect(() => {
    const imagesToLoad = {
        sprites: SPRITE_SHEET_SRC,
        platformLadder: PLATFORM_LADDER_SRC,
        barrel: BARREL_SPRITE_SRC,
        dk: DK_SPRITE_SRC,
        title: TITLE_SRC,
        pause: PAUSE_SRC
    };

    let loadedCount = 0;
    const totalImages = Object.keys(imagesToLoad).length;
    const loadedImages = {};

    Object.entries(imagesToLoad).forEach(([key, src]) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            loadedCount++;
            loadedImages[key] = img;
            if (loadedCount === totalImages) {
                gameRef.current.images = loadedImages;
                setImagesLoaded(true);
                setGameState("title");
            }
        };
        img.onerror = () => {
            console.error(`Failed to load image: ${src}`);
            // Still count it to avoid hanging, but game might look broken
            loadedCount++;
            if (loadedCount === totalImages) {
                gameRef.current.images = loadedImages;
                setImagesLoaded(true);
                setGameState("title");
            }
        };
    });
  }, []);

  useEffect(() => {
    if (!imagesLoaded) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Initialize Game Objects
    const g = gameRef.current;
    
    // Pass images to constructors
    g.sprites = new Sprites(ctx, g.images);
    g.mario = new Mario(200, 608, 35, 52, g.sprites, g.keys);
    g.dk = new DK(250, -5, g.images);
    
    console.log('Images loaded:', g.images);
    console.log('Sprites instance created:', g.sprites);
    console.log('g.images.platformLadder:', g.images.platformLadder);
    
    // Initialize Platforms & Ladders (Copied from main.js) - USE platformLadder image!
    g.platforms = [
        new Platform(122, 138, 8, g.images.platformLadder), new Platform(245, 138, 8, g.images.platformLadder), new Platform(368, 138, 8, g.images.platformLadder), new Platform(491, 138, 8, g.images.platformLadder), new Platform(614, 138, 9, g.images.platformLadder), 
        new Platform(120, 660, 42, g.images.platformLadder), new Platform(752, 657, 8, g.images.platformLadder), new Platform(875, 654, 8, g.images.platformLadder), new Platform(998, 651, 8, g.images.platformLadder), new Platform(1121, 648, 8, g.images.platformLadder), new Platform(1244, 645, 8, g.images.platformLadder),
        new Platform(1121, 575, 8, g.images.platformLadder), new Platform(998, 572, 8, g.images.platformLadder), new Platform(875, 569, 8, g.images.platformLadder), new Platform(752, 566, 8, g.images.platformLadder), new Platform(629, 563, 8, g.images.platformLadder), new Platform(506, 561, 8, g.images.platformLadder), new Platform(383, 558, 8, g.images.platformLadder), new Platform(260, 555, 8, g.images.platformLadder), new Platform(182, 552, 5, g.images.platformLadder),
        new Platform(260, 483, 8, g.images.platformLadder), new Platform(383, 478, 8, g.images.platformLadder), new Platform(506, 473, 8, g.images.platformLadder), new Platform(629, 468, 8, g.images.platformLadder), new Platform(752, 463, 8, g.images.platformLadder), new Platform(875, 458, 8, g.images.platformLadder), new Platform(998, 453, 8, g.images.platformLadder), new Platform(1121, 448, 8, g.images.platformLadder), new Platform(1244, 443, 5, g.images.platformLadder),    
        new Platform(1121, 375, 8, g.images.platformLadder), new Platform(998, 370, 8, g.images.platformLadder), new Platform(875, 365, 8, g.images.platformLadder), new Platform(752, 360, 8, g.images.platformLadder), new Platform(629, 355, 8, g.images.platformLadder), new Platform(506, 350, 8, g.images.platformLadder), new Platform(383, 345, 8, g.images.platformLadder), new Platform(260, 340, 8, g.images.platformLadder), new Platform(182, 335, 5, g.images.platformLadder),
        new Platform(260, 268, 8, g.images.platformLadder), new Platform(383, 263, 8, g.images.platformLadder), new Platform(506, 258, 8, g.images.platformLadder), new Platform(629, 253, 8, g.images.platformLadder), new Platform(752, 248, 8, g.images.platformLadder), new Platform(875, 243, 8, g.images.platformLadder), new Platform(998, 238, 8, g.images.platformLadder), new Platform(1121, 233, 8, g.images.platformLadder), new Platform(1244, 228, 5, g.images.platformLadder),
        new Platform(1121, 158, 8, g.images.platformLadder), new Platform(998, 153, 8, g.images.platformLadder), new Platform(875, 148, 8, g.images.platformLadder), new Platform(752, 143, 8, g.images.platformLadder),
        new Platform(500, 57, 25, g.images.platformLadder), new Platform(408, 80, 6, g.images.platformLadder),
    ];
    
    console.log('Platforms created:', g.platforms.length);

    g.ladders = [
        new Ladder(1125, 612, 2, g.images.platformLadder), new Ladder(350, 521, 2, g.images.platformLadder), new Ladder(1125, 413, 2, g.images.platformLadder), new Ladder(350, 306, 2, g.images.platformLadder), new Ladder(1125, 196, 2, g.images.platformLadder),
        new Ladder(680, 526, 3, g.images.platformLadder), new Ladder(760, 428, 4, g.images.platformLadder), new Ladder(845, 110, 3, g.images.platformLadder), new Ladder(410, 100, 7, g.images.platformLadder), new Ladder(470, 100, 7, g.images.platformLadder),
    ];
    
    console.log('Ladders created:', g.ladders.length);

    let animationFrameId;

    const resetGame = () => {
        g.mario.x = 200;
        g.mario.y = 608;
        setScore(0);
    };



    const update = (timestamp) => {
        const elapsed = timestamp - g.previousTime || 0;
        g.previousTime = timestamp;

        if (canvasRef.current) {
             const ctx = canvasRef.current.getContext('2d');
             // Clear canvas with black background
             ctx.fillStyle = '#000';
             ctx.fillRect(0, 0, g.width, g.height);

             if (gameState === "title") {
                 // Don't draw anything on canvas for title - using overlay
             } 
             else if (gameState === "character") {
                 ctx.fillStyle = 'white';
                 ctx.font = 'bold 28px "Press Start 2P", monospace';
                 ctx.textAlign = "center";
                 ctx.fillText("Select your character (Left/Right)", g.width / 2, 200);
     
                 // Draw Mario/Luigi previews
                 ctx.drawImage(g.images.sprites, 38, 17, 15, 18, 600, 300, 60, 90);
                 ctx.drawImage(g.images.sprites, 38, 53, 15, 18, 850, 300, 60, 90);
     
                 ctx.font = 'bold 32px "Press Start 2P", monospace';
                 ctx.fillText("Luigi", 882, 420);
                 ctx.fillStyle = g.character === "Mario" ? 'red' : 'white';
                 ctx.fillText("Mario", 632, 420);
                 if (g.character === "Luigi") {
                     ctx.fillStyle = 'lime';
                     ctx.fillText("Luigi", 882, 420);
                 }
             }
             else if (gameState === "game") {
                 // Draw Level
                 // console.log('Drawing platforms:', g.platforms.length, 'ladders:', g.ladders.length);
                 g.ladders.forEach(l => l.drawLadder(ctx));
                 g.platforms.forEach(p => p.drawPlatform(ctx));
     
                 // Update Entities
                 if (!g.paused) {
                     g.mario.update(ctx, g.platforms, g.ladders, g.character, elapsed);
                     
                     if (g.dk.isThrowing) {
                         g.barrels.push(new Barrel(350, 90, 27, 42));
                     }
                     g.barrels.forEach(b => b.update(ctx, g.sprites, g.platforms, g.mario, elapsed));
                     g.dk.update(ctx, elapsed);
     
                     // Scoring
                     g.barrels.forEach(b => {
                         if (b.scored) {
                             setScore(prev => prev + 100);
                             b.scored = false;
                         }
                     });
     
                     // Lives
                     let lifeLost = false;
                     g.barrels.forEach(b => {
                         if (b.dead) lifeLost = true;
                     });
                     if (g.mario.y > g.height) lifeLost = true;
     
                     if (lifeLost) {
                         setLives(prev => {
                             const newLives = prev - 1;
                             if (newLives < 0) {
                                 setGameState("gameover");
                                 setHighScore(prevHigh => Math.max(prevHigh, score));
                             } else {
                                 g.mario.x = 200;
                                 g.mario.y = 608;
                                 g.barrels = [];
                             }
                             return newLives;
                         });
                     }
     
                     // Win Condition
                     if (g.mario.y + g.mario.height <= 57) {
                         setGameState("gameover");
                         setHighScore(prevHigh => Math.max(prevHigh, score));
                     }
                 } else {
                     // Pause Screen
                     ctx.drawImage(g.images.pause, g.width/2 - 275, g.height/2 - 100, 550, 200);
                     
                     ctx.fillStyle = 'yellow';
                     ctx.font = 'bold 32px "Press Start 2P", monospace';
                     ctx.textAlign = "center";
                     ctx.fillText("— Paused —", g.width / 2, 400);
                 }
     
                 // UI - Larger font for visibility
                 ctx.fillStyle = 'white';
                 ctx.font = 'bold 32px "Press Start 2P", monospace';
                 ctx.textAlign = "left";
                 ctx.fillText(`Score: ${score}`, 90, 50);
                 ctx.fillText(`Lives: ${lives}`, g.width - 300, 50);
             }
             else if (gameState === "gameover") {
                 // Don't draw anything on canvas for gameover - using overlay
             }
        }

        requestRef.current = requestAnimationFrame(update);
    };

    requestRef.current = requestAnimationFrame(update);

    // Keyboard Controls
    const handleKeyDown = (e) => {
        // console.log('handleKeyDown fired, key:', e.key, 'gameState:', gameState);
        if (gameState === "title" && e.key === "Enter") {
            setGameState("character");
        } else if (gameState === "gameover" && e.key === "Enter") {
            setGameState("title");
            setLives(3);
            setScore(0);
        } else if (gameState === "character") {
            if (e.key === "ArrowLeft") g.character = "Mario";
            if (e.key === "ArrowRight") g.character = "Luigi";
            if (e.key === "Enter") {
                setGameState("game");
                resetGame();
            }
        } else if (gameState === "game") {
            // console.log('Setting key in g.keys:', e.key);
            if (e.key === "ArrowUp") g.keys.ArrowUp.pressed = true;
            if (e.key === "ArrowLeft") g.keys.ArrowLeft.pressed = true;
            if (e.key === "ArrowDown") g.keys.ArrowDown.pressed = true;
            if (e.key === "ArrowRight") g.keys.ArrowRight.pressed = true;
            if (e.key === " ") g.keys.space.pressed = true;
            if (e.key === "p") g.paused = !g.paused;
        }
    };

    const handleKeyUp = (e) => {
        if (gameState === "game") {
            if (e.key === "ArrowUp") g.keys.ArrowUp.pressed = false;
            if (e.key === "ArrowLeft") g.keys.ArrowLeft.pressed = false;
            if (e.key === "ArrowDown") g.keys.ArrowDown.pressed = false;
            if (e.key === "ArrowRight") g.keys.ArrowRight.pressed = false;
            if (e.key === " ") g.keys.space.pressed = false;
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, score, lives, highScore, imagesLoaded]);

  // Mobile Controls
  const handleTouch = (key, pressed) => (e) => {
      e.preventDefault();
      const g = gameRef.current;
      
      if (gameState === "title") {
          if (pressed) setGameState("character");
      } else if (gameState === "gameover") {
          if (pressed) {
              setGameState("title");
              setLives(3);
              setScore(0);
          }
      } else if (gameState === "character") {
          if (pressed) {
              if (key === "ArrowLeft") g.character = "Mario";
              if (key === "ArrowRight") g.character = "Luigi";
              if (key === "enter") {
                  setGameState("game");
                  g.mario.x = 200;
                  g.mario.y = 608;
                  g.barrels = [];
                  setLives(3);
                  setScore(0);
              }
          }
      } else if (gameState === "game") {
          if (key === "ArrowUp") g.keys.ArrowUp.pressed = pressed;
          if (key === "ArrowLeft") g.keys.ArrowLeft.pressed = pressed;
          if (key === "ArrowDown") g.keys.ArrowDown.pressed = pressed;
          if (key === "ArrowRight") g.keys.ArrowRight.pressed = pressed;
          if (key === "space") g.keys.space.pressed = pressed;
          if (key === "p" && pressed) g.paused = !g.paused;
      }
  };

  if (!imagesLoaded) {
      return (
        <div className="flex flex-col items-center justify-center w-full h-screen" style={{
          backgroundColor: '#111',
          color: 'white',
          fontFamily: '"Press Start 2P", monospace',
          textAlign: 'center'
        }}>
          <h1 style={{
            color: '#d00',
            textShadow: '4px 4px 0 #fff',
            marginBottom: '10px',
            fontSize: '32px',
            lineHeight: '1.2'
          }}>DONKEY<br/>KONG</h1>
          <h2 style={{
            color: '#48f',
            marginBottom: '30px',
            fontSize: '14px',
            letterSpacing: '2px'
          }}>ANDREW EDITION</h2>
          <p style={{
            fontSize: '10px',
            color: '#ccc',
            marginBottom: '40px',
            lineHeight: '1.8'
          }}>ARROWS to Move<br/>SPACE to Jump</p>
          <div style={{
            color: '#fa0',
            cursor: 'pointer',
            padding: '10px',
            border: '2px solid #fa0',
            animation: 'blinker 0.8s step-end infinite'
          }}>INSERT COIN</div>
        </div>
      );
  }

  return (
    <>
      <style jsx>{`
        @keyframes blinker {
          50% { opacity: 0; }
        }
      `}</style>
      <div className="flex flex-col items-center w-full max-w-6xl mx-auto p-2">
        <div className="relative w-full aspect-[1350/757]">
        <canvas
            ref={canvasRef}
            width={1350}
            height={757}
            className="w-full h-full border border-green-500 bg-black block"
        />

        {/* Start Screen Overlay */}
        {gameState === "title" && (
          <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-center z-20" style={{
            backgroundColor: 'rgba(0,0,0,0.9)',
            fontFamily: '"Press Start 2P", monospace'
          }}>
            <h1 style={{
              color: '#d00',
              textShadow: '4px 4px 0 #fff',
              marginBottom: '10px',
              fontSize: '32px',
              lineHeight: '1.2'
            }}>DONKEY<br/>KONG</h1>
            <h2 style={{
              color: '#48f',
              marginBottom: '30px',
              fontSize: '14px',
              letterSpacing: '2px'
            }}>TOONI EDITION</h2>
            <p style={{
              fontSize: '10px',
              color: '#ccc',
              marginBottom: '40px',
              lineHeight: '1.8'
            }}>ARROWS to Move<br/>SPACE to Jump</p>
            <div
              onClick={() => setGameState("character")}
              style={{
                color: '#fa0',
                cursor: 'pointer',
                padding: '10px',
                border: '2px solid #fa0',
                animation: 'blinker 0.8s step-end infinite'
              }}
            >
              INSERT COIN
            </div>
          </div>
        )}

        {/* Game Over Screen Overlay */}
        {gameState === "gameover" && (
          <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-center z-20" style={{
            backgroundColor: 'rgba(0,0,0,0.9)',
            fontFamily: '"Press Start 2P", monospace'
          }}>
            <h1 style={{
              color: '#d00',
              fontSize: '32px',
              marginBottom: '40px'
            }}>GAME OVER</h1>
            <div
              onClick={() => {
                setGameState("title");
                setLives(3);
                setScore(0);
              }}
              style={{
                color: '#fa0',
                cursor: 'pointer',
                padding: '10px',
                border: '2px solid #fa0',
                animation: 'blinker 0.8s step-end infinite'
              }}
            >
              PLAY AGAIN
            </div>
          </div>
        )}
      </div>
      
      {/* Mobile Controls Overlay */}
      <div className="flex justify-between w-full mt-4 px-2 gap-2">
        <div className="grid grid-cols-3 gap-1 sm:gap-2">
          <div />
          <button className="w-12 h-12 sm:w-16 sm:h-16 bg-green-900/50 border border-green-500 rounded flex items-center justify-center text-green-400 active:bg-green-700 select-none text-xl sm:text-2xl touch-manipulation"
             onPointerDown={handleTouch('ArrowUp', true)} onPointerUp={handleTouch('ArrowUp', false)} onPointerLeave={handleTouch('ArrowUp', false)}>▲</button>
          <div />
          <button className="w-12 h-12 sm:w-16 sm:h-16 bg-green-900/50 border border-green-500 rounded flex items-center justify-center text-green-400 active:bg-green-700 select-none text-xl sm:text-2xl touch-manipulation"
             onPointerDown={handleTouch('ArrowLeft', true)} onPointerUp={handleTouch('ArrowLeft', false)} onPointerLeave={handleTouch('ArrowLeft', false)}>◀</button>
          <button className="w-12 h-12 sm:w-16 sm:h-16 bg-green-900/50 border border-green-500 rounded flex items-center justify-center text-green-400 active:bg-green-700 select-none text-xl sm:text-2xl touch-manipulation"
             onPointerDown={handleTouch('ArrowDown', true)} onPointerUp={handleTouch('ArrowDown', false)} onPointerLeave={handleTouch('ArrowDown', false)}>▼</button>
          <button className="w-12 h-12 sm:w-16 sm:h-16 bg-green-900/50 border border-green-500 rounded flex items-center justify-center text-green-400 active:bg-green-700 select-none text-xl sm:text-2xl touch-manipulation"
             onPointerDown={handleTouch('ArrowRight', true)} onPointerUp={handleTouch('ArrowRight', false)} onPointerLeave={handleTouch('ArrowRight', false)}>▶</button>
        </div>
        <div className="flex gap-2 sm:gap-4 items-center">
             {(gameState === "character" || gameState === "title" || gameState === "gameover") && (
                 <button className="px-4 py-2 sm:w-32 sm:h-16 bg-blue-900/50 border border-blue-500 rounded flex items-center justify-center text-blue-400 active:bg-blue-700 font-bold select-none text-sm sm:text-xl touch-manipulation"
                 onPointerDown={handleTouch('enter', true)}>
                     {gameState === "character" ? "START" : gameState === "gameover" ? "RESTART" : "PLAY"}
                 </button>
             )}
            {gameState === "game" && (
                <button className="w-16 h-16 sm:w-24 sm:h-24 bg-red-900/50 border border-red-500 rounded-full flex items-center justify-center text-red-400 active:bg-red-700 font-bold select-none text-sm sm:text-xl touch-manipulation"
                    onPointerDown={handleTouch('space', true)} onPointerUp={handleTouch('space', false)} onPointerLeave={handleTouch('space', false)}>JUMP</button>
            )}
        </div>
      </div>
    </div>
    </>
  );
};

export default KongClimb;
