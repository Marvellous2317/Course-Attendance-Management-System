import { useState } from 'react';
import { motion } from 'motion/react';
import {
  User,
  ShieldCheck,
  Bell,
  Camera,
  Lock,
  Key,
  Download,
  GraduationCap,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
export const TeacherSettingsPage = () => {
  const { showToast } = useAdmin();
  const [activeSubTab, setActiveSubTab] = useState('profile');
  const [displayName, setDisplayName] = useState(
    'Professor Eleanor Vance, Ph.D.',
  );
  const [department, setDepartment] = useState(
    'School of Computing & Cybernetics',
  );
  const [officeSuite, setOfficeSuite] = useState(
    'Alan Turing Engineering Complex (Suite 412)',
  );
  const [bio, setBio] = useState(
    'Eleanor Vance is a Professor of Computer Science at the Othello Institute. Her research centers on large-scale distributed systems, consensus topologies, and transformer acceleration hardware. She directs the Othello Distributed Systems Laboratory.',
  );
  const [notifLectures, setNotifLectures] = useState(true);
  const [notifEnrollments, setNotifEnrollments] = useState(true);
  const [notifAttendance, setNotifAttendance] = useState(true);
  const [notifRegistrar, setNotifRegistrar] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const handleSaveProfile = (e) => {
    e.preventDefault();
    showToast(
      'Academic profile & bio successfully updated and synced to directory',
      'success',
    );
  };
  const handleSaveSecurity = (e) => {
    e.preventDefault();
    if (newPass && newPass !== confirmPass) {
      showToast('New passwords do not match', 'error');
      return;
    }
    showToast(
      'Kerberos credentials and hardware key updated successfully',
      'success',
    );
    setCurrentPass('');
    newPass && setNewPass('');
    confirmPass && setConfirmPass('');
  };
  return (
    <div className="space-y-6 max-w-5xl">
      {/* 1. Header with Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-50 text-amber-900 border border-amber-200/80 mb-2">
            <span className="w-2 h-2 rounded-full bg-secondary-500" />
            <span>DIRECTORY SSO SYNCED</span>
            <span className="text-amber-400">•</span>
            <span>NODE: US-EAST-KERBEROS-04</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
            Faculty Settings & Preferences
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your academic profile, credentials, institutional security
            protocols, and real-time notification dispatch parameters.
          </p>
        </div>
      </div>

      {/* 2. Sub-Tab Navigation */}
      <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl text-xs font-bold gap-1 border border-slate-200/60 max-w-md">
        <button
          type="button"
          onClick={() => setActiveSubTab('profile')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeSubTab === 'profile' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Academic Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('security')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeSubTab === 'security' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Security & 2FA</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('notifications')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeSubTab === 'notifications' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Notifications</span>
        </button>
      </div>

      {/* 3. Tab Content */}
      {activeSubTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-950 pb-3 border-b border-slate-100">
              Academic Credentials & Biography
            </h2>

            {/* Profile Avatar Card */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=180&auto=format&fit=crop&q=80"
                  alt="Dr. Eleanor Vance"
                  className="w-20 h-20 rounded-2xl object-cover ring-2 ring-white shadow-md"
                />
                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      'Select new photograph file to upload (Max 5MB)',
                      'info',
                    )
                  }
                  className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-secondary-500 text-slate-950 shadow-md hover:bg-amber-400 transition-colors cursor-pointer"
                  title="Upload portrait"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1 text-center sm:text-left">
                <span className="text-xs font-bold text-slate-900 block">
                  Official Directory Portrait
                </span>
                <p className="text-[11px] text-slate-500">
                  Approved photo for institutional catalogue, registrar
                  credentials, and syllabus exports.
                </p>
                <div className="pt-2 flex items-center justify-center sm:justify-start gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() =>
                      showToast('Ready to upload new image', 'info')
                    }
                    className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Update Photo
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      showToast('Photo reset to default avatar', 'info')
                    }
                    className="px-3 py-1 rounded-lg text-rose-600 hover:bg-rose-50 font-medium cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>

            {/* Academic Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>TENURED FULL PROFESSOR</span>
              </span>

              <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-secondary-500" />
                <span>4 ACTIVE COURSES (TERM 2025-A)</span>
              </span>

              <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>18 GRADUATE ADVISEES</span>
              </span>
            </div>

            {/* Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Official Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Academic Unit & Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Institutional Email (Primary SSO)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value="e.vance@othello.edu"
                    disabled
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-500 font-mono cursor-not-allowed pr-24"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded text-[9px] font-bold bg-slate-200 text-slate-700">
                    SSO IMMUTABLE
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Campus Office Suite
                </label>
                <input
                  type="text"
                  value={officeSuite}
                  onChange={(e) => setOfficeSuite(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            {/* Biography Textarea */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Curriculum Bio & Research Statement
              </label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Visible to enrolled students, academic advisees, and the Othello
                directory portal.
              </span>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-primary-900 hover:bg-primary-700 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
              >
                Save Profile Changes
              </motion.button>
            </div>
          </div>
        </form>
      )}

      {activeSubTab === 'security' && (
        <form onSubmit={handleSaveSecurity} className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-950 pb-3 border-b border-slate-100">
              Institutional Security & Kerberos Protocols
            </h2>

            {/* 2FA Token Status */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary-500 text-slate-950 flex items-center justify-center font-bold">
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

              <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                ENFORCED
              </span>
            </div>

            {/* Password Reset */}
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Current Kerberos Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Kerberos Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-primary-900 hover:bg-primary-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Update Password & Credentials
              </button>
            </div>
          </div>
        </form>
      )}

      {activeSubTab === 'notifications' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6">
          <h2 className="text-base sm:text-lg font-bold text-slate-950 pb-3 border-b border-slate-100">
            Real-Time Notification Dispatch Channels
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
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
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
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
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
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
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
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
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="button"
              onClick={() =>
                showToast('Notification preferences saved', 'success')
              }
              className="px-5 py-2.5 rounded-xl bg-primary-900 hover:bg-primary-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Save Notification Settings
            </button>
          </div>
        </div>
      )}

      {/* 4. Bottom Audit Footnote (Matching Screen 5) */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-800 shadow-md">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-slate-300 font-mono text-[11px]">
            Othello Directory Sync ID: AUTH-VANCE-2025A-9492 • Node 122B50
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              showToast('Generated security audit log CSV', 'info')
            }
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Audit Log (.CSV)</span>
          </button>

          <button
            type="button"
            onClick={() =>
              showToast(
                'All active web sessions invalidated except this tab',
                'info',
              )
            }
            className="px-3 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-200 text-xs font-medium transition-colors cursor-pointer"
          >
            Revoke Active Web Sessions
          </button>
        </div>
      </div>
    </div>
  );
};
