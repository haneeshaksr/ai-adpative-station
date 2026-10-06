import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Users,
  Target,
  BarChart3,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Search,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { Question } from '../types';

export const TeacherDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'question-bank' | 'students'>('overview');

  // New question form state
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [newSubject, setNewSubject] = useState('Mathematics');
  const [newChapter, setNewChapter] = useState('Algebra');
  const [newTopic, setNewTopic] = useState('Quadratic Equations');
  const [newDifficulty, setNewDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newOptions, setNewOptions] = useState(['', '', '', '']);
  const [newCorrectAnswer, setNewCorrectAnswer] = useState(0);
  const [newExplanation, setNewExplanation] = useState('');
  const [formErr, setFormErr] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashRes, qRes] = await Promise.all([
        api.getTeacherDashboard(),
        api.getQuestions(),
      ]);
      setDashboardData(dashRes);
      setQuestions(qRes.questions || []);
    } catch (e) {
      console.error('Failed to load teacher data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr('');
    if (!newQuestionText.trim() || newOptions.some((o) => !o.trim())) {
      setFormErr('Please provide question text and all 4 options');
      return;
    }
    try {
      await api.createQuestion({
        subject: newSubject,
        chapter: newChapter,
        topic: newTopic,
        difficulty: newDifficulty,
        question: newQuestionText,
        options: newOptions,
        correctAnswer: newCorrectAnswer,
        explanation: newExplanation || 'Teacher verified solution.',
        marks: 3,
        timeLimitSeconds: 75,
      });
      setShowAddQuestionModal(false);
      setNewQuestionText('');
      setNewOptions(['', '', '', '']);
      setNewExplanation('');
      loadData();
    } catch (err: any) {
      setFormErr(err.message || 'Failed to create question');
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question from the Question Bank?')) return;
    try {
      await api.deleteQuestion(id);
      setQuestions((prev) => prev.filter((q) => q._id !== id));
    } catch (e) {
      alert('Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  const metrics = dashboardData?.metrics || {
    totalStudents: 5,
    averageClassPerformance: 74,
    totalAssessmentsCompleted: 14,
    totalQuestionsInBank: questions.length,
    attentionRequiredCount: 2,
  };

  const topicDifficulties = dashboardData?.topicDifficulties || [];
  const students = dashboardData?.students || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">
            Instructor Control Center
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">
            Teacher Dashboard & Question Bank
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Classroom aggregate competency heatmaps, question authoring, and student intervention
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                activeTab === 'overview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Class Overview
            </button>
            <button
              onClick={() => setActiveTab('question-bank')}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                activeTab === 'question-bank' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Question Bank ({questions.length})
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                activeTab === 'students' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Student Roster ({students.length})
            </button>
          </div>
        </div>
      </div>

      {/* METRICS STRIP */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Total Enrolled</span>
          <p className="mt-2 text-2xl font-black text-slate-900">{metrics.totalStudents} Students</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Grade 10 STEM Cohort</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Class Average</span>
          <p className="mt-2 text-2xl font-black text-cyan-600">{metrics.averageClassPerformance}%</p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Passing benchmark met</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Attention Required</span>
          <p className="mt-2 text-2xl font-black text-amber-600">{metrics.attentionRequiredCount} Topics</p>
          <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Average mastery &lt; 60%</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Item Bank Size</span>
          <p className="mt-2 text-2xl font-black text-slate-900">{questions.length} Items</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Validated adaptive questions</p>
        </div>
      </div>

      {activeTab === 'overview' && (
        /* CLASS OVERVIEW TAB */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Class Topic Difficulty Heatmap (8 cols) */}
          <div className="lg:col-span-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Class-Wide Topic Mastery Heatmap</h3>
                <p className="text-[11px] text-slate-500">
                  Aggregated mastery across all students to prioritize upcoming classroom lectures
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {topicDifficulties.map((td: any) => (
                <div
                  key={td.topic}
                  className={`rounded-2xl border p-4 flex items-center justify-between ${
                    td.needsIntervention ? 'border-amber-200 bg-amber-50/40' : 'border-slate-100 bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{td.topic}</span>
                      {td.needsIntervention && (
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-bold text-rose-700">
                          Class Action Needed
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Based on {td.studentCount} student assessment records
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-slate-900">{td.averageMastery}%</span>
                    <div className="h-2 w-24 rounded-full bg-slate-200 overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full ${
                          td.averageMastery >= 80
                            ? 'bg-emerald-500'
                            : td.averageMastery >= 60
                            ? 'bg-cyan-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${td.averageMastery}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Teacher Quick Actions
              </h3>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setActiveTab('question-bank');
                    setShowAddQuestionModal(true);
                  }}
                  className="flex w-full items-center justify-between rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-cyan-700"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Add Question to Bank
                  </span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-5 text-xs text-amber-950 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span>Pedagogical Recommendation</span>
              </div>
              <p className="text-[11px] text-amber-900/80 leading-relaxed">
                Over 60% of students show difficulty simplifying double-angle identities in
                Trigonometry. Consider assigning remedial video module #vid_trig_1 before Friday's
                test.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'question-bank' && (
        /* QUESTION BANK TAB (Section 22) */
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Adaptive Question Bank</h2>
              <p className="text-xs text-slate-500">
                Items are served adaptively to students based on dynamic difficulty estimation
              </p>
            </div>

            <button
              onClick={() => setShowAddQuestionModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-700"
            >
              <Plus className="h-4 w-4" />
              <span>Create Question</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {questions.map((q) => (
              <div key={q._id} className="py-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                        {q.subject} • {q.topic}
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                          q.difficulty === 'hard'
                            ? 'bg-rose-100 text-rose-800'
                            : q.difficulty === 'medium'
                            ? 'bg-cyan-100 text-cyan-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {q.difficulty}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900">{q.question}</p>
                  </div>

                  <button
                    onClick={() => handleDeleteQuestion(q._id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    title="Delete Question"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  {q.options.map((opt, i) => (
                    <span
                      key={i}
                      className={`rounded-lg px-2.5 py-1 ${
                        i === q.correctAnswer
                          ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                          : 'bg-slate-50 text-slate-600 border border-slate-100'
                      }`}
                    >
                      {String.fromCharCode(65 + i)}. {opt} {i === q.correctAnswer && '✓'}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        /* STUDENTS ROSTER TAB */
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Enrolled Student Cohort</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="pb-3">Student Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Education Level</th>
                  <th className="pb-3">Streak</th>
                  <th className="pb-3">Assessments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {students.map((s: any) => (
                  <tr key={s._id} className="hover:bg-slate-50">
                    <td className="py-3 font-bold text-slate-900">{s.name}</td>
                    <td className="py-3">{s.email}</td>
                    <td className="py-3">{s.educationLevel}</td>
                    <td className="py-3 font-semibold text-orange-600">{s.streak} Days</td>
                    <td className="py-3">{s.assessmentsCount} completed</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE QUESTION MODAL */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900">Add Question to Item Bank</h3>

            {formErr && (
              <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700">{formErr}</div>
            )}

            <form onSubmit={handleCreateQuestion} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Subject</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  >
                    <option>Mathematics</option>
                    <option>Physics</option>
                    <option>Chemistry</option>
                    <option>Computer Science</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Difficulty</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Topic</label>
                <input
                  type="text"
                  required
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Question Text</label>
                <textarea
                  rows={2}
                  required
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  placeholder="Enter clear, concise question problem..."
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
              </div>

              {/* 4 Options */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">Options (Select Correct)</label>
                {newOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctChoice"
                      checked={newCorrectAnswer === i}
                      onChange={() => setNewCorrectAnswer(i)}
                      className="text-cyan-600 focus:ring-cyan-500"
                    />
                    <input
                      type="text"
                      required
                      value={opt}
                      onChange={(e) => {
                        const copy = [...newOptions];
                        copy[i] = e.target.value;
                        setNewOptions(copy);
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Step-by-Step Explanation</label>
                <textarea
                  rows={2}
                  value={newExplanation}
                  onChange={(e) => setNewExplanation(e.target.value)}
                  placeholder="Explain why the answer is correct for the student review modal..."
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddQuestionModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-cyan-600 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-700"
                >
                  Save to Item Bank
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
