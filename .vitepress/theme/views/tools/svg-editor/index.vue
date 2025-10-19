<script setup lang="ts">
/**
 * @fileoverview svg编辑器
 * 当前只能画一段弧形
 * 希望未来可以添加各种svg的形状路径
 */
import { reactive } from "vue";
import { SvgPath } from './interface';

const path = reactive<SvgPath>({
  startX: 50,
  startY: 100,
  rx: 50,
  ry: 50,
  xAxisRotation: 0,
  largeArcFlag: 0,
  sweepFlag: 1,
  x: 150,
  y: 100,
});

const generateD = (p: SvgPath) => {
  return `M${p.startX},${p.startY} A${p.rx},${p.ry} ${p.xAxisRotation} ${p.largeArcFlag},${p.sweepFlag} ${p.x},${p.y}`;
};
</script>

<template>
  <div class="container">
    <div class="control-panel">
      <h2>SVG Arc Path Editor</h2>
      <div class="path-controls">
        <div class="control-group compact">
          <h3>Start Point</h3>
          <div class="inputs compact">
            <label>
              Start X:
              <input type="number" v-model.number="path.startX" />
            </label>
            <label>
              Start Y:
              <input type="number" v-model.number="path.startY" />
            </label>
          </div>
        </div>

        <div class="control-group compact">
          <h3>Ellipse Parameters</h3>
          <div class="inputs compact">
            <label>
              Radius X:
              <input type="number" v-model.number="path.rx" min="1" />
            </label>
            <label>
              Radius Y:
              <input type="number" v-model.number="path.ry" min="1" />
            </label>
            <label>
              X-Axis Rotation:
              <input type="number" v-model.number="path.xAxisRotation" />
            </label>
          </div>
        </div>

        <div class="control-group compact">
          <h3>Arc Flags</h3>
          <div class="inputs compact">
            <label>
              Large Arc Flag:
              <select v-model.number="path.largeArcFlag">
                <option :value="0">0 (Small arc)</option>
                <option :value="1">1 (Large arc)</option>
              </select>
            </label>
            <label>
              Sweep Flag:
              <select v-model.number="path.sweepFlag">
                <option :value="0">0 (Counter-clockwise)</option>
                <option :value="1">1 (Clockwise)</option>
              </select>
            </label>
          </div>
        </div>

        <div class="control-group compact">
          <h3>End Point</h3>
          <div class="inputs compact">
            <label>
              End X:
              <input type="number" v-model.number="path.x" />
            </label>
            <label>
              End Y:
              <input type="number" v-model.number="path.y" />
            </label>
          </div>
        </div>
      </div>
      <div class="path-preview compact">
        <h3>Path Data</h3>
        <code class="path-data">{{ generateD(path) }}</code>
      </div>
    </div>

    <div class="svg-preview">
      <h3>SVG Preview</h3>
      <svg width="400" height="400" viewBox="0 0 200 200" class="svg-container">
        <defs>
          <pattern
            id="grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="#e0e0e0"
              stroke-width="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <path
          :d="generateD(path)"
          fill="none"
          stroke="#2196F3"
          stroke-width="3"
          class="arc-path"
        />
        <circle :cx="path.startX" :cy="path.startY" r="3" fill="#4CAF50" />
        <circle :cx="path.x" :cy="path.y" r="3" fill="#F44336" />
        <line
          :x1="path.startX"
          :y1="path.startY"
          :x2="path.x"
          :y2="path.y"
          stroke="#9E9E9E"
          stroke-dasharray="2"
          stroke-width="1"
        />
        <text
          :x="path.startX + 5"
          :y="path.startY - 5"
          font-size="10"
          fill="#4CAF50"
        >
          Start
        </text>
        <text :x="path.x + 5" :y="path.y - 5" font-size="10" fill="#F44336">
          End
        </text>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.container {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
  transition: all 0.3s ease;
}

.theme-switcher {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
}

.theme-toggle {
  padding: 0.5rem 1rem;
  border: 1px solid var(--vt-c-divider-light-1);
  background: var(--vt-c-white);
  color: var(--vt-c-text-light-1);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.dark .theme-toggle {
  border-color: var(--vt-c-divider-dark-1);
  background: var(--vt-c-black-mute);
  color: var(--vt-c-text-dark-1);
}

.theme-toggle:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.control-panel {
  background: var(--vt-c-white);
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.dark .control-panel {
  background: var(--vt-c-black-mute);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.svg-preview {
  background: var(--vt-c-white);
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
}

.dark .svg-preview {
  background: var(--vt-c-black-mute);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.svg-container {
  border: 1px solid var(--vt-c-divider-light-1);
  background: var(--vt-c-white);
  margin-top: 0.5rem;
  transition: all 0.3s ease;
}

.dark .svg-container {
  border-color: var(--vt-c-divider-dark-1);
  background: var(--vt-c-black);
}

.control-group {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: var(--vt-c-white-soft);
  border-radius: 6px;
  transition: all 0.3s ease;
}

.control-group.compact {
  margin-bottom: 0.75rem;
  padding: 0.5rem;
}

.dark .control-group {
  background: var(--vt-c-gray-dark-5);
}

.control-group h3 {
  margin: 0 0 0.5rem 0;
  color: var(--vt-c-text-light-1);
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.dark .control-group h3 {
  color: var(--vt-c-text-dark-1);
}

.inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.inputs.compact {
  gap: 0.5rem;
}

label {
  display: flex;
  flex-direction: column;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--vt-c-text-light-2);
  transition: all 0.3s ease;
}

.dark label {
  color: var(--vt-c-text-dark-2);
}

input,
select {
  padding: 0.375rem;
  margin-top: 0.25rem;
  border: 1px solid var(--vt-c-divider-light-1);
  border-radius: 4px;
  font-size: 0.8rem;
  background: var(--vt-c-white);
  color: var(--vt-c-text-light-1);
  transition: all 0.3s ease;
}

.dark input,
.dark select {
  border-color: var(--vt-c-divider-dark-1);
  background: var(--vt-c-black);
  color: var(--vt-c-text-dark-1);
}

input:focus,
select:focus {
  outline: none;
  border-color: var(--vt-c-blue);
  box-shadow: 0 0 0 2px rgba(59, 142, 237, 0.2);
}

.path-preview {
  margin-top: 1rem;
  padding: 0.75rem;
  background: var(--vt-c-white-soft);
  border-radius: 6px;
  transition: all 0.3s ease;
}

.path-preview.compact {
  margin-top: 0.75rem;
  padding: 0.5rem;
}

.dark .path-preview {
  background: var(--vt-c-gray-dark-5);
}

.path-data {
  display: block;
  padding: 0.5rem;
  background: var(--vt-c-white);
  border: 1px solid var(--vt-c-divider-light-1);
  border-radius: 4px;
  font-family: "Courier New", monospace;
  font-size: 0.8rem;
  word-break: break-all;
  margin-top: 0.5rem;
  color: var(--vt-c-text-light-1);
  transition: all 0.3s ease;
}

.dark .path-data {
  background: var(--vt-c-black);
  border-color: var(--vt-c-divider-dark-1);
  color: var(--vt-c-text-dark-1);
}

h2 {
  color: var(--vt-c-text-light-1);
  margin-bottom: 1rem;
  border-bottom: 2px solid var(--vt-c-blue);
  padding-bottom: 0.5rem;
  font-size: 1.25rem;
  transition: all 0.3s ease;
}

.dark h2 {
  color: var(--vt-c-text-dark-1);
}

h3 {
  color: var(--vt-c-text-light-1);
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.dark h3 {
  color: var(--vt-c-text-dark-1);
}

.arc-path {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

@media (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .inputs {
    grid-template-columns: 1fr;
  }

  .theme-switcher {
    position: relative;
    top: auto;
    right: auto;
    margin-bottom: 1rem;
    text-align: center;
  }
}

.control-panel h2 {
  font-size: 1.1rem;
  margin-bottom: 0.75rem;
}

.control-group h3 {
  font-size: 0.85rem;
  margin-bottom: 0.375rem;
}

.inputs.compact label {
  font-size: 0.75rem;
}

.inputs.compact input,
.inputs.compact select {
  padding: 0.25rem;
  font-size: 0.75rem;
}

.path-preview.compact h3 {
  margin-bottom: 0.375rem;
}
</style>
