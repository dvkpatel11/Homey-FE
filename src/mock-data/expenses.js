// Bill/Expense Mock Data (matching API spec)

export const bills = [
  {
    id: 'bill-1',
    household_id: 'household-abc123',
    title: 'Electricity Bill',
    description: 'Monthly electricity bill from ConEd',
    total_amount: 85.00,
    currency: 'USD',
    paid_by: 'user-123',
    paid_by_name: 'John Doe',
    due_date: '2024-02-15T23:59:59Z',
    paid_date: null,
    is_recurring: true,
    recurrence_pattern: 'monthly',
    category: 'utilities',
    status: 'pending',
    created_by: 'user-123',
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-02-01T10:00:00Z',
    splits: [
      {
        id: 'split-1-1',
        user_id: 'user-123',
        user_name: 'John Doe',
        amount_owed: 28.33,
        percentage: 33.33,
        paid_amount: 0,
        paid_date: null
      },
      {
        id: 'split-1-2',
        user_id: 'user-456',
        user_name: 'Jane Smith',
        amount_owed: 28.33,
        percentage: 33.33,
        paid_amount: 0,
        paid_date: null
      },
      {
        id: 'split-1-3',
        user_id: 'user-789',
        user_name: 'Mike Johnson',
        amount_owed: 28.34,
        percentage: 33.34,
        paid_amount: 0,
        paid_date: null
      }
    ]
  },
  {
    id: 'bill-2',
    household_id: 'household-abc123',
    title: 'Internet Bill',
    description: 'Monthly internet service from Verizon',
    total_amount: 65.99,
    currency: 'USD',
    paid_by: 'user-456',
    paid_by_name: 'Jane Smith',
    due_date: '2024-02-20T23:59:59Z',
    paid_date: '2024-02-10T12:15:00Z',
    is_recurring: true,
    recurrence_pattern: 'monthly',
    category: 'utilities',
    status: 'paid',
    created_by: 'user-456',
    created_at: '2024-01-20T15:30:00Z',
    updated_at: '2024-02-10T12:15:00Z',
    splits: [
      {
        id: 'split-2-1',
        user_id: 'user-123',
        user_name: 'John Doe',
        amount_owed: 22.00,
        percentage: 33.33,
        paid_amount: 22.00,
        paid_date: '2024-02-09T19:30:00Z'
      },
      {
        id: 'split-2-2',
        user_id: 'user-456',
        user_name: 'Jane Smith',
        amount_owed: 21.99,
        percentage: 33.33,
        paid_amount: 21.99,
        paid_date: '2024-02-10T12:15:00Z'
      },
      {
        id: 'split-2-3',
        user_id: 'user-789',
        user_name: 'Mike Johnson',
        amount_owed: 22.00,
        percentage: 33.34,
        paid_amount: 22.00,
        paid_date: '2024-02-08T14:45:00Z'
      }
    ]
  }
];

// Household Balance Data
export const householdBalances = {
  summary: {
    total_owed_to_household: 156.50,
    total_owed_by_household: 0,
    net_balance: 156.50
  },
  member_balances: [
    {
      user_id: 'user-123',
      user_name: 'John Doe',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      total_owed: 50.33,
      total_paid: 22.00,
      net_balance: 28.33
    },
    {
      user_id: 'user-456',
      user_name: 'Jane Smith',
      avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      total_owed: 50.32,
      total_paid: 43.99,
      net_balance: 6.33
    },
    {
      user_id: 'user-789',
      user_name: 'Mike Johnson',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      total_owed: 50.34,
      total_paid: 22.00,
      net_balance: 28.34
    }
  ],
  recent_transactions: [
    {
      id: 'transaction-1',
      bill_title: 'Internet Bill',
      user_name: 'Mike Johnson',
      amount: 22.00,
      paid_date: '2024-02-10T12:15:00Z'
    },
    {
      id: 'transaction-2',
      bill_title: 'Internet Bill',
      user_name: 'Jane Smith',
      amount: 21.99,
      paid_date: '2024-02-10T12:15:00Z'
    },
    {
      id: 'transaction-3',
      bill_title: 'Internet Bill',
      user_name: 'John Doe',
      amount: 22.00,
      paid_date: '2024-02-09T19:30:00Z'
    }
  ]
};
