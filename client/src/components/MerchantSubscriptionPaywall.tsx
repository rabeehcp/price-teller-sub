import React, { useState, useEffect } from 'react';
import {
  SubscriptionPlan,
  MerchantSubscription,
  SubscriptionStatusResponse,
  SubscriptionCheckoutOrder,
} from '../types';
import {
  fetchSubscriptionPlansApi,
  createSubscriptionCheckoutApi,
  verifySubscriptionPaymentApi,
  fetchMerchantSubscriptionHistoryApi,
} from '../services/api';

interface MerchantSubscriptionPaywallProps {
  merchantName?: string;
  shopName?: string;
  token?: string;
  statusInfo?: SubscriptionStatusResponse | null;
  onSubscriptionSuccess: (sub: MerchantSubscription) => void;
  onLogout?: () => void;
  onBackToApp?: () => void;
}

export const MerchantSubscriptionPaywall: React.FC<MerchantSubscriptionPaywallProps> = ({
  merchantName,
  shopName,
  token,
  statusInfo,
  onSubscriptionSuccess,
  onLogout,
  onBackToApp,
}) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan-6month');
  const [loading, setLoading] = useState<boolean>(true);
  const [history, setHistory] = useState<MerchantSubscription[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [checkoutOrder, setCheckoutOrder] = useState<SubscriptionCheckoutOrder | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [transactionId, setTransactionId] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadPlansAndHistory();
  }, [token]);

  const loadPlansAndHistory = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [fetchedPlans, fetchedHistory] = await Promise.all([
        fetchSubscriptionPlansApi(false, token),
        fetchMerchantSubscriptionHistoryApi(token),
      ]);
      setPlans(fetchedPlans);
      setHistory(fetchedHistory);
      if (fetchedPlans.length > 0 && !fetchedPlans.some((p) => p.id === selectedPlanId)) {
        setSelectedPlanId(fetchedPlans[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load plans:', err);
      setErrorMsg('Failed to load subscription plans. Please refresh or try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartCheckout = async (planId: string) => {
    setSelectedPlanId(planId);
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const order = await createSubscriptionCheckoutApi(planId, token);
      setCheckoutOrder(order);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initialize payment order');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyPayment = async (simulated: boolean = false) => {
    if (!checkoutOrder) return;
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const result = await verifySubscriptionPaymentApi(
        {
          orderId: checkoutOrder.orderId,
          upiRefId: simulated ? `SIM_${Date.now()}` : (transactionId.trim() || undefined),
          paymentId: simulated ? `pay_sim_${Date.now()}` : undefined,
        },
        token
      );

      if (result?.subscription) {
        const activatedSub = {
          ...result.subscription,
          daysRemaining: result.daysRemaining ?? result.subscription.daysRemaining ?? 30,
          plan: result.subscription.plan ?? {
            id: checkoutOrder.planId || checkoutOrder.plan?.id || selectedPlanId,
            name: checkoutOrder.plan?.name || checkoutOrder.planName || selectedPlan?.name || 'Active plan',
            durationDays: selectedPlan?.durationDays ?? 30,
            pricePaise: selectedPlan?.pricePaise ?? checkoutOrder.amountPaise,
            currency: checkoutOrder.currency || 'INR',
            description: selectedPlan?.description || '',
            features: selectedPlan?.features || [],
            isActive: true,
          },
        } as MerchantSubscription;

        setSuccessMsg('🎉 Subscription activated successfully! Accessing your store portal...');
        setTimeout(() => {
          onSubscriptionSuccess(activatedSub);
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment verification failed. Please check the transaction ID.');
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);
  const checkoutPlanName = checkoutOrder?.plan?.name || checkoutOrder?.planName || selectedPlan?.name || 'Selected plan';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white pb-16">
      {/* Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-sky-400 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            📊
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                PriceTeller Merchant Portal
              </span>
              <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Partner Plan Required
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Logged in as <span className="font-medium text-slate-200">{shopName || merchantName || 'Store Partner'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-700/60 transition-all flex items-center gap-1.5"
            >
              <span>←</span>
              <span className="hidden sm:inline">Back to Shopper App</span>
            </button>
          )}
          {onLogout && (
            <button
              onClick={onLogout}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-all"
            >
              Log Out
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 w-full">
        {/* Banner / Title */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-medium mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            Grow Your Local Retail Footprint
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Unlock Full Merchant Capabilities
          </h1>
          <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed">
            Choose an affordable subscription plan to list products in comparison search, manage live inventory, print instant POS customer receipts, and receive direct customer pre-bookings.
          </p>

          {statusInfo?.subscription?.status === 'EXPIRED' && (
            <div className="mt-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs text-left flex items-start gap-3">
              <span className="text-base">⚠️</span>
              <div>
                <p className="font-semibold text-red-200">Your previous subscription has expired</p>
                <p className="text-red-300/80 mt-0.5">
                  Renew your plan below to restore live visibility in customer comparisons and unfreeze POS billing workspace.
                </p>
              </div>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-white text-xs underline">
              Dismiss
            </button>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
            <span>{successMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400">Loading plan pricing & options...</p>
          </div>
        ) : (
          <>
            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {plans.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                const priceRs = Math.round(plan.pricePaise / 100);
                const perMonthRs = plan.durationDays > 30 ? Math.round(priceRs / (plan.durationDays / 30)) : priceRs;
                const isFeatured = plan.id.includes('6month') || plan.badge?.toLowerCase().includes('popular') || plan.badge?.toLowerCase().includes('save');

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`relative rounded-2xl p-6 sm:p-7 transition-all duration-300 cursor-pointer flex flex-col justify-between border ${
                      isSelected
                        ? 'bg-slate-900/90 border-indigo-500 shadow-2xl shadow-indigo-500/15 ring-2 ring-indigo-500/40'
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    {/* Badge */}
                    {plan.badge && (
                      <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md">
                        {plan.badge}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-white tracking-tight">{plan.name}</h3>
                          <p className="text-xs text-slate-400 mt-1">{plan.description || `${plan.durationDays} days access`}</p>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                            isSelected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-700'
                          }`}
                        >
                          {isSelected && <span className="text-xs font-bold">✓</span>}
                        </div>
                      </div>

                      {/* Pricing block */}
                      <div className="mt-6 flex items-baseline gap-2">
                        <span className="text-4xl font-extrabold text-white">₹{priceRs}</span>
                        <span className="text-xs text-slate-400">
                          / {plan.durationDays} days ({`≈ ₹${perMonthRs}/mo`})
                        </span>
                      </div>

                      {/* Features list */}
                      <ul className="mt-6 space-y-3">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                            <span className="text-emerald-400 font-bold shrink-0">✓</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-8">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartCheckout(plan.id);
                        }}
                        disabled={isProcessing}
                        className={`w-full py-3 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 ${
                          isSelected
                            ? 'bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-indigo-600/30'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                        }`}
                      >
                        {isProcessing && selectedPlanId === plan.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Pay & Activate (₹{priceRs})</span>
                            <span>→</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Feature comparison guarantee */}
            <div className="mt-14 max-w-4xl mx-auto rounded-2xl bg-gradient-to-b from-slate-900/60 to-slate-950 border border-slate-800/80 p-6 sm:p-8">
              <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-400 mb-4">
                What PriceTeller Merchant Tier Includes
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-200">🔍 Live Price Search</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Shoppers in your town compare items directly against your stock before deciding where to purchase.
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-200">🧾 Direct POS Billing</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Create rapid counter bills, apply instant discounts, and share thermal/WhatsApp invoices directly with customers.
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-200">⚡ Flash Deals & Booking</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Publish limited-time discount drops and accept customer pre-bookings for zero-wait shop pickups.
                  </p>
                </div>
              </div>
            </div>

            {/* History Toggle */}
            {history.length > 0 && (
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-xs text-slate-400 hover:text-indigo-400 underline transition-colors"
                >
                  {showHistory ? 'Hide Subscription History' : `View Past Invoices & History (${history.length})`}
                </button>

                {showHistory && (
                  <div className="mt-4 max-w-4xl mx-auto bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden text-left">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-slate-300">
                        <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                          <tr>
                            <th className="px-4 py-2.5">Plan</th>
                            <th className="px-4 py-2.5">Status</th>
                            <th className="px-4 py-2.5">Started</th>
                            <th className="px-4 py-2.5">Expires</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {history.map((h) => (
                            <tr key={h.id} className="hover:bg-slate-800/30">
                              <td className="px-4 py-3 font-medium text-slate-200">{h.plan?.name || h.planId}</td>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                                    h.status === 'ACTIVE'
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                      : 'bg-slate-700/50 text-slate-400'
                                  }`}
                                >
                                  {h.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-400">{new Date(h.startsAt).toLocaleDateString()}</td>
                              <td className="px-4 py-3 text-slate-400">{new Date(h.expiresAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Checkout / UPI QR Modal */}
      {checkoutOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setCheckoutOrder(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center"
            >
              ✕
            </button>

            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-2xl mx-auto mb-3">
                📱
              </div>
              <h3 className="text-lg font-bold text-white">Scan & Pay with Any UPI App</h3>
              <p className="text-xs text-slate-400 mt-1">
                Amount:{' '}
                <span className="font-extrabold text-white text-sm">
                  ₹{Math.round(checkoutOrder.amountPaise / 100)}
                </span>{' '}
                for <span className="text-indigo-400 font-medium">{checkoutPlanName}</span>
              </p>
            </div>

            {/* QR Code Frame */}
            <div className="mt-5 flex flex-col items-center justify-center bg-white p-4 rounded-xl max-w-[240px] mx-auto shadow-inner">
              <img
                src={checkoutOrder.upiQrUrl}
                alt="PriceTeller UPI QR"
                className="w-48 h-48 rounded object-contain"
              />
              <p className="text-[10px] font-mono text-slate-700 mt-1 text-center font-bold">
                UPI ID: priceteller@upi
              </p>
            </div>

            {/* Direct Intent Button */}
            <div className="mt-4 flex flex-col gap-2">
              <a
                href={checkoutOrder.upiString}
                className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold text-center transition-all shadow"
              >
                Open in GPay / PhonePe / Paytm
              </a>

              <div className="flex items-center gap-2 my-2">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Confirm Payment</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              {/* Transaction ID input */}
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-medium text-slate-300">
                  UPI UTR / 12-Digit Reference Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 423987123456"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleVerifyPayment(false)}
                  disabled={isProcessing}
                  className="py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow"
                >
                  {isProcessing ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Verify & Activate'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleVerifyPayment(true)}
                  disabled={isProcessing}
                  title="Activate immediately in demo / test mode without scanning"
                  className="py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-300 text-xs font-semibold transition-all flex items-center justify-center gap-1"
                >
                  ⚡ Instant Simulator
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
