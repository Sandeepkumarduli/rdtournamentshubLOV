import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UpdateRoomDialogProps {
  tournamentId: string;
  currentRoomId?: string;
  currentRoomPassword?: string;
  onUpdate: () => void;
}

const UpdateRoomDialog = ({ tournamentId, currentRoomId, currentRoomPassword, onUpdate }: UpdateRoomDialogProps) => {
  const [open, setOpen] = useState(false);
  const [roomId, setRoomId] = useState(currentRoomId || '');
  const [roomPassword, setRoomPassword] = useState(currentRoomPassword || '');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim() || !roomPassword.trim()) {
      toast({
        title: 'Error',
        description: 'Both Room ID and Password are required',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // Update tournament with room details and set to active
      const { error } = await supabase
        .from('tournaments')
        .update({
          room_id: roomId,
          room_password: roomPassword,
          status: 'active'
        })
        .eq('id', tournamentId);

      if (error) throw error;

      // Schedule tournament to complete after 1 hour
      setTimeout(async () => {
        await supabase
          .from('tournaments')
          .update({ status: 'completed' })
          .eq('id', tournamentId);
      }, 60 * 60 * 1000); // 1 hour

      toast({
        title: 'Room Details Updated',
        description: 'Tournament is now live and will auto-complete in 1 hour',
      });

      setOpen(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating room details:', error);
      toast({
        title: 'Error',
        description: 'Failed to update room details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Update Room
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Room Details</DialogTitle>
          <DialogDescription>
            Add Room ID and Password to make tournament live. It will auto-complete in 1 hour.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="roomId">Room ID</Label>
            <Input
              id="roomId"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter room ID"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roomPassword">Room Password</Label>
            <Input
              id="roomPassword"
              value={roomPassword}
              onChange={(e) => setRoomPassword(e.target.value)}
              placeholder="Enter room password"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update & Go Live'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateRoomDialog;