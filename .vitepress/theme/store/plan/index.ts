import { getPlanJSON } from "@theme/api/plan";
import { PlanItem, TodoItem } from "@theme/interface/plan";
import { dateStringToDays, getCurrentDate } from "@theme/utils/date";
import { defineStore } from "pinia";
import { ref } from "vue";

export const usePlanStore = defineStore("plan", () => {
  const planData = ref<PlanItem[]>([]);
  const currentTodos = ref<TodoItem[]>([]);
  const setup = async (date?: string) => {
    planData.value = await getPlanJSON();
    if (!planData.value?.length) {
      return;
    }
    if (date) {
      const aimPlan = planData.value.filter(
        (value) => value.date === dateStringToDays(date)
      );
      if (aimPlan?.length > 0) {
        currentTodos.value = aimPlan[0].tasks;
        return;
      }
    }
    currentTodos.value = planData.value.filter(
      (value) => value.date === getCurrentDate()
    )[0].tasks;
  };

  return {
    planData,
    currentTodos,
    setup,
  };
});
