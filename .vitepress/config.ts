import { defineConfigWithTheme } from "vitepress";
import type { Config as ThemeConfig } from "@vue/theme";
import baseConfig from "@vue/theme/config";
import { headerPlugin } from "./headerMdPlugin";
import path from "path";

const nav: ThemeConfig["nav"] = [
  {
    text: "作品集",
    activeMatch: `^/(guide|style-guide|cookbook|examples)/`,
    items: [{ text: "Guide", link: "/guide/introduction" }],
  },
  {
    text: "博客",
    activeMatch: `^/api/`,
    link: "/api/",
  },
  {
    text: "计划",
    activeMatch: `^/plan`,
    link: "/plan/",
  },
  {
    text: "音乐",
    link: "https://play.vuejs.org",
  },
  {
    text: "关于",
    activeMatch: `^/about/`,
    items: [
      { text: "FAQ", link: "/about/faq" },
      { text: "Team", link: "/about/team" },
      { text: "Releases", link: "/about/releases" },
      {
        text: "Community Guide",
        link: "/about/community-guide",
      },
      { text: "Code of Conduct", link: "/about/coc" },
      { text: "Privacy Policy", link: "/about/privacy" },
      {
        text: "The Documentary",
        link: "https://www.youtube.com/watch?v=OrxmtDw4pVI",
      },
    ],
  },
];

export const sidebar: ThemeConfig["sidebar"] = {
  "/guide/": [
    {
      text: "Getting Started",
      items: [
        { text: "Introduction", link: "/guide/introduction" },
        {
          text: "Quick Start",
          link: "/guide/quick-start",
        },
      ],
    },
    {
      text: "Essentials",
      items: [
        {
          text: "Creating an Application",
          link: "/guide/essentials/application",
        },
        {
          text: "Template Syntax",
          link: "/guide/essentials/template-syntax",
        },
        {
          text: "Reactivity Fundamentals",
          link: "/guide/essentials/reactivity-fundamentals",
        },
        {
          text: "Computed Properties",
          link: "/guide/essentials/computed",
        },
        {
          text: "Class and Style Bindings",
          link: "/guide/essentials/class-and-style",
        },
        {
          text: "Conditional Rendering",
          link: "/guide/essentials/conditional",
        },
        { text: "List Rendering", link: "/guide/essentials/list" },
        {
          text: "Event Handling",
          link: "/guide/essentials/event-handling",
        },
        { text: "Form Input Bindings", link: "/guide/essentials/forms" },
        { text: "Watchers", link: "/guide/essentials/watchers" },
        { text: "Template Refs", link: "/guide/essentials/template-refs" },
        {
          text: "Components Basics",
          link: "/guide/essentials/component-basics",
        },
        {
          text: "Lifecycle Hooks",
          link: "/guide/essentials/lifecycle",
        },
      ],
    },
    {
      text: "Components In-Depth",
      items: [
        {
          text: "Registration",
          link: "/guide/components/registration",
        },
        { text: "Props", link: "/guide/components/props" },
        { text: "Events", link: "/guide/components/events" },
        { text: "Component v-model", link: "/guide/components/v-model" },
        {
          text: "Fallthrough Attributes",
          link: "/guide/components/attrs",
        },
        { text: "Slots", link: "/guide/components/slots" },
        {
          text: "Provide / inject",
          link: "/guide/components/provide-inject",
        },
        {
          text: "Async Components",
          link: "/guide/components/async",
        },
      ],
    },
    {
      text: "Reusability",
      items: [
        {
          text: "Composables",
          link: "/guide/reusability/composables",
        },
        {
          text: "Custom Directives",
          link: "/guide/reusability/custom-directives",
        },
        { text: "Plugins", link: "/guide/reusability/plugins" },
      ],
    },
    {
      text: "Built-in Components",
      items: [
        { text: "Transition", link: "/guide/built-ins/transition" },
        {
          text: "TransitionGroup",
          link: "/guide/built-ins/transition-group",
        },
        { text: "KeepAlive", link: "/guide/built-ins/keep-alive" },
        { text: "Teleport", link: "/guide/built-ins/teleport" },
        { text: "Suspense", link: "/guide/built-ins/suspense" },
      ],
    },
    {
      text: "Scaling Up",
      items: [
        { text: "Single-File Components", link: "/guide/scaling-up/sfc" },
        { text: "Tooling", link: "/guide/scaling-up/tooling" },
        { text: "Routing", link: "/guide/scaling-up/routing" },
        {
          text: "State Management",
          link: "/guide/scaling-up/state-management",
        },
        { text: "Testing", link: "/guide/scaling-up/testing" },
        {
          text: "Server-Side Rendering (SSR)",
          link: "/guide/scaling-up/ssr",
        },
      ],
    },
    {
      text: "Best Practices",
      items: [
        {
          text: "Production Deployment",
          link: "/guide/best-practices/production-deployment",
        },
        {
          text: "Performance",
          link: "/guide/best-practices/performance",
        },
        {
          text: "Accessibility",
          link: "/guide/best-practices/accessibility",
        },
        {
          text: "Security",
          link: "/guide/best-practices/security",
        },
      ],
    },
    {
      text: "TypeScript",
      items: [
        { text: "Overview", link: "/guide/typescript/overview" },
        {
          text: "TS with Composition API",
          link: "/guide/typescript/composition-api",
        },
        {
          text: "TS with Options API",
          link: "/guide/typescript/options-api",
        },
      ],
    },
    {
      text: "Extra Topics",
      items: [
        {
          text: "Ways of Using Vue",
          link: "/guide/extras/ways-of-using-vue",
        },
        {
          text: "Composition API FAQ",
          link: "/guide/extras/composition-api-faq",
        },
        {
          text: "Reactivity in Depth",
          link: "/guide/extras/reactivity-in-depth",
        },
        {
          text: "Rendering Mechanism",
          link: "/guide/extras/rendering-mechanism",
        },
        {
          text: "Render Functions & JSX",
          link: "/guide/extras/render-function",
        },
        {
          text: "Vue and Web Components",
          link: "/guide/extras/web-components",
        },
        {
          text: "Animation Techniques",
          link: "/guide/extras/animation",
        },
        // {
        //   text: 'Building a Library for Vue',
        //   link: '/guide/extras/building-a-library'
        // },
        // {
        //   text: 'Vue for React Devs',
        //   link: '/guide/extras/vue-for-react-devs'
        // }
      ],
    },
  ],
  "/api/": [
    {
      text: "Global API",
      items: [
        { text: "Application", link: "/api/application" },
        {
          text: "General",
          link: "/api/general",
        },
      ],
    },
    {
      text: "Composition API",
      items: [
        { text: "setup()", link: "/api/composition-api-setup" },
        {
          text: "Reactivity: Core",
          link: "/api/reactivity-core",
        },
        {
          text: "Reactivity: Utilities",
          link: "/api/reactivity-utilities",
        },
        {
          text: "Reactivity: Advanced",
          link: "/api/reactivity-advanced",
        },
        {
          text: "Lifecycle Hooks",
          link: "/api/composition-api-lifecycle",
        },
        {
          text: "Dependency Injection",
          link: "/api/composition-api-dependency-injection",
        },
        {
          text: "Helpers",
          link: "/api/composition-api-helpers",
        },
      ],
    },
    {
      text: "Options API",
      items: [
        { text: "Options: State", link: "/api/options-state" },
        { text: "Options: Rendering", link: "/api/options-rendering" },
        {
          text: "Options: Lifecycle",
          link: "/api/options-lifecycle",
        },
        {
          text: "Options: Composition",
          link: "/api/options-composition",
        },
        { text: "Options: Misc", link: "/api/options-misc" },
        {
          text: "Component Instance",
          link: "/api/component-instance",
        },
      ],
    },
    {
      text: "Built-ins",
      items: [
        { text: "Directives", link: "/api/built-in-directives" },
        { text: "Components", link: "/api/built-in-components" },
        {
          text: "Special Elements",
          link: "/api/built-in-special-elements",
        },
        {
          text: "Special Attributes",
          link: "/api/built-in-special-attributes",
        },
      ],
    },
    {
      text: "Single-File Component",
      items: [
        { text: "Syntax Specification", link: "/api/sfc-spec" },
        { text: "<script setup>", link: "/api/sfc-script-setup" },
        { text: "CSS Features", link: "/api/sfc-css-features" },
      ],
    },
    {
      text: "Advanced APIs",
      items: [
        { text: "Custom Elements", link: "/api/custom-elements" },
        { text: "Render Function", link: "/api/render-function" },
        { text: "Server-Side Rendering", link: "/api/ssr" },
        { text: "TypeScript Utility Types", link: "/api/utility-types" },
        { text: "Custom Renderer", link: "/api/custom-renderer" },
        { text: "Compile-Time Flags", link: "/api/compile-time-flags" },
      ],
    },
  ],
  "/examples/": [
    {
      text: "Basic",
      items: [
        {
          text: "Hello World",
          link: "/examples/#hello-world",
        },
        {
          text: "Handling User Input",
          link: "/examples/#handling-input",
        },
        {
          text: "Attribute Bindings",
          link: "/examples/#attribute-bindings",
        },
        {
          text: "Conditionals and Loops",
          link: "/examples/#conditionals-and-loops",
        },
        {
          text: "Form Bindings",
          link: "/examples/#form-bindings",
        },
        {
          text: "Simple Component",
          link: "/examples/#simple-component",
        },
      ],
    },
    {
      text: "Practical",
      items: [
        {
          text: "Markdown Editor",
          link: "/examples/#markdown",
        },
        {
          text: "Fetching Data",
          link: "/examples/#fetching-data",
        },
        {
          text: "Grid with Sort and Filter",
          link: "/examples/#grid",
        },
        {
          text: "Tree View",
          link: "/examples/#tree",
        },
        {
          text: "SVG Graph",
          link: "/examples/#svg",
        },
        {
          text: "Modal with Transitions",
          link: "/examples/#modal",
        },
        {
          text: "List with Transitions",
          link: "/examples/#list-transition",
        },
      ],
    },
    {
      // https://eugenkiss.github.io/7guis/
      text: "7 GUIs",
      items: [
        {
          text: "Counter",
          link: "/examples/#counter",
        },
        {
          text: "Temperature Converter",
          link: "/examples/#temperature-converter",
        },
        {
          text: "Flight Booker",
          link: "/examples/#flight-booker",
        },
        {
          text: "Timer",
          link: "/examples/#timer",
        },
        {
          text: "CRUD",
          link: "/examples/#crud",
        },
        {
          text: "Circle Drawer",
          link: "/examples/#circle-drawer",
        },
        {
          text: "Cells",
          link: "/examples/#cells",
        },
      ],
    },
  ],
  "/style-guide/": [
    {
      text: "Style Guide",
      items: [
        {
          text: "Overview",
          link: "/style-guide/",
        },
        {
          text: "A - Essential",
          link: "/style-guide/rules-essential",
        },
        {
          text: "B - Strongly Recommended",
          link: "/style-guide/rules-strongly-recommended",
        },
        {
          text: "C - Recommended",
          link: "/style-guide/rules-recommended",
        },
        {
          text: "D - Use with Caution",
          link: "/style-guide/rules-use-with-caution",
        },
      ],
    },
  ],
  "/works": [],
  "/work": [
    {
      text: "版本工作",
      items: [
        { text: "202412版本", link: "/work/202412.md" },
        { text: "202501版本", link: "/work/202501.md" },
        { text: "202502版本", link: "/work/202502.md" },
        { text: "202503版本", link: "/work/202503.md" },
        { text: "202504版本", link: "/work/202504.md" },
        { text: "202505版本", link: "/work/202505.md" },
      ],
    },
  ],
};

export default defineConfigWithTheme<ThemeConfig>({
  extends: baseConfig,
  sitemap: {
    hostname: "http://localhost:5999/",
  },
  lang: "zh-CN",
  title: "遥遥领先", // '郭靖飞的小站',
  description: "aa",
  srcDir: "src",
  head: [
    ["meta", { name: "theme-color", content: "#3c8772" }],
    ["meta", { property: "og:url", content: "https://vuejs.org/" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:title", content: "啊" }],
    [
      "meta",
      {
        property: "og:description",
        content: "Vue.js - The Progressive JavaScript Framework",
      },
    ],
    [
      "meta",
      {
        property: "og:image",
        content: "https://vuejs.org/images/logo.png",
      },
    ],
    [
      "link",
      {
        rel: "preconnect",
        href: "https://automation.vuejs.org",
      },
    ],
  ],
  themeConfig: {
    nav,
    sidebar,
    localeLinks: [
      {
        link: "https://cn.vuejs.org",
        text: "简体中文",
        repo: "https://github.com/vuejs-translations/docs-zh-cn",
      },
    ],
    footer: {
      license: {
        text: "MIT License",
        link: "https://opensource.org/licenses/MIT",
      },
      copyright: `Copyright © 9999-${new Date().getFullYear()} g30057461`,
    },
  },

  markdown: {
    theme: "github-dark",
    config(md) {
      md.use(headerPlugin);
    },
  },

  vite: {
    define: {
      __VUE_OPTIONS_API__: false,
    },
    optimizeDeps: {
      include: ["localforage"],
    },
    ssr: { external: ["@vue/repl"] },
    server: { host: true, fs: { allow: ["../.."] } },
    build: { chunkSizeWarningLimit: Infinity },
    json: { stringify: true },
    resolve: {
      alias: {
        "@assets": path.resolve(__dirname, "../assets/"),
      },
    },
  },
});
