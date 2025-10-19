import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Search, 
  Eye, 
  UserPlus, 
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Snowflake,
  AlertTriangle,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import SystemAdminSidebar from "@/components/SystemAdminSidebar";
import LoadingSpinner from "@/components/LoadingSpinner";
import UserDetailsDialog from "@/components/UserDetailsDialog";
import RoleManagementDialog from "@/components/admin/RoleManagementDialog";
import { useSystemUsers, SystemUser } from "@/hooks/useSystemUsers";
import { supabase } from "@/integrations/supabase/client";

const SystemUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [userToFreeze, setUserToFreeze] = useState<{id: string, username: string, status: string} | null>(null);
  const [roleManagementUser, setRoleManagementUser] = useState<{id: string, username: string} | null>(null);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const { toast } = useToast();
  const { users, loading: usersLoading, refetch, deleteUser, freezeUser, unfreezeUser } = useSystemUsers();
  
  const usersPerPage = 20;

  const fetchUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      setUserRoles(data || []);
    } catch (error) {
      console.error('Error fetching user roles:', error);
      setUserRoles([]);
    }
  };

  const handleManageRoles = async (userId: string, username: string) => {
    await fetchUserRoles(userId);
    setRoleManagementUser({ id: userId, username });
  };

  const handleDeleteUser = async (userId: string) => {
    const result = await deleteUser(userId);
    if (result.success) {
      toast({
        title: "User Deleted",
        description: "User has been permanently removed from the platform",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  const handleFreezeUser = async (userId: string, currentStatus: string, username: string) => {
    console.log('handleFreezeUser called with:', { userId, currentStatus, username });
    
    // Find the user to check if they're a system admin
    const user = users.find(u => u.id === userId);
    if (user?.role === 'systemadmin') {
      toast({
        title: "Cannot Freeze System Admin",
        description: "System administrator accounts cannot be frozen.",
        variant: "destructive"
      });
      return;
    }
    
    // If unfreezing, proceed directly
    if (currentStatus === 'Frozen') {
      const result = await unfreezeUser(userId);
      
      if (result.success) {
        toast({
          title: "User Unfrozen",
          description: "User account has been reactivated with full access.",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to unfreeze user",
          variant: "destructive"
        });
      }
      return;
    }

    // For freezing, show confirmation modal
    setUserToFreeze({ id: userId, username, status: currentStatus });
  };

  const confirmFreezeUser = async () => {
    if (!userToFreeze) return;

    const result = await freezeUser(userToFreeze.id);
    
    if (result.success) {
      toast({
        title: "User Frozen",
        description: "User account has been frozen. They can only access Wallet and Report pages now.",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to freeze user",
        variant: "destructive"
      });
    }
    
    setUserToFreeze(null);
  };

  const handleAddUser = async () => {
    // For now, redirect to the regular signup page
    // In a production system, you'd want a dedicated admin user creation form
    window.open('/signup', '_blank');
    toast({
      title: "Create New User",
      description: "Opening signup page in new tab for user creation",
    });
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Data Refreshed",
      description: "User data fetched successfully",
    });
  };

  if (usersLoading) {
    return <LoadingSpinner fullScreen />;
  }

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.bgmiId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  );

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  const handleViewUser = (user: SystemUser) => {
    setSelectedUser(user);
  };

  return (
    <div className="min-h-screen flex bg-background">
      <SystemAdminSidebar />
      
      <div className="flex-1 flex flex-col">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">User Management</h1>
                <p className="text-muted-foreground">Manage all platform users</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={handleAddUser}>
                  <UserPlus className="h-4 w-4" />
                  Add User
                </Button>
                <Button variant="outline" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6">
          {/* Search and Stats */}
          <div className="flex items-center justify-between">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by username, email, BGMI ID, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Total Users:</span>
                  <span className="font-bold">{users.length}</span>
                </div>
              </Card>
            </div>
          </div>

          {/* Users List */}
          <div className="space-y-4">
            {paginatedUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold">{user.username}</h3>
                        <Badge variant={user.status === "Active" ? "default" : "secondary"}>
                          {user.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Email:</span>
                          <div className="font-medium">{user.email}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">BGMI ID:</span>
                          <div className="font-medium">{user.bgmiId}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Phone:</span>
                          <div className="font-medium">{user.phone}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Created:</span>
                          <div className="font-medium">{user.createdAt}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <div className="font-medium">{user.status}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewUser(user)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleManageRoles(user.id, user.username)}
                      >
                        <Shield className="h-4 w-4" />
                      </Button>
                      {/* Only show freeze button for non-system admins */}
                      {user.role !== 'systemadmin' && (
                        <Button 
                          variant={user.status === 'Frozen' ? "default" : "outline"} 
                          size="sm"
                          onClick={() => handleFreezeUser(user.id, user.status, user.username)}
                        >
                          <Snowflake className="h-4 w-4" />
                          {user.status === 'Frozen' ? 'Unfreeze' : 'Freeze'}
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-destructive" />
                              Delete User Account
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              You are about to delete this player. Please ensure all funds are withdrawn first.
                              This action cannot be undone and will remove all related data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteUser(user.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete User
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {paginatedUsers.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No users found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria</p>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </main>

        {/* User Details Dialog */}
        <UserDetailsDialog
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          user={selectedUser}
        />

        {/* Role Management Dialog */}
        {roleManagementUser && (
          <RoleManagementDialog
            open={!!roleManagementUser}
            onOpenChange={(open) => !open && setRoleManagementUser(null)}
            userId={roleManagementUser.id}
            userName={roleManagementUser.username}
            currentRoles={userRoles}
            onRolesUpdated={() => {
              fetchUserRoles(roleManagementUser.id);
              refetch();
            }}
          />
        )}

        {/* Freeze Confirmation Dialog */}
        <AlertDialog open={!!userToFreeze} onOpenChange={() => setUserToFreeze(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Snowflake className="h-5 w-5 text-primary" />
                Freeze User Account
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to freeze <strong>{userToFreeze?.username}</strong>? 
                They will lose access to most features and can only use Wallet and Report pages.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmFreezeUser}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Confirm Freeze
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default SystemUserManagement;