'use client';

import React, { useRef } from 'react';

const WayOut = () => {
  const iframeRef = useRef(null);

  const sendKey = (keyCode, type = 'keydown') => {
    if (iframeRef.current?.contentWindow) {
      const event = new KeyboardEvent(type, {
        keyCode: keyCode,
        which: keyCode,
        bubbles: true,
        cancelable: true
      });
      iframeRef.current.contentWindow.document.dispatchEvent(event);
    }
  };

  const handleTouch = (keyCode, pressed) => (e) => {
    e.preventDefault();
    if (pressed) {
      sendKey(keyCode);
    } else {
      sendKey(keyCode, 'keyup');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-[400px] md:max-w-[600px] aspect-square border border-green-500 bg-black overflow-hidden">
        <iframe
          ref={iframeRef}
          src="way-out/index.html"
          className="w-full h-full border-none"
          title="Way Out Game"
        />
      </div>

      {/* Mobile Controls */}
      <div className="flex justify-between w-full mt-4 px-2 gap-3">
        {/* Directional Pad - Traditional 4-way */}
        <div className="grid grid-cols-3 gap-1 sm:gap-2">
          <div />
          <button className="w-12 h-12 sm:w-16 sm:h-16 bg-green-900/50 border border-green-500 rounded flex items-center justify-center text-green-400 active:bg-green-700 select-none text-xl sm:text-2xl touch-manipulation"
             onPointerDown={handleTouch(38, true)} onPointerUp={handleTouch(38, false)} onPointerLeave={handleTouch(38, false)}>▲</button>
          <div />
          <button className="w-12 h-12 sm:w-16 sm:h-16 bg-green-900/50 border border-green-500 rounded flex items-center justify-center text-green-400 active:bg-green-700 select-none text-xl sm:text-2xl touch-manipulation"
             onPointerDown={handleTouch(37, true)} onPointerUp={handleTouch(37, false)} onPointerLeave={handleTouch(37, false)}>◀</button>
          <button className="w-12 h-12 sm:w-16 sm:h-16 bg-green-900/50 border border-green-500 rounded flex items-center justify-center text-green-400 active:bg-green-700 select-none text-xl sm:text-2xl touch-manipulation"
             onPointerDown={handleTouch(40, true)} onPointerUp={handleTouch(40, false)} onPointerLeave={handleTouch(40, false)}>▼</button>
          <button className="w-12 h-12 sm:w-16 sm:h-16 bg-green-900/50 border border-green-500 rounded flex items-center justify-center text-green-400 active:bg-green-700 select-none text-xl sm:text-2xl touch-manipulation"
             onPointerDown={handleTouch(39, true)} onPointerUp={handleTouch(39, false)} onPointerLeave={handleTouch(39, false)}>▶</button>
        </div>

        {/* Start Button - Small, centered */}
        <div className="flex items-center">
          <button className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-900/50 border border-blue-500 rounded flex items-center justify-center text-blue-400 active:bg-blue-700 font-bold select-none text-xs sm:text-sm touch-manipulation"
              onPointerDown={handleTouch(32, true)} onPointerUp={handleTouch(32, false)} onPointerLeave={handleTouch(32, false)}>START</button>
        </div>

        {/* Jump Button - Large, dedicated */}
        <div className="flex items-center">
          <button className="w-16 h-16 sm:w-24 sm:h-24 bg-yellow-900/50 border border-yellow-500 rounded-full flex items-center justify-center text-yellow-400 active:bg-yellow-700 font-bold select-none text-sm sm:text-xl touch-manipulation"
              onPointerDown={handleTouch(38, true)} onPointerUp={handleTouch(38, false)} onPointerLeave={handleTouch(38, false)}>JUMP</button>
        </div>
      </div>

      <div className="mt-2 text-green-600 text-sm font-mono text-center">
        Collect all gems and find the way out!
      </div>
    </div>
  );
};

export default WayOut;