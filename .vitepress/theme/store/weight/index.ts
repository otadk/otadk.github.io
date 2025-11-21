import { defineStore } from "pinia";
import { computed, ref } from "vue";
import localforage from "localforage";
import dayjs from "dayjs";
import type { WeightRecord } from "@theme/interface/weight";
import { weightStoreConst } from "./const";
import { deepUnrefSafe } from "@theme/utils/vue-utils";

const normalizeRecord = (record: WeightRecord): WeightRecord => {
  const parsed = dayjs(record.date);
  const date = parsed.isValid() ? parsed.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
  return {
    date,
    weight: Number(record.weight) || 0,
  };
};

export const useWeightStore = defineStore("weight", () => {
  const records = ref<WeightRecord[]>([]);
  const initialized = ref(false);

  const loadRecords = async () => {
    const stored = await localforage.getItem<WeightRecord[]>(
      weightStoreConst.WEIGHT_RECORDS_KEY
    );
    if (Array.isArray(stored)) {
      records.value = stored
        .map((item) => normalizeRecord(item))
        .sort((a, b) => b.date.localeCompare(a.date));
    } else {
      records.value = [];
    }
  };

  const persistRecords = async () => {
    await localforage.setItem(
      weightStoreConst.WEIGHT_RECORDS_KEY,
      deepUnrefSafe(records.value)
    );
  };

  const setup = async () => {
    if (initialized.value) return;
    await loadRecords();
    initialized.value = true;
  };

  const saveRecord = async (record: WeightRecord) => {
    const normalized = normalizeRecord(record);
    const index = records.value.findIndex((item) => item.date === normalized.date);
    if (index !== -1) {
      records.value[index] = normalized;
    } else {
      records.value.unshift(normalized);
    }
    records.value.sort((a, b) => b.date.localeCompare(a.date));
    await persistRecords();
  };

  const replaceRecords = async (list?: WeightRecord[]) => {
    if (Array.isArray(list)) {
      records.value = list
        .map((item) => normalizeRecord(item))
        .sort((a, b) => b.date.localeCompare(a.date));
    } else {
      records.value = [];
    }
    await persistRecords();
  };

  const getRecordsSnapshot = () => deepUnrefSafe(records.value);

  const latestRecord = computed(() => records.value[0]);

  return {
    records,
    latestRecord,
    setup,
    saveRecord,
    replaceRecords,
    getRecordsSnapshot,
  };
});
