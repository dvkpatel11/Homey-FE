import GlassHeading from "./GlassHeading.jsx";
import GlassText from "./GlassText.jsx";

const GlassSection = ({ children, title, subtitle, action, className = "", ...props }) => {
  return (
    <div className={`space-y-4 ${className}`} {...props}>
      {(title || subtitle || action) && (
        <div className="flex items-center justify-between">
          <div>
            {title && <GlassHeading level={3}>{title}</GlassHeading>}
            {subtitle && (
              <GlassText variant="secondary" className="mt-1">
                {subtitle}
              </GlassText>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default GlassSection;
