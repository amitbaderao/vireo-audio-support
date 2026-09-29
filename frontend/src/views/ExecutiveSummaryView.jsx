import React from 'react';
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  HelpCircle,
  FileQuestion,
  Layers,
  ArrowDownRight
} from 'lucide-react';

export default function ExecutiveSummaryView({ summary, insights }) {
  if (!summary || !insights) {
    return <div className="p-8 text-center text-slate-500">Loading Executive Summary...</div>;
  }

  const { stakeholder_conflict_analysis, recommendations } = insights;

  return (
    <div className="space-y-6">
      {/* Hero Decision Alert */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-lg border border-indigo-900/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Executive Decision Brief • Headcount Allocation</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white">
              Data Finding: Do Not Allocate 2 Hires Blindly to Billing
            </h2>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              Intake chatbot tags artificially inflate Billing's assigned volume by routing delivery delays where payments were made. In reality, <strong className="text-white">Logistics resolves 2,574 tickets</strong> (43% more than Billing's 1,798) and suffers a <strong className="text-white">38.2-hour handle time</strong>. Process optimization of chatbot taxonomy saves ₹2.12 Lakhs in transfer overhead and solves the operational bottleneck without premature headcount expansion.
            </p>
          </div>
          <div className="shrink-0 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 text-right min-w-[200px]">
            <div className="text-xs text-sky-200 font-medium">Approved Headcount Budget</div>
            <div className="text-2xl font-black text-white mt-0.5">₹9,00,000 / yr</div>
            <div className="text-[11px] text-slate-300 mt-1">2 Planned Full-Time Hires</div>
          </div>
        </div>
      </div>

      {/* Stakeholder Claim vs Reality Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FileQuestion className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">Stakeholder Email Debate — Evidence Verdict</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Priya Raman */}
          <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Priya Raman (Head of CX)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-200/80 text-rose-800">Assumed Priority</span>
              </div>
              <p className="mt-3 text-xs italic text-slate-700 bg-white/80 p-3 rounded-lg border border-rose-200/60">
                "{stakeholder_conflict_analysis.priya_raman_claim}"
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-rose-200/60">
              <div className="text-xs font-bold text-rose-900 flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Verdict: Flawed Assumption</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {stakeholder_conflict_analysis.data_verdict_on_priya}
              </p>
            </div>
          </div>

          {/* Neha Kulkarni */}
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Neha Kulkarni (Support Ops)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-200/80 text-emerald-800">Operational Observation</span>
              </div>
              <p className="mt-3 text-xs italic text-slate-700 bg-white/80 p-3 rounded-lg border border-emerald-200/60">
                "{stakeholder_conflict_analysis.neha_kulkarni_claim}"
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-emerald-200/60">
              <div className="text-xs font-bold text-emerald-900 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verdict: Confirmed by Ground Data</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {stakeholder_conflict_analysis.data_verdict_on_neha}
              </p>
            </div>
          </div>

          {/* Arjun Mehta */}
          <div className="rounded-xl border border-sky-100 bg-sky-50/40 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">Arjun Mehta (Finance Controller)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-sky-200/80 text-sky-800">Process Over Payroll</span>
              </div>
              <p className="mt-3 text-xs italic text-slate-700 bg-white/80 p-3 rounded-lg border border-sky-200/60">
                "{stakeholder_conflict_analysis.arjun_mehta_point}"
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-sky-200/60">
              <div className="text-xs font-bold text-sky-900 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-sky-600" />
                <span>Verdict: Strongly Recommended</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {stakeholder_conflict_analysis.data_verdict_on_arjun}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Head-to-Head Comparison: Billing vs Logistics vs Chat Frontline */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          <span>Queue Reality Check — Assigned Intake vs Actual Resolved Workload</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Support Team</th>
                <th className="py-3 px-4">Tier</th>
                <th className="py-3 px-4 text-right">Assigned Intake</th>
                <th className="py-3 px-4 text-right">Actual Resolved</th>
                <th className="py-3 px-4 text-right">Net Flow (Hand-offs)</th>
                <th className="py-3 px-4 text-right">Avg Handle Time</th>
                <th className="py-3 px-4 text-right">SLA Breach %</th>
                <th className="py-3 px-4 text-right">Transfers Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-900">Chat Frontline</td>
                <td className="py-3 px-4 text-slate-500">Tier 1</td>
                <td className="py-3 px-4 text-right font-semibold text-slate-900">3,030 (26.0%)</td>
                <td className="py-3 px-4 text-right font-semibold text-slate-900">3,078</td>
                <td className="py-3 px-4 text-right text-emerald-600 font-semibold">+48</td>
                <td className="py-3 px-4 text-right text-slate-700">8.0 hrs</td>
                <td className="py-3 px-4 text-right text-slate-700">7.5%</td>
                <td className="py-3 px-4 text-right text-slate-700">245</td>
              </tr>
              <tr className="bg-amber-50/40 hover:bg-amber-50">
                <td className="py-3 px-4 font-bold text-amber-900">Billing (Priya's Choice)</td>
                <td className="py-3 px-4 text-slate-500">Tier 1</td>
                <td className="py-3 px-4 text-right font-semibold text-amber-900">2,425 (20.8%)</td>
                <td className="py-3 px-4 text-right font-bold text-slate-900">1,798</td>
                <td className="py-3 px-4 text-right text-rose-600 font-bold">-627 (Heavy Leak)</td>
                <td className="py-3 px-4 text-right text-slate-700">17.0 hrs</td>
                <td className="py-3 px-4 text-right font-bold text-rose-600">19.7%</td>
                <td className="py-3 px-4 text-right font-bold text-amber-900">632</td>
              </tr>
              <tr className="bg-emerald-50/40 hover:bg-emerald-50">
                <td className="py-3 px-4 font-bold text-emerald-950">Logistics (Drowning Queue)</td>
                <td className="py-3 px-4 text-slate-500">Tier 1</td>
                <td className="py-3 px-4 text-right font-semibold text-slate-900">1,905 (16.4%)</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-700">2,574 (+35%)</td>
                <td className="py-3 px-4 text-right text-emerald-700 font-bold">+669 (Absorbs)</td>
                <td className="py-3 px-4 text-right font-bold text-rose-700">38.2 hrs (1.6 days)</td>
                <td className="py-3 px-4 text-right text-slate-700">9.7%</td>
                <td className="py-3 px-4 text-right text-slate-700">112</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-900">Email Frontline</td>
                <td className="py-3 px-4 text-slate-500">Tier 1</td>
                <td className="py-3 px-4 text-right font-semibold text-slate-900">1,807 (15.5%)</td>
                <td className="py-3 px-4 text-right font-semibold text-slate-900">1,658</td>
                <td className="py-3 px-4 text-right text-slate-500">-149</td>
                <td className="py-3 px-4 text-right text-slate-700">6.3 hrs</td>
                <td className="py-3 px-4 text-right text-slate-700">11.0%</td>
                <td className="py-3 px-4 text-right text-slate-700">139</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-900">Returns Desk</td>
                <td className="py-3 px-4 text-slate-500">Tier 1</td>
                <td className="py-3 px-4 text-right font-semibold text-slate-900">1,049 (9.0%)</td>
                <td className="py-3 px-4 text-right font-semibold text-slate-900">1,117</td>
                <td className="py-3 px-4 text-right text-emerald-600">+68</td>
                <td className="py-3 px-4 text-right text-slate-700">37.1 hrs</td>
                <td className="py-3 px-4 text-right text-slate-700">10.8%</td>
                <td className="py-3 px-4 text-right text-slate-700">46</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-900">Voice Frontline</td>
                <td className="py-3 px-4 text-slate-500">Tier 1</td>
                <td className="py-3 px-4 text-right font-semibold text-slate-900">900 (7.7%)</td>
                <td className="py-3 px-4 text-right font-semibold text-slate-900">766</td>
                <td className="py-3 px-4 text-right text-slate-500">-134</td>
                <td className="py-3 px-4 text-right text-slate-700">6.6 hrs</td>
                <td className="py-3 px-4 text-right text-slate-700">5.7%</td>
                <td className="py-3 px-4 text-right text-slate-700">82</td>
              </tr>
              <tr className="bg-slate-100/60 font-semibold text-slate-700">
                <td className="py-3 px-4 italic">Escalations & Warranty*</td>
                <td className="py-3 px-4 text-indigo-700">Tier 2</td>
                <td className="py-3 px-4 text-right">525 (4.5%)</td>
                <td className="py-3 px-4 text-right">650</td>
                <td className="py-3 px-4 text-right">+125</td>
                <td className="py-3 px-4 text-right">129.7 hrs (5.4 d)</td>
                <td className="py-3 px-4 text-right">8.2%</td>
                <td className="py-3 px-4 text-right">43</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-slate-400 mt-3 italic">
          *Note per Support Policy §6: Tier 2 (Escalations & Warranty) manages certified multi-touch hardware RMAs and must not be compared directly with Tier 1 on raw volume.
        </p>
      </div>

      {/* Actionable Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendations.map((rec, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between">
            <div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider inline-block ${
                idx === 0 ? 'bg-amber-100 text-amber-800' :
                idx === 1 ? 'bg-rose-100 text-rose-800' :
                'bg-sky-100 text-sky-800'
              }`}>
                {rec.priority}
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-2.5 leading-snug">{rec.title}</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{rec.impact}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-sky-600 space-x-1">
              <span>View Data Evidence</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
