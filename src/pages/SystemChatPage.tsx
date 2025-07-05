import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Clock } from 'lucide-react';
import SystemAdminSidebar from "@/components/SystemAdminSidebar";

const SystemChatPage = () => {
  return (
    <div className="min-h-screen flex bg-background">
      <SystemAdminSidebar />
      
      <div className="flex-1 flex flex-col">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">System Chat Center</h1>
                <p className="text-muted-foreground">Communication tools for system administration</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Card className="gaming-card">
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center space-y-6">
                <div className="p-6 rounded-full bg-primary/10">
                  <MessageSquare className="h-16 w-16 text-primary" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">System Chat Feature Coming Soon</h2>
                  <p className="text-muted-foreground max-w-md">
                    We're working hard to bring you an amazing system communication experience. 
                    Stay tuned for updates!
                  </p>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Feature under development</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default SystemChatPage;