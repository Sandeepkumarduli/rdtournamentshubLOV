import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

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
  const { user } = useAuth();

  useEffect(() => {
    const fetchTournaments = async () => {
      if (!user) {
        setTournaments([]);
        setLoading(false);
        return;
      }

      // Get all tournaments first
      const { data: allTournaments, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tournaments:', error);
        setLoading(false);
        return;
      }

      // Get user's teams
      const { data: userTeams } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id);

      const teamIds = userTeams?.map(t => t.team_id) || [];

      // Get organization bans for this user and their teams
      const { data: bans } = await supabase
        .from('organization_bans')
        .select('organization, banned_user_id, banned_team_id')
        .or(`banned_user_id.eq.${user.id},banned_team_id.in.(${teamIds.join(',')})`);

      // Get list of organizations that banned this user or their teams
      const bannedOrgs = new Set(bans?.map(ban => ban.organization) || []);

      // Filter out tournaments from organizations that banned the user or their teams
      const filteredTournaments = allTournaments?.filter(tournament => {
        // If tournament has no organization, show it
        if (!tournament.organization) return true;
        // If tournament is from a banned organization, hide it
        return !bannedOrgs.has(tournament.organization);
      }) || [];

      setTournaments(filteredTournaments);
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
  }, [user]);

  const createTournament = async (tournament: Omit<Tournament, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('tournaments')
      .insert([tournament])
      .select()
      .single();

    return { data, error };
  };

  const refetch = async () => {
    if (!user) {
      setTournaments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Get all tournaments first
    const { data: allTournaments, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tournaments:', error);
      setLoading(false);
      return;
    }

    // Get user's teams
    const { data: userTeams } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id);

    const teamIds = userTeams?.map(t => t.team_id) || [];

    // Get organization bans for this user and their teams
    const { data: bans } = await supabase
      .from('organization_bans')
      .select('organization, banned_user_id, banned_team_id')
      .or(`banned_user_id.eq.${user.id},banned_team_id.in.(${teamIds.join(',')})`);

    // Get list of organizations that banned this user or their teams
    const bannedOrgs = new Set(bans?.map(ban => ban.organization) || []);

    // Filter out tournaments from organizations that banned the user or their teams
    const filteredTournaments = allTournaments?.filter(tournament => {
      // If tournament has no organization, show it
      if (!tournament.organization) return true;
      // If tournament is from a banned organization, hide it
      return !bannedOrgs.has(tournament.organization);
    }) || [];

    setTournaments(filteredTournaments);
    setLoading(false);
  };

  return {
    tournaments,
    loading,
    createTournament,
    refetch,
  };
};