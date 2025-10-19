<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

const isDark = ref(false)

onMounted(() => {
  const html = document.documentElement
  const update = () => (isDark.value = html.classList.contains('dark'))
  update()

  const observer = new MutationObserver(update)
  observer.observe(html, { attributes: true, attributeFilter: ['class'] })

  onUnmounted(() => observer.disconnect())
})

const themeColor = computed(() => (isDark.value ? '#fff' : '#000'))
import AsciiText from "./ascii-text.vue";
import logo from "@theme/components/logo.vue";
</script>

<template>
  <div class="my-text">
    <AsciiText
      class="my-text-ascii"
      text="otadk.github.io"
      :text-color="themeColor"
      :ascii-font-size="6"
      :text-font-size="100"
      :plane-base-height="4"
      :enableWaves="false"
    />
    <div class="my-text-append"></div>
    <div class="my-text-content">
      <logo :size="200" />
      <div class="my-text-description">
        <div>otadk.github.io</div>
        <div>a personal website from Jingfei Guo</div>
        <br />
        <div>This page is created from</div>
        <a
          href="https://vue-bits.dev/text-animations/ascii-text"
          target="_blank"
          rel="noopener noreferrer"
          class="my-text-link"
        >
          https://vue-bits.dev/text-animations/ascii-text
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.my-text {
  height: calc(100vh - 123px);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.my-text-ascii {
  width: 100vw;
  aspect-ratio: 16 / 9;
  flex-shrink: 0;
}

.my-text-append {
  flex-grow: 1;
}

.my-text-content {
  margin: 24px;
  display: flex;
  justify-content: center;
  z-index: 2;
}

.my-text-description {
  align-content: center;
}

.my-text-link {
  transition: opacity 0.3s ease-in-out;
}

.my-text-link:hover {
  opacity: 0.6;
}
</style>
