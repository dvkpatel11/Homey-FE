import client from './client.js';

export const authAPI = {
  // Get current user profile
  async getProfile() {
    const response = await client.get('/api/profile');
    return response.data;
  },

  // Update user profile
  async updateProfile(data) {
    const response = await client.put('/api/profile', data);
    return response.data;
  },

  // Upload avatar
  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await client.post('/api/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Validate invitation code
  async validateInvite(inviteCode) {
    const response = await client.post('/api/invite/validate', {
      invite_code: inviteCode,
    });
    return response.data;
  },

  // Join household with invite code
  async joinHousehold(inviteCode) {
    const response = await client.post('/api/invite/join', {
      invite_code: inviteCode,
    });
    return response.data;
  },

  // Refresh authentication token
  async refreshToken() {
    const response = await client.post('/api/auth/refresh');
    return response.data;
  },

  // Logout and invalidate token
  async logout() {
    const response = await client.post('/api/auth/logout');
    localStorage.removeItem('authToken');
    return response.data;
  },
};

export default authAPI;
