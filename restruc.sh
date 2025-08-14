#!/bin/bash

echo "Creating household onboarding wizard and fixing task components..."

# Create household onboarding wizard
cat > src/components/features/household/HouseholdOnboarding.jsx << 'EOF'
import { useState } from "react";
import { Users, Plus, UserPlus, Home, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CreateHouseholdModal from "./CreateHouseholdModal.jsx";
import JoinHouseholdModal from "./JoinHouseholdModal.jsx";
import GlassContainer from "../../ui/GlassContainer.jsx";
import GlassButton from "../../ui/GlassButton.jsx";
import GlassHeading from "../../ui/GlassHeading.jsx";
import GlassText from "../../ui/GlassText.jsx";
import { useHousehold } from "../../../contexts/HouseholdContext.jsx";

const HouseholdOnboarding = () => {
  const { households, isLoading } = useHousehold();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-homey-bg checkered-violet flex items-center justify-center p-6">
        <GlassContainer variant="strong" padding="lg" className="max-w-md w-full text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <GlassText variant="secondary">Loading your households...</GlassText>
        </GlassContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-homey-bg checkered-violet flex items-center justify-center p-6">
      <motion.div
        className="max-w-lg w-full space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Welcome Header */}
        <div className="text-center space-y-4">
          <motion.div
            className="w-20 h-20 bg-gradient-to-br from-primary to-primary-dark 
                       rounded-glass-xl mx-auto flex items-center justify-center shadow-glass-violet"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <Home className="w-10 h-10 text-white" />
          </motion.div>
          
          <div>
            <GlassHeading level={1} className="mb-2">Welcome to Homey</GlassHeading>
            <GlassText variant="secondary" className="text-lg">
              Your smart household management companion
            </GlassText>
          </div>
        </div>

        {/* Onboarding Options */}
        <GlassContainer variant="strong" padding="lg">
          <div className="space-y-6">
            <div className="text-center">
              <GlassHeading level={3} className="mb-2">Get Started</GlassHeading>
              <GlassText variant="secondary">
                Create a new household or join an existing one
              </GlassText>
            </div>

            <div className="space-y-4">
              {/* Create Household Option */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <GlassButton
                  variant="primary"
                  size="lg"
                  icon={Plus}
                  rightIcon={ArrowRight}
                  onClick={() => setShowCreateModal(true)}
                  className="w-full justify-between"
                >
                  <div className="text-left">
                    <div className="font-medium">Create New Household</div>
                    <div className="text-sm opacity-80">Start fresh and invite others</div>
                  </div>
                </GlassButton>
              </motion.div>

              {/* Join Household Option */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <GlassButton
                  variant="secondary"
                  size="lg"
                  icon={UserPlus}
                  rightIcon={ArrowRight}
                  onClick={() => setShowJoinModal(true)}
                  className="w-full justify-between"
                >
                  <div className="text-left">
                    <div className="font-medium">Join Existing Household</div>
                    <div className="text-sm opacity-70">Use an invite code</div>
                  </div>
                </GlassButton>
              </motion.div>
            </div>

            {/* Existing Households */}
            {households && households.length > 0 && (
              <div className="pt-6 border-t border-glass-border">
                <GlassText variant="secondary" className="text-sm mb-3">
                  Your Households:
                </GlassText>
                <div className="space-y-2">
                  {households.map((household) => (
                    <div
                      key={household.id}
                      className="flex items-center space-x-3 glass-input p-3 rounded-glass"
                    >
                      <Users className="w-4 h-4 text-glass-muted flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-glass truncate">{household.name}</div>
                        <div className="text-xs text-glass-muted">
                          {household.member_count} member{household.member_count !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </GlassContainer>

        {/* Feature Preview */}
        <GlassContainer variant="subtle" padding="md">
          <div className="text-center space-y-3">
            <GlassHeading level={4}>What's Inside</GlassHeading>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-amber-500/20 rounded-md flex items-center justify-center">
                  📋
                </div>
                <span className="text-glass-secondary">Task Management</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-emerald-500/20 rounded-md flex items-center justify-center">
                  💰
                </div>
                <span className="text-glass-secondary">Bill Splitting</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-500/20 rounded-md flex items-center justify-center">
                  💬
                </div>
                <span className="text-glass-secondary">Group Chat</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-purple-500/20 rounded-md flex items-center justify-center">
                  📊
                </div>
                <span className="text-glass-secondary">Analytics</span>
              </div>
            </div>
          </div>
        </GlassContainer>
      </motion.div>

      {/* Modals */}
      <CreateHouseholdModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      
      <JoinHouseholdModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
      />
    </div>
  );
};

export default HouseholdOnboarding;
EOF

# Create CreateHouseholdModal
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

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <GlassButton
            variant="ghost"
            onClick={handleClose}
            className="flex-1"
            disabled={isCreatingHousehold}
          >
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
EOF

# Create JoinHouseholdModal
cat > src/components/features/household/JoinHouseholdModal.jsx << 'EOF'
import { useState } from "react";
import { UserPlus, Key, Users } from "lucide-react";
import toast from "react-hot-toast";
import GlassModal from "../../ui/GlassModal.jsx";
import GlassInput from "../../ui/GlassInput.jsx";
import GlassButton from "../../ui/GlassButton.jsx";
import GlassText from "../../ui/GlassText.jsx";
import { authAPI } from "../../../lib/api/index.js";

const JoinHouseholdModal = ({ isOpen, onClose }) => {
  const [inviteCode, setInviteCode] = useState('');
  const [householdInfo, setHouseholdInfo] = useState(null);
  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const validateInviteCode = async () => {
    if (!inviteCode.trim()) {
      setErrors({ code: 'Please enter an invite code' });
      return;
    }

    setIsValidating(true);
    setErrors({});

    try {
      const response = await authAPI.validateInvite(inviteCode.trim());
      setHouseholdInfo(response.data);
    } catch (error) {
      console.error('Failed to validate invite:', error);
      setErrors({ 
        code: error.response?.data?.message || 'Invalid invite code. Please check and try again.' 
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
      console.error('Failed to join household:', error);
      setErrors({ 
        submit: error.response?.data?.message || 'Failed to join household. Please try again.' 
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleClose = () => {
    setInviteCode('');
    setHouseholdInfo(null);
    setErrors({});
    onClose();
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setInviteCode(value);
    setHouseholdInfo(null);
    if (errors.code) {
      setErrors(prev => ({ ...prev, code: undefined }));
    }
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Join Household"
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 
                          rounded-glass-lg mx-auto flex items-center justify-center">
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
                  {householdInfo.member_count} member{householdInfo.member_count !== 1 ? 's' : ''} • 
                  Admin: {householdInfo.admin_name}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-glass">
          <GlassText className="text-emerald-300 text-sm">
            🔗 Ask a household member to share their invite code with you. 
            You can find invite codes in the household settings.
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
            disabled={isJoining}
          >
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
EOF

# Create the household pages directory and files
mkdir -p src/pages/household

cat > src/pages/household/CreateHouseholdPage.jsx << 'EOF'
import HouseholdOnboarding from "../../components/features/household/HouseholdOnboarding.jsx";

const CreateHouseholdPage = () => {
  return <HouseholdOnboarding />;
};

export default CreateHouseholdPage;
EOF

cat > src/pages/household/JoinHouseholdPage.jsx << 'EOF'
import HouseholdOnboarding from "../../components/features/household/HouseholdOnboarding.jsx";

const JoinHouseholdPage = () => {
  return <HouseholdOnboarding />;
};

export default JoinHouseholdPage;
EOF

cat > src/pages/household/InvitePage.jsx << 'EOF'
import { useState } from "react";
import { Copy, Share, Users, Link as LinkIcon } from "lucide-react";
import toast from "react-hot-toast";
import GlassContainer from "../../components/ui/GlassContainer.jsx";
import GlassSection from "../../components/ui/GlassSection.jsx";
import GlassButton from "../../components/ui/GlassButton.jsx";
import GlassText from "../../components/ui/GlassText.jsx";
import GlassHeading from "../../components/ui/GlassHeading.jsx";
import { useHousehold } from "../../contexts/HouseholdContext.jsx";

const InvitePage = () => {
  const { activeHousehold, generateInvite, isGeneratingInvite } = useHousehold();
  const [inviteCode, setInviteCode] = useState(null);

  const handleGenerateInvite = async () => {
    try {
      const response = await generateInvite();
      setInviteCode(response.data.invite_code);
      toast.success('Invite code generated!');
    } catch (error) {
      console.error('Failed to generate invite:', error);
      toast.error('Failed to generate invite code');
    }
  };

  const handleCopyCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      toast.success('Invite code copied to clipboard!');
    }
  };

  const handleShare = () => {
    if (navigator.share && inviteCode) {
      navigator.share({
        title: `Join ${activeHousehold?.name} on Homey`,
        text: `You've been invited to join ${activeHousehold?.name} household on Homey! Use invite code: ${inviteCode}`,
        url: window.location.origin
      });
    } else {
      handleCopyCode();
    }
  };

  if (!activeHousehold) {
    return (
      <div className="space-y-6">
        <GlassContainer variant="default" className="text-center">
          <GlassText variant="muted">Please select a household to generate invites.</GlassText>
        </GlassContainer>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <GlassContainer variant="strong" padding="lg">
        <GlassSection 
          title="Invite Members"
          subtitle={`Invite others to join ${activeHousehold.name}`}
        >
          <div className="space-y-6">
            {/* Household Info */}
            <div className="flex items-center space-x-4 glass-input p-4 rounded-glass">
              <div className="w-12 h-12 bg-primary/20 rounded-glass flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-bright" />
              </div>
              <div className="flex-1">
                <GlassHeading level={4}>{activeHousehold.name}</GlassHeading>
                <GlassText variant="secondary" className="text-sm">
                  {activeHousehold.member_count} member{activeHousehold.member_count !== 1 ? 's' : ''}
                </GlassText>
              </div>
            </div>

            {/* Generate Invite */}
            {!inviteCode ? (
              <div className="text-center space-y-4">
                <GlassText variant="secondary">
                  Generate a unique invite code to share with new members
                </GlassText>
                <GlassButton
                  variant="primary"
                  onClick={handleGenerateInvite}
                  loading={isGeneratingInvite}
                  icon={LinkIcon}
                  size="lg"
                >
                  Generate Invite Code
                </GlassButton>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Invite Code Display */}
                <div className="text-center space-y-3">
                  <GlassText variant="secondary">Share this code with new members:</GlassText>
                  <div className="glass-card glass-card-violet p-6 rounded-glass-lg">
                    <div className="text-3xl font-mono font-bold text-glass letter-spacing-widest">
                      {inviteCode}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <GlassButton
                    variant="secondary"
                    onClick={handleCopyCode}
                    icon={Copy}
                  >
                    Copy Code
                  </GlassButton>
                  
                  <GlassButton
                    variant="primary"
                    onClick={handleShare}
                    icon={Share}
                  >
                    Share Invite
                  </GlassButton>
                </div>

                {/* Generate New Code */}
                <div className="text-center pt-4">
                  <GlassButton
                    variant="ghost"
                    onClick={handleGenerateInvite}
                    loading={isGeneratingInvite}
                    size="sm"
                  >
                    Generate New Code
                  </GlassButton>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-glass">
              <GlassHeading level={5} className="mb-2">How to invite members:</GlassHeading>
              <ol className="text-sm text-blue-300 space-y-1 list-decimal list-inside">
                <li>Share the invite code with the person you want to invite</li>
                <li>They should download Homey and create an account</li>
                <li>During onboarding, they can choose "Join Household" and enter the code</li>
                <li>Once they join, they'll have access to your household's tasks and expenses</li>
              </ol>
            </div>
          </div>
        </GlassSection>
      </GlassContainer>
    </div>
  );
};

export default InvitePage;
EOF

echo "✅ Household onboarding system created!"
echo ""
echo "📁 Created files:"
echo "  - src/components/features/household/HouseholdOnboarding.jsx (Main onboarding wizard)"
echo "  - src/components/features/household/CreateHouseholdModal.jsx (Create household flow)"
echo "  - src/components/features/household/JoinHouseholdModal.jsx (Join household flow)"
echo "  - src/pages/household/CreateHouseholdPage.jsx"
echo "  - src/pages/household/JoinHouseholdPage.jsx"
echo "  - src/pages/household/InvitePage.jsx (Invite management)"
echo ""
echo "🎯 Now you need to update your App.jsx to show HouseholdOnboarding when no household is selected!"
echo ""
echo "Add this logic to App.jsx in the AppContent component:"
echo ""
echo "  // Show onboarding if no households exist"
echo "  if (households.length === 0) {"
echo "    return <HouseholdOnboarding />;"
echo "  }"
echo ""
echo "🚀 This will let users create/join households before accessing the task system!"