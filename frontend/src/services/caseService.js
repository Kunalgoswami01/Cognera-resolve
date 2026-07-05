import apiClient from './apiClient';

export const caseService = {
  getCases: async () => {
    const response = await apiClient.get('/cases');
    return response.data;
  },

  getCaseById: async (caseId) => {
    const response = await apiClient.get(`/cases/${caseId}`);
    return response.data;
  },

  createCase: async (caseData) => {
    const response = await apiClient.post('/cases', caseData);
    return response.data;
  },

  updateCase: async (caseId, caseData) => {
    const response = await apiClient.patch(`/cases/${caseId}`, caseData);
    return response.data;
  },

  deleteCase: async (caseId) => {
    const response = await apiClient.delete(`/cases/${caseId}`);
    return response.data;
  },
};
