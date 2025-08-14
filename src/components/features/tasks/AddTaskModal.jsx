import { useState } from "react";
import { Plus, X } from "lucide-react";
import GlassModal from "../../ui/GlassModal.jsx";
import GlassInput from "../../ui/GlassInput.jsx";
import GlassTextarea from "../../ui/GlassTextarea.jsx";
import GlassSelect from "../../ui/GlassSelect.jsx";
import GlassButton from "../../ui/GlassButton.jsx";
import GlassText from "../../ui/GlassText.jsx";

const AddTaskModal = ({ isOpen, onClose, onSubmit, members, isAdmin }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    assigned_to: '',
    due_date: '',
    priority: 'medium',
    is_recurring: false,
    recurring_pattern: 'weekly'
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { value: 'cleaning', label: '🧹 Cleaning' },
    { value: 'cooking', label: '👨‍🍳 Cooking' },
    { value: 'shopping', label: '🛒 Shopping' },
    { value: 'maintenance', label: '🔧 Maintenance' },
    { value: 'pets', label: '🐕 Pets' },
    { value: 'yard', label: '🌱 Yard Work' },
    { value: 'bills', label: '💰 Bills & Admin' },
    { value: 'other', label: '📋 Other' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' }
  ];

  const recurringOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const memberOptions = [
    { value: '', label: 'Assign to someone...' },
    ...members.map(member => ({
      value: member.user_id,
      label: member.name
    }))
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }
    
    if (!formData.assigned_to) {
      newErrors.assigned_to = 'Please assign this task to someone';
    }
    
    if (!formData.due_date) {
      newErrors.due_date = 'Due date is required';
    } else {
      const dueDate = new Date(formData.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        newErrors.due_date = 'Due date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Failed to create task:', error);
      setErrors({ submit: 'Failed to create task. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      category: 'other',
      assigned_to: '',
      due_date: '',
      priority: 'medium',
      is_recurring: false,
      recurring_pattern: 'weekly'
    });
    setErrors({});
    onClose();
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Set default due date to tomorrow
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Task"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Task Title */}
        <GlassInput
          label="Task Title"
          placeholder="What needs to be done?"
          value={formData.title}
          onChange={(e) => updateFormData('title', e.target.value)}
          error={errors.title}
          required
        />

        {/* Category and Priority */}
        <div className="grid grid-cols-2 gap-4">
          <GlassSelect
            label="Category"
            value={formData.category}
            onChange={(e) => updateFormData('category', e.target.value)}
            options={categories}
            required
          />
          
          <GlassSelect
            label="Priority"
            value={formData.priority}
            onChange={(e) => updateFormData('priority', e.target.value)}
            options={priorityOptions}
            required
          />
        </div>

        {/* Assignment and Due Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassSelect
            label="Assign To"
            value={formData.assigned_to}
            onChange={(e) => updateFormData('assigned_to', e.target.value)}
            options={memberOptions}
            error={errors.assigned_to}
            required
          />
          
          <GlassInput
            label="Due Date"
            type="date"
            value={formData.due_date || getTomorrowDate()}
            onChange={(e) => updateFormData('due_date', e.target.value)}
            error={errors.due_date}
            required
          />
        </div>

        {/* Description */}
        <GlassTextarea
          label="Description (Optional)"
          placeholder="Add any additional details..."
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          rows={3}
        />

        {/* Recurring Task Options (Admin Only) */}
        {isAdmin && (
          <div className="space-y-3 p-4 glass-input rounded-glass">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="recurring"
                checked={formData.is_recurring}
                onChange={(e) => updateFormData('is_recurring', e.target.checked)}
                className="w-4 h-4 rounded border-glass-border bg-surface-1 text-primary focus:ring-primary/20"
              />
              <label htmlFor="recurring" className="text-glass-secondary font-medium">
                Make this a recurring task
              </label>
            </div>
            
            {formData.is_recurring && (
              <GlassSelect
                label="Repeat Pattern"
                value={formData.recurring_pattern}
                onChange={(e) => updateFormData('recurring_pattern', e.target.value)}
                options={recurringOptions}
              />
            )}
            
            {formData.is_recurring && (
              <GlassText variant="muted" className="text-xs">
                Recurring tasks will be automatically assigned to household members in rotation.
              </GlassText>
            )}
          </div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-glass">
            <GlassText className="text-red-300 text-sm">{errors.submit}</GlassText>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <GlassButton
            variant="ghost"
            onClick={handleClose}
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </GlassButton>
          
          <GlassButton
            variant="primary"
            onClick={handleSubmit}
            loading={isSubmitting}
            icon={Plus}
            className="flex-1"
          >
            Create Task
          </GlassButton>
        </div>
      </div>
    </GlassModal>
  );
};

export default AddTaskModal;
