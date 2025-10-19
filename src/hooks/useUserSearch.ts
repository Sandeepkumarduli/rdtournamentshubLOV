import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserSearchResult {
  user_id: string;
  display_name: string;
  unique_code: string;
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

    // Only search if exactly 5 digits
    if (!/^\d{5}$/.test(query.trim())) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, unique_code, bgmi_id, role')
        .eq('unique_code', query.trim())
        .not('role', 'in', '("admin","systemadmin","frozen")')
        .limit(1);

      console.log('🔍 User search for code:', query.trim(), 'Result:', data);

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