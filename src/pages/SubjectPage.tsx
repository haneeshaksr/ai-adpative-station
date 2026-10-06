import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  ChevronRight,
  Target,
  BrainCircuit,
  Clock,
  Sparkles,
  Play,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api';
import { KnowledgeNode } from '../types';

interface SubjectPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const SubjectPage: React.FC<SubjectPageProps> = ({ onNavigate }) => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [knowledgeProfile, setKnowledgeProfile] = useState<KnowledgeNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [subRes, profRes] = await Promise.all([
          api.getSubjects(),
          api.getKnowledgeProfile().catch(() => ({ profile: [] })),
        ]);
        setSubjects(subRes.subjects);
        setKnowledgeProfile(profRes.profile || []);
      } catch (e) {
        console.error('Failed to load subjects:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  // Calculate subject-level aggregate mastery
  const getSubjectMastery = (subjectName: string) => {
    const nodes = knowledgeProfile.filter(
      (n) => n.subject.toLowerCase() === subjectName.toLowerCase()
    );
    if (nodes.length === 0) return 65;
    return Math.round(nodes.reduce((acc, curr) => acc + curr.mastery, 0) / nodes.length);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">
            Curriculum Catalog
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">
            Core Academic Subjects
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Continuous adaptive learning units across STEM disciplines
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {subjects.map((sub) => {
          const mastery = getSubjectMastery(sub.name);
          const totalChapters = sub.chapters.length;
          const totalTopics = sub.chapters.reduce(
            (acc: number, c: any) => acc + c.topics.length,
            0
          );

          return (
            <div
              key={sub.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:border-cyan-300 hover:shadow-md space-y-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-white font-bold shadow-sm"
                    style={{ backgroundColor: sub.color || '#00E5FF' }}
                  >
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{sub.name}</h2>
                    <p className="text-xs text-slate-500">
                      {totalChapters} Chapters • {totalTopics} Active Topics
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Subject Mastery
                  </span>
                  <p className="text-xl font-extrabold text-slate-900">{mastery}%</p>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Curriculum Coverage</span>
                  <span className="font-semibold text-slate-700">{mastery}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${mastery}%`,
                      backgroundColor: sub.color || '#00E5FF',
                    }}
                  />
                </div>
              </div>

              {/* Chapters list preview */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-2">
                <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Featured Chapters:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {sub.chapters.map((ch: any) => (
                    <div
                      key={ch.name}
                      onClick={() =>
                        onNavigate('learning', { subject: sub.name, chapter: ch.name })
                      }
                      className="cursor-pointer rounded-xl bg-white p-2 border border-slate-200/80 hover:border-cyan-400 hover:bg-cyan-50/40 transition-colors"
                    >
                      <p className="font-bold text-slate-800 truncate">{ch.name}</p>
                      <p className="text-[10px] text-slate-400">{ch.topics.length} topics</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() =>
                    onNavigate('assessments', {
                      subject: sub.name,
                    })
                  }
                  className="flex items-center gap-1.5 text-xs font-bold text-cyan-700 hover:text-cyan-800"
                >
                  <Target className="h-4 w-4" />
                  <span>Take Diagnostic</span>
                </button>

                <button
                  onClick={() => onNavigate('learning', { subject: sub.name })}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
                >
                  <span>Explore Modules</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
