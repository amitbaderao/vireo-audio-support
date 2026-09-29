import React from 'react';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Tags,
  BadgePercent,
  ArrowLeftRight,
  Search,
  ShieldCheck,
  FileText
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'insights', label: 'Executive Summary', icon: LayoutDashboard },
    { id: 'volume', label: 'Volume Analysis', icon: BarChart3 },
    { id: 'teams', label: 'Team Analysis', icon: Users, badge: 'Tier 1 / 2' },
    { id: 'categories', label: 'Category Analysis', icon: Tags },
    { id: 'sla_cost', label: 'SLA & Cost', icon: BadgePercent },
    { id: 'transfers', label: 'Transfers', icon: ArrowLeftRight, badge: 'Key Leak' },
    { id: 'tickets', label: 'Ticket Explorer', icon: Search },
    { id: 'data_quality', label: 'Data Quality', icon: ShieldCheck }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen">
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white font-bold">
            VA
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Vireo Audio Support</div>
            <div className="text-xs text-slate-400">CX & Operations Portal</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 pt-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Decision & Reporting
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-sky-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                  isActive ? 'bg-sky-700/60 text-sky-100' : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-400">
        <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
          <div className="text-[11px] font-semibold text-sky-400 uppercase">Policy Standard</div>
          <div className="text-[11px] text-slate-300 mt-1">
            Support Policy v3.2 (Apr 2025)
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            IST timestamps • Blended ₹290 • Transfers ₹305
          </div>
        </div>
      </div>
    </aside>
  );
}
