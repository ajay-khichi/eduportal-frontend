import React, { useState } from 'react';
import { User, Lock, ShieldAlert, KeyRound, CheckCircle2 } from 'lucide-react';
import { userApi } from '../../api/authApi';
import { PageHeader } from '../../components/common/PageHeader';
import { formatDateTime, formatRole } from '../../utils/formatters';
import { getErrorMessage } from '../../api/axiosClient';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export function ProfilePage() {
  const { user, logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);
  const [revoking, setRevoking] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8 || newPassword.length > 24) {
      toast.error('New password must be between 8 and 24 characters');
      return;
    }

    setChangingPass(true);
    try {
      await userApi.changePassword({ currentPassword, newPassword });
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setChangingPass(false);
    }
  };

  const handleRevokeAllSessions = async () => {
    if (
      !window.confirm(
        'Are you sure you want to log out of all active devices? You will be required to log in again.'
      )
    ) {
      return;
    }

    setRevoking(true);
    try {
      await userApi.revokeAllSessions();
      toast.success('All active device sessions revoked.');
      await logout();
      window.location.href = '/login';
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <PageHeader
        title="Account & Security Settings"
        subtitle="Manage your credentials, change password, and control active device sessions."
      />

      {/* Account Info Card */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-500" />
          User Profile
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              Email Address
            </span>
            <p className="mt-1 font-bold text-slate-800 dark:text-slate-200">{user?.email}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              Role Authority
            </span>
            <p className="mt-1 font-bold text-indigo-600 dark:text-indigo-400">
              {formatRole(user?.role)}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              Account Status
            </span>
            <p className="mt-1 font-bold text-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active & Verified
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              Account Created
            </span>
            <p className="mt-1 font-bold text-slate-800 dark:text-slate-200">
              {formatDateTime(user?.createdAt || new Date())}
            </p>
          </div>
        </div>
      </div>

      {/* Change Password Form */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-indigo-500" />
          Change Password
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Passwords must be between 8 and 24 characters in length.
        </p>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Current Password *
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              New Password *
            </label>
            <input
              type="password"
              required
              minLength={8}
              maxLength={24}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Confirm New Password *
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={changingPass}
            className="mt-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition"
          >
            {changingPass ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Revoke All Sessions */}
      <div className="bg-rose-50/40 dark:bg-rose-950/20 p-6 sm:p-8 rounded-3xl border border-rose-200 dark:border-rose-900/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            Active Refresh Token Sessions
          </h4>
          <p className="mt-1 text-xs text-rose-700/80 dark:text-rose-300/70 max-w-lg">
            Lost a device or want to log out everywhere? Invalidate all stored SHA-256 refresh tokens across all browsers and devices.
          </p>
        </div>

        <button
          onClick={handleRevokeAllSessions}
          disabled={revoking}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition whitespace-nowrap self-start sm:self-auto"
        >
          {revoking ? 'Revoking...' : 'Revoke All Sessions'}
        </button>
      </div>
    </div>
  );
}
