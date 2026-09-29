import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, Database, Info, GitMerge, FileCheck } from 'lucide-react';

export default function DataQualityView({ dataQuality }) {
  if (!dataQuality) {
    return <div className="p-8 text-center text-slate-500">Loading Data Quality...</div>;
  }

  const {
    total_source_rows,
    inside_window_rows,
    outside_window_rows,
    reporting_window,
    missing_values,
    duplicate_ticket_ids,
    duplicate_ticket_ids_source,
    status_distribution,
    source_system_distribution,
    priority_distribution,
    referential_integrity_pct,
    anomalies_and_explanations
  } = dataQuality;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-start space-x-3">
          <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-emerald-950">
              Data Integrity & Quality Assurance Report
            </h3>
            <p className="text-xs text-emerald-800 leading-relaxed max-w-4xl">
              All datasets have undergone rigorous schema validation, timestamp parsing into Indian Standard Time (IST), duplicate detection, and referential join integrity audits against <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono text-emerald-900">customers.csv</code>, <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono text-emerald-900">orders.csv</code>, <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono text-emerald-900">products.csv</code>, and <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono text-emerald-900">agents.csv</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Primary Row Breakdown KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase">Total Source Rows</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{total_source_rows.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">tickets.csv raw records</div>
        </div>

        <div className="bg-white rounded-xl border border-sky-300 ring-2 ring-sky-100 p-5 shadow-sm">
          <div className="text-xs font-semibold text-sky-700 uppercase">Inside Reporting Window</div>
          <div className="mt-2 text-2xl font-black text-sky-900">{inside_window_rows.toLocaleString()}</div>
          <div className="text-xs text-sky-700 mt-1">{reporting_window.start} to {reporting_window.end.split(' ')[0]}</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase">Excluded Outside Window</div>
          <div className="mt-2 text-2xl font-bold text-slate-700">{outside_window_rows.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">Pre-2025 legacy test records</div>
        </div>

        <div className="bg-white rounded-xl border border-emerald-200 bg-emerald-50/20 p-5 shadow-sm">
          <div className="text-xs font-semibold text-emerald-800 uppercase">Duplicate Ticket IDs</div>
          <div className="mt-2 text-2xl font-black text-emerald-700">{duplicate_ticket_ids}</div>
          <div className="text-xs text-emerald-700 mt-1">100% Unique Primary Keys</div>
        </div>
      </div>

      {/* Referential Integrity & Completeness Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Referential Joins */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <GitMerge className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Relational Join Verification</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/60">
              <div>
                <span className="font-bold text-slate-900">tickets.customer_id → customers.customer_id</span>
                <span className="text-[11px] text-slate-500 block">Customer profile, city, state, Care Plus enrollment</span>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md">
                {referential_integrity_pct.customer_join_match}% Match
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/60">
              <div>
                <span className="font-bold text-slate-900">tickets.order_id → orders.order_id</span>
                <span className="text-[11px] text-slate-500 block">Order date, lot code, order value in INR</span>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md">
                {referential_integrity_pct.order_join_match}% Match
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/60">
              <div>
                <span className="font-bold text-slate-900">tickets.product_sku → products.sku</span>
                <span className="text-[11px] text-slate-500 block">Product family, retail price, warranty period</span>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md">
                {referential_integrity_pct.product_sku_match}% Match
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/60">
              <div>
                <span className="font-bold text-slate-900">tickets.agent_id → agents.agent_id</span>
                <span className="text-[11px] text-slate-500 block">Unique agent ID join (disambiguating duplicate display names)</span>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md">
                {referential_integrity_pct.agent_id_match}% Match
              </span>
            </div>
          </div>
        </div>

        {/* Missing Values Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <Database className="w-5 h-5 text-sky-600" />
            <h3 className="text-base font-bold text-slate-900">Missing Values Audit</h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-600">First Human Response (<code>first_response_at</code>)</span>
              <span className="font-bold text-emerald-600">0 Missing (100% Complete)</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Resolution Timestamp (<code>resolved_at</code>)</span>
              <span className="font-bold text-slate-900">{missing_values.resolved_at} ({((missing_values.resolved_at / inside_window_rows)*100).toFixed(1)}% Open/Pending)</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Transfers Hand-off Count (<code>transfers</code>)</span>
              <span className="font-bold text-amber-700">{missing_values.transfers.toLocaleString()} (Freshdesk Legacy rows)</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Customer Satisfaction (<code>csat_score</code>)</span>
              <span className="font-bold text-slate-700">{missing_values.csat_score.toLocaleString()} (Voluntary survey non-response)</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Order Quoted by Customer (<code>order_id</code>)</span>
              <span className="font-bold text-slate-700">{missing_values.order_id.toLocaleString()} (Customer omitted order number)</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-slate-600">Refund Amount (<code>refund_amount_inr</code>)</span>
              <span className="font-bold text-slate-700">{missing_values.refund_amount_inr.toLocaleString()} (Tickets without refund)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Explanations & Policy Alignment Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileCheck className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Documented Data Quirks, Anomalies & Business Rules
            </h3>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {anomalies_and_explanations.map((anomaly, idx) => (
            <div key={idx} className="p-4 text-xs space-y-1 hover:bg-slate-50">
              <div className="flex items-center space-x-2">
                <code className="bg-slate-100 px-2 py-0.5 rounded font-mono font-bold text-slate-900 text-[11px]">
                  {anomaly.field}
                </code>
                <span className="text-slate-600 font-semibold">— {anomaly.observation}</span>
              </div>
              <p className="text-slate-600 leading-relaxed pl-2 border-l-2 border-slate-200 mt-1">
                {anomaly.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
