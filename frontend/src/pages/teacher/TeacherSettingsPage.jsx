import { useState } from "react";
import {
  User,
  ShieldCheck,
  Bell,
  Camera,
  Lock,
  Key,
  Download,
  GraduationCap,
  Search,
  Building,
  Phone,
  Globe,
  Trash2,
  Clock,
  Check,
  ChevronDown,
  FileText,
} from "lucide-react";
import { useAdmin } from "../../context/AdminContext";

export const TeacherSettingsPage = () => {
  const { showToast } = useAdmin();
  const [activeSubTab, setActiveSubTab] = useState("profile");
  const [searchQuery, setSearchQuery] = useState("");

  // Teacher Profile state
  const [displayName, setDisplayName] = useState("Professor Eleanor Vance, Ph.D.");
  const [department, setDepartment] = useState("School of Computing & Cybernetics");
  const [officeSuite, setOfficeSuite] = useState("Alan Turing Engineering Complex (Suite 412)");
  const [phone, setPhone] = useState("+1 (555) 019-9482");
  const [timezone, setTimezone] = useState("Eastern Time (US & Canada) UTC-05:00");
  const [bio, setBio] = useState(
    "Eleanor Vance is a Professor of Computer Science at the Othello Institute. Her research centers on large-scale distributed systems, consensus topologies, and transformer acceleration hardware. She directs the Othello Distributed Systems Laboratory."
  );

  // Security State
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  // Notification State
  const [notifLectures, setNotifLectures] = useState(true);
  const [notifEnrollments, setNotifEnrollments] = useState(true);
  const [notifAttendance, setNotifAttendance] = useState(true);
  const [notifRegistrar, setNotifRegistrar] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    showToast(
      "Academic profile & bio successfully updated and synced to directory",
      "success"
    );
  };

  const handleSaveSecurity = (e) => {
    e.preventDefault();
    if (newPass && newPass !== confirmPass) {
      showToast("New passwords do not match", "error");
      return;
    }
    showToast(
      "Kerberos credentials and hardware key updated successfully",
      "success"
    );
    setCurrentPass("");
    newPass && setNewPass("");
    confirmPass && setConfirmPass("");
  };

  return (
    <div className="min-h-full bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] bg-slate-100/60 p-2 sm:p-4 lg:p-6 rounded-3xl">
      {/* Outer Floating Card Container matching design screenshot */}
      <div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xl p-5 sm:p-8 lg:p-10 max-w-6xl mx-auto space-y-8">
        
        {/* Top Header Bar */}
        <div className="space-y-6">
          {/* Badge & Search Top Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-72 lg:w-80">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search faculty records, course policies, access keys..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/90 rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-xs"
                />
              </div>


              {/* Notification Bell */}
              <button
                type="button"
                onClick={() => showToast("No unread faculty notifications", "info")}
                className="relative p-2 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-600 transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
              </button>
            </div>
          </div>

          {/* Title, Description & Floating Subtab Row */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-2">
            <div className="max-w-2xl">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
                Faculty Settings & Preferences
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                Manage your academic profile, credentials, institutional security protocols, and real-time notification dispatch parameters.
              </p>
            </div>

            {/* Soft & Playful Floating Tab Bar */}
            <div className="bg-slate-100/90 p-1.5 rounded-full border border-slate-200/80 shadow-inner flex items-center gap-1 text-xs font-bold self-start lg:self-auto">
              {[
                { id: "profile", label: "Profile" },
                { id: "security", label: "Role Access" },
                { id: "notifications", label: "Authentication" },
                { id: "audit", label: "Audit & Dispatch" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                    activeSubTab === tab.id
                      ? "bg-white text-slate-900 shadow-sm font-extrabold"
                      : "text-slate-500 hover:text-slate-900 font-semibold"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Inner Section Card (Soft Grey Container) */}
        <div className="bg-[#f8fafc] border border-slate-200/80 rounded-[2rem] p-5 sm:p-8 space-y-6 shadow-xs">
          
          {/* Profile View Content */}
          {activeSubTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Inner Card Top Title Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-200/80 border border-slate-300/60 flex items-center justify-center text-slate-700">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900">
                        Faculty Profile
                      </h2>
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-slate-200/80 text-slate-700 uppercase">
                        FAC 4.2-B
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tenured academic record registered on Kerberos realm AUTH.OTHELLO.EDU
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold self-start sm:self-auto">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>SSO Synced</span>
                </div>
              </div>

              {/* User Portrait Banner Card */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5">
                <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80"
                      alt="Dr. Eleanor Vance"
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center text-slate-950 font-black text-[9px]">
                      ★
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h3 className="text-base font-bold text-slate-950">Dr. Eleanor Vance, Ph.D.</h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#0f172a] text-white text-[10px] font-bold uppercase tracking-wider">
                        Tenured Full Professor
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Faculty Identity Ref: <span className="font-mono text-slate-700 font-bold">FAC-2021-042</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Assigned to: <span className="text-slate-600 font-medium">School of Computing & Cybernetics</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => showToast("Select new photograph file to upload", "info")}
                    className="px-4 py-2 bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-slate-500" />
                    <span>Change Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast("Photo reset to system default avatar", "info")}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                    Official Display Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium shadow-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 pr-10"
                    />
                    <User className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                    Academic Unit & Department
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium shadow-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 pr-10"
                    />
                    <Building className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                    Institutional Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value="e.vance@othello.edu"
                      disabled
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-mono shadow-xs pr-32 cursor-not-allowed"
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold">
                      <Lock className="w-3 h-3 text-amber-600" />
                      <span>SSO Managed</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Modified only via Okta Master Provisioning Console.
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                    Campus Office / Suite Assignment
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={officeSuite}
                      onChange={(e) => setOfficeSuite(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium shadow-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 pr-10"
                    />
                    <Building className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                    Direct Extension / Dispatch Line
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium shadow-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 pr-10"
                    />
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                    Primary Academic Dispatch Timezone
                  </label>
                  <div className="relative">
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium shadow-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 appearance-none pr-10 cursor-pointer"
                    >
                      <option value="Eastern Time (US & Canada) UTC-05:00">Eastern Time (US & Canada) UTC-05:00</option>
                      <option value="Central Time (US & Canada) UTC-06:00">Central Time (US & Canada) UTC-06:00</option>
                      <option value="Pacific Time (US & Canada) UTC-08:00">Pacific Time (US & Canada) UTC-08:00</option>
                      <option value="UTC / Greenwich Mean Time">UTC / Greenwich Mean Time</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Biography Textarea */}
              <div>
                <label className="block text-[10px] sm:text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                  Curriculum Bio & Research Statement
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 leading-relaxed font-medium shadow-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Visible to enrolled students, academic advisees, and the Othello directory portal.
                </span>
              </div>

              {/* Form Footer Action Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/80">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Last metadata revision: February 18, 2025 at 09:22 EST by ADM-ROOT</span>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Save Profile Changes</span>
                </button>
              </div>
            </form>
          )}

          {/* Security & 2FA Content */}
          {activeSubTab === "security" && (
            <form onSubmit={handleSaveSecurity} className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-200/80 border border-slate-300/60 flex items-center justify-center text-slate-700">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Institutional Security & Kerberos Protocols
                    </h2>
                    <p className="text-xs text-slate-500">Manage hardware security keys and password rotation</p>
                  </div>
                </div>
              </div>

              {/* 2FA Token Status */}
              <div className="p-4 rounded-2xl bg-[#0f172a] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      Hardware Key (YubiKey 5C NFC) Paired
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Primary MFA method • Serial #YK-984210
                    </div>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider">
                  ENFORCED & ACTIVE
                </span>
              </div>

              {/* Password Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                    Current Kerberos Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                    New Kerberos Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200/80">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Update Password & Credentials</span>
                </button>
              </div>
            </form>
          )}

          {/* Notifications Content */}
          {activeSubTab === "notifications" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-200/80 border border-slate-300/60 flex items-center justify-center text-slate-700">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Real-Time Notification Dispatch Channels
                    </h2>
                    <p className="text-xs text-slate-500">Configure alert parameters for automated updates</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between shadow-xs">
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Class Schedule & Lecture Reminders
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Alert 15 minutes before scheduled session start times
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifLectures}
                    onChange={(e) => setNotifLectures(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between shadow-xs">
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Student Enrollment Alerts
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Notify upon capacity cap changes and waitlist promotions
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifEnrollments}
                    onChange={(e) => setNotifEnrollments(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between shadow-xs">
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Attendance Discrepancy Warnings
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Flag sudden unexcused spikes or badge reader telemetry issues
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifAttendance}
                    onChange={(e) => setNotifAttendance(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between shadow-xs">
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Registrar & Institutional Announcements
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Receive administrative policy updates from Dean Sterling
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifRegistrar}
                    onChange={(e) => setNotifRegistrar(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200/80">
                <button
                  type="button"
                  onClick={() => showToast("Notification preferences saved", "success")}
                  className="px-6 py-2.5 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Save Notification Settings</span>
                </button>
              </div>
            </div>
          )}

          {/* Audit & Dispatch Content */}
          {activeSubTab === "audit" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-200/80 border border-slate-300/60 flex items-center justify-center text-slate-700">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Faculty Telemetry & Security Audit</h2>
                    <p className="text-xs text-slate-500">Review system activity and active web sessions</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0f172a] text-white text-xs space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-slate-300 font-mono text-[11px]">
                    Othello Directory Sync ID: AUTH-VANCE-2025A-9492 • Node 122B50
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => showToast("Generated security audit log CSV", "info")}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Audit Log (.CSV)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => showToast("All active web sessions invalidated except this tab", "info")}
                    className="px-4 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Revoke Active Web Sessions
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
