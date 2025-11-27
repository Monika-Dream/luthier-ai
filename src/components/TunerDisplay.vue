<template>
  <div class="w-full h-full flex animate-blur-in relative overflow-hidden">
    <!-- 主内容区 -->
    <div class="flex-1 flex flex-col items-center justify-center p-4 relative">

      <!-- 圆形调音器主显示 -->
      <div class="relative mb-6 tuner-circle-container">
        <!-- 外圈装饰 - 带动画 -->
        <div class="absolute inset-0 w-48 h-48 md:w-56 md:h-56 rounded-full border border-violet-500/20 animate-breathe-soft"></div>
        <div class="absolute inset-0 w-48 h-48 md:w-56 md:h-56 rounded-full glow-pulse-soft" :class="isInTune ? 'glow-green' : ''"></div>

        <!-- 主圆形显示区 - 改善动画 -->
        <div class="relative w-48 h-48 md:w-56 md:h-56 rounded-full bg-gradient-to-br from-zinc-900/95 to-black/95 backdrop-blur-xl flex flex-col items-center justify-center shadow-2xl shadow-violet-900/30 tuner-main-circle">

          <!-- 音符显示 - 添加数值变化动画 -->
          <div class="text-5xl md:text-6xl font-bold mb-1 transition-all duration-400 ease-apple-spring number-transition"
               :class="isInTune ? 'text-green-400 scale-110' : tunerNotes[currentNote]?.color || 'text-white'">
            {{ currentNote }}
          </div>

          <!-- 频率显示 -->
          <div class="text-xl md:text-2xl font-mono text-violet-300 tracking-wider transition-all duration-300">
            {{ currentFrequency.toFixed(1) }}
            <span class="text-sm text-violet-400">Hz</span>
          </div>

          <!-- 目标频率 -->
          <div class="text-xs text-zinc-500 mt-1 transition-all duration-300">
            目标: <span class="text-violet-400">{{ targetFrequency.toFixed(1) }} Hz</span>
          </div>

          <!-- 音准状态 - 添加成功弹跳动画 -->
          <div class="mt-3 px-4 py-1 rounded-full bg-black/50 transition-all duration-400 ease-apple-spring"
               :class="isInTune ? 'animate-success-bounce bg-green-500/20' : ''">
            <div v-if="isInTune" class="flex items-center gap-1">
              <svg class="w-4 h-4 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
              <span class="text-green-400 text-sm font-semibold">音准完美</span>
            </div>
            <div v-else class="text-center">
              <div class="text-lg font-bold transition-all duration-200"
                   :class="pitchOffset > 0 ? 'text-yellow-400' : 'text-orange-400'">
                {{ pitchOffset > 0 ? '+' : '' }}{{ pitchOffset.toFixed(0) }}¢
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 音准指示器 - 改善指针动画 -->
      <div class="w-full max-w-md mb-6">
        <div class="relative h-16">
          <!-- 背景轨道 -->
          <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 bg-zinc-800 rounded-full overflow-hidden">
            <!-- 中心标记 -->
            <div class="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-violet-500"></div>
            <!-- 音准良好区域 -->
            <div class="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-8 bg-green-500/20 transition-all duration-300"
                 :class="isInTune ? 'w-12 bg-green-500/40' : ''"></div>
          </div>

          <!-- 指针 - 弹性动画 -->
          <div class="absolute top-1/2 -translate-y-1/2 transition-all duration-200 ease-spring-medium"
               :style="`left: ${Math.min(90, Math.max(10, 50 + pitchOffset))}%`">
            <div class="relative -translate-x-1/2">
              <!-- 光晕 -->
              <div class="absolute -inset-3 rounded-full blur-lg transition-all duration-300"
                   :class="isInTune ? 'bg-green-400/50 scale-125' : 'bg-violet-400/50'"></div>
              <!-- 主体 -->
              <div class="relative w-5 h-5 rounded-full border-2 transition-all duration-300 ease-apple-spring"
                   :class="isInTune ? 'bg-green-400 border-green-300 scale-125' : 'bg-violet-500 border-violet-400'">
                <div class="absolute top-0.5 left-0.5 w-2 h-2 bg-white/50 rounded-full"></div>
              </div>
            </div>
          </div>

          <!-- 刻度标签 -->
          <div class="absolute -bottom-5 inset-x-0 flex justify-between text-[10px] text-zinc-500">
            <span>-50¢</span>
            <span class="text-violet-400 font-bold">0</span>
            <span>+50¢</span>
          </div>
        </div>
      </div>

      <!-- 弦选择按钮 - 添加弹性效果 -->
      <div class="flex gap-2 mb-4">
        <div v-for="(note, key) in tunerNotes" :key="key" class="flex flex-col items-center gap-1">
          <button @click="selectNote(key)"
                  class="px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ease-apple-spring apple-button"
                  :class="currentNote === key
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30 scale-105'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white hover:scale-105'">
            {{ key }}弦
          </button>
          <!-- 播放参考音 - 独立按钮 -->
          <button @click="playNote(key)"
                  class="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ease-apple-spring apple-button"
                  :class="isPlayingNote === key
                    ? 'bg-green-500 text-white animate-breathe-soft scale-110'
                    : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-400 hover:text-white hover:scale-110'">
            <svg v-if="isPlayingNote !== key" class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <div v-else class="w-2 h-2 bg-white rounded-full"></div>
          </button>
        </div>
      </div>

      <!-- 控制按钮 -->
      <button @click="toggleTuner"
              class="px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300"
              :class="tunerActive
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-violet-600 hover:bg-violet-700 text-white'">
        {{ tunerActive ? '停止调音' : '开始调音' }}
      </button>
    </div>

    <!-- 右侧调音标准选择器 -->
    <div class="w-48 p-3 bg-zinc-900/50 border-l border-zinc-800 animate-slide-in-right" style="animation-delay: 100ms">
      <div class="mb-3">
        <h3 class="text-xs font-bold text-zinc-400 uppercase tracking-wider">调音标准</h3>
      </div>

      <!-- 调音标准按钮 - 添加动画 -->
      <div class="space-y-2">
        <button v-for="(standard, key, index) in tuningStandards"
                :key="key"
                @click="selectTuningStandard(key)"
                class="w-full p-3 rounded-lg text-left transition-all duration-400 ease-apple-spring spring-card animate-stagger-in"
                :style="{ animationDelay: `${index * 60 + 150}ms` }"
                :class="tuningStandard === key
                  ? 'bg-violet-600 text-white scale-[1.02]'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'">
          <div class="font-medium text-sm">
            {{ key === 'baroque' ? '巴洛克' : key === 'modern' ? '标准' : '管弦乐团' }}
          </div>
          <div class="text-xs mt-1" :class="tuningStandard === key ? 'text-violet-200' : 'text-zinc-500'">
            A = {{ standard.A }} Hz
          </div>
        </button>
      </div>

      <!-- 当前调音说明 -->
      <div class="mt-4 p-2 bg-black/30 rounded text-[10px] text-zinc-500 animate-fade-in" style="animation-delay: 400ms">
        <div class="mb-1 text-zinc-400">当前音符频率:</div>
        <div class="text-violet-400 font-mono">
          {{ currentNote }} = {{ calculateCurrentNoteFreq() }} Hz
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, toRefs, onUnmounted, computed } from 'vue'
import { ToneGenerator } from '../services/audioService'

const props = defineProps({
  currentNote: String,
  currentFrequency: Number,
  targetFrequency: Number,
  pitchOffset: Number,
  tunerActive: Boolean,
  tunerNotes: Object,
  tuningStandard: String,
  tuningStandards: Object
})

const emit = defineEmits(['toggle-tuner', 'select-note', 'select-tuning-standard'])

const { currentNote, currentFrequency, targetFrequency, pitchOffset, tunerActive, tunerNotes, tuningStandard, tuningStandards } = toRefs(props)

// 计算是否音准良好
const isInTune = computed(() => Math.abs(props.pitchOffset) < 5)

// 声音发生器实例
const toneGenerator = new ToneGenerator()
const isPlayingNote = ref(null)

// 计算当前音符在当前调音标准下的频率
const calculateCurrentNoteFreq = () => {
  if (!props.currentNote || !props.tunerNotes[props.currentNote]) {
    return 440
  }
  return props.tunerNotes[props.currentNote].frequency.toFixed(1)
}

const toggleTuner = () => {
  emit('toggle-tuner')
}

const selectNote = (note) => {
  emit('select-note', note)
}

const selectTuningStandard = (standard) => {
  emit('select-tuning-standard', standard)
}

// 播放参考音
const playNote = async (note) => {
  if (isPlayingNote.value === note) {
    toneGenerator.stop()
    isPlayingNote.value = null
  } else {
    if (isPlayingNote.value) {
      toneGenerator.stop()
    }
    isPlayingNote.value = note
    const frequency = props.tunerNotes[note]?.frequency || 440
    await toneGenerator.playFrequency(frequency, 3)
    setTimeout(() => {
      if (isPlayingNote.value === note) {
        isPlayingNote.value = null
      }
    }, 3000)
  }
}

onUnmounted(() => {
  toneGenerator.stop()
})
</script>

<style scoped>
/* 调音器圆形容器 */
.tuner-circle-container {
  perspective: 1000px;
  transform: translateZ(0);
  backface-visibility: hidden;
}

.tuner-main-circle {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform: translateZ(0);
  backface-visibility: hidden;
  will-change: transform;
}

.tuner-main-circle:hover {
  transform: scale(1.02) translateZ(0);
}

/* 绿色发光效果（音准正确时） */
.glow-green {
  box-shadow: 0 0 30px rgba(74, 222, 128, 0.3),
              0 0 60px rgba(74, 222, 128, 0.15);
}

/* 错落进入动画 - GPU 加速 */
.animate-stagger-in {
  opacity: 0;
  animation: staggerSlideIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  will-change: transform, opacity;
}

@keyframes staggerSlideIn {
  0% {
    opacity: 0;
    transform: translate3d(0, 20px, 0) scale3d(0.95, 0.95, 1);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale3d(1, 1, 1);
  }
}
</style>