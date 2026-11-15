import React, { useState, useEffect, useCallback } from 'react';
import { FileBarChart, Download, Calendar, User, Search, CheckCircle, AlertTriangle } from 'lucide-react';
import { attendanceApi } from '../../api/timetableAndAttendanceApi';
import { academicSessionApi, collegeApi } from '../../api/institutionalApi';
import { studentApi } from '../../api/peopleApi';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { getErrorMessage } from '../../api/axiosClient';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export function AttendanceReportsPage() {
  const { user, isStudent, isAdmin, isFaculty } = useAuth();

  const [colleges, setColleges] = useState([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState('');
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');

  // Faculty / Admin student search
  const [targetStudentId, setTargetStudentId] = useState('');
  const [studentsList, setStudentsList] = useState([]);

  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const cData = await collegeApi.getAll();
        setColleges(cData || []);
        if (cData && cData.length > 0) setSelectedCollegeId(String(cData[0].id));
      } catch (e) {}
    };
    init();
  }, []);

  useEffect(() => {
    if (!selectedCollegeId) return;
    const loadSessions = async () => {
      try {
        const [sessData, stuData] = await Promise.all([
          academicSessionApi.getByCollege(selectedCollegeId),
          studentApi.getByCollege(selectedCollegeId),
        ]);
        setSessions(sessData || []);
        setStudentsList(stuData || []);
        if (sessData && sessData.length > 0) {
          const curr = sessData.find((s) => s.current) || sessData[0];
          setSelectedSessionId(String(curr.id));
        }
      } catch (e) {}
    };
    loadSessions();
  }, [selectedCollegeId]);

  const fetchSummary = useCallback(async () => {
    if (!selectedSessionId) return;
    setLoading(true);
    try {
      let data = [];
      if (isStudent) {
        data = await attendanceApi.getMyAttendanceSummary(Number(selectedSessionId));
      } else if (targetStudentId) {
        data = await attendanceApi.getStudentAttendanceSummary(
          Number(targetStudentId),
          Number(selectedSessionId)
        );
      }
      setSummaries(data || []);
    } catch (err) {
      console.warn('Summary fetch error:', err);
      setSummaries([]);
    } finally {
      setLoading(false);
    }
  }, [selectedSessionId, isStudent, targetStudentId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleExportCsv = () => {
    if (summaries.length === 0) return;
    const headers = ['Subject Code', 'Subject Name', 'Total Classes', 'Attended Classes', 'Percentage'];
    const rows = summaries.map((s) => [
      s.subjectCode,
      `"${s.subjectName}"`,
      s.totalClasses,
      s.attendedClasses,
      `${s.attendancePercentage}%`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attendance_report_session_${selectedSessionId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Reports & Summary"
        subtitle="Subject-wise percentage breakdown, lecture statistics, and compliance tracking."
        actions={
          summaries.length > 0 && (
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          )
        }
      />

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-3">
        {isAdmin && colleges.length > 0 && (
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">College</label>
            <select
              value={selectedCollegeId}
              onChange={(e) => setSelectedCollegeId(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {colleges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Academic Session</label>
          <select
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} {s.current ? '(Current Term)' : ''}
              </option>
            ))}
          </select>
        </div>

        {!isStudent && (
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Filter by Student</label>
            <select
              value={targetStudentId}
              onChange={(e) => setTargetStudentId(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">Select a Student...</option>
              {studentsList.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.firstName} {st.lastName} ({st.enrollmentNumber})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <LoadingSpinner text="Computing attendance percentages..." />
      ) : summaries.length === 0 ? (
        <EmptyState
          icon={FileBarChart}
          title="No Attendance Summary Found"
          description={
            isStudent
              ? 'No attendance records have been registered for your enrolled subjects in this term.'
              : 'Select a student to view their subject attendance summary.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {summaries.map((s) => {
            const isEligible = s.attendancePercentage >= 75;
            return (
              <div
                key={s.subjectId}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      {s.subjectCode}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isEligible
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {isEligible ? (
                        <>
                          <CheckCircle className="w-3 h-3" /> Eligible
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3" /> Shortage
                        </>
                      )}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-1">
                    {s.subjectName}
                  </h3>

                  {/* Percentage Progress Bar */}
                  <div className="mt-5">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        {Math.round(s.attendancePercentage)}%
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {s.attendedClasses} / {s.totalClasses} Lectures
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isEligible ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(s.attendancePercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                  Minimum 75% required for examination eligibility
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
