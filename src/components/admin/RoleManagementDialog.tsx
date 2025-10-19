import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface UserRole {
  id: string;
  role: string;
  assigned_at: string;
  assigned_by: string | null;
}

interface RoleManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  currentRoles: UserRole[];
  onRolesUpdated: () => void;
}

const RoleManagementDialog = ({
  open,
  onOpenChange,
  userId,
  userName,
  currentRoles,
  onRolesUpdated
}: RoleManagementDialogProps) => {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [roleToRemove, setRoleToRemove] = useState<UserRole | null>(null);
  const { toast } = useToast();

  const handleAssignRole = async () => {
    if (!selectedRole) {
      toast({
        title: "Error",
        description: "Please select a role to assign",
        variant: "destructive"
      });
      return;
    }

    setIsAssigning(true);
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('user_roles')
        .insert([{
          user_id: userId,
          role: selectedRole as 'user' | 'admin' | 'systemadmin',
          assigned_by: currentUser.user?.id
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${selectedRole} role assigned to ${userName}`
      });

      setSelectedRole("");
      onRolesUpdated();
    } catch (error: any) {
      console.error('Error assigning role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign role",
        variant: "destructive"
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveRole = async () => {
    if (!roleToRemove) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleToRemove.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${roleToRemove.role} role removed from ${userName}`
      });

      setRoleToRemove(null);
      onRolesUpdated();
    } catch (error: any) {
      console.error('Error removing role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove role",
        variant: "destructive"
      });
    }
  };

  const availableRoles = ['user', 'admin', 'systemadmin'].filter(
    role => !currentRoles.some(r => r.role === role)
  );

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'systemadmin':
        return 'destructive';
      case 'admin':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Manage Roles for {userName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Current Roles */}
            <div>
              <h4 className="text-sm font-medium mb-3">Current Roles</h4>
              {currentRoles.length > 0 ? (
                <div className="space-y-2">
                  {currentRoles.map((userRole) => (
                    <div
                      key={userRole.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant={getRoleBadgeVariant(userRole.role)}>
                          {userRole.role}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          Assigned {new Date(userRole.assigned_at).toLocaleDateString()}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRoleToRemove(userRole)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No roles assigned</p>
              )}
            </div>

            {/* Assign New Role */}
            {availableRoles.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3">Assign New Role</h4>
                <div className="flex gap-2">
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAssignRole}
                    disabled={!selectedRole || isAssigning}
                  >
                    Assign
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Role Removal */}
      <AlertDialog open={!!roleToRemove} onOpenChange={() => setRoleToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the <strong>{roleToRemove?.role}</strong> role from{" "}
              <strong>{userName}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveRole} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default RoleManagementDialog;
