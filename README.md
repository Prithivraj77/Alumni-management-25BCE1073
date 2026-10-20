# AlumniConnect — Alumni Management System

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore_%26_Auth-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![SQL Engine](https://img.shields.io/badge/Database-AlaSQL_%2B_PostgreSQL_DDL-003B57?logo=postgresql&logoColor=white)](https://github.com/AlaSQL/alasql)

**AlumniConnect** is a full-stack, enterprise-grade Alumni Management Portal designed for universities, colleges, and academic institutions. It bridges the gap between graduating students, seasoned alumni, faculty, and administrators through a cohesive directory, event management, career referrals, mentorship matching, class demographics analytics, and an integrated in-browser SQL console.

---

## 📑 Table of Contents

- [Overview & Highlights](#-overview--highlights)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Relational Database Schema](#-relational-database-schema)
- [Getting Started & Installation](#-getting-started--installation)
- [Environment Configuration](#-environment-configuration)
- [Database Drivers & Connectivity (PAT 4 Guide)](#-database-drivers--connectivity-pat-4-guide)
- [Project Directory Structure](#-project-directory-structure)
- [Role-Based Access](#-role-based-access)
- [Available Scripts](#-available-scripts)
- [License](#-license)

---

## 🌟 Overview & Highlights

- **Unified Alumni Directory**: Search and filter alumni by graduation year, major/department, hiring company, industry, and mentorship status. Includes **1-click CSV Export** of filtered datasets.
- **Role-Based Authentication**: Seamlessly switch between **Alumni**, **Student**, and **Administrator** profiles with tailored permissions, profile editing, and administrative reset controls.
- **Campus Events & RSVPs**: Browse alumni reunions, technical webinars, campus networking sessions, and career fairs with dynamic ticket generation.
- **Mentorship & Job Referral Board**: Connect students with verified alumni mentors for 1-on-1 resume reviews and career guidance, and browse alumni-posted job openings.
- **Cohort Analytics & Demographics**: Interactive visualizations showing top employers (Google, Microsoft, Amazon, etc.), industry distributions, employment rates, and graduation cohorts.
- **Interactive Relational SQL Console**: Real-time DDL and DML query console powered by AlaSQL. Execute `SELECT`, `INSERT`, `UPDATE`, `DELETE`, complex `JOIN`s, and `GROUP BY` aggregations directly within the browser with query history and CSV downloads.
- **Dual Persistence Architecture**: Operates offline/in-memory with instantaneous seed data, with built-in synchronization to **Google Firebase Firestore & Authentication**.

---

## 🚀 Key Features

### 1. Alumni Member Directory
- **Search & Multi-Faceted Filters**: Real-time filtering across name, company, graduation year, degree, and department.
- **Mentorship Indicator**: Badges indicating alumni actively open to mentoring current students.
- **Export to CSV**: Download directory lists directly to CSV format for administrative reporting.
- **Direct Connect**: Trigger mentorship inquiries directly from directory profile cards.

### 2. Events & Reunions Management
- **Upcoming & Past Filter Tabs**: Track RSVPs for workshops, reunions, and networking dinners.
- **Registration Tickets**: Generates verifiable digital ticket tokens upon registration.
- **Host New Event Modal**: Form with autofill presets for creating alumni gatherings with capacity limits.

### 3. Mentorship & Career Board
- **Job Referrals**: Post and browse referral opportunities across tech, finance, and engineering sectors.
- **Mentorship Requests**: Students can draft inquiries detailing areas of interest (e.g., system design, interview prep).
- **Status Workflow**: Tracks request status across *Pending*, *Accepted*, and *Completed*.

### 4. Interactive SQL Console
- **Full DDL & DML Support**: Execute standard ANSI SQL statements against in-memory tables.
- **Preset Query Toolbar**: Quick autofill buttons for:
  - All Alumni Directory (`SELECT * FROM alumni_members`)
  - Company & Department Counts (`GROUP BY` + `COUNT(*)`)
  - Multi-Table Joins (`alumni_members` ⨝ `event_registrations` ⨝ `alumni_events`)
  - Dynamic `INSERT` and `UPDATE` commands
- **Query History**: Re-run past queries and inspect execution durations in milliseconds.
- **Table Inspector**: View active schema definitions, column types, and record counts.

### 5. Professional Left Sidebar
- Collapsible navigation optimized for desktop and mobile viewports.
- Institutional university branding with status pill indicating active Firestore sync.
- User profile card with quick role switcher for testing different privilege levels.

---

## 🏗 System Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                         AlumniConnect Frontend                         │
│             (React 19 • TypeScript • Tailwind CSS v4 • Vite)           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌──────────────────────────────┐          ┌──────────────────────────────┐
│    Relational SQL Engine     │          │    Cloud Persistence Layer   │
│           (AlaSQL)           │          │     (Firebase Firestore)     │
├──────────────────────────────┤          ├──────────────────────────────┤
│ • In-memory ANSI SQL parser  │          │ • alumni_members collection  │
│ • DDL table definitions     │          │ • alumni_events collection   │
│ • Aggregations & Joins       │          │ • event_registrations coll.  │
│ • Instant execution (<10ms)  │          │ • mentorship_requests coll.  │
│ • Schema reflection          │          │ • job_postings collection    │
└──────────────────────────────┘          └──────────────────────────────┘
```

---

## 🗄 Relational Database Schema

The system implements five primary relational tables:

```sql
-- 1. Alumni Members Directory
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
);

-- 2. Alumni Events & Reunions
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
    capacity INT DEFAULT 100,
    registered_count INT DEFAULT 0,
    organizer_id VARCHAR(20) REFERENCES alumni_members(id),
    status VARCHAR(20) DEFAULT 'upcoming'
);

-- 3. Event Registrations (Junction Table)
CREATE TABLE event_registrations (
    registration_id VARCHAR(30) PRIMARY KEY,
    event_id VARCHAR(20) REFERENCES alumni_events(id),
    member_id VARCHAR(20) REFERENCES alumni_members(id),
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'confirmed'
);

-- 4. Mentorship Requests
CREATE TABLE mentorship_requests (
    id VARCHAR(20) PRIMARY KEY,
    mentor_id VARCHAR(20) REFERENCES alumni_members(id),
    student_id VARCHAR(20) REFERENCES alumni_members(id),
    topic VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Job & Referral Postings
CREATE TABLE job_postings (
    id VARCHAR(20) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    company VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    job_type VARCHAR(50) DEFAULT 'Full-Time',
    description TEXT NOT NULL,
    posted_by VARCHAR(20) REFERENCES alumni_members(id),
    posted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🛠 Getting Started & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **bun** or **yarn**

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/alumni-management-portal.git
   cd alumni-management-portal
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```

4. **Launch development server**:
   ```bash
   npm run dev
   ```
   The application will be live at `http://localhost:3000`.

5. **Build for production**:
   ```bash
   npm run build
   ```

---

## ⚙️ Environment Configuration

Define optional backend and API parameters in `.env`:

```env
# Optional Gemini AI API Key
GEMINI_API_KEY="your-gemini-api-key"

# Application Base URL
APP_URL="http://localhost:3000"
```

### Firebase Setup (Optional)
To link your own Google Firebase Firestore database:
1. Open the portal in your browser.
2. Click **Firebase Config** in the left sidebar or top bar.
3. Paste your Firebase Web App credentials (`apiKey`, `projectId`, `appId`, etc.).
4. Click **Connect & Initialize** to sync Firestore with your portal.

---

## 🔌 Database Drivers & Connectivity (PAT 4 Guide)

For academic evaluations and external database connectivity, use the driver configurations below:

### 1. Node.js (PostgreSQL `pg` Driver)
```javascript
import { Client } from 'pg';

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: 'alumniconnect_db',
  ssl: { rejectUnauthorized: false }
});

await client.connect();
const res = await client.query('SELECT * FROM alumni_members WHERE is_mentor = true');
console.log(res.rows);
```

### 2. Python (`psycopg2` / `SQLAlchemy`)
```python
import psycopg2

conn = psycopg2.connect(
    dbname="alumniconnect_db",
    user="postgres",
    password="your_password",
    host="localhost",
    port="5432"
)
cursor = conn.cursor()
cursor.execute("SELECT company, COUNT(*) FROM alumni_members GROUP BY company;")
records = cursor.fetchall()
print(records)
```

### 3. Java (JDBC Driver)
```java
import java.sql.*;

public class AlumniDatabase {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:postgresql://localhost:5432/alumniconnect_db";
        Connection conn = DriverManager.getConnection(url, "postgres", "password");
        Statement stmt = conn.createStatement();
        ResultSet rs = stmt.executeQuery("SELECT name, degree, company FROM alumni_members");
        while (rs.next()) {
            System.out.println(rs.getString("name") + " - " + rs.getString("company"));
        }
    }
}
```

---

## 📁 Project Directory Structure

```text
alumni-management-portal/
├── .env.example                     # Environment template
├── firebase-applet-config.json      # Firebase configuration object
├── firebase-blueprint.json          # Firestore collection blueprints
├── firestore.rules                  # Firestore security rules
├── index.html                       # Application HTML entry point
├── metadata.json                    # AI Studio applet metadata
├── package.json                     # NPM dependencies & scripts
├── tsconfig.json                    # TypeScript compiler configuration
├── vite.config.ts                   # Vite bundler configuration
└── src/
    ├── App.tsx                      # Root component with sidebar layout
    ├── main.tsx                     # React DOM entry
    ├── firebase.ts                  # Firebase SDK initialization
    ├── components/
    │   ├── AnalyticsDashboard.tsx   # Cohort charts & metrics
    │   ├── DirectoryView.tsx        # Alumni search, filters & CSV export
    │   ├── EventsView.tsx           # Event listings & RSVP modal
    │   ├── FirebaseConfigModal.tsx  # Dynamic Firebase configuration modal
    │   ├── LoginModal.tsx           # Role switcher & credentials modal
    │   ├── MentorshipAndJobsView.tsx# Mentorship matching & referral board
    │   ├── ProfileView.tsx          # Member profile editor
    │   ├── SetupInstructionsModal.tsx # PAT 4 Lab manual modal
    │   ├── Sidebar.tsx              # Left navigation sidebar & user card
    │   └── SqlConsoleView.tsx       # Live SQL terminal & query executor
    ├── context/
    │   └── AlumniContext.tsx        # Global state, authentication & data provider
    ├── data/
    │   └── sqlDefinitions.ts        # DDL/DML templates & driver snippets
    ├── services/
    │   ├── firebaseService.ts       # Firestore CRUD helpers
    │   └── sqlEngine.ts             # AlaSQL query execution engine
    └── types/
        └── index.ts                 # TypeScript interfaces and entity types
```

---

## 👥 Role-Based Access

The portal supports three roles with pre-configured demo personas:

| Role | Demo Persona | Designation / Degree | Capabilities |
| :--- | :--- | :--- | :--- |
| **Alumni** | **Sarah Chen** | Staff SWE @ Google (`B.Tech CSE '18`) | Update alumni profile, post job referrals, review mentorship requests, RSVP to events. |
| **Student** | **Maya Chen** | Aspiring Cloud Engineer (`B.Tech CSE '26`) | Browse directory, request mentorship, apply for job referrals, register for webinars. |
| **Admin** | **Dr. Arthur Pendelton**| Director of Alumni Relations | Create official events, manage records, execute DDL/DML SQL scripts, reset seed database. |

*You can switch between these personas instantly via the bottom card in the left sidebar.*

---

## 📜 Available Scripts

- `npm run dev`: Runs the local development server at `http://localhost:3000`.
- `npm run build`: Compiles TypeScript and builds production-ready static assets into `dist/`.
- `npm run preview`: Locally previews the production build.
- `npm run lint`: Validates code typing using `tsc --noEmit`.
- `npm run clean`: Cleans build artifacts (`dist`, `server.js`).

---

## 📄 License

This project is licensed under the Apache 2.0 License. See the [LICENSE](LICENSE) file for details.
