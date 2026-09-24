import { useState } from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  Clock,
  RotateCw,
  Search,
  Download,
  ExternalLink,
  FileText,
  MessageSquare,
  FolderOpen,
  Bookmark,
  ShieldCheck,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
export const StudentCoursesPage = ({
  courses,
  onSelectCourse,
  onNavigateTab,
}) => {
  const { showToast } = useAdmin();
  const [filterTab, setFilterTab] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState('soonest');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast(
        'Course syllabi & telemetry synchronized with campus registrar.',
        'success',
      );
    }, 600);
  };
  const filteredCourses = courses.filter((course) => {
    if (
      filterTab === 'honors' &&
      !course.standing.includes('HONORS') &&
      course.standing !== 'PERFECT'
    ) {
      return false;
    }
    if (filterTab === 'archived') {
      return false;
    }
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (
        course.code.toLowerCase().includes(q) ||
        course.title.toLowerCase().includes(q) ||
        course.instructorName.toLowerCase().includes(q)
      );
    }
    return true;
  });
  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header with Badges & Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-100 text-amber-900 border border-amber-300/80">
              • TERM 2025-A ACTIVE
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-slate-100 text-slate-700">
              • 18.0 / 22.0 Credits Enrolled
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Your Registered Courses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your active academic curriculum, access lecture repositories,
            and review upcoming session schedules.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigateTab('enrollment')}
            className="px-4 py-2.5 rounded-2xl bg-secondary-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-secondary-500/20 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span>+ Enroll Elective</span>
          </motion.button>

          <button
            type="button"
            onClick={handleRefresh}
            title="Refresh courses"
            className="p-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
          >
            <RotateCw
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-secondary-500' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* 2. Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${filterTab === 'all' ? 'bg-primary-900 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            All Registered ({courses.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('honors')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${filterTab === 'honors' ? 'bg-primary-900 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            Honors / Lab Tracks (3)
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('archived')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${filterTab === 'archived' ? 'bg-primary-900 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            Completed / Archived (0)
          </button>
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter by code, instructor..."
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-secondary-500"
            />
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-slate-200 px-3 py-1.5 pr-7 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-secondary-500"
            >
              <option value="soonest">Sort: Soonest</option>
              <option value="credits">Sort: Credits</option>
              <option value="attendance">Sort: Attendance</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 3. Main Grid: Course Cards (2 Columns) + Right Summary Card (1 Column) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left/Center Columns (8 cols) */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredCourses.map((course) => (
            <motion.div
              key={course.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.3 }}
              className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md hover:border-slate-300 transition-all"
            >
              <div className="space-y-3">
                {/* Header Tag */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {course.department.toUpperCase()} •{' '}
                    {course.credits.toFixed(1)} CR
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-600">
                    {course.section}
                  </span>
                </div>

                {/* Title */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-primary-900 text-secondary-500 font-mono font-bold text-xs">
                      {course.code}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <h3 className="font-black text-base text-slate-950 mt-1.5 tracking-tight leading-snug">
                    {course.title}
                  </h3>
                </div>

                {/* Instructor */}
                <div className="flex items-center gap-3 pt-1">
                  <img
                    src={course.instructorAvatar}
                    alt={course.instructorName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {course.instructorName}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {course.instructorTitle}
                    </p>
                  </div>
                </div>

                {/* Schedule Strip */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
                  <div className="flex items-center gap-2 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{course.schedule}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 pl-5.5">
                    {course.room}
                  </div>
                </div>

                {/* Attendance Progress */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-500 font-medium">
                      Attendance{' '}
                      <strong className="text-slate-900">
                        {course.attendanceRate.toFixed(1)}%
                      </strong>{' '}
                      ({course.presentSessions}/{course.totalSessions} sessions)
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${course.standing === 'PERFECT' ? 'bg-amber-400 text-slate-950' : course.standing.includes('HONORS') ? 'text-emerald-700 bg-emerald-50' : 'text-slate-700 bg-slate-100'}`}
                    >
                      • {course.standing}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-slate-900 h-full rounded-full"
                      style={{ width: `${course.attendanceRate}%` }}
                    />
                  </div>
                </div>

                {/* Upcoming Notice Card */}
                {course.upcomingNotice && (
                  <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-xs text-amber-950 space-y-1">
                    <span className="text-[10px] font-bold text-amber-700 block uppercase tracking-wider">
                      {course.upcomingNotice.time}
                    </span>
                    <strong className="block font-bold leading-tight">
                      {course.upcomingNotice.title}
                    </strong>
                    <p className="text-[11px] text-amber-900/80">
                      {course.upcomingNotice.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Card Actions */}
              <div className="pt-2 flex items-center gap-2 border-t border-slate-100">
                {course.code === 'CS-401' ? (
                  <>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      onClick={() => onSelectCourse(course)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-primary-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-secondary-500" />
                      <span>View Course Details</span>
                    </motion.button>
                    <button
                      type="button"
                      onClick={() =>
                        showToast('Course CS-401 pinned to favorites.', 'info')
                      }
                      className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                      title="Bookmark"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </>
                ) : course.code === 'SWE-210' ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        showToast(
                          'Opening SWE-210 Virtual Studio Room...',
                          'info',
                        )
                      }
                      className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Course Room</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        showToast('Downloading SWE-210 Syllabus PDF...', 'info')
                      }
                      className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Syllabus</span>
                    </button>
                  </>
                ) : course.code === 'AI-490' ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        showToast(
                          'Launching AI-490 Gymnasium Cluster...',
                          'success',
                        )
                      }
                      className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Virtual Lab</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        showToast('Opening ArXiv discussion channel...', 'info')
                      }
                      className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </>
                ) : course.code === 'MATH-240' ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        showToast(
                          'Opening MATH-240 Problem Set Archive...',
                          'info',
                        )
                      }
                      className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Problem Sets</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        showToast(
                          'Opening Cryptography Resources Folder...',
                          'info',
                        )
                      }
                      className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                    >
                      <FolderOpen className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        showToast(
                          'Connecting to Socratic Ethics Forum...',
                          'info',
                        )
                      }
                      className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Discussion Board</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        showToast(
                          'Bookmarking ETH-310 Socratic Readings...',
                          'info',
                        )
                      }
                      className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right Summary Column (4 cols) - Dark Navy Aesthetic Card */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-7 rounded-3xl bg-primary-900 text-white shadow-xl border border-slate-800 space-y-6 relative overflow-hidden"
          >
            {/* Subtle glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-secondary-500 tracking-wider uppercase">
                  ACADEMIC STANDING • T-2025-A
                </span>
                <ShieldCheck className="w-5 h-5 text-secondary-500" />
              </div>

              <div>
                <h3 className="text-3xl font-black text-white tracking-tight">
                  18.0 Credits
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Full-time matriculation pace. Dean's Honors List eligible.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    AVG ATTENDANCE
                  </span>
                  <div className="text-2xl font-black text-secondary-500 mt-1">
                    96.1%
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    PENDING LABS
                  </span>
                  <div className="text-2xl font-black text-white mt-1">
                    2 Due
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    showToast(
                      'Packaging official verified syllabus bundle (ZIP)...',
                      'success',
                    )
                  }
                  className="w-full py-3 rounded-2xl bg-secondary-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-secondary-500/20 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Official Syllabus Bundle</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
