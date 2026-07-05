import { create } from 'zustand';
import { outputService } from '../services/outputService';

export const useOutputStore = create((set, get) => ({
  activeDraft: null,    // Stores wrapper: { draft, version, generated_at }
  loading: false,       // GET loading state
  generating: false,    // POST generating state
  error: null,          // API errors

  /**
   * Fetches the latest stored complaint draft for the case.
   * Immediately resets activeDraft and error to prevent stale data leaks across cases.
   */
  fetchDraft: async (caseId) => {
    // Reset activeDraft immediately to avoid flashing case A data when opening case B
    set({ activeDraft: null, loading: true, error: null });
    
    try {
      const data = await outputService.getComplaintDraft(caseId);
      set({ activeDraft: data, loading: false });
    } catch (err) {
      const responseStatus = err.response?.status;
      const detail = err.response?.data?.detail;
      
      // Distinguish between clean "no draft yet" 404 and real errors
      if (responseStatus === 404 && detail === "Complaint draft not found for this case") {
        set({ activeDraft: null, loading: false, error: null });
      } else {
        const errMsg = detail || 'Failed to retrieve complaint draft.';
        set({ activeDraft: null, error: errMsg, loading: false });
      }
    }
  },

  /**
   * Generates or regenerates the complaint draft.
   * Keeps existing draft visible during the request and preserves it if the run fails.
   */
  generateDraft: async (caseId) => {
    // Keep existing activeDraft visible during the request
    set({ generating: true, error: null });
    
    try {
      const data = await outputService.generateComplaintDraft(caseId);
      set({ activeDraft: data, generating: false, error: null });
      return data;
    } catch (err) {
      console.error('Failed to generate complaint draft:', err);
      const errMsg = err.response?.data?.detail || 'Complaint draft generation failed.';
      // Note: We DO NOT wipe activeDraft on failure, preserving the old draft
      set({ error: errMsg, generating: false });
      throw new Error(errMsg);
    }
  },

  /**
   * Clears any active error state.
   */
  clearError: () => set({ error: null })
}));

export default useOutputStore;
