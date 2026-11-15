import axiosClient from './axiosClient';

export const classSessionApi = {
  schedule: async (data) => {
    const res = await axiosClient.post('/class-sessions', data);
    return res.data;
  },

  scheduleRecurring: async (data) => {
    const res = await axiosClient.post('/class-sessions/recurring', data);
    return res.data;
  },

  getById: async (id) => {
    const res = await axiosClient.get(`/class-sessions/${id}`);
    return res.data;
  },

  getSectionTimetable: async (sectionId, from = null, to = null) => {
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
    const res = await axiosClient.get(`/sections/${sectionId}/timetable`, { params });
    return res.data;
  },

  getFacultyTimetable: async (facultyId, from = null, to = null) => {
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
    const res = await axiosClient.get(`/faculty/${facultyId}/timetable`, { params });
    return res.data;
  },

  update: async (id, data) => {
    const res = await axiosClient.put(`/class-sessions/${id}`, data);
    return res.data;
  },

  updateStatus: async (id, status) => {
    const res = await axiosClient.patch(`/class-sessions/${id}/status`, { status });
    return res.data;
  },
};

export const attendanceApi = {
  startSession: async (classId, data) => {
    const res = await axiosClient.post(`/class-sessions/${classId}/attendance-session`, data);
    return res.data;
  },

  getRollingQrToken: async (sessionId) => {
    const res = await axiosClient.get(`/attendance-sessions/${sessionId}/qr-token`);
    return res.data;
  },

  stopSession: async (sessionId) => {
    const res = await axiosClient.patch(`/attendance-sessions/${sessionId}/stop`);
    return res.data;
  },

  verifyQr: async (qrToken) => {
    const res = await axiosClient.post('/attendance/verify-qr', { qrToken });
    return res.data;
  },

  completeAttendance: async (data) => {
    const res = await axiosClient.post('/attendance/complete', data);
    return res.data;
  },

  markManual: async (classId, data) => {
    const res = await axiosClient.post(`/class-sessions/${classId}/attendance/manual`, data);
    return res.data;
  },

  getClassAttendance: async (classId) => {
    const res = await axiosClient.get(`/class-sessions/${classId}/attendance`);
    return res.data;
  },

  getMyAttendanceSummary: async (academicSessionId) => {
    const res = await axiosClient.get('/students/me/attendance-summary', {
      params: { academicSessionId },
    });
    return res.data;
  },

  getStudentAttendanceSummary: async (studentId, academicSessionId) => {
    const res = await axiosClient.get(`/students/${studentId}/attendance-summary`, {
      params: { academicSessionId },
    });
    return res.data;
  },
};

export const faceProfileApi = {
  enrollMyFaceProfile: async (data) => {
    const res = await axiosClient.post('/students/me/face-profile', data);
    return res.data;
  },

  getMyFaceProfile: async () => {
    const res = await axiosClient.get('/students/me/face-profile');
    return res.data;
  },

  enrollStudentFaceProfile: async (studentId, data) => {
    const res = await axiosClient.post(`/students/${studentId}/face-profile`, data);
    return res.data;
  },

  getStudentFaceProfile: async (studentId) => {
    const res = await axiosClient.get(`/students/${studentId}/face-profile`);
    return res.data;
  },

  deactivateStudentFaceProfile: async (studentId) => {
    const res = await axiosClient.delete(`/students/${studentId}/face-profile`);
    return res.data;
  },
};
