---
page: true
---

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vitepress';
import { usePlanStore } from '@theme/store/plan';

const planStore = usePlanStore();
const router = useRouter();
const inputValue = ref('');
const handleSubmit = () => {
  router.go(`/tools/daily?date=${inputValue.value.trim()}`);
}

onMounted(() => {
  planStore.setup();
});
</script>

<button @click="planStore.clearCache()">Clean Cache</button>
<button @click="planStore.exportPlan()">Export JSON</button>
<form class="simple-form" @submit.prevent="handleSubmit">
  <input
    v-model="inputValue"
    type="text"
    placeholder="please input date(YYYYMMDD like 20251101)"
  />
  <button type="submit">GO</button>
</form>

<style scoped>
.dark button {
  background: var(--vt-c-gray-dark-4);
}
button {
  background: var(--vt-c-white-soft);
  border-radius: 6px;
  padding: 8px 12px;
  margin: 8px;
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
.simple-form {
  margin: 0 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.simple-form input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--vt-c-divider-light-1);
  border-radius: 6px;
  outline: none;
}
.simple-form input:focus {
  border-color: var(--vt-c-brand);
  box-shadow: 0 0 4px var(--vt-c-brand);
}
</style>
