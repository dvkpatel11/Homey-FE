import { apiClient, buildQuery } from "./client.js";

export const taskApi = {
  // GET /api/households/:id/tasks - List household tasks
  getHouseholdTasks: (householdId, filters = {}) => {
    const query = buildQuery(filters);
    return apiClient.get(`/api/households/${householdId}/tasks${query ? `?${query}` : ""}`);
  },

  // POST /api/households/:id/tasks - Create task (admin only)
  createTask: (householdId, data) => {
    return apiClient.post(`/api/households/${householdId}/tasks`, data);
  },

  // GET /api/tasks/:id - Get task details
  getTask: (id) => {
    return apiClient.get(`/api/tasks/${id}`);
  },

  // PUT /api/tasks/:id - Update task (admin only)
  updateTask: (id, data) => {
    return apiClient.put(`/api/tasks/${id}`, data);
  },

  // DELETE /api/tasks/:id - Delete task (admin only)
  deleteTask: (id) => {
    return apiClient.delete(`/api/tasks/${id}`);
  },

  // POST /api/tasks/:id/assign - Assign task to user(s)
  assignTask: (id, userIds) => {
    return apiClient.post(`/api/tasks/${id}/assign`, { user_ids: userIds });
  },

  // PUT /api/tasks/:id/complete - Mark task as completed
  completeTask: (id) => {
    return apiClient.put(`/api/tasks/${id}/complete`);
  },

  // PUT /api/tasks/:id/uncomplete - Mark task as incomplete
  uncompleteTask: (id) => {
    return apiClient.put(`/api/tasks/${id}/uncomplete`);
  },

  // POST /api/tasks/:id/swap/request - Request task swap
  requestTaskSwap: (id, data) => {
    return apiClient.post(`/api/tasks/${id}/swap/request`, data);
  },

  // PUT /api/task-swaps/:id/accept - Accept swap request
  acceptTaskSwap: (swapId) => {
    return apiClient.put(`/api/task-swaps/${swapId}/accept`);
  },

  // PUT /api/task-swaps/:id/decline - Decline swap request
  declineTaskSwap: (swapId) => {
    return apiClient.put(`/api/task-swaps/${swapId}/decline`);
  },

  // GET /api/households/:id/task-swaps - List pending swaps
  getTaskSwaps: (householdId) => {
    return apiClient.get(`/api/households/${householdId}/task-swaps`);
  },
};
