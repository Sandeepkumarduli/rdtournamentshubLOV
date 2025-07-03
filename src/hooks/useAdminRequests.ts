import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdminRequest {
  id: string;
  username: string;
  email: string;
  reason: string;
  status: string;
  date: string;
  bgmiId: string;
  experience: string;
}

export const useAdminRequests = () => {
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_requests')
        .select(`
          *,
          profiles!admin_requests_user_id_fkey (display_name, email, bgmi_id, experience)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedRequests = data?.map(request => ({
        id: request.id,
        username: request.profiles?.display_name || request.profiles?.email || 'Unknown',
        email: request.profiles?.email || '',
        reason: request.reason,
        status: request.status || 'pending',
        date: new Date(request.created_at).toLocaleDateString(),
        bgmiId: request.profiles?.bgmi_id || 'Not Set',
        experience: request.experience || 'Not Specified',
      })) || [];

      setRequests(formattedRequests);
    } catch (error) {
      console.error('Error fetching admin requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (requestId: string) => {
    try {
      const auth = localStorage.getItem("userAuth");
      const user = auth ? JSON.parse(auth) : null;
      const systemAdminId = user?.user_id;

      if (!systemAdminId) {
        return { error: 'Not authenticated' };
      }

      const { error } = await supabase
        .from('admin_requests')
        .update({
          status: 'approved',
          reviewed_by: systemAdminId,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;

      // Update the user's role to admin
      const request = requests.find(r => r.id === requestId);
      if (request) {
        await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('email', request.email);
      }

      fetchRequests();
      return { success: true };
    } catch (error) {
      console.error('Error approving request:', error);
      return { error: 'Failed to approve request' };
    }
  };

  const rejectRequest = async (requestId: string) => {
    try {
      const auth = localStorage.getItem("userAuth");
      const user = auth ? JSON.parse(auth) : null;
      const systemAdminId = user?.user_id;

      if (!systemAdminId) {
        return { error: 'Not authenticated' };
      }

      const { error } = await supabase
        .from('admin_requests')
        .update({
          status: 'rejected',
          reviewed_by: systemAdminId,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;

      fetchRequests();
      return { success: true };
    } catch (error) {
      console.error('Error rejecting request:', error);
      return { error: 'Failed to reject request' };
    }
  };

  useEffect(() => {
    fetchRequests();

    const channel = supabase
      .channel('admin-requests-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_requests' }, fetchRequests)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    requests,
    loading,
    refetch: fetchRequests,
    approveRequest,
    rejectRequest,
  };
};