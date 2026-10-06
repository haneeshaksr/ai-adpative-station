import React from 'react';
import {
  Sparkles,
  ArrowRight,
  BrainCircuit,
  Bot,
  Target,
  BarChart3,
  Users,
  Briefcase,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Play,
  Layers,
  Flame,
  Award,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface LandingPageProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth, onNavigate }) => {
  const { demoLogin, isAuthenticated, user } = useAuth();

  const handleQuickDemo = async (role: UserRole) => {
    await demoLogin(role);
    if (role === 'teacher') onNavigate('teacher-dashboard');
    else if (role === 'parent') onNavigate('parent-dashboard');
    else if (role === 'admin') onNavigate('admin-dashboard');
    else onNavigate('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-cyan-500 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-6 backdrop-blur-md sm:px-12">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-slate-900 via-sky-900 to-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/10">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900">
              Adaptive Station
            </span>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-cyan-700">
              AI Smart Pod System
            </p>
          </div>
        </div>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <a href="#features" className="hover:text-cyan-700 transition-colors">
            Core Features
          </a>
          <a href="#how-it-works" className="hover:text-cyan-700 transition-colors">
            Learning Cycle
          </a>
          <a href="#hardware" className="hover:text-cyan-700 transition-colors">
            Raspberry Pi Pod
          </a>
          <a href="#impact" className="hover:text-cyan-700 transition-colors">
            Stakeholder Impact
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-cyan-600/20 hover:bg-cyan-700 transition-all"
            >
              <span>Go to Dashboard ({user?.role})</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <>
              <button
                onClick={() => onOpenAuth('login')}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-md shadow-slate-900/10 hover:bg-slate-800 transition-all"
              >
                <span>Get Started</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-[45rem] rounded-full bg-gradient-to-tr from-cyan-200/40 via-sky-300/30 to-purple-200/30 blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-6 sm:px-12">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50/80 px-3.5 py-1 text-xs font-semibold text-cyan-800">
                <span className="flex h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                Adaptive Educational Technology & AI Station
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-6xl sm:leading-[1.1]">
                AI-Powered <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-slate-900 via-sky-900 to-cyan-600 bg-clip-text text-transparent">
                  Adaptive Smart Learning
                </span>{' '}
                Station
              </h1>

              <p className="max-w-xl text-base text-slate-600 sm:text-lg">
                Every student learns differently. Our Smart Learning Station understands that
                difference and dynamically adapts what the student learns next through continuous
                knowledge profiling and computerized adaptive testing.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onOpenAuth('register')}
                  className="flex items-center gap-2 rounded-2xl bg-cyan-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-600/25 hover:bg-cyan-700 hover:scale-[1.01] transition-all"
                >
                  <span>Get Started Now</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleQuickDemo('student')}
                  className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 hover:border-slate-400 transition-all"
                >
                  <Play className="h-4 w-4 text-cyan-600 fill-cyan-600" />
                  <span>Explore Demo (Student)</span>
                </button>
              </div>

              {/* 1-Click Role Exploration Strip */}
              <div className="pt-4 border-t border-slate-200/80">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
                  Launch Instant Interactive Demo By Role:
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleQuickDemo('student')}
                    className="rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-800 hover:bg-cyan-100"
                  >
                    Student Portal
                  </button>
                  <button
                    onClick={() => handleQuickDemo('teacher')}
                    className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800 hover:bg-blue-100"
                  >
                    Teacher Portal
                  </button>
                  <button
                    onClick={() => handleQuickDemo('parent')}
                    className="rounded-xl border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-800 hover:bg-purple-100"
                  >
                    Parent Dashboard
                  </button>
                  <button
                    onClick={() => handleQuickDemo('admin')}
                    className="rounded-xl border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-200"
                  >
                    Admin Console
                  </button>
                </div>
              </div>
            </div>

            {/* Right Visual: Interactive Station Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xl shadow-slate-200 ring-1 ring-slate-900/5">
                {/* Station Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold text-slate-900">
                      Raspberry Pi 5 Pod: ONLINE
                    </span>
                  </div>
                  <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-[11px] font-semibold text-cyan-800">
                    Live Telemetry
                  </span>
                </div>

                {/* Adaptive Loop Animation Card */}
                <div className="mt-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 p-5 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-mono text-cyan-400">KNOWLEDGE PROFILE</p>
                      <h4 className="text-base font-bold text-white">Alex Rivera (Grade 10)</h4>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-cyan-500/20 px-2.5 py-1 text-xs text-cyan-300 font-semibold border border-cyan-400/30">
                      <Flame className="h-3.5 w-3.5 fill-orange-400 text-orange-400" />
                      <span>7d Streak</span>
                    </div>
                  </div>

                  {/* Mastery Bars */}
                  <div className="mt-4 space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300 font-medium">Algebra & Quadratics</span>
                        <span className="text-cyan-400 font-bold">85% (Mastered)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full bg-cyan-400 w-[85%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300 font-medium">Trigonometric Identities</span>
                        <span className="text-amber-400 font-bold">45% (Needs Practice)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full bg-amber-400 w-[45%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300 font-medium">Kinematics & Dynamics</span>
                        <span className="text-emerald-400 font-bold">78% (Good)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-400 w-[78%]" />
                      </div>
                    </div>
                  </div>

                  {/* Adaptive trigger recommendation badge */}
                  <div className="mt-4 rounded-xl bg-white/10 p-3 border border-white/10 flex items-start gap-2.5">
                    <Target className="h-4 w-4 text-cyan-300 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-white">
                        Adaptive Engine Intervention:
                      </p>
                      <p className="text-[11px] text-cyan-200">
                        Identified weak topic in Trigonometry. Generated visual video + step-by-step
                        AI Tutor session.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sub Features */}
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="font-semibold text-slate-800">CAT Algorithm</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Dynamic Item Response Theory difficulty scaling
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="font-semibold text-slate-800">Gemini 3.8 AI Tutor</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Context-aware guidance adapted to student mastery
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE LEARNING CYCLE SECTION */}
      <section id="how-it-works" className="border-y border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-12">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">
              Closed-Loop Mastery Pipeline
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              The 8-Step Adaptive Learning Cycle
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              The platform dynamically captures every interaction, updates Bayesian knowledge
              probabilities, and restructures subsequent learning activities in real time.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
            {[
              { num: '01', title: 'Assess', desc: 'Adaptive diagnostic test', icon: Target },
              { num: '02', title: 'Analyse', desc: 'Difficulty & timing metrics', icon: BarChart3 },
              { num: '03', title: 'Identify', desc: 'Isolate conceptual gaps', icon: BrainCircuit },
              { num: '04', title: 'Recommend', desc: 'Curate videos & notes', icon: Sparkles },
              { num: '05', title: 'Learn', desc: 'Interactive AI coaching', icon: Bot },
              { num: '06', title: 'Practice', desc: 'Targeted problem sets', icon: Layers },
              { num: '07', title: 'Reassess', desc: 'Validate comprehension', icon: Target },
              { num: '08', title: 'Improve', desc: 'Update Knowledge Profile', icon: Award },
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="group relative rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition-all hover:bg-white hover:shadow-md hover:border-cyan-400"
                >
                  <span className="text-[10px] font-mono font-bold text-cyan-600">{step.num}</span>
                  <div className="mt-2 flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 text-cyan-800 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="mt-3 text-xs font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-1 text-[11px] text-slate-500 leading-tight">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURES GRID SECTION */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 sm:px-12">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">
              Enterprise Startup Features
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Engineered For Deep Personalization
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              A comprehensive full-stack ecosystem uniting students, teachers, parents, and smart
              station hardware.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<Target className="h-6 w-6 text-cyan-600" />}
              title="Adaptive Testing (CAT)"
              desc="Questions adjust difficulty in real-time based on student response streaks, measuring true mastery with minimal fatigue."
            />
            <FeatureCard
              icon={<BrainCircuit className="h-6 w-6 text-purple-600" />}
              title="Knowledge Profiling"
              desc="Continuously tracked Bayesian mastery nodes categorized as Mastered, Good, Needs Practice, or Needs Attention."
            />
            <FeatureCard
              icon={<Bot className="h-6 w-6 text-sky-600" />}
              title="Contextual AI Tutor"
              desc="Powered by Gemini 3.8 Flash. Reads student level, weak spots, and formula inquiries to deliver calibrated pedagogical hints."
            />
            <FeatureCard
              icon={<Sparkles className="h-6 w-6 text-amber-600" />}
              title="Recommendation Engine"
              desc="Automatically maps diagnostic performance to remedial videos, guided practice, and targeted follow-up quizzes."
            />
            <FeatureCard
              icon={<Briefcase className="h-6 w-6 text-emerald-600" />}
              title="Teacher Analytics & Bank"
              desc="Class-wide heatmaps, question bank management with LaTeX formulas, and student intervention alerts."
            />
            <FeatureCard
              icon={<Users className="h-6 w-6 text-indigo-600" />}
              title="Parent Monitoring Portal"
              desc="Non-intrusive progress visibility, weak subject alerts, and student linking code authorization."
            />
            <FeatureCard
              icon={<Cpu className="h-6 w-6 text-rose-600" />}
              title="Raspberry Pi 5 Station"
              desc="Dedicated physical hardware status monitoring touchscreen, camera, mic, PIR sensor, and live telemetry."
            />
            <FeatureCard
              icon={<ShieldCheck className="h-6 w-6 text-slate-700" />}
              title="Offline Resilience"
              desc="Local queue stores assessment records during network dropouts and automatically synchronizes when reconnected."
            />
          </div>
        </div>
      </section>

      {/* HARDWARE SECTION */}
      <section id="hardware" className="border-t border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-12">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-6 space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">
                Hardware Architecture
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
                Raspberry Pi 5 Smart Learning Station
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Designed for low-resource schools and modern interactive classrooms, the physical
                learning pod operates independently with local caching, hardware sensors, and secure
                cloud synchronization.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  'Integrated 10.1" Touchscreen with multi-touch interaction',
                  'IMX708 Camera module for biometric face-login and attention awareness',
                  'Dual array microphone with noise reduction for AI Tutor speech input',
                  'PIR motion sensor for automatic student presence detection',
                  'OLED status display for quick learning streak and battery monitoring',
                  'Local JSON storage fallback for zero-downtime offline operation',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onNavigate('smart-station')}
                className="mt-4 flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-slate-800"
              >
                <Cpu className="h-4 w-4 text-cyan-400" />
                <span>View Live Hardware Digital Twin</span>
              </button>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 text-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="font-mono text-xs text-cyan-400">
                    DEVICE: PI5-SMART-STATION-01
                  </span>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
                    CONNECTED
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-slate-900 p-3 border border-slate-800">
                    <span className="text-[10px] text-slate-400">SOC Processor</span>
                    <p className="font-mono text-cyan-300 font-semibold mt-0.5">BCM2712 Quad-core</p>
                  </div>
                  <div className="rounded-xl bg-slate-900 p-3 border border-slate-800">
                    <span className="text-[10px] text-slate-400">Operating System</span>
                    <p className="font-mono text-cyan-300 font-semibold mt-0.5">Debian 12 64-bit</p>
                  </div>
                  <div className="rounded-xl bg-slate-900 p-3 border border-slate-800">
                    <span className="text-[10px] text-slate-400">Thermal Monitor</span>
                    <p className="font-mono text-emerald-400 font-semibold mt-0.5">43.2°C (Optimal)</p>
                  </div>
                  <div className="rounded-xl bg-slate-900 p-3 border border-slate-800">
                    <span className="text-[10px] text-slate-400">Database Engine</span>
                    <p className="font-mono text-cyan-300 font-semibold mt-0.5">MongoDB Atlas / JSON</p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-slate-900/60 p-3.5 border border-slate-800 text-[11px] text-slate-300">
                  <p className="font-semibold text-white mb-1">Station Sensor Status:</p>
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <span className="text-emerald-400">✓ Touchscreen (Active)</span>
                    <span className="text-emerald-400">✓ Camera IMX708 (60fps)</span>
                    <span className="text-emerald-400">✓ Microphone Array</span>
                    <span className="text-emerald-400">✓ PIR Motion (Detected)</span>
                    <span className="text-emerald-400">✓ OLED Display</span>
                    <span className="text-cyan-400">✓ AI Gemini API (Ready)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* IMPACT SECTION */}
      <section id="impact" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-6 sm:px-12">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">
              Measurable Outcomes
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Impact Across All Stakeholders
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="rounded-xl bg-cyan-100 p-2 text-cyan-800 inline-block">
                <GraduationCap className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-slate-900">For Students</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Eliminates one-size-fits-all frustration. Focuses revision on actual weak concepts
                without wasting time on mastered topics.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="rounded-xl bg-blue-100 p-2 text-blue-800 inline-block">
                <Briefcase className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-slate-900">For Teachers</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Real-time visibility into class-wide conceptual roadblocks before exams occur,
                enabling timely targeted lectures.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="rounded-xl bg-purple-100 p-2 text-purple-800 inline-block">
                <Users className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-slate-900">For Parents</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Clear academic tracking and early warning notifications when topics need remediation,
                without stressful micromanagement.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="rounded-xl bg-emerald-100 p-2 text-emerald-800 inline-block">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-slate-900">For Institutions</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Scalable EdTech infrastructure that works even in low-connectivity rural stations
                with offline sync capability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-slate-900 py-16 text-white border-t border-slate-800">
        <div className="mx-auto max-w-5xl px-6 text-center sm:px-12">
          <h2 className="text-3xl font-extrabold sm:text-4xl tracking-tight">
            Ready to Experience Personalized Adaptive Learning?
          </h2>
          <p className="mt-3 text-sm text-slate-400 max-w-xl mx-auto">
            Try the live prototype now. Create an account or use one of our pre-configured demo
            profiles for students, teachers, or parents.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onOpenAuth('register')}
              className="flex items-center gap-2 rounded-2xl bg-cyan-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 transition-all"
            >
              <span>Create Free Account</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleQuickDemo('student')}
              className="rounded-2xl border border-slate-700 bg-slate-800 px-6 py-3.5 text-sm font-semibold text-white hover:bg-slate-700 transition-all"
            >
              Try Instant Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <p>© 2026 AI-Powered Adaptive Smart Learning Station. All rights reserved.</p>
        <p className="mt-1 text-[11px] text-slate-400">
          Built with Node.js, Express, React, Vite, Tailwind CSS, Lucide, and Gemini AI.
        </p>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({
  icon,
  title,
  desc,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:shadow-md hover:border-cyan-300">
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 border border-slate-100">
      {icon}
    </div>
    <h3 className="mt-4 text-sm font-bold text-slate-900">{title}</h3>
    <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{desc}</p>
  </div>
);
