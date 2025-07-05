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
      if (loading) return;

      // If no session, redirect to appropriate login
      if (!session || !user) {
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

      // If role is required, check user role
      if (requiredRole !== 'user') {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', user.id)
            .single();

          const userRole = profile?.role;

          // Check role permissions
          if (requiredRole === 'systemadmin' && userRole !== 'systemadmin') {
            navigate('/system-admin-login');
            return;
          }

          if (requiredRole === 'admin' && !['admin', 'systemadmin'].includes(userRole)) {
            navigate('/admin-login');
            return;
          }
        } catch (error) {
          console.error('Error checking user role:', error);
          navigate('/login');
        }
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