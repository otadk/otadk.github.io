---
page: true
---

<script lang="ts" setup>
import { usePlanStore } from '@theme/store/plan'
import todo from '@theme/components/todo.vue'

const planStore = usePlanStore()
import { useUrlSearchParams } from '@vueuse/core'

</script>

<todo v-if="planStore.currentTodos?.length > 0" :todos="planStore.currentTodos"/>
