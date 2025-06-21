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

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated && user) {
        // Verify token is still valid
        const isValid = await verifyToken();
        if (!isValid) {
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