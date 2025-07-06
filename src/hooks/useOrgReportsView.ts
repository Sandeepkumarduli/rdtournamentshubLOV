import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OrgReportView {
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

export const useOrgReportsView = () => {
  const [reports, setReports] = useState<OrgReportView[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const itemsPerPage = 20;

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

      console.log('Admin profile:', profile);

      if (!profile?.organization || profile.role !== 'admin') {
        console.log('No organization or not admin:', profile);
        setReports([]);
        setLoading(false);
        return;
      }

      console.log('Searching for reports about organization:', profile.organization);

      // Build query - only reports ABOUT the organization
      let query = supabase
        .from('reports')
        .select('*')
        .eq('reported_entity', profile.organization);

      console.log('Query being executed for reported_entity:', profile.organization);

      // Apply status filter
      if (statusFilter !== 'All') {
        query = query.eq('status', statusFilter.toLowerCase());
      }

      // Apply date filter
      if (dateFilter) {
        const startDate = new Date(dateFilter);
        const endDate = new Date(dateFilter);
        endDate.setDate(endDate.getDate() + 1);
        
        query = query
          .gte('created_at', startDate.toISOString())
          .lt('created_at', endDate.toISOString());
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      console.log('Query result:', { data, error });
      console.log('Number of reports found:', data?.length || 0);

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
      console.error('Error fetching org reports view:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter, dateFilter]);

  useEffect(() => {
    fetchReports();

    // Subscribe to real-time changes for reports table
    const channel = supabase
      .channel('org-reports-view-changes')
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
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    refetch: fetchReports,
  };
};