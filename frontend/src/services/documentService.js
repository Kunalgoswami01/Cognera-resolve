import apiClient from './apiClient';

export const documentService = {
  getDocuments: async (caseId) => {
    const response = await apiClient.get(`/cases/${caseId}/documents`);
    return response.data;
  },

  uploadDocument: async (caseId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(`/cases/${caseId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteDocument: async (documentId) => {
    const response = await apiClient.delete(`/documents/${documentId}`);
    return response.data;
  },
};
export default documentService;
