import { defineConfigWithTheme } from "vitepress";
import type { Config as ThemeConfig } from "@vue/theme";
import baseConfig from "@vue/theme/config";
import { headerPlugin } from "./headerMdPlugin";
import path from "path";

const nav: ThemeConfig["nav"] = [
  {
    text: "works",
    activeMatch: `^/works/`,
    items: [
      { text: "Vue Bits Ascii Text", link: "/works/vue-bits-ascii-text" },
    ],
  },
  {
    text: "tools",
    activeMatch: `^/tools/`,
    items: [
      { text: "Svg Editor", link: "/tools/svg-editor" },
      { text: "Px to rem", link: "/tools/px-rem" },
    ],
  },
  {
    text: "blog",
    activeMatch: `^/blogs/`,
    items: [
      {
        text: "Restarting the Journey: Notes on Rebuilding My Personal Website",
        link: "/blogs/restarting-the-journey",
      },
    ],
  },
];

export default defineConfigWithTheme<ThemeConfig>({
  extends: baseConfig,
  sitemap: {
    hostname: "https://otadk.github.io/",
  },
  lang: "en",
  title: "otadk.github.io",
  description: "otadk.github.io - a personal website from Jingfei Guo",
  srcDir: "src",
  head: [
    ["meta", { name: "theme-color", content: "#3c8772" }],
    ["meta", { property: "og:url", content: "https://otadk.github.io/" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:title", content: "otadk.github.io" }],
    [
      "meta",
      {
        property: "og:description",
        content: "otadk.github.io - a personal website from Jingfei Guo",
      },
    ],
    [
      "meta",
      {
        property: "og:image",
        content: "https://otadk.github.io/images/logo.png",
      },
    ],
  ],
  themeConfig: {
    nav,
    // 未来用侧边栏 sidebar,
    // 未来建设中文网站
    // localeLinks: [
    //   {
    //     link: "http://localhost:5999/zh-CN/index",
    //     text: "简体中文",
    //     repo: "https://github.com/vuejs-translations/docs-zh-cn",
    //   },
    //   {
    //     link: "http://localhost:5999/en-US",
    //     text: "English",
    //     repo: "https://github.com/vuejs-translations/docs-zh-cn",
    //   },
    // ],

    socialLinks: [
      { icon: "github", link: "https://github.com/otadk/otadk.github.io" },
    ],
    footer: {
      license: {
        text: "MIT License",
        link: "https://opensource.org/licenses/MIT",
      },
      // 未来会有版权的 copyright: `Copyright © 9999-${new Date().getFullYear()} g30057461`,
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
