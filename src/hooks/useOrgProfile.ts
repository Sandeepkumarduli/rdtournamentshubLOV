import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OrgProfile {
  id: string;
  user_id: string;
  organization: string;
  display_name: string;
  email: string;
  role: string;
  created_at: string;
}

export const useOrgProfile = () => {
  const [profile, setProfile] = useState<OrgProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const auth = localStorage.getItem("userAuth");
      const user = auth ? JSON.parse(auth) : null;
      
      if (!user?.user_id) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.user_id)
        .single();

      if (error) throw error;

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrgProfile = async (updates: Partial<OrgProfile>) => {
    try {
      const auth = localStorage.getItem("userAuth");
      const user = auth ? JSON.parse(auth) : null;
      
      if (!user?.user_id) {
        return { error: 'Not authenticated' };
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.user_id);

      if (error) throw error;

      // Update localStorage if organization changed
      if (updates.organization) {
        const updatedAuth = { ...user, organization: updates.organization };
        localStorage.setItem("userAuth", JSON.stringify(updatedAuth));
      }

      fetchProfile();
      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { error: 'Failed to update profile' };
    }
  };

  useEffect(() => {
    fetchProfile();

    // Subscribe to profile changes
    const channel = supabase
      .channel('profile-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, fetchProfile)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    profile,
    loading,
    updateOrgProfile,
    refetch: fetchProfile,
  };
};