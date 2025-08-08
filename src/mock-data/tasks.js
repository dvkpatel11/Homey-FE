// Task Mock Data (matching API spec)

export const tasks = [
  {
    id: 'task-1',
    household_id: 'household-abc123',
    title: 'Take out trash',
    description: 'Take out the kitchen and bathroom trash bins',
    created_by: 'user-123',
    is_recurring: true,
    recurrence_pattern: 'weekly',
    recurrence_interval: 1,
    due_date: '2024-02-16T20:00:00Z',
    status: 'pending',
    created_at: '2024-02-10T09:00:00Z',
    updated_at: '2024-02-10T09:00:00Z',
    assignments: [
      {
        id: 'assignment-1',
        assigned_to: 'user-456',
        assigned_to_name: 'Jane Smith',
        assigned_to_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        assigned_at: '2024-02-10T09:00:00Z',
        completed_at: null
      }
    ],
    swap_requests: []
  },
  {
    id: 'task-2',
    household_id: 'household-abc123',
    title: 'Clean kitchen',
    description: 'Deep clean the kitchen including counters, sink, and stove',
    created_by: 'user-123',
    is_recurring: false,
    recurrence_pattern: null,
    recurrence_interval: null,
    due_date: '2024-02-18T18:00:00Z',
    status: 'completed',
    created_at: '2024-02-08T14:30:00Z',
    updated_at: '2024-02-10T15:30:00Z',
    assignments: [
      {
        id: 'assignment-2',
        assigned_to: 'user-456',
        assigned_to_name: 'Jane Smith',
        assigned_to_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        assigned_at: '2024-02-08T14:30:00Z',
        completed_at: '2024-02-10T15:30:00Z'
      }
    ],
    swap_requests: []
  },
  {
    id: 'task-3',
    household_id: 'household-abc123',
    title: 'Vacuum living room',
    description: null,
    created_by: 'user-456',
    is_recurring: true,
    recurrence_pattern: 'weekly',
    recurrence_interval: 2,
    due_date: '2024-02-20T19:00:00Z',
    status: 'pending',
    created_at: '2024-02-09T18:45:00Z',
    updated_at: '2024-02-09T18:45:00Z',
    assignments: [
      {
        id: 'assignment-3',
        assigned_to: 'user-123',
        assigned_to_name: 'John Doe',
        assigned_to_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        assigned_at: '2024-02-09T18:45:00Z',
        completed_at: null
      }
    ],
    swap_requests: [
      {
        id: 'swap-1',
        task_id: 'task-3',
        from_user_id: 'user-123',
        to_user_id: 'user-789',
        status: 'pending',
        notes: 'I have a conflict this weekend',
        requested_at: '2024-02-11T10:15:00Z',
        responded_at: null
      }
    ]
  }
];
