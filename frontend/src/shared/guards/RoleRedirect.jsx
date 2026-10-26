// src/shared/router/RoleRedirect.jsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export const getUserRole = (user) => {
  if (!user) return '';

  const rawRole = user.role ?? user.Role ?? user.roleName ?? user.role_name;

  if (typeof rawRole === 'string') {
    const normalized = rawRole.toLowerCase().trim();
    if (normalized === 'instructor' || normalized === 'teacher' || normalized === 'teachers' || normalized === 'faculty') return 'teacher';
    if (normalized === 'admin' || normalized === 'admins') return 'admin';
    if (normalized === 'student' || normalized === 'students') return 'student';
    return normalized;
  }

  if (typeof rawRole === 'object' && rawRole !== null) {
    const name = rawRole.name ?? rawRole.Name;
    if (typeof name === 'string') {
      const normalized = name.toLowerCase().trim();
      if (normalized === 'instructor' || normalized === 'teacher' || normalized === 'teachers' || normalized === 'faculty') return 'teacher';
      if (normalized === 'admin' || normalized === 'admins') return 'admin';
      if (normalized === 'student' || normalized === 'students') return 'student';
      return normalized;
    }
    if (rawRole.id === 1) return 'admin';
    if (rawRole.id === 2) return 'teacher';
    if (rawRole.id === 3) return 'student';
  }

  const roleId = user.roleId ?? user.role_id ?? user.roleID;
  if (roleId === 1 || rawRole === 1) return 'admin';
  if (roleId === 2 || rawRole === 2) return 'teacher';
  if (roleId === 3 || rawRole === 3) return 'student';

  if (user.email) {
    const email = String(user.email).toLowerCase();
    if (email.includes('teacher') || email.includes('faculty') || email.includes('instructor')) return 'teacher';
    if (email.includes('student')) return 'student';
    if (email.includes('admin')) return 'admin';
  }

  return '';
};

export const RoleRedirect = () => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const role = getUserRole(user);

  switch (role) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'teacher':
    case 'instructor':
      return <Navigate to="/teacher" replace />;
    case 'student':
    case 'students':
      return <Navigate to="/student" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

export default RoleRedirect;