<script lang="ts" setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import dayjs from "dayjs";
import type {
  CashAccount,
  FinanceChannel,
  FinanceEntry,
  FinanceType,
  InvestmentAccount,
} from "@theme/interface/finance";
import { useFinanceStore } from "@theme/store/finance";
import { usePlanStore } from "@theme/store/plan";
import { storeToRefs } from "pinia";

const financeStore = useFinanceStore();
const planStore = usePlanStore();
const {
  entries,
  monthlySummaries,
  cashBreakdown,
  currentInvestment,
  latestInvestmentSnapshot,
  investmentHistory,
} = storeToRefs(financeStore);
const today = dayjs().format("YYYY-MM-DD");

const cashAccountOptions: { value: CashAccount; label: string }[] = [
  { value: "wechat", label: "微信" },
  { value: "alipay", label: "支付宝" },
  { value: "bank", label: "银行卡" },
  { value: "cs-cash", label: "CS账户现金" },
];

const investmentAccountOptions: { value: InvestmentAccount; label: string }[] =
  [
    { value: "usd", label: "美元" },
    { value: "cs-investment", label: "CS投资市值" },
    { value: "pv-project", label: "光伏项目" },
  ];

const accountLabelMap = [
  ...cashAccountOptions,
  ...investmentAccountOptions,
].reduce<Record<string, string>>((acc, item) => {
  acc[item.value] = item.label;
  return acc;
}, {});

const formState = reactive({
  id: "",
  date: today,
  type: "expense" as FinanceType,
  channel: "cash" as FinanceChannel,
  account: cashAccountOptions[0].value as CashAccount,
  amount: 0,
  description: "",
});

const investmentRecordForm = reactive({
  date: today,
  usd: 0,
  csInvestment: 0,
  pvProject: 0,
  loan: 0,
});

const selectedDate = ref(today);
const selectedMonth = ref(dayjs().format("YYYY-MM"));

const accountOptions = computed(() =>
  formState.channel === "cash"
    ? cashAccountOptions
    : investmentAccountOptions
);

onMounted(() => {
  financeStore.setup();
  planStore.setup();
});

let allowAutoFillInvestment = true;
const fillInvestmentRecordFromHistory = () => {
  if (!allowAutoFillInvestment) {
    return;
  }
  const history = investmentHistory.value;
  if (!history.length) {
    return;
  }
  const targetDate = dayjs(investmentRecordForm.date);
  const previous =
    history.find((item) => dayjs(item.date).isBefore(targetDate)) ??
    history[0];
  investmentRecordForm.usd = previous.usd;
  investmentRecordForm.csInvestment = previous["cs-investment"];
  investmentRecordForm.pvProject = previous["pv-project"];
  investmentRecordForm.loan = previous.loan ?? 0;
  allowAutoFillInvestment = false;
};

watch(
  [investmentHistory, () => investmentRecordForm.date],
  () => {
    allowAutoFillInvestment = true;
    fillInvestmentRecordFromHistory();
  },
  { immediate: true }
);

const markInvestmentManual = () => {
  allowAutoFillInvestment = false;
};

watch(
  monthlySummaries,
  (list) => {
    if (!list.length) {
      selectedMonth.value = dayjs().format("YYYY-MM");
      return;
    }
    const exists = list.some((item) => item.month === selectedMonth.value);
    if (!exists) {
      selectedMonth.value = list[0].month;
    }
  },
  { immediate: true }
);

watch(
  () => formState.channel,
  (channel) => {
    const options = channel === "cash" ? cashAccountOptions : investmentAccountOptions;
    if (!options.some((item) => item.value === formState.account)) {
      formState.account = options[0]?.value as CashAccount;
    }
  }
);

const dailyEntries = computed(() =>
  entries.value.filter((item) => item.date === selectedDate.value)
);
const monthlyOptions = computed(() =>
  monthlySummaries.value.map((item) => item.month)
);
const cashTotal = computed(() =>
  Object.values(cashBreakdown.value || {}).reduce(
    (sum, val) => sum + (val || 0),
    0
  )
);
const dailySummary = computed(() =>
  dailyEntries.value.reduce(
    (acc, entry) => {
      if (entry.type === "income") {
        acc.income += entry.amount;
      } else {
        acc.expense += entry.amount;
      }
      acc.net = acc.income - acc.expense;
      return acc;
    },
    { income: 0, expense: 0, net: 0 }
  )
);

const selectedMonthlySummary = computed(() =>
  monthlySummaries.value.find((item) => item.month === selectedMonth.value)
);

const showAlert = (message: string) => {
  if (typeof window !== "undefined" && typeof window.alert === "function") {
    window.alert(message);
  } else {
    console.warn(message);
  }
};

const showConfirm = (message: string) => {
  if (typeof window !== "undefined" && typeof window.confirm === "function") {
    return window.confirm(message);
  }
  return true;
};

const formatCurrency = (value: number, withSign = false) => {
  const normalized = Number(value) || 0;
  const formatted = Math.abs(normalized).toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (withSign) {
    const sign = normalized >= 0 ? "+" : "-";
    return `${sign}¥${formatted}`;
  }
  return `¥${formatted}`;
};

const monthlyReportText = computed(() => {
  const summary = selectedMonthlySummary.value;
  if (!summary) return "这个月还没有记录，快来补充一笔吧。";
  const trend = summary.net >= 0 ? "盈余" : "赤字";
  const cashFlow =
    summary.cashChannelFlow >= 0 ? "现金净流入" : "现金净流出较多";
  const investmentFlow =
    summary.investmentChannelFlow >= 0
      ? "理财仓位整体上升"
      : "理财仓位有所回落";
  return `${summary.month} 的净现金流为 ${formatCurrency(
    summary.net
  )}，本月${trend}。${cashFlow}，${investmentFlow}，记得在月底回顾一下支出结构。`;
});

const resetForm = (date = selectedDate.value) => {
  formState.id = "";
  formState.date = date;
  formState.type = "expense";
  formState.channel = "cash";
  formState.account = cashAccountOptions[0].value;
  formState.amount = 0;
  formState.description = "";
};

const startEdit = (entry: FinanceEntry) => {
  formState.id = entry.id;
  formState.date = entry.date;
  formState.type = entry.type;
  formState.channel = entry.channel;
  formState.account = entry.account as CashAccount;
  formState.amount = entry.amount;
  formState.description = entry.note || "";
  selectedDate.value = entry.date;
  selectedMonth.value = dayjs(entry.date).format("YYYY-MM");
};

const handleSubmit = async () => {
  if (!formState.amount || formState.amount <= 0) {
    showAlert("请输入大于 0 的金额");
    return;
  }

  const payload = {
    date: formState.date,
    type: formState.type as FinanceType,
    channel: formState.channel as FinanceChannel,
    account: formState.account,
    amount: Number(formState.amount),
    note: formState.description.trim() || undefined,
  };

  if (formState.id) {
    await financeStore.updateEntry({ id: formState.id, ...payload });
  } else {
    await financeStore.addEntry(payload);
  }
  selectedDate.value = payload.date;
  selectedMonth.value = dayjs(payload.date).format("YYYY-MM");
  resetForm(payload.date);
};

const handleDelete = async (entry: FinanceEntry) => {
  if (!showConfirm("确认要删除这条记录吗？")) return;
  await financeStore.removeEntry(entry.id);
};

const ledgerPreview = computed(() => entries.value.slice(0, 20));

const handleInvestmentRecord = async () => {
  const snapshot = {
    date: investmentRecordForm.date,
    usd: investmentRecordForm.usd || 0,
    "cs-investment": investmentRecordForm.csInvestment || 0,
    "pv-project": investmentRecordForm.pvProject || 0,
    loan: investmentRecordForm.loan || 0,
  };
  await financeStore.addInvestmentSnapshot(snapshot);
  allowAutoFillInvestment = false;
};

const allDataInputRef = ref<HTMLInputElement | null>(null);

const exportAllData = () => {
  const payload = {
    version: 1,
    generatedAt: new Date().toISOString(),
    plan: planStore.getPlanSnapshot(),
    finance: financeStore.getFinanceSnapshot(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `planner-finance-${dayjs().format("YYYYMMDD-HHmmss")}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const triggerAllImport = () => {
  allDataInputRef.value?.click();
};

const handleAllDataImport = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) {
    return;
  }
  try {
    const text = await file.text();
    const json = JSON.parse(text);
    if (json.plan && Array.isArray(json.plan)) {
      await planStore.replacePlanData(json.plan);
    }
    if (json.finance) {
      await financeStore.replaceFinanceData(json.finance);
    }
    showAlert("导入成功，数据已更新。");
  } catch (err: any) {
    console.error(err);
    showAlert(`导入失败：${err?.message || err}`);
  } finally {
    (event.target as HTMLInputElement).value = "";
  }
};
</script>

<template>
  <div class="finance-page">
    <section class="summary-grid">
      <div class="finance-card highlight-card">
        <div class="card-header">
          <div>
            <h2>现金概览</h2>
            <p>所有现金账户仅能通过流水变动</p>
          </div>
          <span class="chip">
            现金合计
            <strong>{{ formatCurrency(cashTotal, true) }}</strong>
          </span>
        </div>

        <div class="cash-account-grid">
          <article
            v-for="option in cashAccountOptions"
            :key="option.value"
            class="cash-account"
          >
            <span class="cash-label">{{ option.label }}</span>
            <button type="button" class="amount-chip">
              {{ formatCurrency(cashBreakdown?.[option.value] || 0, true) }}
            </button>
          </article>
        </div>
      </div>

      <div class="finance-card investments-card">
        <div class="card-header">
          <div>
            <h3>理财资产</h3>
            <p>展示最近一次的理财估值</p>
          </div>
          <small v-if="latestInvestmentSnapshot">
            最近更新：{{ latestInvestmentSnapshot.date }}
          </small>
        </div>

        <div class="investment-overview">
          <article class="investment-card">
            <span>美元</span>
            <button type="button" class="amount-chip">
              {{ formatCurrency(latestInvestmentSnapshot?.usd || 0, true) }}
            </button>
          </article>
          <article class="investment-card">
            <span>CS 投资市值</span>
            <button type="button" class="amount-chip">
              {{ formatCurrency(latestInvestmentSnapshot?.["cs-investment"] || 0, true) }}
            </button>
          </article>
          <article class="investment-card">
            <span>光伏项目估值</span>
            <button type="button" class="amount-chip">
              {{ formatCurrency(latestInvestmentSnapshot?.["pv-project"] || 0, true) }}
            </button>
          </article>
          <article class="investment-card loan">
            <span>贷款</span>
            <button type="button" class="amount-chip negative">
              {{ formatCurrency(latestInvestmentSnapshot?.loan || 0, true) }}
            </button>
          </article>
          <article class="investment-card total">
            <span>理财合计</span>
            <button type="button" class="amount-chip">
              {{ formatCurrency(currentInvestment, true) }}
            </button>
          </article>
        </div>
      </div>
    </section>

    <section class="finance-card entry-card">
      <header class="entry-header">
        <div>
          <h3>{{ formState.id ? "更新交易" : "新增交易" }}</h3>
          <p>每天记录一次现金或理财的真实变动</p>
        </div>
        <button v-if="formState.id" type="button" @click="resetForm()">
          取消编辑
        </button>
      </header>
      <form class="entry-form" @submit.prevent="handleSubmit">
        <label>
          日期
          <input type="date" v-model="formState.date" />
        </label>

        <label>
          类型
          <select v-model="formState.type">
            <option value="expense">支出</option>
            <option value="income">收入</option>
          </select>
        </label>

        <label>
          渠道
          <select v-model="formState.channel">
            <option value="cash">现金</option>
            <option value="investment">理财</option>
          </select>
        </label>

        <label>
          账户
          <select v-model="formState.account">
            <option
              v-for="option in accountOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </label>

        <label>
          金额
          <input type="number" min="0" step="0.01" v-model.number="formState.amount" />
        </label>

        <label class="note-field">
          描述（选填）
          <textarea
            rows="2"
            placeholder="例如：午餐、工资备注等"
            v-model.trim="formState.description"
          />
        </label>

        <button class="submit" type="submit">
          {{ formState.id ? "更新交易" : "保存交易" }}
        </button>
      </form>
    </section>

    <section class="finance-card investment-record-card">
      <header class="section-header">
        <div>
          <h3>记录理财资产</h3>
          <p>每日录入美元 / CS / 光伏估值</p>
        </div>
        <small v-if="latestInvestmentSnapshot">
          最新：{{ latestInvestmentSnapshot.date }}
        </small>
      </header>
      <form class="investment-record-form" @submit.prevent="handleInvestmentRecord">
        <label>
          日期
          <input type="date" v-model="investmentRecordForm.date" />
        </label>
        <label>
          美元
          <input
            type="number"
            min="0"
            v-model.number="investmentRecordForm.usd"
            @input="markInvestmentManual"
          />
        </label>
        <label>
          CS 市值
          <input
            type="number"
            min="0"
            v-model.number="investmentRecordForm.csInvestment"
            @input="markInvestmentManual"
          />
        </label>
        <label>
          光伏
          <input
            type="number"
            min="0"
            v-model.number="investmentRecordForm.pvProject"
            @input="markInvestmentManual"
          />
        </label>
        <label>
          贷款（请输入负数）
          <input
            type="number"
            v-model.number="investmentRecordForm.loan"
            @input="markInvestmentManual"
          />
        </label>
        <button type="submit">保存今天的理财估值</button>
      </form>
    </section>

    <section class="finance-card daily-card">
      <header class="section-header">
        <div>
          <h3>每日流水</h3>
          <p>随时翻看任意一天的收入与支出</p>
        </div>
        <input type="date" v-model="selectedDate" />
      </header>

      <div class="daily-summary">
        <div>
          <p>收入</p>
          <strong>{{ formatCurrency(dailySummary.income) }}</strong>
        </div>
        <div>
          <p>支出</p>
          <strong>{{ formatCurrency(dailySummary.expense) }}</strong>
        </div>
        <div>
          <p>净额</p>
          <strong :class="{ positive: dailySummary.net >= 0, negative: dailySummary.net < 0 }">
            {{ formatCurrency(dailySummary.net, true) }}
          </strong>
        </div>
      </div>

      <ul class="record-list" v-if="dailyEntries.length">
        <li v-for="entry in dailyEntries" :key="entry.id">
          <div class="record-info">
            <strong>{{ accountLabelMap[entry.account] }}</strong>
            <span class="record-meta">
              {{ entry.channel === "cash" ? "现金" : "理财" }} ·
              {{ entry.type === "income" ? "收入" : "支出" }}
            </span>
            <small v-if="entry.note">{{ entry.note }}</small>
          </div>
          <div class="record-actions">
            <span :class="entry.type === 'income' ? 'positive' : 'negative'">
              {{ entry.type === "income" ? "+" : "-" }}
              {{ formatCurrency(entry.amount, false) }}
            </span>
            <button type="button" @click="startEdit(entry)">编辑</button>
            <button type="button" @click="handleDelete(entry)">删除</button>
          </div>
        </li>
      </ul>
      <p v-else class="empty">这一天还没有记录。</p>
    </section>

    <section class="finance-card monthly-card">
      <header class="section-header">
        <div>
          <h3>每月现金流</h3>
          <p>快速了解每个月的现金动向</p>
        </div>
      </header>

      <div v-if="monthlySummaries.length" class="month-grid">
        <div v-for="summary in monthlySummaries" :key="summary.month" class="month-card">
          <strong>{{ summary.month }}</strong>
          <p>收入：{{ formatCurrency(summary.income) }}</p>
          <p>支出：{{ formatCurrency(summary.expense) }}</p>
          <p :class="{ positive: summary.net >= 0, negative: summary.net < 0 }">
            净流：{{ formatCurrency(summary.net) }}
          </p>
          <small>
            现金 {{ summary.cashChannelFlow >= 0 ? "↑" : "↓" }}
            {{ formatCurrency(summary.cashChannelFlow) }}
          </small>
          <small>
            理财 {{ summary.investmentChannelFlow >= 0 ? "↑" : "↓" }}
            {{ formatCurrency(summary.investmentChannelFlow) }}
          </small>
        </div>
      </div>
      <p v-else class="empty">尚无月度统计。</p>
    </section>

    <section class="finance-card report-card">
      <header class="section-header">
        <div>
          <h3>月度报告</h3>
          <p>月底生成一段简单总结，辅助复盘</p>
        </div>
        <select v-model="selectedMonth">
          <option v-for="month in monthlyOptions" :key="month" :value="month">
            {{ month }}
          </option>
        </select>
      </header>
      <p class="report-text">{{ monthlyReportText }}</p>
      <div class="report-stats" v-if="selectedMonthlySummary">
        <div>
          <p>收入</p>
          <strong>{{ formatCurrency(selectedMonthlySummary.income) }}</strong>
        </div>
        <div>
          <p>支出</p>
          <strong>{{ formatCurrency(selectedMonthlySummary.expense) }}</strong>
        </div>
        <div>
          <p>净额</p>
          <strong
            :class="{
              positive: selectedMonthlySummary.net >= 0,
              negative: selectedMonthlySummary.net < 0,
            }"
            >{{ formatCurrency(selectedMonthlySummary.net) }}</strong
          >
        </div>
      </div>
    </section>

    <section class="finance-card ledger-card">
      <header class="section-header">
        <div>
          <h3>最新流水</h3>
          <p>最近 20 条记录，支持快速操作</p>
        </div>
      </header>
      <div class="table-wrapper" v-if="ledgerPreview.length">
        <table>
          <thead>
            <tr>
              <th>日期</th>
              <th>渠道</th>
              <th>账户</th>
              <th>类型</th>
              <th>金额</th>
              <th>描述</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in ledgerPreview" :key="entry.id">
              <td>{{ entry.date }}</td>
              <td>{{ entry.channel === "cash" ? "现金" : "理财" }}</td>
              <td>{{ accountLabelMap[entry.account] }}</td>
              <td>{{ entry.type === "income" ? "收入" : "支出" }}</td>
              <td :class="entry.type === 'income' ? 'positive' : 'negative'">
                {{ entry.type === "income" ? "+" : "-" }}
                {{ formatCurrency(entry.amount, false) }}
              </td>
              <td>{{ entry.note || "-" }}</td>
              <td class="table-actions">
                <button type="button" @click="startEdit(entry)">编辑</button>
                <button type="button" @click="handleDelete(entry)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="empty">还没有任何记录。</p>
    </section>

    <section class="finance-card data-card">
      <header class="section-header">
        <div>
          <h3>数据导入导出</h3>
          <p>一次性备份或恢复计划与理财数据</p>
        </div>
      </header>
      <div class="data-actions">
        <button type="button" @click="exportAllData">导出全部数据</button>
        <button type="button" @click="triggerAllImport">导入数据</button>
        <input
          ref="allDataInputRef"
          type="file"
          accept="application/json"
          class="hidden-input"
          @change="handleAllDataImport"
        />
      </div>
      <p class="data-hint">
        导入会覆盖当前所有计划与理财记录，操作前请确保备份。
      </p>
    </section>
  </div>
</template>

<style scoped>
.finance-page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1.5rem 0 3rem;
  margin: 0 2rem;
  border-radius: 24px;
}

.finance-card {
  background: var(--vt-c-white);
  border: 1px solid var(--vt-c-divider-light-1);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.dark .finance-card {
  background: var(--vt-c-black-mute);
  border-color: var(--vt-c-divider-dark-1);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.card-header p,
.section-header p {
  margin: 0.15rem 0 0;
  color: var(--vt-c-text-3);
  font-size: 0.9rem;
}

.chip {
  display: inline-flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.6rem 1rem;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.06);
  font-size: 0.9rem;
  text-align: right;
}

.chip strong {
  font-size: 1.2rem;
}

.dark .chip {
  background: rgba(255, 255, 255, 0.08);
  color: var(--vt-c-text-dark-1);
}

.highlight-card {
  border: none;
  background: linear-gradient(135deg, rgba(74, 222, 128, 0.25), rgba(59, 130, 246, 0.12));
}

.dark .highlight-card {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(59, 130, 246, 0.15));
}

.cash-account-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-top: 1.25rem;
}

.cash-account {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 14px;
  padding: 1rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.cash-account strong {
  font-size: 1.4rem;
}

.cash-label {
  font-weight: 600;
  color: var(--vt-c-text-2);
}

.dark .cash-account {
  background: rgba(15, 23, 42, 0.6);
  border-color: rgba(255, 255, 255, 0.08);
  color: var(--vt-c-text-dark-1);
  box-shadow: none;
}

.investments-card {
  border: none;
  background: linear-gradient(135deg, rgba(129, 140, 248, 0.18), rgba(96, 165, 250, 0.12));
}

.dark .investments-card {
  background: linear-gradient(135deg, rgba(129, 140, 248, 0.25), rgba(14, 165, 233, 0.15));
}

.investment-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.investment-card {
  background: rgba(255, 255, 255, 0.85);
  border-radius: 14px;
  padding: 0.85rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.investment-card.total {
  background: linear-gradient(120deg, #fef3c7, #fde68a);
  border: none;
  color: #854d0e;
}

.dark .investment-card {
  background: rgba(15, 23, 42, 0.6);
  border-color: rgba(255, 255, 255, 0.08);
  color: var(--vt-c-text-dark-1);
}

.dark .investment-card.total {
  color: #fcd34d;
  background: linear-gradient(120deg, rgba(217, 119, 6, 0.3), rgba(251, 191, 36, 0.25));
}

.investment-record-card {
  border: none;
  background: linear-gradient(135deg, rgba(244, 114, 182, 0.18), rgba(192, 132, 252, 0.15));
}

.investment-record-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.investment-record-form label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-weight: 500;
}

.investment-record-form input {
  padding: 0.5rem 0.7rem;
  border-radius: 10px;
  border: 1px solid rgba(15, 23, 42, 0.15);
}

.investment-record-form button {
  grid-column: 1 / -1;
  padding: 0.7rem;
  border: none;
  border-radius: 12px;
  background: linear-gradient(120deg, #a855f7, #ec4899);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

.data-card {
  border: none;
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.18), rgba(59, 130, 246, 0.12));
}

.data-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 1rem 0 0.5rem;
}

.data-actions button {
  border: none;
  border-radius: 12px;
  padding: 0.65rem 1.2rem;
  background: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  font-weight: 600;
}

.dark .data-actions button {
  background: rgba(15, 23, 42, 0.6);
  color: var(--vt-c-text-dark-1);
}

.hidden-input {
  display: none;
}

.data-hint {
  color: var(--vt-c-text-3);
  font-size: 0.9rem;
  margin: 0.5rem 0 0;
}

.entry-card {
  border: none;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.16), rgba(59, 130, 246, 0.24));
}

.dark .entry-card {
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.25), rgba(37, 99, 235, 0.28));
}

.amount-chip {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  border: none;
  font-weight: 600;
  font-size: 1.1rem;
  color: #0f172a;
  background: linear-gradient(120deg, rgba(59, 130, 246, 0.2), rgba(14, 165, 233, 0.35));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
  width: 100%;
  cursor: default;
}

.amount-chip.negative {
  color: #991b1b;
  background: linear-gradient(120deg, rgba(248, 113, 113, 0.45), rgba(244, 63, 94, 0.35));
}

.investment-card.total .amount-chip {
  color: #7c2d12;
  background: linear-gradient(120deg, rgba(251, 191, 36, 0.5), rgba(249, 115, 22, 0.4));
}

.dark .amount-chip {
  color: var(--vt-c-text-dark-1);
  background: linear-gradient(120deg, rgba(59, 130, 246, 0.35), rgba(14, 165, 233, 0.45));
  box-shadow: none;
}
.dark .amount-chip.negative {
  color: #fecaca;
  background: linear-gradient(120deg, rgba(248, 113, 113, 0.35), rgba(248, 113, 113, 0.25));
}

.dark .investment-card.total .amount-chip {
  color: #fde68a;
  background: linear-gradient(120deg, rgba(251, 189, 35, 0.45), rgba(234, 88, 12, 0.45));
}

.entry-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
  margin-top: 1.25rem;
}

.entry-form label {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-weight: 500;
}

.entry-form input,
.entry-form select,
.entry-form textarea {
  border-radius: 12px;
  border: 1px solid var(--vt-c-divider-light-1);
  padding: 0.5rem 0.75rem;
  font-size: 0.95rem;
}

.entry-form textarea {
  resize: vertical;
}

.entry-form .submit {
  grid-column: 1 / -1;
  border: none;
  border-radius: 12px;
  padding: 0.9rem;
  background: linear-gradient(120deg, #4ade80, #22d3ee);
  color: #0b1b1d;
  font-weight: 600;
  cursor: pointer;
}

.entry-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.entry-header button {
  border: none;
  background: transparent;
  color: var(--vt-c-text-2);
  cursor: pointer;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.section-header input,
.section-header select {
  border-radius: 10px;
  border: 1px solid var(--vt-c-divider-light-1);
  padding: 0.35rem 0.6rem;
}

.daily-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  margin: 1.25rem 0;
}

.daily-summary strong {
  font-size: 1.1rem;
}

.record-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.record-list li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px dashed var(--vt-c-divider-light-1);
}

.record-info strong {
  display: block;
  margin-bottom: 0.25rem;
}

.record-meta {
  font-size: 0.85rem;
  color: var(--vt-c-text-3);
}

.record-actions {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.record-actions button {
  border: none;
  background: transparent;
  color: var(--vt-c-text-2);
  cursor: pointer;
}

.record-actions span {
  font-weight: 600;
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-top: 1.25rem;
}

.month-card {
  border: 1px solid var(--vt-c-divider-light-1);
  border-radius: 12px;
  padding: 0.75rem;
}

.report-text {
  margin: 1.25rem 0 1.5rem;
  line-height: 1.5;
  color: var(--vt-c-text-2);
}

.report-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
}

.table-wrapper {
  overflow-x: auto;
  margin-top: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 0.6rem 0.4rem;
  text-align: left;
  border-bottom: 1px solid var(--vt-c-divider-light-1);
}

.table-actions button {
  border: none;
  background: transparent;
  color: var(--vt-c-text-2);
  cursor: pointer;
  margin-right: 0.5rem;
}

.positive {
  color: #22c55e;
}

.negative {
  color: #f43f5e;
}

.empty {
  color: var(--vt-c-text-3);
  margin: 0.5rem 0;
}

@media (max-width: 720px) {
  .record-list li {
    flex-direction: column;
  }

  .record-actions {
    justify-content: space-between;
  }
}
</style>
