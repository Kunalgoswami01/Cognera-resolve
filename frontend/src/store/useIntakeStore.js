import { create } from 'zustand';
import { intakeService } from '../services/intakeService';

export const useIntakeStore = create((set, get) => ({
  activeIntake: null, // Stores wrapper: { analysis, version, generated_at }
  loading: false,     // GET loading state
  analyzing: false,   // POST analyze state
  error: null,        // API errors

  /**
   * Fetches the latest stored intake analysis for the specified case.
   * Immediately resets activeIntake and error to prevent stale analysis leakage.
   */
  fetchIntake: async (caseId) => {
    // Reset activeIntake immediately to avoid flashing case A data when opening case B
    set({ activeIntake: null, loading: true, error: null });
    
    try {
      const data = await intakeService.getIntakeAnalysis(caseId);
      set({ activeIntake: data, loading: false });
    } catch (err) {
      const responseStatus = err.response?.status;
      const detail = err.response?.data?.detail;
      
      // Distinguish between clean "no analysis yet" 404 and real "case not found" 404
      if (responseStatus === 404 && detail === "Intake analysis not found for this case") {
        set({ activeIntake: null, loading: false, error: null });
      } else {
        const errMsg = detail || 'Failed to retrieve intake analysis.';
        set({ activeIntake: null, error: errMsg, loading: false });
      }
    }
  },

  /**
   * Runs the intake analysis for a case.
   * Keeps existing analysis visible during the run and preserves it if re-analysis fails.
   */
  analyzeCase: async (caseId) => {
    // Keep existing activeIntake visible during the request
    set({ analyzing: true, error: null });
    
    try {
      const data = await intakeService.analyzeCase(caseId);
      set({ activeIntake: data, analyzing: false, error: null });
      return data;
    } catch (err) {
      console.error('Failed to run intake analysis:', err);
      const errMsg = err.response?.data?.detail || 'Intake analysis failed.';
      // Note: We DO NOT wipe activeIntake on failure, preserving the old analysis
      set({ error: errMsg, analyzing: false });
      throw new Error(errMsg);
    }
  },

  /**
   * Clears any active error state.
   */
  clearError: () => set({ error: null })
}));

export default useIntakeStore;
