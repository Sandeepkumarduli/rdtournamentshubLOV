import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import ProfileCard from '@/components/ProfileCard';
import AccountStats from '@/components/AccountStats';
import DeleteAccount from '@/components/DeleteAccount';
import ChangePasswordDialog from '@/components/ChangePasswordDialog';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useWallet } from '@/hooks/useWallet';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Key } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const { balance } = useWallet();
  const [formData, setFormData] = useState({
    username: profile?.display_name || '',
    email: profile?.email || '',
    phone: '',
    bgmiId: profile?.bgmi_id || ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.display_name || '',
        email: profile.email || '',
        phone: '',
        bgmiId: profile.bgmi_id || ''
      });
    }
  }, [profile]);

  if (profileLoading) {
    return <LoadingSpinner fullScreen />;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    // Basic validation
    if (!formData.email || !formData.email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    const { error } = await updateProfile({
      display_name: formData.username,
      email: formData.email,
      bgmi_id: formData.bgmiId
    });

    if (error) {
      toast({
        title: "Error",
        description: typeof error === 'string' ? error : error.message,
        variant: "destructive"
      });
      return;
    }

    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully",
    });
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      username: profile?.display_name || '',
      email: profile?.email || '',
      phone: '',
      bgmiId: profile?.bgmi_id || ''
    });
    setIsEditing(false);
  };

  const handleDeleteAccount = async () => {
    const currentBalance = balance?.balance || 0;
    
    if (currentBalance > 0) {
      toast({
        title: "Cannot Delete Account",
        description: `You must withdraw your entire balance of ${currentBalance} rdCoins before deleting your account.`,
        variant: "destructive"
      });
      setIsDeleteDialogOpen(false);
      return;
    }

    // Note: In a real app, you'd implement proper account deletion
    setIsDeleteDialogOpen(false);
    toast({
      title: "Account Deletion",
      description: "Contact support to delete your account.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Profile</h1>
          <p className="text-lg text-muted-foreground">Manage your account information</p>
        </div>
        {!isEditing ? (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="default" onClick={handleSave}>
              Save Changes
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        )}
        
        <ChangePasswordDialog>
          <Button variant="outline" size="sm">
            <Key className="h-4 w-4 mr-2" />
            Change Password
          </Button>
        </ChangePasswordDialog>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <ProfileCard 
          formData={formData}
          isEditing={isEditing}
          onInputChange={handleInputChange}
        />

        <AccountStats balance={balance?.balance || 0}>
          <DeleteAccount
            isOpen={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onConfirm={handleDeleteAccount}
          />
        </AccountStats>
      </div>
    </div>
  );
};

export default Profile;