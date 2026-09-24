import { motion } from 'motion/react';
import {
  GraduationCap,
  Users,
  BookOpen,
  CreditCard,
  CheckCircle2,
  Calendar,
  ArrowUpRight,
  UserPlus,
  Clock,
  ChevronRight,
  FileSpreadsheet,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { StatCard } from '../shared/StatCard';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { Badge } from '../shared/Badge';
import { ScrollReveal } from '../shared/ScrollReveal';
export const DashboardView = () => {
  const {
    stats,
    students,
    teachers,
    courses,
    schedules,
    announcements,
    setActiveTab,
    openModal,
  } = useAdmin();
  const attendanceDays = [
    { day: 'Mon', rate: 97, label: '97%' },
    { day: 'Tue', rate: 96, label: '96%' },
    { day: 'Wed', rate: 98, label: '98%' },
    { day: 'Thu', rate: 95, label: '95%' },
    { day: 'Fri', rate: 94, label: '94%' },
  ];
  const recentStudents = students.slice(0, 5);
  const todaysSchedule = schedules.slice(0, 4);
  const urgentNotice = announcements.find((a) => a.priority === 'Urgent');
  return (
    <div className="space-y-6 pb-12">
      {/* Scroll-revealed Urgent Notice Banner */}
      {urgentNotice && (
        <ScrollReveal direction="down" delay={0.05}>
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shrink-0" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md mr-2">
                  Urgent Notice
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  {urgentNotice.title}
                </span>
              </div>
            </div>
            <Button
              size="xs"
              variant="outline"
              onClick={() => setActiveTab('announcements')}
              iconRight={<ChevronRight className="w-3.5 h-3.5" />}
              className="bg-white hover:bg-amber-50 border-amber-300 text-amber-950 shrink-0"
            >
              Read Bulletin
            </Button>
          </div>
        </ScrollReveal>
      )}

      {/* Primary Institutional Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          id="stat-students"
          title="Total Students"
          value={stats.totalStudents.toLocaleString()}
          subValue="Enrolled"
          growth={stats.studentGrowth}
          growthLabel="vs last year"
          icon={<GraduationCap className="w-6 h-6" />}
          colorScheme="indigo"
          delay={0.1}
        />
        <StatCard
          id="stat-faculty"
          title="Academic Faculty"
          value={stats.totalTeachers}
          subValue="Active staff"
          growth={stats.teacherGrowth}
          growthLabel="vs last term"
          icon={<Users className="w-6 h-6" />}
          colorScheme="blue"
          delay={0.15}
        />
        <StatCard
          id="stat-courses"
          title="Active Courses"
          value={stats.totalCourses}
          subValue="Across 6 depts"
          growth={stats.courseGrowth}
          growthLabel="curriculum expansion"
          icon={<BookOpen className="w-6 h-6" />}
          colorScheme="purple"
          delay={0.2}
        />
        <StatCard
          id="stat-fee-rate"
          title="Tuition Collection"
          value={`${stats.feeCollectionRate}%`}
          subValue="Target: 95%"
          growth={stats.feeGrowth}
          growthLabel="collection index"
          icon={<CreditCard className="w-6 h-6" />}
          colorScheme="emerald"
          delay={0.25}
        />
      </div>

      {/* Middle Section: Attendance Analytics & Quick Class Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Attendance & Institutional Health */}
        <ScrollReveal delay={0.2} className="lg:col-span-7 flex flex-col gap-6">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Campus Attendance Analytics
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Daily presence rate across high school & academy divisions
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Today: {stats.todayAttendanceRate}%
                </span>
              </div>
            </div>

            {/* Custom SVG / Bar Chart Representation */}
            <div className="pt-6">
              <div className="flex items-end justify-between gap-3 h-44 px-4 pb-2 border-b border-slate-100">
                {attendanceDays.map((item, idx) => (
                  <div
                    key={item.day}
                    className="flex-1 flex flex-col items-center gap-2 group h-full justify-end"
                  >
                    <motion.span
                      initial={{ opacity: 0, y: -4 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      className="text-[11px] font-bold text-slate-600 group-hover:text-indigo-600 transition-colors"
                    >
                      {item.label}
                    </motion.span>
                    <motion.div
                      initial={{ height: 0 }}
                      whileInView={{ height: `${item.rate}%` }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.6,
                        delay: 0.2 + idx * 0.08,
                        ease: 'easeOut',
                      }}
                      className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-indigo-600 to-indigo-400 group-hover:from-indigo-700 group-hover:to-indigo-500 transition-colors relative"
                    >
                      {/* Subtle shine highlight */}
                      <div className="absolute inset-x-1 top-1 h-1 bg-white/30 rounded-full" />
                    </motion.div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between px-4 pt-2 text-xs font-semibold text-slate-500">
                {attendanceDays.map((item) => (
                  <span key={item.day} className="flex-1 text-center">
                    {item.day}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  Physical Attendance
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  Target Standard (95%)
                </span>
              </div>
              <button
                onClick={() => setActiveTab('schedules')}
                className="text-indigo-600 font-semibold hover:underline flex items-center gap-1"
              >
                <span>View Full Log</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </Card>

          {/* Quick Action Dock */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => openModal('add-student')}
              className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-500 hover:shadow-md transition-all text-left group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <UserPlus className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-800 block">
                Enroll Student
              </span>
              <span className="text-[10px] text-slate-400">Add to roster</span>
            </button>

            <button
              type="button"
              onClick={() => openModal('add-course')}
              className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all text-left group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-800 block">
                New Course
              </span>
              <span className="text-[10px] text-slate-400">Add syllabus</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('finances')}
              className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-500 hover:shadow-md transition-all text-left group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-800 block">
                Tuition Ledger
              </span>
              <span className="text-[10px] text-slate-400">Audit invoices</span>
            </button>

            <button
              type="button"
              onClick={() => openModal('add-announcement')}
              className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-purple-500 hover:shadow-md transition-all text-left group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-800 block">
                Broadcast Alert
              </span>
              <span className="text-[10px] text-slate-400">Post notice</span>
            </button>
          </div>
        </ScrollReveal>

        {/* Right Column (5 cols): Today's Active Timetable */}
        <ScrollReveal delay={0.25} className="lg:col-span-5">
          <Card className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    Today's Classes & Labs
                  </h3>
                </div>
                <Badge variant="indigo" size="sm">
                  {stats.activeClassrooms} Rooms Active
                </Badge>
              </div>

              <div className="mt-4 space-y-3">
                {todaysSchedule.map((slot) => (
                  <motion.div
                    key={slot.id}
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.2 }}
                    className="p-3.5 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all flex items-start justify-between gap-3 group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {slot.courseCode}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 truncate">
                          {slot.courseName}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                        <span>{slot.instructorName}</span>
                        <span>•</span>
                        <span className="text-slate-400 font-medium">
                          {slot.room}
                        </span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-indigo-600 block">
                        {slot.startTime}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {slot.enrolled}/{slot.capacity} seats
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => setActiveTab('schedules')}
                iconRight={<ArrowUpRight className="w-3.5 h-3.5" />}
              >
                View Complete Master Schedule
              </Button>
            </div>
          </Card>
        </ScrollReveal>
      </div>

      {/* Bottom Section: Recent Student Enrollments Table */}
      <ScrollReveal delay={0.3}>
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Recent Student Enrollments
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Newly registered academic profiles and performance statuses
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('students')}
                iconRight={<ChevronRight className="w-3.5 h-3.5" />}
              >
                View All {students.length} Students
              </Button>
              <Button
                variant="primary"
                size="sm"
                iconLeft={<UserPlus className="w-3.5 h-3.5" />}
                onClick={() => openModal('add-student')}
              >
                Add Student
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Student ID</th>
                  <th className="py-3 px-3">Grade & Section</th>
                  <th className="py-3 px-3">GPA</th>
                  <th className="py-3 px-3">Attendance</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/70 font-medium">
                {recentStudents.map((std) => (
                  <tr
                    key={std.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={std.avatar}
                          alt={std.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <span className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors block">
                            {std.name}
                          </span>
                          <span className="text-[11px] text-slate-400 font-normal">
                            {std.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                      {std.studentId}
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      {std.grade} • {std.section}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {std.gpa.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${std.attendanceRate >= 95 ? 'bg-emerald-500' : std.attendanceRate >= 85 ? 'bg-indigo-500' : 'bg-amber-500'}`}
                            style={{ width: `${std.attendanceRate}%` }}
                          />
                        </div>
                        <span className="text-slate-600 font-semibold text-[11px]">
                          {std.attendanceRate}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={
                          std.status === 'Active'
                            ? 'emerald'
                            : std.status === 'Probation'
                              ? 'amber'
                              : 'slate'
                        }
                        size="sm"
                        dot
                      >
                        {std.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => openModal('view-student', std)}
                      >
                        View Record
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </ScrollReveal>
    </div>
  );
};
