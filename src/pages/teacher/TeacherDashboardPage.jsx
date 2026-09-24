import { useState } from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  Users,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Plus,
  MapPin,
  Eye,
  X,
  Radio,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { ScrollReveal } from '../../components/shared/ScrollReveal';
export const TeacherDashboardPage = () => {
  const {
    setTeacherTab,
    setIsAttendanceModalOpen,
    setIsNewCourseModalOpen,
    teacherCourses,
    submissions,
    showToast,
  } = useAdmin();
  const [syncNoticeDismissed, setSyncNoticeDismissed] = useState(false);
  return (
    <div className="space-y-6">
      {/* 1. Hero Dark Banner (Matching Screen 3) */}
      <div className="rounded-3xl bg-primary-900 text-white p-6 sm:p-8 relative overflow-hidden border border-slate-800 shadow-xl">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-slate-800/90 text-secondary-500 border border-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-500 animate-pulse" />
              <span>LIVE TERM 2025-A</span>
              <span className="text-slate-500">•</span>
              <span>Faculty Portal</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Welcome back, Professor Vance</span>
              <span className="inline-block animate-bounce">👋</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Department of Computer Science & Artificial Intelligence • Fall
              Academic Term 2025-A
            </p>

            {/* Next Lecture Live Tag */}
            <div className="pt-1 flex items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-slate-200">
                <Radio className="w-3.5 h-3.5 text-secondary-500 animate-pulse" />
                <span>
                  Next Lecture:{' '}
                  <strong className="text-secondary-500">CS-401 in 45 mins</strong>{' '}
                  • Amphitheater L-102
                </span>
              </div>
            </div>
          </div>

          {/* Right Action Buttons & Sync Notice */}
          <div className="flex flex-col sm:items-end gap-3">
            {!syncNoticeDismissed && (
              <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2.5 max-w-sm shadow-md">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="flex-1 text-[11px]">
                  <strong className="block text-emerald-300 font-bold">
                    Grade Engine Synchronized
                  </strong>
                  <span>Verified for CS-401 Session #14 • 100% committed</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSyncNoticeDismissed(true)}
                  className="text-emerald-400 hover:text-white p-1 rounded-md cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setTeacherTab('schedule')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>View Today's Lectures</span>
              </button>

              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsNewCourseModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-secondary-500 hover:bg-secondary-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-slate-950" />
                <span>Create New Course</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1 */}
        <ScrollReveal delay={0.05}>
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Teaching Portfolio
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black text-slate-950 tracking-tight">
                4 Active Tracks
              </div>
              <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600 font-medium">
                <span className="font-bold">+1 Elective</span>
                <span className="text-slate-400">
                  Advanced Seminar added to term catalog
                </span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Metric 2 */}
        <ScrollReveal delay={0.1}>
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Enrolled Students
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black text-slate-950 tracking-tight">
                842 Students
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-secondary-500" />
                <span className="text-slate-600">
                  CS-401 leading with 312 enrolled
                </span>
                <span className="font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">
                  98% CAP
                </span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Metric 3 */}
        <ScrollReveal delay={0.15}>
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Overall Attendance
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black text-slate-950 tracking-tight">
                95.8%
                <span className="text-sm font-semibold text-emerald-600 ml-2">
                  ↑ 2.4%
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Exceeding departmental benchmark by 4.2%</span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* 3. Course Enrollment & Capacity Distribution (Matching Screen 3) */}
      <ScrollReveal delay={0.1}>
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary-500" />
                <h3 className="text-base font-bold text-slate-950">
                  Course Enrollment & Capacity Distribution
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time enrolled cohort volume versus seat ceiling across your
                active term curriculum
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200/70 text-[10px]">
                <span className="w-2 h-2 rounded-full bg-secondary-500" />
                Priority Flagship Course
              </span>
            </div>
          </div>

          {/* Capacity Scale Indicator */}
          <div className="relative text-[10px] font-mono font-semibold text-slate-400 flex justify-between px-1 border-b border-slate-100 pb-1">
            <span>0</span>
            <span>100</span>
            <span>200</span>
            <span>300</span>
            <span>350 Cap</span>
          </div>

          {/* Course Bar Rows */}
          <div className="space-y-4">
            {teacherCourses.map((course) => (
              <div key={course.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-950">
                      {course.code}
                    </span>
                    <span className="text-slate-600 font-medium truncate max-w-xs sm:max-w-md">
                      {course.title}
                    </span>
                    {course.tag && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-slate-100 text-slate-600">
                        {course.tag}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-slate-900">
                      {course.enrolled}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      / {course.capacity} seats
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${course.percentFilled >= 90 ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'}`}
                    >
                      {course.percentFilled}% CAP
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-4 bg-slate-100 rounded-lg overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${course.percentFilled}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-lg flex items-center justify-end pr-2 text-[10px] font-bold ${course.isFlagship ? 'bg-secondary-500 text-slate-950 shadow-sm' : 'bg-primary-800 text-white'}`}
                  >
                    <span className="truncate">{course.enrolled} enrolled</span>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* 4. Two Columns: Today's Teaching Schedule & Recent Submissions (Matching Screen 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Today's Teaching Schedule */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-950">
                    Today's Teaching Schedule
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Wednesday, Fall Term Week 8
                  </span>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                3 SESSIONS
              </span>
            </div>

            {/* 3 Schedule Cards */}
            <div className="space-y-3">
              {/* Session 1: Next Up */}
              <div className="p-4 rounded-xl bg-amber-50/60 border-2 border-secondary-500 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="text-center font-mono shrink-0 pt-0.5">
                    <span className="font-bold text-xs text-slate-950 block">
                      10:00
                    </span>
                    <span className="text-[10px] text-slate-500">11:30 AM</span>
                  </div>
                  <div className="border-l border-amber-300/80 pl-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-950">
                        CS-401: Deep Neural Networks
                      </h4>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-secondary-500 text-slate-950 uppercase">
                        NEXT UP
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-600 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>Amphitheater Hall L-102 • 312 Registered</span>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsAttendanceModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-primary-950 hover:bg-primary-600 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <span>Launch Attendance</span>
                </motion.button>
              </div>

              {/* Session 2: Office Hours */}
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="text-center font-mono shrink-0 pt-0.5">
                    <span className="font-bold text-xs text-slate-950 block">
                      13:00
                    </span>
                    <span className="text-[10px] text-slate-500">14:30 PM</span>
                  </div>
                  <div className="border-l border-slate-200 pl-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-950">
                        Faculty Office Hours & Mentorship
                      </h4>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-200 text-slate-700">
                        Turing Wing
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>Faculty Office #412 • 4 Students in Queue</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      'Office hour queue: 4 students waiting for walk-in review',
                      'info',
                    )
                  }
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>View Queue</span>
                </button>
              </div>

              {/* Session 3: RL Seminar */}
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="text-center font-mono shrink-0 pt-0.5">
                    <span className="font-bold text-xs text-slate-950 block">
                      15:00
                    </span>
                    <span className="text-[10px] text-slate-500">16:30 PM</span>
                  </div>
                  <div className="border-l border-slate-200 pl-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-950">
                        AI-490: Advanced RL Seminar
                      </h4>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-100 text-purple-700">
                        Research Lab
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>Robotics Studio B-04 • 165 Enrolled</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAttendanceModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-primary-950 hover:bg-primary-600 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <span>Launch Attendance</span>
                </button>
              </div>
            </div>

            {/* Bottom Schedule Links */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Export calendar to iCal or Google Workspace
              </span>
              <button
                type="button"
                onClick={() => setTeacherTab('schedule')}
                className="font-bold text-slate-900 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
              >
                <span>Full Weekly Grid</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Submissions */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-950">
                    Recent Submissions
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Live activity from active coursework
                  </span>
                </div>
              </div>
            </div>

            {/* Submissions List */}
            <div className="space-y-3">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/70 flex items-center justify-between gap-3 hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {sub.studentName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-950 truncate">
                        {sub.studentName}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {sub.assignmentTitle}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-900 font-mono">
                      {sub.courseCode}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {sub.submittedAt}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Batch Grade trigger */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                38 pending grading reviews
              </span>
              <button
                type="button"
                onClick={() =>
                  showToast(
                    'Batch grading queue opened for CS-401 Lab 4',
                    'success',
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Batch Grade</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
