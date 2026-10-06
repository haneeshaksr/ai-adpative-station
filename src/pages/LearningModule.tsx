import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  BookOpen,
  Layers,
  ChevronRight,
  Target,
  Bot,
  Play,
  CheckCircle2,
  Sparkles,
  BarChart2,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { KnowledgeNode } from '../types';

interface LearningModuleProps {
  initialSubject?: string;
  initialTopic?: string;
  onNavigate: (page: string, params?: any) => void;
}

export const LearningModule: React.FC<LearningModuleProps> = ({
  initialSubject,
  initialTopic,
  onNavigate,
}) => {
  const { user } = useAuth();
  const [educationLevel, setEducationLevel] = useState<string>(
    user?.educationLevel || 'Grade 10 / High School'
  );
  const [stream, setStream] = useState<string>(user?.stream || 'Science & Mathematics');
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('math');
  const [selectedChapterName, setSelectedChapterName] = useState<string>('Algebra');
  const [selectedTopicName, setSelectedTopicName] = useState<string>('Quadratic Equations');
  const [knowledgeProfile, setKnowledgeProfile] = useState<KnowledgeNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [subRes, profRes] = await Promise.all([
          api.getSubjects(),
          api.getKnowledgeProfile().catch(() => ({ profile: [] })),
        ]);
        setSubjects(subRes.subjects);
        setKnowledgeProfile(profRes.profile || []);

        if (initialSubject) {
          const matchSub = subRes.subjects.find(
            (s: any) => s.name.toLowerCase() === initialSubject.toLowerCase()
          );
          if (matchSub) {
            setSelectedSubjectId(matchSub.id);
            if (initialTopic) {
              for (const ch of matchSub.chapters) {
                if (ch.topics.some((t: string) => t.toLowerCase() === initialTopic.toLowerCase())) {
                  setSelectedChapterName(ch.name);
                  setSelectedTopicName(initialTopic);
                  break;
                }
              }
            }
          }
        }
      } catch (e) {
        console.error('Failed to load learning data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [initialSubject, initialTopic]);

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  const activeChapter =
    activeSubject?.chapters.find((c: any) => c.name === selectedChapterName) ||
    activeSubject?.chapters[0];

  // Find mastery for current topic
  const currentTopicNode = knowledgeProfile.find(
    (n) => n.topic.toLowerCase() === selectedTopicName.toLowerCase()
  );
  const currentMastery = currentTopicNode ? currentTopicNode.mastery : 65;

  return (
    <div className="space-y-6 pb-12">
      {/* Hierarchy Breadcrumbs & Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1 text-slate-700">
            <GraduationCap className="h-4 w-4 text-cyan-600" />
            {educationLevel}
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-700">{stream}</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-cyan-700 font-bold">{activeSubject?.name}</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">{selectedTopicName}</span>
        </div>

        <h1 className="mt-4 text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">
          Adaptive Learning Exploration
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Hierarchical course progression with real-time competency analysis
        </p>

        {/* Education Level & Stream Pickers */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Education Level
            </label>
            <select
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800"
            >
              <option>Grade 9 / Middle School</option>
              <option>Grade 10 / High School</option>
              <option>Grade 11 / Higher Secondary</option>
              <option>Grade 12 / Pre-University</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Stream / Discipline
            </label>
            <select
              value={stream}
              onChange={(e) => setStream(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800"
            >
              <option>Science & Mathematics</option>
              <option>Computer Science & Engineering</option>
              <option>General STEM</option>
            </select>
          </div>
        </div>
      </div>

      {/* SUBJECTS STRIP */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {subjects.map((s) => {
          const isSelected = s.id === selectedSubjectId;
          return (
            <button
              key={s.id}
              onClick={() => {
                setSelectedSubjectId(s.id);
                setSelectedChapterName(s.chapters[0]?.name || '');
                setSelectedTopicName(s.chapters[0]?.topics[0] || '');
              }}
              className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${
                isSelected
                  ? 'border-cyan-500 bg-cyan-50/80 shadow-xs ring-1 ring-cyan-500'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-white shadow-xs`}
                style={{ backgroundColor: s.color || '#00E5FF' }}
              >
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-slate-900">{s.name}</p>
                <p className="text-[10px] text-slate-500">{s.chapters.length} Chapters</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 2-COLUMN: CHAPTERS & TOPICS (Left) + SELECTED TOPIC DEEP-DIVE (Right) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Chapters and Topics Tree */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
              {activeSubject?.name} Chapters
            </span>
            <span className="text-[10px] text-slate-500">Select to explore</span>
          </div>

          <div className="space-y-3">
            {activeSubject?.chapters.map((ch: any) => {
              const isChapterSelected = ch.name === selectedChapterName;
              return (
                <div key={ch.name} className="rounded-2xl border border-slate-100 overflow-hidden">
                  <button
                    onClick={() => {
                      setSelectedChapterName(ch.name);
                      setSelectedTopicName(ch.topics[0] || '');
                    }}
                    className={`flex w-full items-center justify-between p-3.5 text-left text-xs font-bold transition-colors ${
                      isChapterSelected
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-50 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate">{ch.name}</span>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-mono opacity-80">
                      {ch.topics.length} Topics
                    </span>
                  </button>

                  {isChapterSelected && (
                    <div className="p-2 space-y-1 bg-white">
                      {ch.topics.map((t: string) => {
                        const isTopicActive = t === selectedTopicName;
                        const tNode = knowledgeProfile.find(
                          (n) => n.topic.toLowerCase() === t.toLowerCase()
                        );
                        return (
                          <button
                            key={t}
                            onClick={() => setSelectedTopicName(t)}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors ${
                              isTopicActive
                                ? 'bg-cyan-100 text-cyan-900 font-bold'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span className="truncate">{t}</span>
                            {tNode ? (
                              <span
                                className={`text-[10px] font-bold ${
                                  tNode.mastery >= 80 ? 'text-emerald-600' : 'text-amber-600'
                                }`}
                              >
                                {tNode.mastery}%
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">Ready</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Topic Deep-Dive & Action Console */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-700">
                Active Topic
              </span>
              <h2 className="text-xl font-extrabold text-slate-900">{selectedTopicName}</h2>
              <p className="text-xs text-slate-500">
                Subject: {activeSubject?.name} • Chapter: {selectedChapterName}
              </p>
            </div>

            {/* Current Topic Mastery Card */}
            <div className="flex items-center gap-3 rounded-2xl bg-cyan-50 p-3 border border-cyan-100">
              <div className="text-right">
                <span className="text-[10px] font-semibold text-cyan-800 uppercase">
                  Mastery Level
                </span>
                <p className="text-base font-black text-cyan-950">{currentMastery}%</p>
              </div>
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-cyan-600 text-white font-bold text-xs">
                {currentMastery >= 80 ? 'A+' : currentMastery >= 60 ? 'B' : 'C'}
              </div>
            </div>
          </div>

          {/* Topic Overview Description */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Topic Overview & Learning Objectives
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              This unit investigates mathematical and scientific principles governing{' '}
              <strong>{selectedTopicName}</strong>. Students learn to set up equations, analyze
              invariants, avoid classic calculation traps, and apply computerized models to solve
              engineering questions.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                <span className="text-[10px] text-slate-400">Target Difficulty</span>
                <p className="text-xs font-bold text-slate-800">Adaptive (Easy to Hard)</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                <span className="text-[10px] text-slate-400">Questions in Bank</span>
                <p className="text-xs font-bold text-slate-800">12 Verified Items</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                <span className="text-[10px] text-slate-400">Estimated Duration</span>
                <p className="text-xs font-bold text-slate-800">15 - 25 Minutes</p>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS: Practice, Adaptive Assessment, AI Tutor */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Take Learning Action
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() =>
                  onNavigate('assessments', {
                    subject: activeSubject?.name,
                    chapter: selectedChapterName,
                    topic: selectedTopicName,
                  })
                }
                className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-cyan-600 p-4 text-white shadow-md shadow-cyan-600/20 hover:bg-cyan-700 transition-all text-center"
              >
                <Target className="h-5 w-5" />
                <span className="text-xs font-bold">Start Assessment</span>
                <span className="text-[10px] text-cyan-200">CAT Adaptive Test</span>
              </button>

              <button
                onClick={() =>
                  onNavigate('ai-tutor', {
                    subject: activeSubject?.name,
                    topic: selectedTopicName,
                  })
                }
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-800 shadow-2xs hover:bg-slate-100 transition-all text-center"
              >
                <Bot className="h-5 w-5 text-cyan-600" />
                <span className="text-xs font-bold">Launch AI Tutor</span>
                <span className="text-[10px] text-slate-500">Step-by-step coaching</span>
              </button>

              <button
                onClick={() =>
                  onNavigate('videos', {
                    subject: activeSubject?.name,
                    topic: selectedTopicName,
                  })
                }
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-800 shadow-2xs hover:bg-slate-100 transition-all text-center"
              >
                <Play className="h-5 w-5 text-purple-600 fill-purple-600" />
                <span className="text-xs font-bold">Watch Concept Video</span>
                <span className="text-[10px] text-slate-500">Curated masterclasses</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
