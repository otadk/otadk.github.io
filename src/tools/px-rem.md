---
title: Divide by 16 Tool
---

# Divide by 16 (Realtime) - (px -> rem)

This interface has two boxes: the left one is for entering a number, and the right one shows the number divided by 16 (updates in real-time).

<!-- Vue SFC -->
<div class="wrapper">
  <div class="box">
    <label for="num" class="label">Enter Number</label>
    <input
      id="num"
      type="number"
      inputmode="decimal"
      v-model="input"
      @input="onInput"
      placeholder="Enter a number here (supports decimals/negative numbers)"
      class="input"
    />
    <p class="hint">Supports integer or decimal. Empty input will not show a result.</p>
  </div>

  <div class="box result-box" aria-live="polite">
    <label class="label">Result Divided by 16</label>
    <div class="result">
      <template v-if="inputTrimmed === ''">
        — (please enter a number)
      </template>
      <template v-else-if="!isValidNumber">
        Invalid number
      </template>
      <template v-else>
        <div class="value">{{ formattedResult }}</div>
        <div class="raw">(Raw: {{ rawResult }})</div>
        <button class="copy-btn" @click="copyResult" :disabled="!isValidNumber">
          Copy Result
        </button>
        <span v-if="copied" class="copied">Copied ✅</span>
      </template>
    </div>
  </div>
</div>

<script setup>
import { ref, computed } from 'vue'

const input = ref('')
const copied = ref(false)

const inputTrimmed = computed(() => (input.value === null ? '' : String(input.value).trim()))

const parsed = computed(() => {
  if (inputTrimmed.value === '') return NaN
  const v = parseFloat(inputTrimmed.value)
  return Number.isFinite(v) ? v : NaN
})

const isValidNumber = computed(() => Number.isFinite(parsed.value))

const rawResult = computed(() => {
  if (!isValidNumber.value) return ''
  return parsed.value / 16
})

// Format result (up to 6 decimal places, remove trailing zeros)
function formatNumber(v) {
  if (!Number.isFinite(v)) return ''
  return v.toFixed(6).replace(/\.?0+$/, '')
}

const formattedResult = computed(() => (isValidNumber.value ? formatNumber(rawResult.value) : ''))

function onInput() {
  copied.value = false
}

// Copy to clipboard (Clipboard API with fallback)
async function copyResult() {
  if (!isValidNumber.value) return
  const text = formattedResult.value
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch (err) {
    console.error('Copy failed', err)
  }
}
</script>

<style scoped>
.wrapper {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  margin-top: 12px;
  flex-wrap: wrap;
}

.box {
  background: #0b1220;
  color: #fff;
  padding: 18px;
  border-radius: 12px;
  width: 320px;
  box-shadow: 0 6px 18px rgba(2,8,23,0.5);
}

.result-box {
  width: 340px;
  background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
  border: 1px solid rgba(255,255,255,0.04);
}

.label {
  display: block;
  font-weight: 700;
  margin-bottom: 8px;
  font-size: 14px;
  color: #dfefff;
}

.input {
  width: 100%;
  padding: 10px 12px;
  font-size: 16px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.02);
  color: #ffffff;
  outline: none;
}

.input:focus {
  box-shadow: 0 0 0 4px rgba(121, 163, 255, 0.08);
  border-color: rgba(121, 163, 255, 0.6);
}

.hint {
  margin-top: 8px;
  font-size: 12px;
  color: #9fb7ff;
}

.result {
  min-height: 86px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  justify-content: center;
}

.value {
  font-size: 28px;
  font-weight: 800;
  color: #f3f9ff;
  letter-spacing: 0.4px;
}

.raw {
  font-size: 12px;
  color: #9fb7ff;
}

.copy-btn {
  margin-top: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(90deg,#6fa9cc,#7bc6ff);
  color: #06203b;
  font-weight: 700;
  cursor: pointer;
}

.copy-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.copied {
  margin-left: 10px;
  color: #9eff9a;
  font-weight: 700;
}
</style>
