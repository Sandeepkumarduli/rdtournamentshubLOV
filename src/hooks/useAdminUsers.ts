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
      // Get current admin's organization
      const auth = localStorage.getItem("userAuth");
      const adminData = auth ? JSON.parse(auth) : null;
      const adminOrg = adminData?.organization || 'FireStorm';

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization', adminOrg)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedUsers = data?.map(user => ({
        id: user.id,
        username: user.display_name || user.email || 'Unknown',
        email: user.email || '',
        status: user.role === 'banned' ? 'Suspended' : 'Active',
        joinDate: new Date(user.created_at).toLocaleDateString(),
        organization: user.organization || adminOrg,
      })) || [];

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching admin users:', error);
    } finally {
      setLoading(false);
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
  };
};