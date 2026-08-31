export interface WalletData {
  balance: number;
  currency?: string;
  accountNumber?: string;
  accountName?: string;
  bankName?: string;
  status?: string;
  lastUpdated?: string;
}

export interface WalletBalanceResponse {
  status: string;
  message?: string;
  data: number | {
    balance?: number;
    wallet_balance?: number;
    available_balance?: number;
    currency?: string;
    account_number?: string;
    account_name?: string;
    bank_name?: string;
    status?: string;
  };
}

