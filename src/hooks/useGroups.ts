import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Group {
  id: string;
  name: string;
  created_by: string;
  tournament_id?: string;
  member_count: number;
  created_at: string;
  tournament?: {
    name: string;
    prize_pool: number;
  };
}

export const useGroups = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      if (!user) return;

      // In a real implementation, you'd have a groups table
      // For now, we'll simulate tournament groups
      const { data: tournaments } = await supabase
        .from('tournaments')
        .select(`
          *,
          tournament_registrations!inner (
            team_id,
            teams!inner (
              team_members!inner (
                user_id
              )
            )
          )
        `)
        .eq('tournament_registrations.teams.team_members.user_id', user.id);

      const mockGroups = tournaments?.map(tournament => ({
        id: tournament.id,
        name: `${tournament.name} Group`,
        created_by: tournament.created_by || '',
        tournament_id: tournament.id,
        member_count: Math.floor(Math.random() * 50) + 10,
        created_at: tournament.created_at,
        tournament: {
          name: tournament.name,
          prize_pool: tournament.prize_pool || 0
        }
      })) || [];

      setGroups(mockGroups);
      setLoading(false);
    };

    fetchGroups();
  }, [user]);

  return {
    groups,
    loading,
  };
};