import axiosClient from './axiosClient';

export const subjectApi = {
  getByDepartmentProgram: async (departmentProgramId, semester = null) => {
    const params = semester ? { semester } : {};
    const res = await axiosClient.get(`/department-programs/${departmentProgramId}/subjects`, { params });
    return res.data;
  },

  getById: async (id) => {
    const res = await axiosClient.get(`/subjects/${id}`);
    return res.data;
  },

  create: async (departmentProgramId, data) => {
    const res = await axiosClient.post(`/department-programs/${departmentProgramId}/subjects`, data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await axiosClient.put(`/subjects/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await axiosClient.delete(`/subjects/${id}`);
    return res.data;
  },
};

export const sectionApi = {
  getById: async (id) => {
    const res = await axiosClient.get(`/sections/${id}`);
    return res.data;
  },

  getBySession: async (sessionId) => {
    const res = await axiosClient.get(`/academic-sessions/${sessionId}/sections`);
    return res.data;
  },

  getSections: async ({ departmentProgramId, academicSessionId, semester }) => {
    const res = await axiosClient.get('/sections', {
      params: { departmentProgramId, academicSessionId, semester },
    });
    return res.data;
  },

  create: async (data) => {
    const res = await axiosClient.post('/sections', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await axiosClient.put(`/sections/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await axiosClient.delete(`/sections/${id}`);
    return res.data;
  },
};
