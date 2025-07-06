import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SystemUser {
  id: string;
  username: string;
  email: string;
  bgmiId: string;
  phone: string;
  createdAt: string;
  status: string;
  organization?: string;
  role?: string;
}

export const useSystemUsers = () => {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedUsers = data?.map(profile => ({
        id: profile.user_id, // Use user_id instead of id
        username: profile.display_name || profile.email || 'Unknown',
        email: profile.email || '',
        bgmiId: profile.bgmi_id || 'Not Set',
        phone: '(Not Available)', // Phone not in profiles table
        createdAt: new Date(profile.created_at).toLocaleDateString(),
        status: profile.role === 'banned' ? 'Inactive' : profile.role === 'frozen' ? 'Frozen' : 'Active',
        organization: profile.organization || 'None',
        role: profile.role || 'user',
      })) || [];

      console.log('Formatted users with status:', formattedUsers.map(u => ({ id: u.id, username: u.username, status: u.status, role: u.role })));
      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching system users:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // First delete from profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (profileError) throw profileError;
      
      // Refresh users list
      fetchUsers();
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { error: 'Failed to delete user' };
    }
  };

  const freezeUser = async (userId: string) => {
    try {
      console.log('Freezing user:', userId);
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'frozen' })
        .eq('user_id', userId);

      if (error) throw error;
      
      // Force immediate refetch to ensure UI updates
      await fetchUsers();
      console.log('User frozen successfully');
      return { success: true };
    } catch (error) {
      console.error('Error freezing user:', error);
      return { error: 'Failed to freeze user' };
    }
  };

  const unfreezeUser = async (userId: string) => {
    try {
      console.log('Unfreezing user:', userId);
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'user' })
        .eq('user_id', userId);

      if (error) throw error;
      
      // Force immediate refetch to ensure UI updates
      await fetchUsers();
      console.log('User unfrozen successfully');
      return { success: true };
    } catch (error) {
      console.error('Error unfreezing user:', error);
      return { error: 'Failed to unfreeze user' };
    }
  };

  useEffect(() => {
    fetchUsers();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('system-users-changes')
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
    deleteUser,
    freezeUser,
    unfreezeUser,
  };
};