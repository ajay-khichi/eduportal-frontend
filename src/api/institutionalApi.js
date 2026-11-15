import axiosClient from './axiosClient';

export const collegeApi = {
  getAll: async () => {
    const res = await axiosClient.get('/colleges');
    return res.data;
  },

  getById: async (id) => {
    const res = await axiosClient.get(`/colleges/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await axiosClient.post('/colleges', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await axiosClient.put(`/colleges/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await axiosClient.delete(`/colleges/${id}`);
    return res.data;
  },

  assignAdmin: async (id, data) => {
    const res = await axiosClient.post(`/colleges/${id}/assign-admin`, data);
    return res.data;
  },
};

export const departmentApi = {
  getByCollege: async (collegeId) => {
    const res = await axiosClient.get(`/colleges/${collegeId}/departments`);
    return res.data;
  },

  getById: async (id) => {
    const res = await axiosClient.get(`/departments/${id}`);
    return res.data;
  },

  create: async (collegeId, data) => {
    const res = await axiosClient.post(`/colleges/${collegeId}/departments`, data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await axiosClient.put(`/departments/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await axiosClient.delete(`/departments/${id}`);
    return res.data;
  },

  assignHod: async (id, data) => {
    const res = await axiosClient.put(`/departments/${id}/assign-hod`, data);
    return res.data;
  },
};

export const programApi = {
  getAll: async () => {
    const res = await axiosClient.get('/programs');
    return res.data;
  },

  getById: async (id) => {
    const res = await axiosClient.get(`/programs/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await axiosClient.post('/programs', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await axiosClient.put(`/programs/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await axiosClient.delete(`/programs/${id}`);
    return res.data;
  },

  assignToDepartment: async (deptId, programId) => {
    const res = await axiosClient.post(`/departments/${deptId}/programs/${programId}`);
    return res.data;
  },

  getByDepartment: async (deptId) => {
    const res = await axiosClient.get(`/departments/${deptId}/programs`);
    return res.data;
  },

  removeDepartmentProgram: async (departmentProgramId) => {
    const res = await axiosClient.delete(`/department-programs/${departmentProgramId}`);
    return res.data;
  },
};

export const academicSessionApi = {
  getByCollege: async (collegeId) => {
    const res = await axiosClient.get(`/colleges/${collegeId}/academic-sessions`);
    return res.data;
  },

  getCurrent: async (collegeId) => {
    const res = await axiosClient.get(`/colleges/${collegeId}/academic-sessions/current`);
    return res.data;
  },

  getById: async (id) => {
    const res = await axiosClient.get(`/academic-sessions/${id}`);
    return res.data;
  },

  create: async (collegeId, data) => {
    const res = await axiosClient.post(`/colleges/${collegeId}/academic-sessions`, data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await axiosClient.put(`/academic-sessions/${id}`, data);
    return res.data;
  },

  setCurrent: async (collegeId, sessionId) => {
    const res = await axiosClient.patch(`/colleges/${collegeId}/academic-sessions/${sessionId}/set-current`);
    return res.data;
  },

  delete: async (id) => {
    const res = await axiosClient.delete(`/academic-sessions/${id}`);
    return res.data;
  },
};
