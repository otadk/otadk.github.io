import { defineStore } from "pinia";
import { computed, ref } from "vue";
import localforage from "localforage";
import dayjs from "dayjs";
import {
  CashAccount,
  FinanceEntry,
  FinanceSettings,
  InvestmentAccount,
  InvestmentSnapshot,
  MonthlySummary,
} from "@theme/interface/finance";
import { financeStoreConst } from "./const";
import { deepUnrefSafe } from "@theme/utils/vue-utils";

type CashBreakdown = Record<CashAccount, number>;

const cashAccounts: CashAccount[] = ["wechat", "alipay", "bank", "cs-cash"];
const investmentAccounts: InvestmentAccount[] = [
  "usd",
  "cs-investment",
  "pv-project",
];

const defaultSettings: FinanceSettings = {
  investmentValues: {
    usd: 0,
    "cs-investment": 0,
    "pv-project": 0,
    loan: 0,
  },
  pvMonthlyIncome: 0,
  pvIncomeTargetAccount: "bank",
};

const mergeSettings = (data?: Partial<FinanceSettings>): FinanceSettings => ({
  ...defaultSettings,
  ...data,
  investmentValues: {
    ...defaultSettings.investmentValues,
    ...(data?.investmentValues ?? {}),
  },
});

const signedAmount = (entry: FinanceEntry) =>
  entry.type === "expense" ? -entry.amount : entry.amount;

const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const useFinanceStore = defineStore("finance", () => {
  const entries = ref<FinanceEntry[]>([]);
  const settings = ref<FinanceSettings>(mergeSettings());
  const investmentHistory = ref<InvestmentSnapshot[]>([]);
  const initialized = ref(false);

  const sortEntries = () => {
    entries.value.sort((a, b) => {
      const diff = dayjs(b.date).valueOf() - dayjs(a.date).valueOf();
      if (diff !== 0) return diff;
      return b.id.localeCompare(a.id);
    });
  };

  const loadEntries = async () => {
    const stored = await localforage.getItem<FinanceEntry[]>(
      financeStoreConst.ENTRIES_KEY
    );
    entries.value = stored ?? [];
    sortEntries();
  };

  const loadSettings = async () => {
    const stored = await localforage.getItem<FinanceSettings>(
      financeStoreConst.SETTINGS_KEY
    );
    settings.value = mergeSettings(stored ?? undefined);
  };

  const loadInvestmentHistory = async () => {
    const stored = await localforage.getItem<InvestmentSnapshot[]>(
      financeStoreConst.INVESTMENT_HISTORY_KEY
    );
    if (stored?.length) {
      investmentHistory.value = stored
        .map((item) => ({
          ...item,
          loan: item.loan ?? 0,
        }))
        .sort((a, b) => b.date.localeCompare(a.date));
    } else {
      investmentHistory.value = [];
    }
  };

  const persistEntries = async () => {
    await localforage.setItem(
      financeStoreConst.ENTRIES_KEY,
      deepUnrefSafe(entries.value)
    );
  };

  const persistSettings = async () => {
    await localforage.setItem(
      financeStoreConst.SETTINGS_KEY,
      deepUnrefSafe(settings.value)
    );
  };

  const persistInvestmentHistory = async () => {
    await localforage.setItem(
      financeStoreConst.INVESTMENT_HISTORY_KEY,
      deepUnrefSafe(investmentHistory.value)
    );
  };

  const ensurePvMonthlyIncome = async () => {
    const amount = settings.value.pvMonthlyIncome;
    if (!amount || amount <= 0) {
      return;
    }
    const lastMonth = settings.value.pvLastTransferMonth;
    const currentMonth = dayjs().startOf("month");

    let cursor = lastMonth
      ? dayjs(lastMonth).add(1, "month")
      : currentMonth;

    const entriesToAdd: FinanceEntry[] = [];
    while (!cursor.isAfter(currentMonth)) {
      const entryDate = cursor.endOf("month").format("YYYY-MM-DD");
      entriesToAdd.push({
        id: generateId(),
        date: entryDate,
        type: "income",
        channel: "cash",
        account: settings.value.pvIncomeTargetAccount,
        category: "光伏收益",
        note: "自动转入",
        amount,
      });
      cursor = cursor.add(1, "month");
    }

    if (entriesToAdd.length) {
      entries.value.unshift(...entriesToAdd);
      sortEntries();
      settings.value.pvLastTransferMonth =
        entriesToAdd[entriesToAdd.length - 1].date.slice(0, 7);
      await Promise.all([persistEntries(), persistSettings()]);
    }
  };

  const setup = async () => {
    await Promise.all([loadEntries(), loadSettings(), loadInvestmentHistory()]);
    if (investmentHistory.value.length === 0) {
      const defaultSnapshot: InvestmentSnapshot = {
        date: dayjs().format("YYYY-MM-DD"),
        usd: settings.value.investmentValues.usd ?? 0,
        "cs-investment": settings.value.investmentValues["cs-investment"] ?? 0,
        "pv-project": settings.value.investmentValues["pv-project"] ?? 0,
        loan: settings.value.investmentValues.loan ?? 0,
      };
      investmentHistory.value = [defaultSnapshot];
      await persistInvestmentHistory();
    }
    await ensurePvMonthlyIncome();
    initialized.value = true;
  };

  const addEntry = async (payload: Omit<FinanceEntry, "id">) => {
    const entry: FinanceEntry = {
      ...payload,
      id: generateId(),
    };
    entries.value.unshift(entry);
    sortEntries();
    await persistEntries();
    return entry;
  };

  const updateEntry = async (updated: FinanceEntry) => {
    const index = entries.value.findIndex((item) => item.id === updated.id);
    if (index === -1) return;
    entries.value[index] = { ...updated };
    sortEntries();
    await persistEntries();
  };

  const removeEntry = async (id: string) => {
    entries.value = entries.value.filter((item) => item.id !== id);
    await persistEntries();
  };

  const addInvestmentSnapshot = async (snapshot: InvestmentSnapshot) => {
    const existingIndex = investmentHistory.value.findIndex(
      (item) => item.date === snapshot.date
    );
    if (existingIndex !== -1) {
      investmentHistory.value[existingIndex] = { ...snapshot };
    } else {
      investmentHistory.value.unshift({ ...snapshot });
    }
    investmentHistory.value.sort((a, b) => b.date.localeCompare(a.date));
    settings.value = mergeSettings({
      ...settings.value,
      investmentValues: {
        usd: snapshot.usd,
        "cs-investment": snapshot["cs-investment"],
        "pv-project": snapshot["pv-project"],
        loan: snapshot.loan ?? 0,
      },
    });
    await Promise.all([persistInvestmentHistory(), persistSettings()]);
  };

  const updatePvConfig = async (pvMonthlyIncome: number) => {
    settings.value = mergeSettings({
      ...settings.value,
      pvMonthlyIncome,
      pvIncomeTargetAccount: "bank",
    });
    await persistSettings();
    await ensurePvMonthlyIncome();
  };

  const resetAll = async () => {
    entries.value = [];
    settings.value = { ...defaultSettings };
    investmentHistory.value = [];
    await Promise.all([
      persistEntries(),
      persistSettings(),
      persistInvestmentHistory(),
    ]);
  };

  const replaceFinanceData = async (payload: {
    entries?: FinanceEntry[];
    settings?: FinanceSettings;
    investmentHistory?: InvestmentSnapshot[];
  }) => {
    if (Array.isArray(payload.entries)) {
      entries.value = payload.entries.map((item) => ({ ...item }));
      sortEntries();
    }
    if (payload.settings) {
      settings.value = mergeSettings(payload.settings);
    }
    if (Array.isArray(payload.investmentHistory)) {
      investmentHistory.value = payload.investmentHistory
        .map((item) => ({ ...item, loan: item.loan ?? 0 }))
        .sort((a, b) => b.date.localeCompare(a.date));
    }
    await Promise.all([
      persistEntries(),
      persistSettings(),
      persistInvestmentHistory(),
    ]);
    await ensurePvMonthlyIncome();
  };

  const getFinanceSnapshot = () => ({
    entries: deepUnrefSafe(entries.value),
    settings: deepUnrefSafe(settings.value),
    investmentHistory: deepUnrefSafe(investmentHistory.value),
  });

  const cashBreakdown = computed<CashBreakdown>(() => {
    return entries.value.reduce((acc, entry) => {
      if (entry.channel === "cash") {
        acc[entry.account as CashAccount] += signedAmount(entry);
      }
      return acc;
    }, cashAccounts.reduce((map, key) => ({ ...map, [key]: 0 }), {} as CashBreakdown));
  });

  const currentCash = computed(() =>
    cashAccounts.reduce((total, key) => total + cashBreakdown.value[key], 0)
  );

  const latestInvestmentSnapshot = computed(
    () => investmentHistory.value[0]
  );

  const currentInvestment = computed(() =>
    investmentAccounts.reduce((total, key) => {
      const latest = latestInvestmentSnapshot.value;
      if (latest) {
        return total + (latest[key] ?? 0);
      }
      return total + (settings.value.investmentValues[key] ?? 0);
    }, latestInvestmentSnapshot.value?.loan ?? settings.value.investmentValues.loan ?? 0)
  );

  const monthlySummaries = computed<MonthlySummary[]>(() => {
    const summaryMap = new Map<string, MonthlySummary>();
    entries.value.forEach((entry) => {
      const month = dayjs(entry.date).format("YYYY-MM");
      if (!summaryMap.has(month)) {
        summaryMap.set(month, {
          month,
          income: 0,
          expense: 0,
          net: 0,
          cashChannelFlow: 0,
          investmentChannelFlow: 0,
        });
      }
      const summary = summaryMap.get(month)!;
      if (entry.type === "income") {
        summary.income += entry.amount;
      } else {
        summary.expense += entry.amount;
      }
      const signed = signedAmount(entry);
      if (entry.channel === "cash") {
        summary.cashChannelFlow += signed;
      } else {
        summary.investmentChannelFlow += signed;
      }
      summary.net = summary.income - summary.expense;
    });

    return Array.from(summaryMap.values()).sort((a, b) =>
      b.month.localeCompare(a.month)
    );
  });

  return {
    entries,
    settings,
    investmentHistory,
    initialized,
    setup,
    addEntry,
    updateEntry,
    removeEntry,
    addInvestmentSnapshot,
    updatePvConfig,
    resetAll,
    currentCash,
    currentInvestment,
    cashBreakdown,
    monthlySummaries,
    latestInvestmentSnapshot,
    replaceFinanceData,
    getFinanceSnapshot,
  };
});
