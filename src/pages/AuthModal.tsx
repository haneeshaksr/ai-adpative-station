import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  Building,
  GraduationCap,
  Sparkles,
  Camera,
  CheckCircle2,
  AlertCircle,
  ScanFace,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
}) => {
  const { login, register, demoLogin } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'face-login'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [institution, setInstitution] = useState('Apex STEM Academy');
  const [educationLevel, setEducationLevel] = useState('Grade 10 / High School');
  const [stream, setStream] = useState('Science & Mathematics');
  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [studentLinkingCode, setStudentLinkingCode] = useState('');
  const [subjectsTaught, setSubjectsTaught] = useState('Mathematics, Physics');

  // Face login concept simulation state
  const [faceScanning, setFaceScanning] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const payload: any = {
        name: fullName,
        email,
        phone,
        password,
        role: selectedRole,
        institution,
        preferredLanguage,
      };

      if (selectedRole === 'student') {
        payload.educationLevel = educationLevel;
        payload.stream = stream;
      } else if (selectedRole === 'parent') {
        payload.studentLinkingCode = studentLinkingCode;
      } else if (selectedRole === 'teacher') {
        payload.subjectsTaught = subjectsTaught.split(',').map((s) => s.trim());
      }

      await register(payload);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemo = async (role: UserRole) => {
    setError('');
    setIsLoading(true);
    try {
      await demoLogin(role);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError('Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriggerFaceScan = () => {
    setFaceScanning(true);
    setError('');
    setTimeout(() => {
      setFaceScanning(false);
      setFaceDetected(true);
      setTimeout(async () => {
        // Auto authenticate as demo student
        await demoLogin('student');
        onClose();
        if (onSuccess) onSuccess();
      }, 1200);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 shadow-sm">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            {mode === 'login'
              ? 'Welcome to Smart Station'
              : mode === 'register'
              ? 'Create Your EdTech Account'
              : 'Face Recognition Biometric Login'}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {mode === 'login'
              ? 'Sign in to access your adaptive learning cycle and Knowledge Profile'
              : mode === 'register'
              ? 'Join as a Student, Teacher, or Parent to personalize the platform'
              : 'MTCNN & FaceNet prototype concept for Raspberry Pi camera module'}
          </p>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Mode Tabs */}
        <div className="mt-5 flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          <button
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`flex-1 rounded-lg py-2 transition-all ${
              mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`flex-1 rounded-lg py-2 transition-all ${
              mode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Register
          </button>
          <button
            onClick={() => {
              setMode('face-login');
              setError('');
            }}
            className={`flex items-center justify-center gap-1.5 flex-1 rounded-lg py-2 transition-all ${
              mode === 'face-login' ? 'bg-white text-cyan-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ScanFace className="h-3.5 w-3.5" />
            <span>Face ID</span>
          </button>
        </div>

        {/* 1-CLICK DEMO SHORTCUTS (VERY USEFUL FOR TESTING) */}
        {mode === 'login' && (
          <div className="mt-4 rounded-2xl bg-cyan-50/70 p-3.5 border border-cyan-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-900 uppercase tracking-wider">
                Instant Demo Access
              </span>
              <span className="text-[10px] text-cyan-700">1-Click Login</span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <button
                type="button"
                onClick={() => handleDemo('student')}
                className="rounded-xl border border-cyan-200 bg-white py-1.5 text-xs font-semibold text-cyan-800 shadow-2xs hover:bg-cyan-100"
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => handleDemo('teacher')}
                className="rounded-xl border border-blue-200 bg-white py-1.5 text-xs font-semibold text-blue-800 shadow-2xs hover:bg-blue-100"
              >
                Teacher
              </button>
              <button
                type="button"
                onClick={() => handleDemo('parent')}
                className="rounded-xl border border-purple-200 bg-white py-1.5 text-xs font-semibold text-purple-800 shadow-2xs hover:bg-purple-100"
              >
                Parent
              </button>
              <button
                type="button"
                onClick={() => handleDemo('admin')}
                className="rounded-xl border border-slate-300 bg-white py-1.5 text-xs font-semibold text-slate-800 shadow-2xs hover:bg-slate-100"
              >
                Admin
              </button>
            </div>
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="mt-4 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Email Address</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs focus:border-cyan-500 focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs focus:border-cyan-500 focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Demo passwords for all accounts: <code className="font-mono text-cyan-700">password123</code>
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white shadow-md shadow-slate-900/10 hover:bg-slate-800 disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Sign In to Station'}
              <ChevronRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="mt-4 space-y-3.5">
            {/* Role Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Registering As:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['student', 'teacher', 'parent'] as UserRole[]).map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setSelectedRole(r)}
                    className={`rounded-xl border py-2 text-xs font-semibold capitalize transition-all ${
                      selectedRole === r
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-800 ring-1 ring-cyan-500'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Full Name</label>
              <div className="relative mt-1">
                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs focus:border-cyan-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-cyan-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-cyan-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a strong password"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-cyan-500 focus:outline-hidden"
              />
            </div>

            {/* Role-Specific Fields */}
            {selectedRole === 'student' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Grade / Level</label>
                    <select
                      value={educationLevel}
                      onChange={(e) => setEducationLevel(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white"
                    >
                      <option>Grade 9</option>
                      <option>Grade 10 / High School</option>
                      <option>Grade 11 / Higher Secondary</option>
                      <option>Grade 12 / Pre-University</option>
                      <option>Undergraduate College</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Stream</label>
                    <select
                      value={stream}
                      onChange={(e) => setStream(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white"
                    >
                      <option>Science & Mathematics</option>
                      <option>Computer Science & Engineering</option>
                      <option>Pre-Medical & Biology</option>
                      <option>General STEM</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Institution / School</label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  />
                </div>
              </>
            )}

            {selectedRole === 'parent' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Student Linking Code (Optional)
                </label>
                <input
                  type="text"
                  value={studentLinkingCode}
                  onChange={(e) => setStudentLinkingCode(e.target.value)}
                  placeholder="e.g. STU-ALEX-9021 (found on student profile)"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs uppercase"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  You can also link students later from the Parent Portal.
                </p>
              </div>
            )}

            {selectedRole === 'teacher' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Subjects Taught (comma-separated)
                </label>
                <input
                  type="text"
                  value={subjectsTaught}
                  onChange={(e) => setSubjectsTaught(e.target.value)}
                  placeholder="Mathematics, Physics, Chemistry"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 py-2.5 text-xs font-semibold text-white shadow-md shadow-cyan-600/20 hover:bg-cyan-700 disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Complete Registration'}
              <ChevronRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* FACE LOGIN CONCEPT (MTCNN + FaceNet Module representation) */}
        {mode === 'face-login' && (
          <div className="mt-5 space-y-4 text-center">
            <div className="relative mx-auto flex h-48 w-48 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-cyan-400 bg-slate-900 p-4 text-slate-300 overflow-hidden shadow-inner">
              {faceScanning && (
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-400 animate-bounce shadow-lg shadow-cyan-400/50" />
              )}

              {faceDetected ? (
                <div className="flex flex-col items-center text-emerald-400 animate-in zoom-in">
                  <CheckCircle2 className="h-12 w-12" />
                  <p className="mt-2 text-xs font-bold text-white">Biometric Match Confirmed</p>
                  <p className="text-[10px] text-emerald-300">Identity: Alex Rivera (Student)</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <ScanFace className={`h-16 w-16 ${faceScanning ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
                  <p className="mt-2 text-[11px] text-slate-400">
                    {faceScanning ? 'Detecting facial landmarks (MTCNN)...' : 'Raspberry Pi Camera Feed Ready'}
                  </p>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-600">
              This module simulates real-time facial feature vector extraction (128-d embeddings) using the station’s IMX708 Camera Module.
            </p>

            <button
              type="button"
              disabled={faceScanning || faceDetected}
              onClick={handleTriggerFaceScan}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 py-2.5 text-xs font-semibold text-white shadow-md shadow-cyan-600/20 hover:bg-cyan-700 disabled:opacity-50"
            >
              <Camera className="h-4 w-4" />
              <span>{faceScanning ? 'Scanning Face...' : faceDetected ? 'Logging in...' : 'Simulate Camera Recognition'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
