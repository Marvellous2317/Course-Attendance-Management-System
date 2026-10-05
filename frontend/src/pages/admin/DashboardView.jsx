import { motion } from "motion/react";
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
} from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import { StatCard } from "../../shared/components/StatCard";
import { Card } from "../../shared/components/Card";
import { Button } from "../../shared/components/Button";
import { Badge } from "../../shared/components/Badge";
import { ScrollReveal } from "../../shared/components/ScrollReveal";
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
    { day: "Mon", rate: 97, label: "97%" },
    { day: "Tue", rate: 96, label: "96%" },
    { day: "Wed", rate: 98, label: "98%" },
    { day: "Thu", rate: 95, label: "95%" },
    { day: "Fri", rate: 94, label: "94%" },
  ];
  const recentStudents = students.slice(0, 5);
  const todaysSchedule = schedules.slice(0, 4);
  const urgentNotice = announcements.find((a) => a.priority === "Urgent");
  return (
    <div className="space-y-6 pb-12">
     
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
                        ease: "easeOut",
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
             
            </div>
          </Card>

         
        </ScrollReveal>

       
      </div>

     
    </div>
  );
};
