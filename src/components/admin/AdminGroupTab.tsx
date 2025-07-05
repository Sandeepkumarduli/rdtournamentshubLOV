import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Clock } from 'lucide-react';

const AdminGroupTab = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Admin Group Management</h1>
          <p className="text-lg text-muted-foreground">Advanced group management tools</p>
        </div>
      </div>

      <Card className="gaming-card">
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center space-y-6">
            <div className="p-6 rounded-full bg-primary/10">
              <Users className="h-16 w-16 text-primary" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Admin Group Management Coming Soon</h2>
              <p className="text-muted-foreground max-w-md">
                We're working on advanced group management features for organization administrators. 
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
    </div>
  );
};

export default AdminGroupTab;