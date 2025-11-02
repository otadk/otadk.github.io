---
page: true
---

<script lang="ts" setup>
import { usePlanStore } from '@theme/store/plan'
const planStore = usePlanStore()
planStore.setup()
</script>

<div>
  <button @click="planStore.clearCache()">Clean Cache</button>
  <button @click="planStore.exportPlan()">Export JSON</button>
</div>

<style scoped>
.dark button {
  background: var(--vt-c-gray-dark-4);
}
button {
  background: var(--vt-c-white-soft);
  border-radius: 6px;
  padding: 8px 12px;
  margin: 8px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}
.dark button:hover {
  background: var(--vt-c-white-soft);
  color: var(--vt-c-text-light-1);
}
button:hover {
  background: var(--vt-c-gray-dark-4);
  color: var(--vt-c-text-dark-1);
}

</style>