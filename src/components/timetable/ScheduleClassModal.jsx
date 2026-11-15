import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { classSessionApi } from '../../api/timetableAndAttendanceApi';
import { getErrorMessage } from '../../api/axiosClient';
import toast from 'react-hot-toast';

export function ScheduleClassModal({ isOpen, onClose, assignments = [], onSuccess }) {
  const [isRecurring, setIsRecurring] = useState(false);
  const [loading, setLoading] = useState(false);

  // Single schedule fields
  const [teachingAssignmentId, setTeachingAssignmentId] = useState('');
  const [classDate, setClassDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [room, setRoom] = useState('');

  // Recurring fields
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('MONDAY');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teachingAssignmentId) {
      toast.error('Please select a teaching assignment');
      return;
    }

    setLoading(true);
    try {
      if (isRecurring) {
        if (!endDate) {
          toast.error('End date is required for recurring schedule');
          setLoading(false);
          return;
        }

        await classSessionApi.scheduleRecurring({
          teachingAssignmentId: Number(teachingAssignmentId),
          dayOfWeek,
          startTime: `${startTime}:00`,
          endTime: `${endTime}:00`,
          startDate,
          endDate,
          room: room || null,
        });
        toast.success('Recurring timetable schedule generated successfully!');
      } else {
        await classSessionApi.schedule({
          teachingAssignmentId: Number(teachingAssignmentId),
          classDate,
          startTime: `${startTime}:00`,
          endTime: `${endTime}:00`,
          room: room || null,
        });
        toast.success('Class scheduled successfully!');
      }

      onSuccess();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isRecurring ? 'Schedule Recurring Classes' : 'Schedule Single Class'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type toggle */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setIsRecurring(false)}
            className={`flex-1 py-1.5 rounded-lg transition ${
              !isRecurring
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Single Lecture
          </button>
          <button
            type="button"
            onClick={() => setIsRecurring(true)}
            className={`flex-1 py-1.5 rounded-lg transition ${
              isRecurring
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Recurring Term Timetable
          </button>
        </div>

        {/* Teaching Assignment Select */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Subject & Section Assignment *
          </label>
          <select
            required
            value={teachingAssignmentId}
            onChange={(e) => setTeachingAssignmentId(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select an allocation...</option>
            {assignments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.subjectName} ({a.subjectCode}) — {a.sectionName} (Prof. {a.facultyName})
              </option>
            ))}
          </select>
        </div>

        {isRecurring ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
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
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Day of Week *
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="MONDAY">Monday</option>
                <option value="TUESDAY">Tuesday</option>
                <option value="WEDNESDAY">Wednesday</option>
                <option value="THURSDAY">Thursday</option>
                <option value="FRIDAY">Friday</option>
                <option value="SATURDAY">Saturday</option>
              </select>
            </div>
          </>
        ) : (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Class Date *
            </label>
            <input
              type="date"
              required
              value={classDate}
              onChange={(e) => setClassDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Start Time *
            </label>
            <input
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              End Time *
            </label>
            <input
              type="time"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Room / Hall / Lab Number
          </label>
          <input
            type="text"
            placeholder="e.g. Lab 304, Lecture Hall B"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/25 disabled:opacity-50"
          >
            {loading ? 'Scheduling...' : 'Save Timetable Entry'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
