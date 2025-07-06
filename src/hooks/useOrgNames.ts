import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useOrgNames = () => {
  const [orgNames, setOrgNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrgNames = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('organization')
        .not('organization', 'is', null)
        .not('organization', 'eq', '')
        .order('organization');

      if (error) throw error;

      // Get unique organization names
      const uniqueOrgs = Array.from(new Set(data?.map(profile => profile.organization) || []));
      setOrgNames(uniqueOrgs);
    } catch (error) {
      console.error('Error fetching organization names:', error);
      setOrgNames([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgNames();

    // Subscribe to real-time changes in profiles table
    const channel = supabase
      .channel('org-names-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'profiles',
        filter: 'organization=not.is.null'
      }, fetchOrgNames)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    orgNames,
    loading,
    refetch: fetchOrgNames,
  };
};