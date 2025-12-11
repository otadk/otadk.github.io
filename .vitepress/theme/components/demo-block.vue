<script setup lang="ts">
import {
  shallowRef,
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
} from "vue";
import type { DefineComponent } from "vue";
import { Repl, useStore, type ReplStore } from "@vue/repl";
import replStyles from "@vue/repl/style.css?inline";

const props = defineProps<{
  src: string;
}>();

const rawSourceModules = import.meta.glob("../views/works/ui/*.vue", {
  query: "?raw",
  import: "default",
});
const rawComponentModules = import.meta.glob("../views/works/ui/*.vue");
const sourceMap: Record<string, () => Promise<string>> = {};
const componentMap: Record<string, () => Promise<any>> = {};

const addEntry = (
  target: Record<string, () => Promise<any>>,
  key: string,
  loader: () => Promise<any>
) => {
  target[key] = loader;
  const srcMatch = key.match(/\/src\/.+/);
  if (srcMatch) {
    const srcPath = srcMatch[0];
    target[srcPath] = loader;
    const withoutSrc = srcPath.replace(/^\/src/, "");
    if (withoutSrc) {
      const normalized = withoutSrc.startsWith("/")
        ? withoutSrc
        : `/${withoutSrc}`;
      target[normalized] = loader;
    }
  }
};

Object.entries(rawSourceModules).forEach(([key, loader]) => {
  addEntry(sourceMap, key, loader as () => Promise<any>);
});
Object.entries(rawComponentModules).forEach(([key, loader]) => {
  addEntry(componentMap, key, loader as () => Promise<any>);
});

const normalizePath = (value: string) =>
  value
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/^src\//, "")
    .replace(/^(\.\.\/)+/, "")
    .replace(/^\.\//, "");

const getDir = (value: string) => {
  const normalized = normalizePath(value);
  const index = normalized.lastIndexOf("/");
  return index >= 0 ? normalized.slice(0, index) : "";
};

const loadRawModule = async (loader: () => Promise<any>): Promise<string> => {
  const mod = await loader();
  if (typeof mod === "string") return mod;
  return (mod as any)?.default ?? "";
};
const loading = ref(true);
const error = ref<string | null>(null);
const sourceCode = ref("");
const store = shallowRef<ReplStore | null>(null);
const demoComponent = shallowRef<DefineComponent | null>(null);
const editorComponent = shallowRef<any>(null);
const isMobileView = ref(false);

const defaultMainFile = `import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
`;

const isClient = typeof window !== "undefined";
let mediaQuery: MediaQueryList | null = null;
let mediaHandler: ((event: MediaQueryListEvent) => void) | null = null;
let hasInjectedStyle = false;

const ensureReplStyles = () => {
  if (hasInjectedStyle || typeof document === "undefined") return;
  const style = document.createElement("style");
  style.textContent = replStyles;
  style.setAttribute("data-vp-repl-style", "true");
  document.head.appendChild(style);
  hasInjectedStyle = true;
};

const ensureEditor = async () => {
  if (editorComponent.value || typeof window === "undefined") return;
  const mod = await import("@vue/repl/codemirror-editor");
  editorComponent.value = mod.default;
};

const resolveLoader = <T extends () => Promise<any>>(
  map: Record<string, T>,
  value: string | undefined
): T | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const candidates: string[] = [];
  const push = (path?: string) => {
    if (path && !candidates.includes(path)) {
      candidates.push(path);
    }
  };
  push(trimmed);
  if (!trimmed.startsWith("/")) {
    push(`/${trimmed}`);
  }
  if (trimmed.startsWith("/src/")) {
    push(trimmed.replace(/^\/src/, ""));
  } else {
    const prefixed = trimmed.startsWith("/")
      ? `/src${trimmed}`
      : `/src/${trimmed}`;
    push(prefixed);
  }
  const innerSrcIndex = trimmed.indexOf("/src/");
  if (innerSrcIndex > 0) {
    const inner = trimmed.slice(innerSrcIndex);
    push(inner);
    push(inner.replace(/^\/src/, ""));
  }
  for (const candidate of candidates) {
    if (map[candidate]) return map[candidate];
  }
  return undefined;
};

const setupMediaWatcher = () => {
  if (!isClient) return;
  mediaQuery = window.matchMedia("(max-width: 768px)");
  const update = (matches: boolean) => {
    isMobileView.value = matches;
  };
  update(mediaQuery.matches);
  const handler = (event: MediaQueryListEvent) => update(event.matches);
  mediaHandler = handler;
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener("change", handler);
  } else {
    // @ts-ignore legacy Safari
    mediaQuery.addListener(handler);
  }
};

const cleanupMediaWatcher = () => {
  if (!mediaQuery || !mediaHandler) return;
  if (mediaQuery.removeEventListener) {
    mediaQuery.removeEventListener("change", mediaHandler);
  } else {
    // @ts-ignore legacy Safari
    mediaQuery.removeListener(mediaHandler);
  }
};

const loadDemo = async () => {
  if (!isClient) return;
  loading.value = true;
  error.value = null;
  sourceCode.value = "";
  demoComponent.value = null;
  store.value = null;

  const sourceLoader = resolveLoader(sourceMap, props.src);
  if (!sourceLoader) {
    error.value = `找不到示例：${(props.src || "").replace("/src", "")}`;
    loading.value = false;
    return;
  }

  try {
    const source = await loadRawModule(sourceLoader);
    sourceCode.value = source;

    const componentLoader = resolveLoader(componentMap, props.src);
    if (componentLoader) {
      const module: any = await componentLoader();
      demoComponent.value = module?.default ?? null;
    }

    if (!isMobileView.value) {
      const replStore = useStore();
      replStore.showOutput = true;
      replStore.outputMode = "preview";

      const normalizedDir = getDir(props.src || "");
      const srcFileName = (props.src || "").split("/").pop();
      const includeExtras = (srcFileName || "").includes("diy-tour-demo");
      const allowedExtraNames = new Set<string>(["diy-tour.vue"]);
      const extraFilesEntries = includeExtras
        ? Object.entries(rawSourceModules).filter(([path]) => {
            const fileName = path.split("/").pop();
            return (
              getDir(path) === normalizedDir &&
              !!fileName &&
              allowedExtraNames.has(fileName)
            );
          })
        : [];

      const extraFiles: Record<string, string> = {};
      for (const [path, loader] of extraFilesEntries) {
        const fileName = path.split("/").pop();
        if (!fileName || fileName === srcFileName) continue;
        const content = await loadRawModule(loader as () => Promise<any>);
        extraFiles[fileName] = content;
      }

      await replStore.setFiles(
        {
          "App.vue": source,
          "main.js": defaultMainFile,
          ...extraFiles,
        },
        "App.vue"
      );
      replStore.setActive(replStore.mainFile);
      store.value = replStore;
    }
  } catch (err: any) {
    error.value = err?.message || String(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  setupMediaWatcher();
  ensureReplStyles();
  ensureEditor();
  loadDemo();
});

onBeforeUnmount(() => {
  cleanupMediaWatcher();
});

watch(
  () => props.src,
  () => {
    loadDemo();
  }
);

watch(isMobileView, () => {
  loadDemo();
});
</script>

<template>
  <div class="demo-block">
    <ClientOnly>
      <div v-if="loading" class="demo-state">示例加载中...</div>
      <div v-else-if="error" class="demo-state error">{{ error }}</div>

      <div v-else-if="isMobileView" class="mobile-demo">
        <div class="preview-shell">
          <component
            v-if="demoComponent"
            :is="demoComponent"
            class="preview-stage"
          />
          <div v-else class="demo-state">暂无示例</div>
        </div>
        <details class="code-panel">
          <summary>查看代码</summary>
          <pre><code>{{ sourceCode }}</code></pre>
        </details>
      </div>

      <div v-else-if="store && editorComponent" class="repl-shell">
        <Repl
          :store="store"
          :ssr="false"
          :auto-resize="false"
          layout="vertical"
          :layout-reverse="true"
          :show-compile-output="false"
          :show-import-map="false"
          :show-ts-config="false"
          :clear-console="false"
          :editor="editorComponent"
          style="height: 760px; max-height: 85vh;"
        />
      </div>

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

.mobile-demo {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
}

.preview-shell {
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 12px;
  padding: 1rem;
  background: var(--vt-c-bg-soft);
}

.preview-stage {
  display: block;
}

.code-panel {
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 12px;
  padding: 0.25rem 0.75rem 0.75rem;
  background: var(--vt-c-bg-soft);
}

.code-panel summary {
  cursor: pointer;
  font-weight: 600;
  padding: 0.5rem 0;
  user-select: none;
}

.code-panel pre {
  margin: 0;
  padding: 0.75rem;
  border-radius: 10px;
  background: var(--vt-c-bg-mute);
  color: var(--vt-c-text-1);
  overflow-x: auto;
  max-height: 320px;
}

.repl-shell {
  min-height: 720px;
  max-height: 85vh;
}

.repl-shell :deep(.vue-repl) {
  height: 100%;
}
</style>
