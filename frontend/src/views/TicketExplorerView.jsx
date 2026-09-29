import React, { useState, useEffect } from 'react';
import { Search, Filter, RotateCcw, ChevronLeft, ChevronRight, Eye, ShieldAlert, CheckCircle } from 'lucide-react';
import TicketDetailModal from '../components/TicketDetailModal';

const TEAMS = [
  'All',
  'Chat Frontline',
  'Billing',
  'Logistics',
  'Email Frontline',
  'Returns Desk',
  'Voice Frontline',
  'Escalations & Warranty'
];

const CHANNELS = ['All', 'chat', 'email', 'voice', 'social'];
const PRIORITIES = ['All', 'Low', 'Normal', 'High'];
const STATUSES = ['All', 'resolved', 'closed', 'open', 'pending'];
const SOURCE_SYSTEMS = ['All', 'helpdesk', 'legacy_fd'];
const CATEGORIES = [
  'All',
  'Account & Login',
  'App & Firmware',
  'Audio Quality',
  'Billing & Payments',
  'Charging & Battery',
  'Connectivity',
  'Delivery & Shipping',
  'Other',
  'Product Enquiry',
  'Returns & Refunds',
  'Warranty & Repair'
];

export default function TicketExplorerView() {
  const [ticketsData, setTicketsData] = useState({ items: [], total: 0, total_pages: 1, page: 1 });
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [team, setTeam] = useState('All');
  const [category, setCategory] = useState('All');
  const [channel, setChannel] = useState('All');
  const [priority, setPriority] = useState('All');
  const [status, setStatus] = useState('All');
  const [sourceSystem, setSourceSystem] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString()
      });
      if (search) params.append('search', search);
      if (team !== 'All') params.append('team', team);
      if (category !== 'All') params.append('category', category);
      if (channel !== 'All') params.append('channel', channel);
      if (priority !== 'All') params.append('priority', priority);
      if (status !== 'All') params.append('status', status);
      if (sourceSystem !== 'All') params.append('source_system', sourceSystem);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const res = await fetch(`/api/tickets?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTicketsData(data);
      }
    } catch (err) {
      console.error("Failed to load tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [page, pageSize, team, category, channel, priority, status, sourceSystem, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTickets();
  };

  const handleResetFilters = () => {
    setSearch('');
    setTeam('All');
    setCategory('All');
    setChannel('All');
    setPriority('All');
    setStatus('All');
    setSourceSystem('All');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Ticket ID, Customer ID, Order ID, or Message text..."
              className="w-full pl-10 pr-24 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-md text-xs font-semibold"
            >
              Search
            </button>
          </form>

          <button
            onClick={handleResetFilters}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors self-start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="text-slate-500 font-medium block mb-1">Team</label>
            <select
              value={team}
              onChange={(e) => { setTeam(e.target.value); setPage(1); }}
              className="w-full p-2 border border-slate-200 rounded-lg bg-white text-slate-800"
            >
              {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="text-slate-500 font-medium block mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="w-full p-2 border border-slate-200 rounded-lg bg-white text-slate-800"
            >
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div>
            <label className="text-slate-500 font-medium block mb-1">Channel</label>
            <select
              value={channel}
              onChange={(e) => { setChannel(e.target.value); setPage(1); }}
              className="w-full p-2 border border-slate-200 rounded-lg bg-white text-slate-800 capitalize"
            >
              {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-slate-500 font-medium block mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => { setPriority(e.target.value); setPage(1); }}
              className="w-full p-2 border border-slate-200 rounded-lg bg-white text-slate-800"
            >
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <label className="text-slate-500 font-medium block mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full p-2 border border-slate-200 rounded-lg bg-white text-slate-800 capitalize"
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="text-slate-500 font-medium block mb-1">Source System</label>
            <select
              value={sourceSystem}
              onChange={(e) => { setSourceSystem(e.target.value); setPage(1); }}
              className="w-full p-2 border border-slate-200 rounded-lg bg-white text-slate-800"
            >
              {SOURCE_SYSTEMS.map(sys => <option key={sys} value={sys}>{sys}</option>)}
            </select>
          </div>

          <div>
            <label className="text-slate-500 font-medium block mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              min="2025-01-01"
              max="2026-06-30"
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="w-full p-1.5 border border-slate-200 rounded-lg bg-white text-slate-800 text-xs"
            />
          </div>

          <div>
            <label className="text-slate-500 font-medium block mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              min="2025-01-01"
              max="2026-06-30"
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="w-full p-1.5 border border-slate-200 rounded-lg bg-white text-slate-800 text-xs"
            />
          </div>

          <div>
            <label className="text-slate-500 font-medium block mb-1">Page Size</label>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="w-full p-2 border border-slate-200 rounded-lg bg-white text-slate-800"
            >
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Showing {ticketsData.total.toLocaleString()} Matching Tickets
          </div>
          <div className="text-xs text-slate-500">
            Page {ticketsData.page} of {ticketsData.total_pages}
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="p-12 text-center text-slate-500">Loading tickets...</div>
          ) : ticketsData.items.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No tickets found matching current filters.</div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Ticket ID</th>
                  <th className="py-3 px-3">Created IST</th>
                  <th className="py-3 px-2">Channel</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-2">Priority</th>
                  <th className="py-3 px-3">Assigned Team</th>
                  <th className="py-3 px-3">Resolving Agent</th>
                  <th className="py-3 px-2 text-center">Status</th>
                  <th className="py-3 px-2 text-right">CSAT</th>
                  <th className="py-3 px-2 text-center">SLA</th>
                  <th className="py-3 px-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {ticketsData.items.map((t) => (
                  <tr
                    key={t.ticket_id}
                    onClick={() => setSelectedTicket(t)}
                    className="hover:bg-sky-50/50 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 font-bold text-sky-700">{t.ticket_id}</td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{t.created_at.substring(0, 16)}</td>
                    <td className="py-2.5 px-2 capitalize font-semibold text-slate-700">{t.channel}</td>
                    <td className="py-2.5 px-3 text-slate-800 font-semibold">{t.category}</td>
                    <td className="py-2.5 px-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.priority === 'High' ? 'bg-rose-100 text-rose-800' :
                        t.priority === 'Normal' ? 'bg-slate-100 text-slate-700' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-900">{t.assigned_team}</td>
                    <td className="py-2.5 px-3 text-slate-700 font-mono text-[11px]">{t.agent_name || t.agent_id}</td>
                    <td className="py-2.5 px-2 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                        t.status === 'closed' ? 'bg-slate-200 text-slate-700' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-slate-700">
                      {t.csat_score ? `${t.csat_score}/5` : '-'}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      {t.is_breach ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-100 text-rose-800 font-bold">
                          BREACH
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                          MET
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedTicket(t); }}
                        className="p-1 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900"
                        title="View Ticket Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Showing page <strong>{ticketsData.page}</strong> of <strong>{ticketsData.total_pages}</strong>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <span className="text-xs font-semibold px-2">{page}</span>
            <button
              onClick={() => setPage(p => Math.min(ticketsData.total_pages, p + 1))}
              disabled={page >= ticketsData.total_pages}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Inspector */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
}
