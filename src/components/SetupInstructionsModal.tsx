import React, { useState } from 'react';
import { 
  Terminal, 
  Database, 
  CheckCircle, 
  Copy, 
  Check, 
  Layers, 
  Server, 
  Code2, 
  BookOpen, 
  ExternalLink,
  X
} from 'lucide-react';
import { DRIVER_SNIPPETS } from '../data/sqlDefinitions';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupInstructionsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeDriverIndex, setActiveDriverIndex] = useState(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-md">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">PAT 4 Lab Manual & Installation Guide</h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                  Evaluation Ready
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Complete setup commands, database connectivity drivers (JDBC/ODBC/pg), DDL/DML workflows, and execution steps.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-sm">
          {/* Rubric Verification Checklist */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold text-blue-900 flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              Lab Assessment Feature Checklist
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700">
              <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-lg border border-blue-100">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">1</span>
                <div>
                  <strong>Alumni Management System:</strong> Member directory, profile updates, event tracking, and searchable directory.
                </div>
              </div>
              <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-lg border border-blue-100">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">2</span>
                <div>
                  <strong>Role-Based Login Page:</strong> Multi-user authentication for Alumni, Student, and Admin with demo presets.
                </div>
              </div>
              <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-lg border border-blue-100">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">3</span>
                <div>
                  <strong>Inputs, Outputs & Processing:</strong> Profile editing, dynamic registrations, ticket generation, and interactive DDL & DML engine.
                </div>
              </div>
              <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-lg border border-blue-100">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">4</span>
                <div>
                  <strong>Installation & Driver Commands:</strong> Full npm, JDBC, ODBC, Python, and PostgreSQL configuration instructions below.
                </div>
              </div>
            </div>
          </div>

          {/* Quickstart Command Sequence */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-600" />
                1. Application Execution Commands (Node.js & Vite)
              </h3>
              <button
                onClick={() => copyToClipboard('git clone <repository_url>\ncd alumni-management-system\nnpm install\nnpm run dev', 'quickstart')}
                className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
              >
                {copiedKey === 'quickstart' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'quickstart' ? 'Copied' : 'Copy All Commands'}
              </button>
            </div>

            <div className="bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs space-y-2 border border-slate-800">
              <p className="text-slate-400"># Step 1: Install runtime dependencies</p>
              <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800 text-emerald-400">
                <span>npm install</span>
                <button onClick={() => copyToClipboard('npm install', 'cmd-1')} className="text-slate-400 hover:text-white">
                  {copiedKey === 'cmd-1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <p className="text-slate-400"># Step 2: Launch development server (Runs on port 3000)</p>
              <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800 text-emerald-400">
                <span>npm run dev</span>
                <button onClick={() => copyToClipboard('npm run dev', 'cmd-2')} className="text-slate-400 hover:text-white">
                  {copiedKey === 'cmd-2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <p className="text-slate-400"># Step 3: Production compilation check</p>
              <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800 text-emerald-400">
                <span>npm run build</span>
                <button onClick={() => copyToClipboard('npm run build', 'cmd-3')} className="text-slate-400 hover:text-white">
                  {copiedKey === 'cmd-3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Database Connectivity & Driver Setup */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-600" />
              2. Database Drivers & Connectivity Setup (JDBC, ODBC, Python, Node)
            </h3>
            <p className="text-xs text-slate-500">
              As required by PAT 4, select your programming language/driver below to view the dependency installation command and code configuration snippet:
            </p>

            {/* Language tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
              {DRIVER_SNIPPETS.map((snippet, idx) => (
                <button
                  key={snippet.lang}
                  onClick={() => setActiveDriverIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeDriverIndex === idx
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {snippet.lang}
                </button>
              ))}
            </div>

            {/* Active Driver Details */}
            {DRIVER_SNIPPETS[activeDriverIndex] && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-blue-600" />
                    Installation / Driver Dependency:
                  </span>
                  <button
                    onClick={() => copyToClipboard(DRIVER_SNIPPETS[activeDriverIndex].installCmd, 'driver-install')}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-mono"
                  >
                    {copiedKey === 'driver-install' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    {copiedKey === 'driver-install' ? 'Copied' : 'Copy Cmd'}
                  </button>
                </div>
                <div className="bg-slate-900 text-emerald-400 p-2.5 rounded font-mono text-xs overflow-x-auto whitespace-pre">
                  {DRIVER_SNIPPETS[activeDriverIndex].installCmd}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    Connection & Execution Code:
                  </span>
                  <button
                    onClick={() => copyToClipboard(DRIVER_SNIPPETS[activeDriverIndex].code, 'driver-code')}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-mono"
                  >
                    {copiedKey === 'driver-code' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    {copiedKey === 'driver-code' ? 'Copied' : 'Copy Code'}
                  </button>
                </div>
                <pre className="bg-slate-950 text-slate-200 p-3.5 rounded-lg font-mono text-xs overflow-x-auto max-h-56 border border-slate-800">
                  {DRIVER_SNIPPETS[activeDriverIndex].code}
                </pre>
              </div>
            )}
          </div>

          {/* Connected Firebase Project Details */}
          <div className="space-y-2 bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-amber-950 flex items-center gap-2 text-xs sm:text-sm">
                <Database className="w-4 h-4 text-amber-600" />
                3. Connected Firebase Project & Firestore Console Access
              </h3>
              <a
                href="https://console.firebase.google.com/project/alumni-management-portal-69471/firestore/databases/-default-/data"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-amber-200 shadow-2xs"
              >
                <span>Open Your Firebase Console</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-xs border border-slate-800 space-y-1">
              <div><span className="text-slate-400">Firebase Project ID:</span> <span className="text-amber-400 font-bold">alumni-management-portal-69471</span></div>
              <div><span className="text-slate-400">Firestore Database ID:</span> <span className="text-blue-400">(default)</span></div>
              <div><span className="text-slate-400">Active Collections:</span> <span className="text-emerald-400">alumni_members, alumni_events, event_registrations, mentorship_requests, job_postings</span></div>
            </div>

            <div className="text-xs text-amber-900/90 space-y-1 pt-1">
              <p>
                <strong>Connected to your Firebase account!</strong> Your app is now configured with project <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-950 font-bold">alumni-management-portal-69471</code>.
              </p>
            </div>
          </div>

          {/* Environmental Variables Configuration */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              4. Environment File Configuration (.env)
            </h3>
            <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-xs border border-slate-800">
              <span className="text-slate-400"># Database Connection Variables</span><br />
              <span className="text-blue-400">DB_HOST</span>=localhost<br />
              <span className="text-blue-400">DB_PORT</span>=5432<br />
              <span className="text-blue-400">DB_NAME</span>=alumni_management_db<br />
              <span className="text-blue-400">DB_USER</span>=postgres<br />
              <span className="text-blue-400">DB_PASSWORD</span>=secure_password_here<br />
              <span className="text-slate-400"># App URL</span><br />
              <span className="text-blue-400">PORT</span>=3000
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Compliant with Lab Assessment Guidelines for PAT 4.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            Close Manual
          </button>
        </div>
      </div>
    </div>
  );
};
