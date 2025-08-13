import client from './client.js';

export const chatAPI = {
  // Get chat messages (paginated)
  async getMessages(householdId, options = {}) {
    const params = new URLSearchParams();
    
    if (options.page) params.append('page', options.page);
    if (options.limit) params.append('limit', options.limit);
    if (options.before) params.append('before', options.before);
    if (options.after) params.append('after', options.after);
    
    const queryString = params.toString();
    const url = queryString 
      ? `/api/households/${householdId}/messages?${queryString}`
      : `/api/households/${householdId}/messages`;
      
    const response = await client.get(url);
    return response.data;
  },

  // Send new message
  async createMessage(householdId, data) {
    const response = await client.post(`/api/households/${householdId}/messages`, data);
    return response.data;
  },

  // Edit message
  async updateMessage(messageId, data) {
    const response = await client.put(`/api/messages/${messageId}`, data);
    return response.data;
  },

  // Delete message
  async deleteMessage(messageId) {
    const response = await client.delete(`/api/messages/${messageId}`);
    return response.data;
  },

  // Vote on poll
  async votePoll(pollId, selectedOptions) {
    const response = await client.post(`/api/polls/${pollId}/vote`, {
      selected_options: selectedOptions,
    });
    return response.data;
  },

  // Get poll results
  async getPollResults(pollId) {
    const response = await client.get(`/api/polls/${pollId}/results`);
    return response.data;
  },

  // Upload file/attachment
  async uploadFile(householdId, file, messageData = {}) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('message_data', JSON.stringify(messageData));
    
    const response = await client.post(
      `/api/households/${householdId}/messages/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Search messages
  async searchMessages(householdId, query, options = {}) {
    const params = new URLSearchParams({
      q: query,
      ...options,
    });
    
    const response = await client.get(
      `/api/households/${householdId}/messages/search?${params.toString()}`
    );
    return response.data;
  },

  // Get message thread (replies)
  async getMessageThread(messageId) {
    const response = await client.get(`/api/messages/${messageId}/thread`);
    return response.data;
  },

  // React to message
  async reactToMessage(messageId, reaction) {
    const response = await client.post(`/api/messages/${messageId}/react`, {
      reaction,
    });
    return response.data;
  },

  // Remove reaction
  async removeReaction(messageId, reaction) {
    const response = await client.delete(`/api/messages/${messageId}/react`, {
      data: { reaction },
    });
    return response.data;
  },
};

export default chatAPI;
