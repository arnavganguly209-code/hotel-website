/** HBL PACO / 2C2P Core Payment API types (aligned with PHP SDK). */

export type PacoEnv = "uat" | "production";

export type PacoAmount = {
  amountText: string;
  currencyCode: string;
  decimalPlaces: number;
  amount: number;
};

export type PacoApiRequestMeta = {
  requestMessageID: string;
  requestDateTime: string;
  language: string;
};

export type PacoPaymentRequestBody = {
  apiRequest: PacoApiRequestMeta;
  officeId: string;
  orderNo: string;
  productDescription: string;
  paymentType: string;
  paymentCategory: string;
  storeCardDetails: {
    storeCardFlag: string;
    storedCardUniqueID: string;
  };
  installmentPaymentDetails: {
    ippFlag: string;
    installmentPeriod: number;
    interestType: string | null;
  };
  mcpFlag: string;
  request3dsFlag: string;
  transactionAmount: PacoAmount;
  notificationURLs: {
    confirmationURL: string;
    failedURL: string;
    cancellationURL: string;
    backendURL: string;
  };
  deviceDetails: {
    browserIp: string;
    browser: string;
    browserUserAgent: string;
    mobileDeviceFlag: string;
  };
  purchaseItems: Array<{
    purchaseItemType: string;
    referenceNo: string;
    purchaseItemDescription: string;
    purchaseItemPrice: PacoAmount;
    subMerchantID: string;
    passengerSeqNo: number;
  }>;
  customFieldList: Array<{ fieldName: string; fieldValue: string }>;
};

export type PacoJoseEnvelope = {
  request: unknown;
  iss: string;
  aud: string;
  CompanyApiKey: string;
  iat: number;
  nbf: number;
  exp: number;
};

export type PacoPaymentPageResponse = {
  response?: {
    Data?: {
      paymentPage?: {
        paymentPageURL?: string;
      };
      [key: string]: unknown;
    };
    responseCode?: string;
    responseDescription?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export type PacoTransactionStatus =
  | "initiated"
  | "redirected"
  | "callback_received"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded"
  | "voided"
  | "settled"
  | "error";
