import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCaseStore } from '../store/useCaseStore';
import PageContainer from '../components/layout/PageContainer';
import StatCard from '../components/common/StatCard';
import SectionCard from '../components/common/SectionCard';
import EmptyState from '../components/common/EmptyState';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { FileText, CheckCircle, Clock, AlertTriangle, ArrowRight, Plus } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { cases, loading, fetchCases } = useCaseStore();

  useEffect(() => {
    fetchCases();
  }, []);

  const totalCases = cases.length;
  const draftCases = cases.filter(c => c.status === 'draft').length;
  
  // Calculate simple average readiness score
  const averageReadiness = totalCases > 0
    ? Math.round(cases.reduce((sum, c) => sum + (c.readiness_score || 0), 0) / totalCases)
    : 0;

  // Calculate recently updated (updated in the last 48 hours)
  const recentlyUpdated = cases.filter(c => {
    const updatedAt = new Date(c.updated_at).getTime();
    const fortyEightHoursAgo = Date.now() - 48 * 60 * 60 * 1000;
    return updatedAt > fortyEightHoursAgo;
  }).length;

  return (
    <PageContainer>
      {/* Top Welcome Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-950/30 border border-slate-800 p-6 rounded-xl">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100">Welcome to Cognera Resolve</h1>
          <p className="text-xs text-slate-500 mt-1">Track and manage consumer dispute files and compile legal arguments.</p>
        </div>
        <button
          onClick={() => navigate('/cases/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-lg shadow-sky-950/40 transition-all transform hover:-translate-y-0.5 cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>New Dispute Case</span>
        </button>
      </div>

      {/* Stats Counters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Claims"
          value={totalCases}
          icon={FileText}
          description="Registered cases in system"
        />
        <StatCard
          title="Draft / Open"
          value={draftCases}
          icon={Clock}
          colorClass="text-slate-400"
          description="Requires facts entry"
        />
        <StatCard
          title="Avg Readiness"
          value={`${averageReadiness}%`}
          icon={AlertTriangle}
          colorClass="text-amber-500"
          description="Average claim strength"
        />
        <StatCard
          title="Recent Activity"
          value={recentlyUpdated}
          icon={CheckCircle}
          colorClass="text-emerald-500"
          description="Updated in last 48 hours"
        />
      </div>


      {/* Case List Section */}
      <SectionCard
        title="Active Claims & Actions"
        subtitle="Manage current claims and evidence vault"
      >
        {loading ? (
          <LoadingSkeleton type="list" count={3} />
        ) : totalCases === 0 ? (
          <EmptyState
            title="No Active Claims Found"
            description="Create a dispute and outline the details of the problem to initialize the AI analysis."
            actionText="Start Intake Process"
            onAction={() => navigate('/cases/new')}
            icon={FileText}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-medium">
                  <th className="py-3 px-4">Dispute Title</th>
                  <th className="py-3 px-4">Merchant</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Readiness</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {cases.map((claim) => (
                  <tr
                    key={claim.id}
                    className="hover:bg-slate-900/40 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/cases/${claim.id}`)}
                  >
                    <td className="py-4 px-4 font-semibold text-slate-200">
                      {claim.title || 'Untitled Case File'}
                    </td>
                    <td className="py-4 px-4 text-slate-400">
                      {claim.company_name || 'N/A'}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase font-mono">
                        {claim.issue_category || 'Other'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={claim.status} />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              claim.readiness_score < 40 ? 'bg-rose-500' : claim.readiness_score < 75 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${claim.readiness_score}%` }}
                          />
                        </div>
                        <span className="font-mono font-medium text-[11px] text-slate-300">
                          {claim.readiness_score}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-500 font-mono">
                      {new Date(claim.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-sky-400 hover:border-sky-500/30 group-hover:translate-x-0.5 transition-all cursor-pointer">
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </PageContainer>
  );
}
