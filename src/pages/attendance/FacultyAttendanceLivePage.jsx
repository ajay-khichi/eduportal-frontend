import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { QrCode, Play, MapPin, Navigation, Clock, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { classSessionApi, attendanceApi } from '../../api/timetableAndAttendanceApi';
import { PageHeader } from '../../components/common/PageHeader';
import { RollingQrDisplay } from '../../components/attendance/RollingQrDisplay';
import { AttendanceRoster } from '../../components/attendance/AttendanceRoster';
import { StatusBadge } from '../../components/common/Badge';
import { formatTime, formatDate } from '../../utils/formatters';
import { useGeolocation } from '../../hooks/useGeolocation';
import { getErrorMessage } from '../../api/axiosClient';
import toast from 'react-hot-toast';

export function FacultyAttendanceLivePage() {
  const [searchParams] = useSearchParams();
  const classIdParam = searchParams.get('classId');

  const [classId, setClassId] = useState(classIdParam || '');
  const [classSession, setClassSession] = useState(null);
  const [loadingClass, setLoadingClass] = useState(false);

  // Active attendance session
  const [activeSession, setActiveSession] = useState(null);
  const [starting, setStarting] = useState(false);

  // Start session form
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [enableGeofence, setEnableGeofence] = useState(true);
  const [radiusMeters, setRadiusMeters] = useState(100);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  const geo = useGeolocation();

  // Load class session details
  useEffect(() => {
    if (!classId) return;
    const loadClass = async () => {
      setLoadingClass(true);
      try {
        const data = await classSessionApi.getById(Number(classId));
        setClassSession(data);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoadingClass(false);
      }
    };
    loadClass();
  }, [classId]);

  // Set default GPS coords from browser geolocation
  const handleUseCurrentLocation = () => {
    if (geo.latitude && geo.longitude) {
      setLat(geo.latitude.toFixed(6));
      setLng(geo.longitude.toFixed(6));
      toast.success('Current GPS coordinates detected!');
    } else {
      geo.refreshLocation();
      toast('Detecting GPS location... Please allow location permission in your browser.');
    }
  };

  const handleStartSession = async (e) => {
    e.preventDefault();
    if (!classId) {
      toast.error('Class ID is required');
      return;
    }

    setStarting(true);
    try {
      const payload = {
        durationMinutes: Number(durationMinutes),
        latitude: enableGeofence && lat ? Number(lat) : null,
        longitude: enableGeofence && lng ? Number(lng) : null,
        radiusMeters: enableGeofence ? Number(radiusMeters) : null,
      };

      const res = await attendanceApi.startSession(Number(classId), payload);
      setActiveSession(res);
      toast.success('Live Smart Attendance Session started! Rolling QR is now active.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Smart Attendance Host"
        subtitle="Broadcast rolling encrypted QR codes, enforce GPS geofencing, and monitor student attendance in real time."
        badge={
          activeSession?.active && (
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Live Broadcasting
            </span>
          )
        }
      />

      {/* Class Selector if no classId in URL */}
      {!classIdParam && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <label className="text-xs font-bold uppercase text-slate-500">Class Session ID:</label>
          <input
            type="number"
            placeholder="Enter class session ID (e.g. 1)"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
      )}

      {/* Lecture Details Header */}
      {classSession && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                {classSession.subjectCode || 'SUB'}
              </span>
              <StatusBadge status={classSession.status} />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {classSession.subjectName}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Section: <strong>{classSession.sectionName}</strong> · Room:{' '}
              <strong>{classSession.room || 'General Classroom'}</strong> · Date:{' '}
              {formatDate(classSession.classDate)} ({formatTime(classSession.startTime)} – {formatTime(classSession.endTime)})
            </p>
          </div>

          <div className="text-right text-xs text-slate-400 font-medium">
            Lecturer: <strong className="text-slate-700 dark:text-slate-200">Prof. {classSession.facultyName}</strong>
          </div>
        </div>
      )}

      {/* ACTIVE SESSION VIEW (ROLLING QR + REAL-TIME ATTENDANCE ROSTER) */}
      {activeSession && activeSession.active ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <RollingQrDisplay
              sessionId={activeSession.id}
              sessionDetails={activeSession}
              onSessionStopped={() => {
                setActiveSession(null);
              }}
            />
          </div>
          <div className="lg:col-span-7">
            <AttendanceRoster classSessionId={Number(classId)} classSession={classSession} />
          </div>
        </div>
      ) : (
        /* LAUNCH ATTENDANCE CONTROLS */
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Configure Live Attendance Session
              </h3>
              <p className="text-xs text-slate-500">
                Configure session window duration and GPS geofence radius
              </p>
            </div>
          </div>

          <form onSubmit={handleStartSession} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Session Duration (Minutes) *
              </label>
              <input
                type="number"
                min={1}
                max={180}
                required
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                After this window, rolling QR rotation stops and the session closes.
              </p>
            </div>

            {/* Geofence Configuration */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    GPS Geofence Verification
                  </span>
                </div>
                <input
                  type="checkbox"
                  id="enableGeo"
                  checked={enableGeofence}
                  onChange={(e) => setEnableGeofence(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
              </div>

              {enableGeofence && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 28.613939"
                        value={lat}
                        onChange={(e) => setLat(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 77.209021"
                        value={lng}
                        onChange={(e) => setLng(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition"
                    >
                      <Navigation className="w-3.5 h-3.5 text-indigo-500" />
                      Auto-Detect My Current GPS
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Radius:</span>
                      <input
                        type="number"
                        min={10}
                        max={2000}
                        value={radiusMeters}
                        onChange={(e) => setRadiusMeters(e.target.value)}
                        className="w-20 px-2 py-1 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-center"
                      />
                      <span className="text-xs text-slate-500">meters</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={starting || !classId}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs tracking-wide shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
            >
              {starting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4 fill-white" />
              )}
              Start Live Attendance Session
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
