import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Clock, MapPin, ArrowUpRight } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { ScrollReveal } from '../../components/shared/ScrollReveal';
export const TeacherCoursesPage = () => {
  const {
    teacherCourses,
    setIsNewCourseModalOpen,
    setIsAttendanceModalOpen,
    showToast,
  } = useAdmin();
  const [selectedCourseId, setSelectedCourseId] = useState('tc-1');
  return (
    <div className="space-y-6">
      {/* 1. Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-50 text-amber-900 border border-amber-200/80 mb-2">
            <span className="w-2 h-2 rounded-full bg-secondary-500" />
            <span>FACULTY CURRICULUM</span>
            <span className="text-amber-400">•</span>
            <span>Fall Term 2025-A</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
            Course Curriculum & Syllabi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage active term courses, lab schedules, seat caps, and registrar
            provisioning for Dr. Eleanor Vance.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsNewCourseModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-secondary-500 hover:bg-secondary-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>Create & Provision Course</span>
        </motion.button>
      </div>

      {/* 2. Course Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {teacherCourses.map((course, idx) => (
          <ScrollReveal key={course.id} delay={idx * 0.05}>
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between h-full">
              <div className="space-y-3">
                {/* Course Tag & Code */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-primary-900 text-secondary-500 text-xs font-mono font-bold">
                      {course.code}
                    </span>
                    {course.tag && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200/70">
                        {course.tag}
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-bold text-slate-500 font-mono">
                    {course.credits} Credits
                  </span>
                </div>

                {/* Title & Department */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-950">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {course.department}
                  </p>
                </div>

                {/* Overview Text */}
                {course.overview && (
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {course.overview}
                  </p>
                )}

                {/* Location & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{course.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{course.room}</span>
                  </div>
                </div>

                {/* Enrollment Bar */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      Cohort Volume
                    </span>
                    <span className="font-bold text-slate-900 font-mono">
                      {course.enrolled} / {course.capacity} (
                      {course.percentFilled}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${course.isFlagship ? 'bg-secondary-500' : 'bg-slate-900'}`}
                      style={{ width: `${course.percentFilled}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setIsAttendanceModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  Take Attendance
                </button>

                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      `Syllabus packet for ${course.code} retrieved`,
                      'info',
                    )
                  }
                  className="px-3.5 py-2 rounded-xl bg-primary-900 hover:bg-primary-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Syllabus & Materials</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-secondary-500" />
                </button>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
};
