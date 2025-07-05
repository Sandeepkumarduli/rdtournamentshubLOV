import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OrgTeam {
  id: string;
  name: string;
  leader_id: string;
  status: string;
  total_earnings: number;
  tournaments_played: number;
  wins: number;
  created_at: string;
  leader_name?: string;
  has_tournament_registration?: boolean;
}

export const useOrgTeams = () => {
  const [teams, setTeams] = useState<OrgTeam[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrgTeams = async () => {
    setLoading(true);
    try {
      // Get current admin's organization from session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }

      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('organization')
        .eq('user_id', session.user.id)
        .single();

      const adminOrg = adminProfile?.organization || 'Default Org';

      // Fetch teams with leader information and tournament registrations
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          leader:profiles!teams_leader_id_fkey (display_name, organization),
          tournament_registrations!tournament_registrations_team_id_fkey (id, tournament_id, tournaments!inner(organization))
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter teams that have registered for tournaments from this organization
      const orgTeams = data?.filter(team => 
        team.tournament_registrations && 
        team.tournament_registrations.length > 0 &&
        team.tournament_registrations.some((reg: any) => 
          reg.tournaments?.organization === adminOrg
        )
      ) || [];

      const formattedTeams: OrgTeam[] = orgTeams.map(team => ({
        id: team.id,
        name: team.name,
        leader_id: team.leader_id,
        status: team.status || 'active',
        total_earnings: team.total_earnings || 0,
        tournaments_played: team.tournaments_played || 0,
        wins: team.wins || 0,
        created_at: team.created_at,
        leader_name: team.leader?.display_name || 'Unknown',
        has_tournament_registration: team.tournament_registrations.length > 0,
      }));

      setTeams(formattedTeams);
    } catch (error) {
      console.error('Error fetching org teams:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgTeams();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('org-teams-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, fetchOrgTeams)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tournament_registrations' }, fetchOrgTeams)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    teams,
    loading,
    refetch: fetchOrgTeams,
  };
};