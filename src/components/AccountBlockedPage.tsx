import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Ban, AlertTriangle, Mail, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const AccountBlockedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="gaming-card max-w-lg w-full">
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center space-y-6">
            <div className="p-6 rounded-full bg-destructive/10">
              <Ban className="h-16 w-16 text-destructive" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-destructive">Account Frozen</h2>
              <p className="text-muted-foreground max-w-md">
                Your account is frozen. You can only access the Report and Wallet pages during this time.
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              <span>Contact support to resolve this issue</span>
            </div>

            <div className="pt-4 flex gap-2">
              <Button 
                onClick={() => navigate('/dashboard/report')}
                variant="outline"
                className="flex-1"
              >
                <Mail className="h-4 w-4 mr-2" />
                File a Report
              </Button>
              <Button 
                onClick={() => navigate('/dashboard/wallet')}
                variant="outline"
                className="flex-1"
              >
                <Wallet className="h-4 w-4 mr-2" />
                View Wallet
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountBlockedPage;