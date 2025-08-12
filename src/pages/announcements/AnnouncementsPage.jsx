import { useState } from "react";
import AnnouncementList from "../../components/features/announcements/AnnouncementList.jsx";
import FloatingActionButton from "../../components/ui/FloatingActionButton.jsx";
import GlassButton from "../../components/ui/GlassButton.jsx";
import GlassModal from "../../components/ui/GlassModal.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
const AnnouncementsPage = () => {
  const announcements = [
    { id: 1, title: "Meeting at 7 PM", comments: [], votes: 0 },
    { id: 2, title: "Grocery run tomorrow", comments: [], votes: 0 },
  ];

  const addAnnouncement = (announcement) => {
    console.log("Adding announcement:", announcement);
    // Mock behavior here — update announcements array if needed
  };

  const addComment = (announcementId, comment) => {
    console.log(`Adding comment to announcement ${announcementId}:`, comment);
    // Mock behavior here
  };

  const vote = (announcementId) => {
    console.log(`Voting on announcement ${announcementId}`);
    // Mock behavior here
  };
  const { currentUser } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    content: "",
    type: "text",
  });

  const handleAddAnnouncement = () => {
    if (newAnnouncement.content) {
      addAnnouncement({
        ...newAnnouncement,
        author: currentUser?.name || "Anonymous",
      });
      setNewAnnouncement({
        content: "",
        type: "text",
      });
      setShowAddModal(false);
    }
  };

  return (
    <div className="space-y-6">
      <AnnouncementList announcements={announcements} onVote={vote} onAddComment={addComment} />

      <FloatingActionButton onClick={() => setShowAddModal(true)} color="from-indigo-500 to-purple-600" />

      <GlassModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Announcement"
        footer={
          <GlassButton onClick={handleAddAnnouncement} className="w-full">
            Create Announcement
          </GlassButton>
        }
      >
        <textarea
          placeholder="What's on your mind?"
          value={newAnnouncement.content}
          onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
          className="w-full p-4 bg-gradient-to-br from-white/[0.06] to-white/[0.03] backdrop-blur-xl border border-white/[0.15] rounded-2xl outline-none h-32 text-white placeholder-gray-400 font-light resize-none"
        />

        <div className="flex space-x-6">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="postType"
              value="text"
              checked={newAnnouncement.type === "text"}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, type: e.target.value })}
              className="w-5 h-5 text-blue-500"
            />
            <span className="text-gray-200 font-light">Text Post</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="postType"
              value="poll"
              checked={newAnnouncement.type === "poll"}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, type: e.target.value })}
              className="w-5 h-5 text-blue-500"
            />
            <span className="text-gray-200 font-light">Poll</span>
          </label>
        </div>
      </GlassModal>
    </div>
  );
};

export default AnnouncementsPage;
