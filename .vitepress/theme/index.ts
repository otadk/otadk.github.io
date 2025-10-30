import { h, App, onMounted } from "vue";
import { createPinia } from "pinia";
import { VPTheme } from "@vue/theme";
import title from "./components/title.vue";
import "@assets/style/root.css";
import "@assets/style/doc.css";
import { useRouter } from 'vitepress';

export default Object.assign({}, VPTheme, {
  Layout: () => {
    // @ts-ignore
    return h(VPTheme.Layout, null, {
      "navbar-title": () => h(title),
    });
  },
  enhanceApp({ app  }: { app: App }) {
    app.use(createPinia());
  },
  setup() {
    if (typeof window !== 'undefined') {
      onMounted(() => {
        const router = useRouter()
        
        // 设置路由守卫
        router.onBeforeRouteChange = (to) => {
          console.log(to)
          // if (to !== '/target-page') {
          //   return '/target-page'
          // }
        }
        
        // // 处理初始路由
        // if (router.route.path !== '/target-page') {
        //   router.replace('/target-page')
        // }
      })
    }
  }
});
