import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdminTournament {
  id: string;
  name: string;
  status: string;
  prize: number;
  participants: number;
  startDate: string;
  org: string;
}

export const useAdminTournaments = () => {
  const [tournaments, setTournaments] = useState<AdminTournament[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      // Get current admin's organization
      const auth = localStorage.getItem("userAuth");
      const adminData = auth ? JSON.parse(auth) : null;
      const adminOrg = adminData?.organization || 'FireStorm';

      const { data, error } = await supabase
        .from('tournaments')
        .select(`
          *,
          tournament_registrations!tournament_registrations_tournament_id_fkey(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter tournaments by admin's organization if they have created_by matching admin's profile
      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('organization', adminOrg)
        .eq('role', 'admin')
        .single();

      const orgTournaments = data?.filter(tournament => 
        tournament.created_by === adminProfile?.user_id
      ) || [];

      const formattedTournaments = orgTournaments.map(tournament => ({
        id: tournament.id,
        name: tournament.name,
        status: tournament.status === 'upcoming' ? 'Upcoming' : 
                tournament.status === 'active' ? 'Active' : 'Completed',
        prize: tournament.prize_pool || 0,
        participants: Array.isArray(tournament.tournament_registrations) 
          ? tournament.tournament_registrations.length 
          : 0,
        startDate: tournament.start_date ? new Date(tournament.start_date).toLocaleDateString() : '',
        org: adminOrg,
      }));

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