import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';

interface ProfileData {
  username: string;
  email: string;
  phone: string;
  bgmiId: string;
}

interface ProfileCardProps {
  formData: ProfileData;
  isEditing: boolean;
  onInputChange: (field: string, value: string) => void;
}

const ProfileCard = ({ formData, isEditing, onInputChange }: ProfileCardProps) => {
  return (
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
            className="opacity-60 mt-2"
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
            className="opacity-60 mt-2"
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
            onChange={(e) => onInputChange('phone', e.target.value)}
            disabled={!isEditing}
            placeholder="Enter your phone number"
            className="mt-2"
          />
        </div>
        
        <div>
          <Label htmlFor="bgmiId">BGMI ID</Label>
          <Input
            id="bgmiId"
            value={formData.bgmiId}
            onChange={(e) => onInputChange('bgmiId', e.target.value)}
            disabled={!isEditing}
            placeholder="Enter your BGMI player ID"
            className="mt-2"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;