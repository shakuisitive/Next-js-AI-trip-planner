'use client';
import { motion } from 'framer-motion';

const LoadingAnimation = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <div className="relative flex flex-col items-center justify-center">
        {/* Central pulsing orb */}
        <motion.div
          className="relative"
          animate={{
            scale: [1, 1.2, 1],
            rotate: 360,
          }}
          transition={{
            scale: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            },
            rotate: {
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            },
          }}
        >
          {/* Outer ring */}
          <motion.div
            className="w-24 h-24 rounded-full border-4 border-white/30"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, ease: "backOut" }}
          />

          {/* Middle ring */}
          <motion.div
            className="absolute inset-3 rounded-full border-2 border-white/50"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "backOut" }}
          />

          {/* Inner core */}
          <motion.div
            className="absolute inset-6 rounded-full bg-white/80 shadow-lg"
            initial={{ scale: 0 }}
            animate={{
              scale: 1,
              boxShadow: [
                "0 0 20px rgba(255,255,255,0.5)",
                "0 0 40px rgba(255,255,255,0.8)",
                "0 0 20px rgba(255,255,255,0.5)",
              ],
            }}
            transition={{
              scale: { duration: 0.8, delay: 0.4, ease: "backOut" },
              boxShadow: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
          />
        </motion.div>

        {/* Loading text */}
        <motion.div
          className="mt-8 text-white font-medium text-lg tracking-wider"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          Loading...
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
