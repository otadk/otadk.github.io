<script setup lang="ts">
const foo = Array.from({ length: 10 }, (_v, i) => ({
  y2: 20 + i * 7,
  x2: 0,
  y1: 10 + i * 7,
  x1: 10,
}));
</script>

<template>
  <div
    style="
      display: flex;
      font-size: 18px;
      margin: 32px 48px 0 48px;
      justify-content: space-between;
    "
  >
    <div>title?</div>
    <div>
      <svg width="286" height="29">
        <g>
          <line stroke="#000" y2="12" x2="2" y1="2" x1="2" stroke-width="2" />
          <line stroke="#000" y2="27" x2="17" y1="12" x1="2" stroke-width="2" />
          <line
            stroke="#000"
            y2="12"
            x2="32"
            y1="27"
            x1="17"
            stroke-width="2"
          />
          <line stroke="#000" y2="2" x2="32" y1="12" x1="32" stroke-width="2" />
          <line stroke="#000" y2="2" x2="22" y1="2" x1="32" stroke-width="2" />
          <line stroke="#000" y2="2" x2="12" y1="2" x1="2" stroke-width="2" />
          <line
            stroke="#000"
            y2="17.5"
            x2="27.5"
            y1="2"
            x1="12"
            stroke-width="2"
          />
          <line
            stroke="#000"
            y2="17.5"
            x2="7.5"
            y1="2"
            x1="22"
            stroke-width="2"
          />
          <line stroke="#000" y2="25" x2="47" y1="5" x1="67" stroke-width="2" />
          <line stroke="#000" y2="25" x2="52" y1="5" x1="72" stroke-width="2" />
          <line stroke="#000" y2="25" x2="57" y1="5" x1="77" stroke-width="2" />
          <line stroke="#000" y2="5" x2="284" y1="5" x1="77" stroke-width="2" />
        </g>
      </svg>
    </div>
  </div>
  <div>
    <svg width="720" height="800" style="margin-left: 20%; margin-top: 24px">
      <line stroke="#000" y2="500" x2="5" y1="5" x1="5" stroke-width="2" />
      <line
        v-for="{ x1, x2, y1, y2 } of foo"
        stroke="#000"
        :y2="y2"
        :x2="x2"
        :y1="y1"
        :x1="x1"
        stroke-width="2"
      />
    </svg>
  </div>
</template>

<style>
* {
  padding: 0;
  margin: 0;
}
</style>
