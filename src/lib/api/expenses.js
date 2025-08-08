import { apiClient, buildQuery } from './client.js';

export const expenseApi = {
  // GET /api/households/:id/bills - List household bills (as expenses)
  getHouseholdExpenses: (householdId, filters = {}) => {
    const query = buildQuery(filters);
    return apiClient.get(`/api/households/${householdId}/bills${query ? `?${query}` : ''}`);
  },
  
  // POST /api/households/:id/bills - Create bill (as expense)
  createExpense: (householdId, data) => {
    return apiClient.post(`/api/households/${householdId}/bills`, data);
  },
  
  // GET /api/bills/:id - Get bill details
  getExpense: (id) => {
    return apiClient.get(`/api/bills/${id}`);
  },
  
  // PUT /api/bills/:id - Update bill
  updateExpense: (id, data) => {
    return apiClient.put(`/api/bills/${id}`, data);
  },
  
  // DELETE /api/bills/:id - Delete bill
  deleteExpense: (id) => {
    return apiClient.delete(`/api/bills/${id}`);
  },
  
  // PUT /api/bills/:id/split - Set/update bill split details
  updateExpenseSplit: (id, splitData) => {
    return apiClient.put(`/api/bills/${id}/split`, splitData);
  },
  
  // POST /api/bills/:id/pay - Record payment for bill split
  recordPayment: (id, paymentData) => {
    return apiClient.post(`/api/bills/${id}/pay`, paymentData);
  },
  
  // GET /api/households/:id/balances - Get all member balances
  getHouseholdBalances: (householdId) => {
    return apiClient.get(`/api/households/${householdId}/balances`);
  },
  
  // GET /api/households/:id/balances/:userId - Get specific user balance
  getUserBalance: (householdId, userId) => {
    return apiClient.get(`/api/households/${householdId}/balances/${userId}`);
  }
};
