import { h, App } from "vue";
import { VPTheme } from "@vue/theme";
import title from "./components/title.vue";
import "@assets/style/root.css";
import "@assets/style/doc.css";

export default Object.assign({}, VPTheme, {
  Layout: () => {
    // @ts-ignore
    return h(VPTheme.Layout, null, {
      "navbar-title": () => h(title),
    });
  },
  enhanceApp({ app }: { app: App }) {},
});
