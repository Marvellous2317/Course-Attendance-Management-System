import { motion, AnimatePresence } from 'motion/react';
import { useAdmin } from '../../context/AdminContext';
import { TeacherSidebar } from './TeacherSidebar';
import { TeacherHeader } from './TeacherHeader';
import { TeacherDashboardPage } from './TeacherDashboardPage';
import { TeacherCoursesPage } from './TeacherCoursesPage';
import { TeacherAttendancePage } from './TeacherAttendancePage';
import { TeacherSchedulePage } from './TeacherSchedulePage';
import { TeacherSettingsPage } from './TeacherSettingsPage';
import { TeacherModals } from './TeacherModals';
export const TeacherLayout = () => {
  const { teacherTab } = useAdmin();
  const renderActiveTab = () => {
    switch (teacherTab) {
      case 'dashboard':
        return <TeacherDashboardPage key="teacher-dashboard" />;
      case 'courses':
        return <TeacherCoursesPage key="teacher-courses" />;
      case 'attendance':
        return <TeacherAttendancePage key="teacher-attendance" />;
      case 'schedule':
        return <TeacherSchedulePage key="teacher-schedule" />;
      case 'settings':
        return <TeacherSettingsPage key="teacher-settings" />;
      default:
        return <TeacherDashboardPage key="teacher-dashboard" />;
    }
  };
  return (
    <div className="min-h-screen bg-slate-50/60 flex antialiased text-slate-900">
      {/* Teacher Faculty Sidebar */}
      <TeacherSidebar />

      {/* Main Faculty Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TeacherHeader />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={teacherTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {renderActiveTab()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Faculty Modals */}
      <TeacherModals />
    </div>
  );
};
