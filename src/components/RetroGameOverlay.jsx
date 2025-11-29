'use client';

import React, { useState } from 'react';

const RetroGameOverlay = ({ onClose, title, children, showGameControls = false, showSettings = false, onSettingsToggle, showMuteButton = false }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const handlePause = () => {
    setIsPaused(!isPaused);
    if (window.pacmanControls) {
      window.pacmanControls.pause();
    }
    if (window.glitchBusterControls) {
      window.glitchBusterControls.pause();
    }
  };

  const handleVolumeToggle = () => {
    setIsMuted(!isMuted);
    if (window.pacmanControls) {
      window.pacmanControls.toggleSound();
    }
    if (window.driveXSControls) {
      window.driveXSControls.toggleMute();
    }
    if (window.glitchBusterControls) {
      window.glitchBusterControls.toggleSound();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="relative w-full max-w-4xl border-2 border-green-500 bg-black rounded-lg overflow-hidden shadow-[0_0_20px_rgba(56,239,125,0.2)]">
        {/* Header */}
        <div className="flex justify-between items-center p-2 border-b border-green-500 bg-green-900/20">
          <h2 className="text-green-400 font-mono text-sm sm:text-xl font-bold uppercase tracking-wider">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            {showGameControls && (
              <>
                <button
                  onClick={handlePause}
                  className="text-green-500 hover:text-green-300 hover:bg-green-900/40 px-2 py-1 rounded font-mono transition-colors text-xs sm:text-base border border-green-500"
                >
                  {isPaused ? '▶' : '⏸'}
                </button>
                <button
                  onClick={handleVolumeToggle}
                  className="text-green-500 hover:text-green-300 hover:bg-green-900/40 px-2 py-1 rounded font-mono transition-colors text-xs sm:text-base border border-green-500"
                >
                  {isMuted ? '🔇' : '🔊'}
                </button>
              </>
            )}
            {showMuteButton && (
              <button
                onClick={handleVolumeToggle}
                className="text-green-500 hover:text-green-300 hover:bg-green-900/40 px-2 py-1 rounded font-mono transition-colors text-xs sm:text-base border border-green-500"
              >
                {isMuted ? '🔇' : '🔊'}
              </button>
            )}
            {onSettingsToggle && (
              <button
                onClick={onSettingsToggle}
                className="text-green-500 hover:text-green-300 hover:bg-green-900/40 px-2 py-1 rounded font-mono transition-colors text-xs sm:text-base border border-green-500"
              >
                ⚙️
              </button>
            )}
            <button
              onClick={onClose}
              className="text-green-500 hover:text-green-300 hover:bg-green-900/40 px-2 sm:px-3 py-1 rounded font-mono transition-colors text-xs sm:text-base"
            >
              [X] CLOSE
            </button>
          </div>
        </div>

        {/* Game Container */}
        <div className="p-4 flex justify-center items-center bg-black min-h-[400px] max-h-[85vh] overflow-auto">
          {children}
        </div>

        {/* Footer Instructions */}
        <div className="p-2 border-t border-green-500 text-green-600 text-center text-xs font-mono">
          CONTROLS: ARROW KEYS / TOUCH • ESC TO EXIT
        </div>
      </div>
    </div>
  );
};

export default RetroGameOverlay;
