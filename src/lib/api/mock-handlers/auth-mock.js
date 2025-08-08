import * as mockData from "../../../mock-data/index.js";

export const handleAuthMock = async (method, endpoint, data, options) => {
  // GET /api/profile - Get user profile
  if (method === "GET" && endpoint === "/api/profile") {
    return {
      data: mockData.currentUser,
      message: "Profile retrieved successfully",
    };
  }

  // PUT /api/profile - Update user profile
  if (method === "PUT" && endpoint === "/api/profile") {
    const updatedUser = {
      ...mockData.currentUser,
      ...data,
      updated_at: new Date().toISOString(),
    };
    return {
      data: updatedUser,
      message: "Profile updated successfully",
    };
  }

  // POST /api/invite/validate - Validate invite code
  if (method === "POST" && endpoint === "/api/invite/validate") {
    const household = mockData.households[0]; // Use first household for demo
    return {
      data: {
        household: {
          id: household.id,
          name: household.name,
          admin_name: "John Smith",
          member_count: household.member_count || 3,
          max_members: household.max_members || 10,
        },
        valid: true,
      },
      message: "Invite code validated successfully",
    };
  }

  // POST /api/invite/join - Join household
  if (method === "POST" && endpoint === "/api/invite/join") {
    return {
      data: {
        household_id: mockData.households[0].id,
        role: "member",
        joined_at: new Date().toISOString(),
      },
      message: "Successfully joined household",
    };
  }

  throw new Error(`Auth mock not implemented: ${method} ${endpoint}`);
};
