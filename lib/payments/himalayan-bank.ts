/** Future Himalayan Bank payment gateway — interface only (Phase 2). */
export type HimalayanBankChargeInput = {
  amount: number;
  currency: "NPR" | "USD";
  orderId: string;
  customerEmail: string;
  customerName: string;
  returnUrl: string;
  cancelUrl: string;
};

export type HimalayanBankChargeResult = {
  success: boolean;
  transactionId?: string;
  redirectUrl?: string;
  error?: string;
};

export interface HimalayanBankGateway {
  createPayment(input: HimalayanBankChargeInput): Promise<HimalayanBankChargeResult>;
  verifyPayment(transactionId: string): Promise<{ paid: boolean; raw?: unknown }>;
  refund(transactionId: string, amount?: number): Promise<{ success: boolean }>;
}

/** Placeholder — wire real credentials when the bank API is available. */
export const himalayanBankGateway: HimalayanBankGateway = {
  async createPayment() {
    return {
      success: false,
      error: "Himalayan Bank gateway is not configured yet.",
    };
  },
  async verifyPayment() {
    return { paid: false };
  },
  async refund() {
    return { success: false };
  },
};

export const PAYMENT_STATUSES = [
  "unpaid",
  "pending",
  "paid",
  "offline",
  "refunded",
  "failed",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
