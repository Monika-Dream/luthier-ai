<template>
  <div class="w-full h-full flex flex-col animate-fade-in">
    <!-- 标题区域 -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-white mb-2">智能乐谱分析</h2>
      <p class="text-sm text-zinc-400">上传您的五线谱图片，AI 将为您标注技术难点并提供练习建议</p>
    </div>

    <!-- 上传区域 -->
    <div v-if="!uploadedImage" class="flex-1 flex items-center justify-center">
      <div class="w-full max-w-2xl">
        <div
          @click="triggerFileInput"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
          class="relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300"
          :class="isDragging
            ? 'border-violet-500 bg-violet-500/10'
            : 'border-zinc-700 hover:border-violet-500/50 bg-zinc-900/50 hover:bg-zinc-900/80'">

          <!-- 图标 -->
          <div class="mb-6 flex justify-center">
            <div class="relative">
              <div class="w-24 h-24 rounded-full bg-violet-600/20 flex items-center justify-center">
                <svg class="w-12 h-12 text-violet-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                </svg>
              </div>
              <div class="absolute -bottom-2 -right-2 w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- 文字提示 -->
          <h3 class="text-xl font-semibold text-white mb-2">
            {{ isDragging ? '松开鼠标上传' : '点击或拖拽上传乐谱' }}
          </h3>
          <p class="text-sm text-zinc-500 mb-4">支持 JPG、PNG、PDF 格式，建议清晰度 300DPI 以上</p>

          <!-- 按钮 -->
          <button class="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105">
            选择文件
          </button>

          <!-- 隐藏的文件输入 -->
          <input
            ref="fileInput"
            type="file"
            @change="handleFileSelect"
            accept="image/*,.pdf"
            class="hidden"
          >
        </div>

        <!-- 示例乐谱 -->
        <div class="mt-6">
          <p class="text-xs text-zinc-500 mb-3">或者试试示例乐谱：</p>
          <div class="grid grid-cols-3 gap-3">
            <button
              v-for="(sample, index) in sampleScores"
              :key="index"
              @click="loadSampleScore(sample)"
              class="p-3 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-lg text-xs text-zinc-400 hover:text-white transition-all duration-300">
              {{ sample.name }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 分析展示区域 -->
    <div v-else class="flex-1 flex gap-6">
      <!-- 左侧：原始乐谱 -->
      <div class="flex-1">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-zinc-400">原始乐谱</h3>
          <button
            @click="resetUpload"
            class="text-xs text-zinc-500 hover:text-white transition-colors">
            重新上传
          </button>
        </div>

        <div class="relative bg-zinc-900 rounded-xl overflow-hidden">
          <!-- 图片容器 -->
          <div class="relative" ref="imageContainer">
            <img
              :src="uploadedImage"
              alt="Uploaded sheet music"
              class="w-full h-auto"
              @load="onImageLoad"
            >

            <!-- 标注层 -->
            <svg
              v-if="showAnnotations"
              class="absolute inset-0 w-full h-full pointer-events-none"
              :viewBox="`0 0 ${imageSize.width} ${imageSize.height}`"
              style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">

              <!-- 难点标注 -->
              <g v-for="(annotation, index) in annotations" :key="index">
                <!-- 标注框 -->
                <rect
                  :x="annotation.x"
                  :y="annotation.y"
                  :width="annotation.width"
                  :height="annotation.height"
                  :fill="getDifficultyColor(annotation.difficulty, 0.1)"
                  :stroke="getDifficultyColor(annotation.difficulty)"
                  stroke-width="2"
                  rx="4"
                  class="animate-pulse"
                />

                <!-- 标签 -->
                <g :transform="`translate(${annotation.x}, ${annotation.y - 10})`">
                  <rect
                    x="0"
                    y="-20"
                    :width="annotation.label.length * 8 + 16"
                    height="24"
                    :fill="getDifficultyColor(annotation.difficulty)"
                    rx="4"
                  />
                  <text
                    x="8"
                    y="-2"
                    fill="white"
                    font-size="12"
                    font-weight="600">
                    {{ annotation.label }}
                  </text>
                </g>
              </g>
            </svg>
          </div>

          <!-- 控制栏 -->
          <div class="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <button
              @click="toggleAnnotations"
              class="px-4 py-2 bg-black/60 backdrop-blur-sm rounded-lg text-xs font-semibold transition-all duration-300"
              :class="showAnnotations ? 'text-violet-400' : 'text-zinc-400 hover:text-white'">
              {{ showAnnotations ? '隐藏标注' : '显示标注' }}
            </button>

            <div class="flex gap-2">
              <button
                @click="zoomIn"
                class="w-8 h-8 bg-black/60 backdrop-blur-sm rounded-lg flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"/>
                </svg>
              </button>
              <button
                @click="zoomOut"
                class="w-8 h-8 bg-black/60 backdrop-blur-sm rounded-lg flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：分析结果 -->
      <div class="w-96">
        <div class="mb-3">
          <h3 class="text-sm font-semibold text-zinc-400">AI 分析报告</h3>
        </div>

        <!-- 加载状态 -->
        <div v-if="isAnalyzing" class="bg-zinc-900 rounded-xl p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-2 h-2 bg-violet-500 rounded-full animate-ping"></div>
            <span class="text-sm text-zinc-400">正在分析乐谱...</span>
          </div>
          <div class="space-y-2">
            <div class="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div class="h-full bg-violet-600 rounded-full animate-pulse" style="width: 60%"></div>
            </div>
            <p class="text-xs text-zinc-500">识别音符、节奏型、技术要点...</p>
          </div>
        </div>

        <!-- 分析结果 -->
        <div v-else-if="analysisResult" class="space-y-4">
          <!-- API 状态提示 -->
          <div v-if="apiStatus !== 'success'" class="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3">
            <div class="flex items-start gap-2">
              <svg class="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div class="flex-1">
                <p class="text-sm text-yellow-200 font-semibold mb-1">
                  {{ apiStatus === 'mock' ? '演示模式' : 'API 限制' }}
                </p>
                <p class="text-xs text-yellow-300/80">
                  <template v-if="apiStatus === 'mock'">
                    当前使用模拟数据进行演示。实际使用时，AI 会根据您上传的乐谱进行精准分析。
                  </template>
                  <template v-else-if="apiStatus === 'gemini-fallback'">
                    正在使用备用 Gemini API。分析功能正常运行。
                  </template>
                  <template v-else-if="apiStatus === 'all-failed'">
                    所有 API 服务暂时不可用，使用模拟数据展示功能。
                  </template>
                </p>
              </div>
            </div>
          </div>

          <!-- 分析结果内容 -->
          <div class="bg-zinc-900 rounded-xl overflow-hidden">
          <!-- 总体难度 -->
          <div class="p-4 bg-gradient-to-r from-violet-600/20 to-purple-600/20 border-b border-zinc-800">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-zinc-400">整体难度</span>
              <div class="flex gap-1">
                <div
                  v-for="i in 5"
                  :key="i"
                  class="w-2 h-8 rounded-full transition-all duration-300"
                  :class="i <= analysisResult.overallDifficulty ? 'bg-violet-500' : 'bg-zinc-700'">
                </div>
              </div>
            </div>
            <p class="text-xs text-zinc-500">{{ getDifficultyText(analysisResult.overallDifficulty) }}</p>
          </div>

          <!-- 技术要点 -->
          <div class="p-4 space-y-4">
            <div>
              <h4 class="text-sm font-semibold text-white mb-3">技术难点</h4>
              <div class="space-y-2">
                <div
                  v-for="(point, index) in analysisResult.technicalPoints"
                  :key="index"
                  class="flex items-start gap-2">
                  <div
                    class="w-1.5 h-1.5 rounded-full mt-1.5"
                    :class="getDifficultyDotColor(point.difficulty)">
                  </div>
                  <div class="flex-1">
                    <p class="text-sm text-zinc-300">{{ point.description }}</p>
                    <p class="text-xs text-zinc-500 mt-1">{{ point.location }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 练习建议 -->
            <div>
              <h4 class="text-sm font-semibold text-white mb-3">练习建议</h4>
              <div class="space-y-3">
                <div
                  v-for="(suggestion, index) in analysisResult.suggestions"
                  :key="index"
                  class="bg-zinc-800/50 rounded-lg p-3">
                  <div class="flex items-start gap-2">
                    <span class="text-violet-400 text-sm font-bold">{{ index + 1 }}</span>
                    <div class="flex-1">
                      <p class="text-sm text-zinc-300 mb-1">{{ suggestion.title }}</p>
                      <p class="text-xs text-zinc-500">{{ suggestion.detail }}</p>
                      <div v-if="suggestion.tempo" class="mt-2 flex items-center gap-2">
                        <svg class="w-3 h-3 text-zinc-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span class="text-xs text-zinc-500">建议速度: {{ suggestion.tempo }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 导出按钮 -->
            <div class="pt-4 border-t border-zinc-800">
              <button
                @click="exportAnalysis"
                class="w-full px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-semibold text-sm transition-all duration-300">
                导出练习计划
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { analyzeSheetMusic } from '../services/geminiService'

// 状态管理
const isDragging = ref(false)
const uploadedImage = ref(null)
const isAnalyzing = ref(false)
const showAnnotations = ref(true)
const analysisResult = ref(null)
const annotations = ref([])
const imageSize = ref({ width: 0, height: 0 })
const zoomLevel = ref(1)
const apiStatus = ref('success') // 'success', 'mock', 'gemini-fallback', 'all-failed'

// DOM 引用
const fileInput = ref(null)
const imageContainer = ref(null)

// 示例乐谱
const sampleScores = [
  { name: '巴赫 G大调小步舞曲', url: '/samples/bach-minuet.jpg' },
  { name: '帕格尼尼 随想曲', url: '/samples/paganini-caprice.jpg' },
  { name: '梁祝 化蝶段落', url: '/samples/butterfly-lovers.jpg' }
]

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value?.click()
}

// 处理文件选择
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    processFile(file)
  }
}

// 处理拖放
const handleDrop = (event) => {
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  if (file) {
    processFile(file)
  }
}

// 处理文件
const processFile = (file) => {
  if (!file.type.match(/image.*/) && !file.type.match(/pdf/)) {
    alert('请上传图片或PDF文件')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    uploadedImage.value = e.target.result
    analyzeImage(e.target.result)
  }
  reader.readAsDataURL(file)
}

// 加载示例乐谱
const loadSampleScore = (sample) => {
  uploadedImage.value = sample.url
  analyzeImage(sample.url)
}

// 分析图片
const analyzeImage = async (imageUrl) => {
  isAnalyzing.value = true
  apiStatus.value = 'success' // 重置状态

  try {
    // 尝试调用 Gemini API 分析乐谱
    const result = await analyzeSheetMusic(imageUrl)

    // 如果API返回了有效结果
    if (result && result.overallDifficulty) {
      analysisResult.value = result

      // 更新API状态
      if (result.apiStatus) {
        apiStatus.value = result.apiStatus
      }

      // 根据返回的坐标生成标注
      if (result.technicalPoints && result.technicalPoints.length > 0) {
        annotations.value = result.technicalPoints.map(point => ({
          x: point.coordinates?.x || Math.random() * 400 + 100,
          y: point.coordinates?.y || Math.random() * 300 + 100,
          width: point.coordinates?.width || 150,
          height: point.coordinates?.height || 60,
          label: point.description,
          difficulty: point.difficulty
        }))
      }
    }
  } catch (error) {
    console.error('API调用失败，使用模拟数据:', error)
    apiStatus.value = 'mock'

    // 使用更丰富的模拟数据
    analysisResult.value = {
      overallDifficulty: 4,
      technicalPoints: [
        {
          description: '快速十六分音符跑动',
          location: '第3-4小节',
          difficulty: 'high'
        },
        {
          description: '第三把位大跨度换把',
          location: '第7小节',
          difficulty: 'medium'
        },
        {
          description: '双音和弦进行',
          location: '第12-13小节',
          difficulty: 'high'
        },
        {
          description: '人工泛音段落',
          location: '第18小节',
          difficulty: 'medium'
        },
        {
          description: '连顿弓技巧',
          location: '第22-23小节',
          difficulty: 'low'
        }
      ],
      suggestions: [
        {
          title: '慢速分解练习',
          detail: '将快速音群分解为四个音一组，每组重复5遍后连接，确保每个音清晰准确',
          tempo: '♩ = 60-80'
        },
        {
          title: '换把专项训练',
          detail: '单独练习换把动作，注意拇指引导和手型保持，使用滑音连接练习',
          tempo: '♩ = 40-60'
        },
        {
          title: '双音音准练习',
          detail: '先分别练习两个声部，确保各声部音准后再合并，注意手指按弦力度平衡',
          tempo: '♩ = 50-70'
        },
        {
          title: '节奏型强化',
          detail: '使用节拍器，从慢速开始逐步提速至原速的120%，再回到原速',
          tempo: '♩ = 80-120'
        }
      ]
    }

    // 生成模拟标注（基于图片尺寸的相对位置）
    const mockAnnotations = [
      { x: 100, y: 150, width: 200, height: 60, label: '快速音群', difficulty: 'high' },
      { x: 350, y: 200, width: 150, height: 50, label: '换把', difficulty: 'medium' },
      { x: 180, y: 300, width: 180, height: 70, label: '双音', difficulty: 'high' },
      { x: 400, y: 350, width: 120, height: 40, label: '泛音', difficulty: 'medium' },
      { x: 250, y: 420, width: 160, height: 45, label: '连顿弓', difficulty: 'low' }
    ]

    // 如果有图片尺寸，调整标注位置
    if (imageSize.value.width > 0) {
      annotations.value = mockAnnotations.map(ann => ({
        ...ann,
        x: (ann.x / 600) * imageSize.value.width,
        y: (ann.y / 500) * imageSize.value.height,
        width: (ann.width / 600) * imageSize.value.width,
        height: (ann.height / 500) * imageSize.value.height
      }))
    } else {
      annotations.value = mockAnnotations
    }
  } finally {
    isAnalyzing.value = false
  }
}

// 图片加载完成
const onImageLoad = (event) => {
  imageSize.value = {
    width: event.target.naturalWidth,
    height: event.target.naturalHeight
  }
}

// 切换标注显示
const toggleAnnotations = () => {
  showAnnotations.value = !showAnnotations.value
}

// 缩放功能
const zoomIn = () => {
  zoomLevel.value = Math.min(zoomLevel.value * 1.2, 3)
  applyZoom()
}

const zoomOut = () => {
  zoomLevel.value = Math.max(zoomLevel.value / 1.2, 0.5)
  applyZoom()
}

const applyZoom = () => {
  if (imageContainer.value) {
    imageContainer.value.style.transform = `scale(${zoomLevel.value})`
    imageContainer.value.style.transformOrigin = 'center'
  }
}

// 重置上传
const resetUpload = () => {
  uploadedImage.value = null
  analysisResult.value = null
  annotations.value = []
  zoomLevel.value = 1
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 获取难度颜色
const getDifficultyColor = (difficulty, opacity = 1) => {
  const colors = {
    low: `rgba(34, 197, 94, ${opacity})`,    // 绿色
    medium: `rgba(251, 191, 36, ${opacity})`, // 黄色
    high: `rgba(239, 68, 68, ${opacity})`     // 红色
  }
  return colors[difficulty] || colors.medium
}

// 获取难度点颜色
const getDifficultyDotColor = (difficulty) => {
  const colors = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-red-500'
  }
  return colors[difficulty] || 'bg-yellow-500'
}

// 获取难度文字
const getDifficultyText = (level) => {
  const texts = {
    1: '入门级 - 适合初学者',
    2: '初级 - 需要基本技巧',
    3: '中级 - 需要扎实基础',
    4: '高级 - 需要专业水平',
    5: '专业级 - 演奏家水准'
  }
  return texts[level] || '评估中...'
}

// 导出分析结果
const exportAnalysis = () => {
  if (!analysisResult.value) return

  const content = `
乐谱分析报告
================
整体难度: ${getDifficultyText(analysisResult.value.overallDifficulty)}

技术难点:
${analysisResult.value.technicalPoints.map(p => `- ${p.description} (${p.location})`).join('\n')}

练习建议:
${analysisResult.value.suggestions.map((s, i) => `${i + 1}. ${s.title}\n   ${s.detail}\n   ${s.tempo || ''}`).join('\n\n')}

生成时间: ${new Date().toLocaleString()}
  `

  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '乐谱练习计划.txt'
  a.click()
  URL.revokeObjectURL(url)
}
</script>