import { useState } from 'react';
import { Users, DoorOpen, Plus } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { ScrollReveal } from '../shared/ScrollReveal';
import { EmptyState } from '../shared/EmptyState';
export const SchedulesView = () => {
  const { schedules, showToast } = useAdmin();
  const [activeDay, setActiveDay] = useState('Monday');
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const daySchedules = schedules.filter((s) => s.day === activeDay);
  return (
    <div className="space-y-6 pb-12">
      {/* Day Selector Pills Bar */}
      <ScrollReveal delay={0.05}>
        <Card className="p-3.5 sm:p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {days.map((day) => {
                const count = schedules.filter((s) => s.day === day).length;
                const isSelected = activeDay === day;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setActiveDay(day)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${isSelected ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    <span>{day}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'}`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              iconLeft={<Plus className="w-4 h-4" />}
              onClick={() =>
                showToast('Classroom booking module activated', 'info')
              }
            >
              Allocate Room
            </Button>
          </div>
        </Card>
      </ScrollReveal>

      {/* Timetable Slot Cards */}
      <div className="space-y-4">
        {daySchedules.length === 0 ? (
          <EmptyState
            title={`No classes scheduled for ${activeDay}`}
            description="There are no scheduled lectures or laboratories on this calendar day."
            actionLabel="Schedule a class"
            onAction={() => showToast('Add slot opened', 'info')}
          />
        ) : (
          daySchedules.map((item, idx) => (
            <ScrollReveal key={item.id} delay={0.05 + idx * 0.07}>
              <Card hoverEffect className="p-5 border-l-4 border-l-indigo-600">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Time badge & Course Info */}
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-center shrink-0 min-w-[110px]">
                      <span className="text-xs font-bold block">
                        {item.startTime}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        to {item.endTime}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 text-slate-700">
                          {item.courseCode}
                        </span>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900">
                          {item.courseName}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                        <span>
                          Instructor:{' '}
                          <strong className="text-slate-700 font-semibold">
                            {item.instructorName}
                          </strong>
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Right: Room & Attendance seats */}
                  <div className="flex items-center gap-4 self-end md:self-auto shrink-0 text-xs">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700 font-medium">
                      <DoorOpen className="w-4 h-4 text-indigo-500" />
                      <span>{item.room}</span>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700 font-medium">
                      <Users className="w-4 h-4 text-emerald-500" />
                      <span>
                        {item.enrolled} / {item.capacity} Attending
                      </span>
                    </div>

                    <Button
                      size="xs"
                      variant="subtle"
                      onClick={() =>
                        showToast(
                          `Attendance roster opened for ${item.courseCode}`,
                          'info',
                        )
                      }
                    >
                      Attendance Sheet
                    </Button>
                  </div>
                </div>
              </Card>
            </ScrollReveal>
          ))
        )}
      </div>
    </div>
  );
};
