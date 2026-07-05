import apiClient from './apiClient';

export const outputService = {
  /**
   * Fetch the latest stored complaint draft for a case.
   * GET /api/cases/{caseId}/outputs/complaint-draft
   */
  getComplaintDraft: async (caseId) => {
    const response = await apiClient.get(`/cases/${caseId}/outputs/complaint-draft`);
    return response.data;
  },

  /**
   * Trigger complaint draft generation/re-generation for a case.
   * POST /api/cases/{caseId}/outputs/complaint-draft
   */
  generateComplaintDraft: async (caseId) => {
    const response = await apiClient.post(`/cases/${caseId}/outputs/complaint-draft`);
    return response.data;
  },
};

export default outputService;
