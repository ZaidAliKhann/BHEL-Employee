import React, { useState } from 'react';
import { 
  BookOpen, Building2, MapPin, Award, Phone, Mail, 
  Send, HelpCircle, HardHat, FileText, Download, Eye, 
  Settings2, Clock, Bell, UserCheck, ShieldCheck, MailPlus, CreditCard
} from 'lucide-react';
import { Employee, Notification } from '../types';

/* ==========================================================================
   ABOUT BHEL PAGE (WITH DEVELOPER CREDITS)
   ========================================================================== */
export function AboutBhel() {
  const units = [
    { name: 'Heavy Electrical Equipment Plant (HEEP)', loc: 'Haridwar, Uttarakhand' },
    { name: 'Heavy Power Equipment Plant (HPEP)', loc: 'Hyderabad, Telangana' },
    { name: 'High Pressure Boiler Plant (HPBP)', loc: 'Tiruchirappalli, Tamil Nadu' },
    { name: 'Transformer Plant (TP)', loc: 'Jhansi, Uttar Pradesh' },
    { name: 'Electronics Division (EDN)', loc: 'Bengaluru, Karnataka' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 h-40 w-40 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="flex flex-col md:flex-row gap-6 items-center relative z-10">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/b/b8/BHEL_logo.svg" 
            alt="BHEL" 
            className="h-24 w-auto"
          />
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              Government of India Enterprise
            </span>
            <h2 className="font-display text-2xl font-extrabold text-slate-900 mt-3">Bharat Heavy Electricals Limited</h2>
            <p className="text-xs text-slate-600 mt-2 max-w-2xl leading-relaxed font-medium">
              BHEL is India's largest engineering and manufacturing enterprise of its kind in the energy and infrastructure sectors, established in 1964. It is a premier Maharatna Public Sector Undertaking pioneering heavy power equipment design.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Vision & Values */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-display text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Award className="h-4 w-4 text-blue-600" /> Vision & Mission
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Our guiding philosophy for engineering nation-building.</p>
          </div>

          <div className="space-y-3.5 text-xs leading-relaxed font-medium">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <strong className="text-slate-900 block mb-1">Corporate Vision</strong>
              <p className="text-slate-600">A global engineering enterprise providing quality solutions for sustainable development in the energy and infrastructure sectors.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <strong className="text-slate-900 block mb-1">REILT Core Values</strong>
              <p className="text-slate-600">Respect, Excellence, Integrity, Learning, and Teamwork form the cultural backbone of our thousands-strong workforce.</p>
            </div>
          </div>
        </div>

        {/* Manufacturing Units */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-display text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" /> Premier Manufacturing Units
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Spanning across strategic geographic hubs in India.</p>
          </div>

          <div className="space-y-3 max-h-[230px] overflow-y-auto custom-scrollbar pr-1">
            {units.map((u, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center text-xs shadow-sm">
                <div>
                  <span className="text-slate-900 font-bold block">{u.name}</span>
                  <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-semibold uppercase tracking-wider"><MapPin className="h-3 w-3 text-slate-400" /> {u.loc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Developer Credits */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-6 md:p-8 relative overflow-hidden shadow-sm">
        <div className="absolute right-4 top-4 opacity-5">
          <HardHat className="h-20 w-20 text-blue-600" />
        </div>
        <div className="mb-4">
          <h3 className="font-display text-sm font-bold text-blue-900 uppercase tracking-wider mb-2">Technical Portal Architecture</h3>
          <p className="text-xs text-slate-600 max-w-xl font-medium leading-relaxed">
            This portal comprises the custom Employee Self-Service Enterprise resource layer, securely compiled and managed.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
          <div className="p-4 rounded-xl bg-white border border-blue-100 shadow-sm">
            <span className="text-slate-400 font-bold block uppercase text-[8px] tracking-wider">Developed By</span>
            <span className="text-base font-extrabold text-slate-900 block mt-1">Zaid Ali Khan</span>
            <span className="text-[10px] text-blue-600 font-bold tracking-wide uppercase mt-0.5">Full Stack Developer</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-blue-100 shadow-sm space-y-2 text-slate-600">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-400" />
              <span>Email: <a href="mailto:zaidgbu247@gmail.com" className="text-blue-600 hover:underline">zaidgbu247@gmail.com</a></span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-slate-400" />
              <span>Contact: <strong className="text-slate-800">+91 9026937796</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   CONTACT HR PAGE
   ========================================================================== */
export function ContactHr() {
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketBody, setTicketBody] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketBody) return;
    setSubmitted(true);
    setTicketSubject('');
    setTicketBody('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      {/* Help desk directory */}
      <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div>
          <h3 className="font-display text-sm font-bold text-slate-900 uppercase tracking-wider">HR Helpline & Support</h3>
          <p className="text-xs text-slate-500 mt-0.5">Direct lines for administrative inquiries.</p>
        </div>

        <div className="space-y-4 text-xs font-semibold text-slate-600">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2.5">
            <strong className="text-slate-900 block">Corporate HQ Helpdesk</strong>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-blue-600 shrink-0" />
              <span>+91 11 66337000</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-600 shrink-0" />
              <span>hr_support@bhel.in</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2.5">
            <strong className="text-slate-900 block">EPFO & Pension Cell</strong>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-blue-600 shrink-0" />
              <span>+91 11 66337142</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100 space-y-2.5 text-rose-700">
            <strong className="text-rose-950 block">Emergency Support Helpline</strong>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-rose-600" />
              <span className="font-extrabold">+91 9026937796</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket form */}
      <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="font-display text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 mb-4">Submit HR Support Ticket</h3>
        </div>

        {submitted ? (
          <div className="my-12 text-center space-y-4 max-w-sm mx-auto">
            <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto shadow-sm">
              <UserCheck className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Ticket Filed Successfully</h4>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Your inquiry has been logged in the BHEL central ticketing engine. A representative from your unit's HR department will respond shortly.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer pt-2 block mx-auto"
            >
              Submit another query
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider">Issue Subject Classification</label>
              <input
                type="text"
                required
                placeholder="e.g. Discrepancy in June Dearness Allowance"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider">Detailed Clarification Description</label>
              <textarea
                required
                rows={4}
                placeholder="Detail your request comprehensively, providing pay slip numbers or attendance date logs if applicable..."
                value={ticketBody}
                onChange={(e) => setTicketBody(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white py-2.5 shadow-md shadow-blue-600/10 cursor-pointer transition-colors"
            >
              <Send className="h-3.5 w-3.5" /> Transmit Support Ticket
            </button>
          </form>
        )}

        <div className="mt-6 flex items-center gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 font-medium">
          <HelpCircle className="h-4 w-4 text-slate-400 shrink-0" />
          <p>
            Inquiries regarding official EPF deposits or direct health claims must be accompanied by supporting proof files.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   DOCUMENTS ACCESS PAGE
   ========================================================================== */
interface DocumentsPageProps {
  employee: Employee;
}
export function DocumentsPage({ employee }: DocumentsPageProps) {
  const [showIdCard, setShowIdCard] = useState(false);

  const policyFiles = [
    { title: 'BHEL HR Leave Policy Manual (2026)', desc: 'Rules governing Casual, Earned and Sick leaves accrual.', size: '1.4 MB' },
    { title: 'Executive Conduct & Discipline Rules', desc: 'Code of ethics and workplace compliance guidelines.', size: '980 KB' },
    { title: 'Medical Claim & Hospitalization Policy', desc: 'Details on cashless empanelment schemes.', size: '2.1 MB' },
    { title: 'Gratuity & EPF Rulebook Guidelines', desc: 'Accrual guidelines for post-employment benefits.', size: '1.8 MB' }
  ];

  const handleDownloadMock = (name: string) => {
    alert(`Downloading documentation file: "${name}" | Transfer secure.`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Visual Identity / Letters Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Document Actions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-sm font-bold text-slate-900 uppercase tracking-wider">Official Letters & ID Card</h3>
            <p className="text-xs text-slate-500 mt-0.5">Access printable PDFs of your corporate credentials.</p>
          </div>

          <div className="space-y-4 text-xs font-semibold">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center shadow-sm">
              <div>
                <strong className="text-slate-900 block font-bold">BHEL Official Appointment Letter</strong>
                <span className="text-[10px] text-slate-400 block mt-1">Dated: {employee.dateOfJoining}</span>
              </div>
              <button 
                onClick={() => handleDownloadMock('Appointment_Letter_BHEL.pdf')}
                className="flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] text-slate-700 px-3 py-1.5 transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" /> Download
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center shadow-sm">
              <div>
                <strong className="text-slate-900 block font-bold">BHEL Employee Digital ID Card</strong>
                <span className="text-[10px] text-slate-400 block mt-1">Access pass for secure plant entry gates</span>
              </div>
              <button 
                onClick={() => setShowIdCard(!showIdCard)}
                className="flex items-center gap-1.5 rounded-lg bg-blue-50 text-[11px] text-blue-600 border border-blue-200 px-3 py-1.5 hover:bg-blue-100 hover:border-blue-300 transition-all cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" /> {showIdCard ? 'Hide Pass' : 'Reveal Pass'}
              </button>
            </div>
          </div>
          
          <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-[11px] text-slate-500 leading-relaxed font-medium">
            * Transmitting corporate credentials to external non-BHEL networks without authorization violates central confidentiality rules.
          </div>
        </div>

        {/* Digital ID Card Preview */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-center">
          {showIdCard ? (
            <div className="w-80 rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6 shadow-lg relative overflow-hidden text-center border-t-4 border-t-blue-600">
              <div className="absolute right-0 top-0 h-28 w-28 bg-blue-500/5 rounded-full blur-2xl"></div>
              
              {/* Header */}
              <div className="flex items-center justify-center gap-2 border-b border-slate-100 pb-4 mb-4">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/b/b8/BHEL_logo.svg" 
                  alt="BHEL" 
                  className="h-8 w-auto"
                />
                <div className="text-left leading-none">
                  <span className="text-xs font-extrabold text-slate-900 block">BHEL INDIA</span>
                  <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest mt-1">EXECUTIVE PASS</span>
                </div>
              </div>

              {/* Photo placeholder with initials */}
              <div className="h-24 w-24 rounded-full bg-blue-600 shadow-md mx-auto border-4 border-white flex items-center justify-center font-display font-extrabold text-2xl text-white">
                {employee.name.split(' ').map(n => n[0]).join('')}
              </div>

              <h4 className="text-base font-extrabold text-slate-900 mt-4">{employee.name}</h4>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">{employee.designation}</p>
              
              <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-left text-[11px] font-semibold text-slate-500">
                <div>
                  <span className="block uppercase tracking-wider text-[8px] text-slate-400">Employee ID</span>
                  <strong className="text-slate-800 font-mono font-bold block mt-0.5">{employee.id}</strong>
                </div>
                <div>
                  <span className="block uppercase tracking-wider text-[8px] text-slate-400">Department</span>
                  <strong className="text-slate-800 font-bold block mt-0.5">{employee.department}</strong>
                </div>
              </div>

              <div className="mt-5 p-1.5 rounded-lg bg-blue-50 border border-blue-100 text-[8px] text-blue-600 font-extrabold font-mono uppercase tracking-widest">
                ISO 9001 SECURITY APPROVED
              </div>
            </div>
          ) : (
            <div className="text-center text-xs text-slate-400 py-12 font-medium">
              <CreditCard className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <span>Toggle digital executive pass view to preview BHEL gate credential card.</span>
            </div>
          )}
        </div>

      </div>

      {/* Manuals and Policies List */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="font-display text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-3">
          Corporate Regulations & Manuals
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {policyFiles.map((file, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors flex justify-between items-start gap-4 shadow-sm">
              <div>
                <strong className="text-xs text-slate-900 block font-extrabold">{file.title}</strong>
                <p className="text-[11px] text-slate-600 mt-1 font-semibold leading-relaxed">{file.desc}</p>
                <span className="text-[9px] font-mono text-slate-400 mt-2.5 block uppercase font-bold">PDF Document • {file.size}</span>
              </div>
              <button
                onClick={() => handleDownloadMock(file.title)}
                className="h-8 w-8 rounded bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-500 hover:text-slate-800 flex items-center justify-center shrink-0 cursor-pointer shadow-sm transition-colors"
                title="Download Document"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   SETTINGS PAGE
   ========================================================================== */
export function SettingsPage() {
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [allowNotifications, setAllowNotifications] = useState(true);
  const [cardDensity, setCardDensity] = useState('standard');

  const handleSaveSettings = () => {
    alert('User preferences persisted successfully.');
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 animate-fade-in">
      <div className="border-b border-slate-100 pb-4 mb-2 flex items-center gap-2">
        <Settings2 className="h-5 w-5 text-blue-600" />
        <div>
          <h3 className="font-display text-sm font-bold text-slate-900 uppercase tracking-wider">Enterprise Security Settings</h3>
          <p className="text-xs text-slate-500 mt-0.5">Control login sessions, notifications, and visual layouts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600 font-semibold">
        {/* Session Management */}
        <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 space-y-4">
          <span className="text-slate-900 font-extrabold block mb-1 uppercase text-[10px] tracking-wider text-blue-600 flex items-center gap-1">
            <Clock className="h-4 w-4" /> Session Security
          </span>
          
          <div>
            <label className="block text-slate-500 mb-1.5 uppercase text-[9px] tracking-wider font-bold">JWT Token Auto-Expiry</label>
            <select
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              className="block w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-slate-800 focus:outline-none font-semibold text-xs"
            >
              <option value="15">15 Minutes (High Security)</option>
              <option value="30">30 Minutes (Standard)</option>
              <option value="60">60 Minutes (Convenience)</option>
            </select>
          </div>
          <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
            For secure environments, lower session timeouts protect employee assets from unauthorized interference.
          </p>
        </div>

        {/* Notifications */}
        <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 space-y-4">
          <span className="text-slate-900 font-extrabold block mb-1 uppercase text-[10px] tracking-wider text-blue-600 flex items-center gap-1">
            <Bell className="h-4 w-4" /> System Notices
          </span>

          <div className="flex items-center justify-between">
            <span className="text-slate-700">Allow Push Notifications</span>
            <input
              type="checkbox"
              checked={allowNotifications}
              onChange={(e) => setAllowNotifications(e.target.checked)}
              className="h-4 w-4 rounded bg-white border-slate-200 accent-blue-600 cursor-pointer"
            />
          </div>
          <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
            Transmits daily reminders regarding shift check-outs and pending task deadlines to your client browser.
          </p>
        </div>

        {/* Card density settings */}
        <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 space-y-4">
          <span className="text-slate-900 font-extrabold block mb-1 uppercase text-[10px] tracking-wider text-blue-600 flex items-center gap-1">
            <ShieldCheck className="h-4 w-4" /> Visual Preferences
          </span>

          <div>
            <label className="block text-slate-500 mb-2 uppercase text-[9px] tracking-wider font-bold">Dashboard Density</label>
            <div className="flex gap-2">
              <button
                onClick={() => setCardDensity('compact')}
                className={`flex-1 py-1.5 px-3 rounded-lg border text-center font-bold text-[10px] cursor-pointer transition-all ${
                  cardDensity === 'compact' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white border-slate-200 text-slate-500'
                }`}
              >
                COMPACT
              </button>
              <button
                onClick={() => setCardDensity('standard')}
                className={`flex-1 py-1.5 px-3 rounded-lg border text-center font-bold text-[10px] cursor-pointer transition-all ${
                  cardDensity === 'standard' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white border-slate-200 text-slate-500'
                }`}
              >
                STANDARD
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100">
        <button
          onClick={handleSaveSettings}
          className="rounded-lg bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-xs font-semibold text-white transition-all shadow-md shadow-blue-600/10 cursor-pointer"
        >
          Commit Preferences
        </button>
      </div>
    </div>
  );
}

/* ==========================================================================
   NOTIFICATIONS SCREEN
   ========================================================================== */
interface NotificationsPageProps {
  notifications: Notification[];
  onMarkAllRead: () => Promise<void>;
  onMarkRead: (id: string) => Promise<void>;
}
export function NotificationsPage({
  notifications,
  onMarkAllRead,
  onMarkRead
}: NotificationsPageProps) {
  const [success, setSuccess] = useState('');

  const handleMarkAll = async () => {
    try {
      await onMarkAllRead();
      setSuccess('All active notices cleared from notification inbox.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSingleRead = async (id: string) => {
    try {
      await onMarkRead(id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-2">
        <div>
          <h3 className="font-display text-sm font-bold text-slate-900 uppercase tracking-wider">Administrative Notices</h3>
          <p className="text-xs text-slate-500 mt-0.5 font-semibold">Historical log of all corporate guidelines, leave states, and payslip circulars.</p>
        </div>

        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAll}
            className="rounded-lg bg-blue-50 hover:bg-blue-100 text-xs font-semibold text-blue-600 border border-blue-200 px-3.5 py-1.5 transition-colors cursor-pointer self-start sm:self-center"
          >
            Mark all as read
          </button>
        )}
      </div>

      {success && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-100 text-xs text-emerald-700 font-semibold shadow-sm">
          {success}
        </div>
      )}

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <p className="text-xs text-slate-400 py-12 text-center font-medium">Notice board index is empty.</p>
        ) : (
          notifications.map((n) => {
            const labelColors = {
              HR: 'bg-indigo-50 text-indigo-700 border-indigo-100',
              Announcements: 'bg-blue-50 text-blue-700 border-blue-100',
              Salary: 'bg-emerald-50 text-emerald-700 border-emerald-100',
              Leave: 'bg-purple-50 text-purple-700 border-purple-100',
              Tasks: 'bg-amber-50 text-amber-700 border-amber-100',
              Emergency: 'bg-rose-50 text-rose-700 border-rose-100'
            };
            return (
              <div 
                key={n.id} 
                className={`p-4 rounded-xl border flex gap-4 transition-all shadow-sm ${
                  n.isRead 
                    ? 'bg-slate-50/50 border-slate-100 opacity-60' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="shrink-0 pt-0.5">
                  <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${labelColors[n.type]}`}>
                    {n.type}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <h4 className={`text-xs font-bold truncate ${n.isRead ? 'text-slate-500 font-semibold' : 'text-slate-900 font-extrabold'}`}>{n.title}</h4>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap font-semibold">{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed font-medium">{n.message}</p>
                </div>

                {!n.isRead && (
                  <button
                    onClick={() => handleSingleRead(n.id)}
                    className="shrink-0 text-xs font-bold text-blue-600 hover:underline hover:text-blue-700 cursor-pointer self-start pt-1.5"
                  >
                    Clear
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
