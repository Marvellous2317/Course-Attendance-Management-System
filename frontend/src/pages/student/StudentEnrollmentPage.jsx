import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Clock,
  CheckCircle2,
  Grid,
  Download,
  ArrowRight,
  Lightbulb,
  X,
  ChevronDown,
  Award,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
export const StudentEnrollmentPage = ({
  electives,
  enrolledCredits,
  maxCredits,
  onOpenElectiveModal,
  onEnrollElective,
  onOpenTimetableMatrix,
}) => {
  const { showToast } = useAdmin();
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dayFilter, setDayFilter] = useState('any');
  const [creditsFilter, setCreditsFilter] = useState('all');
  const [sortBy, setSortBy] = useState('seats');
  const [showFloatingNotice, setShowFloatingNotice] = useState(true);
  const tracks = [
    { id: 'all', label: 'All Tracks' },
    { id: 'cs', label: 'Computer Science & Systems' },
    { id: 'ai', label: 'Artificial Intelligence' },
    { id: 'design', label: 'Design & Ergonomics' },
  ];
  const filteredElectives = electives.filter((item) => {
    if (
      selectedTrack === 'cs' &&
      !item.department.toLowerCase().includes('computer')
    )
      return false;
    if (
      selectedTrack === 'ai' &&
      !item.title.toLowerCase().includes('intelligence') &&
      !item.tag.toLowerCase().includes('security')
    )
      return false;
    if (
      selectedTrack === 'design' &&
      !item.department.toLowerCase().includes('interactive')
    )
      return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.code.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.instructorName.toLowerCase().includes(q)
      );
    }
    return true;
  });
  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header with Badges & Credit Allowance */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
              • OPEN REGISTRATION WINDOW
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-slate-100 text-slate-700">
              Credit Allowance: {enrolledCredits.toFixed(1)} /{' '}
              {maxCredits.toFixed(1)} Enrolled (
              {Math.max(0, maxCredits - enrolledCredits).toFixed(1)} Units
              Remaining)
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Course Enrollment & Catalogue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Explore system-wide academic modules, review recurring timetable
            blocks, and instantly register electives for Term 2025-A.
          </p>
        </div>

        {/* Right side progress & audit button */}
        <div className="flex items-center gap-3 shrink-0 self-start lg:self-auto">
          <div className="hidden sm:block text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              ENROLLED PACE
            </span>
            <div className="w-24 bg-slate-200 h-2 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-slate-900 h-full rounded-full transition-all duration-500"
                style={{ width: `${(enrolledCredits / maxCredits) * 100}%` }}
              />
            </div>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenTimetableMatrix}
            className="px-4 py-2.5 rounded-2xl bg-primary-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Grid className="w-3.5 h-3.5 text-secondary-500" />
            <span>Audit Match Matrix</span>
          </motion.button>
        </div>
      </div>

      {/* 2. Track Category Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tracks.map((track) => (
          <button
            key={track.id}
            type="button"
            onClick={() => setSelectedTrack(track.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${selectedTrack === track.id ? 'bg-primary-900 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            {track.label}
          </button>
        ))}
        <span className="px-3 py-1 text-[11px] text-slate-400 font-medium ml-auto hidden sm:inline-block">
          {filteredElectives.length} Modules Available for Julian Vance-Hayes
        </span>
      </div>

      {/* 3. Search and Dropdown Filter Bar */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter electives, profs, codes..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-secondary-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Day */}
          <div className="relative">
            <select
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200/80 px-3 py-1.5 pr-7 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <option value="any">Day: Any Day (Mon-Fri)</option>
              <option value="mon-wed">Mon & Wed</option>
              <option value="tue-thu">Tue & Thu</option>
              <option value="fri">Fridays</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>

          {/* Credits */}
          <div className="relative">
            <select
              value={creditsFilter}
              onChange={(e) => setCreditsFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200/80 px-3 py-1.5 pr-7 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <option value="all">Credits: All Credit Loads</option>
              <option value="4.0">4.0 Credits</option>
              <option value="3.5">3.5 Credits</option>
              <option value="3.0">3.0 Credits</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200/80 px-3 py-1.5 pr-7 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <option value="seats">
                Sort: Available Seats / Highest Rated
              </option>
              <option value="code">Sort: Course Code</option>
              <option value="credits">Sort: Credits</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 4. Elective Cards Grid (2x2 layout matching Screen 3) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredElectives.map((elec) => {
          const seatsPercent = Math.round(
            (elec.seatsOpen / elec.totalSeats) * 100,
          );
          return (
            <motion.div
              key={elec.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.3 }}
              className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md hover:border-slate-300 transition-all relative"
            >
              <div className="space-y-3.5">
                {/* Top header row */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {elec.department.toUpperCase()} • {elec.credits.toFixed(1)}{' '}
                    CR
                  </span>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${elec.seatsOpen < 10 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}
                  >
                    {elec.seatsOpen < 10
                      ? `${elec.seatsOpen} SEATS LEFT`
                      : `${elec.seatsOpen} / ${elec.totalSeats} SEATS OPEN`}
                  </span>
                </div>

                {/* Course Code & Title */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-primary-900 text-secondary-500 font-mono font-bold text-xs">
                      {elec.code}
                    </span>
                    <span className="text-slate-400 text-xs">•</span>
                    <span className="text-xs font-semibold text-slate-600">
                      {elec.tag}
                    </span>
                  </div>

                  <h3 className="font-black text-lg text-slate-950 mt-1.5 tracking-tight leading-snug">
                    {elec.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed">
                  {elec.description}
                </p>

                {/* Instructor */}
                <div className="flex items-center gap-3 pt-1">
                  <img
                    src={elec.instructorAvatar}
                    alt={elec.instructorName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {elec.instructorName}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {elec.instructorTitle}
                    </p>
                  </div>
                </div>

                {/* Schedule strip */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-center gap-2.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {elec.schedule} • {elec.room}
                  </span>
                </div>

                {/* Requirement Qualifier */}
                <div className="p-2.5 rounded-xl bg-slate-50 text-xs text-slate-700 flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{elec.qualifiesRequirement}</span>
                </div>
              </div>

              {/* Card Bottom Actions */}
              <div className="pt-3 flex flex-col sm:flex-row sm:items-center gap-2.5 border-t border-slate-100">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onEnrollElective(elec)}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${elec.isEnrolled ? 'bg-emerald-600 text-white' : 'bg-secondary-500 hover:bg-amber-400 text-slate-950 shadow-secondary-500/20'}`}
                >
                  {elec.isEnrolled ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Enrolled for Term 2025-A</span>
                    </>
                  ) : (
                    <span>+ Instant Enroll</span>
                  )}
                </motion.button>

                <button
                  type="button"
                  onClick={() => onOpenElectiveModal(elec)}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Schedule & Syllabus</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 5. Floating / Inset Registration Alert Notice (Matching Screen 3) */}
      <AnimatePresence>
        {showFloatingNotice && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs text-amber-950 flex items-center justify-between gap-3 shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <Lightbulb className="w-4 h-4 text-secondary-500 shrink-0" />
              <div>
                <strong className="font-bold">
                  Term 2025-A Registration Open:{' '}
                </strong>
                <span>
                  Instant enrollment publishes directly to your timetable
                  without administrative delay.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowFloatingNotice(false)}
              className="text-amber-800 hover:text-amber-950 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. Bottom Banner (Degree Audit & Timetable Conflict Check Passed) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-primary-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-5 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-secondary-500/20 text-secondary-500 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-black text-sm text-white">
              Degree Audit & Timetable Conflict Check Passed
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              All 4 elective modules qualify for Julian's B.S. Computer Science
              degree requirements without recurring schedule overlap.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
          <button
            type="button"
            onClick={onOpenTimetableMatrix}
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <Grid className="w-3.5 h-3.5 text-secondary-500" />
            <span>Timetable Overlap Matrix</span>
          </button>

          <button
            type="button"
            onClick={() =>
              showToast(
                'Generated registration audit plan PDF for academic advisor sign-off.',
                'success',
              )
            }
            className="px-4 py-2.5 rounded-xl bg-secondary-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer flex items-center gap-1.5 shadow-md shadow-secondary-500/20 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Registration Plan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
