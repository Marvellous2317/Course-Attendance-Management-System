// src/shared/router/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { RoleRedirect } from './RoleRedirect';

/**
 * @param {Array<string>} allowedRoles - e.g. ['admin'], ['teacher'], or ['teacher', 'admin']
 */
export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user } = useAuthStore();

  if (!user || (allowedRoles.length > 0 && !allowedRoles.includes(user.role))) {
    // User is logged in but not permitted for this role section
    // Bounce them back to their own role's home view
    return <RoleRedirect />;
  }

  return <Outlet />;
};

export default ProtectedRoute;