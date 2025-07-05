import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Team {
  id: string;
  name: string;
  leader_id: string;
  status: string;
  total_earnings: number;
  tournaments_played: number;
  wins: number;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profiles: {
    display_name: string;
    bgmi_id: string;
  };
}

export const useTeams = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [teamMembersMap, setTeamMembersMap] = useState<Record<string, TeamMember[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserTeams = async () => {
      if (!user) return;

      // Fetch teams where user is a member
      const { data: memberData, error } = await supabase
        .from('team_members')
        .select(`
          *,
          teams:team_id (*)
        `)
        .eq('user_id', user.id);

      if (!error && memberData) {
        const teams = memberData.map(member => member.teams as Team);
        setUserTeams(teams);
        
        // Fetch members for each team
        const membersMap: Record<string, TeamMember[]> = {};
        
        for (const team of teams) {
          const { data: members } = await supabase
            .from('team_members')
            .select(`
              *,
              profiles:user_id (display_name, bgmi_id)
            `)
            .eq('team_id', team.id);

          membersMap[team.id] = members || [];
        }
        
        setTeamMembersMap(membersMap);
      }
    };

    fetchUserTeams();
    setLoading(false);

    // Subscribe to team changes
    const teamsChannel = supabase
      .channel('team-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'teams',
        },
        () => {
          fetchUserTeams();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(teamsChannel);
    };
  }, [user]);

  const createTeam = async (teamName: string, memberEmails?: string[]) => {
    if (!user) return { error: 'No user found' };

    // Check team limit (2 teams max)
    if (userTeams.length >= 2) {
      return { error: 'Maximum 2 teams allowed per user' };
    }

    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert([{
        name: teamName,
        leader_id: user.id,
      }])
      .select()
      .single();

    if (teamError) return { error: teamError };

    // Add creator as team leader
    const { error: memberError } = await supabase
      .from('team_members')
      .insert([{
        team_id: team.id,
        user_id: user.id,
        role: 'leader',
      }]);

    if (memberError) return { error: memberError };

    // Add initial members if provided (placeholder for now)
    // In real implementation, you'd look up users by email first

    return { data: team, error: null };
  };

  const addTeamMember = async (teamId: string, userIdToAdd: string) => {
    if (!user) return { error: 'No user found' };

    // Check if current user is team leader
    const { data: teamData } = await supabase
      .from('teams')
      .select('leader_id')
      .eq('id', teamId)
      .single();

    if (!teamData || teamData.leader_id !== user.id) {
      return { error: 'Only team leader can add members' };
    }

    // Check team member limit (5 members max)
    const { data: currentMembers } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId);

    if (currentMembers && currentMembers.length >= 5) {
      return { error: 'Team is full (maximum 5 members)' };
    }

    // Add member
    const { error } = await supabase
      .from('team_members')
      .insert([{
        team_id: teamId,
        user_id: userIdToAdd,
        role: 'member',
      }]);

    return { error };
  };

  return {
    teams,
    userTeams,
    teamMembersMap,
    loading,
    createTeam,
    addTeamMember,
  };
};