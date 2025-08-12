const FloatingElements = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div
        className={`absolute top-20 right-20 w-96 h-96 ${isDarkMode ? "bg-slate-400/[0.08]" : "bg-indigo-400/[0.15]"} rounded-full blur-3xl animate-pulse`}
      />
      <div
        className={`absolute bottom-20 left-20 w-80 h-80 ${isDarkMode ? "bg-zinc-400/[0.08]" : "bg-slate-400/[0.15]"} rounded-full blur-3xl animate-pulse`}
        style={{ animationDelay: "2s" }}
      />
      <div
        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 ${isDarkMode ? "bg-gray-400/[0.06]" : "bg-gray-400/[0.12]"} rounded-full blur-3xl animate-pulse`}
        style={{ animationDelay: "1s" }}
      />
      <div
        className={`absolute top-32 left-1/4 w-64 h-64 ${isDarkMode ? "bg-stone-400/[0.05]" : "bg-zinc-400/[0.1]"} rounded-full blur-3xl animate-pulse`}
        style={{ animationDelay: "3s" }}
      />
      <div
        className={`absolute bottom-32 right-1/4 w-56 h-56 ${isDarkMode ? "bg-neutral-400/[0.05]" : "bg-stone-400/[0.1]"} rounded-full blur-3xl animate-pulse`}
        style={{ animationDelay: "4s" }}
      />

      {/* Additional depth layers */}
      <div
        className={`absolute top-10 left-10 w-40 h-40 ${isDarkMode ? "bg-gray-300/[0.03]" : "bg-slate-300/[0.08]"} rounded-full blur-2xl animate-pulse`}
        style={{ animationDelay: "5s" }}
      />
      <div
        className={`absolute bottom-10 right-10 w-48 h-48 ${isDarkMode ? "bg-zinc-300/[0.03]" : "bg-gray-300/[0.08]"} rounded-full blur-2xl animate-pulse`}
        style={{ animationDelay: "6s" }}
      />
    </div>
  );
};

export default FloatingElements;
