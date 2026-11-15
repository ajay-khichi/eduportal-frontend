import React, { useState, useEffect, useCallback } from 'react';
import { CalendarDays, Plus, CheckCircle2, Trash2, Check, Star } from 'lucide-react';
import { academicSessionApi, collegeApi } from '../../api/institutionalApi';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';
import { getErrorMessage } from '../../api/axiosClient';
import toast from 'react-hot-toast';

export function AcademicSessionsPage() {
  const [colleges, setColleges] = useState([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState('');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    current: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadColleges = async () => {
      try {
        const data = await collegeApi.getAll();
        setColleges(data || []);
        if (data && data.length > 0) {
          setSelectedCollegeId(String(data[0].id));
        }
      } catch (err) {}
    };
    loadColleges();
  }, []);

  const fetchSessions = useCallback(async () => {
    if (!selectedCollegeId) {
      setSessions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await academicSessionApi.getByCollege(selectedCollegeId);
      setSessions(data || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [selectedCollegeId]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedCollegeId) return;
    setSubmitting(true);
    try {
      await academicSessionApi.create(selectedCollegeId, formData);
      toast.success('Academic session added!');
      setIsCreateOpen(false);
      setFormData({ name: '', startDate: '', endDate: '', current: false });
      fetchSessions();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetCurrent = async (session) => {
    try {
      await academicSessionApi.setCurrent(selectedCollegeId, session.id);
      toast.success(`"${session.name}" is now marked as the active current session!`);
      fetchSessions();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!selectedSession) return;
    setSubmitting(true);
    try {
      await academicSessionApi.delete(selectedSession.id);
      toast.success('Academic session deleted.');
      setIsDeleteOpen(false);
      fetchSessions();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Sessions"
        subtitle="Configure academic years, semester terms, and designate the active enrollment term."
        actions={
          <div className="flex items-center gap-3">
            {colleges.length > 0 && (
              <select
                value={selectedCollegeId}
                onChange={(e) => setSelectedCollegeId(e.target.value)}
                className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {colleges.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              New Academic Session
            </button>
          </div>
        }
      />

      {loading ? (
        <LoadingSpinner text="Loading academic terms..." />
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No Academic Sessions"
          description="Create an academic session (e.g. 2025-2026) to begin scheduling classes and sections."
          action={
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
            >
              Add Academic Session
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`rounded-3xl border p-6 shadow-sm transition flex flex-col justify-between ${
                s.current
                  ? 'bg-gradient-to-b from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-900 border-indigo-300 dark:border-indigo-800 ring-2 ring-indigo-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    Term #{s.id}
                  </span>

                  {s.current ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                      Active Current Term
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetCurrent(s)}
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 transition"
                    >
                      Set As Current
                    </button>
                  )}
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {s.name}
                </h3>

                <div className="mt-4 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <div>
                    Start Date: <strong className="text-slate-700 dark:text-slate-300">{formatDate(s.startDate)}</strong>
                  </div>
                  <div>
                    End Date: <strong className="text-slate-700 dark:text-slate-300">{formatDate(s.endDate)}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Term ID: {s.id}</span>
                <button
                  onClick={() => {
                    setSelectedSession(s);
                    setIsDeleteOpen(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  title="Delete Session"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add Academic Session">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Session Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 2025-2026"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                End Date *
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="currentTerm"
              checked={formData.current}
              onChange={(e) => setFormData({ ...formData, current: e.target.checked })}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="currentTerm" className="text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
              Set as current active academic session immediately
            </label>
          </div>
          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Save Academic Term'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRM */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={submitting}
        title="Delete Academic Session"
        message={`Are you sure you want to delete "${selectedSession?.name}"?`}
      />
    </div>
  );
}
