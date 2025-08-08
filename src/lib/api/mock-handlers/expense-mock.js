import * as mockData from 'mock-data/index.js';

export const handleExpenseMock = async (method, endpoint, data, options) => {
  // GET /api/households/:id/bills - List household bills (expenses)
  if (method === "GET" && endpoint.match(/^\/api\/households\/[^\/]+\/bills/)) {
    const householdId = endpoint.split("/")[3];
    return {
      data: mockData.bills.filter((b) => b.household_id === householdId),
      message: "Bills retrieved successfully",
    };
  }

  // POST /api/households/:id/bills - Create bill (expense)
  if (method === "POST" && endpoint.match(/^\/api\/households\/[^\/]+\/bills$/)) {
    const householdId = endpoint.split("/")[3];
    const newBill = {
      id: `bill-${Date.now()}`,
      household_id: householdId,
      title: data.title,
      description: data.description || null,
      total_amount: data.total_amount,
      currency: "USD",
      paid_by: mockData.currentUser.id,
      paid_by_name: mockData.currentUser.full_name,
      due_date: data.due_date,
      paid_date: data.paid_date || null,
      is_recurring: data.is_recurring || false,
      recurrence_pattern: data.recurrence_pattern || null,
      category: data.category || null,
      status: data.paid_date ? "paid" : "pending",
      created_by: mockData.currentUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      splits: data.splits.map((split, index) => ({
        id: `split-${Date.now()}-${index}`,
        user_id: split.user_id,
        user_name: mockData.householdMembers.find((m) => m.user_id === split.user_id)?.full_name || "Unknown",
        amount_owed: split.amount_owed || (data.total_amount * (split.percentage || 0)) / 100,
        percentage: split.percentage || null,
        paid_amount: 0,
        paid_date: null,
      })),
    };
    return {
      data: newBill,
      message: "Bill created successfully",
    };
  }

  // GET /api/bills/:id - Get bill details
  if (method === "GET" && endpoint.match(/^\/api\/bills\/[^\/]+$/)) {
    const id = endpoint.split("/").pop();
    const bill = mockData.bills.find((b) => b.id === id);
    if (!bill) throw new Error("Bill not found");
    return {
      data: bill,
      message: "Bill retrieved successfully",
    };
  }

  // POST /api/bills/:id/pay - Record payment
  if (method === "POST" && endpoint.match(/^\/api\/bills\/[^\/]+\/pay$/)) {
    const billId = endpoint.split("/")[3];
    return {
      data: {
        split_id: data.split_id,
        amount_paid: data.amount,
        paid_date: data.paid_date || new Date().toISOString(),
        remaining_balance: Math.max(0, 50 - data.amount), // Mock calculation
      },
      message: "Payment recorded successfully",
    };
  }

  // GET /api/households/:id/balances - Get household balances
  if (method === "GET" && endpoint.match(/^\/api\/households\/[^\/]+\/balances$/)) {
    return {
      data: mockData.householdBalances,
      message: "Balances retrieved successfully",
    };
  }

  throw new Error(`Expense mock not implemented: ${method} ${endpoint}`);
};
