<script setup lang="ts">
import { shallowRef, ref, onMounted } from "vue";
import { Repl, useStore, type ReplStore } from "@vue/repl";
import CodemirrorEditor from "@vue/repl/codemirror-editor";
import "@vue/repl/style.css";
import { useData } from "vitepress";

const props = defineProps<{
  src: string;
}>();

const { isDark } = useData();
const rawDemoFiles = import.meta.glob("../**/*.vue", {
  query: "?raw",
  import: "default",
});

const loading = ref(true);
const error = ref<string | null>(null);
const store = shallowRef<ReplStore | null>(null);

const defaultMainFile = `import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
`;

const isClient = typeof window !== "undefined";

const loadDemo = async () => {
  if (!isClient) return;
  loading.value = true;
  error.value = null;
  store.value = null;
  const path = props.src ;
  if (!path) {
    error.value = "未提供示例路径";
    loading.value = false;
    return;
  }
  const loader = rawDemoFiles[path];
  if (!loader) {
    error.value = `找不到示例：${path.replace("/src", "")}`;
    loading.value = false;
    return;
  }
  try {
    const source = (await loader()) as string;
    const replStore = useStore();
    replStore.showOutput = true;
    replStore.outputMode = "preview";
    await replStore.setFiles(
      {
        "App.vue": source,
        "main.js": defaultMainFile,
      },
      "App.vue"
    );
    replStore.setActive(replStore.mainFile);
    store.value = replStore;
  } catch (err: any) {
    error.value = err?.message || String(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadDemo();
});
</script>

<template>
  <div class="demo-block">
    <ClientOnly>
      <div v-if="loading" class="demo-state">示例加载中...</div>
      <div v-else-if="error" class="demo-state error">{{ error }}</div>
      <Repl
        v-else-if="store"
        :store="store"
        :ssr="false"
        :auto-resize="true"
        layout="vertical"
        :layout-reverse="true"
        :show-compile-output="false"
        :show-import-map="false"
        :show-ts-config="false"
        :clear-console="false"
        :theme="isDark ? 'dark' : 'light'"
        :editor="CodemirrorEditor"
      />
      <div v-else class="demo-state">暂无示例</div>
    </ClientOnly>
  </div>
</template>

<style scoped>
.demo-block {
  margin: 1.5rem 0;
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 16px;
  overflow: hidden;
}

.demo-state {
  padding: 2rem;
  text-align: center;
  color: var(--vt-c-text-2);
}

.demo-state.error {
  color: #dc2626;
}
</style>
