<template>
  <div class="audio-player">
    <div class="album-cover"></div>
    <div class="player-controls">
      <div class="song-info">
        <div class="song-title">Song Title</div>
        <p class="artist">Artist</p>
      </div>
      <div class="progress-bar">
        <div class="progress"></div>
      </div>
      <div class="buttons">
        <button class="play-btn" @click="startPlay()">
          <svg
            viewBox="0 0 16 16"
            class="bi bi-play-fill"
            fill="currentColor"
            height="16"
            width="16"
            xmlns="http://www.w3.org/2000/svg"
            style="color: white"
          >
            <path
              fill="white"
              d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"
            ></path>
          </svg>
        </button>
        <button class="pause-btn" @click="stopPlay()">
          <svg
            viewBox="0 0 16 16"
            class="bi bi-pause-fill"
            fill="currentColor"
            height="16"
            width="16"
            xmlns="http://www.w3.org/2000/svg"
            style="color: white"
          >
            <path
              fill="white"
              d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import m1 from "../../assets/music/爱与诚 - 古巨基.mp3";
import m2 from "../../assets/music/拿捏.mp3";
import m3 from "../../assets/music/乌梅子酱 - 李荣浩.mp3";
import m4 from "../../assets/music/在你的身边 - 盛哲.mp3";
const musicFiles = [m1, m2, m3, m4];
let currentIndex = 0;
let audio;
const playMusic = () => {
  if (currentIndex >= musicFiles.length) {
    currentIndex = 0;
  }
  audio = new Audio(musicFiles[currentIndex]);
  audio.addEventListener("ended", () => {
    currentIndex++;
    playMusic();
  });
  audio.play();
};
const startPlay = () => {
  if (audio) {
    audio.play();
  } else {
    playMusic();
  }
};
const stopPlay = () => {
  audio?.pause();
};
</script>

<style scoped>
.audio-player {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 80px;
  background-color: #282828;
  border-radius: 8px;
  padding: 8px;
  box-sizing: border-box;
}

.album-cover {
  width: 64px;
  height: 64px;
  background-color: #fff;
  border-radius: 50%;
  margin-right: 12px;
}

.player-controls {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.song-info {
  margin-bottom: 4px;
}

.song-title {
  font-size: 16px;
  color: #fff;
  margin: 0;
}

.artist {
  font-size: 12px;
  color: #b3b3b3;
  margin: 0;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background-color: #4f4f4f;
  border-radius: 2px;
  overflow: hidden;
}

.progress {
  width: 100%;
  height: 100%;
  background-color: #1db954;
  transform-origin: left;
  /* animation: progress-animation 10s linear infinite; */
}

.buttons {
  display: flex;
}

button {
  background: none;
  border: none;
  cursor: pointer;
  outline: none;
}

.play-btn,
.pause-btn {
  font-size: 16px;
  color: #fff;
  margin-right: 8px;
  transition: transform 0.2s ease-in-out;
}

.play-btn:hover,
.pause-btn:hover {
  transform: scale(1.2);
}

@keyframes progress-animation {
  0% {
    transform: scaleX(0);
  }

  100% {
    transform: scaleX(1);
  }
}
</style>
