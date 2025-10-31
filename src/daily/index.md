---
page: true
---

<script lang="ts" setup>
import { usePlanStore } from '@theme/store/plan'
import todo from '@theme/components/todo.vue'

const planStore = usePlanStore()
planStore.setup()
import { useUrlSearchParams } from '@vueuse/core'
const params = useUrlSearchParams('history')

</script>

<todo v-if="planStore.currentTodos?.length > 0" :todos="planStore.currentTodos"/>
