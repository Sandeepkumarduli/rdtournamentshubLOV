import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { RefreshCw, Ban, UserCheck, UserX } from 'lucide-react';

interface AdminUsersTabProps {
  onRefresh: () => void;
}

const AdminUsersTab = ({ onRefresh }: AdminUsersTabProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const mockUsers = [
    { id: 1, username: "PlayerOne", email: "player1@example.com", status: "Active", joinDate: "2024-01-15", wallet: 450 },
    { id: 2, username: "GamerPro", email: "gamer@example.com", status: "Active", joinDate: "2024-01-20", wallet: 1200 },
    { id: 3, username: "SquadLeader", email: "squad@example.com", status: "Suspended", joinDate: "2024-01-10", wallet: 800 },
  ];

  const filteredUsers = mockUsers.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">ORG Members</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="gaming-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">{user.username}</h3>
                  <Badge variant={user.status === "Active" ? "default" : "destructive"}>
                    {user.status}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant={user.status === "Active" ? "destructive" : "default"} 
                    size="sm"
                  >
                    {user.status === "Active" ? (
                      <>
                        <Ban className="h-4 w-4 mr-2" />
                        Ban User
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Unban User
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm">
                    <UserX className="h-4 w-4 mr-2" />
                    Remove from ORG
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminUsersTab;