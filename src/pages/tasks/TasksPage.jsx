import { Plus } from "lucide-react";
import { useState } from "react";
import AddTaskModal from "../../components/features/tasks/AddTaskModal.jsx";
import TaskFilters from "../../components/features/tasks/TaskFilters.jsx";
import TaskList from "../../components/features/tasks/TaskList.jsx";
import TaskSwapModal from "../../components/features/tasks/TaskSwapModal.jsx";
import FloatingActionButton from "../../components/ui/FloatingActionButton.jsx";
import GlassContainer from "../../components/ui/GlassContainer.jsx";
import GlassSection from "../../components/ui/GlassSection.jsx";
import GlassText from "../../components/ui/GlassText.jsx";
import { useHousehold } from "../../contexts/HouseholdContext.jsx";
import { useTasks } from "../../hooks/useTasks.js";

const TasksPage = () => {
  const {
    tasks,
    myTasks,
    pendingTasks,
    overdueTasks,
    tasksDueToday,
    pendingSwapsForMe,
    createTask,
    updateTask,
    completeTask,
    requestSwap,
    acceptSwap,
    declineSwap,
    isLoading,
  } = useTasks();

  const { activeHousehold, members, isAdmin } = useHousehold();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [selectedSwap, setSelectedSwap] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    assignee: "all",
    status: "pending",
    sortBy: "due_date",
  });

  const handleTaskComplete = async (taskId) => {
    try {
      await completeTask(taskId);
    } catch (error) {
      console.error("Failed to complete task:", error);
    }
  };

  const handleSwapRequest = (task) => {
    setSelectedSwap(task);
    setShowSwapModal(true);
  };

  const handleSwapResponse = async (swapId, action) => {
    try {
      if (action === "accept") {
        await acceptSwap(swapId);
      } else {
        await declineSwap(swapId);
      }
    } catch (error) {
      console.error("Failed to respond to swap:", error);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      task.description?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCategory = filters.category === "all" || task.category === filters.category;
    const matchesAssignee = filters.assignee === "all" || task.assigned_to === filters.assignee;
    const matchesStatus = filters.status === "all" || task.status === filters.status;

    return matchesSearch && matchesCategory && matchesAssignee && matchesStatus;
  });

  if (!activeHousehold) {
    return (
      <GlassContainer variant="default" className="text-center">
        <GlassText variant="muted">Please select a household to view tasks.</GlassText>
      </GlassContainer>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Quick Stats */}
      <GlassContainer variant="subtle" padding="md">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-light text-glass">{tasksDueToday.length}</div>
            <div className="text-xs text-glass-muted">Due Today</div>
          </div>
          <div>
            <div className="text-2xl font-light text-glass">{myTasks.length}</div>
            <div className="text-xs text-glass-muted">My Tasks</div>
          </div>
          <div>
            <div className="text-2xl font-light text-glass">{overdueTasks.length}</div>
            <div className="text-xs text-glass-muted">Overdue</div>
          </div>
          <div>
            <div className="text-2xl font-light text-glass">{pendingSwapsForMe.length}</div>
            <div className="text-xs text-glass-muted">Swap Requests</div>
          </div>
        </div>
      </GlassContainer>

      {/* Filters */}
      <TaskFilters filters={filters} setFilters={setFilters} members={members} isLoading={isLoading} />

      {/* Swap Requests */}
      {pendingSwapsForMe.length > 0 && (
        <GlassContainer variant="violet" padding="md">
          <GlassSection
            title="Pending Swap Requests"
            subtitle={`${pendingSwapsForMe.length} tasks waiting for your response`}
          >
            <div className="space-y-3">
              {pendingSwapsForMe.map((swap) => (
                <div key={swap.id} className="flex items-center justify-between glass-input p-3 rounded-glass">
                  <div className="flex-1 min-w-0">
                    <div className="text-glass font-medium truncate">{swap.task.title}</div>
                    <div className="text-glass-muted text-sm">{swap.requested_by.name} wants to swap this task</div>
                  </div>
                  <div className="flex space-x-2 ml-3">
                    <button
                      onClick={() => handleSwapResponse(swap.id, "accept")}
                      className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-glass text-sm border border-emerald-500/30"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleSwapResponse(swap.id, "decline")}
                      className="px-3 py-1 bg-red-500/20 text-red-300 rounded-glass text-sm border border-red-500/30"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </GlassSection>
        </GlassContainer>
      )}

      {/* Task List */}
      <TaskList
        tasks={filteredTasks}
        onComplete={handleTaskComplete}
        onSwapRequest={handleSwapRequest}
        isLoading={isLoading}
        currentUserId={activeHousehold?.user_id}
      />

      {/* Floating Action Button */}
      <FloatingActionButton onClick={() => setShowAddModal(true)} icon={Plus} />

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={createTask}
        members={members}
        isAdmin={isAdmin}
      />

      {/* Task Swap Modal */}
      <TaskSwapModal
        isOpen={showSwapModal}
        onClose={() => {
          setShowSwapModal(false);
          setSelectedSwap(null);
        }}
        task={selectedSwap}
        onSubmit={requestSwap}
        members={members}
      />
    </div>
  );
};

export default TasksPage;
