import AnnouncementItem from "./AnnouncementItem";

const AnnouncementList = ({ announcements, onVote, onAddComment }) => {
  if (announcements.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No announcements yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {announcements.map((announcement, index) => (
        <div key={announcement.id} className="animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
          <AnnouncementItem announcement={announcement} onVote={onVote} onAddComment={onAddComment} />
        </div>
      ))}
    </div>
  );
};

export default AnnouncementList;
