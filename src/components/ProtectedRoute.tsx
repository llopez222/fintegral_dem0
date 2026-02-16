import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '@/context/UserContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requirePermission?: keyof import('@/mocks/users').Permissions;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true,
  requirePermission,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { isAuthenticated, hasPermission } = useUser();
  const location = useLocation();

  // If auth is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If route is public (like login/signup) but user is authenticated, redirect to pipeline
  // Except for the landing page which handles its own logic
  if (!requireAuth && isAuthenticated && location.pathname !== '/') {
    return <Navigate to="/pipeline" replace />;
  }

  // Check specific permission if required
  if (requireAuth && requirePermission && !hasPermission(requirePermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
