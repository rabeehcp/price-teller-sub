import React, { useState, useEffect } from 'react';
import {
  SubscriptionPlan,
  MerchantSubscription,
  SubscriptionPayment,
  SubscriptionStats,
  AuditLog,
} from '../types';
import {
  fetchSubscriptionPlansApi,
  createSubscriptionPlanApi,
  updateSubscriptionPlanApi,
  deleteSubscriptionPlanApi,
  fetchAdminSubscriptionsApi,
  extendAdminSubscriptionApi,
  cancelAdminSubscriptionApi,
  fetchAdminSubscriptionPaymentsApi,
  fetchAdminSubscriptionStatsApi,
  fetchAdminAuditLogsApi,
} from '../services/api';
import {
  CreditCard,
  TrendingUp,
  Store,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  RotateCw,
  Trash2,
  Pencil,
  Copy,
  CheckCheck,
  X,
  Layers,
  Receipt,
  Activity,
  Calendar,
  Check,
} from 'lucide-react';

interface AdminSubscriptionTabProps {
  token?: string;
}

export const AdminSubscriptionTab: React.FC<AdminSubscriptionTabProps> = ({ token }) => {
  // Navigation sub-tab
  const [subTab, setSubTab] = useState<'subscriptions' | 'plans' | 'payments' | 'audit'>('subscriptions');

  // Data States
  const [subPlans, setSubPlans] = useState<SubscriptionPlan[]>([]);
  const [subList, setSubList] = useState<MerchantSubscription[]>([]);
  const [subPayments, setSubPayments] = useState<SubscriptionPayment[]>([]);
  const [subStats, setSubStats] = useState<SubscriptionStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Search
  const [subSearch, setSubSearch] = useState<string>('');
  const [subStatusFilter, setSubStatusFilter] = useState<'all' | 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'CANCELLED'>('all');
  const [paymentSearch, setPaymentSearch] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Extend Modal State
  const [extendingSub, setExtendingSub] = useState<MerchantSubscription | null>(null);
  const [extendDays, setExtendDays] = useState<number>(30);
  const [extendReason, setExtendReason] = useState<string>('Administrative extension');
  const [extendSubmitting, setExtendSubmitting] = useState<boolean>(false);

  // Plan Modal State
  const [isPlanModalOpen, setIsPlanModalOpen] = useState<boolean>(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    durationDays: 30,
    priceRs: 499,
    description: '',
    badge: '',
    featuresText: 'Unlimited Live Price Updates\nFull Hyperlocal Catalog Sync\nDirect Customer Orders & Pre-Bookings\nPOS Billing & Daily Sales Analytics\nDirect WhatsApp & Instant In-App Chat',
    isActive: true,
  });
  const [planSubmitting, setPlanSubmitting] = useState<boolean>(false);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadAllData();
    }
  }, [token]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      if (!token) return;
      const [plans, subs, payments, stats, logs] = await Promise.all([
        fetchSubscriptionPlansApi(true, token),
        fetchAdminSubscriptionsApi(token),
        fetchAdminSubscriptionPaymentsApi(token),
        fetchAdminSubscriptionStatsApi(token),
        fetchAdminAuditLogsApi(50, token),
      ]);
      setSubPlans(plans || []);
      setSubList(subs || []);
      setSubPayments(payments || []);
      setSubStats(stats || null);
      setAuditLogs(logs || []);
    } catch (err) {
      console.error('Failed to load subscription admin data:', err);
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

  const handleOpenNewPlan = () => {
    setEditingPlan(null);
    setPlanForm({
      name: '',
      durationDays: 30,
      priceRs: 499,
      description: 'Full access to Store Partner Merchant Suite.',
      badge: 'Popular',
      featuresText: 'Unlimited Live Price Updates\nFull Hyperlocal Catalog Sync\nDirect Customer Orders & Pre-Bookings\nPOS Billing & Daily Sales Analytics\nDirect WhatsApp & Instant In-App Chat',
      isActive: true,
    });
    setIsPlanModalOpen(true);
  };

  const handleOpenEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name,
      durationDays: plan.durationDays,
      priceRs: Math.round(plan.pricePaise / 100),
      description: plan.description || '',
      badge: plan.badge || '',
      featuresText: Array.isArray(plan.features) ? plan.features.join('\n') : '',
      isActive: plan.isActive,
    });
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !planForm.name.trim()) return;

    setPlanSubmitting(true);
    try {
      const features = planForm.featuresText
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);

      const payload = {
        name: planForm.name.trim(),
        durationDays: Number(planForm.durationDays),
        pricePaise: Math.round(Number(planForm.priceRs) * 100),
        description: planForm.description.trim(),
        badge: planForm.badge.trim() || undefined,
        features,
        isActive: planForm.isActive,
      };

      if (editingPlan) {
        await updateSubscriptionPlanApi(editingPlan.id, payload, token);
      } else {
        await createSubscriptionPlanApi(payload, token);
      }

      setIsPlanModalOpen(false);
      setEditingPlan(null);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to save subscription tier');
    } finally {
      setPlanSubmitting(false);
    }
  };

  const handleTogglePlanActive = async (plan: SubscriptionPlan) => {
    if (!token) return;
    try {
      await updateSubscriptionPlanApi(plan.id, { isActive: !plan.isActive }, token);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to update tier status');
    }
  };

  const handleDeletePlan = async (plan: SubscriptionPlan) => {
    if (!token) return;
    if (!window.confirm(`Are you sure you want to delete plan tier "${plan.name}"?`)) return;

    setDeletingPlanId(plan.id);
    try {
      await deleteSubscriptionPlanApi(plan.id, token);
      // Remove from local state immediately
      setSubPlans((prev) => prev.filter((p) => p.id !== plan.id));
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete plan');
    } finally {
      setDeletingPlanId(null);
    }
  };

  const handleOpenExtend = (sub: MerchantSubscription) => {
    setExtendingSub(sub);
    setExtendDays(30);
    setExtendReason('Administrative validity extension');
  };

  const handleSaveExtension = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extendingSub || !token || extendDays <= 0) return;

    setExtendSubmitting(true);
    try {
      await extendAdminSubscriptionApi(extendingSub.id, extendDays, extendReason, token);
      setExtendingSub(null);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to extend subscription');
    } finally {
      setExtendSubmitting(false);
    }
  };

  const handleCancelSubscription = async (sub: MerchantSubscription) => {
    if (!token) return;
    const reason = window.prompt(`Cancel subscription for ${sub.shopName || sub.merchantName}? Enter reason:`, 'Administrative cancellation');
    if (reason === null) return;

    try {
      await cancelAdminSubscriptionApi(sub.id, reason, token);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel subscription');
    }
  };

  // Filtered Subscriptions
  const filteredSubs = subList.filter((s) => {
    const q = subSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (s.shopName && s.shopName.toLowerCase().includes(q)) ||
      (s.merchantName && s.merchantName.toLowerCase().includes(q)) ||
      (s.merchantEmail && s.merchantEmail.toLowerCase().includes(q)) ||
      (s.plan?.name && s.plan.name.toLowerCase().includes(q));

    let matchesStatus = true;
    if (subStatusFilter === 'ACTIVE') {
      matchesStatus = s.status === 'ACTIVE' && (s.daysRemaining ?? 0) > 0;
    } else if (subStatusFilter === 'EXPIRING') {
      matchesStatus = s.status === 'ACTIVE' && (s.daysRemaining ?? 0) > 0 && (s.daysRemaining ?? 0) <= 7;
    } else if (subStatusFilter === 'EXPIRED') {
      matchesStatus = s.status === 'EXPIRED' || (s.daysRemaining ?? 0) <= 0;
    } else if (subStatusFilter === 'CANCELLED') {
      matchesStatus = s.status === 'CANCELLED';
    }

    return matchesSearch && matchesStatus;
  });

  // Filtered Payments
  const filteredPayments = subPayments.filter((p) => {
    const q = paymentSearch.toLowerCase().trim();
    return (
      !q ||
      (p.merchantName && p.merchantName.toLowerCase().includes(q)) ||
      (p.merchantEmail && p.merchantEmail.toLowerCase().includes(q)) ||
      (p.providerOrderId && p.providerOrderId.toLowerCase().includes(q)) ||
      p.id.toLowerCase().includes(q)
    );
  });

  const totalRevenue = subStats ? Math.round(subStats.totalRevenuePaise / 100) : 0;
  const mrr = subStats ? Math.round(subStats.monthlyRecurringPaise / 100) : 0;
  const activeCount = subStats?.activeCount ?? subList.filter((s) => s.status === 'ACTIVE').length;
  const expiredCount = subStats?.expiredCount ?? subList.filter((s) => s.status !== 'ACTIVE').length;

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. TOP STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Total Revenue */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
              ₹
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
            <span>Direct UPI & Gateway Collections</span>
          </div>
        </div>

        {/* Metric 2: MRR */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Monthly Run-Rate (MRR)</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            ₹{mrr.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
            <span>Estimated normalized monthly rate</span>
          </div>
        </div>

        {/* Metric 3: Active Subscriptions */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Subscriptions</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            {activeCount}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Unlocked merchant dashboards</span>
          </div>
        </div>

        {/* Metric 4: Expired / Renewals */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Expired / Inactive</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            {expiredCount}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
            <span>Requires follow-up / renewal</span>
          </div>
        </div>
      </div>

      {/* 2. SUB-NAVIGATION TABS & ACTION TOOLBAR */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Tabs Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
            <button
              type="button"
              onClick={() => setSubTab('subscriptions')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                subTab === 'subscriptions'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Store Subscriptions ({subList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab('plans')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                subTab === 'plans'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Pricing Tiers ({subPlans.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab('payments')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                subTab === 'payments'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Payment Ledger ({subPayments.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab('audit')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                subTab === 'audit'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Audit Log ({auditLogs.length})</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadAllData}
              title="Refresh"
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            >
              <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {subTab === 'plans' && (
              <button
                type="button"
                onClick={handleOpenNewPlan}
                className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Tier Plan</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* 3. TAB 1: STORE SUBSCRIPTIONS LIST */}
      {subTab === 'subscriptions' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by store name, email, or plan..."
                value={subSearch}
                onChange={(e) => setSubSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl text-xs text-slate-900 outline-none transition-colors placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={subStatusFilter}
                onChange={(e) => setSubStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none cursor-pointer"
              >
                <option value="all">All Statuses ({subList.length})</option>
                <option value="ACTIVE">Active Only</option>
                <option value="EXPIRING">Expiring within 7 Days</option>
                <option value="EXPIRED">Expired</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Subscriptions Grid / Table */}
          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
            {loading ? (
              <div className="py-16 text-center text-slate-500 space-y-2">
                <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs">Loading subscriptions...</p>
              </div>
            ) : filteredSubs.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto text-xl">
                  <CreditCard className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-900">No subscriptions found</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No store subscriptions matching the selected filter or query.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop View Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200/90 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Store / Merchant</th>
                        <th className="px-4 py-3">Plan Tier</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-center">Remaining</th>
                        <th className="px-4 py-3">Expires</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredSubs.map((sub) => {
                        const days = sub.daysRemaining ?? 0;
                        const isExpiringSoon = sub.status === 'ACTIVE' && days <= 7 && days > 0;

                        return (
                          <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                            {/* Merchant */}
                            <td className="px-4 py-3">
                              <div className="font-semibold text-slate-900 flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-xs shrink-0">
                                  🏪
                                </div>
                                <span className="truncate max-w-[200px]">{sub.shopName || sub.merchantName || 'Store Partner'}</span>
                              </div>
                              <div className="text-[11px] text-slate-500 ml-9 font-mono">{sub.merchantEmail}</div>
                            </td>

                            {/* Plan */}
                            <td className="px-4 py-3">
                              <span className="font-semibold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md">
                                {sub.plan?.name || sub.planId}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                                  sub.status === 'ACTIVE' && !isExpiringSoon
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : isExpiringSoon
                                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                    : sub.status === 'CANCELLED'
                                    ? 'bg-slate-100 text-slate-700'
                                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                                }`}
                              >
                                {isExpiringSoon ? 'Expiring Soon' : sub.status}
                              </span>
                            </td>

                            {/* Remaining Days */}
                            <td className="px-4 py-3 text-center">
                              {sub.status === 'ACTIVE' ? (
                                <div className="inline-flex flex-col items-center">
                                  <span className={`font-semibold text-xs ${isExpiringSoon ? 'text-amber-700' : 'text-slate-900'}`}>
                                    {days} {days === 1 ? 'day' : 'days'}
                                  </span>
                                  <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden mt-1">
                                    <div
                                      className={`h-full rounded-full ${isExpiringSoon ? 'bg-amber-500' : 'bg-emerald-600'}`}
                                      style={{ width: `${Math.min(100, (days / 30) * 100)}%` }}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <span className="text-slate-400 font-medium">—</span>
                              )}
                            </td>

                            {/* Expiry Date */}
                            <td className="px-4 py-3 text-slate-500">
                              <div className="flex items-center gap-1 text-xs">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>{new Date(sub.expiresAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenExtend(sub)}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Extend</span>
                                </button>

                                {sub.status === 'ACTIVE' && (
                                  <button
                                    type="button"
                                    onClick={() => handleCancelSubscription(sub)}
                                    title="Cancel active subscription"
                                    className="px-2 py-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards View */}
                <div className="md:hidden divide-y divide-slate-100">
                  {filteredSubs.map((sub) => {
                    const days = sub.daysRemaining ?? 0;
                    const isExpiringSoon = sub.status === 'ACTIVE' && days <= 7 && days > 0;

                    return (
                      <div key={sub.id} className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="font-semibold text-sm text-slate-900 truncate">
                              {sub.shopName || sub.merchantName || 'Store Partner'}
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate font-mono mt-0.5">
                              {sub.merchantEmail}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase shrink-0 ${
                              sub.status === 'ACTIVE' && !isExpiringSoon
                                ? 'bg-emerald-50 text-emerald-800'
                                : isExpiringSoon
                                ? 'bg-amber-50 text-amber-800'
                                : 'bg-rose-50 text-rose-800'
                            }`}
                          >
                            {isExpiringSoon ? 'Expiring' : sub.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                          <div>
                            <span className="text-[10px] text-slate-500 block">Plan</span>
                            <span className="font-semibold text-slate-900">{sub.plan?.name || sub.planId}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">Remaining</span>
                            <span className={`font-semibold ${isExpiringSoon ? 'text-amber-700' : 'text-slate-900'}`}>
                              {days > 0 ? `${days} days` : '0 days'}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 block">Expires</span>
                            <span className="text-slate-600">
                              {new Date(sub.expiresAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          {sub.status === 'ACTIVE' && (
                            <button
                              type="button"
                              onClick={() => handleCancelSubscription(sub)}
                              className="px-3 py-1.5 text-xs text-rose-600 font-semibold hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenExtend(sub)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Extend Days</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 4. TAB 2: SUBSCRIPTION TIER PLANS */}
      {subTab === 'plans' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Subscription Tier Offerings
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Public pricing and feature sets available to registering merchants
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenNewPlan}
              className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Tier</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                {/* Card Top */}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{plan.name}</h4>
                      {plan.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        plan.isActive
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {plan.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  {/* Price Banner */}
                  <div className="mt-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-baseline justify-between">
                    <div>
                      <span className="text-xl font-bold text-slate-900">
                        ₹{Math.round(plan.pricePaise / 100)}
                      </span>
                      <span className="text-xs text-slate-500 ml-1">/ {plan.durationDays} days</span>
                    </div>
                    <span className="text-xs text-slate-500">
                      ₹{Math.round((plan.pricePaise / 100) / (plan.durationDays / 30))}/mo
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                    {plan.description || 'Full merchant features included.'}
                  </p>

                  {/* Features List */}
                  <div className="mt-4 space-y-1.5">
                    {Array.isArray(plan.features) &&
                      plan.features.map((feat, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                          <Check className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Card Bottom Actions */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTogglePlanActive(plan)}
                      className={`text-xs font-semibold transition-colors cursor-pointer ${
                        plan.isActive ? 'text-slate-500 hover:text-slate-900' : 'text-emerald-700 hover:text-emerald-800'
                      }`}
                    >
                      {plan.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => handleOpenEditPlan(plan)}
                      className="text-xs font-semibold text-slate-700 hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeletePlan(plan)}
                    disabled={deletingPlanId === plan.id}
                    title="Delete Plan Tier"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TAB 3: SUBSCRIPTION PAYMENTS LEDGER */}
      {subTab === 'payments' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by order ID, merchant, or email..."
                value={paymentSearch}
                onChange={(e) => setPaymentSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl text-xs text-slate-900 outline-none transition-colors placeholder:text-slate-400"
              />
            </div>
            <span className="text-xs text-slate-500 px-2">
              {filteredPayments.length} recorded transactions
            </span>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
            {filteredPayments.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <Receipt className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-900">No payment transactions recorded</p>
                <p className="text-xs text-slate-500">Merchant subscription payments will appear here in real-time.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200/90 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Merchant / Store</th>
                      <th className="px-4 py-3">Order / UTR ID</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{p.merchantName || 'Store Partner'}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{p.merchantEmail || 'UPI Checkout'}</div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px] text-slate-700 font-semibold">
                            <span>{p.providerOrderId || p.id}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(p.providerOrderId || p.id, `pay-${p.id}`)}
                              title="Copy Order ID"
                              className="text-slate-400 hover:text-slate-800 cursor-pointer"
                            >
                              {copiedKey === `pay-${p.id}` ? (
                                <CheckCheck className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-right font-bold text-slate-900 text-sm">
                          ₹{Math.round(p.amountPaise / 100).toLocaleString('en-IN')}
                        </td>

                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                              p.status === 'SUCCESS'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : p.status === 'PENDING'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-slate-500 text-[11px]">
                          {new Date(p.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. TAB 4: AUDIT TRAIL LOGS */}
      {subTab === 'audit' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Subscription Administrative Audit Log
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Security trail of tier updates, extensions, and cancellations
            </p>
          </div>

          {auditLogs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No audit log entries recorded yet.
            </div>
          ) : (
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {log.action}
                      </span>
                      <span className="text-slate-500">by {log.actorRole || 'admin'}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(log.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="mt-1.5 text-slate-700 flex items-center gap-1 text-[11px]">
                    <span className="text-slate-500">Entity:</span>
                    <span className="font-mono font-semibold">{log.entityType} ({log.entityId})</span>
                  </div>

                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="mt-1.5 p-2 bg-white rounded-lg border border-slate-200 font-mono text-[10px] text-slate-600 overflow-x-auto">
                      {JSON.stringify(log.metadata, null, 2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7. MODAL: CREATE / EDIT TIER PLAN */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-xl relative max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsPlanModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center text-lg">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingPlan ? 'Edit Pricing Tier' : 'Create Pricing Tier'}
                </h3>
                <p className="text-xs text-slate-500">
                  Set plan name, duration, price, and feature entitlements
                </p>
              </div>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tier Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Monthly Starter / Annual Pro"
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl text-xs font-semibold text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Badge Tag (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Popular / Save 20%"
                    value={planForm.badge}
                    onChange={(e) => setPlanForm({ ...planForm, badge: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl text-xs text-slate-900 outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Price (₹ INR) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs text-slate-500 font-bold">₹</span>
                    <input
                      type="number"
                      required
                      min="0"
                      value={planForm.priceRs}
                      onChange={(e) => setPlanForm({ ...planForm, priceRs: Number(e.target.value) })}
                      className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl text-sm font-bold text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Duration (Days) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      value={planForm.durationDays}
                      onChange={(e) => setPlanForm({ ...planForm, durationDays: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl text-xs font-semibold text-slate-900 outline-none"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">Days</span>
                  </div>
                </div>
              </div>

              {/* Quick Duration Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-slate-500">Presets:</span>
                {[
                  { label: '30 Days', days: 30 },
                  { label: '90 Days', days: 90 },
                  { label: '180 Days', days: 180 },
                  { label: '365 Days', days: 365 },
                ].map((p) => (
                  <button
                    key={p.days}
                    type="button"
                    onClick={() => setPlanForm({ ...planForm, durationDays: p.days })}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors cursor-pointer ${
                      planForm.durationDays === p.days
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Standard tier for retail store partners"
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl text-xs text-slate-900 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Features (One per line) *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Unlimited Live Price Updates&#10;Full Hyperlocal Catalog Sync&#10;Direct Customer Orders & Pre-Bookings"
                  value={planForm.featuresText}
                  onChange={(e) => setPlanForm({ ...planForm, featuresText: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl text-xs text-slate-900 outline-none font-medium leading-relaxed resize-none"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">Make tier active?</span>
                  <span className="text-[11px] text-slate-500">Visible on merchant registration page</span>
                </div>
                <input
                  type="checkbox"
                  checked={planForm.isActive}
                  onChange={(e) => setPlanForm({ ...planForm, isActive: e.target.checked })}
                  className="w-4 h-4 accent-slate-900 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={planSubmitting}
                  className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {planSubmitting ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>{editingPlan ? 'Save Changes' : 'Publish Plan'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL: EXTEND SUBSCRIPTION DAYS */}
      {extendingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl relative">
            <button
              type="button"
              onClick={() => setExtendingSub(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-4">
              <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mx-auto mb-2">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Extend Validity
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {extendingSub.shopName || extendingSub.merchantName} ({extendingSub.merchantEmail})
              </p>
            </div>

            {/* Current Expiry Preview */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Current Expiry:</span>
                <span className="font-semibold text-slate-900">
                  {new Date(extendingSub.expiresAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Days Remaining:</span>
                <span className="font-bold text-slate-900">{extendingSub.daysRemaining ?? 0} days</span>
              </div>
            </div>

            <form onSubmit={handleSaveExtension} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Additional Days to Grant *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="1"
                    max="1000"
                    value={extendDays}
                    onChange={(e) => setExtendDays(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl text-sm font-bold text-slate-900 outline-none"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-semibold">Days</span>
                </div>
              </div>

              {/* Quick Day Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[7, 15, 30, 60, 90, 180, 365].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setExtendDays(d)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      extendDays === d
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    +{d}d
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason / Note
                </label>
                <input
                  type="text"
                  value={extendReason}
                  onChange={(e) => setExtendReason(e.target.value)}
                  placeholder="e.g. Promotional extension / Offline bank confirmation"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl text-xs text-slate-900 outline-none font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setExtendingSub(null)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={extendSubmitting}
                  className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {extendSubmitting ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Grant +{extendDays} Days</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
