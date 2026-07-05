import React, { useEffect } from 'react';
import { useIntakeStore } from '../../store/useIntakeStore';
import { 
  Sparkles, 
  AlertCircle, 
  RefreshCw, 
  ClipboardList, 
  CheckCircle2, 
  HelpCircle,
  FileCheck,
  Coins
} from 'lucide-react';

const CATEGORY_LABELS = {
  refund_delay: 'Refund Delay',
  defective_product: 'Defective Product',
  warranty_claim: 'Warranty Claim',
  billing_dispute: 'Billing Dispute',
  delivery_issue: 'Delivery Issue',
  subscription_problem: 'Subscription Problem',
  service_quality_issue: 'Service Quality Issue',
  other: 'Other Grievance'
};

const CATEGORY_BADGES = {
  refund_delay: 'bg-amber-950/40 text-amber-400 border-amber-800/30',
  defective_product: 'bg-rose-950/40 text-rose-400 border-rose-800/30',
  warranty_claim: 'bg-indigo-950/40 text-indigo-400 border-indigo-800/30',
  billing_dispute: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/30',
  delivery_issue: 'bg-cyan-950/40 text-cyan-400 border-cyan-800/30',
  subscription_problem: 'bg-fuchsia-950/40 text-fuchsia-400 border-fuchsia-800/30',
  service_quality_issue: 'bg-blue-950/40 text-blue-400 border-blue-800/30',
  other: 'bg-slate-900/60 text-slate-400 border-slate-800'
};

const PRIORITY_BADGES = {
  high: 'bg-rose-950/30 text-rose-400 border-rose-900/30',
  medium: 'bg-amber-950/30 text-amber-400 border-amber-900/30',
  low: 'bg-sky-950/30 text-sky-400 border-sky-900/30'
};

export default function OverviewIntakeTab({ caseId, onNavigateToTab }) {
  const { activeIntake, loading, analyzing, error, fetchIntake, analyzeCase, clearError } = useIntakeStore();

  // Intake fetch is managed at the parent CaseWorkspacePage level to avoid redundant calls during tab switching


  const handleStartAnalysis = async () => {
    try {
      await analyzeCase(caseId);
    } catch (e) {
      console.error(e);
    }
  };

  // Loading skeleton state
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center border-b border-slate-900 pb-4">
          <div className="h-6 w-40 bg-slate-900 rounded"></div>
          <div className="h-8 w-24 bg-slate-900 rounded"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 w-32 bg-slate-900 rounded"></div>
          <div className="h-24 bg-slate-900 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 bg-slate-900 rounded-lg"></div>
          <div className="h-20 bg-slate-900 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // Check if we have data or an error
  const analysis = activeIntake?.analysis;
  const version = activeIntake?.version;
  const generatedAt = activeIntake?.generated_at;

  return (
    <div className="space-y-6">
      
      {/* Error Message banner (if exists) */}
      {error && (
        <div className="p-4 border border-rose-950/40 bg-rose-950/10 rounded-lg flex gap-3">
          <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-rose-300">Intake Analysis Error</h4>
            <p className="text-[11px] text-rose-400 leading-relaxed">{error}</p>
            <button
              onClick={handleStartAnalysis}
              disabled={analyzing}
              className="px-3 py-1 bg-rose-900/40 hover:bg-rose-900/60 disabled:bg-slate-900/60 disabled:text-slate-650 text-rose-250 border border-rose-800/40 rounded text-[10.5px] font-semibold transition-colors cursor-pointer"
            >
              Retry Analysis
            </button>
          </div>
        </div>
      )}

      {/* 1. Empty / No Analysis State */}
      {!analysis && !loading && (
        <div className="text-center py-10 bg-slate-950 border border-slate-900 rounded-xl max-w-lg mx-auto px-6 space-y-4">
          <div className="mx-auto h-12 w-12 bg-sky-950/40 border border-sky-800/30 text-sky-400 rounded-full flex items-center justify-center">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-slate-200 text-sm">Run AI Case Analysis</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
              This case hasn't been parsed by the Cognera agent yet. Run the intake engine to categorize claims, map transaction facts, and audit missing information.
            </p>
          </div>
          <button
            onClick={handleStartAnalysis}
            disabled={analyzing}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-900 disabled:border-slate-800 disabled:text-slate-500 text-white border border-sky-500 text-xs font-semibold rounded-lg shadow-md hover:shadow-sky-500/10 transition-all cursor-pointer"
          >
            {analyzing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Running Analysis...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Analyze Case</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* 2. Structured Intake Analysis Dashboard */}
      {analysis && (
        <div className="space-y-6">
          
          {/* Analysis Header Block */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-900 pb-4 gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-200 text-sm">Intake Analysis</h3>
                <span className="text-[10px] bg-slate-900 border border-slate-800 text-sky-400 px-2 py-0.5 rounded font-mono font-bold">
                  v{version}
                </span>
                <span className={`text-[10px] border px-2 py-0.5 rounded font-medium ${CATEGORY_BADGES[analysis.normalized_issue_category] || CATEGORY_BADGES.other}`}>
                  {CATEGORY_LABELS[analysis.normalized_issue_category] || analysis.normalized_issue_category}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">
                Generated: {new Date(generatedAt).toLocaleString()}
              </p>
            </div>
            
            <button
              onClick={handleStartAnalysis}
              disabled={analyzing}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 disabled:bg-slate-900 disabled:text-slate-550 border border-slate-800 hover:border-slate-700 text-sky-400 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Re-analyzing...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Re-run Analysis</span>
                </>
              )}
            </button>
          </div>

          {/* Case Summary Panel */}
          <div className="space-y-2">
            <h4 className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Executive Case Summary</h4>
            <div className="text-xs text-slate-350 leading-relaxed bg-slate-900/40 border border-slate-900 p-4 rounded-xl">
              {analysis.case_summary}
            </div>
          </div>

          {/* Extracted Facts Grid */}
          <div className="space-y-2">
            <h4 className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Extracted Transaction Facts</h4>
            <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries({
                  'Merchant/Company': analysis.extracted_facts.company_name,
                  'Product/Service': analysis.extracted_facts.product_or_service,
                  'Purchase Date': analysis.extracted_facts.purchase_date,
                  'Incident Date': analysis.extracted_facts.incident_date,
                  'Disputed Amount': analysis.extracted_facts.amount ? `$${analysis.extracted_facts.amount}` : null,
                  'Order/Invoice Reference': analysis.extracted_facts.order_reference_if_known,
                  'Issue Details': analysis.extracted_facts.issue_description,
                  'Customer Resolution Goal': analysis.extracted_facts.customer_goal_if_known,
                }).map(([label, val]) => {
                  // Hide missing or unknown fields cleanly
                  if (!val || val === 'unknown' || val === 'null' || val === 'None') return null;
                  return (
                    <div key={label} className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-semibold">{label}</span>
                      <p className="text-xs text-slate-300 font-medium">{val}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Missing Information Compact Preview */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Missing Information Preview</h4>
              <button 
                onClick={() => onNavigateToTab('missing_info')}
                className="text-[10px] text-sky-400 hover:text-sky-300 transition-colors font-semibold"
              >
                View Full Audit Tab →
              </button>
            </div>
            
            <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-4 space-y-3">
              {analysis.missing_information && analysis.missing_information.length > 0 ? (
                <>
                  <div className="space-y-2">
                    {analysis.missing_information.map((item, idx) => (
                      <div key={item.key || idx} className="flex items-center justify-between py-1 border-b border-slate-900/60 last:border-0">
                        <div className="flex items-center gap-2">
                          <ClipboardList className="h-3.5 w-3.5 text-slate-500" />
                          <span className="text-xs text-slate-300 font-medium">{item.label}</span>
                        </div>
                        <span className={`text-[9px] border px-2 py-0.5 rounded font-bold uppercase tracking-wider ${PRIORITY_BADGES[item.priority] || PRIORITY_BADGES.low}`}>
                          {item.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10.5px] text-slate-500 italic mt-2">
                    Full checklist details, reasons, and suggested responses are listed on the **Missing Info** tab.
                  </p>
                </>
              ) : (
                <div className="flex items-center gap-2 text-emerald-500 py-1">
                  <CheckCircle2 className="h-4.5 w-4.5" />
                  <span className="text-xs font-semibold">All case facts are complete. No missing details flagged.</span>
                </div>
              )}
            </div>
          </div>

          {/* Evidence Assessment Panel */}
          <div className="space-y-2">
            <h4 className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Evidence Assessment</h4>
            <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900/60 pb-3">
                <span className="text-xs text-slate-400 font-medium">Uploaded Documents Metadata Count:</span>
                <span className="text-xs text-slate-200 font-mono font-bold bg-slate-900 px-2 py-0.5 border border-slate-800 rounded">
                  {analysis.evidence_assessment.uploaded_documents_count} Files
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Likely Evidence Present (from names/type)</span>
                  {analysis.evidence_assessment.likely_evidence_present && analysis.evidence_assessment.likely_evidence_present.length > 0 ? (
                    <ul className="space-y-1.5">
                      {analysis.evidence_assessment.likely_evidence_present.map((e, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-slate-350 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                          <span>{e}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[11px] text-slate-600 italic">No evidence detected.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Recommended Missing Evidence</span>
                  {analysis.evidence_assessment.likely_evidence_missing && analysis.evidence_assessment.likely_evidence_missing.length > 0 ? (
                    <ul className="space-y-1.5">
                      {analysis.evidence_assessment.likely_evidence_missing.map((e, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-slate-355">
                          <HelpCircle className="h-3.5 w-3.5 text-rose-455 shrink-0" />
                          <span className="text-slate-400">{e}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[11px] text-emerald-600 italic">No missing evidence recommended.</p>
                  )}
                </div>
              </div>

              {analysis.evidence_assessment.notes && (
                <div className="border-t border-slate-900/60 pt-3">
                  <span className="text-[10px] text-slate-500 font-semibold">Assessor Notes</span>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-900/40">
                    {analysis.evidence_assessment.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Next Questions Panel */}
          <div className="space-y-2">
            <h4 className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Recommended Follow-up Questions</h4>
            <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-4">
              {analysis.next_questions && analysis.next_questions.length > 0 ? (
                <ul className="space-y-2.5">
                  {analysis.next_questions.map((q, idx) => (
                    <li key={idx} className="flex gap-2.5 items-start">
                      <span className="h-5 w-5 rounded-full bg-slate-905 border border-slate-805 text-sky-400 font-mono text-[10.5px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed mt-0.5">{q}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 italic">No follow-up questions recommended.</p>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
