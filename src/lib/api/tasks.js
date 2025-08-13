import client from './client.js';

export const tasksAPI = {
  // Get household tasks
  async getTasks(householdId, filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.assignee) params.append('assignee', filters.assignee);
    if (filters.due_date) params.append('due_date', filters.due_date);
    if (filters.is_recurring !== undefined) params.append('is_recurring', filters.is_recurring);
    
    const queryString = params.toString();
    const url = queryString 
      ? `/api/households/${householdId}/tasks?${queryString}`
      : `/api/households/${householdId}/tasks`;
      
    const response = await client.get(url);
    return response.data;
  },

  // Create new task
  async createTask(householdId, data) {
    const response = await client.post(`/api/households/${householdId}/tasks`, data);
    return response.data;
  },

  // Get task by ID
  async getTask(taskId) {
    const response = await client.get(`/api/tasks/${taskId}`);
    return response.data;
  },

  // Update task
  async updateTask(taskId, data) {
    const response = await client.put(`/api/tasks/${taskId}`, data);
    return response.data;
  },

  // Delete task
  async deleteTask(taskId) {
    const response = await client.delete(`/api/tasks/${taskId}`);
    return response.data;
  },

  // Assign task to users
  async assignTask(taskId, userIds) {
    const response = await client.post(`/api/tasks/${taskId}/assign`, {
      assigned_to: userIds,
    });
    return response.data;
  },

  // Mark task as completed
  async completeTask(taskId) {
    const response = await client.put(`/api/tasks/${taskId}/complete`);
    return response.data;
  },

  // Mark task as incomplete
  async uncompleteTask(taskId) {
    const response = await client.put(`/api/tasks/${taskId}/uncomplete`);
    return response.data;
  },

  // Request task swap
  async requestSwap(taskId, data) {
    const response = await client.post(`/api/tasks/${taskId}/swap/request`, data);
    return response.data;
  },

  // Accept swap request
  async acceptSwap(swapId) {
    const response = await client.put(`/api/task-swaps/${swapId}/accept`);
    return response.data;
  },

  // Decline swap request
  async declineSwap(swapId) {
    const response = await client.put(`/api/task-swaps/${swapId}/decline`);
    return response.data;
  },

  // Get pending swaps for household
  async getSwaps(householdId) {
    const response = await client.get(`/api/households/${householdId}/task-swaps`);
    return response.data;
  },

  // Batch operations
  async batchCompleteTask(taskIds) {
    const response = await client.post('/api/tasks/batch/complete', {
      task_ids: taskIds,
    });
    return response.data;
  },

  async batchAssignTasks(assignments) {
    const response = await client.post('/api/tasks/batch/assign', {
      assignments, // [{ task_id, user_ids }]
    });
    return response.data;
  },
};

export default tasksAPI;
