import React, { useState } from 'react';
import { Lock, User, AlertTriangle, HelpCircle, ShieldCheck, Mail, Phone, Briefcase, Building, CheckCircle2 } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (token: string, employee: any) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  // Registration States
  const [isRegister, setIsRegister] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDesignation, setRegDesignation] = useState('Executive Trainee');
  const [regDepartment, setRegDepartment] = useState('Engineering Department');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !password) {
      setError('Please provide both Employee ID and password.');
      return;
    }

    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeId, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (rememberMe) {
        localStorage.setItem('bhel_remember_id', employeeId);
      } else {
        localStorage.removeItem('bhel_remember_id');
      }

      onLoginSuccess(data.token, data.employee);
    } catch (err: any) {
      setError(err.message || 'Connecting to BHEL server failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !regName || !password || !regEmail || !regPhone) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!employeeId.toUpperCase().startsWith('BHEL')) {
      setError('Employee ID must begin with BHEL (e.g. BHEL1002)');
      return;
    }

    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId: employeeId.trim().toUpperCase(),
          name: regName.trim(),
          password,
          email: regEmail.trim(),
          phone: regPhone.trim(),
          designation: regDesignation,
          department: regDepartment
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccessMessage('BHEL staff account created successfully! You can now log in using your credentials.');
      setIsRegister(false);
      setPassword('');
      setError('');
    } catch (err: any) {
      setError(err.message || 'Connecting to BHEL server failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess('A secure password reset link has been dispatched to your registered BHEL internal email address.');
    setForgotEmail('');
  };

  React.useEffect(() => {
    const savedId = localStorage.getItem('bhel_remember_id');
    if (savedId) {
      setEmployeeId(savedId);
      setRememberMe(true);
    }
  }, []);

  return (
    <div id="login-container" className="flex min-h-screen items-center justify-center bg-[#060a12] px-4 py-12 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-950/20 via-slate-950 to-black">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-8 backdrop-blur-md shadow-2xl">
        <div className="flex flex-col items-center text-center">
          {/* Official BHEL Logo */}
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/b/b8/BHEL_logo.svg"
            alt="BHEL Logo"
            className="h-16 w-auto mb-3 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]"
          />
          <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {isRegister ? 'BHEL Registration' : 'BHEL Employee Portal'}
          </h2>
          <p className="mt-1 text-xs tracking-wider text-slate-400 uppercase font-semibold">
            Bharat Heavy Electricals Limited
          </p>
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-[11px] font-semibold text-blue-400 border border-blue-500/20">
            <ShieldCheck className="h-3 w-3" /> Secure PSU Single Sign-On
          </span>
        </div>

        {successMessage && (
          <div className="flex items-center gap-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-400">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <p>{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-xs text-red-400">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {isRegister ? (
          /* REGISTRATION FORM */
          <form className="mt-4 space-y-4" onSubmit={handleRegisterSubmit}>
            <div className="space-y-3">
              <div>
                <label htmlFor="reg-employee-id" className="block text-xs font-medium uppercase tracking-wider text-slate-300">
                  Employee ID / Staff Number <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    id="reg-employee-id"
                    type="text"
                    required
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="e.g. BHEL1002"
                    className="block w-full rounded-lg border border-slate-700 bg-slate-950/60 py-2 pl-10 pr-3 text-white placeholder-slate-500 focus:border-blue-500 focus:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-name" className="block text-xs font-medium uppercase tracking-wider text-slate-300">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Zaid Ali Khan"
                    className="block w-full rounded-lg border border-slate-700 bg-slate-950/60 py-2 pl-10 pr-3 text-white placeholder-slate-500 focus:border-blue-500 focus:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reg-email" className="block text-xs font-medium uppercase tracking-wider text-slate-300">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      id="reg-email"
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="e.g. name@bhel.in"
                      className="block w-full rounded-lg border border-slate-700 bg-slate-950/60 py-2 pl-10 pr-3 text-white placeholder-slate-500 focus:border-blue-500 focus:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-phone" className="block text-xs font-medium uppercase tracking-wider text-slate-300">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Phone className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      id="reg-phone"
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="e.g. +91 9026937796"
                      className="block w-full rounded-lg border border-slate-700 bg-slate-950/60 py-2 pl-10 pr-3 text-white placeholder-slate-500 focus:border-blue-500 focus:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reg-designation" className="block text-xs font-medium uppercase tracking-wider text-slate-300">
                    Designation
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Briefcase className="h-4 w-4 text-slate-500" />
                    </div>
                    <select
                      id="reg-designation"
                      value={regDesignation}
                      onChange={(e) => setRegDesignation(e.target.value)}
                      className="block w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-10 pr-3 text-white focus:border-blue-500 focus:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm cursor-pointer"
                    >
                      <option value="Executive Trainee">Executive Trainee</option>
                      <option value="Senior Engineer">Senior Engineer</option>
                      <option value="Deputy General Manager">Deputy General Manager</option>
                      <option value="HR Executive">HR Executive</option>
                      <option value="Finance Officer">Finance Officer</option>
                      <option value="Full Stack Developer">Full Stack Developer</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-department" className="block text-xs font-medium uppercase tracking-wider text-slate-300">
                    Department
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Building className="h-4 w-4 text-slate-500" />
                    </div>
                    <select
                      id="reg-department"
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                      className="block w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-10 pr-3 text-white focus:border-blue-500 focus:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm cursor-pointer"
                    >
                      <option value="Engineering & IT Department">Engineering & IT</option>
                      <option value="Human Resources Department">Human Resources</option>
                      <option value="Finance & Accounts Department">Finance & Accounts</option>
                      <option value="Operations & Maintenance">Operations & Maintenance</option>
                      <option value="Heavy Equipment Production">Heavy Equipment Production</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="reg-password" className="block text-xs font-medium uppercase tracking-wider text-slate-300">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    id="reg-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="block w-full rounded-lg border border-slate-700 bg-slate-950/60 py-2 pl-10 pr-3 text-white placeholder-slate-500 focus:border-blue-500 focus:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-lg bg-blue-600 hover:bg-blue-500 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition duration-150 disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Register Corporate Account'}
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setError('');
                  setSuccessMessage('');
                }}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 hover:underline"
              >
                Already have an account? Authenticate Credentials
              </button>
            </div>
          </form>
        ) : (
          /* LOGIN FORM */
          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="employee-id" className="block text-xs font-medium uppercase tracking-wider text-slate-300">
                  Employee ID / Staff Number
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    id="employee-id"
                    name="employeeId"
                    type="text"
                    required
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="e.g. BHEL1001"
                    className="block w-full rounded-lg border border-slate-700 bg-slate-950/60 py-2.5 pl-10 pr-3 text-white placeholder-slate-500 focus:border-blue-500 focus:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-medium uppercase tracking-wider text-slate-300">
                  Enterprise Password
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="block w-full rounded-lg border border-slate-700 bg-slate-950/60 py-2.5 pl-10 pr-3 text-white placeholder-slate-500 focus:border-blue-500 focus:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-300 select-none cursor-pointer">
                  Remember Employee ID
                </label>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(true);
                  setForgotSuccess('');
                }}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-lg bg-blue-600 hover:bg-blue-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition duration-150 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Authorizing...
                  </span>
                ) : 'Authenticate Credentials'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setError('');
                    setSuccessMessage('');
                    setEmployeeId('');
                    setPassword('');
                  }}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 hover:underline"
                >
                  New to BHEL ERM? Create an account
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="border-t border-slate-800/80 pt-4 text-center">
          <p className="text-[11px] text-slate-500">
            Authorized Personnel Only. Unauthorized access is strictly prohibited and subject to legal prosecution in accordance with Indian IT Act, 2000.
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold font-display text-white mb-2 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-400" /> Password Recovery Help
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter your official @bhel.in registered email address. We will verify your ID and transmit temporary sign-on credentials.
            </p>

            {forgotSuccess ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 text-xs text-blue-400">
                  {forgotSuccess}
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full rounded-lg bg-slate-800 text-xs text-slate-200 py-2 hover:bg-slate-700"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <input
                  type="email"
                  required
                  placeholder="e.g. zaidgbu247@gmail.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="block w-full rounded-lg border border-slate-700 bg-slate-950 py-2 px-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-500"
                  >
                    Request Credentials
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
