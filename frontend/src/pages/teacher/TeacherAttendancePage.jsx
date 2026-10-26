import React, { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import {
  CheckCircle2,
  Search,
  Download,
  Radio,
  ShieldCheck,
  Check,
  X,
  Clock,
  RotateCw,
  Loader2,
  AlertCircle,
  Users,
  Calendar,
  Layers,
} from "lucide-react";
import { useAdmin } from "../../context/AdminContext";

// Live TanStack Query Hooks
import {
  useTeacherOfferings,
  useTeacherOfferingSessions,
  useTeacherSessionAttendance,
  useMarkTeacherAttendance,
} from "../../shared/hooks/useTeacher";

export default function TeacherAttendancePage() {
  const adminContext = useAdmin?.() || {};
  const { showToast, setIsAttendanceModalOpen } = adminContext;

  const [selectedOfferingId, setSelectedOfferingId] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [localSearch, setLocalSearch] = useState("");
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 50;

  // ---------------------------------------------------------------------------
  // 1. Fetch Teacher Offerings / Batches
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

  // ---------------------------------------------------------------------------
  // 2. Fetch Sessions for Selected Offering
  // ---------------------------------------------------------------------------
  const {
    data: sessionsResponse,
    isLoading: isLoadingSessions,
    refetch: refetchSessions,
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

  // Auto-select first session if none selected or offering changed
  useEffect(() => {
    if (sessions.length > 0) {
      const exists = sessions.some((s) => String(s.id) === String(selectedSessionId));
      if (!exists) {
        setSelectedSessionId(String(sessions[0].id));
      }
    } else {
      setSelectedSessionId("");
    }
  }, [sessions, selectedOfferingId]);

  // Current Offering & Session Objects
  const currentOffering = useMemo(() => {
    return offerings.find((o) => String(o.id) === String(selectedOfferingId));
  }, [offerings, selectedOfferingId]);

  const currentSession = useMemo(() => {
    return sessions.find((s) => String(s.id) === String(selectedSessionId));
  }, [sessions, selectedSessionId]);

  // ---------------------------------------------------------------------------
  // 3. Fetch Session Attendance Records (GET /api/teacher/sessions/{id}/attendance)
  // ---------------------------------------------------------------------------
  const {
    data: attendanceResponse,
    isLoading: isLoadingAttendance,
    isError: isAttendanceError,
    error: attendanceError,
    refetch: refetchAttendance,
    isFetching: isFetchingAttendance,
  } = useTeacherSessionAttendance(
    selectedSessionId,
    { page, perPage },
    { enabled: Boolean(selectedSessionId) }
  );

  const students = useMemo(() => {
    if (!attendanceResponse) return [];
    if (Array.isArray(attendanceResponse.data)) return attendanceResponse.data;
    if (Array.isArray(attendanceResponse)) return attendanceResponse;
    return [];
  }, [attendanceResponse]);

  // ---------------------------------------------------------------------------
  // 4. Mark Attendance Mutation (PUT /api/teacher/sessions/{id}/attendance)
  // ---------------------------------------------------------------------------
  const markAttendanceMutation = useMarkTeacherAttendance({
    onSuccess: () => {
      showToast?.("Attendance record updated.", "success");
    },
    onError: (err) => {
      showToast?.(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to update attendance.",
        "error"
      );
    },
  });

  // Handle single student toggle
  const handleUpdateSingle = (studentId, presentStatus) => {
    if (!selectedSessionId) return;
    markAttendanceMutation.mutate({
      sessionId: selectedSessionId,
      records: [{ studentId, present: presentStatus }],
    });
  };

  // Handle Mark All Present
  const handleMarkAllPresent = () => {
    if (!selectedSessionId || students.length === 0) return;
    const records = students.map((s) => ({
      studentId: s.studentId,
      present: true,
    }));

    markAttendanceMutation.mutate({
      sessionId: selectedSessionId,
      records,
    });
    showToast?.("All students marked as present.", "success");
  };

  // ---------------------------------------------------------------------------
  // 5. Aggregate Statistics Calculation
  // ---------------------------------------------------------------------------
  const totalEnrolled = students.length;
  const presentCount = students.filter((s) => s.present === true).length;
  const absentCount = students.filter((s) => s.present === false).length;
  const unmarkedCount = students.filter(
    (s) => s.present === null || s.present === undefined
  ).length;

  const attendanceRate =
    totalEnrolled > 0
      ? ((presentCount / totalEnrolled) * 100).toFixed(1)
      : "0.0";

  // ---------------------------------------------------------------------------
  // 6. Client-Side Search and Status Filter
  // ---------------------------------------------------------------------------
  const filteredRecords = useMemo(() => {
    return students.filter((s) => {
      // Status Filter
      let matchesFilter = true;
      if (filterStatus === "PRESENT") matchesFilter = s.present === true;
      else if (filterStatus === "ABSENT") matchesFilter = s.present === false;
      else if (filterStatus === "UNMARKED")
        matchesFilter = s.present === null || s.present === undefined;

      // Search Query Filter
      const q = localSearch.toLowerCase().trim();
      if (!q) return matchesFilter;

      const fullName = `${s.firstName || ""} ${s.lastName || ""}`.toLowerCase();
      const email = (s.email || "").toLowerCase();
      const idStr = String(s.studentId || "");

      const matchesSearch =
        fullName.includes(q) || email.includes(q) || idStr.includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [students, filterStatus, localSearch]);

  // ---------------------------------------------------------------------------
  // 7. CSV Export
  // ---------------------------------------------------------------------------
  const handleExportCSV = () => {
    if (students.length === 0) {
      showToast?.("No attendance records to export.", "error");
      return;
    }

    const sessionTopic = currentSession?.topic || `Session_${selectedSessionId}`;
    const batchCode = currentOffering?.batchCode || "Offering";

    const csvContent =
      "data:text/csv;charset=utf-8,Student Name,Student ID,Email,Status\n" +
      students
        .map((s) => {
          const name = `"${s.firstName || ""} ${s.lastName || ""}"`.trim();
          const status =
            s.present === true
              ? "Present"
              : s.present === false
              ? "Absent"
              : "Unmarked";
          return `${name},${s.studentId},${s.email || ""},${status}`;
        })
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `${batchCode}_${sessionTopic.replace(/[^a-zA-Z0-9]/g, "_")}_Attendance_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast?.("Exported session attendance CSV.", "success");
  };

  const handleRefresh = async () => {
    await Promise.all([refetchOfferings(), refetchSessions(), refetchAttendance()]);
    showToast?.("Attendance refreshed from server.", "success");
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header & Course / Session Selectors */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-slate-900 text-secondary-500 border border-slate-800 mb-2">
            <span className="w-2 h-2 rounded-full bg-secondary-500 animate-pulse" />
            <span>FACULTY TELEMETRY & ATTENDANCE</span>
            <span className="text-slate-600">•</span>
            <span>
              {currentOffering?.batchCode || "Active Curriculum"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
            Attendance & Session Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor real-time class attendance, log student presence, and synchronize with campus records.
          </p>
        </div>

        {/* Top Controls: Offering Selector, Session Selector & Refresh */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Offering / Batch Selector */}
          <select
            value={selectedOfferingId}
            onChange={(e) => {
              setSelectedOfferingId(e.target.value);
              setSelectedSessionId("");
            }}
            disabled={isLoadingOfferings}
            className="px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary-500 shadow-xs cursor-pointer"
          >
            {offerings.length === 0 ? (
              <option value="">No offerings found</option>
            ) : (
              offerings.map((off) => {
                const code = off.course?.code || "COURSE";
                const batch = off.batchCode ? ` (${off.batchCode})` : "";
                const title = off.course?.title || "Untitled Course";
                return (
                  <option key={off.id} value={off.id}>
                    {code}{batch}: {title}
                  </option>
                );
              })
            )}
          </select>

          {/* Session Selector */}
          <select
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            disabled={isLoadingSessions || sessions.length === 0}
            className="px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary-500 shadow-xs cursor-pointer"
          >
            {sessions.length === 0 ? (
              <option value="">No sessions scheduled</option>
            ) : (
              sessions.map((sess) => (
                <option key={sess.id} value={sess.id}>
                  Session #{sess.id}: {sess.topic || "Class Session"}
                </option>
              ))
            )}
          </select>

          <button
            type="button"
            onClick={handleRefresh}
            title="Refresh Attendance"
            disabled={isFetchingAttendance || isFetchingOfferings}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
          >
            <RotateCw
              className={`w-4 h-4 ${
                isFetchingAttendance || isFetchingOfferings
                  ? "animate-spin text-secondary-500"
                  : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* 2. Sync Completed Banner */}
      {!bannerDismissed && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <strong className="font-bold block">Registrar Telemetry Active</strong>
              <span>
                Attendance status changes synchronize directly with institutional backend.
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setBannerDismissed(true)}
            className="p-1 rounded-lg text-emerald-700 hover:bg-emerald-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. Telemetry Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-950 font-mono">
              {attendanceRate}% Attendance Rate
            </div>
            <div className="text-[11px] text-slate-500">
              {presentCount} of {totalEnrolled} students present
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-950">
              FERPA Compliant Record
            </div>
            <div className="text-[11px] text-slate-500">
              Encrypted session attendance telemetry
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-950">
              {currentSession?.startTime
                ? `Starts ${currentSession.startTime}`
                : "Active Term Cohort"}
            </div>
            <div className="text-[11px] text-slate-500">
              {currentOffering?.batchCode || "Selected batch"}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Session Attendance Record Card */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Record Header */}
        <div className="p-6 bg-slate-900 text-white border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-secondary-500 text-slate-950 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse" />
              <span>
                {currentOffering?.batchCode
                  ? `${currentOffering.batchCode} LIVE AUDIT`
                  : "LIVE AUDIT"}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {currentSession
                ? `Session #${currentSession.id}: ${currentSession.topic || "Class Session"}`
                : "Select a Session to View Attendance"}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {currentOffering?.course?.title || "Academic Course"} •{" "}
              {currentSession?.startTime ? `Starts at ${currentSession.startTime}` : "Scheduled Session"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Attendance Statistics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 border-b border-slate-100 bg-slate-50/50">
          <div className="p-4 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Enrolled
            </span>
            <span className="text-2xl font-black text-slate-950 mt-1 block font-mono">
              {isLoadingAttendance ? "..." : totalEnrolled}
            </span>
          </div>

          <div className="p-4 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
              Present
            </span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block font-mono">
              {isLoadingAttendance ? "..." : presentCount}{" "}
              <span className="text-xs font-semibold">({attendanceRate}%)</span>
            </span>
          </div>

          <div className="p-4 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">
              Absent
            </span>
            <span className="text-2xl font-black text-rose-600 mt-1 block font-mono">
              {isLoadingAttendance ? "..." : absentCount}
            </span>
          </div>

          <div className="p-4 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
              Unmarked / Pending
            </span>
            <span className="text-2xl font-black text-amber-600 mt-1 block font-mono">
              {isLoadingAttendance ? "..." : unmarkedCount}
            </span>
          </div>
        </div>

        {/* Toolbar: Mark all present, filter tabs & search */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
          <div className="flex flex-wrap items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleMarkAllPresent}
              disabled={markAttendanceMutation.isPending || totalEnrolled === 0}
              className="px-3.5 py-2 rounded-xl bg-primary-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5 text-secondary-500" />
              <span>Mark All Present</span>
            </motion.button>

            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFilterStatus("ALL")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  filterStatus === "ALL"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                All ({totalEnrolled})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("PRESENT")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  filterStatus === "PRESENT"
                    ? "bg-white text-emerald-700 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Present ({presentCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("ABSENT")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  filterStatus === "ABSENT"
                    ? "bg-white text-rose-700 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Absent ({absentCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("UNMARKED")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  filterStatus === "UNMARKED"
                    ? "bg-white text-amber-700 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Unmarked ({unmarkedCount})
              </button>
            </div>
          </div>

          {/* Quick Search */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search student by name or ID..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary-500"
            />
          </div>
        </div>

        {/* Loading & Error States */}
        {isLoadingAttendance && (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-secondary-500 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-600">
              Loading session attendance sheet...
            </p>
          </div>
        )}

        {!isLoadingAttendance && isAttendanceError && (
          <div className="p-8 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-xs font-bold text-slate-900">
              {attendanceError?.response?.data?.message ||
                attendanceError?.message ||
                "Failed to load attendance records."}
            </p>
            <button
              type="button"
              onClick={() => refetchAttendance()}
              className="px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingAttendance && !isAttendanceError && filteredRecords.length === 0 && (
          <div className="py-16 text-center space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">
              {students.length === 0
                ? "No students enrolled in this offering"
                : "No student records match filter"}
            </p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              {students.length === 0
                ? "When students enroll into this course offering, they will appear in this session's attendance roster."
                : "Try clearing your search query or switching the status filter tab."}
            </p>
          </div>
        )}

        {/* Student Records Table */}
        {!isLoadingAttendance && !isAttendanceError && filteredRecords.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-6">Student Info</th>
                  <th className="py-3 px-6">Institutional Email</th>
                  <th className="py-3 px-6 text-center">Current Status</th>
                  <th className="py-3 px-6 text-right">Mark Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredRecords.map((record) => {
                  const studentId = record.studentId;
                  const fullName =
                    `${record.firstName || ""} ${record.lastName || ""}`.trim() ||
                    `Student #${studentId}`;
                  const initials = fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  const isPresent = record.present === true;
                  const isAbsent = record.present === false;
                  const isUnmarked =
                    record.present === null || record.present === undefined;

                  return (
                    <tr
                      key={studentId}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Student Info */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs">
                              {fullName}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400">
                              ID #{studentId}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Institutional Email */}
                      <td className="py-3.5 px-6 text-slate-600 font-mono text-[11px]">
                        {record.email || "—"}
                      </td>

                      {/* Current Status Badge */}
                      <td className="py-3.5 px-6 text-center">
                        {isPresent ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            Present
                          </span>
                        ) : isAbsent ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                            Absent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Unmarked
                          </span>
                        )}
                      </td>

                      {/* Action Toggle Buttons */}
                      <td className="py-3.5 px-6 text-right">
                        <div className="inline-flex items-center gap-1 p-0.5 bg-slate-100 rounded-xl">
                          <button
                            type="button"
                            disabled={markAttendanceMutation.isPending}
                            onClick={() => handleUpdateSingle(studentId, true)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                              isPresent
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                            }`}
                          >
                            PRESENT
                          </button>
                          <button
                            type="button"
                            disabled={markAttendanceMutation.isPending}
                            onClick={() => handleUpdateSingle(studentId, false)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                              isAbsent
                                ? "bg-rose-600 text-white shadow-xs"
                                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                            }`}
                          >
                            ABSENT
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Info */}
        <div className="p-4 sm:p-5 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            Marking attendance updates session records and refreshes faculty telemetry in real time.
          </span>
          <div className="font-mono text-[11px] font-semibold text-slate-600">
            {presentCount} Present • {absentCount} Absent • {unmarkedCount} Unmarked
          </div>
        </div>
      </div>
    </div>
  );
}