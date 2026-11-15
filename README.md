# 🎓 EduPortal Frontend v2 — Production Grade Web Application

> **Production-grade React.js Frontend** for the EduPortal v2 Enterprise Smart Attendance & Academic ERP Backend (`Spring Boot 4.1.1` / Java 17 LTS).

---

## ⚡ Key Highlights & Subsystems

1. **Dual-Token Authentication with Silent Refresh**
   - Stateless JWT dual-token architecture (15-min Access Token + 30-day SHA-256 rotated Refresh Token).
   - Transparent Axios response interceptor that intercepts `401 Unauthorized`, queues in-flight requests, calls `POST /api/auth/refresh`, and replays requests without user interruption.
   - Comprehensive multi-device session revocation (`POST /api/users/sessions/revoke-all`).

2. **3-Factor Smart Attendance Verification Engine**
   - **Factor 1: Rolling Cryptographic QR Code**
     - Faculty broadcasts encrypted rolling QR tokens (`GET /api/attendance-sessions/{id}/qr-token`) with animated circular countdown and automatic 5-second interval rotation.
     - Student camera scanner (`html5-qrcode`) with real-time frame detection, audio beep, and manual payload entry fallback.
     - Server challenge validation (`POST /api/attendance/verify-qr`).
   - **Factor 2: GPS Geofencing**
     - High-precision HTML5 Geolocation API with Haversine spherical distance calculation (accuracy up to 10m-2000m classroom radius).
   - **Factor 3: Facial Biometrics (Cosine Similarity)**
     - In-browser live webcam capture (`react-webcam`) with oval facial alignment guide.
     - Extraction of standardized 128-dimensional normalized facial embedding vectors (`generateFaceEmbeddingFromCanvas`).
     - Real-time cosine similarity matching with student's enrolled biometric profile (`POST /api/attendance/complete`).

3. **Academic ERP & Institutional Multi-Tenancy**
   - **Colleges & Autonomous Campuses:** Multi-tenant isolation, college administrators (`SUPER_ADMIN`).
   - **Departments & Leadership:** Department management and Head of Department (HOD) allocations.
   - **Academic Sessions & Semesters:** Term scheduling with active current term markers.
   - **Programs & Syllabi:** Degree programs (B.Tech, MCA, etc.), semester course credits, and course codes.
   - **Sections & Cohorts:** Student section allocation, bulk student enrollment, and single student enrollments.
   - **Timetable & Scheduling:** Single lecture scheduling and recurring weekly timetable generator with classroom allocation.
   - **Live Attendance Roster:** Live WebSocket/Polling attendee stream with instant faculty manual override (`PRESENT` / `ABSENT`).

4. **Role-Based Access Control (RBAC)**
   - `SUPER_ADMIN`: Institutional superuser, full multi-college CRUD, global allocations.
   - `COLLEGE_ADMIN`: Departmental, curriculum, and academic term administration.
   - `FACULTY`: Assigned sections, lecture schedule, rolling QR code host, manual overrides.
   - `STUDENT`: Class timetable, smart check-in, attendance percentages, and biometric registration.

---

## 🛠️ Tech Stack & Dependencies

| Category | Technology |
|---|---|
| **Build & Bundler** | [Vite 6](https://vitejs.dev/) with optimized manual chunk splitting |
| **Framework** | [React 18](https://react.dev/) |
| **Routing** | [React Router v6](https://reactrouter.com/) |
| **Styling & Theme** | [Tailwind CSS 3](https://tailwindcss.com/) with Dark / Light Mode |
| **HTTP Client** | [Axios](https://axios-http.com/) with Auth & 401 Interceptors |
| **QR Code Engine** | [qrcode.react](https://github.com/zpao/qrcode.react) (Faculty Rolling QR) & [html5-qrcode](https://github.com/mebjas/html5-qrcode) (Student Scanner) |
| **Camera & Biometrics**| [react-webcam](https://github.com/mozmorris/react-webcam) & Canvas 128D Vector Extraction |
| **Data Visualization** | [Recharts](https://recharts.org/) for attendance percentage gauges |
| **Icons** | [Lucide React](https://lucide.react.org) |
| **Notifications** | [React Hot Toast](https://react-hot-toast.com/) |
| **Date Formatting** | [date-fns](https://date-fns.org/) |

---

## 📁 Project Directory Structure

```
eduportal-frontend/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env / .env.example
├── src/
│   ├── api/
│   │   ├── axiosClient.js             # Central Axios instance with JWT refresh queue
│   │   ├── authApi.js                 # Auth endpoints & user account profiles
│   │   ├── institutionalApi.js        # Colleges, Departments, Programs, Sessions
│   │   ├── curriculumApi.js           # Subjects & Sections
│   │   ├── peopleApi.js               # Students, Faculty, Enrollments, Teaching Allocations
│   │   └── timetableAndAttendanceApi.js # Class Sessions, Rolling QR, Biometrics
│   ├── context/
│   │   ├── AuthContext.jsx            # User state, JWT claims decoding, RBAC checks
│   │   └── ThemeContext.jsx           # Dark / Light theme toggle with localStorage
│   ├── hooks/
│   │   ├── useAuth.js                 # Auth hook
│   │   ├── useGeolocation.js          # High-precision GPS locator hook
│   │   └── useInterval.js             # Interval timer hook
│   ├── components/
│   │   ├── common/                    # Navbar, Sidebar, ProtectedRoute, Modal, Badge, StatCard
│   │   ├── attendance/                # RollingQrDisplay, StudentQrScanner, StudentFaceVerifier, AttendanceRoster
│   │   └── timetable/                 # TimetableGrid, ScheduleClassModal
│   ├── layouts/
│   │   ├── DashboardLayout.jsx        # App shell with responsive sidebar & navbar
│   │   └── AuthLayout.jsx             # Card layout for login and self-registration
│   ├── pages/
│   │   ├── auth/                      # LoginPage, RegisterPage
│   │   ├── dashboard/                 # DashboardOverview (Role-Adaptive)
│   │   ├── institutional/             # CollegesPage, DepartmentsPage, AcademicSessionsPage, ProgramsPage
│   │   ├── curriculum/                # SubjectsPage, SectionsPage
│   │   ├── people/                    # StudentsPage, FacultyPage, EnrollmentsPage, TeachingAssignmentsPage
│   │   ├── timetable/                 # TimetablePage
│   │   ├── attendance/                # FacultyAttendanceLivePage, StudentCheckInPage, AttendanceReportsPage
│   │   ├── profile/                   # ProfilePage, BiometricEnrollmentPage
│   │   └── not-found/                 # NotFoundPage
│   └── utils/
│       ├── faceVector.js              # 128-dimensional facial embedding vector generator
│       ├── formatters.js              # Date, time, role and name formatters
│       └── cn.js                      # Tailwind classnames merger
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v18+` or `v20+` (tested on Node v24 LTS)
- **npm**: `v9+` or `v11+`
- **EduPortal Backend**: Running at `http://localhost:8080/api`

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default content:
```ini
VITE_API_BASE_URL=http://localhost:8080/api
```

### 3. Run Development Server
```bash
npm run dev
```
The application will launch at:
```
http://localhost:5173
```

### 4. Build for Production
```bash
npm run build
```
Optimized static bundles will be generated in `dist/`.

### 5. Preview Production Build
```bash
npm run preview
```
