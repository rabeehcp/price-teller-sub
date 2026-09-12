/**
 * Merchant subscription service (demo / development payment flow).
 * Activates plans after a supplied UPI reference or simulator payment.
 * NOT suitable for production without a real payment-provider integration.
 */

import { db } from '../db';

export interface SubscriptionStatusResult {
  isActive: boolean;
  hasActiveSubscription: boolean;
  isExempt: boolean;
  subscription: any | null;
  daysRemaining: number;
  plan: any | null;
  merchantName?: string;
  shopName?: string;
}

export interface CreateOrderParams {
  merchantId: string;
  planId: string;
  idempotencyKey?: string;
}

export interface VerifyPaymentParams {
  merchantId: string;
  orderId: string;
  paymentId?: string;
  signature?: string;
  upiRefId?: string;
  actorRole?: string;
}

export interface ManualExtendParams {
  adminId: string;
  subscriptionId: string;
  extraDays: number;
  reason?: string;
}

export interface CancelSubscriptionParams {
  actorId: string;
  actorRole: string;
  subscriptionId: string;
  reason?: string;
}

export class SubscriptionService {
  /**
   * Retrieves active subscription for a merchant along with remaining quota info.
   */
  async getMerchantSubscriptionStatus(
    merchantId: string,
    merchantName?: string,
    shopName?: string
  ): Promise<SubscriptionStatusResult> {
    const active = await db.getMerchantActiveSubscription(merchantId);

    if (!active) {
      return {
        isActive: false,
        hasActiveSubscription: false,
        isExempt: false,
        subscription: null,
        daysRemaining: 0,
        plan: null,
        merchantName,
        shopName,
      };
    }

    const expires = new Date(active.expiresAt).getTime();
    const daysRemaining = Math.max(
      0,
      Math.ceil((expires - Date.now()) / (1000 * 60 * 60 * 24))
    );
    const hasActive = active.status === 'ACTIVE' && daysRemaining > 0;

    return {
      isActive: hasActive,
      hasActiveSubscription: hasActive,
      isExempt: false,
      subscription: hasActive ? active : null,
      daysRemaining: hasActive ? daysRemaining : 0,
      plan: hasActive ? (active.plan || null) : null,
      merchantName,
      shopName,
    };
  }

  /**
   * Creates a checkout order (demo). Returns order details the client can use
   * to show a UPI QR / payment instructions.
   */
  async createSubscriptionOrder(params: CreateOrderParams) {
    const { merchantId, planId, idempotencyKey } = params;
    const plan = await db.getSubscriptionPlanById(planId);
    if (!plan || !plan.isActive) {
      throw new Error('Subscription plan not found or inactive');
    }

    const key =
      idempotencyKey ||
      `idem-${merchantId}-${planId}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const payment = await db.createSubscriptionPayment({
      merchantId,
      planId,
      amountPaise: plan.pricePaise,
      providerOrderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      idempotencyKey: key,
      provider: 'upi_simulator',
    });

    // UPI deep-link style payload for demo QR
    const upiPayload = `upi://pay?pa=priceteller@upi&pn=PriceTeller&am=${(
      plan.pricePaise / 100
    ).toFixed(2)}&cu=INR&tn=PriceTeller%20${encodeURIComponent(plan.name)}`;

    return {
      orderId: payment.providerOrderId || payment.id,
      paymentId: payment.id,
      amountPaise: plan.pricePaise,
      amountInr: plan.pricePaise / 100,
      currency: plan.currency || 'INR',
      planId: plan.id,
      planName: plan.name,
      plan: {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        durationDays: plan.durationDays,
        pricePaise: plan.pricePaise,
        currency: plan.currency || 'INR',
        badge: plan.badge,
        features: plan.features || [],
        isActive: plan.isActive,
      },
      durationDays: plan.durationDays,
      idempotencyKey: key,
      upiPayload,
      status: payment.status,
      message:
        'Demo mode: complete payment via UPI and submit the UPI reference / orderId to activate.',
    };
  }

  /**
   * Verifies a demo payment and activates the subscription.
   * Accepts any non-empty upiRefId or paymentId in development.
   */
  async verifyPaymentAndActivate(params: VerifyPaymentParams) {
    const { merchantId, orderId, paymentId, upiRefId, actorRole } = params;

    if (!orderId && !paymentId) {
      throw new Error('orderId or paymentId is required');
    }

    // In real production you would verify Razorpay/Stripe signature here.
    // Demo: accept if a UPI ref or payment id is supplied.
    const hasProof = Boolean(
      (upiRefId && String(upiRefId).trim().length >= 4) ||
        (paymentId && String(paymentId).trim().length >= 4) ||
        (orderId && String(orderId).trim().length >= 4)
    );

    if (!hasProof) {
      throw new Error(
        'Payment proof required (upiRefId, paymentId, or valid orderId). Demo mode still requires a reference.'
      );
    }

    // Find plan from pending payment if possible
    const payments = await db.getAllSubscriptionPayments();
    const pending = payments.find(
      (p) =>
        p.merchantId === merchantId &&
        (p.providerOrderId === orderId || p.id === orderId || p.id === paymentId) &&
        p.status === 'PENDING'
    );

    let planId = pending?.planId;
    if (!planId) {
      // Fallback: try most recent pending for this merchant
      const merchantPending = payments
        .filter((p) => p.merchantId === merchantId && p.status === 'PENDING')
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
      planId = merchantPending?.planId;
    }

    if (!planId) {
      throw new Error(
        'No pending payment found for this merchant/order. Start checkout again.'
      );
    }

    const plan = await db.getSubscriptionPlanById(planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    // Mark payment completed if we have a matching pending row
    if (pending && typeof (db as any).completeSubscriptionPayment === 'function') {
      try {
        await (db as any).completeSubscriptionPayment(pending.id, {
          providerPaymentId: paymentId || upiRefId || orderId,
          status: 'COMPLETED',
        });
      } catch {
        // Non-fatal in demo
      }
    }

    const subscription = await db.createMerchantSubscription({
      merchantId,
      planId: plan.id,
      durationDays: plan.durationDays,
    });

    try {
      await db.logAuditAction({
        actorId: merchantId,
        actorRole: actorRole || 'merchant',
        action: 'SUBSCRIPTION_ACTIVATED',
        entityType: 'merchant_subscription',
        entityId: subscription.id,
        metadata: {
          planId: plan.id,
          orderId,
          paymentId,
          upiRefId,
          mode: 'demo',
        },
      });
    } catch {
      // Non-fatal
    }

    const expires = new Date(subscription.expiresAt).getTime();
    const daysRemaining = Math.max(
      0,
      Math.ceil((expires - Date.now()) / (1000 * 60 * 60 * 24))
    );

    return {
      activated: true,
      subscription,
      plan,
      daysRemaining,
      message: 'Subscription activated successfully (demo payment flow).',
    };
  }

  async manualExtendSubscription(params: ManualExtendParams) {
    const { adminId, subscriptionId, extraDays, reason } = params;
    const updated = await db.extendMerchantSubscription(subscriptionId, extraDays);

    if (updated) {
      try {
        await db.logAuditAction({
          actorId: adminId,
          actorRole: 'admin',
          action: 'SUBSCRIPTION_EXTENDED',
          entityType: 'merchant_subscription',
          entityId: subscriptionId,
          metadata: { extraDays, reason },
        });
      } catch {
        // ignore
      }
    }

    return updated;
  }

  async cancelSubscription(params: CancelSubscriptionParams): Promise<boolean> {
    const { actorId, actorRole, subscriptionId, reason } = params;

    if (typeof (db as any).cancelMerchantSubscription === 'function') {
      const ok = await (db as any).cancelMerchantSubscription(
        subscriptionId,
        reason
      );
      if (ok) {
        try {
          await db.logAuditAction({
            actorId,
            actorRole,
            action: 'SUBSCRIPTION_CANCELLED',
            entityType: 'merchant_subscription',
            entityId: subscriptionId,
            metadata: { reason },
          });
        } catch {
          // ignore
        }
      }
      return Boolean(ok);
    }

    // Fallback: mark expired via extend with 0 / direct status update not available
    // Try loading and using extend with negative is not ideal; return false if no method
    try {
      const all = await db.getAllMerchantSubscriptions();
      const sub = all.find((s) => s.id === subscriptionId);
      if (!sub) return false;
      // Soft-cancel by extending 0 days is useless; rely on status update if present
      return false;
    } catch {
      return false;
    }
  }
}

export const subscriptionService = new SubscriptionService();
