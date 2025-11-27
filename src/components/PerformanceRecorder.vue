<template>
  <div class="w-full h-full flex animate-fade-in">
    <!-- 主内容区 -->
    <div class="flex-1 flex flex-col p-6 overflow-y-auto custom-scrollbar relative">
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
              <div class="text-amber-200 text-xs font-medium mb-1">录音质量优化建议</div>
              <div class="text-amber-100/80 text-[10px] leading-relaxed">
                请在电脑系统设置中<span class="text-amber-300 font-semibold">关闭麦克风降噪</span>功能，以获得更准确的演奏录制效果。
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

      <!-- 标题 -->
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold text-white mb-2">演奏录制与 AI 评估</h2>
        <p class="text-sm text-zinc-500">录制您的演奏，获取专业 AI 分析与改进建议</p>
      </div>

      <!-- 录音状态区域 -->
      <div class="flex-1 flex flex-col items-center justify-center">
        <!-- 波形可视化 -->
        <div class="w-full max-w-2xl h-32 bg-zinc-900/80 rounded-xl border border-zinc-800 mb-6 overflow-hidden relative">
          <div class="absolute inset-0 flex items-center justify-center">
            <div v-if="!isRecording && !audioBlob && !isAnalyzing" class="text-zinc-600 text-sm">
              点击下方按钮开始录音
            </div>
            <div v-else-if="isAnalyzing" class="flex items-center gap-3">
              <div class="w-3 h-3 rounded-full bg-violet-500 animate-ping"></div>
              <span class="text-violet-400">AI 正在分析您的演奏...</span>
            </div>
          </div>
          <!-- 波形条 -->
          <div class="h-full flex items-center justify-center gap-0.5 px-4">
            <div v-for="(val, i) in waveformBars"
                 :key="i"
                 class="w-1 rounded-full transition-all duration-75"
                 :class="isRecording ? 'bg-red-500' : 'bg-violet-500'"
                 :style="{ height: `${Math.max(4, val)}%`, opacity: isRecording || audioBlob ? 0.8 : 0.2 }">
            </div>
          </div>
          <!-- 录音时间 -->
          <div v-if="isRecording" class="absolute top-3 right-3 flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span class="text-red-400 font-mono text-sm">{{ formatTime(recordingTime) }}</span>
          </div>
          <!-- 录音完成时长 -->
          <div v-else-if="audioBlob && !isAnalyzing" class="absolute top-3 right-3">
            <span class="text-zinc-400 font-mono text-sm">时长: {{ formatTime(recordingTime) }}</span>
          </div>
        </div>

        <!-- 控制按钮 -->
        <div class="flex items-center gap-4 mb-6">
          <!-- 录音按钮 -->
          <button
            @click="toggleRecording"
            :disabled="isAnalyzing"
            class="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg"
            :class="isRecording
              ? 'bg-red-600 hover:bg-red-700 animate-pulse'
              : 'bg-violet-600 hover:bg-violet-700'"
          >
            <svg v-if="!isRecording" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="white" stroke-width="2" fill="none"></path>
              <line x1="12" y1="19" x2="12" y2="23" stroke="white" stroke-width="2"></line>
              <line x1="8" y1="23" x2="16" y2="23" stroke="white" stroke-width="2"></line>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white">
              <rect x="6" y="6" width="12" height="12" rx="2"></rect>
            </svg>
          </button>

          <!-- 播放/重录按钮 -->
          <div v-if="audioBlob && !isRecording && !isAnalyzing" class="flex gap-2">
            <button
              @click="playRecording"
              class="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white transition-all flex items-center gap-2"
            >
              <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
              {{ isPlaying ? '暂停' : '试听' }}
            </button>
            <button
              @click="resetRecording"
              class="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
            >
              重录
            </button>
          </div>
        </div>

        <!-- 提交分析按钮 -->
        <button
          v-if="audioBlob && !isRecording && !isAnalyzing"
          @click="submitForAnalysis"
          class="px-8 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold text-lg shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 transition-all hover:scale-105"
        >
          提交 AI 分析
        </button>

        <!-- 提示信息 -->
        <div v-if="!audioBlob && !isRecording" class="mt-4 text-center max-w-md">
          <p class="text-zinc-500 text-sm leading-relaxed">
            建议录制 30 秒至 3 分钟的演奏片段<br>
            AI 将从音准、节奏、音色、表现力等维度进行全面评估
          </p>
        </div>
      </div>

      <!-- AI 分析结果 -->
      <transition name="fade">
        <div v-if="analysisResult" class="mt-6 bg-zinc-900/80 rounded-xl border border-zinc-800 overflow-hidden flex-shrink-0">
          <!-- 结果头部 -->
          <div class="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm3 12h-6v-2h2v-4h-2v-2h4v6h2v2z"/>
                </svg>
              </div>
              <div>
                <h3 class="text-white font-semibold">AI 演奏评估报告</h3>
                <p class="text-xs text-zinc-500">基于音频分析的专业建议</p>
              </div>
            </div>
            <button
              @click="analysisResult = null"
              class="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- 评分概览 -->
          <div v-if="analysisResult.scores" class="px-6 py-4 border-b border-zinc-800">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div v-for="(score, key) in analysisResult.scores" :key="key" class="text-center">
                <div class="text-3xl font-bold mb-1" :class="getScoreColor(score)">{{ score }}</div>
                <div class="text-xs text-zinc-500">{{ getScoreLabel(key) }}</div>
              </div>
            </div>
          </div>

          <!-- 详细分析 -->
          <div class="px-6 py-4 overflow-y-auto custom-scrollbar" style="max-height: 400px;">
            <div class="prose prose-invert prose-sm max-w-none">
              <div class="whitespace-pre-wrap text-zinc-300 leading-relaxed">{{ analysisResult.feedback }}</div>
            </div>
          </div>

          <!-- 改进建议 -->
          <div v-if="analysisResult.suggestions && analysisResult.suggestions.length > 0" class="px-6 py-4 bg-black/30 border-t border-zinc-800">
            <h4 class="text-sm font-semibold text-violet-400 mb-3">改进建议</h4>
            <ul class="space-y-2">
              <li v-for="(suggestion, index) in analysisResult.suggestions" :key="index" class="flex items-start gap-2 text-sm text-zinc-400">
                <span class="text-violet-500 mt-0.5">•</span>
                {{ suggestion }}
              </li>
            </ul>
          </div>
        </div>
      </transition>
    </div>

    <!-- 右侧设置面板 -->
    <div class="w-56 p-4 bg-zinc-900/50 border-l border-zinc-800 overflow-y-auto">
      <h3 class="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">录音设置</h3>

      <!-- 录音质量 -->
      <div class="mb-4">
        <label class="text-[10px] text-zinc-500 block mb-2">录音质量</label>
        <div class="space-y-1">
          <button
            v-for="quality in qualityOptions"
            :key="quality.value"
            @click="selectedQuality = quality.value"
            class="w-full p-2 rounded text-left text-xs transition-all"
            :class="selectedQuality === quality.value
              ? 'bg-violet-600 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'"
          >
            {{ quality.label }}
          </button>
        </div>
      </div>

      <!-- 演奏类型 -->
      <div class="mb-4">
        <label class="text-[10px] text-zinc-500 block mb-2">演奏类型</label>
        <select
          v-model="performanceType"
          class="w-full p-2 rounded bg-zinc-800 text-zinc-300 text-xs border border-zinc-700 focus:border-violet-500 focus:outline-none"
        >
          <option value="scale">音阶练习</option>
          <option value="etude">练习曲</option>
          <option value="piece">乐曲片段</option>
          <option value="concerto">协奏曲</option>
          <option value="sonata">奏鸣曲</option>
          <option value="other">其他</option>
        </select>
      </div>

      <!-- 曲目信息 -->
      <div class="mb-4">
        <label class="text-[10px] text-zinc-500 block mb-2">曲目名称（可选）</label>
        <input
          v-model="pieceName"
          type="text"
          placeholder="例如: 巴赫 G小调奏鸣曲"
          class="w-full p-2 rounded bg-zinc-800 text-zinc-300 text-xs border border-zinc-700 focus:border-violet-500 focus:outline-none placeholder-zinc-600"
        />
      </div>

      <!-- 关注重点 -->
      <div class="mb-4">
        <label class="text-[10px] text-zinc-500 block mb-2">评估重点</label>
        <div class="space-y-1">
          <label v-for="focus in focusOptions" :key="focus.value" class="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer hover:text-zinc-300">
            <input
              type="checkbox"
              v-model="selectedFocus"
              :value="focus.value"
              class="rounded bg-zinc-800 border-zinc-700 text-violet-600 focus:ring-violet-500"
            />
            {{ focus.label }}
          </label>
        </div>
      </div>

      <!-- 历史记录 -->
      <div v-if="recordingHistory.length > 0" class="mt-6">
        <h4 class="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">历史记录</h4>
        <div class="space-y-2">
          <div
            v-for="record in recordingHistory.slice(0, 5)"
            :key="record.id"
            class="p-2 bg-zinc-800/50 rounded text-[10px]"
          >
            <div class="text-zinc-300">{{ record.pieceName || record.performanceType }}</div>
            <div class="text-zinc-600 mt-1">{{ record.date }} · {{ formatTime(record.duration) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { analyzePerformanceRecording } from '../services/geminiService'

// 录音状态
const isRecording = ref(false)
const isPlaying = ref(false)
const isAnalyzing = ref(false)
const recordingTime = ref(0)
const audioBlob = ref(null)
const analysisResult = ref(null)

// 波形可视化
const waveformBars = ref(new Array(64).fill(4))

// 麦克风降噪提醒
const hasShownNoiseReductionTip = ref(false)
const showNoiseReductionTip = ref(false)

// 设置选项
const selectedQuality = ref('high')
const performanceType = ref('piece')
const pieceName = ref('')
const selectedFocus = ref(['pitch', 'rhythm', 'tone'])

const qualityOptions = [
  { value: 'standard', label: '标准 (128kbps)' },
  { value: 'high', label: '高质量 (256kbps)' },
  { value: 'studio', label: '录音室 (320kbps)' }
]

const focusOptions = [
  { value: 'pitch', label: '音准' },
  { value: 'rhythm', label: '节奏' },
  { value: 'tone', label: '音色' },
  { value: 'dynamics', label: '力度变化' },
  { value: 'expression', label: '表现力' },
  { value: 'technique', label: '技术' }
]

// 历史记录
const recordingHistory = ref([])

// 录音相关变量
let mediaRecorder = null
let audioChunks = []
let audioContext = null
let analyser = null
let animationId = null
let timerInterval = null
let audioElement = null

// 格式化时间
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 获取评分颜色
const getScoreColor = (score) => {
  if (score >= 90) return 'text-green-400'
  if (score >= 80) return 'text-emerald-400'
  if (score >= 70) return 'text-yellow-400'
  if (score >= 60) return 'text-orange-400'
  return 'text-red-400'
}

// 获取评分标签
const getScoreLabel = (key) => {
  const labels = {
    pitch: '音准',
    rhythm: '节奏',
    tone: '音色',
    expression: '表现力'
  }
  return labels[key] || key
}

// 开始/停止录音
const toggleRecording = async () => {
  if (isRecording.value) {
    stopRecording()
  } else {
    await startRecording()
  }
}

// 开始录音
const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        sampleRate: 48000
      }
    })

    // 设置音频分析
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
    analyser = audioContext.createAnalyser()
    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.5  // 降低平滑度，提高灵敏度
    const source = audioContext.createMediaStreamSource(stream)
    source.connect(analyser)

    // 设置录音器
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm'

    mediaRecorder = new MediaRecorder(stream, { mimeType })
    audioChunks = []

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      audioBlob.value = new Blob(audioChunks, { type: mimeType })
      stream.getTracks().forEach(track => track.stop())
    }

    mediaRecorder.start(100)
    isRecording.value = true
    recordingTime.value = 0

    // 显示降噪提醒（只提醒一次）
    if (!hasShownNoiseReductionTip.value) {
      showNoiseReductionTip.value = true
      hasShownNoiseReductionTip.value = true
      setTimeout(() => {
        showNoiseReductionTip.value = false
      }, 5000)
    }

    // 开始计时
    timerInterval = setInterval(() => {
      recordingTime.value++
    }, 1000)

    // 开始波形可视化
    visualize()

  } catch (error) {
    console.error('录音启动失败:', error)
    alert('无法访问麦克风，请检查权限设置')
  }
}

// 关闭降噪提醒
const dismissNoiseReductionTip = () => {
  showNoiseReductionTip.value = false
}

// 停止录音
const stopRecording = () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }

  isRecording.value = false

  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }

  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }

  if (audioContext) {
    audioContext.close()
    audioContext = null
  }
}

// 波形可视化
const visualize = () => {
  if (!analyser || !isRecording.value) return

  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  analyser.getByteFrequencyData(dataArray)

  // 更新波形条 - 提高灵敏度
  const bars = []
  const step = Math.floor(bufferLength / 64)
  for (let i = 0; i < 64; i++) {
    const value = dataArray[i * step]
    // 非线性映射，让小音量更明显
    const normalized = value / 255
    bars.push(Math.pow(normalized, 0.7) * 100)
  }
  waveformBars.value = bars

  animationId = requestAnimationFrame(visualize)
}

// 播放录音
const playRecording = () => {
  if (!audioBlob.value) return

  if (isPlaying.value) {
    audioElement?.pause()
    isPlaying.value = false
    return
  }

  const url = URL.createObjectURL(audioBlob.value)
  audioElement = new Audio(url)
  audioElement.onended = () => {
    isPlaying.value = false
  }
  audioElement.play()
  isPlaying.value = true
}

// 重置录音
const resetRecording = () => {
  audioBlob.value = null
  recordingTime.value = 0
  analysisResult.value = null
  waveformBars.value = new Array(64).fill(4)

  if (audioElement) {
    audioElement.pause()
    audioElement = null
  }
  isPlaying.value = false
}

// 提交分析
const submitForAnalysis = async () => {
  if (!audioBlob.value) return

  isAnalyzing.value = true
  analysisResult.value = null

  try {
    // 将音频转换为 base64
    const reader = new FileReader()
    const base64Promise = new Promise((resolve) => {
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1]
        resolve(base64)
      }
    })
    reader.readAsDataURL(audioBlob.value)
    const audioBase64 = await base64Promise

    // 调用 AI 分析
    const result = await analyzePerformanceRecording({
      audioData: audioBase64,
      duration: recordingTime.value,
      performanceType: performanceType.value,
      pieceName: pieceName.value,
      focusAreas: selectedFocus.value
    })

    analysisResult.value = result

    // 添加到历史记录
    recordingHistory.value.unshift({
      id: Date.now(),
      date: new Date().toLocaleDateString('zh-CN'),
      duration: recordingTime.value,
      performanceType: performanceType.value,
      pieceName: pieceName.value,
      scores: result.scores
    })

    // 限制历史记录数量
    if (recordingHistory.value.length > 20) {
      recordingHistory.value = recordingHistory.value.slice(0, 20)
    }

  } catch (error) {
    console.error('AI 分析失败:', error)
    analysisResult.value = {
      feedback: '分析过程中出现错误，请稍后重试。\n\n错误信息: ' + error.message,
      scores: null,
      suggestions: ['请检查网络连接', '尝试重新录制', '确保录音时长在30秒以上']
    }
  } finally {
    isAnalyzing.value = false
  }
}

// 清理
onUnmounted(() => {
  stopRecording()
  if (audioElement) {
    audioElement.pause()
    audioElement = null
  }
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
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
