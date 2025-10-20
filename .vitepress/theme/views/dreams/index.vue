<script setup lang="ts">
import { ref, onMounted } from "vue";
import DreamCard from "./card.vue";

interface Dream {
  id: number;
  title: string;
  description: string;
}

const dreams = ref<Dream[]>([]);

onMounted(async () => {
  try {
    const res = await fetch("/json/dream.json");
    dreams.value = await res.json();
  } catch (err) {
    console.error("failed to load dreams:", err);
  }
});
</script>

<template>
  <div class="dream-page">
    <header class="dream-header">
      <div class="header-title">Dream Log</div>
      <div class="header-line">
        <svg width="280" height="30">
          <line stroke="#000" y2="25" x2="5" y1="5" x1="5" stroke-width="2" />
          <line stroke="#000" y2="25" x2="280" y1="25" x1="5" stroke-width="2" />
        </svg>
      </div>
    </header>

    <main class="dream-list">
      <DreamCard v-for="dream in dreams" :key="dream.id" :dream="dream" />
    </main>
  </div>
</template>

<style scoped>

.dream-page {
  color: #000;
  font-family: "IBM Plex Mono", monospace;
  padding: 32px;
  transition: background 0.3s ease, color 0.3s ease;
}

/* 深色模式 */
.dark .dream-page {
  color: #f5f5f5;
}

.dream-header {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header-title {
  font-size: 22px;
  font-weight: bold;
  letter-spacing: 1px;
}

.header-line {
  margin-top: 8px;
}

.header-line svg line {
  stroke: #000;
  transition: stroke 0.3s ease;
}

.dark .header-line svg line {
  stroke: #f5f5f5;
}

.dream-list {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>