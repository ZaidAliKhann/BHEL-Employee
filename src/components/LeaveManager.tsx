import React, { useState } from 'react';
import { 
  FileSpreadsheet, ShieldAlert, BadgeInfo, CalendarDays, 
  Send, Trash2, HelpCircle, History
} from 'lucide-react';
import { Employee, LeaveRequest } from '../types';

interface LeaveManagerProps {
  employee: Employee;
  leaves: LeaveRequest[];
  onApplyLeave: (type: 'Casual' | 'Sick' | 'Earned', startDate: string, endDate: string, reason: string) => Promise<any>;
  onCancelLeave: (id: string) => Promise<any>;
}

export default function LeaveManager({
  employee,
  leaves,
  onApplyLeave,
  onCancelLeave
}: LeaveManagerProps) {
  const [type, setType] = useState<'Casual' | 'Sick' | 'Earned'>('Casual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return 0;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const requestedDays = calculateDays();

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!startDate || !endDate || !reason) {
      setError('Please provide all required fields.');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError('The End Date cannot be earlier than the Start Date.');
      return;
    }

    const requested = requestedDays;
    const balanceKey = type.toLowerCase() as 'casual' | 'sick' | 'earned';
    const currentBalance = employee.leaveBalance[balanceKey];

    if (currentBalance < requested) {
      setError(`Insufficient leave balance. You are requesting ${requested} days, but only have ${currentBalance} days of ${type} leave remaining.`);
      return;
    }

    setLoading(true);

    try {
      await onApplyLeave(type, startDate, endDate, reason);
      setSuccess(`Your application for ${requested} days of ${type} leave has been submitted successfully to ${employee.reportingManager}.`);
      // Reset
      setStartDate('');
      setEndDate('');
      setReason('');
    } catch (err: any) {
      setError(err.message || 'Connecting to enterprise server failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = async (id: string) => {
    if (!confirm('Are you certain you want to cancel this pending leave request? your leave balance will be fully restored.')) {
      return;
    }
    setError('');
    setSuccess('');
    try {
      await onCancelLeave(id);
      setSuccess('Leave request cancelled and leave balance restored successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to cancel leave request.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Segmented Balances Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Casual Leave */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
          <div className="absolute right-4 top-4 opacity-5">
            <CalendarDays className="h-16 w-16 text-blue-600" />
          </div>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Casual Leave Balance</span>
          <span className="text-3xl font-display font-extrabold text-slate-900 mt-2 block">{employee.leaveBalance.casual} Days</span>
          <p className="text-xs text-slate-500 mt-3 leading-relaxed">Allocated for urgent, unplanned personal commitments.</p>
        </div>

        {/* Sick Leave */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
          <div className="absolute right-4 top-4 opacity-5">
            <CalendarDays className="h-16 w-16 text-emerald-600" />
          </div>
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Sick Leave Balance</span>
          <span className="text-3xl font-display font-extrabold text-slate-900 mt-2 block">{employee.leaveBalance.sick} Days</span>
          <p className="text-xs text-slate-500 mt-3 leading-relaxed">Allocated for medical recovery and health requirements.</p>
        </div>

        {/* Earned Leave */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
          <div className="absolute right-4 top-4 opacity-5">
            <CalendarDays className="h-16 w-16 text-purple-600" />
          </div>
          <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">Earned Leave Balance</span>
          <span className="text-3xl font-display font-extrabold text-slate-900 mt-2 block">{employee.leaveBalance.earned} Days</span>
          <p className="text-xs text-slate-500 mt-3 leading-relaxed">Accrued monthly for planned rest, travel, or vacations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Leave Application Form */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-display text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 mb-4">Apply for Leave</h3>
          </div>

          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider">Leave Classification</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-medium"
              >
                <option value="Casual">Casual Leave ({employee.leaveBalance.casual} days left)</option>
                <option value="Sick">Sick Leave ({employee.leaveBalance.sick} days left)</option>
                <option value="Earned">Earned Leave ({employee.leaveBalance.earned} days left)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider">Start Date</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider">End Date</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            {requestedDays > 0 && (
              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-700 font-extrabold text-center">
                Requested Absence: {requestedDays} {requestedDays === 1 ? 'Day' : 'Days'}
              </div>
            )}

            <div>
              <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider">Operational Justification</label>
              <textarea
                required
                rows={3}
                placeholder="Specify precise reason for leave request..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-medium"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-100 rounded-lg p-3">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="font-semibold">{error}</p>
              </div>
            )}
            {success && (
              <div className="flex items-start gap-2.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                <BadgeInfo className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="font-semibold">{success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white py-2.5 transition duration-150 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shadow-md shadow-blue-600/10 cursor-pointer"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5 shrink-0" />
                  Transmit Leave Application
                </>
              )}
            </button>
          </form>
        </div>

        {/* History of Requests */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="font-display text-sm font-bold text-slate-900 uppercase tracking-wider">Leave Applications Archive</h3>
              <span className="text-xs text-slate-500 flex items-center gap-1 font-semibold"><History className="h-4 w-4" /> Audit history</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold tracking-wider">
                    <th className="py-3 px-2">Type</th>
                    <th className="py-3 px-2">Duration</th>
                    <th className="py-3 px-2">Justification</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {leaves.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">No leave requests logged under this BHEL account.</td>
                    </tr>
                  ) : (
                    leaves.map((request) => {
                      const start = new Date(request.startDate);
                      const end = new Date(request.endDate);
                      const days = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                      return (
                        <tr key={request.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-2">
                            <span className="text-slate-900 font-extrabold">{request.type}</span>
                            <span className="block text-[10px] text-slate-400 mt-0.5">Applied {new Date(request.createdAt).toLocaleDateString()}</span>
                          </td>
                          <td className="py-3.5 px-2">
                            <span className="text-slate-700 font-bold">{days} Days</span>
                            <span className="block text-[10px] text-slate-400 mt-0.5">{request.startDate} to {request.endDate}</span>
                          </td>
                          <td className="py-3.5 px-2 max-w-xs">
                            <p className="truncate text-slate-500 font-normal" title={request.reason}>{request.reason}</p>
                          </td>
                          <td className="py-3.5 px-2">
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-bold ${
                              request.status === 'Approved' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                : request.status === 'Pending'
                                ? 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'
                                : 'bg-rose-50 text-rose-700 border border-rose-100'
                            }`}>
                              {request.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-2 text-right">
                            {request.status === 'Pending' ? (
                              <button
                                onClick={() => handleCancelClick(request.id)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 text-rose-600 hover:text-white hover:bg-rose-600 hover:border-rose-600 transition-all cursor-pointer"
                                title="Cancel Request"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-extrabold font-mono uppercase tracking-widest bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">LOCKED</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 font-medium">
            <HelpCircle className="h-4 w-4 text-slate-400 shrink-0" />
            <p>
              Under BHEL executive regulations, pending leave requests can be instantly cancelled by the employee. Approved leaves must be modified via manual HR coordination.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
