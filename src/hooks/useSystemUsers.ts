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
  isFrozen?: boolean;
}

export const useSystemUsers = () => {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_freeze_status(
            is_frozen,
            frozen_at,
            frozen_by
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedUsers = data?.map(profile => {
        const freezeStatus = profile.user_freeze_status?.[0]; // Get first record
        return {
          id: profile.user_id, // Use user_id instead of id
          username: profile.display_name || profile.email || 'Unknown',
          email: profile.email || '',
          bgmiId: profile.bgmi_id || 'Not Set',
          phone: '(Not Available)', // Phone not in profiles table
          createdAt: new Date(profile.created_at).toLocaleDateString(),
          status: freezeStatus?.is_frozen ? 'Frozen' : 'Active',
          organization: profile.organization || 'None',
          role: profile.role || 'user',
          isFrozen: freezeStatus?.is_frozen || false,
        };
      }) || [];

      console.log('Database profiles with freeze status:', data?.map(p => ({ 
        user_id: p.user_id, 
        role: p.role, 
        display_name: p.display_name,
        freeze_status: p.user_freeze_status 
      })));
      
      console.log('Formatted users with status:', formattedUsers.map(u => ({ 
        id: u.id, 
        username: u.username, 
        status: u.status, 
        role: u.role,
        isFrozen: u.isFrozen 
      })));
      
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
      
      // Get current admin info
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      // Insert or update freeze status
      const { error } = await supabase
        .from('user_freeze_status')
        .upsert({
          user_id: userId,
          is_frozen: true,
          frozen_at: new Date().toISOString(),
          frozen_by: currentUser?.id,
          reason: 'Frozen by system administrator'
        });

      if (error) {
        console.error('Database freeze error:', error);
        throw error;
      }
      
      // Verify the update
      const { data: freezeStatus, error: verifyError } = await supabase
        .from('user_freeze_status')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      console.log('Freeze status after update:', freezeStatus);
      
      if (verifyError) {
        console.error('Error verifying freeze update:', verifyError);
      }
      
      // Force immediate UI update
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, status: 'Frozen', isFrozen: true }
            : user
        )
      );
      
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
      
      // Get current admin info
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      // Update freeze status
      const { error } = await supabase
        .from('user_freeze_status')
        .upsert({
          user_id: userId,
          is_frozen: false,
          unfrozen_at: new Date().toISOString(),
          unfrozen_by: currentUser?.id
        });

      if (error) {
        console.error('Database unfreeze error:', error);
        throw error;
      }
      
      // Verify the update
      const { data: freezeStatus, error: verifyError } = await supabase
        .from('user_freeze_status')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      console.log('Freeze status after unfreeze update:', freezeStatus);
      
      if (verifyError) {
        console.error('Error verifying unfreeze update:', verifyError);
      }
      
      // Force immediate UI update
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, status: 'Active', isFrozen: false }
            : user
        )
      );
      
      console.log('User unfrozen successfully');
      return { success: true };
    } catch (error) {
      console.error('Error unfreezing user:', error);
      return { error: 'Failed to unfreeze user' };
    }
  };

  useEffect(() => {
    fetchUsers();

    // Subscribe to real-time changes for both profiles and freeze status
    const profileChannel = supabase
      .channel('system-users-profiles')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'profiles' 
      }, (payload) => {
        console.log('Profiles real-time update:', payload);
        fetchUsers();
      })
      .subscribe();

    const freezeChannel = supabase
      .channel('system-users-freeze-status')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'user_freeze_status' 
      }, (payload) => {
        console.log('Freeze status real-time update:', payload);
        fetchUsers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(freezeChannel);
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