import { useState } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Search,
  Download,
  Radio,
  ShieldCheck,
  Check,
  X,
  Clock,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
export const TeacherAttendancePage = () => {
  const {
    attendanceRecords,
    updateAttendanceStatus,
    markAllPresent,
    setIsAttendanceModalOpen,
    showToast,
  } = useAdmin();
  const [selectedCourse, setSelectedCourse] = useState('CS-401');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [localSearch, setLocalSearch] = useState('');
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const totalEnrolled = 312;
  const presentCount =
    attendanceRecords.filter((r) => r.status === 'PRESENT').length + 294;
  const absentCount =
    attendanceRecords.filter((r) => r.status === 'ABSENT').length + 7;
  const excusedCount =
    attendanceRecords.filter((r) => r.status === 'EXCUSED').length + 1;
  const filteredRecords = attendanceRecords.filter((r) => {
    const matchesFilter = filterStatus === 'ALL' || r.status === filterStatus;
    const matchesSearch =
      localSearch === '' ||
      r.studentName.toLowerCase().includes(localSearch.toLowerCase()) ||
      r.studentId.toLowerCase().includes(localSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Student Name,Student ID,Check-In Method,Check-In Time,Status\n' +
      attendanceRecords
        .map(
          (e) =>
            `${e.studentName},${e.studentId},${e.checkInMethod},${e.checkInTime},${e.status}`,
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `CS401_Session18_Attendance_${/* @__PURE__ */ new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported Session #18 Attendance CSV file', 'success');
  };
  return (
    <div className="space-y-6">
      {/* 1. Header & Course Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-slate-900 text-secondary-500 border border-slate-800 mb-2">
            <span className="w-2 h-2 rounded-full bg-secondary-500 animate-pulse" />
            <span>FACULTY TELEMETRY PORTAL</span>
            <span className="text-slate-600">•</span>
            <span>Term 2025-A</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
            Attendance & Session Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor attendance percentages, verify telemetry check-ins, and
            export certified records for institutional compliance.
          </p>
        </div>

        {/* Filters: Term & Course */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-xs cursor-pointer"
          >
            <option value="CS-401">CS-401: Distributed Systems (312)</option>
            <option value="SWE-210">SWE-210: Full-Stack Eng. (245)</option>
            <option value="AI-490">AI-490: Deep RL Seminar (165)</option>
            <option value="CS-100">CS-100: Computational Thinking (120)</option>
          </select>

          <button
            type="button"
            onClick={() => setIsAttendanceModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-secondary-500 hover:bg-secondary-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Radio className="w-4 h-4 text-slate-950" />
            <span>Open Session Audit Modal</span>
          </button>
        </div>
      </div>

      {/* 2. Sync Completed Banner (Matching Screen 1) */}
      {!bannerDismissed && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <strong className="font-bold block">Sync Completed</strong>
              <span>
                Session #18 attendance synced with registrar database at 09:59
                AM
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setBannerDismissed(true)}
            className="p-1 rounded-lg text-emerald-700 hover:bg-emerald-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. Telemetry Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-950">
              100% Gate Uptime
            </div>
            <div className="text-[11px] text-slate-500">
              All 4 amphitheater RFID gates calibrated
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-950">
              FERPA Compliant
            </div>
            <div className="text-[11px] text-slate-500">
              Student biometric data encrypted at rest
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-950">
              Next Audit Milestone
            </div>
            <div className="text-[11px] text-slate-500">
              Mid-term registrar sync in 4 days
            </div>
          </div>
        </div>
      </div>

      {/* 4. Session #18 Attendance Record Interactive View (Screen 1 core) */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Record Header */}
        <div className="p-6 bg-slate-900 text-white border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-secondary-500 text-slate-950 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse" />
              <span>CS-401 LIVE AUDIT</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Session #18 Attendance Record — CS-401
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Wednesday, Oct 23, 2025 • 10:00 AM – 11:30 AM • Amphitheater L-102
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Attendance Statistics Strip (4 Blocks matching Screen 1) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 border-b border-slate-100 bg-slate-50/50">
          <div className="p-4 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Enrolled
            </span>
            <span className="text-2xl font-black text-slate-950 mt-1 block">
              {totalEnrolled}
            </span>
          </div>

          <div className="p-4 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
              Present
            </span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">
              {presentCount}{' '}
              <span className="text-xs font-semibold">(96.8%)</span>
            </span>
          </div>

          <div className="p-4 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">
              Absent
            </span>
            <span className="text-2xl font-black text-rose-600 mt-1 block">
              {absentCount}
            </span>
          </div>

          <div className="p-4 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
              Excused
            </span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">
              {excusedCount}
            </span>
          </div>
        </div>

        {/* Toolbar: Mark all present, filters & quick search */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
          <div className="flex flex-wrap items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={markAllPresent}
              className="px-3.5 py-2 rounded-xl bg-primary-900 hover:bg-primary-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Check className="w-3.5 h-3.5 text-secondary-500" />
              <span>Mark All Present</span>
            </motion.button>

            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFilterStatus('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${filterStatus === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('PRESENT')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${filterStatus === 'PRESENT' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Present ({presentCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('ABSENT')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${filterStatus === 'ABSENT' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Absent ({absentCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('EXCUSED')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${filterStatus === 'EXCUSED' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Excused ({excusedCount})
              </button>
            </div>
          </div>

          {/* Quick Search */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Quick Search Student..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
        </div>

        {/* Student Records Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-6">Student Info</th>
                <th className="py-3 px-6">Telemetry Method</th>
                <th className="py-3 px-6">Recorded Check-In</th>
                <th className="py-3 px-6 text-right">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredRecords.map((record) => (
                <tr
                  key={record.id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {record.studentName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">
                          {record.studentName}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {record.studentId}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-6 text-slate-600">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                      {record.checkInMethod}
                    </span>
                  </td>

                  <td className="py-3.5 px-6 font-mono text-slate-500">
                    {record.checkInTime}
                  </td>

                  <td className="py-3.5 px-6 text-right">
                    <div className="inline-flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
                      <button
                        type="button"
                        onClick={() =>
                          updateAttendanceStatus(record.id, 'PRESENT')
                        }
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${record.status === 'PRESENT' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                      >
                        PRESENT
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateAttendanceStatus(record.id, 'ABSENT')
                        }
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${record.status === 'ABSENT' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                      >
                        ABSENT
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateAttendanceStatus(record.id, 'EXCUSED')
                        }
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${record.status === 'EXCUSED' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                      >
                        EXCUSED
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <span className="text-slate-500">
            Telemetry records auto-lock 15 minutes post-lecture adjournment.
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => showToast('Session changes discarded', 'info')}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
            >
              Discard Changes
            </button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                showToast(
                  'Attendance certified and permanently recorded with registrar.',
                  'success',
                )
              }
              className="px-4 py-2 rounded-xl bg-primary-900 hover:bg-primary-700 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 text-secondary-500" />
              <span>Log & Certify Attendance</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};
