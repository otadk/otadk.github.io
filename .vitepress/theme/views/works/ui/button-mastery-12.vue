<template>
  <button class="rainbow-btn">
    <div class="rainbow-btn-text">Get started</div>
    <div class="rainbow-btn-icon-box">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <defs>
          <filter id="glowShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx="2"
              dy="2"
              stdDeviation="3"
              flood-color="rgba(0,0,0,0.3)"
            />
          </filter>
        </defs>
        <g filter="url(#glowShadow)">
          <path
            d="M6 16H26"
            stroke="white"
            stroke-width="3"
            stroke-linecap="round"
          />
          <path
            d="M18 8L26 16L18 24"
            stroke="white"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </g>
      </svg>
    </div>
    <div class="right-shadow"></div>
    <div class="pieces">
      <div class="piece"></div>
      <div class="piece"></div>
      <div class="piece"></div>
      <div class="piece"></div>
      <div class="piece"></div>
      <div class="piece"></div>
      <div class="piece"></div>
      <div class="piece"></div>
      <div class="piece"></div>
    </div>
  </button>
</template>

<style scoped>
.rainbow-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 14px;
  padding: 4px 4px 4px 24px;
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #ccc;
  cursor: pointer;
  font-size: 20px;
  font-weight: 600;
  overflow: visible;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.rainbow-btn:hover {
  animation: shrinkAndBack 1.2s ease forwards;
}

@keyframes shrinkAndBack {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.8);
  }
  100% {
    transform: scale(1);
  }
}

.rainbow-btn-text {
  background: linear-gradient(#888, #000);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
}

.rainbow-btn-icon-box {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: conic-gradient(
    #feb7bb,
    #ffafdc,
    #dcbafe,
    #bfc9fc,
    #5efafc,
    #6effb6,
    #92ff57,
    #ffcc43,
    #ffb8ab
  );
  border: 1px solid #bbee0b;
  box-sizing: border-box;
  z-index: 2;
}

.right-shadow {
  position: absolute;
  right: -30px;
  top: 50%;
  transform: translateY(-50%);
  width: 100px;
  height: 80px;
  border-radius: 16px;
  background: conic-gradient(
    #feb7bb,
    #ffafdc,
    #dcbafe,
    #bfc9fc,
    #5efafc,
    #6effb6,
    #92ff57,
    #ffcc43,
    #ffb8ab
  );
  filter: blur(20px);
  opacity: 0.6;
  z-index: 1;
  pointer-events: none;
}

.pieces {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  z-index: 2;
}

.rainbow-btn:hover .pieces {
  opacity: 1;
}

.piece {
  position: absolute;
  width: 14px;
  height: 14px;
  border-radius: 4px;
  background: var(--c);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  z-index: 4;
}

.rainbow-btn:hover .piece {
  animation: explode 0.6s ease-out forwards;
}

@keyframes explode {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(var(--tx), var(--ty)) scale(1);
    opacity: 0;
  }
}

.piece:nth-child(1) {
  --tx: -120px;
  --ty: -60px;
  --c: #ff7a7a;
}
.piece:nth-child(2) {
  --tx: 80px;
  --ty: -40px;
  --c: #ffd86b;
}
.piece:nth-child(3) {
  --tx: -60px;
  --ty: 50px;
  --c: #8be9fd;
}
.piece:nth-child(4) {
  --tx: 100px;
  --ty: 40px;
  --c: #50fa7b;
}
.piece:nth-child(5) {
  --tx: -140px;
  --ty: 20px;
  --c: #ffb8ab;
}
.piece:nth-child(6) {
  --tx: 120px;
  --ty: -80px;
  --c: #c792ea;
}
.piece:nth-child(7) {
  --tx: -80px;
  --ty: 90px;
  --c: #82aaff;
}
.piece:nth-child(8) {
  --tx: 60px;
  --ty: 100px;
  --c: #f7768e;
}
.piece:nth-child(9) {
  --tx: 0px;
  --ty: -120px;
  --c: #b4f9f8;
}
</style>