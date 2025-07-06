import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFrozen, setIsFrozen] = useState(false);

  const checkFreezeStatus = async (userId: string) => {
    try {
      console.log('🔍 Checking freeze status for user:', userId);
      
      // Check freeze status with proper error handling
      const { data: freezeRecord, error } = await supabase
        .from('user_freeze_status')
        .select('is_frozen, frozen_at, user_id')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error checking freeze status:', error);
        setIsFrozen(false);
        return;
      }
      
      const frozen = freezeRecord?.is_frozen || false;
      setIsFrozen(frozen);
      
      console.log('✅ Freeze status result:', { 
        userId, 
        frozen, 
        freezeRecord,
        hasRecord: !!freezeRecord,
        error: error?.code 
      });
      
    } catch (error) {
      console.error('❌ Exception in freeze status check:', error);
      setIsFrozen(false);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await checkFreezeStatus(session.user.id);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log('🔐 Auth state changed:', _event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer freeze status check to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            checkFreezeStatus(session.user.id);
          }, 0);
        } else {
          setIsFrozen(false);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Separate effect for real-time freeze status updates
  useEffect(() => {
    if (!user) return;

    // Subscribe to freeze status changes for this user
    const freezeChannel = supabase
      .channel(`freeze-status-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_freeze_status',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('🔄 Real-time freeze status update:', payload);
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newRecord = payload.new as { is_frozen: boolean };
            const frozen = newRecord.is_frozen || false;
            setIsFrozen(frozen);
            console.log(`🔄 User freeze status updated in real-time: ${frozen ? 'FROZEN' : 'ACTIVE'}`);
          } else if (payload.eventType === 'DELETE') {
            setIsFrozen(false);
            console.log('🔄 Freeze status deleted - user unfrozen');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(freezeChannel);
    };
  }, [user]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    session,
    loading,
    isFrozen,
    refreshFreezeStatus: () => user ? checkFreezeStatus(user.id) : Promise.resolve(),
    signIn,
    signUp,
    signOut,
  };
};