<script setup lang="ts">
import { computed, ref } from "vue";
import Logo from "@theme/components/logo.vue";

const palette = ref({
  accent: "#a78bfa",
  accent2: "#22d3ee",
  glow: "#67e8f9",
  background:
    "radial-gradient(circle at 35% 25%, rgba(103, 232, 249, 0.25), transparent 45%), radial-gradient(circle at 70% 35%, rgba(167, 139, 250, 0.25), transparent 45%), linear-gradient(135deg, #0b1224, #0f172a 60%, #0b1224)",
});

const gradientId = computed(
  () =>
    `fx-gradient-${(palette.value.accent + palette.value.accent2).replace(
      /[^a-zA-Z0-9]/g,
      ""
    )}`
);
const glowId = computed(
  () =>
    `fx-glow-${(palette.value.glow + palette.value.accent).replace(
      /[^a-zA-Z0-9]/g,
      ""
    )}`
);
</script>

<template>
  <div class="hero-page">
    <div class="hero-bg" :style="{ background: palette.background }"></div>
    <div class="hero-noise"></div>
    <div class="hero-glow"></div>

    <svg class="hero-svg" viewBox="0 0 1400 520" aria-label="Reactive FX hero">
      <defs>
        <linearGradient :id="gradientId" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" :stop-color="palette.accent" stop-opacity="1" />
          <stop offset="50%" :stop-color="palette.accent2" stop-opacity="0.9">
            <animate
              attributeName="offset"
              values="0.35;0.65;0.35"
              dur="6s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" :stop-color="palette.accent" stop-opacity="1" />
        </linearGradient>
        <filter :id="glowId" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur :stdDeviation="26" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.7 0"
          />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="grid-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="rgba(255,255,255,0)" />
          <stop offset="50%" stop-color="rgba(255,255,255,0.4)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0)" />
        </linearGradient>
        <filter id="textRipple" x="-20%" y="-30%" width="140%" height="160%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.01 0.02"
            numOctaves="2"
            seed="3"
            result="rippleNoise"
          >
            <animate
              attributeName="baseFrequency"
              values="0.008 0.02;0.012 0.03;0.008 0.02"
              dur="5s"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap
            in="SourceGraphic"
            in2="rippleNoise"
            scale="6"
            xChannelSelector="R"
            yChannelSelector="B"
          />
        </filter>
      </defs>

      <g class="text-layer" :filter="`url(#${glowId})`">
        <g filter="url(#textRipple)">
          <text
            class="text-back"
            x="50%"
            y="46%"
            text-anchor="middle"
            dominant-baseline="middle"
          >
            OTADK
          </text>
          <text
            class="text-front"
            x="50%"
            y="54%"
            text-anchor="middle"
            dominant-baseline="middle"
            :fill="`url(#${gradientId})`"
          >
            OTADK
          </text>
        </g>
      </g>

      <text class="tagline" text-anchor="middle">
        <tspan x="50%" y="80%">
          Origins · Transformation · Architecture· Depth · Kinesis
        </tspan>
      </text>
    </svg>

    <div class="tagline-html" aria-hidden="true">
      <span>Origins · Transformation · Architecture</span>
      <span>· Depth · Kinesis</span>
    </div>

    <div class="hero-footer">
      <Logo :size="120" />
      <div class="hero-meta">
        <h1>OTADK — a vision of digital becoming</h1>
        <p class="hero-desc">
          Origins of concepts, transformation through algorithms, architecture
          shaping interaction, depth in meaning and intelligence, and kinesis —
          movement and life within the digital realm.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero-page {
  position: relative;
  height: calc(100vh - 130px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 16px;
  overflow: hidden;
  background: var(--vt-c-bg-soft);
}

.hero-bg,
.hero-noise,
.hero-glow {
  position: absolute;
  inset: 0;
  border-radius: 28px;
}

.hero-bg {
  filter: saturate(1.1);
}

.hero-noise {
  background-image: repeating-linear-gradient(
      0deg,
      rgba(255, 255, 255, 0.04) 0px,
      rgba(255, 255, 255, 0.04) 1px,
      transparent 1px,
      transparent 3px
    ),
    repeating-linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.03) 0px,
      rgba(255, 255, 255, 0.03) 1px,
      transparent 1px,
      transparent 3px
    );
  mix-blend-mode: screen;
  opacity: 0.5;
}

.hero-glow {
  background: radial-gradient(
    circle at 30% 30%,
    rgba(255, 255, 255, 0.12),
    transparent 40%
  );
  filter: blur(40px);
  opacity: 0.6;
}

.hero-svg {
  width: min(1200px, 100%);
  height: clamp(320px, 70vh, 520px);
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.2);
  z-index: 1;
}

.grid line {
  opacity: 0.35;
}

.streaks rect {
  fill: rgba(255, 255, 255, 0.28);
  mix-blend-mode: screen;
}
.streaks rect:nth-child(1) {
  --i: 1;
}
.streaks rect:nth-child(2) {
  --i: 2;
}
.streaks rect:nth-child(3) {
  --i: 3;
}
.streaks rect:nth-child(4) {
  --i: 4;
}
.streaks rect:nth-child(5) {
  --i: 5;
}
.streaks rect:nth-child(6) {
  --i: 6;
}
.streaks rect:nth-child(7) {
  --i: 7;
}
.streaks rect:nth-child(8) {
  --i: 8;
}

.text-layer {
  mix-blend-mode: screen;
}

.text-back {
  font-family: "Space Grotesk", "Inter", system-ui;
  font-size: clamp(120px, 18vw, 200px);
  fill: transparent;
  stroke: rgba(255, 255, 255, 0.45);
  stroke-width: 6px;
  opacity: 0.65;
}

.text-front {
  font-family: "Space Grotesk", "Inter", system-ui;
  font-size: clamp(120px, 18vw, 200px);
  font-weight: 800;
  letter-spacing: 4px;
  fill-opacity: 1;
  filter: drop-shadow(0 0 16px rgba(0, 0, 0, 0.5));
}

.tagline {
  font-family: "Space Mono", "Fira Code", monospace;
  fill: rgba(255, 255, 255, 0.78);
  font-size: clamp(16px, 4vw, 24px);
  letter-spacing: 1.5px;
  opacity: 0.8;
}

.hero-footer {
  position: relative;
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 18px;
  z-index: 1;
  color: rgba(255, 255, 255, 1);
}

.hero-meta h1 {
  margin: 6px 0 8px;
  font-size: clamp(20px, 4vw, 32px);
}

.hero-desc {
  max-width: 640px;
  line-height: 1.5;
}

.dark .hero-page {
  background: var(--vt-c-bg);
}

.dark .grid line {
  opacity: 0.22;
}

@media (max-width: 960px) {
  .hero-page {
    padding: 12px;
  }

  .hero-svg {
    height: clamp(300px, 60vh, 460px);
  }

  .hero-footer {
    flex-direction: column;
    text-align: center;
  }

  .hero-meta h1 {
    font-size: clamp(18px, 5vw, 28px);
  }

  .hero-desc {
    max-width: 90vw;
  }
}

@media (max-width: 640px) {
  .hero-svg {
    height: clamp(280px, 55vh, 400px);
  }

  .hero-meta h1 {
    letter-spacing: 0.5px;
  }

  .tagline {
    display: none;
  }
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

@keyframes pageFade {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bgFlow {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.04) translate(1%, -1%);
  }
}

@keyframes glowPulse {
  0% {
    opacity: 0.4;
    transform: scale(1);
  }
  100% {
    opacity: 0.8;
    transform: scale(1.07);
  }
}

@keyframes noiseShift {
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(-12px, -8px, 0);
  }
}

@keyframes heroFloat {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes streak {
  0% {
    transform: translateX(-30%);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 0.5;
  }
  100% {
    transform: translateX(140%);
    opacity: 0;
  }
}

:deep(.logo) {
  color: #fff;
}
</style>
