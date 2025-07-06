import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useFreezeStatus = () => {
  const { user } = useAuth();
  const [isFrozen, setIsFrozen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsFrozen(false);
      setLoading(false);
      return;
    }

    const checkFreezeStatus = async () => {
      try {
        console.log('Checking freeze status for user:', user.id);
        
        const { data: freezeStatus, error } = await supabase
          .from('user_freeze_status')
          .select('is_frozen, frozen_at, user_id')
          .eq('user_id', user.id)
          .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no record exists
        
        if (error) {
          console.error('Error checking freeze status:', error);
          setIsFrozen(false); // Default to not frozen on error
        } else {
          const frozen = freezeStatus?.is_frozen || false;
          setIsFrozen(frozen);
          
          console.log('Freeze status check result:', { 
            userId: user.id, 
            frozen, 
            freezeStatus,
            rawData: freezeStatus
          });
        }
      } catch (error) {
        console.error('Error in freeze status check:', error);
        setIsFrozen(false); // Default to not frozen on error
      } finally {
        setLoading(false);
      }
    };

    checkFreezeStatus();

    // Subscribe to freeze status changes
    const channel = supabase
      .channel('user-freeze-status-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_freeze_status',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Freeze status real-time update:', payload);
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newRecord = payload.new as { is_frozen: boolean };
            const frozen = newRecord.is_frozen || false;
            setIsFrozen(frozen);
            console.log('Real-time freeze status updated:', frozen);
          } else if (payload.eventType === 'DELETE') {
            setIsFrozen(false);
            console.log('Freeze status deleted - user unfrozen');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    isFrozen,
    loading,
  };
};