import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Tournament {
  id: string;
  name: string;
  description: string | null;
  game_type: string;
  entry_fee: number;
  prize_pool: number;
  max_teams: number | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  rules: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  organization: string | null;
}

export const useTournaments = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tournaments:', error);
      } else {
        setTournaments(data || []);
      }
      setLoading(false);
    };

    fetchTournaments();

    // Subscribe to tournament changes
    const channel = supabase
      .channel('tournament-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournaments',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTournaments(prev => [payload.new as Tournament, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setTournaments(prev => 
              prev.map(t => t.id === payload.new.id ? payload.new as Tournament : t)
            );
          } else if (payload.eventType === 'DELETE') {
            setTournaments(prev => prev.filter(t => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const createTournament = async (tournament: Omit<Tournament, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('tournaments')
      .insert([tournament])
      .select()
      .single();

    return { data, error };
  };

  const refetch = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tournaments:', error);
    } else {
      setTournaments(data || []);
    }
    setLoading(false);
  };

  return {
    tournaments,
    loading,
    createTournament,
    refetch,
  };
};