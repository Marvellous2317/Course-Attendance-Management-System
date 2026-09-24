import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { BookPlus, Clock, MapPin, UserCheck, Trash2 } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { Badge } from '../shared/Badge';
import { ScrollReveal } from '../shared/ScrollReveal';
import { EmptyState } from '../shared/EmptyState';
export const CoursesView = () => {
  const { courses, searchQuery, setSearchQuery, deleteCourse, openModal } =
    useAdmin();
  const [selectedDept, setSelectedDept] = useState('All');
  const departments = [
    'All',
    'Science & Physics',
    'Mathematics & Computing',
    'Computer Science',
    'Humanities & Literature',
    'Fine Arts & Design',
  ];
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructorName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        course.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept =
        selectedDept === 'All' || course.department === selectedDept;
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${selectedDept === dept ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {dept}
                </button>
              ))}
            </div>

            <Button
              variant="primary"
              size="sm"
              iconLeft={<BookPlus className="w-4 h-4" />}
              onClick={() => openModal('add-course')}
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
            setSelectedDept('All');
            setSearchQuery('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredCourses.map((course, index) => {
            const fillPercentage = Math.round(
              (course.enrolledCount / course.maxCapacity) * 100,
            );
            const isFull = course.enrolledCount >= course.maxCapacity;
            return (
              <ScrollReveal key={course.id} delay={0.08 + (index % 3) * 0.06}>
                <Card
                  hoverEffect
                  className="p-5 flex flex-col justify-between h-full group border-slate-200/90"
                >
                  <div>
                    {/* Header: Code, Dept & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                          {course.code}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {course.credits} Credits
                        </span>
                      </div>

                      <Badge
                        variant={
                          course.status === 'Active' ? 'emerald' : 'blue'
                        }
                        size="sm"
                      >
                        {course.status}
                      </Badge>
                    </div>

                    {/* Course Title */}
                    <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                      {course.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400 font-medium">
                      {course.department}
                    </p>

                    {/* Instructor & Location info */}
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="font-semibold text-slate-800">
                          {course.instructorName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{course.schedule}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{course.room}</span>
                      </div>
                    </div>
                  </div>

                  {/* Enrollment Capacity Progress Bar */}
                  <div className="mt-5 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                      <span className="text-slate-500">
                        Enrollment Capacity
                      </span>
                      <span
                        className={`font-bold ${isFull ? 'text-amber-600' : 'text-slate-800'}`}
                      >
                        {course.enrolledCount} / {course.maxCapacity} seats (
                        {fillPercentage}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{
                          width: `${Math.min(fillPercentage, 100)}%`,
                        }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className={`h-full rounded-full ${isFull ? 'bg-amber-500' : fillPercentage > 80 ? 'bg-indigo-600' : 'bg-emerald-500'}`}
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        {isFull ? 'Waitlist Enabled' : 'Registration Open'}
                      </span>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => deleteCourse(course.id)}
                        className="text-slate-400 hover:text-rose-600"
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
