import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { Tags, Bot, AlertTriangle, ArrowRight, Info } from 'lucide-react';

export default function CategoryAnalysisView({ categories, monthlyCategory }) {
  if (!categories || !monthlyCategory) {
    return <div className="p-8 text-center text-slate-500">Loading Category Analysis...</div>;
  }

  // Top 6 categories for chart
  const topCategories = categories.slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Bot Taxonomy Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start space-x-3">
        <Bot className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold uppercase tracking-wider block text-amber-950">
            Intake Bot Tagging Origin & Caveat
          </span>
          <p className="leading-relaxed text-amber-800">
            Per Helpdesk Admin Sameer Qureshi and Support Policy §2: Category tags are assigned automatically by the chatbot intake flow based on customer opening selections. While human agents have authority to re-tag tickets on closure, in practice they rarely do (&lt;2% re-tag rate). These categories represent intake classification rather than independent post-hoc AI modeling.
          </p>
        </div>
      </div>

      {/* Category Volume Distribution Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Support Ticket Intake Volume by Category
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Top customer inquiry categories over the 18-month reporting period (Jan 2025 – Jun 2026).
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
            11 Discrete Categories
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categories} margin={{ top: 10, right: 10, left: -10, bottom: 45 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="category" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
              <Bar dataKey="volume" fill="#0284c7" name="Total Tickets" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Performance & Routing Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Tags className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Category Distribution, Routing & Resolution Performance
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">All 11 Categories</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Category Tag</th>
                <th className="py-3 px-4 text-right">Volume</th>
                <th className="py-3 px-4 text-right">% Share</th>
                <th className="py-3 px-4">Intake Bot Routing</th>
                <th className="py-3 px-4">Actual Resolving Unit</th>
                <th className="py-3 px-4 text-right">Avg Handle Time</th>
                <th className="py-3 px-4 text-right">SLA Breaches</th>
                <th className="py-3 px-4 text-right">Breach %</th>
                <th className="py-3 px-4 text-right">Transfers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {categories.map((c) => {
                const isBilling = c.category === 'Billing & Payments';
                const isDelivery = c.category === 'Delivery & Shipping';
                return (
                  <tr
                    key={c.category}
                    className={`hover:bg-slate-50 ${isBilling ? 'bg-amber-50/20' : isDelivery ? 'bg-emerald-50/20' : ''}`}
                  >
                    <td className="py-3 px-4 font-bold text-slate-900">{c.category}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">{c.volume.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-600">{c.share_pct}%</td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{c.primary_assigned_team}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900 flex items-center space-x-1">
                      <span>{c.primary_resolving_team}</span>
                      {isBilling && (
                        <span className="text-[10px] text-rose-600 font-bold ml-1">
                          (696 to Logistics!)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-700">{c.avg_handle_time_hours} hrs</td>
                    <td className="py-3 px-4 text-right font-semibold text-rose-600">{c.sla_breaches}</td>
                    <td className={`py-3 px-4 text-right font-bold ${c.sla_breach_pct > 15 ? 'text-rose-600' : 'text-slate-700'}`}>
                      {c.sla_breach_pct}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">{c.transfers_count}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
