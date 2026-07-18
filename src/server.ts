import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { 
    EmployeeModel, 
    AttendanceModel, 
    LeaveModel, 
    TaskModel, 
    SalaryModel, 
    NotificationModel, 
    ChatMessageModel, 
    ActivityLogModel 
} from './backend/db.js';

dotenv.config();

const app = express();
app.use(express.json());

// MongoDB Connection using Environment Variable
mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log('Connected to MongoDB Atlas successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

const JWT_SECRET = process.env.JWT_SECRET || 'bhel_enterprise_secure_token_secret_2026';

interface AuthenticatedRequest extends Request {
  user?: { id: string; name: string };
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
    req.user = { id: decoded.id, name: decoded.name };
    next();
  });
}

// Helper to log activities
async function logActivity(employeeId: string, action: string, details: string, req: Request) {
  try {
    await ActivityLogModel.create({
      employeeId,
      action,
      details,
      timestamp: new Date().toISOString(),
      device: req.headers['user-agent'] || 'Unknown',
      ip: req.ip
    });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

/* API Endpoints */

// 1. Login
app.post('/api/auth/login', async (req, res) => {
  const { employeeId, password } = req.body;
  try {
    const employee = await EmployeeModel.findOne({ id: employeeId.toUpperCase() });
    if (!employee || !(await bcrypt.compare(password, employee.passwordHash))) {
      return res.status(401).json({ error: 'Invalid Employee ID or Password.' });
    }
    
    const token = jwt.sign({ id: employee.id, name: employee.name }, JWT_SECRET, { expiresIn: '2h' });
    await logActivity(employee.id, 'User Login', 'Successfully logged in.', req);
    
    const { passwordHash, ...profile } = employee.toObject();
    res.json({ token, employee: profile });
  } catch (error: any) {
    res.status(500).json({ error: 'Server error.', details: error.message });
  }
});

// 2. Fetch Profile
app.get('/api/employee/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const employee = await EmployeeModel.findOne({ id: req.user?.id }).select('-passwordHash');
    if (!employee) return res.status(404).json({ error: 'Employee not found.' });
    res.json(employee);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch profile.', details: error.message });
  }
});

// 3. Attendance Check-In
app.post('/api/attendance/check-in', authenticateToken, async (req: AuthenticatedRequest, res) => {
  const today = new Date().toISOString().split('T')[0];
  try {
    const existing = await AttendanceModel.findOne({ employeeId: req.user?.id, date: today });
    if (existing) return res.status(400).json({ error: 'Already checked in today.' });

    const newRecord = await AttendanceModel.create({
      employeeId: req.user?.id,
      date: today,
      status: 'Present',
      checkIn: new Date().toTimeString().split(' ')[0]
    });
    
    await logActivity(req.user!.id, 'Check-In', 'Marked attendance.', req);
    res.json(newRecord);
  } catch (error: any) {
    res.status(500).json({ error: 'Check-In failed.', details: error.message });
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
