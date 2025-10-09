// import './styles/index.css'
import { h, App } from "vue";
import { VPTheme } from "@vue/theme";
import title from "./components/title.vue";
import "@assets/style/root.css";
import "@assets/style/doc.css";
// import TextAd from './components/TextAd.vue'

export default Object.assign({}, VPTheme, {
  Layout: () => {
    // @ts-ignore
    return h(VPTheme.Layout, null, {
      "navbar-title": () => h(title),
      // banner: () => h(Banner),
      // 'sidebar-top': () => h(PreferenceSwitch),
      // 'sidebar-bottom': () => h(SecurityUpdateBtn),
      // 'aside-mid': () => h(SponsorsAside)
    });
  },
  enhanceApp({ app }: { app: App }) {
    // app.provide('prefer-composition', preferComposition)
    // app.provide('prefer-sfc', preferSFC)
    // app.provide('filter-headers', filterHeadersByPreference)
    // app.component('VueSchoolLink', VueSchoolLink)
    // app.component('TextAd', TextAd)
  },
});
