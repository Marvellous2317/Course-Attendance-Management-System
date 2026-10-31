# 💻 Local Development Setup Guide
## Course & Attendance Management System (CMS)

This guide walks you through setting up and running the entire Course & Attendance Management System (**both Backend and Frontend**) locally on your machine.

---

## 📋 System Prerequisites

Before you begin, ensure you have the following installed on your computer:

| Tool | Recommended Version | Check If Installed | Download Link |
| :--- | :--- | :--- | :--- |
| **Node.js** | v18+ (v20+ or v24+ recommended) | `node -v` | [nodejs.org](https://nodejs.org/) |
| **npm** | v9+ or v10+ | `npm -v` | Included with Node.js |
| **Go (Golang)** | v1.22 or higher *(Optional on Windows if using `cms.exe`)* | `go version` | [go.dev/dl](https://go.dev/dl/) |
| **Git** | Any modern version | `git --version` | [git-scm.com](https://git-scm.com/) |

---

## 🏗️ Architecture at Localhost

When running locally, two servers will be active:

```
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│     FRONTEND (React + Rsbuild)  │           │       BACKEND (Go REST API)     │
│      http://localhost:3000      │ ────────> │      http://localhost:8080      │
└─────────────────────────────────┘  API      └────────────────┬────────────────┘
                                     Calls                     │ Database
                                                               ▼ Connection
                                              ┌─────────────────────────────────┐
                                              │      POSTGRESQL DATABASE        │
                                              │   (Cloud Neon or Local Postgres)│
                                              └─────────────────────────────────┘
```

---

## 🚀 Step 1: Clone & Navigate to the Repository

Open your terminal (**PowerShell**, Command Prompt, or Bash):

```powershell
cd c:\Users\marvellous.braimah\Documents\personal\Course-Attendance-Management-System
```

---

## 🗄️ Step 2: Configure & Start the Backend

### 2.1 Check the Backend Environment File (`backend/.env`)
Navigate to the `backend` folder:
```powershell
cd backend
```

Ensure a file named `.env` exists in the `backend` folder with the following contents:

```env
# Database Connection (Neon cloud database or your local Postgres)
DATABASE_URL=postgresql://neondb_owner:npg_lE3y6rxanigI@ep-morning-darkness-za3wh4m5-pooler.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# CORS: Allows your local frontend on port 3000 to send requests
CORS_ALLOWED_ORIGIN=http://localhost:3000

# Enables Swagger documentation at /swagger/index.html
ENABLE_SWAGGER=true

# Port (Defaults to 8080 if omitted)
PORT=8080
```

> 💡 **Tip:** If you prefer running a **local PostgreSQL** instance instead of the cloud database, update `DATABASE_URL` to:  
> `DATABASE_URL=postgres://postgres:your_password@localhost:5432/cms_db?sslmode=disable`

---

### 2.2 Run the Backend Server

You have two easy options to run the backend:

#### Option A: Running the Pre-compiled Windows Binary (Instant, No Go install needed!)
The repository already contains a compiled Windows binary (`cms.exe`). Simply run:

```powershell
.\cms.exe
```

#### Option B: Running from Source with Go
If you have Go installed on your machine:

```powershell
go run .
```

#### Expected Terminal Output:
```text
Database connected successfully
Server is running on port 8080...
```

The backend is now live at **`http://localhost:8080`**!
* **Swagger API Documentation:** Open your browser and visit:  
  👉 **`http://localhost:8080/swagger/index.html`**

---

## 🎨 Step 3: Configure & Start the Frontend

Open a **new terminal tab or window** (keep the backend terminal running!).

### 3.1 Navigate to the Frontend Directory
```powershell
cd c:\Users\marvellous.braimah\Documents\personal\Course-Attendance-Management-System\frontend
```

---

### 3.2 Verify the Frontend Environment File (`frontend/.env`)
Ensure a file named `.env` exists in the `frontend` folder with the following content:

```env
PUBLIC_API_BASE_URL=http://localhost:8080/
```

*(This tells Axios to send all API requests to your local Go server on port 8080).*

---

### 3.3 Install Dependencies
Install the required Node packages (if not already installed):

```powershell
npm install
```

---

### 3.4 Start the Frontend Dev Server
Run the development command:

```powershell
npm run dev
```

#### Expected Terminal Output:
```text
  Rsbuild v2.2.8
  
  ➜  Local:    http://localhost:3000/
  ➜  Network:  http://192.168.x.x:3000/
```

Open your browser and visit:  
👉 **`http://localhost:3000`**

---

## 🧪 Step 4: Verify the Entire System Locally

Test the full end-to-end flow to verify everything is working:

1. **Visit Landing Page:** Navigate to `http://localhost:3000/`. You should see the Othello Institute portal.
2. **Register a Student Account:**
   * Click **Register Now**.
   * Enter your name, email (e.g., `student@test.com`), and a strong password.
   * Check the Code of Conduct and submit.
3. **Log In:**
   * Enter your credentials on `http://localhost:3000/login`.
   * You should be authenticated and redirected straight to your dashboard!
4. **Inspect API Calls:**
   * Open Developer Tools (`F12` ➔ **Network** tab).
   * Notice that requests are successfully flowing to `http://localhost:8080/api/...` with `200 OK` responses.

---

## 🛠️ Handy Commands Reference

| Action | Working Directory | Command |
| :--- | :--- | :--- |
| **Run Backend (Binary)** | `backend/` | `.\cms.exe` |
| **Run Backend (Go Source)** | `backend/` | `go run .` |
| **Re-build Backend Binary** | `backend/` | `go build -o cms.exe .` |
| **Re-generate Swagger Docs** | `backend/` | `go run github.com/swaggo/swag/cmd/swag init -g main.go -o docs` |
| **Run Frontend (Dev)** | `frontend/` | `npm run dev` |
| **Build Frontend (Production)** | `frontend/` | `npm run build` |
| **Preview Frontend Build** | `frontend/` | `npm run preview` |

---

## 🔍 Common Troubleshooting

### 1. `CORS Error: Access to XMLHttpRequest blocked by CORS policy`
* **Cause:** The backend isn't accepting requests from port 3000.
* **Fix:** Check `backend/.env`. Ensure `CORS_ALLOWED_ORIGIN` includes your frontend URL:
  ```env
  CORS_ALLOWED_ORIGIN=http://localhost:3000
  ```
  Restart the backend server.

### 2. `Database connection failed / DATABASE_URL not set`
* **Cause:** The backend cannot reach PostgreSQL.
* **Fix:** 
  1. Verify your internet connection if using the default Neon cloud database.
  2. If using local PostgreSQL, ensure the Postgres Windows service is running (`services.msc` ➔ `postgresql-x64-xx`).

### 3. `Port 8080 or Port 3000 already in use`
* **Cause:** A previous instance is still running in the background.
* **Fix:** In PowerShell, find and terminate the process holding the port:
  ```powershell
  # Find PID on port 8080
  netstat -ano | findstr :8080
  # Kill the process by PID
  taskkill /PID <PID_NUMBER> /F
  ```

---

*Enjoy developing on the **Course & Attendance Management System**!*
