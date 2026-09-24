import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Filter,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { Badge } from '../shared/Badge';
import { StatCard } from '../shared/StatCard';
import { ScrollReveal } from '../shared/ScrollReveal';
import { EmptyState } from '../shared/EmptyState';
export const FinancesView = () => {
  const {
    invoices,
    toggleInvoiceStatus,
    searchQuery,
    setSearchQuery,
    showToast,
  } = useAdmin();
  const [selectedStatus, setSelectedStatus] = useState('All');
  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.amount, 0);
  const totalPaid = invoices
    .filter((i) => i.status === 'Paid')
    .reduce((acc, inv) => acc + inv.amount, 0);
  const totalPending = invoices
    .filter((i) => i.status === 'Pending')
    .reduce((acc, inv) => acc + inv.amount, 0);
  const totalOverdue = invoices
    .filter((i) => i.status === 'Overdue')
    .reduce((acc, inv) => acc + inv.amount, 0);
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.studentId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        selectedStatus === 'All' || inv.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, selectedStatus]);
  return (
    <div className="space-y-6 pb-12">
      {/* Financial Health Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Total Invoiced"
          value={`$${totalInvoiced.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subValue="Current Term"
          icon={<CreditCard className="w-6 h-6" />}
          colorScheme="indigo"
          delay={0.05}
        />
        <StatCard
          title="Collected Revenue"
          value={`$${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subValue={`${Math.round((totalPaid / (totalInvoiced || 1)) * 100)}% settled`}
          icon={<CheckCircle2 className="w-6 h-6" />}
          colorScheme="emerald"
          delay={0.1}
        />
        <StatCard
          title="Pending Collection"
          value={`$${totalPending.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subValue="Due this month"
          icon={<Clock className="w-6 h-6" />}
          colorScheme="amber"
          delay={0.15}
        />
        <StatCard
          title="Overdue Accounts"
          value={`$${totalOverdue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subValue="Urgent follow-up"
          icon={<AlertCircle className="w-6 h-6" />}
          colorScheme="purple"
          delay={0.2}
        />
      </div>

      {/* Filter and Action Bar */}
      <ScrollReveal delay={0.2}>
        <Card className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Status:
              </span>
              {['All', 'Paid', 'Pending', 'Overdue'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${selectedStatus === status ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {status}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              iconLeft={<Download className="w-4 h-4" />}
              onClick={() =>
                showToast('Generated tuition summary PDF', 'success')
              }
            >
              Export Financial Report
            </Button>
          </div>
        </Card>
      </ScrollReveal>

      {/* Invoices Ledger Table */}
      <ScrollReveal delay={0.25}>
        <Card className="overflow-hidden">
          {filteredInvoices.length === 0 ? (
            <EmptyState
              title="No invoices found"
              description="No financial records match the selected status or query."
              actionLabel="Reset Filters"
              onAction={() => {
                setSelectedStatus('All');
                setSearchQuery('');
              }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Invoice #</th>
                    <th className="py-3.5 px-3">Student</th>
                    <th className="py-3.5 px-3">Grade</th>
                    <th className="py-3.5 px-3">Fee Type</th>
                    <th className="py-3.5 px-3">Amount</th>
                    <th className="py-3.5 px-3">Due Date</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredInvoices.map((inv) => (
                    <motion.tr
                      key={inv.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-slate-900 block">
                          {inv.studentName}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {inv.studentId}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">
                        {inv.grade}
                      </td>
                      <td className="py-3.5 px-3 text-slate-700 font-medium">
                        {inv.type}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-slate-900">
                        ${inv.amount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-3 text-slate-500">
                        {inv.dueDate}
                      </td>
                      <td className="py-3.5 px-3">
                        <Badge
                          variant={
                            inv.status === 'Paid'
                              ? 'emerald'
                              : inv.status === 'Pending'
                                ? 'amber'
                                : 'rose'
                          }
                          size="sm"
                          dot
                        >
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="xs"
                          variant={inv.status === 'Paid' ? 'ghost' : 'subtle'}
                          onClick={() => toggleInvoiceStatus(inv.id)}
                        >
                          {inv.status === 'Paid'
                            ? 'Mark Pending'
                            : 'Mark as Paid'}
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </ScrollReveal>
    </div>
  );
};
