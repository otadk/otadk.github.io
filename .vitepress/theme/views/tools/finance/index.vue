<script lang="ts" setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import dayjs from "dayjs";
import type { InvestmentSnapshot, SnapshotNotes } from "@theme/interface/finance";
import { useFinanceStore } from "@theme/store/finance";
import { usePlanStore } from "@theme/store/plan";
import { storeToRefs } from "pinia";

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
  { label: "微信", formKey: "wechat", noteKey: "wechatNote", snapshotKey: "wechat" },
  { label: "支付宝", formKey: "alipay", noteKey: "alipayNote", snapshotKey: "alipay" },
  { label: "银行卡", formKey: "bank", noteKey: "bankNote", snapshotKey: "bank" },
  { label: "CS 账户现金", formKey: "csCash", noteKey: "csCashNote", snapshotKey: "cs-cash" },
];

const investmentFields: Array<{
  label: string;
  formKey: keyof typeof investmentRecordForm;
  noteKey: keyof typeof investmentRecordForm;
  snapshotKey: SnapshotNumberKey;
  allowNegative?: boolean;
}> = [
  { label: "美元", formKey: "usd", noteKey: "usdNote", snapshotKey: "usd" },
  { label: "CS 投资市值", formKey: "csInvestment", noteKey: "csInvestmentNote", snapshotKey: "cs-investment" },
  { label: "光伏项目", formKey: "pvProject", noteKey: "pvProjectNote", snapshotKey: "pv-project" },
  { label: "贷款", formKey: "loan", noteKey: "loanNote", snapshotKey: "loan", allowNegative: true },
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

const limitedHistory = computed(() => investmentHistory.value.slice(0, 60));

onMounted(async () => {
  await financeStore.setup();
  planStore.setup();
  fillFromHistory();
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
    exact ?? history.find((item) => dayjs(item.date).isBefore(targetMoment)) ?? history[0];
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
      "cs-investment": investmentRecordForm.csInvestmentNote?.trim() || undefined,
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
const getSnapshotValue = (snapshot: InvestmentSnapshot, key: SnapshotNumberKey) => snapshot[key] ?? 0;
const getNote = (notes: SnapshotNotes | undefined, key: keyof SnapshotNotes) => notes?.[key];

const historyFields = [
  ...cashFields.map((field) => ({ label: field.label, key: field.snapshotKey })),
  ...investmentFields.map((field) => ({ label: field.label, key: field.snapshotKey })),
];

const allDataInputRef = ref<HTMLInputElement | null>(null);

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
    <section class="summary-grid">
      <div class="finance-card highlight-card">
        <div class="card-header">
          <div>
            <h2>现金概览</h2>
            <p>追踪所有现金账户的快照</p>
          </div>
          <span class="chip">
            现金合计
            <strong>{{ formatCurrency(currentCash, true) }}</strong>
          </span>
        </div>
        <div class="cash-account-grid">
          <article
            v-for="field in cashFields"
            :key="field.formKey"
            class="cash-account"
          >
            <span class="cash-label">{{ field.label }}</span>
            <span
              :class="['amount-pill', amountClass(getSnapshotValue(latestSnapshot, field.snapshotKey))]"
            >
              {{ formatCurrency(getSnapshotValue(latestSnapshot, field.snapshotKey), true) }}
            </span>
            <small
              v-if="getNote(latestSnapshot.notes, field.noteKey as keyof SnapshotNotes)"
              class="note-text"
            >
              {{ getNote(latestSnapshot.notes, field.noteKey as keyof SnapshotNotes) }}
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
            <span :class="['amount-pill', amountClass(getSnapshotValue(latestSnapshot, field.snapshotKey))]">
              {{ formatCurrency(getSnapshotValue(latestSnapshot, field.snapshotKey), true) }}
            </span>
            <small
              v-if="getNote(latestSnapshot.notes, field.snapshotKey as keyof SnapshotNotes)"
              class="note-text"
            >
              {{ getNote(latestSnapshot.notes, field.snapshotKey as keyof SnapshotNotes) }}
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
    </section>

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
        <div>
          <h3>历史记录</h3>
          <p>最近 {{ limitedHistory.length }} 条资产快照</p>
        </div>
      </header>
      <div class="table-wrapper" v-if="limitedHistory.length">
        <table>
          <thead>
            <tr>
              <th>日期</th>
              <th v-for="field in historyFields" :key="field.key">{{ field.label }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="snapshot in limitedHistory" :key="snapshot.date">
              <td>{{ snapshot.date }}</td>
              <td v-for="field in historyFields" :key="field.key">
                <span :class="['amount-pill', amountClass(getSnapshotValue(snapshot, field.key as SnapshotNumberKey))]">
                  {{ formatCurrency(getSnapshotValue(snapshot, field.key as SnapshotNumberKey), true) }}
                </span>
                <p
                  v-if="getNote(snapshot.notes, field.key as keyof SnapshotNotes)"
                  class="history-note"
                >
                  {{ getNote(snapshot.notes, field.key as keyof SnapshotNotes) }}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="empty">暂无记录，先保存一条吧。</p>
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
  margin: 0 1.5rem;
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

.summary-grid {
  display: grid;
  gap: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.chip {
  display: inline-flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.5rem 0.9rem;
  border-radius: 999px;
  background: rgba(226, 232, 255, 0.6);
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
  border-collapse: collapse;
}

.history-card th,
.history-card td {
  padding: 0.6rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.25);
  text-align: left;
}

.history-note {
  margin: 0.25rem 0 0;
  font-size: 0.8rem;
  color: var(--vt-c-text-3);
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
</style>

<style scoped>
.finance-page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1.5rem 0 3rem;
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

.summary-grid {
  display: grid;
  gap: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.chip {
  display: inline-flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.5rem 0.9rem;
  border-radius: 999px;
  background: rgba(226, 232, 255, 0.6);
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
  border-collapse: collapse;
}

.history-card th,
.history-card td {
  padding: 0.6rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.25);
  text-align: left;
}

.history-note {
  margin: 0.25rem 0 0;
  font-size: 0.8rem;
  color: var(--vt-c-text-3);
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
</style>
