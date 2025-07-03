import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { User, Mail, Phone, Gamepad, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

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
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>
        {!isEditing ? (
          <Button variant="gaming-outline" onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="gaming" onClick={handleSave}>
              Save Changes
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card className="gaming-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                disabled={true}
                className="opacity-60"
              />
              <p className="text-xs text-muted-foreground mt-1">Username cannot be changed</p>
            </div>
            
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled={true}
                className="opacity-60"
                placeholder="Enter your email"
              />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter your phone number"
              />
            </div>
            
            <div>
              <Label htmlFor="bgmiId">BGMI ID</Label>
              <Input
                id="bgmiId"
                value={formData.bgmiId}
                onChange={(e) => handleInputChange('bgmiId', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter your BGMI player ID"
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Stats */}
        <Card className="gaming-card">
          <CardHeader>
            <CardTitle>Account Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-sm font-medium">Account Type</Label>
              <div className="mt-1">
                <Badge variant="default">Player</Badge>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Member Since</Label>
              <p className="text-lg mt-1">January 2024</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Current Balance</Label>
              <p className="text-lg font-semibold text-gaming-gold mt-1">
                {userData.wallet?.balance || 100} rdCoins
              </p>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-medium">Gaming Statistics</Label>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-3 rounded-lg bg-muted/20">
                  <p className="text-muted-foreground">Tournaments</p>
                  <p className="text-xl font-bold">0</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/20">
                  <p className="text-muted-foreground">Win Rate</p>
                  <p className="text-xl font-bold">0%</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/20">
                  <p className="text-muted-foreground">Teams</p>
                  <p className="text-xl font-bold">0</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/20">
                  <p className="text-muted-foreground">Earnings</p>
                  <p className="text-xl font-bold">₹0</p>
                </div>
              </div>
            </div>

            {/* Delete Account Section */}
            <div className="pt-4 border-t border-destructive/20">
              <Label className="text-sm font-medium text-destructive">Danger Zone</Label>
              <div className="mt-2">
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Account</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        This action cannot be undone. You must withdraw your entire wallet balance before deleting your account.
                      </p>
                      <div className="flex gap-2">
                        <Button variant="destructive" onClick={handleDeleteAccount} className="flex-1">
                          Confirm Delete
                        </Button>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;