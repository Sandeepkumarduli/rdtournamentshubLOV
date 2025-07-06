import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ReportSubmissionData {
  type: string;
  title: string;
  description: string;
  priority: string;
  category: string;
  orgName?: string;
}

export const useReportSubmission = () => {
  const [loading, setLoading] = useState(false);

  const submitReport = async (data: ReportSubmissionData) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return { error: 'Not authenticated' };
      }

      // Get user profile for username and role
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, role')
        .eq('user_id', session.user.id)
        .single();

      // Map report types to valid database values
      const validTypeMap: Record<string, string> = {
        'tournament': 'tournament_issue',
        'player': 'player_misconduct', 
        'payment': 'payment_issue',
        'technical': 'technical_issue',
        'org': 'other',
        'bug': 'bug_report',
        'account': 'account_issue',
        'general': 'general_inquiry',
        'feature': 'feature_request',
        'other': 'other'
      };

      const dbType = validTypeMap[data.type] || 'other';

      let description = `${data.description}\n\n--- Additional Info ---\nUsername: ${profile?.display_name || 'Not Set'}\nUser Role: ${profile?.role || 'user'}`;
      
      if (data.orgName) {
        description += `\nReported Organization: ${data.orgName}`;
      }

      const { error } = await supabase
        .from('reports')
        .insert([{
          reporter_id: session.user.id,
          type: dbType,
          title: data.title,
          description: description,
          priority: data.priority,
          category: data.category,
          reported_entity: data.orgName || 'General',
        }]);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error submitting report:', error);
      return { error: 'Failed to submit report' };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    submitReport,
  };
};