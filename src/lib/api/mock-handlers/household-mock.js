import * as mockData from "../../../mock-data/index.js";

export const handleHouseholdMock = async (method, endpoint, data, options) => {
  // GET /api/households - List user's households
  if (method === "GET" && endpoint === "/api/households") {
    return {
      data: mockData.households.filter((h) => h.role), // Only households user is member of
      message: "Households retrieved successfully",
    };
  }

  // POST /api/households - Create household
  if (method === "POST" && endpoint === "/api/households") {
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
      role: "admin",
      joined_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return {
      data: newHousehold,
      message: "Household created successfully",
    };
  }

  // GET /api/households/:id - Get household details
  if (method === "GET" && endpoint.match(/^\/api\/households\/[^\/]+$/)) {
    const id = endpoint.split("/").pop();
    const household = mockData.households.find((h) => h.id === id);
    if (!household) throw new Error("Household not found");
    return {
      data: household,
      message: "Household retrieved successfully",
    };
  }

  // GET /api/households/:id/members - List household members
  if (method === "GET" && endpoint.match(/^\/api\/households\/[^\/]+\/members$/)) {
    const id = endpoint.split("/")[3];
    return {
      data: mockData.householdMembers.filter((m) => m.household_id === id),
      message: "Members retrieved successfully",
    };
  }

  // POST /api/households/:id/invite - Generate invite code
  if (method === "POST" && endpoint.match(/^\/api\/households\/[^\/]+\/invite$/)) {
    return {
      data: {
        invite_code: `INV-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        invite_link: `https://app.homey.com/invite/${Math.random().toString(36).substr(2, 8)}`,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      message: "Invite code generated successfully",
    };
  }

  // GET /api/households/:id/dashboard - Get dashboard data
  if (method === "GET" && endpoint.match(/^\/api\/households\/[^\/]+\/dashboard$/)) {
    return {
      data: mockData.dashboardData,
      message: "Dashboard data retrieved successfully",
    };
  }

  throw new Error(`Household mock not implemented: ${method} ${endpoint}`);
};
