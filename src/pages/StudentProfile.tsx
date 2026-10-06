import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  Building,
  GraduationCap,
  Sparkles,
  Flame,
  Award,
  Copy,
  Check,
  CheckCircle2,
  Key,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const StudentProfile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [educationLevel, setEducationLevel] = useState(user?.educationLevel || 'Grade 10 / High School');
  const [stream, setStream] = useState(user?.stream || 'Science & Mathematics');
  const [institution, setInstitution] = useState(user?.institution || 'Apex STEM Academy');
  const [preferredLanguage, setPreferredLanguage] = useState(user?.preferredLanguage || 'English');
  const [copied, setCopied] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const handleCopyCode = () => {
    if (!user?.studentLinkingCode) return;
    navigator.clipboard.writeText(user.studentLinkingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMsg('');
    try {
      await updateProfile({
        name,
        phone,
        educationLevel,
        stream,
        institution,
        preferredLanguage,
      });
      setSaveMsg('Profile updated successfully!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (e) {
      alert('Failed to update profile');
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">
          Account & Academic Credentials
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">
          Student Profile
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Manage your personal details, academic curriculum stream, and parent linking credentials
        </p>
      </div>

      {saveMsg && (
        <div className="rounded-2xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{saveMsg}</span>
        </div>
      )}

      {/* STUDENT LINKING CODE HERO CARD */}
      {user?.role === 'student' && (
        <div className="rounded-3xl border border-cyan-200 bg-gradient-to-r from-cyan-50 via-sky-50 to-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-cyan-900 font-bold text-xs uppercase tracking-wider">
              <Key className="h-4 w-4 text-cyan-600" />
              <span>Parent Linking Code</span>
            </div>
            <p className="text-xs text-slate-600 max-w-md">
              Share this code with your parents so they can link to your academic progress from the
              Parent Dashboard.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-2xl bg-white px-4 py-2.5 font-mono text-sm font-black text-slate-900 border border-slate-200 shadow-2xs">
              {user.studentLinkingCode || 'STU-ALEX-9021'}
            </span>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
        </div>
      )}

      {/* EDIT PROFILE FORM */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <h2 className="text-base font-bold text-slate-900">Academic & Personal Information</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
              />
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Education Level</label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white"
              >
                <option>Grade 9 / Middle School</option>
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
            <label className="block text-xs font-semibold text-slate-700">Preferred Language</label>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white max-w-xs"
            >
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
              <option>Hindi</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="rounded-xl bg-cyan-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-cyan-600/20 hover:bg-cyan-700"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
