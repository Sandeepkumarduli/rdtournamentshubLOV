import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserSearchResult {
  user_id: string;
  display_name: string;
  email: string;
  bgmi_id: string | null;
  role?: string | null;
}

export const useUserSearch = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<UserSearchResult[]>([]);

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, email, bgmi_id, role')
        .or(`display_name.ilike.%${query}%,email.ilike.%${query}%`)
        .not('role', 'in', '("admin","systemadmin")')
        .limit(10);

      if (error) {
        console.error('Error searching users:', error);
        setResults([]);
      } else {
        setResults(data || []);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return {
    loading,
    results,
    searchUsers,
    clearResults,
  };
};