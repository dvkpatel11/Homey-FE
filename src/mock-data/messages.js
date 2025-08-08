// Chat & Message Mock Data (matching API spec)

export const messages = [
  {
    id: 'message-1',
    household_id: 'household-abc123',
    user_id: 'user-456',
    user_name: 'Jane Smith',
    user_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    content: 'Hey everyone! Just completed the kitchen cleaning 🧽',
    message_type: 'text',
    replied_to: null,
    edited_at: null,
    created_at: '2024-02-10T15:30:00Z'
  },
  {
    id: 'message-2',
    household_id: 'household-abc123',
    user_id: 'user-123',
    user_name: 'John Doe',
    user_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    content: 'Thanks Jane! It looks amazing 👍',
    message_type: 'text',
    replied_to: 'message-1',
    edited_at: null,
    created_at: '2024-02-10T15:45:00Z'
  },
  {
    id: 'message-3',
    household_id: 'household-abc123',
    user_id: 'user-789',
    user_name: 'Mike Johnson',
    user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    content: 'What should we have for dinner tonight?',
    message_type: 'poll',
    replied_to: null,
    edited_at: null,
    poll: {
      id: 'poll-1',
      question: 'What should we have for dinner tonight?',
      options: ['Pizza', 'Chinese takeout', 'Cook at home'],
      multiple_choice: false,
      expires_at: '2024-02-11T20:00:00Z',
      votes: [
        {
          user_id: 'user-456',
          user_name: 'Jane Smith',
          user_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
          selected_options: [0],
          voted_at: '2024-02-10T16:15:00Z'
        },
        {
          user_id: 'user-123',
          user_name: 'John Doe',
          user_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
          selected_options: [2],
          voted_at: '2024-02-10T16:30:00Z'
        }
      ],
      vote_counts: [1, 0, 1],
      total_votes: 2
    },
    created_at: '2024-02-10T16:00:00Z'
  }
];
