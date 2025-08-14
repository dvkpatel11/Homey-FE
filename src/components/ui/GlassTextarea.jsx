import { motion } from "framer-motion";
import { X } from "lucide-react";
import { forwardRef } from "react";

const GlassTextarea = forwardRef(
  (
    {
      label,
      placeholder,
      error,
      className = "",
      containerClassName = "",
      rows = 4,
      disabled = false,
      required = false,
      ...props
    },
    ref
  ) => {
    return (
      <div className={`space-y-2 ${containerClassName}`}>
        {label && (
          <label className="block text-sm font-medium text-glass-secondary">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          rows={rows}
          className={`
            glass-input w-full px-4 py-3 rounded-glass resize-none
            text-glass placeholder:text-glass-muted
            transition-all duration-300
            ${error ? "border-red-400/50 focus:border-red-400" : ""}
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            ${className}
          `}
          placeholder={placeholder}
          disabled={disabled}
          {...props}
        />

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs flex items-center space-x-1 text-red-400"
          >
            <X className="w-3 h-3" />
            <span>{error}</span>
          </motion.div>
        )}
      </div>
    );
  }
);

GlassTextarea.displayName = "GlassTextarea";
export default GlassTextarea;
