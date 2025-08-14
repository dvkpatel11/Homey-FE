import { motion } from "framer-motion";

const GlassContainer = ({ children, variant = "default", padding = "md", className = "", ...props }) => {
  const variants = {
    default: "glass-card",
    subtle: "glass-card glass-card-subtle",
    strong: "glass-card glass-card-strong",
    violet: "glass-card glass-card-violet",
  };

  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
    xl: "p-10",
  };

  return (
    <motion.div
      className={`${variants[variant]} ${paddings[padding]} rounded-glass ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassContainer;
