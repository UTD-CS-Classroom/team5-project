import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserTypes?: ('customer' | 'business')[];
}

export default function ProtectedRoute({ children, allowedUserTypes }: ProtectedRouteProps) {
  const { isAuthenticated, userType, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login while saving the attempted location
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedUserTypes && userType && !allowedUserTypes.includes(userType)) {
    // User is logged in but doesn't have the right permissions
    // Redirect to their appropriate dashboard
    const redirectTo = userType === 'customer' ? '/dashboard' : '/business/dashboard';
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
