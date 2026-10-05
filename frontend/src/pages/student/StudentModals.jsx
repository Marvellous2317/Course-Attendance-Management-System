import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Clock,
  Mail,
  CheckCircle2,
  FileText,
  GitBranch,
  MessageSquare,
  Radio,
  Upload,
  ArrowRight,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
export const StudentModals = ({
  selectedCourse,
  onCloseCourseModal,
  selectedElective,
  onCloseElectiveModal,
  onEnrollElective,
  isAppealModalOpen,
  onCloseAppealModal,
  isCheckInModalOpen,
  onCloseCheckInModal,
  checkInCourseName = 'CS-401: Advanced Neural Architectures',
  isTimetableMatrixOpen,
  onCloseTimetableMatrix,
}) => {
  const { showToast } = useAdmin();
  const [appealCourse, setAppealCourse] = useState('MATH-240');
  const [appealReason, setAppealReason] = useState(
    'Medical clinic visit with documentation',
  );
  const [appealSubmitting, setAppealSubmitting] = useState(false);
  const [scanningStatus, setScanningStatus] = useState('idle');
  const handleLiveCheckIn = () => {
    setScanningStatus('scanning');
    setTimeout(() => {
      setScanningStatus('success');
      showToast(
        'DESFire EV3 Handshake Verified \u2022 Turnstile Gate #4 Unlocked',
        'success',
      );
      setTimeout(() => {
        setScanningStatus('idle');
        onCloseCheckInModal();
      }, 1400);
    }, 1200);
  };
  const handleAppealSubmit = (e) => {
    e.preventDefault();
    setAppealSubmitting(true);
    setTimeout(() => {
      setAppealSubmitting(false);
      onCloseAppealModal();
      showToast(
        `Absence appeal for ${appealCourse} dispatched to Department Chair.`,
        'success',
      );
    }, 800);
  };
  return (
    <AnimatePresence>
      {/* 1. COURSE DETAILS MODAL (Matches screen6.png) */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCloseCourseModal}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-8"
          >
            {/* Modal Header */}
            <div className="p-6 sm:p-7 border-b border-slate-100">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                    • TERM 2025-A ACTIVE
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-slate-100 text-slate-700">
                    • {selectedCourse.section || 'SECTION 01'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-slate-100 text-slate-700">
                    • ACCREDITED ABET 2025
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onCloseCourseModal}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                {selectedCourse.code}: {selectedCourse.title}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {selectedCourse.department} •{' '}
                {selectedCourse.credits.toFixed(1)} Academic Units
              </p>

              {/* Schedule strip */}
              <div className="mt-4 p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-center gap-2.5 text-xs text-amber-950 font-medium">
                <Clock className="w-4 h-4 text-secondary-500 shrink-0" />
                <span>
                  Every {selectedCourse.schedule} • {selectedCourse.room}
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-7 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Instructor Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedCourse.instructorAvatar}
                    alt={selectedCourse.instructorName}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 ring-2 ring-secondary-500/20"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm text-slate-950">
                        {selectedCourse.instructorName}
                      </h4>
                      <CheckCircle2 className="w-3.5 h-3.5 text-secondary-500" />
                    </div>
                    <p className="text-xs text-slate-500">
                      {selectedCourse.instructorTitle}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Office:{' '}
                      {selectedCourse.instructorOffice ||
                        'Alan Turing Engineering Complex #412'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      `Opening direct academic mailer to ${selectedCourse.instructorName}`,
                      'info',
                    )
                  }
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Contact</span>
                </button>
              </div>

              {/* Curriculum Focus & Methodology */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Curriculum Focus & Methodology
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Stochastic gradient optimization dynamics, provable
                  convergence bounds in hyper-parameter scheduling, and
                  resilient algorithmic safety in deep neural networks. Heavy
                  emphasis on distributed transformer pipelines and
                  self-attention sparsity.
                </p>
              </div>

              {/* Weekly Syllabus Milestones */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/80">
                  <span className="text-[10px] font-bold text-secondary-500 block uppercase tracking-wider">
                    WEEK 06 (CURRENT)
                  </span>
                  <p className="text-xs font-bold text-slate-900 mt-1">
                    Attention Sparsity & FlashAttention-2
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                    WEEK 07
                  </span>
                  <p className="text-xs font-bold text-slate-900 mt-1">
                    Transformer Scaling Laws
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                    WEEK 08
                  </span>
                  <p className="text-xs font-bold text-slate-900 mt-1">
                    Distributed Mixture of Experts
                  </p>
                </div>
              </div>

              {/* Verified Repositories & Links */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                  Verified Course Repositories & Links
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <a
                    href="#slides"
                    onClick={(e) => {
                      e.preventDefault();
                      showToast(
                        'Downloading Week 6 Lecture Slides PDF...',
                        'info',
                      );
                    }}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center gap-3 transition-colors group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        Lecture Slides
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        Week 6 Sparsity.pdf...
                      </div>
                    </div>
                  </a>

                  <a
                    href="#repo"
                    onClick={(e) => {
                      e.preventDefault();
                      showToast('Accessing GitHub Lab Repo...', 'info');
                    }}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center gap-3 transition-colors group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                      <GitBranch className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        GitHub Lab Repo
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        github.com/othello-i...
                      </div>
                    </div>
                  </a>

                  <a
                    href="#forum"
                    onClick={(e) => {
                      e.preventDefault();
                      showToast('Opening Course Forum #neural-nlp...', 'info');
                    }}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center gap-3 transition-colors group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-secondary-500 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        Forum #neural-nlp
                      </div>
                      <div className="text-[10px] text-amber-700 font-semibold truncate">
                        14 Unread Posts
                      </div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Attendance Verified Pill */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-900 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Julian Vance-Hayes (STU-2023-8841)</span>
                </div>
                <span className="font-mono font-bold text-emerald-700 tracking-wider">
                  {selectedCourse.attendanceRate.toFixed(1)}% ATTENDANCE
                  VERIFIED
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onCloseCourseModal}
                className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-white text-slate-600 text-xs font-bold transition-colors cursor-pointer"
              >
                Close Modal
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast(
                    `Launching ${selectedCourse.code} Virtual Lab & Jupyter Environment...`,
                    'success',
                  );
                  onCloseCourseModal();
                }}
                className="px-5 py-2.5 rounded-xl bg-secondary-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-transform active:scale-95 shadow-md shadow-secondary-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Launch Course Room & Lab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 2. ELECTIVE DETAIL & TIMETABLE OVERLAP MODAL (Matches screen2.png) */}
      {selectedElective && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCloseElectiveModal}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-8"
          >
            {/* Modal Header */}
            <div className="p-6 sm:p-7 border-b border-slate-100">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                    • TERM 2025-A REGISTRATION OPEN
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-primary-900 text-white">
                    {selectedElective.credits.toFixed(1)} CREDITS
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-slate-100 text-slate-700">
                    {selectedElective.department.toUpperCase()}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onCloseElectiveModal}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                {selectedElective.code}: {selectedElective.title}
              </h2>

              {/* Schedule strip */}
              <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>
                    {selectedElective.schedule} • {selectedElective.room}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-slate-200/70 font-bold text-[10px] text-slate-800 shrink-0">
                  32 Sessions • 16 Weeks
                </span>
              </div>

              {/* Green conflict check banner */}
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{selectedElective.conflictCheck}</span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-7 space-y-6 max-h-[58vh] overflow-y-auto">
              {/* Weekly Schedule Grid & Overlap Analysis */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Weekly Schedule Grid & Overlap Analysis
                  </h4>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-secondary-500/20 text-slate-900 border border-secondary-500/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary-500" />
                    {selectedElective.code} Slot
                  </span>
                </div>

                {/* 5-day columns */}
                <div className="grid grid-cols-5 gap-2 text-center text-xs">
                  {/* MON */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="font-bold text-[11px] text-slate-500 uppercase">
                      MON
                    </div>
                    <div className="p-1 rounded bg-slate-200/60 text-[10px] text-slate-700 font-semibold">
                      10:00 CS-401
                    </div>
                    <div className="p-1 rounded bg-slate-200/60 text-[10px] text-slate-700 font-semibold">
                      14:00 MATH
                    </div>
                  </div>

                  {/* TUE */}
                  <div className="p-2.5 rounded-xl bg-amber-50/40 border border-secondary-500/50 space-y-2">
                    <div className="font-bold text-[11px] text-secondary-500 uppercase">
                      TUE
                    </div>
                    <div className="p-1 rounded bg-slate-200/60 text-[10px] text-slate-700 font-semibold">
                      11:30 SWE-210
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="p-1 rounded bg-secondary-500 text-slate-950 font-black text-[10px] shadow-xs"
                    >
                      16:00 {selectedElective.code}
                    </motion.div>
                  </div>

                  {/* WED */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="font-bold text-[11px] text-slate-500 uppercase">
                      WED
                    </div>
                    <div className="p-1 rounded bg-slate-200/60 text-[10px] text-slate-700 font-semibold">
                      10:00 CS-401
                    </div>
                    <div className="p-1 rounded bg-slate-200/60 text-[10px] text-slate-700 font-semibold">
                      13:00 AI-490
                    </div>
                  </div>

                  {/* THU */}
                  <div className="p-2.5 rounded-xl bg-amber-50/40 border border-secondary-500/50 space-y-2">
                    <div className="font-bold text-[11px] text-secondary-500 uppercase">
                      THU
                    </div>
                    <div className="p-1 rounded bg-slate-200/60 text-[10px] text-slate-700 font-semibold">
                      11:30 SWE-210
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="p-1 rounded bg-secondary-500 text-slate-950 font-black text-[10px] shadow-xs"
                    >
                      16:00 {selectedElective.code}
                    </motion.div>
                  </div>

                  {/* FRI */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="font-bold text-[11px] text-slate-500 uppercase">
                      FRI
                    </div>
                    <div className="p-1 rounded bg-slate-200/60 text-[10px] text-slate-700 font-semibold">
                      09:30 ETH-310
                    </div>
                    <div className="p-1 rounded bg-emerald-50 text-[10px] text-emerald-700 font-semibold">
                      Open Study
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructor & Capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <img
                    src={selectedElective.instructorAvatar}
                    alt={selectedElective.instructorName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">
                      {selectedElective.instructorName}
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      {selectedElective.instructorTitle}
                    </p>
                    <p className="text-[10px] text-amber-700 font-semibold mt-0.5">
                      {selectedElective.instructorOfficeHours}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Enrollment Capacity
                    </span>
                    <span className="text-xs font-bold text-emerald-700">
                      {selectedElective.seatsOpen} /{' '}
                      {selectedElective.totalSeats} Open (80%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{
                        width: `${(selectedElective.seatsOpen / selectedElective.totalSeats) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-medium">
                    <span>{selectedElective.term}</span>
                    <span className="text-secondary-500 font-bold">
                      Instant Approval
                    </span>
                  </div>
                </div>
              </div>

              {/* Curriculum Milestones & Syllabi */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
                  Curriculum Milestones & Syllabi
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedElective.milestones.map((milestone, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80"
                    >
                      <span className="text-[10px] font-bold text-secondary-500 uppercase tracking-wider block">
                        {milestone.weeks}
                      </span>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {milestone.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 text-[11px]">
                Instant enrollment publishes directly to your timetable without
                administrative delay.
              </span>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={onCloseElectiveModal}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-white text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => onEnrollElective(selectedElective)}
                  className="px-5 py-2 rounded-xl bg-secondary-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-transform active:scale-95 shadow-md shadow-secondary-500/20 cursor-pointer"
                >
                  + Instant Enroll in {selectedElective.code}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* 3. ABSENCE APPEAL MODAL */}
      {isAppealModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCloseAppealModal}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 p-6 sm:p-7 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-950">
                  Request Absence Appeal
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Faculty retroactive review for turnstile attendance exceptions
                </p>
              </div>
              <button
                type="button"
                onClick={onCloseAppealModal}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAppealSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Select Missed Session
                </label>
                <select
                  value={appealCourse}
                  onChange={(e) => setAppealCourse(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-secondary-500"
                >
                  <option value="MATH-240">
                    MATH-240: Session #35 (Thu, Nov 6) - Unexcused
                  </option>
                  <option value="CS-401">
                    CS-401: Session #48 (Mon, Nov 3) - Health clearance
                  </option>
                  <option value="AI-490">
                    AI-490: Session #19 (Fri, Oct 24) - Remote Symposium
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Reason & Academic Justification
                </label>
                <textarea
                  rows={3}
                  value={appealReason}
                  onChange={(e) => setAppealReason(e.target.value)}
                  placeholder="Explain reason with date and faculty communication..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-secondary-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Supporting Documentation (Optional)
                </label>
                <div className="border-2 border-dashed border-slate-200 hover:border-secondary-500 rounded-2xl p-4 text-center cursor-pointer bg-slate-50 transition-colors">
                  <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
                  <span className="text-[11px] text-slate-600 block font-medium">
                    Upload Clinic Note, Conference Pass, or Git Hash (.pdf,
                    .png)
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onCloseAppealModal}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold cursor-pointer hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={appealSubmitting}
                  className="px-5 py-2 rounded-xl bg-secondary-500 text-slate-950 font-black cursor-pointer hover:bg-amber-400 disabled:opacity-50"
                >
                  {appealSubmitting ? 'Submitting...' : 'Submit Appeal \u2192'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 4. LIVE INGRESS & TURNSTILE CHECK-IN MODAL */}
      {isCheckInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCloseCheckInModal}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-primary-900 text-white rounded-3xl shadow-2xl border border-slate-800 p-7 text-center z-10 space-y-6"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
              <span className="flex items-center gap-1.5 font-mono text-secondary-500">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                RFID GATEWAY #4
              </span>
              <button
                type="button"
                onClick={onCloseCheckInModal}
                className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <h3 className="text-xl font-black text-white">
                {checkInCourseName}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Amphitheater L-102 • Turnstile Ingress #4 Active
              </p>
            </div>

            {/* Interactive Scanner Pulse */}
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <motion.div
                animate={{
                  scale:
                    scanningStatus === 'scanning' ? [1, 1.35, 1] : [1, 1.08, 1],
                  opacity:
                    scanningStatus === 'scanning'
                      ? [0.8, 0.2, 0.8]
                      : [0.4, 0.15, 0.4],
                }}
                transition={{
                  repeat: Infinity,
                  duration: scanningStatus === 'scanning' ? 0.9 : 2.5,
                }}
                className="absolute inset-0 rounded-full border-2 border-secondary-500"
              />

              <div className="w-24 h-24 rounded-full bg-slate-900 border border-slate-700 flex flex-col items-center justify-center text-center p-2 shadow-inner">
                {scanningStatus === 'success' ? (
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce" />
                ) : (
                  <Radio
                    className={`w-8 h-8 ${scanningStatus === 'scanning' ? 'text-amber-400 animate-spin' : 'text-secondary-500'}`}
                  />
                )}
                <span className="text-[9px] font-mono text-slate-300 mt-1 font-bold">
                  {scanningStatus === 'success'
                    ? 'GRANTED'
                    : scanningStatus === 'scanning'
                      ? 'VERIFYING...'
                      : 'TAP CARD'}
                </span>
              </div>
            </div>

            <div className="bg-slate-900/90 rounded-2xl p-3 border border-slate-800 text-left text-xs font-mono space-y-1">
              <div className="flex justify-between text-slate-400 text-[10px]">
                <span>ENCRYPTION:</span>
                <span className="text-emerald-400">DESFire EV3 128-bit</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[10px]">
                <span>CARD SERIAL:</span>
                <span className="text-white">#8841-VH-2026</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[10px]">
                <span>LATENCY:</span>
                <span className="text-secondary-500">420ms</span>
              </div>
            </div>

            <button
              type="button"
              disabled={scanningStatus !== 'idle'}
              onClick={handleLiveCheckIn}
              className="w-full py-3 rounded-xl bg-secondary-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-transform active:scale-95 cursor-pointer shadow-lg shadow-secondary-500/20 disabled:opacity-50"
            >
              {scanningStatus === 'scanning'
                ? 'Authenticating Handshake...'
                : scanningStatus === 'success'
                  ? 'Access Authorized!'
                  : 'Authenticate Turnstile Tap'}
            </button>
          </motion.div>
        </div>
      )}

      {/* 5. TIMETABLE OVERLAP MATRIX MODAL */}
      {isTimetableMatrixOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCloseTimetableMatrix}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 p-6 sm:p-7 space-y-5 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-950">
                  Timetable Overlap Matrix
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Term 2025-A Full 5-Day Weekly Course Grid
                </p>
              </div>
              <button
                type="button"
                onClick={onCloseTimetableMatrix}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
              {/* Mon */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-500 text-center pb-1 border-b border-slate-200">
                  MONDAY
                </div>
                <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-900">
                  <strong className="block text-[11px]">CS-401</strong>
                  <span className="text-[10px] text-blue-700">
                    10:00 - 11:30 AM
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-900">
                  <strong className="block text-[11px]">AI-490</strong>
                  <span className="text-[10px] text-purple-700">
                    14:00 - 15:30 PM
                  </span>
                </div>
              </div>

              {/* Tue */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-500 text-center pb-1 border-b border-slate-200">
                  TUESDAY
                </div>
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                  <strong className="block text-[11px]">SWE-210</strong>
                  <span className="text-[10px] text-emerald-700">
                    09:00 - 10:30 AM
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900">
                  <strong className="block text-[11px]">MATH-240</strong>
                  <span className="text-[10px] text-indigo-700">
                    13:00 - 14:30 PM
                  </span>
                </div>
              </div>

              {/* Wed */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-500 text-center pb-1 border-b border-slate-200">
                  WEDNESDAY
                </div>
                <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-900">
                  <strong className="block text-[11px]">CS-401</strong>
                  <span className="text-[10px] text-blue-700">
                    10:00 - 11:30 AM
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                  <strong className="block text-[11px]">ETH-310</strong>
                  <span className="text-[10px] text-amber-700">
                    15:30 - 17:00 PM
                  </span>
                </div>
              </div>

              {/* Thu */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-500 text-center pb-1 border-b border-slate-200">
                  THURSDAY
                </div>
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                  <strong className="block text-[11px]">SWE-210</strong>
                  <span className="text-[10px] text-emerald-700">
                    09:00 - 10:30 AM
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900">
                  <strong className="block text-[11px]">MATH-240</strong>
                  <span className="text-[10px] text-indigo-700">
                    13:00 - 14:30 PM
                  </span>
                </div>
              </div>

              {/* Fri */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-500 text-center pb-1 border-b border-slate-200">
                  FRIDAY
                </div>
                <div className="p-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-900">
                  <strong className="block text-[11px]">AI-490</strong>
                  <span className="text-[10px] text-purple-700">
                    14:00 - 15:30 PM
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-100 text-slate-500 text-center text-[10px] font-medium">
                  Open Research Block
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Zero Conflicts Detected Across 18 Credit Units
              </span>
              <button
                type="button"
                onClick={() => {
                  showToast(
                    'Exported timetable schedule to Apple / Google Calendar (.ics)',
                    'info',
                  );
                  onCloseTimetableMatrix();
                }}
                className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold cursor-pointer"
              >
                Download .ICS
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
