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
        console.log('No session found for admin users');
        setLoading(false);
        return;
      }

      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('organization')
        .eq('user_id', session.user.id)
        .single();

      const adminOrg = adminProfile?.organization || 'Default Org';
      console.log('Admin organization:', adminOrg);

      // Fetch users who registered for this org's tournaments
      const { data: orgRegistrations, error: regError } = await supabase
        .from('org_user_registrations')
        .select(`
          user_id,
          username,
          team_id,
          org_name,
          tournament_id,
          registration_type,
          created_at
        `)
        .eq('org_name', adminOrg);

      if (regError) {
        console.error('Error fetching org registrations:', regError);
        setUsers([]);
        setLoading(false);
        return;
      }

      console.log('Org user registrations:', orgRegistrations);

      if (!orgRegistrations || orgRegistrations.length === 0) {
        console.log('No user registrations found for org:', adminOrg);
        setUsers([]);
        setLoading(false);
        return;
      }

      // Get organization bans for this org
      const { data: orgBans } = await supabase
        .from('organization_bans')
        .select('banned_user_id')
        .eq('organization', adminOrg);

      const bannedUserIds = orgBans?.map(ban => ban.banned_user_id) || [];

      // Format users from org registrations (remove duplicates)
      const uniqueUserMap = new Map();
      
      orgRegistrations.forEach(reg => {
        if (!uniqueUserMap.has(reg.user_id)) {
          uniqueUserMap.set(reg.user_id, {
            id: reg.user_id,
            username: reg.username,
            email: '', // We'll need to get this from profiles if needed
            status: bannedUserIds.includes(reg.user_id) ? 'Banned' : 'Active',
            joinDate: new Date(reg.created_at).toLocaleDateString(),
            organization: reg.org_name,
          });
        }
      });

      const formattedUsers = Array.from(uniqueUserMap.values());

      console.log('Final formatted users:', formattedUsers);
      setUsers(formattedUsers);
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

    // Subscribe to real-time changes
    const channel = supabase
      .channel('admin-users-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'org_user_registrations' }, fetchUsers)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'organization_bans' }, fetchUsers)
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