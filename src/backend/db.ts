import mongoose, { Schema } from 'mongoose';

// --- Employee Schema ---
const EmployeeSchema = new Schema({
  id: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: String,
  designation: String,
  department: String,
  reportingManager: String,
  email: String,
  phone: String,
  emergencyContact: String,
  dateOfJoining: String,
  status: { type: String, default: 'Active' },
  leaveBalance: { casual: Number, sick: Number, earned: Number },
  performanceRating: Number
});

// --- Attendance Schema ---
const AttendanceSchema = new Schema({
  employeeId: String,
  date: String,
  status: String,
  checkIn: String,
  checkOut: String,
  workHours: Number
});

// --- Leave Schema ---
const LeaveSchema = new Schema({
  employeeId: String,
  type: String,
  startDate: String,
  endDate: String,
  reason: String,
  status: String,
  createdAt: String
});

// --- Task Schema ---
const TaskSchema = new Schema({
  employeeId: String,
  title: String,
  description: String,
  priority: String,
  status: String,
  deadline: String,
  progress: Number,
  assignedBy: String,
  createdAt: String
});

// --- Salary Schema ---
const SalarySchema = new Schema({
  employeeId: String,
  month: String,
  year: Number,
  baseSalary: Number,
  hra: Number,
  allowances: Number,
  deductions: Number,
  netSalary: Number,
  status: String,
  paidAt: String
});

// --- Notification Schema ---
const NotificationSchema = new Schema({
  employeeId: String,
  title: String,
  message: String,
  type: String,
  isRead: Boolean,
  createdAt: String
});

// --- Chat Message Schema ---
const ChatMessageSchema = new Schema({
  employeeId: String,
  message: String,
  sender: String,
  createdAt: String
});

// --- Activity Log Schema ---
const ActivityLogSchema = new Schema({
  employeeId: String,
  action: String,
  details: String,
  timestamp: String,
  device: String,
  ip: String
});

// Exporting Models
export const EmployeeModel = mongoose.model('Employee', EmployeeSchema);
export const AttendanceModel = mongoose.model('Attendance', AttendanceSchema);
export const LeaveModel = mongoose.model('Leave', LeaveSchema);
export const TaskModel = mongoose.model('Task', TaskSchema);
export const SalaryModel = mongoose.model('Salary', SalarySchema);
export const NotificationModel = mongoose.model('Notification', NotificationSchema);
export const ChatMessageModel = mongoose.model('ChatMessage', ChatMessageSchema);
export const ActivityLogModel = mongoose.model('ActivityLog', ActivityLogSchema);
