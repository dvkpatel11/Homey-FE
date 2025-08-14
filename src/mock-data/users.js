// User & Profile Mock Data (matching API spec)

export const currentUser = {
  id: "user-123",
  email: "john.doe@example.com",
  full_name: "John Doe",
  avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
  phone: "+1-555-0123",
  created_at: "2024-01-15T10:30:00Z",
  updated_at: "2024-01-20T14:45:00Z",
};

export const mockUsers = [
  currentUser,
  {
    id: "user-456",
    email: "jane.smith@example.com",
    full_name: "Jane Smith",
    avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    phone: "+1-555-0456",
    created_at: "2024-01-10T09:15:00Z",
    updated_at: "2024-01-18T16:20:00Z",
  },
  {
    id: "user-789",
    email: "mike.johnson@example.com",
    full_name: "Mike Johnson",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    phone: "+1-555-0789",
    created_at: "2024-01-12T11:45:00Z",
    updated_at: "2024-01-19T13:30:00Z",
  },
];
