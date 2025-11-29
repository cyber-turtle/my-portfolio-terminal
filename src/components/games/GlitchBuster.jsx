'use client';

import React, { useRef, useEffect } from 'react';

const GlitchBuster = () => {
  const iframeRef = useRef(null);

  const sendKey = (key, type = 'keydown') => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type, key }, '*');
    }
  };

  useEffect(() => {
    // Expose controls to window for overlay buttons
    window.glitchBusterControls = {
      pause: () => sendKey('KeyP'),
      toggleSound: () => {
        if (iframeRef.current?.contentWindow) {
          // Click the mute button in the game
          const evt = { target: { click: () => {} } };
          iframeRef.current.contentWindow.postMessage({ type: 'mute' }, '*');
        }
      }
    };

    return () => {
      delete window.glitchBusterControls;
    };
  }, []);

  const handleTouch = (key, pressed) => (e) => {
    e.preventDefault();
    if (pressed) {
      sendKey(key);
    } else {
      sendKey(key, 'keyup');
    }
  };

  const handleJump = (pressed) => (e) => {
    e.preventDefault();
    if (iframeRef.current?.contentWindow) {
      // Simulate the up arrow key (38) or W key (87) which triggers jump in the game
      // Using W key as it might be more reliable
      const keyCode = 87; // 87 is keyCode for W key (alternative: 38 for ArrowUp)
      if (pressed) {
        iframeRef.current.contentWindow.postMessage({ type: 'keydown', keyCode: keyCode }, '*');
      } else {
        iframeRef.current.contentWindow.postMessage({ type: 'keyup', keyCode: keyCode }, '*');
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-[400px] md:max-w-[700px] aspect-square border border-green-500 bg-black overflow-hidden">
        <iframe
          ref={iframeRef}
          src="/glitch-buster/index.html"
          className="w-full h-full border-none"
          title="Glitch Buster Game"
        />
        <style jsx>{`
          iframe {
            pointer-events: auto;
          }
          iframe::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 120px;
            background: transparent;
            pointer-events: none;
            z-index: 10;
          }
        `}</style>
      </div>

      {/* Mobile Controls */}
      <div className="flex justify-between w-full mt-4 px-2 gap-2">
        <div className="flex gap-2">
          <button className="w-12 h-12 sm:w-16 sm:h-16 bg-green-900/50 border border-green-500 rounded flex items-center justify-center text-green-400 active:bg-green-700 select-none text-xl sm:text-2xl touch-manipulation"
             onPointerDown={handleTouch('ArrowLeft', true)} onPointerUp={handleTouch('ArrowLeft', false)} onPointerLeave={handleTouch('ArrowLeft', false)}>◀</button>
          <button className="w-12 h-12 sm:w-16 sm:h-16 bg-green-900/50 border border-green-500 rounded flex items-center justify-center text-green-400 active:bg-green-700 select-none text-xl sm:text-2xl touch-manipulation"
             onPointerDown={handleTouch('ArrowRight', true)} onPointerUp={handleTouch('ArrowRight', false)} onPointerLeave={handleTouch('ArrowRight', false)}>▶</button>
        </div>
        <div className="flex gap-2 sm:gap-4 items-center">
          <button className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-900/50 border border-blue-500 rounded flex items-center justify-center text-blue-400 active:bg-blue-700 font-bold select-none text-xs sm:text-sm touch-manipulation"
              onPointerDown={handleTouch('Space', true)} onPointerUp={handleTouch('Space', false)} onPointerLeave={handleTouch('Space', false)}>SPACE</button>
          <button className="w-16 h-16 sm:w-24 sm:h-24 bg-red-900/50 border border-red-500 rounded-full flex items-center justify-center text-red-400 active:bg-red-700 font-bold select-none text-sm sm:text-xl touch-manipulation"
              onPointerDown={handleJump(true)} onPointerUp={handleJump(false)} onPointerLeave={handleJump(false)}>JUMP</button>
        </div>
      </div>

      <div className="mt-2 text-green-600 text-sm font-mono text-center">
        Fix the glitches before the code falls apart!
      </div>
    </div>
  );
};

export default GlitchBuster;