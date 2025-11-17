import { PlanItem, TodoItem } from "@theme/interface/plan";
import { dateStringToDays, getCurrentDate } from "@theme/utils/date";
import { defineStore } from "pinia";
import { ref, toRaw } from "vue";
import { planStoreConst } from "./const";
import localforage from "localforage";
import { deepUnrefSafe } from "@theme/utils/vue-utils";

export const usePlanStore = defineStore("plan", () => {
  const planData = ref<PlanItem[]>([]);
  const currentTodos = ref<TodoItem[]>([]);
  const dateRecord = ref<number>();

  const todoSetup = async (date?: string) => {
    await getPlanData();
    if (date) {
      dateRecord.value = dateStringToDays(date);
      const aimPlan = planData.value.filter(
        (value) => value.date === dateRecord.value
      );
      if (aimPlan?.length > 0) {
        currentTodos.value = aimPlan[0].tasks;
      } else {
        currentTodos.value = [];
      }
      return;
    }
    dateRecord.value = getCurrentDate();
    const currentPlan = planData.value.filter(
      (value) => value.date === dateRecord.value
    );
    if (currentPlan?.length > 0) {
      currentTodos.value = currentPlan[0].tasks;
    }
  };

  const getPlanData = async () => {
    const localPlan = await localforage.getItem<PlanItem[]>(
      planStoreConst.PLAN_STORE_KEY
    );
    if (!localPlan) {
      // const planJSON  = await getPlanJSON(); // 这里之后改成通过按钮拿我的，这样就可以有多份plan了
      planData.value = [];
      await localforage.setItem(planStoreConst.PLAN_STORE_KEY, []);
      return;
    }
    planData.value = localPlan;
    return;
  };

  const persistPlanData = async () => {
    planData.value.sort((a, b) => a.date - b.date);
    await localforage.setItem(
      planStoreConst.PLAN_STORE_KEY,
      deepUnrefSafe(planData.value)
    );
  };

  const updateCurrentTodos = async (todos?: TodoItem[]) => {
    if (dateRecord.value === undefined) {
      return;
    }
    if (todos) {
      let aimIndex = -1;
      planData.value.forEach((value, index) => {
        if (value.date === dateRecord.value) {
          aimIndex = index;
        }
      });
      if (aimIndex === -1) {
        planData.value.push({ date: dateRecord.value, tasks: todos });
      } else {
        planData.value[aimIndex].tasks = todos;
      }
    }
    await persistPlanData();
  };

  const setup = async () => {
    await getPlanData();
  };

  const clearCache = async () => {
    await localforage.removeItem(planStoreConst.PLAN_STORE_KEY);
    await getPlanData();
  };

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
  };

  const replacePlanData = async (data: PlanItem[]) => {
    planData.value = data;
    await persistPlanData();
  };

  const getPlanSnapshot = () => deepUnrefSafe(planData.value);

  const importPlan = async (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }
    try {
      const text = await file.text();
      const json = JSON.parse(text);

      // ✅ 基本校验（是否符合 PlanItem[] 格式）
      if (!Array.isArray(json)) {
        throw new Error("Invalid file format: not an array");
      }

      // 可选：进一步验证字段结构
      const valid = json.every(
        (item) => typeof item.date === "number" && Array.isArray(item.tasks)
      );
      if (!valid) {
        throw new Error("Invalid data structure in file");
      }

      // ✅ 更新 store
      await replacePlanData(json);
    } catch (err: any) {
      console.error("Failed to import plan:", err);
      alert(`导入失败：${err.message}`);
    }
  };

  return {
    planData,
    currentTodos,
    dateRecord,
    setup,
    todoSetup,
    updateCurrentTodos,
    clearCache,
    exportPlan,
    importPlan,
    replacePlanData,
    getPlanSnapshot,
    ...planStoreConst,
  };
});
