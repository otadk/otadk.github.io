<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import dayjs from "dayjs";
import * as echarts from "echarts";
import { useWeightStore } from "@theme/store/weight";

const weightStore = useWeightStore();
const { records, latestRecord } = storeToRefs(weightStore);
const today = dayjs().format("YYYY-MM-DD");

const form = reactive({
  date: today,
  weight: 0,
});

const historyRows = computed(() =>
  records.value.map((record, index, list) => ({
    ...record,
    delta:
      list[index + 1] !== undefined
        ? Number((record.weight - list[index + 1].weight).toFixed(1))
        : undefined,
  }))
);

const chartData = computed(() =>
  [...records.value].sort((a, b) => a.date.localeCompare(b.date))
);

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
  const data = chartData.value;
  if (!data.length) {
    chartInstance.clear();
    return;
  }
  chartInstance.setOption(
    {
      tooltip: { trigger: "axis" },
      grid: { left: 40, right: 20, top: 30, bottom: 30 },
      xAxis: { type: "category", data: data.map((item) => item.date) },
      yAxis: { type: "value", name: "kg" },
      series: [
        {
          name: "体重",
          type: "line",
          smooth: true,
          areaStyle: {},
          showSymbol: false,
          data: data.map((item) => Number(item.weight.toFixed(1))),
        },
      ],
    },
    true
  );
};

const formatWeight = (value: number) => `${Number(value).toFixed(1)} kg`;

const formatDelta = (delta: number) => {
  if (delta === 0) return "持平";
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)} kg`;
};

const deltaClass = (delta: number) => {
  if (delta === 0) return "neutral";
  return delta > 0 ? "positive" : "negative";
};

const handleSubmit = async () => {
  if (!form.date) {
    form.date = today;
  }
  await weightStore.saveRecord({
    date: form.date,
    weight: Number(form.weight) || 0,
  });
};

watch(
  records,
  () => {
    updateChart();
  },
  { deep: true }
);

watch(
  () => form.date,
  (date) => {
    const match = records.value.find((item) => item.date === date);
    if (match) {
      form.weight = match.weight;
    }
  }
);

onMounted(async () => {
  await weightStore.setup();
  if (latestRecord.value) {
    form.date = latestRecord.value.date;
    form.weight = latestRecord.value.weight;
  }
  initChart();
});

onUnmounted(() => {
  disposeChart();
});
</script>

<template>
  <div class="weight-page">
    <section class="weight-card entry-card">
      <header class="section-header">
        <div>
          <h2>体重记录</h2>
          <p>记录每天的体重，观察趋势变化</p>
        </div>
        <div v-if="latestRecord" class="latest-pill">
          最近一次：{{ latestRecord.date }} · {{ formatWeight(latestRecord.weight) }}
        </div>
      </header>
      <form class="entry-form" @submit.prevent="handleSubmit">
        <label>
          日期
          <input type="date" v-model="form.date" />
        </label>
        <label>
          体重 (kg)
          <input type="number" min="0" step="0.1" v-model.number="form.weight" />
        </label>
        <button type="submit">保存记录</button>
      </form>
    </section>

    <section class="weight-card history-card">
      <header class="section-header">
        <div>
          <h3>历史记录</h3>
          <p v-if="historyRows.length">共 {{ historyRows.length }} 条</p>
        </div>
      </header>
      <div v-if="historyRows.length" class="history-list">
        <article v-for="row in historyRows" :key="row.date" class="history-item">
          <div>
            <strong>{{ row.date }}</strong>
            <span class="history-weight">{{ formatWeight(row.weight) }}</span>
          </div>
          <span v-if="row.delta !== undefined" :class="['delta', deltaClass(row.delta)]">
            {{ formatDelta(row.delta) }}
          </span>
        </article>
      </div>
      <p v-else class="empty">暂无记录，先保存一条吧。</p>
    </section>

    <section class="weight-card chart-card">
      <header class="section-header">
        <div>
          <h3>体重变化</h3>
          <p>折线图展示体重趋势</p>
        </div>
      </header>
      <div class="chart-container" ref="chartRef"></div>
    </section>
  </div>
</template>

<style scoped>
.weight-page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin: 1.5rem;
}

.weight-card {
  background: var(--vt-c-white);
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 16px;
  padding: 1.5rem;
}

.dark .weight-card {
  background: rgba(24, 24, 37, 0.92);
  border-color: rgba(148, 163, 184, 0.35);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.entry-form {
  margin-top: 1.25rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.entry-form label {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-weight: 500;
}

.entry-form input {
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
}

.entry-form button {
  grid-column: 1 / -1;
  justify-self: flex-start;
  padding: 0.6rem 1.5rem;
  border-radius: 999px;
  border: none;
  background: #6366f1;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

.history-list {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.history-weight {
  margin-left: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
}

.delta {
  font-weight: 600;
}

.delta.positive {
  color: #ef4444;
}

.delta.negative {
  color: #22c55e;
}

.delta.neutral {
  color: #94a3b8;
}

.latest-pill {
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  border: 1px solid rgba(99, 102, 241, 0.3);
  font-size: 0.9rem;
}

.chart-container {
  height: 320px;
  width: 100%;
}

.empty {
  margin-top: 1rem;
  color: #94a3b8;
}
</style>
