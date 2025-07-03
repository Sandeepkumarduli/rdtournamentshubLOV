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
      const auth = localStorage.getItem("userAuth");
      const user = auth ? JSON.parse(auth) : null;
      
      if (!user?.user_id) {
        return { error: 'Not authenticated' };
      }

      const { error } = await supabase
        .from('reports')
        .insert([{
          reporter_id: user.user_id,
          type: data.type,
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