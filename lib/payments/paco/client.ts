import { getPacoConfig, type PacoConfig } from "./config";
import {
  assertSameMoney,
  normalizePacoCurrency,
  sanitizePaymentRequestForLog,
} from "./currency";
import {
  buildJoseEnvelope,
  decryptToken,
  encryptPayload,
  formatPacoAmount,
  pacoGuid,
  pacoOrderNo,
  pacoRequestDateTime,
} from "./jose";
import { pacoLog } from "./logger";
import type { PacoAmount, PacoPaymentPageResponse, PacoPaymentRequestBody } from "./types";

async function joseRequest(
  method: "POST" | "PUT",
  path: string,
  requestBody: unknown,
  config: PacoConfig,
  retries = 2
): Promise<string> {
  const envelope = buildJoseEnvelope(requestBody, config);
  const body = await encryptPayload(JSON.stringify(envelope), config);
  const url = new URL(path.replace(/^\//, ""), config.baseUrl).toString();

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      pacoLog("info", "api_request", {
        path,
        method,
        attempt,
        orderHint: (requestBody as { orderNo?: string })?.orderNo,
      });

      const response = await fetch(url, {
        method,
        headers: {
          Accept: "application/jose",
          CompanyApiKey: config.apiKey,
          "Content-Type": "application/jose; charset=utf-8",
        },
        body,
        cache: "no-store",
      });

      const token = await response.text();
      if (!response.ok) {
        throw new Error(`PACO HTTP ${response.status}`);
      }

      const decrypted = await decryptToken(token, config);
      pacoLog("info", "api_response_ok", { path, method });
      return decrypted;
    } catch (err) {
      lastError = err;
      pacoLog("error", "api_request_failed", {
        path,
        method,
        attempt,
        error: err instanceof Error ? err.message : String(err),
      });
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error("PACO request failed");
}

export type CreatePaymentUiInput = {
  amount: number;
  currency?: string;
  productDescription: string;
  bookingId: number;
  bookingNumber: string;
  browserIp?: string;
  browserUserAgent?: string;
  successUrl: string;
  failedUrl: string;
  cancelUrl: string;
  backendUrl: string;
  orderNo?: string | number;
  /**
   * Opt-in ONLY for dedicated UAT scripts.
   * Never enable via env on live bookings — HBL sample hard-coded NPR/1 must not leak.
   */
  sdkDemoShape?: boolean;
};

function sdkDemoShapeEnabled(input: CreatePaymentUiInput): boolean {
  // Explicit opt-in only. Env flag must NOT affect /api/bookings live path.
  return input.sdkDemoShape === true;
}

/** Live bookings: purchaseItemPrice MUST mirror transactionAmount (same currency + amountText). */
function buildLivePurchaseItems(
  transactionAmount: PacoAmount,
  input: CreatePaymentUiInput
): PacoPaymentRequestBody["purchaseItems"] {
  return [
    {
      purchaseItemType: "hotel",
      referenceNo: input.bookingNumber,
      purchaseItemDescription: input.productDescription,
      purchaseItemPrice: { ...transactionAmount },
      subMerchantID: "string",
      passengerSeqNo: 1,
    },
  ];
}

/**
 * HBL PHP ExecuteFormJose sample shape — scripts/_hbl-sdk-npr1-uat.ts only.
 * Still mirrors transactionAmount (no silent NPR override when currency is USD).
 */
function buildSdkDemoPurchaseItems(transactionAmount: PacoAmount): PacoPaymentRequestBody["purchaseItems"] {
  return [
    {
      purchaseItemType: "ticket",
      referenceNo: "2322460376026",
      purchaseItemDescription: "Bundled insurance",
      purchaseItemPrice: { ...transactionAmount },
      subMerchantID: "string",
      passengerSeqNo: 1,
    },
  ];
}

function buildDeviceDetails(input: CreatePaymentUiInput): PacoPaymentRequestBody["deviceDetails"] {
  return {
    browserIp: input.browserIp || "0.0.0.0",
    browser: "HotelThamelPark",
    browserUserAgent: input.browserUserAgent || "HotelThamelPark/1.0",
    mobileDeviceFlag: "N",
  };
}

export async function createPrePaymentUi(input: CreatePaymentUiInput) {
  const config = getPacoConfig();
  const now = new Date();
  const orderNo = input.orderNo ?? Number(pacoOrderNo(now));
  // Authoritative currency: caller (booking tax) first; config default second. Never invent NPR.
  const currency = normalizePacoCurrency(input.currency || config.currency);
  if (config.env === "production" && currency !== "USD") {
    throw new Error("HBL PACO Production payments must use USD");
  }
  const amountBlock = formatPacoAmount(input.amount, currency);
  const sdkDemo = sdkDemoShapeEnabled(input);
  if (sdkDemo && config.env === "production") {
    throw new Error("HBL PACO SDK demo shape is not allowed in Production");
  }
  const purchaseItems = sdkDemo
    ? buildSdkDemoPurchaseItems(amountBlock)
    : buildLivePurchaseItems(amountBlock, input);

  assertSameMoney(amountBlock, purchaseItems[0].purchaseItemPrice, "prePaymentUi purchaseItems");

  const request: PacoPaymentRequestBody = {
    apiRequest: {
      requestMessageID: pacoGuid(),
      requestDateTime: pacoRequestDateTime(now),
      language: "en-US",
    },
    officeId: config.officeId,
    orderNo,
    productDescription: sdkDemo ? `desc for '${orderNo}'` : input.productDescription,
    paymentType: "CC",
    paymentCategory: "ECOM",
    storeCardDetails: {
      storeCardFlag: "N",
      storedCardUniqueID: "{{guid}}",
    },
    installmentPaymentDetails: {
      ippFlag: "N",
      installmentPeriod: 0,
      interestType: null,
    },
    mcpFlag: "N",
    request3dsFlag: config.request3ds,
    transactionAmount: amountBlock,
    notificationURLs: {
      confirmationURL: input.successUrl,
      failedURL: input.failedUrl,
      cancellationURL: input.cancelUrl,
      backendURL: input.backendUrl,
    },
    deviceDetails: sdkDemo
      ? {
          browserIp: "1.0.0.1",
          browser: "Postman Browser",
          browserUserAgent: "PostmanRuntime/7.26.8 - not from header",
          mobileDeviceFlag: "N",
        }
      : buildDeviceDetails(input),
    purchaseItems,
    customFieldList: sdkDemo
      ? [{ fieldName: "TestField", fieldValue: "This is test" }]
      : [
          { fieldName: "bookingId", fieldValue: String(input.bookingId) },
          { fieldName: "bookingNumber", fieldValue: input.bookingNumber },
        ],
  };

  pacoLog("info", "prepayment_request_sanitized", {
    bookingId: input.bookingId,
    endpoint: "api/1.0/Payment/prePaymentUi",
    apiVersion: "1.0",
    hblEnv: config.env,
    ...sanitizePaymentRequestForLog(request),
  });

  const decrypted = await joseRequest("POST", "api/1.0/Payment/prePaymentUi", request, config);
  const parsed = JSON.parse(decrypted) as PacoPaymentPageResponse;
  const paymentPageURL = parsed?.response?.Data?.paymentPage?.paymentPageURL;

  if (!paymentPageURL) {
    pacoLog("error", "missing_payment_page_url", { orderNo, responseKeys: Object.keys(parsed || {}) });
    throw new Error("PACO did not return a payment page URL");
  }

  return {
    orderNo: String(orderNo),
    requestMessageId: request.apiRequest.requestMessageID,
    paymentPageURL,
    rawResponse: parsed,
    request,
  };
}

export async function inquireTransaction(orderNo: string) {
  const config = getPacoConfig();
  const now = new Date();
  const request = {
    apiRequest: {
      requestMessageID: pacoGuid(),
      requestDateTime: pacoRequestDateTime(now),
      language: "en-US",
    },
    advSearchParams: {
      controllerInternalID: null,
      officeId: [config.officeId],
      orderNo: [orderNo],
      invoiceNo2C2P: null,
      fromDate: "0001-01-01T00:00:00",
      toDate: "0001-01-01T00:00:00",
      amountFrom: null,
      amountTo: null,
    },
  };

  const decrypted = await joseRequest("POST", "api/1.0/Inquiry/transactionList", request, config);
  return JSON.parse(decrypted) as Record<string, unknown>;
}

export async function refundTransaction(opts: {
  orderNo: string;
  amount: number;
  currency: string;
  actionBy?: string;
  actionEmail?: string;
}) {
  const config = getPacoConfig();
  const amountBlock = formatPacoAmount(opts.amount, opts.currency);
  const request = {
    refundAmount: {
      AmountText: amountBlock.amountText,
      CurrencyCode: amountBlock.currencyCode,
      DecimalPlaces: amountBlock.decimalPlaces,
      Amount: amountBlock.amount,
    },
    refundItems: [] as unknown[],
    localMakerChecker: {
      maker: {
        username: opts.actionBy || "System|hotel-thamel-park",
        email: opts.actionEmail || process.env.BOOKING_NOTIFY_EMAIL || "booking@hotelthamelpark.com",
      },
    },
    officeId: config.officeId,
    orderNo: opts.orderNo,
  };

  const decrypted = await joseRequest("POST", "api/1.0/Refund/refund", request, config);
  return JSON.parse(decrypted) as Record<string, unknown>;
}

export async function voidTransaction(opts: {
  orderNo: string;
  amount: number;
  currency: string;
  issuerApprovalCode: string;
  productDescription?: string;
}) {
  const config = getPacoConfig();
  const amountBlock = formatPacoAmount(opts.amount, opts.currency);
  const request = {
    officeId: config.officeId,
    orderNo: opts.orderNo,
    productDescription: opts.productDescription || `Void ${opts.orderNo}`,
    issuerApprovalCode: opts.issuerApprovalCode,
    actionBy: "System",
    voidAmount: amountBlock,
  };

  const decrypted = await joseRequest("POST", "api/1.0/Void", request, config);
  return JSON.parse(decrypted) as Record<string, unknown>;
}

export async function settleTransaction(opts: {
  orderNo: string;
  amount: number;
  currency: string;
  issuerApprovalCode: string;
  productDescription?: string;
}) {
  const config = getPacoConfig();
  const amountBlock = formatPacoAmount(opts.amount, opts.currency);
  const request = {
    officeId: config.officeId,
    orderNo: opts.orderNo,
    productDescription: opts.productDescription || `Settlement ${opts.orderNo}`,
    issuerApprovalCode: opts.issuerApprovalCode,
    actionBy: "System",
    settlementAmount: amountBlock,
  };

  const decrypted = await joseRequest("PUT", "api/1.0/Settlement", request, config);
  return JSON.parse(decrypted) as Record<string, unknown>;
}

/** Best-effort parse of inquiry payload for approval / paid state. */
export function parseInquiryOutcome(inquiry: Record<string, unknown>): {
  paid: boolean;
  failed: boolean;
  approvalCode?: string;
  invoiceNo?: string;
  statusText?: string;
  amount?: number;
  currency?: string;
  officeId?: string;
} {
  const response = (inquiry.response || inquiry) as Record<string, unknown>;
  const data = (response.Data || response.data || response) as Record<string, unknown>;
  const list =
    (data.transactionList as unknown[]) ||
    (data.TransactionList as unknown[]) ||
    (data.transactions as unknown[]) ||
    (Array.isArray(data) ? data : null);

  const first = (Array.isArray(list) ? list[0] : data) as Record<string, unknown> | undefined;
  if (!first || typeof first !== "object") {
    return { paid: false, failed: false };
  }

  const statusRaw = String(
    first.transactionStatus ||
      first.TransactionStatus ||
      first.status ||
      first.paymentStatus ||
      first.txnStatus ||
      ""
  ).toLowerCase();

  const approvalCode = String(
    first.issuerApprovalCode || first.approvalCode || first.ApprovalCode || first.authCode || ""
  ).trim();

  const invoiceNo = String(
    first.invoiceNo2C2P || first.InvoiceNo2C2P || first.invoiceNo || first.InvoiceNo || ""
  ).trim();

  const paymentStatusInfo = (first.PaymentStatusInfo || first.paymentStatusInfo) as
    | { PaymentStatus?: string; PaymentStep?: string }
    | undefined;
  const pacoStatus = String(paymentStatusInfo?.PaymentStatus || "").toUpperCase();
  const pacoStep = String(paymentStatusInfo?.PaymentStep || "").toUpperCase();

  const amountBlock = (first.TransactionAmount ||
    first.transactionAmount ||
    first.SettlementAmount ||
    first.settlementAmount) as
    | { Amount?: number; amount?: number; CurrencyCode?: string; currencyCode?: string }
    | undefined;
  const amount =
    typeof amountBlock?.Amount === "number"
      ? amountBlock.Amount
      : typeof amountBlock?.amount === "number"
        ? amountBlock.amount
        : undefined;
  const currency = String(amountBlock?.CurrencyCode || amountBlock?.currencyCode || "")
    .trim()
    .toUpperCase() || undefined;

  const officeIdRaw = first.officeId ?? first.OfficeId;
  const officeId =
    officeIdRaw != null && String(officeIdRaw).trim() ? String(officeIdRaw).trim() : undefined;

  if (pacoStatus === "F") {
    return {
      paid: false,
      failed: true,
      approvalCode: approvalCode || undefined,
      invoiceNo: invoiceNo || undefined,
      statusText: pacoStep || "F",
      amount,
      currency,
      officeId,
    };
  }
  if (pacoStatus === "A" || pacoStatus === "S") {
    return {
      paid: true,
      failed: false,
      approvalCode: approvalCode || undefined,
      invoiceNo: invoiceNo || undefined,
      statusText: pacoStep || pacoStatus,
      amount,
      currency,
      officeId,
    };
  }

  const paidHints = ["paid", "success", "successful", "approved", "settled", "captured", "completed"];
  const failHints = ["fail", "failed", "decline", "declined", "reject", "error", "void", "cancel"];

  const paid = paidHints.some((h) => statusRaw.includes(h)) || Boolean(approvalCode && !failHints.some((h) => statusRaw.includes(h)));
  const failed = failHints.some((h) => statusRaw.includes(h));

  return {
    paid: paid && !failed,
    failed,
    approvalCode: approvalCode || undefined,
    invoiceNo: invoiceNo || undefined,
    statusText: statusRaw || undefined,
    amount,
    currency,
    officeId,
  };
}
