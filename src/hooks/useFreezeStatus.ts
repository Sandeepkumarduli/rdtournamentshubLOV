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
        const { data: freezeStatus, error } = await supabase
          .from('user_freeze_status')
          .select('is_frozen')
          .eq('user_id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
          console.error('Error checking freeze status:', error);
        }
        
        const frozen = freezeStatus?.is_frozen || false;
        setIsFrozen(frozen);
        
        console.log('Freeze status check:', { 
          userId: user.id, 
          frozen, 
          freezeStatus 
        });
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
            setIsFrozen(newRecord.is_frozen || false);
          } else if (payload.eventType === 'DELETE') {
            setIsFrozen(false);
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