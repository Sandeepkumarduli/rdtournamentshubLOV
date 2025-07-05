import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Snowflake, AlertTriangle } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';

const FrozenAccountBanner = () => {
  const { profile } = useProfile();

  if (profile?.role !== 'frozen') return null;

  return (
    <Alert className="border-destructive bg-destructive/10 text-destructive mb-6">
      <div className="flex items-center gap-2">
        <Snowflake className="h-4 w-4" />
        <AlertTriangle className="h-4 w-4" />
      </div>
      <AlertTitle>Account Frozen</AlertTitle>
      <AlertDescription>
        Your account has been temporarily frozen. You can only file reports during this time. 
        All other features including tournaments, wallet transactions, and team management are restricted. 
        Please contact support to resolve this issue.
      </AlertDescription>
    </Alert>
  );
};

export default FrozenAccountBanner;