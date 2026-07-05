import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import SectionCard from '../components/common/SectionCard';
import EmptyState from '../components/common/EmptyState';
import { History } from 'lucide-react';

export default function HistoryPage() {
  return (
    <PageContainer>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100">Dispute History</h1>
          <p className="text-xs text-slate-500 mt-1">Archived claims, past resolutions, and case outcome logs.</p>
        </div>

        <SectionCard title="Resolved Disputes Logs">
          <EmptyState
            title="No Past Resolutions Found"
            description="Your closed and resolved claims list is empty. Complete a case draft and compile next steps to begin."
            icon={History}
          />
        </SectionCard>
      </div>
    </PageContainer>
  );
}
