import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Radio,
  Download,
  Printer,
  CheckCircle2,
  Code2,
  BookOpen,
  CalendarCheck,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
export const TeacherSchedulePage = () => {
  const { setIsAttendanceModalOpen, showToast } = useAdmin();
  const [scheduleView, setScheduleView] = useState('grid');
  return (
    <div className="space-y-6">
      {/* 1. Page Header with Week Nav & View Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-50 text-amber-900 border border-amber-200/80 mb-2">
            <span className="w-2 h-2 rounded-full bg-secondary-500" />
            <span>SYNCHRONIZED WITH SIS REGISTRAR</span>
            <span className="text-amber-400">•</span>
            <span>Fall Term 2025-A</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
            Weekly Teaching Timetable & Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Recurring course lectures, capstone office hours, departmental
            colloquia, and graduate laboratory allocations for Dr. Vance.
          </p>
        </div>

        {/* Controls: Week navigator & View Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Week Selector */}
          <div className="flex items-center bg-white border border-slate-200/90 rounded-xl p-1 shadow-xs">
            <button
              type="button"
              onClick={() =>
                showToast('Navigated to previous academic week', 'info')
              }
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-secondary-500" />
              <span>Week 08: Oct 21 – Oct 27, 2025</span>
            </span>
            <button
              type="button"
              onClick={() =>
                showToast('Navigated to next academic week', 'info')
              }
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Today Button */}
          <button
            type="button"
            onClick={() =>
              showToast('Reset calendar view to current session', 'info')
            }
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
            <span>Today</span>
          </button>

          {/* Grid / Agenda Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setScheduleView('grid')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${scheduleView === 'grid' ? 'bg-primary-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Weekly Grid
            </button>
            <button
              type="button"
              onClick={() => setScheduleView('agenda')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${scheduleView === 'agenda' ? 'bg-primary-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Agenda
            </button>
            <button
              type="button"
              onClick={() => setScheduleView('monthly')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${scheduleView === 'monthly' ? 'bg-primary-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Monthly
            </button>
          </div>
        </div>
      </div>

      {/* 2. Summary Metric Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Weekly Commitment
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-950">
              14.5{' '}
              <span className="text-sm font-semibold text-slate-500">
                Teaching Hours
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="font-bold text-emerald-700">Standard Load</span>
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-secondary-500 w-3/4 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Cohorts
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-950">
              4{' '}
              <span className="text-sm font-semibold text-slate-500">
                Courses Enrolled
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] font-mono font-bold">
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                CS-401
              </span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                SWE-210
              </span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                AI-490
              </span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                CS-100
              </span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Session Cadence
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-950">
              8{' '}
              <span className="text-sm font-semibold text-slate-500">
                Meetings / Week
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>6 Lectures & Labs</span>
              <span>2 Office / Syncs</span>
            </div>
          </div>
        </div>

        {/* Card 4: Next Live Session */}
        <div className="p-5 rounded-2xl bg-primary-800 text-white border border-slate-800 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Next Live Session
            </span>
            <div className="w-12 h-6 rounded-full bg-secondary-500 text-slate-950 text-[10px] font-black flex items-center justify-center shadow-xs">
              IN 45 MINS
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg font-black text-white">CS-401 Lecture</div>
            <div className="text-xs text-slate-300 mt-0.5">
              Today (Wed) • 10:00 – 11:30 AM
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-secondary-500">
              <MapPin className="w-3.5 h-3.5" />
              <span>Amphitheater L-102 • 312 Enrolled</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Five Day Schedule Columns (Monday - Friday) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* MONDAY */}
        <div className="space-y-3">
          <div className="p-3 rounded-2xl bg-white border border-slate-200/90 text-center">
            <span className="text-xs font-bold text-slate-900 block">
              Monday
            </span>
            <span className="text-[10px] text-slate-400">
              Oct 21 • 2 Events
            </span>
          </div>

          {/* Event 1: CS-401 */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 shadow-md border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-secondary-500 text-slate-950">
                10:00 – 11:30 AM
              </span>
              <Code2 className="w-4 h-4 text-slate-400" />
            </div>

            <div>
              <h4 className="font-bold text-sm text-white">
                CS-401: Distributed Operating Systems
              </h4>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                <MapPin className="w-3 h-3 text-secondary-500" />
                <span>Amphitheater L-102</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                👥 312 Students Enrolled
              </div>
            </div>

            <div className="pt-2 space-y-1.5 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAttendanceModalOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-secondary-500 hover:bg-secondary-600 text-slate-950 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <span>Launch Attendance</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  showToast('Opening CS-401 Class Roster (312 records)', 'info')
                }
                className="w-full py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <span>View Class Roster</span>
              </button>
            </div>
          </div>

          {/* Event 2: Faculty Sync */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
              14:00 – 15:30 PM
            </span>
            <h4 className="font-bold text-xs text-slate-900">
              Departmental Faculty Sync
            </h4>
            <p className="text-[11px] text-slate-500">
              Curriculum Review & Capstone Approval
            </p>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-1">
              <MapPin className="w-3 h-3" />
              <span>Conference Room 304</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
              ALL CS FACULTY
            </span>
          </div>
        </div>

        {/* TUESDAY */}
        <div className="space-y-3">
          <div className="p-3 rounded-2xl bg-white border border-slate-200/90 text-center">
            <span className="text-xs font-bold text-slate-900 block">
              Tuesday
            </span>
            <span className="text-[10px] text-slate-400">
              Oct 22 • 2 Events
            </span>
          </div>

          {/* SWE-210 */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 shadow-md border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400 text-slate-950">
                09:00 – 10:30 AM
              </span>
              <BookOpen className="w-4 h-4 text-slate-400" />
            </div>

            <div>
              <h4 className="font-bold text-sm text-white">
                SWE-210: Enterprise Full-Stack Eng.
              </h4>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                <MapPin className="w-3 h-3 text-secondary-500" />
                <span>Tech Hall B-12</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                👥 245 Students Enrolled
              </div>
            </div>

            <div className="pt-2 space-y-1.5 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAttendanceModalOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-secondary-500 hover:bg-secondary-600 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
              >
                <span>Take Attendance</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  showToast('Opening Git lab repositories for SWE-210', 'info')
                }
                className="w-full py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
              >
                <span>Lab Repositories</span>
              </button>
            </div>
          </div>

          {/* AI-490 */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-100 text-purple-800">
              14:00 – 15:30 PM
            </span>
            <h4 className="font-bold text-xs text-slate-900">
              AI-490: Deep Reinforcement Learning
            </h4>
            <p className="text-[11px] text-slate-500">
              Graduate Seminar & Policy Optimization
            </p>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-1">
              <MapPin className="w-3 h-3" />
              <span>Suite A-204 • 165 Students</span>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                Seminar
              </span>
              <span className="text-indigo-600 font-bold hover:underline cursor-pointer">
                Details →
              </span>
            </div>
          </div>
        </div>

        {/* WEDNESDAY (Active Today Column with Highlight) */}
        <div className="space-y-3">
          <div className="p-3 rounded-2xl bg-primary-800 text-white border-2 border-secondary-500 text-center shadow-lg relative">
            <div className="flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary-500 animate-pulse" />
              <span className="text-xs font-black text-white block">
                Wednesday
              </span>
            </div>
            <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
              Oct 23 • Today • LIVE
            </span>
          </div>

          {/* Wednesday Live CS-401 */}
          <div className="p-4 rounded-2xl bg-primary-900 text-white space-y-3 border-2 border-secondary-500 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="px-2 py-0.5 rounded bg-secondary-500 text-slate-950 font-bold text-[10px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse" />
                <span>STARTING IN 45M</span>
              </div>
              <span className="font-mono text-xs text-slate-300 font-bold">
                10:00 – 11:30 AM
              </span>
            </div>

            <div>
              <h4 className="font-bold text-sm text-white">
                CS-401: Distributed Operating Systems
              </h4>
              <div className="flex items-center gap-1.5 text-[11px] text-amber-300 mt-1">
                <MapPin className="w-3 h-3 text-secondary-500" />
                <span>Amphitheater L-102</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                👥 312 Students • Attendance Required
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsAttendanceModalOpen(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-secondary-500 hover:bg-secondary-600 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Start Session & Log</span>
            </motion.button>
          </div>

          {/* Wednesday Office Hours */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800">
              13:00 – 14:30 PM
            </span>
            <h4 className="font-bold text-xs text-slate-900">
              Walk-In Office Hours & Advising
            </h4>
            <p className="text-[11px] text-slate-500">
              Thesis guidance & general student consults
            </p>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-1">
              <MapPin className="w-3 h-3" />
              <span>Office 412 (Faculty Tower)</span>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
              <span className="text-slate-500 font-medium">
                3 Queue Bookings
              </span>
              <button
                type="button"
                onClick={() =>
                  showToast('Opening walk-in queue for Office 412', 'info')
                }
                className="font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                Open Queue
              </button>
            </div>
          </div>
        </div>

        {/* THURSDAY */}
        <div className="space-y-3">
          <div className="p-3 rounded-2xl bg-white border border-slate-200/90 text-center">
            <span className="text-xs font-bold text-slate-900 block">
              Thursday
            </span>
            <span className="text-[10px] text-slate-400">
              Oct 24 • 2 Events
            </span>
          </div>

          {/* SWE-210 */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-2.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-800">
              09:00 – 10:30 AM
            </span>
            <h4 className="font-bold text-xs text-slate-900">
              SWE-210: Enterprise Full-Stack Eng.
            </h4>
            <div className="text-[11px] text-slate-500">
              <span>Tech Hall B-12 • 245 Students</span>
            </div>
            <button
              type="button"
              onClick={() => showToast('Viewing SWE-210 Class Roster', 'info')}
              className="w-full py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
            >
              Check Roster
            </button>
          </div>

          {/* AI-490 */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-50 text-purple-800">
              14:00 – 15:30 PM
            </span>
            <h4 className="font-bold text-xs text-slate-900">
              AI-490: Deep Reinforcement Learning
            </h4>
            <p className="text-[11px] text-slate-500">
              Actor-Critic Networks & PPO Case Study
            </p>
            <div className="text-[11px] text-slate-400">
              Suite A-204 • 165 Students
            </div>
            <span className="inline-block px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">
              Lab Session
            </span>
          </div>
        </div>

        {/* FRIDAY */}
        <div className="space-y-3">
          <div className="p-3 rounded-2xl bg-white border border-slate-200/90 text-center">
            <span className="text-xs font-bold text-slate-900 block">
              Friday
            </span>
            <span className="text-[10px] text-slate-400">
              Oct 25 • 2 Events
            </span>
          </div>

          {/* CS-100 */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-2.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-800">
              10:00 AM – 13:00 PM
            </span>
            <h4 className="font-bold text-xs text-slate-900">
              CS-100: Foundations of Computational Thinking
            </h4>
            <div className="text-[11px] text-slate-500">
              Hall C-1 • 120 Students
            </div>
            <p className="text-[11px] text-slate-400">
              Hands-on Algorithm Workshop
            </p>
            <button
              type="button"
              onClick={() => setIsAttendanceModalOpen(true)}
              className="w-full py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
            >
              Take Attendance
            </button>
          </div>

          {/* Research Lab Mentorship */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-900">
              14:00 – 16:00 PM
            </span>
            <h4 className="font-bold text-xs text-slate-900">
              Research Lab Mentorship
            </h4>
            <p className="text-[11px] text-slate-500">
              Postdoc & Doctoral Progress Defenses
            </p>
            <div className="text-[11px] text-slate-400">
              AI Cybernetics Wing (Lab 4B)
            </div>
            <div className="flex items-center justify-between text-[10px] pt-1">
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                Doctoral
              </span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Confirmed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Cards: Registrar Audit & Calendar Sync */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Registrar Audit Status */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Registrar Audit Status
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-950">
              All Venues Operational
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Zero facility booking conflicts detected across Amphitheater
              L-102, Tech Hall B-12, and Suite A-204.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <strong className="block text-slate-900 font-semibold text-[11px]">
                Smart Lock & AV Sync Verified
              </strong>
              <span className="text-[10px] text-slate-400">
                Automated lecture capture triggers 5 mins prior
              </span>
            </div>
          </div>
        </div>

        {/* Schedule Export & Live Calendar Sync */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Sync & External Feeds
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold">
                AUTO-SYNC 15 MIN
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-950 mt-1">
              Schedule Export & Live Calendar Sync
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Keep your personal Apple Calendar, Microsoft Outlook, or Google
              Calendar updated continuously with your official faculty
              timetable.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() =>
                showToast(
                  'Google Calendar WebCal feed subscribed successfully',
                  'success',
                )
              }
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-indigo-600" />
              <span>Subscribe to Google Calendar</span>
            </button>

            <button
              type="button"
              onClick={() =>
                showToast('Downloaded official .iCal calendar feed', 'info')
              }
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export .iCal Feed</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-primary-950 hover:bg-primary-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs ml-auto"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Weekly PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
