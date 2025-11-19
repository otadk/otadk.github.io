<script lang="ts" setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import dayjs from "dayjs";
import type {
  InvestmentSnapshot,
  SnapshotNotes,
} from "@theme/interface/finance";
import { useFinanceStore } from "@theme/store/finance";
import { usePlanStore } from "@theme/store/plan";
import { storeToRefs } from "pinia";
import * as echarts from "echarts";

const financeStore = useFinanceStore();
const planStore = usePlanStore();
const {
  investmentHistory,
  latestInvestmentSnapshot,
  currentCash,
  currentInvestment,
  settings,
} = storeToRefs(financeStore);
const today = dayjs().format("YYYY-MM-DD");

const cashFields: Array<{
  label: string;
  formKey: keyof typeof investmentRecordForm;
  noteKey: keyof typeof investmentRecordForm;
  snapshotKey: SnapshotNumberKey;
}> = [
  {
    label: "微信",
    formKey: "wechat",
    noteKey: "wechatNote",
    snapshotKey: "wechat",
  },
  {
    label: "支付宝",
    formKey: "alipay",
    noteKey: "alipayNote",
    snapshotKey: "alipay",
  },
  {
    label: "银行卡",
    formKey: "bank",
    noteKey: "bankNote",
    snapshotKey: "bank",
  },
  {
    label: "CS 账户现金",
    formKey: "csCash",
    noteKey: "csCashNote",
    snapshotKey: "cs-cash",
  },
];

const investmentFields: Array<{
  label: string;
  formKey: keyof typeof investmentRecordForm;
  noteKey: keyof typeof investmentRecordForm;
  snapshotKey: SnapshotNumberKey;
  allowNegative?: boolean;
}> = [
  { label: "美元", formKey: "usd", noteKey: "usdNote", snapshotKey: "usd" },
  {
    label: "CS 投资市值",
    formKey: "csInvestment",
    noteKey: "csInvestmentNote",
    snapshotKey: "cs-investment",
  },
  {
    label: "光伏项目",
    formKey: "pvProject",
    noteKey: "pvProjectNote",
    snapshotKey: "pv-project",
  },
  {
    label: "贷款",
    formKey: "loan",
    noteKey: "loanNote",
    snapshotKey: "loan",
    allowNegative: true,
  },
];

type SnapshotNumberKey = Exclude<keyof InvestmentSnapshot, "date" | "notes">;

const investmentRecordForm = reactive({
  date: today,
  wechat: 0,
  wechatNote: "",
  alipay: 0,
  alipayNote: "",
  bank: 0,
  bankNote: "",
  csCash: 0,
  csCashNote: "",
  usd: 0,
  usdNote: "",
  csInvestment: 0,
  csInvestmentNote: "",
  pvProject: 0,
  pvProjectNote: "",
  loan: 0,
  loanNote: "",
});

const totalAssets = computed(() => currentCash.value + currentInvestment.value);

const totalExcludingAdjustments = computed(() => {
  const latest = latestSnapshot.value;
  if (!latest) {
    const v = settings.value.investmentValues;
    return currentCash.value + (v.usd ?? 0);
  }
  return currentCash.value + (latest.usd ?? 0);
});

const calcNetCash = (snapshot: InvestmentSnapshot) =>
  (snapshot.wechat ?? 0) +
  (snapshot.alipay ?? 0) +
  (snapshot.bank ?? 0) +
  (snapshot["cs-cash"] ?? 0) +
  (snapshot.usd ?? 0);

const calcTotalAssets = (snapshot: InvestmentSnapshot) =>
  (snapshot.wechat ?? 0) +
  (snapshot.alipay ?? 0) +
  (snapshot.bank ?? 0) +
  (snapshot["cs-cash"] ?? 0) +
  (snapshot.usd ?? 0) +
  (snapshot["cs-investment"] ?? 0) +
  (snapshot["pv-project"] ?? 0) +
  (snapshot.loan ?? 0);

const historyRows = computed<HistoryRow[]>(() => {
  const list = investmentHistory.value.slice(0, 60);
  return list.map((snapshot, index) => {
    const netCash = calcNetCash(snapshot);
    const totalAsset = calcTotalAssets(snapshot);
    const prev = list[index + 1];
    const prevNet = prev ? calcNetCash(prev) : undefined;
    const prevTotal = prev ? calcTotalAssets(prev) : undefined;
    return {
      snapshot,
      netCash,
      cashFlow: prevNet !== undefined ? netCash - prevNet : undefined,
      totalAsset,
      totalAssetFlow:
        prevTotal !== undefined ? totalAsset - prevTotal : undefined,
    };
  });
});

const chartRows = computed(() => [...historyRows.value].reverse());

interface HistoryRow {
  snapshot: InvestmentSnapshot;
  netCash: number;
  cashFlow?: number;
  totalAsset: number;
  totalAssetFlow?: number;
}

const chartMetrics = [
  { key: "netCash", label: "净现金", getter: (row: HistoryRow) => row.netCash },
  {
    key: "totalAsset",
    label: "总资产",
    getter: (row: HistoryRow) => row.totalAsset,
  },
  {
    key: "wechat",
    label: "微信",
    getter: (row: HistoryRow) => row.snapshot.wechat ?? 0,
  },
  {
    key: "alipay",
    label: "支付宝",
    getter: (row: HistoryRow) => row.snapshot.alipay ?? 0,
  },
  {
    key: "bank",
    label: "银行卡",
    getter: (row: HistoryRow) => row.snapshot.bank ?? 0,
  },
  {
    key: "cs-cash",
    label: "CS 现金",
    getter: (row: HistoryRow) => row.snapshot["cs-cash"] ?? 0,
  },
  {
    key: "usd",
    label: "美元",
    getter: (row: HistoryRow) => row.snapshot.usd ?? 0,
  },
  {
    key: "cs-investment",
    label: "CS 投资",
    getter: (row: HistoryRow) => row.snapshot["cs-investment"] ?? 0,
  },
  {
    key: "pv-project",
    label: "光伏",
    getter: (row: HistoryRow) => row.snapshot["pv-project"] ?? 0,
  },
  {
    key: "loan",
    label: "贷款",
    getter: (row: HistoryRow) => row.snapshot.loan ?? 0,
  },
] as const;

const chartRef = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

const initChart = () => {
  if (!chartRef.value) return;
  chartInstance = echarts.init(chartRef.value);
  updateChart();
  window.addEventListener("resize", resizeChart);
};

const disposeChart = () => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
  window.removeEventListener("resize", resizeChart);
};

const resizeChart = () => {
  chartInstance?.resize();
};

const updateChart = () => {
  if (!chartInstance) return;
  const rows = chartRows.value;
  if (!rows.length) {
    chartInstance.clear();
    return;
  }
  const xData = rows.map((row) => row.snapshot.date);
  const series = chartMetrics.map((metric) => ({
    name: metric.label,
    type: "line",
    smooth: true,
    showSymbol: false,
    data: rows.map((row) => Number(metric.getter(row)).toFixed(2)),
  }));
  chartInstance.setOption(
    {
      tooltip: { trigger: "axis" },
      legend: {
        top: 0,
        data: chartMetrics.map((metric) => metric.label),
        selected: {
          净现金: true,
          总资产: true,
          微信: false,
          支付宝: false,
          银行卡: false,
          "CS 现金": false,
          美元: false,
          "CS 投资": false,
          光伏: false,
          贷款: false,
        },
      },
      grid: { left: 40, right: 20, top: 45, bottom: 30 },
      xAxis: { type: "category", data: xData },
      yAxis: { type: "value" },
      series,
    },
    true
  );
};

onMounted(async () => {
  await financeStore.setup();
  planStore.setup();
  fillFromHistory();
  initChart();
});

onUnmounted(() => {
  disposeChart();
});

let allowAutoFill = true;
const fillFromHistory = () => {
  if (!allowAutoFill) return;
  const history = investmentHistory.value;
  if (!history.length) return;
  const targetDate = investmentRecordForm.date;
  const exact = history.find((item) => item.date === targetDate);
  const targetMoment = dayjs(targetDate);
  const prev =
    exact ??
    history.find((item) => dayjs(item.date).isBefore(targetMoment)) ??
    history[0];
  if (!prev) return;
  investmentRecordForm.wechat = prev.wechat ?? 0;
  investmentRecordForm.alipay = prev.alipay ?? 0;
  investmentRecordForm.bank = prev.bank ?? 0;
  investmentRecordForm.csCash = prev["cs-cash"] ?? 0;
  investmentRecordForm.usd = prev.usd ?? 0;
  investmentRecordForm.csInvestment = prev["cs-investment"] ?? 0;
  investmentRecordForm.pvProject = prev["pv-project"] ?? 0;
  investmentRecordForm.loan = prev.loan ?? 0;
  investmentRecordForm.wechatNote = "";
  investmentRecordForm.alipayNote = "";
  investmentRecordForm.bankNote = "";
  investmentRecordForm.csCashNote = "";
  investmentRecordForm.usdNote = "";
  investmentRecordForm.csInvestmentNote = "";
  investmentRecordForm.pvProjectNote = "";
  investmentRecordForm.loanNote = "";
  allowAutoFill = false;
};

watch(
  [investmentHistory, () => investmentRecordForm.date],
  () => {
    allowAutoFill = true;
    fillFromHistory();
    updateChart();
  },
  { immediate: true }
);

const markManual = () => {
  allowAutoFill = false;
};

const handleRecordSubmit = async () => {
  const snapshot: InvestmentSnapshot = {
    date: investmentRecordForm.date,
    wechat: investmentRecordForm.wechat || 0,
    alipay: investmentRecordForm.alipay || 0,
    bank: investmentRecordForm.bank || 0,
    "cs-cash": investmentRecordForm.csCash || 0,
    usd: investmentRecordForm.usd || 0,
    "cs-investment": investmentRecordForm.csInvestment || 0,
    "pv-project": investmentRecordForm.pvProject || 0,
    loan: investmentRecordForm.loan || 0,
    notes: {
      wechat: investmentRecordForm.wechatNote?.trim() || undefined,
      alipay: investmentRecordForm.alipayNote?.trim() || undefined,
      bank: investmentRecordForm.bankNote?.trim() || undefined,
      "cs-cash": investmentRecordForm.csCashNote?.trim() || undefined,
      usd: investmentRecordForm.usdNote?.trim() || undefined,
      "cs-investment":
        investmentRecordForm.csInvestmentNote?.trim() || undefined,
      "pv-project": investmentRecordForm.pvProjectNote?.trim() || undefined,
      loan: investmentRecordForm.loanNote?.trim() || undefined,
    },
  };
  await financeStore.addInvestmentSnapshot(snapshot);
  allowAutoFill = false;
};

const latestSnapshot = computed<InvestmentSnapshot>(() => {
  if (latestInvestmentSnapshot.value) {
    return latestInvestmentSnapshot.value;
  }
  const v = settings.value.investmentValues;
  return {
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
  } as InvestmentSnapshot;
});

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

const amountClass = (value: number) => (value >= 0 ? "positive" : "negative");
const getSnapshotValue = (
  snapshot: InvestmentSnapshot,
  key: SnapshotNumberKey
) => snapshot[key] ?? 0;
const getNote = (notes: SnapshotNotes | undefined, key: keyof SnapshotNotes) =>
  notes?.[key];

const historyFields = [
  ...cashFields.map((field) => ({
    label: field.label,
    key: field.snapshotKey,
  })),
  ...investmentFields.map((field) => ({
    label: field.label,
    key: field.snapshotKey,
  })),
];

const allDataInputRef = ref<HTMLInputElement | null>(null);
const showHistoryNotes = ref(false);

const exportAllData = () => {
  const payload = {
    version: 2,
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
  a.download = `finance-records-${dayjs().format("YYYYMMDD-HHmmss")}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const triggerAllImport = () => {
  allDataInputRef.value?.click();
};

const handleAllDataImport = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const json = JSON.parse(text);
    if (json.plan && Array.isArray(json.plan)) {
      await planStore.replacePlanData(json.plan);
    }
    if (json.finance) {
      await financeStore.replaceFinanceData(json.finance);
    }
    alert("导入成功，数据已更新。");
  } catch (err: any) {
    alert(`导入失败：${err?.message || err}`);
  } finally {
    (event.target as HTMLInputElement).value = "";
  }
};
</script>

<template>
  <div class="finance-page">
    <div class="finance-card highlight-card">
      <div class="card-header">
        <div>
          <h2>现金概览</h2>
          <p>追踪所有现金账户的快照</p>
        </div>
        <div class="chip-stack">
          <span class="chip">
            现金合计
            <strong :class="['amount-pill', amountClass(currentCash)]">
              {{ formatCurrency(currentCash, true) }}
            </strong>
          </span>
          <span class="chip">
            总资产（现金+理财）
            <strong :class="['amount-pill', amountClass(totalAssets)]">
              {{ formatCurrency(totalAssets, true) }}
            </strong>
          </span>
          <span class="chip">
            净现金（不含光伏/CS投资和负债）
            <strong
              :class="['amount-pill', amountClass(totalExcludingAdjustments)]"
            >
              {{ formatCurrency(totalExcludingAdjustments, true) }}
            </strong>
          </span>
        </div>
      </div>
      <div class="cash-account-grid">
        <article
          v-for="field in cashFields"
          :key="field.formKey"
          class="cash-account"
        >
          <span class="cash-label">{{ field.label }}</span>
          <span
            :class="[
              'amount-pill',
              amountClass(getSnapshotValue(latestSnapshot, field.snapshotKey)),
            ]"
          >
            {{
              formatCurrency(
                getSnapshotValue(latestSnapshot, field.snapshotKey),
                true
              )
            }}
          </span>
          <small
            v-if="getNote(latestSnapshot.notes, field.noteKey as keyof SnapshotNotes)"
            class="note-text"
          >
            {{
              getNote(
                latestSnapshot.notes,
                field.noteKey as keyof SnapshotNotes
              )
            }}
          </small>
        </article>
      </div>
    </div>

    <div class="finance-card investments-card">
      <div class="card-header">
        <div>
          <h3>理财资产</h3>
          <p>最近一次记录：{{ latestSnapshot.date }}</p>
        </div>
      </div>
      <div class="investment-overview">
        <article
          v-for="field in investmentFields"
          :key="field.formKey"
          class="investment-card"
        >
          <span>{{ field.label }}</span>
          <span
            :class="[
              'amount-pill',
              amountClass(getSnapshotValue(latestSnapshot, field.snapshotKey)),
            ]"
          >
            {{
              formatCurrency(
                getSnapshotValue(latestSnapshot, field.snapshotKey),
                true
              )
            }}
          </span>
          <small
            v-if="getNote(latestSnapshot.notes, field.snapshotKey as keyof SnapshotNotes)"
            class="note-text"
          >
            {{
              getNote(
                latestSnapshot.notes,
                field.snapshotKey as keyof SnapshotNotes
              )
            }}
          </small>
        </article>
        <article class="investment-card total">
          <span>理财合计</span>
          <span :class="['amount-pill', amountClass(currentInvestment)]">
            {{ formatCurrency(currentInvestment, true) }}
          </span>
        </article>
      </div>
    </div>
    <section class="finance-card record-card">
      <header class="section-header">
        <div>
          <h3>记录每日资产</h3>
          <p>填写现金与理财数值，可为每个字段添加备注</p>
        </div>
      </header>
      <form class="record-form" @submit.prevent="handleRecordSubmit">
        <label>
          日期
          <input type="date" v-model="investmentRecordForm.date" />
        </label>
        <label v-for="field in cashFields" :key="`cash-${field.formKey}`">
          {{ field.label }}
          <input
            type="number"
            min="0"
            step="0.01"
            v-model.number="investmentRecordForm[field.formKey]"
            @input="markManual"
          />
          <textarea
            rows="1"
            class="note-textarea"
            placeholder="备注（选填）"
            v-model.trim="investmentRecordForm[field.noteKey]"
            @input="markManual"
          />
        </label>
        <label v-for="field in investmentFields" :key="`inv-${field.formKey}`">
          {{ field.label }}
          <input
            type="number"
            :min="field.allowNegative ? undefined : 0"
            step="0.01"
            v-model.number="investmentRecordForm[field.formKey]"
            @input="markManual"
          />
          <textarea
            rows="1"
            class="note-textarea"
            placeholder="备注（选填）"
            v-model.trim="investmentRecordForm[field.noteKey]"
            @input="markManual"
          />
        </label>
        <button type="submit">保存记录</button>
      </form>
    </section>

    <section class="finance-card history-card">
      <header class="section-header">
        <div class="flex">
          <h3>历史记录 共 {{ historyRows.length }} 条</h3>
          <button
            class="note-toggle"
            type="button"
            @click="showHistoryNotes = !showHistoryNotes"
          >
            {{ showHistoryNotes ? "隐藏备注" : "显示备注" }}
          </button>
        </div>
      </header>
      <div class="table-wrapper" v-if="historyRows.length">
        <table>
          <thead>
            <tr>
              <th>日期</th>
              <th>净现金</th>
              <th>现金流</th>
              <th>总资产</th>
              <th>资产变化</th>
              <th v-for="field in historyFields" :key="field.key">
                {{ field.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in historyRows" :key="row.snapshot.date">
              <td>{{ row.snapshot.date }}</td>
              <td>
                <span :class="['amount-pill', amountClass(row.netCash)]">
                  {{ formatCurrency(row.netCash, true) }}
                </span>
              </td>
              <td>
                <span
                  v-if="row.cashFlow !== undefined"
                  :class="['amount-pill', amountClass(row.cashFlow)]"
                >
                  {{ formatCurrency(row.cashFlow, true) }}
                </span>
                <span v-else>--</span>
              </td>
              <td>
                <span :class="['amount-pill', amountClass(row.totalAsset)]">
                  {{ formatCurrency(row.totalAsset, true) }}
                </span>
              </td>
              <td>
                <span
                  v-if="row.totalAssetFlow !== undefined"
                  :class="['amount-pill', amountClass(row.totalAssetFlow)]"
                >
                  {{ formatCurrency(row.totalAssetFlow, true) }}
                </span>
                <span v-else>--</span>
              </td>
              <td v-for="field in historyFields" :key="field.key">
                <span
                  :class="[
                    'amount-pill',
                    amountClass(getSnapshotValue(row.snapshot, field.key as SnapshotNumberKey)),
                  ]"
                >
                  {{
                    formatCurrency(
                      getSnapshotValue(
                        row.snapshot,
                        field.key as SnapshotNumberKey
                      ),
                      true
                    )
                  }}
                </span>
                <span
                  v-if="
                    showHistoryNotes &&
                    getNote(row.snapshot.notes, field.key as keyof SnapshotNotes)
                  "
                  class="history-note"
                >
                  {{
                    getNote(
                      row.snapshot.notes,
                      field.key as keyof SnapshotNotes
                    )
                  }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="empty">暂无记录，先保存一条吧。</p>
    </section>

    <section class="finance-card chart-card">
      <header class="section-header">
        <div>
          <h3>资产折线图</h3>
        </div>
      </header>
      <div class="chart-container" ref="chartRef"></div>
    </section>

    <section class="finance-card data-card">
      <header class="section-header">
        <div>
          <h3>数据导入导出</h3>
          <p>备份或恢复计划与资产记录</p>
        </div>
      </header>
      <div class="data-actions">
        <button type="button" @click="exportAllData">导出全部数据</button>
        <button type="button" @click="triggerAllImport">导入数据</button>
        <input
          ref="allDataInputRef"
          class="hidden-input"
          type="file"
          accept="application/json"
          @change="handleAllDataImport"
        />
      </div>
      <p class="data-hint">导入将覆盖当前数据，操作前请先导出备份。</p>
    </section>
  </div>
</template>

<style scoped>
.finance-page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin: 1.5rem;
}

.finance-card {
  background: var(--vt-c-white);
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 16px;
  padding: 1.5rem;
}

.dark .finance-card {
  background: rgba(24, 24, 37, 0.92);
  border-color: rgba(148, 163, 184, 0.35);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.chip-stack {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
}

.chip {
  display: inline-flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.5rem 0.9rem;
  border-radius: 999px;
}

.cash-account-grid {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
}

.cash-account {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 1rem;
  border-radius: 14px;
  border: 1px solid rgba(99, 102, 241, 0.25);
}

.cash-label {
  font-weight: 600;
}

.amount-pill {
  display: inline-flex;
  justify-content: center;
  border-radius: 12px;
  padding: 0.25rem 0.6rem;
  font-weight: 600;
  font-size: 0.95rem;
}

.note-text {
  color: var(--vt-c-text-3);
  font-size: 0.85rem;
}

.note-textarea {
  margin-top: 0.35rem;
  resize: vertical;
  border-radius: 8px;
  border: 1px solid var(--vt-c-divider-light-1);
  padding: 0.4rem 0.6rem;
}

.investment-overview {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
}

.investment-card {
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 14px;
  padding: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.record-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.record-form label {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.record-form input,
.record-form textarea {
  border-radius: 10px;
  border: 1px solid var(--vt-c-divider-light-1);
  padding: 0.5rem 0.7rem;
}

.record-form button {
  grid-column: 1 / -1;
  border: none;
  border-radius: 12px;
  padding: 0.75rem;
  background: linear-gradient(120deg, #f43f5e, #a855f7);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

.history-card .table-wrapper {
  overflow-x: auto;
  margin-top: 1rem;
}

.history-card table {
  width: 100%;
  min-width: 1180px;
  border-collapse: collapse;
}

.history-card th,
.history-card td {
  padding: 0.6rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.25);
  text-align: left;
  white-space: nowrap;
  min-width: 110px;
}

.history-note {
  display: inline-block;
  margin: 0;
  margin-left: 0.4rem;
  font-size: 0.8rem;
  color: var(--vt-c-text-3);
  white-space: nowrap;
}

.note-toggle {
  align-self: flex-start;
  border: 1px solid rgba(99, 102, 241, 0.35);
  background: rgba(99, 102, 241, 0.12);
  color: var(--vt-c-text-1);
  padding: 0.4rem 0.75rem;
  border-radius: 10px;
  cursor: pointer;
}

.chart-container {
  height: 320px;
  margin-top: 1rem;
}

.amount-pill,
.history-card span {
  font-weight: 600;
}

.positive {
  color: #dc2626;
}

.negative {
  color: #15803d;
}

.empty {
  margin-top: 0.5rem;
  color: var(--vt-c-text-3);
}

.data-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
}

.data-actions button {
  border: none;
  border-radius: 10px;
  padding: 0.6rem 1rem;
  background: rgba(99, 102, 241, 0.15);
  cursor: pointer;
}

.hidden-input {
  display: none;
}

.flex {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
