import { defineStore } from "pinia";
import { computed, ref } from "vue";
import localforage from "localforage";
import dayjs from "dayjs";
import {
  FinanceSettings,
  InvestmentSnapshot,
} from "@theme/interface/finance";
import { financeStoreConst } from "./const";
import { deepUnrefSafe } from "@theme/utils/vue-utils";

const defaultSettings: FinanceSettings = {
  investmentValues: {
    wechat: 0,
    alipay: 0,
    bank: 0,
    "cs-cash": 0,
    usd: 0,
    "cs-investment": 0,
    "pv-project": 0,
    loan: 0,
  },
  pvMonthlyIncome: 0,
  pvIncomeTargetAccount: "wechat",
};

const mergeSettings = (data?: Partial<FinanceSettings>): FinanceSettings => ({
  ...defaultSettings,
  ...data,
  investmentValues: {
    ...defaultSettings.investmentValues,
    ...(data?.investmentValues ?? {}),
  },
});

const normalizeSnapshot = (snapshot: InvestmentSnapshot): InvestmentSnapshot => ({
  date: snapshot.date,
  wechat: snapshot.wechat ?? 0,
  alipay: snapshot.alipay ?? 0,
  bank: snapshot.bank ?? 0,
  "cs-cash": snapshot["cs-cash"] ?? 0,
  usd: snapshot.usd ?? 0,
  "cs-investment": snapshot["cs-investment"] ?? 0,
  "pv-project": snapshot["pv-project"] ?? 0,
  loan: snapshot.loan ?? 0,
  notes: snapshot.notes ?? {},
});

export const useFinanceStore = defineStore("finance", () => {
  const settings = ref<FinanceSettings>(mergeSettings());
  const investmentHistory = ref<InvestmentSnapshot[]>([]);
  const initialized = ref(false);

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
        .map((item) => normalizeSnapshot(item))
        .sort((a, b) => b.date.localeCompare(a.date));
    } else {
      investmentHistory.value = [];
    }
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

  const setup = async () => {
    await Promise.all([loadSettings(), loadInvestmentHistory()]);
    if (investmentHistory.value.length === 0) {
      const v = settings.value.investmentValues;
      const snapshot: InvestmentSnapshot = {
        date: dayjs().format("YYYY-MM-DD"),
        wechat: v.wechat,
        alipay: v.alipay,
        bank: v.bank,
        "cs-cash": v["cs-cash"],
        usd: v.usd,
        "cs-investment": v["cs-investment"],
        "pv-project": v["pv-project"],
        loan: v.loan,
        notes: {},
      };
      investmentHistory.value = [snapshot];
      await persistInvestmentHistory();
    }
    initialized.value = true;
  };

  const addInvestmentSnapshot = async (snapshot: InvestmentSnapshot) => {
    const normalized = normalizeSnapshot(snapshot);
    const index = investmentHistory.value.findIndex(
      (item) => item.date === normalized.date
    );
    if (index !== -1) {
      investmentHistory.value[index] = normalized;
    } else {
      investmentHistory.value.unshift(normalized);
    }
    investmentHistory.value.sort((a, b) => b.date.localeCompare(a.date));
    settings.value = mergeSettings({
      ...settings.value,
      investmentValues: {
        wechat: normalized.wechat,
        alipay: normalized.alipay,
        bank: normalized.bank,
        "cs-cash": normalized["cs-cash"],
        usd: normalized.usd,
        "cs-investment": normalized["cs-investment"],
        "pv-project": normalized["pv-project"],
        loan: normalized.loan,
      },
    });
    await Promise.all([persistInvestmentHistory(), persistSettings()]);
  };

  const updatePvConfig = async (pvMonthlyIncome: number) => {
    settings.value = mergeSettings({
      ...settings.value,
      pvMonthlyIncome,
    });
    await persistSettings();
  };

  const replaceFinanceData = async (payload: {
    settings?: FinanceSettings;
    investmentHistory?: InvestmentSnapshot[];
  }) => {
    if (payload.settings) {
      settings.value = mergeSettings(payload.settings);
    }
    if (Array.isArray(payload.investmentHistory)) {
      investmentHistory.value = payload.investmentHistory
        .map((item) => normalizeSnapshot(item))
        .sort((a, b) => b.date.localeCompare(a.date));
    }
    await Promise.all([persistSettings(), persistInvestmentHistory()]);
  };

  const getFinanceSnapshot = () => ({
    settings: deepUnrefSafe(settings.value),
    investmentHistory: deepUnrefSafe(investmentHistory.value),
  });

  const latestInvestmentSnapshot = computed(
    () => investmentHistory.value[0]
  );

  const currentCash = computed(() => {
    const latest = latestInvestmentSnapshot.value;
    if (!latest) {
      const v = settings.value.investmentValues;
      return v.wechat + v.alipay + v.bank + v["cs-cash"];
    }
    return latest.wechat + latest.alipay + latest.bank + latest["cs-cash"];
  });

  const currentInvestment = computed(() => {
    const latest = latestInvestmentSnapshot.value;
    if (!latest) {
      const v = settings.value.investmentValues;
      return v.usd + v["cs-investment"] + v["pv-project"] + v.loan;
    }
    return latest.usd + latest["cs-investment"] + latest["pv-project"] + latest.loan;
  });

  return {
    settings,
    investmentHistory,
    initialized,
    setup,
    addInvestmentSnapshot,
    updatePvConfig,
    replaceFinanceData,
    getFinanceSnapshot,
    currentCash,
    currentInvestment,
    latestInvestmentSnapshot,
  };
});
