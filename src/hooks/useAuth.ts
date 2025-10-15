import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface VerificationStatus {
  emailVerified: boolean;
  phoneVerified: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFrozen, setIsFrozen] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    emailVerified: false,
    phoneVerified: false,
  });

  const checkVerificationStatus = async (userId: string) => {
    try {
      const { data: { user: authUser }, error } = await supabase.auth.getUser();
      
      if (error || !authUser) {
        console.error('Error fetching user for verification:', error);
        return;
      }

      // Check email verification from auth metadata
      const emailVerified = !!authUser.email_confirmed_at;
      
      // Check phone verification from auth metadata
      const phoneVerified = !!authUser.phone_confirmed_at;

      setVerificationStatus({
        emailVerified,
        phoneVerified,
      });

      console.log('✅ Verification status:', { emailVerified, phoneVerified });
    } catch (error) {
      console.error('❌ Exception checking verification status:', error);
    }
  };

  const checkFreezeStatus = async (userId: string) => {
    try {
      console.log('🔍 Checking freeze status for user:', userId);
      
      // Check freeze status with proper error handling
      const { data: freezeRecord, error } = await supabase
        .from('user_freeze_status')
        .select('is_frozen, frozen_at, user_id, id, updated_at')
        .eq('user_id', userId)
        .maybeSingle();
      
      console.log('🔍 Raw query result:', { 
        data: freezeRecord, 
        error: error?.code || 'no-error',
        errorMessage: error?.message 
      });
      
      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error checking freeze status:', error);
        setIsFrozen(false);
        return;
      }
      
      const frozen = freezeRecord?.is_frozen === true;
      setIsFrozen(frozen);
      
      console.log('✅ Freeze status result:', { 
        userId, 
        frozen, 
        freezeRecord,
        hasRecord: !!freezeRecord,
        is_frozen_value: freezeRecord?.is_frozen,
        typeof_is_frozen: typeof freezeRecord?.is_frozen
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
        await checkVerificationStatus(session.user.id);
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
            checkVerificationStatus(session.user.id);
          }, 0);
        } else {
          setIsFrozen(false);
          setVerificationStatus({ emailVerified: false, phoneVerified: false });
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
    emailVerified: verificationStatus.emailVerified,
    phoneVerified: verificationStatus.phoneVerified,
    isFullyVerified: verificationStatus.emailVerified && verificationStatus.phoneVerified,
    refreshFreezeStatus: () => user ? checkFreezeStatus(user.id) : Promise.resolve(),
    refreshVerificationStatus: () => user ? checkVerificationStatus(user.id) : Promise.resolve(),
    signIn,
    signUp,
    signOut,
  };
};