---
page: true
---

<script lang="ts" setup>
import { onMounted } from 'vue';
import { usePlanStore } from '@theme/store/plan'
import todo from '@theme/components/todo.vue'
import { useUrlSearchParams } from '@vueuse/core'

const planStore = usePlanStore()
const params = useUrlSearchParams('history')
onMounted(() => {
  planStore.todoSetup(params?.date)
})
</script>

<todo v-if="planStore.currentTodos" :todos="planStore.currentTodos" @save="planStore.updateCurrentTodos" />
