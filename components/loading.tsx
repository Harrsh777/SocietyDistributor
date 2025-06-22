"use client";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    if (!isVisible) return;

    const sequence = async () => {
      await animate(count, 100, { duration: 4 });
      setIsVisible(false);
    };

    sequence();
  }, [count, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-white">
      {/* Enhanced Animated Gradient Background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-navy-900"
      >
        {/* Dynamic Wave Animation */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 0.15 }}
          transition={{ duration: 2, delay: 0.3 }}
          className="absolute bottom-0 h-40 w-full bg-gradient-to-t from-blue-600/30 to-transparent"
          style={{
            clipPath: "polygon(0% 100%, 100% 100%, 100% 30%, 0% 50%)",
          }}
        />
        
        {/* More Professional Particle System */}
        {[...Array(40)].map((_, i) => {
          const randomX = Math.random() * 100;
          const randomY = Math.random() * 100;
          const size = Math.random() * 3 + 1;
          return (
            <motion.div
              key={i}
              initial={{
                opacity: 0,
                x: randomX - 50,
                y: randomY - 50,
              }}
              animate={{
                opacity: [0, 0.4, 0],
                x: randomX + (Math.random() * 40 - 20),
                y: randomY + (Math.random() * 40 - 20),
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                repeatType: "loop",
                delay: Math.random() * 2,
              }}
              className={`absolute rounded-full ${
                i % 4 === 0
                  ? "bg-orange-400"
                  : i % 3 === 0
                  ? "bg-red-400"
                  : i % 2 === 0
                  ? "bg-blue-300"
                  : "bg-white"
              }`}
              style={{
                left: `${randomX}%`,
                top: `${randomY}%`,
                width: `${size}px`,
                height: `${size}px`,
                filter: "blur(0.5px)",
              }}
            />
          );
        })}

        {/* Floating Shapes with More Refined Animation */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.8 }}
          animate={{ opacity: 0.08, y: -40, scale: 1 }}
          transition={{
            duration: 12,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          className="absolute left-1/4 top-1/3 h-40 w-40 rounded-full bg-gradient-to-r from-orange-500/70 to-red-500/70 blur-[60px]"
        />
        <motion.div
          initial={{ opacity: 0, x: -40, scale: 0.8 }}
          animate={{ opacity: 0.08, x: 40, scale: 1 }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 0.8,
            ease: "easeInOut",
          }}
          className="absolute right-1/4 bottom-1/3 h-48 w-48 rounded-full bg-gradient-to-r from-blue-500/70 to-navy-700/70 blur-[60px]"
        />
      </motion.div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Enhanced Logo Animation - Fixed to use two keyframes */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.5,
            type: "spring",
            bounce: 0.4,
          }}
          className="flex text-6xl font-bold md:text-8xl"
        >
          <motion.span 
            className="text-blue-600"
            animate={{ 
              textShadow: "0 0 10px rgba(37, 99, 235, 0.5)",
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              repeatDelay: 1.5
            }}
          >
            S
          </motion.span>
          <motion.span 
            className="text-orange-500"
            animate={{ 
              textShadow: "0 0 10px rgba(249, 115, 22, 0.5)",
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              repeatDelay: 1.5,
              delay: 0.2
            }}
          >
            D
          </motion.span>
          <motion.span 
            className="bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent"
            animate={{ 
              textShadow: "0 0 10px rgba(156, 163, 175, 0.5)",
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              repeatDelay: 1.5,
              delay: 0.4
            }}
          >
            P
          </motion.span>
          <motion.span 
            className="text-red-500"
            animate={{ 
              textShadow: "0 0 10px rgba(239, 68, 68, 0.5)",
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              repeatDelay: 1.5,
              delay: 0.6
            }}
          >
            L
          </motion.span>
        </motion.div>

        {/* Sleek Loading Bar */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "100%", opacity: 1 }}
          transition={{ duration: 2, delay: 1 }}
          className="mt-8 h-1.5 w-64 overflow-hidden rounded-full bg-navy-600/20 backdrop-blur-sm md:w-80"
        >
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            transition={{ duration: 3, delay: 1, ease: "easeInOut" }}
            className="h-full w-full bg-gradient-to-r from-blue-600 via-orange-500 to-red-500"
          />
        </motion.div>

        {/* Minimal Counter */}
        <motion.p 
          className="mt-4 text-sm font-medium text-white/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <motion.span>{rounded}</motion.span>%
        </motion.p>
      </div>
    </div>
  );
}