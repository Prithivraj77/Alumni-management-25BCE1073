import React, { useState } from 'react';
import { 
  GraduationCap, 
  Lock, 
  Mail, 
  User, 
  Building, 
  Briefcase, 
  CheckCircle, 
  ArrowRight, 
  X, 
  Sparkles,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useAlumni, CurrentUser } from '../context/AlumniContext';
import { UserRole } from '../types';
import confetti from 'canvas-confetti';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { loginAs, loginWithGoogle, executeSql, alumniList, isFirebaseConnected } = useAlumni();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [isSigningInWithGoogle, setIsSigningInWithGoogle] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('sarah.chen@google.com');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [loginRole, setLoginRole] = useState<UserRole>('alumni');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('alumni');
  const [regGradYear, setRegGradYear] = useState('2024');
  const [regDegree, setRegDegree] = useState('B.Tech Computer Science');
  const [regDepartment, setRegDepartment] = useState('Computer Science');
  const [regCompany, setRegCompany] = useState('');
  const [regDesignation, setRegDesignation] = useState('');
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState(false);

  if (!isOpen) return null;

  // Autofill helpers
  const autofillRegistrationAlumni = () => {
    setRegName('Aarav Patel');
    setRegEmail('aarav.patel@alumni.edu');
    setRegRole('alumni');
    setRegGradYear('2023');
    setRegDegree('B.Tech Computer Science & Engineering');
    setRegDepartment('Computer Science');
    setRegCompany('Amazon AWS');
    setRegDesignation('Cloud Systems Engineer');
    setRegError(null);
  };

  const autofillRegistrationStudent = () => {
    setRegName('Ananya Rao');
    setRegEmail('ananya.rao@student.edu');
    setRegRole('student');
    setRegGradYear('2026');
    setRegDegree('B.Tech Information Technology');
    setRegDepartment('Data Science');
    setRegCompany('Campus AI Research Lab');
    setRegDesignation('Undergraduate Student');
    setRegError(null);
  };

  const handleGoogleSignIn = async () => {
    setIsSigningInWithGoogle(true);
    setLoginError(null);
    try {
      const ok = await loginWithGoogle();
      if (ok) {
        try {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        } catch {}
        onClose();
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Google sign-in was interrupted. Please try again or use direct login.');
    } finally {
      setIsSigningInWithGoogle(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const matched = alumniList.find(a => a.email.toLowerCase() === loginEmail.toLowerCase());
    
    if (matched) {
      loginAs({
        id: matched.id,
        name: matched.name,
        email: matched.email,
        role: matched.role,
        avatar: matched.avatar,
        degree: matched.degree,
        gradYear: matched.gradYear,
        department: matched.department,
        company: matched.company,
        designation: matched.designation
      });
      onClose();
    } else {
      loginAs({
        id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
        name: loginEmail.split('@')[0].replace(/[._]/g, ' ').toUpperCase(),
        email: loginEmail,
        role: loginRole,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        degree: 'Bachelor of Science',
        gradYear: 2024,
        department: 'Computer Science',
        company: loginRole === 'student' ? 'Campus Student' : 'Industry Partner',
        designation: loginRole === 'student' ? 'Undergraduate' : 'Software Engineer'
      });
      onClose();
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    if (!regName.trim() || !regEmail.trim()) {
      setRegError('Please provide your full name and valid email address.');
      return;
    }

    const newId = `ALUM-${Math.floor(100 + Math.random() * 900)}`;
    const newMemberUser: CurrentUser = {
      id: newId,
      name: regName.trim(),
      email: regEmail.trim(),
      role: regRole,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      gradYear: parseInt(regGradYear) || 2024,
      degree: regDegree,
      department: regDepartment,
      company: regCompany.trim() || (regRole === 'student' ? 'Campus Student' : 'Independent'),
      designation: regDesignation.trim() || (regRole === 'student' ? 'Undergraduate' : 'Graduate Engineer')
    };

    const sqlInsert = `INSERT INTO alumni_members (id, name, email, role, grad_year, degree, department, company, designation)
VALUES ('${newId}', '${regName.replace(/'/g, "''")}', '${regEmail.replace(/'/g, "''")}', '${regRole}', ${regGradYear}, '${regDegree}', '${regDepartment}', '${(regCompany || 'None').replace(/'/g, "''")}', '${(regDesignation || 'None').replace(/'/g, "''")}');`;

    executeSql(sqlInsert);
    loginAs(newMemberUser);
    setRegSuccess(true);

    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {}

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleQuickDemo = (role: UserRole, email: string, name: string, title: string, avatar: string, company: string) => {
    loginAs({
      id: role === 'alumni' ? 'ALUM-001' : role === 'student' ? 'STU-001' : 'ADM-001',
      name,
      email,
      role,
      avatar,
      department: 'Computer Science',
      company,
      designation: title,
      gradYear: role === 'student' ? 2026 : 2018
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 text-white text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner ring-1 ring-white/20">
            <GraduationCap className="w-6 h-6 text-amber-300" />
          </div>
          
          <h2 className="text-xl font-bold tracking-tight">AlumniConnect Account Portal</h2>
          <p className="text-xs text-slate-300 mt-1">
            Access alumni directory, RSVP for reunions, or sign in with your role credentials.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50/80">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-3 text-xs font-bold text-center transition-colors border-b-2 ${
              tab === 'login'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-3 text-xs font-bold text-center transition-colors border-b-2 ${
              tab === 'register'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Create New Account
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          {/* Firebase Google Auth Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSigningInWithGoogle}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>{isSigningInWithGoogle ? 'Connecting with Google...' : 'Continue with Google (Firebase Auth)'}</span>
          </button>

          <div className="flex items-center my-2 text-slate-400 text-xs">
            <div className="flex-1 border-t border-slate-200"></div>
            <span className="px-3 text-[11px] font-medium uppercase text-slate-400">or sign in with credentials</span>
            <div className="flex-1 border-t border-slate-200"></div>
          </div>

          {tab === 'login' ? (
            /* Login Form */
            <div className="space-y-4">
              
              {/* Autofill Demo Credentials Bar */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Autofill Demo Credentials:</span>
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('sarah.chen@google.com');
                      setLoginPassword('password123');
                      setLoginRole('alumni');
                    }}
                    className="p-1.5 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-left transition-colors font-medium text-slate-700"
                  >
                    👩‍💼 Sarah (Alumni)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('priya.sharma@student.edu');
                      setLoginPassword('password123');
                      setLoginRole('student');
                    }}
                    className="p-1.5 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-left transition-colors font-medium text-slate-700"
                  >
                    📚 Priya (Student)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('dean.vance@university.edu');
                      setLoginPassword('admin123');
                      setLoginRole('admin');
                    }}
                    className="p-1.5 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-left transition-colors font-medium text-slate-700"
                  >
                    🏛️ Dean (Admin)
                  </button>
                </div>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Role Category
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['alumni', 'student', 'admin'] as UserRole[]).map((r) => (
                      <button
                        type="button"
                        key={r}
                        onClick={() => setLoginRole(r)}
                        className={`py-1.5 text-xs font-semibold rounded-lg capitalize border ${
                          loginRole === r
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {loginError && (
                  <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg">{loginError}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              {regSuccess ? (
                <div className="py-8 text-center space-y-2">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                  <h3 className="font-bold text-slate-900 text-base">Account Created!</h3>
                  <p className="text-xs text-slate-500 font-mono">DML INSERT executed and synchronized to Firebase Firestore.</p>
                </div>
              ) : (
                <>
                  {/* Autofill Registration Data Buttons */}
                  <div className="bg-blue-50/70 border border-blue-200 p-2.5 rounded-xl space-y-1.5">
                    <span className="text-[11px] font-bold text-blue-900 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Autofill Sample Registration Data:</span>
                    </span>
                    <div className="flex gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={autofillRegistrationAlumni}
                        className="flex-1 py-1.5 px-2 bg-white hover:bg-blue-100 border border-blue-200 rounded-lg font-semibold text-blue-800 text-center transition-colors shadow-2xs"
                      >
                        ✨ Autofill as Alumnus
                      </button>
                      <button
                        type="button"
                        onClick={autofillRegistrationStudent}
                        className="flex-1 py-1.5 px-2 bg-white hover:bg-blue-100 border border-blue-200 rounded-lg font-semibold text-blue-800 text-center transition-colors shadow-2xs"
                      >
                        ✨ Autofill as Student
                      </button>
                    </div>
                  </div>

                  {regError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>{regError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Full Name *</label>
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        required
                        placeholder="Alex Morgan"
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Email Address *</label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                        placeholder="alex@example.com"
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Department</label>
                      <select
                        value={regDepartment}
                        onChange={(e) => setRegDepartment(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="Computer Science">Computer Science</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                        <option value="Electrical Engineering">Electrical Engineering</option>
                        <option value="Biotechnology">Biotechnology</option>
                        <option value="Data Science">Data Science</option>
                        <option value="Business Administration">Business Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Graduation Year</label>
                      <input
                        type="number"
                        min="1960"
                        max="2030"
                        value={regGradYear}
                        onChange={(e) => setRegGradYear(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Company / Org</label>
                      <input
                        type="text"
                        value={regCompany}
                        onChange={(e) => setRegCompany(e.target.value)}
                        placeholder="e.g. Apple, Stripe, MIT"
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Role / Title</label>
                      <input
                        type="text"
                        value={regDesignation}
                        onChange={(e) => setRegDesignation(e.target.value)}
                        placeholder="e.g. Software Engineer"
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Member Type</label>
                    <div className="flex gap-2">
                      {(['alumni', 'student'] as UserRole[]).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRegRole(r)}
                          className={`flex-1 py-1.5 text-xs rounded-lg border capitalize cursor-pointer ${
                            regRole === r ? 'bg-slate-900 text-white border-slate-900 font-semibold' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Register Account (DML INSERT)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
