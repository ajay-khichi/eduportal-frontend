import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, User, QrCode, Play, CheckCircle } from 'lucide-react';
import { StatusBadge } from '../common/Badge';
import { formatTime, formatDate } from '../../utils/formatters';
import useAuth from '../../hooks/useAuth';

export function TimetableGrid({ classes = [], onStatusChange }) {
  const { isFaculty, isStudent, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Group classes by date
  const groupedByDate = classes.reduce((acc, c) => {
    const key = c.classDate || 'No Date';
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  const dates = Object.keys(groupedByDate).sort();

  if (classes.length === 0) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
        <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No scheduled classes found</p>
        <p className="text-xs text-slate-400 mt-1">Check back later or adjust the date filter.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {dates.map((d) => (
        <div key={d} className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              {formatDate(d)}
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedByDate[d].map((c) => (
              <div
                key={c.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {c.subjectCode || 'SUB'}
                    </span>
                    <StatusBadge status={c.status} />
                  </div>

                  <h5 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                    {c.subjectName}
                  </h5>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                      <span>
                        {formatTime(c.startTime)} – {formatTime(c.endTime)}
                      </span>
                    </div>

                    {c.room && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span>Room: {c.room}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      <span>Prof. {c.facultyName}</span>
                    </div>

                    {c.sectionName && (
                      <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 pt-1">
                        Section: {c.sectionName} (Sem {c.semester})
                      </div>
                    )}
                  </div>
                </div>

                {/* Card footer action */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  {isFaculty || isAdmin ? (
                    <button
                      onClick={() => navigate(`/attendance/live?classId=${c.id}`)}
                      className="w-full py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition flex items-center justify-center gap-1.5"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      Host Attendance
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/attendance/check-in')}
                      className="w-full py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold text-xs hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Check In Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
