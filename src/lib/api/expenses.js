import client from './client.js';

export const expensesAPI = {
  // Get household bills
  async getBills(householdId, filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    if (filters.paid_by) params.append('paid_by', filters.paid_by);
    if (filters.due_date_from) params.append('due_date_from', filters.due_date_from);
    if (filters.due_date_to) params.append('due_date_to', filters.due_date_to);
    
    const queryString = params.toString();
    const url = queryString 
      ? `/api/households/${householdId}/bills?${queryString}`
      : `/api/households/${householdId}/bills`;
      
    const response = await client.get(url);
    return response.data;
  },

  // Create new bill
  async createBill(householdId, data) {
    const response = await client.post(`/api/households/${householdId}/bills`, data);
    return response.data;
  },

  // Get bill by ID
  async getBill(billId) {
    const response = await client.get(`/api/bills/${billId}`);
    return response.data;
  },

  // Update bill
  async updateBill(billId, data) {
    const response = await client.put(`/api/bills/${billId}`, data);
    return response.data;
  },

  // Delete bill
  async deleteBill(billId) {
    const response = await client.delete(`/api/bills/${billId}`);
    return response.data;
  },

  // Update bill split details
  async updateSplit(billId, splits) {
    const response = await client.put(`/api/bills/${billId}/split`, {
      splits,
    });
    return response.data;
  },

  // Record payment for bill split
  async recordPayment(billId, data) {
    const response = await client.post(`/api/bills/${billId}/pay`, data);
    return response.data;
  },

  // Get household balances
  async getBalances(householdId) {
    const response = await client.get(`/api/households/${householdId}/balances`);
    return response.data;
  },

  // Get specific user balance
  async getUserBalance(householdId, userId) {
    const response = await client.get(`/api/households/${householdId}/balances/${userId}`);
    return response.data;
  },

  // Bulk payment operations
  async recordMultiplePayments(payments) {
    const response = await client.post('/api/bills/batch/pay', {
      payments, // [{ bill_id, split_id, amount, paid_date }]
    });
    return response.data;
  },

  // Settlement operations
  async calculateSettlement(householdId) {
    const response = await client.get(`/api/households/${householdId}/settlement`);
    return response.data;
  },

  async recordSettlement(householdId, settlements) {
    const response = await client.post(`/api/households/${householdId}/settlement`, {
      settlements, // [{ from_user_id, to_user_id, amount }]
    });
    return response.data;
  },

  // Export functionality
  async exportBills(householdId, format = 'csv', filters = {}) {
    const params = new URLSearchParams({ format, ...filters });
    const response = await client.get(
      `/api/households/${householdId}/bills/export?${params.toString()}`,
      { responseType: 'blob' }
    );
    return response.data;
  },
};

export default expensesAPI;
