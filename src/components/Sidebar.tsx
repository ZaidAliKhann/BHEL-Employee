import React, { useState } from 'react';
import { 
  LayoutDashboard, CalendarCheck, FileSpreadsheet, CheckSquare, 
  Wallet, FileText, Bell, User2, BookOpen, MessageSquareCode, 
  Settings2, LogOut, PhoneCall, ChevronLeft, ChevronRight, HardHat,
  X
} from 'lucide-react';
import { Employee } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  employee: Employee | null;
  unreadCount: number;
  onLogout: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  employee,
  unreadCount,
  onLogout
}: SidebarProps) {

  // Touch / Swipe Gesture state for mobile dismiss
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    if (isLeftSwipe) {
      setCollapsed(true);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'leave', label: 'Leave Management', icon: FileSpreadsheet },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'salary', label: 'Salary & Payroll', icon: Wallet },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { id: 'profile', label: 'Employee Profile', icon: User2 },
    { id: 'about', label: 'About BHEL', icon: BookOpen },
    { id: 'contact', label: 'Contact HR', icon: PhoneCall },
    { id: 'ai-chat', label: 'AI Support Assistant', icon: MessageSquareCode },
    { id: 'settings', label: 'Settings', icon: Settings2 },
  ];

  return (
    <>
      {/* Backdrop overlay for mobile (dismisses menu on tap) */}
      {!collapsed && (
        <div 
          onClick={() => setCollapsed(true)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm sm:hidden transition-opacity duration-300"
        />
      )}

      <aside 
        id="sidebar"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`fixed top-0 left-0 z-40 h-screen border-r border-slate-800/80 bg-slate-950 transition-all duration-300 flex flex-col justify-between ${
          collapsed 
            ? '-translate-x-full sm:translate-x-0 w-64 sm:w-16' 
            : 'translate-x-0 w-64'
        }`}
      >
        {/* Sidebar Header */}
        <div>
          <div className="flex h-16 items-center justify-between px-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2 overflow-hidden">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/b/b8/BHEL_logo.svg" 
                alt="BHEL Logo" 
                className="h-10 w-10 shrink-0 drop-shadow-[0_0_8px_rgba(59,130,246,0.2)]"
              />
              {!collapsed && (
                <div className="flex flex-col select-none">
                  <span className="font-display text-sm font-bold tracking-tight text-white leading-none">BHEL</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Enterprise Portal</span>
                </div>
              )}
            </div>
            
            {/* Desktop Collapse Button */}
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="hidden sm:flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>

            {/* Mobile Close Button */}
            <button 
              onClick={() => setCollapsed(true)}
              className="flex sm:hidden h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1 px-2 py-4 overflow-y-auto max-h-[calc(100vh-160px)] custom-scrollbar">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'logout') {
                      onLogout();
                      return;
                    }
                    setActiveTab(item.id);
                    if (window.innerWidth < 640) {
                      setCollapsed(true);
                    }
                  }}
                  className={`group flex w-full items-center rounded-lg py-2 px-3 text-sm font-medium transition-all duration-150 relative ${
                    item.id === 'logout'
                      ? 'text-red-400 hover:text-red-300 hover:bg-red-950/25 border border-transparent'
                      : isActive 
                        ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/60 border border-transparent'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <IconComponent className={`h-5 w-5 shrink-0 ${
                    item.id === 'logout'
                      ? 'text-red-400 group-hover:text-red-300'
                      : isActive 
                        ? 'text-blue-400' 
                        : 'text-slate-400 group-hover:text-white'
                  } ${collapsed ? 'sm:mx-auto mr-3 sm:mr-0' : 'mr-3'}`} />
                  
                  {!collapsed && (
                    <span className="truncate select-none">{item.label}</span>
                  )}

                  {/* Notifications badge */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`absolute flex h-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white ${
                      collapsed ? 'top-1 right-2 sm:right-1' : 'right-3'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with profile & logout */}
        <div className="p-2 border-t border-slate-800/80 bg-slate-950/80">
          {employee && !collapsed && (
            <div className="flex items-center gap-3 p-2 mb-2 rounded-lg bg-slate-900/40 border border-slate-900">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 border border-blue-500/30">
                {employee.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate">{employee.name}</span>
                <span className="text-[10px] text-slate-400 truncate">{employee.designation}</span>
                <span className="text-[9px] text-blue-400 font-mono font-bold mt-0.5">{employee.id}</span>
              </div>
            </div>
          )}

          <button
            onClick={onLogout}
            className={`flex w-full items-center rounded-lg py-2 px-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-all ${
              collapsed ? 'sm:justify-center' : ''
            }`}
            title={collapsed ? 'Logout Session' : undefined}
          >
            <LogOut className={`h-5 w-5 shrink-0 ${collapsed ? 'sm:mr-0 mr-3' : 'mr-3'}`} />
            {!collapsed && <span className="select-none font-semibold">Logout Portal</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
