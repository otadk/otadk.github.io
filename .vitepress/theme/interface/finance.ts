export type FinanceChannel = "cash" | "investment";
export type FinanceType = "income" | "expense";

export type CashAccount = "wechat" | "alipay" | "bank" | "cs-cash";
export type InvestmentAccount = "usd" | "cs-investment" | "pv-project";
export type FinanceAccount = CashAccount | InvestmentAccount;

export interface FinanceEntry {
  id: string;
  date: string; // YYYY-MM-DD
  type: FinanceType;
  channel: FinanceChannel;
  account: FinanceAccount;
  category?: string;
  note?: string;
  amount: number;
}

export interface InvestmentValues {
  usd: number;
  "cs-investment": number;
  "pv-project": number;
  loan: number;
}

export interface InvestmentSnapshot extends InvestmentValues {
  date: string; // YYYY-MM-DD
}

export interface FinanceSettings {
  investmentValues: InvestmentValues;
  pvMonthlyIncome: number;
  pvIncomeTargetAccount: CashAccount;
  pvLastTransferMonth?: string;
}

export interface MonthlySummary {
  month: string; // YYYY-MM
  income: number;
  expense: number;
  net: number;
  cashChannelFlow: number;
  investmentChannelFlow: number;
}
