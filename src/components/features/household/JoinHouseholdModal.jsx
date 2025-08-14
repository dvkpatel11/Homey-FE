import { Key, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { authAPI } from "../../../lib/api/index.js";
import GlassButton from "../../ui/GlassButton.jsx";
import GlassInput from "../../ui/GlassInput.jsx";
import GlassModal from "../../ui/GlassModal.jsx";
import GlassText from "../../ui/GlassText.jsx";

const JoinHouseholdModal = ({ isOpen, onClose }) => {
  const [inviteCode, setInviteCode] = useState("");
  const [householdInfo, setHouseholdInfo] = useState(null);
  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const validateInviteCode = async () => {
    if (!inviteCode.trim()) {
      setErrors({ code: "Please enter an invite code" });
      return;
    }

    setIsValidating(true);
    setErrors({});

    try {
      const response = await authAPI.validateInvite(inviteCode.trim());
      setHouseholdInfo(response.data);
    } catch (error) {
      console.error("Failed to validate invite:", error);
      setErrors({
        code: error.response?.data?.message || "Invalid invite code. Please check and try again.",
      });
      setHouseholdInfo(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleJoinHousehold = async () => {
    setIsJoining(true);
    try {
      await authAPI.joinHousehold(inviteCode.trim());
      toast.success(`Successfully joined ${householdInfo.name}!`);
      handleClose();
      // Refresh page to load new household data
      window.location.reload();
    } catch (error) {
      console.error("Failed to join household:", error);
      setErrors({
        submit: error.response?.data?.message || "Failed to join household. Please try again.",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleClose = () => {
    setInviteCode("");
    setHouseholdInfo(null);
    setErrors({});
    onClose();
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setInviteCode(value);
    setHouseholdInfo(null);
    if (errors.code) {
      setErrors((prev) => ({ ...prev, code: undefined }));
    }
  };

  return (
    <GlassModal isOpen={isOpen} onClose={handleClose} title="Join Household" maxWidth="md">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div
            className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 
                          rounded-glass-lg mx-auto flex items-center justify-center"
          >
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <GlassText variant="secondary">
            Enter the invite code shared by a household member to join their household.
          </GlassText>
        </div>

        {/* Invite Code Input */}
        <div className="space-y-4">
          <GlassInput
            label="Invite Code"
            placeholder="ABCD1234"
            value={inviteCode}
            onChange={handleCodeChange}
            error={errors.code}
            icon={Key}
            rightIcon={!householdInfo && inviteCode.length >= 6 ? UserPlus : undefined}
            onRightIconClick={validateInviteCode}
            maxLength={8}
            required
          />

          {inviteCode.length >= 6 && !householdInfo && (
            <GlassButton
              variant="secondary"
              onClick={validateInviteCode}
              loading={isValidating}
              icon={Key}
              className="w-full"
            >
              Validate Code
            </GlassButton>
          )}
        </div>

        {/* Household Info Preview */}
        {householdInfo && (
          <div className="p-4 glass-input rounded-glass border-l-4 border-l-emerald-400">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-glass flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-glass mb-1">{householdInfo.name}</h4>
                {householdInfo.description && (
                  <p className="text-glass-secondary text-sm mb-2">{householdInfo.description}</p>
                )}
                <div className="text-glass-muted text-xs">
                  {householdInfo.member_count} member{householdInfo.member_count !== 1 ? "s" : ""} • Admin:{" "}
                  {householdInfo.admin_name}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-glass">
          <GlassText className="text-emerald-300 text-sm">
            🔗 Ask a household member to share their invite code with you. You can find invite codes in the household
            settings.
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
          <GlassButton variant="ghost" onClick={handleClose} className="flex-1" disabled={isJoining}>
            Cancel
          </GlassButton>

          <GlassButton
            variant="primary"
            onClick={handleJoinHousehold}
            loading={isJoining}
            icon={UserPlus}
            className="flex-1"
            disabled={!householdInfo}
          >
            Join Household
          </GlassButton>
        </div>
      </div>
    </GlassModal>
  );
};

export default JoinHouseholdModal;
