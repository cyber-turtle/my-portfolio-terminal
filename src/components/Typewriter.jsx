import { useState, useEffect } from 'react';

export default function Typewriter({ text, onFinish, speed = 50 }) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (onFinish) {
      onFinish();
    }
  }, [currentIndex, text, speed, onFinish]);

  return <span className="text-green-500">{displayText}</span>;
}