<template>
  <div class="w-full h-full flex animate-fade-in relative overflow-hidden">
    <!-- 降噪提醒弹窗 -->
    <transition name="tip-fade">
      <div v-if="showNoiseReductionTip"
           class="absolute top-3 left-3 right-3 z-50 bg-amber-900/90 backdrop-blur-sm border border-amber-500/50 rounded-lg p-3 shadow-lg">
        <div class="flex items-start gap-3">
          <div class="text-amber-400 shrink-0 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-amber-200 text-xs font-medium mb-1">音质优化建议</div>
            <div class="text-amber-100/80 text-[10px] leading-relaxed">
              请在电脑系统设置中<span class="text-amber-300 font-semibold">关闭麦克风降噪</span>功能，以获得更准确的频谱分析效果。
            </div>
          </div>
          <button @click="dismissNoiseReductionTip"
                  class="text-amber-400 hover:text-amber-200 transition-colors shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </transition>

    <!-- 主内容区 -->
    <div class="flex-1 flex flex-col p-4 relative min-h-0">

      <!-- 标题 -->
      <div class="mb-3 text-center shrink-0">
        <h2 class="text-lg font-bold text-violet-400">高精度频谱分析仪</h2>
        <p class="text-xs text-zinc-400 mt-0.5">实时音频频谱监测</p>
      </div>

      <!-- 频谱显示区 -->
      <div class="flex-1 bg-zinc-900/90 rounded-xl border border-zinc-700/50 p-3 overflow-hidden min-h-0">
        <!-- 频谱图 -->
        <div class="h-full flex flex-col">
          <!-- 频谱柱状图 -->
          <div class="flex-1 flex items-end gap-1.5 min-h-0">
            <div v-for="(band, index) in frequencyBands"
                 :key="band.name"
                 class="flex-1 flex flex-col items-center h-full">

              <!-- 频段标签 (顶部) -->
              <div class="text-[11px] text-zinc-400 mb-1 font-medium shrink-0">
                {{ band.label }}
              </div>

              <!-- 数值显示 (在标签下方) -->
              <div class="text-xs transition-colors duration-150 spectrum-value mb-2 tabular-nums font-bold shrink-0"
                   :class="getBandValueColor(bandLevels[index] || 0)">
                <span class="inline-block min-w-[32px] text-center">{{ formatValue(bandLevels[index]) }}</span>
              </div>

              <!-- 柱状条 -->
              <div class="w-full flex-1 bg-zinc-800/80 rounded-t overflow-hidden relative min-h-[100px]">
                <!-- 背景网格 -->
                <div class="absolute inset-0 flex flex-col justify-between">
                  <div v-for="i in 4" :key="i" class="border-t border-zinc-700/40"></div>
                </div>

                <!-- 频谱柱 -->
                <div class="absolute bottom-0 left-0 right-0 transition-all duration-75 rounded-t"
                     :style="{
                       height: `${Math.min(100, bandLevels[index] || 0)}%`,
                       background: getBarGradient(index)
                     }">
                  <!-- 顶部发光效果 -->
                  <div class="absolute top-0 left-0 right-0 h-1 blur-sm"
                       :style="{ background: band.color }"></div>
                </div>

                <!-- 峰值标记 -->
                <div class="absolute left-0 right-0 h-0.5 bg-white/90 transition-all duration-300 shadow-glow"
                     :style="{ bottom: `${Math.min(100, peakLevels[index] || 0)}%` }"></div>
              </div>

              <!-- 频段名称 -->
              <div class="text-[10px] font-bold mt-1.5 shrink-0"
                   :style="{ color: band.color }">
                {{ band.name }}
              </div>
            </div>
          </div>

          <!-- dB 刻度 -->
          <div class="flex justify-between text-[10px] text-zinc-500 mt-2 px-2 font-medium shrink-0">
            <span>-60dB</span>
            <span>-40dB</span>
            <span>-20dB</span>
            <span>0dB</span>
          </div>
        </div>
      </div>

      <!-- 实时数据面板 -->
      <div class="mt-3 grid grid-cols-4 gap-2 shrink-0">
        <div class="bg-zinc-900/80 rounded-lg p-2 text-center border border-zinc-800/50">
          <div class="text-[10px] text-zinc-400">主频率</div>
          <div class="text-sm text-violet-400 spectrum-value font-bold">{{ formatValue(dominantFrequency) }} Hz</div>
        </div>
        <div class="bg-zinc-900/80 rounded-lg p-2 text-center border border-zinc-800/50">
          <div class="text-[10px] text-zinc-400">音量</div>
          <div class="text-sm text-green-400 spectrum-value font-bold">{{ Math.round(volumeLevel * 100) }}%</div>
        </div>
        <div class="bg-zinc-900/80 rounded-lg p-2 text-center border border-zinc-800/50">
          <div class="text-[10px] text-zinc-400">采样率</div>
          <div class="text-sm text-blue-400 spectrum-value font-bold">{{ sampleRate }} Hz</div>
        </div>
        <div class="bg-zinc-900/80 rounded-lg p-2 text-center border border-zinc-800/50">
          <div class="text-[10px] text-zinc-400">刷新率</div>
          <div class="text-sm text-yellow-400 spectrum-value font-bold">{{ refreshRate }} fps</div>
        </div>
      </div>

      <!-- 控制按钮 -->
      <div class="mt-3 flex justify-center gap-3 shrink-0">
        <button @click="toggleAnalyzer"
                class="px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300"
                :class="isActive
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg'
                  : 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg'">
          {{ isActive ? '停止分析' : '开始分析' }}
        </button>
        <button @click="resetPeaks"
                class="px-4 py-2.5 rounded-lg font-semibold text-sm bg-zinc-700 hover:bg-zinc-600 text-white transition-all">
          重置峰值
        </button>
      </div>
    </div>

    <!-- 右侧设置面板 -->
    <div class="w-48 p-3 bg-zinc-900/70 border-l border-zinc-700/50 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
      <div class="mb-3 shrink-0">
        <h3 class="text-xs font-bold text-zinc-300 uppercase tracking-wider">频谱设置</h3>
      </div>

      <!-- FFT 大小选择 -->
      <div class="mb-4 shrink-0">
        <label class="text-[10px] text-zinc-400 block mb-1.5 font-medium">FFT 精度</label>
        <div class="space-y-1">
          <button v-for="size in fftSizes" :key="size.value"
                  @click="setFFTSize(size.value)"
                  class="w-full p-2 rounded-lg text-left text-xs transition-all"
                  :class="fftSize === size.value
                    ? 'bg-violet-600 text-white shadow-lg'
                    : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700'">
            <div class="font-semibold">{{ size.label }}</div>
            <div class="text-[9px] mt-0.5"
                 :class="fftSize === size.value ? 'text-violet-200' : 'text-zinc-500'">
              {{ size.desc }}
            </div>
          </button>
        </div>
      </div>

      <!-- 刷新率选择 -->
      <div class="mb-4 shrink-0">
        <label class="text-[10px] text-zinc-400 block mb-1.5 font-medium">刷新率</label>
        <div class="grid grid-cols-3 gap-1">
          <button v-for="rate in refreshRates" :key="rate"
                  @click="setRefreshRate(rate)"
                  class="p-1.5 rounded text-[10px] font-medium transition-all"
                  :class="refreshRate === rate
                    ? 'bg-violet-600 text-white'
                    : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700'">
            {{ rate }}
          </button>
        </div>
      </div>

      <!-- 平滑度调节 -->
      <div class="mb-4 shrink-0">
        <label class="text-[10px] text-zinc-400 block mb-1.5 font-medium">
          平滑度: <span class="text-violet-400">{{ (smoothing * 100).toFixed(0) }}%</span>
        </label>
        <input type="range"
               v-model.number="smoothing"
               min="0" max="0.95" step="0.05"
               class="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider-violet">
      </div>

      <!-- 频段信息 -->
      <div class="mt-auto p-2 bg-black/40 rounded-lg border border-zinc-800/50 shrink-0">
        <div class="text-[10px] text-zinc-300 mb-1.5 font-semibold">监测频段:</div>
        <div class="space-y-1">
          <div v-for="band in frequencyBands" :key="band.name"
               class="flex justify-between items-center text-[9px]">
            <span class="font-medium" :style="{ color: band.color }">{{ band.name }}</span>
            <span class="text-zinc-500">{{ band.range }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { HighPrecisionSpectrumAnalyzer } from '../services/audioService'

// 频段配置 - 10k/5k/2k/1k/500/200/100
const frequencyBands = [
  { name: '100Hz', label: '100', range: '50-150Hz', color: '#ef4444', minFreq: 50, maxFreq: 150 },
  { name: '200Hz', label: '200', range: '150-300Hz', color: '#f97316', minFreq: 150, maxFreq: 300 },
  { name: '500Hz', label: '500', range: '300-700Hz', color: '#eab308', minFreq: 300, maxFreq: 700 },
  { name: '1kHz', label: '1k', range: '700-1.5kHz', color: '#22c55e', minFreq: 700, maxFreq: 1500 },
  { name: '2kHz', label: '2k', range: '1.5-3kHz', color: '#06b6d4', minFreq: 1500, maxFreq: 3000 },
  { name: '5kHz', label: '5k', range: '3-7kHz', color: '#3b82f6', minFreq: 3000, maxFreq: 7000 },
  { name: '10kHz', label: '10k', range: '7-14kHz', color: '#8b5cf6', minFreq: 7000, maxFreq: 14000 }
]

// FFT 大小选项
const fftSizes = [
  { value: 2048, label: '标准', desc: '平衡性能和精度' },
  { value: 4096, label: '高精度', desc: '更精确的频率分析' },
  { value: 8192, label: '超高精度', desc: '最高频率分辨率' }
]

// 刷新率选项
const refreshRates = [30, 60, 120]

// 响应式状态
const isActive = ref(false)
const bandLevels = ref(new Array(frequencyBands.length).fill(0))
const peakLevels = ref(new Array(frequencyBands.length).fill(0))
const dominantFrequency = ref(0)
const volumeLevel = ref(0)
const sampleRate = ref(48000)
const fftSize = ref(4096)
const refreshRate = ref(60)
const smoothing = ref(0.5)  // 降低平滑度，提高灵敏度（从 0.8 改为 0.5）

// 麦克风降噪提醒
const hasShownNoiseReductionTip = ref(false)
const showNoiseReductionTip = ref(false)

// 分析器实例
let analyzer = null
let animationId = null
let lastUpdateTime = 0

// 获取柱状图渐变色
const getBarGradient = (index) => {
  const band = frequencyBands[index]
  return `linear-gradient(to top, ${band.color}40, ${band.color})`
}

// 获取数值颜色
const getBandValueColor = (value) => {
  if (value > 80) return 'text-red-400'
  if (value > 60) return 'text-yellow-400'
  if (value > 40) return 'text-green-400'
  return 'text-zinc-400'
}

// 格式化数值显示（避免字体渲染问题）
const formatValue = (value) => {
  const num = value ?? 0
  // 使用 padStart 确保数字对齐，避免布局抖动
  const intPart = Math.floor(num).toString()
  const decPart = (num % 1).toFixed(1).substring(2)
  return `${intPart}.${decPart}`
}

// 切换分析器
const toggleAnalyzer = async () => {
  if (isActive.value) {
    stopAnalyzer()
  } else {
    await startAnalyzer()
  }
}

// 启动分析器
const startAnalyzer = async () => {
  try {
    analyzer = new HighPrecisionSpectrumAnalyzer()
    await analyzer.init({
      fftSize: fftSize.value,
      smoothingTimeConstant: smoothing.value
    })

    sampleRate.value = analyzer.getSampleRate()
    isActive.value = true

    // 显示降噪提醒（只提醒一次）
    if (!hasShownNoiseReductionTip.value) {
      showNoiseReductionTip.value = true
      hasShownNoiseReductionTip.value = true
      setTimeout(() => {
        showNoiseReductionTip.value = false
      }, 5000)
    }

    // 开始更新循环
    updateLoop()
  } catch (error) {
    console.error('启动频谱分析器失败:', error)
  }
}

// 关闭降噪提醒
const dismissNoiseReductionTip = () => {
  showNoiseReductionTip.value = false
}

// 停止分析器
const stopAnalyzer = () => {
  isActive.value = false
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
  if (analyzer) {
    analyzer.dispose()
    analyzer = null
  }
}

// 更新循环
const updateLoop = () => {
  if (!isActive.value || !analyzer) return

  const now = performance.now()
  const interval = 1000 / refreshRate.value

  if (now - lastUpdateTime >= interval) {
    lastUpdateTime = now

    // 获取各频段能量
    const levels = analyzer.getBandLevels(frequencyBands)

    // 更新当前值和峰值
    for (let i = 0; i < levels.length; i++) {
      bandLevels.value[i] = levels[i]

      // 更新峰值（缓慢下降）
      if (levels[i] > peakLevels.value[i]) {
        peakLevels.value[i] = levels[i]
      } else {
        peakLevels.value[i] = Math.max(0, peakLevels.value[i] - 0.5)
      }
    }

    // 更新其他数据
    dominantFrequency.value = analyzer.getDominantFrequency()
    volumeLevel.value = analyzer.getVolumeLevel()
  }

  animationId = requestAnimationFrame(updateLoop)
}

// 重置峰值
const resetPeaks = () => {
  peakLevels.value = new Array(frequencyBands.length).fill(0)
}

// 设置 FFT 大小
const setFFTSize = async (size) => {
  fftSize.value = size
  if (isActive.value && analyzer) {
    analyzer.setFFTSize(size)
  }
}

// 设置刷新率
const setRefreshRate = (rate) => {
  refreshRate.value = rate
}

// 监听平滑度变化
watch(smoothing, (newValue) => {
  if (analyzer) {
    analyzer.setSmoothing(newValue)
  }
})

// 组件卸载时清理
onUnmounted(() => {
  stopAnalyzer()
})
</script>

<style scoped>
/* 数值显示样式 - 禁用字体连字，使用系统等宽字体 */
.spectrum-value {
  font-family: "Courier New", Courier, ui-monospace, SFMono-Regular, monospace;
  font-variant-ligatures: none;
  font-variant-numeric: tabular-nums lining-nums;
  -webkit-font-feature-settings: "liga" 0, "clig" 0, "tnum" 1, "lnum" 1;
  font-feature-settings: "liga" 0, "clig" 0, "tnum" 1, "lnum" 1;
  letter-spacing: 0.02em;
  text-rendering: geometricPrecision;
}

.slider-violet::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #8b5cf6;
  cursor: pointer;
  border: 2px solid #a78bfa;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.5);
}

.slider-violet::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #8b5cf6;
  cursor: pointer;
  border: 2px solid #a78bfa;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.5);
}

/* 峰值标记发光效果 */
.shadow-glow {
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.8);
}

/* 提示弹窗过渡动画 */
.tip-fade-enter-active,
.tip-fade-leave-active {
  transition: all 0.3s ease;
}

.tip-fade-enter-from,
.tip-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
