---
title: button mastery 12
---

<button class="rainbow-btn">
  <span>Get started</span>
  <div class="icon-box">
    <span class="arrow">→</span>
  </div>
</button>

<style scoped>
  .rainbow-btn {
    display: inline-flex;
    align-items: center;
    gap: 14px;
    padding: 8px;
    background: #ffffff;
    border-radius: 16px;
    border: none;
    cursor: pointer;
    font-size: 20px;
    font-weight: 600;
    color: #333;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    transition:
      transform 0.15s ease,
      box-shadow 0.2s ease;
  }

  .rainbow-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.12);
  }

  .icon-box {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    position: relative;
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
  }

  /* 用 ::before 来画“边框”，它可以有透明度 */
  .icon-box::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 14px;
    padding: 2px; /* 边框厚度 */
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
    opacity: 1; /* ⭐ 边框透明度可以随意调 */
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }

  /* 动态渐变动画 */
  @keyframes rainbow {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  /* 箭头 */
  .arrow {
    font-size: 22px;
    color: white;
    font-weight: bold;
    margin-left: 2px;
  }
</style>
