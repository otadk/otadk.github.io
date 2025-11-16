import { h, App, onMounted } from "vue";
import { createPinia } from "pinia";
import { VPTheme } from "@vue/theme";
import title from "./components/title.vue";
import "@assets/style/root.css";
import "@assets/style/doc.css";
import { useRouter } from "vitepress";

export default Object.assign({}, VPTheme, {
  Layout: () => {
    // @ts-ignore
    return h(VPTheme.Layout, null, {
      "navbar-title": () => h(title),
    });
  },
  enhanceApp({ app }: { app: App }) {
    app.use(createPinia());
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
