import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SystemTeam {
  id: string;
  name: string;
  leader: string;
  members: string[];
  tournaments: number;
  wins: number;
  created: string;
  status: string;
  totalEarnings: number;
}

export const useSystemTeams = () => {
  const [teams, setTeams] = useState<SystemTeam[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          team_members!team_members_team_id_fkey (
            profiles!team_members_user_id_fkey (display_name, email)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTeams = data?.map(team => {
        const memberNames = team.team_members?.map(member => 
          member.profiles?.display_name || member.profiles?.email || 'Unknown'
        ) || [];

        return {
          id: team.id,
          name: team.name,
          leader: memberNames[0] || 'Unknown',
          members: memberNames,
          tournaments: team.tournaments_played || 0,
          wins: team.wins || 0,
          created: new Date(team.created_at).toLocaleDateString(),
          status: team.status || 'Active',
          totalEarnings: team.total_earnings || 0,
        };
      }) || [];

      setTeams(formattedTeams);
    } catch (error) {
      console.error('Error fetching system teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTeam = async (teamId: string) => {
    try {
      // Delete team members first (due to foreign key constraint)
      await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId);

      // Then delete the team
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;
      
      // Refresh teams list
      fetchTeams();
      return { success: true };
    } catch (error) {
      console.error('Error deleting team:', error);
      return { error: 'Failed to delete team' };
    }
  };

  useEffect(() => {
    fetchTeams();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('system-teams-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, fetchTeams)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' }, fetchTeams)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    teams,
    loading,
    refetch: fetchTeams,
    deleteTeam,
  };
};