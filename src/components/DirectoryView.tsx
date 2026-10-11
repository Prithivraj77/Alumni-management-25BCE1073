import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Sparkles, 
  Linkedin, 
  Github, 
  Mail, 
  Phone, 
  ExternalLink, 
  MessageSquare, 
  Download, 
  Grid, 
  List, 
  X, 
  CheckCircle,
  Building,
  Award,
  BookOpen
} from 'lucide-react';
import { useAlumni } from '../context/AlumniContext';
import { AlumniMember } from '../types';

export const DirectoryView: React.FC = () => {
  const { alumniList, currentUser, requestMentorship } = useAlumni();
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedBatchRange, setSelectedBatchRange] = useState<string>('ALL');
  const [mentorsOnly, setMentorsOnly] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Selected member drawer
  const [selectedMember, setSelectedMember] = useState<AlumniMember | null>(null);

  // Mentorship request modal state
  const [mentorshipTarget, setMentorshipTarget] = useState<AlumniMember | null>(null);
  const [mentorTopic, setMentorTopic] = useState('');
  const [mentorMessage, setMentorMessage] = useState('');
  const [requestSentSuccess, setRequestSentSuccess] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Departments list
  const departments = useMemo(() => {
    const set = new Set(alumniList.map(a => a.department));
    return Array.from(set).sort();
  }, [alumniList]);

  // Filtered members list
  const filteredAlumni = useMemo(() => {
    return alumniList.filter(member => {
      // Search query matches name, company, designation, skills, or location
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch = !query || 
        member.name.toLowerCase().includes(query) ||
        member.company.toLowerCase().includes(query) ||
        member.designation.toLowerCase().includes(query) ||
        member.department.toLowerCase().includes(query) ||
        member.location.toLowerCase().includes(query) ||
        member.skills.some(s => s.toLowerCase().includes(query));

      // Department filter
      const matchesDept = selectedDept === 'ALL' || member.department === selectedDept;

      // Mentors only filter
      const matchesMentor = !mentorsOnly || member.isMentor;

      // Batch filter
      let matchesBatch = true;
      if (selectedBatchRange === '2020+') {
        matchesBatch = member.gradYear >= 2020;
      } else if (selectedBatchRange === '2015-2019') {
        matchesBatch = member.gradYear >= 2015 && member.gradYear <= 2019;
      } else if (selectedBatchRange === 'before-2015') {
        matchesBatch = member.gradYear < 2015;
      }

      return matchesSearch && matchesDept && matchesMentor && matchesBatch;
    });
  }, [alumniList, searchTerm, selectedDept, selectedBatchRange, mentorsOnly]);

  // Export filtered directory to CSV
  const handleExportCSV = () => {
    setIsExporting(true);
    const headers = [
      'ID',
      'Name',
      'Email',
      'Phone',
      'Graduation Year',
      'Degree',
      'Department',
      'Company',
      'Designation',
      'Industry',
      'Location',
      'Is Mentor',
      'Mentorship Topics',
      'Skills',
      'LinkedIn',
      'GitHub',
      'Bio'
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = filteredAlumni.map(m => [
      escapeCsv(m.id),
      escapeCsv(m.name),
      escapeCsv(m.email),
      escapeCsv(m.phone || ''),
      escapeCsv(m.gradYear),
      escapeCsv(m.degree),
      escapeCsv(m.department),
      escapeCsv(m.company),
      escapeCsv(m.designation),
      escapeCsv(m.industry),
      escapeCsv(m.location),
      escapeCsv(m.isMentor ? 'Yes' : 'No'),
      escapeCsv((m.mentorshipTopics || []).join('; ')),
      escapeCsv((m.skills || []).join('; ')),
      escapeCsv(m.linkedin || ''),
      escapeCsv(m.github || ''),
      escapeCsv(m.bio || '')
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `alumni_directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setTimeout(() => setIsExporting(false), 2000);
  };

  const handleSendMentorship = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorshipTarget || !mentorTopic || !mentorMessage) return;

    requestMentorship(mentorshipTarget.id, mentorTopic, mentorMessage);
    setRequestSentSuccess(true);
    setTimeout(() => {
      setRequestSentSuccess(false);
      setMentorshipTarget(null);
      setMentorTopic('');
      setMentorMessage('');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="max-w-2xl relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Alumni Community Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Find Classmates, Mentors & Fellow Graduates
          </h1>
          <p className="text-sm text-slate-300">
            Explore career paths across engineering, research, and business. Connect with alumni who have volunteered to guide students and recent grads.
          </p>
        </div>
      </div>

      {/* Search & Filter Controls Toolbar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by name, company (e.g. Google, Tesla), skills, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Actions (View toggle & Export) */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-500'}`}
                title="Grid Card View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-500'}`}
                title="Tabular Data View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all border border-emerald-300 shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
              title="Download current alumni member list as a CSV spreadsheet"
            >
              {isExporting ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Downloaded ({filteredAlumni.length})</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export to CSV</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filter Pills row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1 text-[11px]">
            <Filter className="w-3 h-3" /> Filters:
          </span>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-2.5 py-1 border border-slate-200 rounded-lg bg-white text-slate-700 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Departments</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Batch Filter */}
          <select
            value={selectedBatchRange}
            onChange={(e) => setSelectedBatchRange(e.target.value)}
            className="px-2.5 py-1 border border-slate-200 rounded-lg bg-white text-slate-700 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Batches</option>
            <option value="2020+">Recent (2020 – 2026)</option>
            <option value="2015-2019">Mid-Career (2015 – 2019)</option>
            <option value="before-2015">Senior Leaders (&lt; 2015)</option>
          </select>

          {/* Mentorship Toggle */}
          <button
            type="button"
            onClick={() => setMentorsOnly(!mentorsOnly)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              mentorsOnly
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Sparkles className={`w-3 h-3 ${mentorsOnly ? 'text-emerald-600' : 'text-slate-400'}`} />
            Open for Mentorship
          </button>

          {/* Reset Filters */}
          {(searchTerm || selectedDept !== 'ALL' || selectedBatchRange !== 'ALL' || mentorsOnly) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedDept('ALL');
                setSelectedBatchRange('ALL');
                setMentorsOnly(false);
              }}
              className="text-xs text-blue-600 hover:underline font-semibold ml-auto"
            >
              Reset Filters
            </button>
          )}

          <span className="ml-auto text-[11px] text-slate-400 font-medium">
            Showing <strong className="text-slate-800">{filteredAlumni.length}</strong> members
          </span>
        </div>
      </div>

      {/* Directory Content */}
      {filteredAlumni.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No alumni matching criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms, changing the department filter, or resetting your search parameters.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAlumni.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 group"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100 group-hover:ring-blue-100 transition-all"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                        {member.name}
                        <span className="text-[11px] font-normal text-slate-400">'{member.gradYear.toString().slice(-2)}</span>
                      </h3>
                      <p className="text-xs font-semibold text-blue-700 leading-tight">
                        {member.designation}
                      </p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-400" />
                        {member.company}
                      </p>
                    </div>
                  </div>
                  {member.isMentor && (
                    <span 
                      className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full text-[10px] font-bold shrink-0 flex items-center gap-1"
                      title="Available to mentor students"
                    >
                      <Sparkles className="w-2.5 h-2.5" /> Mentor
                    </span>
                  )}
                </div>

                {/* Degree & Location */}
                <div className="mt-3.5 space-y-1 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{member.degree} ({member.department})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{member.location}</span>
                  </div>
                </div>

                {/* Bio teaser */}
                <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {member.bio}
                </p>

                {/* Skills tags */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {member.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-medium rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                  {member.skills.length > 3 && (
                    <span className="px-1.5 py-0.5 text-slate-400 text-[10px]">
                      +{member.skills.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedMember(member)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  View Profile
                </button>
                {member.isMentor && (
                  <button
                    onClick={() => {
                      setMentorshipTarget(member);
                      setMentorTopic(member.mentorshipTopics[0] || 'Career Advice & Resume Review');
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Request Mentoring</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Department & Class</th>
                  <th className="py-3 px-4">Current Role & Company</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-center">Mentor Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredAlumni.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2.5">
                        <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-lg object-cover" />
                        <div>
                          <div className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer" onClick={() => setSelectedMember(member)}>
                            {member.name}
                          </div>
                          <div className="text-[11px] text-slate-400">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{member.department}</div>
                      <div className="text-[11px] text-slate-400">Class of {member.gradYear}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-blue-900">{member.designation}</div>
                      <div className="text-[11px] text-slate-500">{member.company}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {member.location}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {member.isMentor ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          Active
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedMember(member)}
                        className="text-xs font-semibold text-blue-600 hover:underline mr-2"
                      >
                        Profile
                      </button>
                      {member.isMentor && (
                        <button
                          onClick={() => {
                            setMentorshipTarget(member);
                            setMentorTopic(member.mentorshipTopics[0] || 'Career Advice');
                          }}
                          className="text-xs font-semibold text-emerald-600 hover:underline"
                        >
                          Mentor
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Member Details Modal / Drawer */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-blue-950 p-6 text-white relative">
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <img
                  src={selectedMember.avatar}
                  alt={selectedMember.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white/20 shadow-md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">{selectedMember.name}</h2>
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-200 text-xs font-medium border border-blue-400/30">
                      Class of {selectedMember.gradYear}
                    </span>
                  </div>
                  <p className="text-sm text-blue-200 font-medium">
                    {selectedMember.designation} at {selectedMember.company}
                  </p>
                  <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {selectedMember.location}
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 text-sm text-slate-700 max-h-[70vh] overflow-y-auto">
              {/* Bio */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Biography</h4>
                <p className="text-xs leading-relaxed text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedMember.bio}
                </p>
              </div>

              {/* Academic & Degree */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Degree & Major</div>
                  <div className="font-semibold text-slate-800 text-xs mt-0.5">{selectedMember.degree}</div>
                  <div className="text-[11px] text-slate-500">{selectedMember.department}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Industry Focus</div>
                  <div className="font-semibold text-slate-800 text-xs mt-0.5">{selectedMember.industry}</div>
                  <div className="text-[11px] text-slate-500">Member since {selectedMember.joinedDate}</div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Skills & Expertise</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMember.skills.map(s => (
                    <span key={s} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg border border-blue-100">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Mentorship Topics */}
              {selectedMember.isMentor && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Available Mentorship Tracks:
                  </h4>
                  <ul className="space-y-1 text-xs text-emerald-800">
                    {selectedMember.mentorshipTopics.map(t => (
                      <li key={t} className="flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Achievements if any */}
              {selectedMember.achievements && selectedMember.achievements.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Honors & Milestones</h4>
                  <div className="space-y-1">
                    {selectedMember.achievements.map((ach, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                        <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{ach}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-4 text-xs">
                <a href={`mailto:${selectedMember.email}`} className="flex items-center gap-1.5 text-blue-600 hover:underline">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedMember.email}</span>
                </a>
                {selectedMember.linkedin && (
                  <a href={selectedMember.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:underline">
                    <Linkedin className="w-3.5 h-3.5 text-blue-700" />
                    <span>LinkedIn Profile</span>
                  </a>
                )}
                {selectedMember.github && (
                  <a href={selectedMember.github} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-slate-700 hover:underline">
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">ID: {selectedMember.id}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedMember(null)}
                  className="px-4 py-1.5 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100"
                >
                  Close
                </button>
                {selectedMember.isMentor && (
                  <button
                    onClick={() => {
                      setMentorshipTarget(selectedMember);
                      setSelectedMember(null);
                    }}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1"
                  >
                    <MessageSquare className="w-3 h-3" />
                    Request Mentorship
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mentorship Request Modal */}
      {mentorshipTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in">
            <div className="bg-blue-600 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Request 1-on-1 Mentorship</h3>
                <p className="text-xs text-blue-100">Connecting with {mentorshipTarget.name} ({mentorshipTarget.company})</p>
              </div>
              <button onClick={() => setMentorshipTarget(null)} className="text-blue-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {requestSentSuccess ? (
              <div className="p-8 text-center space-y-2">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-slate-900 text-base">Request Submitted!</h4>
                <p className="text-xs text-slate-500">
                  DML INSERT into mentorship_requests recorded. {mentorshipTarget.name} will be notified.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendMentorship} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Mentorship Topic *</label>
                  <select
                    value={mentorTopic}
                    onChange={(e) => setMentorTopic(e.target.value)}
                    required
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {mentorshipTarget.mentorshipTopics.length > 0 ? (
                      mentorshipTarget.mentorshipTopics.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))
                    ) : (
                      <>
                        <option value="Career Guidance & Industry Transition">Career Guidance & Industry Transition</option>
                        <option value="Resume Review & Mock Interview">Resume Review & Mock Interview</option>
                        <option value="Technical System Architecture">Technical System Architecture</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">
                      Your Message / Specific Questions *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMentorMessage(`Hello ${mentorshipTarget.name}! I am an aspiring engineer from the Department of Computer Science. I admire your trajectory at ${mentorshipTarget.company} and would greatly value 20-30 minutes of your time to review my engineering resume and discuss best practices for system architecture interviews. Thank you!`);
                      }}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>✨ Autofill Sample Message</span>
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={mentorMessage}
                    onChange={(e) => setMentorMessage(e.target.value)}
                    required
                    placeholder="Introduce yourself, mention your degree/batch, and explain what specific guidance or questions you have..."
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-500 font-mono text-[10px]">
                  <span>Trigger: DML INSERT INTO mentorship_requests (...)</span>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setMentorshipTarget(null)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
