// Household Mock Data (matching API spec)

export const households = [
  {
    id: 'household-abc123',
    name: 'Downtown Apartment',
    admin_id: 'user-123',
    invite_code: 'INV-ABC123XY',
    max_members: 6,
    member_count: 3,
    address: '123 Main St, Apt 4B, New York, NY 10001',
    lease_start_date: '2024-01-01',
    lease_end_date: '2024-12-31',
    data_retention_days: 365,
    role: 'admin',
    joined_at: '2024-01-15T10:30:00Z',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-20T14:45:00Z'
  },
  {
    id: 'household-def456',
    name: 'Suburban House',
    admin_id: 'user-456',
    invite_code: 'INV-DEF456UV',
    max_members: 8,
    member_count: 4,
    address: '456 Oak Ave, Springfield, IL 62701',
    lease_start_date: '2023-09-01',
    lease_end_date: '2025-08-31',
    data_retention_days: 365,
    role: 'member',
    joined_at: '2024-01-18T09:15:00Z',
    created_at: '2023-09-01T12:00:00Z',
    updated_at: '2024-01-18T09:15:00Z'
  }
];

export const householdMembers = [
  {
    id: 'member-1',
    user_id: 'user-123',
    full_name: 'John Doe',
    email: 'john.doe@example.com',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    role: 'admin',
    joined_at: '2024-01-15T10:30:00Z',
    household_id: 'household-abc123'
  },
  {
    id: 'member-2',
    user_id: 'user-456',
    full_name: 'Jane Smith',
    email: 'jane.smith@example.com',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    role: 'member',
    joined_at: '2024-01-16T14:20:00Z',
    household_id: 'household-abc123'
  },
  {
    id: 'member-3',
    user_id: 'user-789',
    full_name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    role: 'member',
    joined_at: '2024-01-17T11:45:00Z',
    household_id: 'household-abc123'
  }
];

// Dashboard Data
export const dashboardData = {
  kpis: {
    outstanding_tasks: 5,
    total_balance_owed: 284.50,
    upcoming_deadlines: 3,
    recent_activity_count: 12
  },
  calendar_events: [
    {
      id: 'event-1',
      title: 'Electricity Bill Due',
      date: '2024-02-15',
      type: 'bill',
      amount: 85.00
    },
    {
      id: 'event-2',
      title: 'Take out trash',
      date: '2024-02-16',
      type: 'task',
      assigned_to: 'user-456'
    },
    {
      id: 'event-3',
      title: 'Rent Payment',
      date: '2024-02-28',
      type: 'bill',
      amount: 1200.00
    }
  ],
  recent_activity: [
    {
      id: 'activity-1',
      type: 'task_completed',
      message: 'completed "Clean kitchen"',
      timestamp: '2024-02-10T15:30:00Z',
      user: {
        name: 'Jane Smith',
        avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
      }
    },
    {
      id: 'activity-2',
      type: 'bill_paid',
      message: 'paid $45.50 for Internet Bill',
      timestamp: '2024-02-10T12:15:00Z',
      user: {
        name: 'Mike Johnson',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
      }
    },
    {
      id: 'activity-3',
      type: 'task_assigned',
      message: 'assigned "Vacuum living room" to John Doe',
      timestamp: '2024-02-09T18:45:00Z',
      user: {
        name: 'Jane Smith',
        avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
      }
    }
  ]
};
