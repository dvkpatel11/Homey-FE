#!/bin/bash

echo "Fixing theme color inversion and adding semantic button colors..."

# Update index.css with proper theme color inversion
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Enhanced CSS Variables with Proper Light/Dark Inversion */
:root {
  /* Light Theme - Violet color system */
  --homey-primary: #7c3aed;
  --homey-primary-bright: #8b5cf6;
  --homey-primary-dark: #6d28d9;

  /* Light Theme - Glass morphism */
  --homey-glass-bg: rgba(255, 255, 255, 0.15);
  --homey-glass-border: rgba(255, 255, 255, 0.2);
  --homey-glass-violet: rgba(139, 92, 246, 0.1);
  --glass-blur: 16px;

  /* Light Theme - Background */
  --homey-bg: #f5f5dc; /* Beige for light mode */

  /* Light Theme - Text colors */
  --homey-text: #0f172a;
  --homey-text-secondary: #475569;
  --homey-text-muted: #64748b;

  /* Semantic colors */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
  --color-cancel: #6b7280;
}

/* Dark theme with proper inversion */
.dark {
  /* Dark Theme - Inverted violet system */
  --homey-primary: #a78bfa; /* Brighter purple for dark mode */
  --homey-primary-bright: #c4b5fd; /* Even brighter for dark */
  --homey-primary-dark: #8b5cf6; /* Medium purple for dark */

  /* Dark Theme - Glass morphism */
  --homey-glass-bg: rgba(0, 0, 0, 0.25);
  --homey-glass-border: rgba(255, 255, 255, 0.1);
  --homey-glass-violet: rgba(139, 92, 246, 0.15);

  /* Dark Theme - Background */
  --homey-bg: #0a0a0a; /* Material black for dark mode */

  /* Dark Theme - Inverted text colors */
  --homey-text: #f8fafc;
  --homey-text-secondary: rgba(248, 250, 252, 0.8);
  --homey-text-muted: rgba(248, 250, 252, 0.6);

  /* Dark theme semantic colors - slightly adjusted */
  --color-success: #34d399;
  --color-warning: #fbbf24;
  --color-error: #f87171;
  --color-info: #60a5fa;
  --color-cancel: #9ca3af;
}

/* Base styles for mobile-first */
@layer base {
  * {
    @apply touch-manipulation;
  }

  html {
    overscroll-behavior: none;
    scroll-behavior: smooth;
  }

  body {
    /* Prevent text size adjust on orientation change */
    -webkit-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;

    /* Better font rendering */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    /* Base background with checkered pattern */
    background-color: var(--homey-bg);
    @apply checkered-violet;

    /* Prevent select on mobile (allow text content) */
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  /* Allow text selection for readable content */
  p,
  span,
  div[role="text"],
  [contenteditable] {
    -webkit-user-select: text;
    -moz-user-select: text;
    -ms-user-select: text;
    user-select: text;
  }

  /* Focus styles for accessibility */
  :focus-visible {
    @apply outline-none ring-2 ring-homey-violet-500 ring-offset-2 ring-offset-transparent;
  }
}

/* Enhanced component layer with semantic button styles */
@layer components {
  /* Glass card variants */
  .glass-card-subtle {
    @apply glass-card;
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.08);
  }

  .glass-card-strong {
    @apply glass-card;
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  }

  .glass-card-violet {
    @apply glass-card;
    background: var(--homey-glass-violet);
    border-color: rgba(139, 92, 246, 0.2);
    box-shadow: 0 8px 32px rgba(139, 92, 246, 0.15);
  }

  /* Enhanced semantic button styles */
  .btn-primary {
    background: var(--homey-primary);
    color: white;
    border: 1px solid var(--homey-primary);
    &:hover {
      background: var(--homey-primary-bright);
      border-color: var(--homey-primary-bright);
      transform: translateY(-1px);
      box-shadow: 0 10px 25px rgba(139, 92, 246, 0.3);
    }
  }

  .btn-success {
    background: var(--color-success);
    color: white;
    border: 1px solid var(--color-success);
    &:hover {
      background: #059669;
      border-color: #059669;
      transform: translateY(-1px);
      box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
    }
  }

  .btn-danger {
    background: var(--color-error);
    color: white;
    border: 1px solid var(--color-error);
    &:hover {
      background: #dc2626;
      border-color: #dc2626;
      transform: translateY(-1px);
      box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
    }
  }

  .btn-cancel {
    background: rgba(107, 114, 128, 0.1);
    color: var(--color-cancel);
    border: 1px solid rgba(107, 114, 128, 0.3);
    &:hover {
      background: rgba(107, 114, 128, 0.2);
      border-color: rgba(107, 114, 128, 0.5);
    }
  }

  .btn-secondary {
    background: var(--homey-glass-bg);
    color: var(--homey-text);
    border: 1px solid var(--homey-glass-border);
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: var(--homey-primary);
    }
  }
}

/* Mobile-specific optimizations */
@media (max-width: 640px) {
  :root {
    --glass-blur: 8px; /* Reduce blur for performance */
  }

  .glass-card-hover:hover {
    transform: none; /* Disable hover on mobile */
  }
}

/* Reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  :root {
    --homey-glass-border: rgba(255, 255, 255, 0.4);
    --homey-text: #ffffff;
    --homey-text-secondary: rgba(255, 255, 255, 0.9);
  }
}

/* Loading shimmer effect */
@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.shimmer {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  background-size: 200px 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
EOF

# Update GlassButton with semantic color variants
cat > src/components/ui/GlassButton.jsx << 'EOF'
import { motion } from "framer-motion";
import { forwardRef } from "react";

const GlassButton = forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      icon: Icon,
      rightIcon: RightIcon,
      loading = false,
      disabled = false,
      className = "",
      ...props
    },
    ref
  ) => {
    const variants = {
      primary: "btn-primary glass-button text-white",
      success: "btn-success text-white font-medium rounded-glass transition-all duration-300",
      danger: "btn-danger text-white font-medium rounded-glass transition-all duration-300",
      cancel: "btn-cancel font-medium rounded-glass transition-all duration-300",
      secondary: "btn-secondary font-medium rounded-glass transition-all duration-300",
      ghost: "hover:bg-surface-1 text-glass-secondary hover:text-glass font-medium rounded-glass transition-all duration-300",
    };

    const sizes = {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-3 text-sm",
      lg: "px-6 py-4 text-base",
      xl: "px-8 py-5 text-lg",
    };

    return (
      <motion.button
        ref={ref}
        className={`
          inline-flex items-center justify-center space-x-2 
          relative overflow-hidden
          ${variants[variant]} ${sizes[size]}
          ${disabled || loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}
          ${className}
        `}
        disabled={disabled || loading}
        whileTap={!disabled && !loading ? { scale: 0.95 } : {}}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <div className={`flex items-center space-x-2 ${loading ? "opacity-0" : ""}`}>
          {Icon && <Icon className="w-4 h-4" />}
          <span>{children}</span>
          {RightIcon && <RightIcon className="w-4 h-4" />}
        </div>
      </motion.button>
    );
  }
);

GlassButton.displayName = "GlassButton";
export default GlassButton;
EOF

# Update CreateHouseholdModal to use semantic button colors
cat > src/components/features/household/CreateHouseholdModal.jsx << 'EOF'
import { useState } from "react";
import { Home, Users, Plus } from "lucide-react";
import toast from "react-hot-toast";
import GlassModal from "../../ui/GlassModal.jsx";
import GlassInput from "../../ui/GlassInput.jsx";
import GlassTextarea from "../../ui/GlassTextarea.jsx";
import GlassButton from "../../ui/GlassButton.jsx";
import GlassText from "../../ui/GlassText.jsx";
import { useHousehold } from "../../../contexts/HouseholdContext.jsx";

const CreateHouseholdModal = ({ isOpen, onClose }) => {
  const { createHousehold, isCreatingHousehold } = useHousehold();
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Household name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Household name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Household name must be less than 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await createHousehold({
        name: formData.name.trim(),
        description: formData.description.trim()
      });
      
      toast.success('Household created successfully!');
      handleClose();
    } catch (error) {
      console.error('Failed to create household:', error);
      setErrors({ submit: 'Failed to create household. Please try again.' });
    }
  };

  const handleClose = () => {
    setFormData({ name: '', description: '' });
    setErrors({});
    onClose();
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Household"
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark 
                          rounded-glass-lg mx-auto flex items-center justify-center">
            <Home className="w-8 h-8 text-white" />
          </div>
          <GlassText variant="secondary">
            Set up your new household and start managing tasks, expenses, and more together.
          </GlassText>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <GlassInput
            label="Household Name"
            placeholder="The Smith Family, Roommates, etc."
            value={formData.name}
            onChange={(e) => updateFormData('name', e.target.value)}
            error={errors.name}
            icon={Users}
            required
          />

          <GlassTextarea
            label="Description (Optional)"
            placeholder="Tell us about your household..."
            value={formData.description}
            onChange={(e) => updateFormData('description', e.target.value)}
            rows={3}
          />
        </div>

        {/* Info Box */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-glass">
          <GlassText className="text-blue-300 text-sm">
            💡 As the household creator, you'll be the admin and can invite members, 
            create recurring tasks, and manage household settings.
          </GlassText>
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-glass">
            <GlassText className="text-red-300 text-sm">{errors.submit}</GlassText>
          </div>
        )}

        {/* Action Buttons with semantic colors */}
        <div className="flex space-x-3 pt-4">
          <GlassButton
            variant="cancel"
            onClick={handleClose}
            className="flex-1"
            disabled={isCreatingHousehold}
          >
            Cancel
          </GlassButton>
          
          <GlassButton
            variant="success"
            onClick={handleSubmit}
            loading={isCreatingHousehold}
            icon={Plus}
            className="flex-1"
          >
            Create Household
          </GlassButton>
        </div>
      </div>
    </GlassModal>
  );
};

export default CreateHouseholdModal;
EOF

# Update AddTaskModal to use semantic button colors
cat > src/components/features/tasks/AddTaskModal.jsx << 'EOF'
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
        <GlassInput
          label="Task Title"
          placeholder="What needs to be done?"
          value={formData.title}
          onChange={(e) => updateFormData('title', e.target.value)}
          error={errors.title}
          required
        />

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

        <GlassTextarea
          label="Description (Optional)"
          placeholder="Add any additional details..."
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          rows={3}
        />

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

        {errors.submit && (
          <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-glass">
            <GlassText className="text-red-300 text-sm">{errors.submit}</GlassText>
          </div>
        )}

        {/* Semantic button colors */}
        <div className="flex space-x-3 pt-4">
          <GlassButton
            variant="cancel"
            onClick={handleClose}
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </GlassButton>
          
          <GlassButton
            variant="success"
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
EOF

echo "✅ Theme colors and semantic buttons fixed!"
echo ""
echo "🎨 Theme improvements:"
echo "  ✅ Proper color inversion - bright purple becomes lighter in dark mode"
echo "  ✅ Better contrast for text in both themes"
echo "  ✅ Semantic color variables for consistent theming"
echo "  ✅ Enhanced glass effects with better opacity"
echo ""
echo "🔘 Semantic button colors added:"
echo "  ✅ Primary - Violet (main actions)"
echo "  ✅ Success - Green (save, create, submit)"
echo "  ✅ Danger - Red (delete, remove)"
echo "  ✅ Cancel - Gray (cancel, dismiss)"
echo "  ✅ Secondary - Glass (neutral actions)"
echo ""
echo "🚀 Now toggle between light/dark mode to see proper color inversion!"