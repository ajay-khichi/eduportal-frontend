import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  FolderTree,
  CalendarDays,
  GraduationCap,
  BookOpen,
  Layers,
  Users,
  UserCheck,
  UserPlus,
  BookMarked,
  Clock,
  QrCode,
  ScanFace,
  FileBarChart,
  UserCircle,
  X,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { cn } from '../../utils/cn';

export function Sidebar({ isOpen, onClose }) {
  const { user, isSuperAdmin, isCollegeAdmin, isFaculty, isStudent } = useAuth();
  const isAdmin = isSuperAdmin || isCollegeAdmin;

  const linkClass = ({ isActive }) =>
    cn(
      'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150',
      isActive
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
    );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-xs shadow-md shadow-indigo-500/20">
              EP
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
                EduPortal
              </span>
              <p className="text-[10px] text-slate-400 font-medium">Enterprise ERP v2</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* Main Group */}
          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Overview
            </p>
            <nav className="space-y-1">
              <NavLink to="/" end className={linkClass} onClick={onClose}>
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </NavLink>
            </nav>
          </div>

          {/* Student Specific */}
          {isStudent && (
            <div>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Student Portal
              </p>
              <nav className="space-y-1">
                <NavLink to="/attendance/check-in" className={linkClass} onClick={onClose}>
                  <QrCode className="w-4 h-4 text-emerald-500" />
                  <span>Smart Check-In</span>
                </NavLink>
                <NavLink to="/timetable" className={linkClass} onClick={onClose}>
                  <Clock className="w-4 h-4" />
                  <span>My Timetable</span>
                </NavLink>
                <NavLink to="/attendance/reports" className={linkClass} onClick={onClose}>
                  <FileBarChart className="w-4 h-4" />
                  <span>Attendance Summary</span>
                </NavLink>
                <NavLink to="/face-profile" className={linkClass} onClick={onClose}>
                  <ScanFace className="w-4 h-4" />
                  <span>Biometric Face Profile</span>
                </NavLink>
              </nav>
            </div>
          )}

          {/* Faculty Specific */}
          {isFaculty && (
            <div>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Faculty Portal
              </p>
              <nav className="space-y-1">
                <NavLink to="/attendance/live" className={linkClass} onClick={onClose}>
                  <QrCode className="w-4 h-4 text-indigo-500" />
                  <span>Live Smart Attendance</span>
                </NavLink>
                <NavLink to="/timetable" className={linkClass} onClick={onClose}>
                  <Clock className="w-4 h-4" />
                  <span>Schedule & Timetable</span>
                </NavLink>
                <NavLink to="/teaching-assignments" className={linkClass} onClick={onClose}>
                  <BookMarked className="w-4 h-4" />
                  <span>My Teaching Load</span>
                </NavLink>
                <NavLink to="/attendance/reports" className={linkClass} onClick={onClose}>
                  <FileBarChart className="w-4 h-4" />
                  <span>Attendance Records</span>
                </NavLink>
              </nav>
            </div>
          )}

          {/* Institutional Structure (Admin) */}
          {isAdmin && (
            <div>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Institution Structure
              </p>
              <nav className="space-y-1">
                {isSuperAdmin && (
                  <NavLink to="/colleges" className={linkClass} onClick={onClose}>
                    <Building2 className="w-4 h-4" />
                    <span>Colleges</span>
                  </NavLink>
                )}
                <NavLink to="/departments" className={linkClass} onClick={onClose}>
                  <FolderTree className="w-4 h-4" />
                  <span>Departments</span>
                </NavLink>
                <NavLink to="/academic-sessions" className={linkClass} onClick={onClose}>
                  <CalendarDays className="w-4 h-4" />
                  <span>Academic Sessions</span>
                </NavLink>
                <NavLink to="/programs" className={linkClass} onClick={onClose}>
                  <GraduationCap className="w-4 h-4" />
                  <span>Programs</span>
                </NavLink>
              </nav>
            </div>
          )}

          {/* Academic Curriculum & Batches (Admin / Faculty) */}
          {isAdmin && (
            <div>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Curriculum & Sections
              </p>
              <nav className="space-y-1">
                <NavLink to="/subjects" className={linkClass} onClick={onClose}>
                  <BookOpen className="w-4 h-4" />
                  <span>Subjects</span>
                </NavLink>
                <NavLink to="/sections" className={linkClass} onClick={onClose}>
                  <Layers className="w-4 h-4" />
                  <span>Sections / Batches</span>
                </NavLink>
                <NavLink to="/timetable" className={linkClass} onClick={onClose}>
                  <Clock className="w-4 h-4" />
                  <span>Timetable Management</span>
                </NavLink>
                <NavLink to="/attendance/live" className={linkClass} onClick={onClose}>
                  <QrCode className="w-4 h-4" />
                  <span>Live Attendance Sessions</span>
                </NavLink>
                <NavLink to="/attendance/reports" className={linkClass} onClick={onClose}>
                  <FileBarChart className="w-4 h-4" />
                  <span>Attendance Audit</span>
                </NavLink>
              </nav>
            </div>
          )}

          {/* People & Roles (Admin) */}
          {isAdmin && (
            <div>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                People & Allocations
              </p>
              <nav className="space-y-1">
                <NavLink to="/students" className={linkClass} onClick={onClose}>
                  <Users className="w-4 h-4" />
                  <span>Students</span>
                </NavLink>
                <NavLink to="/faculty" className={linkClass} onClick={onClose}>
                  <UserCheck className="w-4 h-4" />
                  <span>Faculty</span>
                </NavLink>
                <NavLink to="/enrollments" className={linkClass} onClick={onClose}>
                  <UserPlus className="w-4 h-4" />
                  <span>Section Enrollments</span>
                </NavLink>
                <NavLink to="/teaching-assignments" className={linkClass} onClick={onClose}>
                  <BookMarked className="w-4 h-4" />
                  <span>Teaching Allocations</span>
                </NavLink>
              </nav>
            </div>
          )}

          {/* System & Account */}
          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Settings & Account
            </p>
            <nav className="space-y-1">
              <NavLink to="/profile" className={linkClass} onClick={onClose}>
                <UserCircle className="w-4 h-4" />
                <span>Account & Security</span>
              </NavLink>
            </nav>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-400 font-medium">EduPortal v2 · Spring Boot 4.1</p>
        </div>
      </aside>
    </>
  );
}
