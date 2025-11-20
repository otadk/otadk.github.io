import { h, App, onMounted } from "vue";
import { createPinia } from "pinia";
import { VPTheme } from "@vue/theme";
import title from "./components/title.vue";
import DemoBlock from "./components/demo-block.vue";
import { useRouter } from "vitepress";
import "@vue/repl/style.css";
import "@assets/style/root.css";
import "@assets/style/doc.css";


export default Object.assign({}, VPTheme, {
  Layout: () => {
    // @ts-ignore
    return h(VPTheme.Layout, null, {
      "navbar-title": () => h(title),
    });
  },
  enhanceApp({ app }: { app: App }) {
    app.use(createPinia());
    app.component("DemoBlock", DemoBlock);
  },
  setup() {
    if (typeof window !== "undefined") {
      onMounted(() => {
        const router = useRouter();
        router.onBeforeRouteChange = (to) => {
          // console.log({to})
        };
      });
    }
  },
});
