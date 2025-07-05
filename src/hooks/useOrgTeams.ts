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

      // Get tournament registrations for this org's tournaments
      const { data: registrations } = await supabase
        .from('tournament_registrations')
        .select(`
          team_id,
          tournaments!inner(organization)
        `)
        .eq('tournaments.organization', adminOrg);

      if (!registrations || registrations.length === 0) {
        setTeams([]);
        setLoading(false);
        return;
      }

      const teamIds = [...new Set(registrations.map(reg => reg.team_id))];

      // Fetch teams with leader information
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          leader:profiles!teams_leader_id_fkey (display_name)
        `)
        .in('id', teamIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get organization bans for teams
      const { data: orgBans } = await supabase
        .from('organization_bans')
        .select('banned_team_id')
        .eq('organization', adminOrg);

      const bannedTeamIds = orgBans?.map(ban => ban.banned_team_id) || [];

      const formattedTeams: OrgTeam[] = data?.map(team => ({
        id: team.id,
        name: team.name,
        leader_id: team.leader_id,
        status: bannedTeamIds.includes(team.id) ? 'banned' : 'active',
        total_earnings: team.total_earnings || 0,
        tournaments_played: team.tournaments_played || 0,
        wins: team.wins || 0,
        created_at: team.created_at,
        leader_name: team.leader?.display_name || 'Unknown',
        has_tournament_registration: true,
      })) || [];

      setTeams(formattedTeams);
    } catch (error) {
      console.error('Error fetching org teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const banTeam = async (teamId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return { error: 'Not authenticated' };

      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('organization')
        .eq('user_id', session.user.id)
        .single();

      const adminOrg = adminProfile?.organization || 'Default Org';

      const { error } = await supabase
        .from('organization_bans')
        .insert([{
          organization: adminOrg,
          banned_team_id: teamId,
          banned_by: session.user.id,
          reason: 'Banned by organization admin'
        }]);

      if (error) throw error;

      fetchOrgTeams();
      return { success: true };
    } catch (error) {
      console.error('Error banning team:', error);
      return { error: 'Failed to ban team' };
    }
  };

  const unbanTeam = async (teamId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return { error: 'Not authenticated' };

      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('organization')
        .eq('user_id', session.user.id)
        .single();

      const adminOrg = adminProfile?.organization || 'Default Org';

      const { error } = await supabase
        .from('organization_bans')
        .delete()
        .eq('organization', adminOrg)
        .eq('banned_team_id', teamId);

      if (error) throw error;

      fetchOrgTeams();
      return { success: true };
    } catch (error) {
      console.error('Error unbanning team:', error);
      return { error: 'Failed to unban team' };
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
    banTeam,
    unbanTeam,
  };
};