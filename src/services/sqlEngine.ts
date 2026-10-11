import alasql from 'alasql';
import { AlumniMember, AlumniEvent, EventRegistration, MentorshipRequest, JobPosting } from '../types';

export interface SqlExecutionResponse {
  success: boolean;
  columns: string[];
  rows: Record<string, any>[];
  affectedRows: number;
  executionTimeMs: number;
  commandType: 'DDL' | 'DML';
  message: string;
  error?: string;
  updatedTables?: {
    alumniList?: AlumniMember[];
    events?: AlumniEvent[];
    registrations?: EventRegistration[];
    mentorshipRequests?: MentorshipRequest[];
    jobPostings?: JobPosting[];
  };
}

// Convert object to support both camelCase and snake_case column names in SQL
function normalizeRow(obj: Record<string, any>): Record<string, any> {
  const normalized: Record<string, any> = { ...obj };
  
  // Specific alumni aliases
  if (obj.gradYear !== undefined) {
    normalized.grad_year = obj.gradYear;
    normalized.gradYear = obj.gradYear;
  }
  if (obj.isMentor !== undefined) {
    normalized.is_mentor = obj.isMentor;
    normalized.isMentor = obj.isMentor;
  }
  if (obj.joinedDate !== undefined) {
    normalized.joined_date = obj.joinedDate;
    normalized.joinedDate = obj.joinedDate;
  }
  if (obj.mentorshipTopics !== undefined) {
    normalized.mentorship_topics = obj.mentorshipTopics;
    normalized.mentorshipTopics = obj.mentorshipTopics;
  }
  if (obj.highestDegree !== undefined) {
    normalized.highest_degree = obj.highestDegree;
    normalized.highestDegree = obj.highestDegree;
  }

  // Specific event aliases
  if (obj.date !== undefined) {
    normalized.date = obj.date;
    normalized.event_date = obj.date;
  }
  if (obj.event_date !== undefined) {
    normalized.date = obj.event_date;
    normalized.event_date = obj.event_date;
  }
  if (obj.time !== undefined) {
    normalized.time = obj.time;
    normalized.event_time = obj.time;
  }
  if (obj.event_time !== undefined) {
    normalized.time = obj.event_time;
    normalized.event_time = obj.event_time;
  }
  if (obj.registeredCount !== undefined) {
    normalized.registered_count = obj.registeredCount;
    normalized.registeredCount = obj.registeredCount;
  }
  if (obj.isVirtual !== undefined) {
    normalized.is_virtual = obj.isVirtual;
    normalized.isVirtual = obj.isVirtual;
  }
  if (obj.meetingLink !== undefined) {
    normalized.meeting_link = obj.meetingLink;
    normalized.meetingLink = obj.meetingLink;
  }
  if (obj.speaker && typeof obj.speaker === 'object') {
    normalized.speaker_name = obj.speaker.name;
    normalized.speaker_role = obj.speaker.role;
    normalized.speaker_company = obj.speaker.company;
  }

  // Registration aliases
  if (obj.ticketCode !== undefined) {
    normalized.ticket_code = obj.ticketCode;
    normalized.ticketCode = obj.ticketCode;
  }
  if (obj.eventId !== undefined) {
    normalized.event_id = obj.eventId;
    normalized.eventId = obj.eventId;
  }
  if (obj.eventTitle !== undefined) {
    normalized.event_title = obj.eventTitle;
    normalized.eventTitle = obj.eventTitle;
  }
  if (obj.userId !== undefined) {
    normalized.user_id = obj.userId;
    normalized.userId = obj.userId;
  }
  if (obj.userName !== undefined) {
    normalized.user_name = obj.userName;
    normalized.userName = obj.userName;
  }
  if (obj.userEmail !== undefined) {
    normalized.user_email = obj.userEmail;
    normalized.userEmail = obj.userEmail;
  }
  if (obj.attendanceMode !== undefined) {
    normalized.attendance_mode = obj.attendanceMode;
    normalized.attendanceMode = obj.attendanceMode;
  }
  if (obj.registrationDate !== undefined) {
    normalized.registration_date = obj.registrationDate;
    normalized.registrationDate = obj.registrationDate;
  }

  // Mentorship aliases
  if (obj.studentId !== undefined) {
    normalized.student_id = obj.studentId;
    normalized.studentId = obj.studentId;
  }
  if (obj.studentName !== undefined) {
    normalized.student_name = obj.studentName;
    normalized.studentName = obj.studentName;
  }
  if (obj.studentEmail !== undefined) {
    normalized.student_email = obj.studentEmail;
    normalized.studentEmail = obj.studentEmail;
  }
  if (obj.studentDegree !== undefined) {
    normalized.student_degree = obj.studentDegree;
    normalized.studentDegree = obj.studentDegree;
  }
  if (obj.studentGradYear !== undefined) {
    normalized.student_grad_year = obj.studentGradYear;
    normalized.studentGradYear = obj.studentGradYear;
  }
  if (obj.alumniId !== undefined) {
    normalized.alumni_id = obj.alumniId;
    normalized.alumniId = obj.alumniId;
  }
  if (obj.alumniName !== undefined) {
    normalized.alumni_name = obj.alumniName;
    normalized.alumniName = obj.alumniName;
  }
  if (obj.requestedAt !== undefined) {
    normalized.requested_at = obj.requestedAt;
    normalized.requestedAt = obj.requestedAt;
  }
  if (obj.responseNote !== undefined) {
    normalized.response_note = obj.responseNote;
    normalized.responseNote = obj.responseNote;
  }

  // Job aliases
  if (obj.postedByAlumniId !== undefined) {
    normalized.posted_by_alumni_id = obj.postedByAlumniId;
    normalized.postedByAlumniId = obj.postedByAlumniId;
  }
  if (obj.postedByName !== undefined) {
    normalized.posted_by_name = obj.postedByName;
    normalized.postedByName = obj.postedByName;
  }
  if (obj.salaryRange !== undefined) {
    normalized.salary_range = obj.salaryRange;
    normalized.salaryRange = obj.salaryRange;
  }
  if (obj.applyLink !== undefined) {
    normalized.apply_link = obj.applyLink;
    normalized.applyLink = obj.applyLink;
  }
  if (obj.postedDate !== undefined) {
    normalized.posted_date = obj.postedDate;
    normalized.postedDate = obj.postedDate;
  }
  if (obj.type !== undefined) {
    normalized.job_type = obj.type;
  }

  return normalized;
}

// Preprocessor to make arbitrary user SQL syntax work seamlessly with AlaSQL
function preprocessSql(sql: string): string {
  let s = sql.trim().replace(/;+$/, '');
  
  // Strip single-line comments (-- comment)
  s = s.replace(/--.*$/gm, '');
  
  // Strip transactions
  s = s.replace(/BEGIN\s+TRANSACTION;?/gi, '');
  s = s.replace(/COMMIT;?/gi, '');

  // Safely wrap unbracketed aliases in []: AS <alias>
  s = s.replace(/\bAS\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi, (match, alias) => {
    const reservedSqlClauses = [
      'AND', 'OR', 'FROM', 'WHERE', 'JOIN', 'ON', 'LEFT', 'RIGHT', 'INNER',
      'GROUP', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'AS'
    ];
    if (reservedSqlClauses.includes(alias.toUpperCase())) return match;
    return `AS [${alias}]`;
  });

  // Auto-bracket unbracketed single-word columns in ORDER BY and GROUP BY
  // (e.g. ORDER BY count DESC -> ORDER BY [count] DESC)
  s = s.replace(/\b(ORDER\s+BY|GROUP\s+BY)\s+([a-zA-Z_][a-zA-Z0-9_]*)(?!\.)/gi, '$1 [$2]');
  s = s.replace(/(,\s*)([a-zA-Z_][a-zA-Z0-9_]*)(?!\.)\s+(ASC|DESC)\b/gi, '$1[$2] $3');

  return s.trim();
}

export function executeAlasqlQuery(
  rawSql: string,
  currentData: {
    alumniList: AlumniMember[];
    events: AlumniEvent[];
    registrations: EventRegistration[];
    mentorshipRequests: MentorshipRequest[];
    jobPostings: JobPosting[];
  }
): SqlExecutionResponse {
  const startTime = performance.now();
  const trimmed = rawSql.trim();
  const upper = trimmed.toUpperCase();

  try {
    // 1. Prepare in-memory tables inside alasql
    const alumniRows = currentData.alumniList.map(normalizeRow);
    const eventRows = currentData.events.map(normalizeRow);
    const regRows = currentData.registrations.map(normalizeRow);
    const mentorRows = currentData.mentorshipRequests.map(normalizeRow);
    const jobRows = currentData.jobPostings.map(normalizeRow);

    // Initialize AlaSQL tables
    alasql.tables = alasql.tables || {};
    try {
      alasql('CREATE TABLE IF NOT EXISTS alumni_members');
      alasql('CREATE TABLE IF NOT EXISTS alumni_events');
      alasql('CREATE TABLE IF NOT EXISTS event_registrations');
      alasql('CREATE TABLE IF NOT EXISTS mentorship_requests');
      alasql('CREATE TABLE IF NOT EXISTS job_postings');
    } catch {}

    alasql.tables.alumni_members = { data: alumniRows };
    alasql.tables.alumni_events = { data: eventRows };
    alasql.tables.event_registrations = { data: regRows };
    alasql.tables.mentorship_requests = { data: mentorRows };
    alasql.tables.job_postings = { data: jobRows };

    // Also support PascalCase and camelCase table aliases
    alasql.tables.AlumniMember = alasql.tables.alumni_members;
    alasql.tables.alumni_member = alasql.tables.alumni_members;
    alasql.tables.AlumniEvent = alasql.tables.alumni_events;
    alasql.tables.EventRegistration = alasql.tables.event_registrations;
    alasql.tables.MentorshipRequest = alasql.tables.mentorship_requests;
    alasql.tables.JobPosting = alasql.tables.job_postings;

    // Preprocess SQL
    const sqlToExecute = preprocessSql(trimmed);

    // Split multiple statements if provided (e.g. semicolon separated)
    const statements = sqlToExecute.split(';').map(s => s.trim()).filter(Boolean);
    let finalResult: any = null;

    for (const stmt of statements) {
      if (stmt) {
        finalResult = alasql(stmt);
      }
    }

    const elapsed = Math.round(performance.now() - startTime);
    const isDdl = upper.startsWith('CREATE') || upper.startsWith('ALTER') || upper.startsWith('DROP');

    if (Array.isArray(finalResult)) {
      // Query produced a tabular result (SELECT)
      const rows = finalResult;
      const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

      return {
        success: true,
        columns,
        rows,
        affectedRows: rows.length,
        executionTimeMs: elapsed,
        commandType: 'DML',
        message: `${rows.length} row${rows.length === 1 ? '' : 's'} returned in ${elapsed} ms.`
      };
    } else {
      // Mutation command (INSERT / UPDATE / DELETE / DDL)
      const affected = typeof finalResult === 'number' ? finalResult : 1;
      
      return {
        success: true,
        columns: ['status', 'affected_rows', 'latency'],
        rows: [{
          status: 'Query executed successfully',
          affected_rows: affected,
          latency: `${elapsed} ms`
        }],
        affectedRows: affected,
        executionTimeMs: elapsed,
        commandType: isDdl ? 'DDL' : 'DML',
        message: `Query OK, ${affected} row${affected === 1 ? '' : 's'} affected (${elapsed} ms).`,
        updatedTables: {
          alumniList: alasql.tables.alumni_members?.data as AlumniMember[],
          events: alasql.tables.alumni_events?.data as AlumniEvent[],
          registrations: alasql.tables.event_registrations?.data as EventRegistration[],
          mentorshipRequests: alasql.tables.mentorship_requests?.data as MentorshipRequest[],
          jobPostings: alasql.tables.job_postings?.data as JobPosting[],
        }
      };
    }
  } catch (err: any) {
    const elapsed = Math.round(performance.now() - startTime);
    const errorMsg = err?.message || String(err);
    console.error('SQL Execution Error:', errorMsg);

    return {
      success: false,
      columns: ['error_type', 'error_detail'],
      rows: [{ error_type: 'SQL Syntax / Execution Error', error_detail: errorMsg }],
      affectedRows: 0,
      executionTimeMs: elapsed,
      commandType: 'DML',
      message: `SQL Error: ${errorMsg}`,
      error: errorMsg
    };
  }
}
