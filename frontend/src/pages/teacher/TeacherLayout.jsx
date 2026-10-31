import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import TeacherSidebar from './TeacherSidebar';
import TeacherModals from './TeacherModals';

export default function TeacherLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50/60 flex antialiased text-slate-900">
      {/* Teacher Faculty Sidebar */}
      <TeacherSidebar />

      {/* Main Faculty Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-16 lg:pt-6 pb-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Faculty Modals */}
      <TeacherModals />
    </div>
  );
}
