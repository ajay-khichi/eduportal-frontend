import React, { useState, useEffect, useCallback } from 'react';
import { BookMarked, Plus, Trash2, User, BookOpen, Layers, CalendarDays } from 'lucide-react';
import { teachingAssignmentApi, facultyApi } from '../../api/peopleApi';
import { subjectApi, sectionApi } from '../../api/curriculumApi';
import { academicSessionApi, departmentApi, programApi, collegeApi } from '../../api/institutionalApi';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDateTime } from '../../utils/formatters';
import { getErrorMessage } from '../../api/axiosClient';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export function TeachingAssignmentsPage() {
  const { user, isFaculty, isAdmin } = useAuth();

  const [colleges, setColleges] = useState([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState('');
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');

  const [sections, setSections] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [deptPrograms, setDeptPrograms] = useState([]);
  const [selectedDeptProgId, setSelectedDeptProgId] = useState('');
  const [subjects, setSubjects] = useState([]);

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Form
  const [formData, setFormData] = useState({
    facultyId: '',
    subjectId: '',
    sectionId: '',
    academicSessionId: '',
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

  // When college changes, load faculty & sessions & depts
  useEffect(() => {
    if (!selectedCollegeId) return;
    const loadCollegeResources = async () => {
      try {
        const [facData, sessData, deptData] = await Promise.all([
          facultyApi.getByCollege(selectedCollegeId),
          academicSessionApi.getByCollege(selectedCollegeId),
          departmentApi.getByCollege(selectedCollegeId),
        ]);
        setFacultyList(facData || []);
        setSessions(sessData || []);
        setDepartments(deptData || []);

        if (sessData && sessData.length > 0) {
          const curr = sessData.find((s) => s.current) || sessData[0];
          setSelectedSessionId(String(curr.id));
        }

        if (isFaculty && user?.id) {
          // If logged in user is faculty, set selected faculty to themselves
          setSelectedFacultyId(String(user.id));
        } else if (facData && facData.length > 0) {
          setSelectedFacultyId(String(facData[0].id));
        }

        if (deptData && deptData.length > 0) {
          setSelectedDeptId(String(deptData[0].id));
        }
      } catch (e) {}
    };
    loadCollegeResources();
  }, [selectedCollegeId, isFaculty, user]);

  // When session changes, load sections
  useEffect(() => {
    if (!selectedSessionId) return;
    const loadSections = async () => {
      try {
        const secData = await sectionApi.getBySession(selectedSessionId);
        setSections(secData || []);
      } catch (e) {}
    };
    loadSections();
  }, [selectedSessionId]);

  // When department changes, load department programs
  useEffect(() => {
    if (!selectedDeptId) return;
    const loadDeptProgs = async () => {
      try {
        const dp = await programApi.getByDepartment(selectedDeptId);
        setDeptPrograms(dp || []);
        if (dp && dp.length > 0) {
          setSelectedDeptProgId(String(dp[0].id));
        } else {
          setSelectedDeptProgId('');
        }
      } catch (e) {}
    };
    loadDeptProgs();
  }, [selectedDeptId]);

  // When deptProgram changes, load subjects
  useEffect(() => {
    if (!selectedDeptProgId) return;
    const loadSubjects = async () => {
      try {
        const subs = await subjectApi.getByDepartmentProgram(selectedDeptProgId);
        setSubjects(subs || []);
      } catch (e) {}
    };
    loadSubjects();
  }, [selectedDeptProgId]);

  // Fetch teaching assignments
  const fetchAssignments = useCallback(async () => {
    if (!selectedFacultyId) {
      setAssignments([]);
      return;
    }
    setLoading(true);
    try {
      let data = [];
      if (selectedSessionId) {
        data = await teachingAssignmentApi.getByFacultyAndSession(
          Number(selectedFacultyId),
          Number(selectedSessionId)
        );
      } else {
        data = await teachingAssignmentApi.getByFaculty(Number(selectedFacultyId));
      }
      setAssignments(data || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [selectedFacultyId, selectedSessionId]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.facultyId || !formData.subjectId || !formData.sectionId || !formData.academicSessionId) {
      toast.error('All fields are required');
      return;
    }
    setSubmitting(true);
    try {
      await teachingAssignmentApi.create({
        facultyId: Number(formData.facultyId),
        subjectId: Number(formData.subjectId),
        sectionId: Number(formData.sectionId),
        academicSessionId: Number(formData.academicSessionId),
      });
      toast.success('Teaching assignment allocated successfully!');
      setIsCreateOpen(false);
      fetchAssignments();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAssignment) return;
    setSubmitting(true);
    try {
      await teachingAssignmentApi.delete(selectedAssignment.id);
      toast.success('Teaching allocation removed.');
      setIsDeleteOpen(false);
      fetchAssignments();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isFaculty ? 'My Teaching Allocations' : 'Faculty Teaching Allocations'}
        subtitle="Map faculty professors to specific syllabus subjects and student sections for live attendance tracking."
        actions={
          isAdmin && (
            <button
              onClick={() => {
                setFormData({
                  facultyId: selectedFacultyId || '',
                  subjectId: '',
                  sectionId: '',
                  academicSessionId: selectedSessionId || '',
                });
                setIsCreateOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              New Teaching Allocation
            </button>
          )
        }
      />

      {/* Filter Selectors */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-3">
        {isAdmin && colleges.length > 0 && (
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

        {isAdmin && (
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Faculty Member</label>
            <select
              value={selectedFacultyId}
              onChange={(e) => setSelectedFacultyId(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {facultyList.map((f) => (
                <option key={f.id} value={f.id}>
                  Prof. {f.firstName} {f.lastName} ({f.employeeNumber})
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
            <option value="">All Academic Terms</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} {s.current ? '(Current Term)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading teaching assignments..." />
      ) : assignments.length === 0 ? (
        <EmptyState
          icon={BookMarked}
          title="No Allocations Found"
          description="Assign faculty professors to teach a subject for a specific section."
          action={
            isAdmin && (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
              >
                Create First Allocation
              </button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {assignments.map((a) => (
            <div
              key={a.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    {a.subjectCode || 'SUB'}
                  </span>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setSelectedAssignment(a);
                        setIsDeleteOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <h3 className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-1">
                  {a.subjectName}
                </h3>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  Prof. {a.facultyName} ({a.employeeNumber})
                </p>

                <div className="mt-4 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>
                      Section: <strong>{a.sectionName}</strong> (Sem {a.semester})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>Term: {a.academicSessionName || 'Current Session'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                Allocation ID: #{a.id}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Allocate Teaching Assignment">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Faculty Member *
            </label>
            <select
              required
              value={formData.facultyId}
              onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">Select Faculty...</option>
              {facultyList.map((f) => (
                <option key={f.id} value={f.id}>
                  Prof. {f.firstName} {f.lastName} ({f.employeeNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Academic Session *
            </label>
            <select
              required
              value={formData.academicSessionId}
              onChange={(e) => setFormData({ ...formData, academicSessionId: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">Select Academic Term...</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.current ? '(Current)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Curriculum Subject *
            </label>
            <select
              required
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">Select Subject...</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} ({sub.code}) — Sem {sub.semester}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Student Section *
            </label>
            <select
              required
              value={formData.sectionId}
              onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">Select Section...</option>
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  Section {sec.name} ({sec.programName || 'Degree'} · Sem {sec.semester})
                </option>
              ))}
            </select>
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
              {submitting ? 'Allocating...' : 'Allocate Teaching Load'}
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
        title="Revoke Teaching Assignment"
        message={`Are you sure you want to revoke this teaching allocation?`}
      />
    </div>
  );
}
