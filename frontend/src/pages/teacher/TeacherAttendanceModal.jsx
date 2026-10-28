import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Download,
  Loader2,
  Search,
  Users,
  X,
} from "lucide-react";

import { useUIStore } from "../../shared/store/useUIStore";
import useToast from "../../shared/hooks/useToast";
import {
  useTeacherOfferings,
  useTeacherOfferingSessions,
  useTeacherSessionAttendance,
  useMarkTeacherAttendance,
} from "../../shared/hooks/useTeacher";

// =============================================================================
// Helpers
// =============================================================================
const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const statusOf = (value) =>
  value === true ? "PRESENT" : value === false ? "ABSENT" : "UNMARKED";

const statusFilterMatches = (status, filter) =>
  filter === "ALL" || status === filter;

// Live session first, then the next upcoming one, then the most recent one.
const pickDefaultSession = (sessions) => {
  if (!sessions.length) return null;
  const now = Date.now();
  const live = sessions.find(
    (s) =>
      new Date(s.startTime).getTime() <= now &&
      new Date(s.endTime).getTime() >= now
  );
  if (live) return live;
  const upcoming = sessions.find((s) => new Date(s.startTime).getTime() > now);
  if (upcoming) return upcoming;
  return sessions[sessions.length - 1];
};

// =============================================================================
// Attendance Modal (live data: offerings -> sessions -> attendance roster)
// =============================================================================
function AttendanceModalContent({ target }) {
  const { showToast } = useToast();
  const setIsAttendanceModalOpen = useUIStore(
    (state) => state.setIsAttendanceModalOpen
  );
  const setTeacherTab = useUIStore((state) => state.setTeacherTab);

  const closeModal = () => setIsAttendanceModalOpen(false);

  const [offeringId, setOfferingId] = useState(
    target?.offeringId ? String(target.offeringId) : ""
  );
  const [sessionId, setSessionId] = useState(
    target?.sessionId ? String(target.sessionId) : ""
  );
  const [draft, setDraft] = useState({});
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search, setSearch] = useState("");

  // ---------------------------------------------------------------------------
  // 1. Teacher offerings (batches)
  // ---------------------------------------------------------------------------
  const { data: offeringsData, isLoading: isLoadingOfferings } =
    useTeacherOfferings({ perPage: 50 });

  const offerings = useMemo(() => {
    if (!offeringsData) return [];
    if (Array.isArray(offeringsData.data)) return offeringsData.data;
    if (Array.isArray(offeringsData)) return offeringsData;
    return [];
  }, [offeringsData]);

  useEffect(() => {
    if (!offerings.length) return;
    setOfferingId((prev) =>
      prev && offerings.some((o) => String(o.id) === String(prev))
        ? prev
        : String(offerings[0].id)
    );
  }, [offerings]);

  const currentOffering = useMemo(
    () => offerings.find((o) => String(o.id) === String(offeringId)),
    [offerings, offeringId]
  );

  // ---------------------------------------------------------------------------
  // 2. Sessions of the selected offering
  // ---------------------------------------------------------------------------
  const {
    data: sessionsData,
    isLoading: isLoadingSessions,
    isError: isSessionsError,
    error: sessionsError,
    refetch: refetchSessions,
  } = useTeacherOfferingSessions(
    offeringId,
    { perPage: 50 },
    { enabled: Boolean(offeringId) }
  );

  const sessions = useMemo(() => {
    if (!sessionsData) return [];
    if (Array.isArray(sessionsData.data)) return sessionsData.data;
    if (Array.isArray(sessionsData)) return sessionsData;
    return [];
  }, [sessionsData]);

  useEffect(() => {
    setSessionId((prev) => {
      if (!sessions.length) return "";
      if (prev && sessions.some((s) => String(s.id) === String(prev))) {
        return prev;
      }
      return String(pickDefaultSession(sessions).id);
    });
  }, [sessions]);

  const currentSession = useMemo(
    () => sessions.find((s) => String(s.id) === String(sessionId)),
    [sessions, sessionId]
  );

  // ---------------------------------------------------------------------------
  // 3. Attendance roster for the selected session
  // ---------------------------------------------------------------------------
  const {
    data: attendanceData,
    isLoading: isLoadingAttendance,
    isError: isAttendanceError,
    error: attendanceError,
    refetch: refetchAttendance,
    isFetching: isFetchingAttendance,
  } = useTeacherSessionAttendance(
    sessionId,
    { page: 1, perPage: 50 },
    { enabled: Boolean(sessionId) }
  );

  const students = useMemo(() => {
    if (!attendanceData) return [];
    if (Array.isArray(attendanceData.data)) return attendanceData.data;
    if (Array.isArray(attendanceData)) return attendanceData;
    return [];
  }, [attendanceData]);

  const rosterMeta = attendanceData?.meta || {};

  // Reset the editable draft whenever the server roster changes (new session,
  // refetch, or the response of a save).
  useEffect(() => {
    if (!Array.isArray(attendanceData?.data)) return;
    const next = {};
    attendanceData.data.forEach((student) => {
      if (student.present === true || student.present === false) {
        next[student.studentId] = student.present;
      }
    });
    setDraft(next);
  }, [attendanceData]);

  // ---------------------------------------------------------------------------
  // 4. Mark attendance mutation
  // ---------------------------------------------------------------------------
  const markAttendance = useMarkTeacherAttendance({
    onSuccess: () => {
      showToast?.(
        `Attendance saved for ${currentSession?.topic || "this session"}.`,
        "success"
      );
    },
    onError: (err) => {
      showToast?.(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to save attendance.",
        "error"
      );
    },
  });

  const setStudentStatus = (studentId, present) =>
    setDraft((prev) => ({ ...prev, [studentId]: present }));

  const markAllPresent = () => {
    if (!students.length) return;
    const next = {};
    students.forEach((student) => {
      next[student.studentId] = true;
    });
    setDraft(next);
    showToast?.("All students set to present. Save to sync.", "info");
  };

  const discardChanges = () => {
    const next = {};
    students.forEach((student) => {
      if (student.present === true || student.present === false) {
        next[student.studentId] = student.present;
      }
    });
    setDraft(next);
    showToast?.("Unsaved attendance changes discarded.", "info");
  };

  const serverPresent = (student) =>
    student.present === true || student.present === false
      ? student.present
      : undefined;

  const hasChanges = useMemo(
    () =>
      students.some(
        (student) => draft[student.studentId] !== serverPresent(student)
      ),
    [students, draft]
  );

  const handleSave = () => {
    if (!sessionId) return;

    const records = Object.entries(draft)
      .filter(([, present]) => present === true || present === false)
      .map(([studentId, present]) => ({
        studentId: Number(studentId),
        present,
      }));

    if (records.length === 0) {
      showToast?.("Mark at least one student before saving.", "error");
      return;
    }

    markAttendance.mutate({ sessionId, records });
  };

  // ---------------------------------------------------------------------------
  // 5. Derived stats + filtering
  // ---------------------------------------------------------------------------
  const counts = useMemo(() => {
    let present = 0;
    let absent = 0;
    let unmarked = 0;

    students.forEach((student) => {
      const status = statusOf(draft[student.studentId]);
      if (status === "PRESENT") present += 1;
      else if (status === "ABSENT") absent += 1;
      else unmarked += 1;
    });

    const marked = present + absent;

    return {
      present,
      absent,
      unmarked,
      total: students.length,
      rate: marked > 0 ? ((present / marked) * 100).toFixed(1) : "0.0",
    };
  }, [students, draft]);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();

    return students.filter((student) => {
      const status = statusOf(draft[student.studentId]);
      if (!statusFilterMatches(status, filterStatus)) return false;
      if (!q) return true;

      const fullName =
        `${student.firstName || ""} ${student.lastName || ""}`.toLowerCase();
      const email = (student.email || "").toLowerCase();
      const id = String(student.studentId || "");

      return fullName.includes(q) || email.includes(q) || id.includes(q);
    });
  }, [students, draft, filterStatus, search]);

  // ---------------------------------------------------------------------------
  // 6. Export the current session roster as CSV (live data)
  // ---------------------------------------------------------------------------
  const handleExportCSV = () => {
    if (!students.length) {
      showToast?.("There are no students to export.", "error");
      return;
    }

    const rows = [
      ["Student Name", "Student ID", "Email", "Status"],
      ...students.map((student) => [
        `${student.firstName || ""} ${student.lastName || ""}`.trim(),
        student.studentId,
        student.email || "",
        statusOf(draft[student.studentId]),
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance-session-${sessionId || "session"}-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast?.("Session attendance CSV exported.", "success");
  };

  // ---------------------------------------------------------------------------
  // 7. Render states shared by several branches
  // ---------------------------------------------------------------------------
  const sessionSubtitle = currentSession
    ? `${formatDate(currentSession.startTime)} • ${formatTime(
        currentSession.startTime
      )} – ${formatTime(currentSession.endTime)}`
    : "Select a class session";

  const goTo = (tab) => {
    setTeacherTab?.(tab);
    closeModal();
  };

  const renderBody = () => {
    if (isLoadingOfferings) {
      return (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-secondary-500 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-700">
            Loading your course offerings...
          </p>
        </div>
      );
    }

    if (offerings.length === 0) {
      return (
        <div className="py-14 text-center space-y-3 px-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-950">
            No Course Offering Scheduled
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Attendance is recorded per class session, and sessions belong to a
            course offering (batch). Create an offering first, then schedule its
            lectures.
          </p>
          <button
            type="button"
            onClick={() => goTo("courses")}
            className="px-4 py-2 rounded-xl bg-primary-900 hover:bg-primary-950 text-white text-xs font-bold cursor-pointer transition-colors"
          >
            Create Course Offering
          </button>
        </div>
      );
    }

    if (isLoadingSessions) {
      return (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-secondary-500 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-700">
            Loading class sessions...
          </p>
        </div>
      );
    }

    if (isSessionsError) {
      return (
        <div className="py-14 text-center space-y-3 px-6">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="text-sm font-bold text-slate-900">
            {sessionsError?.response?.data?.error ||
              sessionsError?.message ||
              "Failed to load class sessions."}
          </p>
          <button
            type="button"
            onClick={() => refetchSessions()}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (sessions.length === 0) {
      return (
        <div className="py-14 text-center space-y-3 px-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-950">
            No Class Sessions Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            This batch has no scheduled lectures, so there is no session to take
            attendance for. Schedule a class session first.
          </p>
          <button
            type="button"
            onClick={() => goTo("schedule")}
            className="px-4 py-2 rounded-xl bg-primary-900 hover:bg-primary-950 text-white text-xs font-bold cursor-pointer transition-colors"
          >
            Go to Class Schedule
          </button>
        </div>
      );
    }

    if (isLoadingAttendance) {
      return (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-secondary-500 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-700">
            Loading attendance roster...
          </p>
        </div>
      );
    }

    if (isAttendanceError) {
      return (
        <div className="py-14 text-center space-y-3 px-6">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="text-sm font-bold text-slate-900">
            {attendanceError?.response?.data?.error ||
              attendanceError?.message ||
              "Failed to load attendance records."}
          </p>
          <button
            type="button"
            onClick={() => refetchAttendance()}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (students.length === 0) {
      return (
        <div className="py-14 text-center space-y-3 px-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-950">
            No Students Enrolled in this Batch
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Students appear here once they enroll into{" "}
            {currentOffering?.batchCode || "this course offering"}.
          </p>
        </div>
      );
    }

    if (filteredStudents.length === 0) {
      return (
        <div className="py-14 text-center space-y-3 px-6">
          <Users className="w-8 h-8 mx-auto text-slate-300" />
          <p className="text-sm font-bold text-slate-800">
            No student matches this filter
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setFilterStatus("ALL");
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
          >
            Clear Filters
          </button>
        </div>
      );
    }

    return (
      <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
        {filteredStudents.map((student) => {
          const studentId = student.studentId;
          const fullName =
            `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
            `Student #${studentId}`;
          const initials = fullName
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
          const status = statusOf(draft[studentId]);

          return (
            <div
              key={studentId}
              className="px-6 py-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs text-slate-950 truncate">
                    {fullName}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 min-w-0">
                    <span className="font-mono text-slate-400">
                      ID #{studentId}
                    </span>
                    {student.email && (
                      <>
                        <span>•</span>
                        <span className="truncate">{student.email}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {status === "UNMARKED" && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Unmarked
                </span>
              )}

              <div className="inline-flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg shrink-0">
                <button
                  type="button"
                  onClick={() => setStudentStatus(studentId, true)}
                  disabled={markAttendance.isPending}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer disabled:opacity-50 ${
                    status === "PRESENT"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  PRESENT
                </button>
                <button
                  type="button"
                  onClick={() => setStudentStatus(studentId, false)}
                  disabled={markAttendance.isPending}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer disabled:opacity-50 ${
                    status === "ABSENT"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  ABSENT
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeModal}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 my-auto border border-slate-200"
      >
        {/* Header */}
        <div className="p-6 bg-primary-900 text-white border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-secondary-500 text-slate-950 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse" />
              <span>
                {currentOffering?.course?.code || "COURSE"}
                {currentOffering?.batchCode
                  ? ` • ${currentOffering.batchCode}`
                  : ""}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white truncate">
              {currentSession
                ? `Session #${currentSession.id} Attendance — ${
                    currentSession.topic || "Class Session"
                  }`
                : "Take Attendance"}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {currentOffering?.course?.title || "Select a course offering"}
              {currentSession && ` • ${sessionSubtitle}`}
            </p>
          </div>

          <button
            type="button"
            onClick={closeModal}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Offering & session selectors */}
        {offerings.length > 0 && (
          <div className="px-4 sm:px-6 py-3 border-b border-slate-100 bg-white grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="attendance-offering"
                className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1"
              >
                Course Offering / Batch
              </label>
              <select
                id="attendance-offering"
                value={offeringId}
                onChange={(e) => {
                  setOfferingId(e.target.value);
                  setSessionId("");
                }}
                disabled={markAttendance.isPending}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {offerings.map((offering) => (
                  <option key={offering.id} value={offering.id}>
                    {offering.course?.code
                      ? `${offering.course.code}: `
                      : ""}
                    {offering.course?.title || `Offering #${offering.id}`}
                    {offering.batchCode ? ` (${offering.batchCode})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="attendance-session"
                className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1"
              >
                Class Session
              </label>
              <select
                id="attendance-session"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                disabled={sessions.length === 0 || markAttendance.isPending}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 cursor-pointer disabled:cursor-not-allowed disabled:text-slate-400"
              >
                {sessions.length === 0 ? (
                  <option value="">No sessions scheduled</option>
                ) : (
                  sessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      #{session.id} • {formatDate(session.startTime)} •{" "}
                      {formatTime(session.startTime)} —{" "}
                      {session.topic || "Class Session"}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        )}

        {/* Statistics */}
        {students.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 border-b border-slate-100 bg-slate-50/50">
            <div className="p-4 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Enrolled
              </span>
              <span className="text-2xl font-black text-slate-950 mt-0.5 block">
                {counts.total}
              </span>
            </div>
            <div className="p-4 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
                Present
              </span>
              <span className="text-2xl font-black text-emerald-600 mt-0.5 block">
                {counts.present}{" "}
                <span className="text-xs font-semibold">({counts.rate}%)</span>
              </span>
            </div>
            <div className="p-4 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">
                Absent
              </span>
              <span className="text-2xl font-black text-rose-600 mt-0.5 block">
                {counts.absent}
              </span>
            </div>
            <div className="p-4 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
                Unmarked
              </span>
              <span className="text-2xl font-black text-amber-600 mt-0.5 block">
                {counts.unmarked}
              </span>
            </div>
          </div>
        )}

        {/* Action bar */}
        {students.length > 0 && (
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={markAllPresent}
                disabled={markAttendance.isPending || students.length === 0}
                className="px-3.5 py-1.5 rounded-xl bg-primary-900 hover:bg-primary-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5 text-secondary-500" />
                <span>Mark All Present</span>
              </button>

              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                {[
                  { key: "ALL", label: "All", count: counts.total },
                  { key: "PRESENT", label: "Present", count: counts.present },
                  { key: "ABSENT", label: "Absent", count: counts.absent },
                  { key: "UNMARKED", label: "Unmarked", count: counts.unmarked },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setFilterStatus(tab.key)}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      filterStatus === tab.key
                        ? "bg-white text-slate-950 shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Quick search student..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>
        )}

        {rosterMeta.totalRecords > students.length && students.length > 0 && (
          <div className="px-6 py-2 bg-amber-50 border-b border-amber-200/70 text-[11px] text-amber-900">
            Showing the first {students.length} of {rosterMeta.totalRecords}{" "}
            enrolled students.
          </div>
        )}

        {renderBody()}

        {/* Footer */}
        {students.length > 0 && (
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Session CSV</span>
              </button>

              <button
                type="button"
                onClick={() => refetchAttendance()}
                disabled={isFetchingAttendance}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                title="Reload the roster from the server"
              >
                {isFetchingAttendance ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-secondary-500" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>Refresh</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={discardChanges}
                disabled={!hasChanges || markAttendance.isPending}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Discard Changes
              </button>

              <button
                type="button"
                onClick={closeModal}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={
                  markAttendance.isPending || !hasChanges || !sessionId
                }
                className="px-4 py-2 rounded-xl bg-primary-900 hover:bg-primary-700 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {markAttendance.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin text-secondary-500" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-secondary-500" />
                )}
                <span>
                  {markAttendance.isPending ? "Saving..." : "Save Attendance"}
                </span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// =============================================================================
// Wrapper (mounts a fresh form each time the modal opens)
// =============================================================================
export default function TeacherAttendanceModal() {
  const isOpen = useUIStore((state) => state.isAttendanceModalOpen);
  const target = useUIStore((state) => state.attendanceTarget);

  return (
    <AnimatePresence>
      {isOpen && (
        <AttendanceModalContent
          key={`${target?.offeringId ?? "any"}:${target?.sessionId ?? "any"}`}
          target={target}
        />
      )}
    </AnimatePresence>
  );
}
