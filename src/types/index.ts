export type UserRole = 'alumni' | 'student' | 'admin';

export interface AlumniMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  gradYear: number;
  degree: string;
  department: string;
  company: string;
  designation: string;
  industry: string;
  location: string;
  bio: string;
  phone: string;
  linkedin: string;
  github?: string;
  website?: string;
  skills: string[];
  isMentor: boolean;
  mentorshipTopics: string[];
  joinedDate: string;
  achievements?: string[];
  highestDegree?: string;
}

export type EventCategory = 'Reunion' | 'Tech Talk' | 'Networking' | 'Career Fair' | 'Webinar' | 'Workshop';

export interface AlumniEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  date: string; // YYYY-MM-DD
  time: string;
  venue: string;
  isVirtual: boolean;
  meetingLink?: string;
  capacity: number;
  registeredCount: number;
  bannerUrl: string;
  speaker: {
    name: string;
    role: string;
    company: string;
    avatar: string;
  };
  organizer: string;
  tags: string[];
  status: 'Upcoming' | 'Ongoing' | 'Completed';
}

export interface EventRegistration {
  id: string;
  eventId: string;
  eventTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  registrationDate: string;
  ticketCode: string;
  status: 'Confirmed' | 'Waitlisted' | 'Cancelled';
  attendanceMode: 'In-Person' | 'Virtual';
}

export interface MentorshipRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentDegree: string;
  studentGradYear: number;
  alumniId: string;
  alumniName: string;
  topic: string;
  message: string;
  status: 'Pending' | 'Accepted' | 'Declined';
  requestedAt: string;
  responseNote?: string;
}

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
  postedByAlumniId: string;
  postedByName: string;
  salaryRange: string;
  description: string;
  skills: string[];
  applyLink: string;
  postedDate: string;
  deadline: string;
}

export interface SqlLogEntry {
  id: string;
  timestamp: string;
  commandType: 'DDL' | 'DML';
  operation: 'CREATE' | 'ALTER' | 'DROP' | 'INSERT' | 'UPDATE' | 'DELETE' | 'SELECT';
  targetTable: string;
  query: string;
  affectedRows: number;
  executionTimeMs: number;
  status: 'SUCCESS' | 'ERROR';
}
