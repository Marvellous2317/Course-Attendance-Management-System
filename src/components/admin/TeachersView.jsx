import { useState, useMemo } from 'react';
import {
  UserPlus,
  Mail,
  GraduationCap,
  BookOpen,
  Trash2,
  Briefcase,
  Layers,
  Award,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { Badge } from '../shared/Badge';
import { ScrollReveal } from '../shared/ScrollReveal';
import { EmptyState } from '../shared/EmptyState';
export const TeachersView = () => {
  const { teachers, searchQuery, setSearchQuery, deleteTeacher, openModal } =
    useAdmin();
  const [selectedDept, setSelectedDept] = useState('All');
  const departments = [
    'All',
    'Science & Physics',
    'Mathematics & Computing',
    'Humanities & Literature',
    'Computer Science',
    'Fine Arts & Design',
  ];
  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const matchesSearch =
        teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.teacherId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.subjects.some((s) =>
          s.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      const matchesDept =
        selectedDept === 'All' || teacher.department === selectedDept;
      return matchesSearch && matchesDept;
    });
  }, [teachers, searchQuery, selectedDept]);
  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ScrollReveal delay={0.05}>
          <Card className="p-4.5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Total Faculty
              </span>
              <span className="text-sm font-bold text-slate-800">
                {teachers.length} Active Instructors
              </span>
            </div>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <Card className="p-4.5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Departments
              </span>
              <span className="text-sm font-bold text-slate-800">
                6 Academic Divisions
              </span>
            </div>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <Card className="p-4.5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Average Load
              </span>
              <span className="text-sm font-bold text-slate-800">
                4.2 Classes / Faculty
              </span>
            </div>
          </Card>
        </ScrollReveal>
      </div>

      {/* Filter Chips & Action Controls */}
      <ScrollReveal delay={0.2}>
        <Card className="p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Department horizontal scrolling pills */}
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
              iconLeft={<UserPlus className="w-4 h-4" />}
              onClick={() => openModal('add-teacher')}
              className="shrink-0 self-end lg:self-auto"
            >
              Add Faculty Member
            </Button>
          </div>
        </Card>
      </ScrollReveal>

      {/* Faculty Cards Grid */}
      {filteredTeachers.length === 0 ? (
        <EmptyState
          title="No faculty members found"
          description="Try selecting another department or resetting the search."
          actionLabel="View All Faculty"
          onAction={() => {
            setSelectedDept('All');
            setSearchQuery('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredTeachers.map((teacher, index) => (
            <ScrollReveal key={teacher.id} delay={0.1 + (index % 3) * 0.07}>
              <Card
                hoverEffect
                className="p-5 flex flex-col justify-between h-full group"
              >
                <div>
                  {/* Top card bar: Avatar, Name & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={teacher.avatar}
                        alt={teacher.name}
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {teacher.name}
                        </h4>
                        <span className="text-[11px] font-mono text-slate-400 block">
                          {teacher.teacherId}
                        </span>
                      </div>
                    </div>

                    <Badge
                      variant={
                        teacher.status === 'Active' ? 'emerald' : 'amber'
                      }
                      size="sm"
                      dot
                    >
                      {teacher.status}
                    </Badge>
                  </div>

                  {/* Department & Qualification */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-700">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="font-semibold">
                        {teacher.department}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{teacher.qualification}</span>
                    </div>
                  </div>

                  {/* Subjects Taught */}
                  <div className="mt-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Assigned Subjects ({teacher.subjects.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {teacher.subjects.map((subj, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[11px] bg-slate-100 text-slate-700 font-medium"
                        >
                          {subj}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer bar with contacts and actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="space-y-0.5 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span className="truncate max-w-[160px]">
                        {teacher.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-slate-400" />
                      <span>{teacher.classesCount} Class Sections</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => deleteTeacher(teacher.id)}
                      className="text-slate-400 hover:text-rose-600"
                      title="Remove teacher record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
};
