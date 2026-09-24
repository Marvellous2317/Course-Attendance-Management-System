import { useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAdmin } from '../../../context/AdminContext';
import { LandingPage } from '../../pages/LandingPage';
import { LoginPage } from '../../pages/LoginPage';
import { AdminLayout } from '../../../pages/admin';
import { TeacherLayout } from '../../../pages/teacher';
import { StudentPortalPage } from '../../../pages/student';
import { ToastContainer } from '../ToastContainer';

export function AppRouter() {
  const { appView, setAppView } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();

  const prevPathRef = useRef(location.pathname);
  const prevAppViewRef = useRef(appView);

  useEffect(() => {
    const currentPath = location.pathname.toLowerCase();
    const prevPath = prevPathRef.current.toLowerCase();
    const prevAppView = prevAppViewRef.current;

    prevPathRef.current = location.pathname;
    prevAppViewRef.current = appView;

    // Case 1: URL route changed (e.g. user typed a URL or used browser navigation)
    if (currentPath !== prevPath) {
      let targetView = 'landing';
      if (currentPath.startsWith('/login')) targetView = 'login';
      else if (currentPath.startsWith('/admin')) targetView = 'admin';
      else if (currentPath.startsWith('/teacher')) targetView = 'teacher';
      else if (currentPath.startsWith('/student')) targetView = 'student';

      if (appView !== targetView) {
        setAppView(targetView);
      }
      return;
    }

    // Case 2: appView state changed (e.g. user clicked role switcher, login, or logout)
    if (appView !== prevAppView) {
      let targetPath = '/';
      if (appView === 'login') targetPath = '/login';
      else if (appView === 'admin') targetPath = '/admin';
      else if (appView === 'teacher') targetPath = '/teacher';
      else if (appView === 'student') targetPath = '/student';

      if (!currentPath.startsWith(targetPath)) {
        navigate(targetPath, { replace: true });
      }
    }
  }, [location.pathname, appView, setAppView, navigate]);

  return (
    <div className="relative min-h-screen">

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <motion.div
                key="landing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <LandingPage />
              </motion.div>
            }
          />
          <Route
            path="/login"
            element={
              <motion.div
                key="login"
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.2 }}
              >
                <LoginPage />
              </motion.div>
            }
          />
          <Route
            path="/admin/*"
            element={
              <motion.div
                key="admin"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <AdminLayout />
              </motion.div>
            }
          />
          <Route
            path="/teacher/*"
            element={
              <motion.div
                key="teacher"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <TeacherLayout />
              </motion.div>
            }
          />
          <Route
            path="/student/*"
            element={
              <motion.div
                key="student"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <StudentPortalPage />
              </motion.div>
            }
          />
          {/* Catch-all fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>

      <ToastContainer />
    </div>
  );
}

export default AppRouter;
