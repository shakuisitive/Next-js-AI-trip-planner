"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CustomSplashScreenProps {
  onFinish: () => void;
}

const CustomSplashScreen = ({ onFinish }: CustomSplashScreenProps) => {
  const [showSplash, setShowSplash] = useState(true);
  const [currentPhase, setCurrentPhase] = useState(0);

  useEffect(() => {
    const phases = [
      { duration: 1000, phase: 0 }, // Initial load
      { duration: 1500, phase: 1 }, // Expand
      { duration: 1000, phase: 2 }, // Pulse
      { duration: 500, phase: 3 }, // Fade out
    ];

    let totalTime = 0;
    phases.forEach((phaseConfig, index) => {
      setTimeout(() => {
        setCurrentPhase(index);
      }, totalTime);
      totalTime += phaseConfig.duration;
    });

    // Finish animation
    setTimeout(() => {
      setShowSplash(false);
      onFinish();
    }, totalTime);
  }, [onFinish]);

  if (!showSplash) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#ba9afc] via-[#a855f7] to-[#9333ea] flex items-center justify-center z-50 overflow-hidden">
      {/* Background animated particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: 0,
            }}
            animate={{
              y: [null, -100],
              scale: [0, 1, 0],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* Main animation container */}
      <div className="relative flex flex-col items-center justify-center">
        {/* Central pulsing orb */}
        <motion.div
          className="relative"
          initial={{ scale: 0, rotate: 0 }}
          animate={{
            scale: currentPhase >= 1 ? [1, 1.2, 1] : 1,
            rotate: currentPhase >= 2 ? 360 : 0,
          }}
          transition={{
            scale: {
              duration: 2,
              repeat: currentPhase >= 1 ? Number.POSITIVE_INFINITY : 0,
              ease: "easeInOut",
            },
            rotate: {
              duration: 3,
              repeat: currentPhase >= 2 ? Number.POSITIVE_INFINITY : 0,
              ease: "linear",
            },
          }}
        >
          {/* Outer ring */}
          <motion.div
            className="w-32 h-32 rounded-full border-4 border-white/30"
            initial={{ scale: 0 }}
            animate={{ scale: currentPhase >= 0 ? 1 : 0 }}
            transition={{ duration: 0.8, ease: "backOut" }}
          />

          {/* Middle ring */}
          <motion.div
            className="absolute inset-4 rounded-full border-2 border-white/50"
            initial={{ scale: 0 }}
            animate={{ scale: currentPhase >= 0 ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "backOut" }}
          />

          {/* Inner core */}
          <motion.div
            className="absolute inset-8 rounded-full bg-white/80 shadow-lg"
            initial={{ scale: 0 }}
            animate={{
              scale: currentPhase >= 0 ? 1 : 0,
              boxShadow:
                currentPhase >= 1
                  ? [
                      "0 0 20px rgba(255,255,255,0.5)",
                      "0 0 40px rgba(255,255,255,0.8)",
                      "0 0 20px rgba(255,255,255,0.5)",
                    ]
                  : "0 0 20px rgba(255,255,255,0.5)",
            }}
            transition={{
              scale: { duration: 0.8, delay: 0.4, ease: "backOut" },
              boxShadow: {
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              },
            }}
          />
        </motion.div>

        {/* Orbiting elements */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-white rounded-full"
            initial={{
              x: 0,
              y: 0,
              scale: 0,
            }}
            animate={{
              x:
                currentPhase >= 1
                  ? Math.cos(((i * 120 + Date.now() * 0.002) * Math.PI) / 180) *
                    80
                  : 0,
              y:
                currentPhase >= 1
                  ? Math.sin(((i * 120 + Date.now() * 0.002) * Math.PI) / 180) *
                    80
                  : 0,
              scale: currentPhase >= 1 ? 1 : 0,
            }}
            transition={{
              duration: 0.1,
              ease: "linear",
            }}
            style={{
              transformOrigin: "center",
            }}
          />
        ))}

        {/* Loading text */}
        <AnimatePresence>
          {currentPhase < 3 && (
            <motion.div
              className="absolute -bottom-20 text-white font-medium text-lg tracking-wider"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                Loading...
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress dots */}
        <div className="absolute -bottom-8 flex space-x-2">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-white rounded-full"
              initial={{ scale: 0.5, opacity: 0.3 }}
              animate={{
                scale: currentPhase >= i ? 1 : 0.5,
                opacity: currentPhase >= i ? 1 : 0.3,
              }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
            />
          ))}
        </div>
      </div>

      {/* Exit animation overlay */}
      <AnimatePresence>
        {currentPhase >= 3 && (
          <motion.div
            className="absolute inset-0 bg-white"
            initial={{ scale: 0, borderRadius: "50%" }}
            animate={{ scale: 3, borderRadius: "0%" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSplashScreen;
