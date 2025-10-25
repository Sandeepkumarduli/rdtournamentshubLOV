import { useEffect, useState } from 'react';
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
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      console.log('🔒 ProtectedRoute checkAccess:', { loading, hasSession: !!session, hasUser: !!user, requiredRole });
      
      setIsChecking(true);
      setIsAuthorized(false);
      
      if (loading) {
        console.log('🔒 Still loading, waiting...');
        return;
      }

      // If no session, redirect to appropriate login
      if (!session || !user) {
        console.log('🔒 No session/user, redirecting to login');
        setIsChecking(false);
        if (redirectTo) {
          navigate(redirectTo);
        } else {
          // Default redirects based on required role
          switch (requiredRole) {
            case 'systemadmin':
              navigate('/system-admin-login');
              break;
            case 'admin':
              navigate('/admin-login');
              break;
            default:
              navigate('/login');
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
          setIsChecking(false);
          setIsAuthorized(false);
          navigate('/login');
          return;
        }

        // Strict role-based access control
        let hasAccess = false;
        
        if (requiredRole === 'user') {
          // Users must have the 'user' role OR any higher role
          hasAccess = roles.includes('user') || roles.includes('admin') || roles.includes('systemadmin');
          if (!hasAccess) {
            console.log('🔒 User role mismatch, redirecting to login');
            setIsChecking(false);
            setIsAuthorized(false);
            navigate('/login');
            return;
          }
        }

        if (requiredRole === 'admin') {
          hasAccess = roles.includes('admin') || roles.includes('systemadmin');
          if (!hasAccess) {
            console.log('🔒 Admin role required, redirecting');
            setIsChecking(false);
            setIsAuthorized(false);
            navigate('/admin-login');
            return;
          }
        }

        if (requiredRole === 'systemadmin') {
          hasAccess = roles.includes('systemadmin');
          if (!hasAccess) {
            console.log('🔒 System admin role required, redirecting');
            setIsChecking(false);
            setIsAuthorized(false);
            navigate('/system-admin-login');
            return;
          }
        }
        
        console.log('✅ Access granted for user roles:', roles);
        setIsAuthorized(true);
        setIsChecking(false);
      } catch (error) {
        console.error('❌ Error checking user roles:', error);
        setIsChecking(false);
        setIsAuthorized(false);
        navigate('/login');
      }
    };

    checkAccess();
  }, [user, session, loading, navigate, requiredRole, redirectTo]);

  // Show loading spinner while checking authentication or authorization
  if (loading || isChecking || !isAuthorized) {
    return <LoadingSpinner fullScreen />;
  }

  // Only render children if authorized
  return <>{children}</>;
};

export default ProtectedRoute;