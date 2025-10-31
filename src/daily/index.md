---
page: true
---

<script lang="ts" setup>
import { usePlanStore } from '@theme/store/plan'
import todo from '@theme/components/todo.vue'
import { useUrlSearchParams } from '@vueuse/core'

const planStore = usePlanStore()
const params = useUrlSearchParams('history')
planStore.setup(params?.date)

</script>

<todo v-if="planStore.currentTodos?.length > 0" :todos="planStore.currentTodos"/>
