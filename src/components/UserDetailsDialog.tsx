import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { SystemUser } from '@/hooks/useSystemUsers';

interface UserDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: SystemUser | null;
}

const UserDetailsDialog = ({ isOpen, onClose, user }: UserDetailsDialogProps) => {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <span className="text-sm text-muted-foreground">Full Name:</span>
            <div className="font-medium">{user.username}</div>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Email:</span>
            <div className="font-medium">{user.email}</div>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Phone:</span>
            <div className="font-medium">{user.phone}</div>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">BGMI ID:</span>
            <div className="font-medium">{user.bgmiId}</div>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Account Created:</span>
            <div className="font-medium">{user.createdAt}</div>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Organization:</span>
            <div className="font-medium">{user.organization}</div>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge variant={user.status === "Active" ? "default" : "secondary"}>
              {user.status}
            </Badge>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Role:</span>
            <Badge variant="outline">{user.role}</Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsDialog;