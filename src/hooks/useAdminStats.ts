import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdminStats {
  walletBalance: number;
  tournamentsNeedingRoomUpdates: number;
  completedTournaments: number;
  liveTournaments: number;
  upcomingTournaments: number;
  totalPrizeMoneySpent: number;
  totalUsers: number;
  totalTeams: number;
  bannedTeams: number;
  bannedUsers: number;
  reportsOnOrg: number;
  reportsSubmittedByMe: number;
}

export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats>({
    walletBalance: 0,
    tournamentsNeedingRoomUpdates: 0,
    completedTournaments: 0,
    liveTournaments: 0,
    upcomingTournaments: 0,
    totalPrizeMoneySpent: 0,
    totalUsers: 0,
    totalTeams: 0,
    bannedTeams: 0,
    bannedUsers: 0,
    reportsOnOrg: 0,
    reportsSubmittedByMe: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchAdminStats = async () => {
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

      // Fetch admin's wallet balance
      const { data: adminWallet } = await supabase
        .from('wallet_balances')
        .select('balance')
        .eq('user_id', session.user.id)
        .single();

      // Fetch org tournaments created by this organization
      const { data: tournaments } = await supabase
        .from('tournaments')
        .select('*')
        .eq('organization', adminOrg);

      // Calculate tournament stats
      const tournamentsNeedingRoomUpdates = tournaments?.filter(t => 
        !t.room_id || !t.room_password
      ).length || 0;
      
      const completedTournaments = tournaments?.filter(t => 
        t.status === 'completed'
      ).length || 0;
      
      const liveTournaments = tournaments?.filter(t => 
        t.status === 'active'
      ).length || 0;
      
      const upcomingTournaments = tournaments?.filter(t => 
        t.status === 'upcoming'
      ).length || 0;

      // Calculate total prize money spent (sum of all prize pools)
      const totalPrizeMoneySpent = tournaments?.reduce((sum, t) => sum + (t.prize_pool || 0), 0) || 0;

      // Fetch org user registrations to get total users and teams
      const { data: orgRegistrations } = await supabase
        .from('org_user_registrations')
        .select('user_id, team_id, registration_type')
        .eq('org_name', adminOrg);

      // Get unique users and teams count
      const uniqueUsers = new Set(orgRegistrations?.map(reg => reg.user_id) || []);
      const uniqueTeams = new Set(orgRegistrations?.filter(reg => reg.team_id).map(reg => reg.team_id) || []);

      // Fetch organization bans
      const { data: orgBans } = await supabase
        .from('organization_bans')
        .select('banned_user_id, banned_team_id')
        .eq('organization', adminOrg);

      const bannedUsers = orgBans?.filter(ban => ban.banned_user_id).length || 0;
      const bannedTeams = orgBans?.filter(ban => ban.banned_team_id).length || 0;

      // Fetch reports about this org (where reported_entity contains the org name)
      const { data: reportsOnOrg } = await supabase
        .from('reports')
        .select('id')
        .ilike('reported_entity', `%${adminOrg}%`);

      // Fetch reports submitted by this admin
      const { data: reportsSubmittedByMe } = await supabase
        .from('reports')
        .select('id')
        .eq('reporter_id', session.user.id);

      setStats({
        walletBalance: adminWallet?.balance || 0,
        tournamentsNeedingRoomUpdates,
        completedTournaments,
        liveTournaments,
        upcomingTournaments,
        totalPrizeMoneySpent,
        totalUsers: uniqueUsers.size,
        totalTeams: uniqueTeams.size,
        bannedTeams,
        bannedUsers,
        reportsOnOrg: reportsOnOrg?.length || 0,
        reportsSubmittedByMe: reportsSubmittedByMe?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();

    // Subscribe to changes
    const channel = supabase
      .channel('admin-stats-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tournaments' }, fetchAdminStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wallet_balances' }, fetchAdminStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'org_user_registrations' }, fetchAdminStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'organization_bans' }, fetchAdminStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, fetchAdminStats)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    stats,
    loading,
    refetch: fetchAdminStats,
  };
};