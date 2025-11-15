<template>
  <article class="dream-card" :style="{ '--accent-color': accentColor }">
    <div class="dream-card__glow"></div>
    <header class="dream-card__header">
      <span class="dream-card__index">#{{ formattedIndex }}</span>
      <span class="dream-card__badge">Active dream</span>
    </header>

    <h3 class="dream-title">{{ dream.title }}</h3>
    <p class="dream-desc">{{ dream.description }}</p>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  dream: {
    id: number;
    title: string;
    description: string;
  };
  accent?: string;
}>();

const formattedIndex = computed(() =>
  props.dream.id.toString().padStart(2, "0")
);

const accentColor = computed(() => props.accent ?? "#7f5af0");
</script>

<style scoped>
.dream-card {
  position: relative;
  padding: 28px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.75);
  box-shadow: 0 30px 60px rgba(108, 110, 143, 0.18);
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow: hidden;
  isolation: isolate;
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.dream-card__glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    120deg,
    rgba(255, 255, 255, 0.4),
    rgba(255, 255, 255, 0)
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.dream-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 38px 90px rgba(108, 110, 143, 0.25);
  border-color: rgba(255, 255, 255, 0.95);
}

.dream-card:hover .dream-card__glow {
  opacity: 1;
}

.dream-card::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at top right,
    var(--accent-color),
    transparent 60%
  );
  opacity: 0.38;
  z-index: -1;
}

.dark .dream-card {
  background: rgba(12, 14, 22, 0.82);
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.dark .dream-card::after {
  opacity: 0.35;
}

.dream-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.dream-card__index {
  font-weight: 700;
  color: var(--accent-color);
  letter-spacing: 0.2em;
  opacity: 0.9;
}

.dark .dream-card__index {
  color: var(--accent-color);
  opacity: 0.8;
}

.dream-card__badge {
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(245, 247, 255, 0.6);
  font-size: 12px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #4a4f78;
}

.dark .dream-card__badge {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.dream-title {
  font-size: 20px;
  margin: 0;
  color: #181827;
  line-height: 1.35;
}

.dark .dream-title {
  color: #f4f6ff;
}

.dream-desc {
  margin: 0;
  color: #4a4f6a;
  line-height: 1.6;
  font-size: 15px;
}

.dark .dream-desc {
  color: rgba(255, 255, 255, 0.75);
}

.dream-card__footer {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.dream-chip {
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  color: #ffffff;
  background: linear-gradient(
    120deg,
    var(--accent-color),
    rgba(255, 255, 255, 0.2)
  );
}

.dream-chip.outline {
  color: #4a4f6a;
  background: transparent;
  border: 1px solid rgba(74, 79, 106, 0.3);
}

.dark .dream-chip.outline {
  color: rgba(255, 255, 255, 0.75);
  border-color: rgba(255, 255, 255, 0.15);
}
</style>
