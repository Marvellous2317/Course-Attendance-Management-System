import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Radio,
  Printer,
  CheckCircle2,
  BookOpen,
  CalendarCheck,
  Plus,
  RotateCw,
  Loader2,
  AlertCircle,
  X,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

// Live TanStack Query Hooks
import {
  useTeacherOfferings,
  useTeacherOfferingSessions,
  useCreateTeacherSession,
} from '../../shared/hooks/useTeacher';

// ==============================================================================
// Date & Time Utility Helpers
// ==============================================================================

const formatTime = (isoString) => {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return isoString;
  }
};

const formatDate = (isoString) => {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
};

const getDurationMinutes = (startIso, endIso) => {
  if (!startIso || !endIso) return null;
  try {
    const start = new Date(startIso).getTime();
    const end = new Date(endIso).getTime();
    const diffMins = Math.round((end - start) / (1000 * 60));
    if (diffMins <= 0) return null;
    if (diffMins < 60) return `${diffMins} mins`;
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs} hrs`;
  } catch {
    return null;
  }
};

const getSessionStatus = (startIso, endIso) => {
  const now = new Date().getTime();
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();

  if (now >= start && now <= end) {
    return { label: 'LIVE NOW', type: 'live' };
  }
  if (now > end) {
    return { label: 'COMPLETED', type: 'completed' };
  }
  return { label: 'UPCOMING', type: 'upcoming' };
};

const getRelativeCountdown = (startIso) => {
  if (!startIso) return '';
  const now = new Date().getTime();
  const start = new Date(startIso).getTime();
  const diffMs = start - now;
  if (diffMs <= 0) return 'IN PROGRESS';
  const diffMins = Math.round(diffMs / (1000 * 60));
  if (diffMins < 60) return `IN ${diffMins} MINS`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `IN ${diffHrs}H ${diffMins % 60}M`;
  const diffDays = Math.floor(diffHrs / 24);
  return `IN ${diffDays} DAY${diffDays > 1 ? 'S' : ''}`;
};

// ==============================================================================
// Main Component
// ==============================================================================

export default function TeacherSchedulePage() {
  const adminContext = useAdmin?.() || {};
  const { setIsAttendanceModalOpen, showToast = () => {} } = adminContext;

  // View States
  const [scheduleView, setScheduleView] = useState('agenda'); // 'agenda' | 'grid'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'UPCOMING' | 'COMPLETED'
  const [selectedOfferingId, setSelectedOfferingId] = useState('');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Form State for Creating a Session
  const [newTopic, setNewTopic] = useState('');
  const [newDate, setNewDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [newStartTime, setNewStartTime] = useState('10:00');
  const [newEndTime, setNewEndTime] = useState('11:30');
  const [formError, setFormError] = useState('');

  // ---------------------------------------------------------------------------
  // 1. Fetch Teacher Course Offerings / Cohorts
  // ---------------------------------------------------------------------------
  const {
    data: offeringsResponse,
    isLoading: isLoadingOfferings,
    refetch: refetchOfferings,
    isFetching: isFetchingOfferings,
  } = useTeacherOfferings({ perPage: 50 });

  const offerings = useMemo(() => {
    if (!offeringsResponse) return [];
    if (Array.isArray(offeringsResponse.data)) return offeringsResponse.data;
    if (Array.isArray(offeringsResponse)) return offeringsResponse;
    return [];
  }, [offeringsResponse]);

  // Auto-select first offering if none selected
  useEffect(() => {
    if (offerings.length > 0 && !selectedOfferingId) {
      setSelectedOfferingId(String(offerings[0].id));
    }
  }, [offerings, selectedOfferingId]);

  // Current active offering object
  const currentOffering = useMemo(() => {
    return offerings.find((o) => String(o.id) === String(selectedOfferingId));
  }, [offerings, selectedOfferingId]);

  // ---------------------------------------------------------------------------
  // 2. Fetch Sessions for Selected Offering
  // ---------------------------------------------------------------------------
  const {
    data: sessionsResponse,
    isLoading: isLoadingSessions,
    isError: isSessionsError,
    error: sessionsError,
    refetch: refetchSessions,
    isFetching: isFetchingSessions,
  } = useTeacherOfferingSessions(
    selectedOfferingId,
    { perPage: 50 },
    { enabled: Boolean(selectedOfferingId) }
  );

  const sessions = useMemo(() => {
    if (!sessionsResponse) return [];
    if (Array.isArray(sessionsResponse.data)) return sessionsResponse.data;
    if (Array.isArray(sessionsResponse)) return sessionsResponse;
    return [];
  }, [sessionsResponse]);

  // ---------------------------------------------------------------------------
  // 3. Mutation: Create Session
  // ---------------------------------------------------------------------------
  const createSessionMutation = useCreateTeacherSession({
    onSuccess: () => {
      showToast('Class session scheduled successfully', 'success');
      setIsScheduleModalOpen(false);
      setNewTopic('');
      setFormError('');
      refetchSessions();
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to schedule session';
      setFormError(msg);
      showToast(msg, 'error');
    },
  });

  const handleCreateSessionSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedOfferingId) {
      setFormError('Please select a course offering cohort.');
      return;
    }
    if (!newTopic.trim()) {
      setFormError('Session topic or title is required.');
      return;
    }
    if (!newDate || !newStartTime || !newEndTime) {
      setFormError('Date, start time, and end time are required.');
      return;
    }

    const startDateTime = new Date(`${newDate}T${newStartTime}:00`);
    const endDateTime = new Date(`${newDate}T${newEndTime}:00`);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      setFormError('Invalid date or time values provided.');
      return;
    }
    if (endDateTime <= startDateTime) {
      setFormError('End time must be after start time.');
      return;
    }

    try {
      await createSessionMutation.mutateAsync({
        offeringId: Number(selectedOfferingId),
        payload: {
          topic: newTopic.trim(),
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
        },
      });
    } catch {
      // Handled in onError callback
    }
  };

  // ---------------------------------------------------------------------------
  // 4. Derived Live Metrics & Upcoming Session
  // ---------------------------------------------------------------------------
  const now = new Date().getTime();

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const status = getSessionStatus(s.startTime, s.endTime);
      if (statusFilter === 'UPCOMING') {
        return status.type === 'upcoming' || status.type === 'live';
      }
      if (statusFilter === 'COMPLETED') {
        return status.type === 'completed';
      }
      return true;
    });
  }, [sessions, statusFilter]);

  const upcomingSessions = useMemo(() => {
    return sessions
      .filter((s) => new Date(s.endTime || s.startTime).getTime() >= now)
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
  }, [sessions, now]);

  const nextSession = upcomingSessions[0] || null;

  // Total teaching hours calculated from session durations
  const totalTeachingHours = useMemo(() => {
    let totalMinutes = 0;
    sessions.forEach((s) => {
      if (s.startTime && s.endTime) {
        const diff =
          new Date(s.endTime).getTime() - new Date(s.startTime).getTime();
        if (diff > 0) totalMinutes += diff / (1000 * 60);
      }
    });
    return (totalMinutes / 60).toFixed(1);
  }, [sessions]);

  // ---------------------------------------------------------------------------
  // 5. Weekly Grid Grouping (Monday - Friday)
  // ---------------------------------------------------------------------------
  const weekDays = [
    { dayIndex: 1, name: 'Monday', short: 'Mon' },
    { dayIndex: 2, name: 'Tuesday', short: 'Tue' },
    { dayIndex: 3, name: 'Wednesday', short: 'Wed' },
    { dayIndex: 4, name: 'Thursday', short: 'Thu' },
    { dayIndex: 5, name: 'Friday', short: 'Fri' },
  ];

  const currentDayOfWeek = new Date().getDay();

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-50 text-amber-900 border border-amber-200/80 mb-2">
            <span className="w-2 h-2 rounded-full bg-secondary-500 animate-pulse" />
            <span>FACULTY TIMETABLE</span>
            <span className="text-amber-400">•</span>
            <span>LIVE SESSION DISPATCH</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
            Class Schedule & Sessions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Manage recurring class lectures, schedule new lecture sessions, and
            launch attendance check-ins across your active course cohorts.
          </p>
        </div>

        {/* Global Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => {
              refetchOfferings();
              refetchSessions();
              showToast('Timetable data refreshed', 'info');
            }}
            disabled={isFetchingSessions || isFetchingOfferings}
            className="p-2.5 rounded-xl bg-white border border-slate-200/90 text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            title="Refresh schedule"
          >
            <RotateCw
              className={`w-4 h-4 ${isFetchingSessions || isFetchingOfferings ? 'animate-spin text-secondary-500' : ''}`}
            />
          </button>

          {/* Print Schedule Button */}
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/90 text-slate-800 hover:text-slate-950 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print PDF</span>
          </button>

          {/* Schedule Session Button */}
          <button
            type="button"
            onClick={() => {
              setFormError('');
              setIsScheduleModalOpen(true);
            }}
            disabled={offerings.length === 0}
            className="px-4 py-2.5 rounded-xl bg-primary-900 hover:bg-primary-950 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-slate-900/10 transition-all cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4 text-secondary-500" />
            <span>Schedule Session</span>
          </button>
        </div>
      </div>

      {/* 2. Real-Time Telemetry Cards (4 Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Cohorts */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Assigned Cohorts
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-950">
              {offerings.length}{' '}
              <span className="text-sm font-semibold text-slate-500">
                Cohorts Active
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1 overflow-x-auto py-0.5">
              {offerings.slice(0, 3).map((o) => (
                <span
                  key={o.id}
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 shrink-0"
                >
                  {o.batchCode || o.course?.code || `Batch #${o.id}`}
                </span>
              ))}
              {offerings.length > 3 && (
                <span className="text-[10px] font-bold text-slate-400">
                  +{offerings.length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Total Sessions */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Recorded Sessions
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-950">
              {sessions.length}{' '}
              <span className="text-sm font-semibold text-slate-500">
                Total Classes
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>{totalTeachingHours} Teaching Hours</span>
              <span className="font-semibold text-emerald-600">Active</span>
            </div>
          </div>
        </div>

        {/* Card 3: Upcoming Classes */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Pending Classes
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-950">
              {upcomingSessions.length}{' '}
              <span className="text-sm font-semibold text-slate-500">
                Upcoming
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              {sessions.length - upcomingSessions.length} classes completed
            </div>
          </div>
        </div>

        {/* Card 4: Next Live Session */}
        <div className="p-5 rounded-2xl bg-primary-900 text-white border border-slate-800 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Next Class Session
            </span>
            {nextSession && (
              <div className="px-2 py-0.5 rounded-full bg-secondary-500 text-slate-950 text-[10px] font-black flex items-center justify-center shadow-xs">
                {getRelativeCountdown(nextSession.startTime)}
              </div>
            )}
          </div>

          <div className="mt-2">
            {nextSession ? (
              <>
                <div className="text-base font-black text-white truncate">
                  {nextSession.topic || 'Class Lecture'}
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  {formatDate(nextSession.startTime)} •{' '}
                  {formatTime(nextSession.startTime)}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-secondary-500 font-mono font-semibold">
                    {currentOffering?.batchCode || 'Assigned Cohort'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (setIsAttendanceModalOpen) {
                        setIsAttendanceModalOpen(true);
                      } else {
                        showToast(
                          `Launching attendance for ${nextSession.topic}`,
                          'info'
                        );
                      }
                    }}
                    className="text-[11px] font-bold text-amber-300 hover:text-white underline cursor-pointer"
                  >
                    Take Attendance →
                  </button>
                </div>
              </>
            ) : (
              <div className="py-2 text-xs text-slate-400">
                No upcoming sessions scheduled for this cohort.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Cohort Selector & View Controls Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Cohort Dropdown */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex-1 min-w-0">
            <label
              htmlFor="cohort-select"
              className="block text-[10px] font-bold uppercase tracking-wider text-slate-400"
            >
              Active Course Cohort
            </label>
            {isLoadingOfferings ? (
              <div className="flex items-center gap-2 text-xs text-slate-500 py-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-secondary-500" />
                <span>Loading cohorts...</span>
              </div>
            ) : offerings.length === 0 ? (
              <span className="text-xs font-semibold text-slate-500">
                No course offerings assigned
              </span>
            ) : (
              <select
                id="cohort-select"
                value={selectedOfferingId}
                onChange={(e) => setSelectedOfferingId(e.target.value)}
                className="w-full mt-0.5 bg-transparent border-none p-0 text-sm font-bold text-slate-900 focus:ring-0 cursor-pointer"
              >
                {offerings.map((offering) => (
                  <option key={offering.id} value={offering.id}>
                    {offering.course?.code ? `${offering.course.code}: ` : ''}
                    {offering.course?.title || offering.batchCode || `Cohort #${offering.id}`}
                    {offering.batchCode ? ` (${offering.batchCode})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* View Toggle & Status Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {['ALL', 'UPCOMING', 'COMPLETED'].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-xs font-bold ${
                  statusFilter === filter
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {filter === 'ALL'
                  ? 'All'
                  : filter === 'UPCOMING'
                    ? 'Upcoming'
                    : 'Completed'}
              </button>
            ))}
          </div>

          {/* Agenda vs Weekly Grid */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setScheduleView('agenda')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-xs font-bold ${
                scheduleView === 'agenda'
                  ? 'bg-primary-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Agenda
            </button>
            <button
              type="button"
              onClick={() => setScheduleView('grid')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-xs font-bold ${
                scheduleView === 'grid'
                  ? 'bg-primary-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weekly Grid
            </button>
          </div>
        </div>
      </div>

      {/* 4. Main Sessions Schedule Area */}
      {isLoadingSessions ? (
        <div className="p-12 rounded-3xl bg-white border border-slate-200/90 text-center flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-secondary-500 animate-spin" />
          <h3 className="font-bold text-slate-800 text-sm">
            Loading class sessions...
          </h3>
          <p className="text-xs text-slate-400">
            Fetching scheduled lectures for the selected cohort.
          </p>
        </div>
      ) : isSessionsError ? (
        <div className="p-8 rounded-3xl bg-rose-50 border border-rose-200 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="font-bold text-rose-900 text-sm">
            Failed to Load Class Sessions
          </h3>
          <p className="text-xs text-rose-600 max-w-md mx-auto">
            {sessionsError?.message ||
              'An error occurred while loading class schedule sessions.'}
          </p>
          <button
            type="button"
            onClick={() => refetchSessions()}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer transition-colors"
          >
            Retry Connection
          </button>
        </div>
      ) : sessions.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-dashed border-slate-300 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">
              No Class Sessions Scheduled
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              There are no class sessions recorded for this cohort yet. Click
              below to schedule a new lecture session.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setFormError('');
              setIsScheduleModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-primary-900 hover:bg-primary-950 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-secondary-500" />
            <span>Schedule First Session</span>
          </button>
        </div>
      ) : scheduleView === 'agenda' ? (
        /* ====================================================================
         * VIEW A: AGENDA / TIMELINE LIST
         * ==================================================================== */
        <div className="space-y-3">
          {filteredSessions.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-slate-200/90 text-center text-xs text-slate-500">
              No sessions match the selected filter ({statusFilter}).
            </div>
          ) : (
            filteredSessions.map((session) => {
              const status = getSessionStatus(session.startTime, session.endTime);
              const duration = getDurationMinutes(
                session.startTime,
                session.endTime
              );

              return (
                <div
                  key={session.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    status.type === 'live'
                      ? 'bg-primary-950 text-white border-2 border-secondary-500 shadow-lg'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  {/* Left: Timing & Status */}
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 text-center ${
                        status.type === 'live'
                          ? 'bg-secondary-500 text-slate-950 font-black'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase leading-none">
                        {new Date(session.startTime).toLocaleDateString([], {
                          weekday: 'short',
                        })}
                      </span>
                      <span className="text-base font-black leading-tight">
                        {new Date(session.startTime).getDate() || '—'}
                      </span>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            status.type === 'live'
                              ? 'bg-secondary-500 text-slate-950'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {formatTime(session.startTime)} –{' '}
                          {formatTime(session.endTime)}
                        </span>

                        {duration && (
                          <span
                            className={`text-[10px] font-semibold ${
                              status.type === 'live'
                                ? 'text-slate-300'
                                : 'text-slate-400'
                            }`}
                          >
                            • {duration}
                          </span>
                        )}

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            status.type === 'live'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                              : status.type === 'completed'
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {status.label}
                        </span>
                      </div>

                      <h4
                        className={`text-base font-bold mt-1 ${
                          status.type === 'live' ? 'text-white' : 'text-slate-950'
                        }`}
                      >
                        {session.topic || 'Lecture Session'}
                      </h4>

                      <div
                        className={`text-xs mt-0.5 flex items-center gap-2 ${
                          status.type === 'live'
                            ? 'text-slate-300'
                            : 'text-slate-500'
                        }`}
                      >
                        <span>
                          {currentOffering?.course?.title ||
                            currentOffering?.batchCode ||
                            `Cohort #${session.offeringId}`}
                        </span>
                        <span>•</span>
                        <span>{formatDate(session.startTime)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (setIsAttendanceModalOpen) {
                          setIsAttendanceModalOpen(true);
                        } else {
                          showToast(
                            `Opening attendance log for ${session.topic}`,
                            'info'
                          );
                        }
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        status.type === 'live'
                          ? 'bg-secondary-500 hover:bg-secondary-600 text-slate-950 font-black shadow-md'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      {status.type === 'live' && (
                        <Radio className="w-3.5 h-3.5 text-slate-950 animate-pulse" />
                      )}
                      <span>Take Attendance</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* ====================================================================
         * VIEW B: 5-DAY WEEKLY GRID (MONDAY - FRIDAY)
         * ==================================================================== */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {weekDays.map((day) => {
            const isToday = currentDayOfWeek === day.dayIndex;
            const daySessions = filteredSessions.filter((s) => {
              if (!s.startTime) return false;
              return new Date(s.startTime).getDay() === day.dayIndex;
            });

            return (
              <div key={day.dayIndex} className="space-y-3">
                {/* Column Header */}
                <div
                  className={`p-3 rounded-2xl text-center border transition-all ${
                    isToday
                      ? 'bg-primary-900 text-white border-2 border-secondary-500 shadow-md'
                      : 'bg-white border-slate-200/90 text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    {isToday && (
                      <span className="w-2 h-2 rounded-full bg-secondary-500 animate-pulse" />
                    )}
                    <span className="text-xs font-bold block">{day.name}</span>
                  </div>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider block mt-0.5 ${
                      isToday ? 'text-amber-300' : 'text-slate-400'
                    }`}
                  >
                    {isToday ? 'TODAY' : `${daySessions.length} Classes`}
                  </span>
                </div>

                {/* Day Sessions List */}
                {daySessions.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-white/60 border border-dashed border-slate-200 text-center text-[11px] text-slate-400">
                    No classes scheduled
                  </div>
                ) : (
                  daySessions.map((session) => {
                    const status = getSessionStatus(
                      session.startTime,
                      session.endTime
                    );

                    return (
                      <div
                        key={session.id}
                        className={`p-4 rounded-2xl space-y-3 transition-all ${
                          status.type === 'live'
                            ? 'bg-primary-950 text-white border-2 border-secondary-500 shadow-md'
                            : 'bg-white border border-slate-200/90 shadow-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              status.type === 'live'
                                ? 'bg-secondary-500 text-slate-950'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {formatTime(session.startTime)}
                          </span>
                          <span
                            className={`text-[10px] font-bold ${
                              status.type === 'live'
                                ? 'text-emerald-400'
                                : 'text-slate-400'
                            }`}
                          >
                            {status.label}
                          </span>
                        </div>

                        <div>
                          <h4
                            className={`font-bold text-xs line-clamp-2 ${
                              status.type === 'live'
                                ? 'text-white'
                                : 'text-slate-950'
                            }`}
                          >
                            {session.topic || 'Class Session'}
                          </h4>
                          <div
                            className={`text-[11px] mt-1 ${
                              status.type === 'live'
                                ? 'text-slate-300'
                                : 'text-slate-400'
                            }`}
                          >
                            {formatTime(session.startTime)} –{' '}
                            {formatTime(session.endTime)}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (setIsAttendanceModalOpen) {
                              setIsAttendanceModalOpen(true);
                            } else {
                              showToast(
                                `Taking attendance for ${session.topic}`,
                                'info'
                              );
                            }
                          }}
                          className={`w-full py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                            status.type === 'live'
                              ? 'bg-secondary-500 hover:bg-secondary-600 text-slate-950'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                          }`}
                        >
                          Attendance
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ====================================================================
       * SCHEDULE NEW CLASS SESSION MODAL
       * ==================================================================== */}
      <AnimatePresence>
        {isScheduleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-950">
                    Schedule New Class Session
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Cohort:{' '}
                    <span className="font-semibold text-slate-700">
                      {currentOffering?.course?.title ||
                        currentOffering?.batchCode ||
                        `Cohort #${selectedOfferingId}`}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body Form */}
              <form onSubmit={handleCreateSessionSubmit} className="p-5 sm:p-6 space-y-4">
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Cohort Selector (if multiple exist) */}
                <div>
                  <label
                    htmlFor="modal-offering-select"
                    className="block text-xs font-bold text-slate-700 mb-1"
                  >
                    Select Cohort / Course Offering
                  </label>
                  <select
                    id="modal-offering-select"
                    value={selectedOfferingId}
                    onChange={(e) => setSelectedOfferingId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-900"
                  >
                    {offerings.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.course?.title || o.batchCode} ({o.batchCode || `#${o.id}`})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Topic / Session Title */}
                <div>
                  <label
                    htmlFor="modal-session-topic"
                    className="block text-xs font-bold text-slate-700 mb-1"
                  >
                    Session Topic / Lecture Title *
                  </label>
                  <input
                    id="modal-session-topic"
                    type="text"
                    required
                    placeholder="e.g. Week 4: Concurrency & Threads"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-900"
                  />
                </div>

                {/* Date */}
                <div>
                  <label
                    htmlFor="modal-session-date"
                    className="block text-xs font-bold text-slate-700 mb-1"
                  >
                    Session Date *
                  </label>
                  <input
                    id="modal-session-date"
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-900"
                  />
                </div>

                {/* Start & End Times */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="modal-session-start"
                      className="block text-xs font-bold text-slate-700 mb-1"
                    >
                      Start Time *
                    </label>
                    <input
                      id="modal-session-start"
                      type="time"
                      required
                      value={newStartTime}
                      onChange={(e) => setNewStartTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-900"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="modal-session-end"
                      className="block text-xs font-bold text-slate-700 mb-1"
                    >
                      End Time *
                    </label>
                    <input
                      id="modal-session-end"
                      type="time"
                      required
                      value={newEndTime}
                      onChange={(e) => setNewEndTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-900"
                    />
                  </div>
                </div>

                {/* Footer Submit Buttons */}
                <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsScheduleModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createSessionMutation.isPending}
                    className="px-5 py-2 rounded-xl bg-primary-900 hover:bg-primary-950 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-slate-900/10 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {createSessionMutation.isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-secondary-500" />
                        <span>Scheduling...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-secondary-500" />
                        <span>Schedule Session</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}