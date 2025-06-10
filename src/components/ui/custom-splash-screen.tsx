"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane,
  MapPin,
  Camera,
  Compass,
  Car,
  Calendar,
  Map,
  Train,
  Backpack,
  Mountain,
  Globe,
  Palmtree,
  Ticket,
  Navigation,
  Sun,
} from "lucide-react";

interface CustomSplashScreenProps {
  onFinish: () => void;
}

const CustomSplashScreen = ({ onFinish }: CustomSplashScreenProps) => {
  const [showSplash, setShowSplash] = useState(true);
  const [currentPhase, setCurrentPhase] = useState(0);

  // Travel-themed icons that will float around
  const travelIcons = [
    { Icon: Plane, color: "text-blue-200", size: 28 },
    { Icon: MapPin, color: "text-red-300", size: 24 },
    { Icon: Camera, color: "text-yellow-200", size: 26 },
    { Icon: Compass, color: "text-green-200", size: 25 },
    { Icon: Car, color: "text-orange-200", size: 27 },
    { Icon: Calendar, color: "text-pink-200", size: 23 },
    { Icon: Map, color: "text-cyan-200", size: 29 },
    { Icon: Train, color: "text-indigo-200", size: 26 },
    { Icon: Backpack, color: "text-emerald-200", size: 25 },
    { Icon: Mountain, color: "text-slate-200", size: 28 },
    { Icon: Globe, color: "text-blue-300", size: 30 },
    { Icon: Palmtree, color: "text-green-300", size: 27 },
    { Icon: Ticket, color: "text-amber-200", size: 24 },
    { Icon: Navigation, color: "text-violet-200", size: 25 },
    { Icon: Sun, color: "text-yellow-300", size: 26 },
  ];

  useEffect(() => {
    const phases = [
      { duration: 800, phase: 0 }, // Logo appear
      { duration: 1200, phase: 1 }, // Icons float in
      { duration: 1500, phase: 2 }, // Tagline appear
      { duration: 1000, phase: 3 }, // Pulse animation
      { duration: 600, phase: 4 }, // Fade out
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
      {/* Enhanced background with travel-themed patterns */}
      <div className="absolute inset-0">
        {/* Floating travel particles */}
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            initial={{
              x:
                Math.random() *
                (typeof window !== "undefined" ? window.innerWidth : 1000),
              y: typeof window !== "undefined" ? window.innerHeight + 20 : 800,
              scale: 0,
            }}
            animate={{
              y: -100,
              scale: [0, 1, 0],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 5,
              ease: "linear",
            }}
          />
        ))}

        {/* Larger floating shapes */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`shape-${i}`}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            initial={{
              x:
                Math.random() *
                (typeof window !== "undefined" ? window.innerWidth : 1000),
              y:
                Math.random() *
                (typeof window !== "undefined" ? window.innerHeight : 800),
              scale: 0,
            }}
            animate={{
              x: [
                null,
                Math.random() *
                  (typeof window !== "undefined" ? window.innerWidth : 1000),
              ],
              y: [
                null,
                Math.random() *
                  (typeof window !== "undefined" ? window.innerHeight : 800),
              ],
              scale: [0, 1, 0],
              opacity: [0, 0.4, 0],
            }}
            transition={{
              duration: 12 + Math.random() * 6,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 3,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Main content container */}
      <div className="relative flex flex-col items-center justify-center px-8">
        {/* TripFusion Logo */}
        <motion.div
          className="text-center mb-8"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: currentPhase >= 0 ? 1 : 0,
            opacity: currentPhase >= 0 ? 1 : 0,
          }}
          transition={{
            duration: 0.8,
            ease: "backOut",
            type: "spring",
            stiffness: 100,
          }}
        >
          <motion.h1
            className="text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-white via-blue-100 to-orange-200 bg-clip-text text-transparent mb-2"
            animate={{
              textShadow:
                currentPhase >= 3
                  ? [
                      "0 0 20px rgba(255,255,255,0.5)",
                      "0 0 30px rgba(255,255,255,0.8)",
                      "0 0 20px rgba(255,255,255,0.5)",
                    ]
                  : "0 0 20px rgba(255,255,255,0.5)",
            }}
            transition={{
              textShadow: {
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              },
            }}
          >
            Trip<span className="text-orange-300">Fusion</span>
          </motion.h1>

          <motion.div
            className="w-32 h-1 bg-gradient-to-r from-orange-400 to-pink-400 mx-auto rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: currentPhase >= 0 ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </motion.div>

        {/* Floating Travel Icons */}
        <div className="absolute inset-0 pointer-events-none">
          {travelIcons.map(({ Icon, color, size }, i) => {
            const angle = (i * 360) / travelIcons.length;
            const radius = 200 + (i % 3) * 50;
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;

            return (
              <motion.div
                key={i}
                className={`absolute ${color} drop-shadow-lg`}
                style={{
                  left: "50%",
                  top: "50%",
                }}
                initial={{
                  x: 0,
                  y: 0,
                  scale: 0,
                  opacity: 0,
                  rotate: 0,
                }}
                animate={{
                  x: currentPhase >= 1 ? x : 0,
                  y: currentPhase >= 1 ? y : 0,
                  scale: currentPhase >= 1 ? [0, 1.2, 1] : 0,
                  opacity: currentPhase >= 1 ? [0, 1, 0.8] : 0,
                  rotate: currentPhase >= 3 ? [0, 360] : 0,
                }}
                transition={{
                  x: { duration: 1.2, delay: i * 0.1, ease: "backOut" },
                  y: { duration: 1.2, delay: i * 0.1, ease: "backOut" },
                  scale: { duration: 0.6, delay: i * 0.1 + 0.5 },
                  opacity: { duration: 0.8, delay: i * 0.1 + 0.3 },
                  rotate: {
                    duration: 8,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                    delay: i * 0.2,
                  },
                }}
              >
                <motion.div
                  animate={{
                    y: currentPhase >= 1 ? [0, -10, 0] : 0,
                  }}
                  transition={{
                    duration: 3 + (i % 3),
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: i * 0.3,
                  }}
                >
                  <Icon size={size} />
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Central Compass/Navigation Hub */}
        <motion.div
          className="relative mb-12"
          initial={{ scale: 0, rotate: 0 }}
          animate={{
            scale: currentPhase >= 0 ? 1 : 0,
            rotate: currentPhase >= 1 ? [0, 360] : 0,
          }}
          transition={{
            scale: { duration: 1, ease: "backOut", delay: 0.2 },
            rotate: {
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            },
          }}
        >
          <div className="w-20 h-20 bg-gradient-to-br from-white/90 to-white/60 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-sm border border-white/30">
            <Compass size={36} className="text-purple-600" />
          </div>

          {/* Outer ring */}
          <motion.div
            className="absolute -inset-4 border-2 border-white/40 rounded-full"
            animate={{
              scale: currentPhase >= 1 ? [1, 1.1, 1] : 1,
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* Tagline */}
        <AnimatePresence>
          {currentPhase >= 2 && (
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <p className="text-xl md:text-2xl text-white/90 font-light tracking-wide">
                Fuse Your Adventures Into One Journey
              </p>
              <motion.p
                className="text-sm md:text-base text-white/70 mt-2 font-light"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                Discover • Plan • Experience • Remember
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Progress Indicator */}
        <motion.div
          className="absolute bottom-16 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: currentPhase < 4 ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center space-x-3">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="flex flex-col items-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
              >
                <motion.div
                  className={`w-3 h-3 rounded-full border-2 border-white/60 ${
                    currentPhase >= i ? "bg-white" : "bg-transparent"
                  }`}
                  animate={{
                    scale: currentPhase === i ? [1, 1.3, 1] : 1,
                    borderColor:
                      currentPhase >= i ? "#ffffff" : "rgba(255,255,255,0.6)",
                  }}
                  transition={{
                    scale: { duration: 0.6, repeat: Number.POSITIVE_INFINITY },
                    borderColor: { duration: 0.3 },
                  }}
                />
                {i === currentPhase && (
                  <motion.div
                    className="mt-2 text-xs text-white/80 font-medium"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                  >
                    {
                      [
                        "Starting",
                        "Loading",
                        "Preparing",
                        "Almost Ready",
                        "Launch",
                      ][i]
                    }
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Exit Animation */}
      <AnimatePresence>
        {currentPhase >= 4 && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-white via-purple-50 to-white"
            initial={{
              scale: 0,
              borderRadius: "50%",
              x: "50%",
              y: "50%",
            }}
            animate={{
              scale: 4,
              borderRadius: "0%",
              x: "0%",
              y: "0%",
            }}
            transition={{
              duration: 0.8,
              ease: [0.76, 0, 0.24, 1], // Custom cubic-bezier for smooth exit
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSplashScreen;
