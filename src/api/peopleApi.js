import axiosClient from './axiosClient';

export const studentApi = {
  getByCollege: async (collegeId) => {
    const res = await axiosClient.get(`/colleges/${collegeId}/students`);
    return res.data;
  },

  getByDepartment: async (departmentId) => {
    const res = await axiosClient.get(`/departments/${departmentId}/students`);
    return res.data;
  },

  getById: async (id) => {
    const res = await axiosClient.get(`/students/${id}`);
    return res.data;
  },

  create: async (collegeId, data) => {
    const res = await axiosClient.post(`/colleges/${collegeId}/students`, data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await axiosClient.put(`/students/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await axiosClient.delete(`/students/${id}`);
    return res.data;
  },
};

export const facultyApi = {
  getByCollege: async (collegeId) => {
    const res = await axiosClient.get(`/colleges/${collegeId}/faculty`);
    return res.data;
  },

  getByDepartment: async (departmentId) => {
    const res = await axiosClient.get(`/departments/${departmentId}/faculty`);
    return res.data;
  },

  getById: async (id) => {
    const res = await axiosClient.get(`/faculty/${id}`);
    return res.data;
  },

  create: async (collegeId, data) => {
    const res = await axiosClient.post(`/colleges/${collegeId}/faculty`, data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await axiosClient.put(`/faculty/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await axiosClient.delete(`/faculty/${id}`);
    return res.data;
  },
};

export const teachingAssignmentApi = {
  create: async (data) => {
    const res = await axiosClient.post('/teaching-assignments', data);
    return res.data;
  },

  getByFaculty: async (facultyId) => {
    const res = await axiosClient.get(`/faculty/${facultyId}/teaching-assignments`);
    return res.data;
  },

  getByFacultyAndSession: async (facultyId, sessionId) => {
    const res = await axiosClient.get(`/faculty/${facultyId}/teaching-assignments/session/${sessionId}`);
    return res.data;
  },

  getBySection: async (sectionId) => {
    const res = await axiosClient.get(`/sections/${sectionId}/teaching-assignments`);
    return res.data;
  },

  delete: async (id) => {
    const res = await axiosClient.delete(`/teaching-assignments/${id}`);
    return res.data;
  },
};

export const enrollmentApi = {
  enrollStudent: async (sectionId, studentId) => {
    const res = await axiosClient.post(`/sections/${sectionId}/enrollments`, { studentId });
    return res.data;
  },

  enrollBulk: async (sectionId, studentIds) => {
    const res = await axiosClient.post(`/sections/${sectionId}/enrollments/bulk`, { studentIds });
    return res.data;
  },

  getBySection: async (sectionId) => {
    const res = await axiosClient.get(`/sections/${sectionId}/enrollments`);
    return res.data;
  },

  getByStudent: async (studentId) => {
    const res = await axiosClient.get(`/students/${studentId}/enrollments`);
    return res.data;
  },

  unenrollStudent: async (sectionId, studentId) => {
    const res = await axiosClient.delete(`/sections/${sectionId}/enrollments/${studentId}`);
    return res.data;
  },
};
