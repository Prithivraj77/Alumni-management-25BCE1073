export interface SqlDefinitionCategory {
  title: string;
  description: string;
  type: 'DDL' | 'DML';
  statements: {
    name: string;
    description: string;
    sql: string;
    operation: 'CREATE' | 'ALTER' | 'DROP' | 'INSERT' | 'UPDATE' | 'DELETE' | 'SELECT';
    table: string;
    isRunnable?: boolean;
    sampleResultSummary?: string;
  }[];
}

export const DDL_STATEMENTS: SqlDefinitionCategory = {
  title: 'Data Definition Language (DDL) Commands',
  description: 'Schema architecture defining entities, primary keys, foreign key relations, constraints, and indexes for AlumniConnect.',
  type: 'DDL',
  statements: [
    {
      name: 'Create Alumni Members Table',
      description: 'Creates the core alumni directory table storing graduate contact, degree, employment, and mentorship flags.',
      operation: 'CREATE',
      table: 'alumni_members',
      sql: `-- 1. DDL: Create Alumni Members Table
CREATE TABLE alumni_members (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    phone VARCHAR(25),
    role VARCHAR(20) DEFAULT 'alumni' CHECK (role IN ('alumni', 'student', 'admin')),
    grad_year INT NOT NULL CHECK (grad_year >= 1950 AND grad_year <= 2030),
    degree VARCHAR(100) NOT NULL,
    department VARCHAR(80) NOT NULL,
    company VARCHAR(100),
    designation VARCHAR(100),
    industry VARCHAR(100),
    location VARCHAR(120),
    bio TEXT,
    linkedin VARCHAR(255),
    github VARCHAR(255),
    is_mentor BOOLEAN DEFAULT FALSE,
    joined_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
    },
    {
      name: 'Create Alumni Events Table',
      description: 'Table for hosting and tracking alumni reunions, seminars, networking mixers, and webinars.',
      operation: 'CREATE',
      table: 'alumni_events',
      sql: `-- 2. DDL: Create Alumni Events Table
CREATE TABLE alumni_events (
    id VARCHAR(20) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Reunion', 'Tech Talk', 'Networking', 'Career Fair', 'Webinar', 'Workshop')),
    event_date DATE NOT NULL,
    event_time VARCHAR(50) NOT NULL,
    venue VARCHAR(150) NOT NULL,
    is_virtual BOOLEAN DEFAULT FALSE,
    meeting_link VARCHAR(255),
    capacity INT NOT NULL CHECK (capacity > 0),
    registered_count INT DEFAULT 0 CHECK (registered_count >= 0),
    speaker_name VARCHAR(100),
    speaker_role VARCHAR(100),
    speaker_company VARCHAR(100),
    organizer VARCHAR(100) DEFAULT 'Alumni Relations Committee',
    status VARCHAR(20) DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'Ongoing', 'Completed', 'Cancelled'))
);`
    },
    {
      name: 'Create Event Registrations Table (Association & Tracking)',
      description: 'Many-to-Many junction table tracking attendee bookings with cascade constraints and unique ticket codes.',
      operation: 'CREATE',
      table: 'event_registrations',
      sql: `-- 3. DDL: Create Event Registrations Table
CREATE TABLE event_registrations (
    id VARCHAR(20) PRIMARY KEY,
    event_id VARCHAR(20) NOT NULL,
    user_id VARCHAR(20) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    user_email VARCHAR(120) NOT NULL,
    ticket_code VARCHAR(40) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'Confirmed' CHECK (status IN ('Confirmed', 'Waitlisted', 'Cancelled')),
    attendance_mode VARCHAR(20) DEFAULT 'In-Person' CHECK (attendance_mode IN ('In-Person', 'Virtual')),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_event FOREIGN KEY (event_id) REFERENCES alumni_events(id) ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES alumni_members(id) ON DELETE CASCADE,
    CONSTRAINT uq_event_user UNIQUE (event_id, user_id)
);`
    },
    {
      name: 'Create Mentorship Requests Table',
      description: 'Tracks 1-on-1 student-to-alumni guidance requests, topical tracks, and confirmation status.',
      operation: 'CREATE',
      table: 'mentorship_requests',
      sql: `-- 4. DDL: Create Mentorship Requests Table
CREATE TABLE mentorship_requests (
    id VARCHAR(20) PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    student_email VARCHAR(120) NOT NULL,
    student_degree VARCHAR(100),
    student_grad_year INT,
    alumni_id VARCHAR(20) NOT NULL,
    alumni_name VARCHAR(100) NOT NULL,
    topic VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Declined')),
    response_note TEXT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_mentor FOREIGN KEY (alumni_id) REFERENCES alumni_members(id) ON DELETE CASCADE
);`
    },
    {
      name: 'Create Job Postings Table',
      description: 'Alumni-exclusive referral and hiring board for students and graduates.',
      operation: 'CREATE',
      table: 'job_postings',
      sql: `-- 5. DDL: Create Job Postings Table
CREATE TABLE job_postings (
    id VARCHAR(20) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    company VARCHAR(100) NOT NULL,
    location VARCHAR(120) NOT NULL,
    job_type VARCHAR(30) CHECK (job_type IN ('Full-time', 'Part-time', 'Internship', 'Contract')),
    posted_by_alumni_id VARCHAR(20) NOT NULL,
    posted_by_name VARCHAR(100) NOT NULL,
    salary_range VARCHAR(80),
    description TEXT NOT NULL,
    apply_link VARCHAR(255) NOT NULL,
    posted_date DATE DEFAULT CURRENT_DATE,
    deadline DATE,
    CONSTRAINT fk_job_poster FOREIGN KEY (posted_by_alumni_id) REFERENCES alumni_members(id) ON DELETE SET NULL
);`
    },
    {
      name: 'Create Performance Indexes (DDL)',
      description: 'B-Tree indexes to accelerate search across department, graduation year, and event dates.',
      operation: 'CREATE',
      table: 'indexes',
      sql: `-- 6. DDL: Create Indexes for Performance Optimization
CREATE INDEX idx_alumni_dept_year ON alumni_members(department, grad_year);
CREATE INDEX idx_alumni_company ON alumni_members(company);
CREATE INDEX idx_alumni_mentor ON alumni_members(is_mentor) WHERE is_mentor = TRUE;
CREATE INDEX idx_events_date ON alumni_events(event_date);
CREATE INDEX idx_reg_event ON event_registrations(event_id);`
    },
    {
      name: 'Alter Table: Add Alumni Giving & Endowments Column',
      description: 'DDL ALTER statement demonstrating schema evolution during lab testing.',
      operation: 'ALTER',
      table: 'alumni_members',
      sql: `-- 7. DDL: ALTER TABLE Schema Modification
ALTER TABLE alumni_members 
ADD COLUMN total_donations DECIMAL(12,2) DEFAULT 0.00 CHECK (total_donations >= 0);

ALTER TABLE alumni_members
ADD COLUMN last_active_at TIMESTAMP;`
    }
  ]
};

export const DML_STATEMENTS: SqlDefinitionCategory = {
  title: 'Data Manipulation Language (DML) Commands',
  description: 'Data manipulation queries for inserts, live profile updates, event attendee count increments, RSVP cancellations, and analytical reporting.',
  type: 'DML',
  statements: [
    {
      name: 'Insert New Alumni Record (DML INSERT)',
      description: 'Registers a new graduating member into the alumni database.',
      operation: 'INSERT',
      table: 'alumni_members',
      sql: `-- 1. DML: INSERT Alumni Record
INSERT INTO alumni_members (
    id, name, email, phone, role, grad_year, degree, department, company, designation, industry, location, bio, is_mentor
) VALUES (
    'ALUM-009', 'Dr. Vikram Sethi', 'v.sethi@mit.edu', '+1 (617) 555-0812', 'alumni', 2013,
    'Ph.D. Quantum Computing', 'Computer Science', 'MIT Lincoln Laboratory', 'Principal Quantum Physicist',
    'Quantum Information & Supercomputing', 'Cambridge, MA, USA',
    'Working on superconducting qubit architectures and quantum error correction codes.', TRUE
);`
    },
    {
      name: 'Update Alumni Profile (DML UPDATE)',
      description: 'Updates employment, skills, and mentorship availability when an alumnus updates their profile.',
      operation: 'UPDATE',
      table: 'alumni_members',
      sql: `-- 2. DML: UPDATE Member Career Profile
UPDATE alumni_members
SET company = 'Google DeepMind',
    designation = 'Senior Research Scientist',
    location = 'London, UK',
    is_mentor = TRUE
WHERE id = 'ALUM-001';`
    },
    {
      name: 'Register Attendee & Increment Event Count (DML INSERT + UPDATE)',
      description: 'Transaction pair executing when a user clicks Register for an Event.',
      operation: 'INSERT',
      table: 'event_registrations',
      sql: `-- 3. DML: Event Registration Transaction
BEGIN TRANSACTION;

-- Insert ticket record
INSERT INTO event_registrations (
    id, event_id, user_id, user_name, user_email, ticket_code, status, attendance_mode
) VALUES (
    'REG-5099', 'EVT-102', 'ALUM-002', 'David Rodriguez', 'david.rodriguez@microsoft.com',
    'TKT-GENAI-77218', 'Confirmed', 'Virtual'
);

-- Increment attendee count on event table
UPDATE alumni_events
SET registered_count = registered_count + 1
WHERE id = 'EVT-102';

COMMIT;`
    },
    {
      name: 'Cancel Registration (DML DELETE / UPDATE)',
      description: 'Removes attendee reservation and decrements total count.',
      operation: 'DELETE',
      table: 'event_registrations',
      sql: `-- 4. DML: Cancel Registration and Decrement Counter
BEGIN TRANSACTION;

DELETE FROM event_registrations
WHERE event_id = 'EVT-101' AND user_id = 'ALUM-001';

UPDATE alumni_events
SET registered_count = GREATEST(0, registered_count - 1)
WHERE id = 'EVT-101';

COMMIT;`
    },
    {
      name: 'Complex Query: Searchable Directory with Mentorship & RSVP Counts (JOIN)',
      description: 'Multi-table INNER and LEFT JOIN reporting alumni career details and registered event history.',
      operation: 'SELECT',
      table: 'alumni_members JOIN event_registrations',
      isRunnable: true,
      sql: `SELECT 
    a.id AS alumni_id,
    a.name,
    a.department,
    a.grad_year,
    a.company,
    a.designation,
    a.is_mentor,
    COUNT(r.id) AS total_events_registered
FROM alumni_members a
LEFT JOIN event_registrations r ON a.id = r.user_id AND r.status = 'Confirmed'
GROUP BY a.id, a.name, a.department, a.grad_year, a.company, a.designation, a.is_mentor
ORDER BY a.grad_year DESC;`
    },
    {
      name: 'Analytical Query: Department-wise Alumni & Mentors Count (GROUP BY & AGGREGATE)',
      description: 'Aggregates alumni headcount and mentor count across departments.',
      operation: 'SELECT',
      table: 'alumni_members',
      isRunnable: true,
      sql: `SELECT 
    department,
    COUNT(*) AS total_alumni,
    SUM(CASE WHEN is_mentor = TRUE THEN 1 ELSE 0 END) AS active_mentors,
    MIN(grad_year) AS oldest_batch,
    MAX(grad_year) AS newest_batch
FROM alumni_members
GROUP BY department
ORDER BY total_alumni DESC;`
    },
    {
      name: 'Event Attendance Report: RSVPs by Category & Fill Rate (HAVING & RATIO)',
      description: 'Computes event utilization percentage for administrative reporting.',
      operation: 'SELECT',
      table: 'alumni_events',
      isRunnable: true,
      sql: `SELECT 
    category,
    COUNT(*) AS total_events,
    SUM(capacity) AS total_capacity,
    SUM(registered_count) AS total_attendees,
    ROUND((SUM(registered_count) * 100.0 / NULLIF(SUM(capacity), 0)), 1) AS overall_occupancy_pct
FROM alumni_events
GROUP BY category
HAVING SUM(capacity) > 0
ORDER BY overall_occupancy_pct DESC;`
    }
  ]
};

export const DRIVER_SNIPPETS = [
  {
    lang: 'Node.js / Express (pg & sqlite3)',
    title: 'PostgreSQL & SQLite Drivers',
    installCmd: 'npm install pg sqlite3 dotenv @types/pg',
    code: `// Node.js Database Connection with pg (PostgreSQL)
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

export const dbPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'alumni_admin',
  password: process.env.DB_PASSWORD || 'secret123',
  database: process.env.DB_NAME || 'alumni_db',
  max: 20,
  idleTimeoutMillis: 30000,
});

// Example DML SELECT query
export async function getAlumniDirectory(department?: string) {
  const query = \`
    SELECT id, name, email, department, company, designation, is_mentor 
    FROM alumni_members 
    \${department ? 'WHERE department = $1' : ''}
    ORDER BY grad_year DESC;
  \`;
  const values = department ? [department] : [];
  const res = await dbPool.query(query, values);
  return res.rows;
}`
  },
  {
    lang: 'Java (JDBC - PostgreSQL / MySQL)',
    title: 'Java Database Connectivity (JDBC)',
    installCmd: '<!-- Maven Dependency in pom.xml -->\n<dependency>\n  <groupId>org.postgresql</groupId>\n  <artifactId>postgresql</artifactId>\n  <version>42.7.3</version>\n</dependency>',
    code: `// Java JDBC Alumni DAO Implementation
package com.alumni.dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class AlumniDatabaseService {
    private static final String URL = "jdbc:postgresql://localhost:5432/alumni_db";
    private static final String USER = "alumni_admin";
    private static final String PASS = "secret123";

    static {
        try {
            // Load PostgreSQL JDBC Driver class
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASS);
    }

    // DML: Register Event with Prepared Statement & Transaction
    public static boolean registerForEvent(String eventId, String userId, String ticketCode) {
        String sqlReg = "INSERT INTO event_registrations (id, event_id, user_id, ticket_code) VALUES (?, ?, ?, ?)";
        String sqlEvt = "UPDATE alumni_events SET registered_count = registered_count + 1 WHERE id = ?";

        try (Connection conn = getConnection()) {
            conn.setAutoCommit(false); // Begin Transaction
            try (PreparedStatement psReg = conn.prepareStatement(sqlReg);
                 PreparedStatement psEvt = conn.prepareStatement(sqlEvt)) {
                
                psReg.setString(1, "REG-" + System.currentTimeMillis());
                psReg.setString(2, eventId);
                psReg.setString(3, userId);
                psReg.setString(4, ticketCode);
                psReg.executeUpdate();

                psEvt.setString(1, eventId);
                psEvt.executeUpdate();

                conn.commit(); // Commit Transaction
                return true;
            } catch (SQLException ex) {
                conn.rollback();
                throw ex;
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}`
  },
  {
    lang: 'Python (SQLite & psycopg2 / SQLAlchemy)',
    title: 'Python DB-API / psycopg2',
    installCmd: 'pip install psycopg2-binary sqlalchemy python-dotenv',
    code: `# Python Alumni Database Connector
import psycopg2
from psycopg2.extras import RealDictCursor
import os

def get_connection():
    return psycopg2.connect(
        dbname=os.getenv("DB_NAME", "alumni_db"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASS", "secret123"),
        host=os.getenv("DB_HOST", "localhost"),
        port=5432,
        cursor_factory=RealDictCursor
    )

def search_alumni_directory(company_name=None):
    with get_connection() as conn:
        with conn.cursor() as cur:
            query = """
                SELECT id, name, degree, department, company, designation, is_mentor
                FROM alumni_members
                WHERE (%s IS NULL OR company ILIKE %s)
                ORDER BY grad_year DESC;
            """
            search_param = f"%{company_name}%" if company_name else None
            cur.execute(query, (search_param, search_param))
            return cur.fetchall()`
  },
  {
    lang: 'ODBC (C++ / C# / Universal)',
    title: 'ODBC Driver Connection (DSN Configuration)',
    installCmd: '# Windows ODBC Data Source Administrator or unixODBC on Linux\n# sudo apt-get install unixodbc odbc-postgresql',
    code: `// C# .NET ODBC Connection Example
using System;
using System.Data.Odbc;

public class AlumniOdbcManager
{
    private string connectionString = "Driver={PostgreSQL Unicode};Server=localhost;Port=5432;Database=alumni_db;Uid=alumni_admin;Pwd=secret123;";

    public void FetchActiveMentors()
    {
        using (OdbcConnection connection = new OdbcConnection(connectionString))
        {
            connection.Open();
            string sql = "SELECT name, email, company, designation FROM alumni_members WHERE is_mentor = TRUE;";
            using (OdbcCommand command = new OdbcCommand(sql, connection))
            using (OdbcDataReader reader = command.ExecuteReader())
            {
                while (reader.Read())
                {
                    Console.WriteLine($"{reader["name"]} ({reader["designation"]} @ {reader["company"]}) - {reader["email"]}");
                }
            }
        }
    }
}`
  }
];
