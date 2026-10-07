// src/shared/router/index.jsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { LandingPage } from "../../pages/LandingPage";
import { LoginPage, RegisterPage, ChangePasswordPage } from "../../pages/auth";
import { AdminLayout } from "../../pages/admin";
import { TeacherLayout } from "../../pages/teacher";
import { StudentPortalPage } from "../../pages/student";
import { ToastContainer } from "../components/ToastContainer";

// Guards
import AuthProtect from "../guards/AuthProtect";
import GuestRoute from "../guards/GuestRoute";
import ProtectedRoute from "../guards/ProtectedRoute";
import RoleRedirect from "../guards/RoleRedirect";

export function AppRouter() {
  const location = useLocation();

  return (
    <div className="relative min-h-screen">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public */}
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
          <Route path="/dashboard" element={<RoleRedirect />} />

          <Route
            path="/change-password"
            element={
              <motion.div
                key="change-password"
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.2 }}
              >
                <ChangePasswordPage />
              </motion.div>
            }
          />

          {/* Guest Only */}
          <Route element={<GuestRoute />}>
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
              path="/register"
              element={
                <motion.div
                  key="register"
                  initial={{ opacity: 0, scale: 0.99 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.99 }}
                  transition={{ duration: 0.2 }}
                >
                  <RegisterPage />
                </motion.div>
              }
            />
          </Route>

          {/* Authenticated */}
          <Route element={<AuthProtect />}>
            {/* Role Protected */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
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
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
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
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
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
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>

      <ToastContainer />
    </div>
  );
}

export default AppRouter;
