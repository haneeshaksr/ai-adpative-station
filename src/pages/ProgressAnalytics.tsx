import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Target,
  Clock,
  Award,
  Calendar,
  Flame,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface ProgressAnalyticsProps {
  onNavigate: (page: string, params?: any) => void;
}

export const ProgressAnalytics: React.FC<ProgressAnalyticsProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [dateFilter, setDateFilter] = useState<'7d' | '30d' | 'all'>('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await api.getStudentAnalytics();
        setAnalytics(data);
      } catch (e) {
        console.error('Failed to load analytics:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  const monthlyData = analytics?.monthlyProgression || [
    { month: 'Jun', accuracy: 58, score: 62 },
    { month: 'Jul', accuracy: 64, score: 67 },
    { month: 'Aug', accuracy: 71, score: 74 },
    { month: 'Sep', accuracy: 78, score: 81 },
    { month: 'Oct', accuracy: 84, score: 86 },
  ];

  const subjectMastery = analytics?.subjectMastery || [
    { subject: 'Mathematics', mastery: 74, assessments: 12 },
    { subject: 'Physics', mastery: 68, assessments: 8 },
    { subject: 'Chemistry', mastery: 81, assessments: 6 },
    { subject: 'Computer Science', mastery: 88, assessments: 14 },
  ];

  const difficultyStats = analytics?.difficultyDistribution || {
    easy: 18,
    medium: 26,
    hard: 11,
  };
  const totalQuestions =
    difficultyStats.easy + difficultyStats.medium + difficultyStats.hard;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">
            Cognitive Diagnostics
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">
            Progress & Performance Analytics
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Quantitative growth metrics, question accuracy ratios, and difficulty scaling
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
          <button
            onClick={() => setDateFilter('7d')}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              dateFilter === '7d' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setDateFilter('30d')}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              dateFilter === '30d' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setDateFilter('all')}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              dateFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            All-Time
          </button>
        </div>
      </div>

      {/* KEY BENCHMARKS STRIP */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Average Accuracy</span>
            <Target className="h-4 w-4 text-cyan-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{analytics?.averageAccuracy || 76}%</p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
            +14% since diagnostic baseline
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Learning Streak</span>
            <Flame className="h-4 w-4 text-orange-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{user?.streak || 7} Days</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Active habit formation</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Strongest Discipline</span>
            <Award className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-base font-bold text-slate-900 truncate">Computer Science</p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">88% Mastery Level</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Focus Target</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-base font-bold text-slate-900 truncate">Trigonometry</p>
          <p className="text-[10px] text-amber-600 font-semibold mt-0.5">45% (Needs Practice)</p>
        </div>
      </div>

      {/* 2-COLUMN CHARTS: Monthly Progression & Subject Mastery */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Monthly Score Growth (8 cols) */}
        <div className="lg:col-span-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Score & Accuracy Growth Over Time</h3>
              <p className="text-[11px] text-slate-500">
                Evaluation results showing month-over-month cognitive improvement
              </p>
            </div>
            <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
              +24% Improvement
            </span>
          </div>

          {/* Custom SVG Growth Chart */}
          <div className="mt-6 flex h-52 items-end justify-between gap-4 px-4 sm:px-8">
            {monthlyData.map((item: any, i: number) => {
              const height = (item.score / 100) * 100;
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div className="relative flex w-full flex-col items-center">
                    <span className="text-[10px] font-bold text-cyan-800 mb-1">{item.score}%</span>
                    <div
                      style={{ height: `${height * 1.6}px` }}
                      className="w-full max-w-[42px] rounded-t-xl bg-gradient-to-t from-slate-900 via-sky-800 to-cyan-500 shadow-xs"
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-600">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Difficulty Progression Breakdown (4 cols) */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Adaptive Question Tiers</h3>
            <p className="text-[11px] text-slate-500">Item Response Theory distribution</p>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Easy / Foundational</span>
                <span className="text-slate-900 font-bold">{difficultyStats.easy} questions</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${(difficultyStats.easy / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Medium / Standard</span>
                <span className="text-slate-900 font-bold">{difficultyStats.medium} questions</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-cyan-500"
                  style={{ width: `${(difficultyStats.medium / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Hard / Rigorous</span>
                <span className="text-slate-900 font-bold">{difficultyStats.hard} questions</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-rose-500"
                  style={{ width: `${(difficultyStats.hard / totalQuestions) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-cyan-50 p-3.5 border border-cyan-100 text-[11px] text-cyan-900 space-y-1">
            <p className="font-bold">Engine Insight:</p>
            <p className="text-cyan-800">
              You are answering 78% of medium-difficulty questions correctly, triggering automatic
              elevation to Hard Tier assessments in Algebra and CS.
            </p>
          </div>
        </div>
      </div>

      {/* SUBJECT MASTERY BAR GRID */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Subject-Wise Mastery Indices</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {subjectMastery.map((sub: any) => (
            <div key={sub.subject} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{sub.subject}</span>
                <span className="text-xs font-black text-slate-900">{sub.mastery}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    sub.mastery >= 80
                      ? 'bg-emerald-500'
                      : sub.mastery >= 65
                      ? 'bg-cyan-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${sub.mastery}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400">{sub.assessments} assessments logged</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
