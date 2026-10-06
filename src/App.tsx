import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { AuthModal } from './pages/AuthModal';
import { StudentDashboard } from './pages/StudentDashboard';
import { LearningModule } from './pages/LearningModule';
import { SubjectPage } from './pages/SubjectPage';
import { AdaptiveAssessment } from './pages/AdaptiveAssessment';
import { KnowledgeProfilePage } from './pages/KnowledgeProfilePage';
import { AITutorPage } from './pages/AITutorPage';
import { VideoLibrary } from './pages/VideoLibrary';
import { ProgressAnalytics } from './pages/ProgressAnalytics';
import { AwarenessModule } from './pages/AwarenessModule';
import { SmartStationPage } from './pages/SmartStationPage';
import { ParentDashboard } from './pages/ParentDashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { StudentProfile } from './pages/StudentProfile';

const AppContent: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [navParams, setNavParams] = useState<any>({});
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const handleNavigate = (page: string, params?: any) => {
    setCurrentPage(page);
    if (params) setNavParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
          <p className="font-mono text-xs tracking-wider text-cyan-300">
            INITIALIZING SMART LEARNING STATION...
          </p>
        </div>
      </div>
    );
  }

  // If user is not authenticated or explicitly on landing page
  if (!isAuthenticated || currentPage === 'landing') {
    return (
      <>
        <LandingPage
          onOpenAuth={handleOpenAuth}
          onNavigate={(page) => {
            if (isAuthenticated) handleNavigate(page);
            else handleOpenAuth('login');
          }}
        />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode={authModalMode}
          onSuccess={() => {
            setAuthModalOpen(false);
            if (user?.role === 'teacher') setCurrentPage('teacher-dashboard');
            else if (user?.role === 'parent') setCurrentPage('parent-dashboard');
            else if (user?.role === 'admin') setCurrentPage('admin-dashboard');
            else setCurrentPage('dashboard');
          }}
        />
      </>
    );
  }

  // Render internal application view
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <StudentDashboard onNavigate={handleNavigate} />;
      case 'learning':
        return (
          <LearningModule
            initialSubject={navParams.subject}
            initialTopic={navParams.topic}
            onNavigate={handleNavigate}
          />
        );
      case 'subjects':
        return <SubjectPage onNavigate={handleNavigate} />;
      case 'assessments':
        return (
          <AdaptiveAssessment
            initialSubject={navParams.subject}
            initialTopic={navParams.topic}
            onNavigate={handleNavigate}
          />
        );
      case 'knowledge-profile':
        return <KnowledgeProfilePage onNavigate={handleNavigate} />;
      case 'ai-tutor':
        return (
          <AITutorPage
            initialSubject={navParams.subject}
            initialTopic={navParams.topic}
            onNavigate={handleNavigate}
          />
        );
      case 'videos':
        return (
          <VideoLibrary
            initialSubject={navParams.subject}
            initialTopic={navParams.topic}
            onNavigate={handleNavigate}
          />
        );
      case 'analytics':
        return <ProgressAnalytics onNavigate={handleNavigate} />;
      case 'awareness':
        return <AwarenessModule />;
      case 'smart-station':
        return <SmartStationPage />;
      case 'parent-dashboard':
        return <ParentDashboard onNavigate={handleNavigate} />;
      case 'teacher-dashboard':
        return <TeacherDashboard />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'profile':
        return <StudentProfile />;
      default:
        return <StudentDashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />

      {/* Main View Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onNavigate={handleNavigate}
          currentPage={currentPage}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderCurrentPage()}
        </main>
      </div>

      {/* Auth Modal for switching accounts */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
