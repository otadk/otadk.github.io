/// <reference types="vitepress/client" />
/// <reference types="vite/client" />

declare module "@vue/theme/config" {
  import { UserConfig } from "vitepress";
  const config: () => Promise<UserConfig>;
  export default config;
}

declare module "@vue/theme/highlight" {
  const createHighlighter: () => Promise<(input: string) => string>;
  export default createHighlighter;
}

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "body-scroll-lock";

declare module "markdown-it-container" {
  import type { PluginWithParams } from "markdown-it";
  const container: PluginWithParams<any>;
  export default container;
}
