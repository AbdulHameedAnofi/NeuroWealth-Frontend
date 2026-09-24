export type TransactionKind = "deposit" | "withdrawal";
export type TransactionStage = "form" | "confirm" | "pending" | "success" | "failure";
export type TransactionPreviewState =
  | "interactive"
  | "validation"
  | "confirm"
  | "pending"
  | "success"
  | "failure";
export type ValidationTone = "error" | "success" | "warning";

import { random } from "./seeded-rng";

// Error recovery types
export type RecoveryAction = "retry" | "edit" | "support";
export type ErrorMode =
  | "network_error"
  | "timeout"
  | "server_error"
  | "validation_error"
  | "quota_error"
  | "state_conflict"
  | "unknown_error";

export interface TransactionRecoveryUI {
  title: string;
  description: string;
  primaryAction: {
    label: string;
    action: RecoveryAction;
  };
  secondaryAction?: {
    label: string;
    action: RecoveryAction;
  };
  tertiaryAction?: {
    label: string;
    action: RecoveryAction;
  };
  reference?: string;
  supportEmail?: string;
}

export interface TransactionFormValues {
  amount: string;
  walletAddress: string;
  walletConnected: boolean;
}

export interface TransactionFieldErrors {
  amount?: string;
  walletAddress?: string;
  walletConnected?: string;
  form?: string;
}

export interface TransactionQuote {
  kind: TransactionKind;
  amount: number;
  fee: number;
  netAmount: number;
  totalDebit: number;
  reference: string;
  walletAddress: string;
  walletLabel: string;
  strategyLabel: string;
  estimatedSettlement: string;
}

export interface PendingTransaction {
  kind: TransactionKind;
  reference: string;
  quote: TransactionQuote;
  statusLabel: string;
  message: string;
  completionDelayMs: number;
  nextStatus: "success" | "failure";
  failureReason: string | null;
}

export interface TransactionReceipt {
  kind: TransactionKind;
  status: "success" | "failure";
  reference: string;
  quote: TransactionQuote;
  message: string;
  failureReason: string | null;
  explorerLabel: string | null;
  settledAt: string;
}

export interface TransactionContext {
  kind: TransactionKind;
  title: string;
  intro: string;
  primaryActionLabel: string;
  confirmActionLabel: string;
  amountLabel: string;
  amountHint: string;
  walletLabel: string;
  walletHint: string;
  connectedWalletLabel: string;
  connectedWalletAddress: string;
  minAmount: number;
  fee: number;
  availableAmount: number;
  strategyLabel: string;
  settlementLabel: string;
  reviewLabel: string;
}

export interface TransactionPreviewSnapshot {
  stage: TransactionStage;
  form: TransactionFormValues;
  fieldErrors: TransactionFieldErrors;
  quote: TransactionQuote | null;
  pending: PendingTransaction | null;
  receipt: TransactionReceipt | null;
}

export interface TransactionRequestPayload {
  intent: "quote" | "submit";
  kind: TransactionKind;
  values: TransactionFormValues;
  simulation?: "auto" | "success" | "failure";
}

export interface TransactionQuoteResponse {
  quote: TransactionQuote;
}

export interface TransactionSubmitResponse {
  pending: PendingTransaction;
}

const DEPOSIT_WALLET = {
  label: "Freighter funding wallet",
  address: "GB4Q5QW7GWXW2P2UAEY6SVS2XHNRDXQ6T7MIP72N6YLHH6GXQK4YAP5G",
};

const DESTINATION_WALLET =
  "GCFXJ4K7R2UTJHI4B74ZLGIBSAWZSA3O76UR3X5IYK6YG33BZINM2F3B";

const NETWORK_FEE = {
  deposit: 0.06,
  withdrawal: 0.38,
} as const;

const AVAILABLE_AMOUNT = {
  deposit: 18540.22,
  withdrawal: 12480.54,
} as const;

const MINIMUM_AMOUNT = {
  deposit: 10,
  withdrawal: 10,
} as const;

const STRATEGY_LABEL = "Balanced";

const STELLAR_ADDRESS_PATTERN = /^G[A-Z2-7]{55}$/;

// Error recovery product copy mapping for each failure mode
const ERROR_RECOVERY_COPY: Record<ErrorMode, TransactionRecoveryUI> = {
  network_error: {
    title: "Connection lost",
    description: "Your connection to the service was interrupted. Please check your network and try again, or contact support if the problem persists.",
    primaryAction: {
      label: "Retry request",
      action: "retry",
    },
    secondaryAction: {
      label: "Edit details",
      action: "edit",
    },
    tertiaryAction: {
      label: "Contact support",
      action: "support",
    },
    supportEmail: "support@neurowealth.com",
  },
  timeout: {
    title: "Request timed out",
    description: "The server took too long to respond. Your amount and wallet settings are still saved. Retry the request or adjust your amount and try again.",
    primaryAction: {
      label: "Retry",
      action: "retry",
    },
    secondaryAction: {
      label: "Edit amount",
      action: "edit",
    },
    tertiaryAction: {
      label: "Contact support",
      action: "support",
    },
    supportEmail: "support@neurowealth.com",
  },
  server_error: {
    title: "Service experiencing issues",
    description: "Service is temporarily unavailable or experiencing issues. Your details are saved. Try again in a few moments, or contact support for assistance.",
    primaryAction: {
      label: "Try again later",
      action: "retry",
    },
    secondaryAction: {
      label: "Edit details",
      action: "edit",
    },
    tertiaryAction: {
      label: "Contact support",
      action: "support",
    },
    supportEmail: "support@neurowealth.com",
  },
  validation_error: {
    title: "Validation failed",
    description: "The amount or wallet details didn't pass validation. Review your entries and make corrections before retrying.",
    primaryAction: {
      label: "Edit details",
      action: "edit",
    },
    secondaryAction: {
      label: "Go back",
      action: "edit",
    },
    supportEmail: "support@neurowealth.com",
  },
  quota_error: {
    title: "Amount exceeds limit",
    description: "The amount exceeds your available balance or transaction limit. Adjust the amount to a lower value and try again.",
    primaryAction: {
      label: "Edit amount",
      action: "edit",
    },
    supportEmail: "support@neurowealth.com",
  },
  state_conflict: {
    title: "Account state changed",
    description: "Your account balance, wallet, or transaction status changed. Review your current balance and wallet settings, then retry.",
    primaryAction: {
      label: "Review and retry",
      action: "edit",
    },
    tertiaryAction: {
      label: "Contact support",
      action: "support",
    },
    supportEmail: "support@neurowealth.com",
  },
  unknown_error: {
    title: "Something went wrong",
    description: "An unexpected error occurred while processing your transaction. Your details are saved. Please try again or contact support for help.",
    primaryAction: {
      label: "Retry",
      action: "retry",
    },
    secondaryAction: {
      label: "Edit details",
      action: "edit",
    },
    tertiaryAction: {
      label: "Contact support",
      action: "support",
    },
    supportEmail: "support@neurowealth.com",
  },
};

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function generateReference(kind: TransactionKind): string {
  const prefix = kind === "deposit" ? "DEP" : "WDR";
  const stamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);
  const suffix = random().toString(36).slice(2, 8).toUpperCase();

  return `NW-${prefix}-${stamp}-${suffix}`;
}

export function parseTransactionKind(value: string | null): TransactionKind {
  return value === "withdrawal" ? "withdrawal" : "deposit";
}

export function parsePreviewState(value: string | null): TransactionPreviewState {
  if (
    value === "validation" ||
    value === "confirm" ||
    value === "pending" ||
    value === "success" ||
    value === "failure"
  ) {
    return value;
  }

  return "interactive";
}

export function getTransactionContext(kind: TransactionKind): TransactionContext {
  if (kind === "withdrawal") {
    return {
      kind,
      title: "Withdraw funds",
      intro: "Move settled capital out of NeuroWealth with clear validation and a traceable receipt.",
      primaryActionLabel: "Review withdrawal",
      confirmActionLabel: "Confirm withdrawal",
      amountLabel: "Withdrawal amount",
      amountHint: "Minimum withdrawal is 10 USDC. Amounts above 10,000 USDC may require an extra treasury check.",
      walletLabel: "Destination wallet",
      walletHint: "Enter a Stellar public address that starts with G. We validate before confirmation.",
      connectedWalletLabel: "Vault account ready",
      connectedWalletAddress: DEPOSIT_WALLET.address,
      minAmount: MINIMUM_AMOUNT.withdrawal,
      fee: NETWORK_FEE.withdrawal,
      availableAmount: AVAILABLE_AMOUNT.withdrawal,
      strategyLabel: STRATEGY_LABEL,
      settlementLabel: "Same-day settlement",
      reviewLabel: "Treasury review may apply",
    };
  }

  return {
    kind,
    title: "Add capital",
    intro: "Deposit USDC from your connected wallet and confirm the amount, fees, and request reference before submission.",
    primaryActionLabel: "Review deposit",
    confirmActionLabel: "Confirm deposit",
    amountLabel: "Deposit amount",
    amountHint: "Minimum deposit is 10 USDC. Stellar network fees stay separate from the credited deposit amount.",
    walletLabel: "Funding wallet",
    walletHint: "Use the connected Freighter wallet for the funding step. Disconnecting blocks submission until you reconnect.",
    connectedWalletLabel: "Freighter connected",
    connectedWalletAddress: DEPOSIT_WALLET.address,
    minAmount: MINIMUM_AMOUNT.deposit,
    fee: NETWORK_FEE.deposit,
    availableAmount: AVAILABLE_AMOUNT.deposit,
    strategyLabel: STRATEGY_LABEL,
    settlementLabel: "Usually completes in under 20 seconds",
    reviewLabel: "Network fee shown at confirmation",
  };
}

export function getDefaultTransactionValues(kind: TransactionKind): TransactionFormValues {
  if (kind === "withdrawal") {
    return {
      amount: "",
      walletAddress: DESTINATION_WALLET,
      walletConnected: true,
    };
  }

  return {
    amount: "",
    walletAddress: DEPOSIT_WALLET.address,
    walletConnected: true,
  };
}

function parseAmount(value: string): number {
  const normalized = value.replace(/,/g, "").trim();

  // Reject hexadecimal (0x...), scientific notation (e/E), or anything not a simple decimal number
  if (!/^-?\d*\.?\d+$/.test(normalized) || /^[+-]?(0x)?[0-9a-fA-F]+\.?[0-9a-fA-F]*(e[+-]?[0-9]+)?$/.test(normalized) && !/^-?\d*\.?\d+$/.test(normalized)) {
    return Number.NaN;
  }

  const amount = Number(normalized);

  if (!Number.isFinite(amount)) {
    return Number.NaN;
  }

  return amount;
}

export function validateTransactionValues(
  kind: TransactionKind,
  values: TransactionFormValues,
): TransactionFieldErrors {
  const context = getTransactionContext(kind);
  const amount = parseAmount(values.amount);
  const errors: TransactionFieldErrors = {};

  if (!values.walletConnected) {
    errors.walletConnected =
      kind === "deposit"
        ? "Connect a funding wallet before submitting a deposit."
        : "Reconnect your vault wallet before withdrawing funds.";
  }

  if (!values.amount.trim()) {
    errors.amount = "Enter an amount to continue.";
  } else if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = "Enter a valid amount greater than 0.";
  } else if (amount < context.minAmount) {
    errors.amount = `Minimum ${kind} amount is ${context.minAmount} USDC.`;
  } else if (amount > context.availableAmount) {
    errors.amount =
      kind === "deposit"
        ? `Funding wallet only has ${context.availableAmount.toFixed(2)} USDC available.`
        : `Available to withdraw is ${context.availableAmount.toFixed(2)} USDC.`;
  }

  if (kind === "withdrawal") {
    if (!values.walletAddress.trim()) {
      errors.walletAddress = "Enter a destination wallet address.";
    } else if (!STELLAR_ADDRESS_PATTERN.test(values.walletAddress.trim())) {
      errors.walletAddress = "Use a valid Stellar public address that starts with G.";
    }
  }

  return errors;
}

export function buildTransactionQuote(
  kind: TransactionKind,
  values: TransactionFormValues,
  reference = generateReference(kind),
): TransactionQuote {
  const context = getTransactionContext(kind);
  const amount = roundCurrency(parseAmount(values.amount));
  const fee = NETWORK_FEE[kind];
  const totalDebit = roundCurrency(kind === "deposit" ? amount + fee : amount);
  const netAmount = roundCurrency(kind === "deposit" ? amount : amount - fee);

  return {
    kind,
    amount,
    fee,
    netAmount,
    totalDebit,
    reference,
    walletAddress: values.walletAddress.trim(),
    walletLabel: context.walletLabel,
    strategyLabel: context.strategyLabel,
    estimatedSettlement: context.settlementLabel,
  };
}

export function buildPendingTransaction(
  kind: TransactionKind,
  values: TransactionFormValues,
  nextStatus: "success" | "failure" = "success",
): PendingTransaction {
  const quote = buildTransactionQuote(kind, values);

  return {
    kind,
    reference: quote.reference,
    quote,
    statusLabel: "Pending on Stellar",
    message:
      kind === "deposit"
        ? "Submitting your deposit and waiting for network confirmation."
        : "Submitting your withdrawal and waiting for liquidity settlement.",
    completionDelayMs: 1600,
    nextStatus,
    failureReason:
      nextStatus === "failure"
        ? kind === "deposit"
          ? "Network fee estimate expired before submission. Refresh the quote and try again."
          : "Treasury liquidity changed mid-flight. Retry after reviewing the updated amount."
        : null,
  };
}

export function buildTransactionReceipt(
  pending: PendingTransaction,
  status: "success" | "failure",
): TransactionReceipt {
  return {
    kind: pending.kind,
    status,
    reference: pending.reference,
    quote: pending.quote,
    message:
      status === "success"
        ? pending.kind === "deposit"
          ? "Deposit confirmed and added to your active strategy."
          : "Withdrawal confirmed and ready for your destination wallet."
        : "Transaction failed before final settlement.",
    failureReason: status === "failure" ? pending.failureReason : null,
    explorerLabel: status === "success" ? "Explorer reference available after backend wiring" : null,
    settledAt: new Date().toISOString(),
  };
}

export function buildPreviewSnapshot(
  kind: TransactionKind,
  preview: TransactionPreviewState,
): TransactionPreviewSnapshot {
  const baseValues = getDefaultTransactionValues(kind);

  if (preview === "validation") {
    return {
      stage: "form",
      form:
        kind === "withdrawal"
          ? { amount: "15000", walletAddress: "BAD-ADDRESS", walletConnected: true }
          : { amount: "", walletAddress: DEPOSIT_WALLET.address, walletConnected: false },
      fieldErrors:
        kind === "withdrawal"
          ? {
              amount: "Available to withdraw is 12480.54 USDC.",
              walletAddress: "Use a valid Stellar public address that starts with G.",
            }
          : {
              amount: "Enter an amount to continue.",
              walletConnected: "Connect a funding wallet before submitting a deposit.",
            },
      quote: null,
      pending: null,
      receipt: null,
    };
  }

  if (preview === "confirm") {
    const form =
      kind === "withdrawal"
        ? { ...baseValues, amount: "4200" }
        : { ...baseValues, amount: "2500" };

    return {
      stage: "confirm",
      form,
      fieldErrors: {},
      quote: buildTransactionQuote(kind, form, `${kind === "deposit" ? "NW-DEP" : "NW-WDR"}-PREVIEW-CNFRM`),
      pending: null,
      receipt: null,
    };
  }

  if (preview === "pending") {
    const form =
      kind === "withdrawal"
        ? { ...baseValues, amount: "4200" }
        : { ...baseValues, amount: "2500" };
    const pending = buildPendingTransaction(kind, form);

    pending.reference = `${kind === "deposit" ? "NW-DEP" : "NW-WDR"}-PREVIEW-PEND`;
    pending.quote.reference = pending.reference;

    return {
      stage: "pending",
      form,
      fieldErrors: {},
      quote: pending.quote,
      pending,
      receipt: null,
    };
  }

  if (preview === "success" || preview === "failure") {
    const form =
      kind === "withdrawal"
        ? { ...baseValues, amount: "4200" }
        : { ...baseValues, amount: "2500" };
    const pending = buildPendingTransaction(
      kind,
      form,
      preview === "success" ? "success" : "failure",
    );

    pending.reference = `${kind === "deposit" ? "NW-DEP" : "NW-WDR"}-PREVIEW-${preview.toUpperCase()}`;
    pending.quote.reference = pending.reference;

    return {
      stage: preview,
      form,
      fieldErrors: {},
      quote: pending.quote,
      pending,
      receipt: buildTransactionReceipt(pending, preview),
    };
  }

  return {
    stage: "form",
    form: baseValues,
    fieldErrors: {},
    quote: null,
    pending: null,
    receipt: null,
  };
}

export function buildStatusChips(
  kind: TransactionKind,
  values: TransactionFormValues,
): Array<{ label: string; tone: ValidationTone }> {
  const context = getTransactionContext(kind);

  return [
    {
      label: values.walletConnected ? context.connectedWalletLabel : "Wallet required",
      tone: values.walletConnected ? "success" : "error",
    },
    {
      label: context.settlementLabel,
      tone: "warning",
    },
    {
      label:
        kind === "deposit"
          ? `${titleCase(kind)} capacity ${context.availableAmount.toFixed(0)}`
          : `Available ${context.availableAmount.toFixed(0)}`,
      tone: "success",
    },
  ];
}

/**
 * Maps API error codes to ErrorMode for product copy and recovery actions.
 * This ensures network and server errors are actionable: retry, edit amount, or contact support.
 */
export function mapErrorCodeToErrorMode(code: string): ErrorMode {
  switch (code) {
    case "NETWORK_ERROR":
      return "network_error";
    case "REQUEST_TIMEOUT":
      return "timeout";
    case "VALIDATION_FAILED":
    case "INVALID_AMOUNT":
    case "INVALID_WALLET":
      return "validation_error";
    case "INSUFFICIENT_BALANCE":
    case "QUOTA_EXCEEDED":
    case "RATE_LIMITED":
      return "quota_error";
    case "STATE_CONFLICT":
    case "CONCURRENT_UPDATE":
      return "state_conflict";
    case "INVALID_JSON":
    case "INVALID_ENVELOPE":
    case "SERVICE_UNAVAILABLE":
    case "INTERNAL_SERVER_ERROR":
      return "server_error";
    default:
      return "unknown_error";
  }
}

/**
 * Builds the recovery UI instructions for a given error.
 * Accepts error code or error mode, returns actionable product copy with retry/edit/support options.
 */
export function getTransactionRecoveryUI(
  codeOrMode: string,
  reference?: string,
): TransactionRecoveryUI {
  const normalized = codeOrMode.toLowerCase() as ErrorMode;
  const mode: ErrorMode =
    normalized in ERROR_RECOVERY_COPY
      ? normalized
      : mapErrorCodeToErrorMode(codeOrMode);

  const copy = ERROR_RECOVERY_COPY[mode] || ERROR_RECOVERY_COPY.unknown_error;

  return {
    ...copy,
    reference: reference || undefined,
  };
}

