import { ArrowLeft } from "lucide-react";
import { useTheme } from 'contexts/ThemeContext';
import GlassCard from "./GlassCard"; // ← FIXED: Now imports GlassCard

const GlassModal = ({ isOpen, onClose, title, children, footer }) => {
  const { themeClasses } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <GlassCard className="w-full max-w-md transform hover:scale-105">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-light text-gray-900 dark:text-white">{title}</h2>
            <button
              onClick={onClose}
              className={`p-3 ${themeClasses.cardGlass} rounded-xl hover:scale-110 transition-all duration-300 hover:bg-red-500/10`}
            >
              <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <div className="space-y-6">{children}</div>

          {footer && <div className="mt-8">{footer}</div>}
        </div>
      </GlassCard>
    </div>
  );
};

export default GlassModal;
