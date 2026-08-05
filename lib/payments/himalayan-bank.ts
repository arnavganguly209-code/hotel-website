/** Future Himalayan Bank payment gateway — re-exports live PACO client. */
export {
  createPrePaymentUi as createHblPayment,
  inquireTransaction as verifyHblPayment,
  refundTransaction as refundHblPayment,
  isPacoConfigured,
} from "./paco";

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

export const himalayanBankGateway: HimalayanBankGateway = {
  async createPayment() {
    return {
      success: false,
      error: "Use lib/payments/paco createPrePaymentUi for HBL PACO.",
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
  "cancelled",
  "void",
  "pay_at_hotel",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
