import { apiClient } from './client.js';

export const authApi = {
  // GET /api/profile - Get user profile
  getProfile: () => {
    return apiClient.get('/api/profile');
  },
  
  // PUT /api/profile - Update user profile
  updateProfile: (data) => {
    return apiClient.put('/api/profile', data);
  },
  
  // POST /api/profile/avatar - Upload avatar image
  uploadAvatar: (formData) => {
    return apiClient.post('/api/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // POST /api/invite/validate - Validate invite code
  validateInvite: (inviteCode) => {
    return apiClient.post('/api/invite/validate', { invite_code: inviteCode });
  },
  
  // POST /api/invite/join - Join household
  joinHousehold: (inviteCode) => {
    return apiClient.post('/api/invite/join', { invite_code: inviteCode });
  }
};
