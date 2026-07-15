import React, { useState, useEffect } from 'react';
import { 
  Bell, Search, User2, Mail, Phone, HeartHandshake, ShieldCheck, 
  HelpCircle, CalendarRange, Lock, X, Edit3, ArrowUpRight, Check, HardHat,
  Menu
} from 'lucide-react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Attendance from './components/Attendance';
import LeaveManager from './components/LeaveManager';
import TaskManager from './components/TaskManager';
import Payroll from './components/Payroll';
import AiAssistant from './components/AiAssistant';
import { 
  AboutBhel, ContactHr, DocumentsPage, SettingsPage, NotificationsPage 
} from './components/StaticPages';
import { Employee, Attendance as AttendanceType, LeaveRequest, Task, SalaryRecord, Notification, ChatMessage, ActivityLog } from './types';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('bhel_jwt_token'));
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Database States
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceType[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Search States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [searching, setSearching] = useState<boolean>(false);

  // Profile Edit Form State
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmergency, setEditEmergency] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Fetch all employee and related transactional data
  const fetchAllData = async (authToken: string) => {
    try {
      const headers = { 'Authorization': `Bearer ${authToken}` };

      // Get Profile
      const profileRes = await fetch('/api/employee/me', { headers });
      if (!profileRes.ok) throw new Error('Session validation failed');
      const profileData = await profileRes.json();
      setEmployee(profileData);
      setEditEmail(profileData.email);
      setEditPhone(profileData.phone);
      setEditEmergency(profileData.emergencyContact);

      // Fetch other logs concurrently
      const [attRes, leavesRes, tasksRes, salaryRes, notifRes, chatRes, logsRes] = await Promise.all([
        fetch('/api/attendance', { headers }),
        fetch('/api/leaves', { headers }),
        fetch('/api/tasks', { headers }),
        fetch('/api/salary', { headers }),
        fetch('/api/notifications', { headers }),
        fetch('/api/chat/history', { headers }),
        fetch('/api/logs', { headers })
      ]);

      if (attRes.ok) setAttendanceLogs(await attRes.json());
      if (leavesRes.ok) setLeaves(await leavesRes.json());
      if (tasksRes.ok) setTasks(await tasksRes.json());
      if (salaryRes.ok) setSalaries(await salaryRes.json());
      if (notifRes.ok) setNotifications(await notifRes.json());
      if (chatRes.ok) setChatHistory(await chatRes.json());
      if (logsRes.ok) setActivityLogs(await logsRes.json());

    } catch (err) {
      console.error('Data retrieval failed', err);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAllData(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  // Handle Login success
  const handleLoginSuccess = (newToken: string, newEmployee: Employee) => {
    localStorage.setItem('bhel_jwt_token', newToken);
    setToken(newToken);
    setEmployee(newEmployee);
    setEditEmail(newEmployee.email);
    setEditPhone(newEmployee.phone);
    setEditEmergency(newEmployee.emergencyContact);
    setActiveTab('dashboard');
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('bhel_jwt_token');
    setToken(null);
    setEmployee(null);
    setAttendanceLogs([]);
    setLeaves([]);
    setTasks([]);
    setSalaries([]);
    setNotifications([]);
    setChatHistory([]);
    setActivityLogs([]);
  };

  // 1. Attendance actions
  const handleCheckIn = async () => {
    if (!token) return;
    const res = await fetch('/api/attendance/check-in', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Check-In failed');
    setAttendanceLogs(prev => [...prev, data]);
    // Refresh activity log
    const logsRes = await fetch('/api/logs', { headers: { 'Authorization': `Bearer ${token}` } });
    if (logsRes.ok) setActivityLogs(await logsRes.json());
  };

  const handleCheckOut = async () => {
    if (!token) return;
    const res = await fetch('/api/attendance/check-out', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Check-Out failed');
    setAttendanceLogs(prev => prev.map(a => a.date === data.date ? data : a));
    // Refresh activity log
    const logsRes = await fetch('/api/logs', { headers: { 'Authorization': `Bearer ${token}` } });
    if (logsRes.ok) setActivityLogs(await logsRes.json());
  };

  // 2. Leave actions
  const handleApplyLeave = async (type: string, startDate: string, endDate: string, reason: string) => {
    if (!token) return;
    const res = await fetch('/api/leaves', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type, startDate, endDate, reason })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit leave');

    setLeaves(prev => [data.request, ...prev]);
    // Update employee leaveBalances in real-time
    if (employee) {
      setEmployee({ ...employee, leaveBalance: data.balance });
    }
    // Refresh notifications and activity log
    const [notifRes, logsRes] = await Promise.all([
      fetch('/api/notifications', { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch('/api/logs', { headers: { 'Authorization': `Bearer ${token}` } })
    ]);
    if (notifRes.ok) setNotifications(await notifRes.json());
    if (logsRes.ok) setActivityLogs(await logsRes.json());
  };

  const handleCancelLeave = async (id: string) => {
    if (!token) return;
    const res = await fetch(`/api/leaves/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to cancel leave request');

    setLeaves(prev => prev.filter(l => l.id !== id));
    if (employee) {
      setEmployee({ ...employee, leaveBalance: data.balance });
    }
    // Refresh activity logs
    const logsRes = await fetch('/api/logs', { headers: { 'Authorization': `Bearer ${token}` } });
    if (logsRes.ok) setActivityLogs(await logsRes.json());
  };

  // 3. Task action
  const handleUpdateTask = async (id: string, status: 'Pending' | 'Completed', progress: number) => {
    if (!token) return;
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status, progress })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update task');

    setTasks(prev => prev.map(t => t.id === id ? data : t));
    // Refresh logs
    const logsRes = await fetch('/api/logs', { headers: { 'Authorization': `Bearer ${token}` } });
    if (logsRes.ok) setActivityLogs(await logsRes.json());
  };

  // 4. Notifications actions
  const handleMarkAllNotificationsRead = async () => {
    if (!token) return;
    const res = await fetch('/api/notifications/read-all', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    if (!token) return;
    const res = await fetch(`/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    }
  };

  // 5. Chat message transmit
  const handleSendMessage = async (message: string) => {
    if (!token) return;
    const res = await fetch('/api/chat/message', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Message transmit failed');

    setChatHistory(prev => [...prev, data.userMsg, data.aiMsg]);
  };

  // 6. Global Search execution
  const executeSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !token) return;

    setSearching(true);
    setShowSearchModal(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSearchResults(await res.json());
      }
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setSearching(false);
    }
  };

  // 7. Profile Update Action
  const handleUpdateProfileDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    setProfileLoading(true);

    try {
      const res = await fetch('/api/employee/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: editEmail,
          phone: editPhone,
          emergencyContact: editEmergency
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile details');

      setEmployee(data);
      setProfileSuccess('Your contact information has been updated and audit logged.');
      
      // Refresh logs
      const logsRes = await fetch('/api/logs', { headers: { 'Authorization': `Bearer ${token}` } });
      if (logsRes.ok) setActivityLogs(await logsRes.json());
    } catch (err: any) {
      setProfileError(err.message || 'Error syncing profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  // Determine unread notifications count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#060a12]">
        <div className="text-center space-y-4">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/b/b8/BHEL_logo.svg" 
            alt="BHEL" 
            className="h-16 w-auto mx-auto"
          />
          <div className="text-sm font-semibold tracking-wider text-slate-400">CONNECTING SECURE ERM PORTAL...</div>
        </div>
      </div>
    );
  }

  // If no auth token, render secure Login panel
  if (!token || !employee) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex">
      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed} 
        employee={employee}
        unreadCount={unreadCount}
        onLogout={handleLogout}
      />

      {/* Main Panel Content Area */}
      <main className={`flex-1 min-h-screen transition-all duration-300 flex flex-col justify-between pl-0 ${
        sidebarCollapsed ? 'sm:pl-16' : 'sm:pl-64'
      }`}>
        
        {/* Top Header Panel */}
        <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-2 sm:gap-4 flex-1">
            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="flex sm:hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white transition-colors"
              title="Toggle Menu"
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Global Search Bar */}
            <form onSubmit={executeSearch} className="max-w-md w-full relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tasks, documents, pay cycles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/60 py-1.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button type="submit" className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 hover:text-white">
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification alert bells */}
            <button 
              onClick={() => setActiveTab('notifications')}
              className="relative h-9 w-9 rounded-lg border border-slate-800 bg-slate-900/50 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse"></span>
              )}
            </button>

            {/* Profile Dropdown shortcut */}
            <div 
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 cursor-pointer border border-slate-850 bg-slate-900/40 py-1 px-2.5 rounded-lg hover:border-slate-800 hover:bg-slate-900 transition-all"
            >
              <div className="h-7 w-7 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-bold font-display">
                {employee.name.split(' ').map(n => n[0]).join('')}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-slate-200">{employee.name.split(' ')[0]}</span>
            </div>
          </div>
        </header>

        {/* Dynamic Mounted Module Tab View */}
        <div className="flex-1 p-4 md:p-6 pb-20">
          
          {/* Main Views routing switch */}
          {activeTab === 'dashboard' && (
            <Dashboard 
              employee={employee} 
              attendance={attendanceLogs} 
              leaves={leaves} 
              tasks={tasks} 
              salaries={salaries} 
              notifications={notifications}
              activityLogs={activityLogs}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'attendance' && (
            <Attendance 
              attendanceLogs={attendanceLogs} 
              onCheckIn={handleCheckIn} 
              onCheckOut={handleCheckOut} 
            />
          )}

          {activeTab === 'leave' && (
            <LeaveManager 
              employee={employee} 
              leaves={leaves} 
              onApplyLeave={handleApplyLeave} 
              onCancelLeave={handleCancelLeave} 
            />
          )}

          {activeTab === 'tasks' && (
            <TaskManager 
              tasks={tasks} 
              onUpdateTask={handleUpdateTask} 
            />
          )}

          {activeTab === 'salary' && (
            <Payroll 
              employee={employee} 
              salaries={salaries} 
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsPage employee={employee} />
          )}

          {activeTab === 'notifications' && (
            <NotificationsPage 
              notifications={notifications} 
              onMarkAllRead={handleMarkAllNotificationsRead} 
              onMarkRead={handleMarkNotificationRead} 
            />
          )}

          {activeTab === 'about' && (
            <AboutBhel />
          )}

          {activeTab === 'contact' && (
            <ContactHr />
          )}

          {activeTab === 'ai-chat' && (
            <AiAssistant 
              chatHistory={chatHistory} 
              onSendMessage={handleSendMessage} 
              isFullscreen={true} 
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage />
          )}

          {/* Full Employee Profile with editable contacts */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md flex flex-col md:flex-row gap-6 items-center">
                <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-2xl text-white shrink-0 border border-blue-500/30">
                  {employee.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold uppercase tracking-wider border border-emerald-500/10 px-2.5 py-1 rounded-full">
                    {employee.status} Staff Record
                  </span>
                  <h2 className="font-display text-xl font-bold text-white mt-3">{employee.name}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{employee.designation} | {employee.department}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Information Specification Column */}
                <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-md space-y-4">
                  <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider mb-2 border-b border-slate-800 pb-2">
                    Personnel Specifications
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-850">
                      <span className="text-slate-500 block uppercase text-[9px] tracking-wider font-bold">Employee ID / Staff Number</span>
                      <strong className="text-white block font-mono mt-0.5">{employee.id}</strong>
                    </div>

                    <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-850">
                      <span className="text-slate-500 block uppercase text-[9px] tracking-wider font-bold">Reporting Manager</span>
                      <strong className="text-white block mt-0.5">{employee.reportingManager}</strong>
                    </div>

                    <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-850">
                      <span className="text-slate-500 block uppercase text-[9px] tracking-wider font-bold">Date of Joining (DOJ)</span>
                      <strong className="text-white block mt-0.5">{employee.dateOfJoining}</strong>
                    </div>

                    <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-850">
                      <span className="text-slate-500 block uppercase text-[9px] tracking-wider font-bold">Performance Appraisal Grade</span>
                      <strong className="text-emerald-400 block mt-0.5 font-bold">Grade A ({employee.performanceRating}/5 Rating)</strong>
                    </div>
                  </div>
                </div>

                {/* Editable Profile details Form */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-md flex flex-col justify-between">
                  <div>
                    <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">Update Personal Info</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Edit secure contact coordinates.</p>
                  </div>

                  <form onSubmit={handleUpdateProfileDetails} className="space-y-4 mt-4">
                    <div>
                      <label className="block text-xs text-slate-400 font-medium">Internal Email Address</label>
                      <input
                        type="email"
                        required
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-950 py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 font-medium">Mobile Number</label>
                      <input
                        type="tel"
                        required
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-950 py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 font-medium">Emergency Contact Contact</label>
                      <input
                        type="text"
                        required
                        value={editEmergency}
                        onChange={(e) => setEditEmergency(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-950 py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    {profileSuccess && (
                      <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400">
                        {profileSuccess}
                      </div>
                    )}
                    {profileError && (
                      <div className="p-2.5 rounded bg-red-500/10 border border-red-500/20 text-[11px] text-red-400">
                        {profileError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="w-full flex justify-center items-center gap-2 rounded bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white py-2 transition disabled:opacity-50"
                    >
                      {profileLoading ? 'Synchronizing...' : 'Save Personnel Changes'}
                    </button>
                  </form>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Global corporate footer */}
        <footer className="py-4 border-t border-slate-800 bg-slate-950 text-slate-500 text-[10px] text-center shrink-0">
          <div className="max-w-7xl mx-auto px-4 flex justify-center items-center">
            <span>© 2026 Bharat Heavy Electricals Limited. All rights reserved. Intranet Core.</span>
          </div>
        </footer>

      </main>

      {/* Permanently Docked AI Assistant floating widget (bottom-right) */}
      {activeTab !== 'ai-chat' && (
        <AiAssistant chatHistory={chatHistory} onSendMessage={handleSendMessage} />
      )}

      {/* Search results popup overlay */}
      {showSearchModal && searchResults && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl max-h-[80vh] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">
                Corporate Global Search Results
              </h3>
              <button 
                onClick={() => {
                  setShowSearchModal(false);
                  setSearchQuery('');
                  setSearchResults(null);
                }}
                className="h-6 w-6 rounded bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
              {searching ? (
                <p className="text-xs text-slate-500 py-6 text-center animate-pulse">Running search queries...</p>
              ) : (
                <>
                  {/* Tasks results */}
                  {searchResults.tasks?.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Matching Assignments</span>
                      {searchResults.tasks.map((t: Task) => (
                        <div key={t.id} onClick={() => { setActiveTab('tasks'); setShowSearchModal(false); }} className="p-2.5 rounded bg-slate-950/60 border border-slate-850 hover:border-slate-800 cursor-pointer flex justify-between items-center">
                          <div>
                            <span className="text-xs font-bold text-white block">{t.title}</span>
                            <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{t.description}</span>
                          </div>
                          <ArrowUpRight className="h-4 w-4 text-slate-500 shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Document results */}
                  {searchResults.documents?.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">Matching Credentials & Policies</span>
                      {searchResults.documents.map((d: any) => (
                        <div key={d.id} onClick={() => { setActiveTab('documents'); setShowSearchModal(false); }} className="p-2.5 rounded bg-slate-950/60 border border-slate-850 hover:border-slate-800 cursor-pointer flex justify-between items-center">
                          <div>
                            <span className="text-xs font-bold text-white block">{d.title}</span>
                            <span className="text-[10px] text-slate-400 mt-0.5">{d.type} document</span>
                          </div>
                          <ArrowUpRight className="h-4 w-4 text-slate-500 shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Notification results */}
                  {searchResults.notifications?.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Matching Notices</span>
                      {searchResults.notifications.map((n: Notification) => (
                        <div key={n.id} onClick={() => { setActiveTab('notifications'); setShowSearchModal(false); }} className="p-2.5 rounded bg-slate-950/60 border border-slate-850 hover:border-slate-800 cursor-pointer flex justify-between items-center">
                          <div>
                            <span className="text-xs font-bold text-white block">{n.title}</span>
                            <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{n.message}</span>
                          </div>
                          <ArrowUpRight className="h-4 w-4 text-slate-500 shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Salary slips results */}
                  {searchResults.salary?.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Matching Payslips</span>
                      {searchResults.salary.map((s: SalaryRecord) => (
                        <div key={s.id} onClick={() => { setActiveTab('salary'); setShowSearchModal(false); }} className="p-2.5 rounded bg-slate-950/60 border border-slate-850 hover:border-slate-800 cursor-pointer flex justify-between items-center">
                          <div>
                            <span className="text-xs font-bold text-white block">Payslip for {s.month} {s.year}</span>
                            <span className="text-[10px] text-slate-400 mt-0.5">Status: {s.status}</span>
                          </div>
                          <ArrowUpRight className="h-4 w-4 text-slate-500 shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}

                  {(!searchResults.tasks?.length && !searchResults.documents?.length && !searchResults.notifications?.length && !searchResults.salary?.length) && (
                    <p className="text-xs text-slate-500 py-12 text-center">No matching corporate logs found. Try refining keywords.</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
