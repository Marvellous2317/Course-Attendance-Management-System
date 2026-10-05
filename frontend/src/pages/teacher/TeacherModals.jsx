import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Check,
  Download,
  Sparkles,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
export const TeacherModals = () => {
  const {
    isAttendanceModalOpen,
    setIsAttendanceModalOpen,
    isNewCourseModalOpen,
    setIsNewCourseModalOpen,
    attendanceRecords,
    updateAttendanceStatus,
    markAllPresent,
    addTeacherCourse,
    showToast,
  } = useAdmin();
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchStudent, setSearchStudent] = useState('');
  const [courseCode, setCourseCode] = useState('CS-520');
  const [courseTitle, setCourseTitle] = useState(
    'Distributed Systems & Consensus Protocols',
  );
  const [department, setDepartment] = useState(
    'School of Computing & Cybernetics',
  );
  const [overview, setOverview] = useState(
    'In-depth investigation of peer-to-peer topologies, Paxos/Raft quorum consensus algorithms, fault-tolerant replication, and decentralized transaction processing. Prerequisites: CS-401 and Systems Programming competency.',
  );
  const [schedule, setSchedule] = useState(
    'Mondays & Wednesdays \u2022 14:00 \u2013 15:30 PM',
  );
  const [room, setRoom] = useState('Amphitheater Hall L-102');
  const [capacity, setCapacity] = useState(150);
  const [credits, setCredits] = useState(4);
  const totalEnrolled = 312;
  const presentCount =
    attendanceRecords.filter((r) => r.status === 'PRESENT').length + 294;
  const absentCount =
    attendanceRecords.filter((r) => r.status === 'ABSENT').length + 7;
  const excusedCount =
    attendanceRecords.filter((r) => r.status === 'EXCUSED').length + 1;
  const filteredAttendance = attendanceRecords.filter((r) => {
    const matchesFilter = filterStatus === 'ALL' || r.status === filterStatus;
    const matchesSearch =
      searchStudent === '' ||
      r.studentName.toLowerCase().includes(searchStudent.toLowerCase()) ||
      r.studentId.toLowerCase().includes(searchStudent.toLowerCase());
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
      `CS401_Session18_Audit_${/* @__PURE__ */ new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported Session #18 Attendance CSV', 'success');
  };
  const handleCreateCourse = (e) => {
    e.preventDefault();
    if (!courseCode || !courseTitle) {
      showToast('Course code and title are required', 'error');
      return;
    }
    addTeacherCourse({
      code: courseCode,
      title: courseTitle,
      department,
      overview,
      enrolled: 0,
      capacity: Number(capacity),
      schedule,
      room,
      credits: Number(credits),
      tag: 'New Elective',
    });
    setIsNewCourseModalOpen(false);
  };
  return (
    <AnimatePresence>
      {/* 1. Interactive Session #18 Attendance Modal (Screen 1) */}
      {isAttendanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAttendanceModalOpen(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 my-auto border border-slate-200"
          >
            {/* Modal Header */}
            <div className="p-6 bg-primary-900 text-white border-b border-slate-800 flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-secondary-500 text-slate-950 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse" />
                  <span>CS-401 LIVE AUDIT</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Session #18 Attendance Record — CS-401
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Wednesday, Oct 23, 2025 • 10:00 AM – 11:30 AM • Amphitheater
                  L-102
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAttendanceModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Statistics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 border-b border-slate-100 bg-slate-50/50">
              <div className="p-4 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Total Enrolled
                </span>
                <span className="text-2xl font-black text-slate-950 mt-0.5 block">
                  {totalEnrolled}
                </span>
              </div>
              <div className="p-4 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
                  Present
                </span>
                <span className="text-2xl font-black text-emerald-600 mt-0.5 block">
                  {presentCount}{' '}
                  <span className="text-xs font-semibold">(96.8%)</span>
                </span>
              </div>
              <div className="p-4 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">
                  Absent
                </span>
                <span className="text-2xl font-black text-rose-600 mt-0.5 block">
                  {absentCount}
                </span>
              </div>
              <div className="p-4 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
                  Excused
                </span>
                <span className="text-2xl font-black text-amber-600 mt-0.5 block">
                  {excusedCount}
                </span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={markAllPresent}
                  className="px-3.5 py-1.5 rounded-xl bg-primary-900 hover:bg-primary-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 text-secondary-500" />
                  <span>Mark All Present</span>
                </button>

                <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setFilterStatus('ALL')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${filterStatus === 'ALL' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500'}`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterStatus('PRESENT')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${filterStatus === 'PRESENT' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'}`}
                  >
                    Present
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterStatus('ABSENT')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${filterStatus === 'ABSENT' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-500'}`}
                  >
                    Absent
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterStatus('EXCUSED')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${filterStatus === 'EXCUSED' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-500'}`}
                  >
                    Excused
                  </button>
                </div>
              </div>

              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  placeholder="Quick Search Student..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            {/* Student List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {filteredAttendance.map((record) => (
                <div
                  key={record.id}
                  className="p-3.5 px-6 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {record.studentName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-950">
                        {record.studentName}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span className="font-mono text-slate-400">
                          {record.studentId}
                        </span>
                        <span>•</span>
                        <span>{record.checkInMethod}</span>
                        {record.checkInTime !== '\u2014' && (
                          <span className="font-mono text-slate-400">
                            {record.checkInTime}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Toggle Status Buttons */}
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
                </div>
              ))}
            </div>

            {/* Modal Bottom Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Session CSV</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAttendanceModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Discard Changes
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsAttendanceModalOpen(false);
                    showToast(
                      'Attendance certified and permanently synced with registrar',
                      'success',
                    );
                  }}
                  className="px-4 py-2 rounded-xl bg-primary-900 hover:bg-primary-700 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4 text-secondary-500" />
                  <span>Log & Certify Attendance</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* 2. Create & Provision New Course Modal (Screen 4) */}
      {isNewCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsNewCourseModalOpen(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 my-auto border border-slate-200"
          >
            {/* Modal Header */}
            <div className="p-6 bg-primary-900 text-white border-b border-slate-800 flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-secondary-500 text-slate-950 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse" />
                  <span>TERM 2025-A PROVISIONING</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Create & Provision New Course
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Register new course curriculum under Dr. Eleanor Vance
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsNewCourseModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Instant Catalogue Sync Notice (Screen 4) */}
            <div className="p-4 bg-amber-50 border-b border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-secondary-500 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-amber-950">
                  Instant Catalogue Sync
                </strong>
                <span>
                  Submitting this form automatically registers the course under
                  Professor Eleanor Vance and instantly publishes it to the
                  student course directory and registrar audit system.
                </span>
              </div>
            </div>

            {/* Form Fields */}
            <form
              onSubmit={handleCreateCourse}
              className="p-6 space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block font-bold text-slate-700 mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    placeholder="e.g. CS-520"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Course Name & Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    placeholder="e.g. Distributed Systems & Consensus Protocols"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Academic Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Curriculum Overview & Prerequisites
                </label>
                <textarea
                  rows={3}
                  value={overview}
                  onChange={(e) => setOverview(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Lecture Schedule
                  </label>
                  <input
                    type="text"
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value)}
                    placeholder="e.g. Mondays & Wednesdays • 14:00 – 15:30 PM"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Classroom / Venue
                  </label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="e.g. Amphitheater Hall L-102"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Maximum Enrollment Ceiling
                  </label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Academic Credits
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={credits}
                    onChange={(e) => setCredits(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewCourseModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Cancel Provisioning
                </button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-secondary-500 hover:bg-secondary-600 text-slate-950 font-black shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Provision & Publish to Registrar</span>
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
