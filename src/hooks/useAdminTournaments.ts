import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdminTournament {
  id: string;
  name: string;
  status: string;
  prize: number;
  participants: number;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  gameType: string;
  entryFee: number;
  maxTeams: number;
  roomId: string | null;
  roomPassword: string | null;
  org: string;
}

export const useAdminTournaments = () => {
  const [tournaments, setTournaments] = useState<AdminTournament[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTournaments = async () => {
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

      const { data, error } = await supabase
        .from('tournaments')
        .select(`
          *,
          tournament_registrations!tournament_registrations_tournament_id_fkey(count)
        `)
        .eq('organization', adminOrg)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTournaments = data?.map(tournament => ({
        id: tournament.id,
        name: tournament.name,
        status: tournament.status === 'upcoming' ? 'Upcoming' : 
                tournament.status === 'active' ? 'Live' : 'Completed',
        prize: tournament.prize_pool || 0,
        participants: Array.isArray(tournament.tournament_registrations) 
          ? tournament.tournament_registrations.length 
          : 0,
        startDate: tournament.start_date ? new Date(tournament.start_date).toLocaleDateString() : '',
        startTime: tournament.start_date ? new Date(tournament.start_date).toLocaleTimeString() : '',
        endDate: tournament.end_date ? new Date(tournament.end_date).toLocaleDateString() : '',
        endTime: tournament.end_date ? new Date(tournament.end_date).toLocaleTimeString() : '',
        gameType: tournament.game_type,
        entryFee: tournament.entry_fee || 0,
        maxTeams: tournament.max_teams || 0,
        roomId: tournament.room_id,
        roomPassword: tournament.room_password,
        org: adminOrg,
      })) || [];

      setTournaments(formattedTournaments);
    } catch (error) {
      console.error('Error fetching admin tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();

    // Subscribe to tournament changes
    const channel = supabase
      .channel('admin-tournaments-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tournaments' }, fetchTournaments)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tournament_registrations' }, fetchTournaments)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    tournaments,
    loading,
    refetch: fetchTournaments,
  };
};