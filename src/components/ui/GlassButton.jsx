import { motion } from "framer-motion";
import { forwardRef } from "react";

const GlassButton = forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      icon: Icon,
      rightIcon: RightIcon,
      loading = false,
      disabled = false,
      className = "",
      ...props
    },
    ref
  ) => {
    const variants = {
      primary: "glass-button text-white",
      secondary: "glass-input hover:bg-surface-2 text-glass border-glass-border",
      ghost: "hover:bg-surface-1 text-glass-secondary hover:text-glass",
      danger: "bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/30",
    };

    const sizes = {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-3 text-sm",
      lg: "px-6 py-4 text-base",
      xl: "px-8 py-5 text-lg",
    };

    return (
      <motion.button
        ref={ref}
        className={`
          inline-flex items-center justify-center space-x-2 rounded-glass font-medium
          transition-all duration-300 relative overflow-hidden
          ${variants[variant]} ${sizes[size]}
          ${disabled || loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}
          ${className}
        `}
        disabled={disabled || loading}
        whileTap={!disabled && !loading ? { scale: 0.95 } : {}}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <div className={`flex items-center space-x-2 ${loading ? "opacity-0" : ""}`}>
          {Icon && <Icon className="w-4 h-4" />}
          <span>{children}</span>
          {RightIcon && <RightIcon className="w-4 h-4" />}
        </div>
      </motion.button>
    );
  }
);

export default GlassButton;
