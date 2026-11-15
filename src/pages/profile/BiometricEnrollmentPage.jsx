import React, { useState, useEffect } from 'react';
import { ScanFace, CheckCircle2, AlertCircle, RefreshCw, Trash2, ShieldCheck } from 'lucide-react';
import { faceProfileApi } from '../../api/timetableAndAttendanceApi';
import { PageHeader } from '../../components/common/PageHeader';
import { StudentFaceVerifier } from '../../components/attendance/StudentFaceVerifier';
import { formatDateTime } from '../../utils/formatters';
import { getErrorMessage } from '../../api/axiosClient';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export function BiometricEnrollmentPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [capturedVector, setCapturedVector] = useState(null);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await faceProfileApi.getMyFaceProfile();
      setProfile(data);
    } catch (err) {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleFaceCaptured = (embedding) => {
    setCapturedVector(embedding);
  };

  const handleEnroll = async () => {
    if (!capturedVector || capturedVector.length === 0) {
      toast.error('Please capture a face frame first.');
      return;
    }

    setSubmitting(true);
    try {
      await faceProfileApi.enrollMyFaceProfile({
        embedding: capturedVector,
        modelVersion: 'mobilefacenet-v1',
      });
      toast.success('Facial biometric profile enrolled successfully!');
      setCapturedVector(null);
      fetchProfile();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Biometric Face Enrollment"
        subtitle="Register your facial features for automated multi-factor attendance matching."
      />

      {/* Current Biometric Status */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-2xl ${
              profile?.active
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
            }`}
          >
            <ScanFace className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {profile?.active ? 'Face Profile Registered & Active' : 'No Face Profile Enrolled'}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {profile?.active
                ? `Model: ${profile.modelVersion} · Enrolled: ${formatDateTime(profile.createdAt)}`
                : 'Enroll your face to enable 3-factor attendance check-ins.'}
            </p>
          </div>
        </div>

        {profile?.active && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled
          </span>
        )}
      </div>

      {/* Camera Capture Box */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
        <div className="text-center">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {profile?.active ? 'Re-enroll / Update Face Profile' : 'Enroll Biometric Snapshot'}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Center your face inside the oval guide and press capture.
          </p>
        </div>

        <StudentFaceVerifier
          userEmail={user?.email}
          isEnrollment={true}
          onFaceCaptured={handleFaceCaptured}
        />

        {capturedVector && (
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40 flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              128-Dimensional Biometric Vector Extracted
            </span>
            <button
              onClick={handleEnroll}
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
            >
              {submitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              Save Biometric Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
