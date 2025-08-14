import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Check, Clock, Eye, EyeOff, Hash, Mail, Phone, Search, X } from "lucide-react";
import { forwardRef, useState } from "react";

const GlassInput = forwardRef(
  (
    {
      type = "text",
      label,
      placeholder,
      error,
      success,
      icon: Icon,
      rightIcon: RightIcon,
      className = "",
      containerClassName = "",
      onRightIconClick,
      disabled = false,
      required = false,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [focused, setFocused] = useState(false);

    const inputType = type === "password" && showPassword ? "text" : type;

    const getInputIcon = () => {
      if (Icon) return Icon;
      switch (type) {
        case "email": return Mail;
        case "password": return Eye;
        case "search": return Search;
        case "tel": return Phone;
        case "number": return Hash;
        case "date": return Calendar;
        case "time": return Clock;
        default: return null;
      }
    };

    const InputIcon = getInputIcon();
    const showPasswordToggle = type === "password";

    return (
      <div className={`space-y-2 ${containerClassName}`}>
        {label && (
          <label className="block text-sm font-medium text-glass-secondary">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            className={`
              glass-input w-full px-4 py-3 rounded-glass
              ${InputIcon ? "pl-11" : ""}
              ${RightIcon || showPasswordToggle ? "pr-11" : ""}
              text-glass placeholder:text-glass-muted
              transition-all duration-300
              ${focused ? "ring-2 ring-primary/20" : ""}
              ${error ? "border-red-400/50 focus:border-red-400" : ""}
              ${success ? "border-emerald-400/50 focus:border-emerald-400" : ""}
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
              ${className}
            `}
            placeholder={placeholder}
            disabled={disabled}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            {...props}
          />

          {InputIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <InputIcon className="w-5 h-5 text-glass-muted" />
            </div>
          )}

          {(RightIcon || showPasswordToggle) && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-surface-1 transition-colors"
              onClick={showPasswordToggle ? () => setShowPassword(!showPassword) : onRightIconClick}
            >
              {showPasswordToggle ? (
                showPassword ? (
                  <EyeOff className="w-4 h-4 text-glass-muted" />
                ) : (
                  <Eye className="w-4 h-4 text-glass-muted" />
                )
              ) : (
                <RightIcon className="w-4 h-4 text-glass-muted" />
              )}
            </button>
          )}
        </div>

        <AnimatePresence>
          {(error || success) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`text-xs flex items-center space-x-1 ${error ? "text-red-400" : "text-emerald-400"}`}
            >
              {error ? <X className="w-3 h-3" /> : <Check className="w-3 h-3" />}
              <span>{error || success}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

GlassInput.displayName = "GlassInput";
export default GlassInput;
