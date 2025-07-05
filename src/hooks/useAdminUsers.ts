import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  status: string;
  joinDate: string;
  organization: string;
}

export const useAdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Get current admin's organization from session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }

      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('organization')
        .eq('user_id', session.user.id)
        .single();

      const adminOrg = adminProfile?.organization || 'Default Org';

      // Fetch users who joined this org's tournaments
      const { data: tournamentRegistrations } = await supabase
        .from('tournament_registrations')
        .select(`
          team_id,
          tournaments!inner(organization)
        `)
        .eq('tournaments.organization', adminOrg);

      if (!tournamentRegistrations || tournamentRegistrations.length === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }

      const teamIds = tournamentRegistrations.map(reg => reg.team_id);

      // Get team members from these teams
      const { data: teamMembers } = await supabase
        .from('team_members')
        .select(`
          user_id,
          profiles!inner(*)
        `)
        .in('team_id', teamIds);

      // Get organization bans for this org
      const { data: orgBans } = await supabase
        .from('organization_bans')
        .select('banned_user_id')
        .eq('organization', adminOrg);

      const bannedUserIds = orgBans?.map(ban => ban.banned_user_id) || [];

      const formattedUsers = teamMembers?.map(member => ({
        id: member.profiles.id,
        username: member.profiles.display_name || member.profiles.email || 'Unknown',
        email: member.profiles.email || '',
        status: bannedUserIds.includes(member.profiles.user_id) ? 'Banned' : 'Active',
        joinDate: new Date(member.profiles.created_at).toLocaleDateString(),
        organization: member.profiles.organization || adminOrg,
      })) || [];

      // Remove duplicates based on user_id
      const uniqueUsers = formattedUsers.filter((user, index, self) => 
        index === self.findIndex(u => u.id === user.id)
      );

      setUsers(uniqueUsers);
    } catch (error) {
      console.error('Error fetching admin users:', error);
    } finally {
      setLoading(false);
    }
  };

  const banUser = async (userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return { error: 'Not authenticated' };

      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('organization')
        .eq('user_id', session.user.id)
        .single();

      const adminOrg = adminProfile?.organization || 'Default Org';

      const { error } = await supabase
        .from('organization_bans')
        .insert([{
          organization: adminOrg,
          banned_user_id: userId,
          banned_by: session.user.id,
          reason: 'Banned by organization admin'
        }]);

      if (error) throw error;

      fetchUsers();
      return { success: true };
    } catch (error) {
      console.error('Error banning user:', error);
      return { error: 'Failed to ban user' };
    }
  };

  const unbanUser = async (userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return { error: 'Not authenticated' };

      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('organization')
        .eq('user_id', session.user.id)
        .single();

      const adminOrg = adminProfile?.organization || 'Default Org';

      const { error } = await supabase
        .from('organization_bans')
        .delete()
        .eq('organization', adminOrg)
        .eq('banned_user_id', userId);

      if (error) throw error;

      fetchUsers();
      return { success: true };
    } catch (error) {
      console.error('Error unbanning user:', error);
      return { error: 'Failed to unban user' };
    }
  };

  useEffect(() => {
    fetchUsers();

    // Subscribe to profile changes
    const channel = supabase
      .channel('admin-users-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchUsers)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    users,
    loading,
    refetch: fetchUsers,
    banUser,
    unbanUser,
  };
};