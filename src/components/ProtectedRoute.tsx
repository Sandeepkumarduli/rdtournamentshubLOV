import { useEffect } from 'react';
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

      // Always check user role for protected routes
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        const userRole = profile?.role;
        console.log('🔒 User role check:', { userRole, requiredRole, userId: user.id });

        // Block frozen users from accessing any protected routes
        if (userRole === 'frozen') {
          console.log('🔒 User is frozen, redirecting to login');
          navigate('/login');
          return;
        }

        // Strict role-based access control
        if (requiredRole === 'user' && userRole !== 'user') {
          console.log('🔒 User role mismatch, redirecting to login');
          navigate('/login');
          return;
        }

        if (requiredRole === 'admin' && userRole !== 'admin') {
          navigate('/admin-login');
          return;
        }

        if (requiredRole === 'systemadmin' && userRole !== 'systemadmin') {
          navigate('/system-admin-login');
          return;
        }
        console.log('✅ Access granted for user role:', userRole);
      } catch (error) {
        console.error('❌ Error checking user role:', error);
        navigate('/login');
      }
    };

    checkAccess();
  }, [user, session, loading, navigate, requiredRole, redirectTo]);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!session || !user) {
    return <LoadingSpinner fullScreen />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;