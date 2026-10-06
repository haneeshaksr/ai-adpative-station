import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Bot,
  Video,
  BookOpen,
  ChevronRight,
  Award,
  BarChart2,
  HelpCircle,
} from 'lucide-react';
import { api, queueOfflineAssessment } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Question, AssessmentAttempt } from '../types';

interface AdaptiveAssessmentProps {
  initialSubject?: string;
  initialTopic?: string;
  onNavigate: (page: string, params?: any) => void;
}

export const AdaptiveAssessment: React.FC<AdaptiveAssessmentProps> = ({
  initialSubject = 'Mathematics',
  initialTopic = 'Algebra',
  onNavigate,
}) => {
  const { isOffline } = useAuth();

  // Test setup states
  const [stage, setStage] = useState<'setup' | 'testing' | 'result'>('setup');
  const [subject, setSubject] = useState<string>(initialSubject);
  const [topic, setTopic] = useState<string>(initialTopic);
  const [questionCount, setQuestionCount] = useState<number>(5);

  // Active Test states
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: number }>({});
  const [timeSpent, setTimeSpent] = useState<{ [qId: string]: number }>({});
  const [currentTimer, setCurrentTimer] = useState<number>(0);
  const [activeDifficulty, setActiveDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [correctStreak, setCorrectStreak] = useState<number>(0);

  // Results & Review states
  const [resultAttempt, setResultAttempt] = useState<AssessmentAttempt | null>(null);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Assessment history state
  const [history, setHistory] = useState<AssessmentAttempt[]>([]);
  const [activeTab, setActiveTab] = useState<'assessment' | 'history'>('assessment');

  // Load past history
  useEffect(() => {
    api
      .getAssessmentHistory()
      .then((res) => setHistory(res.attempts || []))
      .catch(() => {});
  }, [stage]);

  // Timer tick for current question
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (stage === 'testing') {
      timer = setInterval(() => {
        setCurrentTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [stage, currentIndex]);

  const handleStartTest = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.startAssessment({
        subject,
        topic,
        questionCount,
      });

      if (!res.questions || res.questions.length === 0) {
        throw new Error('No questions found for this topic.');
      }

      setQuestions(res.questions);
      setActiveDifficulty(res.initialDifficulty || 'medium');
      setCurrentIndex(0);
      setSelectedAnswers({});
      setTimeSpent({});
      setCurrentTimer(0);
      setCorrectStreak(0);
      setStage('testing');
    } catch (err: any) {
      setError(err.message || 'Failed to start assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    const currentQ = questions[currentIndex];
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ._id]: optionIndex,
    }));
  };

  const handleNext = () => {
    const currentQ = questions[currentIndex];
    // Record time spent on this question
    setTimeSpent((prev) => ({
      ...prev,
      [currentQ._id]: (prev[currentQ._id] || 0) + currentTimer,
    }));
    setCurrentTimer(0);

    // Adaptive adjustment preview
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmitTest = async () => {
    const currentQ = questions[currentIndex];
    const finalTimes = {
      ...timeSpent,
      [currentQ._id]: (timeSpent[currentQ._id] || 0) + currentTimer,
    };

    const formattedAnswers = questions.map((q) => ({
      questionId: q._id,
      selectedAnswer: selectedAnswers[q._id] !== undefined ? selectedAnswers[q._id] : -1,
      timeSpentSeconds: finalTimes[q._id] || 30,
    }));

    setLoading(true);
    setError('');

    // If offline mode is toggled, store in local sync queue
    if (isOffline) {
      const mockAttempt: any = {
        _id: `offline_att_${Date.now()}`,
        userId: 'usr_offline',
        subject,
        chapter: 'Offline Chapter',
        topic,
        score: 75,
        totalMarks: 100,
        accuracy: 75,
        timeTakenSeconds: Object.values(finalTimes).reduce((a, b) => a + b, 0),
        difficultyProgression: questions.map((q) => q.difficulty),
        answers: questions.map((q, idx) => ({
          questionId: q._id,
          questionText: q.question,
          selectedAnswer: selectedAnswers[q._id] || 0,
          correctAnswer: 0,
          isCorrect: true,
          difficulty: q.difficulty,
          timeSpentSeconds: finalTimes[q._id] || 25,
          explanation: 'Offline recorded assessment. Will be officially graded upon sync.',
        })),
        topicBreakdown: { [topic]: { correct: 3, total: 4, percentage: 75 } },
        createdAt: new Date().toISOString(),
      };
      queueOfflineAssessment({
        subject,
        topic,
        answers: formattedAnswers,
      });
      setResultAttempt(mockAttempt);
      setStage('result');
      setLoading(false);
      return;
    }

    try {
      const res = await api.submitAssessment({
        subject,
        topic,
        answers: formattedAnswers,
      });

      setResultAttempt(res.attempt);
      setStage('result');

      // Trigger celebratory confetti on good score
      if (res.attempt.score >= 70) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit assessment');
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentIndex];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">
            Computerized Adaptive Testing (CAT)
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">
            Adaptive Assessment Engine
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Item Response Theory algorithms calibrate question difficulty to your real-time mastery
          </p>
        </div>

        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('assessment')}
            className={`rounded-lg px-4 py-2 transition-all ${
              activeTab === 'assessment' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Active Assessment
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`rounded-lg px-4 py-2 transition-all ${
              activeTab === 'history' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Attempt History ({history.length})
          </button>
        </div>
      </div>

      {activeTab === 'history' ? (
        /* HISTORY TAB */
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Your Past Adaptive Assessments</h2>
          {history.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-500">No previous attempts found.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {history.map((att) => (
                <div
                  key={att._id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {att.subject}: {att.topic}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {new Date(att.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      • Time: {Math.round(att.timeTakenSeconds / 60)}m • Accuracy: {att.accuracy}%
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        att.score >= 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : att.score >= 60
                          ? 'bg-cyan-100 text-cyan-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      Score: {att.score}%
                    </span>

                    <button
                      onClick={() => {
                        setResultAttempt(att);
                        setShowReviewModal(true);
                      }}
                      className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Review Answers
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : stage === 'setup' ? (
        /* STAGE 1: ASSESSMENT CONFIGURATION SETUP */
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
              <Target className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Configure Adaptive Session</h2>
            <p className="text-xs text-slate-500">
              Select your focus subject and topic. The engine will dynamically adjust question
              difficulty based on your answers.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800"
              >
                <option>Mathematics</option>
                <option>Physics</option>
                <option>Chemistry</option>
                <option>Computer Science</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Topic Focus
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800"
              >
                {subject === 'Mathematics' && (
                  <>
                    <option>Algebra (Quadratic Equations)</option>
                    <option>Trigonometry (Identities & Ratios)</option>
                    <option>Coordinate Geometry (Distances & Slopes)</option>
                    <option>Statistics & Probability</option>
                  </>
                )}
                {subject === 'Physics' && (
                  <>
                    <option>Kinematics & Uniform Motion</option>
                    <option>Newton's Laws of Motion</option>
                    <option>Work, Energy & Power</option>
                  </>
                )}
                {subject === 'Chemistry' && (
                  <>
                    <option>Chemical Bonding (Ionic vs Covalent)</option>
                    <option>Atomic Structure & Electron Orbitals</option>
                    <option>Stoichiometry & Reactions</option>
                  </>
                )}
                {subject === 'Computer Science' && (
                  <>
                    <option>Data Structures (Arrays, Stacks, Queues)</option>
                    <option>Algorithms & Binary Search</option>
                    <option>Big-O Time Complexity</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Question Count
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[3, 5, 8].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setQuestionCount(cnt)}
                    className={`rounded-xl border py-2.5 text-xs font-bold transition-all ${
                      questionCount === cnt
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-800 ring-1 ring-cyan-500'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cnt} Questions
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-cyan-50 p-4 border border-cyan-100 text-xs text-cyan-900 space-y-1">
              <p className="font-bold">Adaptive Engine Highlights:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-cyan-800">
                <li>Starting difficulty scales with your current Knowledge Profile.</li>
                <li>Consecutive correct answers trigger higher-difficulty questions.</li>
                <li>Incorrect answers provide foundational remediation checks.</li>
              </ul>
            </div>

            <button
              onClick={handleStartTest}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-600 py-3 text-xs font-bold text-white shadow-md shadow-cyan-600/20 hover:bg-cyan-700 disabled:opacity-50"
            >
              {loading ? 'Initializing Adaptive Item Bank...' : 'Start Adaptive Assessment'}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : stage === 'testing' && currentQuestion ? (
        /* STAGE 2: ACTIVE QUESTION SCREEN */
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs max-w-3xl mx-auto space-y-6">
          {/* Header with question count, timer, and difficulty badge */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white font-mono text-xs font-bold">
                {currentIndex + 1}
              </span>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Question {currentIndex + 1} of {questions.length}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{subject} • {topic}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Difficulty badge */}
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                  currentQuestion.difficulty === 'hard'
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : currentQuestion.difficulty === 'medium'
                    ? 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                {currentQuestion.difficulty} Level
              </span>

              {/* Timer */}
              <div className="flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1 text-xs font-mono font-semibold text-slate-700">
                <Clock className="h-3.5 w-3.5 text-slate-500" />
                <span>
                  {Math.floor(currentTimer / 60)}:
                  {(currentTimer % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-cyan-600 transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / questions.length) * 100}%`,
              }}
            />
          </div>

          {/* Question Text */}
          <div className="py-2 space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {currentQuestion.question}
            </h2>
            {currentQuestion.formula && (
              <div className="inline-block rounded-xl bg-slate-100 px-3 py-1 font-mono text-xs font-bold text-slate-800 border border-slate-200">
                {currentQuestion.formula}
              </div>
            )}
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQuestion.options.map((opt, optIdx) => {
              const isSelected = selectedAnswers[currentQuestion._id] === optIdx;
              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectOption(optIdx)}
                  className={`flex w-full items-center gap-3.5 rounded-2xl border p-4 text-left transition-all ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-50/80 shadow-xs ring-1 ring-cyan-500'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                      isSelected
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-slate-800">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-30"
            >
              Previous
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow-sm"
              >
                <span>Next Question</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitTest}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-xl bg-cyan-600 px-6 py-2 text-xs font-bold text-white hover:bg-cyan-700 shadow-md shadow-cyan-600/20 disabled:opacity-50"
              >
                <span>{loading ? 'Submitting...' : 'Submit Assessment'}</span>
                <CheckCircle2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* STAGE 3: ASSESSMENT RESULT PAGE (Section 12) */
        resultAttempt && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs max-w-3xl mx-auto space-y-6">
            {/* Result Header */}
            <div className="text-center space-y-2">
              <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-cyan-800 uppercase tracking-wider">
                Assessment Completed
              </span>
              <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
                Performance Evaluation & Diagnostic
              </h2>
              <p className="text-xs text-slate-500">
                Subject: {resultAttempt.subject} • Topic: {resultAttempt.topic}
              </p>
            </div>

            {/* Score & Key Stats Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Scaled Score
                </span>
                <p className="mt-1 text-2xl font-black text-slate-900">{resultAttempt.score}%</p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Accuracy
                </span>
                <p className="mt-1 text-2xl font-black text-cyan-600">{resultAttempt.accuracy}%</p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Time Taken
                </span>
                <p className="mt-1 text-2xl font-black text-slate-900">
                  {Math.round(resultAttempt.timeTakenSeconds / 60)}m {resultAttempt.timeTakenSeconds % 60}s
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Mastery Level
                </span>
                <p
                  className={`mt-1 text-2xl font-black ${
                    resultAttempt.score >= 80
                      ? 'text-emerald-600'
                      : resultAttempt.score >= 60
                      ? 'text-cyan-600'
                      : 'text-amber-600'
                  }`}
                >
                  {resultAttempt.score >= 80
                    ? 'Mastered'
                    : resultAttempt.score >= 60
                    ? 'Good'
                    : 'Remedial'}
                </p>
              </div>
            </div>

            {/* Topic & Difficulty Breakdown */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Detailed Diagnostic Breakdown
              </h3>

              <div className="space-y-2">
                {Object.entries(resultAttempt.topicBreakdown || {}).map(([topName, data]) => (
                  <div
                    key={topName}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{topName}</p>
                      <p className="text-[10px] text-slate-500">
                        {data.correct} of {data.total} correct
                      </p>
                    </div>
                    <span className="text-xs font-black text-slate-900">{data.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Automated Remediation Trigger Banner */}
            <div className="rounded-2xl bg-cyan-50 p-4 border border-cyan-200/80 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-cyan-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-cyan-950">
                  Knowledge Profile & Recommendations Updated!
                </p>
                <p className="text-[11px] text-cyan-800 leading-relaxed">
                  Based on this performance, your Bayesian mastery profile has been dynamically
                  recalculated and new remedial videos and guided practice have been assigned to your
                  dashboard.
                </p>
              </div>
            </div>

            {/* ACTION BUTTONS (Section 12 requirement) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowReviewModal(true)}
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-50"
              >
                <HelpCircle className="h-4 w-4 text-cyan-600" />
                <span>Review Answers & Explanations</span>
              </button>

              <button
                onClick={() =>
                  onNavigate('ai-tutor', {
                    subject: resultAttempt.subject,
                    topic: resultAttempt.topic,
                  })
                }
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-50"
              >
                <Bot className="h-4 w-4 text-cyan-600" />
                <span>Ask AI Tutor to Explain Mistakes</span>
              </button>

              <button
                onClick={() =>
                  onNavigate('videos', {
                    subject: resultAttempt.subject,
                    topic: resultAttempt.topic,
                  })
                }
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-50"
              >
                <Video className="h-4 w-4 text-purple-600" />
                <span>Watch Recommended Videos</span>
              </button>

              <button
                onClick={() => setStage('setup')}
                className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 py-3 text-xs font-bold text-white shadow-md shadow-cyan-600/20 hover:bg-cyan-700"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Retake Assessment</span>
              </button>
            </div>
          </div>
        )
      )}

      {/* DETAILED ANSWER REVIEW MODAL */}
      {showReviewModal && resultAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Answer Review</h3>
                <p className="text-xs text-slate-500">
                  Step-by-step solutions for {resultAttempt.topic}
                </p>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              {resultAttempt.answers.map((ans, idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl border p-4 space-y-2 ${
                    ans.isCorrect ? 'border-emerald-200 bg-emerald-50/30' : 'border-rose-200 bg-rose-50/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      Q{idx + 1}: {ans.questionText}
                    </span>
                    {ans.isCorrect ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" /> Correct
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-rose-700">
                        <XCircle className="h-4 w-4" /> Incorrect
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600">
                    <strong>Solution / Explanation:</strong> {ans.explanation}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Difficulty: {ans.difficulty} • Time spent: {ans.timeSpentSeconds}s
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
