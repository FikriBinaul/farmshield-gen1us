// components/LeafAnimation.js
'use client';

import { motion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

const LeafAnimation = () => {
  const [leaves, setLeaves] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    const generateLeaves = () => {
      const newLeaves = [];
      const leafCount = 15;

      for (let i = 0; i < leafCount; i++) {
        newLeaves.push({
          id: i,
          x: Math.random() * 100,
          size: Math.random() * 20 + 10,
          rotation: Math.random() * 360,
          duration: Math.random() * 10 + 15,
          delay: Math.random() * 10,
          opacity: Math.random() * 0.6 + 0.3,
          sway: Math.random() * 100 + 50,
          type: Math.floor(Math.random() * 3),
        });
      }

      setLeaves(newLeaves);
    };

    generateLeaves();
  }, []);

  const leafPaths = [
    "M12 4C8 4 4 8 4 12C4 16 8 20 12 20C16 20 20 16 20 12C20 8 16 4 12 4Z",
    "M12 3C8 3 4 7 4 12C4 14 5 16 7 17C9 18 11 18 12 17C13 18 15 18 17 17C19 16 20 14 20 12C20 7 16 3 12 3Z",
    "M12 4C9 4 6 6 5 9C4 12 6 15 8 17C10 19 13 20 15 19C17 18 19 15 19 12C19 9 16 4 12 4Z"
  ];

  const leafColors = [
    "rgba(139, 195, 74, 0.7)",
    "rgba(104, 159, 56, 0.6)",
    "rgba(76, 175, 80, 0.5)",
    "rgba(205, 220, 57, 0.6)",
    "rgba(174, 213, 129, 0.5)",
  ];

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
      style={{
        background: 'transparent',
      }}
    >
      {leaves.map((leaf) => (
        <motion.div
          key={leaf.id}
          className="absolute top-0 pointer-events-none"
          style={{
            left: `${leaf.x}%`,
            width: `${leaf.size}px`,
            height: `${leaf.size}px`,
          }}
          initial={{
            y: -100,
            x: 0,
            rotate: leaf.rotation,
            opacity: 0,
          }}
          animate={{
            y: `calc(100vh + 100px)`,
            x: [0, leaf.sway, -leaf.sway/2, leaf.sway, 0],
            rotate: leaf.rotation + 360,
            opacity: [0, leaf.opacity, leaf.opacity * 0.8, 0],
          }}
          transition={{
            duration: leaf.duration,
            delay: leaf.delay,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
            times: [0, 0.3, 0.7, 1],
          }}
        >
          <svg
            viewBox="0 0 24 24"
            className="w-full h-full"
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
            }}
          >
            <path
              d={leafPaths[leaf.type]}
              fill={leafColors[leaf.id % leafColors.length]}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="0.5"
            />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

export default LeafAnimation;