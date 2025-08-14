import { useTheme } from "../../contexts/ThemeContext.jsx";

const GlassCard = ({ children, className = "", hover = true, variant = "default", ...props }) => {
  const { isDark, reducedMotion } = useTheme();

  const variants = {
    default: "glass-card",
    subtle: "glass-card-subtle",
    strong: "glass-card-strong",
    violet: "glass-card-violet",
  };

  const hoverClass = hover && !reducedMotion ? "glass-card-hover" : "";

  return (
    <div className={`${variants[variant]} ${hoverClass} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default GlassCard;
