import React, { useState } from 'react';
import { 
  Briefcase, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Building, 
  MapPin, 
  Plus, 
  Send, 
  ExternalLink, 
  Filter, 
  MessageSquare,
  UserCheck,
  X
} from 'lucide-react';
import { useAlumni } from '../context/AlumniContext';
import { JobPosting, MentorshipRequest } from '../types';
import confetti from 'canvas-confetti';

export const MentorshipAndJobsView: React.FC = () => {
  const { 
    currentUser, 
    mentorshipRequests, 
    updateMentorshipStatus, 
    jobPostings, 
    addJobPosting 
  } = useAlumni();

  const [activeTab, setActiveTab] = useState<'mentorship' | 'jobs'>('mentorship');

  // Job Board Filter & Modal
  const [jobTypeFilter, setJobTypeFilter] = useState<string>('ALL');
  const [isPostingJob, setIsPostingJob] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [jobCompany, setJobCompany] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [jobType, setJobType] = useState<'Full-time' | 'Internship' | 'Part-time' | 'Contract'>('Full-time');
  const [jobSalary, setJobSalary] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobSkills, setJobSkills] = useState('');
  const [jobApplyLink, setJobApplyLink] = useState('');

  // Mentorship Response Modal
  const [respondingReq, setRespondingReq] = useState<MentorshipRequest | null>(null);
  const [responseAction, setResponseAction] = useState<'Accepted' | 'Declined'>('Accepted');
  const [responseNote, setResponseNote] = useState('');

  // Filtered Jobs
  const filteredJobs = jobPostings.filter(j => 
    jobTypeFilter === 'ALL' || j.type === jobTypeFilter
  );

  const handlePostJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !jobCompany) return;

    addJobPosting({
      title: jobTitle,
      company: jobCompany,
      location: jobLocation || 'Remote',
      type: jobType,
      salaryRange: jobSalary || 'Competitive',
      description: jobDesc,
      skills: jobSkills.split(',').map(s => s.trim()).filter(Boolean),
      applyLink: jobApplyLink || 'https://careers.example.com',
      deadline: '2026-12-31'
    });

    setIsPostingJob(false);
    setJobTitle('');
    setJobCompany('');
    setJobLocation('');
    setJobDesc('');
    setJobSkills('');
    setJobApplyLink('');

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch {}
  };

  const handleMentorshipResponseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!respondingReq) return;

    updateMentorshipStatus(respondingReq.id, responseAction, responseNote);
    setRespondingReq(null);
    setResponseNote('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-slate-800">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Career Network & Mentorship</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            1-on-1 Guidance & Alumni Referrals
          </h1>
          <p className="text-sm text-slate-300">
            Ask an alumnus for 30 minutes of career advice, resume feedback, or interview preparation, or explore opportunities shared by graduates.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('mentorship')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'mentorship'
                ? 'bg-white text-blue-900 shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            Mentorship Hub
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'jobs'
                ? 'bg-white text-blue-900 shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            Job Board ({jobPostings.length})
          </button>
        </div>
      </div>

      {/* TAB 1: MENTORSHIP HUB */}
      {activeTab === 'mentorship' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Total Connection Requests</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{mentorshipRequests.length}</p>
              <span className="text-[11px] text-blue-600 font-medium">Logged in table `mentorship_requests`</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Accepted Matches</span>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                {mentorshipRequests.filter(r => r.status === 'Accepted').length}
              </p>
              <span className="text-[11px] text-emerald-700 font-medium">Active mentorship in progress</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Pending Review</span>
              <p className="text-2xl font-extrabold text-amber-600 mt-1">
                {mentorshipRequests.filter(r => r.status === 'Pending').length}
              </p>
              <span className="text-[11px] text-amber-700 font-medium">Awaiting alumni mentor confirmation</span>
            </div>
          </div>

          {/* Mentorship Requests List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  Mentorship Requests Stream
                </h3>
                <p className="text-xs text-slate-500">
                  Manage student inquiries or check status of your requests.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {mentorshipRequests.map((req) => {
                const isIncomingForMe = currentUser?.name === req.alumniName || currentUser?.role === 'admin';
                const isMyOutgoingRequest = currentUser?.name === req.studentName;

                return (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-slate-50/60 space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {req.id}
                        </span>
                        <h4 className="font-bold text-slate-900 text-xs">
                          {req.studentName} → {req.alumniName}
                        </h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          req.status === 'Accepted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'Declined'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {req.requestedAt}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-100 space-y-1">
                      <p className="font-semibold text-slate-800">
                        Topic: <span className="text-blue-700 font-bold">{req.topic}</span>
                      </p>
                      <p className="italic text-slate-600">"{req.message}"</p>
                      {req.responseNote && (
                        <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-emerald-800 bg-emerald-50/80 p-2 rounded">
                          <strong>Mentor's Note:</strong> {req.responseNote}
                        </div>
                      )}
                    </div>

                    {/* Action buttons if user is the mentor or admin */}
                    {isIncomingForMe && req.status === 'Pending' && (
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => {
                            setRespondingReq(req);
                            setResponseAction('Declined');
                          }}
                          className="px-3 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-semibold"
                        >
                          Decline Request
                        </button>
                        <button
                          onClick={() => {
                            setRespondingReq(req);
                            setResponseAction('Accepted');
                          }}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs"
                        >
                          Accept & Respond (DML UPDATE)
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: JOB BOARD */}
      {activeTab === 'jobs' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Filter Employment Type:</span>
              <select
                value={jobTypeFilter}
                onChange={(e) => setJobTypeFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
              >
                <option value="ALL">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Internship">Internship</option>
                <option value="Part-time">Part-time</option>
              </select>
            </div>

            <button
              onClick={() => setIsPostingJob(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post Job Opening (DML INSERT)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase">
                        {job.type}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-1.5 leading-snug">
                        {job.title}
                      </h3>
                      <p className="text-xs text-blue-700 font-semibold flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-slate-400" />
                        {job.company}
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80 shrink-0">
                      {job.salaryRange}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {job.skills.map(s => (
                      <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] rounded-md font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">
                    Referred by <strong>{job.postedByName}</strong>
                  </span>
                  <a
                    href={job.applyLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    <span>Apply / Refer</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* POST JOB MODAL */}
      {isPostingJob && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Post Alumni Referral / Job</h3>
                <p className="text-xs text-slate-400">Executes DML INSERT into `job_postings`</p>
              </div>
              <button onClick={() => setIsPostingJob(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 pt-4 pb-1">
              <button
                type="button"
                onClick={() => {
                  setJobTitle('Senior Cloud Platform & Distributed Systems Engineer');
                  setJobCompany('Google Cloud');
                  setJobLocation('Sunnyvale, CA (Hybrid / Remote)');
                  setJobType('Full-time');
                  setJobSalary('$175,000 - $220,000 + Equity');
                  setJobSkills('Go, Kubernetes, Distributed Systems, Python, gRPC');
                  setJobDesc('Our team builds planet-scale infrastructure services. Seeking alumni and recent graduates passionate about high-reliability systems. Internal referral provided for qualified candidates.');
                  setJobApplyLink('https://careers.google.com');
                }}
                className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-blue-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>✨ Autofill Sample Job Details</span>
              </button>
            </div>

            <form onSubmit={handlePostJobSubmit} className="p-6 pt-3 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company *</label>
                  <input
                    type="text"
                    required
                    value={jobCompany}
                    onChange={(e) => setJobCompany(e.target.value)}
                    placeholder="e.g. Google / Microsoft"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Employment Type</label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={jobLocation}
                    onChange={(e) => setJobLocation(e.target.value)}
                    placeholder="e.g. New York / Remote"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Salary Range / Stipend</label>
                  <input
                    type="text"
                    value={jobSalary}
                    onChange={(e) => setJobSalary(e.target.value)}
                    placeholder="$120k - $160k"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Key Skills (Comma Separated)</label>
                <input
                  type="text"
                  value={jobSkills}
                  onChange={(e) => setJobSkills(e.target.value)}
                  placeholder="Python, AWS, React, Docker"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description & Qualifications</label>
                <textarea
                  rows={3}
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  placeholder="Responsibilities, team context, and referral instructions..."
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Application URL</label>
                <input
                  type="url"
                  value={jobApplyLink}
                  onChange={(e) => setJobApplyLink(e.target.value)}
                  placeholder="https://company.com/apply"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPostingJob(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Submit & Post (INSERT)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MENTORSHIP RESPONSE MODAL */}
      {respondingReq && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in">
            <div className={`p-5 text-white ${responseAction === 'Accepted' ? 'bg-emerald-700' : 'bg-rose-700'}`}>
              <h3 className="font-bold text-base">{responseAction} Mentorship Request</h3>
              <p className="text-xs opacity-90">Student: {respondingReq.studentName} ({respondingReq.studentDegree})</p>
            </div>

            <form onSubmit={handleMentorshipResponseSubmit} className="p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-700">Personal Message / Note to Student</label>
                <button
                  type="button"
                  onClick={() => {
                    if (responseAction === 'Accepted') {
                      setResponseNote(`Hi ${respondingReq.studentName}! I would be glad to help you prepare. Let's schedule a 30-minute Google Meet session next week. Please send over your latest resume draft and 2-3 specific technical questions.`);
                    } else {
                      setResponseNote(`Hi ${respondingReq.studentName}, thank you for reaching out. Unfortunately, my mentoring capacity is full for this quarter. I encourage you to connect with other alumni mentors in the directory!`);
                    }
                  }}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Autofill Note</span>
                </button>
              </div>
              <div>
                <textarea
                  rows={4}
                  required
                  value={responseNote}
                  onChange={(e) => setResponseNote(e.target.value)}
                  placeholder={responseAction === 'Accepted' ? 'Suggest meeting date, video conference link, or prep resources...' : 'Reason for declining politely...'}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRespondingReq(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white rounded-lg font-bold shadow-xs ${
                    responseAction === 'Accepted' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Confirm & Execute DML UPDATE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
