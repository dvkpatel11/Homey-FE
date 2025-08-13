import client from './client.js';

export const householdsAPI = {
  // Get user's households
  async getHouseholds() {
    const response = await client.get('/api/households');
    return response.data;
  },

  // Create new household
  async createHousehold(data) {
    const response = await client.post('/api/households', data);
    return response.data;
  },

  // Get household by ID
  async getHousehold(householdId) {
    const response = await client.get(`/api/households/${householdId}`);
    return response.data;
  },

  // Update household (admin only)
  async updateHousehold(householdId, data) {
    const response = await client.put(`/api/households/${householdId}`, data);
    return response.data;
  },

  // Delete household (admin only)
  async deleteHousehold(householdId) {
    const response = await client.delete(`/api/households/${householdId}`);
    return response.data;
  },

  // Get household members
  async getMembers(householdId) {
    const response = await client.get(`/api/households/${householdId}/members`);
    return response.data;
  },

  // Generate new invite code
  async createInvite(householdId) {
    const response = await client.post(`/api/households/${householdId}/invite`);
    return response.data;
  },

  // Remove member (admin only)
  async removeMember(householdId, userId) {
    const response = await client.delete(`/api/households/${householdId}/members/${userId}`);
    return response.data;
  },

  // Leave household
  async leaveHousehold(householdId) {
    const response = await client.post(`/api/households/${householdId}/leave`);
    return response.data;
  },

  // Get dashboard data
  async getDashboard(householdId) {
    const response = await client.get(`/api/households/${householdId}/dashboard`);
    return response.data;
  },

  // Switch active household (local only)
  switchHousehold(householdId) {
    localStorage.setItem('activeHouseholdId', householdId);
    // Trigger storage event for cross-tab sync
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'activeHouseholdId',
      newValue: householdId,
    }));
  },

  // Get active household ID
  getActiveHouseholdId() {
    return localStorage.getItem('activeHouseholdId');
  },
};

export default householdsAPI;
