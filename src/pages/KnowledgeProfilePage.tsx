import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Search,
  Filter,
  TrendingUp,
  Target,
  Bot,
  Video,
  Award,
  Calendar,
  Sparkles,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { api } from '../services/api';
import { KnowledgeNode } from '../types';

interface KnowledgeProfilePageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const KnowledgeProfilePage: React.FC<KnowledgeProfilePageProps> = ({ onNavigate }) => {
  const [profile, setProfile] = useState<KnowledgeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);

  useEffect(() => {
    const fetchProf = async () => {
      try {
        setLoading(true);
        const res = await api.getKnowledgeProfile();
        setProfile(res.profile || []);
        if (res.profile && res.profile.length > 0) {
          setSelectedNode(res.profile[0]);
        }
      } catch (e) {
        console.error('Failed to load profile:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchProf();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  const filtered = profile.filter((n) => {
    const matchesCat = filterCategory === 'ALL' || n.status === filterCategory;
    const matchesSearch =
      n.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const masteredCount = profile.filter((n) => n.status === 'MASTERED').length;
  const goodCount = profile.filter((n) => n.status === 'GOOD').length;
  const practiceCount = profile.filter((n) => n.status === 'NEEDS PRACTICE').length;
  const attentionCount = profile.filter((n) => n.status === 'NEEDS ATTENTION').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">
            Bayesian Knowledge Tracing
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">
            Student Knowledge Profile
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Continuously updated competency model mapping deep strengths and targeted remediation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('assessments')}
            className="flex items-center gap-1.5 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-cyan-700"
          >
            <Target className="h-4 w-4" />
            <span>Update via Assessment</span>
          </button>
        </div>
      </div>

      {/* CATEGORY COUNTERS STRIP */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          onClick={() => setFilterCategory('MASTERED')}
          className={`rounded-2xl border p-4 text-left transition-all ${
            filterCategory === 'MASTERED'
              ? 'border-emerald-500 bg-emerald-50 shadow-xs ring-1 ring-emerald-500'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
            MASTERED (≥80%)
          </span>
          <p className="mt-1 text-2xl font-black text-slate-900">{masteredCount} Topics</p>
          <p className="text-[10px] text-slate-500 mt-0.5">High retention probability</p>
        </button>

        <button
          onClick={() => setFilterCategory('GOOD')}
          className={`rounded-2xl border p-4 text-left transition-all ${
            filterCategory === 'GOOD'
              ? 'border-cyan-500 bg-cyan-50 shadow-xs ring-1 ring-cyan-500'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <span className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider">
            GOOD (60-79%)
          </span>
          <p className="mt-1 text-2xl font-black text-slate-900">{goodCount} Topics</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Ready for advanced synthesis</p>
        </button>

        <button
          onClick={() => setFilterCategory('NEEDS PRACTICE')}
          className={`rounded-2xl border p-4 text-left transition-all ${
            filterCategory === 'NEEDS PRACTICE'
              ? 'border-amber-500 bg-amber-50 shadow-xs ring-1 ring-amber-500'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
            NEEDS PRACTICE (40-59%)
          </span>
          <p className="mt-1 text-2xl font-black text-slate-900">{practiceCount} Topics</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Problem set reinforcement</p>
        </button>

        <button
          onClick={() => setFilterCategory('NEEDS ATTENTION')}
          className={`rounded-2xl border p-4 text-left transition-all ${
            filterCategory === 'NEEDS ATTENTION'
              ? 'border-rose-500 bg-rose-50 shadow-xs ring-1 ring-rose-500'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">
            NEEDS ATTENTION (&lt;40%)
          </span>
          <p className="mt-1 text-2xl font-black text-slate-900">{attentionCount} Topics</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Urgent remedial guidance</p>
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topic by name or subject (e.g., Trigonometry, Algebra)..."
            className="w-full rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          {filterCategory !== 'ALL' && (
            <button
              onClick={() => setFilterCategory('ALL')}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Clear Filter ({filterCategory})
            </button>
          )}
        </div>
      </div>

      {/* 2-COLUMN: TOPIC GRID (Left) & HISTORICAL PROGRESSION CHART (Right) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left (7 cols): Knowledge Topic Cards */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Assessed Competency Nodes ({filtered.length})
            </span>
            <span className="text-[10px] text-slate-400">Click node to visualize historical trend</span>
          </div>

          <div className="space-y-3">
            {filtered.map((node) => {
              const isSelected = selectedNode?.topic === node.topic;
              return (
                <div
                  key={node.topic}
                  onClick={() => setSelectedNode(node)}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-50/60 shadow-xs ring-1 ring-cyan-500'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{node.topic}</h3>
                      <p className="text-[11px] text-slate-500">
                        Subject: {node.subject} • Assessed {node.assessmentsTaken} times
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${
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
                      <span className="text-base font-black text-slate-900">{node.mastery}%</span>
                    </div>
                  </div>

                  {/* Horizontal progress bar */}
                  <div className="mt-3 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        node.status === 'MASTERED'
                          ? 'bg-emerald-500'
                          : node.status === 'GOOD'
                          ? 'bg-cyan-500'
                          : node.status === 'NEEDS PRACTICE'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${node.mastery}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right (5 cols): Selected Node Historical Trend Analysis */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          {selectedNode ? (
            <>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-700">
                  Historical Mastery Trend
                </span>
                <h2 className="text-lg font-black text-slate-900">{selectedNode.topic}</h2>
                <p className="text-xs text-slate-500">
                  Subject: {selectedNode.subject} • Current Mastery: {selectedNode.mastery}%
                </p>
              </div>

              {/* Progress Chart Visualization */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-3">
                <span className="text-xs font-bold text-slate-800">Mastery Over Time:</span>
                <div className="space-y-2">
                  {selectedNode.history && selectedNode.history.length > 0 ? (
                    selectedNode.history.map((h, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-600">
                          <span className="font-mono">{h.date}</span>
                          <span className="font-bold">{h.mastery}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-cyan-600"
                            style={{ width: `${h.mastery}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">
                      Single assessment recorded. Complete more tests to view trend.
                    </p>
                  )}
                </div>
              </div>

              {/* Remedial Recommendations for this specific node */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Targeted Learning Actions:
                </span>

                <div className="space-y-2">
                  <button
                    onClick={() =>
                      onNavigate('assessments', {
                        subject: selectedNode.subject,
                        topic: selectedNode.topic,
                      })
                    }
                    className="flex w-full items-center justify-between rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-cyan-700 transition-colors"
                  >
                    <span>Retest {selectedNode.topic}</span>
                    <Target className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() =>
                      onNavigate('ai-tutor', {
                        subject: selectedNode.subject,
                        topic: selectedNode.topic,
                      })
                    }
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
                  >
                    <span>Launch AI Tutor for this Topic</span>
                    <Bot className="h-4 w-4 text-cyan-600" />
                  </button>

                  <button
                    onClick={() =>
                      onNavigate('videos', {
                        subject: selectedNode.subject,
                        topic: selectedNode.topic,
                      })
                    }
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
                  >
                    <span>Watch Curated Video</span>
                    <Video className="h-4 w-4 text-purple-600" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p className="py-8 text-center text-xs text-slate-500">
              Select any knowledge node on the left to inspect historical progression.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
