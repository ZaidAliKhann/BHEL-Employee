import React, { useState } from 'react';
import { 
  CheckCircle2, Hourglass, Calendar, UserPlus, 
  ChevronRight, BadgeAlert, ShieldAlert, BadgeInfo
} from 'lucide-react';
import { Task } from '../types';

interface TaskManagerProps {
  tasks: Task[];
  onUpdateTask: (id: string, status: 'Pending' | 'Completed', progress: number) => Promise<any>;
}

export default function TaskManager({
  tasks,
  onUpdateTask
}: TaskManagerProps) {
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleProgressChange = async (id: string, progress: number) => {
    setSuccess('');
    setError('');
    setUpdatingTaskId(id);
    
    // Status depends on progress
    const status = progress >= 100 ? 'Completed' : 'Pending';

    try {
      await onUpdateTask(id, status, progress);
      setSuccess('Task progress synchronization completed.');
    } catch (err: any) {
      setError('Failed to update task progress.');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const toggleStatus = async (id: string, currentStatus: 'Pending' | 'Completed', currentProgress: number) => {
    setSuccess('');
    setError('');
    setUpdatingTaskId(id);

    const status = currentStatus === 'Pending' ? 'Completed' : 'Pending';
    const progress = status === 'Completed' ? 100 : 0;

    try {
      await onUpdateTask(id, status, progress);
      setSuccess(`Task status toggled to ${status}.`);
    } catch (err: any) {
      setError('Failed to toggle task status.');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // Summaries
  const totalTasks = tasks.length;
  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const pendingCount = totalTasks - completedCount;
  const highPriorityCount = tasks.filter(t => t.priority === 'High' && t.status === 'Pending').length;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Task summaries header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Assigned Work Items</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{totalTasks} Total</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block">Completed Projects</span>
          <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">{completedCount} Tasks</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider block">Active Pending</span>
          <span className="text-2xl font-extrabold text-blue-600 mt-1 block">{pendingCount} Tasks</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-[10px] text-rose-600 font-bold uppercase tracking-wider block">Critical Priorities</span>
          <span className="text-2xl font-extrabold text-rose-600 mt-1 block">{highPriorityCount} Active</span>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-2.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg p-3.5 shadow-sm">
          <BadgeInfo className="h-4 w-4 shrink-0 text-emerald-600" />
          <p className="font-semibold">{success}</p>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-100 rounded-lg p-3.5 shadow-sm">
          <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600" />
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {/* Task card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tasks.length === 0 ? (
          <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400 font-semibold shadow-sm">
            No work assignments found under your BHEL profile.
          </div>
        ) : (
          tasks.map((task) => {
            const isCompleted = task.status === 'Completed';
            const priorityColors = {
              High: 'bg-rose-50 text-rose-700 border-rose-100',
              Medium: 'bg-blue-50 text-blue-700 border-blue-100',
              Low: 'bg-slate-100 text-slate-600 border-slate-200'
            };
            
            return (
              <div 
                key={task.id} 
                className={`rounded-2xl border p-6 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-md ${
                  isCompleted 
                    ? 'border-emerald-200 bg-emerald-50/25' 
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold border tracking-wider uppercase ${priorityColors[task.priority]}`}>
                      {task.priority} Priority
                    </span>
                    <button
                      onClick={() => toggleStatus(task.id, task.status, task.progress)}
                      disabled={updatingTaskId === task.id}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold transition-all cursor-pointer ${
                        isCompleted 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100' 
                          : 'bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${isCompleted ? 'text-emerald-600' : 'text-slate-400'}`} />
                      {isCompleted ? 'Completed' : 'Mark Complete'}
                    </button>
                  </div>

                  <h4 className="font-display text-base font-bold text-slate-900 mt-4 leading-tight">{task.title}</h4>
                  <p className="text-xs text-slate-600 mt-2.5 leading-relaxed font-medium">{task.description}</p>
                </div>

                <div className="mt-6 space-y-4 pt-4 border-t border-slate-100">
                  {/* Slider Progress bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Synchronization Progress</span>
                      <span className="text-slate-900 font-extrabold font-mono">{task.progress}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="10"
                        value={task.progress}
                        disabled={updatingTaskId === task.id}
                        onChange={(e) => handleProgressChange(task.id, Number(e.target.value))}
                        className="w-full h-1.5 rounded-lg bg-slate-100 accent-blue-600 cursor-pointer disabled:opacity-40"
                      />
                    </div>
                  </div>

                  {/* Footer details */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <UserPlus className="h-3.5 w-3.5 text-slate-400" />
                      <span>Assigned By: <strong className="text-slate-700">{task.assignedBy}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>Deadline: <strong className={`${isCompleted ? 'text-slate-500' : 'text-rose-600'}`}>{task.deadline}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
