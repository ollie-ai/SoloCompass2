import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import Loading from './Loading';
import { hasAdminAccess } from '../lib/adminAccess';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isLoading, user, initialized } = useAuthStore();
  const location = useLocation();

  if (!initialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !hasAdminAccess(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Enforce Travel DNA quiz for all users except on /quiz and /settings
  const publicPaths = ['/quiz', '/settings', '/help', '/docs', '/safety-info', '/features', '/pricing'];
  if (!user?.quiz_completed && !publicPaths.includes(location.pathname)) {
    return <Navigate to="/quiz" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
