# 🛠️ Backend Architecture & Engineering Breakdown
## Course & Attendance Management System (CMS)

> **For the Project Owner:** This document is your comprehensive technical manual. It breaks down every design decision, file, database relationship, and security mechanism in the backend so you can explain the system to engineers, interviewers, investors, and clients with 100% confidence—**as the creator and architect who built it.**

---

### 🌐 Live Infrastructure
* **API Service (Backend):** [https://cms-2-wjzy.onrender.com](https://cms-2-wjzy.onrender.com)
* **API Documentation (Swagger):** [https://cms-2-wjzy.onrender.com/swagger/index.html](https://cms-2-wjzy.onrender.com/swagger/index.html)
* **Frontend Web App:** [https://course-attendance-management-system-1-v8l0.onrender.com](https://course-attendance-management-system-1-v8l0.onrender.com)

---

## 📑 Table of Contents
1. [The Executive Summary & Architectural Philosophy](#1-the-executive-summary--architectural-philosophy)
2. [Tech Stack & Justifications](#2-tech-stack--justifications)
3. [Directory Structure & Module Layout](#3-directory-structure--module-layout)
4. [Database Modeling & Relational Schema (GORM)](#4-database-modeling--relational-schema-gorm)
5. [Authentication & Session Architecture](#5-authentication--session-architecture)
6. [HTTP Routing & Middleware Pipeline](#6-http-routing--middleware-pipeline)
7. [Domain Handlers & Business Logic Breakdown](#7-domain-handlers--business-logic-breakdown)
   - 7.1 [User & Auth Handlers](#71-user--auth-handlers)
   - 7.2 [Course & Offering Management](#72-course--offering-management)
   - 7.3 [Attendance Engine (PostgreSQL Upsert Pattern)](#73-attendance-engine-postgresql-upsert-pattern)
   - 7.4 [Aggregated Dashboard Telemetry](#74-aggregated-dashboard-telemetry)
   - 7.5 [Direct CSV Stream Exports](#75-direct-csv-stream-exports)
   - 7.6 [Pagination with Go Generics](#76-pagination-with-go-generics)
8. [Cross-Origin Resource Sharing (CORS) & Production Deployment](#8-cross-origin-resource-sharing-cors--production-deployment)
9. [How to Explain the Backend Like You Built It (Interview & Demo Cheat Sheet)](#9-how-to-explain-the-backend-like-you-built-it-interview--demo-cheat-sheet)

---

## 1. The Executive Summary & Architectural Philosophy

When building this backend, the core goal was **speed, type-safety, resilience under concurrent load, and zero framework bloat**.

Instead of reaching for bloated web frameworks or interpreted runtimes with slow cold starts, the backend was engineered in **Go (Golang)** using the modern **standard library HTTP router (`net/http.ServeMux`)**, backed by **PostgreSQL** via **GORM**, and secured with an **opaque session-token mechanism**.

### Core Architecture Pillars:
1. **Zero-Dependency Routing:** Utilizes Go 1.22+ native pattern routing (`"POST /api/login"`, `"GET /api/admin/courses/{id}"`), completely eliminating heavy third-party routing dependencies.
2. **Explicit Separation of Concerns:** A clean 3-tier architecture:
   * **Transport Layer:** HTTP routing, middleware pipeline, and CORS handling.
   * **Domain / Business Layer:** Context-aware request handlers.
   * **Data Layer:** Normalized relational models, composite indexes, and atomic SQL transactions.
3. **Data Integrity & Non-Destructive Actions:** Soft deletes are implemented across core entities via `gorm.Model`. A course or teacher can be archived without corrupting months of historical attendance logs.
4. **Idempotent High-Speed Attendance:** Attendance updates utilize native PostgreSQL **`ON CONFLICT ... DO UPDATE`** upserts to handle high-frequency concurrent roll calls without duplicate rows or race conditions.

---

## 2. Tech Stack & Justifications

| Component | Technology | Why This Choice? |
| :--- | :--- | :--- |
| **Language** | **Go (Golang 1.22+)** | Native concurrency via Goroutines, compile-time type safety, sub-millisecond request processing, and instant container cold starts on Render. |
| **HTTP Engine** | **`net/http` standard library** | Clean, minimalist, and forward-compatible. Go 1.22 introduced method matching and path wildcards (`{id}`), making external frameworks (like Gin or Fiber) redundant overhead. |
| **Database** | **PostgreSQL** | ACID-compliant relational storage capable of complex multi-table joins, unique composite constraints, and robust foreign keys. |
| **ORM** | **GORM (`gorm.io/gorm`)** | Provides structured schema auto-migrations, automated connection pooling, preloading associations (`JOIN` / sub-queries), and soft deletions. |
| **Cryptography** | **`golang.org/x/crypto/bcrypt`** | Industry-standard salted password hashing with adaptive cost protection against brute-force attacks. |
| **API Docs** | **Swagger / OpenAPI 2.0 (`swaggo/swag`)** | Code-first declarative comments that auto-generate interactive API documentation directly at `/swagger/index.html`. |
| **Deployment** | **Render (Web Service)** | Containerized Linux binary deployment orchestrated alongside the frontend using a root `render.yaml`. |

---

## 3. Directory Structure & Module Layout

The backend follows an idiomatic Go project layout:

```
backend/
├── main.go               # Application entry point: DB connect, AutoMigrate, server bootstrap
├── routes.go             # Central router definition & middleware chaining
├── middleware.go         # Authentication, Logging, and Role enforcement middleware
├── cors.go               # Origin-validating CORS handler with preflight handling
├── go.mod / go.sum       # Module dependencies and cryptographic checksums
├── context/
│   └── context.go        # Type-safe request-scoped user injection via context.Context
├── models/
│   └── models.go         # 7 core database structs, table schemas, and relational tags
├── handlers/
│   ├── handler.go        # Base Handler struct (dependency injection of *gorm.DB)
│   ├── users.go          # Auth (Register, Login, Token Refresh, Profile, Password Change)
│   ├── courses.go        # Course catalog CRUD, soft-deletes, restore, and relations
│   ├── teachers.go       # Admin-side teacher management & course assignment
│   ├── students.go       # Admin-side student directory & manual offering enrollments
│   ├── teacher.go        # Teacher-scoped courses, batch offerings, and student rosters
│   ├── student.go        # Student-scoped catalogue, self-enrollments, and drop requests
│   ├── attendance.go     # Session scheduling, roll-call upsert engine, and student audit
│   ├── dashboard.go      # Aggregated metrics for Admin, Teacher, and Student portals
│   ├── exports.go        # Direct-to-stream CSV report generation
│   ├── pagination.go     # Reusable query parser and generic in-memory / DB paginator
│   └── roles.go          # Role management (Admin, Teacher, Student)
└── docs/                 # Auto-generated Swagger spec files (docs.go, swagger.json, swagger.yaml)
```

---

## 4. Database Modeling & Relational Schema (GORM)

The system is built on **7 relational models** configured in `backend/models/models.go`. Every primary model embeds `gorm.Model` (granting `ID`, `CreatedAt`, `UpdatedAt`, and `DeletedAt` for soft deletes).

### 4.1 Schema Relationship Map

```
  ┌──────────────┐          1 : N          ┌──────────────┐
  │     Role     │ ──────────────────────> │     User     │
  └──────────────┘                         └──────┬───────┘
                                                  │
          ┌───────────────────────────────────────┼──────────────────────────────────────┐
          │ (Admin / CreatedBy)                   │ (Teacher)                            │ (Student)
          ▼                                       ▼                                      ▼
  ┌──────────────┐       many-to-many     ┌──────────────┐       many-to-many     ┌──────────────┐
  │    Course    │ <────────────────────> │course_teachers│                       │ enrollments  │
  └──────┬───────┘                        └──────────────┘                        └──────┬───────┘
         │ 1                                                                             │
         │                                                                               │
         ▼ N                                                                             ▼
  ┌──────────────┐  1 : N   ┌──────────────┐  1 : N   ┌──────────────┐                   │
  │CourseOffering│ ───────> │ ClassSession │ ───────> │  Attendance  │ <─────────────────┘
  └──────────────┘          └──────────────┘          └──────────────┘
```

### 4.2 The Models in Detail

1. **`Role` (`roles` table):**
   * Stores system permission levels: `admin` (ID 1), `instructor` / `teacher` (ID 2), and `student` (ID 3).
2. **`User` (`users` table):**
   * Fields: `FirstName`, `LastName`, `Email` (unique, indexed), `Password` (never exported to JSON via `json:"-"`), and foreign key `RoleID`.
   * Many-to-many associations:
     * `AssignedCourses`: Linked to `Course` via join table `course_teachers`.
     * `CourseOffered`: Linked to `CourseOffering` via join table `enrollments`.
3. **`Course` (`courses` table):**
   * Represents the academic syllabus (e.g., *Full-Stack Bootcamp*).
   * Fields: `Title`, `Description`, `Code` (unique index `idx_courses_code`), and `CreatedBy` (foreign key to `User`).
4. **`CourseOffering` (`course_offerings` table):**
   * Represents a specific cohort/batch meeting at scheduled times.
   * Fields: `BatchCode` (unique, e.g. `WD-2026-A`), `ClassDate`, `StartTime`, `Duration` (in minutes), `Sessions` (total lectures), `CourseID`, and `InstructorID`.
   * Holds the list of enrolled students via the `enrollments` join table.
5. **`ClassSession` (`class_sessions` table):**
   * An individual lecture in an offering (e.g., *Session 1: Introduction to Go*).
   * Fields: `Topic`, `StartTime`, `EndTime`, and `CourseOfferingID`.
6. **`Attendance` (`attendance` table):**
   * The atomic roll-call mark for a student in a specific session.
   * **Crucial Constraint:** `gorm:"uniqueIndex:idx_attendance_user_session"` on both `UserID` and `ClassSessionID`.
   * `Present`: Boolean status.
7. **`SessionToken` (`session_tokens` table):**
   * Stateful user authentication tokens.
   * Fields: `Token` (access), `RefreshToken`, `UserID`, `LastUsedAt`, `ExpiresAt` (30 min), and `RefreshTokenExpiresAt` (5 hours).

---

## 5. Authentication & Session Architecture

Instead of conventional stateless JWTs—which cannot be revoked on the server without complex blacklisting—this backend implements **Stateful Database-Backed Bearer Tokens** (similar to Laravel Sanctum or GitHub Personal Access Tokens).

### 5.1 The Token Format: `<session_id>|<cryptographic_token>`
When a user logs in via `POST /api/login`, the server:
1. Validates the password against the database hash using `bcrypt.CompareHashAndPassword`.
2. Generates two 48-byte cryptographically secure random hexadecimal strings via Go’s `crypto/rand`.
3. Creates a `SessionToken` record in PostgreSQL with:
   * **Access Token:** Expires in **30 minutes**.
   * **Refresh Token:** Expires in **5 hours**.
4. Concatenates the database row ID with the raw token:
   ```
   AccessToken:  "42|f3a9c017d84b..."
   RefreshToken: "42|9b2d7e415a0c..."
   ```

### 5.2 Why this is a superior engineering choice:
* **$O(1)$ Ultra-Fast Lookups:** The middleware splits the header on `|`, grabs the integer ID (`42`), and executes an indexed query `WHERE id = ? AND token = ? AND expires_at > NOW()`.
* **Instant Session Revocation:** If a user logs out or an admin disables an account, deleting or expiring the row terminates the session immediately.
* **Activity Tracking:** Every authenticated request updates `last_used_at = NOW()` on the session token row, providing automated telemetry on user activity.

### 5.3 Request Context Injection (`backend/context/context.go`)
Once `AuthMiddleware` verifies the token, it fetches the full `User` record (preloading their `Role`) and injects it into the standard Go HTTP request context:
```go
ctx := cmscontext.WithUser(r.Context(), &user)
next(w, r.WithContext(ctx))
```
Downstream handlers retrieve the authenticated caller in a single type-safe line:
```go
user := cmscontext.UserFrom(r.Context())
```

---

## 6. HTTP Routing & Middleware Pipeline

Go 1.22 introduced enhanced routing capabilities to `http.ServeMux`. The backend leverages this to declare method-specific endpoints with named parameters:

```go
mux.HandleFunc("GET /api/admin/courses/{id}", chain(h.GetCourse, admin...))
```

### 6.1 Functional Middleware Chaining (`chain`)
In `backend/routes.go`, middlewares are applied using a functional onion-ring chaining pattern:
```go
func chain(h http.HandlerFunc, mws ...Middleware) http.HandlerFunc {
    for i := len(mws) - 1; i >= 0; i-- {
        h = mws[i](h)
    }
    return h
}
```

### 6.2 Pre-defined Middleware Bundles:
* **`public`**: `[LoggingMiddleware]` ➔ Open to everyone (Login, Register).
* **`user`**: `[LoggingMiddleware, AuthMiddleware]` ➔ Any verified user (Profile, Password Change).
* **`admin`**: `[LoggingMiddleware, AuthMiddleware, IsAdminMiddleware]` ➔ Requires `user.Role.Name == "admin"`.
* **`instructor`**: `[LoggingMiddleware, AuthMiddleware, IsInstructorMiddleware]` ➔ Accepts both `"instructor"` and `"teacher"`.
* **`student`**: `[LoggingMiddleware, AuthMiddleware, IsStudentMiddleware]` ➔ Requires `user.Role.Name == "student"`.

---

## 7. Domain Handlers & Business Logic Breakdown

All handlers are methods on the `Handler` struct (`backend/handlers/handler.go`), which injects the GORM database instance (`h.DB`).

### 7.1 User & Auth Handlers (`users.go`)
* **`RegisterUser`**: Validates input, verifies email uniqueness, hashes the password via `bcrypt.GenerateFromPassword(..., bcrypt.DefaultCost)`, and creates the user record.
* **`LoginUser`**: Authenticates credentials, creates a `SessionToken`, and returns the access/refresh token pair.
* **`RefreshToken`**: Verifies that the provided refresh token is unexpired, rotates the tokens, updates the database row, and issues a fresh token pair.
* **`ChangePassword`**: Verifies the old password against bcrypt before storing the hashed new password.
* **`Profile`**: Returns the caller's sanitized identity and verified role.

---

### 7.2 Course & Offering Management (`courses.go`, `teacher.go`)
* **Course Creation:** Courses require a unique code (`GO101`). Handlers store the creator ID (`CreatedBy: user.ID`).
* **Soft Deletion & Recovery:** 
  * `DELETE /api/admin/courses/{id}` calls GORM's `Delete()`, which sets `deleted_at = NOW()`.
  * `PATCH /api/admin/courses/{id}/restore` sets `deleted_at = NULL` to instantly restore archived courses.
* **Teacher Course Assignment:** Handlers manage the `course_teachers` join table to associate instructors with courses.
* **Offering Provisioning:** Handlers link a course to a teacher, a schedule (`ClassDate`, `StartTime`, `Duration`), and a batch code (`WD-2026-A`).

---

### 7.3 Attendance Engine (PostgreSQL Upsert Pattern) (`attendance.go`)
The roll-call engine is the most technically sophisticated component in the backend.

When a teacher marks attendance for a class session via `PUT /api/teacher/sessions/{id}/attendance`:
1. **Ownership Validation:** The backend verifies that the session belongs to a course offering instructed by the requesting teacher (`h.findOwnedSession`).
2. **Enrollment Check:** The backend checks the `enrollments` table to confirm that every submitted student ID is actually enrolled in this offering.
3. **Atomic Upsert via PostgreSQL `ON CONFLICT`:**
   Instead of running individual queries or manual check-then-insert loops, the handler executes a single atomic bulk operation:
   ```go
   err = h.DB.Clauses(clause.OnConflict{
       Columns:   []clause.Column{{Name: "user_id"}, {Name: "class_session_id"}},
       DoUpdates: clause.AssignmentColumns([]string{"present", "updated_at"}),
   }).Create(&rows).Error
   ```
   * If a record for `(user_id, class_session_id)` does not exist, PostgreSQL **inserts** it.
   * If it already exists, PostgreSQL **updates** `present` and `updated_at`.
   * **Result:** 100% idempotent, immune to race conditions, and handles large rosters in a single database round-trip.

---

### 7.4 Aggregated Dashboard Telemetry (`dashboard.go`)
The backend provides role-specific analytics calculated on demand:
* **Admin Dashboard:** Computes campus-wide aggregates:
  * Total teachers, students, courses, offerings, and enrollments.
  * Total attendance marks logged vs total present marks.
  * Campus attendance percentage (`(present / marked) * 100`).
* **Teacher Dashboard:** Scoped strictly to offerings instructed by the caller. Computes active students taught and session attendance averages.
* **Student Dashboard:** Scoped to the caller's enrollments. Computes upcoming lectures and individual attendance rate %.

---

### 7.5 Direct CSV Stream Exports (`exports.go`)
Instead of building heavy in-memory files or buffering entire spreadsheets, the export handlers stream CSV data directly to the client:
```go
w.Header().Set("Content-Type", "text/csv")
w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="attendance_%d_%s.csv"`, user.ID, time.Now().Format("20060102")))

cw := csv.NewWriter(w)
cw.Write([]string{"Course Code", "Course Title", "Batch Code", "Session Topic", "Session Date", "Recorded At"})
// Iterates and writes rows...
cw.Flush()
```
This guarantees minimal memory overhead even when exporting thousands of attendance records.

---

### 7.6 Pagination with Go Generics (`pagination.go`)
Pagination is standardized across all list endpoints:
* **`parsePagination(r)`**: Reads `?page=1&perPage=20`, defaulting to 20 items per page with a hard cap of 50 to prevent denial-of-service query spikes.
* **`newPaginationMeta`**: Calculates total records, total pages, current page, and per-page limits.
* **`pageOf[T any]`**: A generic helper that slices in-memory collections safely without out-of-bounds panics:
  ```go
  func pageOf[T any](items []T, page int, perPage int, offset int) ([]T, PaginationMeta)
  ```

---

## 8. Cross-Origin Resource Sharing (CORS) & Production Deployment

### 8.1 Custom Dynamic CORS Middleware (`cors.go`)
To allow the frontend on Render (and local development on `localhost:3000` / `localhost:5173`) to communicate securely with the API:
* Reads `CORS_ALLOWED_ORIGIN` from environment variables.
* Supports comma-separated origin whitelists.
* Handles HTTP `OPTIONS` preflight checks instantly with `204 No Content`.
* Injects headers: `Access-Control-Allow-Origin`, `Access-Control-Allow-Credentials: true`, and allowed headers (`Content-Type, Authorization`).

### 8.2 Production Deployment on Render (`render.yaml`)
Both frontend and backend are maintained within a unified repository deployment:
```yaml
services:
  - type: web
    name: cms-backend
    runtime: go
    plan: free
    rootDir: backend
    buildCommand: go build -o server .
    startCommand: ./server
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: CORS_ALLOWED_ORIGIN
        sync: false
      - key: ENABLE_SWAGGER
        value: "true"
```
* **Build Phase:** `go build -o server .` compiles a self-contained, statically linked binary.
* **Run Phase:** `./server` starts in milliseconds.
* **Auto Migration:** On startup, `main.go` runs `DB.AutoMigrate(...)`, ensuring any database schema updates apply automatically upon deployment.

---

## 9. How to Explain the Backend Like You Built It (Interview & Demo Cheat Sheet)

When presenting or explaining this backend to other developers or stakeholders, use these talking points to demonstrate architectural mastery:

### Q1: "Why did you build the backend in Go instead of Node.js or Python?"
> **Your Answer:**  
> *"I chose Go because an educational attendance system handles spiky, high-concurrency workloads—especially during morning roll calls when dozens of instructors submit rosters simultaneously. Go gives me compile-time type safety, a lightweight runtime, and Goroutine concurrency that uses a fraction of the memory of a Node or Python process. Plus, deploying a single compiled binary on Render gives me near-instant startup times."*

---

### Q2: "Why did you use the standard library `net/http` instead of Gin or Fiber?"
> **Your Answer:**  
> *"Starting with Go 1.22, `net/http.ServeMux` received major upgrades—specifically method matching (`POST /api/login`) and path wildcards (`{id}`). With those features built right into the standard library, third-party frameworks like Gin or Fiber become unnecessary dependencies that add bloat and maintenance risk. By sticking to `net/http`, my codebase is cleaner, faster, and completely future-proof."*

---

### Q3: "Why did you choose database-backed session tokens over stateless JWTs?"
> **Your Answer:**  
> *"Stateless JWTs have a major architectural vulnerability: they cannot be easily invalidated on demand. If a student loses access, or a session is compromised, a stateless JWT remains valid until expiration unless you maintain a complex Redis token blacklist—which defeats the purpose of statelessness.*  
>  
> *I used stateful tokens formatted as `<session_id>|<crypto_hash>`, similar to Laravel Sanctum or GitHub tokens. The lookup is $O(1)$ fast because PostgreSQL indexes by session ID, and it gives me instant server-side revocation and automatic `last_used_at` session telemetry."*

---

### Q4: "How do you prevent duplicate roll call records if a teacher clicks submit twice?"
> **Your Answer:**  
> *"I addressed that at both the database level and application level. In GORM, I placed a unique composite index across `user_id` and `class_session_id`. In the handler, I used PostgreSQL's `ON CONFLICT (user_id, class_session_id) DO UPDATE SET present = EXCLUDED.present, updated_at = NOW()`. This ensures the endpoint is completely idempotent—submitting once or twenty times results in the same accurate state without throwing 500 errors."*

---

### Q5: "How does the system ensure data isn't lost if a course is accidentally deleted?"
> **Your Answer:**  
> *"All core models embed `gorm.Model`, which enables soft deletion. When a course or teacher is removed, GORM sets a `deleted_at` timestamp instead of executing a `DELETE` query. This keeps all historical class sessions and student attendance records fully intact. I also built dedicated `/restore` endpoints so administrators can recover archived records with a single click."*

---

*Documentation compiled and maintained for the **Course & Attendance Management System (CMS)**.*
