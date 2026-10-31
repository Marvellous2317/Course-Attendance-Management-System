# 🎓 Course & Attendance Management System (CMS)
## Complete Beginner's End-to-End Frontend User Guide (A to Z)

---

### 🌐 System Access Links
* **Live Application (Frontend):** [https://course-attendance-management-system-1-v8l0.onrender.com](https://course-attendance-management-system-1-v8l0.onrender.com)
* **API Service (Backend):** [https://cms-2-wjzy.onrender.com](https://cms-2-wjzy.onrender.com)

---

## 📖 Introduction

Welcome to the **Course & Attendance Management System (CMS)**. 

I designed and engineered this platform from the ground up to eliminate the friction, paper rosters, and administrative blindspots typical in schools, bootcamps, and universities. Whether you are an **Administrator** organizing academic terms and faculty, a **Teacher** scheduling classes and logging real-time student attendance, or a **Student** tracking your progress and enrolling in high-impact courses, this application provides a dedicated, fast, and modern interface tailored to your role.

This guide walks you step-by-step through every single button, form, screen, and workflow across the entire frontend. Even if you have never used an educational portal before, you will master it by following this guide from A to Z.

---

## 📑 Table of Contents
1. [User Roles & Security Architecture](#1-user-roles--security-architecture)
2. [Public Landing Page & Exploration](#2-public-landing-page--exploration)
3. [Authentication: Signing Up & Signing In](#3-authentication-signing-up--signing-in)
4. [The Admin Portal (Full Walkthrough)](#4-the-admin-portal-full-walkthrough)
   - 4.1 [Dashboard & Institutional Telemetry](#41-dashboard--institutional-telemetry)
   - 4.2 [Creating & Managing Courses](#42-creating--managing-courses)
   - 4.3 [Course Offerings (Batches & Schedules)](#43-course-offerings-batches--schedules)
   - 4.4 [Creating Teachers & Assigning Courses](#44-creating-teachers--assigning-courses)
   - 4.5 [Student Directory & Manual Enrollment](#45-student-directory--manual-enrollment)
   - 4.6 [Soft Deletions & The Recovery Bin](#46-soft-deletions--the-recovery-bin)
5. [The Teacher / Faculty Portal (Full Walkthrough)](#5-the-teacher--faculty-portal-full-walkthrough)
   - 5.1 [Teacher Dashboard Overview](#51-teacher-dashboard-overview)
   - 5.2 [My Courses & Student Rosters](#52-my-courses--student-rosters)
   - 5.3 [Class Schedule (Agenda vs Weekly Grid)](#53-class-schedule-agenda-vs-weekly-grid)
   - 5.4 [Marking & Managing Live Attendance](#54-marking--managing-live-attendance)
   - 5.5 [Exporting Student Rosters as CSV](#55-exporting-student-rosters-as-csv)
6. [The Student Portal (Full Walkthrough)](#6-the-student-portal-full-walkthrough)
   - 6.1 [Student Dashboard & Next Steps](#61-student-dashboard--next-steps)
   - 6.2 [Course Catalogue & Self-Enrollment](#62-course-catalogue--self-enrollment)
   - 6.3 [Enrolled Courses & Timetable](#63-enrolled-courses--timetable)
   - 6.4 [Attendance Auditing & Progress Tracking](#64-attendance-auditing--progress-tracking)
7. [Account Settings, Passwords & Profile Sync](#7-account-settings-passwords--profile-sync)
8. [Frequently Asked Questions & Troubleshooting](#8-frequently-asked-questions--troubleshooting)

---

## 1. User Roles & Security Architecture

The application uses **Role-Based Access Control (RBAC)** enforced on both the frontend routers and backend API endpoints:

| Role | Default Access Path | Primary Capabilities |
| :--- | :--- | :--- |
| **Super Admin** (`admin`) | `/admin` | Creates courses, schedules offerings/batches, provisions faculty, assigns courses to teachers, enrolls students, audits campus-wide metrics, and manages deletions. |
| **Teacher / Faculty** (`teacher`) | `/teacher` | Manages assigned courses, schedules lecture sessions, marks real-time student attendance, and exports session spreadsheets (CSV). |
| **Student** (`student`) | `/student` | Browses active course offerings, self-enrolls into batches, tracks personal attendance percentages, and downloads attendance transcripts. |

### Smart Automatic Redirection
You never need to memorize your role URL. When you log in with your credentials, the frontend queries the `/api/profile` endpoint, reads your verified institutional role, and navigates you straight to `/admin`, `/teacher`, or `/student`.

---

## 2. Public Landing Page & Exploration

**URL:** `https://course-attendance-management-system-1-v8l0.onrender.com/`

When any visitor arrives at the site, they are greeted by the public homepage designed with the **Othello Institute of Technology** branding.

### Key Sections:
1. **Top Navigation Bar:**
   * **Logo:** Clicking returns to the top of the home page.
   * **Navigation Links:** `Courses`, `Why Us`, and `Metrics` perform smooth in-page scrolling.
   * **Action Buttons:**
     * `Sign In`: Opens the Login screen (`/login`).
     * `Register Now`: Opens the Student Registration screen (`/register`).
2. **Hero Banner:**
   * Highlights key institutional milestones (e.g., *500+ Students Trained*, *92% Placement Rate*).
   * Direct CTAs: `Get Started` button and `Explore Courses` trigger.
3. **Academic Catalog Preview:**
   * Displays available career tracks: Software Development, Data Analytics, Cyber Security, Data Science & AI, UI/UX Design, and ICT Systems.
4. **Metrics Bar:**
   * Displays verified academic stats (Graduates Placed, Course Completion Rate, Industry Mentors).

---

## 3. Authentication: Signing Up & Signing In

### 3.1 Registering a New Student Account
* **URL:** `/register`
* **Trigger:** Click `Register Now` from the landing page or `Create an account` on the login page.

#### Step-by-Step Registration:
1. **First Name & Last Name:** Enter your real name (e.g., `Ada Lovelace`).
2. **Institutional Email:** Enter your primary email address.
3. **Password & Confirm Password:**
   * Features a live **Password Strength Meter** evaluating length, uppercase characters, digits, and special characters (`Weak` ➔ `Fair` ➔ `Good` ➔ `Strong`).
   * Password visibility can be toggled using the 👁️ eye icon.
4. **Code of Conduct Checkbox:** Check the box agreeing to the institutional academic integrity charter.
5. **Submit:** Click `Register Account`. Once successful, a green toast notification will appear and automatically take you to the sign-in screen.

> ℹ️ *Note: Public self-registration assigns the `student` role by default. Teachers and Admins are provisioned by an existing Administrator inside the Admin Portal.*

---

### 3.2 Signing In (Login)
* **URL:** `/login`

#### Step-by-Step Login:
1. Enter your **Institutional Email** and **Password**.
2. Click **Sign In**.
3. The button will transition into a loader state (`Authenticating Session...`).
4. Upon authentication:
   * Your JWT access tokens and session profile are securely saved to local application storage.
   * You are routed immediately to your designated role dashboard:
     * Admin ➔ `/admin`
     * Teacher ➔ `/teacher`
     * Student ➔ `/student`

---

## 4. The Admin Portal (Full Walkthrough)

As an **Administrator**, you have root control over academic curriculum, faculty assignments, classroom offerings, and student records.

```
Admin Portal Structure:
├── 📊 Dashboard      (/admin)           -> Real-time institutional telemetry & quick actions
├── 🎓 Students       (/admin/students)  -> Student roster, manual additions, profile editing
├── 👨‍🏫 Teachers       (/admin/teachers)  -> Faculty directory, account creation, course assignments
├── 📚 Courses        (/admin/courses)   -> Course catalog & Course Offerings (Batches/Timeslots)
└── ⚙️ Settings       (/admin/settings)  -> Profile management & password updates
```

---

### 4.1 Dashboard & Institutional Telemetry
* **Navigation:** Click `Dashboard` on the left sidebar.

The Admin Dashboard provides real-time analytics pulled directly from the backend:
* **Total Teachers:** Active instructors in the institute.
* **Total Students:** Enrolled learners.
* **Total Courses:** Academic titles provisioned.
* **Total Offerings:** Active cohorts and batches.
* **Total Enrollments:** Number of student-to-batch registrations.
* **Campus Attendance Rate:** Real-time percentage of student presence across all conducted sessions.
* **Quick Action Buttons:** Direct shortcuts to `Enroll Student`, `Add Teacher`, and `Create Course`.
* **Refresh Telemetry Button:** Click the circular arrow icon to instantly re-fetch live counts from the database.

---

### 4.2 Creating & Managing Courses
* **Navigation:** Click `Courses` on the left sidebar.

The Courses view is organized into two tabs:
1. **Courses (Base Catalog):** The master directory of subjects taught.
2. **Offerings (Batches):** The specific cohorts with scheduled days, times, and instructors.

#### How to Create a New Course:
1. Click the golden **`+ Add Course`** button in the top right.
2. In the modal that appears:
   * **Course Code:** Enter a unique identifier (e.g., `CS101`, `SE-302`, `DATA-100`).
   * **Course Title:** Enter the full course title (e.g., `Full-Stack Web Development Bootcamp`).
   * **Description:** Enter a summary of the curriculum, prerequisites, and learning objectives.
3. Click **`Create Course`**.
4. The course immediately appears in the active course grid with an active badge.

#### Course Actions:
* **Edit:** Click the ✏️ pencil icon to modify the title, code, or description.
* **Soft Delete:** Click the 🗑️ trash icon to move the course to the **Deleted Bin** (ensuring historical student attendance records remain safe).

---

### 4.3 Course Offerings (Batches & Schedules)
A Course represents *what* is taught; a **Course Offering** represents *when, where, and by whom* it is taught (e.g., *Batch 2026-A* starting on Monday mornings).

#### How to Create a Course Offering:
1. In `CoursesView`, switch to the **`Offerings`** tab.
2. Click **`+ Create Offering`**.
3. Fill out the batch specifications:
   * **Course:** Select the base course from the dropdown.
   * **Instructor / Teacher:** Select the faculty member who will teach this offering.
   * **Batch Code:** Assign a cohort identifier (e.g., `WD-B1-2026`).
   * **Class Date:** Select the term commencement date.
   * **Start Time:** Set the class start time (e.g., `09:00 AM`).
   * **Duration:** Duration in hours (e.g., `2` or `3`).
   * **Total Sessions:** Number of scheduled class lectures (e.g., `12` or `24`).
4. Click **`Create Offering`**.
5. Once created, teachers can immediately start scheduling lectures for this batch, and students can view it in their enrollment portal.

---

### 4.4 Creating Teachers & Assigning Courses
* **Navigation:** Click `Teachers` on the left sidebar.

This page displays the faculty directory, showing each instructor's contact information, active assigned courses, and creation dates.

#### Step 1: Provisioning a New Teacher Account
1. Click **`+ Add Teacher`** in the top right header.
2. Enter the instructor's credentials:
   * **First Name:** (e.g., `John`)
   * **Last Name:** (e.g., `Doe`)
   * **Institutional Email:** (e.g., `john.doe@othello.edu`)
   * **Temporary Password:** Assign a secure starter password.
3. Click **`Create Teacher Profile`**.
4. The teacher account is created with the `teacher` role and is ready for login immediately.

#### Step 2: Assigning Courses to the Teacher
1. Locate the teacher in the list or card view.
2. Click the action menu (three dots or `Assign Courses` button).
3. In the assignment modal:
   * You will see the list of all available institutional courses.
   * Use the search bar to locate specific courses.
   * Check the boxes next to the courses this teacher is qualified to teach.
4. Click **`Assign Courses`**.
5. The teacher’s profile now displays their assigned subjects, and when the teacher logs in, those courses appear on their personalized portal.

#### Step 3: Unassigning Courses
* If an instructor is taking leave or reallocating workloads, click `Unassign Course`, pick the target course from their active list, and confirm.

---

### 4.5 Student Directory & Manual Enrollment
* **Navigation:** Click `Students` on the left sidebar.

While students can register themselves, administrators can also manually create students and manage their profiles:
1. Click **`+ Add Student`**.
2. Enter the student's Name, Email, and Password.
3. Click **`Create Student Profile`**.
4. You can search students by name or email, view their enrollment history, or edit their details anytime.

---

### 4.6 Soft Deletions & The Recovery Bin
To maintain academic compliance and audit history, items are never permanently destroyed without caution:
* On both the **Courses** and **Teachers** pages, you will notice two tabs: **`Active`** and **`Deleted`**.
* When you delete a record, it moves to the `Deleted` bin.
* This ensures that attendance sessions taken months ago are not corrupted if a course or teacher finishes their cohort.

---

## 5. The Teacher / Faculty Portal (Full Walkthrough)

When an instructor logs in, they access an interface designed for teaching and tracking attendance.

```
Teacher Portal Structure:
├── 📊 Dashboard        (/teacher)             -> Teaching metrics, batch overviews, quick shortcuts
├── 📚 Courses          (/teacher/courses)     -> My assigned courses, enrolled rosters, batch creations
├── 📅 Class Schedule   (/teacher/schedule)    -> Timeline Agenda & 5-Day Weekly Class Schedule
├── ✅ Attendance       (/teacher/attendance)  -> Live roll-call table, bulk marks, and CSV exports
└── ⚙️ Settings         (/teacher/settings)    -> Profile and password management
```

---

### 5.1 Teacher Dashboard Overview
* **Navigation:** Click `Dashboard` on the teacher sidebar.
* **Telemetry Cards:**
  * **My Courses:** Number of active courses assigned to you by Admin.
  * **Active Offerings (Batches):** Number of running cohorts.
  * **Total Students:** Aggregate student count across all your classes.
  * **Sessions Held:** Number of lectures conducted to date.
  * **Present Marks:** Total verified presences logged.
  * **Overall Attendance %:** Average student attendance rate across all your cohorts.

---

### 5.2 My Courses & Student Rosters
* **Navigation:** Click `Courses` on the teacher sidebar.

This page shows all subjects you are authorized to teach.
1. **View Roster:**
   * Click **`View Students`** on any course card.
   * A slide-over modal displays every student currently enrolled in your course, their emails, and enrollment timestamps.
2. **Launch a Batch Offering:**
   * Teachers can click **`Create Offering`** directly from a course card to schedule a new batch without needing to ask the admin.

---

### 5.3 Class Schedule (Agenda vs Weekly Grid)
* **Navigation:** Click `Class Schedule` on the teacher sidebar.

The Schedule page offers two views:
* **Agenda View:** A chronological timeline of upcoming lectures.
* **5-Day Weekly Grid:** A visual timetable (Monday to Friday) organizing sessions by timeslots.

#### How to Schedule a New Class Session:
1. Click **`+ Schedule Session`**.
2. Fill out the session details:
   * **Course Offering / Batch:** Select which batch this lecture belongs to.
   * **Session Topic:** Enter the lesson topic (e.g., *Introduction to React Hooks & State Management*).
   * **Session Date:** Pick the lecture date from the calendar picker.
   * **Start & End Time:** Set the class duration (e.g., `10:00 AM` to `12:00 PM`).
3. Click **`Create Session`**.
4. The lecture is scheduled and immediately appears on your calendar as well as your students' schedule.

---

### 5.4 Marking & Managing Live Attendance
* **Navigation:** Click `Attendance` on the teacher sidebar (or click the **`Take Attendance`** button directly on any class session card).

This is the core tool of the system.

#### How to Conduct Roll Call:
1. **Select Batch (Offering):** Choose your class batch from the top dropdown.
2. **Select Session (Lecture):** Choose the specific session date/topic you are marking.
3. The table automatically populates with all enrolled students in that batch.
4. **Marking Attendance:**
   * **Single Student:** Click the green **`✓ Present`** button or the red **`✕ Absent`** button next to each student's name.
   * **Bulk Attendance:** If the whole class is present, simply click **`Mark All Present`** at the top.
5. **Real-Time Telemetry Bar:**
   * As you mark students, the top metrics bar updates instantly:
     * `Total Enrolled`
     * `Present`
     * `Absent`
     * `Unmarked`
     * `Session Attendance Rate (%)`
6. Every change is saved directly to the database.

---

### 5.5 Exporting Student Rosters as CSV
* Need an offline spreadsheet for your gradebook or faculty meetings?
* On the `Attendance` page, click **`Export CSV`**.
* The browser will automatically generate and download an `.xlsx`/`.csv` file containing the full list of enrolled students, their attendance status, and contact emails.

---

## 6. The Student Portal (Full Walkthrough)

Students have a clean, focused portal allowing them to register for classes, review lecture schedules, and verify that their attendance is accurately recorded.

```
Student Portal Structure:
├── 📊 Dashboard      (/student)             -> Enrollment stats, attendance progress, next lectures
├── 📚 Your Courses   (/student/courses)     -> List of courses you are currently attending
├── ➕ Enrollment     (/student/enrollment)  -> Live course catalogue to browse and join batches
├── ✅ Attendance     (/student/attendance)  -> Detailed session breakdown, status filters, CSV export
└── ⚙️ Settings       (/student/settings)    -> Profile and password management
```

---

### 6.1 Student Dashboard
* **Quick Stats:**
  * **Enrolled Offerings:** How many active courses you are currently taking.
  * **Overall Attendance Rate:** Your cumulative presence percentage. A color-coded badge turns green for good attendance (>80%) or amber/red if you are falling behind.
  * **Total Sessions Attended:** Number of classes verified by your instructors.

---

### 6.2 Course Catalogue & Self-Enrollment
* **Navigation:** Click `Enrollment` on the student sidebar.

#### How to Enroll in a Course:
1. Browse the list of active course offerings.
2. Each offering card shows:
   * Course Code and Title
   * Assigned Faculty Instructor
   * Batch Code
   * Start Date and Lecture Schedule
   * Total Session Count
3. Click the golden **`+ Enroll in Course`** button.
4. The system validates the registration. The button instantly updates to a green badge: **`✓ Enrolled`**.
5. The course is now added to your personal schedule and attendance tracker.

---

### 6.3 Enrolled Courses & Timetable
* **Navigation:** Click `Your Courses` on the student sidebar.
* Review all your active courses, access teacher contact info, and see your upcoming schedule in one place.

---

### 6.4 Attendance Auditing & Progress Tracking
* **Navigation:** Click `Attendance` on the student sidebar.

Students have full transparency over their academic records:
* **Filter by Course:** Select a specific course to inspect that class alone.
* **Filter by Status:** Filter by `All`, `Present Only`, or `Absent Only`.
* **Session Breakdown Table:**
  * **Date & Time:** When the lecture took place.
  * **Topic:** What was taught.
  * **Instructor:** Who marked the attendance.
  * **Status:** Clearly badged as **`Present`** (green) or **`Absent`** (red).
* **Download Attendance Transcript:** Click **`Export CSV`** to download a certified log of your complete attendance history.

---

## 7. Account Settings, Passwords & Profile Sync

Every authenticated user (Admin, Teacher, and Student) has access to the **Settings** view (`/admin/settings`, `/teacher/settings`, or `/student/settings`).

### Features:
1. **Institutional Profile View:**
   * View your registered First Name, Last Name, Email, and Official Institutional Role Badge.
2. **Change Password:**
   * To change your password, enter your:
     1. Current Password
     2. New Password
     3. Confirm New Password
   * Click **`Update Password`**.
   * The system will update your credentials and require you to sign back in with your new password for security.
3. **Logout:**
   * Click the **`Sign Out`** button in Settings or at the bottom of the navigation sidebar.
   * This clears your JWT token, resets the state cache, and returns you to the login screen.

---

## 8. Frequently Asked Questions & Troubleshooting

#### Q1: I am a Teacher. Why don't I see any courses on my dashboard?
> **Answer:** You must be assigned to courses by an Administrator. Ask your administrator to go to **`Teachers` ➔ `Assign Courses`** and attach the relevant subjects to your profile. Once assigned, refresh your page!

#### Q2: When a Teacher schedules a session, where does it appear?
> **Answer:** It appears immediately on the Teacher's **Class Schedule** (both Agenda and Grid views), on the **Attendance** page for roll call, and on the enrolled students' dashboards.

#### Q3: What happens if a Student forgets their password?
> **Answer:** An Administrator can navigate to **`Students` ➔ `Edit Student`** and update their details, or the student can change it inside their account settings.

#### Q4: Why does the system say "Session Expired"?
> **Answer:** For security, tokens expire after a period of inactivity. Simply click **Sign In** again to refresh your institutional token.

#### Q5: Can a teacher edit attendance after marking it?
> **Answer:** Yes! If a student arrived late, the teacher can return to **`Attendance`**, select the batch and session, and switch the status from `Absent` to `Present` anytime.

---

### 🚀 Summary Workflow: Running a Cohort from Start to Finish

```
1. [ADMIN] Creates Course: "Full-Stack Development" (CS101)
             │
             ▼
2. [ADMIN] Provisions Teacher Profile: "Professor Vance"
             │
             ▼
3. [ADMIN] Assigns Course CS101 to Professor Vance
             │
             ▼
4. [ADMIN / TEACHER] Creates Course Offering: Batch "FS-2026-A"
             │
             ▼
5. [STUDENT] Registers account and self-enrolls into "FS-2026-A"
             │
             ▼
6. [TEACHER] Schedules Lecture: "Session 1: Frontend Architecture"
             │
             ▼
7. [TEACHER] Opens Attendance roll-call, marks students Present / Absent
             │
             ▼
8. [STUDENT] Logs in and checks their attendance score (e.g., 100% Present)
             │
             ▼
9. [ADMIN & TEACHER] Export CSV reports and monitor institutional KPIs
```

---

*Documentation compiled and maintained for the **Course & Attendance Management System (CMS)**.*
