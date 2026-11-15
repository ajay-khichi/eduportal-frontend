import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  FolderTree,
  CalendarDays,
  GraduationCap,
  Users,
  UserCheck,
  Clock,
  QrCode,
  ScanFace,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import useAuth from '../../hooks/useAuth';
import { StatCard } from '../../components/common/StatCard';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/Badge';
import { formatTime, formatDate, formatRole } from '../../utils/formatters';
import { collegeApi, departmentApi, academicSessionApi } from '../../api/institutionalApi';
import { studentApi, facultyApi, teachingAssignmentApi } from '../../api/peopleApi';
import { classSessionApi, attendanceApi, faceProfileApi } from '../../api/timetableAndAttendanceApi';

export function DashboardOverview() {
  const { user, isSuperAdmin, isCollegeAdmin, isFaculty, isStudent } = useAuth();
  const isAdmin = isSuperAdmin || isCollegeAdmin;
  const navigate = useNavigate();

  // State for Admin metrics
  const [adminStats, setAdminStats] = useState({
    colleges: 0,
    departments: 0,
    students: 0,
    faculty: 0,
    sessions: 0,
  });

  // State for Faculty & Student
  const [todayClasses, setTodayClasses] = useState([]);
  const [faceRegistered, setFaceRegistered] = useState(false);
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      setLoading(true);
      try {
        if (isAdmin) {
          try {
            const colleges = await collegeApi.getAll();
            if (isMounted) {
              setAdminStats((prev) => ({ ...prev, colleges: colleges.length }));
            }
          } catch (e) {}

          // Load other counts gracefully
        }

        if (isFaculty) {
          // If faculty has userId, load assignments
          if (user?.id) {
            try {
              const assignments = await teachingAssignmentApi.getByFaculty(user.id);
              if (assignments && assignments.length > 0) {
                const today = new Date().toISOString().split('T')[0];
                const timetable = await classSessionApi.getFacultyTimetable(user.id, today, today);
                if (isMounted) setTodayClasses(timetable || []);
              }
            } catch (e) {}
          }
        }

        if (isStudent) {
          // Check face profile
          try {
            const profile = await faceProfileApi.getMyFaceProfile();
            if (isMounted && profile?.active) {
              setFaceRegistered(true);
            }
          } catch (e) {
            if (isMounted) setFaceRegistered(false);
          }

          // Fetch attendance summary
          try {
            // Default session id = 1 or search current
            const summary = await attendanceApi.getMyAttendanceSummary(1);
            if (isMounted) setAttendanceSummary(summary || []);
          } catch (e) {}
        }
      } catch (err) {
        console.warn('Dashboard load err:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [isAdmin, isFaculty, isStudent, user]);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Active Session · {formatRole(user?.role)}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.email?.split('@')[0]}
          </h1>
          <p className="mt-2 text-sm text-indigo-100/80 leading-relaxed">
            EduPortal v2 Smart Attendance & Academic ERP system is live with rolling QR cryptography, GPS geofencing, and biometric facial vector processing.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {isStudent && (
              <>
                <Link
                  to="/attendance/check-in"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  Launch Smart Check-In
                </Link>
                {!faceRegistered && (
                  <Link
                    to="/face-profile"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600/60 hover:bg-indigo-600 text-white font-bold text-xs border border-indigo-400/30 transition flex items-center gap-2"
                  >
                    <ScanFace className="w-4 h-4 text-amber-300" />
                    Register Face Profile
                  </Link>
                )}
              </>
            )}

            {isFaculty && (
              <Link
                to="/attendance/live"
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-lg transition flex items-center gap-2"
              >
                <QrCode className="w-4 h-4 text-indigo-600" />
                Launch Live Attendance QR
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/timetable"
                className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Manage Timetable & Sessions
              </Link>
            )}
          </div>
        </div>

        {/* Decorative corner orb */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ADMIN METRICS */}
      {isAdmin && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {isSuperAdmin && (
              <StatCard
                title="Colleges Registered"
                value={adminStats.colleges || '1+'}
                subtitle="Multi-campus isolation"
                icon={Building2}
                color="indigo"
              />
            )}
            <StatCard
              title="Academic Subsystems"
              value="Multi-Dept"
              subtitle="Programs & Sessions active"
              icon={FolderTree}
              color="emerald"
            />
            <StatCard
              title="Attendance Model"
              value="3-Factor"
              subtitle="QR + Geofence + Biometrics"
              icon={QrCode}
              color="purple"
            />
            <StatCard
              title="Token Security"
              value="SHA-256"
              subtitle="Single-use refresh rotation"
              icon={CheckCircle2}
              color="amber"
            />
          </div>

          {/* Quick Admin Actions Grid */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Institutional Admin Hub
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {isSuperAdmin && (
                <Link
                  to="/colleges"
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition flex flex-col items-center text-center gap-2"
                >
                  <Building2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Colleges</span>
                </Link>
              )}
              <Link
                to="/departments"
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition flex flex-col items-center text-center gap-2"
              >
                <FolderTree className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Departments</span>
              </Link>
              <Link
                to="/academic-sessions"
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition flex flex-col items-center text-center gap-2"
              >
                <CalendarDays className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Academic Terms</span>
              </Link>
              <Link
                to="/programs"
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition flex flex-col items-center text-center gap-2"
              >
                <GraduationCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Degree Programs</span>
              </Link>
              <Link
                to="/students"
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition flex flex-col items-center text-center gap-2"
              >
                <Users className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Students</span>
              </Link>
              <Link
                to="/faculty"
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition flex flex-col items-center text-center gap-2"
              >
                <UserCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Faculty</span>
              </Link>
              <Link
                to="/timetable"
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition flex flex-col items-center text-center gap-2"
              >
                <Clock className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Timetable</span>
              </Link>
              <Link
                to="/attendance/reports"
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition flex flex-col items-center text-center gap-2"
              >
                <TrendingUp className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Audit Reports</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT PORTAL WIDGETS */}
      {isStudent && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Biometric Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Biometric Profile
                </span>
                <ScanFace className="w-5 h-5 text-indigo-500" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                Facial Vector Status
              </h4>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                {faceRegistered
                  ? 'Your 128D biometric face embedding is registered and verified for attendance matching.'
                  : 'You have not registered your face profile yet. Attendance check-in requires a valid face vector.'}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              {faceRegistered ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> Enrolled
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-500">
                  <AlertCircle className="w-4 h-4" /> Pending Action
                </span>
              )}
              <Link
                to="/face-profile"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                {faceRegistered ? 'Update Face' : 'Enroll Face Now'} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Attendance Chart Widget */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Subject Attendance Summary
                </h4>
                <p className="text-xs text-slate-500">Attendance percentages across current term</p>
              </div>
              <Link
                to="/attendance/reports"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Full Breakdown
              </Link>
            </div>

            {attendanceSummary.length > 0 ? (
              <div className="h-48 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceSummary} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="subjectCode" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                    <Tooltip
                      formatter={(val) => [`${val}%`, 'Attendance']}
                      contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                    />
                    <Bar dataKey="attendancePercentage" radius={[6, 6, 0, 0]}>
                      {attendanceSummary.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.attendancePercentage >= 75 ? '#10b981' : '#f43f5e'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-center text-slate-400">
                <CalendarDays className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs">No attendance metrics recorded for current academic session yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FACULTY PORTAL WIDGETS */}
      {isFaculty && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Today's Teaching Schedule
                </h3>
                <p className="text-xs text-slate-500">Live lecture status & smart attendance controls</p>
              </div>
              <Link
                to="/timetable"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                Full Timetable <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {todayClasses.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                <Clock className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  No classes scheduled for today.
                </p>
                <Link
                  to="/timetable"
                  className="mt-3 inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                >
                  Schedule Next Lecture
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {todayClasses.map((cls) => (
                  <div
                    key={cls.id}
                    className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {cls.subjectCode}
                        </span>
                        <StatusBadge status={cls.status} />
                      </div>
                      <h5 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                        {cls.subjectName}
                      </h5>
                      <p className="text-xs text-slate-500 mt-1">
                        Section: {cls.sectionName} · {formatTime(cls.startTime)} – {formatTime(cls.endTime)}
                      </p>
                    </div>

                    <button
                      onClick={() => navigate(`/attendance/live?classId=${cls.id}`)}
                      className="mt-4 w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition flex items-center justify-center gap-1.5"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      Open Live QR Session
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
