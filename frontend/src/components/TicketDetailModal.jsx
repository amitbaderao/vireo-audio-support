import React from 'react';
import { X, CheckCircle, Clock, AlertTriangle, ArrowRight, User, Package, ShoppingBag, Shield } from 'lucide-react';

export default function TicketDetailModal({ ticket, onClose }) {
  if (!ticket) return null;

  const isBreached = ticket.is_breach;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-lg font-bold tracking-tight text-white">{ticket.ticket_id}</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              ticket.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
              ticket.status === 'closed' ? 'bg-slate-700 text-slate-300' :
              'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}>
              {ticket.status.toUpperCase()}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 font-medium">
              {ticket.channel.toUpperCase()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Key Routing Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block font-medium">Assigned Team</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">{ticket.assigned_team}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Resolving Team</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">{ticket.resolving_team || 'Pending'}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Resolving Agent</span>
              <span className="font-semibold text-slate-900 mt-0.5 block">
                {ticket.agent_name ? `${ticket.agent_name} (${ticket.agent_id})` : ticket.agent_id}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Transfers</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                {ticket.transfers !== null ? ticket.transfers : 'N/A (Legacy)'}
              </span>
            </div>
          </div>

          {/* SLA & Timing banner */}
          <div className={`p-4 rounded-xl border flex items-start space-x-3 text-xs ${
            isBreached ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            {isBreached ? (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <span className="font-bold block">First Response SLA: {isBreached ? 'BREACHED' : 'MET'}</span>
                <span className="text-[11px]">
                  Target: {ticket.sla_target_minutes} min | Actual: {Math.round(ticket.response_time_minutes)} min
                </span>
              </div>
              <div>
                <span className="font-semibold block">Handle Time</span>
                <span>{ticket.handle_time_hours ? `${ticket.handle_time_hours.toFixed(1)} hours` : 'In progress'}</span>
              </div>
              <div>
                <span className="font-semibold block">Store Credit</span>
                <span>{isBreached ? '₹350 Issued (Policy §3)' : '₹0'}</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Customer Message</h4>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-800 font-mono whitespace-pre-wrap leading-relaxed">
                {ticket.customer_message}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Agent Notes</h4>
              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 text-sm text-slate-800 font-mono whitespace-pre-wrap leading-relaxed">
                {ticket.agent_notes || 'No closing notes recorded.'}
              </div>
            </div>
          </div>

          {/* Associated metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-200 pt-5 text-xs">
            {/* Customer */}
            <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center space-x-1.5 font-bold text-slate-800">
                <User className="w-3.5 h-3.5 text-sky-600" />
                <span>Customer</span>
              </div>
              <div className="text-slate-600 space-y-0.5">
                <div><strong>ID:</strong> {ticket.customer_id}</div>
                <div><strong>Name:</strong> {ticket.customer_name || 'N/A'}</div>
                <div><strong>Location:</strong> {ticket.city ? `${ticket.city}, ${ticket.state}` : 'N/A'}</div>
                <div><strong>Care Plus:</strong> {ticket.customer_care_plus === 'Y' ? 'Yes (Enrolled)' : 'No'}</div>
              </div>
            </div>

            {/* Product */}
            <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center space-x-1.5 font-bold text-slate-800">
                <Package className="w-3.5 h-3.5 text-indigo-600" />
                <span>Product</span>
              </div>
              <div className="text-slate-600 space-y-0.5">
                <div><strong>SKU:</strong> {ticket.product_sku}</div>
                <div><strong>Product:</strong> {ticket.product_name || 'N/A'}</div>
                <div><strong>Family:</strong> {ticket.family || 'N/A'}</div>
                <div><strong>Retail Price:</strong> ₹{ticket.retail_price_inr?.toLocaleString() || 'N/A'}</div>
                <div><strong>Warranty:</strong> {ticket.warranty_months ? `${ticket.warranty_months} Months` : 'N/A'}</div>
              </div>
            </div>

            {/* Resolution Economics */}
            <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center space-x-1.5 font-bold text-slate-800">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>Outcome Economics</span>
              </div>
              <div className="text-slate-600 space-y-0.5">
                <div><strong>CSAT Score:</strong> {ticket.csat_score ? `${ticket.csat_score} / 5` : 'No response (Blank)'}</div>
                <div><strong>Refund:</strong> {ticket.refund_amount_inr ? `₹${ticket.refund_amount_inr.toLocaleString()} (${ticket.refund_reason_code})` : 'None'}</div>
                <div><strong>Replacement:</strong> {ticket.replacement_issued === 'Y' ? 'Yes (Issued)' : 'No'}</div>
                <div><strong>Order ID:</strong> {ticket.order_id || 'Not quoted by customer'}</div>
              </div>
            </div>
          </div>

          {/* Timestamps footer */}
          <div className="border-t border-slate-200 pt-4 flex flex-wrap justify-between text-[11px] text-slate-500">
            <div><strong>Created:</strong> {ticket.created_at} IST</div>
            <div><strong>First Response:</strong> {ticket.first_response_at} IST</div>
            <div><strong>Resolved:</strong> {ticket.resolved_at || 'Pending'}</div>
            <div><strong>Source System:</strong> {ticket.source_system}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
