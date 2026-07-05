import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCaseStore } from '../store/useCaseStore';
import PageContainer from '../components/layout/PageContainer';
import ReadinessMeter from '../components/common/ReadinessMeter';
import EvidenceTab from '../components/cases/EvidenceTab';
import StatusBadge from '../components/common/StatusBadge';
import SectionCard from '../components/common/SectionCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import {
  ArrowLeft,
  FileText,
  Upload,
  Info,
  Calendar,
  Sparkles,
  CheckCircle2,
  Trash2,
  Edit3,
  ExternalLink,
  Save,
  X,
  AlertCircle
} from 'lucide-react';

import OverviewIntakeTab from '../components/cases/OverviewIntakeTab';
import { useIntakeStore } from '../store/useIntakeStore';
import ComplaintDraftTab from '../components/cases/ComplaintDraftTab';
import { useOutputStore } from '../store/useOutputStore';




export default function CaseWorkspacePage() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { activeCase, loading, error, fetchCaseById, updateCase, deleteCase, updating } = useCaseStore();
  const { activeIntake, fetchIntake, error: intakeError } = useIntakeStore();
  const { fetchDraft } = useOutputStore();



  const [activeTab, setActiveTab] = useState('overview');
  
  // Edit Form States
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editAmount, setEditAmount] = useState('');

  useEffect(() => {
    if (caseId) {
      fetchCaseById(caseId);
      fetchIntake(caseId);
      fetchDraft(caseId);
    }
  }, [caseId, fetchCaseById, fetchIntake, fetchDraft]);



  // Sync edit form states when activeCase loads
  useEffect(() => {
    if (activeCase) {
      setEditTitle(activeCase.title || '');
      setEditCompany(activeCase.company_name || '');
      setEditCategory(activeCase.issue_category || 'other');
      setEditSummary(activeCase.summary || '');
      setEditAmount(activeCase.amount !== null && activeCase.amount !== undefined ? activeCase.amount.toString() : '');
    }
  }, [activeCase]);

  if (loading && !activeCase) {
    return (
      <PageContainer>
        <LoadingSkeleton type="card" count={1} />
      </PageContainer>
    );
  }

  if (error || !activeCase) {
    return (
      <PageContainer>
        <div className="text-center py-12 bg-slate-950 border border-slate-800 rounded-xl max-w-md mx-auto">
          <p className="text-sm text-slate-400">Case file not found or failed to load.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </PageContainer>
    );
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this case file?')) {
      await deleteCase(activeCase.id);
      navigate('/dashboard');
    }
  };

  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    if (!editTitle.trim() || !editCompany.trim()) {
      alert('Title and Company Name are required.');
      return;
    }
    
    await updateCase(activeCase.id, {
      title: editTitle,
      company_name: editCompany,
      issue_category: editCategory,
      summary: editSummary,
      amount: editAmount ? parseFloat(editAmount) : null
    });
    
    setIsEditing(false);
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: FileText },
    { id: 'evidence', name: 'Evidence Vault', icon: Upload },
    { id: 'missing_info', name: 'Missing Info', icon: Info },
    { id: 'timeline', name: 'Timeline', icon: Calendar },
    { id: 'resolution', name: 'Resolution Output', icon: Sparkles },
  ];

  return (
    <PageContainer>
      {/* Top action bar */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 text-rose-500 hover:text-rose-400 transition-colors text-xs font-semibold cursor-pointer border border-rose-950/30 bg-rose-950/10 px-3 py-1.5 rounded-lg"
        >
          <Trash2 className="h-4 w-4" />
          <span>Delete Case</span>
        </button>
      </div>

      {/* 3-Panel Desktop Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= LEFT PANEL (3 cols) ================= */}
        <div className="lg:col-span-3 space-y-6">
          <SectionCard title="Metadata" subtitle="Case classification parameters">
            <div className="space-y-4">
              <div>
                <h4 className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Title</h4>
                <p className="text-sm font-bold text-slate-200 mt-1">{activeCase.title}</p>
              </div>

              <div>
                <h4 className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Merchant</h4>
                <p className="text-xs text-slate-300 mt-1">{activeCase.company_name}</p>
              </div>

              <div>
                <h4 className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Category</h4>
                <p className="text-xs font-mono uppercase text-sky-400 mt-1">{activeCase.issue_category}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <h4 className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Amount</h4>
                  <p className="text-xs text-slate-300 mt-1 font-mono">
                    {activeCase.amount ? `$${activeCase.amount.toFixed(2)}` : 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Purchase Date</h4>
                  <p className="text-xs text-slate-300 mt-1 font-mono">
                    {activeCase.purchase_date ? new Date(activeCase.purchase_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-900 my-4 pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Status</span>
                  <StatusBadge status={activeCase.status} />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Current Step</span>
                  <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                    {activeCase.current_step || 'N/A'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Readiness</span>
                  <span className="text-xs font-bold text-sky-400 font-mono">
                    {activeCase.readiness_score}%
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-900 pt-3 text-[10px] text-slate-500 space-y-1 font-mono">
                <p>Created: {new Date(activeCase.created_at).toLocaleString()}</p>
                <p>Updated: {new Date(activeCase.updated_at).toLocaleString()}</p>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="w-full mt-4 flex items-center justify-center gap-2 py-2 px-3 bg-slate-900 hover:bg-slate-850 active:bg-slate-800 text-sky-400 border border-slate-800 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit Case Details</span>
              </button>
            </div>
          </SectionCard>
        </div>

        {/* ================= CENTER PANEL (6 cols) ================= */}
        <div className="lg:col-span-6 space-y-6">
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-950 rounded-xl p-1 gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-slate-800 text-sky-400 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.name}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Display */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xl min-h-[350px]">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-200 text-sm">Dispute Overview</h3>
                  <p className="text-xs text-slate-400 leading-relaxed bg-slate-900 border border-slate-900 p-4 rounded-lg whitespace-pre-wrap">
                    {activeCase.summary || activeCase.description || 'No detailed description provided.'}
                  </p>
                </div>
                <OverviewIntakeTab caseId={caseId} onNavigateToTab={setActiveTab} />
              </div>
            )}

            {activeTab === 'evidence' && (
              <EvidenceTab caseId={caseId} />
            )}

            {activeTab === 'missing_info' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-200 text-sm">Missing Information Checklist</h3>
                <p className="text-xs text-slate-400">
                  The AI intake analysis scans your case details to identify critical missing information.
                </p>
                {activeIntake?.analysis?.missing_information && activeIntake.analysis.missing_information.length > 0 ? (
                  <div className="space-y-4 mt-2">
                    {activeIntake.analysis.missing_information.map((item, idx) => (
                      <div key={item.key || idx} className="p-4 border border-slate-900 bg-slate-900/20 rounded-xl space-y-2">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-sky-500"></span>
                            <span className="text-xs font-bold text-slate-200">{item.label}</span>
                          </div>
                          <span className={`text-[9px] border px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                            item.priority === 'high' ? 'bg-rose-950/30 text-rose-400 border-rose-900/30' :
                            item.priority === 'medium' ? 'bg-amber-950/30 text-amber-400 border-amber-900/30' :
                            'bg-sky-950/30 text-sky-400 border-sky-900/30'
                          }`}>
                            {item.priority} Priority
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed pl-4">
                          <strong className="text-slate-500 font-semibold">Reason:</strong> {item.reason}
                        </p>
                        {item.suggested_user_prompt && (
                          <div className="pl-4 pt-1">
                            <div className="bg-slate-950/60 border border-slate-900 p-2.5 rounded-lg text-xs text-sky-400 flex items-start gap-2">
                              <span className="text-[10px] text-slate-500 font-bold uppercase shrink-0 mt-0.5 font-mono">Suggested Prompt:</span>
                              <p className="italic text-slate-300">"{item.suggested_user_prompt}"</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : activeIntake?.analysis ? (
                  <div className="p-6 border border-emerald-950 bg-emerald-950/10 rounded-xl text-center space-y-2 max-w-md mx-auto">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                    <h4 className="text-xs font-bold text-emerald-400">All Information Complete</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      No missing facts or items were identified. Your case is ready for letter draft generation.
                    </p>
                  </div>
                ) : intakeError ? (
                  <div className="p-4 border border-rose-950/40 bg-rose-950/10 rounded-lg flex gap-3">
                    <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-rose-300">Audit Status Error</h4>
                      <p className="text-[11px] text-rose-400 leading-relaxed">{intakeError}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border border-slate-800 bg-slate-900/30 rounded-lg flex items-start gap-3">
                    <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-semibold text-slate-300">Audit Not Triggered</h4>
                      <p className="text-[10.5px] text-slate-500 mt-1">
                        Please run the AI Intake Analysis on the Overview tab first to audit missing claim details.
                      </p>
                    </div>
                  </div>
                )}

              </div>
            )}


            {activeTab === 'timeline' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-200 text-sm">Dispute Chronology</h3>
                <p className="text-xs text-slate-400">
                  A visual timeline showing dates and actions will build automatically from your case documents.
                </p>
                <div className="relative pl-6 border-l-2 border-slate-850 space-y-6 py-2 ml-3">
                  <div className="relative">
                    <span className="absolute -left-[31px] top-1 bg-slate-900 border-2 border-sky-500 h-4.5 w-4.5 rounded-full flex items-center justify-center">
                      <span className="h-1.5 w-1.5 bg-sky-500 rounded-full"></span>
                    </span>
                    <h4 className="text-xs font-semibold text-slate-300">Case Created</h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {new Date(activeCase.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">Dispute record successfully initialized in the system.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'resolution' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-200 text-sm">Resolution Drafting Workspace</h3>
                <p className="text-xs text-slate-400">
                  Generate and preview your formal consumer escalation draft. Copy the compiled text to submit it to the merchant.
                </p>
                <ComplaintDraftTab caseId={caseId} />
              </div>
            )}

          </div>
        </div>

        {/* ================= RIGHT PANEL (3 cols) ================= */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Readiness Meter Gauge */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completeness Meter</h3>
            <ReadinessMeter score={activeCase.readiness_score} />
          </div>

          {/* Core Checklist */}
          <SectionCard title="Action Items" subtitle="Dispute checklist status">
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-300">Dispute details saved</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="h-4.5 w-4.5 rounded-full border-2 border-slate-800 shrink-0 mt-0.5"></span>
                <span className="text-xs text-slate-500">Provide missing answers</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="h-4.5 w-4.5 rounded-full border-2 border-slate-800 shrink-0 mt-0.5"></span>
                <span className="text-xs text-slate-500">Upload evidence documents</span>
              </div>
            </div>
          </SectionCard>

          {/* Recent Activity Log */}
          <SectionCard title="Recent Activity" subtitle="Auditing logs">
            <div className="space-y-3 text-[11px]">
              <div className="border-l-2 border-sky-900 pl-2">
                <p className="text-slate-300 font-medium">Case Initialized</p>
                <span className="text-[9px] text-slate-500 font-mono">Just now</span>
              </div>
            </div>
          </SectionCard>

          {/* Quick Actions */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick Actions</h3>
            <button className="w-full py-2 px-3 text-left border border-slate-800 hover:bg-slate-900 rounded-lg flex items-center justify-between text-xs text-slate-300 transition-colors cursor-pointer">
              <span>View Documents</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* ================= EDIT MODAL OVERLAY ================= */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fade-in text-left">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm">Edit Dispute Case Details</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveUpdate} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Case Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Merchant Name
                  </label>
                  <input
                    type="text"
                    value={editCompany}
                    onChange={(e) => setEditCompany(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                  >
                    <option value="retail">Retail / E-Commerce</option>
                    <option value="utilities">Utilities</option>
                    <option value="telecom">Telecom & Internet</option>
                    <option value="financial">Financial / Credit Cards</option>
                    <option value="other">Other Grievances</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Disputed Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Explanation / Summary
                </label>
                <textarea
                  rows={4}
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-1.5 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow transition-colors cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{updating ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
