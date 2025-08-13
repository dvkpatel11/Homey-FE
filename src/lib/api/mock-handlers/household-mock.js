import { mockHouseholds } from '../../mock-data/households.js';
import { mockUsers } from '../../mock-data/users.js';
import { mockTasks } from '../../mock-data/tasks.js';
import { mockExpenses } from '../../mock-data/expenses.js';

let households = [...mockHouseholds];
let householdMembers = new Map();

// Initialize household members
households.forEach(household => {
  const members = mockUsers.slice(0, household.member_count || 2).map((user, index) => ({
    id: `member_${household.id}_${user.id}`,
    user_id: user.id,
    full_name: user.full_name,
    email: user.email,
    avatar_url: user.avatar_url,
    role: index === 0 ? 'admin' : 'member',
    joined_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  }));
  householdMembers.set(household.id, members);
});

export const householdMock = {
  async getHouseholds() {
    return {
      data: households.map(h => ({
        ...h,
        role: 'admin', // Simulate current user role
        joined_at: new Date().toISOString(),
      })),
      message: 'Households retrieved successfully',
    };
  },

  async createHousehold({ data }) {
    const newHousehold = {
      id: `household_${Date.now()}`,
      name: data.name,
      admin_id: 'current_user_id',
      invite_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      max_members: data.max_members || 10,
      member_count: 1,
      address: data.address || null,
      lease_start_date: data.lease_start_date || null,
      lease_end_date: data.lease_end_date || null,
      data_retention_days: 365,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    households.push(newHousehold);
    
    // Add creator as admin member
    householdMembers.set(newHousehold.id, [{
      id: `member_${newHousehold.id}_current_user`,
      user_id: 'current_user_id',
      full_name: 'Current User',
      email: 'current@user.com',
      avatar_url: null,
      role: 'admin',
      joined_at: new Date().toISOString(),
    }]);

    return {
      data: newHousehold,
      message: 'Household created successfully',
    };
  },

  async getHousehold({ params }) {
    const household = households.find(h => h.id === params.id);
    
    if (!household) {
      throw {
        code: 'HOUSEHOLD_NOT_FOUND',
        message: 'Household not found',
        status: 404,
      };
    }

    return {
      data: {
        ...household,
        role: 'admin',
        joined_at: new Date().toISOString(),
      },
      message: 'Household retrieved successfully',
    };
  },

  async updateHousehold({ params, data }) {
    const householdIndex = households.findIndex(h => h.id === params.id);
    
    if (householdIndex === -1) {
      throw {
        code: 'HOUSEHOLD_NOT_FOUND',
        message: 'Household not found',
        status: 404,
      };
    }

    households[householdIndex] = {
      ...households[householdIndex],
      ...data,
      updated_at: new Date().toISOString(),
    };

    return {
      data: households[householdIndex],
      message: 'Household updated successfully',
    };
  },

  async deleteHousehold({ params }) {
    const householdIndex = households.findIndex(h => h.id === params.id);
    
    if (householdIndex === -1) {
      throw {
        code: 'HOUSEHOLD_NOT_FOUND',
        message: 'Household not found',
        status: 404,
      };
    }

    households.splice(householdIndex, 1);
    householdMembers.delete(params.id);

    return {
      data: { deleted: true },
      message: 'Household deleted successfully',
    };
  },

  async getMembers({ params }) {
    const members = householdMembers.get(params.id) || [];
    
    return {
      data: members,
      message: 'Members retrieved successfully',
    };
  },

  async createInvite({ params }) {
    const household = households.find(h => h.id === params.id);
    
    if (!household) {
      throw {
        code: 'HOUSEHOLD_NOT_FOUND',
        message: 'Household not found',
        status: 404,
      };
    }

    const newInviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Update household with new invite code
    const householdIndex = households.findIndex(h => h.id === params.id);
    households[householdIndex].invite_code = newInviteCode;

    return {
      data: {
        invite_code: newInviteCode,
        invite_link: `https://homey.app/join/${newInviteCode}`,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      message: 'Invite code generated successfully',
    };
  },

  async removeMember({ params }) {
    const members = householdMembers.get(params.id) || [];
    const updatedMembers = members.filter(m => m.user_id !== params.userId);
    householdMembers.set(params.id, updatedMembers);

    return {
      data: { removed: true },
      message: 'Member removed successfully',
    };
  },

  async leaveHousehold({ params }) {
    const members = householdMembers.get(params.id) || [];
    const updatedMembers = members.filter(m => m.user_id !== 'current_user_id');
    householdMembers.set(params.id, updatedMembers);

    return {
      data: { left: true },
      message: 'Left household successfully',
    };
  },

  async getDashboard({ params }) {
    const householdTasks = mockTasks.filter(t => t.household_id === params.id);
    const householdExpenses = mockExpenses.filter(e => e.household_id === params.id);
    
    const kpis = {
      outstanding_tasks: householdTasks.filter(t => t.status === 'pending').length,
      total_balance_owed: householdExpenses.reduce((sum, e) => sum + e.amount, 0),
      upcoming_deadlines: householdTasks.filter(t => {
        if (!t.due_date) return false;
        const dueDate = new Date(t.due_date);
        const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        return dueDate <= weekFromNow && t.status !== 'completed';
      }).length,
      recent_activity_count: Math.floor(Math.random() * 10) + 5,
    };

    const calendar_events = householdTasks
      .filter(t => t.due_date)
      .slice(0, 5)
      .map(t => ({
        id: t.id,
        title: t.title,
        date: t.due_date,
        type: 'task',
        assigned_to: t.assignments?.[0]?.assigned_to_name || 'Unassigned',
      }));

    const recent_activity = Array.from({ length: 8 }, (_, i) => ({
      id: `activity_${i}`,
      type: ['task_completed', 'bill_paid', 'member_joined'][i % 3],
      message: [
        'Kitchen cleaned',
        'Rent payment recorded',
        'New member joined household'
      ][i % 3],
      timestamp: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
      user: {
        name: mockUsers[i % mockUsers.length].full_name,
        avatar_url: mockUsers[i % mockUsers.length].avatar_url,
      },
    }));

    return {
      data: {
        kpis,
        calendar_events,
        recent_activity,
      },
      message: 'Dashboard data retrieved successfully',
    };
  },
};

export default householdMock;
