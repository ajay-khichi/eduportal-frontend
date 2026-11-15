import axiosClient from './axiosClient';

export const authApi = {
  login: async (credentials) => {
    const response = await axiosClient.post('/auth/login', credentials);
    return response.data;
  },

  register: async (data) => {
    const response = await axiosClient.post('/auth/register', data);
    return response.data;
  },

  refresh: async (refreshToken) => {
    const response = await axiosClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  logout: async (refreshToken) => {
    const response = await axiosClient.post('/auth/logout', { refreshToken });
    return response.data;
  },
};

export const userApi = {
  getCurrentUser: async () => {
    const response = await axiosClient.get('/users/me');
    return response.data;
  },

  changePassword: async (data) => {
    const response = await axiosClient.patch('/users/change-password', data);
    return response.data;
  },

  revokeAllSessions: async () => {
    const response = await axiosClient.post('/users/sessions/revoke-all');
    return response.data;
  },
};
