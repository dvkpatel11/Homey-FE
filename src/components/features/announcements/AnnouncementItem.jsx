import { Send, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext.jsx";
import { useTheme } from "../../../contexts/ThemeContext.jsx";
import GlassButton from "../../ui/GlassButton.jsx";
import GlassCard from "../../ui/GlassCard.jsx";
const AnnouncementItem = ({ announcement, onVote, onAddComment }) => {
  const { isDarkMode, themeClasses } = useTheme();
  const { currentUser } = useAuth();
  const [comment, setComment] = useState("");

  const handleAddComment = () => {
    if (comment.trim()) {
      onAddComment(announcement.id, {
        author: currentUser?.name || "Anonymous",
        content: comment,
      });
      setComment("");
    }
  };

  return (
    <GlassCard className="p-8">
      <div className="flex items-start space-x-4">
        <div
          className={`w-12 h-12 bg-gradient-to-br ${isDarkMode ? "from-indigo-400 to-purple-500" : "from-indigo-500 to-purple-600"} rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}
        >
          <User className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-4">
            <h3 className={`font-medium text-lg ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              {announcement.author}
            </h3>
            <span
              className={`text-sm ${isDarkMode ? "bg-gray-700/60 text-gray-200" : "bg-gray-200/50 text-gray-500"} px-3 py-1 rounded-full font-light backdrop-blur-lg`}
            >
              {announcement.timestamp}
            </span>
          </div>

          <p className={`${isDarkMode ? "text-gray-200" : "text-gray-700"} mb-6 text-lg leading-relaxed font-light`}>
            {announcement.content}
          </p>

          {announcement.type === "poll" && (
            <div className={`${themeClasses.cardGlass} rounded-2xl p-6 mb-6`}>
              <div className="grid grid-cols-2 gap-4">
                <GlassButton variant="success" onClick={() => onVote(announcement.id, "yes")} className="py-3">
                  Yes ({announcement.votes.yes})
                </GlassButton>
                <GlassButton variant="danger" onClick={() => onVote(announcement.id, "no")} className="py-3">
                  No ({announcement.votes.no})
                </GlassButton>
              </div>
            </div>
          )}

          {announcement.comments && announcement.comments.length > 0 && (
            <div className="space-y-3 mb-6">
              {announcement.comments.map((comment, commentIndex) => (
                <div key={commentIndex} className={`${themeClasses.cardGlass} rounded-2xl p-4`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`font-medium text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {comment.author}
                    </span>
                    <span className={`text-xs ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}>
                      {comment.timestamp}
                    </span>
                  </div>
                  <p className={`${isDarkMode ? "text-gray-200" : "text-gray-700"} font-light`}>{comment.content}</p>
                </div>
              ))}
            </div>
          )}

          <div className={`${themeClasses.inputGlass} rounded-2xl p-4 flex items-center space-x-3`}>
            <input
              type="text"
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
              className={`flex-1 bg-transparent outline-none ${isDarkMode ? "text-white placeholder-gray-400" : "text-gray-900 placeholder-gray-500"} font-light`}
            />
            <button
              onClick={handleAddComment}
              className={`p-2 bg-gradient-to-r ${isDarkMode ? "from-slate-500 to-gray-600" : "from-slate-600 to-gray-700"} rounded-xl text-white hover:scale-110 transition-all duration-300 shadow-lg`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default AnnouncementItem;
