const GlassHeading = ({ level = 1, children, className = "", ...props }) => {
  const Component = `h${level}`;
  const sizes = {
    1: "text-3xl font-light",
    2: "text-2xl font-light",
    3: "text-xl font-light",
    4: "text-lg font-medium",
    5: "text-base font-medium",
    6: "text-sm font-medium",
  };

  return (
    <Component className={`text-glass ${sizes[level]} ${className}`} {...props}>
      {children}
    </Component>
  );
};

export default GlassHeading;
