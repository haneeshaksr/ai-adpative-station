import React, { useState, useEffect } from 'react';
import {
  Flame,
  Target,
  BrainCircuit,
  Clock,
  Award,
  ChevronRight,
  Play,
  Bot,
  AlertTriangle,
  CheckCircle,
  Video,
  Sparkles,
  BookOpen,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { KnowledgeNode, Recommendation, AssessmentAttempt } from '../types';

interface StudentDashboardProps {
  onNavigate: (page: string, params?: any) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await api.getStudentDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-500">Loading your knowledge profile...</p>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    overallMastery: 74,
    learningStreak: user?.streak || 7,
    assessmentsCompleted: 14,
    weakTopicsCount: 2,
    masteredTopicsCount: 3,
    learningHours: '18.4',
    recentScore: 85,
  };

  const weakTopics: KnowledgeNode[] = dashboardData?.weakTopics || [];
  const recommendations: Recommendation[] = dashboardData?.recommendations || [];
  const recentAttempts: AssessmentAttempt[] = dashboardData?.recentAttempts || [];
  const weeklyActivity = dashboardData?.weeklyActivity || [];
  const knowledgeNodes: KnowledgeNode[] = dashboardData?.knowledgeNodes || [];

  return (
    <div className="space-y-6 pb-12">
      {/* TOP WELCOME BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-medium text-cyan-300 border border-cyan-400/30">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Personalized Learning Engine Active</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {getGreeting()}, {user?.name || 'Alex'}!
            </h1>
            <p className="max-w-xl text-xs sm:text-sm text-slate-300">
              Your Knowledge Profile reflects continuous mastery updates. You have{' '}
              <strong className="text-cyan-300">{stats.masteredTopicsCount} mastered topics</strong>{' '}
              and <strong className="text-amber-300">{stats.weakTopicsCount} topics</strong> ready
              for targeted improvement.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('assessments')}
              className="flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 hover:scale-[1.01] transition-all"
            >
              <Target className="h-4 w-4" />
              <span>Take Adaptive Assessment</span>
            </button>
            <button
              onClick={() => onNavigate('ai-tutor')}
              className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/80 px-5 py-3 text-xs font-semibold text-white hover:bg-slate-700 transition-all"
            >
              <Bot className="h-4 w-4 text-cyan-400" />
              <span>Ask AI Tutor</span>
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          icon={<BrainCircuit className="h-5 w-5 text-cyan-600" />}
          label="Overall Mastery"
          value={`${stats.overallMastery}%`}
          subtitle="Across all subjects"
          color="cyan"
        />
        <StatCard
          icon={<Flame className="h-5 w-5 text-orange-500" />}
          label="Learning Streak"
          value={`${stats.learningStreak} Days`}
          subtitle="Top 10% consistency"
          color="orange"
        />
        <StatCard
          icon={<Target className="h-5 w-5 text-purple-600" />}
          label="Assessments"
          value={stats.assessmentsCompleted}
          subtitle="Adaptive attempts"
          color="purple"
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}
          label="Needs Attention"
          value={stats.weakTopicsCount}
          subtitle="Remediation queued"
          color="amber"
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-emerald-600" />}
          label="Learning Hours"
          value={`${stats.learningHours} hrs`}
          subtitle="Total platform time"
          color="emerald"
        />
      </div>

      {/* CONTINUE LEARNING BANNER */}
      <div className="rounded-3xl border border-cyan-200/80 bg-gradient-to-r from-cyan-50/90 via-sky-50/60 to-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-700">
              Continue Learning
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Mathematics: Quadratic Equations & Roots
            </h3>
            <p className="text-xs text-slate-600">
              Chapter: Algebra • Current Topic Mastery: 85% • Module progress: 75%
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <span className="text-xs font-bold text-slate-900">75% Complete</span>
              <div className="mt-1 h-2 w-32 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full rounded-full bg-cyan-600 w-3/4" />
              </div>
            </div>

            <button
              onClick={() => onNavigate('learning', { subject: 'Mathematics', topic: 'Quadratic Equations' })}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Resume Study</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2-COLUMN LAYOUT: CHARTS & ATTENTION AREAS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column (8 cols): Charts & Analytics */}
        <div className="lg:col-span-8 space-y-6">
          {/* Weekly Activity Bar Chart */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Weekly Learning Activity</h3>
                <p className="text-[11px] text-slate-500">Minutes invested and daily assessments</p>
              </div>
              <span className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                Last 7 Days
              </span>
            </div>

            {/* Custom SVG Bar Chart */}
            <div className="mt-6 flex h-48 items-end justify-between gap-2 px-2 sm:px-6">
              {weeklyActivity.map((item: any, idx: number) => {
                const heightPercent = Math.min(100, Math.max(15, (item.minutes / 90) * 100));
                return (
                  <div key={idx} className="group flex flex-1 flex-col items-center gap-2">
                    <div className="relative flex w-full flex-col items-center">
                      {/* Tooltip on hover */}
                      <span className="absolute -top-7 rounded-md bg-slate-900 px-1.5 py-0.5 text-[9px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.minutes}m
                      </span>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full max-w-[36px] rounded-t-xl bg-gradient-to-t from-cyan-600 to-sky-400 group-hover:from-cyan-500 group-hover:to-sky-300 transition-all shadow-xs"
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600">{item.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Topic Mastery Distribution */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Topic Mastery Breakdown</h3>
                <p className="text-[11px] text-slate-500">
                  Real-time Bayesian knowledge profile levels
                </p>
              </div>
              <button
                onClick={() => onNavigate('knowledge-profile')}
                className="flex items-center gap-1 text-xs font-semibold text-cyan-700 hover:text-cyan-800"
              >
                <span>Full Profile</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {knowledgeNodes.slice(0, 6).map((node, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-slate-900 truncate">{node.topic}</p>
                    <p className="text-[10px] text-slate-500">{node.subject}</p>
                    <span
                      className={`mt-1 inline-block rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                        node.status === 'MASTERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : node.status === 'GOOD'
                          ? 'bg-cyan-100 text-cyan-800'
                          : node.status === 'NEEDS PRACTICE'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {node.status}
                    </span>
                  </div>

                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-xs border border-slate-200">
                    <span className="text-xs font-extrabold text-slate-900">{node.mastery}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Areas Needing Attention & Personalized Recommendations */}
        <div className="lg:col-span-4 space-y-6">
          {/* Areas Needing Attention */}
          <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-5 shadow-xs">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Areas Needing Attention
              </h3>
            </div>
            <p className="mt-1 text-xs text-amber-900/80">
              Topics flagged with mastery &lt; 60% requiring immediate practice
            </p>

            <div className="mt-4 space-y-3">
              {weakTopics.length === 0 ? (
                <div className="rounded-2xl bg-white p-4 text-center text-xs text-slate-600">
                  <CheckCircle className="mx-auto h-6 w-6 text-emerald-500 mb-1" />
                  Great job! No weak topics detected at this moment.
                </div>
              ) : (
                weakTopics.map((node, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-amber-200/80 bg-white p-3.5 shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{node.topic}</span>
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                        {node.mastery}% Mastery
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Subject: {node.subject} • Last assessed {new Date(node.lastAssessed).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() =>
                          onNavigate('assessments', {
                            subject: node.subject,
                            topic: node.topic,
                          })
                        }
                        className="flex-1 rounded-xl bg-cyan-600 py-1.5 text-center text-[11px] font-bold text-white hover:bg-cyan-700"
                      >
                        Targeted Test
                      </button>
                      <button
                        onClick={() =>
                          onNavigate('ai-tutor', {
                            subject: node.subject,
                            topic: node.topic,
                          })
                        }
                        className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        <Bot className="h-3 w-3 text-cyan-600" />
                        <span>Tutor</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recommended For You */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Recommended For You
                </h3>
              </div>
              <span className="text-[10px] font-bold text-cyan-700">AI-Curated</span>
            </div>

            <div className="mt-3 space-y-2.5">
              {recommendations.length === 0 ? (
                <p className="py-4 text-center text-xs text-slate-500">
                  Complete an assessment to generate new personalized recommendations.
                </p>
              ) : (
                recommendations.map((rec) => (
                  <div
                    key={rec._id}
                    onClick={() => {
                      if (rec.type === 'video') onNavigate('videos', { topic: rec.topic });
                      else if (rec.type === 'ai_tutor') onNavigate('ai-tutor', { topic: rec.topic });
                      else onNavigate('assessments', { topic: rec.topic });
                    }}
                    className="cursor-pointer rounded-2xl border border-slate-100 bg-slate-50 p-3 transition-all hover:border-cyan-300 hover:bg-cyan-50/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 leading-snug">
                        {rec.title}
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">{rec.reason}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-cyan-700 uppercase">
                        {rec.topic}
                      </span>
                      <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-bold text-slate-700 border border-slate-200">
                        {rec.actionText}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY TIMELINE */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Student Activity</h3>
            <p className="text-[11px] text-slate-500">
              Auditable learning trail across quizzes, videos, and AI sessions
            </p>
          </div>
          <button
            onClick={() => onNavigate('analytics')}
            className="text-xs font-semibold text-cyan-700 hover:text-cyan-800"
          >
            View All Activity
          </button>
        </div>

        <div className="mt-4 divide-y divide-slate-100">
          {recentAttempts.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-500">No recent activity recorded.</p>
          ) : (
            recentAttempts.map((att) => (
              <div key={att._id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-100 text-cyan-800">
                    <Target className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Adaptive Assessment: {att.topic}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Subject: {att.subject} • Completed in {Math.round(att.timeTakenSeconds / 60)}m
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      att.score >= 80
                        ? 'bg-emerald-100 text-emerald-800'
                        : att.score >= 60
                        ? 'bg-cyan-100 text-cyan-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    Score: {att.score}%
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(att.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle: string;
  color: 'cyan' | 'orange' | 'purple' | 'amber' | 'emerald';
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subtitle, color }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-xs transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-slate-500">{label}</span>
        <div className="rounded-lg bg-slate-50 p-1.5 border border-slate-100">{icon}</div>
      </div>
      <p className="mt-2 text-xl sm:text-2xl font-black text-slate-900">{value}</p>
      <p className="mt-0.5 text-[10px] text-slate-400 truncate">{subtitle}</p>
    </div>
  );
};
