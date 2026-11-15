import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, XCircle, RefreshCw, UserCheck, UserX, ShieldCheck, Clock } from 'lucide-react';
import { attendanceApi } from '../../api/timetableAndAttendanceApi';
import { StatusBadge } from '../common/Badge';
import { formatTime, formatDateTime } from '../../utils/formatters';
import { getErrorMessage } from '../../api/axiosClient';
import toast from 'react-hot-toast';

export function AttendanceRoster({ classSessionId, classSession }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStudentId, setUpdatingStudentId] = useState(null);

  const fetchRoster = useCallback(async () => {
    try {
      const data = await attendanceApi.getClassAttendance(classSessionId);
      setRecords(data || []);
    } catch (err) {
      console.warn('Failed to load roster:', err);
    } finally {
      setLoading(false);
    }
  }, [classSessionId]);

  useEffect(() => {
    fetchRoster();
    const interval = setInterval(fetchRoster, 5000); // 5-second polling for live check-in updates
    return () => clearInterval(interval);
  }, [fetchRoster]);

  const handleManualOverride = async (studentId, currentStatus) => {
    const newStatus = currentStatus === 'PRESENT' ? 'ABSENT' : 'PRESENT';
    setUpdatingStudentId(studentId);
    try {
      await attendanceApi.markManual(classSessionId, {
        studentId,
        status: newStatus,
      });
      toast.success(`Marked as ${newStatus}`);
      await fetchRoster();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdatingStudentId(null);
    }
  };

  const presentCount = records.filter((r) => r.status === 'PRESENT').length;
  const totalCount = records.length;
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Roster Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Attendance Roster</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
              {presentCount} / {totalCount} Present ({attendanceRate}%)
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Auto-syncing every 5 seconds with live student scans
          </p>
        </div>

        <button
          onClick={fetchRoster}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 self-start sm:self-auto transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          Refresh List
        </button>
      </div>

      {/* Roster Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="px-5 py-3.5">Student</th>
              <th className="px-4 py-3.5">Enrollment #</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">QR Verified</th>
              <th className="px-4 py-3.5">Face Verified</th>
              <th className="px-4 py-3.5">Timestamp</th>
              <th className="px-5 py-3.5 text-right">Faculty Override</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {records.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                  No attendance records found yet for this class session.
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr key={r.id || r.studentId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                  <td className="px-5 py-3 text-slate-900 dark:text-white font-semibold">
                    {r.studentName || 'Student'}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono">
                    {r.enrollmentNumber || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3">
                    {r.qrVerified ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" /> Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400">
                        <XCircle className="w-4 h-4" /> No
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {r.faceVerified ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="w-4 h-4" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400">
                        <XCircle className="w-4 h-4" /> No
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    {r.markedAt ? formatDateTime(r.markedAt) : '—'}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      disabled={updatingStudentId === r.studentId}
                      onClick={() => handleManualOverride(r.studentId, r.status)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                        r.status === 'PRESENT'
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 hover:bg-emerald-100'
                      }`}
                    >
                      {updatingStudentId === r.studentId ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : r.status === 'PRESENT' ? (
                        <>
                          <UserX className="w-3 h-3" /> Mark Absent
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3 h-3" /> Mark Present
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
