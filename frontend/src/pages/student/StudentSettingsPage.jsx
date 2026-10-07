import { useState } from "react";
import {
  Radio,
  Bell,
  Save,
  Smartphone,
  User,
  RotateCw,
  Search,
  Lock,
  Mail,
  Building,
  Phone,
  Camera,
  Trash2,
  Clock,
  Check,
  ChevronDown,
  FileText,
  Key,
} from "lucide-react";
import { useAdmin } from "../../context/AdminContext";

export const StudentSettingsPage = () => {
  const { showToast } = useAdmin();
  const [activeSubTab, setActiveSubTab] = useState("profile");
  const [searchQuery, setSearchQuery] = useState("");

  // Student Profile State
  const [legalName] = useState("Julian Vance-Hayes");
  const [email] = useState("j.vancehayes@othello.edu");
  const [studentId] = useState("STU-2024-8841");
  const [major, setMajor] = useState("Computer Science & Applied Mathematics");
  const [phone, setPhone] = useState("+1 (555) 019-3382");
  const [timezone, setTimezone] = useState("Eastern Time (US & Canada) UTC-05:00");

  // RFID & Credentials State
  const [rfidActive, setRfidActive] = useState(true);
  const [isRotatingKeys, setIsRotatingKeys] = useState(false);

  // Notification Preferences State
  const [notifyLectures, setNotifyLectures] = useState(true);
  const [notifyAttendanceAlerts, setNotifyAttendanceAlerts] = useState(true);
  const [allowFacultyTelemetry, setAllowFacultyTelemetry] = useState(true);

  const handleKeyRotation = () => {
    setIsRotatingKeys(true);
    setTimeout(() => {
      setIsRotatingKeys(false);
      showToast(
        "DESFire EV3 cryptographic session key rotated successfully.",
        "success"
      );
    }, 900);
  };

  const handleSave = (e) => {
    e.preventDefault();
    showToast("Student preferences and RFID configuration saved.", "success");
  };

  return (
    <div className="min-h-full bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] bg-slate-100/60 p-2 sm:p-4 lg:p-6 rounded-3xl">
      {/* Outer Floating Card Container matching design screenshot */}
      <div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xl p-5 sm:p-8 lg:p-10 max-w-6xl mx-auto space-y-8">
        
        {/* Top Header Bar */}
        <div className="space-y-6">
          {/* Badge & Search Top Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-amber-100/80 text-amber-900 border border-amber-300/60">
                STUDENT PREFERENCES • TERM 2025-A
              </span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Secured with DESFire EV3 & Kerberos SSO</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-72 lg:w-80">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search student records, RFID logs, course keys..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/90 rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-xs"
                />
              </div>

              {/* System Operational Badge */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>SYSTEM OPERATIONAL</span>
              </div>

              {/* Notification Bell */}
              <button
                type="button"
                onClick={() => showToast("No unread student notifications", "info")}
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
                Settings & Credentials
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                Manage your physical RFID credentials, biometric ingress configurations, and academic notifications across campus systems.
              </p>
            </div>

            {/* Soft & Playful Floating Tab Bar */}
            <div className="bg-slate-100/90 p-1.5 rounded-full border border-slate-200/80 shadow-inner flex items-center gap-1 text-xs font-bold self-start lg:self-auto">
              {[
                { id: "profile", label: "Profile" },
                { id: "rfid", label: "Role Access" },
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
            <form onSubmit={handleSave} className="space-y-6">
              {/* Inner Card Top Title Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-200/80 border border-slate-300/60 flex items-center justify-center text-slate-700">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900">
                        Student Profile
                      </h2>
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-slate-200/80 text-slate-700 uppercase">
                        STU 2.1-A
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Matriculated student record registered on Kerberos realm AUTH.OTHELLO.EDU
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
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80"
                      alt="Julian Vance-Hayes"
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center text-slate-950 font-black text-[9px]">
                      ★
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h3 className="text-base font-bold text-slate-950">Julian Vance-Hayes</h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#0f172a] text-white text-[10px] font-bold uppercase tracking-wider">
                        Undergraduate Senior
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Student Identity Ref: <span className="font-mono text-slate-700 font-bold">STU-2024-8841</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Assigned to: <span className="text-slate-600 font-medium">Department of Computer Science & Applied Math</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => showToast("Select new photo file to upload", "info")}
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
                    Legal Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={legalName}
                      disabled
                      className="w-full bg-slate-100/80 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 font-medium shadow-xs cursor-not-allowed pr-10"
                    />
                    <User className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                    Campus Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full bg-slate-100/80 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 font-mono shadow-xs pr-32 cursor-not-allowed"
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold">
                      <Lock className="w-3 h-3 text-amber-600" />
                      <span>SSO Managed</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                    Matriculation ID Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={studentId}
                      disabled
                      className="w-full bg-slate-100/80 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 font-mono shadow-xs cursor-not-allowed pr-10"
                    />
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                    Academic Major & Track
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium shadow-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 pr-10"
                    />
                    <Building className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                    Direct Contact Phone
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

          {/* RFID Ingress View */}
          {activeSubTab === "rfid" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-200/80 border border-slate-300/60 flex items-center justify-center text-slate-700">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Campus RFID & Biometric Ingress
                    </h2>
                    <p className="text-xs text-slate-500">Mifare DESFire EV3 cryptographically signed physical card</p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ACTIVE & VERIFIED
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-1 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    CARD SERIAL HASH
                  </span>
                  <div className="font-mono font-bold text-slate-900 text-sm">
                    #8841-VH-2026
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Issued by Campus Security Office
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-1 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    SECURITY CIPHER
                  </span>
                  <div className="font-mono font-bold text-emerald-700 text-sm">
                    AES-128 Hardware Handshake
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Turnstiles L-102 through L-110 enabled
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-600 font-medium">
                    Mobile Wallet NFC Pass is linked and synchronized.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleKeyRotation}
                  disabled={isRotatingKeys}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                >
                  <RotateCw
                    className={`w-3.5 h-3.5 ${isRotatingKeys ? "animate-spin" : ""}`}
                  />
                  <span>Rotate Cryptokeys</span>
                </button>
              </div>
            </div>
          )}

          {/* Notifications View */}
          {activeSubTab === "notifications" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-200/80 border border-slate-300/60 flex items-center justify-center text-slate-700">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Academic Alerts & Reminders
                    </h2>
                    <p className="text-xs text-slate-500">Configure portal and push notification parameters</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between shadow-xs">
                  <div>
                    <strong className="block text-slate-900 font-bold text-xs">
                      Upcoming Lecture Ingress Alerts
                    </strong>
                    <span className="text-slate-500 text-[11px]">
                      Notify 45 minutes before turnstile doors unlock
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyLectures}
                    onChange={(e) => setNotifyLectures(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between shadow-xs">
                  <div>
                    <strong className="block text-slate-900 font-bold text-xs">
                      Attendance Grace Warnings
                    </strong>
                    <span className="text-slate-500 text-[11px]">
                      Immediate push message if an unexcused absence is logged
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyAttendanceAlerts}
                    onChange={(e) => setNotifyAttendanceAlerts(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between shadow-xs">
                  <div>
                    <strong className="block text-slate-900 font-bold text-xs">
                      Academic Honors Telemetry Sharing
                    </strong>
                    <span className="text-slate-500 text-[11px]">
                      Allow advisors to view aggregated attendance benchmarks
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowFacultyTelemetry}
                    onChange={(e) => setAllowFacultyTelemetry(e.target.checked)}
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

          {/* Audit & Dispatch View */}
          {activeSubTab === "audit" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-200/80 border border-slate-300/60 flex items-center justify-center text-slate-700">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Student Telemetry & Access Records</h2>
                    <p className="text-xs text-slate-500">Audit logs for campus ingress and cryptographic session keys</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0f172a] text-white font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                  <span>DESFIRE SESSION: STU-EV3-9842</span>
                  <span className="text-emerald-400">● VERIFIED KEY</span>
                </div>
                <p className="text-slate-300">[2026-09-25 08:30:00 EST] Turnstile L-104 ingress scan success. Key rotated.</p>
                <p className="text-slate-300">[2026-09-24 14:15:22 EST] Academic advisee portal handshake verified with Dr. Vance.</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
