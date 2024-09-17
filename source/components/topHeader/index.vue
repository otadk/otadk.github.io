<template>
  <div class="card">
    <div>otadk.github.io</div>
  </div>
</template>

<style scoped>
.card {
  position: relative;
  box-sizing: border-box;
  left: 10%;
  margin: 24px 0 24px 0;
  width: 80%;
  height: 32px;
  background: rgba(217, 217, 217, 0.58);
  border: 1px solid white;
  box-shadow: 12px 17px 51px rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(6px);
  border-radius: 17px;
  text-align: center;
  transition: all 0.5s;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  font-weight: bolder;
  color: black;
}

.card:hover {
  border: 1px solid black;
  transform: scale(1.05);
}

.card:active {
  transform: scale(0.95) rotateZ(1.7deg);
}
</style>
