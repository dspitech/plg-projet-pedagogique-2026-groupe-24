import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, AppRole } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  role?: AppRole;
  permission?: { resource: string; action: 'create' | 'read' | 'update' | 'delete' };
}

export function ProtectedRoute({ children, role, permission }: ProtectedRouteProps) {
  const { user, profile, loading, hasRole, hasPermission } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  if (profile?.is_suspended) return <Navigate to="/suspended" replace />;
  if (profile?.must_change_password && location.pathname !== '/set-password') {
    return <Navigate to="/set-password" replace />;
  }

  if (role && !hasRole(role) && !hasRole('global_admin')) {
    return <Navigate to="/forbidden" replace />;
  }
  if (permission && !hasPermission(permission.resource, permission.action)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <>{children}</>;
}
