import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Play, 
  Terminal, 
  History, 
  Copy, 
  Check, 
  Download, 
  Trash2, 
  AlertCircle,
  Table,
  Layers,
  Code,
  RotateCcw,
  Sparkles,
  RefreshCw,
  CheckCircle,
  Dice5,
  ChevronDown
} from 'lucide-react';
import { useAlumni, SqlQueryResult } from '../context/AlumniContext';
import { DDL_STATEMENTS, DML_STATEMENTS } from '../data/sqlDefinitions';

interface Props {
  initialQuery?: string;
}

export const SqlConsoleView: React.FC<Props> = ({ initialQuery }) => {
  const { 
    sqlLogs, 
    executeSql, 
    clearSqlLogs, 
    isFirebaseConnected, 
    syncSampleDataToFirebase,
    isSyncing 
  } = useAlumni();

  const [activeTab, setActiveTab] = useState<'console' | 'ddl' | 'dml' | 'audit'>('console');
  
  // Default query that immediately tests custom columns and WHERE filtering
  const defaultSql = initialQuery || `SELECT name, company, designation, department, grad_year, is_mentor 
FROM alumni_members 
WHERE is_mentor = TRUE 
ORDER BY grad_year DESC;`;

  const [sqlInput, setSqlInput] = useState(defaultSql);
  const [queryResult, setQueryResult] = useState<SqlQueryResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ text: string; success: boolean } | null>(null);

  // Auto-run query on mount or when initialQuery changes
  useEffect(() => {
    if (initialQuery) {
      setSqlInput(initialQuery);
      const res = executeSql(initialQuery);
      setQueryResult(res);
    } else {
      const res = executeSql(defaultSql);
      setQueryResult(res);
    }
  }, [initialQuery]);

  const presetQueries = [
    {
      category: 'SELECT & FILTER',
      items: [
        {
          title: 'All Active Mentors',
          sql: `SELECT name, company, designation, department, grad_year \nFROM alumni_members \nWHERE is_mentor = TRUE \nORDER BY grad_year DESC;`
        },
        {
          title: 'Filter by Company (Google & Microsoft)',
          sql: `SELECT name, email, company, designation, department \nFROM alumni_members \nWHERE company IN ('Google', 'Microsoft', 'Apple') \nORDER BY name ASC;`
        },
        {
          title: 'Alumni by Batch (2018-2022)',
          sql: `SELECT name, grad_year, degree, department, company \nFROM alumni_members \nWHERE grad_year BETWEEN 2018 AND 2022 \nORDER BY grad_year DESC;`
        }
      ]
    },
    {
      category: 'GROUP BY & AGGREGATE',
      items: [
        {
          title: 'Company Headcounts (COUNT(*) AS count)',
          sql: `SELECT company, COUNT(*) AS count \nFROM alumni_members \nGROUP BY company \nORDER BY count DESC;`
        },
        {
          title: 'Department Stats & Year Ranges',
          sql: `SELECT department, COUNT(*) AS total_alumni, MIN(grad_year) AS oldest_batch, MAX(grad_year) AS newest_batch \nFROM alumni_members \nGROUP BY department \nORDER BY total_alumni DESC;`
        },
        {
          title: 'Event Fill Rates & Capacities',
          sql: `SELECT title, category, capacity, registered_count, \n       ROUND((registered_count * 100.0 / capacity), 1) AS occupancy_pct \nFROM alumni_events \nORDER BY occupancy_pct DESC;`
        }
      ]
    },
    {
      category: 'MULTI-TABLE JOINS',
      items: [
        {
          title: 'Event Registrations with Alumni & Event Names',
          sql: `SELECT r.ticket_code, r.attendance_mode, a.name AS attendee_name, a.company, e.title AS event_title, e.date AS event_date \nFROM event_registrations r \nJOIN alumni_members a ON r.user_id = a.id \nJOIN alumni_events e ON r.event_id = e.id;`
        },
        {
          title: 'Mentorship Requests with Student & Mentor Details',
          sql: `SELECT m.id, m.student_name, m.alumni_name, m.topic, m.status, a.company AS mentor_company \nFROM mentorship_requests m \nJOIN alumni_members a ON m.alumni_id = a.id \nORDER BY m.requested_at DESC;`
        }
      ]
    },
    {
      category: 'DML (INSERT / UPDATE / DELETE)',
      items: [
        {
          title: 'Insert New Alumnus Record',
          sql: `INSERT INTO alumni_members (id, name, email, grad_year, degree, department, company, designation, is_mentor) \nVALUES ('ALUM-888', 'Maya Lin', 'm.lin@apple.com', 2022, 'B.Tech CSE', 'Computer Science', 'Apple', 'iOS Engineer', TRUE);`
        },
        {
          title: 'Update Alumnus Role & Company',
          sql: `UPDATE alumni_members \nSET company = 'OpenAI', designation = 'Lead Research Scientist', is_mentor = TRUE \nWHERE id = 'ALUM-001';`
        },
        {
          title: 'Delete Declined Mentorship Requests',
          sql: `DELETE FROM mentorship_requests \nWHERE status = 'Declined';`
        }
      ]
    },
    {
      category: 'DDL (SCHEMA CREATION)',
      items: [
        {
          title: 'Create Alumni Chapters Table',
          sql: `CREATE TABLE alumni_chapters (\n  id VARCHAR(20) PRIMARY KEY,\n  city VARCHAR(80) NOT NULL,\n  country VARCHAR(80) NOT NULL,\n  lead_alumni_id VARCHAR(20),\n  member_count INT DEFAULT 0\n);`
        },
        {
          title: 'Create Index on Company and Year',
          sql: `CREATE INDEX idx_members_company_year ON alumni_members(company, grad_year);`
        }
      ]
    }
  ];

  const handleRunQuery = () => {
    if (!sqlInput.trim()) return;
    const res = executeSql(sqlInput);
    setQueryResult(res);
  };

  const handleAutofillRandomQuery = () => {
    const allPresets = presetQueries.flatMap(c => c.items);
    const randomItem = allPresets[Math.floor(Math.random() * allPresets.length)];
    setSqlInput(randomItem.sql);
    const res = executeSql(randomItem.sql);
    setQueryResult(res);
  };

  const handleSyncToFirebase = async () => {
    setSyncStatusMsg(null);
    const res = await syncSampleDataToFirebase();
    if (res.success) {
      setSyncStatusMsg({
        text: `Successfully synced & seeded all ${res.count} records across 5 collections into Firebase Firestore!`,
        success: true
      });
      // Re-run current query to reflect live data
      const qRes = executeSql(sqlInput);
      setQueryResult(qRes);
    } else {
      setSyncStatusMsg({
        text: `Sync note: ${res.error || 'Check Firebase security rules and internet connection.'}`,
        success: false
      });
    }
    setTimeout(() => {
      setSyncStatusMsg(null);
    }, 6000);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadFullSchema = () => {
    const fullSql = [
      '-- =========================================================',
      '-- ALUMNICONNECT DATABASE SCHEMA & SCRIPTS (PAT 4 LAB)',
      '-- Relational Schema: PostgreSQL / MySQL / SQLite / Firestore Compliant',
      '-- =========================================================\n',
      '-- 1. DATA DEFINITION LANGUAGE (DDL) COMMANDS',
      ...DDL_STATEMENTS.statements.map(s => s.sql),
      '\n-- 2. DATA MANIPULATION LANGUAGE (DML) COMMANDS',
      ...DML_STATEMENTS.statements.map(s => s.sql)
    ].join('\n\n');

    const blob = new Blob([fullSql], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alumni_management_ddl_dml_schema.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-slate-700/60">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Interactive SQL Engine • Synced with Firebase Firestore</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            SQL Database Console & Lab Workbench
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Write, autofill, and execute any custom SQL commands against live database tables. All DDL and DML operations dynamically compute and display real-time outputs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Autofill / Seed to Firebase Button */}
          <button
            onClick={handleSyncToFirebase}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
            title="Autofill and populate all sample records directly into Firebase Firestore"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing to Firebase...' : '⚡ Autofill Data to Firebase'}</span>
          </button>

          <button
            onClick={handleDownloadFullSchema}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export .sql</span>
          </button>
        </div>
      </div>

      {/* Sync Status Feedback Banner */}
      {syncStatusMsg && (
        <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border animate-in fade-in duration-200 ${
          syncStatusMsg.success 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-amber-50 text-amber-800 border-amber-200'
        }`}>
          {syncStatusMsg.success ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-amber-600" />}
          <span>{syncStatusMsg.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('console')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'console'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Live SQL Query Runner</span>
        </button>

        <button
          onClick={() => setActiveTab('ddl')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'ddl'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>DDL Schema Library ({DDL_STATEMENTS.statements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dml')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'dml'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>DML Command Library ({DML_STATEMENTS.statements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'audit'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Live Transaction Audit ({sqlLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: REAL DYNAMIC SQL QUERY RUNNER */}
      {activeTab === 'console' && (
        <div className="space-y-4">
          
          {/* Autofill Query Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800">Autofill Query Presets & Generator</h3>
                  <p className="text-[11px] text-slate-500">Click any preset to autofill the SQL editor or test random operations</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAutofillRandomQuery}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-200 transition-colors"
                >
                  <Dice5 className="w-3.5 h-3.5" />
                  <span>🎲 Autofill Random Query</span>
                </button>
              </div>
            </div>

            {/* Categorized Autofill Buttons */}
            <div className="space-y-2">
              {presetQueries.map((category, catIdx) => (
                <div key={catIdx} className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider min-w-36">
                    {category.category}:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {category.items.map((item, itemIdx) => (
                      <button
                        key={itemIdx}
                        onClick={() => {
                          setSqlInput(item.sql);
                          const res = executeSql(item.sql);
                          setQueryResult(res);
                        }}
                        className="px-2.5 py-1 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-medium rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>Tables available: <code>alumni_members</code>, <code>alumni_events</code>, <code>event_registrations</code>, <code>mentorship_requests</code>, <code>job_postings</code></span>
              <span className="text-slate-400">Supports SELECT, JOIN, GROUP BY, INSERT, UPDATE, DELETE, CREATE TABLE</span>
            </div>
          </div>

          {/* SQL Editor Area */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
            <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-mono text-slate-200 font-semibold">SQL Console Editor</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono">
                  Live Engine Ready
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSqlInput('SELECT * FROM alumni_members LIMIT 5;');
                    const res = executeSql('SELECT * FROM alumni_members LIMIT 5;');
                    setQueryResult(res);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 mr-2"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Query</span>
                </button>
                <button
                  onClick={handleRunQuery}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run SQL Query</span>
                </button>
              </div>
            </div>

            <textarea
              rows={6}
              value={sqlInput}
              onChange={(e) => setSqlInput(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault();
                  handleRunQuery();
                }
              }}
              className="w-full bg-slate-900 text-slate-100 font-mono text-xs sm:text-sm p-4 focus:outline-none resize-y leading-relaxed"
              placeholder="Type your SQL query here (e.g. SELECT name, company FROM alumni_members WHERE is_mentor = TRUE)... Press Ctrl+Enter to run"
            />
          </div>

          {/* Error Banner if Query Failed */}
          {queryResult && queryResult.error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>SQL Execution Error:</span>
              </div>
              <p className="font-mono text-[11px] bg-rose-100/70 p-2.5 rounded-lg text-rose-950">
                {queryResult.error}
              </p>
              <p className="text-[11px] text-slate-600">
                Tip: Check spelling of columns or table names. You can click any of the <strong>Autofill Query Presets</strong> above for guaranteed-valid SQL statements.
              </p>
            </div>
          )}

          {/* Results Table Output */}
          {queryResult && !queryResult.error && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-2">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Table className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-800 text-xs">Tabular Query Output</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                    {queryResult.affectedRows} row{queryResult.affectedRows === 1 ? '' : 's'} returned
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({queryResult.executionTimeMs} ms)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 italic hidden sm:inline">
                    {queryResult.message}
                  </span>
                  <button
                    onClick={() => {
                      if (queryResult.rows.length === 0) return;
                      const headers = queryResult.columns.join(',');
                      const rows = queryResult.rows.map(r => queryResult.columns.map(c => `"${r[c] ?? ''}"`).join(',')).join('\n');
                      const csv = `${headers}\n${rows}`;
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `query_result_${Date.now()}.csv`;
                      a.click();
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {queryResult.rows.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  Query executed successfully, but returned 0 rows matching criteria.
                </div>
              ) : (
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-100 text-slate-700 sticky top-0 border-b border-slate-200 text-[11px] uppercase">
                      <tr>
                        {queryResult.columns.map((col) => (
                          <th key={col} className="py-2.5 px-3.5 whitespace-nowrap font-bold">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {queryResult.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-blue-50/50 transition-colors">
                          {queryResult.columns.map((col) => {
                            const val = row[col];
                            return (
                              <td key={col} className="py-2 px-3.5 whitespace-nowrap">
                                {val === true ? (
                                  <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">TRUE</span>
                                ) : val === false ? (
                                  <span className="text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">FALSE</span>
                                ) : val !== undefined && val !== null ? (
                                  typeof val === 'object' ? JSON.stringify(val) : String(val)
                                ) : (
                                  <span className="text-slate-300 italic">NULL</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DDL SCHEMAS */}
      {activeTab === 'ddl' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-xs text-blue-900 flex items-start gap-3">
            <Layers className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{DDL_STATEMENTS.title}</p>
              <p className="text-slate-600 mt-0.5">{DDL_STATEMENTS.description}</p>
            </div>
          </div>

          <div className="space-y-4">
            {DDL_STATEMENTS.statements.map((stmt, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-xs">{stmt.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{stmt.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold font-mono">
                      Table: {stmt.table}
                    </span>
                    <button
                      onClick={() => {
                        setSqlInput(stmt.sql);
                        setActiveTab('console');
                        const res = executeSql(stmt.sql);
                        setQueryResult(res);
                      }}
                      className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-xs font-semibold flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" />
                      <span>Autofill & Run</span>
                    </button>
                    <button
                      onClick={() => copyToClipboard(stmt.sql, `ddl-${idx}`)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-200 transition-colors"
                      title="Copy SQL to Clipboard"
                    >
                      {copiedKey === `ddl-${idx}` ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed">
                  {stmt.sql}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DML SCHEMAS */}
      {activeTab === 'dml' && (
        <div className="space-y-6">
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl text-xs text-purple-900 flex items-start gap-3">
            <Code className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{DML_STATEMENTS.title}</p>
              <p className="text-slate-600 mt-0.5">{DML_STATEMENTS.description}</p>
            </div>
          </div>

          <div className="space-y-4">
            {DML_STATEMENTS.statements.map((stmt, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                        stmt.operation === 'INSERT'
                          ? 'bg-emerald-100 text-emerald-800'
                          : stmt.operation === 'UPDATE'
                          ? 'bg-amber-100 text-amber-800'
                          : stmt.operation === 'DELETE'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {stmt.operation}
                      </span>
                      <h3 className="font-bold text-slate-800 text-xs">{stmt.name}</h3>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{stmt.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSqlInput(stmt.sql);
                        setActiveTab('console');
                        const res = executeSql(stmt.sql);
                        setQueryResult(res);
                      }}
                      className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-xs font-semibold flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" />
                      <span>Autofill & Run</span>
                    </button>
                    <button
                      onClick={() => copyToClipboard(stmt.sql, `dml-${idx}`)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-200 transition-colors"
                    >
                      {copiedKey === `dml-${idx}` ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <pre className="p-4 bg-slate-950 text-blue-300 font-mono text-xs overflow-x-auto leading-relaxed">
                  {stmt.sql}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: LIVE TRANSACTION AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                Live SQL Transaction Audit Stream
              </h3>
              <p className="text-xs text-slate-500">
                Every query run in the console or action taken in the app is recorded in this transaction log.
              </p>
            </div>
            {sqlLogs.length > 0 && (
              <button
                onClick={clearSqlLogs}
                className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Log</span>
              </button>
            )}
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto">
            {sqlLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No SQL logs recorded in this session yet.
              </div>
            ) : (
              sqlLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-900 text-slate-200 p-3.5 rounded-xl border border-slate-800 space-y-2 font-mono text-xs"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-400">{log.id}</span>
                      <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                        log.commandType === 'DDL' ? 'bg-indigo-900 text-indigo-300' : 'bg-emerald-900 text-emerald-300'
                      }`}>
                        {log.commandType} - {log.operation}
                      </span>
                      <span>Target: {log.targetTable}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span>{log.executionTimeMs} ms</span>
                      <span className="text-slate-500">{log.timestamp}</span>
                    </div>
                  </div>
                  <pre className="text-emerald-400 bg-slate-950 p-2.5 rounded overflow-x-auto whitespace-pre-wrap text-[11px]">
                    {log.query}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
};
