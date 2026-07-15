import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';

// Types representing database tables/collections
export interface Employee {
  id: string; // Employee ID like BHEL1001
  passwordHash: string;
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
  date: string; // YYYY-MM-DD
  status: 'Present' | 'Absent' | 'Leave';
  checkIn?: string; // HH:MM:SS
  checkOut?: string; // HH:MM:SS
  workHours?: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: 'Casual' | 'Sick' | 'Earned';
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
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
  deadline: string; // YYYY-MM-DD
  progress: number; // 0 to 100
  assignedBy: string;
  createdAt: string;
}

export interface SalaryRecord {
  id: string;
  employeeId: string;
  month: string; // Month name e.g. "June"
  year: number; // e.g. 2026
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
  employeeId: string; // "all" or specific Employee ID
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

export interface DbSchema {
  employees: Employee[];
  attendance: Attendance[];
  leaves: LeaveRequest[];
  tasks: Task[];
  salary: SalaryRecord[];
  notifications: Notification[];
  chatMessages: ChatMessage[];
  activityLogs: ActivityLog[];
}

const DB_FILE_PATH = path.resolve('data/db.json');

class DatabaseEngine {
  private cache: DbSchema | null = null;
  private isInitializing = false;

  constructor() {}

  // Safe read with cached schema
  async read(): Promise<DbSchema> {
    if (this.cache) {
      return this.cache;
    }
    try {
      await fs.mkdir(path.dirname(DB_FILE_PATH), { recursive: true });
      const data = await fs.readFile(DB_FILE_PATH, 'utf-8');
      this.cache = JSON.parse(data);
      return this.cache!;
    } catch (error) {
      // If file doesn't exist or is invalid, seed database
      await this.seed();
      return this.cache!;
    }
  }

  // Safe atomic write to database file
  async write(data: DbSchema): Promise<void> {
    this.cache = data;
    const tempPath = `${DB_FILE_PATH}.tmp`;
    await fs.mkdir(path.dirname(DB_FILE_PATH), { recursive: true });
    await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    await fs.rename(tempPath, DB_FILE_PATH);
  }

  private async seed(): Promise<void> {
    if (this.isInitializing) return;
    this.isInitializing = true;

    // Create default seed data with bhel developer Zaid Ali Khan
    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('Password@123', salt);

    const seedEmployees: Employee[] = [
      {
        id: 'BHEL1001',
        passwordHash: defaultPasswordHash,
        name: 'Zaid Ali Khan',
        designation: 'Full Stack Developer',
        department: 'Engineering & IT Department',
        reportingManager: 'Hareesh Sir',
        email: 'zaidgbu247@gmail.com',
        phone: '+91 9026937796',
        emergencyContact: '+91 9000000000 (Father)',
        dateOfJoining: '2024-06-01',
        status: 'Active',
        leaveBalance: {
          casual: 8,
          sick: 10,
          earned: 15,
        },
        performanceRating: 4.8,
      },
      {
        id: 'BHEL2001',
        passwordHash: defaultPasswordHash,
        name: 'Zareen Fatima',
        designation: 'HR General Manager',
        department: 'Human Resources Department',
        reportingManager: 'Hareesh Sir',
        email: 'zareenfatimaa786@gmail.com',
        phone: '+91 9000000000',
        emergencyContact: '+91 9111111111 (Mother)',
        dateOfJoining: '2023-01-15',
        status: 'Active',
        leaveBalance: {
          casual: 6,
          sick: 12,
          earned: 18,
        },
        performanceRating: 4.9,
      }
    ];

    // Seed 10 days of attendance for June 2026 for testing
    const seedAttendance: Attendance[] = [];
    const dates = [
      '2026-06-01', '2026-06-02', '2026-06-03', '2026-06-04', '2026-06-05',
      '2026-06-08', '2026-06-09', '2026-06-10', '2026-06-11', '2026-06-12'
    ];
    dates.forEach((d, idx) => {
      seedAttendance.push({
        id: `att-1001-${idx}`,
        employeeId: 'BHEL1001',
        date: d,
        status: 'Present',
        checkIn: '09:02:15',
        checkOut: '17:35:40',
        workHours: 8.5
      });
      seedAttendance.push({
        id: `att-2001-${idx}`,
        employeeId: 'BHEL2001',
        date: d,
        status: 'Present',
        checkIn: '08:58:30',
        checkOut: '17:05:12',
        workHours: 8.1
      });
    });

    const seedLeaves: LeaveRequest[] = [
      {
        id: 'lv-1001-1',
        employeeId: 'BHEL1001',
        type: 'Casual',
        startDate: '2026-06-15',
        endDate: '2026-06-16',
        reason: 'Family gathering in Lucknow',
        status: 'Approved',
        createdAt: '2026-06-10T10:15:00.000Z'
      },
      {
        id: 'lv-1001-2',
        employeeId: 'BHEL1001',
        type: 'Sick',
        startDate: '2026-07-01',
        endDate: '2026-07-02',
        reason: 'Viral Fever and Rest',
        status: 'Approved',
        createdAt: '2026-06-30T16:45:00.000Z'
      },
      {
        id: 'lv-2001-1',
        employeeId: 'BHEL2001',
        type: 'Earned',
        startDate: '2026-07-20',
        endDate: '2026-07-24',
        reason: 'Summer vacation trip',
        status: 'Pending',
        createdAt: '2026-07-05T11:00:00.000Z'
      }
    ];

    const seedTasks: Task[] = [
      {
        id: 'tsk-1001-1',
        employeeId: 'BHEL1001',
        title: 'Optimize Core Turbines Dashboard',
        description: 'Update the electrical production SCADA visualizer components with high efficiency SVG renders and Recharts charts.',
        priority: 'High',
        status: 'Pending',
        deadline: '2026-07-15',
        progress: 60,
        assignedBy: 'Hareesh Sir',
        createdAt: '2026-07-01T09:30:00.000Z'
      },
      {
        id: 'tsk-1001-2',
        employeeId: 'BHEL1001',
        title: 'Integrate Gemini Helpdesk Agent',
        description: 'Embed Google Gemini API model connection server-side to resolve employee queries on HR policies and office navigation.',
        priority: 'Medium',
        status: 'Completed',
        deadline: '2026-07-10',
        progress: 100,
        assignedBy: 'Hareesh Sir',
        createdAt: '2026-07-02T10:00:00.000Z'
      },
      {
        id: 'tsk-1001-3',
        employeeId: 'BHEL1001',
        title: 'Review Cybersecurity Logs',
        description: 'Audit the login IPs, JWT session expirations and database write operations to secure against credential-stuffing.',
        priority: 'Low',
        status: 'Pending',
        deadline: '2026-07-25',
        progress: 10,
        assignedBy: 'System Administrator',
        createdAt: '2026-07-08T08:00:00.000Z'
      },
      {
        id: 'tsk-2001-1',
        employeeId: 'BHEL2001',
        title: 'Conduct Performance Appraisals Q2',
        description: 'Complete quarterly performance scorecards for engineering leads in BHEL Haridwar & Bhopal manufacturing units.',
        priority: 'High',
        status: 'Pending',
        deadline: '2026-07-20',
        progress: 40,
        assignedBy: 'Director (HR)',
        createdAt: '2026-07-01T09:00:00.000Z'
      }
    ];

    const seedSalary: SalaryRecord[] = [
      {
        id: 'sal-1001-1',
        employeeId: 'BHEL1001',
        month: 'June',
        year: 2026,
        baseSalary: 75000,
        hra: 25000,
        allowances: 25000,
        deductions: 8500,
        netSalary: 116500,
        status: 'Paid',
        paidAt: '2026-06-30T18:00:00.000Z'
      },
      {
        id: 'sal-1001-2',
        employeeId: 'BHEL1001',
        month: 'May',
        year: 2026,
        baseSalary: 75000,
        hra: 25000,
        allowances: 25000,
        deductions: 8500,
        netSalary: 116500,
        status: 'Paid',
        paidAt: '2026-05-31T18:00:00.000Z'
      },
      {
        id: 'sal-2001-1',
        employeeId: 'BHEL2001',
        month: 'June',
        year: 2026,
        baseSalary: 95000,
        hra: 35000,
        allowances: 30000,
        deductions: 11000,
        netSalary: 149000,
        status: 'Paid',
        paidAt: '2026-06-30T18:00:00.000Z'
      }
    ];

    const seedNotifications: Notification[] = [
      {
        id: 'notif-global-1',
        employeeId: 'all',
        title: 'BHEL Annual General Meeting (AGM) Scheduled',
        message: 'The BHEL Board of Directors is pleased to announce that the 62nd Annual General Meeting will take place virtually on 28th July 2026. All executive members are requested to attend.',
        type: 'Announcements',
        isRead: false,
        createdAt: '2026-07-10T10:00:00.000Z'
      },
      {
        id: 'notif-global-2',
        employeeId: 'all',
        title: 'Cybersecurity Compliance Directive',
        message: 'Please update your enterprise credentials. BHEL IT policy mandates dual-factor verification and password refreshes every 90 days.',
        type: 'HR',
        isRead: false,
        createdAt: '2026-07-09T09:15:00.000Z'
      },
      {
        id: 'notif-1001-1',
        employeeId: 'BHEL1001',
        title: 'Salary Disbursal Complete',
        message: 'Your salary for the month of June 2026 has been credited. You can access and download your detailed payslip under the Salary and Payroll menu.',
        type: 'Salary',
        isRead: false,
        createdAt: '2026-06-30T18:15:00.000Z'
      },
      {
        id: 'notif-1001-2',
        employeeId: 'BHEL1001',
        title: 'New Task Assigned',
        message: 'Hareesh Sir has assigned a new task: "Optimize Core Turbines Dashboard". Please review the specifications and set milestones.',
        type: 'Tasks',
        isRead: false,
        createdAt: '2026-07-01T09:35:00.000Z'
      }
    ];

    const seedChat: ChatMessage[] = [
      {
        id: 'msg-1',
        employeeId: 'BHEL1001',
        message: 'Hello, I need help understanding my leave balance.',
        sender: 'user',
        createdAt: '2026-07-10T14:20:00.000Z'
      },
      {
        id: 'msg-2',
        employeeId: 'BHEL1001',
        message: 'Welcome Zaid! According to the BHEL Employee database, you currently have 8 Casual Leaves, 10 Sick Leaves, and 15 Earned Leaves remaining. You can apply for leave directly from the Leave Management section.',
        sender: 'ai',
        createdAt: '2026-07-10T14:20:05.000Z'
      }
    ];

    const seedLogs: ActivityLog[] = [
      {
        id: 'log-1',
        employeeId: 'BHEL1001',
        action: 'System Seeded',
        details: 'Initial corporate database successfully provisioned and secured with bcrypt.',
        timestamp: new Date().toISOString()
      }
    ];

    const schema: DbSchema = {
      employees: seedEmployees,
      attendance: seedAttendance,
      leaves: seedLeaves,
      tasks: seedTasks,
      salary: seedSalary,
      notifications: seedNotifications,
      chatMessages: seedChat,
      activityLogs: seedLogs
    };

    await this.write(schema);
    this.isInitializing = false;
  }
}

export const db = new DatabaseEngine();
