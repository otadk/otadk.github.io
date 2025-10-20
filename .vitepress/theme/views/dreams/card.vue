<template>
  <div class="dream-card">
    <div class="dream-card__header">
      <div class="dream-title">{{ dream.title }}</div>
    </div>

    <div class="dream-desc">{{ dream.description }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  dream: {
    id: number
    title: string
    description: string
  }
}>()
</script>

<style scoped>
.dream-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 24px 0;
  border-bottom: 1px solid #000;
  width: 720px;
  margin: 0 auto;
  transition: border-color 0.3s ease, color 0.3s ease;
}

.dark .dream-card {
  border-bottom-color: #f5f5f5;
}

.dream-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.dream-title {
  font-size: 18px;
  font-weight: 600;
  color: #000;
  letter-spacing: 0.5px;
  transition: color 0.3s ease;
}

.dark .dream-title {
  color: #f5f5f5;
}

.dream-line svg line {
  stroke: #000;
  transition: stroke 0.3s ease;
}

.dark .dream-line svg line {
  stroke: #f5f5f5;
}

.dream-desc {
  font-size: 15px;
  color: #000;
  opacity: 0.9;
  margin-top: 12px;
  line-height: 1.5;
  transition: color 0.3s ease, opacity 0.3s ease;
}

.dark .dream-desc {
  color: #f5f5f5;
  opacity: 0.85;
}
</style>
