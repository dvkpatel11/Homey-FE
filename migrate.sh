#!/bin/bash

# API Spec Compliance & Mock Data Update Script
# Updates all API files and mock data to match the provided FastAPI + Supabase spec

echo "🔄 Updating API Implementation to Match Spec..."
echo "=============================================="

# Store the current directory
PROJECT_ROOT=$(pwd)
SRC_DIR="$PROJECT_ROOT/src"

# Backup existing structure
echo "📦 Creating backup..."
cp -r src src_api_update_backup_$(date +%Y%m%d_%H%M%S)

# Navigate to src directory
cd "$SRC_DIR"

echo "🛠️ Creating API configuration..."

# Create API configuration
cat > lib/config/api.js << 'EOF'
// API Configuration - Mock/Prod Toggle
const API_CONFIG = {
  // Toggle between 'mock' and 'prod'
  MODE: process.env.REACT_APP_API_MODE || 'mock',
  
  // Production API settings
  PROD: {
    BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://your-api.com/api',
    TIMEOUT: 10000,
    RETRIES: 3,
  },
  
  // Mock API settings  
  MOCK: {
    DELAY: 800, // Simulate network delay
    ERROR_RATE: 0.05, // 5% random errors for testing
    ENABLE_LOGGING: true,
  }
};

export default API_CONFIG;
EOF

echo "📡 Creating base API client..."

# Create base API client
cat > lib/api/client.js << 'EOF'
import API_CONFIG from '../config/api.js';
import { mockApiCall } from './mock-client.js';
import { prodApiCall } from './prod-client.js';

// Main API client that routes to mock or prod
export const apiClient = {
  get: (endpoint, options = {}) => {
    return API_CONFIG.MODE === 'mock' 
      ? mockApiCall('GET', endpoint, null, options)
      : prodApiCall('GET', endpoint, options);
  },
  
  post: (endpoint, data, options = {}) => {
    return API_CONFIG.MODE === 'mock'
      ? mockApiCall('POST', endpoint, data, options)
      : prodApiCall('POST', endpoint, { ...options, data });
  },
  
  put: (endpoint, data, options = {}) => {
    return API_CONFIG.MODE === 'mock'
      ? mockApiCall('PUT', endpoint, data, options)
      : prodApiCall('PUT', endpoint, { ...options, data });
  },
  
  delete: (endpoint, options = {}) => {
    return API_CONFIG.MODE === 'mock'
      ? mockApiCall('DELETE', endpoint, null, options)
      : prodApiCall('DELETE', endpoint, options);
  }
};

// Utility for building query strings
export const buildQuery = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query.append(key, value.toString());
    }
  });
  return query.toString();
};
EOF

echo "🌐 Creating production API client..."

# Create production API client
cat > lib/api/prod-client.js << 'EOF'
import API_CONFIG from '../config/api.js';

// Production API client using fetch
export const prodApiCall = async (method, endpoint, options = {}) => {
  const { data, headers = {}, ...fetchOptions } = options;
  
  // Get auth token from localStorage or auth context
  const token = localStorage.getItem('auth_token');
  const authHeaders = token 
    ? { Authorization: `Bearer ${token}` }
    : {};
  
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...headers,
    },
    ...fetchOptions,
  };
  
  if (data && (method === 'POST' || method === 'PUT')) {
    config.body = JSON.stringify(data);
  }
  
  const response = await fetch(`${API_CONFIG.PROD.BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      error: { message: 'Network error' } 
    }));
    throw new Error(error.error?.message || 'API request failed');
  }
  
  return response.json();
};
EOF

echo "🎭 Creating mock API client..."

# Create mock API client
cat > lib/api/mock-client.js << 'EOF'
import API_CONFIG from '../config/api.js';
import { handleHouseholdMock } from './mock-handlers/household-mock.js';
import { handleTaskMock } from './mock-handlers/task-mock.js';
import { handleExpenseMock } from './mock-handlers/expense-mock.js';
import { handleChatMock } from './mock-handlers/chat-mock.js';
import { handleAuthMock } from './mock-handlers/auth-mock.js';
import { handleNotificationMock } from './mock-handlers/notification-mock.js';

// Simulate API delay and random errors
const simulateNetworkDelay = () => {
  const delay = API_CONFIG.MOCK.DELAY + Math.random() * 500;
  return new Promise(resolve => setTimeout(resolve, delay));
};

const simulateRandomError = () => {
  if (Math.random() < API_CONFIG.MOCK.ERROR_RATE) {
    throw new Error('Mock network error');
  }
};

// Mock API router
export const mockApiCall = async (method, endpoint, data, options) => {
  if (API_CONFIG.MOCK.ENABLE_LOGGING) {
    console.log(`🔸 Mock API: ${method} ${endpoint}`, data);
  }
  
  await simulateNetworkDelay();
  simulateRandomError();
  
  // Route to specific mock handlers
  const response = await routeMockRequest(method, endpoint, data, options);
  
  if (API_CONFIG.MOCK.ENABLE_LOGGING) {
    console.log(`🔹 Mock Response:`, response);
  }
  
  return response;
};

// Mock request router
const routeMockRequest = async (method, endpoint, data, options) => {
  // Profile/Auth endpoints
  if (endpoint.includes('/profile') || endpoint.includes('/invite')) {
    return handleAuthMock(method, endpoint, data, options);
  }
  
  // Household endpoints
  if (endpoint.includes('/households')) {
    return handleHouseholdMock(method, endpoint, data, options);
  }
  
  // Task endpoints  
  if (endpoint.includes('/tasks')) {
    return handleTaskMock(method, endpoint, data, options);
  }
  
  // Bill/Expense endpoints
  if (endpoint.includes('/bills')) {
    return handleExpenseMock(method, endpoint, data, options);
  }
  
  // Chat endpoints
  if (endpoint.includes('/messages') || endpoint.includes('/polls')) {
    return handleChatMock(method, endpoint, data, options);
  }
  
  // Notification endpoints
  if (endpoint.includes('/notifications')) {
    return handleNotificationMock(method, endpoint, data, options);
  }
  
  // Default fallback
  throw new Error(`Mock endpoint not implemented: ${endpoint}`);
};
EOF

echo "📁 Creating mock handlers directory..."
mkdir -p lib/api/mock-handlers

echo "🏠 Creating household mock handler..."

# Create household mock handler
cat > lib/api/mock-handlers/household-mock.js << 'EOF'
import * as mockData from '../../../mock-data/index.js';

export const handleHouseholdMock = async (method, endpoint, data, options) => {
  // GET /api/households - List user's households
  if (method === 'GET' && endpoint === '/api/households') {
    return {
      data: mockData.households.filter(h => h.role), // Only households user is member of
      message: 'Households retrieved successfully'
    };
  }
  
  // POST /api/households - Create household
  if (method === 'POST' && endpoint === '/api/households') {
    const newHousehold = {
      id: `household-${Date.now()}`,
      name: data.name,
      admin_id: mockData.currentUser.id,
      invite_code: `INV-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      max_members: data.max_members || 10,
      member_count: 1,
      address: data.address || null,
      lease_start_date: data.lease_start_date || null,
      lease_end_date: data.lease_end_date || null,
      role: 'admin',
      joined_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return {
      data: newHousehold,
      message: 'Household created successfully'
    };
  }
  
  // GET /api/households/:id - Get household details
  if (method === 'GET' && endpoint.match(/^\/api\/households\/[^\/]+$/)) {
    const id = endpoint.split('/').pop();
    const household = mockData.households.find(h => h.id === id);
    if (!household) throw new Error('Household not found');
    return {
      data: household,
      message: 'Household retrieved successfully'
    };
  }
  
  // GET /api/households/:id/members - List household members
  if (method === 'GET' && endpoint.match(/^\/api\/households\/[^\/]+\/members$/)) {
    const id = endpoint.split('/')[3];
    return {
      data: mockData.householdMembers.filter(m => m.household_id === id),
      message: 'Members retrieved successfully'
    };
  }
  
  // POST /api/households/:id/invite - Generate invite code
  if (method === 'POST' && endpoint.match(/^\/api\/households\/[^\/]+\/invite$/)) {
    return {
      data: {
        invite_code: `INV-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        invite_link: `https://app.homey.com/invite/${Math.random().toString(36).substr(2, 8)}`,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      message: 'Invite code generated successfully'
    };
  }
  
  // GET /api/households/:id/dashboard - Get dashboard data
  if (method === 'GET' && endpoint.match(/^\/api\/households\/[^\/]+\/dashboard$/)) {
    return {
      data: mockData.dashboardData,
      message: 'Dashboard data retrieved successfully'
    };
  }
  
  throw new Error(`Household mock not implemented: ${method} ${endpoint}`);
};
EOF

echo "📋 Creating task mock handler..."

# Create task mock handler
cat > lib/api/mock-handlers/task-mock.js << 'EOF'
import * as mockData from '../../../mock-data/index.js';

export const handleTaskMock = async (method, endpoint, data, options) => {
  // GET /api/households/:id/tasks - List household tasks
  if (method === 'GET' && endpoint.match(/^\/api\/households\/[^\/]+\/tasks/)) {
    const householdId = endpoint.split('/')[3];
    return {
      data: mockData.tasks.filter(t => t.household_id === householdId),
      message: 'Tasks retrieved successfully'
    };
  }
  
  // POST /api/households/:id/tasks - Create task
  if (method === 'POST' && endpoint.match(/^\/api\/households\/[^\/]+\/tasks$/)) {
    const householdId = endpoint.split('/')[3];
    const newTask = {
      id: `task-${Date.now()}`,
      household_id: householdId,
      title: data.title,
      description: data.description || null,
      created_by: mockData.currentUser.id,
      is_recurring: data.is_recurring || false,
      recurrence_pattern: data.recurrence_pattern || null,
      recurrence_interval: data.recurrence_interval || null,
      due_date: data.due_date || null,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      assignments: data.assigned_to ? data.assigned_to.map(userId => ({
        id: `assignment-${Date.now()}-${userId}`,
        assigned_to: userId,
        assigned_to_name: mockData.householdMembers.find(m => m.user_id === userId)?.full_name || 'Unknown',
        assigned_to_avatar: null,
        assigned_at: new Date().toISOString(),
        completed_at: null
      })) : [],
      swap_requests: []
    };
    return {
      data: newTask,
      message: 'Task created successfully'
    };
  }
  
  // GET /api/tasks/:id - Get task details
  if (method === 'GET' && endpoint.match(/^\/api\/tasks\/[^\/]+$/)) {
    const id = endpoint.split('/').pop();
    const task = mockData.tasks.find(t => t.id === id);
    if (!task) throw new Error('Task not found');
    return {
      data: task,
      message: 'Task retrieved successfully'
    };
  }
  
  // PUT /api/tasks/:id/complete - Mark task complete
  if (method === 'PUT' && endpoint.match(/^\/api\/tasks\/[^\/]+\/complete$/)) {
    const id = endpoint.split('/')[3];
    return {
      data: {
        id: id,
        status: 'completed',
        completed_at: new Date().toISOString(),
        completed_by: mockData.currentUser.id
      },
      message: 'Task completed successfully'
    };
  }
  
  // POST /api/tasks/:id/swap/request - Request task swap
  if (method === 'POST' && endpoint.match(/^\/api\/tasks\/[^\/]+\/swap\/request$/)) {
    const taskId = endpoint.split('/')[3];
    return {
      data: {
        id: `swap-${Date.now()}`,
        task_id: taskId,
        from_user_id: mockData.currentUser.id,
        to_user_id: data.to_user_id,
        status: 'pending',
        notes: data.notes || null,
        requested_at: new Date().toISOString(),
        responded_at: null
      },
      message: 'Task swap requested successfully'
    };
  }
  
  throw new Error(`Task mock not implemented: ${method} ${endpoint}`);
};
EOF

echo "💰 Creating expense mock handler..."

# Create expense mock handler  
cat > lib/api/mock-handlers/expense-mock.js << 'EOF'
import * as mockData from '../../../mock-data/index.js';

export const handleExpenseMock = async (method, endpoint, data, options) => {
  // GET /api/households/:id/bills - List household bills (expenses)
  if (method === 'GET' && endpoint.match(/^\/api\/households\/[^\/]+\/bills/)) {
    const householdId = endpoint.split('/')[3];
    return {
      data: mockData.bills.filter(b => b.household_id === householdId),
      message: 'Bills retrieved successfully'
    };
  }
  
  // POST /api/households/:id/bills - Create bill (expense)
  if (method === 'POST' && endpoint.match(/^\/api\/households\/[^\/]+\/bills$/)) {
    const householdId = endpoint.split('/')[3];
    const newBill = {
      id: `bill-${Date.now()}`,
      household_id: householdId,
      title: data.title,
      description: data.description || null,
      total_amount: data.total_amount,
      currency: 'USD',
      paid_by: mockData.currentUser.id,
      paid_by_name: mockData.currentUser.full_name,
      due_date: data.due_date,
      paid_date: data.paid_date || null,
      is_recurring: data.is_recurring || false,
      recurrence_pattern: data.recurrence_pattern || null,
      category: data.category || null,
      status: data.paid_date ? 'paid' : 'pending',
      created_by: mockData.currentUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      splits: data.splits.map((split, index) => ({
        id: `split-${Date.now()}-${index}`,
        user_id: split.user_id,
        user_name: mockData.householdMembers.find(m => m.user_id === split.user_id)?.full_name || 'Unknown',
        amount_owed: split.amount_owed || (data.total_amount * (split.percentage || 0) / 100),
        percentage: split.percentage || null,
        paid_amount: 0,
        paid_date: null
      }))
    };
    return {
      data: newBill,
      message: 'Bill created successfully'
    };
  }
  
  // GET /api/bills/:id - Get bill details
  if (method === 'GET' && endpoint.match(/^\/api\/bills\/[^\/]+$/)) {
    const id = endpoint.split('/').pop();
    const bill = mockData.bills.find(b => b.id === id);
    if (!bill) throw new Error('Bill not found');
    return {
      data: bill,
      message: 'Bill retrieved successfully'
    };
  }
  
  // POST /api/bills/:id/pay - Record payment
  if (method === 'POST' && endpoint.match(/^\/api\/bills\/[^\/]+\/pay$/)) {
    const billId = endpoint.split('/')[3];
    return {
      data: {
        split_id: data.split_id,
        amount_paid: data.amount,
        paid_date: data.paid_date || new Date().toISOString(),
        remaining_balance: Math.max(0, 50 - data.amount) // Mock calculation
      },
      message: 'Payment recorded successfully'
    };
  }
  
  // GET /api/households/:id/balances - Get household balances
  if (method === 'GET' && endpoint.match(/^\/api\/households\/[^\/]+\/balances$/)) {
    return {
      data: mockData.householdBalances,
      message: 'Balances retrieved successfully'
    };
  }
  
  throw new Error(`Expense mock not implemented: ${method} ${endpoint}`);
};
EOF

echo "💬 Creating chat mock handler..."

# Create chat mock handler
cat > lib/api/mock-handlers/chat-mock.js << 'EOF'
import * as mockData from '../../../mock-data/index.js';

export const handleChatMock = async (method, endpoint, data, options) => {
  // GET /api/households/:id/messages - Get chat history
  if (method === 'GET' && endpoint.match(/^\/api\/households\/[^\/]+\/messages/)) {
    const householdId = endpoint.split('/')[3];
    return {
      data: mockData.messages.filter(m => m.household_id === householdId),
      message: 'Messages retrieved successfully',
      meta: {
        pagination: {
          page: 1,
          limit: 50,
          total: mockData.messages.length,
          hasMore: false
        }
      }
    };
  }
  
  // POST /api/households/:id/messages - Send message
  if (method === 'POST' && endpoint.match(/^\/api\/households\/[^\/]+\/messages$/)) {
    const householdId = endpoint.split('/')[3];
    const newMessage = {
      id: `message-${Date.now()}`,
      household_id: householdId,
      user_id: mockData.currentUser.id,
      user_name: mockData.currentUser.full_name,
      user_avatar: mockData.currentUser.avatar_url,
      content: data.content,
      message_type: data.message_type || 'text',
      replied_to: data.replied_to || null,
      edited_at: null,
      poll: data.poll ? {
        id: `poll-${Date.now()}`,
        question: data.poll.question,
        options: data.poll.options,
        multiple_choice: data.poll.multiple_choice || false,
        expires_at: data.poll.expires_at || null,
        votes: [],
        vote_counts: new Array(data.poll.options.length).fill(0),
        total_votes: 0
      } : undefined,
      created_at: new Date().toISOString()
    };
    return {
      data: newMessage,
      message: 'Message sent successfully'
    };
  }
  
  // POST /api/polls/:id/vote - Vote on poll
  if (method === 'POST' && endpoint.match(/^\/api\/polls\/[^\/]+\/vote$/)) {
    const pollId = endpoint.split('/')[3];
    return {
      data: {
        poll_id: pollId,
        user_id: mockData.currentUser.id,
        selected_options: data.selected_options,
        voted_at: new Date().toISOString(),
        updated_vote_counts: [2, 1, 0] // Mock vote counts
      },
      message: 'Vote recorded successfully'
    };
  }
  
  throw new Error(`Chat mock not implemented: ${method} ${endpoint}`);
};
EOF

echo "🔔 Creating notification mock handler..."

# Create notification mock handler
cat > lib/api/mock-handlers/notification-mock.js << 'EOF'
import * as mockData from '../../../mock-data/index.js';

export const handleNotificationMock = async (method, endpoint, data, options) => {
  // GET /api/notifications - Get user notifications
  if (method === 'GET' && endpoint === '/api/notifications') {
    return {
      data: mockData.notifications,
      message: 'Notifications retrieved successfully',
      meta: {
        unread_count: mockData.notifications.filter(n => !n.read_at).length,
        pagination: {
          page: 1,
          limit: 20,
          total: mockData.notifications.length,
          hasMore: false
        }
      }
    };
  }
  
  // PUT /api/notifications/:id/read - Mark notification as read
  if (method === 'PUT' && endpoint.match(/^\/api\/notifications\/[^\/]+\/read$/)) {
    const id = endpoint.split('/')[3];
    return {
      data: {
        id: id,
        read_at: new Date().toISOString()
      },
      message: 'Notification marked as read'
    };
  }
  
  // PUT /api/notifications/read-all - Mark all notifications as read
  if (method === 'PUT' && endpoint === '/api/notifications/read-all') {
    return {
      data: {
        marked_read_count: mockData.notifications.filter(n => !n.read_at).length
      },
      message: 'All notifications marked as read'
    };
  }
  
  throw new Error(`Notification mock not implemented: ${method} ${endpoint}`);
};
EOF

echo "🔐 Creating auth mock handler..."

# Create auth mock handler
cat > lib/api/mock-handlers/auth-mock.js << 'EOF'
import * as mockData from '../../../mock-data/index.js';

export const handleAuthMock = async (method, endpoint, data, options) => {
  // GET /api/profile - Get user profile
  if (method === 'GET' && endpoint === '/api/profile') {
    return {
      data: mockData.currentUser,
      message: 'Profile retrieved successfully'
    };
  }
  
  // PUT /api/profile - Update user profile
  if (method === 'PUT' && endpoint === '/api/profile') {
    const updatedUser = {
      ...mockData.currentUser,
      ...data,
      updated_at: new Date().toISOString()
    };
    return {
      data: updatedUser,
      message: 'Profile updated successfully'
    };
  }
  
  // POST /api/invite/validate - Validate invite code
  if (method === 'POST' && endpoint === '/api/invite/validate') {
    const household = mockData.households[0]; // Use first household for demo
    return {
      data: {
        household: {
          id: household.id,
          name: household.name,
          admin_name: 'John Smith',
          member_count: household.member_count || 3,
          max_members: household.max_members || 10
        },
        valid: true
      },
      message: 'Invite code validated successfully'
    };
  }
  
  // POST /api/invite/join - Join household
  if (method === 'POST' && endpoint === '/api/invite/join') {
    return {
      data: {
        household_id: mockData.households[0].id,
        role: 'member',
        joined_at: new Date().toISOString()
      },
      message: 'Successfully joined household'
    };
  }
  
  throw new Error(`Auth mock not implemented: ${method} ${endpoint}`);
};
EOF

echo "📊 Updating mock data to match API spec..."

# Update users mock data
cat > mock-data/users.js << 'EOF'
// User & Profile Mock Data (matching API spec)

export const currentUser = {
  id: 'user-123',
  email: 'john.doe@example.com',
  full_name: 'John Doe',
  avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  phone: '+1-555-0123',
  created_at: '2024-01-15T10:30:00Z',
  updated_at: '2024-01-20T14:45:00Z'
};

export const users = [
  currentUser,
  {
    id: 'user-456',
    email: 'jane.smith@example.com',
    full_name: 'Jane Smith',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    phone: '+1-555-0456',
    created_at: '2024-01-10T09:15:00Z',
    updated_at: '2024-01-18T16:20:00Z'
  },
  {
    id: 'user-789',
    email: 'mike.johnson@example.com',
    full_name: 'Mike Johnson',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    phone: '+1-555-0789',
    created_at: '2024-01-12T11:45:00Z',
    updated_at: '2024-01-19T13:30:00Z'
  }
];
EOF

# Update households mock data
cat > mock-data/households.js << 'EOF'
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
EOF

# Update tasks mock data
cat > mock-data/tasks.js << 'EOF'
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
EOF

# Update expenses (bills) mock data
cat > mock-data/expenses.js << 'EOF'
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
EOF

# Update messages mock data
cat > mock-data/messages.js << 'EOF'
// Chat & Message Mock Data (matching API spec)

export const messages = [
  {
    id: 'message-1',
    household_id: 'household-abc123',
    user_id: 'user-456',
    user_name: 'Jane Smith',
    user_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    content: 'Hey everyone! Just completed the kitchen cleaning 🧽',
    message_type: 'text',
    replied_to: null,
    edited_at: null,
    created_at: '2024-02-10T15:30:00Z'
  },
  {
    id: 'message-2',
    household_id: 'household-abc123',
    user_id: 'user-123',
    user_name: 'John Doe',
    user_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    content: 'Thanks Jane! It looks amazing 👍',
    message_type: 'text',
    replied_to: 'message-1',
    edited_at: null,
    created_at: '2024-02-10T15:45:00Z'
  },
  {
    id: 'message-3',
    household_id: 'household-abc123',
    user_id: 'user-789',
    user_name: 'Mike Johnson',
    user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    content: 'What should we have for dinner tonight?',
    message_type: 'poll',
    replied_to: null,
    edited_at: null,
    poll: {
      id: 'poll-1',
      question: 'What should we have for dinner tonight?',
      options: ['Pizza', 'Chinese takeout', 'Cook at home'],
      multiple_choice: false,
      expires_at: '2024-02-11T20:00:00Z',
      votes: [
        {
          user_id: 'user-456',
          user_name: 'Jane Smith',
          user_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
          selected_options: [0],
          voted_at: '2024-02-10T16:15:00Z'
        },
        {
          user_id: 'user-123',
          user_name: 'John Doe',
          user_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
          selected_options: [2],
          voted_at: '2024-02-10T16:30:00Z'
        }
      ],
      vote_counts: [1, 0, 1],
      total_votes: 2
    },
    created_at: '2024-02-10T16:00:00Z'
  }
];
EOF

# Create notifications mock data
cat > mock-data/notifications.js << 'EOF'
// Notification Mock Data (matching API spec)

export const notifications = [
  {
    id: 'notification-1',
    user_id: 'user-123',
    household_id: 'household-abc123',
    title: 'Task Completed',
    message: 'Jane Smith completed "Clean kitchen"',
    type: 'task_completed',
    related_id: 'task-2',
    related_table: 'tasks',
    read_at: null,
    created_at: '2024-02-10T15:30:00Z',
    updated_at: '2024-02-10T15:30:00Z'
  },
  {
    id: 'notification-2',
    user_id: 'user-123',
    household_id: 'household-abc123',
    title: 'Payment Received',
    message: 'Mike Johnson paid $22.00 for Internet Bill',
    type: 'payment_received',
    related_id: 'bill-2',
    related_table: 'bills',
    read_at: '2024-02-10T14:00:00Z',
    created_at: '2024-02-10T12:15:00Z',
    updated_at: '2024-02-10T14:00:00Z'
  },
  {
    id: 'notification-3',
    user_id: 'user-123',
    household_id: 'household-abc123',
    title: 'Task Swap Request',
    message: 'You requested to swap "Vacuum living room" with Mike Johnson',
    type: 'swap_request',
    related_id: 'swap-1',
    related_table: 'task_swaps',
    read_at: null,
    created_at: '2024-02-11T10:15:00Z',
    updated_at: '2024-02-11T10:15:00Z'
  },
  {
    id: 'notification-4',
    user_id: 'user-123',
    household_id: 'household-abc123',
    title: 'Bill Due Soon',
    message: 'Electricity Bill is due in 3 days',
    type: 'bill_due',
    related_id: 'bill-1',
    related_table: 'bills',
    read_at: null,
    created_at: '2024-02-12T09:00:00Z',
    updated_at: '2024-02-12T09:00:00Z'
  }
];
EOF

echo "📁 Updating mock data index..."

# Update mock data index
cat > mock-data/index.js << 'EOF'
// Mock Data Exports (API Spec Compliant)
export * from './users.js';
export * from './households.js';
export * from './tasks.js';
export * from './expenses.js';
export * from './messages.js';
export * from './notifications.js';
EOF

echo "🔗 Updating API implementations..."

# Update auth API to match spec
cat > lib/api/auth.js << 'EOF'
import { apiClient } from './client.js';

export const authApi = {
  // GET /api/profile - Get user profile
  getProfile: () => {
    return apiClient.get('/api/profile');
  },
  
  // PUT /api/profile - Update user profile
  updateProfile: (data) => {
    return apiClient.put('/api/profile', data);
  },
  
  // POST /api/profile/avatar - Upload avatar image
  uploadAvatar: (formData) => {
    return apiClient.post('/api/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // POST /api/invite/validate - Validate invite code
  validateInvite: (inviteCode) => {
    return apiClient.post('/api/invite/validate', { invite_code: inviteCode });
  },
  
  // POST /api/invite/join - Join household
  joinHousehold: (inviteCode) => {
    return apiClient.post('/api/invite/join', { invite_code: inviteCode });
  }
};
EOF

# Update households API to match spec exactly
cat > lib/api/households.js << 'EOF'
import { apiClient, buildQuery } from './client.js';

export const householdApi = {
  // GET /api/households - List user's households
  getUserHouseholds: () => {
    return apiClient.get('/api/households');
  },
  
  // POST /api/households - Create new household
  createHousehold: (data) => {
    return apiClient.post('/api/households', data);
  },
  
  // GET /api/households/:id - Get household details
  getHousehold: (id) => {
    return apiClient.get(`/api/households/${id}`);
  },
  
  // PUT /api/households/:id - Update household (admin only)
  updateHousehold: (id, data) => {
    return apiClient.put(`/api/households/${id}`, data);
  },
  
  // DELETE /api/households/:id - Delete household (admin only)
  deleteHousehold: (id) => {
    return apiClient.delete(`/api/households/${id}`);
  },
  
  // GET /api/households/:id/members - List household members
  getHouseholdMembers: (id) => {
    return apiClient.get(`/api/households/${id}/members`);
  },
  
  // POST /api/households/:id/invite - Generate new invite code/link
  generateInviteCode: (id) => {
    return apiClient.post(`/api/households/${id}/invite`);
  },
  
  // DELETE /api/households/:id/members/:userId - Remove member (admin only)
  removeMember: (householdId, userId) => {
    return apiClient.delete(`/api/households/${householdId}/members/${userId}`);
  },
  
  // POST /api/households/:id/leave - Leave household (member)
  leaveHousehold: (id) => {
    return apiClient.post(`/api/households/${id}/leave`);
  },
  
  // GET /api/households/:id/dashboard - Get dashboard KPIs + calendar data
  getDashboardData: (id) => {
    return apiClient.get(`/api/households/${id}/dashboard`);
  }
};
EOF

# Update tasks API to match spec exactly
cat > lib/api/tasks.js << 'EOF'
import { apiClient, buildQuery } from './client.js';

export const taskApi = {
  // GET /api/households/:id/tasks - List household tasks
  getHouseholdTasks: (householdId, filters = {}) => {
    const query = buildQuery(filters);
    return apiClient.get(`/api/households/${householdId}/tasks${query ? `?${query}` : ''}`);
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
  }
};
EOF

# Update expenses API to match spec exactly (mapped from bills)
cat > lib/api/expenses.js << 'EOF'
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
EOF

# Update chat API to match spec exactly
cat > lib/api/chat.js << 'EOF'
import { apiClient, buildQuery } from './client.js';

export const chatApi = {
  // GET /api/households/:id/messages - Get chat history (paginated)
  getMessages: (householdId, params = {}) => {
    const query = buildQuery(params);
    return apiClient.get(`/api/households/${householdId}/messages${query ? `?${query}` : ''}`);
  },
  
  // POST /api/households/:id/messages - Send message
  sendMessage: (householdId, data) => {
    return apiClient.post(`/api/households/${householdId}/messages`, data);
  },
  
  // PUT /api/messages/:id - Edit message
  editMessage: (id, data) => {
    return apiClient.put(`/api/messages/${id}`, data);
  },
  
  // DELETE /api/messages/:id - Delete message
  deleteMessage: (id) => {
    return apiClient.delete(`/api/messages/${id}`);
  },
  
  // POST /api/messages/:id/poll - Create poll in message
  createPoll: (messageId, pollData) => {
    return apiClient.post(`/api/messages/${messageId}/poll`, pollData);
  },
  
  // POST /api/polls/:id/vote - Vote on poll
  votePoll: (pollId, data) => {
    return apiClient.post(`/api/polls/${pollId}/vote`, data);
  },
  
  // GET /api/polls/:id/results - Get poll results
  getPollResults: (pollId) => {
    return apiClient.get(`/api/polls/${pollId}/results`);
  }
};
EOF

# Create notifications API to match spec exactly
cat > lib/api/notifications.js << 'EOF'
import { apiClient, buildQuery } from './client.js';

export const notificationApi = {
  // GET /api/notifications - Get user notifications
  getNotifications: (params = {}) => {
    const query = buildQuery(params);
    return apiClient.get(`/api/notifications${query ? `?${query}` : ''}`);
  },
  
  // PUT /api/notifications/:id/read - Mark notification as read
  markAsRead: (id) => {
    return apiClient.put(`/api/notifications/${id}/read`);
  },
  
  // PUT /api/notifications/read-all - Mark all notifications as read
  markAllAsRead: () => {
    return apiClient.put('/api/notifications/read-all');
  },
  
  // DELETE /api/notifications/:id - Delete notification
  deleteNotification: (id) => {
    return apiClient.delete(`/api/notifications/${id}`);
  }
};
EOF

# Update API index to export all APIs
cat > lib/api/index.js << 'EOF'
// API Layer Exports (API Spec Compliant)
export * from './auth.js';
export * from './chat.js';
export * from './client.js';
export * from './expenses.js';
export * from './households.js';
export * from './notifications.js';
export * from './tasks.js';
EOF

echo ""
echo "✅ API Spec Compliance Update Complete!"
echo "======================================="
echo ""
echo "📋 Summary of Changes:"
echo "  • Backup created: src_api_update_backup_$(date +%Y%m%d_%H%M%S)"
echo "  • Created mock/prod API toggle system"
echo "  • Updated all mock data to match API spec types"
echo "  • Implemented all API endpoints from your FastAPI spec"
echo "  • Created mock handlers for all endpoint categories"
echo "  • Added proper error simulation and logging"
echo ""
echo "🎯 API Endpoints Now Available:"
echo "  Auth: getProfile, updateProfile, validateInvite, joinHousehold"
echo "  Households: CRUD + members + dashboard + invites"
echo "  Tasks: CRUD + assignments + completion + swapping"
echo "  Expenses: CRUD + splitting + payments + balances" 
echo "  Chat: messages + polls + voting"
echo "  Notifications: get + mark read + delete"
echo ""
echo "🔧 Environment Setup Required:"
echo "  .env.development:"
echo "    REACT_APP_API_MODE=mock"
echo ""
echo "  .env.production:"  
echo "    REACT_APP_API_MODE=prod"
echo "    REACT_APP_API_BASE_URL=https://your-fastapi-backend.com/api"
echo ""
echo "🚀 Next Steps:"
echo "  1. Set environment variables"
echo "  2. Test API calls in components"
echo "  3. Add real-time subscriptions for chat/notifications"
echo "  4. Update existing components to use new API structure"