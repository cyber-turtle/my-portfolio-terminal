"use client";

import React, { useState, useEffect } from "react";

const RetroLoader = () => {
  const [spinnerFrame, setSpinnerFrame] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const spinnerInterval = setInterval(() => {
      setSpinnerFrame((prev) => (prev + 1) % 4);
    }, 100);

    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => {
      clearInterval(spinnerInterval);
      clearInterval(dotsInterval);
    };
  }, []);

  const frames = ["/", "-", "\\", "|"];

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="text-green-400 text-xl font-mono">
        {frames[spinnerFrame]} loading{dots}
      </div>
    </div>
  );
};

export default RetroLoader;
