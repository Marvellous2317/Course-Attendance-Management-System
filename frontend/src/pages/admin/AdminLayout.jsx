import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Sidebar } from "../../shared/components/Sidebar";
import AdminModals from "./AdminModals";

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50/60 flex antialiased text-slate-900 selection:bg-secondary-500/30 selection:text-slate-950">
      {/* Administrative Sidebar */}
      <Sidebar />

      {/* Main Administrative Work Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-16 lg:pt-6 pb-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Administrative Modals */}
      <AdminModals />
    </div>
  );
}
