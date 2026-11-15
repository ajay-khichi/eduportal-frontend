import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardOverview } from './pages/dashboard/DashboardOverview';

// Institutional
import { CollegesPage } from './pages/institutional/CollegesPage';
import { DepartmentsPage } from './pages/institutional/DepartmentsPage';
import { AcademicSessionsPage } from './pages/institutional/AcademicSessionsPage';
import { ProgramsPage } from './pages/institutional/ProgramsPage';

// Curriculum
import { SubjectsPage } from './pages/curriculum/SubjectsPage';
import { SectionsPage } from './pages/curriculum/SectionsPage';

// People
import { StudentsPage } from './pages/people/StudentsPage';
import { FacultyPage } from './pages/people/FacultyPage';
import { EnrollmentsPage } from './pages/people/EnrollmentsPage';
import { TeachingAssignmentsPage } from './pages/people/TeachingAssignmentsPage';

// Timetable & Attendance
import { TimetablePage } from './pages/timetable/TimetablePage';
import { FacultyAttendanceLivePage } from './pages/attendance/FacultyAttendanceLivePage';
import { StudentCheckInPage } from './pages/attendance/StudentCheckInPage';
import { AttendanceReportsPage } from './pages/attendance/AttendanceReportsPage';

// Profile
import { ProfilePage } from './pages/profile/ProfilePage';
import { BiometricEnrollmentPage } from './pages/profile/BiometricEnrollmentPage';
import { NotFoundPage } from './pages/not-found/NotFoundPage';

export default function App() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardOverview />} />

        {/* Super Admin only */}
        <Route
          path="/colleges"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <CollegesPage />
            </ProtectedRoute>
          }
        />

        {/* Admins (Super Admin & College Admin) */}
        <Route
          path="/departments"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'COLLEGE_ADMIN']}>
              <DepartmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/academic-sessions"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'COLLEGE_ADMIN']}>
              <AcademicSessionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/programs"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'COLLEGE_ADMIN']}>
              <ProgramsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subjects"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'COLLEGE_ADMIN']}>
              <SubjectsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sections"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'COLLEGE_ADMIN']}>
              <SectionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'COLLEGE_ADMIN']}>
              <StudentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'COLLEGE_ADMIN']}>
              <FacultyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/enrollments"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'COLLEGE_ADMIN', 'FACULTY']}>
              <EnrollmentsPage />
            </ProtectedRoute>
          }
        />

        {/* Faculty & Admin */}
        <Route
          path="/teaching-assignments"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'COLLEGE_ADMIN', 'FACULTY']}>
              <TeachingAssignmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/live"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'COLLEGE_ADMIN', 'FACULTY']}>
              <FacultyAttendanceLivePage />
            </ProtectedRoute>
          }
        />

        {/* Student Specific */}
        <Route
          path="/attendance/check-in"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentCheckInPage />
            </ProtectedRoute>
          }
        />

        {/* Shared Authenticated Routes */}
        <Route path="/timetable" element={<TimetablePage />} />
        <Route path="/attendance/reports" element={<AttendanceReportsPage />} />
        <Route path="/face-profile" element={<BiometricEnrollmentPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
