# 🎓 Placement Portal

A modern, feature-rich, and robust **Placement Management System** designed to streamline and automate the entire campus recruitment process. The system connects **Students**, **Recruiters (Companies)**, and **Faculty/Placement Coordinators (Admins)** into a unified, responsive platform.

---

## 🚀 Key Features by User Role

### 👨‍🎓 1. Student Portal
* **Dashboard & Applications:** Track application status (Applied, Shortlisted, Offered, etc.) in real time.
* **Placement Drives:** View active job opportunities and eligibility criteria (CGPA, maximum backlogs, allowed departments, and graduation year).
* **Eligibility Engine:** Automatic validation checks if the student meets criteria before allowing them to apply.
* **Bookmarks:** Save placement listings to apply later.
* **Profile Management:** Maintain contact details, CGPA, graduation year, resume uploads, and LinkedIn/Portfolio links.

### 🏢 2. Recruiter Portal
* **Company Profiles:** Showcase company details, industry, logo, and description (subject to Admin approval).
* **Job Management:** Post, edit, and close job opportunities with specific CGPA, backlog, and department filters.
* **Applicant Tracking:** View and filter applicants, download resumes, and advance candidates through a structured hiring workflow.
* **Status Updates:** Update applicant statuses from `Applied` to `Shortlisted`, `Offered`, `Rejected`, or track student responses (`Offer Accepted`, `Offer Declined`).

### 🏫 3. Faculty / Placement Coordinator (Admin) Portal
* **Overview Dashboard:** Centralized view of overall recruitment analytics, active jobs, and student participation.
* **Recruiter Approval:** Verify and approve new recruiter accounts to ensure security and validity.
* **Job Verification:** Oversee job listings, create official placements, and edit details.
* **Activity & Audit Logs:** Monitor critical system actions (e.g., job postings, status updates, registrations) to maintain transparency.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React.js (Vite) | Fast, responsive Single Page Application (SPA) utilizing modern hooks. |
| **Styling** | Vanilla CSS | Fully custom, harmonized design system with responsive layouts and interactive effects. |
| **Backend** | Django & Django REST Framework | Robust API gateway, built-in ORM, secure authentication, and admin utilities. |
| **Database** | PostgreSQL | Enterprise-grade relational database storing relational schemas. |
| **Authentication** | JSON Web Tokens (SimpleJWT) | Stateless, secure user sessions via access/refresh token rotation. |
| **Static Hosting** | WhiteNoise | Efficient static asset serving for production deployments. |

---

## 📂 Repository Directory Structure

```text
Placement-Portal/
├── backend_django/            # Django Backend Project
│   └── backend/
│       ├── activitylog/       # Tracks logs and actions
│       ├── api/               # Authentication endpoints, Custom User Model, seed commands
│       ├── applications/      # Student job application logic & history tracking
│       ├── bookmarks/         # Job bookmarking functionality
│       ├── companies/         # Recruiter profiles and registration endpoints
│       ├── placements/        # Placement listing models and eligibility engine
│       ├── students/          # Student profile models and details
│       ├── backend/           # Core settings, WSGI, URLs configuration
│       ├── manage.py          # Django management command CLI
│       └── requirements.txt   # Python package dependencies
│
├── frontend_react/            # React Frontend Application
│   ├── src/
│   │   ├── components/        # Reusable UI elements (Buttons, Inputs, Cards)
│   │   ├── contexts/          # React context providers (AuthContext)
│   │   ├── pages/             # Route-specific views (Admin, Student, Recruiter, Login, Landing)
│   │   ├── router/            # React Router paths & route guards
│   │   ├── styles/            # Vanilla CSS styling files
│   │   └── utils/             # Axios instance configurations and utility helpers
│   ├── package.json           # Node.js dependencies and scripts
│   └── vite.config.js         # Vite configuration settings
│
├── run.ps1                    # Windows PowerShell script to start both services
└── Makefile                   # Unix/Git Bash make target script
```

---

## 🔑 Demo & Testing Credentials

Use the following pre-configured credentials to log in and test the portal:

> [!IMPORTANT]
> The database has been populated with mock data for various roles. Use these logins in the **Sign In** interface.

### 🏫 Faculty / Placement Coordinator (Admin)
* **Email:** `admin@gmail.com`
* **Password:** `Admin@123`
* **Dashboard URL:** `/admin/dashboard`

### 👨‍🎓 Student
* **Email:** `student0001@perf.local`
* **Password:** `PerfTest123!`
* **Dashboard URL:** `/student/dashboard`
* *(Note: Additional student accounts range from `student0001@perf.local` to `student0120@perf.local` using the same password)*

### 🏢 Recruiter (Company)
* **Email:** `recruiter001@perf.local`
* **Password:** `PerfTest123!`
* **Dashboard URL:** `/company/dashboard`
* *(Note: Additional recruiter accounts range from `recruiter001@perf.local` to `recruiter010@perf.local` using the same password)*

---

## ⚙️ Local Installation & Setup

### Prerequisites
* Python `3.10` or higher
* Node.js `18` or higher
* PostgreSQL installed and running

### 1. Environment and Database Configuration
1. Copy the `.env.example` file to `.env` inside `backend_django/backend`:
   ```bash
   cp backend_django/backend/.env.example backend_django/backend/.env
   ```
2. Create a PostgreSQL database and user. In your PostgreSQL terminal:
   ```sql
   CREATE DATABASE placement_portal;
   CREATE USER placement_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE placement_portal TO placement_user;
   ALTER USER placement_user CREATEDB;
   ```
3. Open your newly created `.env` file and update the database configuration:
   ```env
   DB_NAME=placement_portal
   DB_USER=placement_user
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432
   ```
   *Note: If these database environment variables are not provided in your `.env` file, the application falls back to the local defaults defined in `settings.py`.*


---

### 2. Backend Setup (Django)
1. Navigate to the backend directory:
   ```bash
   cd backend_django/backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   # Windows (CMD or PowerShell)
   python -m venv venv
   .\venv\Scripts\activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install package dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run Django database migrations:
   ```bash
   python manage.py migrate
   ```
5. Seed database with performance test data (Students, Recruiters, and Placement listings):
   ```bash
   python manage.py seed_performance_data
   ```
6. Start the backend development server:
   ```bash
   python manage.py runserver
   ```
   *The backend API will run on **`http://127.0.0.1:8000/`**.*

---

### 3. Frontend Setup (React)
1. Navigate to the frontend directory:
   ```bash
   cd ../../frontend_react
   ```
2. Install Node packages:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend application will be accessible at **`http://localhost:5173/`**.*

---

## 🏁 Quick Start: Running Both Services Simultaneously

### Windows (PowerShell)
You can launch both the React frontend and Django backend servers in separate Windows command windows by running:
```powershell
./run.ps1
```

### macOS / Linux (Makefile)
To launch both services in your terminal, run:
```bash
make dev
```

---

## 🧪 Database Seeding CLI Options

The `seed_performance_data` command is highly customizable. You can adjust the quantity of generated mock records by running:
```bash
python manage.py seed_performance_data --students 150 --recruiters 15 --jobs-per-recruiter 5
```
* **`--students`** (default: `120`): Number of mock student profiles.
* **`--recruiters`** (default: `10`): Number of mock recruiter profiles.
* **`--jobs-per-recruiter`** (default: `4`): Number of jobs posted by each recruiter.
* **`--password`** (default: `PerfTest123!`): Shared password assigned to all seeded mock users.
* **`--append`**: Retain previous data instead of clearing database tables before seeding.
