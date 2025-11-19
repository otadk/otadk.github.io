---
title: button discount 
---

<div class="container">
  <div class="tag">10% off discount</div>
  <div class="button">Buy Now</div>
</div>

<style scoped>
.container {
  position: relative;
  width: max-content;
}

.tag {
  position: absolute;
  right: -4px;
  top: -10px;
  align-items: center;
  color: rgb(17, 90, 83);
  display: inline-flex;
  font-size: 12px;
  font-weight: 700;
  justify-content: center;
  z-index: 10;
  background: linear-gradient(
    92deg,
    rgb(255, 255, 255) -0.13%,
    rgb(206, 255, 243),
    rgb(158, 239, 255) 99.79%
  );
  border-radius: 8px 8px 0px;
  gap: 10px;
  padding: 4px 12px;
  user-select: none;
}

.button {
  align-items: center;
  color: #000;
  cursor: pointer;
  display: flex;
  font-size: 16px;
  font-weight: 600;
  justify-content: center;
  background: linear-gradient(135deg, #1a9bff 0%, #47bfff 50%, #90e0ff 100%);
  border-radius: 6px;
  padding: 16px 72px;
  transition: 0.25s ease;
  user-select: none;
  position: relative;
  overflow: hidden;
}

.button:hover {
  filter: brightness(1.12);
  box-shadow: 0 0 18px rgba(71, 191, 255, 0.45);
}

.button::after {
  content: "";
  position: absolute;
  top: 0;
  left: -150%;
  width: 150%;
  height: 100%;
  background: linear-gradient(
    120deg,
    rgba(255, 255, 255, 0) 20%,
    rgba(255, 255, 255, 0.3) 50%,
    rgba(255, 255, 255, 0) 80%
  );
  transition: 0.4s ease;
  pointer-events: none;
}

.button:hover::after {
  left: 100%;
}

.button:active {
  filter: brightness(0.95);
}

@keyframes tagShake {
  0% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-2px);
  }
  50% {
    transform: translateX(0px);
  }
  75% {
    transform: translateX(-2px);
  }
  100% {
    transform: translateX(0);
  }
}

.container:hover .tag {
  animation: tagShake 1s ease-in-out infinite;
}
</style>

``` html
<div class="container">
  <div class="tag">10% off discount</div>
  <div class="button">Buy Now</div>
</div>
```

``` css
.container {
  position: relative;
  width: max-content;
}

.tag {
  position: absolute;
  right: -4px;
  top: -10px;
  align-items: center;
  color: rgb(17, 90, 83);
  display: inline-flex;
  font-size: 12px;
  font-weight: 700;
  justify-content: center;
  z-index: 10;
  background: linear-gradient(
    92deg,
    rgb(255, 255, 255) -0.13%,
    rgb(206, 255, 243),
    rgb(158, 239, 255) 99.79%
  );
  border-radius: 8px 8px 0px;
  gap: 10px;
  padding: 4px 12px;
  user-select: none;
}

.button {
  align-items: center;
  color: #000;
  cursor: pointer;
  display: flex;
  font-size: 16px;
  font-weight: 600;
  justify-content: center;
  background: linear-gradient(135deg, #1a9bff 0%, #47bfff 50%, #90e0ff 100%);
  border-radius: 6px;
  padding: 16px 72px;
  transition: 0.25s ease;
  user-select: none;
  position: relative;
  overflow: hidden;
}

.button:hover {
  filter: brightness(1.12);
  box-shadow: 0 0 18px rgba(71, 191, 255, 0.45);
}

.button::after {
  content: "";
  position: absolute;
  top: 0;
  left: -150%;
  width: 150%;
  height: 100%;
  background: linear-gradient(
    120deg,
    rgba(255, 255, 255, 0) 20%,
    rgba(255, 255, 255, 0.3) 50%,
    rgba(255, 255, 255, 0) 80%
  );
  transition: 0.4s ease;
  pointer-events: none;
}

.button:hover::after {
  left: 100%;
}

.button:active {
  filter: brightness(0.95);
}

@keyframes tagShake {
  0% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-2px);
  }
  50% {
    transform: translateX(0px);
  }
  75% {
    transform: translateX(-2px);
  }
  100% {
    transform: translateX(0);
  }
}

.container:hover .tag {
  animation: tagShake 1s ease-in-out infinite;
}
```