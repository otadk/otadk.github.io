---
page: true
---

<script lang="ts" setup>
import { onMounted } from 'vue';
import { usePlanStore } from '@theme/store/plan'
import todo from '@theme/components/todo.vue'
import { useUrlSearchParams } from '@vueuse/core'
import { useRouter } from 'vitepress'
import dayjs from 'dayjs'

const planStore = usePlanStore()
const params = useUrlSearchParams('history')
const router = useRouter()

onMounted(() => {
  planStore.todoSetup(params?.date)
})

const goBefore = async () => {
  await planStore.updateCurrentTodos()
  const current = dayjs(params.date || dayjs())
  const newDate = current.subtract(1, 'day').format('YYYYMMDD')
  params.date = newDate
  planStore.todoSetup(newDate)
}

const goNext = async () => {
  await planStore.updateCurrentTodos()
  const current = dayjs(params.date || dayjs())
  await planStore.updateCurrentTodos()
  const newDate = current.add(1, 'day').format('YYYYMMDD')
  params.date = newDate
  planStore.todoSetup(newDate)
}

const goOverview = () => {
  router.go('/tools/daily/overview')
}
</script>

<todo
  v-if="planStore.currentTodos"
  :todos="planStore.currentTodos"
  @save="planStore.updateCurrentTodos"
  @before="goBefore"
  @next="goNext"
  @overview="goOverview"
/>
