import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ReportSubmissionData {
  type: string;
  title: string;
  description: string;
  priority: string;
  category: string;
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

      // Map report types to valid database values
      const validTypeMap: Record<string, string> = {
        'tournament': 'tournament_issue',
        'player': 'player_misconduct', 
        'payment': 'payment_issue',
        'technical': 'technical_issue',
        'bug': 'bug_report',
        'account': 'account_issue',
        'general': 'general_inquiry',
        'feature': 'feature_request',
        'other': 'other'
      };

      const dbType = validTypeMap[data.type] || 'other';

      const { error } = await supabase
        .from('reports')
        .insert([{
          reporter_id: session.user.id,
          type: dbType,
          title: data.title,
          description: data.description,
          priority: data.priority,
          category: data.category,
          reported_entity: 'General',
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