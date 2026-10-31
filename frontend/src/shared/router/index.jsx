// src/shared/router/index.jsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import LandingPage from "../../pages/LandingPage";
import LoginPage from "../../pages/auth/LoginPage";
import RegisterPage from "../../pages/auth/RegisterPage";
import SettingsPage from "../../pages/auth/SettingsPage";

// Admin views
import AdminLayout from "../../pages/admin/AdminLayout";
import DashboardView from "../../pages/admin/DashboardView";
import StudentsView from "../../pages/admin/StudentsView";
import TeachersView from "../../pages/admin/TeachersView";
import CoursesView from "../../pages/admin/CoursesView";
import SchedulesView from "../../pages/admin/SchedulesView";
import FinancesView from "../../pages/admin/FinancesView";
import AnnouncementsView from "../../pages/admin/AnnouncementsView";
import RolesView from "../../pages/admin/RolesView";
import AdminSettings from "../../pages/admin/AdminSettings";

// Teacher views
import TeacherLayout from "../../pages/teacher/TeacherLayout";
import TeacherDashboardPage from "../../pages/teacher/TeacherDashboardPage";
import TeacherCoursesPage from "../../pages/teacher/TeacherCoursesPage";
import TeacherAttendancePage from "../../pages/teacher/TeacherAttendancePage";
import TeacherSchedulePage from "../../pages/teacher/TeacherSchedulePage";

// Student views
import StudentLayout from "../../pages/student/StudentLayout";
import StudentDashboardPage from "../../pages/student/StudentDashboardPage";
import StudentCoursesPage from "../../pages/student/StudentCoursesPage";
import StudentEnrollmentPage from "../../pages/student/StudentEnrollmentPage";
import StudentAttendancePage from "../../pages/student/StudentAttendancePage";

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
            {/* Admin Portal Nested Routes */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route
                path="/admin"
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
              >
                <Route index element={<DashboardView />} />
                <Route path="dashboard" element={<DashboardView />} />
                <Route path="students" element={<StudentsView />} />
                <Route path="teachers" element={<TeachersView />} />
                <Route path="courses" element={<CoursesView />} />
                <Route path="schedules" element={<SchedulesView />} />
                <Route path="finances" element={<FinancesView />} />
                <Route path="announcements" element={<AnnouncementsView />} />
                <Route path="roles" element={<RolesView />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Route>

            {/* Teacher Portal Nested Routes */}
            <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
              <Route
                path="/teacher"
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
              >
                <Route index element={<TeacherDashboardPage />} />
                <Route path="dashboard" element={<TeacherDashboardPage />} />
                <Route path="courses" element={<TeacherCoursesPage />} />
                <Route path="attendance" element={<TeacherAttendancePage />} />
                <Route path="schedule" element={<TeacherSchedulePage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Route>

            {/* Student Portal Nested Routes */}
            <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
              <Route
                path="/student"
                element={
                  <motion.div
                    key="student"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <StudentLayout />
                  </motion.div>
                }
              >
                <Route index element={<StudentDashboardPage />} />
                <Route path="dashboard" element={<StudentDashboardPage />} />
                <Route path="courses" element={<StudentCoursesPage />} />
                <Route path="enrollment" element={<StudentEnrollmentPage />} />
                <Route path="attendance" element={<StudentAttendancePage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
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
