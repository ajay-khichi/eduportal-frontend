import React, { useState, useEffect, useCallback } from 'react';
import { UserCheck, Plus, Edit, Trash2, Mail, Phone, Briefcase, Award } from 'lucide-react';
import { facultyApi } from '../../api/peopleApi';
import { departmentApi, collegeApi } from '../../api/institutionalApi';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { getErrorMessage } from '../../api/axiosClient';
import toast from 'react-hot-toast';

export function FacultyPage() {
  const [colleges, setColleges] = useState([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState('');
  const [departments, setDepartments] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState('');

  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  // Form
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    departmentId: '',
    employeeNumber: '',
    firstName: '',
    lastName: '',
    phone: '',
    designation: 'Assistant Professor',
    role: 'TEACHER',
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
        }
      } catch (e) {}
    };
    loadDepts();
  }, [selectedCollegeId]);

  const fetchFaculty = useCallback(async () => {
    if (!selectedCollegeId) return;
    setLoading(true);
    try {
      let data = [];
      if (selectedDeptId) {
        data = await facultyApi.getByDepartment(selectedDeptId);
      } else {
        data = await facultyApi.getByCollege(selectedCollegeId);
      }
      setFaculty(data || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [selectedCollegeId, selectedDeptId]);

  useEffect(() => {
    fetchFaculty();
  }, [fetchFaculty]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedCollegeId || !formData.departmentId) {
      toast.error('College and Department are required');
      return;
    }
    setSubmitting(true);
    try {
      await facultyApi.create(selectedCollegeId, {
        email: formData.email,
        password: formData.password,
        departmentId: Number(formData.departmentId),
        employeeNumber: formData.employeeNumber,
        firstName: formData.firstName,
        lastName: formData.lastName || null,
        phone: formData.phone || null,
        designation: formData.designation,
        role: formData.role,
      });
      toast.success('Faculty registered and credentials created!');
      setIsCreateOpen(false);
      setFormData({
        email: '',
        password: '',
        departmentId: selectedDeptId || '',
        employeeNumber: '',
        firstName: '',
        lastName: '',
        phone: '',
        designation: 'Assistant Professor',
        role: 'TEACHER',
      });
      fetchFaculty();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedFaculty) return;
    setSubmitting(true);
    try {
      await facultyApi.update(selectedFaculty.id, {
        email: formData.email,
        password: formData.password || 'Temporary123',
        departmentId: Number(formData.departmentId || selectedFaculty.departmentId),
        employeeNumber: formData.employeeNumber,
        firstName: formData.firstName,
        lastName: formData.lastName || null,
        phone: formData.phone || null,
        designation: formData.designation,
        role: formData.role,
      });
      toast.success('Faculty updated!');
      setIsEditOpen(false);
      fetchFaculty();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedFaculty) return;
    setSubmitting(true);
    try {
      await facultyApi.delete(selectedFaculty.id);
      toast.success('Faculty member deleted.');
      setIsDeleteOpen(false);
      fetchFaculty();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (f) => {
    setSelectedFaculty(f);
    setFormData({
      email: f.email,
      password: '',
      departmentId: String(f.departmentId),
      employeeNumber: f.employeeNumber,
      firstName: f.firstName,
      lastName: f.lastName || '',
      phone: f.phone || '',
      designation: f.designation || 'Assistant Professor',
      role: f.role || 'TEACHER',
    });
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty Members"
        subtitle="Manage professors, lecturers, HOD designations, and teaching staff credentials."
        actions={
          <button
            onClick={() => {
              setFormData({
                email: '',
                password: '',
                departmentId: selectedDeptId || '',
                employeeNumber: '',
                firstName: '',
                lastName: '',
                phone: '',
                designation: 'Assistant Professor',
                role: 'TEACHER',
              });
              setIsCreateOpen(true);
            }}
            disabled={!selectedCollegeId}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Faculty
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

        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Department</label>
          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="">All Departments in College</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading faculty directory..." />
      ) : faculty.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No Faculty Members"
          description="Register professors or teaching fellows to begin scheduling lectures and attendance sessions."
          action={
            <button
              onClick={() => setIsCreateOpen(true)}
              disabled={!selectedCollegeId}
              className="px-4 py-2 rounded-xl bg-indigo-600 disabled:opacity-50 text-white text-xs font-bold"
            >
              Add First Faculty
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {faculty.map((f) => (
            <div
              key={f.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    {f.employeeNumber}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(f)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedFaculty(f);
                        setIsDeleteOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Prof. {f.firstName} {f.lastName}
                </h3>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {f.designation || 'Faculty'} · {f.role || 'TEACHER'}
                </p>

                <div className="mt-4 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{f.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>Dept: {f.departmentName || '—'}</span>
                  </div>
                  {f.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{f.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                Staff ID: #{f.id}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Register Faculty Member">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Employee Number *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. EMP-1049"
              value={formData.employeeNumber}
              onChange={(e) => setFormData({ ...formData, employeeNumber: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                placeholder="faculty@college.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Department *
              </label>
              <select
                required
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="">Select Department...</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Academic Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="TEACHER">TEACHER</option>
                <option value="HOD">HOD</option>
                <option value="MENTOR">MENTOR</option>
                <option value="CLASS_COORDINATOR">CLASS_COORDINATOR</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Designation
              </label>
              <input
                type="text"
                placeholder="e.g. Professor & Dean"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
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
              {submitting ? 'Registering...' : 'Register Faculty'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Faculty Profile">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Designation
              </label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Academic Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="TEACHER">TEACHER</option>
                <option value="HOD">HOD</option>
                <option value="MENTOR">MENTOR</option>
                <option value="CLASS_COORDINATOR">CLASS_COORDINATOR</option>
              </select>
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
        title="Delete Faculty Member"
        message={`Are you sure you want to delete Prof. ${selectedFaculty?.firstName} ${selectedFaculty?.lastName}? All assigned teaching allocations will be revoked.`}
      />
    </div>
  );
}
