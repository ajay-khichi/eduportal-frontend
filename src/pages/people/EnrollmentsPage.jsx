import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, Plus, Trash2, Users, Layers, CheckSquare, Square } from 'lucide-react';
import { enrollmentApi, studentApi } from '../../api/peopleApi';
import { sectionApi } from '../../api/curriculumApi';
import { academicSessionApi, collegeApi } from '../../api/institutionalApi';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDateTime } from '../../utils/formatters';
import { getErrorMessage } from '../../api/axiosClient';
import toast from 'react-hot-toast';

export function EnrollmentsPage() {
  const [colleges, setColleges] = useState([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState('');
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [sections, setSections] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState('');

  const [enrollments, setEnrollments] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [isSingleEnrollOpen, setIsSingleEnrollOpen] = useState(false);
  const [isBulkEnrollOpen, setIsBulkEnrollOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [bulkStudentIds, setBulkStudentIds] = useState([]);
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

  // When college changes, load sessions & all students in college
  useEffect(() => {
    if (!selectedCollegeId) return;
    const loadSessions = async () => {
      try {
        const [sessData, stuData] = await Promise.all([
          academicSessionApi.getByCollege(selectedCollegeId),
          studentApi.getByCollege(selectedCollegeId),
        ]);
        setSessions(sessData || []);
        setAllStudents(stuData || []);
        if (sessData && sessData.length > 0) {
          const curr = sessData.find((s) => s.current) || sessData[0];
          setSelectedSessionId(String(curr.id));
        } else {
          setSelectedSessionId('');
        }
      } catch (e) {}
    };
    loadSessions();
  }, [selectedCollegeId]);

  // When session changes, load sections
  useEffect(() => {
    if (!selectedSessionId) {
      setSections([]);
      return;
    }
    const loadSections = async () => {
      try {
        const data = await sectionApi.getBySession(selectedSessionId);
        setSections(data || []);
        if (data && data.length > 0) {
          setSelectedSectionId(String(data[0].id));
        } else {
          setSelectedSectionId('');
        }
      } catch (e) {}
    };
    loadSections();
  }, [selectedSessionId]);

  // Fetch enrollments for selected section
  const fetchEnrollments = useCallback(async () => {
    if (!selectedSectionId) {
      setEnrollments([]);
      return;
    }
    setLoading(true);
    try {
      const data = await enrollmentApi.getBySection(selectedSectionId);
      setEnrollments(data || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [selectedSectionId]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const handleSingleEnroll = async (e) => {
    e.preventDefault();
    if (!selectedSectionId || !selectedStudentId) {
      toast.error('Select a student');
      return;
    }
    setSubmitting(true);
    try {
      await enrollmentApi.enrollStudent(selectedSectionId, Number(selectedStudentId));
      toast.success('Student enrolled successfully!');
      setIsSingleEnrollOpen(false);
      setSelectedStudentId('');
      fetchEnrollments();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkEnroll = async (e) => {
    e.preventDefault();
    if (!selectedSectionId || bulkStudentIds.length === 0) {
      toast.error('Select at least one student for bulk enrollment');
      return;
    }
    setSubmitting(true);
    try {
      await enrollmentApi.enrollBulk(selectedSectionId, bulkStudentIds.map(Number));
      toast.success(`Successfully enrolled ${bulkStudentIds.length} students into the section!`);
      setIsBulkEnrollOpen(false);
      setBulkStudentIds([]);
      fetchEnrollments();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnenroll = async (studentId, studentName) => {
    if (!window.confirm(`Unenroll ${studentName} from this section?`)) return;
    try {
      await enrollmentApi.unenrollStudent(selectedSectionId, studentId);
      toast.success('Student unenrolled.');
      fetchEnrollments();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const toggleBulkStudent = (id) => {
    setBulkStudentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAllBulk = () => {
    if (bulkStudentIds.length === availableStudents.length) {
      setBulkStudentIds([]);
    } else {
      setBulkStudentIds(availableStudents.map((s) => s.id));
    }
  };

  // Filter out students already enrolled in this section
  const enrolledStudentIds = new Set(enrollments.map((e) => e.studentId));
  const availableStudents = allStudents.filter((s) => !enrolledStudentIds.has(s.id));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Section Enrollments"
        subtitle="Manage student cohort registrations into program semester sections and batches."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setBulkStudentIds([]);
                setIsBulkEnrollOpen(true);
              }}
              disabled={!selectedSectionId}
              className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 text-xs font-semibold text-slate-700 dark:text-slate-300 transition flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              Bulk Enroll
            </button>
            <button
              onClick={() => {
                setSelectedStudentId('');
                setIsSingleEnrollOpen(true);
              }}
              disabled={!selectedSectionId}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Enroll Student
            </button>
          </div>
        }
      />

      {/* Filter Selectors */}
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

        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Section</label>
          <select
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            {sections.map((sec) => (
              <option key={sec.id} value={sec.id}>
                Section {sec.name} ({sec.programName || 'Degree'} · Sem {sec.semester})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading enrolled students..." />
      ) : enrollments.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="No Students Enrolled"
          description="Enroll students individually or using the bulk cohort enrollment tool."
          action={
            <button
              onClick={() => setIsSingleEnrollOpen(true)}
              disabled={!selectedSectionId}
              className="px-4 py-2 rounded-xl bg-indigo-600 disabled:opacity-50 text-white text-xs font-bold"
            >
              Enroll Student
            </button>
          }
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Total Enrolled in this Section: {enrollments.length} Students
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-5 py-4">Enrollment Number</th>
                  <th className="px-5 py-4">Email Address</th>
                  <th className="px-5 py-4">Program & Term</th>
                  <th className="px-4 py-4">Enrolled At</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {enrollments.map((enr) => (
                  <tr key={enr.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="px-6 py-3.5 text-slate-900 dark:text-white font-bold">
                      {enr.studentName || 'Student'}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                      {enr.enrollmentNumber || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                      {enr.studentEmail || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                      {enr.programName} · Sem {enr.semester}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
                      {formatDateTime(enr.enrolledAt)}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => handleUnenroll(enr.studentId, enr.studentName)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Unenroll Student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SINGLE ENROLL MODAL */}
      <Modal isOpen={isSingleEnrollOpen} onClose={() => setIsSingleEnrollOpen(false)} title="Enroll Student">
        <form onSubmit={handleSingleEnroll} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Select Student *
            </label>
            <select
              required
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">Choose an unenrolled student...</option>
              {availableStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName} ({s.enrollmentNumber}) — {s.email}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsSingleEnrollOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:opacity-50"
            >
              {submitting ? 'Enrolling...' : 'Confirm Enrollment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* BULK ENROLL MODAL */}
      <Modal
        isOpen={isBulkEnrollOpen}
        onClose={() => setIsBulkEnrollOpen(false)}
        title="Bulk Enroll Students into Section"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleBulkEnroll} className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500">
              Selected: <strong className="text-indigo-600">{bulkStudentIds.length}</strong> / {availableStudents.length} available students
            </span>
            <button
              type="button"
              onClick={selectAllBulk}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {bulkStudentIds.length === availableStudents.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border rounded-xl border-slate-200 dark:border-slate-700 p-2">
            {availableStudents.length === 0 ? (
              <p className="p-4 text-center text-xs text-slate-400">All students in college are already enrolled.</p>
            ) : (
              availableStudents.map((s) => {
                const isSelected = bulkStudentIds.includes(s.id);
                return (
                  <div
                    key={s.id}
                    onClick={() => toggleBulkStudent(s.id)}
                    className="p-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg cursor-pointer transition text-xs"
                  >
                    <div className="flex items-center gap-3">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {s.firstName} {s.lastName}
                        </span>
                        <span className="ml-2 font-mono text-[11px] text-slate-400">
                          ({s.enrollmentNumber})
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500">{s.email}</span>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsBulkEnrollOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || bulkStudentIds.length === 0}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:opacity-50"
            >
              {submitting ? 'Enrolling...' : `Enroll (${bulkStudentIds.length}) Students`}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
