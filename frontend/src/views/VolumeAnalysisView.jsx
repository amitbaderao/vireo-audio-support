import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Calendar, BarChart2, Layers, Filter } from 'lucide-react';

const CHANNEL_COLORS = {
  chat: '#0ea5e9',    // Sky
  email: '#6366f1',   // Indigo
  voice: '#f59e0b',   // Amber
  social: '#ec4899'   // Pink
};

const PIE_COLORS = ['#0ea5e9', '#6366f1', '#f59e0b', '#ec4899'];

export default function VolumeAnalysisView({ monthlyVolume, channels, summary }) {
  const [chartType, setChartType] = useState('stacked'); // 'stacked' | 'total'

  if (!monthlyVolume || !channels) {
    return <div className="p-8 text-center text-slate-500">Loading Volume Analysis...</div>;
  }

  const channelPieData = channels.map((c) => ({
    name: c.channel.toUpperCase(),
    value: c.volume,
    share: c.share_pct
  }));

  return (
    <div className="space-y-6">
      {/* Top Controls & Headline */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <BarChart2 className="w-5 h-5 text-sky-600" />
            <span>Monthly Ticket Volume & Channel Trajectory</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Historical 18-month intake distribution across Chat, Email, Voice, and Social channels.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg self-start">
          <button
            onClick={() => setChartType('stacked')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              chartType === 'stacked' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Channel Stacked
          </button>
          <button
            onClick={() => setChartType('total')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              chartType === 'total' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Total Area Trend
          </button>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">
              {chartType === 'stacked' ? 'Monthly Intake by Channel (18-Month Breakdown)' : 'Total Monthly Ticket Volume Trend'}
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Jan 2025 – Jun 2026</span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'stacked' ? (
                <BarChart data={monthlyVolume} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="year_month" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                  <Bar dataKey="chat" stackId="a" fill={CHANNEL_COLORS.chat} name="Chat" />
                  <Bar dataKey="email" stackId="a" fill={CHANNEL_COLORS.email} name="Email" />
                  <Bar dataKey="voice" stackId="a" fill={CHANNEL_COLORS.voice} name="Voice" />
                  <Bar dataKey="social" stackId="a" fill={CHANNEL_COLORS.social} name="Social" />
                </BarChart>
              ) : (
                <AreaChart data={monthlyVolume} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="year_month" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="total" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTotal)" name="Total Volume" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channel Mix Pie */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Channel Volume Mix</h3>
            <p className="text-[11px] text-slate-500">Intake channel proportion over reporting period</p>
            <div className="h-56 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {channelPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    formatter={(val, name, item) => [`${val.toLocaleString()} tickets (${item.payload.share}%)`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-3">
            {channels.map((c, i) => (
              <div key={c.channel} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }}></span>
                  <span className="font-semibold text-slate-700 capitalize">{c.channel}</span>
                </div>
                <div className="space-x-2 font-mono">
                  <span className="text-slate-900 font-bold">{c.volume.toLocaleString()}</span>
                  <span className="text-slate-500">({c.share_pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Monthly Volume & Channel Detail Table
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">18 Monthly Periods</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4 text-right">Total Volume</th>
                <th className="py-3 px-4 text-right text-sky-600">Chat</th>
                <th className="py-3 px-4 text-right text-indigo-600">Email</th>
                <th className="py-3 px-4 text-right text-amber-600">Voice</th>
                <th className="py-3 px-4 text-right text-pink-600">Social</th>
                <th className="py-3 px-4 text-right text-slate-600">Helpdesk</th>
                <th className="py-3 px-4 text-right text-slate-600">Legacy FD</th>
                <th className="py-3 px-4 text-right text-rose-600">SLA Breaches</th>
                <th className="py-3 px-4 text-right text-rose-600">Breach %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {monthlyVolume.map((row) => (
                <tr key={row.year_month} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-bold text-slate-900">{row.year_month}</td>
                  <td className="py-2.5 px-4 text-right font-bold text-slate-900">{row.total.toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-right font-semibold text-slate-700">{row.chat}</td>
                  <td className="py-2.5 px-4 text-right font-semibold text-slate-700">{row.email}</td>
                  <td className="py-2.5 px-4 text-right font-semibold text-slate-700">{row.voice}</td>
                  <td className="py-2.5 px-4 text-right font-semibold text-slate-700">{row.social}</td>
                  <td className="py-2.5 px-4 text-right text-slate-500">{row.helpdesk}</td>
                  <td className="py-2.5 px-4 text-right text-slate-500">{row.legacy_fd}</td>
                  <td className="py-2.5 px-4 text-right font-semibold text-rose-600">{row.breaches}</td>
                  <td className="py-2.5 px-4 text-right font-semibold text-rose-600">{row.breach_rate_pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
