<template>
  <div class="flex-1 flex flex-col items-center justify-center p-6 animate-blur-in overflow-hidden">
    <!-- 节拍显示 - 添加数值变化动画 -->
    <div class="mb-8 text-center">
      <div class="text-6xl font-bold text-white mb-4 number-transition transition-all duration-300 ease-apple-spring"
           :class="isPlaying ? 'scale-105' : ''">
        {{ bpm }}
      </div>
      <div class="text-lg text-zinc-400">BPM</div>
    </div>

    <!-- 节拍指示器 - 添加弹性动画 -->
    <div class="flex gap-3 mb-8">
      <div v-for="i in beatsPerMeasure"
           :key="i"
           class="w-12 h-12 rounded-full border-2 transition-all duration-200 ease-apple-spring beat-indicator"
           :class="currentBeat === (i - 1)
             ? 'bg-violin-gold border-violin-gold scale-125 shadow-lg shadow-violin-gold/50 active-beat'
             : 'bg-zinc-800 border-zinc-700 hover:scale-110 hover:border-zinc-600'">
      </div>
    </div>

    <!-- BPM 调节 - 添加按钮动画 -->
    <div class="flex items-center gap-4 mb-6">
      <button @click="adjustBPM(-10)"
              class="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white transition-all duration-300 ease-apple-spring apple-button hover:scale-110 active:scale-95">
        -10
      </button>
      <button @click="adjustBPM(-1)"
              class="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white transition-all duration-300 ease-apple-spring apple-button hover:scale-110 active:scale-95">
        -1
      </button>

      <input type="range"
             :value="bpm"
             @input="setBPM($event.target.value)"
             min="40"
             max="280"
             class="w-48 accent-violin-gold slider-animated">

      <button @click="adjustBPM(1)"
              class="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white transition-all duration-300 ease-apple-spring apple-button hover:scale-110 active:scale-95">
        +1
      </button>
      <button @click="adjustBPM(10)"
              class="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white transition-all duration-300 ease-apple-spring apple-button hover:scale-110 active:scale-95">
        +10
      </button>
    </div>

    <!-- 拍号选择 - 添加选择动画 -->
    <div class="flex gap-2 mb-6">
      <button v-for="(beats, index) in [2, 3, 4, 6]"
              :key="beats"
              @click="setBeats(beats)"
              class="px-4 py-2 rounded-lg border transition-all duration-400 ease-apple-spring apple-button animate-stagger-in"
              :style="{ animationDelay: `${index * 50}ms` }"
              :class="beatsPerMeasure === beats
                ? 'bg-violin-gold text-black border-violin-gold scale-105 shadow-lg shadow-violin-gold/30'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-600 hover:scale-105'">
        {{ beats }}/4
      </button>
    </div>

    <!-- 播放控制 - 增强动画 -->
    <button @click="toggleMetronome"
            class="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-400 ease-apple-spring shadow-lg play-btn ripple-container"
            :class="isPlaying
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30 scale-110'
              : 'bg-violin-gold hover:bg-violin-gold-dim text-black shadow-violin-gold/30 hover:scale-110'">
      <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" class="translate-x-0.5">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
        <rect x="6" y="4" width="4" height="16"></rect>
        <rect x="14" y="4" width="4" height="16"></rect>
      </svg>
    </button>

    <!-- 预设速度 - 添加悬停动画 -->
    <div class="mt-6 flex gap-2">
      <button v-for="(preset, index) in [60, 80, 100, 120, 140]"
              :key="preset"
              @click="setBPM(preset)"
              class="px-3 py-1 text-xs rounded border border-zinc-700 hover:border-violin-gold transition-all duration-300 ease-apple-spring apple-button hover:scale-110 hover:bg-violin-gold/10 animate-stagger-in"
              :style="{ animationDelay: `${index * 40 + 200}ms` }">
        {{ preset }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { toRefs } from 'vue'

const props = defineProps({
  bpm: Number,
  isPlaying: Boolean,
  currentBeat: Number,
  beatsPerMeasure: Number
})

const emit = defineEmits(['toggle-metronome', 'adjust-bpm', 'set-bpm', 'set-beats'])

const { bpm, isPlaying, currentBeat, beatsPerMeasure } = toRefs(props)

const toggleMetronome = () => {
  emit('toggle-metronome')
}

const adjustBPM = (delta) => {
  emit('adjust-bpm', delta)
}

const setBPM = (value) => {
  emit('set-bpm', parseInt(value))
}

const setBeats = (beats) => {
  emit('set-beats', beats)
}
</script>

<style scoped>
/* 节拍指示器动画 */
.beat-indicator {
  transition: all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.active-beat {
  animation: beatPulse 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes beatPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.4);
  }
  100% {
    transform: scale(1.25);
  }
}

/* 播放按钮动画 */
.play-btn {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.play-btn:active {
  transform: scale(0.95);
}

/* 错落进入动画 */
.animate-stagger-in {
  opacity: 0;
  animation: staggerSlideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

@keyframes staggerSlideIn {
  0% {
    opacity: 0;
    transform: translateY(15px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 滑块动画 */
.slider-animated {
  transition: all 0.2s ease;
}

.slider-animated:active {
  transform: scaleY(1.2);
}
</style>