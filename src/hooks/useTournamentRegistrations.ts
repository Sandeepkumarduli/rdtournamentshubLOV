import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';

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
    room_id: string | null;
    room_password: string | null;
    organization: string | null;
  };
}

export const useTournamentRegistrations = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
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
            description,
            room_id,
            room_password,
            organization
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
    
    // Prevent frozen users from registering
    if (profile?.role === 'frozen') {
      return { error: 'Account is frozen. You cannot register for tournaments. Contact support to resolve.' };
    }

    // Check if already registered
    const { data: existingReg } = await supabase
      .from('tournament_registrations')
      .select('id')
      .eq('tournament_id', tournamentId)
      .eq('team_id', teamId)
      .maybeSingle();

    if (existingReg) {
      return { error: 'Already registered for this tournament' };
    }

    // Get tournament info to check for organization bans
    const { data: tournament } = await supabase
      .from('tournaments')
      .select('organization')
      .eq('id', tournamentId)
      .single();

    if (tournament?.organization) {
      // Check if user is banned from this organization
      const { data: userBan } = await supabase
        .from('organization_bans')
        .select('id')
        .eq('organization', tournament.organization)
        .eq('banned_user_id', user.id)
        .maybeSingle();

      if (userBan) {
        return { error: `You have been banned from ${tournament.organization} Org. You cannot join tournaments hosted by this Org.` };
      }

      // Check if team is banned from this organization
      const { data: teamBan } = await supabase
        .from('organization_bans')
        .select('id')
        .eq('organization', tournament.organization)
        .eq('banned_team_id', teamId)
        .maybeSingle();

      if (teamBan) {
        return { error: `Your team has been banned from ${tournament.organization} Org. You cannot join tournaments hosted by this Org.` };
      }
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
    if (!user) {
      setRegistrations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
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
          description,
          room_id,
          room_password,
          organization
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

  return {
    registrations,
    loading,
    registerForTournament,
    refreshRegistrations,
  };
};