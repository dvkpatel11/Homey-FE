import { useState } from "react";
import { ArrowRightLeft, Send } from "lucide-react";
import { format } from "date-fns";
import GlassModal from "../../ui/GlassModal.jsx";
import GlassSelect from "../../ui/GlassSelect.jsx";
import GlassTextarea from "../../ui/GlassTextarea.jsx";
import GlassButton from "../../ui/GlassButton.jsx";
import GlassText from "../../ui/GlassText.jsx";
import GlassHeading from "../../ui/GlassHeading.jsx";

const TaskSwapModal = ({ isOpen, onClose, task, onSubmit, members }) => {
  const [formData, setFormData] = useState({
    swap_with: '',
    reason: '',
    proposed_date: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!task) return null;

  // Filter out the current task assignee from swap options
  const swapOptions = [
    { value: '', label: 'Choose someone to swap with...' },
    ...members
      .filter(member => member.user_id !== task.assigned_to)
      .map(member => ({
        value: member.user_id,
        label: member.name
      }))
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.swap_with) {
      newErrors.swap_with = 'Please select someone to swap with';
    }
    
    if (!formData.reason.trim()) {
      newErrors.reason = 'Please provide a reason for the swap';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(task.id, formData);
      handleClose();
    } catch (error) {
      console.error('Failed to request swap:', error);
      setErrors({ submit: 'Failed to request swap. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      swap_with: '',
      reason: '',
      proposed_date: ''
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

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Request Task Swap"
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Task Info */}
        <div className="glass-input p-4 rounded-glass">
          <GlassHeading level={4} className="mb-2">
            Task: {task.title}
          </GlassHeading>
          <div className="space-y-1 text-sm">
            <GlassText variant="secondary">
              Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
            </GlassText>
            <GlassText variant="secondary">
              Category: {task.category}
            </GlassText>
            {task.description && (
              <GlassText variant="muted" className="mt-2">
                {task.description}
              </GlassText>
            )}
          </div>
        </div>

        {/* Swap Form */}
        <div className="space-y-4">
          <GlassSelect
            label="Swap With"
            value={formData.swap_with}
            onChange={(e) => updateFormData('swap_with', e.target.value)}
            options={swapOptions}
            error={errors.swap_with}
            required
          />

          <GlassTextarea
            label="Reason for Swap"
            placeholder="Please explain why you need to swap this task..."
            value={formData.reason}
            onChange={(e) => updateFormData('reason', e.target.value)}
            error={errors.reason}
            rows={3}
            required
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-glass-secondary">
              Proposed New Date (Optional)
            </label>
            <input
              type="date"
              value={formData.proposed_date}
              onChange={(e) => updateFormData('proposed_date', e.target.value)}
              min={getMinDate()}
              className="glass-input w-full px-4 py-3 rounded-glass text-glass"
            />
            <GlassText variant="muted" className="text-xs">
              Leave blank to keep the original due date
            </GlassText>
          </div>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-glass">
          <GlassText className="text-blue-300 text-sm">
            <ArrowRightLeft className="w-4 h-4 inline mr-2" />
            The person you're requesting to swap with will be notified and can accept or decline your request.
          </GlassText>
        </div>

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
            icon={Send}
            className="flex-1"
          >
            Send Request
          </GlassButton>
        </div>
      </div>
    </GlassModal>
  );
};

export default TaskSwapModal;
