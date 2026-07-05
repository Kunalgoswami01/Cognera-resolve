import { create } from 'zustand';
import { caseService } from '../services/caseService';
import { MOCK_CASES } from '../mocks/cases';

export const useCaseStore = create((set, get) => ({
  cases: [], // Initialize empty for real backend-first flow
  activeCase: null,
  loading: false,
  creating: false,
  updating: false,
  error: null,

  fetchCases: async () => {
    set({ loading: true, error: null });
    try {
      const data = await caseService.getCases();
      // On success, set cases directly to API response (even if empty list)
      set({ cases: Array.isArray(data) ? data : [], loading: false });
    } catch (err) {
      console.warn('Backend API connection failed. Falling back to mock data for offline development.');
      set({ cases: MOCK_CASES, loading: false });
    }
  },

  fetchCaseById: async (caseId) => {
    set({ loading: true, error: null });
    
    // Quick local lookup
    const localCase = get().cases.find((c) => c.id === caseId);
    if (localCase) {
      set({ activeCase: localCase });
    } else {
      set({ activeCase: null });
    }
    
    try {
      const data = await caseService.getCaseById(caseId);
      if (data) {
        set({ activeCase: data, loading: false });
        // Update local list
        set((state) => ({
          cases: state.cases.map((c) => (c.id === caseId ? data : c)),
        }));
      }
    } catch (err) {
      console.warn(`Backend API lookup failed for case ${caseId}.`);
      if (localCase) {
        set({ loading: false });
      } else {
        // Check mock cases as fallback
        const mockCase = MOCK_CASES.find((c) => c.id === caseId);
        if (mockCase) {
          set({ activeCase: mockCase, loading: false });
        } else {
          set({ error: 'Case not found', loading: false });
        }
      }
    }
  },

  createCase: async (caseData) => {
    set({ creating: true, error: null });
    try {
      const newCase = await caseService.createCase(caseData);
      set((state) => ({
        cases: [newCase, ...state.cases],
        activeCase: newCase,
        creating: false,
      }));
      return newCase;
    } catch (err) {
      console.error('Failed to create case on backend. Simulating local creation.');
      const localNewCase = {
        id: `mock-${Date.now()}`,
        status: 'draft',
        current_step: 'case_created',
        readiness_score: 10,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...caseData,
      };
      set((state) => ({
        cases: [localNewCase, ...state.cases],
        activeCase: localNewCase,
        creating: false,
      }));
      return localNewCase;
    }
  },

  updateCase: async (caseId, caseData) => {
    set({ updating: true, error: null });
    try {
      const updatedCase = await caseService.updateCase(caseId, caseData);
      set((state) => ({
        cases: state.cases.map((c) => (c.id === caseId ? updatedCase : c)),
        activeCase: state.activeCase?.id === caseId ? updatedCase : state.activeCase,
        updating: false,
      }));
      return updatedCase;
    } catch (err) {
      console.error('Failed to update case on backend. Simulating local update.');
      const existing = get().cases.find((c) => c.id === caseId) || get().activeCase;
      const updated = {
        ...existing,
        ...caseData,
        updated_at: new Date().toISOString(),
      };
      set((state) => ({
        cases: state.cases.map((c) => (c.id === caseId ? updated : c)),
        activeCase: state.activeCase?.id === caseId ? updated : state.activeCase,
        updating: false,
      }));
      return updated;
    }
  },

  deleteCase: async (caseId) => {
    set({ loading: true, error: null });
    try {
      await caseService.deleteCase(caseId);
      set((state) => ({
        cases: state.cases.filter((c) => c.id !== caseId),
        activeCase: state.activeCase?.id === caseId ? null : state.activeCase,
        loading: false,
      }));
    } catch (err) {
      console.error('Failed to delete case on backend.');
      set((state) => ({
        cases: state.cases.filter((c) => c.id !== caseId),
        activeCase: state.activeCase?.id === caseId ? null : state.activeCase,
        loading: false,
      }));
    }
  },
}));
