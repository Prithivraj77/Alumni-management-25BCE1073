import React, { useState } from 'react';
import { 
  GraduationCap, 
  Users, 
  UserCheck, 
  Calendar, 
  Briefcase, 
  BarChart3, 
  Database, 
  ChevronDown, 
  ChevronUp,
  LogOut, 
  User, 
  BookOpen,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Radio,
  Sliders,
  X,
  Menu
} from 'lucide-react';
import { useAlumni, CurrentUser } from '../context/AlumniContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenSetupModal: () => void;
  onOpenLoginModal: () => void;
  onOpenFirebaseModal: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  setCurrentTab, 
  onOpenSetupModal,
  onOpenLoginModal,
  onOpenFirebaseModal,
  isMobileOpen,
  setIsMobileOpen
}) => {
  const { currentUser, loginAs, logout, resetDatabase, isFirebaseConnected } = useAlumni();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [resetSuccessNotice, setResetSuccessNotice] = useState(false);

  const demoProfiles: CurrentUser[] = [
    {
      id: 'ALUM-001',
      name: 'Sarah Chen',
      email: 'sarah.chen@google.com',
      role: 'alumni',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      gradYear: 2018,
      degree: 'B.Tech CSE',
      department: 'Computer Science',
      company: 'Google',
      designation: 'Staff Software Engineer'
    },
    {
      id: 'STU-001',
      name: 'Maya Chen',
      email: 'maya.chen@student.edu',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      gradYear: 2026,
      degree: 'B.Tech CSE (Final Year)',
      department: 'Computer Science',
      company: 'Student',
      designation: 'Aspiring Cloud Engineer'
    },
    {
      id: 'ADM-001',
      name: 'Dr. Arthur Pendelton',
      email: 'dean.pendelton@university.edu',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
      degree: 'Dean of Engineering',
      department: 'Alumni Affairs',
      designation: 'Director of Alumni Relations'
    }
  ];

  const primaryNavItems = [
    { id: 'directory', label: 'Alumni Directory', icon: Users, desc: 'Search & network' },
    { id: 'events', label: 'Events & Reunions', icon: Calendar, desc: 'Conferences & RSVPs' },
    { id: 'mentorship', label: 'Mentorship & Jobs', icon: Briefcase, desc: 'Referrals & guidance' },
    { id: 'analytics', label: 'Class Statistics', icon: BarChart3, desc: 'Cohort analytics & graphs' },
    { id: 'database', label: 'SQL Console', icon: Database, badge: 'Live SQL', desc: 'Direct DDL/DML queries' },
  ];

  const secondaryNavItems = [
    { id: 'profile', label: 'My Profile', icon: UserCheck, desc: 'Edit details & resume' },
  ];

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setIsMobileOpen(false);
  };

  const handleResetData = () => {
    resetDatabase();
    setResetSuccessNotice(true);
    setTimeout(() => setResetSuccessNotice(false), 3000);
    setShowRoleMenu(false);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-72 shrink-0
        bg-slate-900 border-r border-slate-800/90 text-slate-300
        flex flex-col transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Brand / Institution Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => handleNavClick('directory')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white tracking-tight text-base group-hover:text-amber-400 transition-colors">
                  AlumniConnect
                </span>
                <span className="px-1.5 py-0.2 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded border border-blue-400/30">
                  PORTAL
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                University Alumni Association
              </p>
            </div>
          </div>

          {/* Close button for mobile */}
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Firebase Sync Status Pill */}
        <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/60">
          <button
            onClick={onOpenFirebaseModal}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-xs text-slate-300 border border-slate-700/60 transition-colors group cursor-pointer"
            title="Configure or inspect Firebase Firestore configuration"
          >
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${isFirebaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="font-semibold text-[11px] text-slate-200">
                {isFirebaseConnected ? 'Firestore Connected' : 'Local / SQL Mode'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 group-hover:text-blue-400 font-mono">
              Config ⚙️
            </span>
          </button>
        </div>

        {/* Navigation Menus (Scrollable Area) */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* Main Navigation Section */}
          <div>
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Main Menu
              </span>
              <span className="text-[10px] text-slate-500 font-mono">v2.4</span>
            </div>
            <nav className="space-y-1">
              {primaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-1.5 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-blue-500/50 text-white' 
                          : 'bg-slate-800 text-slate-400 group-hover:text-white group-hover:bg-slate-700'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <span className="block leading-tight">{item.label}</span>
                        <span className={`text-[10px] font-normal block leading-tight ${
                          isActive ? 'text-blue-100' : 'text-slate-500 group-hover:text-slate-400'
                        }`}>
                          {item.desc}
                        </span>
                      </div>
                    </div>
                    {item.badge && (
                      <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded-full ${
                        isActive 
                          ? 'bg-amber-400 text-slate-950' 
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Account & Profile Section */}
          <div>
            <div className="px-3 mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Personal
              </span>
            </div>
            <nav className="space-y-1">
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-500/50 text-white' 
                        : 'bg-slate-800 text-slate-400 group-hover:text-white group-hover:bg-slate-700'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="block leading-tight">{item.label}</span>
                      <span className={`text-[10px] font-normal block leading-tight ${
                        isActive ? 'text-blue-100' : 'text-slate-500 group-hover:text-slate-400'
                      }`}>
                        {item.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Tools & Documentation Section */}
          <div>
            <div className="px-3 mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Lab Assessment Tools
              </span>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  onOpenSetupModal();
                  setIsMobileOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium text-amber-300 bg-amber-950/30 hover:bg-amber-900/40 border border-amber-800/40 transition-colors text-left"
              >
                <div className="p-1 rounded-md bg-amber-500/20 text-amber-300">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="block font-semibold">Lab Setup Manual</span>
                  <span className="text-[10px] text-amber-400/80">Drivers & PAT-4 Guide</span>
                </div>
              </button>

              <button
                onClick={() => {
                  onOpenFirebaseModal();
                  setIsMobileOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors text-left"
              >
                <div className="p-1 rounded-md bg-slate-800 text-slate-400">
                  <Sliders className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="block font-semibold">Firebase Settings</span>
                  <span className="text-[10px] text-slate-500">API keys & Firestore</span>
                </div>
              </button>
            </div>
          </div>

        </div>

        {/* Reset Feedback Notification */}
        {resetSuccessNotice && (
          <div className="mx-3.5 mb-2 px-3 py-2 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-200 flex items-center space-x-2 animate-in fade-in">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Database reset to initial sample rows!</span>
          </div>
        )}

        {/* User Card & Role Switcher Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/50">
          {currentUser ? (
            <div className="space-y-2">
              <div 
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 cursor-pointer transition-all group"
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-600 shrink-0"
                  />
                  <div className="truncate text-left">
                    <p className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                      <span className="truncate">{currentUser.name}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 font-semibold uppercase rounded shrink-0 ${
                        currentUser.role === 'admin'
                          ? 'bg-purple-900/60 text-purple-300 border border-purple-700/50'
                          : currentUser.role === 'student'
                          ? 'bg-amber-900/60 text-amber-300 border border-amber-700/50'
                          : 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
                      }`}>
                        {currentUser.role}
                      </span>
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {currentUser.company || currentUser.department}
                    </p>
                  </div>
                </div>
                <div className="text-slate-400 group-hover:text-white pl-1">
                  {showRoleMenu ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </div>
              </div>

              {/* Role Switcher Collapsible Panel */}
              {showRoleMenu && (
                <div className="p-2 bg-slate-900 rounded-xl border border-slate-700/80 space-y-1.5 shadow-xl animate-in fade-in slide-in-from-bottom-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-1">
                    Quick Role Switcher
                  </p>
                  
                  <div className="space-y-1">
                    {demoProfiles.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          loginAs(p);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded-lg text-left text-xs transition-colors ${
                          currentUser.id === p.id 
                            ? 'bg-blue-600/30 text-blue-200 font-semibold border border-blue-500/40' 
                            : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <img src={p.avatar} alt={p.name} className="w-5 h-5 rounded-md object-cover" />
                        <div className="flex-1 truncate">
                          <div className="flex items-center justify-between">
                            <span className="truncate text-[11px] font-medium">{p.name}</span>
                            <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                              {p.role}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-800 pt-1.5 space-y-1">
                    <button
                      onClick={handleResetData}
                      className="w-full flex items-center space-x-2 px-2 py-1 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reset Seed Database</span>
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setShowRoleMenu(false);
                        onOpenLoginModal();
                      }}
                      className="w-full flex items-center space-x-2 px-2 py-1 text-xs text-rose-400 hover:bg-rose-950/40 rounded-md transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                onOpenLoginModal();
                setIsMobileOpen(false);
              }}
              className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center space-x-2"
            >
              <User className="w-4 h-4" />
              <span>Sign In / Switch Profile</span>
            </button>
          )}
        </div>

      </aside>
    </>
  );
};
