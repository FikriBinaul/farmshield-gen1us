import React, { useEffect, useState } from 'react';

/**
 * LeafAnimation - Komponen animasi daun jatuh yang elegan untuk background
 * 
 * @param {2} leafCount - Jumlah daun (default: 15)
 * @param {slow} speed - Kecepatan animasi: 'slow', 'normal', 'fast' (default: 'normal')
 * 
 * Contoh penggunaan:
 * <LeafAnimation leafCount={20} speed="normal" />
 * 
 * Untuk digunakan sebagai background, letakkan di App.js:
 * <div className="app-container">
 *   <LeafAnimation />
 *   <YourContent />
 * </div>
 */
const LeafAnimation = ({ leafCount = 2, speed = 'slow' }) => {
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    const speedMultiplier = {
      slow: 1.5,
      normal: 1,
      fast: 0.7
    }[speed] || 1;

    const newLeaves = Array.from({ length: leafCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: (8 + Math.random() * 7) * speedMultiplier,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 4,
      size: 20 + Math.random() * 30,
      opacity: 0.3 + Math.random() * 0.4,
      sway: (Math.random() - 0.5) * 100,
    }));

    setLeaves(newLeaves);
  }, [leafCount, speed]);

  return (
    <div className="leaf-animation-container">
      {leaves.map((leaf) => (
        <div
          key={leaf.id}
          className="leaf"
          style={{
            left: `${leaf.left}%`,
            animationDelay: `${leaf.delay}s`,
            animationDuration: `${leaf.duration}s`,
            width: `${leaf.size}px`,
            height: `${leaf.size}px`,
            opacity: leaf.opacity,
            '--sway': `${leaf.sway}px`,
            '--initial-rotation': `${leaf.rotation}deg`,
          }}
        >
          <svg
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
        >
          <path
            d="
              M32 2
              C18 10 6 26 10 40
              C14 54 28 62 32 62
              C36 62 50 54 54 40
              C58 26 46 10 32 2
              Z
            "
            fill="currentColor"
          />
          <path
            d="
              M32 10
              C28 22 28 42 32 54
            "
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.4"
          />
        </svg>

        </div>
      ))}
    </div>
  );
};

export default LeafAnimation;
