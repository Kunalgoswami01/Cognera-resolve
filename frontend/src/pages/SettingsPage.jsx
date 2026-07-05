import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import SectionCard from '../components/common/SectionCard';
import { Settings, Shield, Sliders, Database } from 'lucide-react';

export default function SettingsPage() {
  return (
    <PageContainer>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100">Settings</h1>
          <p className="text-xs text-slate-500 mt-1">Configure workspace rules, API credentials, and database states.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SectionCard title="AI Profile Configuration">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-400">
                <Sliders className="h-5 w-5 text-sky-500" />
                <span className="text-xs font-semibold text-slate-200">GPT Model Selection</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Configure primary OpenAI model targets. Currently locked to <code>gpt-4o-2024-08-06</code> for Structured Output compliance.
              </p>
            </div>
          </SectionCard>

          <SectionCard title="Data Privacy">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-400">
                <Shield className="h-5 w-5 text-sky-500" />
                <span className="text-xs font-semibold text-slate-200">PII De-identification</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Uploads are audited by local filters. Credit card patterns and SSN tags are redacted automatically.
              </p>
            </div>
          </SectionCard>

          <SectionCard title="Database Status">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-400">
                <Database className="h-5 w-5 text-sky-500" />
                <span className="text-xs font-semibold text-slate-200">Relational SQLite Engine</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Connected to local SQLite database. All schemas initialized. 
              </p>
            </div>
          </SectionCard>
        </div>
      </div>
    </PageContainer>
  );
}
