import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ProfileStats {
  teamCount: number;
  tournamentCount: number;
  winRate: number;
  earnings: number;
}

export const useProfileStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ProfileStats>({
    teamCount: 0,
    tournamentCount: 0,
    winRate: 0,
    earnings: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    if (!user) {
      setStats({ teamCount: 0, tournamentCount: 0, winRate: 0, earnings: 0 });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch team count
      const { data: teamMembers } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id);

      const teamCount = teamMembers?.length || 0;

      // Fetch tournament count (through team registrations)
      let tournamentCount = 0;
      if (teamMembers && teamMembers.length > 0) {
        const teamIds = teamMembers.map(tm => tm.team_id);
        const { data: tournamentRegs } = await supabase
          .from('tournament_registrations')
          .select('tournament_id')
          .in('team_id', teamIds);
        
        tournamentCount = tournamentRegs?.length || 0;
      }

      // For now, keeping win rate and earnings as 0 since we don't have tournament results
      // These could be calculated from tournament results when that data is available
      const winRate = 0;
      const earnings = 0;

      setStats({
        teamCount,
        tournamentCount,
        winRate,
        earnings
      });
    } catch (error) {
      console.error('Error fetching profile stats:', error);
      setStats({ teamCount: 0, tournamentCount: 0, winRate: 0, earnings: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  return {
    stats,
    loading,
    refetch: fetchStats
  };
};
