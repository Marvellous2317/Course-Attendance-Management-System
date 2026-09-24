import { motion, AnimatePresence } from 'motion/react';
import { useAdmin } from '../../context/AdminContext';
import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';
import { DashboardView } from '../../components/admin/DashboardView';
import { StudentsView } from '../../components/admin/StudentsView';
import { TeachersView } from '../../components/admin/TeachersView';
import { CoursesView } from '../../components/admin/CoursesView';
import { SchedulesView } from '../../components/admin/SchedulesView';
import { FinancesView } from '../../components/admin/FinancesView';
import { AnnouncementsView } from '../../components/admin/AnnouncementsView';
import { SettingsView } from '../../components/admin/SettingsView';
import { AdminModals } from '../../components/admin/AdminModals';
export const AdminLayout = () => {
  const { activeTab } = useAdmin();
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView key="dashboard" />;
      case 'students':
        return <StudentsView key="students" />;
      case 'teachers':
        return <TeachersView key="teachers" />;
      case 'courses':
        return <CoursesView key="courses" />;
      case 'schedules':
        return <SchedulesView key="schedules" />;
      case 'finances':
        return <FinancesView key="finances" />;
      case 'announcements':
        return <AnnouncementsView key="announcements" />;
      case 'settings':
        return <SettingsView key="settings" />;
      default:
        return <DashboardView key="dashboard" />;
    }
  };
  return (
    <div className="min-h-screen bg-slate-50/60 flex antialiased text-slate-900">
      {/* Administrative Sidebar */}
      <Sidebar />

      {/* Main Administrative Work Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Administrative Modals */}
      <AdminModals />
    </div>
  );
};
