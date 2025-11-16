<script setup lang="ts">
interface Props {
  size?: number;
}

const props = withDefaults(defineProps<Props>(), {
  size: 32,
});
</script>

<template>
  <svg
    class="logo"
    :width="props.size"
    :height="props.size"
    viewBox="0 0 200 200"
  >
    <path
      d="M85,190 A51,110 -5 0,1 126,22 A70,50 0 0,0 108,94 A120,120 0 0,1 85,190"
      fill="currentColor"
      stroke="currentColor"
      stroke-width="1"
    />
    <path
      id="textPath"
      d="M112,98 A120,120 0 0,1 89,194"
      fill="none"
      stroke="none"
    />
    <text font-size="11" fill="currentColor" font-style="italic">
      <textPath xlink:href="#textPath" startOffset="7%">
        otadk.github.io
      </textPath>
    </text>
  </svg>
</template>

<style scoped>
.logo {
  color: var(--logo-color);
  transition: color 0.3s ease-in-out;
}
</style>
