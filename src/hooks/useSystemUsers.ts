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
        id: profile.id,
        username: profile.display_name || profile.email || 'Unknown',
        email: profile.email || '',
        bgmiId: profile.bgmi_id || 'Not Set',
        phone: '(Not Available)', // Phone not in profiles table
        createdAt: new Date(profile.created_at).toLocaleDateString(),
        status: profile.role === 'banned' ? 'Inactive' : 'Active',
        organization: profile.organization || 'None',
        role: profile.role || 'user',
      })) || [];

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching system users:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // In a real implementation, you might soft delete or update status
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'banned' })
        .eq('id', userId);

      if (error) throw error;
      
      // Refresh users list
      fetchUsers();
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { error: 'Failed to delete user' };
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
  };
};