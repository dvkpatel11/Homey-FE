export const mockTasks = [
  { 
    id: 1, 
    title: 'Clean Kitchen', 
    assignee: 'John', 
    dueDate: '2025-08-10', 
    completed: false, 
    description: 'Deep clean kitchen including appliances', 
    priority: 'high', 
    progress: 75 
  },
  { 
    id: 2, 
    title: 'Take out Trash', 
    assignee: 'Sarah', 
    dueDate: '2025-08-08', 
    completed: true, 
    description: 'Weekly trash collection', 
    priority: 'medium', 
    progress: 100 
  },
  { 
    id: 3, 
    title: 'Grocery Shopping', 
    assignee: 'Mike', 
    dueDate: '2025-08-12', 
    completed: false, 
    description: 'Weekly grocery run for house essentials', 
    priority: 'low', 
    progress: 25 
  },
];

export const mockExpenses = [
  { 
    id: 1, 
    description: 'Groceries', 
    amount: 85.50, 
    paidBy: 'John', 
    splitBetween: ['John', 'Sarah', 'Mike'], 
    date: '2025-08-05', 
    status: 'settled' 
  },
  { 
    id: 2, 
    description: 'Utilities', 
    amount: 120.00, 
    paidBy: 'Sarah', 
    splitBetween: ['John', 'Sarah', 'Mike'], 
    date: '2025-08-01', 
    status: 'pending' 
  },
  { 
    id: 3, 
    description: 'Internet Bill', 
    amount: 60.00, 
    paidBy: 'Mike', 
    splitBetween: ['John', 'Sarah', 'Mike'], 
    date: '2025-07-28', 
    status: 'settled' 
  },
];

export const mockAnnouncements = [
  { 
    id: 1, 
    author: 'John', 
    content: 'Planning to have friends over this Saturday. Is everyone okay with that?', 
    type: 'poll', 
    votes: { yes: 2, no: 0 }, 
    comments: [], 
    timestamp: '2025-08-07 10:30' 
  },
  { 
    id: 2, 
    author: 'Sarah', 
    content: 'New house rules document uploaded. Please review!', 
    type: 'text', 
    comments: [
      { author: 'Mike', content: 'Looks good!', timestamp: '2025-08-06 15:20' }
    ], 
    timestamp: '2025-08-06 14:15' 
  },
];

export const mockUsers = [
  { id: 1, name: 'John', email: 'john@example.com', avatar: null },
  { id: 2, name: 'Sarah', email: 'sarah@example.com', avatar: null },
  { id: 3, name: 'Mike', email: 'mike@example.com', avatar: null },
];