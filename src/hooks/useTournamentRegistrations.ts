import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface TournamentRegistration {
  id: string;
  tournament_id: string;
  team_id: string;
  registered_at: string;
  tournaments: {
    id: string;
    name: string;
    game_type: string;
    entry_fee: number;
    prize_pool: number;
    start_date: string | null;
    end_date: string | null;
    status: string;
    description: string | null;
  };
}

export const useTournamentRegistrations = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRegistrations([]);
      setLoading(false);
      return;
    }

    const fetchRegistrations = async () => {
      // Get user's teams first
      const { data: userTeams } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id);

      if (!userTeams || userTeams.length === 0) {
        setRegistrations([]);
        setLoading(false);
        return;
      }

      const teamIds = userTeams.map(t => t.team_id);

      // Get tournament registrations for user's teams
      const { data: regsData, error } = await supabase
        .from('tournament_registrations')
        .select(`
          *,
          tournaments (
            id,
            name,
            game_type,
            entry_fee,
            prize_pool,
            start_date,
            end_date,
            status,
            description
          )
        `)
        .in('team_id', teamIds);

      if (error) {
        console.error('Error fetching tournament registrations:', error);
      } else {
        setRegistrations(regsData || []);
      }
      setLoading(false);
    };

    fetchRegistrations();

    // Subscribe to registration changes
    const channel = supabase
      .channel('tournament-registration-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournament_registrations',
        },
        () => {
          fetchRegistrations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const registerForTournament = async (tournamentId: string, teamId: string) => {
    if (!user) return { error: 'No user found' };

    // Check if already registered
    const { data: existingReg } = await supabase
      .from('tournament_registrations')
      .select('id')
      .eq('tournament_id', tournamentId)
      .eq('team_id', teamId)
      .single();

    if (existingReg) {
      return { error: 'Already registered for this tournament' };
    }

    const { data, error } = await supabase
      .from('tournament_registrations')
      .insert([{
        tournament_id: tournamentId,
        team_id: teamId
      }])
      .select()
      .single();

    return { data, error };
  };

  const refreshRegistrations = async () => {
    setLoading(true);
    // Trigger useEffect by updating a dependency or call fetchRegistrations directly
    window.location.reload(); // Temporary solution, better to extract fetchRegistrations
  };

  return {
    registrations,
    loading,
    registerForTournament,
    refreshRegistrations,
  };
};