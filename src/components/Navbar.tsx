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
  LogOut, 
  User, 
  CloudCheck,
  BookOpen,
  RefreshCw
} from 'lucide-react';
import { useAlumni, CurrentUser } from '../context/AlumniContext';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenSetupModal: () => void;
  onOpenLoginModal: () => void;
  onOpenFirebaseModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentTab, 
  setCurrentTab, 
  onOpenSetupModal,
  onOpenLoginModal,
  onOpenFirebaseModal
}) => {
  const { currentUser, loginAs, logout, sqlLogs, resetDatabase, isFirebaseConnected } = useAlumni();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

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

  const navItems = [
    { id: 'directory', label: 'Directory', icon: Users },
    { id: 'profile', label: 'My Profile', icon: UserCheck },
    { id: 'events', label: 'Events & Reunions', icon: Calendar },
    { id: 'mentorship', label: 'Mentorship & Jobs', icon: Briefcase },
    { id: 'analytics', label: 'Class Stats', icon: BarChart3 },
    { id: 'database', label: 'SQL Console', icon: Database, badge: 'Live SQL' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & University Emblem */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('directory')}>
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400 shadow-sm">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg">AlumniConnect</span>
                {isFirebaseConnected && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenFirebaseModal();
                    }}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200/80 transition-colors cursor-pointer"
                    title="View connected Firebase project details or switch configuration"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Firestore Synced</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block -mt-0.5 font-medium">
                University Alumni Association & Career Directory
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all relative ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && !isActive && (
                    <span className="ml-1 px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-full font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools & Auth Switcher */}
          <div className="flex items-center space-x-2">
            
            {/* Lab Setup & Instructions Button */}
            <button
              onClick={onOpenSetupModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-200/90 rounded-xl text-xs font-semibold transition-all"
              title="View lab setup commands and database driver configurations"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden md:inline">Lab Setup Guide</span>
              <span className="md:hidden">Guide</span>
            </button>

            {/* User Profile / Quick Switcher */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowRoleMenu(!showRoleMenu)}
                  className="flex items-center space-x-2.5 p-1.5 pr-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200"
                  />
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1">
                      {currentUser.name}
                      <span className={`text-[9px] px-1.5 py-0.2 font-semibold uppercase rounded ${
                        currentUser.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : currentUser.role === 'student'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {currentUser.role}
                      </span>
                    </p>
                    <p className="text-[10px] text-slate-500 truncate max-w-[110px]">
                      {currentUser.company || currentUser.department}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {showRoleMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Switch Profile</p>
                      <p className="text-xs text-slate-500">Test different user roles:</p>
                    </div>

                    <div className="p-1 space-y-1">
                      {demoProfiles.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            loginAs(p);
                            setShowRoleMenu(false);
                          }}
                          className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left text-xs transition-colors ${
                            currentUser.id === p.id ? 'bg-slate-100 text-slate-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <img src={p.avatar} alt={p.name} className="w-6 h-6 rounded-md object-cover" />
                          <div className="flex-1 truncate">
                            <div className="flex items-center justify-between">
                              <span className="truncate">{p.name}</span>
                              <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-slate-200/60 text-slate-600 font-medium ml-1">
                                {p.role}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 block truncate">{p.company || p.department}</span>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="border-t border-slate-100 my-1" />

                    <div className="p-1 space-y-1">
                      <button
                        onClick={() => {
                          setCurrentTab('profile');
                          setShowRoleMenu(false);
                        }}
                        className="w-full flex items-center space-x-2 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg"
                      >
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Edit Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Reset to standard seed data?')) {
                            resetDatabase();
                            setShowRoleMenu(false);
                          }
                        }}
                        className="w-full flex items-center space-x-2 px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50 rounded-lg"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                        <span>Reset Data</span>
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setShowRoleMenu(false);
                          onOpenLoginModal();
                        }}
                        className="w-full flex items-center space-x-2 px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center space-x-1 overflow-x-auto py-2 border-t border-slate-100 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
