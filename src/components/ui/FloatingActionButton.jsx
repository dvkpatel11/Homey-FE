import { Plus } from "lucide-react";

const FloatingActionButton = ({ onClick, color = "from-slate-500 to-gray-600", icon: Icon = Plus }) => {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-32 right-6 w-16 h-16 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 z-30 hover:shadow-lg`}
    >
      <Icon className="w-8 h-8 text-white" />
    </button>
  );
};

export default FloatingActionButton;
