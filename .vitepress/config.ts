import { defineConfigWithTheme } from "vitepress";
import type { Config as ThemeConfig } from "@vue/theme";
import baseConfig from "@vue/theme/config";
import { headerPlugin } from "./headerMdPlugin";
import { demoContainerPlugin } from "./demoContainerPlugin";
import path from "path";

const nav: ThemeConfig["nav"] = [
  {
    text: "works",
    activeMatch: `^/works/`,
    items: [
      { text: "Starter", link: "/works/starter" },
      { text: "Greedy Snake", link: "/works/greedy-snake" },
      { text: "Dreams", link: "/works/dreams" },
    ],
  },
  {
    text: "tools",
    activeMatch: `^/tools/`,
    items: [
      { text: "Svg Editor", link: "/tools/svg-editor" },
      { text: "Px to rem", link: "/tools/px-rem" },
      {
        text: "daily",
        activeMatch: `/tools/daily`,
        items: [
          { text: 'daily', link: 'tools/daily' },
          { text: 'daily overview', link: 'tools/daily/overview' },
        ]
      }
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
      {
        text: "Building the Foundation: From Structure to Vision",
        link: "/blogs/building-the-foundation",
      },
      {
        text: "Crafting the Next Layer: Aesthetics, Automation, and AI Integration",
        link: "/blogs/crafting-the-next-layer",
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
    ["meta", { name: "msvalidate.01", content: "7B3D18E49E120F96C2CB746A05E6A657" }],
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
    sidebar: {
      "/works/ui/": [
        {
          text: "My UI",
          items: [
            { text: "overview", link: "/works/ui/" },
            { text: "button discount", link: "/works/ui/button-discount" },
            { text: "button mastery 12", link: "/works/ui/button-mastery-12" },
          ],
        },
      ],
    },
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
      md.use(demoContainerPlugin);
    },
  },

  vite: {
    define: {
      __VUE_OPTIONS_API__: false,
    },
    optimizeDeps: {
      include: ["localforage"],
    },
    ssr: { noExternal: ['@vue/repl'] },
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
