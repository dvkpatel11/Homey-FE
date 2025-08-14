import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import GlassContainer from "../../ui/GlassContainer.jsx";
import GlassInput from "../../ui/GlassInput.jsx";
import GlassSelect from "../../ui/GlassSelect.jsx";
import IconButton from "../../ui/IconButton.jsx";

const TaskFilters = ({ filters, setFilters, members, isLoading }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "cleaning", label: "Cleaning" },
    { value: "cooking", label: "Cooking" },
    { value: "shopping", label: "Shopping" },
    { value: "maintenance", label: "Maintenance" },
    { value: "pets", label: "Pets" },
    { value: "yard", label: "Yard Work" },
    { value: "bills", label: "Bills & Admin" },
    { value: "other", label: "Other" },
  ];

  const statusOptions = [
    { value: "all", label: "All Tasks" },
    { value: "pending", label: "Pending" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "overdue", label: "Overdue" },
  ];

  const sortOptions = [
    { value: "due_date", label: "Due Date" },
    { value: "priority", label: "Priority" },
    { value: "created_at", label: "Date Created" },
    { value: "title", label: "Title A-Z" },
  ];

  const assigneeOptions = [
    { value: "all", label: "All Members" },
    ...members.map((member) => ({
      value: member.user_id,
      label: member.name,
    })),
  ];

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <GlassContainer variant="default" padding="md">
      <div className="space-y-4">
        {/* Primary Search and Quick Filters */}
        <div className="flex space-x-3">
          <div className="flex-1">
            <GlassInput
              type="search"
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              icon={Search}
            />
          </div>
          <IconButton
            icon={SlidersHorizontal}
            variant={showAdvanced ? "primary" : "ghost"}
            onClick={() => setShowAdvanced(!showAdvanced)}
          />
        </div>

        {/* Quick Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {["all", "pending", "overdue", "completed"].map((status) => (
            <button
              key={status}
              onClick={() => updateFilter("status", status)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                filters.status === status
                  ? "glass-button text-white"
                  : "glass-input text-glass-secondary hover:text-glass"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-glass-border">
            <GlassSelect
              label="Category"
              value={filters.category}
              onChange={(e) => updateFilter("category", e.target.value)}
              options={categories}
            />

            <GlassSelect
              label="Assigned To"
              value={filters.assignee}
              onChange={(e) => updateFilter("assignee", e.target.value)}
              options={assigneeOptions}
            />

            <GlassSelect
              label="Sort By"
              value={filters.sortBy}
              onChange={(e) => updateFilter("sortBy", e.target.value)}
              options={sortOptions}
            />
          </div>
        )}
      </div>
    </GlassContainer>
  );
};

export default TaskFilters;
