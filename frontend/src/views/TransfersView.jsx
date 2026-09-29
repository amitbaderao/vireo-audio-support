import React from 'react';
import { ArrowLeftRight, AlertCircle, Info, TrendingDown, Layers, FileSpreadsheet } from 'lucide-react';

export default function TransfersView({ transfers }) {
  if (!transfers) {
    return <div className="p-8 text-center text-slate-500">Loading Transfers Analysis...</div>;
  }

  const {
    total_tickets,
    helpdesk_recorded_count,
    helpdesk_coverage_pct,
    legacy_blank_count,
    total_transfers_recorded,
    transferred_tickets_count,
    transfer_rate_helpdesk_pct,
    transfer_cost_inr,
    billing_to_logistics_leak,
    crosstab_matrix,
    team_transfer_stats,
    teams
  } = transfers;

  return (
    <div className="space-y-6">
      {/* Policy & Coverage Banner */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-xs text-sky-950 flex items-start space-x-3">
        <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold uppercase tracking-wider block text-sky-900">
            Freshdesk Migration & Blank Transfers Rule
          </span>
          <p className="leading-relaxed text-sky-800">
            Per IT Admin Sameer Qureshi and Support Policy §9: The current helpdesk went live on 14 September 2025. The <code className="bg-sky-100 px-1 py-0.5 rounded text-sky-900 font-semibold font-mono">transfers</code> field exists ONLY in the current helpdesk exports ({helpdesk_recorded_count.toLocaleString()} rows). Pre-migration Freshdesk tickets ({legacy_blank_count.toLocaleString()} rows) are <strong>blank, not zero</strong>. As mandated by policy, transfer rates are calculated exclusively against the helpdesk cohort to prevent misleading dilution.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
            <span>Helpdesk Coverage</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-sky-100 text-sky-700 font-bold">Live System</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{helpdesk_coverage_pct}%</div>
          <div className="text-xs text-slate-500 mt-1">{helpdesk_recorded_count.toLocaleString()} of {total_tickets.toLocaleString()} tickets</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
            <span>Helpdesk Transfer Rate</span>
            <ArrowLeftRight className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{transfer_rate_helpdesk_pct}%</div>
          <div className="text-xs text-slate-500 mt-1">{transferred_tickets_count.toLocaleString()} tickets transferred &gt; 0</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
            <span>Total Hand-Offs Count</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{total_transfers_recorded.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">Multi-transfer hand-offs counted</div>
        </div>

        <div className="bg-white rounded-xl border border-rose-200 bg-rose-50/30 p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-rose-800 font-semibold uppercase">
            <span>Direct Transfer Waste</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-rose-900">₹{transfer_cost_inr.toLocaleString()}</div>
          <div className="text-xs text-rose-700 mt-1">₹305 re-handling per transfer (Policy §4)</div>
        </div>
      </div>

      {/* The 696 Transfer Leak Box */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[11px] font-bold uppercase tracking-wider">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Critical Workflow Discovery • Process Defect</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              The Billing-to-Logistics Hand-Off Leak: {billing_to_logistics_leak.transferred_tickets_count} Misrouted Tickets
            </h3>
            <p className="text-xs text-slate-700 max-w-3xl leading-relaxed">
              {billing_to_logistics_leak.root_cause} This accounts for <strong className="text-amber-950 font-bold">{billing_to_logistics_leak.share_of_billing_queue_pct}% of Billing's entire intake queue</strong> being dumped into Logistics!
            </p>
          </div>
          <div className="shrink-0 bg-white/90 p-4 rounded-xl border border-amber-200 text-right">
            <span className="text-[11px] font-medium text-slate-500 block">Transfer Re-Handling Cost</span>
            <span className="text-xl font-black text-rose-700 block mt-0.5">
              ₹{(billing_to_logistics_leak.transferred_tickets_count * 305).toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500 block">Pure friction cost</span>
          </div>
        </div>
      </div>

      {/* Cross-Tabulation Matrix: Assigned vs Resolving */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Complete Routing Cross-Tab: Assigned Team (Rows) vs Resolving Team (Columns)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">Full 11,641 Reporting Period Matrix</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Assigned Team (Intake)</th>
                {teams.map((t) => (
                  <th key={t} className="py-3 px-2 text-right">{t}</th>
                ))}
                <th className="py-3 px-3 text-right bg-slate-200/70 font-bold">Total Assigned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {crosstab_matrix.map((row) => {
                const isBilling = row.assigned_team === 'Billing';
                return (
                  <tr key={row.assigned_team} className={isBilling ? 'bg-amber-50/40 font-bold' : 'hover:bg-slate-50'}>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{row.assigned_team}</td>
                    {teams.map((t) => {
                      const count = row[t] || 0;
                      const isLeak = isBilling && t === 'Logistics';
                      return (
                        <td
                          key={t}
                          className={`py-2.5 px-2 text-right ${
                            isLeak
                              ? 'bg-rose-100 text-rose-800 font-extrabold text-sm'
                              : count > 0
                              ? 'text-slate-800'
                              : 'text-slate-300'
                          }`}
                        >
                          {count > 0 ? count.toLocaleString() : '-'}
                        </td>
                      );
                    })}
                    <td className="py-2.5 px-3 text-right font-bold bg-slate-50 text-slate-900">
                      {row.total_assigned.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Team Transfers Detail Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Helpdesk Cohort Transfer Burden by Assigned Team
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Assigned Team</th>
                <th className="py-3 px-4 text-right">Helpdesk Tickets</th>
                <th className="py-3 px-4 text-right">Transferred Tickets</th>
                <th className="py-3 px-4 text-right">Transfer Rate %</th>
                <th className="py-3 px-4 text-right">Total Transfers</th>
                <th className="py-3 px-4 text-right">Avg Transfers/Ticket</th>
                <th className="py-3 px-4 text-right">Transfer Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {team_transfer_stats.map((row) => (
                <tr key={row.team} className={row.team === 'Billing' ? 'bg-amber-50/30 font-bold' : 'hover:bg-slate-50'}>
                  <td className="py-2.5 px-4 text-slate-900">{row.team}</td>
                  <td className="py-2.5 px-4 text-right text-slate-600">{row.helpdesk_volume.toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-right text-slate-900 font-semibold">{row.transferred_tickets.toLocaleString()}</td>
                  <td className={`py-2.5 px-4 text-right font-bold ${row.transfer_rate_pct > 20 ? 'text-rose-600' : 'text-slate-700'}`}>
                    {row.transfer_rate_pct}%
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-900 font-semibold">{row.total_transfers.toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-right text-slate-600 font-mono">{row.avg_transfers}</td>
                  <td className="py-2.5 px-4 text-right font-semibold text-slate-900">₹{row.transfer_cost_inr.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
