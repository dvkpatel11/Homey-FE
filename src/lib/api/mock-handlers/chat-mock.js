import * as mockData from 'mock-data/index.js';

export const handleChatMock = async (method, endpoint, data, options) => {
  // GET /api/households/:id/messages - Get chat history
  if (method === "GET" && endpoint.match(/^\/api\/households\/[^\/]+\/messages/)) {
    const householdId = endpoint.split("/")[3];
    return {
      data: mockData.messages.filter((m) => m.household_id === householdId),
      message: "Messages retrieved successfully",
      meta: {
        pagination: {
          page: 1,
          limit: 50,
          total: mockData.messages.length,
          hasMore: false,
        },
      },
    };
  }

  // POST /api/households/:id/messages - Send message
  if (method === "POST" && endpoint.match(/^\/api\/households\/[^\/]+\/messages$/)) {
    const householdId = endpoint.split("/")[3];
    const newMessage = {
      id: `message-${Date.now()}`,
      household_id: householdId,
      user_id: mockData.currentUser.id,
      user_name: mockData.currentUser.full_name,
      user_avatar: mockData.currentUser.avatar_url,
      content: data.content,
      message_type: data.message_type || "text",
      replied_to: data.replied_to || null,
      edited_at: null,
      poll: data.poll
        ? {
            id: `poll-${Date.now()}`,
            question: data.poll.question,
            options: data.poll.options,
            multiple_choice: data.poll.multiple_choice || false,
            expires_at: data.poll.expires_at || null,
            votes: [],
            vote_counts: new Array(data.poll.options.length).fill(0),
            total_votes: 0,
          }
        : undefined,
      created_at: new Date().toISOString(),
    };
    return {
      data: newMessage,
      message: "Message sent successfully",
    };
  }

  // POST /api/polls/:id/vote - Vote on poll
  if (method === "POST" && endpoint.match(/^\/api\/polls\/[^\/]+\/vote$/)) {
    const pollId = endpoint.split("/")[3];
    return {
      data: {
        poll_id: pollId,
        user_id: mockData.currentUser.id,
        selected_options: data.selected_options,
        voted_at: new Date().toISOString(),
        updated_vote_counts: [2, 1, 0], // Mock vote counts
      },
      message: "Vote recorded successfully",
    };
  }

  throw new Error(`Chat mock not implemented: ${method} ${endpoint}`);
};
