const GlassText = ({ variant = "default", children, className = "", ...props }) => {
  const variants = {
    default: "text-glass",
    secondary: "text-glass-secondary",
    muted: "text-glass-muted",
  };

  return (
    <p className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </p>
  );
};

export default GlassText;
