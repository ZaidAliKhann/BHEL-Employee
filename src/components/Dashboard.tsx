import React from 'react';
import { 
  Calendar, CheckSquare, Clock, AlertCircle, FileSpreadsheet, 
  ChevronRight, ArrowUpRight, ShieldCheck, HelpCircle, 
  Wallet, FileText, Bell, MessageSquareCode, User
} from 'lucide-react';
import { Employee, Attendance, LeaveRequest, Task, SalaryRecord, Notification, ActivityLog } from '../types';

interface DashboardProps {
  employee: Employee;
  attendance: Attendance[];
  leaves: LeaveRequest[];
  tasks: Task[];
  salaries: SalaryRecord[];
  notifications: Notification[];
  activityLogs: ActivityLog[];
  onNavigate: (tab: string) => void;
}

export default function Dashboard({
  employee,
  attendance,
  leaves,
  tasks,
  salaries,
  notifications,
  activityLogs,
  onNavigate
}: DashboardProps) {

  // Dynamic calculations based on DB
  const presentDays = attendance.filter(a => a.status === 'Present').length;
  const leaveDays = leaves.filter(l => l.status === 'Approved').reduce((acc, curr) => {
    const start = new Date(curr.startDate);
    const end = new Date(curr.endDate);
    const days = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return acc + days;
  }, 0);
  
  const totalTrackedDays = presentDays + leaveDays + 2; // Adding 2 rest days for percentage balance
  const attendanceRate = totalTrackedDays > 0 ? Math.round((presentDays / totalTrackedDays) * 100) : 94;

  const totalTasks = tasks.length;
  const pendingTasksList = tasks.filter(t => t.status === 'Pending');
  const pendingTasksCount = pendingTasksList.length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.find(a => a.date === todayStr);

  const leavesRemaining = employee.leaveBalance.casual + employee.leaveBalance.sick + employee.leaveBalance.earned;

  // Filter global notices & HR announcements
  const announcements = notifications
    .filter(n => n.type === 'Announcements' || n.type === 'HR' || n.type === 'Emergency')
    .slice(0, 3);

  // Quick action menu items for navigation
  const quickActions = [
    { id: 'attendance', label: 'Attendance Terminal', description: 'Log shift, check hours', icon: Clock, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    { id: 'leave', label: 'Leave Manager', description: 'Apply and view balances', icon: Calendar, color: 'text-blue-600 bg-blue-50 border-blue-100' },
    { id: 'tasks', label: 'Assigned Tasks', description: 'Check projects & submit', icon: CheckSquare, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
    { id: 'salary', label: 'Payroll & Salary', description: 'Download corporate payslips', icon: Wallet, color: 'text-amber-600 bg-amber-50 border-amber-100' },
    { id: 'documents', label: 'Document Vault', description: 'NOC, forms, certificates', icon: FileText, color: 'text-purple-600 bg-purple-50 border-purple-100' },
    { id: 'ai-chat', label: 'BHEL AI Assistant', description: 'Ask policies & queries', icon: MessageSquareCode, color: 'text-teal-600 bg-teal-50 border-teal-100' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Welcome Banner Card (Spacious, modern, solid pure white look) */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/10 text-xs font-semibold text-blue-700 border border-blue-600/10">
              <ShieldCheck className="h-3.5 w-3.5" /> BHEL Corporate Network Authorized
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              Good day, {employee.name}
            </h1>
            <p className="text-sm text-slate-600 mt-2 max-w-xl leading-relaxed">
              Welcome to your digital intranet workspace. All corporate human resource databases, task management logs, and engineering compliance metrics are active and up to date.
            </p>
          </div>
          
          {/* Employee Badge Summary */}
          <div className="flex items-center gap-4 shrink-0 rounded-xl bg-white p-4 border border-slate-200/80 shadow-sm">
            <div className="h-12 w-12 rounded-lg bg-blue-600 text-white font-extrabold font-display flex items-center justify-center text-base shadow-sm">
              {employee.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">{employee.designation}</span>
              </div>
              <div className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-0.5">{employee.department}</div>
              <div className="text-[10px] text-blue-600 font-mono font-bold mt-1 uppercase">ID: {employee.id}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Focus Dashboard Layout: Essential Highlights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Attendance Summary & Pending Tasks (2/3 width on desktop) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Summary Metric Cards Group */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Attendance Summary Mini-Card */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Attendance Rate</span>
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-extrabold text-slate-900">{attendanceRate}%</span>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded ml-2">Optimal</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">Month-to-date shift record</p>
            </div>

            {/* Leaves Balance Mini-Card */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Leaves Available</span>
                <Calendar className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-extrabold text-slate-900">{leavesRemaining} Days</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">Casual, Sick, & Earned leaves</p>
            </div>

            {/* Pending Tasks Mini-Card */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Pending Tasks</span>
                <CheckSquare className="h-5 w-5 text-amber-600" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-extrabold text-slate-900">{pendingTasksCount} Active</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">Awaiting action</p>
            </div>

          </div>

          {/* Today's Shift Status Summary */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <h3 className="font-display text-sm font-bold text-slate-950 uppercase tracking-wider">Attendance Shift Status</h3>
                <p className="text-xs text-slate-500 mt-0.5">Quick tracking for today's active enterprise shift</p>
              </div>
              <button 
                onClick={() => onNavigate('attendance')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 transition-colors"
              >
                Go to Terminal <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-50/80 border border-slate-100 p-4 rounded-xl">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Today's Status</span>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${todayAttendance ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  <span className="text-sm font-bold text-slate-900">
                    {todayAttendance ? (todayAttendance.checkOut ? 'Shift Concluded' : 'Checked In / On Duty') : 'Not Checked In Yet'}
                  </span>
                </div>
              </div>

              <div className="flex gap-4 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 font-sans block font-semibold uppercase tracking-wider">Check In</span>
                  <span className="text-sm font-bold text-slate-700 mt-0.5 block">{todayAttendance?.checkIn || '--:--:--'}</span>
                </div>
                <div className="border-l border-slate-200 pl-4">
                  <span className="text-[10px] text-slate-400 font-sans block font-semibold uppercase tracking-wider">Check Out</span>
                  <span className="text-sm font-bold text-slate-700 mt-0.5 block">{todayAttendance?.checkOut || '--:--:--'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Tasks Quick List */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="font-display text-sm font-bold text-slate-950 uppercase tracking-wider">Pending Action Items</h3>
                <p className="text-xs text-slate-500 mt-0.5">Recent engineering and corporate tasks requiring attention</p>
              </div>
              <button 
                onClick={() => onNavigate('tasks')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 transition-colors"
              >
                Manage Tasks <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              {pendingTasksList.length === 0 ? (
                <div className="text-center py-6">
                  <span className="text-xs text-slate-400">🎉 Excellent! No pending tasks at the moment.</span>
                </div>
              ) : (
                pendingTasksList.slice(0, 3).map((task) => (
                  <div 
                    key={task.id} 
                    onClick={() => onNavigate('tasks')}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/30 hover:bg-slate-50 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded border border-slate-300 flex items-center justify-center text-slate-300">
                        <span className="text-[10px]">■</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{task.title}</span>
                        <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Priority: {task.priority} | Due {task.deadline}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                      {task.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Notifications & Quick Operations Shortcuts (1/3 width) */}
        <div className="space-y-8">
          
          {/* Quick Actions Shortcuts Panel */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <h3 className="font-display text-sm font-bold text-slate-950 uppercase tracking-wider border-b border-slate-100 pb-3 mb-4">
              Operations Shortcuts
            </h3>
            
            <div className="grid grid-cols-1 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => onNavigate(action.id)}
                    className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:border-blue-100 bg-white hover:bg-blue-50/30 text-left group transition-all duration-150 shadow-sm hover:shadow"
                  >
                    <div className={`h-10 w-10 shrink-0 rounded-lg flex items-center justify-center border ${action.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors block">
                        {action.label}
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                        {action.description}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Company Announcements Timeline */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="font-display text-sm font-bold text-slate-950 uppercase tracking-wider">Administrative Notices</h3>
              <button 
                onClick={() => onNavigate('notifications')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 transition-colors"
              >
                All <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {announcements.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No active administrative notices today.</p>
              ) : (
                announcements.map((item) => (
                  <div key={item.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100/80 flex gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                      item.type === 'Emergency' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                    }`}>
                      <AlertCircle className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate pr-2">{item.title}</span>
                        <span className="text-[9px] font-mono text-slate-400 whitespace-nowrap shrink-0">
                          {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
