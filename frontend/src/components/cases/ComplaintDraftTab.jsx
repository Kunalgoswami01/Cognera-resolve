import React from 'react';
import { useOutputStore } from '../../store/useOutputStore';
import { useIntakeStore } from '../../store/useIntakeStore';
import { 
  Sparkles, 
  AlertCircle, 
  RefreshCw, 
  ClipboardCheck, 
  Send,
  FileText,
  AlertTriangle,
  Copy,
  Check
} from 'lucide-react';

const TONE_LABELS = {
  professional_firm: 'Professional Firm Representation',
  polite_formal: 'Polite & Formal Resolution Request',
  escalated_strong: 'Strong Escalation Warning'
};

const TONE_BADGES = {
  professional_firm: 'bg-indigo-950/40 text-indigo-400 border-indigo-800/30',
  polite_formal: 'bg-sky-950/40 text-sky-400 border-sky-800/30',
  escalated_strong: 'bg-rose-950/40 text-rose-400 border-rose-800/30'
};

const CHANNEL_LABELS = {
  email: 'Support Email',
  support_portal: 'Customer Service Portal',
  consumer_forum: 'Consumer Action Board / BBB'
};

const CHANNEL_BADGES = {
  email: 'bg-cyan-950/40 text-cyan-400 border-cyan-800/30',
  support_portal: 'bg-fuchsia-950/40 text-fuchsia-400 border-fuchsia-800/30',
  consumer_forum: 'bg-amber-950/40 text-amber-400 border-amber-800/30'
};

const DEMAND_LABELS = {
  refund: 'Refund Requested',
  replacement: 'Product Replacement',
  repair: 'Product Repair',
  cancellation: 'Account/Contract Cancellation',
  explanation: 'Written Explanation',
  compensation: 'Damage/Fee Compensation'
};

export default function ComplaintDraftTab({ caseId }) {
  const { activeDraft, loading, generating, error, generateDraft } = useOutputStore();
  const { activeIntake } = useIntakeStore();
  const [copied, setCopied] = React.useState(false);

  const handleStartGeneration = async () => {
    try {
      await generateDraft(caseId);
    } catch (e) {
      print(e);
    }
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Loading skeleton state
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center border-b border-slate-900 pb-4">
          <div className="h-6 w-44 bg-slate-900 rounded"></div>
          <div className="h-8 w-28 bg-slate-900 rounded"></div>
        </div>
        <div className="h-4 w-32 bg-slate-900 rounded"></div>
        <div className="h-96 bg-slate-900 rounded-xl"></div>
      </div>
    );
  }

  const draft = activeDraft?.draft;
  const version = activeDraft?.version;
  const generatedAt = activeDraft?.generated_at;
  const hasIntake = !!activeIntake?.analysis;

  return (
    <div className="space-y-6">

      {/* Error Message banner */}
      {error && (
        <div className="p-4 border border-rose-950/40 bg-rose-950/10 rounded-lg flex gap-3">
          <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-rose-300">Complaint Drafting Error</h4>
            <p className="text-[11px] text-rose-400 leading-relaxed">{error}</p>
            <button
              onClick={handleStartGeneration}
              disabled={generating}
              className="px-3 py-1 bg-rose-900/40 hover:bg-rose-900/60 disabled:bg-slate-900/60 text-rose-250 border border-rose-800/40 rounded text-[10.5px] font-semibold transition-colors cursor-pointer"
            >
              Retry Generation
            </button>
          </div>
        </div>
      )}

      {/* 1. Empty / No Draft State */}
      {!draft && !loading && (
        <div className="text-center py-12 bg-slate-950 border border-slate-900 rounded-xl max-w-lg mx-auto px-6 space-y-5">
          <div className="mx-auto h-12 w-12 bg-indigo-950/40 border border-indigo-800/30 text-indigo-400 rounded-full flex items-center justify-center">
            <FileText className="h-6 w-6" />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-bold text-slate-200 text-sm">Generate Complaint escalation Draft</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
              Ready to assemble your formal dispute letter? The AI will compile a professional grievance draft using case details and document records.
            </p>
          </div>

          {!hasIntake && (
            <div className="p-3 border border-amber-950/45 bg-amber-955/5 rounded-lg flex items-start gap-2.5 max-w-md mx-auto text-left">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-400/80 leading-relaxed">
                <strong>Quality Tip:</strong> We recommend running the AI Intake Analysis on the Overview tab first to extract precise facts, but you can still proceed with raw details.
              </p>
            </div>
          )}

          <button
            onClick={handleStartGeneration}
            disabled={generating}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-655 hover:bg-indigo-550 disabled:bg-slate-900 disabled:border-slate-800 disabled:text-slate-500 text-white border border-indigo-500 text-xs font-semibold rounded-lg shadow-md hover:shadow-indigo-500/10 transition-all cursor-pointer font-sans"
          >
            {generating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Assembling Draft...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate Complaint Draft</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* 2. Structured Complaint Draft Render */}
      {draft && (
        <div className="space-y-6">
          
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-900 pb-4 gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-200 text-sm">Escalation Draft Document</h3>
                <span className="text-[10px] bg-slate-900 border border-slate-800 text-indigo-400 px-2 py-0.5 rounded font-mono font-bold">
                  v{version}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">
                Generated: {new Date(generatedAt).toLocaleString()}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleCopyText(`${draft.subject_line}\n\n${draft.draft_markdown}`)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleStartGeneration}
                disabled={generating}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 disabled:bg-slate-900 disabled:text-slate-550 border border-slate-800 hover:border-slate-700 text-indigo-400 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                {generating ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Regenerating...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Regenerate Draft</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Metadata Badges Panel */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className={`text-[10px] border px-2.5 py-1 rounded font-medium ${TONE_BADGES[draft.tone] || TONE_BADGES.polite_formal}`}>
              Tone: {TONE_LABELS[draft.tone] || draft.tone}
            </span>
            <span className={`text-[10px] border px-2.5 py-1 rounded font-medium ${CHANNEL_BADGES[draft.target_channel] || CHANNEL_BADGES.email}`}>
              Channel: {CHANNEL_LABELS[draft.target_channel] || draft.target_channel}
            </span>
          </div>

          {/* Key Demands List */}
          <div className="space-y-2">
            <h4 className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Grievance Resolutions Demanded</h4>
            <div className="flex flex-wrap gap-2">
              {draft.key_demands.map((demand, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800/80 rounded-lg text-xs text-slate-350 font-medium">
                  <ClipboardCheck className="h-3.5 w-3.5 text-indigo-400" />
                  <span>{DEMAND_LABELS[demand] || demand}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Missing Disclaimer warning card */}
          {draft.missing_disclaimer && (
            <div className="p-4 border border-amber-950/40 bg-amber-950/5 rounded-xl flex gap-3 items-start">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h5 className="text-[11px] font-bold text-amber-400">Assumptions & Missing Case Details</h5>
                <p className="text-[10.5px] text-amber-450 leading-relaxed">{draft.missing_disclaimer}</p>
              </div>
            </div>
          )}

          {/* Subject Line Bar */}
          <div className="space-y-2">
            <h4 className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Subject Header</h4>
            <div className="bg-slate-900/40 border border-slate-900 p-3.5 rounded-xl text-xs font-bold text-slate-200">
              {draft.subject_line}
            </div>
          </div>

          {/* Main Draft Markdown Preview */}
          <div className="space-y-2">
            <h4 className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Formal Escalation Letter Preview</h4>
            <div className="bg-slate-950 border border-slate-900 p-6 rounded-xl shadow-inner min-h-[300px] leading-relaxed">
              <p className="text-xs text-slate-350 font-sans whitespace-pre-wrap">
                {draft.draft_markdown}
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
