import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OrgReport {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  resolution?: string;
  created_at: string;
  resolved_at?: string;
  isSubmittedByOrg?: boolean;
}

export const useOrgReports = () => {
  const [reports, setReports] = useState<OrgReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setReports([]);
        setLoading(false);
        return;
      }

      // Get the admin's organization
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization, role')
        .eq('user_id', session.user.id)
        .single();

      if (!profile?.organization || profile.role !== 'admin') {
        setReports([]);
        setLoading(false);
        return;
      }

      // Get reports submitted BY the organization admin only
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('reporter_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedReports = data?.map(report => ({
        id: report.id,
        type: report.type,
        title: report.title,
        description: report.description,
        priority: report.priority || 'medium',
        status: report.status || 'pending',
        resolution: report.resolution || undefined,
        created_at: report.created_at,
        resolved_at: report.resolved_at || undefined,
        isSubmittedByOrg: report.reporter_id === session.user.id,
      })) || [];

      setReports(formattedReports);
    } catch (error) {
      console.error('Error fetching org reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();

    // Subscribe to real-time changes for reports table
    const channel = supabase
      .channel('org-reports-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'reports'
      }, () => {
        // Refresh reports when any change occurs
        fetchReports();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(reports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReports = reports.slice(startIndex, startIndex + itemsPerPage);

  return {
    reports: paginatedReports,
    totalReports: reports.length,
    loading,
    currentPage,
    totalPages,
    setCurrentPage,
    refetch: fetchReports,
  };
};