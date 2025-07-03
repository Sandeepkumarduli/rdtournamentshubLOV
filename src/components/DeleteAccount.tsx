import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';

interface DeleteAccountProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const DeleteAccount = ({ isOpen, onOpenChange, onConfirm }: DeleteAccountProps) => {
  return (
    <div className="pt-4 border-t border-destructive/20">
      <Label className="font-medium text-destructive">Danger Zone</Label>
      <div className="mt-2">
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                This action cannot be undone. You must withdraw your entire wallet balance before deleting your account.
              </p>
              <div className="flex gap-2">
                <Button variant="destructive" onClick={onConfirm} className="flex-1">
                  Confirm Delete
                </Button>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DeleteAccount;