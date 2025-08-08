import { apiClient, buildQuery } from './client.js';

export const chatApi = {
  // GET /api/households/:id/messages - Get chat history (paginated)
  getMessages: (householdId, params = {}) => {
    const query = buildQuery(params);
    return apiClient.get(`/api/households/${householdId}/messages${query ? `?${query}` : ''}`);
  },
  
  // POST /api/households/:id/messages - Send message
  sendMessage: (householdId, data) => {
    return apiClient.post(`/api/households/${householdId}/messages`, data);
  },
  
  // PUT /api/messages/:id - Edit message
  editMessage: (id, data) => {
    return apiClient.put(`/api/messages/${id}`, data);
  },
  
  // DELETE /api/messages/:id - Delete message
  deleteMessage: (id) => {
    return apiClient.delete(`/api/messages/${id}`);
  },
  
  // POST /api/messages/:id/poll - Create poll in message
  createPoll: (messageId, pollData) => {
    return apiClient.post(`/api/messages/${messageId}/poll`, pollData);
  },
  
  // POST /api/polls/:id/vote - Vote on poll
  votePoll: (pollId, data) => {
    return apiClient.post(`/api/polls/${pollId}/vote`, data);
  },
  
  // GET /api/polls/:id/results - Get poll results
  getPollResults: (pollId) => {
    return apiClient.get(`/api/polls/${pollId}/results`);
  }
};
