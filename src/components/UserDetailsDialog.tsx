import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { SystemUser } from '@/hooks/useSystemUsers';
import { supabase } from '@/integrations/supabase/client';

interface UserDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: SystemUser | null;
}

interface UserStats {
  matchesPlayed: number;
  teamsCount: number;
}

const UserDetailsDialog = ({ isOpen, onClose, user }: UserDetailsDialogProps) => {
  const [userStats, setUserStats] = useState<UserStats>({ matchesPlayed: 0, teamsCount: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      fetchUserStats();
    }
  }, [user, isOpen]);

  const fetchUserStats = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get tournaments/matches played count
      const { data: registrations } = await supabase
        .from('org_user_registrations')
        .select('id')
        .eq('user_id', user.id);

      // Get teams count (both as member and leader)
      const { data: teamMemberships } = await supabase
        .from('team_members')
        .select('id')
        .eq('user_id', user.id);

      const { data: teamsLed } = await supabase
        .from('teams')
        .select('id')
        .eq('leader_id', user.id);

      setUserStats({
        matchesPlayed: registrations?.length || 0,
        teamsCount: (teamMemberships?.length || 0) + (teamsLed?.length || 0)
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

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
          <div>
            <span className="text-sm text-muted-foreground">Tournaments Played:</span>
            <div className="font-medium">{loading ? 'Loading...' : userStats.matchesPlayed}</div>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Teams:</span>
            <div className="font-medium">{loading ? 'Loading...' : userStats.teamsCount}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsDialog;