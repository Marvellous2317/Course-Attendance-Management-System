import { useState } from "react";
import {
  Building,
  GraduationCap,
  Save,
  Bell,
  Sparkles,
  User,
  Search,
  Lock,
  Mail,
  Phone,
  Globe,
  Camera,
  Trash2,
  Clock,
  Check,
  ShieldCheck,
  Key,
  FileText,
  ChevronDown,
} from "lucide-react";
import { useAdmin } from "../../context/AdminContext";

export const SettingsView = () => {
  const { showToast } = useAdmin();
  const [activeSubTab, setActiveSubTab] = useState("profile");
  const [searchQuery, setSearchQuery] = useState("");

  // Admin Profile state
  const [firstName, setFirstName] = useState("Sarah");
  const [lastName, setLastName] = useState("Jensen");
  const [email] = useState("admin@othello.edu");
  const [office, setOffice] = useState("Hall of Applied Computing, Suite 412");
  const [phone, setPhone] = useState("+1 (555) 019-4820");
  const [timezone, setTimezone] = useState("Eastern Time (US & Canada) UTC-05:00");

  // Institutional Preferences state
  const [institutionName, setInstitutionName] = useState(
    "EduPulse International Academy"
  );
  const [academicYear, setAcademicYear] = useState("2026-2027");
  const [gradingScale, setGradingScale] = useState("4.0");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoInvoicing, setAutoInvoicing] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    showToast("Settings and administrative preferences saved successfully", "success");
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
                ACADEMIC GOVERNANCE • TERM 2025-A
              </span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Secured with TLS 1.3 & Kerberos SSO</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-72 lg:w-80">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search records, audit logs, policies, access keys..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/90 rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs"
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
                onClick={() => showToast("No unread system alerts", "info")}
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
                Settings & System Governance
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                Manage administrative credentials, role-based access policies, authentication standards, and automated audit alert notifications across all faculty and registrar subsystems.
              </p>
            </div>

            {/* Soft & Playful Floating Tab Bar */}
            <div className="bg-slate-100/90 p-1.5 rounded-full border border-slate-200/80 shadow-inner flex items-center gap-1 text-xs font-bold self-start lg:self-auto">
              {[
                { id: "profile", label: "Profile" },
                { id: "academic", label: "Role Access" },
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
                        Administrator Profile
                      </h2>
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-slate-200/80 text-slate-700 uppercase">
                        SEC 8.5-A
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Primary root operator identity registered on Kerberos realm AUTH.OTHELLO.EDU
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
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80"
                      alt="Sarah Jensen"
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center text-slate-950 font-black text-[9px]">
                      ★
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h3 className="text-base font-bold text-slate-950">Sarah Jensen</h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#0f172a] text-white text-[10px] font-bold uppercase tracking-wider">
                        Super Admin
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Systems Administrator • Identity Ref: <span className="font-mono text-slate-700 font-bold">ADM-2021-009</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Assigned to: <span className="text-slate-600 font-medium">Central Infrastructure & Academic Records Board</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => showToast("Select profile image file to upload", "info")}
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
                    Legal First Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium shadow-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 pr-10"
                    />
                    <User className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                    Legal Last Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium shadow-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 pr-10"
                    />
                    <User className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                    Institutional Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
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
                      value={office}
                      onChange={(e) => setOffice(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium shadow-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 pr-10"
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
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium shadow-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 pr-10"
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
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium shadow-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none pr-10 cursor-pointer"
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

          {/* Role Access / Academic Configuration View */}
          {activeSubTab === "academic" && (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-200/80 border border-slate-300/60 flex items-center justify-center text-slate-700">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Institutional Profile & Calendar</h2>
                    <p className="text-xs text-slate-500">Configure institution branding and academic evaluation metrics</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                    Institution Name
                  </label>
                  <input
                    type="text"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium shadow-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                    Academic Term / Calendar
                  </label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium shadow-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-[10px] sm:text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-2">
                  Grading Scale System
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "4.0", title: "Standard 4.0 GPA", desc: "A=4.0, B=3.0, C=2.0" },
                    { id: "percentage", title: "Percentage (0-100%)", desc: "Numeric scoring rubric" },
                    { id: "letters", title: "Letter Grades (A+ to F)", desc: "Standard mark scheme" },
                  ].map((scale) => (
                    <div
                      key={scale.id}
                      onClick={() => setGradingScale(scale.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        gradingScale === scale.id
                          ? "border-indigo-600 bg-white shadow-xs ring-2 ring-indigo-500/20"
                          : "border-slate-200 bg-white/70 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-900 block">{scale.title}</span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">{scale.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200/80">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Save Academic Preferences</span>
                </button>
              </div>
            </form>
          )}

          {/* Authentication & Automation View */}
          {activeSubTab === "notifications" && (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-200/80 border border-slate-300/60 flex items-center justify-center text-slate-700">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Automated System Triggers</h2>
                    <p className="text-xs text-slate-500">Configure policy notifications and dispatch tasks</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Daily Absenteeism Email to Guardians
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Send automated SMS/Email when a student's daily attendance falls below 90%
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Auto-Generate Monthly Tuition Invoices
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Disburse digital billing receipts on the 1st of every academic month
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoInvoicing}
                    onChange={(e) => setAutoInvoicing(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200/80">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Save Trigger Settings</span>
                </button>
              </div>
            </form>
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
                    <h2 className="text-base font-bold text-slate-900">Audit Log & System Telemetry</h2>
                    <p className="text-xs text-slate-500">Review cryptographically signed administrative activity records</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-3 font-mono text-xs">
                <div className="p-3 bg-slate-900 text-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                    <span>LEDGER SESSION: KERBEROS-AUTH-982</span>
                    <span className="text-emerald-400">● LIVE MONITORING</span>
                  </div>
                  <p className="text-slate-300">[2026-09-25 09:22:04 EST] Admin user Sarah Jensen updated global policy TLS 1.3 key distribution.</p>
                  <p className="text-slate-300">[2026-09-25 08:45:12 EST] System dispatch verified 412 active faculty directory tokens.</p>
                  <p className="text-slate-300">[2026-09-25 07:11:59 EST] Automatic attendance rollup initialized for Term 2025-A.</p>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200/80">
                <button
                  type="button"
                  onClick={() => showToast("Exporting audit records to CSV...", "info")}
                  className="px-6 py-2.5 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Download Complete Audit Log</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
