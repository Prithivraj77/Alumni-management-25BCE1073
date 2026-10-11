import React, { useState } from 'react';
import { 
  Database, 
  ExternalLink, 
  Copy, 
  Check, 
  X, 
  HelpCircle, 
  CheckCircle,
  Sparkles,
  Save,
  AlertCircle
} from 'lucide-react';
import firebaseConfigData from '../../firebase-applet-config.json';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseConfigModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [customConfigInput, setCustomConfigInput] = useState('');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentJsonString = JSON.stringify(firebaseConfigData, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentJsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAutofillActiveConfig = () => {
    setCustomConfigInput(`const firebaseConfig = ${JSON.stringify(firebaseConfigData, null, 2)};`);
    setErrorMessage(null);
  };

  const handleSaveCustomConfig = () => {
    setErrorMessage(null);
    setSaveMessage(null);
    if (!customConfigInput.trim()) {
      setErrorMessage('Please paste or autofill a Firebase configuration object first.');
      return;
    }

    try {
      // Parse JSON or JavaScript object format
      let parsed: any;
      let cleaned = customConfigInput.trim();

      if (cleaned.startsWith('const firebaseConfig =') || cleaned.startsWith('var firebaseConfig =') || cleaned.startsWith('let firebaseConfig =')) {
        cleaned = cleaned.replace(/^(const|var|let)\s+firebaseConfig\s*=\s*/, '');
        cleaned = cleaned.replace(/;+\s*$/, '');
      }

      // Convert unquoted keys to valid JSON if needed
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        const jsonLike = cleaned
          .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
          .replace(/'/g, '"');
        parsed = JSON.parse(jsonLike);
      }

      if (parsed.projectId || parsed.apiKey) {
        localStorage.setItem('custom_firebase_config_override', JSON.stringify(parsed));
        setSaveMessage('Custom Firebase configuration saved! Reloading to connect...');
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setErrorMessage('Invalid configuration. Please make sure it has at least "projectId" and "apiKey".');
      }
    } catch (err: any) {
      setErrorMessage(`Could not parse configuration: ${err.message}. Please paste standard JSON or JavaScript config object.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-400 border border-amber-400/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Firebase Configuration & Linking</h2>
              <p className="text-xs text-slate-300">
                View current credentials or connect your personal Firebase project
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          
          {/* Section 1: Active Configuration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Currently Active Firebase Project Config
              </h3>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Config'}</span>
              </button>
            </div>

            <pre className="bg-slate-950 text-emerald-400 p-4 rounded-2xl font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
              {currentJsonString}
            </pre>

            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href={`https://console.firebase.google.com/project/${firebaseConfigData.projectId}/firestore/databases/${firebaseConfigData.firestoreDatabaseId}/data`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-semibold border border-blue-200"
              >
                <span>Open in Firebase Firestore Console</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Section 2: Step-by-Step Guide to find it in Firebase Console */}
          <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 space-y-3 text-amber-950">
            <h3 className="font-bold text-sm flex items-center gap-2 text-amber-900">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              How to find your Web Config in your own Firebase Console
            </h3>
            
            <p className="text-xs text-amber-900/90">
              If you have created a project at <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="underline font-bold text-blue-700">console.firebase.google.com</a>, follow these exact 4 steps:
            </p>

            <ol className="space-y-2 list-decimal list-inside text-xs text-amber-900/90 pl-1">
              <li className="leading-relaxed">
                <strong>Open your Project:</strong> Click your project name on the Firebase homepage.
              </li>
              <li className="leading-relaxed">
                <strong>Click the ⚙️ Gear Icon:</strong> In the left sidebar, click the gear icon next to <em>Project Overview</em>, then click <strong>Project settings</strong>.
              </li>
              <li className="leading-relaxed">
                <strong>Scroll to "Your apps":</strong> Stay on the <em>General</em> tab and scroll down to the bottom section called <strong>Your apps</strong>.
              </li>
              <li className="leading-relaxed">
                <strong>Get the config:</strong> If you see a Web App, select the <strong>Config</strong> radio button and copy the code snippet.
              </li>
            </ol>
          </div>

          {/* Section 3: Link Custom Project */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Link Your Personal Firebase Project (Optional)
              </h3>
              <button
                type="button"
                onClick={handleAutofillActiveConfig}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Autofill Active Config</span>
              </button>
            </div>
            
            <p className="text-xs text-slate-500">
              Paste the <code className="font-mono">firebaseConfig</code> object from your personal Firebase console below to connect it directly:
            </p>

            <textarea
              rows={4}
              value={customConfigInput}
              onChange={(e) => setCustomConfigInput(e.target.value)}
              placeholder={`const firebaseConfig = {\n  apiKey: "AIzaSy...",\n  authDomain: "my-project.firebaseapp.com",\n  projectId: "my-project",\n  storageBucket: "...",\n  messagingSenderId: "...",\n  appId: "..."\n};`}
              className="w-full bg-white font-mono text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />

            {errorMessage && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {saveMessage && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{saveMessage}</span>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleSaveCustomConfig}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save & Connect Personal Project</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-slate-400 text-[11px]">Database: Firestore Enterprise / Standard</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
