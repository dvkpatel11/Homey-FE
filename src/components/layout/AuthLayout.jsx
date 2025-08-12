import FloatingElements from "./FloatingElements.jsx";

const AuthLayout = ({ children }) => {
  const { themeClasses } = useTheme();

  return (
    <div
      className={`min-h-screen ${themeClasses.bgClasses} flex items-center justify-center p-6 relative overflow-hidden`}
    >
      <FloatingElements />
      {children}
    </div>
  );
};

export default AuthLayout;
