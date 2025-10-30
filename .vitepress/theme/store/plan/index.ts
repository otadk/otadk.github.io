import { getPlanJSON } from '@theme/api/plan';
import { PlanItem } from '@theme/interface/plan';
import { getCurrentDate } from '@theme/utils/date';
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const usePlanStore = defineStore("plan", () => {
  const planData = ref<PlanItem[]>([]);
  const currentTodos = computed(() => 
    planData.value?.length > 0 ?
    planData.value.filter(value => value.date === getCurrentDate())[0].tasks : [])
  const setup = async () => {
    planData.value = await getPlanJSON()
  }

  return {
    planData,
    currentTodos,
    setup,
  };
});
