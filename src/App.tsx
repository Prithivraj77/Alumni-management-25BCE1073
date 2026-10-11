/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AlumniProvider } from './context/AlumniContext';
import { Sidebar } from './components/Sidebar';
import { DirectoryView } from './components/DirectoryView';
import { ProfileView } from './components/ProfileView';
import { EventsView } from './components/EventsView';
import { MentorshipAndJobsView } from './components/MentorshipAndJobsView';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { SqlConsoleView } from './components/SqlConsoleView';
import { SetupInstructionsModal } from './components/SetupInstructionsModal';
import { LoginModal } from './components/LoginModal';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';
import { 
  GraduationCap, 
  Terminal, 
  Database, 
  ShieldCheck, 
  Menu
} from 'lucide-react';

function AlumniAppContent() {
  const [currentTab, setCurrentTab] = useState<string>('directory');
  const [isSetupModalOpen, setIsSetupModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState<boolean>(false);
  const [activeSqlQuery, setActiveSqlQuery] = useState<string | undefined>(undefined);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const handleOpenSqlWithQuery = (sql: string) => {
    setActiveSqlQuery(sql);
    setCurrentTab('database');
  };

  const getPageTitle = () => {
    switch (currentTab) {
      case 'directory': return 'Graduate & Alumni Member Directory';
      case 'profile': return 'Alumni Profile Management';
      case 'events': return 'Campus Events, Webinars & Reunions';
      case 'mentorship': return 'Career Mentorship & Job Referral Board';
      case 'analytics': return 'Cohort Employment & Industry Demographics';
      case 'database': return 'Relational Database SQL Console';
      default: return 'Alumni Portal';
    }
  };

  const getBreadcrumbLabel = () => {
    switch (currentTab) {
      case 'directory': return 'Directory';
      case 'profile': return 'My Profile';
      case 'events': return 'Events & Reunions';
      case 'mentorship': return 'Mentorship & Jobs';
      case 'analytics': return 'Class Statistics';
      case 'database': return 'SQL Console';
      default: return 'Overview';
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans">
      
      {/* Professional Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setActiveSqlQuery(undefined);
          setCurrentTab(tab);
        }}
        onOpenSetupModal={() => setIsSetupModalOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        
        {/* Sleek Top Breadcrumb & Actions Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Open left sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
                <span className="hover:text-slate-700 cursor-pointer" onClick={() => setCurrentTab('directory')}>AlumniConnect</span>
                <span>/</span>
                <span className="text-blue-600 font-semibold">{getBreadcrumbLabel()}</span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight hidden sm:block">
                {getPageTitle()}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsSetupModalOpen(true)}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
            >
              <Terminal className="w-3.5 h-3.5 text-amber-700" />
              <span>Lab Manual</span>
            </button>
            <button
              onClick={() => setIsFirebaseModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
            >
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Firebase Config</span>
              <span className="sm:hidden">Config</span>
            </button>
          </div>
        </header>

        {/* View Component Render */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {currentTab === 'directory' && <DirectoryView />}
          {currentTab === 'profile' && <ProfileView />}
          {currentTab === 'events' && <EventsView />}
          {currentTab === 'mentorship' && <MentorshipAndJobsView />}
          {currentTab === 'analytics' && <AnalyticsDashboard onOpenSqlTabWithQuery={handleOpenSqlWithQuery} />}
          {currentTab === 'database' && <SqlConsoleView initialQuery={activeSqlQuery} />}
        </main>

        {/* Academic PAT 4 Footer */}
        <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-xs">AlumniConnect Management System</p>
                <p className="text-[11px] text-slate-400">PAT 4 Lab Assessment Submission • Relational Database & Full-Stack Portal</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
              <button
                onClick={() => setIsSetupModalOpen(true)}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Installation Manual</span>
              </button>
              <button
                onClick={() => setCurrentTab('database')}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Database className="w-3.5 h-3.5" />
                <span>SQL Console</span>
              </button>
              <button
                onClick={() => setCurrentTab('directory')}
                className="hover:text-slate-800"
              >
                Directory
              </button>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400">
            <p>© 2026 AlumniConnect. University Alumni Association Portal — Linked with Firebase Firestore & SQL Console.</p>
            <div className="flex items-center gap-1.5 mt-2 sm:mt-0">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Secure Firebase Firestore & Authentication Active</span>
            </div>
          </div>
        </footer>

      </div>

      {/* PAT 4 Lab Manual & Setup Instructions Modal */}
      <SetupInstructionsModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
      />

      {/* Authentication & User Switcher Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Firebase Project Config & Switcher Modal */}
      <FirebaseConfigModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <AlumniProvider>
      <AlumniAppContent />
    </AlumniProvider>
  );
}
