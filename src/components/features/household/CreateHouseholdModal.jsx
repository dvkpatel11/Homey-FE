import { Home, Plus } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useHousehold } from "../../../contexts/HouseholdContext.jsx";
import GlassButton from "../../ui/GlassButton.jsx";
import GlassInput from "../../ui/GlassInput.jsx";
import GlassModal from "../../ui/GlassModal.jsx";
import GlassText from "../../ui/GlassText.jsx";
import GlassTextarea from "../../ui/GlassTextarea.jsx";
import { CalendarDays, MapPin, Users as UsersIcon } from "lucide-react";

const CreateHouseholdModal = ({ isOpen, onClose }) => {
  const { createHousehold, isCreatingHousehold } = useHousehold();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    lease_start_date: "",
    lease_end_date: "",
    max_members: "",
    description: "",
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Household name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Household name must be at least 2 characters";
    } else if (formData.name.trim().length > 50) {
      newErrors.name = "Household name must be less than 50 characters";
    }

    if (formData.max_members) {
      const max = Number(formData.max_members);
      if (isNaN(max) || max < 1 || max > 20) {
        newErrors.max_members = "Max members must be a number between 1 and 20";
      }
    }

    if (formData.lease_start_date && isNaN(Date.parse(formData.lease_start_date))) {
      newErrors.lease_start_date = "Start date must be valid";
    }
    if (formData.lease_end_date && isNaN(Date.parse(formData.lease_end_date))) {
      newErrors.lease_end_date = "End date must be valid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await createHousehold({
        name: formData.name.trim(),
        address: formData.address.trim() || undefined,
        lease_start_date: formData.lease_start_date || undefined,
        lease_end_date: formData.lease_end_date || undefined,
        max_members: formData.max_members ? Number(formData.max_members) : undefined,
        description: formData.description.trim() || undefined,
      });

      toast.success("Household created successfully!");
      handleClose();
    } catch (error) {
      console.error("Failed to create household:", error);
      setErrors({ submit: "Failed to create household. Please try again." });
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      address: "",
      lease_start_date: "",
      lease_end_date: "",
      max_members: "",
      description: "",
    });
    setErrors({});
    onClose();
  };

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <GlassModal isOpen={isOpen} onClose={handleClose} title="Create New Household" maxWidth="md">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-glass-lg mx-auto flex items-center justify-center">
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
            onChange={(e) => updateFormData("name", e.target.value)}
            error={errors.name}
            icon={UsersIcon}
            required
          />

          <GlassInput
            label="Address"
            placeholder="123 Main St, Apt 4B, New York, NY 10001"
            value={formData.address}
            onChange={(e) => updateFormData("address", e.target.value)}
            error={errors.address}
            icon={MapPin}
          />

          <div className="flex space-x-2">
            <GlassInput
              label="Lease Start Date"
              type="date"
              value={formData.lease_start_date}
              onChange={(e) => updateFormData("lease_start_date", e.target.value)}
              error={errors.lease_start_date}
              icon={CalendarDays}
              className="flex-1"
            />
            <GlassInput
              label="Lease End Date"
              type="date"
              value={formData.lease_end_date}
              onChange={(e) => updateFormData("lease_end_date", e.target.value)}
              error={errors.lease_end_date}
              icon={CalendarDays}
              className="flex-1"
            />
          </div>

          <GlassInput
            label="Max Members"
            type="number"
            min={1}
            max={20}
            placeholder="e.g. 6"
            value={formData.max_members}
            onChange={(e) => updateFormData("max_members", e.target.value)}
            error={errors.max_members}
            icon={UsersIcon}
          />

          <GlassTextarea
            label="Description (Optional)"
            placeholder="Tell us about your household..."
            value={formData.description}
            onChange={(e) => updateFormData("description", e.target.value)}
            rows={3}
          />
        </div>

        {/* Info Box */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-glass">
          <GlassText className="text-blue-300 text-sm">
            💡 As the household creator, you'll be the admin and can invite members, create recurring tasks, and manage
            household settings.
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
          <GlassButton variant="ghost" onClick={handleClose} className="flex-1" disabled={isCreatingHousehold}>
            Cancel
          </GlassButton>

          <GlassButton
            variant="primary"
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
