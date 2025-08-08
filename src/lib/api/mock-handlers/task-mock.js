import * as mockData from 'mock-data/index.js';

export const handleTaskMock = async (method, endpoint, data, options) => {
  // GET /api/households/:id/tasks - List household tasks
  if (method === "GET" && endpoint.match(/^\/api\/households\/[^\/]+\/tasks/)) {
    const householdId = endpoint.split("/")[3];
    return {
      data: mockData.tasks.filter((t) => t.household_id === householdId),
      message: "Tasks retrieved successfully",
    };
  }

  // POST /api/households/:id/tasks - Create task
  if (method === "POST" && endpoint.match(/^\/api\/households\/[^\/]+\/tasks$/)) {
    const householdId = endpoint.split("/")[3];
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
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      assignments: data.assigned_to
        ? data.assigned_to.map((userId) => ({
            id: `assignment-${Date.now()}-${userId}`,
            assigned_to: userId,
            assigned_to_name: mockData.householdMembers.find((m) => m.user_id === userId)?.full_name || "Unknown",
            assigned_to_avatar: null,
            assigned_at: new Date().toISOString(),
            completed_at: null,
          }))
        : [],
      swap_requests: [],
    };
    return {
      data: newTask,
      message: "Task created successfully",
    };
  }

  // GET /api/tasks/:id - Get task details
  if (method === "GET" && endpoint.match(/^\/api\/tasks\/[^\/]+$/)) {
    const id = endpoint.split("/").pop();
    const task = mockData.tasks.find((t) => t.id === id);
    if (!task) throw new Error("Task not found");
    return {
      data: task,
      message: "Task retrieved successfully",
    };
  }

  // PUT /api/tasks/:id/complete - Mark task complete
  if (method === "PUT" && endpoint.match(/^\/api\/tasks\/[^\/]+\/complete$/)) {
    const id = endpoint.split("/")[3];
    return {
      data: {
        id: id,
        status: "completed",
        completed_at: new Date().toISOString(),
        completed_by: mockData.currentUser.id,
      },
      message: "Task completed successfully",
    };
  }

  // POST /api/tasks/:id/swap/request - Request task swap
  if (method === "POST" && endpoint.match(/^\/api\/tasks\/[^\/]+\/swap\/request$/)) {
    const taskId = endpoint.split("/")[3];
    return {
      data: {
        id: `swap-${Date.now()}`,
        task_id: taskId,
        from_user_id: mockData.currentUser.id,
        to_user_id: data.to_user_id,
        status: "pending",
        notes: data.notes || null,
        requested_at: new Date().toISOString(),
        responded_at: null,
      },
      message: "Task swap requested successfully",
    };
  }

  throw new Error(`Task mock not implemented: ${method} ${endpoint}`);
};
