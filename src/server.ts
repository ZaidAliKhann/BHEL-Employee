import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { db, Employee, Attendance, LeaveRequest, Task, SalaryRecord, Notification, ChatMessage, ActivityLog } from './backend/db';

dotenv.config();

// Initialize Gemini Client with correct User-Agent for telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const JWT_SECRET = process.env.JWT_SECRET || 'bhel_enterprise_secure_token_secret_2026';

const app = express();
app.use(express.json());

// Extend Express Request type to include user information
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
  };
}

// Authentication Middleware
function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Authentication token is required.' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      res.status(403).json({ error: 'Invalid or expired token.' });
      return;
    }
    req.user = {
      id: decoded.id,
      name: decoded.name,
    };
    next();
  });
}

// Helper to record activity logs
async function logActivity(employeeId: string, action: string, details: string, req: Request) {
  try {
    const data = await db.read();
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      employeeId,
      action,
      details,
      timestamp: new Date().toISOString(),
      device: req.headers['user-agent'] || 'Unknown Device',
      ip: req.ip || req.headers['x-forwarded-for'] as string || '127.0.0.1'
    };
    data.activityLogs.unshift(newLog);
    await db.write(data);
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

// Helper to check if checkIn/CheckOut has already happened today
function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const date = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
}

/* ==================== API ENDPOINTS ==================== */

// 1. Secure Login
app.post('/api/auth/login', async (req, res) => {
  const { employeeId, password } = req.body;

  if (!employeeId || !password) {
    res.status(400).json({ error: 'Employee ID and password are required.' });
    return;
  }

  try {
    const data = await db.read();
    const employee = data.employees.find(e => e.id.toUpperCase() === employeeId.toUpperCase());

    if (!employee) {
      res.status(401).json({ error: 'Invalid Employee ID or Password.' });
      return;
    }

    if (employee.status !== 'Active') {
      res.status(403).json({ error: 'This BHEL account is currently suspended or inactive.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, employee.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid Employee ID or Password.' });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: employee.id, name: employee.name },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Record login activity
    await logActivity(employee.id, 'User Login', 'Successfully logged in to BHEL Employee Portal.', req);

    // Return profile (omit password hash)
    const { passwordHash, ...profile } = employee;
    res.json({ token, employee: profile });
  } catch (error: any) {
    res.status(500).json({ error: 'Server error during authentication.', details: error.message });
  }
});

// 1b. Register new Employee (Create Account)
app.post('/api/auth/register', async (req, res) => {
  const { employeeId, name, password, email, phone, designation, department } = req.body;

  if (!employeeId || !name || !password || !email || !phone) {
    res.status(400).json({ error: 'Employee ID, Name, Password, Email, and Phone number are required.' });
    return;
  }

  // Basic format validation
  if (!employeeId.toUpperCase().startsWith('BHEL')) {
    res.status(400).json({ error: 'Employee ID must begin with BHEL (e.g. BHEL1002).' });
    return;
  }

  try {
    const data = await db.read();
    
    // Check if ID already exists (case-insensitive)
    const exists = data.employees.some(e => e.id.toUpperCase() === employeeId.toUpperCase());
    if (exists) {
      res.status(400).json({ error: 'An account with this Employee ID already exists.' });
      return;
    }

    // Check if Email already exists
    const emailExists = data.employees.some(e => e.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      res.status(400).json({ error: 'An account with this Email Address already exists.' });
      return;
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create Employee record
    const newEmployee: Employee = {
      id: employeeId.toUpperCase(),
      passwordHash,
      name,
      designation: designation || 'Executive Trainee',
      department: department || 'Engineering Department',
      reportingManager: 'R. K. Srivastava (Executive Director)',
      email,
      phone,
      emergencyContact: '+91 9000000000 (Primary)',
      dateOfJoining: new Date().toISOString().split('T')[0],
      status: 'Active',
      leaveBalance: {
        casual: 8,
        sick: 10,
        earned: 15,
      },
      performanceRating: 5.0,
    };

    data.employees.push(newEmployee);
    
    // Seed initial notifications for this specific new user
    const welcomeNotif: Notification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      employeeId: newEmployee.id,
      title: 'Welcome to BHEL ERM Portal',
      message: `Dear ${name}, your corporate employee account has been created successfully. Welcome to Bharat Heavy Electricals Limited.`,
      type: 'Announcements',
      isRead: false,
      createdAt: new Date().toISOString()
    };
    data.notifications.push(welcomeNotif);
    
    await db.write(data);
    await logActivity(newEmployee.id, 'Account Creation', 'New employee account registered in the BHEL Portal.', req);

    res.status(201).json({ success: true, message: 'Account registered successfully. You can now login.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Server error during registration.', details: error.message });
  }
});

// 2. Get Employee Profile
app.get('/api/employee/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const data = await db.read();
    const employee = data.employees.find(e => e.id === req.user?.id);

    if (!employee) {
      res.status(404).json({ error: 'Employee not found.' });
      return;
    }

    const { passwordHash, ...profile } = employee;
    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch profile.', details: error.message });
  }
});

// 3. Update Employee Profile
app.put('/api/employee/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
  const { email, phone, emergencyContact } = req.body;

  try {
    const data = await db.read();
    const index = data.employees.findIndex(e => e.id === req.user?.id);

    if (index === -1) {
      res.status(404).json({ error: 'Employee not found.' });
      return;
    }

    // Update permissible fields
    if (email) data.employees[index].email = email;
    if (phone) data.employees[index].phone = phone;
    if (emergencyContact) data.employees[index].emergencyContact = emergencyContact;

    await db.write(data);
    await logActivity(req.user!.id, 'Profile Update', `Updated contact details: Email/Phone/Emergency.`, req);

    const { passwordHash, ...profile } = data.employees[index];
    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update profile.', details: error.message });
  }
});

// 4. Get Attendance Records
app.get('/api/attendance', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const data = await db.read();
    const records = data.attendance.filter(a => a.employeeId === req.user?.id);
    res.json(records);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch attendance.', details: error.message });
  }
});

// 5. Daily Attendance Check-In
app.post('/api/attendance/check-in', authenticateToken, async (req: AuthenticatedRequest, res) => {
  const today = getTodayString();
  const now = new Date();
  const checkInTime = now.toTimeString().split(' ')[0]; // HH:MM:SS

  try {
    const data = await db.read();
    const existing = data.attendance.find(a => a.employeeId === req.user?.id && a.date === today);

    if (existing) {
      res.status(400).json({ error: 'You have already checked in for today.' });
      return;
    }

    const newRecord: Attendance = {
      id: `att-${req.user!.id}-${Date.now()}`,
      employeeId: req.user!.id,
      date: today,
      status: 'Present',
      checkIn: checkInTime,
    };

    data.attendance.push(newRecord);
    await db.write(data);
    await logActivity(req.user!.id, 'Check-In', `Marked attendance check-in at ${checkInTime}.`, req);

    res.json(newRecord);
  } catch (error: any) {
    res.status(500).json({ error: 'Check-In failed.', details: error.message });
  }
});

// 6. Daily Attendance Check-Out
app.post('/api/attendance/check-out', authenticateToken, async (req: AuthenticatedRequest, res) => {
  const today = getTodayString();
  const now = new Date();
  const checkOutTime = now.toTimeString().split(' ')[0]; // HH:MM:SS

  try {
    const data = await db.read();
    const record = data.attendance.find(a => a.employeeId === req.user?.id && a.date === today);

    if (!record) {
      res.status(400).json({ error: 'No active check-in found for today. Please check in first.' });
      return;
    }

    if (record.checkOut) {
      res.status(400).json({ error: 'You have already checked out for today.' });
      return;
    }

    record.checkOut = checkOutTime;

    // Calculate work hours
    if (record.checkIn) {
      const [inH, inM, inS] = record.checkIn.split(':').map(Number);
      const [outH, outM, outS] = checkOutTime.split(':').map(Number);
      const inDate = new Date(2000, 0, 1, inH, inM, inS);
      const outDate = new Date(2000, 0, 1, outH, outM, outS);
      const diffMs = outDate.getTime() - inDate.getTime();
      record.workHours = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10; // Rounded to 1 decimal place
    } else {
      record.workHours = 8.0;
    }

    await db.write(data);
    await logActivity(req.user!.id, 'Check-Out', `Marked attendance check-out at ${checkOutTime}. Work Hours: ${record.workHours}.`, req);

    res.json(record);
  } catch (error: any) {
    res.status(500).json({ error: 'Check-Out failed.', details: error.message });
  }
});

// 7. Get Leaves Summary & Requests
app.get('/api/leaves', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const data = await db.read();
    const requests = data.leaves.filter(l => l.employeeId === req.user?.id);
    res.json(requests);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch leaves.', details: error.message });
  }
});

// 8. Apply for Leave
app.post('/api/leaves', authenticateToken, async (req: AuthenticatedRequest, res) => {
  const { type, startDate, endDate, reason } = req.body;

  if (!type || !startDate || !endDate || !reason) {
    res.status(400).json({ error: 'Leave type, start date, end date, and reason are required.' });
    return;
  }

  try {
    const data = await db.read();
    const employee = data.employees.find(e => e.id === req.user?.id);

    if (!employee) {
      res.status(404).json({ error: 'Employee not found.' });
      return;
    }

    // Calculate duration in days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check Leave Balance
    const balanceKey = type.toLowerCase() as 'casual' | 'sick' | 'earned';
    const currentBalance = employee.leaveBalance[balanceKey];

    if (currentBalance < diffDays) {
      res.status(400).json({ error: `Insufficient leave balance. You requested ${diffDays} days, but only have ${currentBalance} days of ${type} leave remaining.` });
      return;
    }

    const newRequest: LeaveRequest = {
      id: `lv-${req.user!.id}-${Date.now()}`,
      employeeId: req.user!.id,
      type,
      startDate,
      endDate,
      reason,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    // Update Employee balance immediately to hold
    employee.leaveBalance[balanceKey] -= diffDays;

    data.leaves.unshift(newRequest);
    await db.write(data);
    await logActivity(req.user!.id, 'Leave Applied', `Applied for ${diffDays} days of ${type} leave starting from ${startDate}.`, req);

    // Create a system notification about leave submission
    const newNotification: Notification = {
      id: `notif-${req.user!.id}-${Date.now()}`,
      employeeId: req.user!.id,
      title: 'Leave Application Submitted',
      message: `Your leave request for ${diffDays} days of ${type} leave from ${startDate} to ${endDate} is submitted and is pending approval from ${employee.reportingManager}.`,
      type: 'Leave',
      isRead: false,
      createdAt: new Date().toISOString()
    };
    data.notifications.unshift(newNotification);
    await db.write(data);

    res.json({ request: newRequest, balance: employee.leaveBalance });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to submit leave.', details: error.message });
  }
});

// 9. Cancel Leave Request (only if pending)
app.delete('/api/leaves/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  try {
    const data = await db.read();
    const requestIndex = data.leaves.findIndex(l => l.id === id && l.employeeId === req.user?.id);

    if (requestIndex === -1) {
      res.status(404).json({ error: 'Leave request not found.' });
      return;
    }

    const request = data.leaves[requestIndex];

    if (request.status !== 'Pending') {
      res.status(400).json({ error: `You can only cancel leave requests that are still Pending. Current status: ${request.status}` });
      return;
    }

    // Refund Leave Balance
    const employee = data.employees.find(e => e.id === req.user?.id);
    if (employee) {
      const start = new Date(request.startDate);
      const end = new Date(request.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      const balanceKey = request.type.toLowerCase() as 'casual' | 'sick' | 'earned';
      employee.leaveBalance[balanceKey] += diffDays;
    }

    data.leaves.splice(requestIndex, 1);
    await db.write(data);
    await logActivity(req.user!.id, 'Leave Cancelled', `Cancelled pending leave application (ID: ${id}).`, req);

    res.json({ message: 'Leave request cancelled and balance restored successfully.', balance: employee?.leaveBalance });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to cancel leave request.', details: error.message });
  }
});

// 10. Get Employee Tasks
app.get('/api/tasks', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const data = await db.read();
    const tasks = data.tasks.filter(t => t.employeeId === req.user?.id);
    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch tasks.', details: error.message });
  }
});

// 11. Update Task Progress & Status
app.put('/api/tasks/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { status, progress } = req.body;

  try {
    const data = await db.read();
    const task = data.tasks.find(t => t.id === id && t.employeeId === req.user?.id);

    if (!task) {
      res.status(404).json({ error: 'Task not found.' });
      return;
    }

    if (status !== undefined) {
      task.status = status;
      if (status === 'Completed') {
        task.progress = 100;
      }
    }
    if (progress !== undefined) {
      task.progress = progress;
      if (progress >= 100) {
        task.status = 'Completed';
        task.progress = 100;
      } else if (progress < 100 && task.status === 'Completed') {
        task.status = 'Pending';
      }
    }

    await db.write(data);
    await logActivity(req.user!.id, 'Task Update', `Updated task "${task.title}": Status=${task.status}, Progress=${task.progress}%.`, req);

    res.json(task);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update task.', details: error.message });
  }
});

// 12. Get Salary Slips & Payroll Records
app.get('/api/salary', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const data = await db.read();
    const records = data.salary.filter(s => s.employeeId === req.user?.id);
    res.json(records);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch payroll history.', details: error.message });
  }
});

// 13. Get Notifications
app.get('/api/notifications', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const data = await db.read();
    const notifications = data.notifications.filter(n => n.employeeId === 'all' || n.employeeId === req.user?.id);
    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch notifications.', details: error.message });
  }
});

// 14. Mark Notification as Read
app.put('/api/notifications/:id/read', authenticateToken, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  try {
    const data = await db.read();
    const notification = data.notifications.find(n => n.id === id && (n.employeeId === 'all' || n.employeeId === req.user?.id));

    if (!notification) {
      res.status(404).json({ error: 'Notification not found.' });
      return;
    }

    notification.isRead = true;
    await db.write(data);
    res.json({ success: true, notification });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update notification.', details: error.message });
  }
});

// 15. Mark All Notifications as Read
app.post('/api/notifications/read-all', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const data = await db.read();
    let updatedCount = 0;
    data.notifications.forEach(n => {
      if ((n.employeeId === 'all' || n.employeeId === req.user?.id) && !n.isRead) {
        n.isRead = true;
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      await db.write(data);
    }
    res.json({ success: true, updatedCount });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update notifications.', details: error.message });
  }
});

// 16. Get Chat Conversation History
app.get('/api/chat/history', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const data = await db.read();
    const history = data.chatMessages
      .filter(m => m.employeeId === req.user?.id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch chat history.', details: error.message });
  }
});

// 17. Submit Chat Message & Query Gemini AI
app.post('/api/chat/message', authenticateToken, async (req: AuthenticatedRequest, res) => {
  const { message } = req.body;

  if (!message) {
    res.status(400).json({ error: 'Message content is required.' });
    return;
  }

  try {
    const data = await db.read();
    const employee = data.employees.find(e => e.id === req.user?.id);
    const leaves = data.leaves.filter(l => l.employeeId === req.user?.id);
    const tasks = data.tasks.filter(t => t.employeeId === req.user?.id);
    const salaries = data.salary.filter(s => s.employeeId === req.user?.id);
    const attendance = data.attendance.filter(a => a.employeeId === req.user?.id);

    if (!employee) {
      res.status(404).json({ error: 'Employee session is invalid.' });
      return;
    }

    // Save User message in DB
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      employeeId: employee.id,
      message,
      sender: 'user',
      createdAt: new Date().toISOString()
    };
    data.chatMessages.push(userMsg);

    // Fetch previous conversation to provide context
    const conversationHistory = data.chatMessages
      .filter(m => m.employeeId === employee.id)
      .slice(-10); // last 10 messages for context

    // Construct detailed context about the specific employee
    const systemInstruction = `
You are the BHEL Enterprise AI Support Agent, a dedicated, highly knowledgeable, and friendly virtual assistant built for Bharat Heavy Electricals Limited (BHEL) employees.
Your current user profile:
- Name: ${employee.name}
- Employee ID: ${employee.id}
- Designation: ${employee.designation}
- Department: ${employee.department}
- Reporting Manager: ${employee.reportingManager}
- Date of Joining: ${employee.dateOfJoining}
- Employment Status: ${employee.status}

Leave Balance:
- Casual Leaves remaining: ${employee.leaveBalance.casual}
- Sick Leaves remaining: ${employee.leaveBalance.sick}
- Earned Leaves remaining: ${employee.leaveBalance.earned}

Leave Request History:
${JSON.stringify(leaves.map(l => ({ type: l.type, start: l.startDate, end: l.endDate, reason: l.reason, status: l.status })))}

Assigned Tasks:
${JSON.stringify(tasks.map(t => ({ title: t.title, desc: t.description, status: t.status, progress: t.progress, deadline: t.deadline })))}

Payroll Records (Recent Salary slips):
${JSON.stringify(salaries.map(s => ({ month: s.month, year: s.year, net: s.netSalary, status: s.status })))}

Recent Attendance:
- Checked-In logs: ${JSON.stringify(attendance.map(a => ({ date: a.date, status: a.status, in: a.checkIn, out: a.checkOut, hours: a.workHours })))}

Core BHEL Information:
- BHEL is a central Public Sector Enterprise under the Ministry of Heavy Industries, Government of India. It is India's largest power generation equipment manufacturer.
- Vision: "A global engineering enterprise providing solutions for a better tomorrow."
- Mission: "Providing sustainable business solutions in the fields of Energy, Industry & Infrastructure with focus on Quality, Technology & Innovation."
- Manufacturing Units: Haridwar, Bhopal, Jhansi, Hyderabad, Tiruchirappalli, Ranipet, Bengaluru, Jagdishpur, Rudrapur, Goindwal, and Visakhapatnam.
- Core Values: Respect, Excellence, Integrity, Learning, Teamwork (REILT).
- Help Desk Contacts: HR Helpline (011-66337000), Email: hr_support@bhel.in, Address: BHEL House, Siri Fort, New Delhi - 110049.

Instructions:
- Maintain a highly professional, humble, and polite corporate PSU assistant tone.
- Answer user's queries using their real-time profile details listed above (e.g., if they ask about leaves, refer to their 8 Casual leaves remaining, etc.).
- Give helpful navigation suggestions (e.g., "You can apply for leave in the 'Leave Management' sidebar menu").
- Do not make up mock data. Refer directly to the provided employee records. If requested information is not available, offer HR helpline contacts.
- Keep responses relatively concise and structured.
`;

    // Package previous messages into the structure for Gemini
    const contents = conversationHistory.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.message }]
    }));

    // Trigger Gemini API generateContent
    const geminiResponse = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const aiText = geminiResponse.text || "I apologize, I experienced a minor connection latency with the BHEL enterprise server. Please try asking again in a moment, or contact HR at hr_support@bhel.in.";

    // Save AI response in DB
    const aiMsg: ChatMessage = {
      id: `msg-${Date.now()}-ai`,
      employeeId: employee.id,
      message: aiText,
      sender: 'ai',
      createdAt: new Date().toISOString()
    };
    data.chatMessages.push(aiMsg);

    await db.write(data);

    res.json({ userMsg, aiMsg });
  } catch (error: any) {
    console.error('Gemini chatbot error:', error);
    res.status(500).json({ error: 'AI Assistant failed to process query.', details: error.message });
  }
});

// 18. Global Search across tasks, documents, notifications, and salary slips
app.get('/api/search', authenticateToken, async (req: AuthenticatedRequest, res) => {
  const query = (req.query.q as string || '').toLowerCase();

  if (!query) {
    res.json({ tasks: [], notifications: [], salary: [], documents: [] });
    return;
  }

  try {
    const data = await db.read();
    const tasks = data.tasks.filter(t => t.employeeId === req.user?.id && (t.title.toLowerCase().includes(query) || t.description.toLowerCase().includes(query)));
    const notifications = data.notifications.filter(n => (n.employeeId === 'all' || n.employeeId === req.user?.id) && (n.title.toLowerCase().includes(query) || n.message.toLowerCase().includes(query)));
    const salary = data.salary.filter(s => s.employeeId === req.user?.id && (s.month.toLowerCase().includes(query) || String(s.year).includes(query)));

    // Virtual documents search
    const docsList = [
      { id: 'doc-1', title: 'Offer Letter', type: 'Appointment', date: '2024-05-15' },
      { id: 'doc-2', title: 'BHEL Identity Card Digital', type: 'Identification', date: '2024-06-01' },
      { id: 'doc-3', title: 'Employee Cybersecurity Pledge', type: 'Compliance', date: '2024-06-05' },
      { id: 'doc-4', title: 'HR Leave Policy Guidebook 2026', type: 'Policy', date: '2026-01-01' }
    ];
    const documents = docsList.filter(d => d.title.toLowerCase().includes(query) || d.type.toLowerCase().includes(query));

    res.json({ tasks, notifications, salary, documents });
  } catch (error: any) {
    res.status(500).json({ error: 'Search operation failed.', details: error.message });
  }
});

// 19. Get Activity Audit Logs
app.get('/api/logs', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const data = await db.read();
    const logs = data.activityLogs.filter(l => l.employeeId === req.user?.id).slice(0, 50); // last 50 logs
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch audit logs.', details: error.message });
  }
});

/* ==================== VITE INTEGRATION ==================== */

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    console.log('Starting BHEL employee portal in development mode with Vite middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Starting BHEL employee portal in production mode...');
    // Serve build files from dist directory
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BHEL Portal Server listening on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch(err => {
  console.error('Failed to start full-stack server:', err);
});
// Start the server on the environment port or fallback to 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`BHEL Server running successfully on port ${PORT}`);
});
