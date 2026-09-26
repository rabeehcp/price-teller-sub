import React, { useState, useEffect } from 'react';
import {
  ClientPartner,
  ClientPayout,
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
  fetchClientPayoutsApi,
} from '../services/api';
import {
  Users,
  Briefcase,
  Store,
  DollarSign,
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
  ShieldCheck,
  QrCode,
  X,
  Share2,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface ClientManagementTabProps {
  token?: string;
}

export const ClientManagementTab: React.FC<ClientManagementTabProps> = ({ token }) => {
  const [clients, setClients] = useState<ClientPartner[]>([]);
  const [summary, setSummary] = useState<ClientSummaryMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
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
    setFormData({
      name: '',
      phone: '+91 ',
      upiId: '',
      clientCode: `CL-${Math.floor(100 + Math.random() * 900)}`,
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
      alert(err.message || 'Failed to save client partner');
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
    setShopsLoading(true);
    try {
      const list = await fetchClientOnboardedShopsApi(client.id, token);
      setShopsList(list);
    } catch (err) {
      console.error('Failed to load client shops:', err);
      setShopsList([]);
    } finally {
      setShopsLoading(false);
    }
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

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header & Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 font-malayalam">ആകെ ക്ലയന്റുകൾ / ഏജന്റുകൾ</span>
            <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-bold">
              <Briefcase className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-white mt-2">
            {summary?.totalClients ?? clients.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-malayalam">
            {summary?.totalActiveClients ?? clients.filter((c) => c.status === 'active').length} സജീവ ഫീൽഡ് പാർട്ണർമാർ
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 font-malayalam">ചേർത്ത കടകൾ (Onboarded)</span>
            <span className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-bold">
              <Store className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-blue-400 mt-2">
            {summary?.totalShopsOnboarded ?? clients.reduce((acc, c) => acc + (c.totalShopsCount || 0), 0)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-malayalam">പ്ലാറ്റ്‌ഫോമിൽ സബ്‌സ്‌ക്രൈബ് ചെയ്ത സ്റ്റോറുകൾ</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 font-malayalam">ആകെ ഏജന്റ് കമ്മീഷൻ</span>
            <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg text-xs font-bold">₹</span>
          </div>
          <p className="text-2xl font-black text-indigo-300 mt-2">
            ₹{summary ? Math.round(summary.totalEarningsPaise / 100).toLocaleString('en-IN') : '0'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-malayalam">ക്ലയന്റുകൾ നേടിയ ആകെ വരുമാനം</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 font-malayalam">നൽകാനുള്ള തുക (Pending Payout)</span>
            <span className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg text-xs font-bold">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-amber-400 mt-2">
            ₹{summary ? Math.round(summary.pendingPayoutPaise / 100).toLocaleString('en-IN') : '0'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-malayalam">UPI വഴി നൽകാൻ ബാക്കിയുള്ള കമ്മീഷൻ</p>
        </div>
      </div>

      {/* 2. Action Toolbar */}
      <div className="bg-white border border-[#E3ECE7] rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="പേര്, കോഡ് (CL-101), ഫോൺ അല്ലെങ്കിൽ ഏരിയ തിരയുക..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#F5F8F6] border border-[#E3ECE7] focus:border-[#0B8F68] rounded-xl text-xs text-[#17221D] outline-none font-medium placeholder-slate-400"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-[#F5F8F6] border border-[#E3ECE7] rounded-xl text-xs font-bold text-[#17221D] outline-none cursor-pointer"
          >
            <option value="all">എല്ലാ സ്റ്റാറ്റസും (All Status)</option>
            <option value="active">സജീവം (Active Only)</option>
            <option value="inactive">നിഷ്ക്രിയം (Inactive)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadClients}
            title="റീഫ്രഷ് ചെയ്യുക"
            className="p-2.5 rounded-xl border border-[#E3ECE7] hover:bg-[#F5F8F6] text-[#66756E] hover:text-[#17221D] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="py-2.5 px-4 bg-[#0B8F68] hover:bg-[#087353] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="font-malayalam">പുതിയ ക്ലയന്റിനെ ചേർക്കൂ</span>
          </button>
        </div>
      </div>

      {/* 3. Clients List Table */}
      <div className="bg-white border border-[#E3ECE7] rounded-3xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-[#E3ECE7] flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-[#17221D] font-malayalam">
              ഫീൽഡ് ക്ലയന്റുകൾ & ഓൺബോർഡിംഗ് ഏജന്റുകൾ ({filteredClients.length})
            </h3>
            <p className="text-xs text-[#66756E] font-medium font-malayalam mt-0.5">
              കടകൾ ചേർക്കുന്ന ക്ലയന്റുകളുടെ വിവരങ്ങൾ, കമ്മീഷൻ, ബാക്കി തുക പേഔട്ട്
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-[#66756E] space-y-2">
            <div className="w-7 h-7 border-2 border-[#0B8F68] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-medium font-malayalam">വിവരങ്ങൾ ലോഡ് ചെയ്യുന്നു...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#DDF5EA] text-[#0B8F68] flex items-center justify-center mx-auto text-xl">
              <Briefcase className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-[#17221D] font-malayalam">ക്ലയന്റുകളെ കണ്ടെത്തിയില്ല</p>
            <p className="text-xs text-[#66756E] max-w-sm mx-auto font-malayalam">
              പുതിയ ഫീൽഡ് പാർട്ണറെ ചേർക്കാൻ മുകളിലെ &quot;പുതിയ ക്ലയന്റിനെ ചേർക്കൂ&quot; ബട്ടൺ ക്ലിക്ക് ചെയ്യുക.
            </p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="py-2 px-4 bg-[#0B8F68] hover:bg-[#087353] text-white text-xs font-bold rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer font-malayalam"
            >
              <Plus className="w-4 h-4" />
              <span>ആദ്യ ക്ലയന്റിനെ ചേർക്കൂ</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#3A4C43]">
              <thead className="bg-[#F5F8F6] border-b border-[#E3ECE7] text-[#66756E] uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3">ക്ലയന്റ് / ഏജന്റ്</th>
                  <th className="px-4 py-3">റഫറൽ കോഡ്</th>
                  <th className="px-4 py-3">UPI ID (പേഔട്ട്)</th>
                  <th className="px-4 py-3 text-center">കമ്മീഷൻ %</th>
                  <th className="px-4 py-3 text-center">കടകൾ</th>
                  <th className="px-4 py-3 text-right">നേടിയത്</th>
                  <th className="px-4 py-3 text-right">നൽകിയത്</th>
                  <th className="px-4 py-3 text-right">ബാക്കി (Pending)</th>
                  <th className="px-4 py-3 text-center">നടപടികൾ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3ECE7]">
                {filteredClients.map((client) => {
                  const pendingPaise = client.pendingPayoutPaise || 0;
                  const refUrl = `${window.location.origin}/merchant?ref=${client.clientCode}`;

                  return (
                    <tr key={client.id} className="hover:bg-[#F5F8F6]/60 transition-colors">
                      {/* Name & Area */}
                      <td className="px-4 py-3">
                        <div className="font-bold text-[#17221D]">{client.name}</div>
                        <div className="text-[11px] text-[#66756E] flex items-center gap-1 mt-0.5">
                          <span>{client.phone}</span>
                          {client.area && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-[120px]">{client.area}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Code */}
                      <td className="px-4 py-3">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F5F8F6] border border-[#E3ECE7] font-mono font-bold text-xs text-[#17221D]">
                          <span>{client.clientCode}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(client.clientCode, `code-${client.id}`)}
                            title="Copy Client Code"
                            className="text-[#66756E] hover:text-[#0B8F68] transition-colors cursor-pointer"
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
                        <div className="inline-flex items-center gap-1.5 font-mono text-xs text-[#063B2A] font-bold bg-[#EDFAF3] px-2 py-0.5 rounded-lg border border-[#C3EEDC]">
                          <span>{client.upiId}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(client.upiId, `upi-${client.id}`)}
                            title="Copy Payee UPI ID"
                            className="text-[#0B8F68] hover:text-[#063B2A] cursor-pointer"
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
                        <span className="px-2 py-0.5 rounded-full font-bold text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {client.commissionRatePercent}%
                        </span>
                      </td>

                      {/* Shops & Target (Min 50) */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenShops(client)}
                            className="px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                            title="ചേർത്ത കടകൾ കാണുക"
                          >
                            <Store className="w-3 h-3" />
                            <span>{client.totalShopsCount || 0}</span>
                            <span className="text-[10px] text-blue-400 font-normal">/ {client.minShopsThreshold || 50}</span>
                          </button>
                          {(client.totalShopsCount || 0) >= (client.minShopsThreshold || 50) ? (
                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                              ✓ 50+ അൺലോക്ക്ഡ്
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              🔒 {(client.minShopsThreshold || 50) - (client.totalShopsCount || 0)} ബാക്കി
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Earned */}
                      <td className="px-4 py-3 text-right font-bold text-[#17221D]">
                        ₹{Math.round((client.totalEarningsPaise || 0) / 100).toLocaleString('en-IN')}
                      </td>

                      {/* Paid */}
                      <td className="px-4 py-3 text-right text-[#66756E] font-medium">
                        ₹{Math.round((client.totalPaidPaise || 0) / 100).toLocaleString('en-IN')}
                      </td>

                      {/* Pending */}
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`font-black ${
                            pendingPaise > 0
                              ? 'text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200'
                              : 'text-emerald-700'
                          }`}
                        >
                          ₹{Math.round(pendingPaise / 100).toLocaleString('en-IN')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Record Payout Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenPayout(client)}
                            disabled={pendingPaise <= 0}
                            title={
                              pendingPaise > 0
                                ? `നൽകാൻ ₹${Math.round(pendingPaise / 100)} ബാക്കിയുണ്ട്. പേഔട്ട് നൽകുക`
                                : 'ബാക്കി തുകയില്ല'
                            }
                            className={`p-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                              pendingPaise > 0
                                ? 'bg-[#0B8F68] hover:bg-[#087353] text-white border-transparent shadow-2xs'
                                : 'bg-slate-100 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed'
                            }`}
                          >
                            <Wallet className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Pay</span>
                          </button>

                          {/* Copy Share Link */}
                          <button
                            type="button"
                            onClick={() => handleCopy(refUrl, `share-${client.id}`)}
                            title="കടകൾക്ക് അയക്കാനുള്ള റഫറൽ ലിങ്ക് കോപ്പി ചെയ്യുക"
                            className="p-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
                          >
                            {copiedKey === `share-${client.id}` ? (
                              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Share2 className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(client)}
                            title="എഡിറ്റ് ചെയ്യുക"
                            className="p-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteClient(client)}
                            title="ഡിലീറ്റ് ചെയ്യുക"
                            className="p-1.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
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
        )}
      </div>

      {/* 4. Modal: Add / Edit Client Partner */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-[#E3ECE7] rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#DDF5EA] text-[#0B8F68] flex items-center justify-center text-lg">
                <Briefcase className="w-5 h-5 text-[#0B8F68]" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#17221D] font-malayalam">
                  {editingClient ? 'ക്ലയന്റ് വിവരങ്ങൾ മാറ്റുക' : 'പുതിയ ഫീൽഡ് ക്ലയന്റിനെ ചേർക്കൂ'}
                </h3>
                <p className="text-xs text-[#66756E] font-medium font-malayalam">
                  കടകൾ ചേർക്കാനും സബ്‌സ്‌ക്രിപ്ഷൻ കമ്മീഷൻ നേടാനും ഏജന്റ് അക്കൗണ്ട്
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#17221D] mb-1 font-malayalam">
                    ക്ലയന്റ് / ഏജന്റ് പേര് *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ഉദാ: Shoucky"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#E3ECE7] focus:border-[#0B8F68] rounded-xl text-xs font-bold text-[#17221D] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17221D] mb-1 font-malayalam">
                    ഫോൺ നമ്പർ *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 80759 50428"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#E3ECE7] focus:border-[#0B8F68] rounded-xl text-xs font-bold text-[#17221D] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#17221D] mb-1 font-malayalam">
                    പേഔട്ട് UPI ID (കമ്മീഷൻ സ്വീകരിക്കാൻ) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ഉദാ: 8075950428@fam"
                    value={formData.upiId}
                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#E3ECE7] focus:border-[#0B8F68] rounded-xl text-xs font-bold text-[#063B2A] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17221D] mb-1 font-malayalam">
                    യൂണിക് റഫറൽ കോഡ് (Client Code) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CL-101"
                    value={formData.clientCode}
                    onChange={(e) => setFormData({ ...formData, clientCode: e.target.value.toUpperCase().trim() })}
                    className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#E3ECE7] focus:border-[#0B8F68] rounded-xl text-xs font-bold text-[#17221D] outline-none font-mono uppercase tracking-wider"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#17221D] mb-1 font-malayalam">
                    കമ്മീഷൻ നിരക്ക് (%) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      max="100"
                      value={formData.commissionRatePercent}
                      onChange={(e) => setFormData({ ...formData, commissionRatePercent: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#E3ECE7] focus:border-[#0B8F68] rounded-xl text-xs font-bold text-indigo-700 outline-none"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-malayalam">
                    സ്ഥിരമായി 50% (₹119 പ്ലാനിൽ നിന്ന് ₹59.50)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17221D] mb-1 font-malayalam">
                    മിനിമം കടകൾ ടാർഗറ്റ് (Min Shops Goal) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.minShopsThreshold}
                    onChange={(e) => setFormData({ ...formData, minShopsThreshold: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#E3ECE7] focus:border-[#0B8F68] rounded-xl text-xs font-bold text-slate-800 outline-none"
                  />
                  <span className="text-[10px] text-slate-400 font-malayalam">
                    കുറഞ്ഞത് 50 കടകൾ പൂർത്തിയായാൽ പേഔട്ട് അൺലോക്ക് ആകും
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17221D] mb-1 font-malayalam">
                  പ്രവർത്തന മേഖല / ഏരിയ (Territory)
                </label>
                <input
                  type="text"
                  placeholder="ഉദാ: Tirur Town, Kottakkal"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#E3ECE7] focus:border-[#0B8F68] rounded-xl text-xs font-medium text-[#17221D] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17221D] mb-1 font-malayalam">
                  സ്റ്റാറ്റസ് (Status)
                </label>
                <div className="flex gap-2">
                  <label className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-xl border border-[#E3ECE7] bg-[#F5F8F6] cursor-pointer text-xs font-bold">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formData.status === 'active'}
                      onChange={() => setFormData({ ...formData, status: 'active' })}
                      className="text-[#0B8F68]"
                    />
                    <span>സജീവം (Active)</span>
                  </label>
                  <label className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-xl border border-[#E3ECE7] bg-[#F5F8F6] cursor-pointer text-xs font-bold">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={formData.status === 'inactive'}
                      onChange={() => setFormData({ ...formData, status: 'inactive' })}
                      className="text-[#0B8F68]"
                    />
                    <span>നിഷ്ക്രിയം (Inactive)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17221D] mb-1 font-malayalam">
                  കുറിപ്പുകൾ (Notes - Optional)
                </label>
                <input
                  type="text"
                  placeholder="ബാങ്ക് അക്കൗണ്ട് അല്ലെങ്കിൽ മറ്റ് വിവരങ്ങൾ"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#E3ECE7] focus:border-[#0B8F68] rounded-xl text-xs text-[#17221D] outline-none font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E3ECE7]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  റദ്ദാക്കുക (Cancel)
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-[#0B8F68] hover:bg-[#087353] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer font-malayalam"
                >
                  {editingClient ? 'മാറ്റങ്ങൾ സൂക്ഷിക്കുക' : 'ക്ലയന്റിനെ ചേർക്കുക'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal: Record Payout to Client */}
      {payoutClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-[#E3ECE7] rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setPayoutClient(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center pt-1 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-[#DDF5EA] text-[#0B8F68] flex items-center justify-center mx-auto mb-2 shadow-2xs">
                <Wallet className="w-6 h-6 text-[#0B8F68]" />
              </div>
              <h3 className="text-base font-black text-[#17221D] font-malayalam">
                കമ്മീഷൻ പേഔട്ട് നൽകുക (Record Payout)
              </h3>
              <p className="text-xs text-[#66756E] font-medium font-malayalam mt-0.5">
                {payoutClient.name} ({payoutClient.clientCode})
              </p>
            </div>

            {/* Client Payee Box */}
            <div className="p-3 bg-[#F0FAF5] border border-[#C5ECD9] rounded-2xl text-center mb-4 space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#063B2A] tracking-wider font-malayalam">
                സ്വീകർത്താവിന്റെ UPI വിലാസം
              </span>
              <div className="text-sm font-mono font-bold text-[#063B2A] flex items-center justify-center gap-1.5">
                <span>{payoutClient.upiId}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(payoutClient.upiId, 'payout-upi')}
                  title="Copy UPI ID"
                  className="p-1 hover:bg-white rounded-lg transition-colors cursor-pointer"
                >
                  {copiedKey === 'payout-upi' ? (
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-[#0B8F68]" />
                  )}
                </button>
              </div>

              {/* Direct UPI App launcher */}
              <a
                href={`upi://pay?pa=${encodeURIComponent(payoutClient.upiId)}&pn=${encodeURIComponent(payoutClient.name)}&am=${payoutAmountRs}&cu=INR&tn=PriceTeller%20Commission%20Payout`}
                className="inline-flex items-center gap-1.5 mt-1 px-3 py-1.5 rounded-xl bg-[#063B2A] text-white text-[11px] font-bold shadow-2xs hover:bg-[#04281C] transition-all cursor-pointer"
              >
                <span>UPI ആപ്പിൽ നേരിട്ട് അടയ്ക്കാം (GPay / PhonePe)</span>
                <ExternalLink className="w-3 h-3 text-slate-300" />
              </a>
            </div>

            {/* Milestone Threshold Notice */}
            {(payoutClient.totalShopsCount || 0) < (payoutClient.minShopsThreshold || 50) ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1 mb-3">
                <div className="flex items-center gap-1.5 font-bold text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>മുന്നറിയിപ്പ്: കുറഞ്ഞത് 50 കടകൾ തികച്ചിട്ടില്ല</span>
                </div>
                <p className="text-[11px] text-amber-700 font-malayalam leading-relaxed">
                  ഈ പാർട്ണർ ഇതുവരെ {payoutClient.totalShopsCount || 0}/50 കടകൾ മാത്രമേ ചേർത്തിട്ടുള്ളൂ. (50 കടകൾ പൂർത്തിയാകുമ്പോഴാണ് സാധാരണ പേഔട്ട് നൽകുന്നത്). അഡ്മിൻ എന്ന നിലയിൽ നിങ്ങൾക്ക് വേണമെങ്കിൽ തുക നൽകാം.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1 mb-3">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>50+ കടകൾ ലക്ഷ്യം പൂർത്തിയായി! (50% കമ്മീഷൻ അൺലോക്ക്ഡ്)</span>
                </div>
                <p className="text-[11px] text-emerald-700 font-malayalam leading-relaxed">
                  ഈ പാർട്ണർ {payoutClient.totalShopsCount} കടകൾ വിജയകരമായി ഓൺബോർഡ് ചെയ്തു. പേഔട്ട് സുരക്ഷിതമായി നൽകാം.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmitPayout} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#17221D] mb-1 font-malayalam">
                  നൽകുന്ന തുക (Amount in ₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-slate-500 font-bold">₹</span>
                  <input
                    type="number"
                    required
                    min="1"
                    value={payoutAmountRs}
                    onChange={(e) => setPayoutAmountRs(Number(e.target.value))}
                    className="w-full pl-8 pr-3.5 py-2.5 bg-[#F5F8F6] border border-[#E3ECE7] focus:border-[#0B8F68] rounded-xl text-sm font-black text-[#17221D] outline-none"
                  />
                </div>
                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500 font-medium">
                  <span>ആകെ ബാക്കിയുള്ളത്: ₹{Math.round((payoutClient.pendingPayoutPaise || 0) / 100)}</span>
                  <button
                    type="button"
                    onClick={() => setPayoutAmountRs(Math.round((payoutClient.pendingPayoutPaise || 0) / 100))}
                    className="text-[#0B8F68] font-bold hover:underline cursor-pointer"
                  >
                    മുഴുവൻ നൽകുക
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17221D] mb-1 font-malayalam">
                  UPI UTR / ബാങ്ക് റഫറൻസ് നമ്പർ (Optional)
                </label>
                <input
                  type="text"
                  placeholder="ഉദാ: 423987123456"
                  value={payoutUpiRef}
                  onChange={(e) => setPayoutUpiRef(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#E3ECE7] focus:border-[#0B8F68] rounded-xl text-xs font-mono text-[#17221D] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17221D] mb-1 font-malayalam">
                  കുറിപ്പ് (Notes)
                </label>
                <input
                  type="text"
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#E3ECE7] focus:border-[#0B8F68] rounded-xl text-xs text-[#17221D] outline-none font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E3ECE7]">
                <button
                  type="button"
                  onClick={() => setPayoutClient(null)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  റദ്ദാക്കുക
                </button>
                <button
                  type="submit"
                  disabled={payoutSubmitting}
                  className="py-2.5 px-5 bg-[#0B8F68] hover:bg-[#087353] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 font-malayalam"
                >
                  {payoutSubmitting ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>പേഔട്ട് സ്ഥിരീകരിക്കുക</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Modal: View Onboarded Shops for Client */}
      {viewingShopsClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-[#E3ECE7] rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
            <button
              type="button"
              onClick={() => setViewingShopsClient(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 pb-3 border-b border-[#E3ECE7] mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#DDF5EA] text-[#0B8F68] flex items-center justify-center text-lg">
                <Store className="w-5 h-5 text-[#0B8F68]" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#17221D] font-malayalam">
                  {viewingShopsClient.name} ചേർത്ത കടകൾ ({shopsList.length})
                </h3>
                <p className="text-xs text-[#66756E] font-medium font-malayalam">
                  കോഡ്: <b className="font-mono">{viewingShopsClient.clientCode}</b> · കമ്മീഷൻ: <b>{viewingShopsClient.commissionRatePercent}%</b>
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {shopsLoading ? (
                <div className="py-16 text-center text-[#66756E]">
                  <div className="w-7 h-7 border-2 border-[#0B8F68] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs font-medium font-malayalam">കടകളുടെ വിവരങ്ങൾ ലോഡ് ചെയ്യുന്നു...</p>
                </div>
              ) : shopsList.length === 0 ? (
                <div className="py-16 text-center space-y-2">
                  <p className="text-sm font-bold text-[#17221D] font-malayalam">ഈ ക്ലയന്റ് ഇതുവരെ കടകളെ ചേർത്തിട്ടില്ല</p>
                  <p className="text-xs text-[#66756E] max-w-xs mx-auto font-malayalam">
                    കടകൾ ക്യുആർ കോഡ് സ്കാൻ ചെയ്യുമ്പോൾ <b className="font-mono">{viewingShopsClient.clientCode}</b> നൽകിയാൽ ഇവിടെ കാണാം.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#E3ECE7]">
                  {shopsList.map((shop, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-sm text-[#17221D]">{shop.shopName || shop.merchantName}</div>
                        <div className="text-xs text-[#66756E] flex items-center gap-2 mt-0.5">
                          <span>{shop.merchantEmail || shop.merchantPhone}</span>
                          <span>•</span>
                          <span className="font-bold text-[#0B8F68]">{shop.planName || 'Plan'}</span>
                          <span>•</span>
                          <span>{new Date(shop.subscribedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold text-[#17221D]">
                          ₹{Math.round(shop.amountPaise / 100).toLocaleString('en-IN')}
                        </div>
                        <div className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg inline-flex items-center gap-0.5 mt-0.5">
                          <span>+ ₹{Math.round((shop.commissionPaise || 0) / 100)} കമ്മീഷൻ</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#E3ECE7] flex justify-end">
              <button
                type="button"
                onClick={() => setViewingShopsClient(null)}
                className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                അടയ്ക്കുക (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
