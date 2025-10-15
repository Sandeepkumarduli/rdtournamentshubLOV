import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
  emailVerified: boolean;
  phoneVerified: boolean;
  onVerifyEmail: () => void;
  onVerifyPhone: () => void;
}

const ProfileCard = ({ formData, isEditing, onInputChange, emailVerified, phoneVerified, onVerifyEmail, onVerifyPhone }: ProfileCardProps) => {
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
          <Label htmlFor="email" className="flex items-center gap-2">
            Email Address
            {emailVerified ? (
              <Badge variant="default" className="bg-success text-success-foreground gap-1">
                <CheckCircle className="h-3 w-3" />
                Verified
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                Not Verified
              </Badge>
            )}
          </Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="email"
              type="email"
              value={formData.email}
              disabled={true}
              className="opacity-60 flex-1"
              placeholder="Enter your email"
            />
            {!emailVerified && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onVerifyEmail}
              >
                Verify
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {emailVerified ? 'Email is verified' : 'Email cannot be changed. Please verify your email to use all features.'}
          </p>
        </div>
        
        <div>
          <Label htmlFor="phone" className="flex items-center gap-2">
            Phone Number
            {phoneVerified ? (
              <Badge variant="default" className="bg-success text-success-foreground gap-1">
                <CheckCircle className="h-3 w-3" />
                Verified
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                Not Verified
              </Badge>
            )}
          </Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => onInputChange('phone', e.target.value)}
              disabled={!isEditing}
              placeholder="+91 9876543210"
              className="flex-1"
            />
            {!phoneVerified && formData.phone && !isEditing && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onVerifyPhone}
              >
                Verify
              </Button>
            )}
          </div>
          {!phoneVerified && (
            <p className="text-xs text-muted-foreground mt-1">
              Phone number can be changed. Please verify after updating.
            </p>
          )}
          {phoneVerified && (
            <p className="text-xs text-success mt-1">
              Phone number is verified and active.
            </p>
          )}
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
          <p className="text-xs text-muted-foreground mt-1">
            BGMI ID can be updated. Make sure it's unique and accurate.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;