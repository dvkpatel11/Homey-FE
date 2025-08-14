import { motion } from "framer-motion";

const FloatingElements = () => {
  // Different floating elements for variety
  const elements = [
    {
      id: 1,
      size: "w-32 h-32",
      position: "top-1/4 left-1/4",
      gradient: "from-homey-violet-500/10 to-homey-violet-600/5",
      delay: 0,
      duration: 20,
    },
    {
      id: 2,
      size: "w-24 h-24",
      position: "top-3/4 right-1/4",
      gradient: "from-emerald-500/8 to-emerald-600/4",
      delay: 2,
      duration: 25,
    },
    {
      id: 3,
      size: "w-40 h-40",
      position: "bottom-1/3 left-1/6",
      gradient: "from-amber-500/6 to-orange-500/3",
      delay: 4,
      duration: 30,
    },
    {
      id: 4,
      size: "w-20 h-20",
      position: "top-1/2 right-1/3",
      gradient: "from-blue-500/8 to-indigo-500/4",
      delay: 1,
      duration: 22,
    },
    {
      id: 5,
      size: "w-28 h-28",
      position: "bottom-1/4 right-1/6",
      gradient: "from-homey-violet-400/12 to-homey-violet-500/6",
      delay: 3,
      duration: 18,
    },
  ];

  const floatingVariants = {
    animate: {
      y: [-20, 20, -20],
      x: [-10, 10, -10],
      rotate: [0, 180, 360],
      scale: [1, 1.1, 1],
    },
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Primary floating orbs */}
      {elements.map((element) => (
        <motion.div
          key={element.id}
          className={`
            absolute ${element.size} ${element.position}
            bg-gradient-to-br ${element.gradient}
            rounded-full blur-xl opacity-60
          `}
          variants={floatingVariants}
          animate="animate"
          transition={{
            duration: element.duration,
            delay: element.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-homey-violet-500/5 
                   via-transparent to-emerald-500/5"
        animate={{
          background: [
            "linear-gradient(45deg, rgba(139, 92, 246, 0.05) 0%, transparent 50%, rgba(16, 185, 129, 0.05) 100%)",
            "linear-gradient(45deg, rgba(16, 185, 129, 0.05) 0%, transparent 50%, rgba(245, 158, 11, 0.05) 100%)",
            "linear-gradient(45deg, rgba(245, 158, 11, 0.05) 0%, transparent 50%, rgba(139, 92, 246, 0.05) 100%)",
          ],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Subtle particle effect */}
      <div className="absolute inset-0">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-homey-violet-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-100, window.innerHeight + 100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              delay: Math.random() * 5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Edge glow effects */}
      <div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r 
                      from-transparent via-homey-violet-500/30 to-transparent"
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r 
                      from-transparent via-homey-violet-500/30 to-transparent"
      />
    </div>
  );
};

export default FloatingElements;
