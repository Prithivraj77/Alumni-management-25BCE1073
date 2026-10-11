import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Building, 
  Sparkles, 
  Save, 
  CheckCircle, 
  Database, 
  Plus, 
  X, 
  Globe, 
  Linkedin, 
  Github,
  AlertCircle
} from 'lucide-react';
import { useAlumni } from '../context/AlumniContext';
import confetti from 'canvas-confetti';

export const ProfileView: React.FC = () => {
  const { currentUser, alumniList, updateProfile } = useAlumni();

  // Find member record matching current user
  const currentMember = alumniList.find(a => a.id === currentUser?.id || a.email === currentUser?.email) || {
    id: currentUser?.id || 'ALUM-001',
    name: currentUser?.name || 'Sarah Chen',
    email: currentUser?.email || 'sarah.chen@google.com',
    role: currentUser?.role || 'alumni',
    avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    gradYear: currentUser?.gradYear || 2018,
    degree: currentUser?.degree || 'B.Tech Computer Science & Engineering',
    department: currentUser?.department || 'Computer Science',
    company: currentUser?.company || 'Google',
    designation: currentUser?.designation || 'Staff Software Engineer',
    industry: 'Cloud & Distributed Systems',
    location: 'Mountain View, CA, USA',
    bio: 'Passionate distributed systems engineer with 8+ years building hyperscale cloud infrastructure.',
    phone: '+1 (650) 555-0192',
    linkedin: 'https://linkedin.com/in/sarah-chen-eng',
    github: 'https://github.com/sarahchen',
    skills: ['Go', 'Kubernetes', 'Distributed Systems', 'C++', 'System Design'],
    isMentor: true,
    mentorshipTopics: ['System Design for Tech Interviews', 'Transitioning to Tech Lead'],
    joinedDate: '2022-03-15'
  };

  // Local form state
  const [name, setName] = useState(currentMember.name);
  const [email, setEmail] = useState(currentMember.email);
  const [phone, setPhone] = useState(currentMember.phone || '');
  const [location, setLocation] = useState(currentMember.location || '');
  const [bio, setBio] = useState(currentMember.bio || '');
  
  const [gradYear, setGradYear] = useState(currentMember.gradYear || 2018);
  const [degree, setDegree] = useState(currentMember.degree || '');
  const [department, setDepartment] = useState(currentMember.department || 'Computer Science');

  const [company, setCompany] = useState(currentMember.company || '');
  const [designation, setDesignation] = useState(currentMember.designation || '');
  const [industry, setIndustry] = useState(currentMember.industry || '');

  const [linkedin, setLinkedin] = useState(currentMember.linkedin || '');
  const [github, setGithub] = useState(currentMember.github || '');

  const [skills, setSkills] = useState<string[]>(currentMember.skills || []);
  const [newSkill, setNewSkill] = useState('');

  const [isMentor, setIsMentor] = useState(currentMember.isMentor ?? true);
  const [mentorshipTopics, setMentorshipTopics] = useState<string[]>(currentMember.mentorshipTopics || []);
  const [newTopic, setNewTopic] = useState('');

  const [saveStatus, setSaveStatus] = useState<{ success: boolean; message: string; query?: string } | null>(null);

  // Sync state whenever current user changes
  useEffect(() => {
    if (currentMember) {
      setName(currentMember.name);
      setEmail(currentMember.email);
      setPhone(currentMember.phone || '');
      setLocation(currentMember.location || '');
      setBio(currentMember.bio || '');
      setGradYear(currentMember.gradYear || 2018);
      setDegree(currentMember.degree || '');
      setDepartment(currentMember.department || 'Computer Science');
      setCompany(currentMember.company || '');
      setDesignation(currentMember.designation || '');
      setIndustry(currentMember.industry || '');
      setLinkedin(currentMember.linkedin || '');
      setGithub(currentMember.github || '');
      setSkills(currentMember.skills || []);
      setIsMentor(currentMember.isMentor ?? true);
      setMentorshipTopics(currentMember.mentorshipTopics || []);
      setSaveStatus(null);
    }
  }, [currentUser?.id]);

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleAddTopic = () => {
    if (newTopic.trim() && !mentorshipTopics.includes(newTopic.trim())) {
      setMentorshipTopics([...mentorshipTopics, newTopic.trim()]);
      setNewTopic('');
    }
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    setMentorshipTopics(mentorshipTopics.filter(t => t !== topicToRemove));
  };

  // Real-time SQL DML Query Preview
  const liveSqlPreview = `UPDATE alumni_members
SET name = '${name.replace(/'/g, "''")}',
    company = '${company.replace(/'/g, "''")}',
    designation = '${designation.replace(/'/g, "''")}',
    department = '${department}',
    grad_year = ${gradYear},
    location = '${location.replace(/'/g, "''")}',
    phone = '${phone.replace(/'/g, "''")}',
    is_mentor = ${isMentor ? 'TRUE' : 'FALSE'},
    linkedin = '${linkedin.replace(/'/g, "''")}'
WHERE id = '${currentMember.id}';`;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const result = updateProfile({
      name,
      email,
      phone,
      location,
      bio,
      gradYear: Number(gradYear),
      degree,
      department,
      company,
      designation,
      industry,
      linkedin,
      github,
      skills,
      isMentor,
      mentorshipTopics
    });

    if (result.success) {
      setSaveStatus({
        success: true,
        message: 'Your profile has been saved and synced with Firebase Firestore.',
        query: liveSqlPreview
      });

      try {
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
      } catch {}
    } else {
      setSaveStatus({
        success: false,
        message: result.message
      });
    }
  };

  const handleAutofillProfile = (preset: 'cloud' | 'ai' | 'consulting' | 'ev') => {
    if (preset === 'cloud') {
      setName('Sarah Chen');
      setCompany('Google');
      setDesignation('Staff Software Engineer');
      setDepartment('Computer Science');
      setDegree('B.Tech Computer Science');
      setGradYear(2018);
      setIndustry('Cloud & Distributed Systems');
      setLocation('Mountain View, CA, USA');
      setPhone('+1 (650) 555-0192');
      setLinkedin('https://linkedin.com/in/sarah-chen-eng');
      setGithub('https://github.com/sarahchen');
      setBio('Passionate distributed systems engineer with 8+ years building hyperscale cloud infrastructure. Former ACM President and open-source contributor.');
      setSkills(['Go', 'Kubernetes', 'Distributed Systems', 'C++', 'System Design', 'gRPC']);
      setIsMentor(true);
      setMentorshipTopics(['System Design for Tech Interviews', 'Transitioning to Tech Lead', 'Cloud Architecture']);
    } else if (preset === 'ai') {
      setName('Elena Rostova');
      setCompany('Meta AI (FAIR)');
      setDesignation('Senior AI Research Scientist');
      setDepartment('Data Science');
      setDegree('B.Tech Data Science & AI');
      setGradYear(2020);
      setIndustry('Generative AI & Multimodal Models');
      setLocation('Menlo Park, CA, USA');
      setPhone('+1 (650) 555-0118');
      setLinkedin('https://linkedin.com/in/elena-rostova-ai');
      setGithub('https://github.com/elenarostova');
      setBio('Working on multimodal vision-language foundation models. Published at CVPR, NeurIPS, and ICCV. Passionate about open-source research and AI mentorship.');
      setSkills(['PyTorch', 'Transformer Architectures', 'LLM Alignment', 'Computer Vision', 'CUDA']);
      setIsMentor(true);
      setMentorshipTopics(['Publishing in Top AI Conferences', 'Getting into Research Labs', 'Deep Learning Careers']);
    } else if (preset === 'consulting') {
      setName('Priya Sharma');
      setCompany('McKinsey & Company');
      setDesignation('Associate Partner');
      setDepartment('Mechanical Engineering');
      setDegree('B.Tech Mechanical Engineering');
      setGradYear(2017);
      setIndustry('Strategy & Sustainable Energy');
      setLocation('New York, NY, USA');
      setPhone('+1 (212) 555-0189');
      setLinkedin('https://linkedin.com/in/priya-sharma-consulting');
      setBio('Advising global energy executives on decarbonization and supply chain resilience. Former Formula Student team captain and university gold medalist.');
      setSkills(['Supply Chain Strategy', 'Clean Energy Tech', 'Financial Modeling', 'Case Interviews', 'Operations']);
      setIsMentor(true);
      setMentorshipTopics(['Management Consulting Prep (Case Interviews)', 'Engineering to Consulting Pivot']);
    } else {
      setName('Marcus Vance');
      setCompany('Tesla');
      setDesignation('Staff Battery Systems Engineer');
      setDepartment('Electrical Engineering');
      setDegree('B.Tech Electrical & Electronics');
      setGradYear(2019);
      setIndustry('Electric Vehicles & Clean Energy');
      setLocation('Austin, TX, USA');
      setPhone('+1 (512) 555-0131');
      setLinkedin('https://linkedin.com/in/marcus-vance-ev');
      setBio('Developing next-generation structural battery packs and battery thermal management algorithms for electric vehicles and energy storage.');
      setSkills(['Battery Management Systems', 'MATLAB/Simulink', 'Hardware In The Loop', 'Thermal Analysis']);
      setIsMentor(true);
      setMentorshipTopics(['Electric Vehicle Engineering', 'Hardware and Embedded Systems']);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <img
            src={currentMember.avatar}
            alt={name}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-blue-50 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{name}</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 uppercase">
                {currentUser?.role || 'alumni'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Member ID: <span className="font-mono font-medium text-slate-700">{currentMember.id}</span> • Joined {currentMember.joinedDate}
            </p>
            <p className="text-xs text-blue-600 font-medium">
              {designation} at {company}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Autofill Presets */}
          <div className="flex items-center gap-1 bg-amber-50/80 border border-amber-200/80 px-2 py-1 rounded-xl text-xs">
            <span className="text-[11px] font-semibold text-amber-900 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Autofill:
            </span>
            <button
              type="button"
              onClick={() => handleAutofillProfile('cloud')}
              className="px-2 py-1 bg-white hover:bg-amber-100 text-amber-900 rounded-lg text-[11px] font-bold transition-colors border border-amber-200"
              title="Autofill Google Cloud Engineer profile"
            >
              Google
            </button>
            <button
              type="button"
              onClick={() => handleAutofillProfile('ai')}
              className="px-2 py-1 bg-white hover:bg-amber-100 text-amber-900 rounded-lg text-[11px] font-bold transition-colors border border-amber-200"
              title="Autofill Meta AI Scientist profile"
            >
              Meta AI
            </button>
            <button
              type="button"
              onClick={() => handleAutofillProfile('consulting')}
              className="px-2 py-1 bg-white hover:bg-amber-100 text-amber-900 rounded-lg text-[11px] font-bold transition-colors border border-amber-200"
              title="Autofill McKinsey Consultant profile"
            >
              McKinsey
            </button>
            <button
              type="button"
              onClick={() => handleAutofillProfile('ev')}
              className="px-2 py-1 bg-white hover:bg-amber-100 text-amber-900 rounded-lg text-[11px] font-bold transition-colors border border-amber-200"
              title="Autofill Tesla Engineer profile"
            >
              Tesla
            </button>
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </div>
      </div>

      {/* Success / Alert Banner */}
      {saveStatus && (
        <div className={`p-4 rounded-xl border text-xs space-y-2 ${
          saveStatus.success 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          <div className="flex items-center gap-2 font-bold">
            {saveStatus.success ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{saveStatus.message}</span>
          </div>
          {saveStatus.query && (
            <div className="bg-slate-900 text-emerald-400 p-2.5 rounded font-mono text-[11px] overflow-x-auto whitespace-pre">
              {saveStatus.query}
            </div>
          )}
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: Basic Identity & Contact */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              1. Personal & Contact Details
            </h2>
            <span className="text-[11px] text-slate-400">Maps to columns in `alumni_members` table</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Location (City, Country)</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="San Francisco, CA, USA"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Short Professional Bio</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your career highlights, areas of research, or what you enjoy building..."
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Academic & Department Details */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              2. Academic Records
            </h2>
            <span className="text-[11px] text-slate-400">University Affiliation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department / Branch</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Biotechnology">Biotechnology</option>
                <option value="Data Science">Data Science</option>
                <option value="Business Administration">Business Administration</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Degree Title</label>
              <input
                type="text"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="B.Tech Computer Science"
                className="w-full p-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Graduation Batch / Year</label>
              <input
                type="number"
                min="1950"
                max="2030"
                value={gradYear}
                onChange={(e) => setGradYear(Number(e.target.value))}
                className="w-full p-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Career & Employer Details */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-600" />
              3. Current Career & Employment Details
            </h2>
            <span className="text-[11px] text-slate-400">Professional Directory Fields</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Company / Organization</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Google, Tesla, Startup"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Job Designation / Role</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Staff Software Engineer"
                className="w-full p-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Industry Sector</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Cloud Infrastructure & AI"
                className="w-full p-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          {/* Social Profiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">LinkedIn Profile URL</label>
              <div className="relative">
                <Linkedin className="w-4 h-4 text-blue-600 absolute left-3 top-2.5" />
                <input
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">GitHub / Portfolio URL</label>
              <div className="relative">
                <Github className="w-4 h-4 text-slate-600 absolute left-3 top-2.5" />
                <input
                  type="url"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Skills & Mentorship Settings */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              4. Skills & Student Mentorship Program
            </h2>
            <span className="text-[11px] text-slate-400">Mentorship Availability</span>
          </div>

          {/* Skills Tag Editor */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-700 text-xs">Technical Skills & Expertise</label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg min-h-[44px]">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 bg-white border border-slate-200 text-slate-800 text-xs rounded-md shadow-2xs flex items-center gap-1 font-medium"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="+ Add skill tag"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                  className="px-2 py-0.5 text-xs bg-transparent border-none focus:outline-none text-slate-700 w-28"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="p-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Mentorship Toggle */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 text-xs">Open to Mentor Current Students & Recent Grads</p>
                <p className="text-[11px] text-slate-500">
                  Allow students to browse your profile in the Mentorship directory and request career guidance.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isMentor}
                  onChange={(e) => setIsMentor(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {isMentor && (
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Mentorship Topics Offered</label>
                <div className="flex flex-wrap gap-1.5">
                  {mentorshipTopics.map(t => (
                    <span key={t} className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-md flex items-center gap-1 font-medium">
                      {t}
                      <button type="button" onClick={() => handleRemoveTopic(t)} className="text-emerald-600 hover:text-emerald-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. System Design Mock Interview"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTopic(); } }}
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddTopic}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                  >
                    Add Topic
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live SQL Preview Card */}
        <div className="bg-slate-900 rounded-xl p-4 text-white border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold text-slate-300">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              Live Generated DML UPDATE Query:
            </span>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
              Table: alumni_members
            </span>
          </div>
          <pre className="text-emerald-400 font-mono text-xs overflow-x-auto p-2 bg-slate-950 rounded border border-slate-800/80">
            {liveSqlPreview}
          </pre>
        </div>

        {/* Bottom Save Action */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Execute DML UPDATE & Save Profile</span>
          </button>
        </div>

      </form>
    </div>
  );
};
