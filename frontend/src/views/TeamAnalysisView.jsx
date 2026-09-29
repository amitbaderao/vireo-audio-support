import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';
import { Users, AlertCircle, ShieldAlert, CheckCircle2, Clock, ArrowRight, ArrowLeftRight } from 'lucide-react';

export default function TeamAnalysisView({ teamSummary, monthlyTeam }) {
  const [metricView, setMetricView] = useState('assigned'); // 'assigned' | 'resolved' | 'handle_time' | 'sla_breach'

  if (!teamSummary) {
    return <div className="p-8 text-center text-slate-500">Loading Team Analysis...</div>;
  }

  const { tier_1_teams, tier_2_teams, policy_rule_note } = teamSummary;

  // Chart data for Tier 1 comparison
  const tier1ChartData = tier_1_teams.map(t => ({
    team: t.team,
    assigned: t.assigned_volume,
    resolved: t.resolved_volume,
    handle_time_hrs: t.avg_handle_time_hours,
    breach_pct: t.sla_breach_pct,
    transfer_rate: t.transfer_rate_pct,
    share_pct: t.share_of_tier1_pct
  }));

  return (
    <div className="space-y-6">
      {/* Policy Banner */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-xs text-indigo-900 flex items-start space-x-3">
        <ShieldAlert className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold uppercase tracking-wider block text-indigo-950">
            Support Policy §6 Mandate: Tier Separation
          </span>
          <p className="leading-relaxed text-indigo-800">
            {policy_rule_note}
          </p>
        </div>
      </div>

      {/* Tier 1 Workload Comparison Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Tier 1 Frontline Teams — Assigned Queue vs Actual Resolved Output
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Notice how Billing's assigned queue drops by 627 tickets upon hand-off, while Logistics absorbs 669 extra tickets.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg self-start">
            <button
              onClick={() => setMetricView('assigned')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                metricView === 'assigned' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Assigned vs Resolved
            </button>
            <button
              onClick={() => setMetricView('handle_time')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                metricView === 'handle_time' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Avg Handle Time (Hours)
            </button>
            <button
              onClick={() => setMetricView('sla_breach')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                metricView === 'sla_breach' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              SLA Breach Rate %
            </button>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {metricView === 'assigned' ? (
              <BarChart data={tier1ChartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="team" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                <Bar dataKey="assigned" fill="#94a3b8" name="Assigned Intake Volume" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" fill="#0284c7" name="Actual Resolved Volume" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : metricView === 'handle_time' ? (
              <BarChart data={tier1ChartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="team" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} unit="h" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="handle_time_hrs" fill="#f59e0b" name="Avg Handle Time (Hours)" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <BarChart data={tier1ChartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="team" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="breach_pct" fill="#ef4444" name="SLA Breach %" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tier 1 Detailed Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Section B: Tier 1 Teams Comprehensive Performance Metrics
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">6 Frontline Functional Units</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Tier 1 Team</th>
                <th className="py-3 px-4 text-center">Roster Headcount</th>
                <th className="py-3 px-4 text-right">Assigned Intake</th>
                <th className="py-3 px-4 text-right">% Tier 1 Intake</th>
                <th className="py-3 px-4 text-right">Actual Resolved</th>
                <th className="py-3 px-4 text-right">Queue Variance</th>
                <th className="py-3 px-4 text-right">Avg Handle Time</th>
                <th className="py-3 px-4 text-right">Transfer Rate</th>
                <th className="py-3 px-4 text-right">SLA Breach %</th>
                <th className="py-3 px-4 text-right">CSAT Avg</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {tier_1_teams.map((t) => {
                const isBilling = t.team === 'Billing';
                const isLogistics = t.team === 'Logistics';
                return (
                  <tr
                    key={t.team}
                    className={`hover:bg-slate-50 ${
                      isBilling ? 'bg-amber-50/30' : isLogistics ? 'bg-emerald-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center space-x-2">
                      <span>{t.team}</span>
                      {isBilling && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-semibold">
                          Priya's Pick
                        </span>
                      )}
                      {isLogistics && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-semibold">
                          Workload Bottleneck
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-700 font-semibold">{t.roster_headcount} Agents</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">{t.assigned_volume.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-slate-600 font-semibold">{t.share_of_tier1_pct}%</td>
                    <td className="py-3 px-4 text-right font-bold text-sky-700">{t.resolved_volume.toLocaleString()}</td>
                    <td className={`py-3 px-4 text-right font-bold ${
                      t.volume_difference > 0 ? 'text-emerald-600' : t.volume_difference < 0 ? 'text-rose-600' : 'text-slate-600'
                    }`}>
                      {t.volume_difference > 0 ? `+${t.volume_difference}` : t.volume_difference}
                    </td>
                    <td className={`py-3 px-4 text-right font-semibold ${t.avg_handle_time_hours > 24 ? 'text-rose-600' : 'text-slate-700'}`}>
                      {t.avg_handle_time_hours} hrs
                    </td>
                    <td className={`py-3 px-4 text-right font-semibold ${t.transfer_rate_pct > 20 ? 'text-amber-700 font-bold' : 'text-slate-700'}`}>
                      {t.transfer_rate_pct}%
                    </td>
                    <td className={`py-3 px-4 text-right font-semibold ${t.sla_breach_pct > 15 ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                      {t.sla_breach_pct}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">{t.avg_csat} / 5</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section C: Tier 2 Escalations & Warranty */}
      <div className="bg-white rounded-xl border border-indigo-200 shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
          <h3 className="text-base font-bold text-slate-900">
            Section C: Tier 2 (Escalations & Warranty) Analysis
          </h3>
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-800">
            Policy Isolated
          </span>
        </div>
        <p className="text-xs text-slate-600 mb-4 max-w-3xl leading-relaxed">
          Escalations & Warranty handles certified hardware diagnostics, return merchandise authorizations (RMA), and vendor warranty replacements. Because tickets involve physical inspection, multi-step customer follow-ups, and replacement approvals, their metrics are measured in days rather than tickets closed per shift.
        </p>

        {tier_2_teams.map((t2) => (
          <div key={t2.team} className="grid grid-cols-2 md:grid-cols-6 gap-4 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 text-xs">
            <div>
              <span className="text-indigo-800 block font-medium">Assigned Tickets</span>
              <span className="text-base font-bold text-indigo-950 mt-0.5 block">{t2.assigned_volume}</span>
              <span className="text-[10px] text-indigo-600">({t2.share_of_total_pct}% of company)</span>
            </div>
            <div>
              <span className="text-indigo-800 block font-medium">Resolved by Tier 2</span>
              <span className="text-base font-bold text-indigo-950 mt-0.5 block">{t2.resolved_volume}</span>
              <span className="text-[10px] text-emerald-600 font-semibold">+125 escalated</span>
            </div>
            <div>
              <span className="text-indigo-800 block font-medium">Avg Handle Time</span>
              <span className="text-base font-bold text-indigo-950 mt-0.5 block">{t2.avg_handle_time_hours} hrs</span>
              <span className="text-[10px] text-slate-500">~5.4 days / case</span>
            </div>
            <div>
              <span className="text-indigo-800 block font-medium">Median Handle Time</span>
              <span className="text-base font-bold text-indigo-950 mt-0.5 block">{t2.median_handle_time_hours} hrs</span>
              <span className="text-[10px] text-slate-500">~4.9 days</span>
            </div>
            <div>
              <span className="text-indigo-800 block font-medium">SLA Breach %</span>
              <span className="text-base font-bold text-indigo-950 mt-0.5 block">{t2.sla_breach_pct}%</span>
              <span className="text-[10px] text-slate-500">{t2.sla_breaches} breaches</span>
            </div>
            <div>
              <span className="text-indigo-800 block font-medium">Roster Headcount</span>
              <span className="text-base font-bold text-indigo-950 mt-0.5 block">{t2.roster_headcount} Agents</span>
              <span className="text-[10px] text-slate-500">Tier 2 Certified</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
