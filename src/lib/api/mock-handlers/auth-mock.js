import { mockUsers } from '../../mock-data/users.js';
import { mockHouseholds } from '../../mock-data/households.js';

let currentUser = mockUsers[0];

export const authMock = {
  async getProfile() {
    return {
      data: currentUser,
      message: 'Profile retrieved successfully',
    };
  },

  async updateProfile({ data }) {
    currentUser = {
      ...currentUser,
      ...data,
      updated_at: new Date().toISOString(),
    };
    
    return {
      data: currentUser,
      message: 'Profile updated successfully',
    };
  },

  async validateInvite({ data }) {
    const { invite_code } = data;
    const household = mockHouseholds.find(h => h.invite_code === invite_code);
    
    if (!household) {
      throw {
        code: 'INVALID_INVITE',
        message: 'Invalid invitation code',
        status: 400,
      };
    }

    const admin = mockUsers.find(u => u.id === household.admin_id);
    
    return {
      data: {
        household: {
          id: household.id,
          name: household.name,
          admin_name: admin?.full_name || 'Unknown',
          member_count: household.member_count || 1,
          max_members: household.max_members,
        },
        valid: true,
      },
      message: 'Invitation code is valid',
    };
  },

  async joinHousehold({ data }) {
    const { invite_code } = data;
    const household = mockHouseholds.find(h => h.invite_code === invite_code);
    
    if (!household) {
      throw {
        code: 'INVALID_INVITE',
        message: 'Invalid invitation code',
        status: 400,
      };
    }

    return {
      data: {
        household_id: household.id,
        role: 'member',
        joined_at: new Date().toISOString(),
      },
      message: 'Successfully joined household',
    };
  },
};

export default authMock;
