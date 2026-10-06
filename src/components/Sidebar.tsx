import React from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Video,
  Target,
  BrainCircuit,
  Bot,
  BarChart3,
  Leaf,
  Cpu,
  User as UserIcon,
  LogOut,
  Users,
  ShieldCheck,
  Briefcase,
  HelpCircle,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentPage,
  onNavigate,
}) => {
  const { user, logout } = useAuth();

  const handleNav = (page: string) => {
    onNavigate(page);
    onClose();
  };

  const isRole = (r: string) => user?.role === r;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-6">
          <div
            onClick={() => handleNav('dashboard')}
            className="flex cursor-pointer items-center gap-2.5"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500 text-slate-900 font-bold shadow-md shadow-cyan-500/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-tight">Adaptive Station</span>
              <p className="text-[10px] text-cyan-400 font-mono">ED-TECH AI POD</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="border-b border-slate-800/80 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-800/50 p-2.5 border border-slate-700/50">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-600 to-sky-400 font-bold text-white text-xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'ST'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">{user?.name || 'Guest User'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-cyan-300 truncate">
                  {user?.role || 'Guest'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {/* Main Core Learning Cycle */}
          <div>
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Learning Station
            </p>
            <div className="mt-2 space-y-1">
              <SidebarItem
                icon={<LayoutDashboard className="h-4 w-4" />}
                label="Student Dashboard"
                active={currentPage === 'dashboard'}
                onClick={() => handleNav('dashboard')}
              />
              <SidebarItem
                icon={<GraduationCap className="h-4 w-4" />}
                label="Learning Modules"
                active={currentPage === 'learning'}
                onClick={() => handleNav('learning')}
              />
              <SidebarItem
                icon={<BookOpen className="h-4 w-4" />}
                label="Subjects"
                active={currentPage === 'subjects'}
                onClick={() => handleNav('subjects')}
              />
              <SidebarItem
                icon={<Target className="h-4 w-4" />}
                label="Adaptive Assessment"
                badge="CAT Engine"
                active={currentPage === 'assessments'}
                onClick={() => handleNav('assessments')}
              />
              <SidebarItem
                icon={<BrainCircuit className="h-4 w-4" />}
                label="Knowledge Profiling"
                badge="Bayesian"
                active={currentPage === 'knowledge-profile'}
                onClick={() => handleNav('knowledge-profile')}
              />
              <SidebarItem
                icon={<Bot className="h-4 w-4" />}
                label="AI Tutor"
                badge="Gemini 3.8"
                active={currentPage === 'ai-tutor'}
                onClick={() => handleNav('ai-tutor')}
              />
              <SidebarItem
                icon={<Video className="h-4 w-4" />}
                label="Video Library"
                active={currentPage === 'videos'}
                onClick={() => handleNav('videos')}
              />
              <SidebarItem
                icon={<BarChart3 className="h-4 w-4" />}
                label="Progress Analytics"
                active={currentPage === 'analytics'}
                onClick={() => handleNav('analytics')}
              />
              <SidebarItem
                icon={<Leaf className="h-4 w-4" />}
                label="Student Awareness"
                active={currentPage === 'awareness'}
                onClick={() => handleNav('awareness')}
              />
              <SidebarItem
                icon={<Cpu className="h-4 w-4" />}
                label="Smart Station (Pi 5)"
                badge="Live"
                active={currentPage === 'smart-station'}
                onClick={() => handleNav('smart-station')}
              />
            </div>
          </div>

          {/* Role Portals */}
          <div>
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Role Portals
            </p>
            <div className="mt-2 space-y-1">
              <SidebarItem
                icon={<Briefcase className="h-4 w-4" />}
                label="Teacher Dashboard"
                active={currentPage === 'teacher-dashboard'}
                onClick={() => handleNav('teacher-dashboard')}
                highlight={isRole('teacher')}
              />
              <SidebarItem
                icon={<Users className="h-4 w-4" />}
                label="Parent Dashboard"
                active={currentPage === 'parent-dashboard'}
                onClick={() => handleNav('parent-dashboard')}
                highlight={isRole('parent')}
              />
              <SidebarItem
                icon={<ShieldCheck className="h-4 w-4" />}
                label="Admin Portal"
                active={currentPage === 'admin-dashboard'}
                onClick={() => handleNav('admin-dashboard')}
                highlight={isRole('admin')}
              />
            </div>
          </div>

          {/* Account */}
          <div>
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Account & Help
            </p>
            <div className="mt-2 space-y-1">
              <SidebarItem
                icon={<UserIcon className="h-4 w-4" />}
                label="My Profile"
                active={currentPage === 'profile'}
                onClick={() => handleNav('profile')}
              />
              <SidebarItem
                icon={<HelpCircle className="h-4 w-4" />}
                label="Explore Overview"
                active={currentPage === 'landing'}
                onClick={() => handleNav('landing')}
              />
            </div>
          </div>
        </div>

        {/* Footer info & Logout */}
        <div className="border-t border-slate-800 p-4 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 font-mono">
            <span>PI-5 NODE-READY</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> ACTIVE
            </span>
          </div>

          <button
            onClick={() => {
              logout();
              handleNav('landing');
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: string;
  highlight?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  active,
  onClick,
  badge,
  highlight,
}) => {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${
        active
          ? 'bg-cyan-500/15 text-cyan-400 font-semibold shadow-xs'
          : highlight
          ? 'text-cyan-200 bg-slate-800/40 hover:bg-slate-800'
          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
      }`}
    >
      <div className="flex items-center gap-2.5 truncate">
        <span
          className={`transition-colors ${
            active ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
          }`}
        >
          {icon}
        </span>
        <span className="truncate">{label}</span>
      </div>
      {badge && (
        <span className="rounded bg-cyan-950 px-1.5 py-0.5 text-[9px] font-semibold text-cyan-300 border border-cyan-800/50">
          {badge}
        </span>
      )}
    </button>
  );
};
