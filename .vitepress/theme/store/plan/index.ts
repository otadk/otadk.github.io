import { getPlanJSON } from "@theme/api/plan";
import { PlanItem, TodoItem } from "@theme/interface/plan";
import { dateStringToDays, getCurrentDate } from "@theme/utils/date";
import { defineStore } from "pinia";
import { ref, toRaw } from "vue";
import { planStoreConst } from './const';
import localforage from 'localforage';

export const usePlanStore = defineStore("plan", () => {
  const planData = ref<PlanItem[]>([]);
  const currentTodos = ref<TodoItem[]>([]);
  let dateRecord: number;

  const todoSetup = async (date?: string) => {
    await getPlanData();
    if (!planData.value?.length) {
      return;
    }
    if (date) {
      dateRecord = dateStringToDays(date);
      const aimPlan = planData.value.filter(
        (value) => value.date === dateRecord
      );
      if (aimPlan?.length > 0) {
        currentTodos.value = aimPlan[0].tasks;
        return;
      }
    }
    dateRecord = getCurrentDate();
    const currentPlan = planData.value.filter(
      (value) => value.date === dateRecord
    )
    if (currentPlan?.length > 0) {
      currentTodos.value = currentPlan[0].tasks;
    }
  };
  
  const getPlanData = async () => {
    const localPlan = await localforage.getItem<PlanItem[]>(planStoreConst.PLAN_STORE_KEY);
    if (!localPlan) {
      const planJSON  = await getPlanJSON();
      planData.value = planJSON;
      await localforage.setItem(planStoreConst.PLAN_STORE_KEY, planJSON);
      return;
    }
    planData.value = localPlan;
    return;
  }


  const updateCurrentTodos = async (todos: TodoItem[]) => {
    let aimIndex = -1;
    planData.value.forEach((value, index) => {
      if (value.date === dateRecord) {
        aimIndex = index;
      }
    })
    const rawTodos = toRaw(todos);
    if (aimIndex === -1) {
      planData.value.push({date: dateRecord, tasks: rawTodos});
    }
    planData.value[aimIndex].tasks = rawTodos;
    await localforage.setItem(planStoreConst.PLAN_STORE_KEY, toRaw(planData.value));
  }

  const setup = async () => {
    await getPlanData();
  }

  const clearCache = async () => {
    await localforage.removeItem(planStoreConst.PLAN_STORE_KEY)
    await getPlanData();
  }

  const exportPlan = () => {
    const blob = new Blob([JSON.stringify(toRaw(planData.value), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "todos.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return {
    planData,
    currentTodos,
    setup,
    todoSetup,
    updateCurrentTodos,
    clearCache,
    exportPlan,
    ...planStoreConst,
  };
});
