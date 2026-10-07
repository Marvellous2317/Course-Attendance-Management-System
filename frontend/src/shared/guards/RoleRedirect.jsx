// src/shared/router/RoleRedirect.jsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export const RoleRedirect = () => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role?.toLowerCase()) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'teacher':
      return <Navigate to="/teacher" replace />;
    case 'student':
      return <Navigate to="/student" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

export default RoleRedirect;