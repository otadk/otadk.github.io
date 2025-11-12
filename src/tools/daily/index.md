---
page: true
---

<script lang="ts" setup>
import { onMounted } from 'vue';
import { usePlanStore } from '@theme/store/plan'
import todo from '@theme/components/todo.vue'
import { useUrlSearchParams } from '@vueuse/core'
import dayjs from 'dayjs'

const planStore = usePlanStore()
const params = useUrlSearchParams('history')

onMounted(() => {
  planStore.todoSetup(params?.date)
})

const goBefore = async () => {
  const current = dayjs(params.date || dayjs())
  // await planStore.updateCurrentTodos()
  const newDate = current.subtract(1, 'day').format('YYYYMMDD')
  params.date = newDate
  planStore.todoSetup(newDate)
}

const goNext = async () => {
  const current = dayjs(params.date || dayjs())
  // await planStore.updateCurrentTodos()
  const newDate = current.add(1, 'day').format('YYYYMMDD')
  params.date = newDate
  planStore.todoSetup(newDate)
}
</script>

<todo
  v-if="planStore.currentTodos"
  :todos="planStore.currentTodos"
  @save="planStore.updateCurrentTodos"
  @before="goBefore"
  @next="goNext"
/>
