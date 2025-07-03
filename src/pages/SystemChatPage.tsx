import React from 'react';
import SystemAdminSidebar from '@/components/SystemAdminSidebar';
import SystemChat from '@/components/SystemChat';
import TopBar from '@/components/TopBar';
import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';

const SystemChatPage = () => {
  return (
    <div className="min-h-screen flex bg-background">
      <SystemAdminSidebar />
      
      <div className="flex-1 flex flex-col">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-xl font-bold">System Chat Center</h1>
                  <p className="text-muted-foreground">Master Communication Hub</p>
                </div>
              </div>
              
              <TopBar userType="system" />
              
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="border-primary text-primary">
                  <Crown className="h-3 w-3 mr-1" />
                  System Admin
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <SystemChat />
        </main>
      </div>
    </div>
  );
};

export default SystemChatPage;