import { motion } from 'motion/react';
import {
  Clock,
  ArrowRight,
  Download,
  FileText,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Radio,
  Sparkles,
  GraduationCap,
  Navigation,
  FileCheck,
} from 'lucide-react';
import { upcomingStudentSessions, studentBulletins } from './studentMockData';
import { useAdmin } from '../../context/AdminContext';
export const StudentDashboardPage = ({
  courses,
  onNavigateTab,
  onOpenCheckIn,
  onOpenTimetable,
  onSelectCourse,
}) => {
  const { showToast } = useAdmin();
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };
  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-7 pb-16"
    >
      {/* 1. Welcome Banner (Dark Navy Theme) */}
      <motion.div
        variants={item}
        className="rounded-3xl bg-primary-900 text-white p-6 sm:p-8 relative overflow-hidden shadow-xl border border-slate-800"
      >
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            {/* Honors Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/15 text-secondary-500 border border-secondary-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SENIOR COHORT • ACADEMIC HONORS STANDING</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Welcome back, Julian! <span>🚀</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              B.S. Computer Science & Cybernetics • Term 2025-A • Campus ID:{' '}
              <span className="font-mono text-secondary-500">OI-8841-VH</span>
            </p>

            {/* Notification alert pill */}
            <div className="mt-4 p-3 rounded-2xl bg-slate-900/90 border border-slate-800/90 flex items-center gap-3 text-xs text-slate-300">
              <div className="w-7 h-7 rounded-xl bg-secondary-500/20 text-secondary-500 flex items-center justify-center shrink-0">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-white">
                  Next Lecture in 40 mins • Amphitheater L-102 •{' '}
                </span>
                <span className="text-slate-300">
                  CS-401 Advanced Neural Architectures with Prof. Vance • Lab
                  assignment 4 due Friday 23:59 EST.
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row lg:flex-col gap-3 shrink-0 self-start lg:self-center">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigateTab('enrollment')}
              className="px-5 py-3 rounded-2xl bg-secondary-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-secondary-500/20 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <span>+ Register Electives</span>
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenTimetable}
              className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs border border-slate-800 shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
            >
              <span>Weekly Timetable</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* 2. Top 3 Stat Cards */}
      <motion.div
        variants={item}
        className="grid grid-cols-1 md:grid-cols-3 gap-5"
      >
        {/* Registered Curriculum */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200/60">
              1 PENDING AUDIT
            </span>
          </div>

          <div className="mt-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              REGISTERED CURRICULUM
            </span>
            <div className="text-2xl font-black text-slate-950 mt-0.5">
              5 Active{' '}
              <span className="text-sm font-semibold text-slate-400">
                / 6 max term limit
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mt-3 pt-3 border-t border-slate-100">
              <span>18 Credit Units Total</span>
              <span className="text-emerald-700 font-bold">
                All Prereqs Met
              </span>
            </div>
          </div>
        </div>

        {/* Weekly Commitment */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-secondary-500 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/60 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              TODAY: 2 CLASSES
            </span>
          </div>

          <div className="mt-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              WEEKLY COMMITMENT
            </span>
            <div className="text-2xl font-black text-slate-950 mt-0.5">
              8 Sessions{' '}
              <span className="text-sm font-semibold text-slate-400">
                Scheduled
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mt-3 pt-3 border-t border-slate-100">
              <span>3 Lectures • 2 Labs • 3 Seminars</span>
              <span className="text-slate-800 font-bold">Next: 10:00 AM</span>
            </div>
          </div>
        </div>

        {/* Telemetry Verified */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/60">
              IN GOOD STANDING
            </span>
          </div>

          <div className="mt-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              TELEMETRY VERIFIED
            </span>
            <div className="text-2xl font-black text-slate-950 mt-0.5 flex items-baseline gap-2">
              96.4%{' '}
              <span className="text-xs font-bold text-emerald-600">
                ↑+1.2% this month
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mt-3 pt-3 border-t border-slate-100">
              <span>158 / 165 Sessions logged</span>
              <span className="text-indigo-700 font-bold">Top 5% Cohort</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 3. Main Dashboard Body: Left Course Attendance Telemetry + Right Upcoming Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Left Column (8 cols): Course Attendance & Telemetry */}
        <motion.div variants={item} className="lg:col-span-8 space-y-4">
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-950 tracking-tight">
                    Course Attendance & Telemetry
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60">
                    LIVE SYNC
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Institutional benchmark is 85.0%. Courses maintaining ≥95%
                  qualify for Honors Transcripts.
                </p>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs font-mono text-slate-700 shrink-0">
                <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>Turnstile RFID Synced</span>
              </div>
            </div>

            {/* Course Rows */}
            <div className="space-y-4">
              {courses.map((course) => {
                const getStandingBadge = () => {
                  if (course.standing === 'PERFECT') {
                    return 'bg-amber-400 text-slate-950 font-black';
                  }
                  if (course.standing.includes('HONORS')) {
                    return 'bg-emerald-50 text-emerald-800 border border-emerald-200';
                  }
                  if (course.standing === 'GOOD STANDING') {
                    return 'bg-slate-100 text-slate-800';
                  }
                  return 'bg-blue-50 text-blue-800';
                };
                return (
                  <motion.div
                    key={course.id}
                    whileHover={{ scale: 1.008 }}
                    onClick={() => onSelectCourse(course)}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition-all cursor-pointer space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-900 text-secondary-500 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                          {course.code.slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-sm text-slate-950">
                              {course.code}: {course.title}
                            </h4>
                            {course.standing === 'PERFECT' && (
                              <Sparkles className="w-3.5 h-3.5 text-secondary-500" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {course.instructorName} • {course.schedule} •{' '}
                            {course.room}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 sm:text-right shrink-0">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getStandingBadge()}`}
                        >
                          {course.standing}
                        </span>
                        <div className="text-lg font-black text-slate-950">
                          {course.attendanceRate.toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar with Benchmark */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-1">
                        <span>
                          {course.presentSessions} / {course.totalSessions}{' '}
                          Sessions Logged
                        </span>
                        <span>
                          Threshold: 85% (+
                          {(course.attendanceRate - 85).toFixed(1)}% surplus)
                        </span>
                      </div>
                      <div className="relative w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${course.attendanceRate}%` }}
                          transition={{ duration: 0.9, ease: 'easeOut' }}
                          className={`h-full rounded-full ${course.attendanceRate >= 95 ? 'bg-slate-900' : 'bg-slate-700'}`}
                        />
                        {/* 85% marker */}
                        <div
                          className="absolute top-0 bottom-0 left-[85%] w-0.5 bg-amber-400 z-10"
                          title="85% Requirement"
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer verification note */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>
                  FERPA & Academic Integrity certified • Real-time turnstile
                  verification
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  showToast(
                    'Generated Official Attendance Audit Log (PDF)',
                    'success',
                  )
                }
                className="text-slate-900 hover:text-secondary-500 font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>Download Official Audit Log (.PDF)</span>
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Right Column (4 cols): Upcoming Strip & Bulletins */}
        <motion.div variants={item} className="lg:col-span-4 space-y-6">
          {/* Upcoming Strip */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-950">
                    Upcoming Strip
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    4 Sessions Remaining
                  </span>
                </div>
              </div>

              <span className="text-xs font-mono font-bold text-secondary-500">
                TODAY
              </span>
            </div>

            <div className="space-y-4">
              {upcomingStudentSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-700 tracking-wider">
                      {session.dateBadge}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-semibold text-slate-600">
                      {session.statusBadge}
                    </span>
                  </div>

                  <h5 className="font-bold text-slate-950 leading-snug">
                    {session.courseCode}: {session.title}
                  </h5>

                  <p className="text-[11px] text-slate-500">
                    {session.instructor} • {session.room}
                  </p>

                  {session.isPrimary && (
                    <div className="pt-2 flex items-center gap-2">
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.96 }}
                        onClick={() =>
                          onOpenCheckIn(
                            `${session.courseCode}: ${session.title}`,
                          )
                        }
                        className="px-3.5 py-1.5 rounded-xl bg-secondary-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span>Check-in Live</span>
                      </motion.button>

                      <button
                        type="button"
                        onClick={() =>
                          showToast(
                            `Navigating to Amphitheater L-102 via Alan Turing Complex Hub`,
                            'info',
                          )
                        }
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Directions</span>
                      </button>
                    </div>
                  )}

                  {session.actionType === 'virtual_node' && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() =>
                          showToast(
                            `Mounting Jupyter Hub Kernel for AI-490 Policy Gradient Lab`,
                            'info',
                          )
                        }
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Virtual Node</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() =>
                  showToast(
                    'Exported upcoming schedule to Apple / Google Calendar (.ics)',
                    'info',
                  )
                }
                className="text-xs font-bold text-slate-600 hover:text-slate-950 cursor-pointer flex items-center justify-center gap-1 mx-auto"
              >
                <span>Export Schedule (.ics / Google Cal)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Faculty Bulletins */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-sm font-black text-slate-950 flex items-center gap-2">
                <span>Faculty Bulletins</span>
                <span className="w-2 h-2 rounded-full bg-secondary-500" />
              </h4>
              <span className="text-[10px] text-slate-400">Live feed</span>
            </div>

            <div className="space-y-3">
              {studentBulletins.map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={b.avatar}
                        alt={b.author}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="font-bold text-slate-900">
                        {b.author}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {b.time}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-snug">
                    {b.title}
                  </p>

                  {b.attachment && (
                    <button
                      type="button"
                      onClick={() =>
                        showToast(`Downloading ${b.attachment}...`, 'info')
                      }
                      className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-800 flex items-center gap-1.5 hover:bg-slate-100 cursor-pointer"
                    >
                      <FileText className="w-3 h-3 text-rose-600" />
                      <span>{b.attachment}</span>
                    </button>
                  )}

                  {b.tag && (
                    <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                      {b.tag}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
