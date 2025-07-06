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

  const fetchUserTeams = async () => {
    if (!user) {
      setUserTeams([]);
      setTeamMembersMap({});
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
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
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserTeams();

    // Subscribe to team changes and team member changes
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
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_members',
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

  const joinTeam = async (teamId: string) => {
    if (!user) return { error: 'No user found' };

    // Check if user already has 2 teams
    if (userTeams.length >= 2) {
      return { error: 'Maximum 2 teams allowed per user' };
    }

    // Check if team exists
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .select('id, name')
      .eq('id', teamId)
      .single();

    if (teamError || !teamData) {
      return { error: 'Team not found' };
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .single();

    if (existingMember) {
      return { error: 'You are already a member of this team' };
    }

    // Check team member limit
    const { data: currentMembers } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId);

    if (currentMembers && currentMembers.length >= 5) {
      return { error: 'Team is full (maximum 5 members)' };
    }

    // Add user to team
    const { error } = await supabase
      .from('team_members')
      .insert([{
        team_id: teamId,
        user_id: user.id,
        role: 'member',
      }]);

    return { error };
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

  const deleteTeam = async (teamId: string) => {
    if (!user) return { error: 'No user found' };

    // Check if current user is team leader
    const { data: teamData } = await supabase
      .from('teams')
      .select('leader_id')
      .eq('id', teamId)
      .single();

    if (!teamData || teamData.leader_id !== user.id) {
      return { error: 'Only team leader can delete the team' };
    }

    // Delete team members first
    const { error: membersError } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId);

    if (membersError) {
      console.error('Error deleting team members:', membersError);
      return { error: typeof membersError === 'string' ? membersError : membersError.message };
    }

    // Delete the team
    const { error: teamError } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);

    if (teamError) {
      console.error('Error deleting team:', teamError);
      return { error: typeof teamError === 'string' ? teamError : teamError.message };
    }

    return { success: true };
  };

  const removeMemberFromTeam = async (teamId: string, memberUserId: string) => {
    if (!user) return { error: 'No user found' };

    // Check if current user is team leader
    const { data: teamData } = await supabase
      .from('teams')
      .select('leader_id')
      .eq('id', teamId)
      .single();

    if (!teamData || teamData.leader_id !== user.id) {
      return { error: 'Only team leader can remove members' };
    }

    // Cannot remove the leader
    if (memberUserId === user.id) {
      return { error: 'Team leader cannot be removed. Delete the team instead.' };
    }

    // Remove member
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', memberUserId);

    return { error };
  };

  const leaveTeam = async (teamId: string) => {
    if (!user) return { error: 'No user found' };

    // Check if user is team leader
    const { data: teamData } = await supabase
      .from('teams')
      .select('leader_id')
      .eq('id', teamId)
      .single();

    if (teamData && teamData.leader_id === user.id) {
      return { error: 'Team leaders cannot leave. Delete the team instead or transfer leadership first.' };
    }

    // Remove user from team
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', user.id);

    return { error };
  };

  const refetch = async () => {
    await fetchUserTeams();
  };

  return {
    teams,
    userTeams,
    teamMembersMap,
    loading,
    createTeam,
    addTeamMember,
    joinTeam,
    deleteTeam,
    removeMemberFromTeam,
    leaveTeam,
    refetch,
  };
};