import { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
  BookPlus,
  Clock,
  MapPin,
  UserCheck,
  Trash2,
  Pencil,
  Calendar,
  History,
} from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import { Card } from "../../shared/components/Card";
import { Button } from "../../shared/components/Button";
import { Badge } from "../../shared/components/Badge";
import { ScrollReveal } from "../../shared/components/ScrollReveal";
import { EmptyState } from "../../shared/components/EmptyState";
import { formatCourseDate } from "../../shared/utils/date";

export const CoursesView = () => {
  const { courses, searchQuery, setSearchQuery, deleteCourse, openModal } =
    useAdmin();
  const [selectedDept, setSelectedDept] = useState("All");

  const departments = [
    "All",
    "Science & Physics",
    "Mathematics & Computing",
    "Computer Science",
    "Humanities & Literature",
    "Fine Arts & Design",
  ];

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (course.title && course.title.toLowerCase().includes(q)) ||
        (course.code && course.code.toLowerCase().includes(q)) ||
        (course.description && course.description.toLowerCase().includes(q)) ||
        (course.instructorName &&
          course.instructorName.toLowerCase().includes(q)) ||
        (course.department && course.department.toLowerCase().includes(q));

      const matchesDept =
        selectedDept === "All" ||
        (course.department ? course.department === selectedDept : false);

      return matchesSearch && matchesDept;
    });
  }, [courses, searchQuery, selectedDept]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header controls & filters */}
      <ScrollReveal delay={0.05}>
        <Card className="p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
              {departments.map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setSelectedDept(dept)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedDept === dept
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>

            <Button
              variant="primary"
              size="sm"
              iconLeft={<BookPlus className="w-4 h-4" />}
              onClick={() => openModal("add-course")}
              className="shrink-0 self-end lg:self-auto"
            >
              Add New Course
            </Button>
          </div>
        </Card>
      </ScrollReveal>

      {/* Courses Cards Grid */}
      {filteredCourses.length === 0 ? (
        <EmptyState
          title="No courses found"
          description="Try selecting another department or adjusting your search term."
          actionLabel="View All Courses"
          onAction={() => {
            setSelectedDept("All");
            setSearchQuery("");
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredCourses.map((course, index) => {
            const hasCapacity =
              course.enrolledCount !== undefined && course.maxCapacity;
            const fillPercentage = hasCapacity
              ? Math.round((course.enrolledCount / course.maxCapacity) * 100)
              : 0;
            const isFull = hasCapacity
              ? course.enrolledCount >= course.maxCapacity
              : false;

            return (
              <ScrollReveal key={course.id} delay={0.08 + (index % 3) * 0.06}>
                <Card
                  hoverEffect
                  className="p-5 flex flex-col justify-between h-full group border-slate-200/90 shadow-xs hover:shadow-md transition-all"
                >
                  <div>
                    {/* Header: Code, ID Badge, Credits & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/60 shadow-xs">
                          {course.code}
                        </span>
                        <span
                          className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60"
                          title={`Database Identifier: ${course.id}`}
                        >
                          ID #{course.id}
                        </span>
                        {course.credits && (
                          <span className="text-xs text-slate-400 font-medium">
                            {course.credits} Credits
                          </span>
                        )}
                      </div>

                      <Badge
                        variant={
                          course.status === "Active"
                            ? "emerald"
                            : course.status === "Upcoming"
                              ? "amber"
                              : "blue"
                        }
                        size="sm"
                      >
                        {course.status || "Active"}
                      </Badge>
                    </div>

                    {/* Course Title */}
                    <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                      {course.title}
                    </h3>

                    {/* Department (if available) */}
                    {course.department && (
                      <p className="mt-1 text-xs text-slate-400 font-medium">
                        {course.department}
                      </p>
                    )}

                    {/* Course Description */}
                    {course.description && (
                      <p className="mt-2.5 text-xs text-slate-600 line-clamp-3 leading-relaxed bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                        {course.description}
                      </p>
                    )}

                    {/* Instructor & Location info (if available) */}
                    {(course.instructorName ||
                      course.schedule ||
                      course.room) && (
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                        {course.instructorName && (
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span className="font-semibold text-slate-800">
                              {course.instructorName}
                            </span>
                          </div>
                        )}
                        {course.schedule && (
                          <div className="flex items-center gap-2 text-slate-500">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{course.schedule}</span>
                          </div>
                        )}
                        {course.room && (
                          <div className="flex items-center gap-2 text-slate-500">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{course.room}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Lower Section: Capacity, Tracking Details & Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                    {/* Enrollment Capacity Progress Bar (if available) */}
                    {hasCapacity && (
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                          <span className="text-slate-500">
                            Enrollment Capacity
                          </span>
                          <span
                            className={`font-bold ${
                              isFull ? "text-amber-600" : "text-slate-800"
                            }`}
                          >
                            {course.enrolledCount} / {course.maxCapacity} seats
                            ({fillPercentage}%)
                          </span>
                        </div>

                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{
                              width: `${Math.min(fillPercentage, 100)}%`,
                            }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className={`h-full rounded-full ${
                              isFull
                                ? "bg-amber-500"
                                : fillPercentage > 80
                                  ? "bg-indigo-600"
                                  : "bg-emerald-500"
                            }`}
                          />
                        </div>
                      </div>
                    )}

                    {/* Tracking & Timestamp Details: Created At & Updated At */}
                    {(course.createdAt || course.updatedAt) && (
                      <div className="bg-slate-50/90 rounded-xl p-2.5 border border-slate-200/70 text-[11px] space-y-1.5">
                        {course.createdAt && (
                          <div className="flex items-center justify-between text-slate-500">
                            <span className="flex items-center gap-1.5 font-medium text-slate-600">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              Created:
                            </span>
                            <span
                              className="font-mono text-slate-700 font-semibold"
                              title={`Exact ISO: ${course.createdAt}`}
                            >
                              {formatCourseDate(course.createdAt)}
                            </span>
                          </div>
                        )}
                        {course.updatedAt && (
                          <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-200/50">
                            <span className="flex items-center gap-1.5 font-medium text-slate-600">
                              <History className="w-3.5 h-3.5 text-indigo-500" />
                              Updated:
                            </span>
                            <span
                              className="font-mono text-slate-700 font-semibold"
                              title={`Exact ISO: ${course.updatedAt}`}
                            >
                              {formatCourseDate(course.updatedAt)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Bar: Edit button & Delete button */}
                    <div className="flex items-center justify-between pt-1">
                      <Button
                        size="xs"
                        variant="outline"
                        iconLeft={
                          <Pencil className="w-3.5 h-3.5 text-indigo-600" />
                        }
                        onClick={() => openModal("edit-course", course)}
                        className="text-xs font-semibold text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100/80 border-indigo-200/80 hover:border-indigo-300 shadow-none cursor-pointer"
                      >
                        Edit Course
                      </Button>

                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => deleteCourse(course.id)}
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Delete Course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
      )}
    </div>
  );
};
