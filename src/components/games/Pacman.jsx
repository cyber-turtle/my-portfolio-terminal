'use client';

import React, { useRef, useEffect, useState } from 'react';

const Pacman = ({ onPause, onVolumeToggle, isPaused, isMuted }) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    // Function to send key events to iframe
    const sendKeyToIframe = (key, type) => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        const event = new KeyboardEvent(type, {
          key: key,
          code: key === 'ArrowUp' ? 'ArrowUp' :
                key === 'ArrowDown' ? 'ArrowDown' :
                key === 'ArrowLeft' ? 'ArrowLeft' :
                key === 'ArrowRight' ? 'ArrowRight' : key,
          keyCode: key === 'ArrowUp' ? 38 :
                   key === 'ArrowDown' ? 40 :
                   key === 'ArrowLeft' ? 37 :
                   key === 'ArrowRight' ? 39 : 0,
          which: key === 'ArrowUp' ? 38 :
                 key === 'ArrowDown' ? 40 :
                 key === 'ArrowLeft' ? 37 :
                 key === 'ArrowRight' ? 39 : 0,
          bubbles: true,
          cancelable: true
        });
        iframeRef.current.contentWindow.document.dispatchEvent(event);
      }
    };

    // Expose controls to window for button clicks
    window.pacmanControls = {
      moveUp: () => {
        sendKeyToIframe('ArrowUp', 'keydown');
        setTimeout(() => sendKeyToIframe('ArrowUp', 'keyup'), 100);
      },
      moveDown: () => {
        sendKeyToIframe('ArrowDown', 'keydown');
        setTimeout(() => sendKeyToIframe('ArrowDown', 'keyup'), 100);
      },
      moveLeft: () => {
        sendKeyToIframe('ArrowLeft', 'keydown');
        setTimeout(() => sendKeyToIframe('ArrowLeft', 'keyup'), 100);
      },
      moveRight: () => {
        sendKeyToIframe('ArrowRight', 'keydown');
        setTimeout(() => sendKeyToIframe('ArrowRight', 'keyup'), 100);
      },
      pause: () => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          const pauseBtn = iframeRef.current.contentWindow.document.getElementById('pause-button');
          if (pauseBtn) pauseBtn.click();
        }
      },
      toggleSound: () => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          const soundBtn = iframeRef.current.contentWindow.document.getElementById('sound-button');
          if (soundBtn) soundBtn.click();
        }
      }
    };

    return () => {
      delete window.pacmanControls;
    };
  }, []);

  // Handle external pause/volume controls
  useEffect(() => {
    if (onPause && window.pacmanControls) {
      window.pacmanControls.pause();
    }
  }, [isPaused, onPause]);

  useEffect(() => {
    if (onVolumeToggle && window.pacmanControls) {
      window.pacmanControls.toggleSound();
    }
  }, [isMuted, onVolumeToggle]);

  return (
    <div className="flex flex-col items-center">
      {/* Game Container with responsive sizing */}
      <div className="relative w-full max-w-[800px] aspect-square border border-green-500 bg-black overflow-hidden">
        <iframe
          ref={iframeRef}
          src="pacman-game/index.html"
          className="w-full h-full border-none"
          style={{
            backgroundColor: 'black'
          }}
          title="Pacman Game"
          allow="autoplay"
        />
      </div>

      {/* Mobile Controls */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        <div />
        <button
          className="w-12 h-12 bg-green-900/50 border border-green-500 rounded flex items-center justify-center text-green-400 active:bg-green-700 select-none"
          onPointerDown={(e) => {
            e.preventDefault();
            if(window.pacmanControls) window.pacmanControls.moveUp();
          }}
        >
          ▲
        </button>
        <div />
        <button
          className="w-12 h-12 bg-green-900/50 border border-green-500 rounded flex items-center justify-center text-green-400 active:bg-green-700 select-none"
          onPointerDown={(e) => {
            e.preventDefault();
            if(window.pacmanControls) window.pacmanControls.moveLeft();
          }}
        >
          ◀
        </button>
        <button
          className="w-12 h-12 bg-green-900/50 border border-green-500 rounded flex items-center justify-center text-green-400 active:bg-green-700 select-none"
          onPointerDown={(e) => {
            e.preventDefault();
            if(window.pacmanControls) window.pacmanControls.moveDown();
          }}
        >
          ▼
        </button>
        <button
          className="w-12 h-12 bg-green-900/50 border border-green-500 rounded flex items-center justify-center text-green-400 active:bg-green-700 select-none"
          onPointerDown={(e) => {
            e.preventDefault();
            if(window.pacmanControls) window.pacmanControls.moveRight();
          }}
        >
          ▶
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-2 text-green-600 text-sm font-mono text-center">
        Use Arrow Keys or Touch Controls
      </div>
    </div>
  );
};

export default Pacman;

