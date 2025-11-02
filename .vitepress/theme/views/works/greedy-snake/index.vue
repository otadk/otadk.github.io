<template>
  <div v-if="started === false">
    <div class="center input-container map-size-input">
      <input
        v-model="mapSizeInput"
        id="mapSizeInput"
        placeholder="Map range 10+"
      />
    </div>
    <div class="center input-container snake-speed-input">
      <input
        v-model="snakeSpeedInput"
        id="snakeSpeedInput"
        placeholder="Speed range 0-20"
      />
    </div>
    <div class="center center-content" @click="startGame()">
      Greedy Snake Click to Start
    </div>
    <div class="center instruction-content">
      Gameplay Instructions<br />
      Use the arrow keys or W A S D to control the snake's direction — the snake
      keeps moving forward automatically.<br />
      Green - Snake head, Dark Green - Snake body, Red - Food, Purple -
      Obstacle<br />
      Dark Red - Pass-through item, Yellow - Speed-up item, Dark Blue -
      Slow-down item, Blue - Shrink-length item<br />
      After eating a pass-through item you can ignore obstacles once. As the
      game continues, speed will increase and more food will be required.<br />
      Hitting an obstacle, going out of bounds, or eating yourself will end the
      game.<br />
      The camera view can be changed with the mouse — note that left and right
      will be reversed when viewed from behind.<br />
    </div>
    <div class="center footer-content">Created by Jingfei Guo</div>
  </div>
  <div v-if="gameOver === true">
    <div class="center center-content" @click="restartGame()">
      {{ gameOverMessage }}
    </div>
  </div>
  <!-- 页面入口 -->
  <Teleport to="body">
    <div v-show="started === true && gameOver === false" ref="webgl"></div>
  </Teleport>
</template>

<script setup>
import {
  DEFAULT_MAP_SIZE,
  NODE_EMPTY_STATUS,
  NODE_SNAKE_HEAD_STATUS,
  NODE_SNAKE_BODY_STATUS,
  NODE_FOOD_STATUS,
  NODE_BLOCK_STATUS,
  NODE_CROSS_BLOCK_BUFF_STATUS,
  NODE_FAST_BUFF_STATUS,
  NODE_SLOW_BUFF_STATUS,
  NODE_CUT_LENGTH_BUFF_STATUS,
  STATUS_MATERIAL_MAP,
  UP,
  DOWN,
  DIRECTIONS,
  KEY_DIRECTIONS_MAP,
  MAX_SNAKE_SPEED,
  BLOCK_SPEED,
  BUFF_SPEED,
} from "./constant";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ref, onMounted, watch } from "vue";

const started = ref(false); // 游戏是否开始了
const gameOver = ref(false); // 游戏是否结束了
const gameOverMessage = ref("Game Over"); // 游戏结束
const mapSizeInput = ref(); // 地图大小输入
const snakeSpeedInput = ref(); // 蛇速度输入

const scene = new THREE.Scene(); // 场景
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight
); // 相机
const renderer = new THREE.WebGLRenderer({ antialias: true }); // 渲染
const interval = 100; // 渲染间隔
let mapSize = DEFAULT_MAP_SIZE; // 地图大小
let map; // 地图
const snake = []; // 蛇
let snakeSpeedLevel = 0; // 蛇速度难度系数
let snakeLevelLengthSpeedMap; // 蛇难度与蛇长度和速度的对应
let snakeSpeed; // 蛇速度，多少毫秒向前走1步
let snakeDirection = UP; // 蛇方向
let nextDirection = 9999; // 蛇下一次方向
let snakeFoodLevel = 0; // 蛇食物难度系数，当系数增大时蛇需要吃更多食物才能长大
let snakeLevelFoodMap; // 蛇难度与蛇食物要求的对应、
let hunger; // 蛇饥饿度，即还需要吃多少食物才能长大
let food; // 食物
let intervalCount = 0; // 渲染计数
const block = []; // 路障
const buff = { 5: [], 6: [], 7: [], 8: [] }; // 道具
let snakeAnimateId; // 蛇渲染计时器id，用于销毁计时器（游戏结束时）
let blockAnimateId; // 路障渲染计时器id，用于销毁计时器（游戏结束时）
let buffAnimateId; // 道具渲染计时器id，用于销毁计时器（游戏结束时）
let crossBlockCount = 0; // 穿越障碍道具计数，每吃1个道具+1，每撞1次障碍-1
let backgroundMaterial; // 背景材料，用于动态更新
let audioSource; // 背景音乐，用于关闭音乐

scene.background = new THREE.Color(0x222222); // 设置背景颜色
scene.fog = new THREE.FogExp2(0xefd1b5, 0.0025); // 设置雾化
renderer.setSize(window.innerWidth, window.innerHeight); // 设置全屏

// 获得随机可用地点，注意调用该函数必须在初始化之后
const getRandomPosition = () => {
  const possibleList = [];
  map.forEach((xMap, x) => {
    xMap.forEach((node, y) => {
      if (node.status === NODE_EMPTY_STATUS) {
        possibleList.push({ x: x, y: y });
      }
    });
  });
  // 如果没有空位可以用的话，游戏结束
  if (possibleList.length === 0) {
    endGame();
    return -1;
  }
  return possibleList[Math.floor(Math.random() * possibleList.length)];
};

// 开始设置地图
const startMap = () => {
  // 设置相机位置
  camera.position.x = (mapSize - 1) / 2;
  camera.position.y = (mapSize - 1) / 2;
  camera.position.z = mapSize * 1.3;
  controls.target.set(camera.position.x, camera.position.y, 0);

  // 设置地图
  map = Array.from({ length: mapSize }, (_, i) => {
    return Array.from({ length: mapSize }, (_, j) => {
      const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      const mesh = new THREE.Mesh(
        geometry,
        STATUS_MATERIAL_MAP[NODE_EMPTY_STATUS]
      );
      mesh.position.set(i, j, 1);
      scene.add(mesh);
      return {
        status: NODE_EMPTY_STATUS,
        mesh: mesh,
      };
    });
  });

  // 设置背景，防止玩家翻转了之后搞不清楚哪边是正面，影响左右
  // 背景材质webgl渲染参考ai生成
  const backgroundGeometry = new THREE.TorusGeometry(
    mapSize * 0.7,
    mapSize * 0.2,
    16,
    100
  );
  backgroundMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0.0 },
      colorA: { value: new THREE.Color(0xddccdd) },
      colorB: { value: new THREE.Color(0xdddddd) },
      noiseScale: { value: 1.5 }, // 噪声缩放因子
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 colorA;
      uniform vec3 colorB;
      uniform float noiseScale;
      varying vec2 vUv;

      // Simplex 噪声函数
      float noise(vec2 p) {
        return (1.0 + sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453) * 0.5;
      }

      void main() {
        vec2 noiseCoord = vUv * noiseScale;
        float noiseValue = noise(noiseCoord);

        vec3 color = mix(colorA, colorB, vUv.y + sin(time * 5.0 + vUv.x * 10.0 + noiseValue * 2.0) * 0.1);
        gl_FragColor = vec4(color, 0.95);
      }
    `,
    transparent: true,
    opacity: 0.95,
  });
  const backgroundMesh = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
  backgroundMesh.position.set(
    (mapSize - 1) / 2,
    (mapSize - 1) / 2,
    mapSize * -0.2
  );
  scene.add(backgroundMesh);

  food = getRandomPosition(); // 食物
  map[food.x][food.y].status = NODE_FOOD_STATUS;

  animate(); // 开始动画
};

// 开始设置蛇
const startSnake = () => {
  snake.push(getRandomPosition());
  if (snake[0].y >= mapSize - 3) {
    snakeDirection = DOWN; // 如果蛇在最上面要换成向下
  }
  const speedAddition = parseInt(
    snakeSpeedInput.value !== undefined ? snakeSpeedInput.value : 0
  ); // 用户输入增加速度系数
  snakeLevelLengthSpeedMap = Array.from({ length: 20 }, (_v, i) => ({
    length: Math.ceil((((i * i * 99.0) / 361 + 1) * mapSize * mapSize) / 100),
    speed: Math.max(
      MAX_SNAKE_SPEED,
      Math.ceil(4800.0 / (i + 5 + speedAddition) - 160)
    ),
  })); // 蛇难度与蛇长度和速度的对应，抛物线函数作为length增长，，双曲线函数作为speed增长
  snakeSpeed = snakeLevelLengthSpeedMap[snakeSpeedLevel].speed; // 设置蛇速度
  snakeLevelFoodMap = Array.from({ length: 3 }, (_v, i) => ({
    length: Math.ceil(((mapSize * mapSize - 1) * i) / 2.0 + 1),
    hunger: Math.ceil(i + 1),
  })); // 蛇难度与蛇食物要求的对应，线性函数作为length、hunger增长
  hunger = snakeLevelFoodMap[snakeFoodLevel].hunger; // 设置蛇饥饿
  snakeAnimate(); // 开始蛇动画计算
  blockAnimate(); // 开始路障动画计算
  buffAnimate(); // 开始道具动画计算
};

// 蛇动画计算（这里并不是真的动画渲染了，这里只是更新了map，animate执行了map更新后的效果才会被渲染）
const snakeAnimate = () => {
  // 初始时设置蛇身体
  snake.forEach(({ x, y }) => {
    map[x][y].status = NODE_SNAKE_BODY_STATUS;
  });
  map[snake[0].x][snake[0].y].status = NODE_SNAKE_HEAD_STATUS; // 初始时设置蛇头
  // 蛇动画开始，每隔speed操作一次
  snakeAnimateId = setInterval(() => {
    const firstSnakeNode = Object.assign({}, snake[0]); // 获得蛇头
    map[firstSnakeNode.x][firstSnakeNode.y].status = NODE_SNAKE_BODY_STATUS; // 之前的蛇头设为蛇身
    // 更新方向
    const directionDiff = snakeDirection - nextDirection;
    const directionValid =
      nextDirection !== 9999 && directionDiff !== 2 && directionDiff !== -2;
    if (directionValid) {
      snakeDirection = nextDirection;
      nextDirection = 9999;
    }
    // 根据方向更新蛇头
    firstSnakeNode.x += DIRECTIONS[snakeDirection] % mapSize;
    firstSnakeNode.y += DIRECTIONS[snakeDirection + 1] % mapSize;
    // 判断是否超过范围以及吃到自己
    const snakeAlive =
      firstSnakeNode.x >= 0 &&
      firstSnakeNode.y >= 0 &&
      firstSnakeNode.x < mapSize &&
      firstSnakeNode.y < mapSize &&
      map[firstSnakeNode.x][firstSnakeNode.y].status !== NODE_SNAKE_BODY_STATUS;
    if (!snakeAlive) {
      endGame();
    } else {
      // 撞障碍
      if (
        map[firstSnakeNode.x][firstSnakeNode.y].status === NODE_BLOCK_STATUS
      ) {
        crossBlockCount -= 1;
      }
      if (crossBlockCount < 0) {
        endGame();
      }
      // 判断是否吃到食物
      if (map[firstSnakeNode.x][firstSnakeNode.y].status === NODE_FOOD_STATUS) {
        food = getRandomPosition();
        map[food.x][food.y].status = NODE_FOOD_STATUS;
        hunger -= 1;
      }
      // 吃到穿越障碍道具
      if (
        map[firstSnakeNode.x][firstSnakeNode.y].status ===
        NODE_CROSS_BLOCK_BUFF_STATUS
      ) {
        crossBlockCount += 1;
      }
      // 吃到加速道具
      if (
        map[firstSnakeNode.x][firstSnakeNode.y].status ===
          NODE_FAST_BUFF_STATUS &&
        snakeSpeedLevel < 19
      ) {
        snakeSpeedLevel += 1;
        snakeSpeed = snakeLevelLengthSpeedMap[snakeSpeedLevel].speed; // 设置蛇速度
      }
      // 吃到减速道具
      if (
        map[firstSnakeNode.x][firstSnakeNode.y].status ===
          NODE_SLOW_BUFF_STATUS &&
        snakeSpeedLevel > 0
      ) {
        snakeSpeedLevel -= 1;
        snakeSpeed = snakeLevelLengthSpeedMap[snakeSpeedLevel].speed; // 设置蛇速度
      }
      // 吃到减蛇长度道具
      if (
        map[firstSnakeNode.x][firstSnakeNode.y].status ===
          NODE_CUT_LENGTH_BUFF_STATUS &&
        snake.length > 1
      ) {
        const lastSnakeNode = snake.pop();
        map[lastSnakeNode.x][lastSnakeNode.y].status = NODE_EMPTY_STATUS;
      }
      // 判断是否长大
      if (hunger <= 0) {
        hunger = snakeLevelFoodMap[snakeFoodLevel].hunger;
      } else {
        const lastSnakeNode = snake.pop();
        map[lastSnakeNode.x][lastSnakeNode.y].status = NODE_EMPTY_STATUS;
      }
      // 新蛇头设置
      map[firstSnakeNode.x][firstSnakeNode.y].status = NODE_SNAKE_HEAD_STATUS;
      snake.unshift(firstSnakeNode);
      // 更新蛇速度难度
      const snakeSpeedNextValid =
        snakeSpeedLevel < 19 &&
        snake.length >= snakeLevelLengthSpeedMap[snakeSpeedLevel + 1].length;
      if (snakeSpeedNextValid) {
        snakeSpeedLevel += 1;
        snakeSpeed = snakeLevelLengthSpeedMap[snakeSpeedLevel].speed; // 设置蛇速度
      }
      // 更新蛇食物难度
      const foodNextValid =
        snakeFoodLevel < 2 &&
        snake.length >= snakeLevelFoodMap[snakeFoodLevel + 1].length;
      if (foodNextValid) {
        snakeFoodLevel += 1;
        snakeSpeed = snakeLevelLengthSpeedMap[snakeSpeedLevel].speed; // 设置蛇速度
      }
    }
  }, snakeSpeed);
};

// 路障动画计算（这里并不是真的动画渲染了，这里只是更新了map，animate执行了map更新后的效果才会被渲染）
const blockAnimate = () => {
  blockAnimateId = setInterval(() => {
    const currentBlock = getRandomPosition();
    map[currentBlock.x][currentBlock.y].status = NODE_BLOCK_STATUS;
    block.push(currentBlock);
  }, BLOCK_SPEED);
};

// 道具动画计算（这里并不是真的动画渲染了，这里只是更新了map，animate执行了map更新后的效果才会被渲染）
const buffAnimate = () => {
  buffAnimateId = setInterval(() => {
    const buffStatus = Math.floor(
      Math.random() *
        (NODE_CUT_LENGTH_BUFF_STATUS - NODE_CROSS_BLOCK_BUFF_STATUS + 1) +
        NODE_CROSS_BLOCK_BUFF_STATUS
    );
    const currentBuff = getRandomPosition();
    map[currentBuff.x][currentBuff.y].status = buffStatus;
    buff[buffStatus].push(currentBuff);
    // 道具过3个时间后就要消除
    setTimeout(
      (currentBuff, buffStatus) => {
        if (map[currentBuff.x][currentBuff.y].status === buffStatus) {
          map[currentBuff.x][currentBuff.y].status = NODE_EMPTY_STATUS;
        }
      },
      BUFF_SPEED * 3,
      currentBuff,
      buffStatus
    );
  }, BUFF_SPEED);
};

// 动画循环函数
const animate = () => {
  // 渲染所有的方块
  map.forEach((xMap, x) => {
    xMap.forEach((node, y) => {
      node.mesh.material = STATUS_MATERIAL_MAP[node.status];
    });
  });
  backgroundMaterial.uniforms.time.value += 0.01;
  // 额外的渲染任务
  if (intervalCount >= interval) {
    intervalCount = 0;
  }
  intervalCount += 1;
  // 渲染调用
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
};

// 点击游戏开始
const startGame = () => {
  started.value = true;
  // 判断输入是否有效，无输入即为undefined后续有对应处理
  const mapSizeValid =
    mapSizeInput.value === undefined || mapSizeInput.value >= 10;
  const snakeSpeedValid =
    snakeSpeedInput.value === undefined ||
    (snakeSpeedInput.value >= 0 && snakeSpeedInput.value <= 20);
  const inputValid = mapSizeValid && snakeSpeedValid;
  if (inputValid === false) {
    endGame();
    return;
  }
  mapSize = mapSizeInput.value === undefined ? mapSize : mapSizeInput.value;
  startMap(); // 先建地图
  startSnake(); // 再建蛇
  startMusic();
};

// 游戏结束
const endGame = () => {
  // 输出蛇长度作为结果
  if (snake != null && snake.length != null) {
    gameOverMessage.value = `Snake Length: ${snake.length} -.- ${gameOverMessage.value}`;
  }
  clearInterval(snakeAnimateId);
  clearInterval(blockAnimateId);
  clearInterval(buffAnimateId);
  audioSource.stop();
  gameOver.value = true;
};

// 初始化挂载
const webgl = ref(null);
onMounted(() => {
  webgl.value.appendChild(renderer.domElement); // 加载three js的canvas
});

// 游戏结束时重新开始游戏
const restartGame = () => {
  location.reload();
};

// 设置镜头可操作
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();
controls.addEventListener("change", () => {
  renderer.render(scene, camera);
});

// 键盘控制，只有上下左右w s a d，其他情况无视
window.addEventListener("keydown", (event) => {
  const directionFromMap = KEY_DIRECTIONS_MAP[event.key];
  nextDirection =
    directionFromMap === undefined ? nextDirection : directionFromMap;
});

// 窗口大小改变时更新画布，保持canvas浏览器全屏
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
});

// 播放音乐
const startMusic = () => {
  const sampleRate = 50000;
  const duration = 0.5;
  const frequency = 400;

  // 音乐参考ai生成
  const buffer = new Float32Array(sampleRate * duration);
  for (let i = 0; i < buffer.length; i++) {
    const t = i / sampleRate;
    buffer[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-10 * t);
  }

  // 输出到左右声道
  const leftChannel = buffer;
  const rightChannel = buffer;

  // 创建音频上下文
  const audioContext = new AudioContext();
  const audioBuffer = audioContext.createBuffer(2, buffer.length, sampleRate);
  audioBuffer.getChannelData(0).set(leftChannel);
  audioBuffer.getChannelData(1).set(rightChannel);

  // 创建音频源
  audioSource = audioContext.createBufferSource();
  audioSource.buffer = audioBuffer;

  // 连接到扬声器
  audioSource.connect(audioContext.destination);

  // 播放音频
  audioSource.loop = true;
  audioSource.start();
};

watch(
  () => started.value,
  () => {
    const appEl = document.querySelector(".VPApp");
    if (appEl) {
      appEl.style.setProperty("display", "none", "important");
    }
  },
  { deep: true }
);

watch(
  () => gameOver.value,
  () => {
    const appEl = document.querySelector(".VPApp");
    if (appEl) {
      appEl.style.setProperty("display", "flex", "important");
    }
  },
  { deep: true }
);

</script>

<style scoped>
/* 全局设置 */
body {
  margin: 0;
  background: #222;
}

/* 页面中心 */
.center {
  position: fixed;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* 点击开始按钮 */
.center-content {
  top: 20%;
  margin-top: 150px;
  width: 400px;
  cursor: pointer;
}

/* 游戏说明 */
.instruction-content {
  bottom: 5%;
  font-size: small;
  cursor: default;
  left: 20%;
  transform: translate(-10%, 0);
}

/* 作者底部信息 */
.footer-content {
  top: 20%;
  margin-top: 210px;
  color: #fff;
  font-size: small;
  cursor: default;
}

/* 输入框容器 */
.input-container {
  left: 50%;
  width: 250px;
}

/* 输入框 */
input {
  width: 90%;
  padding: 10px;
  border: none;
}

/* 地图大小输入框位置调整 */
.map-size-input {
  top: 20%;
}

/* 蛇速度输入框位置调整 */
.snake-speed-input {
  top: 20%;
  margin-top: 80px;
}
:deep(.aside) {
  display: none !important;
}
</style>

<!-- <style>
.VPApp {
  display: none !important;
}
</style> -->
