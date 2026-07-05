import React, { useState, useEffect } from 'react';
import { useDocumentStore } from '../../store/useDocumentStore';
import EmptyState from '../common/EmptyState';
import LoadingSkeleton from '../common/LoadingSkeleton';
import { Upload, Trash2, FileText, FileImage, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

const ALLOWED_MIME_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
const ALLOWED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export default function EvidenceTab({ caseId }) {
  const { documents, loading, uploading, deleting, error: apiError, fetchDocuments, uploadDocument, deleteDocument } = useDocumentStore();
  const [localError, setLocalError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Lazy load documents on component mount
  useEffect(() => {
    if (caseId) {
      fetchDocuments(caseId);
    }
  }, [caseId]);

  // Clear errors after 5 seconds
  useEffect(() => {
    if (localError || apiError) {
      const timer = setTimeout(() => {
        setLocalError(null);
        // Reset the apiError in the document store
        useDocumentStore.setState({ error: null });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [localError, apiError]);

  // Format bytes helper
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Pre-validate file helper
  const validateFile = (file) => {
    if (!file) return false;
    
    // Check extension
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension) || !ALLOWED_MIME_TYPES.includes(file.type)) {
      setLocalError("Unsupported file type. Please upload a PDF, PNG, JPG/JPEG, or WEBP image.");
      return false;
    }

    // Check size
    if (file.size > MAX_FILE_SIZE) {
      setLocalError("File size exceeds the 10 MB limit.");
      return false;
    }

    setLocalError(null);
    return true;
  };

  const handleFileUpload = async (file) => {
    if (!validateFile(file)) return;
    try {
      await uploadDocument(caseId, file);
    } catch (err) {
      // API error handled by store state
    }
  };

  // Form input change
  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDelete = async (docId, originalName) => {
    if (window.confirm(`Are you sure you want to delete "${originalName}"?`)) {
      try {
        await deleteDocument(docId);
      } catch (err) {
        // Handled by store error
      }
    }
  };

  const renderFileIcon = (mimeType) => {
    if (mimeType === 'application/pdf') {
      return <FileText className="h-6 w-6 text-red-400 shrink-0" />;
    }
    return <FileImage className="h-6 w-6 text-sky-400 shrink-0" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-200 text-sm">Evidence Vault</h3>
        <span className="text-[10px] text-slate-500 font-mono">Max file size: 10MB</span>
      </div>

      {/* Error Notifications */}
      {(localError || apiError) && (
        <div className="flex items-center gap-3 bg-rose-950/20 border border-rose-900/40 p-4 rounded-lg animate-fade-in text-left">
          <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0" />
          <p className="text-xs text-rose-300 leading-normal">
            {localError || apiError}
          </p>
        </div>
      )}

      {/* Upload Drag Target */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 transition-all relative ${
          dragActive
            ? 'border-sky-500 bg-sky-950/10 scale-[1.01]'
            : 'border-slate-800 bg-slate-900/10 hover:border-slate-700/80'
        } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
      >
        <Upload className={`h-8 w-8 mb-3 transition-colors ${dragActive ? 'text-sky-400' : 'text-slate-500'}`} />
        <p className="text-xs font-semibold text-slate-300">
          {uploading ? 'Uploading your document...' : 'Drag and drop file here, or click to browse'}
        </p>
        <p className="text-[10px] text-slate-500 mt-1.5">
          Supported file extensions: PDF, PNG, JPG, JPEG, WEBP
        </p>

        <label className="mt-4 px-4 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow transition-colors cursor-pointer inline-flex items-center gap-2">
          <span>Browse Files</span>
          <input
            type="file"
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp,application/pdf"
            onChange={handleInputChange}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Uploading Status Overlay */}
      {uploading && (
        <div className="flex items-center justify-center gap-3 py-3 px-4 bg-sky-950/20 border border-sky-900/40 rounded-lg text-sky-400 text-xs font-medium animate-pulse">
          <Clock className="h-4 w-4 animate-spin" />
          <span>Sending file sequentially to backend storage...</span>
        </div>
      )}

      {/* Evidence List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
          <h4 className="text-xs font-semibold text-slate-400">
            Uploaded Documents ({documents.length})
          </h4>
          {deleting && (
            <span className="text-[10px] text-rose-400 font-mono animate-pulse">Deleting file...</span>
          )}
        </div>

        {loading ? (
          <LoadingSkeleton type="list" count={2} />
        ) : documents.length === 0 ? (
          <div className="py-12 border border-slate-900/50 rounded-xl bg-slate-950/10 text-center">
            <p className="text-xs text-slate-500 italic">No evidence uploaded yet. Add transaction receipts, service agreements, or chat transcripts to back your claim.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-850 rounded-lg hover:border-slate-800 transition-colors group text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {renderFileIcon(doc.mime_type)}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate pr-4" title={doc.original_name}>
                      {doc.original_name}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-mono">
                      <span>{formatBytes(doc.file_size)}</span>
                      <span>•</span>
                      <span>{new Date(doc.uploaded_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Status Badge */}
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-semibold border bg-slate-900/80 text-amber-500 border-amber-900/30 uppercase tracking-wider font-mono">
                    <Clock className="h-3 w-3" />
                    <span>{doc.extraction_status}</span>
                  </span>
                  
                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(doc.id, doc.original_name)}
                    disabled={deleting}
                    className="p-1.5 rounded hover:bg-slate-900 text-slate-500 hover:text-rose-500 border border-transparent hover:border-slate-800 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
