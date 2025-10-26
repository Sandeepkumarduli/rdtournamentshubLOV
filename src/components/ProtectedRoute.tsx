import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin' | 'systemadmin';
  redirectTo?: string;
}

const ProtectedRoute = ({ 
  children, 
  requiredRole = 'user',
  redirectTo 
}: ProtectedRouteProps) => {
  const { user, session, loading } = useAuth();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = React.useState<boolean | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      console.log('🔒 ProtectedRoute checkAccess:', { loading, hasSession: !!session, hasUser: !!user, requiredRole });
      
      if (loading) {
        console.log('🔒 Still loading, waiting...');
        return;
      }

      // If no session, redirect to appropriate login
      if (!session || !user) {
        console.log('🔒 No session/user, redirecting to login');
        setIsAuthorized(false);
        if (redirectTo) {
          navigate(redirectTo, { replace: true });
        } else {
          // Default redirects based on required role
          switch (requiredRole) {
            case 'systemadmin':
              navigate('/system-admin-login', { replace: true });
              break;
            case 'admin':
              navigate('/admin-login', { replace: true });
              break;
            default:
              navigate('/login', { replace: true });
              break;
          }
        }
        return;
      }

      // Check user roles using the new user_roles table
      try {
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (rolesError) throw rolesError;

        const roles = userRoles?.map(r => r.role) || [];
        console.log('🔒 User roles check:', { roles, requiredRole, userId: user.id });

        // Check if user is frozen (still using profiles table for freeze status)
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (profile?.role === 'frozen') {
          console.log('🔒 User is frozen, redirecting to login');
          setIsAuthorized(false);
          await supabase.auth.signOut();
          navigate('/login', { replace: true });
          return;
        }

        // Strict role-based access control
        if (requiredRole === 'user') {
          const hasValidRole = roles.includes('user') || roles.includes('admin') || roles.includes('systemadmin');
          if (!hasValidRole) {
            console.log('🔒 User role mismatch, redirecting to login');
            setIsAuthorized(false);
            await supabase.auth.signOut();
            navigate('/login', { replace: true });
            return;
          }
        }

        if (requiredRole === 'admin') {
          if (!roles.includes('admin') && !roles.includes('systemadmin')) {
            setIsAuthorized(false);
            await supabase.auth.signOut();
            navigate('/admin-login', { replace: true });
            return;
          }
        }

        if (requiredRole === 'systemadmin') {
          if (!roles.includes('systemadmin')) {
            setIsAuthorized(false);
            await supabase.auth.signOut();
            navigate('/system-admin-login', { replace: true });
            return;
          }
        }
        
        console.log('✅ Access granted for user roles:', roles);
        setIsAuthorized(true);
      } catch (error) {
        console.error('❌ Error checking user roles:', error);
        setIsAuthorized(false);
        await supabase.auth.signOut();
        navigate('/login', { replace: true });
      }
    };

    checkAccess();
  }, [user, session, loading, navigate, requiredRole, redirectTo]);

  // Show loading while checking authentication or authorization
  if (loading || isAuthorized === null) {
    return <LoadingSpinner fullScreen />;
  }

  // Don't render children if not authorized
  if (!isAuthorized || !session || !user) {
    return <LoadingSpinner fullScreen />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
