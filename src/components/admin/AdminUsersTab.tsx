import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { RefreshCw, Ban, UserCheck, UserX } from 'lucide-react';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';

interface AdminUsersTabProps {
  onRefresh: () => void;
}

const AdminUsersTab = ({ onRefresh }: AdminUsersTabProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const { users, loading, refetch, banUser, unbanUser } = useAdminUsers();
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = async () => {
    try {
      await refetch();
      onRefresh();
      toast({
        title: "Data refreshed successfully",
        description: "Users data has been updated",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh users data",
        variant: "destructive"
      });
    }
  };

  const handleBanUser = async (userId: string, currentStatus: string) => {
    const result = currentStatus === 'Active' 
      ? await banUser(userId)
      : await unbanUser(userId);
    
    if (result.success) {
      toast({
        title: currentStatus === 'Active' ? 'User Banned' : 'User Unbanned',
        description: `User has been ${currentStatus === 'Active' ? 'banned from' : 'unbanned from'} organization tournaments`,
      });
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to update user status',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tournament Participants</h2>
        <div className="flex gap-2">
          <Input placeholder="Search users..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-64" />
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="space-y-6">
        {filteredUsers.map(user => <Card key={user.id} className="gaming-card px-0 py-px my-0">
            <CardContent className="p-4 px-[10px] py-[10px] gap-10 my-0 mx-[40px]">
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
                    onClick={() => handleBanUser(user.id, user.status)}
                  >
                    {user.status === "Active" ? <>
                        <Ban className="h-4 w-4 mr-2" />
                        Ban User
                      </> : <>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Unban User
                      </>}
                  </Button>
                  <Button variant="outline" size="sm">
                    <UserX className="h-4 w-4 mr-2" />
                    Remove from ORG
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>)}
      </div>
    </div>;
};
export default AdminUsersTab;