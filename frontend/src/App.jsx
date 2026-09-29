import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import KpiCard from './components/KpiCard';
import ExecutiveSummaryView from './views/ExecutiveSummaryView';
import VolumeAnalysisView from './views/VolumeAnalysisView';
import TeamAnalysisView from './views/TeamAnalysisView';
import CategoryAnalysisView from './views/CategoryAnalysisView';
import SlaCostView from './views/SlaCostView';
import TransfersView from './views/TransfersView';
import TicketExplorerView from './views/TicketExplorerView';
import DataQualityView from './views/DataQualityView';

import {
  Inbox,
  Users,
  AlertTriangle,
  Clock,
  ArrowLeftRight,
  BadgePercent,
  Calculator,
  ShieldCheck
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('insights');
  const [summary, setSummary] = useState(null);
  const [monthlyVolume, setMonthlyVolume] = useState(null);
  const [teamSummary, setTeamSummary] = useState(null);
  const [monthlyTeam, setMonthlyTeam] = useState(null);
  const [categories, setCategories] = useState(null);
  const [monthlyCategory, setMonthlyCategory] = useState(null);
  const [channels, setChannels] = useState(null);
  const [sla, setSla] = useState(null);
  const [cost, setCost] = useState(null);
  const [transfers, setTransfers] = useState(null);
  const [dataQuality, setDataQuality] = useState(null);
  const [insights, setInsights] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    try {
      const [
        sumRes,
        volRes,
        teamRes,
        mTeamRes,
        catRes,
        mCatRes,
        chanRes,
        slaRes,
        costRes,
        transRes,
        dqRes,
        insRes
      ] = await Promise.all([
        fetch('/api/summary'),
        fetch('/api/monthly-volume'),
        fetch('/api/team-summary'),
        fetch('/api/monthly-team'),
        fetch('/api/category-summary'),
        fetch('/api/monthly-category'),
        fetch('/api/channel-summary'),
        fetch('/api/sla'),
        fetch('/api/cost'),
        fetch('/api/transfers'),
        fetch('/api/data-quality'),
        fetch('/api/insights')
      ]);

      if (!sumRes.ok) throw new Error("API call failed");

      setSummary(await sumRes.json());
      setMonthlyVolume(await volRes.json());
      setTeamSummary(await teamRes.json());
      setMonthlyTeam(await mTeamRes.json());
      setCategories(await catRes.json());
      setMonthlyCategory(await mCatRes.json());
      setChannels(await chanRes.json());
      setSla(await slaRes.json());
      setCost(await costRes.json());
      setTransfers(await transRes.json());
      setDataQuality(await dqRes.json());
      setInsights(await insRes.json());
      setError(null);
    } catch (err) {
      console.error("Dashboard data load error:", err);
      setError("Unable to connect to FastAPI backend. Ensure the server is running on port 8000.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onRefresh={fetchDashboardData} isRefreshing={isRefreshing} />

        <main className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl w-full mx-auto">
          {error ? (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-xl flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
              <div>
                <h3 className="font-bold text-sm">Backend Connection Error</h3>
                <p className="text-xs mt-1">{error}</p>
              </div>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
              <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase">
                Loading Vireo Audio Helpdesk Data...
              </p>
            </div>
          ) : (
            <>
              {/* Top Global KPI Header Cards */}
              <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                <KpiCard
                  title="Total Tickets"
                  value={summary.total_tickets.toLocaleString()}
                  subtext="Jan 2025 – Jun 2026"
                  icon={Inbox}
                  color="sky"
                />

                <KpiCard
                  title="Tier 1 Tickets"
                  value={summary.tier_1_tickets.toLocaleString()}
                  subtext="Frontline volume"
                  icon={Users}
                  color="indigo"
                />

                <KpiCard
                  title="Largest Tier 1"
                  value={summary.largest_tier1_assigned_team}
                  subtext={`${summary.largest_tier1_assigned_share_pct}% of Tier 1`}
                  icon={Users}
                  color="violet"
                  highlight
                />

                <KpiCard
                  title="SLA Breach %"
                  value={`${summary.breach_rate_pct}%`}
                  subtext={`${summary.total_breaches.toLocaleString()} breaches`}
                  icon={AlertTriangle}
                  color="rose"
                />

                <KpiCard
                  title="Avg Handle Time"
                  value={`${summary.avg_handle_time_hours}h`}
                  subtext={`Median: ${summary.median_handle_time_hours}h`}
                  icon={Clock}
                  color="amber"
                />

                <KpiCard
                  title="Total Transfers"
                  value={summary.total_transfers_recorded.toLocaleString()}
                  subtext={`${summary.transfer_rate_pct}% helpdesk rate`}
                  icon={ArrowLeftRight}
                  color="indigo"
                />

                <KpiCard
                  title="Support Cost"
                  value={`₹${(summary.total_operating_cost_inr / 100000).toFixed(2)}L`}
                  subtext="Operating total"
                  icon={Calculator}
                  color="emerald"
                />
              </section>

              {/* View Router */}
              <div className="transition-all duration-200">
                {activeTab === 'insights' && (
                  <ExecutiveSummaryView summary={summary} insights={insights} />
                )}

                {activeTab === 'volume' && (
                  <VolumeAnalysisView
                    monthlyVolume={monthlyVolume}
                    channels={channels}
                    summary={summary}
                  />
                )}

                {activeTab === 'teams' && (
                  <TeamAnalysisView
                    teamSummary={teamSummary}
                    monthlyTeam={monthlyTeam}
                  />
                )}

                {activeTab === 'categories' && (
                  <CategoryAnalysisView
                    categories={categories}
                    monthlyCategory={monthlyCategory}
                  />
                )}

                {activeTab === 'sla_cost' && (
                  <SlaCostView sla={sla} cost={cost} />
                )}

                {activeTab === 'transfers' && (
                  <TransfersView transfers={transfers} />
                )}

                {activeTab === 'tickets' && (
                  <TicketExplorerView />
                )}

                {activeTab === 'data_quality' && (
                  <DataQualityView dataQuality={dataQuality} />
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
