export interface Employee {
  id: string;
  name: string;
  designation: string;
  department: string;
  reportingManager: string;
  email: string;
  phone: string;
  emergencyContact: string;
  dateOfJoining: string;
  status: 'Active' | 'On Leave' | 'Suspended';
  profilePhotoUrl?: string;
  leaveBalance: {
    casual: number;
    sick: number;
    earned: number;
  };
  performanceRating: number;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Leave';
  checkIn?: string;
  checkOut?: string;
  workHours?: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: 'Casual' | 'Sick' | 'Earned';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

export interface Task {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'Completed';
  deadline: string;
  progress: number;
  assignedBy: string;
  createdAt: string;
}

export interface SalaryRecord {
  id: string;
  employeeId: string;
  month: string;
  year: number;
  baseSalary: number;
  hra: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'Paid' | 'Pending';
  paidAt?: string;
}

export interface Notification {
  id: string;
  employeeId: string;
  title: string;
  message: string;
  type: 'HR' | 'Announcements' | 'Salary' | 'Leave' | 'Tasks' | 'Emergency';
  isRead: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  employeeId: string;
  message: string;
  sender: 'user' | 'ai';
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  employeeId: string;
  action: string;
  details: string;
  timestamp: string;
  device?: string;
  ip?: string;
}
