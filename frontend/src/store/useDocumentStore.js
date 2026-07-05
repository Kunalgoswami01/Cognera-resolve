import { create } from 'zustand';
import { documentService } from '../services/documentService';

export const useDocumentStore = create((set, get) => ({
  documents: [],
  loading: false,
  uploading: false,
  deleting: false,
  error: null,

  fetchDocuments: async (caseId) => {
    set({ documents: [], loading: true, error: null });
    try {
      const data = await documentService.getDocuments(caseId);
      set({ documents: Array.isArray(data) ? data : [], loading: false });
    } catch (err) {
      console.error('Failed to fetch documents from API:', err);
      set({
        error: err.response?.data?.detail || 'Failed to fetch documents list.',
        loading: false,
      });
    }
  },

  uploadDocument: async (caseId, file) => {
    set({ uploading: true, error: null });
    try {
      const newDoc = await documentService.uploadDocument(caseId, file);
      set((state) => ({
        documents: [newDoc, ...state.documents],
        uploading: false,
      }));
      return newDoc;
    } catch (err) {
      console.error('Failed to upload document to API:', err);
      const errMsg = err.response?.data?.detail || 'Failed to upload document.';
      set({ error: errMsg, uploading: false });
      throw new Error(errMsg);
    }
  },

  deleteDocument: async (documentId) => {
    set({ deleting: true, error: null });
    try {
      await documentService.deleteDocument(documentId);
      set((state) => ({
        documents: state.documents.filter((d) => d.id !== documentId),
        deleting: false,
      }));
    } catch (err) {
      console.error('Failed to delete document from API:', err);
      set({
        error: err.response?.data?.detail || 'Failed to delete document.',
        deleting: false,
      });
      throw err;
    }
  },
}));
export default useDocumentStore;
