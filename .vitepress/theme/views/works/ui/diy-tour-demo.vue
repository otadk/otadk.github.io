<script setup lang="ts">
import { ref } from 'vue';
import DiyTour from './diy-tour.vue';
import type { TourStep } from './diy-tour.vue';

const open = ref(false);
const current = ref(0);
const startBtnRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);

const steps: TourStep[] = [
  {
    content: 'Tap this button to trigger the tour from any part of your page.',
    target: () => startBtnRef.value,
    placement: 'bottom',
    width: 320,
  },
  {
    content:
      'The tour can highlight any block; customize copy, placement, and width.',
    target: () => panelRef.value,
    placement: 'top',
    width: 320,
  },
];

function startTour() {
  current.value = 0;
  open.value = true;
}
</script>

<template>
  <div class="tour-demo">
    <div class="tour-demo__header">
      <h3>DIY Tour Demo</h3>
      <p>Click start to see the overlay follow the button and card.</p>
    </div>

    <div class="tour-demo__controls">
      <button
        ref="startBtnRef"
        type="button"
        class="tour-demo__btn"
        @click="startTour"
      >
        Start guided tour
      </button>
      <span class="tour-demo__hint">Try pressing Enter to advance.</span>
    </div>

    <div ref="panelRef" class="tour-demo__card">
      <div class="tour-demo__badge">Mock feature</div>
      <div class="tour-demo__title">Content block</div>
      <p class="tour-demo__text">
        This block stands in for any area you want to spotlight.
      </p>
      <p class="tour-demo__text">
        The tour component handles masking, focus, and arrow placement.
      </p>
    </div>

    <DiyTour
      v-model="open"
      v-model:current="current"
      :steps="steps"
      :mask="true"
      :show-indicators="false"
      :z-index="3000"
    />
  </div>
</template>

<style scoped>
.tour-demo {
  position: relative;
  padding: 20px;
  background: linear-gradient(135deg, #0f172a, #111827);
  border-radius: 16px;
  color: #e5e7eb;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.tour-demo__header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.tour-demo__header h3 {
  margin: 0;
  font-size: 18px;
}

.tour-demo__header p {
  margin: 0;
  color: rgba(229, 231, 235, 0.8);
  font-size: 14px;
}

.tour-demo__controls {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.tour-demo__btn {
  background: linear-gradient(135deg, #1a9bff 0%, #47bfff 50%, #90e0ff 100%);
  color: #0b1021;
  border: none;
  border-radius: 12px;
  padding: 12px 18px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  box-shadow: 0 8px 30px rgba(71, 191, 255, 0.35);
  transition: transform 0.15s ease, box-shadow 0.2s ease;
}

.tour-demo__btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 40px rgba(71, 191, 255, 0.45);
}

.tour-demo__btn:active {
  transform: translateY(0);
  box-shadow: 0 6px 24px rgba(71, 191, 255, 0.3);
}

.tour-demo__hint {
  font-size: 13px;
  color: rgba(229, 231, 235, 0.7);
}

.tour-demo__card {
  position: relative;
  padding: 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

.tour-demo__badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(71, 191, 255, 0.18);
  color: #9ddcff;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.tour-demo__title {
  margin: 12px 0 6px;
  font-size: 17px;
  font-weight: 700;
  color: #f8fafc;
}

.tour-demo__text {
  margin: 4px 0;
  color: rgba(229, 231, 235, 0.8);
  font-size: 14px;
  line-height: 1.6;
}
</style>
