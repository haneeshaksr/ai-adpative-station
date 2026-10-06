import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  HelpCircle,
  Lightbulb,
  FileText,
  Calculator,
  RotateCcw,
  BookOpen,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Atom,
  Target,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  followUps?: string[];
  action?: any;
  source?: 'gemini' | 'rule_fallback';
  timestamp: string;
}

interface AITutorPageProps {
  initialSubject?: string;
  initialTopic?: string;
  onNavigate: (page: string, params?: any) => void;
}

export const AITutorPage: React.FC<AITutorPageProps> = ({
  initialSubject = 'Mathematics',
  initialTopic = 'Algebra',
  onNavigate,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'chat' | 'formulas'>('chat');
  const [subject, setSubject] = useState<string>(initialSubject);
  const [topic, setTopic] = useState<string>(initialTopic);

  // Chat states
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'tutor',
      text: `Hello ${user?.name || 'Alex'}! I am your AI Tutor on the Smart Learning Station. I see you're currently working on **${initialTopic}** in ${initialSubject}. How can I help you master this concept today?`,
      followUps: [
        `Explain ${initialTopic} step-by-step`,
        `Give me a real-world example`,
        `Give me a practice question with hint`,
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Formula Explainer state
  const [formulaInput, setFormulaInput] = useState<string>('x = (-b ± √(b² - 4ac)) / (2a)');
  const [formulaExplanation, setFormulaExplanation] = useState<string>('');
  const [formulaLoading, setFormulaLoading] = useState<boolean>(false);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (messageText?: string, mode: string = 'chat') => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim() || isSending) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsSending(true);

    try {
      const res = await api.askAITutor(textToSend, subject, topic, mode);
      const tutorMsg: Message = {
        id: `t_${Date.now()}`,
        sender: 'tutor',
        text: res.reply,
        followUps: res.followUpSuggestions,
        action: res.recommendedAction,
        source: res.source,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, tutorMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err_${Date.now()}`,
        sender: 'tutor',
        text: 'I encountered a brief connection delay. Here is an essential summary: focus on isolating variables and validating dimensions step by step.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleExplainFormula = async (fText?: string) => {
    const target = fText || formulaInput;
    setFormulaLoading(true);
    try {
      const res = await api.explainFormula(target, topic, subject);
      setFormulaExplanation(res.reply);
    } catch (e) {
      setFormulaExplanation(
        'Formula derivation failed to load. Please check network connectivity.'
      );
    } finally {
      setFormulaLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">
              Personalized AI Pedagogical Coach
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">
            AI Tutor & Formula Explainer
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Powered by Gemini 3.8 Flash • Infused with your current Knowledge Profile context
          </p>
        </div>

        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('chat')}
            className={`rounded-lg px-4 py-2 transition-all ${
              activeTab === 'chat' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Interactive Tutor Chat
          </button>
          <button
            onClick={() => {
              setActiveTab('formulas');
              if (!formulaExplanation) handleExplainFormula();
            }}
            className={`rounded-lg px-4 py-2 transition-all ${
              activeTab === 'formulas' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Formula & Concept Studio
          </button>
        </div>
      </div>

      {/* STUDENT CONTEXT BANNER (Requirement: AI Tutor must display & utilize student context) */}
      <div className="rounded-2xl border border-cyan-200 bg-cyan-50/70 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-600 text-white font-bold">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-800">
              Active Context:
            </span>
            <p className="font-bold text-slate-900">
              {subject} • {topic} (Education Level: {user?.educationLevel || 'Grade 10'})
            </p>
          </div>
        </div>

        {/* Quick Topic Switcher Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="rounded-xl border border-cyan-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700"
          >
            <option>Mathematics</option>
            <option>Physics</option>
            <option>Chemistry</option>
            <option>Computer Science</option>
          </select>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="rounded-xl border border-cyan-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 max-w-[140px]"
            placeholder="Topic"
          />
        </div>
      </div>

      {activeTab === 'chat' ? (
        /* CHAT TAB */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Main Chat Stream (8 cols) */}
          <div className="lg:col-span-8 flex flex-col h-[650px] rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1 text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-600">
                      {msg.sender === 'user' ? user?.name || 'You' : 'AI Tutor'}
                    </span>
                    <span>{msg.timestamp}</span>
                    {msg.source && (
                      <span className="rounded bg-slate-100 px-1 text-[9px] font-mono text-slate-500">
                        {msg.source === 'gemini' ? 'Gemini 3.8' : 'Pedagogical Engine'}
                      </span>
                    )}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-3xl p-4 text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-slate-900 text-white rounded-tr-none'
                        : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none whitespace-pre-wrap'
                    }`}
                  >
                    {msg.text}

                    {/* Action link if generated */}
                    {msg.action && (
                      <div className="mt-3 pt-3 border-t border-slate-200/60">
                        <button
                          onClick={() => onNavigate(msg.action.url.replace('/', ''))}
                          className="flex items-center gap-1.5 text-xs font-bold text-cyan-700 hover:text-cyan-800"
                        >
                          <span>{msg.action.title}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Follow-up suggestions */}
                  {msg.followUps && msg.followUps.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {msg.followUps.map((fu, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(fu)}
                          className="rounded-full border border-cyan-200 bg-cyan-50/70 px-2.5 py-1 text-[11px] font-medium text-cyan-800 hover:bg-cyan-100 transition-colors"
                        >
                          {fu}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isSending && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="h-2 w-2 rounded-full bg-cyan-500 animate-bounce" />
                  <div className="h-2 w-2 rounded-full bg-cyan-500 animate-bounce delay-100" />
                  <div className="h-2 w-2 rounded-full bg-cyan-500 animate-bounce delay-200" />
                  <span className="text-[11px]">AI Tutor is synthesizing guidance...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 sm:p-4 border-t border-slate-100 bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Ask anything about ${topic} or request an intuitive example...`}
                  className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-cyan-500 focus:outline-hidden"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isSending}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-600 text-white shadow-md shadow-cyan-600/20 hover:bg-cyan-700 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Quick Educational Prompts & Tools (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <span>Quick Prompt Presets</span>
              </div>
              <p className="text-[11px] text-slate-500">
                1-Click triggers for standard pedagogical actions
              </p>

              <div className="space-y-2">
                {[
                  {
                    label: 'Explain This Topic Step-by-Step',
                    prompt: `Explain ${topic} step-by-step from foundational first principles.`,
                  },
                  {
                    label: 'Give Me an Intuitive Real Example',
                    prompt: `Give me an intuitive real-world application of ${topic} with concrete numbers.`,
                  },
                  {
                    label: 'Give Me a Hint on Common Mistakes',
                    prompt: `What are the top 3 mistakes students make when solving ${topic} questions?`,
                  },
                  {
                    label: 'Generate a Guided Practice Question',
                    prompt: `Give me a medium difficulty practice question on ${topic} without revealing the answer immediately.`,
                  },
                  {
                    label: 'Summarize Key Takeaways',
                    prompt: `Summarize the essential rules and formulas of ${topic} into 4 bullet points.`,
                  },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(preset.prompt)}
                    className="w-full text-left rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs font-semibold text-slate-700 hover:border-cyan-300 hover:bg-cyan-50/50 transition-all flex items-center justify-between"
                  >
                    <span className="truncate">{preset.label}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Practice Link Card */}
            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 to-sky-950 p-5 text-white shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                  Ready to Test?
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Take an adaptive CAT test on {topic} right now to measure your updated retention.
              </p>
              <button
                onClick={() => onNavigate('assessments', { subject, topic })}
                className="w-full rounded-xl bg-cyan-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors"
              >
                Launch Assessment
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* FORMULA & CONCEPT STUDIO TAB (Section 15) */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Formula Selector & Input (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Select or Enter STEM Formula
            </h2>
            <p className="text-xs text-slate-500">
              Explore step-by-step mathematical derivations, units, variables, and worked problems.
            </p>

            <div className="space-y-2">
              {[
                {
                  name: 'Quadratic Equation Formula',
                  formula: 'x = (-b ± √(b² - 4ac)) / (2a)',
                  subject: 'Mathematics',
                },
                {
                  name: 'Pythagorean Trig Identity',
                  formula: 'sin²(θ) + cos²(θ) = 1',
                  subject: 'Mathematics',
                },
                {
                  name: "Newton's Second Law",
                  formula: 'F_net = m · a',
                  subject: 'Physics',
                },
                {
                  name: 'Kinematic Distance Equation',
                  formula: 's = u·t + (1/2)·a·t²',
                  subject: 'Physics',
                },
                {
                  name: 'Binary Search Recurrence',
                  formula: 'T(n) = T(n/2) + O(1) => O(log n)',
                  subject: 'Computer Science',
                },
              ].map((f, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setFormulaInput(f.formula);
                    handleExplainFormula(f.formula);
                  }}
                  className="w-full text-left rounded-2xl border border-slate-100 bg-slate-50 p-3 hover:border-cyan-300 hover:bg-cyan-50/40 transition-all"
                >
                  <p className="text-xs font-bold text-slate-800">{f.name}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-cyan-800 font-semibold">{f.formula}</p>
                </button>
              ))}
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Custom Expression
              </label>
              <input
                type="text"
                value={formulaInput}
                onChange={(e) => setFormulaInput(e.target.value)}
                placeholder="Enter any math or science equation..."
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono"
              />
              <button
                onClick={() => handleExplainFormula()}
                disabled={formulaLoading}
                className="mt-2 w-full rounded-xl bg-cyan-600 py-2.5 text-xs font-bold text-white hover:bg-cyan-700 disabled:opacity-50"
              >
                {formulaLoading ? 'Deriving Concept...' : 'Explain Custom Formula'}
              </button>
            </div>
          </div>

          {/* Derivation & Explanation Panel (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Formula Breakdown & Derivation
              </span>
              <span className="font-mono text-xs font-bold text-cyan-700">{formulaInput}</span>
            </div>

            {formulaLoading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
              </div>
            ) : (
              <div className="prose prose-xs max-w-none text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {formulaExplanation ||
                  'Select a formula on the left or enter a custom mathematical relation to generate a structured pedagogical breakdown.'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
