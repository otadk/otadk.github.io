<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import DreamCard from "./card.vue";

interface DreamPayload {
  id?: number;
  title: string;
  description: string;
  current?: boolean;
}

interface Dream {
  id: number;
  title: string;
  description: string;
  current: boolean;
}

const dreams = ref<Dream[]>([]);
const isLoading = ref(true);
const loadError = ref<string | null>(null);

const accentPalette = [
  "#8C6FF7",
  "#FF6B81",
  "#27B4A8",
  "#FFB347",
  "#4D9CFF",
  "#B76BF5",
];

const fetchDreams = async () => {
  try {
    const res = await fetch("/json/dream.json");
    if (!res.ok) throw new Error("Unable to fetch the dream list");
    const payload: DreamPayload[] = await res.json();
    dreams.value = payload.map((dream, index) => ({
      id: dream.id ?? index + 1,
      title: dream.title,
      description: dream.description,
      current: Boolean(dream.current),
    }));
  } catch (err) {
    console.error("failed to load dreams:", err);
    loadError.value = "Something went wrong, try refreshing?";
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchDreams);

const totalDreams = computed(() => dreams.value.length);
const heroHighlights = computed(() =>
  dreams.value.filter((dream) => dream.current).map((dream) => dream.title)
);

const getAccentByIndex = (index: number) =>
  accentPalette[index % accentPalette.length];
</script>

<template>
  <div class="dream-page">
    <section class="dream-hero">
      <div class="hero-content">
        <p class="hero-pill">Personal dream log</p>
        <h1>Writing your dreams down brings you a little closer to them.</h1>
        <p class="hero-subtitle">
          This is a public dream wall, recording {{ totalDreams }} ideas that are being seriously pursued. Leave them on the page to remind yourself not to forget your original intentions.
        </p>

        <div class="hero-stats">
          <div class="stat-card">
            <span class="stat-label">Total Dreams</span>
            <strong class="stat-value">{{ totalDreams }}</strong>
          </div>
          <div class="stat-card">
            <span class="stat-label">Currently focusing</span>
            <div class="hero-tags">
              <span
                v-for="dream in heroHighlights"
                :key="dream"
                class="hero-tag"
              >
                {{ dream }}
              </span>
              <span v-if="!heroHighlights.length" class="hero-tag muted">
                Record loading...
              </span>
            </div>
          </div>
          <div class="stat-card">
            <span class="stat-label">Update frequency</span>
            <span class="stat-value text">{{ heroHighlights.length ? "Continuously updating" : "In preparation" }}</span>
          </div>
        </div>
      </div>
      <div class="hero-visual">
        <div class="glow"></div>
        <div class="hero-bubble">Dream big</div>
      </div>
    </section>

    <section class="dream-section">
      <header class="section-header">
        <div>
          <p class="section-eyebrow">Dream board</p>
          <h2>Every dream, open and transparent</h2>
          <p class="section-subtitle">
            Cross each one off once it's done, then add a new dream. Stay grounded and romantic.
          </p>
        </div>
        <button class="section-button" @click="fetchDreams">
          Refresh list
        </button>
      </header>

      <div class="dream-grid" v-if="!isLoading && !loadError">
        <DreamCard
          v-for="(dream, index) in dreams"
          :key="dream.id"
          :dream="dream"
          :accent="getAccentByIndex(index)"
        />
      </div>

      <div v-else class="state-block">
        <p v-if="isLoading" class="state-text">Collecting dreams...</p>
        <div v-else class="state-error">
          <p>{{ loadError }}</p>
          <button @click="fetchDreams">Try again</button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.dream-page {
  min-height: 100vh;
  padding: clamp(32px, 5vw, 72px) clamp(20px, 6vw, 120px);
  font-family: "Inter", "PingFang SC", "Microsoft YaHei", sans-serif;
  background: radial-gradient(
      circle at 10% 20%,
      rgba(140, 111, 247, 0.25),
      transparent 45%
    ),
    radial-gradient(
      circle at 90% 10%,
      rgba(255, 107, 129, 0.2),
      transparent 40%
    ),
    #f7f7fb;
  color: #1f1f2b;
  transition: background 0.3s ease, color 0.3s ease;
}

.dark .dream-page {
  background: radial-gradient(
      circle at 15% 20%,
      rgba(99, 102, 241, 0.25),
      transparent 45%
    ),
    radial-gradient(
      circle at 85% 10%,
      rgba(248, 113, 113, 0.2),
      transparent 40%
    ),
    #080912;
  color: #f4f6ff;
}

.dream-hero {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: clamp(32px, 4vw, 72px);
  padding: clamp(32px, 5vw, 60px);
  background: rgba(255, 255, 255, 0.85);
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 45px 100px rgba(112, 128, 176, 0.25);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(14px);
}

.dark .dream-hero {
  background: rgba(20, 22, 30, 0.75);
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 35px 80px rgba(0, 0, 0, 0.65);
}

.hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.hero-pill {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #7f7f98;
}

.dark .hero-pill {
  color: rgba(255, 255, 255, 0.75);
}

.hero-content h1 {
  font-size: clamp(26px, 4vw, 42px);
  line-height: 1.2;
  margin: 0;
  color: inherit;
}

.hero-subtitle {
  font-size: 16px;
  line-height: 1.6;
  color: #4c4c69;
}

.dark .hero-subtitle {
  color: rgba(255, 255, 255, 0.75);
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 18px;
  margin-top: 16px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.65);
  border-radius: 16px;
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
}

.dark .stat-card {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 35px rgba(0, 0, 0, 0.45);
}

.stat-label {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #85859b;
}

.dark .stat-label {
  color: rgba(255, 255, 255, 0.6);
}

.stat-value {
  display: block;
  margin-top: 12px;
  font-size: 32px;
  font-weight: 600;
  color: #1f1f2b;
}

.stat-value.text {
  font-size: 18px;
  text-transform: none;
}

.dark .stat-value {
  color: #f4f6ff;
}

.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.hero-tag {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  background: rgba(76, 125, 255, 0.15);
  color: #3657d6;
}

.hero-tag.muted {
  opacity: 0.6;
}

.dark .hero-tag {
  background: rgba(255, 255, 255, 0.08);
  color: #c4d2ff;
}

.hero-visual {
  position: relative;
  min-height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.glow {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(140, 111, 247, 0.7),
    rgba(255, 107, 129, 0.5)
  );
  filter: blur(12px);
  opacity: 0.9;
}

.hero-bubble {
  position: absolute;
  padding: 14px 18px;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.8);
  color: white;
  font-size: 14px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  box-shadow: 0 15px 35px rgba(15, 23, 42, 0.3);
}

.secondary {
  top: 30px;
  right: 20px;
  background: rgba(248, 113, 113, 0.9);
}

.tertiary {
  bottom: 20px;
  left: 30px;
  background: rgba(129, 140, 248, 0.9);
}

.dark .hero-bubble {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.dream-section {
  margin-top: clamp(36px, 5vw, 64px);
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.section-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (min-width: 768px) {
  .section-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.section-eyebrow {
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.5em;
  color: #9898af;
}

.dark .section-eyebrow {
  color: rgba(255, 255, 255, 0.55);
}

.section-header h2 {
  font-size: clamp(24px, 3vw, 32px);
  margin: 6px 0;
}

.section-subtitle {
  color: #62627c;
  max-width: 420px;
}

.dark .section-subtitle {
  color: rgba(255, 255, 255, 0.65);
}

.section-button {
  align-self: flex-start;
  padding: 12px 28px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(120deg, #635bff, #ff6f91);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 18px 35px rgba(99, 91, 255, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.section-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 22px 40px rgba(99, 91, 255, 0.35);
}

.dream-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
}

.state-block {
  padding: 40px;
  border-radius: 24px;
  border: 1px dashed rgba(0, 0, 0, 0.15);
  text-align: center;
  color: inherit;
  background: rgba(255, 255, 255, 0.5);
}

.dark .state-block {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
}

.state-text {
  font-size: 16px;
  opacity: 0.8;
}

.state-error button {
  margin-top: 16px;
  padding: 12px 20px;
  border: none;
  border-radius: 999px;
  background: rgba(255, 107, 129, 0.9);
  color: #fff;
  cursor: pointer;
}
</style>
