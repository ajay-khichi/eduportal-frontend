import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Plus, Filter, Calendar } from 'lucide-react';
import { classSessionApi } from '../../api/timetableAndAttendanceApi';
import { teachingAssignmentApi, facultyApi } from '../../api/peopleApi';
import { sectionApi } from '../../api/curriculumApi';
import { academicSessionApi, collegeApi } from '../../api/institutionalApi';
import { PageHeader } from '../../components/common/PageHeader';
import { TimetableGrid } from '../../components/timetable/TimetableGrid';
import { ScheduleClassModal } from '../../components/timetable/ScheduleClassModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { getErrorMessage } from '../../api/axiosClient';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export function TimetablePage() {
  const { user, isFaculty, isStudent, isAdmin } = useAuth();

  const [colleges, setColleges] = useState([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState('');
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');

  const [sections, setSections] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState('');

  const [facultyList, setFacultyList] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');

  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  // Date filters
  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState('');

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
    const loadCollegeData = async () => {
      try {
        const [sessData, facData] = await Promise.all([
          academicSessionApi.getByCollege(selectedCollegeId),
          facultyApi.getByCollege(selectedCollegeId),
        ]);
        setSessions(sessData || []);
        setFacultyList(facData || []);

        if (sessData && sessData.length > 0) {
          const curr = sessData.find((s) => s.current) || sessData[0];
          setSelectedSessionId(String(curr.id));
        }

        if (isFaculty && user?.id) {
          setSelectedFacultyId(String(user.id));
        } else if (facData && facData.length > 0) {
          setSelectedFacultyId(String(facData[0].id));
        }
      } catch (e) {}
    };
    loadCollegeData();
  }, [selectedCollegeId, isFaculty, user]);

  useEffect(() => {
    if (!selectedSessionId) return;
    const loadSections = async () => {
      try {
        const secData = await sectionApi.getBySession(selectedSessionId);
        setSections(secData || []);
        if (secData && secData.length > 0 && !selectedSectionId) {
          setSelectedSectionId(String(secData[0].id));
        }
      } catch (e) {}
    };
    loadSections();
  }, [selectedSessionId, selectedSectionId]);

  // Load teaching assignments for scheduling modal
  useEffect(() => {
    const loadAssignments = async () => {
      try {
        if (selectedFacultyId) {
          const a = await teachingAssignmentApi.getByFaculty(Number(selectedFacultyId));
          setAssignments(a || []);
        }
      } catch (e) {}
    };
    loadAssignments();
  }, [selectedFacultyId]);

  const fetchTimetable = useCallback(async () => {
    setLoading(true);
    try {
      let data = [];
      if (isFaculty || selectedFacultyId) {
        data = await classSessionApi.getFacultyTimetable(
          Number(selectedFacultyId || user.id),
          fromDate || null,
          toDate || null
        );
      } else if (selectedSectionId) {
        data = await classSessionApi.getSectionTimetable(
          Number(selectedSectionId),
          fromDate || null,
          toDate || null
        );
      }
      setClasses(data || []);
    } catch (err) {
      console.warn('Timetable fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [isFaculty, selectedFacultyId, selectedSectionId, fromDate, toDate, user]);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Class Timetable & Schedule"
        subtitle="Manage daily lecture schedules, recurring timetable blocks, and classroom room allocations."
        actions={
          (isAdmin || isFaculty) && (
            <button
              onClick={() => setIsScheduleOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Schedule Class
            </button>
          )
        }
      />

      {/* Filter Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-3">
        {isAdmin && facultyList.length > 0 && (
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">By Faculty</label>
            <select
              value={selectedFacultyId}
              onChange={(e) => {
                setSelectedFacultyId(e.target.value);
                setSelectedSectionId('');
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">Select Faculty...</option>
              {facultyList.map((f) => (
                <option key={f.id} value={f.id}>
                  Prof. {f.firstName} {f.lastName}
                </option>
              ))}
            </select>
          </div>
        )}

        {sections.length > 0 && (
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">By Section</label>
            <select
              value={selectedSectionId}
              onChange={(e) => {
                setSelectedSectionId(e.target.value);
                if (isAdmin) setSelectedFacultyId('');
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">Select Section...</option>
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  Section {sec.name} ({sec.programName || 'Degree'} · Sem {sec.semester})
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">To Date (Optional)</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading timetable schedule..." />
      ) : (
        <TimetableGrid classes={classes} onStatusChange={fetchTimetable} />
      )}

      {/* SCHEDULE CLASS MODAL */}
      <ScheduleClassModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        assignments={assignments}
        onSuccess={fetchTimetable}
      />
    </div>
  );
}
