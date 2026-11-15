import React, { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { RefreshCw, ShieldAlert, Timer, Radio, CheckCircle2 } from 'lucide-react';
import { attendanceApi } from '../../api/timetableAndAttendanceApi';
import { getErrorMessage } from '../../api/axiosClient';
import toast from 'react-hot-toast';

export function RollingQrDisplay({ sessionId, sessionDetails, onSessionStopped }) {
  const [token, setToken] = useState('');
  const [expiresIn, setExpiresIn] = useState(5);
  const [timeLeft, setTimeLeft] = useState(5);
  const [loading, setLoading] = useState(true);
  const [stopping, setStopping] = useState(false);
  const [error, setError] = useState(null);

  const fetchToken = useCallback(async () => {
    try {
      setError(null);
      const res = await attendanceApi.getRollingQrToken(sessionId);
      setToken(res.token);
      const seconds = res.expiresInSeconds || 5;
      setExpiresIn(seconds);
      setTimeLeft(seconds);
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // Initial fetch
  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  // Countdown and periodic refresh loop
  useEffect(() => {
    if (!token || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          fetchToken();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [token, timeLeft, fetchToken]);

  const handleStopSession = async () => {
    if (!window.confirm('Are you sure you want to close this attendance session? Students will no longer be able to check in.')) {
      return;
    }
    setStopping(true);
    try {
      await attendanceApi.stopSession(sessionId);
      toast.success('Attendance session closed successfully.');
      if (onSessionStopped) onSessionStopped();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setStopping(false);
    }
  };

  const progressPercent = expiresIn > 0 ? ((timeLeft / expiresIn) * 100) : 0;

  return (
    <div className="flex flex-col items-center bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
      {/* Live Badge & Details */}
      <div className="w-full flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Live QR Session Active
          </span>
        </div>

        {sessionDetails?.radiusMeters && (
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Geofence: <strong className="text-slate-700 dark:text-slate-300">{sessionDetails.radiusMeters}m</strong>
          </span>
        )}
      </div>

      {/* QR Code Presentation Box */}
      <div className="relative p-6 sm:p-8 bg-slate-900 rounded-3xl shadow-inner border border-slate-800 flex flex-col items-center justify-center">
        {loading && !token ? (
          <div className="w-64 h-64 flex flex-col items-center justify-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-400 mb-2" />
            <p className="text-xs">Generating encrypted rolling token...</p>
          </div>
        ) : error ? (
          <div className="w-64 h-64 flex flex-col items-center justify-center text-center p-4">
            <ShieldAlert className="w-10 h-10 text-rose-500 mb-2" />
            <p className="text-xs text-rose-400">{error}</p>
            <button
              onClick={fetchToken}
              className="mt-4 px-3 py-1.5 text-xs font-semibold bg-slate-800 text-white rounded-lg hover:bg-slate-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white p-4 rounded-2xl shadow-md">
              <QRCodeSVG
                value={token}
                size={240}
                level="H"
                includeMargin={false}
              />
            </div>

            {/* Rolling timer bar */}
            <div className="w-full mt-5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  Rolling Token
                </span>
                <span className="text-amber-400 font-mono text-sm">{timeLeft}s remaining</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </>
        )}
      </div>

      <p className="mt-4 text-xs text-center text-slate-500 dark:text-slate-400 max-w-sm">
        Display this rotating QR code to students. Each code is cryptographically dynamic and invalidates after {expiresIn} seconds.
      </p>

      {/* Stop Session Button */}
      <button
        onClick={handleStopSession}
        disabled={stopping}
        className="mt-6 w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 transition shadow-sm"
      >
        {stopping ? 'Closing Window...' : 'Close Attendance Window'}
      </button>
    </div>
  );
}
