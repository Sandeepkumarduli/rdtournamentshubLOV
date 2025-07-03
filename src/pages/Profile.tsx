import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import ProfileCard from '@/components/ProfileCard';
import AccountStats from '@/components/AccountStats';
import DeleteAccount from '@/components/DeleteAccount';

const Profile = () => {
  const userData = JSON.parse(localStorage.getItem('userAuth') || '{}');
  
  const [formData, setFormData] = useState({
    username: userData.username || '',
    email: userData.email || '',
    phone: userData.phone || '',
    bgmiId: userData.bgmiId || ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Basic validation
    if (!formData.email || !formData.email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    if (formData.phone && formData.phone.length < 10) {
      toast({
        title: "Invalid Phone",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }

    // Update localStorage
    const updatedUserData = {
      ...userData,
      ...formData
    };
    localStorage.setItem('userAuth', JSON.stringify(updatedUserData));

    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully",
    });
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      username: userData.username || '',
      email: userData.email || '',
      phone: userData.phone || '',
      bgmiId: userData.bgmiId || ''
    });
    setIsEditing(false);
  };

  const handleDeleteAccount = () => {
    const currentBalance = userData.wallet?.balance || 0;
    
    if (currentBalance > 0) {
      toast({
        title: "Cannot Delete Account",
        description: `You must withdraw your entire balance of ${currentBalance} rdCoins before deleting your account.`,
        variant: "destructive"
      });
      setIsDeleteDialogOpen(false);
      return;
    }

    // Delete account (clear localStorage and redirect)
    localStorage.removeItem('userAuth');
    setIsDeleteDialogOpen(false);
    toast({
      title: "Account Deleted",
      description: "Your account has been permanently deleted.",
    });
    navigate('/');
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
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <ProfileCard 
          formData={formData}
          isEditing={isEditing}
          onInputChange={handleInputChange}
        />

        <AccountStats balance={userData.wallet?.balance || 100}>
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