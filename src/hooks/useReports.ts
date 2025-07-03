import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Report {
  id: string;
  type: string;
  title: string;
  description: string;
  reporter: string;
  reportedEntity: string;
  date: string;
  status: string;
  priority: string;
  category: string;
  resolution?: string;
}

export const useReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          reporter:profiles!reports_reporter_id_fkey (display_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedReports = data?.map(report => ({
        id: report.id,
        type: report.type,
        title: report.title,
        description: report.description,
        reporter: report.reporter?.display_name || report.reporter?.email || 'Unknown',
        reportedEntity: report.reported_entity || 'Unknown',
        date: new Date(report.created_at).toLocaleDateString(),
        status: report.status || 'Pending',
        priority: report.priority || 'Medium',
        category: report.category,
        resolution: report.resolution || undefined,
      })) || [];

      setReports(formattedReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolveReport = async (reportId: string, resolution: string) => {
    try {
      // Get current system admin user ID (in a real app, this would come from auth)
      const auth = localStorage.getItem("userAuth");
      const user = auth ? JSON.parse(auth) : null;
      const systemAdminId = user?.user_id || 'system-admin-id';

      const { error } = await supabase
        .from('reports')
        .update({
          status: 'Resolved',
          resolution: resolution,
          resolved_by: systemAdminId,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      if (error) throw error;

      // Refresh reports list
      fetchReports();
      return { success: true };
    } catch (error) {
      console.error('Error resolving report:', error);
      return { error: 'Failed to resolve report' };
    }
  };

  useEffect(() => {
    fetchReports();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('reports-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, fetchReports)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    reports,
    loading,
    refetch: fetchReports,
    resolveReport,
  };
};