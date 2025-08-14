import { motion } from "framer-motion";
import { forwardRef } from "react";

const IconButton = forwardRef(
  ({ icon: Icon, size = "md", variant = "ghost", className = "", ...props }, ref) => {
    const sizes = {
      sm: "p-2",
      md: "p-3",
      lg: "p-4",
    };

    const variants = {
      ghost: "hover:bg-surface-1 text-glass-secondary hover:text-glass",
      primary: "glass-button text-white",
      danger: "hover:bg-red-500/20 text-red-400",
    };

    return (
      <motion.button
        ref={ref}
        className={`
          rounded-glass transition-all duration-300
          ${variants[variant]} ${sizes[size]} ${className}
        `}
        whileTap={{ scale: 0.95 }}
        {...props}
      >
        <Icon className="w-4 h-4" />
      </motion.button>
    );
  }
);

IconButton.displayName = "IconButton";
export default IconButton;
