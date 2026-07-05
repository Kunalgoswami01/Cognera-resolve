import apiClient from './apiClient';

export const intakeService = {
  /**
   * Fetch the latest stored intake analysis for a case.
   * GET /api/cases/{caseId}/intake
   */
  getIntakeAnalysis: async (caseId) => {
    const response = await apiClient.get(`/cases/${caseId}/intake`);
    return response.data;
  },

  /**
   * Trigger intake analysis for a case.
   * POST /api/cases/{caseId}/intake/analyze
   */
  analyzeCase: async (caseId) => {
    const response = await apiClient.post(`/cases/${caseId}/intake/analyze`);
    return response.data;
  },
};
