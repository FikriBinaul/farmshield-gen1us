import React, { useEffect, useState } from 'react';

/**
 * LeafAnimation - Komponen animasi daun jatuh yang elegan untuk background
 * 
 * @param {number} leafCount - Jumlah daun (default: 15)
 * @param {string} speed - Kecepatan animasi: 'slow', 'normal', 'fast' (default: 'normal')
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
const LeafAnimation = ({ leafCount = 15, speed = 'normal' }) => {
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
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C8 2 5 5 5 9c0 2.5 1.5 4.5 3.5 5.5C7 15.5 6 17 6 19c0 1.5 1 2.5 2.5 2.5 1 0 1.8-0.5 2.3-1.2C11.2 21 11.6 21 12 21s0.8 0 1.2-0.7c0.5 0.7 1.3 1.2 2.3 1.2 1.5 0 2.5-1 2.5-2.5 0-2-1-3.5-2.5-4.5 2-1 3.5-3 3.5-5.5 0-4-3-7-7-7z"
              fill="currentColor"
            />
          </svg>
        </div>
      ))}
    </div>
  );
};

export default LeafAnimation;
