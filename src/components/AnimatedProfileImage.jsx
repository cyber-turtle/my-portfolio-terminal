import { useState, useEffect } from 'react';

export default function AnimatedProfileImage() {
  const [frame, setFrame] = useState(0);
  
  const asciiFrames = [
    `    ████████    
  ██        ██  
██            ██
██  ██    ██  ██
██            ██
██    ████    ██
  ██        ██  
    ████████    `,
    `    ████████    
  ██        ██  
██            ██
██  ██    ██  ██
██            ██
██    ████    ██
  ██        ██  
    ████████    `
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(prev => (prev + 1) % asciiFrames.length);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="font-mono text-green-400 whitespace-pre text-xs leading-tight">
      {asciiFrames[frame]}
    </div>
  );
}