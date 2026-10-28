import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles } from 'lucide-react';
import { useUIStore } from '../../shared/store/useUIStore';
import useToast from '../../shared/hooks/useToast';
import TeacherAttendanceModal from './TeacherAttendanceModal';
export default function TeacherModals() {
  const { isNewCourseModalOpen, setIsNewCourseModalOpen } = useUIStore();
  const { showToast } = useToast();
  const addTeacherCourse = () => {
    showToast('Course provisioned successfully', 'success');
  };
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
      <TeacherAttendanceModal />

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
                    placeholder="e.g. Mondays & Wednesdays â€¢ 14:00 â€“ 15:30 PM"
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
