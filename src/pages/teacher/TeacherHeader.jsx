import { Search, Bell, Menu, ShieldCheck } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
export const TeacherHeader = () => {
  const { setMobileMenuOpen, searchQuery, setSearchQuery, showToast } =
    useAdmin();
  return (
    <header className="h-18 bg-white border-b border-slate-200/90 sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Mobile Toggle & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg min-w-0">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students, course codes, syllabus files..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>
      </div>

      {/* Right Badges & Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Sync Engine Live Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-bold text-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>SYNC ENGINE LIVE</span>
        </div>

        {/* Term 2025-A Active Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-[11px] font-bold text-amber-900">
          <ShieldCheck className="w-3.5 h-3.5 text-secondary-500" />
          <span>TERM 2025-A ACTIVE</span>
        </div>

        {/* Bell Notifications */}
        <button
          type="button"
          onClick={() =>
            showToast(
              'Grade Engine synced: Session #14 committed to registrar',
              'info',
            )
          }
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
            alt="Dr. E. Vance"
            className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100"
          />
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-900 leading-tight">
              Dr. E. Vance
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              Instructor
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
