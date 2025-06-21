import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { hasPermissionForRoute, getDefaultRouteForRole } from '../../utils/rolePermissions';
import { verifyToken } from '../../utils/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  route: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, route }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);

  console.log('ProtectedRoute checking:', { route, isAuthenticated, userRole: user?.roleCode });

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated && user) {
        // Verify token is still valid
        const isValid = await verifyToken();
        if (!isValid) {
          console.log('Token invalid, logging out');
          logout();
        }
      }
      setIsVerifying(false);
    };

    checkAuth();
  }, [isAuthenticated, user, logout]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">מאמת הרשאות...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Special handling for station-assignment routes
  if (route === '/station-assignment') {
    // Allow access to station assignment for roles that can view tasks
    const allowedRoles = [1, 2, 3, 4]; // מנהל רכש, ראש צוות, קניין, גורם דורש
    if (!allowedRoles.includes(user.roleCode)) {
      console.log('No permission for station assignment, redirecting to default route');
      const defaultRoute = getDefaultRouteForRole(user.roleCode);
      return <Navigate to={defaultRoute} replace />;
    }
    console.log('Access granted to station assignment');
    return <>{children}</>;
  }

  if (!hasPermissionForRoute(user.roleCode, route)) {
    console.log('No permission for route, redirecting to default route');
    // Redirect to user's default route if they don't have permission
    const defaultRoute = getDefaultRouteForRole(user.roleCode);
    return <Navigate to={defaultRoute} replace />;
  }

  console.log('Access granted to route:', route);
  return <>{children}</>;
};

export default ProtectedRoute;