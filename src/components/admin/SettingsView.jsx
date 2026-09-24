import { useState } from 'react';
import { Building, GraduationCap, Save, Bell, Sparkles } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { Badge } from '../shared/Badge';
import { ScrollReveal } from '../shared/ScrollReveal';
export const SettingsView = () => {
  const { showToast } = useAdmin();
  const [institutionName, setInstitutionName] = useState(
    'EduPulse International Academy',
  );
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [gradingScale, setGradingScale] = useState('4.0');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoInvoicing, setAutoInvoicing] = useState(true);
  const handleSave = (e) => {
    e.preventDefault();
    showToast('Institution settings saved successfully', 'success');
  };
  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Architecture / Future Expansions info banner */}
      <ScrollReveal delay={0.05}>
        <div className="p-5 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 text-indigo-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-indigo-950">
                Modular Architecture Ready for TanStack, Axios & Zustand
              </h4>
              <p className="text-xs text-indigo-800/80 mt-1 leading-relaxed">
                The current file hierarchy is isolated into clear separation of
                concerns (Admin, Shared components, Context state as single
                source of truth). Student and Teacher portal views can be
                mounted directly alongside without refactoring core models.
              </p>
            </div>
          </div>
          <Badge variant="indigo" size="md">
            Phase 1: Admin Portal
          </Badge>
        </div>
      </ScrollReveal>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <ScrollReveal delay={0.1}>
          <Card className="p-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <Building className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">
                Institutional Profile
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Institution Name
                </label>
                <input
                  type="text"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Academic Term / Calendar
                </label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <Card className="p-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">
                Academic & Grading Framework
              </h3>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Grading Scale System
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: '4.0',
                      title: 'Standard 4.0 GPA',
                      desc: 'A=4.0, B=3.0, C=2.0',
                    },
                    {
                      id: 'percentage',
                      title: 'Percentage (0-100%)',
                      desc: 'Numeric scoring rubric',
                    },
                    {
                      id: 'letters',
                      title: 'Letter Grades (A+ to F)',
                      desc: 'Standard alphabetic marks',
                    },
                  ].map((scale) => (
                    <div
                      key={scale.id}
                      onClick={() => setGradingScale(scale.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${gradingScale === scale.id ? 'border-indigo-600 bg-indigo-50/40 shadow-xs' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <span className="text-xs font-bold text-slate-800 block">
                        {scale.title}
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {scale.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <Card className="p-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <Bell className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">
                Automated System Triggers
              </h3>
            </div>

            <div className="mt-4 space-y-3 divide-y divide-slate-100 text-sm">
              <div className="pt-3 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 block">
                    Daily Absenteeism Email to Guardians
                  </span>
                  <span className="text-xs text-slate-400">
                    Send automated SMS/Email when a student's daily attendance
                    is below 90%
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              <div className="pt-3 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 block">
                    Auto-Generate Monthly Tuition Invoices
                  </span>
                  <span className="text-xs text-slate-400">
                    Disburse digital billing receipts on the 1st of every
                    academic month
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
          </Card>
        </ScrollReveal>

        <div className="flex justify-end">
          <Button
            type="submit"
            size="md"
            variant="primary"
            iconLeft={<Save className="w-4 h-4" />}
          >
            Save All Preferences
          </Button>
        </div>
      </form>
    </div>
  );
};
