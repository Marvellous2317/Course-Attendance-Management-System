import { useState } from 'react';
import { motion } from 'motion/react';
import { Radio, Bell, Save, Smartphone, User, RotateCw } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
export const StudentSettingsPage = () => {
  const { showToast } = useAdmin();
  const [rfidActive, setRfidActive] = useState(true);
  const [notifyLectures, setNotifyLectures] = useState(true);
  const [notifyAttendanceAlerts, setNotifyAttendanceAlerts] = useState(true);
  const [allowFacultyTelemetry, setAllowFacultyTelemetry] = useState(true);
  const [isRotatingKeys, setIsRotatingKeys] = useState(false);
  const handleKeyRotation = () => {
    setIsRotatingKeys(true);
    setTimeout(() => {
      setIsRotatingKeys(false);
      showToast(
        'DESFire EV3 cryptographic session key rotated successfully.',
        'success',
      );
    }, 900);
  };
  const handleSave = (e) => {
    e.preventDefault();
    showToast('Student preferences and RFID configuration saved.', 'success');
  };
  return (
    <div className="space-y-6 max-w-4xl pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-slate-100 text-slate-700">
            STUDENT PREFERENCES & HARDWARE
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
          Settings & Credentials
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your physical RFID credentials, biometric ingress
          configurations, and academic notifications.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Hardware Credentials Card */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary-900 text-secondary-500 flex items-center justify-center">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-950">
                  Campus RFID & Biometric Ingress
                </h3>
                <p className="text-xs text-slate-500">
                  Mifare DESFire EV3 cryptographically signed token
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
              ACTIVE & VERIFIED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
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

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
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

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-600">
                Mobile Wallet NFC Pass is linked and synchronized.
              </span>
            </div>

            <button
              type="button"
              onClick={handleKeyRotation}
              disabled={isRotatingKeys}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RotateCw
                className={`w-3.5 h-3.5 ${isRotatingKeys ? 'animate-spin' : ''}`}
              />
              <span>Rotate Cryptokeys</span>
            </button>
          </div>
        </div>

        {/* 2. Notification Preferences */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-secondary-500 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-950">
                Academic Alerts & Reminders
              </h3>
              <p className="text-xs text-slate-500">
                Choose when the portal notifies you
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
              <div>
                <strong className="block text-slate-900 font-bold">
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
                className="w-4 h-4 accent-secondary-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
              <div>
                <strong className="block text-slate-900 font-bold">
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
                className="w-4 h-4 accent-secondary-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
              <div>
                <strong className="block text-slate-900 font-bold">
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
                className="w-4 h-4 accent-secondary-500 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* 3. Account Profile Details */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-950">
                Student Profile Information
              </h3>
              <p className="text-xs text-slate-500">
                Official registrar matriculation records
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-bold mb-1">
                Legal Name
              </label>
              <input
                type="text"
                disabled
                defaultValue="Julian Vance-Hayes"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-medium cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1">
                Campus Email (SSO)
              </label>
              <input
                type="email"
                disabled
                defaultValue="j.vancehayes@othello.edu"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-medium cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 rounded-2xl bg-secondary-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-secondary-500/20 flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </motion.button>
        </div>
      </form>
    </div>
  );
};
