// Types representing database tables/collections
export interface Employee {
  id: string;
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
  leaveBalance: { casual: number; sick: number; earned: number; };
  performanceRating: number;
}

export interface Attendance {
  id: string; employeeId: string; date: string; status: 'Present' | 'Absent' | 'Leave'; checkIn?: string; checkOut?: string; workHours?: number;
}

export interface LeaveRequest {
  id: string; employeeId: string; type: 'Casual' | 'Sick' | 'Earned'; startDate: string; endDate: string; reason: string; status: 'Pending' | 'Approved' | 'Rejected'; createdAt: string;
}

export interface Task {
  id: string; employeeId: string; title: string; description: string; priority: 'Low' | 'Medium' | 'High'; status: 'Pending' | 'Completed'; deadline: string; progress: number; assignedBy: string; createdAt: string;
}

export interface SalaryRecord {
  id: string; employeeId: string; month: string; year: number; baseSalary: number; hra: number; allowances: number; deductions: number; netSalary: number; status: 'Paid' | 'Pending'; paidAt?: string;
}

export interface Notification {
  id: string; employeeId: string; title: string; message: string; type: 'HR' | 'Announcements' | 'Salary' | 'Leave' | 'Tasks' | 'Emergency'; isRead: boolean; createdAt: string;
}

export interface ChatMessage {
  id: string; employeeId: string; message: string; sender: 'user' | 'ai'; createdAt: string;
}

export interface ActivityLog {
  id: string; employeeId: string; action: string; details: string; timestamp: string; device?: string; ip?: string;
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

const LOCAL_STORAGE_KEY = 'bhel_employee_db';

class DatabaseEngine {
  private cache: DbSchema | null = null;

  // Read data from localStorage (Browser friendly)
  async read(): Promise<DbSchema> {
    if (this.cache) return this.cache;
    
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      this.cache = JSON.parse(data);
      return this.cache!;
    }

    // Seed default data if localStorage is empty
    this.seed();
    return this.cache!;
  }

  // Write data to localStorage (Browser friendly)
  async write(data: DbSchema): Promise<void> {
    this.cache = data;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }

  private seed(): void {
    const seedEmployees: Employee[] = [
      {
        id: 'BHEL1001',
        passwordHash: 'no-bcrypt-in-browser', // Simple check for simulation
        name: 'Zaid Ali Khan',
        designation: 'Full Stack Developer',
        department: 'Engineering & IT Department',
        reportingManager: 'Hareesh Sir',
        email: 'zaidgbu247@gmail.com',
        phone: '+91 9026937796',
        emergencyContact: '+91 9000000000 (Father)',
        dateOfJoining: '2024-06-01',
        status: 'Active',
        leaveBalance: { casual: 8, sick: 10, earned: 15 },
        performanceRating: 4.8,
      },
      {
        id: 'BHEL2001',
        passwordHash: 'no-bcrypt-in-browser',
        name: 'Zareen Fatima',
        designation: 'HR General Manager',
        department: 'Human Resources Department',
        reportingManager: 'Hareesh Sir',
        email: 'zareenfatimaa786@gmail.com',
        phone: '+91 9000000000',
        emergencyContact: '+91 9111111111 (Mother)',
        dateOfJoining: '2023-01-15',
        status: 'Active',
        leaveBalance: { casual: 6, sick: 12, earned: 18 },
        performanceRating: 4.9,
      }
    ];

    const schema: DbSchema = {
      employees: seedEmployees,
      attendance: [],
      leaves: [],
      tasks: [],
      salary: [],
      notifications: [],
      chatMessages: [],
      activityLogs: []
    };

    this.cache = schema;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(schema));
  }
}

export const db = new DatabaseEngine();
