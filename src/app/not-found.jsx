'use client';

import React from 'react';
import Link from 'next/link';
import FaultyTerminal from '../components/FaultyTerminal';

export default function NotFound() {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-mono">
      {/* Layer 1: The Glitch Effect (Background) */}
      <div className="absolute inset-0 z-0">
        <FaultyTerminal
          scale={1.5}
          gridMul={[2, 1]}
          digitSize={1.2}
          timeScale={1}
          pause={false}
          scanlineIntensity={1}
          glitchAmount={1}
          flickerAmount={1}
          noiseAmp={1}
          chromaticAberration={0.5}
          dither={0}
          curvature={0}
          tint="#38ef7d"
          mouseReact={true}
          mouseStrength={0.5}
          pageLoadAnimation={false}
          brightness={1}
        />
      </div>

      {/* Layer 2: The Mask (Black background with transparent text) */}
      {/* mix-blend-mode: multiply will make the white text show the underlying layer, and black bg hide it */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black mix-blend-multiply pointer-events-none">
        <h1 className="text-[8rem] sm:text-[12rem] md:text-[18rem] lg:text-[25rem] font-bold text-white leading-none tracking-tighter select-none">
          404
        </h1>
      </div>

      {/* Layer 3: The Content (Foreground, not masked) */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-12 sm:pb-16 md:pb-20 pointer-events-none">
        <div className="text-center space-y-3 sm:space-y-4 pointer-events-auto px-4">
          <p className="text-green-500 text-base sm:text-lg md:text-xl lg:text-2xl animate-pulse">
            SYSTEM ERROR: PAGE_NOT_FOUND
          </p>
          <p className="text-green-800 text-xs sm:text-sm md:text-base max-w-sm md:max-w-md mx-auto">
            The requested directory has been deleted or moved to a secure sector.
          </p>
          <div className="pt-4 sm:pt-6 md:pt-8">
            <Link 
              href="/"
              className="inline-block px-4 py-2 sm:px-6 sm:py-3 border border-green-500 text-green-500 hover:bg-green-500 hover:text-black transition-colors duration-200 uppercase tracking-widest text-xs sm:text-sm"
            >
              Return to Terminal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
