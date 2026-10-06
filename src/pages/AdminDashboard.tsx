import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Database,
  Cpu,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { api } from '../services/api';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resetMsg, setResetMsg] = useState('');

  const loadAdmin = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminDashboard();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmin();
  }, []);

  const handleResetSeed = async () => {
    if (!confirm('Reset entire system database to clean default seed data? All active sessions and attempts will reset.')) return;
    try {
      const res = await api.resetDatabase();
      setResetMsg(res.message);
      loadAdmin();
    } catch (e) {
      alert('Reset failed');
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const users = data?.users || [];
  const hardware = data?.hardware || {};

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">
            System Administration
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">
            Admin Console & System Health
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Platform governance, user credentials, database maintenance, and IoT Station telemetry
          </p>
        </div>

        <button
          onClick={handleResetSeed}
          className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Reset Database to Seed</span>
        </button>
      </div>

      {resetMsg && (
        <div className="rounded-2xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 border border-emerald-200">
          {resetMsg}
        </div>
      )}

      {/* STATS STRIP */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Total Registered Users</span>
          <p className="mt-2 text-2xl font-black text-slate-900">{stats.totalUsers || users.length}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {stats.studentsCount} Students • {stats.teachersCount} Teachers
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Total Assessments</span>
          <p className="mt-2 text-2xl font-black text-cyan-600">{stats.totalAssessments || 0}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Continuous adaptive logs</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Question Bank</span>
          <p className="mt-2 text-2xl font-black text-purple-600">{stats.totalQuestions || 0} Items</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Across 4 STEM disciplines</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Station Hardware</span>
          <p className="mt-2 text-2xl font-black text-emerald-600">{stats.hardwareStationStatus || 'ONLINE'}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Raspberry Pi 5 Hub</p>
        </div>
      </div>

      {/* USER MANAGEMENT TABLE */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900">User Account Registry</h2>
          <span className="text-xs text-slate-500">{users.length} accounts configured</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
              <tr>
                <th className="pb-3">Name</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Institution</th>
                <th className="pb-3">Linking Code</th>
                <th className="pb-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.map((u: any) => (
                <tr key={u._id} className="hover:bg-slate-50">
                  <td className="py-3 font-bold text-slate-900">{u.name}</td>
                  <td className="py-3">{u.email}</td>
                  <td className="py-3">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : u.role === 'teacher'
                          ? 'bg-blue-100 text-blue-800'
                          : u.role === 'parent'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-cyan-100 text-cyan-800'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3">{u.institution || 'Apex STEM Academy'}</td>
                  <td className="py-3 font-mono text-[11px] text-cyan-800 font-bold">
                    {u.studentLinkingCode || '—'}
                  </td>
                  <td className="py-3 text-slate-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
