// src/shared/router/GuestRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { RoleRedirect } from './RoleRedirect';

export const GuestRoute = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user?.role) {
    // Already logged in? Redirect to their role portal
    return <RoleRedirect />;
  }

  return <Outlet />;
};

export default GuestRoute;