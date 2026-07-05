import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useCaseStore } from '../store/useCaseStore';
import PageContainer from '../components/layout/PageContainer';
import SectionCard from '../components/common/SectionCard';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';

export default function NewCasePage() {
  const navigate = useNavigate();
  const createCase = useCaseStore((state) => state.createCase);
  const creating = useCaseStore((state) => state.creating);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      company_name: '',
      issue_category: 'retail',
      amount: '',
      currency: 'USD',
      purchase_date: '',
      summary: '',
    },
  });

  const onSubmit = async (data) => {
    // Format numeric amount
    const formattedData = {
      ...data,
      amount: data.amount ? parseFloat(data.amount) : null,
    };
    const created = await createCase(formattedData);
    if (created && created.id) {
      navigate(`/cases/${created.id}`);
    }
  };

  return (
    <PageContainer>
      {/* Back navigation */}
      <div>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <div className="max-w-2xl mx-auto w-full">
        <SectionCard
          title="Initialize Case File"
          subtitle="Define dispute parameters and facts for AI ingestion."
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {/* Case Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Case Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Broken Screen TV Delivery"
                  className={`w-full bg-slate-900 border ${
                    errors.title ? 'border-rose-500' : 'border-slate-800'
                  } rounded-lg px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors`}
                  {...register('title', { required: 'Case title is required' })}
                />
                {errors.title && (
                  <p className="text-[10px] text-rose-500 mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* Grid 2 Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Company Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Company / Merchant Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Comcast, Netflix, Amazon"
                    className={`w-full bg-slate-900 border ${
                      errors.company_name ? 'border-rose-500' : 'border-slate-800'
                    } rounded-lg px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors`}
                    {...register('company_name', { required: 'Merchant name is required' })}
                  />
                  {errors.company_name && (
                    <p className="text-[10px] text-rose-500 mt-1">{errors.company_name.message}</p>
                  )}
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Dispute Category
                  </label>
                  <select
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                    {...register('issue_category')}
                  >
                    <option value="retail">Retail / E-Commerce</option>
                    <option value="utilities">Utilities (Water, Electricity)</option>
                    <option value="telecom">Telecom & Internet</option>
                    <option value="financial">Financial / Credit Cards</option>
                    <option value="other">Other Grievances</option>
                  </select>
                </div>
              </div>

              {/* Grid 2 Columns for Cost and Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Amount */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Disputed Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                    {...register('amount')}
                  />
                </div>

                {/* Purchase Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Purchase / Transaction Date
                  </label>
                  <input
                    type="date"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                    {...register('purchase_date')}
                  />
                </div>
              </div>

              {/* Summary Textarea */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Detailed Explanation <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={6}
                  placeholder="Provide a chronological description of what happened, customer service contacts, refund requests, and merchant's refusal reasons..."
                  className={`w-full bg-slate-900 border ${
                    errors.summary ? 'border-rose-500' : 'border-slate-800'
                  } rounded-lg px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors resize-none`}
                  {...register('summary', { required: 'Explanation details are required' })}
                ></textarea>
                {errors.summary && (
                  <p className="text-[10px] text-rose-500 mt-1">{errors.summary.message}</p>
                )}
              </div>
            </div>

            {/* Warn block */}
            <div className="flex gap-3 bg-amber-950/20 border border-amber-900/40 p-4 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
              <p className="text-[10.5px] text-slate-400 leading-normal">
                <strong>Discovery Note:</strong> This initializes the case data in the SQLite database. Next steps will guide you through evidence vault uploads, intake checklists, and dispute letter synthesis.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-900">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-900 text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="flex items-center gap-2 px-5 py-2 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-lg shadow-sky-950/40 transition-colors cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>{creating ? 'Initializing...' : 'Save and Start Audit'}</span>
              </button>
            </div>
          </form>
        </SectionCard>
      </div>
    </PageContainer>
  );
}
