import React, { useState } from 'react';
import {
  QrCode,
  MapPin,
  ScanFace,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { attendanceApi } from '../../api/timetableAndAttendanceApi';
import { PageHeader } from '../../components/common/PageHeader';
import { StudentQrScanner } from '../../components/attendance/StudentQrScanner';
import { StudentFaceVerifier } from '../../components/attendance/StudentFaceVerifier';
import { useGeolocation } from '../../hooks/useGeolocation';
import useAuth from '../../hooks/useAuth';
import { formatDateTime } from '../../utils/formatters';
import { getErrorMessage } from '../../api/axiosClient';
import toast from 'react-hot-toast';

export function StudentCheckInPage() {
  const { user } = useAuth();
  const geo = useGeolocation({ enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });

  // Check-in stages: 1: QR Scan -> 2: Biometric Verification -> 3: Complete / Result
  const [stage, setStage] = useState(1);
  const [challengeToken, setChallengeToken] = useState(null);
  const [faceEmbedding, setFaceEmbedding] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // Stage 1: Verify QR Code
  const handleQrDetected = async (qrToken) => {
    try {
      toast.loading('Validating rolling token with server...', { id: 'qr-toast' });
      const res = await attendanceApi.verifyQr(qrToken);
      setChallengeToken(res.challengeToken);
      toast.success('QR Code verified! Proceeding to biometric check...', { id: 'qr-toast' });
      setStage(2);
    } catch (err) {
      toast.error(getErrorMessage(err), { id: 'qr-toast' });
    }
  };

  // Stage 2: Face captured
  const handleFaceCaptured = (embedding, photoUrl) => {
    setFaceEmbedding(embedding);
    setCapturedPhoto(photoUrl);
  };

  // Stage 3: Submit Final Complete Check-In
  const handleCompleteAttendance = async () => {
    if (!challengeToken) {
      toast.error('Session challenge missing. Please re-scan QR code.');
      setStage(1);
      return;
    }
    if (!faceEmbedding || faceEmbedding.length === 0) {
      toast.error('Facial biometric vector is required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        challengeToken,
        latitude: geo.latitude ? Number(geo.latitude.toFixed(6)) : null,
        longitude: geo.longitude ? Number(geo.longitude.toFixed(6)) : null,
        faceEmbedding,
      };

      const res = await attendanceApi.completeAttendance(payload);
      setResult(res);
      setStage(3);
      toast.success('Attendance verified and marked PRESENT!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setStage(1);
    setChallengeToken(null);
    setFaceEmbedding(null);
    setCapturedPhoto(null);
    setResult(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Smart Attendance Check-In"
        subtitle="Multi-factor check-in using rolling QR cryptography, GPS geofencing, and live facial biometrics."
      />

      {/* Progress Steps Indicator */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                stage > 1
                  ? 'bg-emerald-500 text-white'
                  : stage === 1
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}
            >
              {stage > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
            </span>
            <span className={stage === 1 ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400'}>
              Scan Rolling QR
            </span>
          </div>

          <div className="flex-1 h-0.5 bg-slate-200 dark:bg-slate-800 mx-3" />

          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                stage > 2
                  ? 'bg-emerald-500 text-white'
                  : stage === 2
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}
            >
              {stage > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
            </span>
            <span className={stage === 2 ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400'}>
              GPS & Biometrics
            </span>
          </div>

          <div className="flex-1 h-0.5 bg-slate-200 dark:bg-slate-800 mx-3" />

          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                stage === 3
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}
            >
              3
            </span>
            <span className={stage === 3 ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
              Verified
            </span>
          </div>
        </div>
      </div>

      {/* STAGE 1: SCAN QR */}
      {stage === 1 && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="text-center mb-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Step 1: Scan Rolling QR Code
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Align your camera with the professor's screen or paste the token directly.
            </p>
          </div>

          <StudentQrScanner onScanSuccess={handleQrDetected} />
        </div>
      )}

      {/* STAGE 2: GPS & FACE VERIFICATION */}
      {stage === 2 && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
          <div className="text-center">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Step 2: Biometrics & Location Verification
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Ensure your face is within frame and GPS location is enabled.
            </p>
          </div>

          {/* GPS Status Indicator */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  GPS Geolocation Status
                </p>
                <p className="text-[11px] text-slate-500">
                  {geo.latitude && geo.longitude ? (
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">
                      Latitude: {geo.latitude.toFixed(4)}, Longitude: {geo.longitude.toFixed(4)}
                    </span>
                  ) : geo.error ? (
                    <span className="text-rose-500">{geo.error}</span>
                  ) : (
                    'Acquiring high-precision GPS lock...'
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={geo.refreshLocation}
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              Refresh GPS
            </button>
          </div>

          {/* Webcam Face Capturer */}
          <StudentFaceVerifier
            userEmail={user?.email}
            onFaceCaptured={handleFaceCaptured}
          />

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStage(1)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700"
            >
              Back to QR Scan
            </button>

            <button
              type="button"
              disabled={submitting || !faceEmbedding}
              onClick={handleCompleteAttendance}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition flex items-center gap-2"
            >
              {submitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              Confirm Check-In
            </button>
          </div>
        </div>
      )}

      {/* STAGE 3: SUCCESS RESULT */}
      {stage === 3 && result && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Attendance Marked Present!
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Your multi-factor check-in was cryptographically validated by EduPortal.
            </p>
          </div>

          {/* Audit Metrics */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-left">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Status</p>
              <p className="text-xs font-extrabold text-emerald-600 mt-1">
                {result.status || 'PRESENT'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Distance</p>
              <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-1 font-mono">
                {result.distanceMeters ? `${result.distanceMeters}m` : 'Inside Range'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Face Match</p>
              <p className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 mt-1 font-mono">
                {result.faceSimilarity ? `${Math.round(result.faceSimilarity * 100)}%` : 'Verified'}
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-400">
            Recorded at: {formatDateTime(result.markedAt || new Date())}
          </div>

          <button
            onClick={handleReset}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
          >
            Done · Check In Another Class
          </button>
        </div>
      )}
    </div>
  );
}
