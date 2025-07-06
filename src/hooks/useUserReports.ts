import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserReport {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  resolution?: string;
  created_at: string;
  resolved_at?: string;
}

export const useUserReports = () => {
  const [reports, setReports] = useState<UserReport[]>([]);
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
      })) || [];

      setReports(formattedReports);
    } catch (error) {
      console.error('Error fetching user reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('user-reports-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'reports',
        filter: `reporter_id=eq.${supabase.auth.getUser().then(u => u.data.user?.id)}`
      }, fetchReports)
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