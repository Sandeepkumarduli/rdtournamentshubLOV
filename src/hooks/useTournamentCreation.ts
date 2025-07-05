import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TournamentData {
  name: string;
  description?: string;
  game_type: string;
  entry_fee?: number;
  prize_pool: number;
  max_teams?: number;
  start_date?: string;
  end_date?: string;
  rules?: string;
}

export const useTournamentCreation = () => {
  const [loading, setLoading] = useState(false);

  const createTournament = async (data: TournamentData) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return { error: 'Not authenticated' };
      }

      const { data: tournament, error } = await supabase
        .from('tournaments')
        .insert([{
          ...data,
          created_by: session.user.id,
          status: 'upcoming',
        }])
        .select()
        .single();

      if (error) throw error;

      return { data: tournament, success: true };
    } catch (error) {
      console.error('Error creating tournament:', error);
      return { error: 'Failed to create tournament' };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createTournament,
  };
};