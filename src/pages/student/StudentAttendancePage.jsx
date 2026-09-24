import { useState } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  Download,
  Radio,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Search,
  ChevronDown,
  KeyRound,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
export const StudentAttendancePage = ({
  auditRecords,
  onRequestAppeal,
  onVerifyKey,
}) => {
  const { showToast } = useAdmin();
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const filteredRecords = auditRecords.filter((rec) => {
    if (courseFilter !== 'all' && rec.courseCode !== courseFilter) return false;
    if (statusFilter !== 'all' && rec.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        rec.courseCode.toLowerCase().includes(q) ||
        rec.courseTitle.toLowerCase().includes(q) ||
        (rec.room?.toLowerCase().includes(q) ?? false) ||
        (rec.instructor?.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  });
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PRESENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            PRESENT (ON TIME)
          </span>
        );
      case 'LATE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-secondary-500" />
            LATE (GRACE PERIOD)
          </span>
        );
      case 'EXCUSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <ShieldCheck className="w-3 h-3 text-blue-600" />
            EXCUSED ABSENCE
          </span>
        );
      case 'UNEXCUSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            UNEXCUSED ABSENCE
          </span>
        );
    }
  };
  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header with Badges & Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-slate-100 text-slate-700">
              SEMESTER TERM 2025-A
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
              • ACADEMIC EXCELLENCE STATUS
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Biometric & RFID Attendance Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time cryptographically signed turnstile telemetry. Every
            session is logged with millisecond timestamps and hardware ingress
            IDs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-auto">
          <button
            type="button"
            onClick={() =>
              showToast(
                'Compiling official signed attendance ledger PDF...',
                'success',
              )
            }
            className="px-4 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF Ledger</span>
          </button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRequestAppeal}
            className="px-4 py-2.5 rounded-2xl bg-secondary-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-secondary-500/20 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span>+ Request Absence Appeal</span>
          </motion.button>
        </div>
      </div>

      {/* 2. Top 4 Telemetry Metric Cards (Matching Screen 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Attendance */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              OVERALL ATTENDANCE
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-950 mt-2">
            96.4%{' '}
            <span className="text-xs font-bold text-emerald-600">↑+1.2%</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            159 / 165 Sessions logged • Top 5% Cohort
          </p>
        </div>

        {/* Missed Sessions */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              MISSED UNEXCUSED
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-950 mt-2">
            2{' '}
            <span className="text-xs font-medium text-slate-400">Sessions</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Threshold: ≤6 sessions before academic review
          </p>
        </div>

        {/* Late / Grace */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              LATE / GRACE PERIOD
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-secondary-500 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-950 mt-2">
            4{' '}
            <span className="text-xs font-medium text-slate-400">Sessions</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Avg delay: 4.2 mins (Within 10m grace limit)
          </p>
        </div>

        {/* RFID Credential */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              VERIFIED CREDENTIAL
            </span>
            <div className="w-8 h-8 rounded-xl bg-primary-900 text-secondary-500 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-slate-950 font-mono mt-2">
            DESFire EV3
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Serial #8841-VH • Active
          </p>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by course code, room..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-secondary-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Course filter */}
          <div className="relative">
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 px-3 py-1.5 pr-7 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <option value="all">All Registered Courses</option>
              <option value="CS-401">CS-401</option>
              <option value="SWE-210">SWE-210</option>
              <option value="AI-490">AI-490</option>
              <option value="MATH-240">MATH-240</option>
              <option value="ETH-310">ETH-310</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>

          {/* Status filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 px-3 py-1.5 pr-7 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <option value="all">All Ingress Statuses</option>
              <option value="PRESENT">Present (On Time)</option>
              <option value="LATE">Late (Grace)</option>
              <option value="EXCUSED">Excused</option>
              <option value="UNEXCUSED">Unexcused</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 4. Table of Audit Records */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-6">DATE & TIMESTAMP</th>
                <th className="py-3.5 px-6">COURSE & FACULTY</th>
                <th className="py-3.5 px-6">INGRESS METHOD</th>
                <th className="py-3.5 px-6">ROOM / VENUE</th>
                <th className="py-3.5 px-6">VERIFIED STATUS</th>
                <th className="py-3.5 px-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((record) => (
                <motion.tr
                  key={record.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ backgroundColor: 'rgba(248, 250, 252, 0.8)' }}
                  className="transition-colors"
                >
                  {/* Date & Time */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <strong className="block text-slate-900 font-bold">
                      {record.date}
                    </strong>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {record.timestamp} • {record.sessionNumber}
                    </span>
                  </td>

                  {/* Course & Faculty */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-primary-900 text-secondary-500 font-mono font-bold text-[10px]">
                        {record.courseCode}
                      </span>
                      <span className="font-bold text-slate-900 truncate max-w-[180px]">
                        {record.courseTitle}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {record.instructor}
                    </span>
                  </td>

                  {/* Ingress Method */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-mono text-slate-700 font-semibold">
                      <Radio className="w-3.5 h-3.5 text-secondary-500" />
                      <span>{record.ingressDevice}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      NFC Hardware Handshake
                    </span>
                  </td>

                  {/* Room / Venue */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="font-medium text-slate-800">
                      {record.room}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Alan Turing Complex
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    {getStatusBadge(record.status)}
                  </td>

                  {/* Action */}
                  <td className="py-4 px-6 whitespace-nowrap text-right">
                    {record.status === 'UNEXCUSED' ? (
                      <button
                        type="button"
                        onClick={onRequestAppeal}
                        className="px-3 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-[11px] cursor-pointer"
                      >
                        Appeal
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onVerifyKey(record)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium text-[11px] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <KeyRound className="w-3 h-3 text-slate-400" />
                        <span>Audit Key</span>
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer info note */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              Cryptographic Proof: SHA-256 Ledger signed by Institutional
              Academic Audit Node #10
            </span>
          </div>

          <span className="font-mono text-[11px] text-slate-400">
            Current Hash: 0x7a8f9c2d...41b0
          </span>
        </div>
      </div>
    </div>
  );
};
