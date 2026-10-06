import React, { useState, useEffect } from 'react';
import {
  Users,
  AlertTriangle,
  Award,
  Clock,
  TrendingUp,
  Target,
  CheckCircle2,
  Plus,
  Flame,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { NotificationItem } from '../types';

interface ParentDashboardProps {
  onNavigate: (page: string, params?: any) => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<NotificationItem[]>([]);
  const [linkingCode, setLinkingCode] = useState<string>('');
  const [linkMsg, setLinkMsg] = useState<string>('');
  const [linkErr, setLinkErr] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchParentData = async () => {
    try {
      setLoading(true);
      const data = await api.getParentDashboard();
      setStudents(data.students || []);
      setAlerts(data.alerts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParentData();
  }, []);

  const handleLinkStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkMsg('');
    setLinkErr('');
    try {
      const res = await api.linkStudent(linkingCode);
      setLinkMsg(res.message);
      setLinkingCode('');
      fetchParentData();
    } catch (err: any) {
      setLinkErr(err.message || 'Failed to link student. Verify linking code.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">
            Family Academic Oversight
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">
            Parent Monitoring Portal
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Real-time mastery updates, automated weak-topic alerts, and learning habit consistency
          </p>
        </div>
      </div>

      {/* PARENT SPECIFIC ALERTS BANNER */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert._id}
              className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-950"
            >
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold text-amber-900">{alert.title}</span>
                <p className="mt-0.5 text-amber-800">{alert.message}</p>
              </div>
              <span className="text-[10px] text-amber-700 whitespace-nowrap">
                {new Date(alert.createdAt).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* LINK STUDENT CARD */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
          Link Additional Student
        </h2>
        <p className="text-xs text-slate-500">
          Obtain the student linking code from your child's profile (e.g. STU-ALEX-9021) to connect
          their profile to your parent portal.
        </p>

        {linkMsg && (
          <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200">
            {linkMsg}
          </div>
        )}
        {linkErr && (
          <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-800 border border-rose-200">
            {linkErr}
          </div>
        )}

        <form onSubmit={handleLinkStudent} className="flex gap-2 max-w-md">
          <input
            type="text"
            required
            value={linkingCode}
            onChange={(e) => setLinkingCode(e.target.value)}
            placeholder="Enter Student Code (e.g. STU-ALEX-9021)"
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono uppercase focus:outline-hidden focus:border-cyan-500"
          />
          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
          >
            Link Student
          </button>
        </form>
      </div>

      {/* LINKED STUDENTS CARDS */}
      <div className="space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
          Linked Students ({students.length})
        </h2>

        {students.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
            No students currently linked. Use code <code className="font-mono font-bold text-cyan-700">STU-ALEX-9021</code> above to link demo student Alex Rivera.
          </div>
        ) : (
          students.map((stu) => (
            <div
              key={stu.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6"
            >
              {/* Student Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-900 font-black text-sm">
                    {stu.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{stu.name}</h3>
                    <p className="text-xs text-slate-500">
                      {stu.institution} • {stu.educationLevel}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600 border border-orange-200">
                    <Flame className="h-4 w-4 fill-current" />
                    {stu.streak} Days Streak
                  </span>
                  <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-800 border border-cyan-200">
                    Average Score: {stu.averageScore}%
                  </span>
                </div>
              </div>

              {/* Student Stats & Weak Areas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Weak Topics / Remediation Needed */}
                <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span>Areas Flagged For Parent Support</span>
                  </div>
                  {stu.weakTopics.length === 0 ? (
                    <p className="text-xs text-slate-500">No weak topics requiring urgent parent intervention.</p>
                  ) : (
                    <div className="space-y-2 pt-1">
                      {stu.weakTopics.map((w: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-amber-200 text-xs"
                        >
                          <span className="font-bold text-slate-800">{w.topic}</span>
                          <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                            {w.mastery}% Mastery
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Knowledge Profile Snapshot */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2">
                  <span className="text-xs font-bold text-slate-800">Mastery Snapshot</span>
                  <div className="space-y-2 pt-1">
                    {(stu.knowledgeProfile || []).slice(0, 3).map((node: any, idx: number) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-slate-700">{node.topic}</span>
                          <span className="font-bold text-slate-900">{node.mastery}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-cyan-600"
                            style={{ width: `${node.mastery}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
