import { Copy, Link as LinkIcon, Share, Users } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import GlassButton from "../../components/ui/GlassButton.jsx";
import GlassContainer from "../../components/ui/GlassContainer.jsx";
import GlassHeading from "../../components/ui/GlassHeading.jsx";
import GlassSection from "../../components/ui/GlassSection.jsx";
import GlassText from "../../components/ui/GlassText.jsx";
import { useHousehold } from "../../contexts/HouseholdContext.jsx";

const InvitePage = () => {
  const { activeHousehold, generateInvite, isGeneratingInvite } = useHousehold();
  const [inviteCode, setInviteCode] = useState(null);

  const handleGenerateInvite = async () => {
    try {
      const response = await generateInvite();
      setInviteCode(response.data.invite_code);
      toast.success("Invite code generated!");
    } catch (error) {
      console.error("Failed to generate invite:", error);
      toast.error("Failed to generate invite code");
    }
  };

  const handleCopyCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      toast.success("Invite code copied to clipboard!");
    }
  };

  const handleShare = () => {
    if (navigator.share && inviteCode) {
      navigator.share({
        title: `Join ${activeHousehold?.name} on Homey`,
        text: `You've been invited to join ${activeHousehold?.name} household on Homey! Use invite code: ${inviteCode}`,
        url: window.location.origin,
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
        <GlassSection title="Invite Members" subtitle={`Invite others to join ${activeHousehold.name}`}>
          <div className="space-y-6">
            {/* Household Info */}
            <div className="flex items-center space-x-4 glass-input p-4 rounded-glass">
              <div className="w-12 h-12 bg-primary/20 rounded-glass flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-bright" />
              </div>
              <div className="flex-1">
                <GlassHeading level={4}>{activeHousehold.name}</GlassHeading>
                <GlassText variant="secondary" className="text-sm">
                  {activeHousehold.member_count} member{activeHousehold.member_count !== 1 ? "s" : ""}
                </GlassText>
              </div>
            </div>

            {/* Generate Invite */}
            {!inviteCode ? (
              <div className="text-center space-y-4">
                <GlassText variant="secondary">Generate a unique invite code to share with new members</GlassText>
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
                    <div className="text-3xl font-mono font-bold text-glass letter-spacing-widest">{inviteCode}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <GlassButton variant="secondary" onClick={handleCopyCode} icon={Copy}>
                    Copy Code
                  </GlassButton>

                  <GlassButton variant="primary" onClick={handleShare} icon={Share}>
                    Share Invite
                  </GlassButton>
                </div>

                {/* Generate New Code */}
                <div className="text-center pt-4">
                  <GlassButton variant="ghost" onClick={handleGenerateInvite} loading={isGeneratingInvite} size="sm">
                    Generate New Code
                  </GlassButton>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-glass">
              <GlassHeading level={5} className="mb-2">
                How to invite members:
              </GlassHeading>
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
