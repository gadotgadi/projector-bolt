import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { hasPermissionForRoute, getDefaultRouteForRole } from '../../utils/rolePermissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  route: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, route }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasPermissionForRoute(user.roleCode, route)) {
    // Redirect to user's default route if they don't have permission
    const defaultRoute = getDefaultRouteForRole(user.roleCode);
    return <Navigate to={defaultRoute} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;