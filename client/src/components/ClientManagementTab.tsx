import React, { useState, useEffect } from 'react';
import {
  ClientPartner,
  ClientSummaryMetrics,
  ClientOnboardedShop,
} from '../types';
import {
  fetchClientsApi,
  createClientApi,
  updateClientApi,
  deleteClientApi,
  recordClientPayoutApi,
  fetchClientOnboardedShopsApi,
} from '../services/api';
import {
  Briefcase,
  Store,
  Plus,
  Search,
  Check,
  CheckCheck,
  Copy,
  ExternalLink,
  Pencil,
  Trash2,
  RefreshCw,
  Wallet,
  X,
  Clock,
  TrendingUp,
  Send,
  Users,
} from 'lucide-react';

interface ClientManagementTabProps {
  token?: string;
}

export const ClientManagementTab: React.FC<ClientManagementTabProps> = ({ token }) => {
  const [clients, setClients] = useState<ClientPartner[]>([]);
  const [summary, setSummary] = useState<ClientSummaryMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending_payout' | 'target_reached'>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingClient, setEditingClient] = useState<ClientPartner | null>(null);
  const [payoutClient, setPayoutClient] = useState<ClientPartner | null>(null);
  const [payoutAmountRs, setPayoutAmountRs] = useState<number>(0);
  const [payoutUpiRef, setPayoutUpiRef] = useState<string>('');
  const [payoutNotes, setPayoutNotes] = useState<string>('');
  const [payoutSubmitting, setPayoutSubmitting] = useState<boolean>(false);

  // View Shops Drawer state
  const [viewingShopsClient, setViewingShopsClient] = useState<ClientPartner | null>(null);
  const [shopsList, setShopsList] = useState<ClientOnboardedShop[]>([]);
  const [shopsLoading, setShopsLoading] = useState<boolean>(false);
  const [shopSearch, setShopSearch] = useState<string>('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '+91 ',
    upiId: '',
    clientCode: '',
    commissionRatePercent: 50,
    minShopsThreshold: 50,
    area: '',
    status: 'active' as 'active' | 'inactive',
    notes: '',
  });

  useEffect(() => {
    loadClients();
  }, [token]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const res = await fetchClientsApi(token);
      setClients(res.clients || []);
      setSummary(res.summary || null);
    } catch (err) {
      console.error('Failed to load clients data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {}
  };

  const handleOpenAdd = () => {
    const randomCode = `CL-${Math.floor(100 + Math.random() * 900)}`;
    setFormData({
      name: '',
      phone: '+91 ',
      upiId: '',
      clientCode: randomCode,
      commissionRatePercent: 50,
      minShopsThreshold: 50,
      area: '',
      status: 'active',
      notes: '',
    });
    setEditingClient(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (client: ClientPartner) => {
    setFormData({
      name: client.name,
      phone: client.phone,
      upiId: client.upiId,
      clientCode: client.clientCode,
      commissionRatePercent: client.commissionRatePercent || 50,
      minShopsThreshold: client.minShopsThreshold || 50,
      area: client.area || '',
      status: client.status,
      notes: client.notes || '',
    });
    setEditingClient(client);
    setIsAddModalOpen(true);
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.upiId.trim()) return;

    try {
      if (editingClient) {
        await updateClientApi(editingClient.id, formData, token);
      } else {
        await createClientApi(formData, token);
      }
      setIsAddModalOpen(false);
      setEditingClient(null);
      loadClients();
    } catch (err: any) {
      alert(err.message || 'Failed to save field client');
    }
  };

  const handleDeleteClient = async (client: ClientPartner) => {
    if (!window.confirm(`Are you sure you want to delete "${client.name}" (${client.clientCode})?`)) return;
    try {
      await deleteClientApi(client.id, token);
      loadClients();
    } catch (err: any) {
      alert(err.message || 'Failed to delete client');
    }
  };

  const handleOpenPayout = (client: ClientPartner) => {
    setPayoutClient(client);
    setPayoutAmountRs(Math.round((client.pendingPayoutPaise || 0) / 100));
    setPayoutUpiRef('');
    setPayoutNotes('Commission payout for merchant onboarding');
  };

  const handleSubmitPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutClient || payoutAmountRs <= 0) return;

    setPayoutSubmitting(true);
    try {
      await recordClientPayoutApi(
        payoutClient.id,
        {
          amountPaise: Math.round(payoutAmountRs * 100),
          paidToUpi: payoutClient.upiId,
          upiRefId: payoutUpiRef.trim() || undefined,
          notes: payoutNotes.trim() || undefined,
        },
        token
      );
      setPayoutClient(null);
      loadClients();
    } catch (err: any) {
      alert(err.message || 'Failed to record payout');
    } finally {
      setPayoutSubmitting(false);
    }
  };

  const handleOpenShops = async (client: ClientPartner) => {
    setViewingShopsClient(client);
    setShopSearch('');
    setShopsLoading(true);
    try {
      const list = await fetchClientOnboardedShopsApi(client.id, token);
      setShopsList(list || []);
    } catch (err) {
      console.error('Failed to load client shops:', err);
      setShopsList([]);
    } finally {
      setShopsLoading(false);
    }
  };

  const handleWhatsAppShare = (client: ClientPartner) => {
    const refUrl = `${window.location.origin}/merchant?ref=${client.clientCode}`;
    const text = `Hello! Register your shop on Ente Bazaar using our partner link:\n\nLink: ${refUrl}\nReferral Code: ${client.clientCode}\nOnboarding Partner: ${client.name} (${client.phone})`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  // Filtered clients
  const filteredClients = clients.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.clientCode.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      (c.area && c.area.toLowerCase().includes(q)) ||
      c.upiId.toLowerCase().includes(q);

    let matchesStatus = true;
    if (statusFilter === 'active') {
      matchesStatus = c.status === 'active';
    } else if (statusFilter === 'inactive') {
      matchesStatus = c.status === 'inactive';
    } else if (statusFilter === 'pending_payout') {
      matchesStatus = (c.pendingPayoutPaise || 0) > 0;
    } else if (statusFilter === 'target_reached') {
      matchesStatus = (c.totalShopsCount || 0) >= (c.minShopsThreshold || 50);
    }

    return matchesSearch && matchesStatus;
  });

  const totalClients = summary?.totalClients ?? clients.length;
  const totalActive = summary?.totalActiveClients ?? clients.filter((c) => c.status === 'active').length;
  const totalShops = summary?.totalShopsOnboarded ?? clients.reduce((acc, c) => acc + (c.totalShopsCount || 0), 0);
  const totalEarnings = summary ? Math.round(summary.totalEarningsPaise / 100) : 0;
  const pendingPayout = summary ? Math.round(summary.pendingPayoutPaise / 100) : 0;

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. TOP STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Total Field Partners */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Field Partners</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 font-sans">
            {totalClients}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{totalActive} active partners</span>
          </div>
        </div>

        {/* Metric 2: Onboarded Stores */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Onboarded Stores</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 font-sans">
            {totalShops}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
            <span>Verified merchant network</span>
          </div>
        </div>

        {/* Metric 3: Total Commission Earned */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Commission</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 font-sans">
            ₹{totalEarnings.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
            <span>Cumulative partner earnings</span>
          </div>
        </div>

        {/* Metric 4: Pending Payouts */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Payouts</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 font-sans">
            ₹{pendingPayout.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Ready for UPI disbursement</span>
          </div>
        </div>
      </div>

      {/* 2. ACTION & FILTER TOOLBAR */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, code (CL-101), phone, or territory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl text-xs text-slate-900 outline-none transition-colors placeholder:text-slate-400"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none cursor-pointer"
          >
            <option value="all">All Partners ({clients.length})</option>
            <option value="active">Active Only</option>
            <option value="pending_payout">Pending Payouts</option>
            <option value="target_reached">Milestone Reached (50+)</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadClients}
            title="Refresh"
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Field Partner</span>
          </button>
        </div>
      </div>

      {/* 3. CLIENTS LIST (TABLE ON DESKTOP, CARDS ON MOBILE) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-200/90 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Field Partners & Onboarding Agents ({filteredClients.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage client codes, store registrations, commissions, and UPI payouts
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Loading partners...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto text-xl">
              <Briefcase className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-900">No field partners found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add your first partner to start tracking store onboardings and commissions.
            </p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Field Partner</span>
            </button>
          </div>
        ) : (
          <>
            {/* Desktop View Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200/90 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Partner / Agent</th>
                    <th className="px-4 py-3">Referral Code</th>
                    <th className="px-4 py-3">Payout UPI ID</th>
                    <th className="px-4 py-3 text-center">Commission</th>
                    <th className="px-4 py-3 text-center">Progress (50 Goal)</th>
                    <th className="px-4 py-3 text-right">Earned</th>
                    <th className="px-4 py-3 text-right">Paid</th>
                    <th className="px-4 py-3 text-right">Pending</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredClients.map((client) => {
                    const pendingPaise = client.pendingPayoutPaise || 0;
                    const shopsCount = client.totalShopsCount || 0;
                    const minTarget = client.minShopsThreshold || 50;
                    const isTargetReached = shopsCount >= minTarget;
                    const targetProgress = Math.min(100, Math.round((shopsCount / minTarget) * 100));

                    return (
                      <tr key={client.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Name & Contact */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center shrink-0">
                              {client.name ? client.name.charAt(0).toUpperCase() : 'C'}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{client.name}</div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono">{client.phone}</span>
                                {client.area && (
                                  <>
                                    <span>•</span>
                                    <span className="truncate max-w-[110px] text-slate-500">{client.area}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Referral Code */}
                        <td className="px-4 py-3">
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 font-mono font-semibold text-xs text-slate-800">
                            <span>{client.clientCode}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(client.clientCode, `code-${client.id}`)}
                              title="Copy Code"
                              className="text-slate-400 hover:text-slate-800 cursor-pointer"
                            >
                              {copiedKey === `code-${client.id}` ? (
                                <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* UPI ID */}
                        <td className="px-4 py-3">
                          <div className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-800 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                            <span>{client.upiId}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(client.upiId, `upi-${client.id}`)}
                              title="Copy UPI ID"
                              className="text-slate-400 hover:text-slate-800 cursor-pointer"
                            >
                              {copiedKey === `upi-${client.id}` ? (
                                <CheckCheck className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Commission % */}
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-0.5 rounded-full font-semibold text-xs bg-slate-100 text-slate-700">
                            {client.commissionRatePercent}%
                          </span>
                        </td>

                        {/* Target Progress Bar & Shops Count */}
                        <td className="px-4 py-3 text-center">
                          <div className="flex flex-col items-center gap-1 min-w-[110px]">
                            <button
                              type="button"
                              onClick={() => handleOpenShops(client)}
                              className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                              title="View Onboarded Stores"
                            >
                              <Store className="w-3 h-3 text-slate-500" />
                              <span>{shopsCount} / {minTarget}</span>
                            </button>

                            {/* Progress bar */}
                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${isTargetReached ? 'bg-emerald-600' : 'bg-slate-400'}`}
                                style={{ width: `${targetProgress}%` }}
                              />
                            </div>

                            {isTargetReached ? (
                              <span className="text-[10px] font-semibold text-emerald-700">
                                Milestone Met
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">
                                {minTarget - shopsCount} remaining
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Total Earned */}
                        <td className="px-4 py-3 text-right font-medium text-slate-900">
                          ₹{Math.round((client.totalEarningsPaise || 0) / 100).toLocaleString('en-IN')}
                        </td>

                        {/* Paid */}
                        <td className="px-4 py-3 text-right text-slate-500">
                          ₹{Math.round((client.totalPaidPaise || 0) / 100).toLocaleString('en-IN')}
                        </td>

                        {/* Pending Payout */}
                        <td className="px-4 py-3 text-right">
                          <span
                            className={`font-semibold ${
                              pendingPaise > 0
                                ? 'text-slate-900 font-bold'
                                : 'text-slate-400'
                            }`}
                          >
                            ₹{Math.round(pendingPaise / 100).toLocaleString('en-IN')}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {/* Pay Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenPayout(client)}
                              disabled={pendingPaise <= 0}
                              title={pendingPaise > 0 ? `Disburse Payout (₹${Math.round(pendingPaise / 100)})` : 'No pending balance'}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                                pendingPaise > 0
                                  ? 'bg-slate-900 hover:bg-slate-800 text-white'
                                  : 'bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed'
                              }`}
                            >
                              <Wallet className="w-3 h-3" />
                              <span>Pay</span>
                            </button>

                            {/* WhatsApp Share */}
                            <button
                              type="button"
                              onClick={() => handleWhatsAppShare(client)}
                              title="Share referral link on WhatsApp"
                              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(client)}
                              title="Edit Partner"
                              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleDeleteClient(client)}
                              title="Delete Partner"
                              className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile View Cards */}
            <div className="lg:hidden divide-y divide-slate-100">
              {filteredClients.map((client) => {
                const pendingPaise = client.pendingPayoutPaise || 0;
                const shopsCount = client.totalShopsCount || 0;
                const minTarget = client.minShopsThreshold || 50;
                const isTargetReached = shopsCount >= minTarget;
                const targetProgress = Math.min(100, Math.round((shopsCount / minTarget) * 100));

                return (
                  <div key={client.id} className="p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center shrink-0">
                          {client.name ? client.name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-sm text-slate-900 truncate">{client.name}</h4>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono">{client.phone}</span>
                            {client.area && (
                              <>
                                <span>•</span>
                                <span className="truncate max-w-[120px]">{client.area}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 font-mono font-semibold text-xs text-slate-800 shrink-0">
                        <span>{client.clientCode}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(client.clientCode, `code-mob-${client.id}`)}
                          className="text-slate-400 hover:text-slate-800 cursor-pointer"
                        >
                          {copiedKey === `code-mob-${client.id}` ? (
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Progress Towards 50 Shops Milestone */}
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => handleOpenShops(client)}
                          className="font-semibold text-slate-800 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Store className="w-3.5 h-3.5 text-slate-500" />
                          <span>Onboarded: {shopsCount} stores</span>
                        </button>
                        <span className="text-xs text-slate-500">
                          Goal: {minTarget} ({targetProgress}%)
                        </span>
                      </div>

                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isTargetReached ? 'bg-emerald-600' : 'bg-slate-400'}`}
                          style={{ width: `${targetProgress}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                        <span>
                          {isTargetReached ? 'Milestone Reached' : `${minTarget - shopsCount} more needed`}
                        </span>
                        <span className="font-semibold text-slate-700">
                          {client.commissionRatePercent}% Commission
                        </span>
                      </div>
                    </div>

                    {/* Financial Summary Grid */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] text-slate-500 block">Earned</span>
                        <span className="font-semibold text-slate-900">
                          ₹{Math.round((client.totalEarningsPaise || 0) / 100)}
                        </span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] text-slate-500 block">Paid</span>
                        <span className="text-slate-600">
                          ₹{Math.round((client.totalPaidPaise || 0) / 100)}
                        </span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] text-slate-500 block font-semibold">Pending</span>
                        <span className="font-bold text-slate-900">
                          ₹{Math.round(pendingPaise / 100)}
                        </span>
                      </div>
                    </div>

                    {/* Payee UPI ID */}
                    <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                      <span className="text-xs text-slate-500">Payee UPI:</span>
                      <div className="flex items-center gap-1.5 font-mono font-semibold text-slate-800">
                        <span>{client.upiId}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(client.upiId, `upi-mob-${client.id}`)}
                          className="text-slate-400 hover:text-slate-800 cursor-pointer"
                        >
                          {copiedKey === `upi-mob-${client.id}` ? (
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Actions Toolbar */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(client)}
                          className="p-2 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 cursor-pointer"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClient(client)}
                          className="p-2 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-600 rounded-xl cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleWhatsAppShare(client)}
                          className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Share</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenPayout(client)}
                        disabled={pendingPaise <= 0}
                        className={`py-2 px-4 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                          pendingPaise > 0
                            ? 'bg-slate-900 hover:bg-slate-800 text-white'
                            : 'bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <Wallet className="w-3.5 h-3.5" />
                        <span>Disburse Payout</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* 4. MODAL: ADD / EDIT CLIENT PARTNER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-xl relative max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center text-lg">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingClient ? 'Edit Field Partner' : 'Add New Field Partner'}
                </h3>
                <p className="text-xs text-slate-500">
                  Configure partner account details, referral code, and commission parameters
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Partner Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shoucky"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl text-xs font-semibold text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 80759 50428"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl text-xs font-semibold text-slate-900 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payout UPI ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 8075950428@fam"
                    value={formData.upiId}
                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl text-xs font-semibold text-slate-900 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Referral Code (Client Code) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CL-101"
                    value={formData.clientCode}
                    onChange={(e) => setFormData({ ...formData, clientCode: e.target.value.toUpperCase().trim() })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl text-xs font-semibold text-slate-900 outline-none font-mono uppercase tracking-wider"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Commission Rate (%) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      max="100"
                      value={formData.commissionRatePercent}
                      onChange={(e) => setFormData({ ...formData, commissionRatePercent: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl text-xs font-semibold text-slate-900 outline-none"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">%</span>
                  </div>
                  {/* Quick percentage buttons */}
                  <div className="flex gap-1 mt-1.5">
                    {[30, 40, 50, 60].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setFormData({ ...formData, commissionRatePercent: pct })}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-colors cursor-pointer ${
                          formData.commissionRatePercent === pct
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Min Store Target (Milestone) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.minShopsThreshold}
                    onChange={(e) => setFormData({ ...formData, minShopsThreshold: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl text-xs font-semibold text-slate-900 outline-none"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Standard onboarding goal before full payout release
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Territory / Area
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tirur Town, Kottakkal, Malappuram"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl text-xs text-slate-900 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status
                </label>
                <div className="flex gap-2">
                  <label className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer text-xs font-semibold text-slate-800">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formData.status === 'active'}
                      onChange={() => setFormData({ ...formData, status: 'active' })}
                      className="accent-slate-900"
                    />
                    <span>Active</span>
                  </label>
                  <label className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer text-xs font-semibold text-slate-800">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={formData.status === 'inactive'}
                      onChange={() => setFormData({ ...formData, status: 'inactive' })}
                      className="accent-slate-900"
                    />
                    <span>Inactive</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Bank details or administrative comments"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl text-xs text-slate-900 outline-none font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{editingClient ? 'Save Changes' : 'Create Partner'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL: RECORD PAYOUT TO CLIENT */}
      {payoutClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl relative">
            <button
              type="button"
              onClick={() => setPayoutClient(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center pt-1 mb-4">
              <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mx-auto mb-2">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Record Commission Payout
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {payoutClient.name} ({payoutClient.clientCode})
              </p>
            </div>

            {/* Client Payee Box */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center mb-4 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Payee UPI ID
              </span>
              <div className="text-sm font-mono font-bold text-slate-900 flex items-center justify-center gap-1.5">
                <span>{payoutClient.upiId}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(payoutClient.upiId, 'payout-upi')}
                  title="Copy UPI ID"
                  className="p-1 hover:bg-white rounded-lg transition-colors cursor-pointer text-slate-500 hover:text-slate-900"
                >
                  {copiedKey === 'payout-upi' ? (
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Direct UPI App launcher */}
              <a
                href={`upi://pay?pa=${encodeURIComponent(payoutClient.upiId)}&pn=${encodeURIComponent(payoutClient.name)}&am=${payoutAmountRs}&cu=INR&tn=PriceTeller%20Commission%20Payout`}
                className="inline-flex items-center gap-1.5 mt-1 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xs hover:bg-slate-800 transition-all cursor-pointer"
              >
                <span>Launch UPI App (GPay / PhonePe)</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>

            {/* Milestone Threshold Notice */}
            {(payoutClient.totalShopsCount || 0) < (payoutClient.minShopsThreshold || 50) ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-0.5 mb-3">
                <span className="font-semibold block text-amber-800">Note: Milestone Target Incomplete</span>
                <p className="text-[11px] text-amber-700">
                  This partner has onboarded {payoutClient.totalShopsCount || 0}/50 stores. You may still disburse early payouts as an admin.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-0.5 mb-3">
                <span className="font-semibold block text-emerald-800">✓ Target Milestone Completed</span>
                <p className="text-[11px] text-emerald-700">
                  Partner has onboarded {payoutClient.totalShopsCount} stores. Ready for full commission release.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmitPayout} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payout Amount (₹ INR) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-slate-500 font-bold">₹</span>
                  <input
                    type="number"
                    required
                    min="1"
                    value={payoutAmountRs}
                    onChange={(e) => setPayoutAmountRs(Number(e.target.value))}
                    className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl text-sm font-bold text-slate-900 outline-none"
                  />
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                  <span>Total Pending: ₹{Math.round((payoutClient.pendingPayoutPaise || 0) / 100)}</span>
                  <button
                    type="button"
                    onClick={() => setPayoutAmountRs(Math.round((payoutClient.pendingPayoutPaise || 0) / 100))}
                    className="text-slate-800 font-semibold hover:underline cursor-pointer"
                  >
                    Set Full Balance
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  UPI UTR / Reference ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 423987123456"
                  value={payoutUpiRef}
                  onChange={(e) => setPayoutUpiRef(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl text-xs font-mono text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl text-xs text-slate-900 outline-none font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPayoutClient(null)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={payoutSubmitting}
                  className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {payoutSubmitting ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Confirm Payout</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: VIEW ONBOARDED SHOPS */}
      {viewingShopsClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-xl relative max-h-[90vh] flex flex-col">
            <button
              type="button"
              onClick={() => setViewingShopsClient(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 pb-3 border-b border-slate-200 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center text-lg">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {viewingShopsClient.name} - Onboarded Stores ({shopsList.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Client Code: <b className="font-mono text-slate-700">{viewingShopsClient.clientCode}</b> · Commission: <b>{viewingShopsClient.commissionRatePercent}%</b>
                </p>
              </div>
            </div>

            {/* Shop Search Filter */}
            {shopsList.length > 0 && (
              <div className="mb-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search store name..."
                    value={shopSearch}
                    onChange={(e) => setShopSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto pr-1">
              {shopsLoading ? (
                <div className="py-16 text-center text-slate-500">
                  <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs">Loading store list...</p>
                </div>
              ) : shopsList.length === 0 ? (
                <div className="py-16 text-center space-y-2">
                  <Store className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-sm font-semibold text-slate-900">No stores onboarded yet</p>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Stores registering with code <b className="font-mono">{viewingShopsClient.clientCode}</b> will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {shopsList
                    .filter((s) => {
                      const q = shopSearch.toLowerCase().trim();
                      return (
                        !q ||
                        (s.shopName && s.shopName.toLowerCase().includes(q)) ||
                        (s.merchantName && s.merchantName.toLowerCase().includes(q))
                      );
                    })
                    .map((shop, idx) => (
                      <div key={idx} className="py-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-semibold text-sm text-slate-900 truncate">
                            {shop.shopName || shop.merchantName}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="font-mono">{shop.merchantEmail || shop.merchantPhone}</span>
                            <span>•</span>
                            <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded">
                              {shop.planName || 'Plan'}
                            </span>
                            <span>•</span>
                            <span>{new Date(shop.subscribedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-xs font-bold text-slate-900">
                            ₹{Math.round(shop.amountPaise / 100).toLocaleString('en-IN')}
                          </div>
                          <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg inline-flex items-center gap-0.5 mt-0.5">
                            <span>+ ₹{Math.round((shop.commissionPaise || 0) / 100)} comm</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingShopsClient(null)}
                className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
