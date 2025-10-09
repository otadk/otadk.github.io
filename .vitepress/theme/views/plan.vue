<script setup lang="ts">
import { reactive, toRaw } from "vue";
import localforage from "localforage";
// import { downloadFile, uploadFileToVar } from "../utils/file";

const data = reactive<{ date: ""; tasks: string[] }[]>([]);
const setup = async () => {
  const v = (await localforage.getItem("plan-data")) as {
    date: string;
    tasks: string[];
  }[];
  if (v === null) {
    return;
  }
  Object.assign(data, v);
};
setup();

const save = async () => {
  const t = data.map((value) => toRaw(value));
  console.log(t);
  // await localforage.removeItem('plan-data');
  localforage.setItem("plan-data", t);
};

const exportData = () => {
  // downloadFile("plan.json", data);
};

const importData = async () => {
  // const userData = await uploadFileToVar();
  // console.log(userData);
  // Object.assign(data, userData);
};

// const data = plan.data.toReversed();
const currentDate = new Date();
const currentDateString = `${currentDate.getFullYear()}-${
  currentDate.getMonth() + 1
}-${currentDate.getDate()}`;
</script>

<template>
  <div class="card-group">
    <svg width="190" height="160">
      <path
        d="M 10 10 C 20 20, 40 20, 50 10"
        stroke="black"
        fill="transparent"
      />
      <path
        d="M 70 10 C 70 20, 110 20, 110 10"
        stroke="black"
        fill="transparent"
      />
      <path
        d="M 130 10 C 120 20, 180 20, 170 10"
        stroke="black"
        fill="transparent"
      />
      <path
        d="M 10 60 C 20 80, 40 80, 50 60"
        stroke="black"
        fill="transparent"
      />
    </svg>
    <svg width="190" height="160">
      <path d="M 10 10 S 10 10, 40 50" stroke="black" fill="transparent" />
    </svg>

    <svg width="190" height="160" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M 10 80 Q 52.5 10, 95 80 T 180 80"
        stroke="black"
        fill="transparent"
      />
    </svg>

    <button @click="save">保存</button>
    <button @click="exportData">导出</button>
    <button @click="importData">导入</button>

    <div v-for="(pd, pdIndex) in data" :key="pdIndex">
      <span
        :style="{
          color: currentDateString === pd.date ? 'var(--vp-c-brand-1)' : '',
        }"
        >{{ pd.date }}</span
      >
      <div style="display: flex; flex-wrap: wrap">
        <input
          v-for="(_v, k) in pd.tasks"
          v-model="data[pdIndex].tasks[k]"
          class="card"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-group {
  margin: 20px;
}

.card {
  margin: 4px;
  padding: 2px;
  border-radius: 12px;
  border: 1px solid #39f;
  background-color: var(--vp-c-bg-soft);
}

.card:hover {
  color: var(--vp-c-brand-1);
}

#rect1 {
  fill: url(#Gradient1);
}
.stop1 {
  stop-color: red;
}
.stop2 {
  stop-color: black;
  stop-opacity: 0;
}
.stop3 {
  stop-color: blue;
}
</style>
