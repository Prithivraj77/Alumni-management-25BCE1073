import React, { useMemo } from 'react';
import { 
  BarChart3, 
  Users, 
  Sparkles, 
  Calendar, 
  Building, 
  GraduationCap, 
  TrendingUp, 
  Database,
  ArrowRight
} from 'lucide-react';
import { useAlumni } from '../context/AlumniContext';

interface Props {
  onOpenSqlTabWithQuery?: (sql: string) => void;
}

export const AnalyticsDashboard: React.FC<Props> = ({ onOpenSqlTabWithQuery }) => {
  const { alumniList, events, registrations, mentorshipRequests } = useAlumni();

  // Metrics calculation
  const totalAlumni = alumniList.length;
  const activeMentors = alumniList.filter(a => a.isMentor).length;
  const totalEvents = events.length;
  const totalRegistrations = registrations.filter(r => r.status === 'Confirmed').length;

  // Department distribution
  const departmentStats = useMemo(() => {
    const counts: Record<string, number> = {};
    alumniList.forEach(a => {
      counts[a.department] = (counts[a.department] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [alumniList]);

  // Top companies
  const companyStats = useMemo(() => {
    const counts: Record<string, number> = {};
    alumniList.forEach(a => {
      if (a.company) counts[a.company] = (counts[a.company] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [alumniList]);

  // Batch Distribution
  const batchStats = useMemo(() => {
    const counts: Record<number, number> = {};
    alumniList.forEach(a => {
      counts[a.gradYear] = (counts[a.gradYear] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => Number(a[0]) - Number(b[0]));
  }, [alumniList]);

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Alumni Relations Intelligence & Engagement Metrics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Institutional Analytics & Reporting
          </h1>
          <p className="text-sm text-slate-300">
            Real-time aggregation of member demographics, career placement trends, mentorship readiness, and reunion participation.
          </p>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Total Alumni Records</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">{totalAlumni}</p>
          <p className="text-[11px] text-slate-500 mt-1">Across 8+ academic programs</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Active Mentors</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-2">{activeMentors}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            {Math.round((activeMentors / (totalAlumni || 1)) * 100)}% of alumni willing to guide
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Upcoming Events</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-purple-600 mt-2">{totalEvents}</p>
          <p className="text-[11px] text-slate-500 mt-1">Reunions, workshops & tech talks</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Total Confirmed RSVPs</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-2">{totalRegistrations}</p>
          <p className="text-[11px] text-slate-500 mt-1">Tracked in `event_registrations`</p>
        </div>
      </div>

      {/* Grid of Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Department Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                Alumni Representation by Department
              </h3>
              <p className="text-xs text-slate-400">Headcount distribution across major academic faculties</p>
            </div>
            {onOpenSqlTabWithQuery && (
              <button
                onClick={() => onOpenSqlTabWithQuery(`SELECT department, COUNT(*) AS alumni_count FROM alumni_members GROUP BY department ORDER BY alumni_count DESC;`)}
                className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                title="Inspect SQL Query for this metric"
              >
                <Database className="w-3 h-3" />
                <span>SQL Query</span>
              </button>
            )}
          </div>

          <div className="space-y-3 pt-2">
            {departmentStats.map(([dept, count]) => {
              const pct = Math.round((count / (totalAlumni || 1)) * 100);
              return (
                <div key={dept} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700">{dept}</span>
                    <span className="font-bold text-slate-900 font-mono">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Top Employers / Companies */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-600" />
                Top Alumni Employers & Industry Leaders
              </h3>
              <p className="text-xs text-slate-400">Prominent global organizations employing our graduates</p>
            </div>
            {onOpenSqlTabWithQuery && (
              <button
                onClick={() => onOpenSqlTabWithQuery(`SELECT company, COUNT(*) AS alumni_count FROM alumni_members WHERE company IS NOT NULL GROUP BY company ORDER BY alumni_count DESC LIMIT 5;`)}
                className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <Database className="w-3 h-3" />
                <span>SQL Query</span>
              </button>
            )}
          </div>

          <div className="space-y-3 pt-2">
            {companyStats.map(([comp, count], idx) => {
              const pct = Math.round((count / (totalAlumni || 1)) * 100);
              return (
                <div key={comp} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-slate-800 text-xs">{comp}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 text-xs font-mono">{count} alumni</span>
                    <span className="text-[10px] text-slate-400 block">{pct}% of network</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 3: Batch Year Timeline */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                Graduation Cohorts (2014 – 2024)
              </h3>
              <p className="text-xs text-slate-400">Distribution by graduating batch year</p>
            </div>
          </div>

          <div className="flex items-end gap-2 h-36 pt-4 border-b border-slate-100">
            {batchStats.map(([yr, count]) => {
              const heightPct = Math.max(15, Math.min(100, (count / 3) * 100));
              return (
                <div key={yr} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  <span className="text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    {count}
                  </span>
                  <div
                    className="w-full bg-gradient-to-t from-indigo-600 to-blue-500 rounded-t-md transition-all group-hover:brightness-110"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[10px] text-slate-500 font-mono rotate-45 sm:rotate-0 mt-1">
                    '{yr.toString().slice(-2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 4: Mentorship & Engagement Health */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Mentorship Program Conversion
              </h3>
              <p className="text-xs text-slate-400">Student inquiry acceptance and fulfillment rate</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
              <span className="text-xs text-emerald-800 font-medium">Acceptance Rate</span>
              <p className="text-2xl font-extrabold text-emerald-700 mt-1">
                {mentorshipRequests.length > 0 
                  ? Math.round((mentorshipRequests.filter(r => r.status === 'Accepted').length / mentorshipRequests.length) * 100) 
                  : 100}%
              </p>
              <p className="text-[10px] text-emerald-600 mt-0.5">High mentor responsiveness</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-center">
              <span className="text-xs text-blue-800 font-medium">Avg Event Capacity Fill</span>
              <p className="text-2xl font-extrabold text-blue-700 mt-1">
                {events.length > 0
                  ? Math.round(
                      (events.reduce((acc, e) => acc + e.registeredCount, 0) /
                        events.reduce((acc, e) => acc + e.capacity, 1)) * 100
                    )
                  : 75}%
              </p>
              <p className="text-[10px] text-blue-600 mt-0.5">Strong alumni participation</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
