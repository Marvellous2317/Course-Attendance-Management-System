import React, { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import {
  CheckCircle2,
  Search,
  Download,
  Check,
  X,
  Clock,
  RotateCw,
  Loader2,
  AlertCircle,
  Users,
  Calendar,
  GraduationCap,
} from "lucide-react";
import useToast from "../../shared/hooks/useToast";
import { ScrollReveal } from "../../shared/components/ScrollReveal";

// Live TanStack Query Hooks
import {
  useTeacherOfferings,
  useTeacherOfferingSessions,
  useTeacherSessionAttendance,
  useMarkTeacherAttendance,
  useExportTeacherStudents,
} from "../../shared/hooks/useTeacher";

export default function TeacherAttendancePage() {
  const { showToast } = useToast();

  const [selectedOfferingId, setSelectedOfferingId] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [localSearch, setLocalSearch] = useState("");
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
        err?.response?.data?.message ||
          err?.response?.data?.error ||
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
  // 5. Export Enrolled Students as CSV Mutation
  // ---------------------------------------------------------------------------
  const exportStudentsMutation = useExportTeacherStudents({
    onSuccess: () => {
      showToast?.("Enrolled students CSV exported successfully.", "success");
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to export students CSV.";
      showToast?.(msg, "error");
    },
  });

  const handleExportCSV = () => {
    exportStudentsMutation.mutate();
  };

  // ---------------------------------------------------------------------------
  // 6. Aggregate Statistics Calculation
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
  // 7. Client-Side Search and Status Filter
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

  const handleRefresh = async () => {
    await Promise.all([refetchOfferings(), refetchSessions(), refetchAttendance()]);
    showToast?.("Attendance refreshed from server.", "success");
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header & Course / Session Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
            Attendance & Session Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor class attendance, log student presence, and export session logs.
          </p>
        </div>
      </div>

      {/* 2. Main Attendance Card */}
      <ScrollReveal delay={0.1}>
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
          {/* Card Header Strip */}
          <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2.5 py-0.5 rounded-lg bg-primary-900 text-secondary-500 text-xs font-mono font-bold">
                  {currentOffering?.course?.code || "COURSE"}
                </span>
                {currentOffering?.batchCode && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200/70">
                    {currentOffering.batchCode}
                  </span>
                )}
              </div>

              <h2 className="text-lg sm:text-xl font-black text-slate-950">
                {currentSession
                  ? `Session #${currentSession.id}: ${currentSession.topic || "Class Session"}`
                  : "Select a Session to View Attendance"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentOffering?.course?.title || "Academic Course"}
                {currentSession?.startTime && ` • Starts at ${currentSession.startTime}`}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button
                type="button"
                onClick={handleMarkAllPresent}
                disabled={markAttendanceMutation.isPending || totalEnrolled === 0}
                className="px-3.5 py-2 rounded-xl bg-primary-900 hover:bg-primary-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5 text-secondary-500" />
                <span>Mark All Present</span>
              </button>

              {/* Connected to GET /api/teacher/students/export */}
              <button
                type="button"
                onClick={handleExportCSV}
                disabled={exportStudentsMutation.isPending}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200/90 shadow-xs disabled:opacity-50"
                title="Download CSV of every student enrolled across your course offerings"
              >
                {exportStudentsMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-secondary-500" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>
                  {exportStudentsMutation.isPending
                    ? "Exporting CSV..."
                    : "Export Students CSV"}
                </span>
              </button>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
            {/* Status Filter Tabs */}
            <div className="flex items-center bg-slate-200/70 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
              <button
                type="button"
                onClick={() => setFilterStatus("ALL")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                  filterStatus === "ALL"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({totalEnrolled})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("PRESENT")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                  filterStatus === "PRESENT"
                    ? "bg-white text-emerald-700 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Present ({presentCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("ABSENT")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                  filterStatus === "ABSENT"
                    ? "bg-white text-rose-700 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Absent ({absentCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("UNMARKED")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                  filterStatus === "UNMARKED"
                    ? "bg-white text-amber-700 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Unmarked ({unmarkedCount})
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative md:max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search student by name or ID..."
                className="w-full pl-10 pr-8 py-2 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary-500 shadow-xs transition-colors"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={() => setLocalSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Loading & Error States */}
          {isLoadingAttendance && (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-secondary-500 animate-spin mx-auto" />
              <p className="text-sm font-bold text-slate-700">
                Loading session attendance sheet...
              </p>
            </div>
          )}

          {!isLoadingAttendance && isAttendanceError && (
            <div className="p-8 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <p className="text-sm font-bold text-slate-900">
                {attendanceError?.response?.data?.message ||
                  attendanceError?.message ||
                  "Failed to load attendance records."}
              </p>
              <button
                type="button"
                onClick={() => refetchAttendance()}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoadingAttendance && !isAttendanceError && filteredRecords.length === 0 && (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-950">
                {students.length === 0
                  ? "No Students Enrolled in this Batch"
                  : "No Student Records Match Filter"}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {students.length === 0
                  ? "When students enroll into this course offering, they will appear in this session's attendance roster."
                  : "Try clearing your search query or switching to the 'All' status filter."}
              </p>
              {localSearch && (
                <button
                  type="button"
                  onClick={() => setLocalSearch("")}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold cursor-pointer transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}

          {/* Student Records Table */}
          {!isLoadingAttendance && !isAttendanceError && filteredRecords.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-6">Student</th>
                    <th className="py-3.5 px-6">Institutional Email</th>
                    <th className="py-3.5 px-6 text-center">Status</th>
                    <th className="py-3.5 px-6 text-right">Attendance Action</th>
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
              Marking attendance updates session records and institutional logs in real time.
            </span>
            <div className="font-mono text-[11px] font-semibold text-slate-600 flex items-center gap-2">
              <span className="text-emerald-600 font-bold">{presentCount} Present</span>
              <span>•</span>
              <span className="text-rose-600 font-bold">{absentCount} Absent</span>
              <span>•</span>
              <span className="text-amber-600 font-bold">{unmarkedCount} Unmarked</span>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}