<template>
  <div class="w-full h-full flex animate-fade-in relative">
    <!-- 主内容区 -->
    <div class="flex-1 flex flex-col p-4 relative">

      <!-- 标题 -->
      <div class="mb-4 text-center">
        <h2 class="text-lg font-bold text-violet-400">速度阶梯训练</h2>
        <p class="text-xs text-zinc-500">渐进式速度变化 · 弓段分配练习</p>
      </div>

      <!-- 阶梯可视化 -->
      <div class="flex-1 bg-zinc-900/80 rounded-xl border border-zinc-800 p-4 overflow-hidden">
        <div class="h-full flex flex-col">
          <!-- 当前阶段显示 -->
          <div class="text-center mb-4">
            <div class="text-4xl font-bold text-white mb-1">
              {{ currentBpm }}
              <span class="text-xl text-zinc-400">BPM</span>
            </div>
            <div class="text-sm text-zinc-500">
              阶段 {{ currentStep + 1 }} / {{ totalSteps }}
            </div>
          </div>

          <!-- 阶梯图示 -->
          <div class="flex-1 flex items-end justify-center gap-1 px-4 min-h-[150px]">
            <div v-for="(step, index) in ladderSteps"
                 :key="index"
                 class="flex-1 max-w-12 flex flex-col items-center justify-end cursor-pointer transition-all duration-300"
                 @click="jumpToStep(index)"
                 :class="{ 'scale-105': index === currentStep }">
              <!-- 阶梯柱 -->
              <div class="w-full rounded-t transition-all duration-500"
                   :style="{
                     height: `${getStepHeight(step.bpm)}px`,
                     background: getStepGradient(index)
                   }">
                <!-- 当前阶段标记 -->
                <div v-if="index === currentStep && isPlaying"
                     class="w-full h-2 bg-white/50 rounded-t animate-pulse"></div>
              </div>
              <!-- BPM 标签 -->
              <div class="text-[9px] font-mono mt-1 transition-colors"
                   :class="index === currentStep ? 'text-violet-400' : 'text-zinc-600'">
                {{ step.bpm }}
              </div>
            </div>
          </div>

          <!-- 节拍指示器 -->
          <div class="flex justify-center gap-2 mt-4">
            <div v-for="i in beatsPerMeasure"
                 :key="i"
                 class="w-8 h-8 rounded-full border-2 transition-all duration-150 flex items-center justify-center"
                 :class="currentBeat === (i - 1)
                   ? 'bg-violet-500 border-violet-400 scale-125 shadow-lg shadow-violet-500/50'
                   : 'bg-zinc-800 border-zinc-700'">
              <span class="text-xs font-bold"
                    :class="currentBeat === (i - 1) ? 'text-white' : 'text-zinc-600'">
                {{ i }}
              </span>
            </div>
          </div>

          <!-- 进度条 -->
          <div class="mt-4">
            <div class="flex justify-between text-[10px] text-zinc-500 mb-1">
              <span>{{ startBpm }} BPM</span>
              <span>当前小节: {{ currentMeasure }} / {{ measuresPerStep }}</span>
              <span>{{ endBpm }} BPM</span>
            </div>
            <div class="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-300"
                   :style="{ width: `${overallProgress}%` }">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 控制按钮 -->
      <div class="mt-4 flex justify-center gap-3">
        <button @click="togglePlay"
                class="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg"
                :class="isPlaying
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-violet-600 hover:bg-violet-700 text-white'">
          <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
        </button>
        <button @click="resetTraining"
                class="px-4 py-2 rounded-lg font-semibold text-sm bg-zinc-700 hover:bg-zinc-600 text-white transition-all">
          重置
        </button>
      </div>
    </div>

    <!-- 右侧设置面板 -->
    <div class="w-56 p-3 bg-zinc-900/50 border-l border-zinc-800 overflow-y-auto">
      <div class="mb-3">
        <h3 class="text-xs font-bold text-zinc-400 uppercase tracking-wider">训练设置</h3>
      </div>

      <!-- 训练模式 -->
      <div class="mb-4">
        <label class="text-[10px] text-zinc-500 block mb-2">训练模式</label>
        <div class="space-y-1">
          <button v-for="mode in trainingModes" :key="mode.id"
                  @click="setTrainingMode(mode.id)"
                  class="w-full p-2 rounded text-left text-xs transition-all"
                  :class="trainingMode === mode.id
                    ? 'bg-violet-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'">
            <div class="flex items-center gap-2">
              <span>{{ mode.icon }}</span>
              <div>
                <div class="font-medium">{{ mode.name }}</div>
                <div class="text-[9px] mt-0.5"
                     :class="trainingMode === mode.id ? 'text-violet-200' : 'text-zinc-500'">
                  {{ mode.desc }}
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- 起始速度 -->
      <div class="mb-4">
        <label class="text-[10px] text-zinc-500 block mb-2">起始速度: {{ startBpm }} BPM</label>
        <input type="range"
               v-model.number="startBpm"
               min="40" max="200" step="5"
               @change="regenerateLadder"
               class="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider-violet">
      </div>

      <!-- 结束速度 -->
      <div class="mb-4">
        <label class="text-[10px] text-zinc-500 block mb-2">结束速度: {{ endBpm }} BPM</label>
        <input type="range"
               v-model.number="endBpm"
               min="40" max="280" step="5"
               @change="regenerateLadder"
               class="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider-violet">
      </div>

      <!-- 阶梯数量 -->
      <div class="mb-4">
        <label class="text-[10px] text-zinc-500 block mb-2">阶梯数量: {{ totalSteps }}</label>
        <input type="range"
               v-model.number="totalSteps"
               min="3" max="12" step="1"
               @change="regenerateLadder"
               class="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider-violet">
      </div>

      <!-- 每阶小节数 -->
      <div class="mb-4">
        <label class="text-[10px] text-zinc-500 block mb-2">每阶小节: {{ measuresPerStep }}</label>
        <input type="range"
               v-model.number="measuresPerStep"
               min="2" max="8" step="1"
               class="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider-violet">
      </div>

      <!-- 拍号选择 -->
      <div class="mb-4">
        <label class="text-[10px] text-zinc-500 block mb-2">拍号</label>
        <div class="grid grid-cols-4 gap-1">
          <button v-for="beats in [2, 3, 4, 6]"
                  :key="beats"
                  @click="setBeats(beats)"
                  class="p-2 rounded text-xs transition-all text-center"
                  :class="beatsPerMeasure === beats
                    ? 'bg-violet-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'">
            {{ beats }}/4
          </button>
        </div>
      </div>

      <!-- 预设方案 -->
      <div class="mb-4">
        <label class="text-[10px] text-zinc-500 block mb-2">预设方案</label>
        <div class="space-y-1">
          <button v-for="preset in presets" :key="preset.name"
                  @click="applyPreset(preset)"
                  class="w-full p-2 rounded text-left text-xs bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all">
            <div class="font-medium">{{ preset.name }}</div>
            <div class="text-[9px] text-zinc-500">
              {{ preset.start }}-{{ preset.end }} BPM · {{ preset.steps }}阶
            </div>
          </button>
        </div>
      </div>

      <!-- 弓段提示 -->
      <div class="mt-4 p-2 bg-black/30 rounded text-[9px]">
        <div class="text-zinc-400 mb-2">弓段分配提示:</div>
        <div class="text-violet-400 space-y-1">
          <p v-if="currentBpm < 80">• 慢速: 使用全弓，注意弓根到弓尖的匀速</p>
          <p v-else-if="currentBpm < 120">• 中速: 使用中段约2/3弓，保持稳定</p>
          <p v-else>• 快速: 使用上半弓或中段，减少弓段以提高速度</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted, watch } from 'vue'
import { RealMetronome } from '../services/audioService'

// 训练模式配置
const trainingModes = [
  { id: 'accelerando', icon: '📈', name: '渐快', desc: '从慢到快逐级加速' },
  { id: 'ritardando', icon: '📉', name: '渐慢', desc: '从快到慢逐级减速' },
  { id: 'pyramid', icon: '🔺', name: '金字塔', desc: '先加速后减速' },
  { id: 'random', icon: '🎲', name: '随机', desc: '随机速度变化' }
]

// 预设方案
const presets = [
  { name: '初级练习', start: 60, end: 100, steps: 5, measures: 4 },
  { name: '中级练习', start: 80, end: 140, steps: 7, measures: 4 },
  { name: '高级练习', start: 100, end: 180, steps: 9, measures: 4 },
  { name: '极限挑战', start: 120, end: 200, steps: 10, measures: 2 }
]

// 状态
const trainingMode = ref('accelerando')
const startBpm = ref(60)
const endBpm = ref(120)
const totalSteps = ref(6)
const measuresPerStep = ref(4)
const beatsPerMeasure = ref(4)

const isPlaying = ref(false)
const currentStep = ref(0)
const currentBeat = ref(0)
const currentMeasure = ref(1)
const currentBpm = ref(60)

// 阶梯数据
const ladderSteps = ref([])

// 节拍器实例
let metronome = null

// 计算总体进度
const overallProgress = computed(() => {
  const stepProgress = currentStep.value / totalSteps.value
  const measureProgress = (currentMeasure.value - 1) / measuresPerStep.value / totalSteps.value
  return Math.min(100, (stepProgress + measureProgress) * 100)
})

// 获取阶梯高度
const getStepHeight = (bpm) => {
  const minHeight = 30
  const maxHeight = 150
  const minBpm = Math.min(startBpm.value, endBpm.value)
  const maxBpm = Math.max(startBpm.value, endBpm.value)
  const ratio = (bpm - minBpm) / (maxBpm - minBpm || 1)
  return minHeight + ratio * (maxHeight - minHeight)
}

// 获取阶梯渐变色
const getStepGradient = (index) => {
  const isActive = index === currentStep.value
  const isPast = index < currentStep.value

  if (isActive) {
    return 'linear-gradient(to top, #8b5cf6, #a78bfa)'
  } else if (isPast) {
    return 'linear-gradient(to top, #059669, #10b981)'
  } else {
    return 'linear-gradient(to top, #3f3f46, #52525b)'
  }
}

// 生成阶梯
const regenerateLadder = () => {
  const steps = []
  const start = trainingMode.value === 'ritardando' ? endBpm.value : startBpm.value
  const end = trainingMode.value === 'ritardando' ? startBpm.value : endBpm.value

  for (let i = 0; i < totalSteps.value; i++) {
    let bpm

    switch (trainingMode.value) {
      case 'accelerando':
      case 'ritardando':
        bpm = Math.round(start + (end - start) * (i / (totalSteps.value - 1)))
        break
      case 'pyramid':
        const midPoint = Math.floor(totalSteps.value / 2)
        if (i <= midPoint) {
          bpm = Math.round(start + (end - start) * (i / midPoint))
        } else {
          bpm = Math.round(end - (end - start) * ((i - midPoint) / (totalSteps.value - midPoint - 1)))
        }
        break
      case 'random':
        const minBpm = Math.min(startBpm.value, endBpm.value)
        const maxBpm = Math.max(startBpm.value, endBpm.value)
        bpm = Math.round(minBpm + Math.random() * (maxBpm - minBpm))
        break
    }

    steps.push({ bpm, index: i })
  }

  ladderSteps.value = steps
  if (steps.length > 0) {
    currentBpm.value = steps[0].bpm
  }
}

// 设置训练模式
const setTrainingMode = (mode) => {
  trainingMode.value = mode
  regenerateLadder()
  resetTraining()
}

// 设置拍号
const setBeats = (beats) => {
  beatsPerMeasure.value = beats
  if (metronome && isPlaying.value) {
    metronome.setBeatsPerMeasure(beats)
  }
}

// 应用预设
const applyPreset = (preset) => {
  startBpm.value = preset.start
  endBpm.value = preset.end
  totalSteps.value = preset.steps
  measuresPerStep.value = preset.measures
  regenerateLadder()
  resetTraining()
}

// 跳转到指定阶段
const jumpToStep = (index) => {
  if (!isPlaying.value) {
    currentStep.value = index
    currentBpm.value = ladderSteps.value[index].bpm
    currentMeasure.value = 1
    currentBeat.value = 0
  }
}

// 切换播放
const togglePlay = async () => {
  if (isPlaying.value) {
    stopPlaying()
  } else {
    await startPlaying()
  }
}

// 开始播放
const startPlaying = async () => {
  try {
    if (!metronome) {
      metronome = new RealMetronome()
    }

    isPlaying.value = true
    currentBpm.value = ladderSteps.value[currentStep.value].bpm

    let beatCount = 0

    await metronome.start(
      currentBpm.value,
      beatsPerMeasure.value,
      (beatIndex) => {
        currentBeat.value = beatIndex
        beatCount++

        // 检查是否完成一个小节
        if (beatIndex === 0 && beatCount > beatsPerMeasure.value) {
          currentMeasure.value++

          // 检查是否完成当前阶段
          if (currentMeasure.value > measuresPerStep.value) {
            currentMeasure.value = 1

            // 移动到下一阶段
            if (currentStep.value < totalSteps.value - 1) {
              currentStep.value++
              currentBpm.value = ladderSteps.value[currentStep.value].bpm
              metronome.setBPM(currentBpm.value)
            } else {
              // 训练完成
              stopPlaying()
            }
          }
        }
      }
    )
  } catch (error) {
    console.error('启动节拍器失败:', error)
    isPlaying.value = false
  }
}

// 停止播放
const stopPlaying = () => {
  isPlaying.value = false
  if (metronome) {
    metronome.stop()
  }
}

// 重置训练
const resetTraining = () => {
  stopPlaying()
  currentStep.value = 0
  currentBeat.value = 0
  currentMeasure.value = 1
  if (ladderSteps.value.length > 0) {
    currentBpm.value = ladderSteps.value[0].bpm
  }
}

// 初始化
regenerateLadder()

// 组件卸载时清理
onUnmounted(() => {
  stopPlaying()
  if (metronome) {
    metronome.dispose()
    metronome = null
  }
})
</script>

<style scoped>
.slider-violet::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #8b5cf6;
  cursor: pointer;
  border: 2px solid #a78bfa;
}

.slider-violet::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #8b5cf6;
  cursor: pointer;
  border: 2px solid #a78bfa;
}
</style>
