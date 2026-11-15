import React, { useState, useEffect, useCallback } from 'react';
import { FolderTree, Plus, Edit, Trash2, UserPlus, Mail, Building2 } from 'lucide-react';
import { departmentApi, collegeApi } from '../../api/institutionalApi';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { getErrorMessage } from '../../api/axiosClient';
import toast from 'react-hot-toast';

export function DepartmentsPage() {
  const [colleges, setColleges] = useState([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState('');
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAssignHodOpen, setIsAssignHodOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);

  // Form states
  const [formData, setFormData] = useState({ name: '', code: '', hodEmail: '' });
  const [hodEmail, setHodEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch colleges list
  useEffect(() => {
    const loadColleges = async () => {
      try {
        const data = await collegeApi.getAll();
        setColleges(data || []);
        if (data && data.length > 0) {
          setSelectedCollegeId(String(data[0].id));
        }
      } catch (err) {
        console.warn('Failed to load colleges:', err);
      }
    };
    loadColleges();
  }, []);

  const fetchDepartments = useCallback(async () => {
    if (!selectedCollegeId) {
      setDepartments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await departmentApi.getByCollege(selectedCollegeId);
      setDepartments(data || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [selectedCollegeId]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedCollegeId) {
      toast.error('Please select a college first');
      return;
    }
    setSubmitting(true);
    try {
      await departmentApi.create(selectedCollegeId, formData);
      toast.success('Department created successfully!');
      setIsCreateOpen(false);
      setFormData({ name: '', code: '', hodEmail: '' });
      fetchDepartments();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedDept) return;
    setSubmitting(true);
    try {
      await departmentApi.update(selectedDept.id, formData);
      toast.success('Department updated successfully!');
      setIsEditOpen(false);
      fetchDepartments();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDept) return;
    setSubmitting(true);
    try {
      await departmentApi.delete(selectedDept.id);
      toast.success('Department deleted successfully.');
      setIsDeleteOpen(false);
      fetchDepartments();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignHod = async (e) => {
    e.preventDefault();
    if (!selectedDept) return;
    setSubmitting(true);
    try {
      await departmentApi.assignHod(selectedDept.id, { hodEmail });
      toast.success('Head of Department (HOD) assigned successfully!');
      setIsAssignHodOpen(false);
      setHodEmail('');
      fetchDepartments();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (dept) => {
    setSelectedDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      hodEmail: dept.hodEmail || '',
    });
    setIsEditOpen(true);
  };

  const openAssignHod = (dept) => {
    setSelectedDept(dept);
    setHodEmail(dept.hodEmail || '');
    setIsAssignHodOpen(true);
  };

  const openDelete = (dept) => {
    setSelectedDept(dept);
    setIsDeleteOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        subtitle="Manage academic departments, departmental codes, and assign HOD leadership."
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
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => {
                setFormData({ name: '', code: '', hodEmail: '' });
                setIsCreateOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Department
            </button>
          </div>
        }
      />

      {loading ? (
        <LoadingSpinner text="Loading departments..." />
      ) : departments.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="No Departments Found"
          description="Create your first academic department (e.g. Computer Science, Mechanical Engineering)."
          action={
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
            >
              Add Department
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    {dept.code}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openAssignHod(dept)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Assign HOD"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEdit(dept)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Edit Department"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDelete(dept)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Delete Department"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-1">
                  {dept.name}
                </h3>

                <div className="mt-4 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span className="truncate">
                      HOD:{' '}
                      {dept.hodEmail ? (
                        <strong className="text-slate-700 dark:text-slate-300">{dept.hodEmail}</strong>
                      ) : (
                        <span className="italic text-slate-400">Unassigned</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                Department ID: #{dept.id}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Department">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Department Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Computer Science & Engineering"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Department Code *
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. CSE"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white uppercase font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              HOD Email (Optional)
            </label>
            <input
              type="email"
              value={formData.hodEmail}
              onChange={(e) => setFormData({ ...formData, hodEmail: e.target.value })}
              placeholder="hod.cse@institution.edu"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
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
              {submitting ? 'Creating...' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Department">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Department Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Department Code *
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase"
            />
          </div>
          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Update Department'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ASSIGN HOD MODAL */}
      <Modal
        isOpen={isAssignHodOpen}
        onClose={() => setIsAssignHodOpen(false)}
        title={`Assign Head of Department for ${selectedDept?.name}`}
      >
        <form onSubmit={handleAssignHod} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              HOD Email Address *
            </label>
            <input
              type="email"
              required
              value={hodEmail}
              onChange={(e) => setHodEmail(e.target.value)}
              placeholder="hod@institution.edu"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAssignHodOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md disabled:opacity-50"
            >
              {submitting ? 'Assigning...' : 'Assign HOD'}
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
        title="Delete Department"
        message={`Are you sure you want to delete "${selectedDept?.name}"? All associated programs and subjects will be impacted.`}
      />
    </div>
  );
}
