import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import {
  BadgePercent,
  Coins,
  Calculator,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ArrowRight,
  TrendingDown
} from 'lucide-react';

export default function SlaCostView({ sla, cost }) {
  if (!sla || !cost) {
    return <div className="p-8 text-center text-slate-500">Loading SLA & Cost Analysis...</div>;
  }

  const { channel_sla, team_sla, monthly_sla, total_breaches, breach_rate_pct, total_sla_credit_exposure_inr } = sla;
  const {
    channel_breakdown,
    actual_channel_contact_cost_inr,
    blended_contact_cost_inr,
    transfer_cost_inr,
    sla_credit_cost_inr,
    total_operating_cost_actual_inr,
    future_planning,
    headcount_planning
  } = cost;

  return (
    <div className="space-y-6">
      {/* Top Headline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
            <span>Overall SLA Breaches</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{total_breaches.toLocaleString()}</div>
          <div className="text-xs text-rose-600 font-semibold mt-1">
            {breach_rate_pct}% breach rate across all channels
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
            <span>SLA Store Credit Exposure</span>
            <Coins className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">₹{total_sla_credit_exposure_inr.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">₹350 credit / breached ticket (Policy §3)</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
            <span>Internal Transfer Waste</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">₹{transfer_cost_inr.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">1,299 hand-offs @ ₹305 each</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm bg-gradient-to-br from-slate-900 to-indigo-950 text-white">
          <div className="flex items-center justify-between text-xs text-slate-300 font-semibold uppercase">
            <span>Total Support Operating Cost</span>
            <Calculator className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white">₹{total_operating_cost_actual_inr.toLocaleString()}</div>
          <div className="text-xs text-sky-300 mt-1">Channel + Transfer + SLA Credits</div>
        </div>
      </div>

      {/* SLA Policy Targets vs Actual Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel SLA Targets & Breaches */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Channel First-Response SLA Performance</h3>
              <p className="text-xs text-slate-500 mt-0.5">Targets set in Support Operating Policy §3</p>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 bg-rose-50 text-rose-700 rounded-md border border-rose-200">
              ₹350 Compensation
            </span>
          </div>

          <div className="space-y-3">
            {channel_sla.map((ch) => (
              <div key={ch.channel} className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 capitalize text-sm">{ch.channel}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800">
                      Target: {ch.sla_target_display}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Avg Response: <strong className="text-slate-700">{ch.avg_response_minutes} min</strong> (Median: {ch.median_response_minutes} min)
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-rose-600">{ch.sla_breach_pct}% breach</div>
                  <div className="text-xs text-slate-500">{ch.sla_breaches} / {ch.volume.toLocaleString()} tickets</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team SLA Breaches & Credit Exposure */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">SLA Breach Exposure by Assigned Team</h3>
              <p className="text-xs text-slate-500 mt-0.5">Billing queue breach rate drives ₹1.67 Lakhs in penalties</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Team</th>
                  <th className="py-2.5 px-3 text-right">Volume</th>
                  <th className="py-2.5 px-3 text-right">Breaches</th>
                  <th className="py-2.5 px-3 text-right">Breach %</th>
                  <th className="py-2.5 px-3 text-right">Credit Exposure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {team_sla.map((t) => (
                  <tr key={t.team} className={t.team === 'Billing' ? 'bg-rose-50/40 font-bold' : 'hover:bg-slate-50'}>
                    <td className="py-2 px-3 text-slate-900">{t.team}</td>
                    <td className="py-2 px-3 text-right text-slate-600">{t.volume.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right text-rose-600 font-bold">{t.breaches}</td>
                    <td className="py-2 px-3 text-right text-rose-600 font-bold">{t.breach_pct}%</td>
                    <td className="py-2 px-3 text-right text-slate-900">₹{t.sla_credit_inr.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Monthly SLA Breach Trend */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-1">Monthly SLA Breach Rate Trend (%)</h3>
        <p className="text-xs text-slate-500 mb-4">Historical 18-month breach proportion over time</p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthly_sla} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="year_month" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" />
              <YAxis tick={{ fontSize: 11 }} unit="%" domain={[0, 20]} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
              <Line type="monotone" dataKey="breach_pct" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} name="Breach Rate %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Financial Modeling & Future Arithmetic */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Support Cost Standards */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <Coins className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              FY26 Contact Cost Standards (Support Policy §4)
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Chat Contact Cost</span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block">₹210 / contact</span>
                <span className="text-[11px] text-slate-500">5,290 contacts = ₹11.11 L</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Email Contact Cost</span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block">₹260 / contact</span>
                <span className="text-[11px] text-slate-500">3,527 contacts = ₹9.17 L</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Voice Callback Cost</span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block">₹520 / contact</span>
                <span className="text-[11px] text-slate-500">1,702 contacts = ₹8.85 L</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Social Contact Cost</span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block">₹240 / contact</span>
                <span className="text-[11px] text-slate-500">1,122 contacts = ₹2.69 L</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between text-xs text-emerald-950 font-medium">
              <div>
                <span className="font-bold block">Documented Blended Contact Standard</span>
                <span className="text-[11px] text-emerald-700">Policy §4: Across blended current channel mix</span>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold text-emerald-900">₹290 / contact</span>
                <span className="text-[11px] block text-emerald-700">₹33.76 L 18-mo equivalent</span>
              </div>
            </div>
          </div>
        </div>

        {/* Future Planning: 650 tickets/week Arithmetic */}
        <div className="bg-white rounded-xl border border-sky-200 p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-3">
            <Calculator className="w-5 h-5 text-sky-600" />
            <h3 className="text-base font-bold text-slate-900">
              Future Planning Projection: 650 Tickets / Week
            </h3>
          </div>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            Exact arithmetic for stakeholder capacity planning required by Priya Raman and Arjun Mehta using policy standards:
          </p>

          <div className="space-y-4 bg-sky-50/50 p-4 rounded-xl border border-sky-100 text-xs">
            <div className="border-b border-sky-200/60 pb-3">
              <span className="text-sky-800 font-bold block uppercase tracking-wider text-[10px]">
                Step 1: Convert Weekly to Monthly Ticket Run-Rate
              </span>
              <div className="mt-1 font-mono text-sm font-bold text-sky-950">
                650 tickets/week × 52 weeks ÷ 12 months = <span className="text-sky-700 font-black">2,816.67 tickets / month</span>
              </div>
            </div>

            <div className="border-b border-sky-200/60 pb-3">
              <span className="text-sky-800 font-bold block uppercase tracking-wider text-[10px]">
                Step 2: Apply Documented Blended Cost (₹290 / contact)
              </span>
              <div className="mt-1 font-mono text-sm font-bold text-sky-950">
                2,816.67 tickets × ₹290 = <span className="text-emerald-700 font-black">₹8,16,833.33 / month</span>
              </div>
              <span className="text-[11px] text-slate-600 mt-0.5 block">
                Annualized Contact Run-Rate: ₹98,02,000 / year (₹98.02 Lakhs)
              </span>
            </div>

            <div>
              <span className="text-sky-800 font-bold block uppercase tracking-wider text-[10px]">
                Step 3: Headcount Economics (2 Hires @ ₹9 Lakh / yr)
              </span>
              <div className="mt-1 flex items-center justify-between text-slate-700">
                <span>2 Hires Annual Budget:</span>
                <span className="font-bold text-slate-900">₹9,00,000 / yr (₹75,000 / mo total)</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-slate-700">
                <span>Per-Agent Shift Standard:</span>
                <span className="font-bold text-slate-900">₹165/hr × 8 hrs = ₹1,320 / agent-shift</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
