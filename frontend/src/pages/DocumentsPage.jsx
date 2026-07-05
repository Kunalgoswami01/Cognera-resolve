import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import SectionCard from '../components/common/SectionCard';
import EmptyState from '../components/common/EmptyState';
import { FileText } from 'lucide-react';

export default function DocumentsPage() {
  return (
    <PageContainer>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100">Document Library</h1>
          <p className="text-xs text-slate-500 mt-1">Archived evidence documents, invoices, receipts, and communication transcripts.</p>
        </div>

        <SectionCard title="Library Archive">
          <EmptyState
            title="No Documents Uploaded"
            description="Documents uploaded within specific case workspaces will accumulate in this central archive."
            icon={FileText}
          />
        </SectionCard>
      </div>
    </PageContainer>
  );
}
