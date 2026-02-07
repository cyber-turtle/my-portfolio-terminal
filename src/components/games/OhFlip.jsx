'use client';

import React, { useRef, useEffect } from 'react';

const OhFlip = () => {
  const iframeRef = useRef(null);

  const sendMessage = (type, data = {}) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type, ...data }, '*');
    }
  };

  const handleFlip = (pressed) => (e) => {
    e.preventDefault();
    sendMessage('flip', { pressed });
  };

  const handleStart = (e) => {
    e.preventDefault();
    sendMessage('start');
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full max-w-[600px] aspect-[4/3] border border-green-500 bg-black overflow-hidden">
        <iframe
          ref={iframeRef}
          src="oh-flip/index.html"
          className="w-full h-full border-none"
          title="Oh Flip Game"
        />
      </div>

      {/* Mobile Controls */}
      <div className="flex justify-center w-full mt-4 px-2">
        <div className="flex gap-4 items-center">
          <button 
            className="w-20 h-20 sm:w-28 sm:h-28 bg-orange-900/50 border-2 border-orange-500 rounded-full flex items-center justify-center text-orange-400 active:bg-orange-700 font-bold select-none text-lg sm:text-2xl touch-manipulation transition-colors shadow-lg"
            onPointerDown={handleFlip(true)} 
            onPointerUp={handleFlip(false)} 
            onPointerLeave={handleFlip(false)}
            onTouchStart={handleFlip(true)}
            onTouchEnd={handleFlip(false)}
          >
            FLIP
          </button>
        </div>
      </div>

      <div className="mt-2 text-green-600 text-sm font-mono text-center">
        Hold SPACEBAR (desktop) or FLIP button (mobile) to perform backflips!
      </div>
    </div>
  );
};

export default OhFlip;