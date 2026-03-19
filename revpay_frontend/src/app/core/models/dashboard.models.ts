export interface AccountResponse {
  id: number;
  accountNumber: string;
  accountType: string;
  status: string;
  balance: number;
  currency: string;
  createdAt: string;
}

export interface TransactionResponse {
credit: any;
  id: number;
  referenceNumber: string;
  type: string;
  status: string;
  amount: number;
  fee: number;
  currency: string;
  description: string;
  note: string;
  senderAccountId: number;
  senderAccountNumber: string;
  receiverAccountId: number;
  receiverAccountNumber: string;
  createdAt: string;
  completedAt: string;
}

export interface DashboardResponse {
  fullName: string;
  email: string;
  role: string;
  primaryAccount: AccountResponse;
  totalBalance: number;
  totalTransactions: number;
  pendingMoneyRequests: number;
  recentTransactions: TransactionResponse[];
}

export interface MoneyRequestResponse {
  id: number;
  amount: number;
  currency: string;
  message: string;
  status: string;
  requesterId: number;
  requesterName: string;
  requesterEmail: string;
  payerId: number;
  payerName: string;
  payerEmail: string;
  createdAt: string;
  expiresAt: string;
}

export interface PaymentMethodResponse {
  id: number;
  type: string;
  maskedIdentifier: string;
  provider: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
  verified: boolean;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}