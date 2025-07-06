import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface TeamJoinRequest {
  id: string;
  team_id: string;
  requester_id: string;
  requested_user_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
  teams?: {
    name: string;
    leader_id: string;
  };
  requester_profile?: {
    display_name: string;
    email: string;
  };
  requested_profile?: {
    display_name: string;
    email: string;
  };
}

export const useTeamRequests = () => {
  const { user } = useAuth();
  const [incomingRequests, setIncomingRequests] = useState<TeamJoinRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<TeamJoinRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIncomingRequests = async () => {
    if (!user) {
      setIncomingRequests([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('team_join_requests')
        .select(`
          *,
          teams!inner (name, leader_id),
          profiles!team_join_requests_requester_id_fkey (display_name, email)
        `)
        .eq('requested_user_id', user.id)
        .eq('status', 'pending');

      if (!error && data) {
        setIncomingRequests(data.map(item => ({
          ...item,
          teams: item.teams,
          requester_profile: item.profiles
        })) as TeamJoinRequest[]);
      }
    } catch (error) {
      console.error('Error fetching incoming requests:', error);
    }
  };

  const fetchOutgoingRequests = async () => {
    if (!user) {
      setOutgoingRequests([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('team_join_requests')
        .select(`
          *,
          teams!inner (name, leader_id),
          profiles!team_join_requests_requested_user_id_fkey (display_name, email)
        `)
        .eq('requester_id', user.id)
        .eq('status', 'pending');

      if (!error && data) {
        setOutgoingRequests(data.map(item => ({
          ...item,
          teams: item.teams,
          requested_profile: item.profiles
        })) as TeamJoinRequest[]);
      }
    } catch (error) {
      console.error('Error fetching outgoing requests:', error);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    await Promise.all([fetchIncomingRequests(), fetchOutgoingRequests()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();

    // Subscribe to request changes
    const requestsChannel = supabase
      .channel('team-request-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_join_requests',
        },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(requestsChannel);
    };
  }, [user]);

  const sendRequest = async (teamId: string, requestedUserId: string) => {
    if (!user) return { error: 'No user found' };

    // Check if target user already has 2 teams
    const { data: userTeams } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', requestedUserId);

    if (userTeams && userTeams.length >= 2) {
      return { error: 'User is already part of two teams.' };
    }

    // Check if any request already exists (regardless of status)
    const { data: existingRequest } = await supabase
      .from('team_join_requests')
      .select('id, status')
      .eq('team_id', teamId)
      .eq('requested_user_id', requestedUserId)
      .maybeSingle();

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        return { error: 'Request already sent to this user' };
      } else {
        // Delete old request (accepted/declined) to allow new request
        const { error: deleteError } = await supabase
          .from('team_join_requests')
          .delete()
          .eq('id', existingRequest.id);

        if (deleteError) {
          return { error: 'Failed to process previous request' };
        }
      }
    }

    const { error } = await supabase
      .from('team_join_requests')
      .insert([{
        team_id: teamId,
        requester_id: user.id,
        requested_user_id: requestedUserId,
      }]);

    return { error };
  };

  const acceptRequest = async (requestId: string) => {
    if (!user) return { error: 'No user found' };

    // Get request details
    const { data: request } = await supabase
      .from('team_join_requests')
      .select('team_id, requested_user_id')
      .eq('id', requestId)
      .single();

    if (!request) {
      return { error: 'Request not found' };
    }

    // Check if user already has 2 teams
    const { data: userTeams } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id);

    if (userTeams && userTeams.length >= 2) {
      return { error: 'You are already part of two teams' };
    }

    // Add user to team
    const { error: addError } = await supabase
      .from('team_members')
      .insert([{
        team_id: request.team_id,
        user_id: request.requested_user_id,
        role: 'member',
      }]);

    if (addError) {
      return { error: addError };
    }

    // Update request status
    const { error: updateError } = await supabase
      .from('team_join_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId);

    return { error: updateError };
  };

  const declineRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('team_join_requests')
      .update({ status: 'declined' })
      .eq('id', requestId);

    return { error };
  };

  const cancelRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('team_join_requests')
      .delete()
      .eq('id', requestId);

    return { error };
  };

  return {
    incomingRequests,
    outgoingRequests,
    loading,
    sendRequest,
    acceptRequest,
    declineRequest,
    cancelRequest,
    refetch: fetchRequests,
  };
};