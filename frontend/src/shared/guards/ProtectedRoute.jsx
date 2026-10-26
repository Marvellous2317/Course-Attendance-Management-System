// src/shared/router/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { RoleRedirect, getUserRole } from './RoleRedirect';

/**
 * @param {Array<string>} allowedRoles - e.g. ['admin'], ['teacher'], or ['teacher', 'admin']
 */
export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user } = useAuthStore();
  const userRole = getUserRole(user);

  const isPermitted =
    allowedRoles.length === 0 ||
    allowedRoles.some((r) => {
      const allowed = r.toLowerCase().trim();
      return (
        allowed === userRole ||
        ((allowed === 'teacher' || allowed === 'instructor') &&
          (userRole === 'teacher' || userRole === 'instructor')) ||
        ((allowed === 'student' || allowed === 'students') &&
          (userRole === 'student' || userRole === 'students'))
      );
    });

  if (!user || !isPermitted) {
    // User is logged in but not permitted for this role section
    // Bounce them back to their own role's home view
    return <RoleRedirect />;
  }

  return <Outlet />;
};

export default ProtectedRoute;