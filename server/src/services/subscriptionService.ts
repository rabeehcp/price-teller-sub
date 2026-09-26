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
  clientCode?: string;
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

    // Real UPI deep-link payment URL configured for receiving subscription payments
    const payeeVpa = process.env.UPI_PAYEE_VPA || '8075950428@fam';
    const payeeName = process.env.UPI_PAYEE_NAME || 'shoucky';
    const amountInr = (plan.pricePaise / 100).toFixed(2);
    const txnNote = encodeURIComponent(`PriceTeller ${plan.name}`);
    const upiString = `upi://pay?pa=${encodeURIComponent(payeeVpa)}&pn=${encodeURIComponent(payeeName)}&am=${amountInr}&cu=INR&tn=${txnNote}`;

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
      upiPayload: upiString,
      upiString: upiString,
      upiQrUrl: process.env.UPI_QR_URL || '/payment-qr-clean.png',
      upiCardUrl: process.env.UPI_CARD_URL || '/payment-qr-card.png',
      upiPosterUrl: process.env.UPI_POSTER_URL || '/payment-qr.jpg',
      upiId: payeeVpa,
      payeeName: payeeName,
      status: payment.status,
      message:
        `Scan QR code or pay to ${payeeVpa} (${payeeName}) and submit the 12-digit UPI UTR reference to activate.`,
    };
  }

  async verifyPaymentAndActivate(params: VerifyPaymentParams) {
    const { merchantId, orderId, paymentId, upiRefId, clientCode, actorRole } = params;

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

    // Attribute to onboarding client partner if clientCode provided
    let attributedClient = null;
    if (clientCode && String(clientCode).trim()) {
      try {
        attributedClient = await db.attributeSubscriptionPaymentToClient({
          paymentId: pending?.id || orderId,
          subscriptionId: subscription.id,
          clientCode: String(clientCode).trim(),
          merchantId,
        });
      } catch (clientErr) {
        console.warn('Could not attribute subscription to client partner:', clientErr);
      }
    }

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
          clientCode: attributedClient?.client?.clientCode || clientCode || null,
          commissionPaise: attributedClient?.commissionPaise || null,
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
      daysRemaining,
      clientPartner: attributedClient
        ? {
            code: attributedClient.client.clientCode,
            name: attributedClient.client.name,
            commissionPaise: attributedClient.commissionPaise,
          }
        : null,
      plan,
      message: 'Subscription activated successfully.',
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
