import React, { useState, useEffect } from 'react';
import { 
  Play, Square, CalendarRange, Clock, ShieldAlert, BadgeInfo,
  ChevronRight, CalendarDays, BarChart3, ListCollapse
} from 'lucide-react';
import { Attendance as AttendanceType } from '../types';

interface AttendanceProps {
  attendanceLogs: AttendanceType[];
  onCheckIn: () => Promise<void>;
  onCheckOut: () => Promise<void>;
}

export default function Attendance({
  attendanceLogs,
  onCheckIn,
  onCheckOut
}: AttendanceProps) {
  const [time, setTime] = useState(new Date());
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = attendanceLogs.find(a => a.date === todayStr);

  const formatClock = (d: Date) => {
    return d.toLocaleTimeString('en-IN', { hour12: false });
  };

  const formatDateLong = (d: Date) => {
    return d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleCheckInClick = async () => {
    setError('');
    setSuccess('');
    setCheckingIn(true);
    try {
      await onCheckIn();
      setSuccess('Daily check-in registered successfully. Have a productive day at BHEL!');
    } catch (err: any) {
      setError(err.message || 'Check-in failed.');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOutClick = async () => {
    setError('');
    setSuccess('');
    setCheckingOut(true);
    try {
      await onCheckOut();
      setSuccess('Daily check-out registered successfully. Your shift has concluded.');
    } catch (err: any) {
      setError(err.message || 'Check-out failed.');
    } finally {
      setCheckingOut(false);
    }
  };

  // Summaries
  const presentCount = attendanceLogs.filter(a => a.status === 'Present').length;
  const leaveCount = attendanceLogs.filter(a => a.status === 'Leave').length;
  const averageHours = attendanceLogs.filter(a => a.workHours).reduce((acc, curr) => acc + (curr.workHours || 0), 0) / (attendanceLogs.filter(a => a.workHours).length || 1);

  // June 2026 Holiday Calendar
  const holidayCalendar = [
    { date: '2026-06-05', name: 'Id-ul-Zuha (Bakrid)', type: 'Gazetted Holiday' },
    { date: '2026-07-04', name: 'Muharram', type: 'Gazetted Holiday' },
    { date: '2026-08-15', name: 'Independence Day', type: 'National Holiday' },
    { date: '2026-09-04', name: 'Janmashtami', type: 'Gazetted Holiday' },
    { date: '2026-10-02', name: 'Mahatma Gandhi Birthday', type: 'National Holiday' },
    { date: '2026-10-12', name: 'Dussehra', type: 'Gazetted Holiday' },
    { date: '2026-11-08', name: 'Diwali (Deepavali)', type: 'National Holiday' },
    { date: '2026-12-25', name: 'Christmas Day', type: 'Gazetted Holiday' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Attendance Header / Interactive Check terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Real-time Check In/Out Terminal */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              Shift Operations Portal
            </span>
            <h2 className="font-display text-xl font-bold text-slate-900 mt-3">Attendance Terminal</h2>
            <p className="text-xs text-slate-500 mt-1">Check-in daily to record your operational shift. Shift timers are logged in India Standard Time (IST).</p>
          </div>

          <div className="my-6 flex flex-col sm:flex-row sm:items-center justify-around gap-6 p-5 rounded-xl bg-slate-50 border border-slate-100 shadow-inner">
            <div className="text-center sm:text-left">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Current Server Time</span>
              <span className="text-3xl font-mono font-extrabold text-slate-900 tracking-tight mt-1 block">{formatClock(time)}</span>
              <span className="text-xs text-slate-500 mt-0.5 block font-medium">{formatDateLong(time)}</span>
            </div>

            <div className="flex gap-3 justify-center">
              {/* Check-In Button */}
              <button
                onClick={handleCheckInClick}
                disabled={!!todayRecord || checkingIn}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/10 transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                {checkingIn ? (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <Play className="h-4 w-4 shrink-0" />
                )}
                Check In Shift
              </button>

              {/* Check-Out Button */}
              <button
                onClick={handleCheckOutClick}
                disabled={!todayRecord || !!todayRecord?.checkOut || checkingOut}
                className="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/10 transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                {checkingOut ? (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <Square className="h-3.5 w-3.5 shrink-0" />
                )}
                Check Out Shift
              </button>
            </div>
          </div>

          {/* Feedback alerts */}
          {error && (
            <div className="flex items-center gap-2.5 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg p-3.5 mb-4">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <p className="font-semibold">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg p-3.5 mb-4">
              <BadgeInfo className="h-4 w-4 shrink-0" />
              <p className="font-semibold">{success}</p>
            </div>
          )}

          {!error && !success && todayRecord && (
            <div className="flex flex-col sm:flex-row gap-4 justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-600" />
                <span>Today's Check-In registered at: <strong className="text-slate-800 font-mono font-bold">{todayRecord.checkIn}</strong></span>
              </div>
              {todayRecord.checkOut && (
                <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l sm:pl-4 border-slate-100">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>Today's Check-Out registered at: <strong className="text-slate-800 font-mono font-bold">{todayRecord.checkOut}</strong></span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dynamic Attendance Statistics Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <h3 className="font-display text-sm font-bold text-slate-900 uppercase tracking-wider">Metrics Overview</h3>
          
          <div className="space-y-4 my-6">
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500 font-bold uppercase">Present Days Logged</span>
              <span className="text-lg font-extrabold text-slate-900">{presentCount} Days</span>
            </div>
            
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500 font-bold uppercase">Leave Days Substituted</span>
              <span className="text-lg font-extrabold text-slate-900">{leaveCount} Days</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500 font-bold uppercase">Average Daily Shift</span>
              <span className="text-lg font-extrabold text-slate-900">{averageHours ? averageHours.toFixed(1) : '0.0'} Hours</span>
            </div>
          </div>

          <div className="bg-blue-50/50 border border-blue-100/50 p-4 rounded-xl text-[11px] text-slate-600 leading-relaxed font-medium">
            * Attendance status is automatically fed to the salary payroll calculations monthly. 8 hours of work comprises a standard executive shift.
          </div>
        </div>
      </div>

      {/* Grid of holiday calendar and historical logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Historical Logs Table */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h3 className="font-display text-sm font-bold text-slate-900 uppercase tracking-wider">Historical Attendance Records</h3>
            <span className="text-xs text-slate-500 flex items-center gap-1 font-semibold"><ListCollapse className="h-4 w-4" /> Log archive</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold tracking-wider">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Check-In</th>
                  <th className="py-3 px-3">Check-Out</th>
                  <th className="py-3 px-3 text-right">Work Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {attendanceLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">No attendance history found in database.</td>
                  </tr>
                ) : (
                  attendanceLogs.slice().reverse().map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-900">{record.date}</td>
                      <td className="py-3.5 px-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          record.status === 'Present' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : 'bg-blue-50 text-blue-700 border border-blue-100'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-500">{record.checkIn || '--:--:--'}</td>
                      <td className="py-3.5 px-3 font-mono text-slate-500">{record.checkOut || '--:--:--'}</td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-900 font-extrabold">{record.workHours ? `${record.workHours} hrs` : '--'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gazetted Holiday Calendar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h3 className="font-display text-sm font-bold text-slate-900 uppercase tracking-wider">BHEL 2026 Holiday Calendar</h3>
            <span className="text-xs text-slate-500 flex items-center gap-1 font-semibold"><CalendarDays className="h-4 w-4" /> Gazetted</span>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
            {holidayCalendar.map((holiday, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors flex justify-between items-center shadow-sm">
                <div>
                  <div className="text-xs font-bold text-slate-900">{holiday.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-semibold uppercase">{holiday.type}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-600 border border-blue-100 px-2 py-1 rounded-lg">
                    {new Date(holiday.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
