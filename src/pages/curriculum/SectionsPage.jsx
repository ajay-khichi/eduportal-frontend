import React, { useState, useEffect, useCallback } from 'react';
import { Layers, Plus, Edit, Trash2, Users } from 'lucide-react';
import { sectionApi } from '../../api/curriculumApi';
import { academicSessionApi, programApi, departmentApi, collegeApi } from '../../api/institutionalApi';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { getErrorMessage } from '../../api/axiosClient';
import toast from 'react-hot-toast';

export function SectionsPage() {
  const [colleges, setColleges] = useState([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState('');
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [departments, setDepartments] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [deptPrograms, setDeptPrograms] = useState([]);
  const [selectedDeptProgId, setSelectedDeptProgId] = useState('');

  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);

  // Form
  const [formData, setFormData] = useState({
    name: '',
    semester: 1,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const cData = await collegeApi.getAll();
        setColleges(cData || []);
        if (cData && cData.length > 0) setSelectedCollegeId(String(cData[0].id));
      } catch (e) {}
    };
    init();
  }, []);

  // When college changes, load sessions and departments
  useEffect(() => {
    if (!selectedCollegeId) return;
    const loadCollegeData = async () => {
      try {
        const [sessData, deptData] = await Promise.all([
          academicSessionApi.getByCollege(selectedCollegeId),
          departmentApi.getByCollege(selectedCollegeId),
        ]);
        setSessions(sessData || []);
        if (sessData && sessData.length > 0) {
          const curr = sessData.find((s) => s.current) || sessData[0];
          setSelectedSessionId(String(curr.id));
        } else {
          setSelectedSessionId('');
        }

        setDepartments(deptData || []);
        if (deptData && deptData.length > 0) {
          setSelectedDeptId(String(deptData[0].id));
        } else {
          setSelectedDeptId('');
        }
      } catch (e) {}
    };
    loadCollegeData();
  }, [selectedCollegeId]);

  // When dept changes, load dept programs
  useEffect(() => {
    if (!selectedDeptId) return;
    const loadDeptProgs = async () => {
      try {
        const dp = await programApi.getByDepartment(selectedDeptId);
        setDeptPrograms(dp || []);
        if (dp && dp.length > 0) setSelectedDeptProgId(String(dp[0].id));
        else setSelectedDeptProgId('');
      } catch (e) {}
    };
    loadDeptProgs();
  }, [selectedDeptId]);

  // Fetch sections by session
  const fetchSections = useCallback(async () => {
    if (!selectedSessionId) {
      setSections([]);
      return;
    }
    setLoading(true);
    try {
      const data = await sectionApi.getBySession(selectedSessionId);
      setSections(data || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [selectedSessionId]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedDeptProgId || !selectedSessionId) {
      toast.error('Select both a program offering and academic session');
      return;
    }
    setSubmitting(true);
    try {
      await sectionApi.create({
        departmentProgramId: Number(selectedDeptProgId),
        academicSessionId: Number(selectedSessionId),
        semester: Number(formData.semester),
        name: formData.name,
      });
      toast.success('Section created successfully!');
      setIsCreateOpen(false);
      setFormData({ name: '', semester: 1 });
      fetchSections();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedSection) return;
    setSubmitting(true);
    try {
      await sectionApi.update(selectedSection.id, {
        departmentProgramId: selectedSection.departmentProgramId || Number(selectedDeptProgId),
        academicSessionId: selectedSection.academicSessionId || Number(selectedSessionId),
        semester: Number(formData.semester),
        name: formData.name,
      });
      toast.success('Section updated!');
      setIsEditOpen(false);
      fetchSections();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSection) return;
    setSubmitting(true);
    try {
      await sectionApi.delete(selectedSection.id);
      toast.success('Section deleted.');
      setIsDeleteOpen(false);
      fetchSections();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (sec) => {
    setSelectedSection(sec);
    setFormData({
      name: sec.name,
      semester: sec.semester,
    });
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Sections & Batches"
        subtitle="Organize students into class sections (e.g. Sec A, Sec B) for timetable and attendance allocation."
        actions={
          <button
            onClick={() => {
              setFormData({ name: '', semester: 1 });
              setIsCreateOpen(true);
            }}
            disabled={!selectedDeptProgId || !selectedSessionId}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Create Section
          </button>
        }
      />

      {/* Filter Selector Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-3">
        {colleges.length > 0 && (
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">College</label>
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
          </div>
        )}

        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Academic Session</label>
          <select
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} {s.current ? '(Current Term)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading sections..." />
      ) : sections.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No Sections in Session"
          description="Create sections (like Sec A, Batch-1) for this academic term."
          action={
            <button
              onClick={() => setIsCreateOpen(true)}
              disabled={!selectedDeptProgId || !selectedSessionId}
              className="px-4 py-2 rounded-xl bg-indigo-600 disabled:opacity-50 text-white text-xs font-bold"
            >
              Add First Section
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sections.map((sec) => (
            <div
              key={sec.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    Section #{sec.id}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(sec)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSection(sec);
                        setIsDeleteOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Section {sec.name}
                </h3>

                <div className="mt-4 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <div className="font-semibold text-slate-700 dark:text-slate-300">
                    {sec.programName || 'Degree Program'} · Sem {sec.semester}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Term: {sec.academicSessionName || 'Active Session'}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <span>View Enrolled Students</span>
                <Users className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Student Section">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Program Offering *
            </label>
            <select
              required
              value={selectedDeptProgId}
              onChange={(e) => setSelectedDeptProgId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {deptPrograms.map((dp) => (
                <option key={dp.id} value={dp.id}>
                  {dp.programName} ({dp.departmentName})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Semester (1-12) *
              </label>
              <input
                type="number"
                min={1}
                max={12}
                required
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Section Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. A, B, Batch-1"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white uppercase font-mono"
              />
            </div>
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
              {submitting ? 'Creating...' : 'Create Section'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Section">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Semester *
              </label>
              <input
                type="number"
                min={1}
                max={12}
                required
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Section Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase"
              />
            </div>
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
              {submitting ? 'Updating...' : 'Save Changes'}
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
        title="Delete Section"
        message={`Are you sure you want to delete section "${selectedSection?.name}"?`}
      />
    </div>
  );
}
