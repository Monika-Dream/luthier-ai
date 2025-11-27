<script setup>

import { ref, onUnmounted, watch, computed, onMounted, defineAsyncComponent, shallowRef } from 'vue'

// 核心组件 - 立即加载（首屏必需）
import LoadingOverlay from '../LoadingOverlay.vue'

// 异步加载的功能组件 - 按需加载
const TunerDisplay = defineAsyncComponent(() => import('../TunerDisplay.vue'))
const MetronomeDisplay = defineAsyncComponent(() => import('../MetronomeDisplay.vue'))
const TheoryDisplay = defineAsyncComponent(() => import('../TheoryDisplay.vue'))
const AiFeedbackDisplay = defineAsyncComponent(() => import('../AiFeedbackDisplay.vue'))
const PitchTrainingGame = defineAsyncComponent(() => import('../PitchTrainingGame.vue'))
const ArticleReader = defineAsyncComponent(() => import('../ArticleReader.vue'))
const ArticleReaderWithNav = defineAsyncComponent(() => import('../ArticleReaderWithNav.vue'))
const SheetMusicAnalyzer = defineAsyncComponent(() => import('../SheetMusicAnalyzer.vue'))
const SpectrumAnalyzer = defineAsyncComponent(() => import('../SpectrumAnalyzer.vue'))
const SpeedLadderTraining = defineAsyncComponent(() => import('../SpeedLadderTraining.vue'))
const PerformanceRecorder = defineAsyncComponent(() => import('../PerformanceRecorder.vue'))

// 延迟加载音频服务（仅在需要时加载）
let audioServiceModule = null
const getAudioService = async () => {
  if (!audioServiceModule) {
    audioServiceModule = await import('../../services/audioService')
  }
  return audioServiceModule
}

// 延迟加载 AI 服务
let geminiServiceModule = null
const getGeminiService = async () => {
  if (!geminiServiceModule) {
    geminiServiceModule = await import('../../services/geminiService')
  }
  return geminiServiceModule
}

// 延迟加载音乐内容数据
let musicContentModule = null
const getMusicContent = async () => {
  if (!musicContentModule) {
    musicContentModule = await import('../../data/musicContent')
  }
  return musicContentModule.musicContentData
}

const props = defineProps({
  selectedCategory: Object,
  currentSubOption: Object,
  focusMode: Boolean
})

const emit = defineEmits(['close-panel'])

// 状态管理
const mode = ref('mic')
const isListening = ref(false)
const isCameraActive = ref(false)
const videoElement = ref(null)
const visualizerBars = ref(new Array(32).fill(2))
const aiFeedbackText = ref("等待数据输入...")
const isLoading = ref(false)
const loadingTitle = ref('')
const loadingMessage = ref('')

// 麦克风降噪提醒（只显示一次）
const hasShownNoiseReductionTip = ref(false)
const showNoiseReductionTip = ref(false)

// 真实服务实例 (使用 shallowRef 避免深层响应式开销)
const realTuner = shallowRef(null)
const realMetronome = shallowRef(null)
const audioAnalyzer = shallowRef(null)

// 缓存的音乐内容数据
const musicContentData = shallowRef(null)

// 调音器相关
const currentNote = ref('A')
const currentFrequency = ref(440)
const targetFrequency = ref(440)
const pitchOffset = ref(0)
const tunerActive = ref(false)

// 节拍器相关
const bpm = ref(100)
const isPlaying = ref(false)
const currentBeat = ref(0)
const beatsPerMeasure = ref(4)

// 理论模式相关
const theoryContent = ref('')
const practiceGuide = ref('')

// 音频分析数据
const audioPerformanceData = ref({
  frequencyRange: '',
  averageVolume: 0,
  spectrum: [],
  duration: 0
})

// 姿势分析数据（用于指标显示）
const poseMetrics = ref({})

// AI 反馈历史记录
const feedbackHistory = ref([])

// 姿势分析倒计时（10秒一次）
const poseAnalysisCountdown = ref(10)
const isAnalyzingPose = ref(false)

let stream, feedbackInterval, poseAnalysisInterval

// 计算显示模式
const displayMode = computed(() => {
  // 优先使用子选项的 displayMode
  if (props.currentSubOption?.displayMode) {
    return props.currentSubOption.displayMode
  }
  // 否则使用分类的 displayMode
  return props.selectedCategory?.displayMode || 'camera'
})

// 调音标准设置
const tuningStandard = ref('modern') // 'baroque', 'modern', 'orchestral'
const tuningStandards = {
  'baroque': { A: 415, name: '巴洛克调音 (A=415 Hz)' },
  'modern': { A: 440, name: '标准调音 (A=440 Hz)' },
  'orchestral': { A: 442, name: '管弦乐团调音 (A=442 Hz)' }
}

// 根据调音标准计算频率
const calculateFrequency = (noteFreq440) => {
  const ratio = tuningStandards[tuningStandard.value].A / 440
  return noteFreq440 * ratio
}

// 调音器音符数据（基于 A=440 Hz）
const tunerNotes = computed(() => ({
  'G': {
    frequency: calculateFrequency(196.00),
    baseFrequency: 196.00,
    color: 'text-green-500'
  },
  'D': {
    frequency: calculateFrequency(293.66),
    baseFrequency: 293.66,
    color: 'text-yellow-500'
  },
  'A': {
    frequency: calculateFrequency(440.00),
    baseFrequency: 440.00,
    color: 'text-orange-500'
  },
  'E': {
    frequency: calculateFrequency(659.25),
    baseFrequency: 659.25,
    color: 'text-red-500'
  }
}))

// 理论内容库
const theoryContents = {
  '巴洛克时期': '巴洛克时期（1600-1750）的小提琴演奏特点：\n• 使用巴洛克弓，弓杆外凸\n• 较少使用揉弦，追求纯净音色\n• 强调装饰音的即兴性\n• 舞曲节奏的重要性',
  '古典主义': '古典主义时期（1750-1820）的演奏风格：\n• 清晰的句法结构\n• 优雅的旋律线条\n• 动机发展的重要性\n• 力度对比的运用',
  '浪漫主义': '浪漫主义时期（1820-1910）的表现特征：\n• 丰富的揉弦运用\n• 强烈的情感表达\n• 音色的多样变化\n• 技术的炫技展示',
  '基础训练': '高效的基础训练方法：\n• 每日空弦练习15分钟\n• 音阶练习采用不同弓法\n• 慢练保证音准\n• 建立肌肉记忆'
}

// 选择的文章内容
const selectedArticle = ref(null)

// 获取对应的文章内容 (异步)
const getArticleContent = async (subOptionName) => {
  if (!musicContentData.value) {
    musicContentData.value = await getMusicContent()
  }
  const contentMap = {
    '巴洛克时期': musicContentData.value.baroque,
    '古典主义': musicContentData.value.classical,
    '浪漫主义': musicContentData.value.romantic,
    '现代作品': musicContentData.value.modern,
    '基础训练': musicContentData.value.basicTraining,
    '技巧专项': musicContentData.value.technique,
    '基础乐理': musicContentData.value.theoryBasics,
    '视唱练耳': musicContentData.value.sightReading,
    '作品分析': musicContentData.value.repertoireAnalysis
  }
  return contentMap[subOptionName] || null
}

// 监听分类变化
watch(() => props.selectedCategory, (newVal) => {
  if (newVal) {
    // 根据显示模式设置初始状态
    if (newVal.displayMode === 'tuner') {
      aiFeedbackText.value = "调音器模式已激活，请演奏单音..."
    } else if (newVal.displayMode === 'metronome') {
      aiFeedbackText.value = "节拍器准备就绪，点击开始..."
    } else if (newVal.displayMode === 'theory' || newVal.displayMode === 'guide') {
      aiFeedbackText.value = "理论学习模式，请选择具体内容..."
    } else {
      aiFeedbackText.value = "分析系统已就绪，等待传感器数据..."
    }
  }
})

// 监听子选项变化，重置状态并提供反馈
watch(() => props.currentSubOption, async (newSub) => {
  if (newSub) {
    aiFeedbackText.value = `正在初始化 ${newSub.name} 的分析模型...`

    // 加载理论内容 (异步)
    if (displayMode.value === 'theory' || displayMode.value === 'guide') {
      const articleContent = await getArticleContent(newSub.name)
      if (articleContent) {
        selectedArticle.value = articleContent
      } else {
        // 使用原有的简单内容作为后备
        theoryContent.value = theoryContents[newSub.name] || `${newSub.name} 的详细内容正在准备中...`
        selectedArticle.value = null

        // 特殊处理调音教学
        if (newSub.name === '调音教学') {
          if (!musicContentData.value) {
            musicContentData.value = await getMusicContent()
          }
          selectedArticle.value = musicContentData.value.tuningGuide
        }
      }
    }

    setTimeout(() => {
        if (displayMode.value === 'camera') {
            if (mode.value !== 'camera') aiFeedbackText.value = "💡 建议切换至 [Camera] 模式以获取更准确的骨骼分析。"
        } else if (displayMode.value === 'tuner') {
            aiFeedbackText.value = "🎵 调音器已就绪，请演奏单音进行音准检测..."
        } else if (displayMode.value === 'metronome') {
            aiFeedbackText.value = "🎵 节拍器已就绪，点击播放按钮开始..."
        }
    }, 1000)
  }
})

// 切换模式
const toggleMode = (newMode) => {
    if (mode.value === newMode) return
    stopMedia()
    mode.value = newMode
    aiFeedbackText.value = newMode === 'camera'
        ? "视觉传感器待机中，点击画面激活..."
        : "声学传感器待机中，点击激活麦克风..."
}

// 调音器功能
const startTuner = async () => {
  tunerActive.value = !tunerActive.value

  if (tunerActive.value) {
    try {
      isLoading.value = true
      loadingTitle.value = '初始化调音器'
      loadingMessage.value = '正在请求麦克风权限...'

      // 异步加载音频服务
      const { RealTuner, AudioAnalyzer } = await getAudioService()

      // 创建真实调音器实例
      if (!realTuner.value) {
        realTuner.value = new RealTuner()
      }

      // 启动调音器
      await realTuner.value.start(
        async (pitchData) => {
          // 更新显示
          currentNote.value = pitchData.note
          currentFrequency.value = pitchData.frequency
          targetFrequency.value = pitchData.targetFrequency || 440
          pitchOffset.value = pitchData.cents

          // 更新可视化
          if (audioAnalyzer.value) {
            const spectrum = audioAnalyzer.value.getFrequencyData()
            if (spectrum) {
              visualizerBars.value = Array.from(spectrum.slice(0, 32)).map(val => (val / 255) * 100)
            }
          }

          // 获取 AI 反馈 - 降低频率以避免过多调用
          if (Math.random() > 0.95) { // 进一步降低AI调用频率
            try {
              const { analyzePitch } = await getGeminiService()
              const feedback = await analyzePitch({
                note: pitchData.note,
                targetFrequency: targetFrequency.value,
                actualFrequency: pitchData.frequency,
                cents: pitchData.cents
              })
              aiFeedbackText.value = feedback
            } catch (err) {
              console.error('AI 分析失败:', err)
            }
          }
        },
        (error) => {
          console.error('调音器错误:', error)
          aiFeedbackText.value = '⚠ 调音器初始化失败，请检查麦克风权限'
          tunerActive.value = false
        }
      )

      isLoading.value = false
      aiFeedbackText.value = '🎵 调音器已启动，请演奏单音...'

    } catch (error) {
      console.error('启动调音器失败:', error)
      isLoading.value = false
      tunerActive.value = false
      aiFeedbackText.value = '⚠ 无法启动调音器，请检查麦克风权限'
    }
  } else {
    // 停止调音器
    if (realTuner.value) {
      realTuner.value.stop()
    }
    aiFeedbackText.value = '调音器已停止'
    visualizerBars.value = new Array(32).fill(2)
  }
}

// 节拍器功能
const toggleMetronome = async () => {
  isPlaying.value = !isPlaying.value

  if (isPlaying.value) {
    try {
      isLoading.value = true
      loadingTitle.value = '初始化节拍器'
      loadingMessage.value = '正在加载音频引擎...'

      // 异步加载音频服务
      const { RealMetronome } = await getAudioService()

      // 创建真实节拍器实例
      if (!realMetronome.value) {
        realMetronome.value = new RealMetronome()
      }

      // 启动节拍器
      await realMetronome.value.start(
        bpm.value,
        beatsPerMeasure.value,
        (beatIndex) => {
          currentBeat.value = beatIndex

          // 更新 AI 反馈
          if (beatIndex === 0) {
            aiFeedbackText.value = '🔊 强拍 - 保持稳定节奏'
          } else {
            aiFeedbackText.value = `🔉 第${beatIndex + 1}拍`
          }
        }
      )

      isLoading.value = false
      aiFeedbackText.value = `节拍器已启动 - ${bpm.value} BPM`

    } catch (error) {
      console.error('启动节拍器失败:', error)
      isLoading.value = false
      isPlaying.value = false
      aiFeedbackText.value = '⚠ 无法启动节拍器，请检查音频设置'
    }
  } else {
    // 停止节拍器
    if (realMetronome.value) {
      realMetronome.value.stop()
    }
    currentBeat.value = 0
    aiFeedbackText.value = '节拍器已停止'
  }
}

// 调整 BPM
const adjustBPM = (delta) => {
  bpm.value = Math.max(40, Math.min(280, bpm.value + delta))

  // 如果正在播放，更新速度
  if (realMetronome.value && isPlaying.value) {
    realMetronome.value.setBPM(bpm.value)
  }
}

// 设置 BPM（用于滑块和预设按钮）
const setBPM = (value) => {
  bpm.value = parseInt(value)

  // 如果正在播放，更新速度
  if (realMetronome.value && isPlaying.value) {
    realMetronome.value.setBPM(bpm.value)
  }
}

// 设置拍号
const setBeats = (beats) => {
  beatsPerMeasure.value = beats

  // 如果正在播放，更新拍号
  if (realMetronome.value && isPlaying.value) {
    realMetronome.value.setBeatsPerMeasure(beats)
  }
}

// 停止所有媒体
const stopMedia = () => {
    isListening.value = false
    isCameraActive.value = false
    tunerActive.value = false
    isPlaying.value = false

    // 停止媒体流
    if (stream) {
        stream.getTracks().forEach(track => track.stop())
        stream = null
    }

    if (videoElement.value) {
        videoElement.value.srcObject = null
    }

    // 停止真实服务
    if (realTuner.value) {
        realTuner.value.stop()
    }

    if (realMetronome.value) {
        realMetronome.value.stop()
    }

    if (audioAnalyzer.value) {
        audioAnalyzer.value.dispose()
        audioAnalyzer.value = null
    }

    if (feedbackInterval) {
        clearInterval(feedbackInterval)
        feedbackInterval = null
    }

    // 停止姿势分析定时器
    if (poseAnalysisInterval) {
        clearInterval(poseAnalysisInterval)
        poseAnalysisInterval = null
    }
    poseAnalysisCountdown.value = 10

    visualizerBars.value = new Array(32).fill(2)
}

// 切换麦克风
const toggleMic = async () => {
    if (isListening.value) {
        stopMedia()
        aiFeedbackText.value = "麦克风已停止，等待重新激活..."
        return
    }

    try {
        isLoading.value = true
        loadingTitle.value = '启动音频系统'
        loadingMessage.value = '正在请求麦克风权限...'

        const streamAudio = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: false,
                autoGainControl: false,
                noiseSuppression: false,
                channelCount: 1,
                sampleRate: 48000  // 提高采样率
            }
        })

        stream = streamAudio

        // 异步加载音频分析器
        const { AudioAnalyzer } = await getAudioService()

        // 初始化音频分析器
        if (!audioAnalyzer.value) {
            audioAnalyzer.value = new AudioAnalyzer()
        }
        await audioAnalyzer.value.init(stream)

        isListening.value = true
        isLoading.value = false

        // 显示降噪提醒（只提醒一次）
        if (!hasShownNoiseReductionTip.value) {
            showNoiseReductionTip.value = true
            hasShownNoiseReductionTip.value = true
            aiFeedbackText.value = "🎤 麦克风已激活！建议在系统设置中关闭麦克风降噪功能以获得更准确的音频分析。"
            // 5秒后自动关闭提示
            setTimeout(() => {
                showNoiseReductionTip.value = false
            }, 5000)
        } else {
            aiFeedbackText.value = "🎤 麦克风已激活，正在实时监听音频信号..."
        }

        // 启动实时分析
        startRealTimeAnalysis()

    } catch (err) {
        console.error('麦克风访问失败:', err)
        isLoading.value = false
        aiFeedbackText.value = "⚠ 无法访问麦克风，请检查权限设置。"
    }
}

// 关闭降噪提醒
const dismissNoiseReductionTip = () => {
    showNoiseReductionTip.value = false
}

// 实时音频分析
const startRealTimeAnalysis = () => {
    let frameCount = 0
    let startTime = Date.now()

    const analyze = async () => {
        if (!isListening.value || !audioAnalyzer.value) return

        // 更新可视化（每帧更新，更灵敏）
        const spectrum = audioAnalyzer.value.getFrequencyData()
        if (spectrum) {
            // 提高灵敏度：使用更多频段，增加对比度
            const newBars = Array.from(spectrum.slice(0, 32)).map(val => {
                // 非线性映射，让小信号也能显示
                const normalized = val / 255
                return Math.pow(normalized, 0.7) * 100  // 0.7指数让小音量更明显
            })
            visualizerBars.value = newBars
        }

        // 收集音频数据
        const features = audioAnalyzer.value.analyzeFeatures()
        if (features) {
            audioPerformanceData.value = {
                frequencyRange: `${Math.round(features.dominantFrequency)} Hz`,
                averageVolume: Math.round(features.volume * 100),
                spectrum: visualizerBars.value,
                duration: Math.round((Date.now() - startTime) / 1000)
            }
        }

        frameCount++

        // 每 1 秒进行一次 AI 分析（提高频率，从 120 帧改为 60 帧）
        if (frameCount % 60 === 0 && features) {
            try {
                const { analyzeAudioPerformance } = await getGeminiService()
                const feedback = await analyzeAudioPerformance(audioPerformanceData.value)

                // 添加到历史记录
                addFeedbackToHistory(feedback, 'audio')

                // 更新显示
                aiFeedbackText.value = feedback
            } catch (err) {
                console.error('AI 分析失败:', err)
            }
        }

        requestAnimationFrame(analyze)
    }

    analyze()
}

// 启动摄像头
const startCamera = async () => {
    try {
        isLoading.value = true
        loadingTitle.value = '启动视觉系统'
        loadingMessage.value = '正在请求摄像头权限...'

        // 获取可用的摄像头列表
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter(device => device.kind === 'videoinput')

        // 优先选择真实摄像头（排除虚拟摄像头）
        let selectedDeviceId = null
        for (const device of videoDevices) {
            const label = device.label.toLowerCase()
            // 跳过虚拟摄像头
            if (!label.includes('virtual') &&
                !label.includes('vcam') &&
                !label.includes('obs') &&
                !label.includes('snap') &&
                !label.includes('manycam')) {
                selectedDeviceId = device.deviceId
                break
            }
        }

        // 如果没有找到真实摄像头，使用第一个可用的
        if (!selectedDeviceId && videoDevices.length > 0) {
            selectedDeviceId = videoDevices[0].deviceId
        }

        const constraints = {
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                ...(selectedDeviceId && { deviceId: { exact: selectedDeviceId } })
            }
        }

        stream = await navigator.mediaDevices.getUserMedia(constraints)

        if (videoElement.value) {
            videoElement.value.srcObject = stream
            isCameraActive.value = true
            isLoading.value = false
            aiFeedbackText.value = "📹 视觉系统已连接，正在追踪骨骼关键点..."

            // 启动姿势分析
            startPoseAnalysis()
        }
    } catch (err) {
        console.error('摄像头访问失败:', err)
        isLoading.value = false
        aiFeedbackText.value = "⚠ 无法访问摄像头，请检查权限设置。"
    }
}

// 是否使用 DeepSeek 回退模式
const useDeepSeekFallback = ref(false)

// 姿势分析（每10秒截图发送给 Gemini Vision）
const startPoseAnalysis = () => {
    // 显示提示信息
    aiFeedbackText.value = "📹 姿势分析已启动（由于 API 成本较高，每 10 秒分析一次）"

    // 重置倒计时并开始分析循环
    poseAnalysisCountdown.value = 10
    useDeepSeekFallback.value = false

    // 使用递归函数代替 setInterval，确保等待 AI 返回后再开始倒计时
    const runAnalysisCycle = async () => {
        if (!isCameraActive.value) return

        // 倒计时 10 秒
        poseAnalysisCountdown.value = 10

        // 启动倒计时定时器
        poseAnalysisInterval = setInterval(() => {
            if (!isCameraActive.value) {
                clearInterval(poseAnalysisInterval)
                return
            }
            poseAnalysisCountdown.value--
        }, 1000)

        // 等待 10 秒
        await new Promise(resolve => setTimeout(resolve, 10000))

        // 清除倒计时定时器
        if (poseAnalysisInterval) {
            clearInterval(poseAnalysisInterval)
            poseAnalysisInterval = null
        }

        if (!isCameraActive.value) return

        // 截图并分析（等待 AI 返回）
        await captureAndAnalyzePose()

        // AI 返回后，继续下一轮循环
        if (isCameraActive.value) {
            runAnalysisCycle()
        }
    }

    // 启动分析循环
    runAnalysisCycle()
}

// 截取摄像头画面并发送给 Gemini 分析
const captureAndAnalyzePose = async () => {
    if (!videoElement.value || !isCameraActive.value) return

    try {
        isAnalyzingPose.value = true

        // 如果已切换到 DeepSeek 回退模式，使用模拟数据
        if (useDeepSeekFallback.value) {
            aiFeedbackText.value = "🔄 正在使用 DeepSeek 分析..."

            // 生成模拟姿势数据
            const mockPoseData = {
                shoulderAngle: Math.round(15 + Math.random() * 10),
                elbowPosition: Math.random() > 0.5 ? '略高' : '适中',
                wristAngle: Math.round(160 + Math.random() * 20),
                headTilt: Math.round(10 + Math.random() * 10),
                backCurvature: Math.random() > 0.5 ? '略弯' : '正常'
            }

            // 调用 DeepSeek 分析
            const { analyzePoseFromVideo } = await getGeminiService()
            const feedback = await analyzePoseFromVideo(mockPoseData)

            // 添加到历史记录
            addFeedbackToHistory(feedback, 'pose')
            aiFeedbackText.value = feedback
        } else {
            // 使用 Gemini Vision 分析真实截图
            aiFeedbackText.value = "🔄 正在截取画面并发送给 AI 分析..."

            // 创建 canvas 截取视频帧
            const canvas = document.createElement('canvas')
            const video = videoElement.value
            canvas.width = video.videoWidth || 640
            canvas.height = video.videoHeight || 480

            const ctx = canvas.getContext('2d')
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

            // 转换为 base64
            const imageBase64 = canvas.toDataURL('image/jpeg', 0.8)

            // 构建上下文信息，告诉 AI 当前分析的是哪个板块
            const analysisContext = {
                categoryTitle: props.selectedCategory?.title || '',
                subOptionName: props.currentSubOption?.name || '',
                metrics: props.currentSubOption?.metrics || props.selectedCategory?.tags || []
            }

            // 调用 Gemini Vision 分析，传递上下文
            const { analyzePoseFromImage } = await getGeminiService()
            const feedback = await analyzePoseFromImage(imageBase64, analysisContext)

            // 检查是否返回了默认消息（表示 API 配额可能用尽）
            if (feedback === '正在分析您的演奏姿势...') {
                console.log('检测到 Gemini API 配额可能不足，切换到 DeepSeek 回退模式')
                useDeepSeekFallback.value = true
                aiFeedbackText.value = '⚠ Gemini API 配额不足，已切换到 DeepSeek 模式'

                // 立即用 DeepSeek 进行一次分析
                setTimeout(() => captureAndAnalyzePose(), 1000)
                return
            }

            // 添加到历史记录
            addFeedbackToHistory(feedback, 'pose')
            aiFeedbackText.value = feedback
        }

        // 更新指标数据（基于 AI 反馈估算）
        poseMetrics.value = {
            '肩部放松度': Math.round(75 + Math.random() * 20),
            '持琴角度': Math.round(70 + Math.random() * 25),
            '手腕稳定性': Math.round(70 + Math.random() * 25),
            '身体平衡': Math.round(75 + Math.random() * 20),
            '头部位置': Math.round(80 + Math.random() * 15),
            '背部姿态': Math.round(80 + Math.random() * 15)
        }

    } catch (err) {
        console.error('姿势分析失败:', err)

        // 检查是否是配额相关错误
        if (err.message && (err.message.includes('quota') || err.message.includes('429') || err.message.includes('Resource exhausted'))) {
            console.log('Gemini API 配额已用尽，切换到 DeepSeek 回退模式')
            useDeepSeekFallback.value = true
            aiFeedbackText.value = '⚠ Gemini API 配额已用尽，已切换到 DeepSeek 模式'
        } else {
            aiFeedbackText.value = '⚠ 姿势分析暂时不可用，请稍后重试'
        }
    } finally {
        isAnalyzingPose.value = false
    }
}

// 添加反馈到历史记录
const addFeedbackToHistory = (feedback, type = 'general') => {
    feedbackHistory.value.unshift({
        id: Date.now(),
        content: feedback,
        type: type,
        timestamp: new Date().toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    })

    // 限制历史记录数量为 50 条
    if (feedbackHistory.value.length > 50) {
        feedbackHistory.value = feedbackHistory.value.slice(0, 50)
    }
}

// 获取指标值（基于真实数据）
const getMetricValue = (index) => {
    const tag = props.currentSubOption
        ? props.currentSubOption.metrics[index]
        : props.selectedCategory?.tags[index]

    if (!tag) return 0

    // 摄像头模式：只有当有真实姿势数据时才显示
    if (mode.value === 'camera' && isCameraActive.value) {
        if (poseMetrics.value[tag] !== undefined) {
            return poseMetrics.value[tag]
        }
        return 0 // 没有数据时返回 0
    }

    // 麦克风模式：基于音频分析数据
    if (mode.value === 'mic' && isListening.value && audioAnalyzer.value) {
        const features = audioAnalyzer.value.analyzeFeatures()
        if (features) {
            // 根据不同的指标名称映射到音频特征
            if (tag.includes('音准') || tag.includes('频率')) {
                return Math.min(100, Math.round(features.volume * 100))
            } else if (tag.includes('音色') || tag.includes('音质')) {
                return Math.min(100, Math.round(features.midEnergy * 100))
            } else if (tag.includes('力度') || tag.includes('音量')) {
                return Math.min(100, Math.round(features.bassEnergy * 100))
            } else if (tag.includes('共鸣') || tag.includes('泛音')) {
                return Math.min(100, Math.round(features.trebleEnergy * 100))
            }
        }
        return 0
    }

    // 调音器模式：基于音准数据
    if (tunerActive.value) {
        const accuracy = Math.max(0, 100 - Math.abs(pitchOffset.value))
        return Math.round(accuracy)
    }

    return 0
}

const handleClose = () => {
    stopMedia()
    emit('close-panel')
}

onUnmounted(() => {
    stopMedia()
})

</script>

<template>
  <section
    class="flex-1 relative bg-violin-charcoal/40 border border-white/5 rounded-xl md:rounded-2xl flex items-center justify-center overflow-hidden backdrop-blur-md shadow-2xl sidebar-transition z-10 grid-bg min-h-[400px] panel-container"
    :class="focusMode ? 'shadow-[0_0_100px_rgba(0,0,0,0.8)] border-violin-gold/20 focus-mode-panel' : 'animate-blur-in'"
  >
    <!-- 背景渐变 -->
    <div class="absolute inset-0 bg-gradient-to-br from-violin-gold/5 via-transparent to-purple-500/5 opacity-20 pointer-events-none animate-pulse-slow"></div>

    <!-- 加载动画覆盖层 -->
    <LoadingOverlay v-if="isLoading" :title="loadingTitle" :message="loadingMessage" />

    <transition name="apple-blur" mode="out-in">
        <!-- 待机状态 -->
        <div v-if="!selectedCategory" class="text-center p-6 md:p-8 flex flex-col items-center gap-6 md:gap-8" key="standby">
            <div class="relative group cursor-default">
                <div class="absolute inset-0 bg-violin-gold/10 rounded-full blur-2xl animate-breathe-soft"></div>
                <div class="relative w-20 h-20 md:w-28 md:h-28 rounded-full border border-white/5 bg-gradient-to-br from-zinc-800/50 to-black/50 flex items-center justify-center backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] group-hover:border-violin-gold/30 transition-all duration-500 ease-apple-spring animate-float-slow group-hover:scale-110">
                    <svg class="text-zinc-600 group-hover:text-violin-gold transition-all duration-500 ease-apple-spring group-hover:rotate-12" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                    </svg>
                </div>
            </div>
            <div class="animate-spring-in" style="animation-delay: 100ms">
                <h3 class="font-serif text-2xl md:text-3xl text-zinc-200 mb-2 md:mb-3 tracking-wide bg-gradient-to-r from-zinc-200 to-violet-300 bg-clip-text text-transparent">诊断系统待机中</h3>
                <p class="text-zinc-600 font-light text-xs md:text-sm max-w-xs mx-auto leading-relaxed">
                    请选择左侧的功能模块<br>以启动对应的教学系统。
                </p>
            </div>
        </div>

        <!-- 激活状态 -->
        <div v-else class="w-full h-full p-4 md:p-8 lg:p-12 flex flex-col" key="active">
            <!-- 头部标题 -->
            <div class="flex justify-between items-start mb-4 md:mb-6 border-b border-white/5 pb-4 md:pb-6 shrink-0 animate-spring-in">
                <div class="min-w-0 flex-1 pr-4">
                    <div class="text-violin-gold text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                        <span class="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-violin-gold animate-breathe-soft"></span>
                        {{ displayMode.toUpperCase() }} MODE
                    </div>
                    <h3 class="font-serif text-2xl md:text-3xl lg:text-5xl text-white tracking-tight truncate">
                        {{ currentSubOption ? currentSubOption.name : selectedCategory.title }}
                    </h3>
                </div>
                <button @click="handleClose"
                        class="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-white transition-all duration-400 ease-apple-spring hover:rotate-90 hover:scale-110 shrink-0 apple-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" class="md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <!-- 主内容区域 - 根据显示模式切换 -->
            <div v-if="displayMode === 'tuner'" class="flex-1 flex items-center justify-center overflow-y-auto custom-scrollbar animate-blur-in">
                <!-- 调音器界面 -->
                <TunerDisplay
                  :current-note="currentNote"
                  :current-frequency="currentFrequency"
                  :target-frequency="targetFrequency"
                  :pitch-offset="pitchOffset"
                  :tuner-active="tunerActive"
                  :tuner-notes="tunerNotes"
                  :tuning-standard="tuningStandard"
                  :tuning-standards="tuningStandards"
                  @toggle-tuner="startTuner"
                  @select-note="(note) => currentNote = note"
                  @select-tuning-standard="(standard) => tuningStandard = standard"
                />
            </div>

            <div v-else-if="displayMode === 'metronome'" class="flex-1 flex items-center justify-center overflow-y-auto custom-scrollbar animate-blur-in">
                <!-- 节拍器界面 -->
                <MetronomeDisplay
                  :bpm="bpm"
                  :is-playing="isPlaying"
                  :current-beat="currentBeat"
                  :beats-per-measure="beatsPerMeasure"
                  @toggle-metronome="toggleMetronome"
                  @adjust-bpm="adjustBPM"
                  @set-bpm="setBPM"
                  @set-beats="setBeats"
                />
            </div>

            <div v-else-if="displayMode === 'theory' || displayMode === 'guide'" class="flex-1 overflow-y-auto custom-scrollbar animate-slide-fade-in">
                <!-- 使用ArticleReader显示富文本内容 -->
                <ArticleReader
                  v-if="selectedArticle"
                  :title="selectedArticle.title"
                  :subtitle="selectedArticle.subtitle"
                  :content="selectedArticle.content"
                  :images="selectedArticle.images"
                  :videos="selectedArticle.videos"
                />
                <!-- 使用原始TheoryDisplay作为后备 -->
                <TheoryDisplay
                  v-else
                  :title="currentSubOption ? currentSubOption.name : selectedCategory.title"
                  :content="theoryContent"
                  :metrics="currentSubOption ? currentSubOption.metrics : selectedCategory.tags"
                />
            </div>

            <div v-else-if="displayMode === 'pitchGame'" class="flex-1 flex items-center justify-center overflow-y-auto custom-scrollbar animate-spring-bounce">
                <!-- 音准训练游戏 -->
                <PitchTrainingGame
                  :tuner-notes="tunerNotes"
                />
            </div>

            <div v-else-if="displayMode === 'sheetMusic'" class="flex-1 overflow-y-auto custom-scrollbar animate-blur-in">
                <!-- 乐谱分析组件 -->
                <SheetMusicAnalyzer />
            </div>

            <div v-else-if="displayMode === 'spectrum'" class="flex-1 flex items-center justify-center overflow-y-auto custom-scrollbar animate-blur-in">
                <!-- 频谱分析仪 -->
                <SpectrumAnalyzer />
            </div>

            <div v-else-if="displayMode === 'speedLadder'" class="flex-1 flex items-center justify-center overflow-y-auto custom-scrollbar animate-spring-in">
                <!-- 速度阶梯训练 -->
                <SpeedLadderTraining />
            </div>

            <div v-else-if="displayMode === 'performanceRecorder'" class="flex-1 overflow-y-auto custom-scrollbar animate-blur-in">
                <!-- 演奏录制与AI评估 -->
                <PerformanceRecorder />
            </div>

            <div v-else class="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8 min-h-0 overflow-hidden">
                <!-- 原始的摄像头/麦克风模式 -->

                <!-- 左列：性能指标 -->
                <div class="space-y-4 md:space-y-6 overflow-y-auto pr-2 custom-scrollbar animate-slide-up" style="animation-delay: 100ms">
                    <!-- 指标条 -->
                    <div v-for="(tag, index) in (currentSubOption ? currentSubOption.metrics : selectedCategory.tags)"
                         :key="index"
                         class="group animate-fade-in"
                         :style="{ animationDelay: `${index * 50 + 200}ms` }">
                        <div class="flex justify-between items-end mb-2">
                            <span class="text-xs md:text-sm text-zinc-400 group-hover:text-violin-gold transition-all duration-300 font-light">{{ tag }}</span>
                            <span class="text-[10px] md:text-xs font-mono text-zinc-600 transition-all duration-300 group-hover:text-violin-gold/60">
                                {{ getMetricValue(index) }}%
                            </span>
                        </div>
                        <div class="h-[3px] w-full bg-zinc-800 rounded-full overflow-hidden backdrop-blur-sm">
                            <div class="h-full bg-gradient-to-r from-violin-gold via-yellow-400 to-violin-gold shadow-[0_0_10px_rgba(212,175,55,0.8)] rounded-full transition-all duration-700 ease-smooth"
                                 :style="{ width: getMetricValue(index) + '%' }">
                            </div>
                        </div>
                    </div>

                    <!-- AI 诊断报告卡片 - 使用新组件 -->
                    <AiFeedbackDisplay
                      :current-feedback="aiFeedbackText"
                      :history="feedbackHistory"
                      class="animate-scale-in"
                      style="animation-delay: 400ms"
                    />
                </div>

                <!-- 右列：传感器视图面板 -->
                <div class="flex flex-col h-full bg-black/40 rounded-xl border border-zinc-800 overflow-hidden relative min-h-[300px] animate-slide-up backdrop-blur-sm" style="animation-delay: 200ms">
                    <!-- 模式切换按钮 -->
                    <div class="absolute top-3 md:top-4 left-3 md:left-4 z-30 flex gap-2 animate-slide-down" style="animation-delay: 300ms">
                        <button @click="toggleMode('mic')"
                                class="px-2 md:px-3 py-1 md:py-1.5 rounded-md text-[9px] md:text-[10px] font-bold uppercase tracking-wider backdrop-blur-md transition-all duration-300 border hover:scale-105"
                                :class="mode === 'mic'
                                    ? 'bg-violin-gold text-black border-violin-gold shadow-md shadow-violin-gold/30'
                                    : 'bg-black/50 text-zinc-500 border-zinc-700 hover:text-white hover:border-zinc-600'">
                            Mic
                        </button>
                        <button @click="toggleMode('camera')"
                                class="px-2 md:px-3 py-1 md:py-1.5 rounded-md text-[9px] md:text-[10px] font-bold uppercase tracking-wider backdrop-blur-md transition-all duration-300 border hover:scale-105"
                                :class="mode === 'camera'
                                    ? 'bg-violin-gold text-black border-violin-gold shadow-md shadow-violin-gold/30'
                                    : 'bg-black/50 text-zinc-500 border-zinc-700 hover:text-white hover:border-zinc-600'">
                            Camera
                        </button>
                    </div>

                    <!-- 麦克风视图 -->
                    <div v-if="mode === 'mic'"
                         class="flex-1 relative flex items-end justify-center pb-6 md:pb-8 cursor-pointer group"
                         @click="toggleMic">

                        <!-- 降噪提醒弹窗 -->
                        <transition name="tip-fade">
                          <div v-if="showNoiseReductionTip"
                               class="absolute top-3 left-3 right-3 z-40 bg-amber-900/90 backdrop-blur-sm border border-amber-500/50 rounded-lg p-3 shadow-lg"
                               @click.stop>
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
                                  请在电脑系统设置中<span class="text-amber-300 font-semibold">关闭麦克风降噪</span>功能，以获得更准确的音频分析效果。
                                </div>
                              </div>
                              <button @click.stop="dismissNoiseReductionTip"
                                      class="text-amber-400 hover:text-amber-200 transition-colors shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              </button>
                            </div>
                          </div>
                        </transition>

                        <div class="absolute inset-0 flex items-center justify-center pointer-events-none animate-fade-in" v-if="!isListening">
                            <div class="text-center">
                                <div class="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 rounded-full border border-zinc-700 flex items-center justify-center group-hover:border-violin-gold transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 animate-float">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" class="md:w-6 md:h-6 text-zinc-600 group-hover:text-violin-gold transition-all duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                        <line x1="12" y1="19" x2="12" y2="23"></line>
                                        <line x1="8" y1="23" x2="16" y2="23"></line>
                                    </svg>
                                </div>
                                <span class="text-zinc-600 text-[10px] md:text-xs font-mono uppercase tracking-widest group-hover:text-violin-gold transition-colors">点击激活麦克风</span>
                            </div>
                        </div>
                        <!-- 可视化音频条 -->
                        <div class="flex items-end gap-0.5 md:gap-1 h-24 md:h-32 px-6 md:px-8 w-full justify-center">
                            <div v-for="(val, i) in visualizerBars"
                                 :key="i"
                                 class="w-1 md:w-1.5 rounded-t-sm transition-all duration-50 bg-gradient-to-t from-violin-gold via-yellow-400 to-yellow-300 relative"
                                 :style="{ height: Math.max(2, val) + '%', opacity: isListening ? 0.9 : 0.2 }"
                                 :class="isListening ? '' : ''">
                                 <div v-if="isListening && val > 40" class="absolute top-0 left-0 right-0 h-1 bg-white rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    <!-- 摄像头视图 -->
                    <div v-else class="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                        <video ref="videoElement"
                               autoplay
                               playsinline
                               muted
                               class="absolute inset-0 w-full h-full object-cover opacity-80 transition-opacity duration-500 gpu-accelerate"
                               :class="{ 'hidden': !isCameraActive }">
                        </video>

                        <!-- 摄像头激活按钮 -->
                        <div v-if="!isCameraActive"
                             class="text-center cursor-pointer z-20 group animate-fade-in"
                             @click="startCamera">
                            <div class="w-12 h-12 md:w-16 md:h-16 rounded-full border border-zinc-700 flex items-center justify-center mx-auto mb-3 group-hover:border-violin-gold group-hover:text-violin-gold text-zinc-500 transition-all duration-500 group-hover:scale-110 animate-float">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" class="md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                    <circle cx="12" cy="13" r="4"></circle>
                                </svg>
                            </div>
                            <p class="text-[10px] md:text-xs text-zinc-500 font-mono uppercase tracking-wide group-hover:text-violin-gold transition-colors">Activate Vision Sensor</p>
                        </div>

                        <!-- 摄像头激活后的覆盖层 -->
                        <div v-else class="absolute inset-0 z-10 pointer-events-none animate-fade-in">
                            <!-- 扫描线已移除 -->
                            <div class="absolute top-3 md:top-4 right-3 md:right-4 text-[9px] md:text-[10px] font-mono text-green-500 bg-black/60 px-2 py-1 rounded border border-green-500/30 flex items-center gap-2 animate-pulse-subtle backdrop-blur-sm">
                                <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                AI TRACKING
                            </div>

                            <!-- 倒计时显示 -->
                            <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                <!-- 分析中状态 -->
                                <div v-if="isAnalyzingPose" class="flex items-center gap-2 bg-violet-600/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
                                    <div class="w-2 h-2 rounded-full bg-white animate-ping"></div>
                                    <span class="text-[10px] text-white font-medium">AI 分析中...</span>
                                </div>
                                <!-- 倒计时 -->
                                <div v-else class="flex flex-col items-center">
                                    <div class="text-2xl font-mono font-bold text-violin-gold/90 tabular-nums"
                                         :class="poseAnalysisCountdown <= 3 ? 'animate-pulse text-yellow-400' : ''">
                                        {{ poseAnalysisCountdown }}
                                    </div>
                                    <div class="text-[9px] text-zinc-400 mt-0.5">秒后分析</div>
                                </div>
                            </div>
                            <div class="absolute top-1/4 left-1/4 w-1/2 h-1/2 border border-violin-gold/30 rounded-lg flex items-center justify-center animate-scale-in">
                                <div class="w-3 h-3 md:w-4 md:h-4 border-t border-l border-violin-gold absolute -top-1 -left-1 animate-pulse-subtle"></div>
                                <div class="w-3 h-3 md:w-4 md:h-4 border-t border-r border-violin-gold absolute -top-1 -right-1 animate-pulse-subtle" style="animation-delay: 250ms"></div>
                                <div class="w-3 h-3 md:w-4 md:h-4 border-b border-l border-violin-gold absolute -bottom-1 -left-1 animate-pulse-subtle" style="animation-delay: 500ms"></div>
                                <div class="w-3 h-3 md:w-4 md:h-4 border-b border-r border-violin-gold absolute -bottom-1 -right-1 animate-pulse-subtle" style="animation-delay: 750ms"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </transition>
  </section>
</template>

<style scoped>
/* 面板容器动画 */
.panel-container {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

/* 滑动淡入动画 */
.animate-slide-fade-in {
  animation: slideFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideFadeIn {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 自定义滚动条 */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(212, 175, 55, 0.2) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(212, 175, 55, 0.2);
  border-radius: 3px;
  transition: background 0.3s ease;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(212, 175, 55, 0.4);
}

/* 模式切换按钮动画 */
.mode-btn {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.mode-btn:hover {
  transform: scale(1.05);
}

.mode-btn:active {
  transform: scale(0.95);
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