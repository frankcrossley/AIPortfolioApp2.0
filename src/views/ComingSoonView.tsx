import React from 'react';
import {
  TrendingUp,
  Sliders,
  ShieldCheck,
  Settings as SettingsIcon,
  ArrowRight,
  Sparkles,
  Plus,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { Header } from '../components/Header';
import { ActiveNav } from '../types';

export const ComingSoonView: React.FC<{ viewType: ActiveNav }> = ({ viewType }) => {
  const { setActiveNav, openEstateItemDrawer } = usePortfolio();

  const getMetadata = () => {
    switch (viewType) {
      case 'investment':
        return {
          title: 'Investment Allocation',
          icon: Sliders,
          badge: 'Phase 2 Module',
          description:
            'Advanced cost allocation by business unit, token consumption tracking, GPU cluster budgeting, and software license amortization models.',
          features: [
            'Direct vs. Allocated Platform Shared Cost Engine',
            'Token Throughput & API Provider Billing Ingestion',
            'Multi-Year Capex / Opex Run Rate Projections',
            'Vendor Contract Renewal Notifications',
          ],
        };
      case 'value-management':
        return {
          title: 'Value Management & ROI',
          icon: TrendingUp,
          badge: 'Phase 2 Module',
          description:
            'Defensible ROI measurement frameworks connecting AI deployments with business KPIs such as hours saved, CSAT uplift, and revenue acceleration.',
          features: [
            'Automated KPI Variance & Time-to-Value Benchmarks',
            'Defensibility Scoring & Executive Committee Briefings',
            'Human-in-the-loop CSAT / Accuracy Audits',
            'Outcome Attribution to Strategic Initiatives',
          ],
        };
      case 'measurement':
        return {
          title: 'Measurement Standards',
          icon: ShieldCheck,
          badge: 'Phase 2 Module',
          description:
            'Standardized scoring criteria for bias evaluation, hallucination boundaries, data privacy classification, and technical risk tiers.',
          features: [
            'ISO/IEC 42001 & NIST AI RMF Alignment Frameworks',
            'Automated Risk Classification (Minimal, Limited, High Risk)',
            'Model Guardrails Verification & Incident Logging',
            'Quarterly Compliance Audit Readiness Packs',
          ],
        };
      case 'settings':
      default:
        return {
          title: 'Portfolio Settings & Governance',
          icon: SettingsIcon,
          badge: 'Configuration',
          description:
            'Customise your organisation taxonomy, departments, relationship types, and role-based access control.',
          features: [
            'Custom Estate Object Types & Field Schema Editor',
            'Department & Cost Center Mapping Rules',
            'SSO & Enterprise Directory Sync',
            'Automated ServiceNow & Jira CMDB Connector Settings',
          ],
        };
    }
  };

  const meta = getMetadata();
  const Icon = meta.icon;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] overflow-y-auto">
      <Header title={meta.title} showRegister={false} />

      <div className="p-8 max-w-4xl w-full mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                {meta.badge}
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                {meta.title}
              </h2>
            </div>
          </div>

          <p className="text-xs text-slate-600 mt-4 leading-relaxed max-w-2xl">
            {meta.description}
          </p>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Planned Capabilities
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {meta.features.map((feat, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50/80 border border-slate-100 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-2.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setActiveNav('overview')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 hover:underline"
            >
              <span>Return to Portfolio Overview</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => openEstateItemDrawer()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Portfolio</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
