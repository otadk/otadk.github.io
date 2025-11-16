<script lang="ts" setup>
import { computed } from "vue";
import { PlanItem } from "@theme/interface/plan";
import { daysToDateString } from "@theme/utils/date";

interface Props {
  plans?: PlanItem[];
}

const props = withDefaults(defineProps<Props>(), {
  plans: () => [],
});

const emit = defineEmits<{
  (event: "navigate", date: string): void;
}>();

const enhancedPlans = computed(() =>
  [...props.plans]
    .sort((a, b) => b.date - a.date)
    .map((plan) => {
      const completed = plan.tasks.filter((task) => task.done).length;
      const total = plan.tasks.length;
      return {
        ...plan,
        dateString: daysToDateString(plan.date),
        completed,
        total,
        completionPercent:
          total === 0 ? 0 : Math.round((completed / total) * 100),
      };
    })
);

const headlineStats = computed(() => {
  const totalTasks = enhancedPlans.value.reduce(
    (sum, plan) => sum + plan.total,
    0
  );
  const completedTasks = enhancedPlans.value.reduce(
    (sum, plan) => sum + plan.completed,
    0
  );
  const completionPercent =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return {
    totalDays: enhancedPlans.value.length,
    totalTasks,
    completionPercent,
  };
});

const handleNavigate = (date: string) => {
  emit("navigate", date);
};
</script>

<template>
  <section class="plan-viewer" aria-live="polite">
    <header class="plan-header">
      <div>
        <p class="eyebrow">Plan Timeline</p>
        <h2>Plan Data Overview</h2>
        <p class="helper">
          Browse every recorded date to review workload and completion at a glance.
        </p>
      </div>
      <div class="stats">
        <div class="stat-card">
          <p class="stat-label">Days Recorded</p>
          <p class="stat-value">{{ headlineStats.totalDays }}</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Total Tasks</p>
          <p class="stat-value">{{ headlineStats.totalTasks }}</p>
        </div>
        <div class="stat-card accent">
          <p class="stat-label">Overall Completion</p>
          <p class="stat-value">
            {{ headlineStats.completionPercent }}<span class="unit">%</span>
          </p>
        </div>
      </div>
    </header>

    <div v-if="enhancedPlans.length === 0" class="empty-state">
      <p>No plan data yet — create your first plan ✨</p>
    </div>
    <div v-else class="plan-grid">
      <article
        v-for="plan in enhancedPlans"
        :key="plan.date"
        class="plan-card"
        role="button"
        tabindex="0"
        @click="handleNavigate(plan.dateString)"
        @keydown.enter.prevent="handleNavigate(plan.dateString)"
        :aria-label="`Jump to plan for ${plan.dateString}`"
      >
        <header class="card-header">
          <div>
            <p class="eyebrow">{{ plan.dateString }}</p>
            <h3>
              {{ plan.total }} tasks
              <span class="muted">(done {{ plan.completed }})</span>
            </h3>
          </div>
          <span
            class="badge"
            :class="{ success: plan.completionPercent === 100 }"
          >
            {{ plan.completionPercent }}%
          </span>
        </header>

        <div class="progress" aria-hidden="true">
          <div
            class="progress-bar"
            :style="{ width: plan.completionPercent + '%' }"
          />
        </div>

        <ul class="task-list">
          <li v-for="task in plan.tasks" :key="task.id">
            <span class="status-indicator" :class="{ done: task.done }" />
            <span :class="{ done: task.done }">{{ task.text }}</span>
          </li>
        </ul>
      </article>
    </div>
  </section>
</template>

<style scoped>
.plan-viewer {
  margin: 24px 8px 48px;
  padding: 24px;
  border-radius: 18px;
  border: 1px solid var(--vt-c-divider-light-1);
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9),
    rgba(247, 247, 247, 0.9)
  );
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
}

.dark .plan-viewer {
  border-color: var(--vt-c-divider-dark-1);
  background: linear-gradient(
    135deg,
    rgba(30, 30, 46, 0.95),
    rgba(16, 16, 26, 0.92)
  );
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.35);
}

.plan-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.eyebrow {
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 12px;
  margin-bottom: 4px;
  color: var(--vt-c-text-light-2);
}

.dark .eyebrow {
  color: var(--vt-c-text-dark-2);
}

.helper {
  color: var(--vt-c-text-2);
  margin-top: 6px;
  max-width: 480px;
}

.dark .helper {
  color: var(--vt-c-text-dark-2);
}

.stats {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.stat-card {
  min-width: 120px;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid var(--vt-c-divider-light-2);
  background: var(--vt-c-white-soft);
}

.stat-card.accent {
  background: linear-gradient(120deg, #5da8ff, #2dd4bf);
  color: white;
  border: none;
  box-shadow: 0 6px 18px rgba(45, 212, 191, 0.45);
}

.stat-label {
  font-size: 12px;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
  opacity: 0.8;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
}

.stat-value .unit {
  font-size: 14px;
  margin-left: 4px;
}

.dark .stat-card {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
}

.dark .stat-card.accent {
  box-shadow: 0 8px 24px rgba(45, 212, 191, 0.6);
  background: linear-gradient(120deg, #5da8ff, #2dd4bf);
}

.empty-state {
  padding: 48px 12px;
  text-align: center;
  color: var(--vt-c-text-2);
  border-radius: 16px;
  border: 1px dashed var(--vt-c-divider-light-1);
}

.dark .empty-state {
  color: var(--vt-c-text-dark-2);
  border-color: var(--vt-c-divider-dark-1);
}

.plan-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.plan-card {
  border-radius: 16px;
  padding: 16px;
  border: 1px solid var(--vt-c-divider-light-1);
  background: var(--vt-c-white-soft);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  cursor: pointer;
  outline: none;
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
}

.plan-card:focus-visible {
  box-shadow: 0 0 0 2px var(--vt-c-brand);
}

.dark .plan-card {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
}

.dark .plan-card:hover {
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.muted {
  font-size: 14px;
  color: var(--vt-c-text-2);
}

.dark .muted {
  color: var(--vt-c-text-dark-2);
}

.badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  background: var(--vt-c-gray-light-4);
  color: var(--vt-c-text-1);
}

.badge.success {
  background: rgba(45, 212, 191, 0.15);
  color: #14b8a6;
}

.dark .badge {
  background: rgba(255, 255, 255, 0.09);
  color: var(--vt-c-text-dark-1);
}

.dark .badge.success {
  background: rgba(45, 212, 191, 0.2);
}

.progress {
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: var(--vt-c-divider-light-2);
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(120deg, #38bdf8, #34d399);
  transition: width 0.3s ease;
}

.dark .progress {
  background: rgba(255, 255, 255, 0.08);
}

.task-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 220px;
  overflow: auto;
}

.task-list li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  background: var(--vt-c-gray-light-4);
  flex-shrink: 0;
}

.status-indicator.done {
  background: #34d399;
}

.task-list span.done {
  text-decoration: line-through;
  opacity: 0.6;
}
</style>
