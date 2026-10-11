import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  AlumniMember, 
  AlumniEvent, 
  EventRegistration, 
  MentorshipRequest, 
  JobPosting, 
  SqlLogEntry, 
  UserRole 
} from '../types';
import { 
  INITIAL_ALUMNI, 
  INITIAL_EVENTS, 
  INITIAL_REGISTRATIONS, 
  INITIAL_MENTORSHIP_REQUESTS, 
  INITIAL_JOBS, 
  INITIAL_SQL_LOGS 
} from '../data/mockData';
import { 
  auth, 
  googleProvider, 
  testFirestoreConnection 
} from '../firebase';
import { 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  seedFirestoreIfEmpty, 
  subscribeToCollection, 
  saveAlumniToFirestore, 
  saveEventToFirestore, 
  saveRegistrationToFirestore, 
  deleteRegistrationFromFirestore, 
  saveMentorshipToFirestore, 
  saveJobToFirestore,
  populateAllFirebaseData,
  COLLECTIONS
} from '../services/firebaseService';
import { executeAlasqlQuery, SqlExecutionResponse } from '../services/sqlEngine';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  degree?: string;
  gradYear?: number;
  department?: string;
  company?: string;
  designation?: string;
}

export interface SqlQueryResult {
  columns: string[];
  rows: Record<string, any>[];
  affectedRows: number;
  executionTimeMs: number;
  commandType: 'DDL' | 'DML';
  message?: string;
  error?: string;
}

interface AlumniContextType {
  currentUser: CurrentUser | null;
  firebaseUser: FirebaseUser | null;
  isFirebaseConnected: boolean;
  isSyncing: boolean;
  setCurrentUser: (user: CurrentUser | null) => void;
  alumniList: AlumniMember[];
  events: AlumniEvent[];
  registrations: EventRegistration[];
  mentorshipRequests: MentorshipRequest[];
  jobPostings: JobPosting[];
  sqlLogs: SqlLogEntry[];
  
  // Actions
  loginAs: (user: CurrentUser) => void;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updatedData: Partial<AlumniMember>) => { success: boolean; message: string };
  registerForEvent: (eventId: string, attendanceMode?: 'In-Person' | 'Virtual') => { success: boolean; ticketCode?: string; message: string };
  cancelRegistration: (registrationId: string) => { success: boolean; message: string };
  createEvent: (eventData: Omit<AlumniEvent, 'id' | 'registeredCount' | 'status'>) => { success: boolean; eventId: string };
  requestMentorship: (alumniId: string, topic: string, message: string) => { success: boolean; message: string };
  updateMentorshipStatus: (requestId: string, status: 'Accepted' | 'Declined', note?: string) => void;
  addJobPosting: (job: Omit<JobPosting, 'id' | 'postedDate' | 'postedByAlumniId' | 'postedByName'>) => void;
  executeSql: (rawSql: string) => SqlQueryResult;
  clearSqlLogs: () => void;
  resetDatabase: () => void;
  syncSampleDataToFirebase: () => Promise<{ success: boolean; count: number; error?: string }>;
}

const AlumniContext = createContext<AlumniContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_USER: 'alumni_current_user_v2',
  SQL_LOGS: 'alumni_sql_logs_v2',
};

// Default profile for quick demo
const DEFAULT_USER: CurrentUser = {
  id: 'ALUM-001',
  name: 'Sarah Chen',
  email: 'sarah.chen@google.com',
  role: 'alumni',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  degree: 'B.Tech Computer Science',
  gradYear: 2018,
  department: 'Computer Science',
  company: 'Google',
  designation: 'Staff Software Engineer'
};

export const AlumniProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return saved ? JSON.parse(saved) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  const [alumniList, setAlumniList] = useState<AlumniMember[]>(INITIAL_ALUMNI);
  const [events, setEvents] = useState<AlumniEvent[]>(INITIAL_EVENTS);
  const [registrations, setRegistrations] = useState<EventRegistration[]>(INITIAL_REGISTRATIONS);
  const [mentorshipRequests, setMentorshipRequests] = useState<MentorshipRequest[]>(INITIAL_MENTORSHIP_REQUESTS);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>(INITIAL_JOBS);

  const [sqlLogs, setSqlLogs] = useState<SqlLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SQL_LOGS);
      return saved ? JSON.parse(saved) : INITIAL_SQL_LOGS;
    } catch {
      return INITIAL_SQL_LOGS;
    }
  });

  const initializedRef = useRef(false);

  // Initialize Firebase Firestore connection & seed data
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    async function initFirebase() {
      setIsSyncing(true);
      const connected = await testFirestoreConnection();
      setIsFirebaseConnected(connected);

      if (connected) {
        // Seed if empty
        await seedFirestoreIfEmpty();

        // Subscribe to real-time collections
        subscribeToCollection<AlumniMember>(COLLECTIONS.ALUMNI, (data) => {
          if (data && data.length > 0) setAlumniList(data);
        });

        subscribeToCollection<AlumniEvent>(COLLECTIONS.EVENTS, (data) => {
          if (data && data.length > 0) setEvents(data);
        });

        subscribeToCollection<EventRegistration>(COLLECTIONS.REGISTRATIONS, (data) => {
          if (data && data.length > 0) setRegistrations(data);
        });

        subscribeToCollection<MentorshipRequest>(COLLECTIONS.MENTORSHIPS, (data) => {
          if (data && data.length > 0) setMentorshipRequests(data);
        });

        subscribeToCollection<JobPosting>(COLLECTIONS.JOBS, (data) => {
          if (data && data.length > 0) setJobPostings(data);
        });
      }
      setIsSyncing(false);
    }

    initFirebase();

    // Listen to Firebase Auth state
    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        setCurrentUser(prev => ({
          id: prev?.id || `USR-${fbUser.uid.slice(0, 6)}`,
          name: fbUser.displayName || prev?.name || 'Alumni Member',
          email: fbUser.email || prev?.email || 'user@example.com',
          role: prev?.role || 'alumni',
          avatar: fbUser.photoURL || prev?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          gradYear: prev?.gradYear || 2024,
          degree: prev?.degree || 'Bachelor of Science',
          department: prev?.department || 'Computer Science',
          company: prev?.company || 'Industry Partner',
          designation: prev?.designation || 'Software Engineer'
        }));
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Save current user and logs to local cache
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SQL_LOGS, JSON.stringify(sqlLogs));
  }, [sqlLogs]);

  // Record SQL in audit log
  const logSql = (entry: Omit<SqlLogEntry, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timeStr = now.toISOString().replace('T', ' ').substring(0, 19);
    const newEntry: SqlLogEntry = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: timeStr,
      ...entry,
    };
    setSqlLogs(prev => [newEntry, ...prev.slice(0, 99)]);
  };

  const loginAs = (user: CurrentUser) => {
    setCurrentUser(user);
    logSql({
      commandType: 'DML',
      operation: 'SELECT',
      targetTable: 'alumni_members',
      query: `SELECT * FROM alumni_members WHERE email = '${user.email}' LIMIT 1;`,
      affectedRows: 1,
      executionTimeMs: 4,
      status: 'SUCCESS'
    });
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        const u = res.user;
        const matched = alumniList.find(a => a.email.toLowerCase() === u.email?.toLowerCase());
        const newCurrentUser: CurrentUser = {
          id: matched?.id || `USR-${u.uid.slice(0, 6)}`,
          name: u.displayName || matched?.name || 'Alumni Member',
          email: u.email || '',
          role: matched?.role || 'alumni',
          avatar: u.photoURL || matched?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          gradYear: matched?.gradYear || 2024,
          degree: matched?.degree || 'Alumni Graduate',
          department: matched?.department || 'Computer Science',
          company: matched?.company || 'Tech Sector',
          designation: matched?.designation || 'Engineer'
        };
        setCurrentUser(newCurrentUser);
        logSql({
          commandType: 'DML',
          operation: 'SELECT',
          targetTable: 'firebase_auth_users',
          query: `SELECT * FROM users WHERE email = '${u.email}'; -- Google Auth Verified`,
          affectedRows: 1,
          executionTimeMs: 12,
          status: 'SUCCESS'
        });
        return true;
      }
      return false;
    } catch (err: any) {
      console.warn('Google sign in error:', err);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch {}
    setCurrentUser(null);
  };

  // Profile update (DML UPDATE + Firestore sync)
  const updateProfile = (updatedData: Partial<AlumniMember>) => {
    if (!currentUser) return { success: false, message: 'Please log in to edit profile' };

    const targetId = currentUser.id;
    let updatedMember: AlumniMember | null = null;

    setAlumniList(prev => prev.map(member => {
      if (member.id === targetId || member.email === currentUser.email) {
        updatedMember = { ...member, ...updatedData };
        return updatedMember;
      }
      return member;
    }));

    // Sync to Firestore
    if (updatedMember) {
      saveAlumniToFirestore(updatedMember).catch(err => console.warn('Firestore sync error:', err));
    }

    setCurrentUser(prev => prev ? {
      ...prev,
      name: updatedData.name || prev.name,
      company: updatedData.company !== undefined ? updatedData.company : prev.company,
      designation: updatedData.designation !== undefined ? updatedData.designation : prev.designation,
      department: updatedData.department || prev.department,
    } : null);

    const setClauses: string[] = [];
    if (updatedData.name) setClauses.push(`name = '${updatedData.name.replace(/'/g, "''")}'`);
    if (updatedData.company) setClauses.push(`company = '${updatedData.company.replace(/'/g, "''")}'`);
    if (updatedData.designation) setClauses.push(`designation = '${updatedData.designation.replace(/'/g, "''")}'`);
    if (updatedData.location) setClauses.push(`location = '${updatedData.location.replace(/'/g, "''")}'`);
    if (updatedData.isMentor !== undefined) setClauses.push(`is_mentor = ${updatedData.isMentor ? 'TRUE' : 'FALSE'}`);

    const sqlQuery = `UPDATE alumni_members\nSET ${setClauses.join(', ')}\nWHERE id = '${targetId}';`;

    logSql({
      commandType: 'DML',
      operation: 'UPDATE',
      targetTable: 'alumni_members',
      query: sqlQuery,
      affectedRows: 1,
      executionTimeMs: 7,
      status: 'SUCCESS'
    });

    return { success: true, message: 'Profile updated and saved to Firebase Firestore successfully.' };
  };

  // Event Registration (DML INSERT + Firestore sync)
  const registerForEvent = (eventId: string, attendanceMode: 'In-Person' | 'Virtual' = 'In-Person') => {
    if (!currentUser) return { success: false, message: 'Please log in to register.' };

    const event = events.find(e => e.id === eventId);
    if (!event) return { success: false, message: 'Event not found.' };

    const existing = registrations.find(r => r.eventId === eventId && (r.userId === currentUser.id || r.userEmail === currentUser.email) && r.status === 'Confirmed');
    if (existing) {
      return { success: false, message: 'You have already registered for this event.', ticketCode: existing.ticketCode };
    }

    if (event.registeredCount >= event.capacity) {
      return { success: false, message: 'Event is at full capacity.' };
    }

    const regId = `REG-${Math.floor(1000 + Math.random() * 9000)}`;
    const ticketCode = `TKT-${event.category.toUpperCase().slice(0, 3)}-${Math.floor(10000 + Math.random() * 90000)}`;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newReg: EventRegistration = {
      id: regId,
      eventId: event.id,
      eventTitle: event.title,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      registrationDate: nowStr,
      ticketCode,
      status: 'Confirmed',
      attendanceMode
    };

    setRegistrations(prev => [newReg, ...prev]);
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, registeredCount: e.registeredCount + 1 } : e));

    // Save to Firestore
    saveRegistrationToFirestore(newReg).catch(err => console.warn('Firestore save registration error:', err));

    const sqlQuery = `BEGIN TRANSACTION;
INSERT INTO event_registrations (id, event_id, user_id, user_name, user_email, ticket_code, status, attendance_mode)
VALUES ('${regId}', '${eventId}', '${currentUser.id}', '${currentUser.name}', '${currentUser.email}', '${ticketCode}', 'Confirmed', '${attendanceMode}');

UPDATE alumni_events
SET registered_count = registered_count + 1
WHERE id = '${eventId}';
COMMIT;`;

    logSql({
      commandType: 'DML',
      operation: 'INSERT',
      targetTable: 'event_registrations & alumni_events',
      query: sqlQuery,
      affectedRows: 2,
      executionTimeMs: 9,
      status: 'SUCCESS'
    });

    return { success: true, ticketCode, message: `Registration confirmed! Ticket code: ${ticketCode}` };
  };

  // Cancel Registration (DML DELETE + Firestore sync)
  const cancelRegistration = (registrationId: string) => {
    const reg = registrations.find(r => r.id === registrationId);
    if (!reg) return { success: false, message: 'Registration not found' };

    setRegistrations(prev => prev.filter(r => r.id !== registrationId));
    setEvents(prev => prev.map(e => e.id === reg.eventId ? { ...e, registeredCount: Math.max(0, e.registeredCount - 1) } : e));

    // Delete in Firestore
    deleteRegistrationFromFirestore(registrationId, reg.eventId).catch(err => console.warn('Firestore delete registration error:', err));

    const sqlQuery = `BEGIN TRANSACTION;
DELETE FROM event_registrations WHERE id = '${registrationId}';
UPDATE alumni_events SET registered_count = GREATEST(0, registered_count - 1) WHERE id = '${reg.eventId}';
COMMIT;`;

    logSql({
      commandType: 'DML',
      operation: 'DELETE',
      targetTable: 'event_registrations',
      query: sqlQuery,
      affectedRows: 2,
      executionTimeMs: 8,
      status: 'SUCCESS'
    });

    return { success: true, message: 'Registration canceled and seat released.' };
  };

  // Create Event (DML INSERT + Firestore sync)
  const createEvent = (eventData: Omit<AlumniEvent, 'id' | 'registeredCount' | 'status'>) => {
    const eventId = `EVT-${Math.floor(200 + Math.random() * 800)}`;
    const newEvent: AlumniEvent = {
      ...eventData,
      id: eventId,
      registeredCount: 0,
      status: 'Upcoming'
    };

    setEvents(prev => [newEvent, ...prev]);
    saveEventToFirestore(newEvent).catch(err => console.warn('Firestore save event error:', err));

    const sql = `INSERT INTO alumni_events (id, title, category, event_date, event_time, venue, is_virtual, capacity, speaker_name, organizer)
VALUES ('${eventId}', '${newEvent.title.replace(/'/g, "''")}', '${newEvent.category}', '${newEvent.date}', '${newEvent.time}', '${newEvent.venue.replace(/'/g, "''")}', ${newEvent.isVirtual ? 'TRUE' : 'FALSE'}, ${newEvent.capacity}, '${newEvent.speaker.name}', '${newEvent.organizer}');`;

    logSql({
      commandType: 'DML',
      operation: 'INSERT',
      targetTable: 'alumni_events',
      query: sql,
      affectedRows: 1,
      executionTimeMs: 7,
      status: 'SUCCESS'
    });

    return { success: true, eventId };
  };

  // Request Mentorship (DML INSERT + Firestore sync)
  const requestMentorship = (alumniId: string, topic: string, message: string) => {
    if (!currentUser) return { success: false, message: 'Please log in to submit a request.' };

    const mentor = alumniList.find(a => a.id === alumniId);
    if (!mentor) return { success: false, message: 'Mentor not found.' };

    const reqId = `MENT-${Math.floor(800 + Math.random() * 200)}`;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newReq: MentorshipRequest = {
      id: reqId,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentEmail: currentUser.email,
      studentDegree: currentUser.degree || 'Student',
      studentGradYear: currentUser.gradYear || 2026,
      alumniId: mentor.id,
      alumniName: mentor.name,
      topic,
      message,
      status: 'Pending',
      requestedAt: nowStr
    };

    setMentorshipRequests(prev => [newReq, ...prev]);
    saveMentorshipToFirestore(newReq).catch(err => console.warn('Firestore save mentorship error:', err));

    const sql = `INSERT INTO mentorship_requests (id, student_id, student_name, student_email, alumni_id, alumni_name, topic, message, status)
VALUES ('${reqId}', '${currentUser.id}', '${currentUser.name}', '${currentUser.email}', '${mentor.id}', '${mentor.name}', '${topic.replace(/'/g, "''")}', '${message.replace(/'/g, "''")}', 'Pending');`;

    logSql({
      commandType: 'DML',
      operation: 'INSERT',
      targetTable: 'mentorship_requests',
      query: sql,
      affectedRows: 1,
      executionTimeMs: 6,
      status: 'SUCCESS'
    });

    return { success: true, message: `Mentorship request sent to ${mentor.name}!` };
  };

  const updateMentorshipStatus = (requestId: string, status: 'Accepted' | 'Declined', note?: string) => {
    let updated: MentorshipRequest | null = null;
    setMentorshipRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        updated = { ...r, status, responseNote: note || r.responseNote };
        return updated;
      }
      return r;
    }));

    if (updated) {
      saveMentorshipToFirestore(updated).catch(err => console.warn('Firestore update mentorship error:', err));
    }

    const sql = `UPDATE mentorship_requests 
SET status = '${status}'${note ? `, response_note = '${note.replace(/'/g, "''")}'` : ''}
WHERE id = '${requestId}';`;

    logSql({
      commandType: 'DML',
      operation: 'UPDATE',
      targetTable: 'mentorship_requests',
      query: sql,
      affectedRows: 1,
      executionTimeMs: 5,
      status: 'SUCCESS'
    });
  };

  // Add Job (DML INSERT + Firestore sync)
  const addJobPosting = (job: Omit<JobPosting, 'id' | 'postedDate' | 'postedByAlumniId' | 'postedByName'>) => {
    const jobId = `JOB-${Math.floor(300 + Math.random() * 500)}`;
    const nowStr = new Date().toISOString().substring(0, 10);
    const posterId = currentUser?.id || 'ALUM-001';
    const posterName = currentUser?.name || 'Alumni Member';

    const newJob: JobPosting = {
      ...job,
      id: jobId,
      postedDate: nowStr,
      postedByAlumniId: posterId,
      postedByName: posterName,
    };

    setJobPostings(prev => [newJob, ...prev]);
    saveJobToFirestore(newJob).catch(err => console.warn('Firestore save job error:', err));

    const sql = `INSERT INTO job_postings (id, title, company, location, job_type, posted_by_alumni_id, posted_by_name, salary_range, description, apply_link)
VALUES ('${jobId}', '${job.title}', '${job.company}', '${job.location}', '${job.type}', '${posterId}', '${posterName}', '${job.salaryRange}', '${job.description.substring(0, 50)}...', '${job.applyLink}');`;

    logSql({
      commandType: 'DML',
      operation: 'INSERT',
      targetTable: 'job_postings',
      query: sql,
      affectedRows: 1,
      executionTimeMs: 7,
      status: 'SUCCESS'
    });
  };

  // REAL DYNAMIC SQL ENGINE POWERED BY ALASQL (Executes ANY query against live tables)
  const executeSql = (rawSql: string): SqlQueryResult => {
    const res: SqlExecutionResponse = executeAlasqlQuery(rawSql, {
      alumniList,
      events,
      registrations,
      mentorshipRequests,
      jobPostings
    });

    // Record in audit log
    const upper = rawSql.trim().toUpperCase();
    const op = upper.startsWith('SELECT') ? 'SELECT'
      : upper.startsWith('INSERT') ? 'INSERT'
      : upper.startsWith('UPDATE') ? 'UPDATE'
      : upper.startsWith('DELETE') ? 'DELETE'
      : upper.startsWith('CREATE') ? 'CREATE'
      : upper.startsWith('ALTER') ? 'ALTER'
      : 'SELECT';

    logSql({
      commandType: res.commandType,
      operation: op as any,
      targetTable: 'firebase_synced_tables',
      query: rawSql.trim(),
      affectedRows: res.affectedRows,
      executionTimeMs: res.executionTimeMs,
      status: res.success ? 'SUCCESS' : 'ERROR'
    });

    // If an INSERT/UPDATE/DELETE query was run, update React state if changes occurred
    if (res.updatedTables) {
      if (res.updatedTables.alumniList) {
        setAlumniList(res.updatedTables.alumniList);
      }
      if (res.updatedTables.events) {
        setEvents(res.updatedTables.events);
      }
      if (res.updatedTables.registrations) {
        setRegistrations(res.updatedTables.registrations);
      }
      if (res.updatedTables.mentorshipRequests) {
        setMentorshipRequests(res.updatedTables.mentorshipRequests);
      }
      if (res.updatedTables.jobPostings) {
        setJobPostings(res.updatedTables.jobPostings);
      }
    }

    return {
      columns: res.columns,
      rows: res.rows,
      affectedRows: res.affectedRows,
      executionTimeMs: res.executionTimeMs,
      commandType: res.commandType,
      message: res.message,
      error: res.error
    };
  };

  const clearSqlLogs = () => {
    setSqlLogs([]);
    localStorage.removeItem(STORAGE_KEYS.SQL_LOGS);
  };

  const resetDatabase = () => {
    localStorage.clear();
    setAlumniList(INITIAL_ALUMNI);
    setEvents(INITIAL_EVENTS);
    setRegistrations(INITIAL_REGISTRATIONS);
    setMentorshipRequests(INITIAL_MENTORSHIP_REQUESTS);
    setJobPostings(INITIAL_JOBS);
    setSqlLogs(INITIAL_SQL_LOGS);
    setCurrentUser(DEFAULT_USER);
  };

  const syncSampleDataToFirebase = async () => {
    setIsSyncing(true);
    const result = await populateAllFirebaseData();
    if (result.success) {
      logSql({
        commandType: 'DML',
        operation: 'INSERT',
        targetTable: 'all_firestore_collections',
        query: `-- Synchronized sample dataset to Firebase Firestore\nINSERT INTO alumni_members ... (${result.count} records written);`,
        affectedRows: result.count,
        executionTimeMs: 45,
        status: 'SUCCESS'
      });
      setAlumniList(INITIAL_ALUMNI);
      setEvents(INITIAL_EVENTS);
      setRegistrations(INITIAL_REGISTRATIONS);
      setMentorshipRequests(INITIAL_MENTORSHIP_REQUESTS);
      setJobPostings(INITIAL_JOBS);
    }
    setIsSyncing(false);
    return result;
  };

  return (
    <AlumniContext.Provider value={{
      currentUser,
      firebaseUser,
      isFirebaseConnected,
      isSyncing,
      setCurrentUser,
      alumniList,
      events,
      registrations,
      mentorshipRequests,
      jobPostings,
      sqlLogs,
      loginAs,
      loginWithGoogle,
      logout,
      updateProfile,
      registerForEvent,
      cancelRegistration,
      createEvent,
      requestMentorship,
      updateMentorshipStatus,
      addJobPosting,
      executeSql,
      clearSqlLogs,
      resetDatabase,
      syncSampleDataToFirebase
    }}>
      {children}
    </AlumniContext.Provider>
  );
};

export const useAlumni = () => {
  const context = useContext(AlumniContext);
  if (!context) {
    throw new Error('useAlumni must be used within an AlumniProvider');
  }
  return context;
};
