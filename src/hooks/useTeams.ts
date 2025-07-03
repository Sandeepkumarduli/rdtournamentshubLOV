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
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching teams:', error);
      } else {
        setTeams(data || []);
      }
    };

    const fetchUserTeam = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          teams:team_id (*)
        `)
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setUserTeam(data.teams as Team);
        
        // Fetch team members
        const { data: members } = await supabase
          .from('team_members')
          .select(`
            *,
            profiles:user_id (display_name, bgmi_id)
          `)
          .eq('team_id', data.team_id);

        setTeamMembers(members || []);
      }
    };

    fetchTeams();
    fetchUserTeam();
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
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTeams(prev => [payload.new as Team, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setTeams(prev => 
              prev.map(t => t.id === payload.new.id ? payload.new as Team : t)
            );
          } else if (payload.eventType === 'DELETE') {
            setTeams(prev => prev.filter(t => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(teamsChannel);
    };
  }, [user]);

  const createTeam = async (teamName: string) => {
    if (!user) return { error: 'No user found' };

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

    return { data: team, error: null };
  };

  return {
    teams,
    userTeam,
    teamMembers,
    loading,
    createTeam,
  };
};