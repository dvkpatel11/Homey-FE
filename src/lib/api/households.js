import { apiClient, buildQuery } from './client.js';

export const householdApi = {
  // GET /api/households - List user's households
  getUserHouseholds: () => {
    return apiClient.get('/api/households');
  },
  
  // POST /api/households - Create new household
  createHousehold: (data) => {
    return apiClient.post('/api/households', data);
  },
  
  // GET /api/households/:id - Get household details
  getHousehold: (id) => {
    return apiClient.get(`/api/households/${id}`);
  },
  
  // PUT /api/households/:id - Update household (admin only)
  updateHousehold: (id, data) => {
    return apiClient.put(`/api/households/${id}`, data);
  },
  
  // DELETE /api/households/:id - Delete household (admin only)
  deleteHousehold: (id) => {
    return apiClient.delete(`/api/households/${id}`);
  },
  
  // GET /api/households/:id/members - List household members
  getHouseholdMembers: (id) => {
    return apiClient.get(`/api/households/${id}/members`);
  },
  
  // POST /api/households/:id/invite - Generate new invite code/link
  generateInviteCode: (id) => {
    return apiClient.post(`/api/households/${id}/invite`);
  },
  
  // DELETE /api/households/:id/members/:userId - Remove member (admin only)
  removeMember: (householdId, userId) => {
    return apiClient.delete(`/api/households/${householdId}/members/${userId}`);
  },
  
  // POST /api/households/:id/leave - Leave household (member)
  leaveHousehold: (id) => {
    return apiClient.post(`/api/households/${id}/leave`);
  },
  
  // GET /api/households/:id/dashboard - Get dashboard KPIs + calendar data
  getDashboardData: (id) => {
    return apiClient.get(`/api/households/${id}/dashboard`);
  }
};
