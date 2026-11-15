import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Plus, Edit, Trash2, Award } from 'lucide-react';
import { subjectApi } from '../../api/curriculumApi';
import { programApi, departmentApi, collegeApi } from '../../api/institutionalApi';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { getErrorMessage } from '../../api/axiosClient';
import toast from 'react-hot-toast';

export function SubjectsPage() {
  const [colleges, setColleges] = useState([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState('');
  const [departments, setDepartments] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [deptPrograms, setDeptPrograms] = useState([]);
  const [selectedDeptProgId, setSelectedDeptProgId] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Form
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    semester: 1,
    credits: 3,
  });
  const [submitting, setSubmitting] = useState(false);

  // Initial load
  useEffect(() => {
    const loadColleges = async () => {
      try {
        const cData = await collegeApi.getAll();
        setColleges(cData || []);
        if (cData && cData.length > 0) setSelectedCollegeId(String(cData[0].id));
      } catch (e) {}
    };
    loadColleges();
  }, []);

  // When college changes, load depts
  useEffect(() => {
    if (!selectedCollegeId) return;
    const loadDepts = async () => {
      try {
        const dData = await departmentApi.getByCollege(selectedCollegeId);
        setDepartments(dData || []);
        if (dData && dData.length > 0) setSelectedDeptId(String(dData[0].id));
      } catch (e) {}
    };
    loadDepts();
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

  // Fetch subjects for selected DeptProgram
  const fetchSubjects = useCallback(async () => {
    if (!selectedDeptProgId) {
      setSubjects([]);
      return;
    }
    setLoading(true);
    try {
      const sem = selectedSemester ? Number(selectedSemester) : null;
      const data = await subjectApi.getByDepartmentProgram(selectedDeptProgId, sem);
      setSubjects(data || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [selectedDeptProgId, selectedSemester]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedDeptProgId) {
      toast.error('Select a department program first');
      return;
    }
    setSubmitting(true);
    try {
      await subjectApi.create(selectedDeptProgId, {
        name: formData.name,
        code: formData.code,
        semester: Number(formData.semester),
        credits: Number(formData.credits),
      });
      toast.success('Subject added to curriculum successfully!');
      setIsCreateOpen(false);
      setFormData({ name: '', code: '', semester: 1, credits: 3 });
      fetchSubjects();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedSubject) return;
    setSubmitting(true);
    try {
      await subjectApi.update(selectedSubject.id, {
        name: formData.name,
        code: formData.code,
        semester: Number(formData.semester),
        credits: Number(formData.credits),
      });
      toast.success('Subject updated!');
      setIsEditOpen(false);
      fetchSubjects();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSubject) return;
    setSubmitting(true);
    try {
      await subjectApi.delete(selectedSubject.id);
      toast.success('Subject removed from curriculum.');
      setIsDeleteOpen(false);
      fetchSubjects();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (sub) => {
    setSelectedSubject(sub);
    setFormData({
      name: sub.name,
      code: sub.code,
      semester: sub.semester,
      credits: sub.credits,
    });
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Curriculum & Subjects"
        subtitle="Manage program syllabi, credit allocations, and course codes across semesters."
        actions={
          <button
            onClick={() => {
              setFormData({ name: '', code: '', semester: 1, credits: 3 });
              setIsCreateOpen(true);
            }}
            disabled={!selectedDeptProgId}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Subject
          </button>
        }
      />

      {/* Filter Bar */}
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

        {departments.length > 0 && (
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Department</label>
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
          </div>
        )}

        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Program Offering</label>
          <select
            value={selectedDeptProgId}
            onChange={(e) => setSelectedDeptProgId(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            {deptPrograms.map((dp) => (
              <option key={dp.id} value={dp.id}>
                {dp.programName} ({dp.programCode})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Semester</label>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading curriculum subjects..." />
      ) : subjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No Subjects in Syllabus"
          description="Add subjects like Data Structures, Linear Algebra, or Distributed Systems to this program."
          action={
            <button
              onClick={() => setIsCreateOpen(true)}
              disabled={!selectedDeptProgId}
              className="px-4 py-2 rounded-xl bg-indigo-600 disabled:opacity-50 text-white text-xs font-bold"
            >
              Add First Subject
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((sub) => (
            <div
              key={sub.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    {sub.code}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(sub)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSubject(sub);
                        setIsDeleteOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-1">
                  {sub.name}
                </h3>

                <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-slate-500">
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    Semester {sub.semester}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <Award className="w-3.5 h-3.5" />
                    {sub.credits} Credits
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                Course ID: #{sub.id}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add Subject to Curriculum">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Subject Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Database Management Systems"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Subject Code *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. CS-301"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase"
            />
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
                Academic Credits (1-10) *
              </label>
              <input
                type="number"
                min={1}
                max={10}
                required
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
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
              {submitting ? 'Creating...' : 'Add Subject'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Subject Details">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Subject Name *
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
              Subject Code *
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase"
            />
          </div>
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
                Credits *
              </label>
              <input
                type="number"
                min={1}
                max={10}
                required
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
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
        title="Delete Subject"
        message={`Are you sure you want to remove "${selectedSubject?.name}" from curriculum?`}
      />
    </div>
  );
}
