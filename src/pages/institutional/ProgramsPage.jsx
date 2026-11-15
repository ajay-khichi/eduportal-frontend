import React, { useState, useEffect, useCallback } from 'react';
import { GraduationCap, Plus, Trash2, Link as LinkIcon, FolderTree, Layers } from 'lucide-react';
import { programApi, departmentApi, collegeApi } from '../../api/institutionalApi';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { getErrorMessage } from '../../api/axiosClient';
import toast from 'react-hot-toast';

export function ProgramsPage() {
  const [programs, setPrograms] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState('');
  const [departments, setDepartments] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [deptPrograms, setDeptPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);

  // Form states
  const [formData, setFormData] = useState({ name: '', code: '' });
  const [mapProgramId, setMapProgramId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPrograms = async () => {
    try {
      const data = await programApi.getAll();
      setPrograms(data || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchPrograms();
      try {
        const cData = await collegeApi.getAll();
        setColleges(cData || []);
        if (cData && cData.length > 0) {
          setSelectedCollegeId(String(cData[0].id));
        }
      } catch (e) {}
      setLoading(false);
    };
    init();
  }, []);

  // When college changes, fetch its departments
  useEffect(() => {
    if (!selectedCollegeId) return;
    const loadDepts = async () => {
      try {
        const dData = await departmentApi.getByCollege(selectedCollegeId);
        setDepartments(dData || []);
        if (dData && dData.length > 0) {
          setSelectedDeptId(String(dData[0].id));
        } else {
          setSelectedDeptId('');
          setDeptPrograms([]);
        }
      } catch (e) {}
    };
    loadDepts();
  }, [selectedCollegeId]);

  // When selected department changes, fetch its mapped programs
  const fetchDeptPrograms = useCallback(async () => {
    if (!selectedDeptId) {
      setDeptPrograms([]);
      return;
    }
    try {
      const dp = await programApi.getByDepartment(selectedDeptId);
      setDeptPrograms(dp || []);
    } catch (e) {
      setDeptPrograms([]);
    }
  }, [selectedDeptId]);

  useEffect(() => {
    fetchDeptPrograms();
  }, [fetchDeptPrograms]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await programApi.create(formData);
      toast.success('Degree program created successfully!');
      setIsCreateOpen(false);
      setFormData({ name: '', code: '' });
      fetchPrograms();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleMap = async (e) => {
    e.preventDefault();
    if (!selectedDeptId || !mapProgramId) {
      toast.error('Select both a department and a program');
      return;
    }
    setSubmitting(true);
    try {
      await programApi.assignToDepartment(selectedDeptId, mapProgramId);
      toast.success('Program successfully associated to department!');
      setIsMapOpen(false);
      setMapProgramId('');
      fetchDeptPrograms();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnmap = async (deptProgId) => {
    if (!window.confirm('Remove this program offering from the department?')) return;
    try {
      await programApi.removeDepartmentProgram(deptProgId);
      toast.success('Program removed from department.');
      fetchDeptPrograms();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!selectedProgram) return;
    setSubmitting(true);
    try {
      await programApi.delete(selectedProgram.id);
      toast.success('Program deleted.');
      setIsDeleteOpen(false);
      fetchPrograms();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Degree Programs & Offerings"
        subtitle="Define institutional degrees and map them into specific academic departments."
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMapOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <LinkIcon className="w-3.5 h-3.5 text-indigo-500" />
              Offer in Department
            </button>
            <button
              onClick={() => {
                setFormData({ name: '', code: '' });
                setIsCreateOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              New Degree Program
            </button>
          </div>
        }
      />

      {/* SECTION 1: GLOBAL DEGREE PROGRAMS */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          All Registered Degree Programs
        </h3>

        {loading ? (
          <LoadingSpinner text="Loading programs..." />
        ) : programs.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="No Programs Registered"
            description="Add programs such as B.Tech, M.Tech, MCA, or MBA."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {programs.map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                    {p.code}
                  </span>
                  <h4 className="mt-2 text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                    {p.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Program #{p.id}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedProgram(p);
                    setIsDeleteOpen(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  title="Delete Program"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: DEPARTMENT-PROGRAM OFFERINGS */}
      <div className="space-y-4 pt-6 border-t border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Department Degree Offerings
            </h3>
            <p className="text-xs text-slate-500">
              Select a college and department to inspect active curriculum programs and offerings
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {colleges.length > 0 && (
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
            )}

            {departments.length > 0 && (
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {deptPrograms.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <Layers className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              No programs currently mapped to this department.
            </p>
            <button
              onClick={() => setIsMapOpen(true)}
              className="mt-3 px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold"
            >
              Offer Program Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deptPrograms.map((dp) => (
              <div
                key={dp.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    DeptProgram #{dp.id}
                  </span>
                  <h4 className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                    {dp.programName} ({dp.programCode})
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Offered by: {dp.departmentName}
                  </p>
                </div>

                <button
                  onClick={() => handleUnmap(dp.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  title="Remove Program from Department"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE PROGRAM MODAL */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add Degree Program">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Program Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Bachelor of Technology"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Program Code *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. B.TECH"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase"
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
              {submitting ? 'Creating...' : 'Create Program'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MAP TO DEPARTMENT MODAL */}
      <Modal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} title="Offer Program in Department">
        <form onSubmit={handleMap} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Department *
            </label>
            <select
              required
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Degree Program *
            </label>
            <select
              required
              value={mapProgramId}
              onChange={(e) => setMapProgramId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">Select a Program...</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </select>
          </div>
          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsMapOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:opacity-50"
            >
              {submitting ? 'Associating...' : 'Map to Department'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={submitting}
        title="Delete Degree Program"
        message={`Are you sure you want to delete "${selectedProgram?.name}"?`}
      />
    </div>
  );
}
