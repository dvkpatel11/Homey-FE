// In chat-mock.js, replace the entire file with this structure:
export const chatMock = {
  async getMessages({ params, query }) {
    const householdId = params.id;
    // Your existing logic for getting messages
    return {
      data: [], // Your message data
      message: "Messages retrieved successfully",
    };
  },

  async createMessage({ params, data }) {
    const householdId = params.id;
    // Your existing logic for creating messages
    return {
      data: {}, // Your new message data
      message: "Message sent successfully",
    };
  },

  // Add other methods: updateMessage, deleteMessage, votePoll, getPollResults
};

export default chatMock;
