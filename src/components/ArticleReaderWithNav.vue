<template>
  <div class="w-full h-full flex flex-col bg-gradient-to-br from-zinc-900/50 to-black/30 rounded-xl overflow-hidden">
    <!-- 头部导航 -->
    <div class="bg-black/20 border-b border-white/5 px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button
            @click="handleBack"
            class="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-white transition-all duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div>
            <h2 class="text-xl font-serif text-white">{{ currentTitle }}</h2>
            <p class="text-xs text-zinc-500 mt-1">{{ currentSubtitle }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="toggleFontSize"
            class="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-white transition-all duration-300"
            title="调整字体大小"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10h-6m6-4h-8m8 8h-4"/>
              <path d="M3 10h8L8 3 5 10m0 0L3 16h10"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="flex-1 flex overflow-hidden">
      <!-- 左侧导航栏 -->
      <div v-if="showNav && subArticles.length > 0" class="w-64 border-r border-white/5 bg-black/20 overflow-y-auto custom-scrollbar">
        <div class="p-4">
          <h3 class="text-sm font-semibold text-violet-gold mb-3">相关文章</h3>
          <div class="space-y-2">
            <button
              v-for="(article, index) in subArticles"
              :key="index"
              @click="selectArticle(article)"
              class="w-full text-left p-3 rounded-lg transition-all duration-300"
              :class="currentArticle?.title === article.title
                ? 'bg-violet-600/20 border border-violet-600/50 text-white'
                : 'bg-zinc-800/30 hover:bg-zinc-700/40 text-zinc-400 hover:text-white border border-transparent'"
            >
              <div class="text-sm font-medium">{{ article.title }}</div>
              <div class="text-xs text-zinc-500 mt-1 line-clamp-2">{{ article.subtitle }}</div>
            </button>
          </div>
        </div>
      </div>

      <!-- 主内容 -->
      <div class="flex-1 overflow-y-auto custom-scrollbar p-6 relative"
           @contextmenu.prevent>
        <div
          ref="contentRef"
          class="prose prose-invert max-w-none"
          :class="fontSizeClass"
          @mouseup="handleTextSelection"
        >
          <!-- 渲染内容 -->
          <div v-if="!currentArticle && subArticles.length > 0" class="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="mx-auto text-zinc-600 mb-4">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <h3 class="text-xl text-zinc-400 mb-2">选择一篇文章开始阅读</h3>
            <p class="text-sm text-zinc-500">从左侧列表中选择您感兴趣的内容</p>
          </div>

          <div v-else v-html="processedContent"></div>

          <!-- 图片/乐谱展示 -->
          <div v-if="currentArticle?.images && currentArticle.images.length > 0" class="mt-8 space-y-6">
            <div v-for="(image, index) in currentArticle.images" :key="index" class="relative group">
              <img
                :src="image.src"
                :alt="image.alt"
                class="w-full rounded-lg shadow-2xl cursor-pointer transition-transform duration-300 group-hover:scale-[1.02]"
                @click="openImageViewer(image)"
              />
              <div v-if="image.caption" class="mt-2 text-sm text-zinc-500 text-center">
                {{ image.caption }}
              </div>
            </div>
          </div>

          <!-- 视频链接区域 -->
          <div v-if="currentArticle?.videos && currentArticle.videos.length > 0" class="mt-8 space-y-4">
            <h3 class="text-lg font-semibold text-violet-gold mb-4">推荐视频</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                v-for="(video, index) in currentArticle.videos"
                :key="index"
                :href="video.url"
                target="_blank"
                rel="noopener noreferrer"
                class="group relative bg-zinc-800/50 rounded-lg overflow-hidden hover:bg-zinc-700/50 transition-all duration-300"
              >
                <div class="aspect-video relative">
                  <img
                    v-if="video.thumbnail"
                    :src="video.thumbnail"
                    :alt="video.title"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full bg-gradient-to-br from-violet-900/20 to-purple-900/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-violet-600/50">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  </div>
                  <div class="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                    <div class="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="black">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <div class="p-3">
                  <h4 class="text-sm font-medium text-white group-hover:text-violet-gold transition-colors">{{ video.title }}</h4>
                  <p class="text-xs text-zinc-500 mt-1">{{ video.author }}</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        <!-- 选中文本弹窗 -->
        <div
          v-if="showSelectionMenu"
          ref="selectionMenuRef"
          :style="selectionMenuStyle"
          class="absolute z-50 bg-zinc-800 rounded-lg shadow-2xl border border-zinc-700 py-2 animate-scale-in"
        >
          <button
            @click="askAI"
            class="flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-zinc-700 transition-colors w-full text-left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
            询问 AI
          </button>
          <button
            @click="copySelection"
            class="flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-zinc-700 transition-colors w-full text-left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            复制
          </button>
        </div>
      </div>

      <!-- AI 助手面板 - 改为固定定位，不影响文章布局 -->
      <transition name="slide">
        <div
          v-if="showAIPanel"
          class="fixed right-0 top-0 bottom-0 w-96 bg-zinc-900/95 backdrop-blur-xl shadow-2xl border-l border-white/10 flex flex-col z-50"
        >
          <!-- AI 面板头部 -->
          <div class="p-4 border-b border-white/5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span class="text-sm font-medium text-white">AI 助手</span>
              </div>
              <button
                @click="closeAIPanel"
                class="p-1 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- AI 对话区 -->
          <div class="flex-1 overflow-y-auto custom-scrollbar p-4">
            <div class="space-y-4">
              <!-- 用户选中的文本 -->
              <div class="bg-zinc-800/50 rounded-lg p-3">
                <div class="text-xs text-zinc-500 mb-2">您选中的内容：</div>
                <div class="text-sm text-zinc-300 italic">{{ selectedText }}</div>
              </div>

              <!-- AI 回复 -->
              <div v-if="aiResponse" class="bg-gradient-to-r from-violet-900/20 to-purple-900/20 rounded-lg p-4">
                <div class="flex items-start gap-3">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none">
                      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm3 7.5a.5.5 0 0 1-.5.5h-2v3.5a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5V13h-2a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v1z"/>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <div class="text-sm text-white leading-relaxed whitespace-pre-wrap">{{ aiResponse }}</div>
                  </div>
                </div>
              </div>

              <!-- 加载动画 -->
              <div v-else-if="aiLoading" class="flex items-center justify-center py-8">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style="animation-delay: 0ms"></div>
                  <div class="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style="animation-delay: 150ms"></div>
                  <div class="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style="animation-delay: 300ms"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 输入区 -->
          <div class="p-4 border-t border-white/5">
            <div class="flex gap-2">
              <input
                v-model="userQuestion"
                @keyup.enter="sendQuestion"
                type="text"
                placeholder="继续提问..."
                class="flex-1 px-3 py-2 bg-zinc-800/50 rounded-lg text-sm text-white placeholder-zinc-500 border border-zinc-700 focus:border-violet-500 focus:outline-none transition-colors"
              />
              <button
                @click="sendQuestion"
                :disabled="!userQuestion.trim()"
                class="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-violet-600/30"
              >
                发送
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- 图片查看器 -->
    <div
      v-if="showImageViewer"
      @click="closeImageViewer"
      class="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-8 animate-fade-in"
    >
      <img
        :src="currentImage?.src"
        :alt="currentImage?.alt"
        class="max-w-full max-h-full rounded-lg shadow-2xl animate-scale-in"
        @click.stop
      />
      <button
        @click="closeImageViewer"
        class="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { explainMusicTheory } from '../services/geminiService'

const props = defineProps({
  title: String,
  subtitle: String,
  content: String,
  images: Array,
  videos: Array,
  subArticles: {
    type: Array,
    default: () => []
  },
  showNav: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['back', 'selectArticle'])

// 状态管理
const currentArticle = ref(null)
const fontSize = ref('normal')
const selectedText = ref('')
const showSelectionMenu = ref(false)
const selectionMenuStyle = ref({})
const showAIPanel = ref(false)
const aiResponse = ref('')
const aiLoading = ref(false)
const userQuestion = ref('')
const showImageViewer = ref(false)
const currentImage = ref(null)
const contentRef = ref(null)
const selectionMenuRef = ref(null)

// 计算属性
const currentTitle = computed(() => currentArticle.value?.title || props.title)
const currentSubtitle = computed(() => currentArticle.value?.subtitle || props.subtitle)
const fontSizeClass = computed(() => {
  const classes = {
    small: 'text-sm',
    normal: 'text-base',
    large: 'text-lg'
  }
  return classes[fontSize.value]
})

// 处理内容
const processedContent = computed(() => {
  const content = currentArticle.value?.content || props.content
  if (!content) return ''

  // 处理内联格式的辅助函数
  const processInlineFormatting = (text) => {
    // 处理粗体 **text**
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    // 处理链接 [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors">$1</a>')
    return text
  }

  // 将内容分段并添加适当的HTML标签
  const lines = content.split('\n')
  let html = ''
  let inList = false
  let listItems = []

  const flushList = () => {
    if (listItems.length > 0) {
      html += `<ul class="list-disc list-inside space-y-2 text-zinc-300 mb-4 ml-4">${listItems.join('')}</ul>`
      listItems = []
    }
    inList = false
  }

  lines.forEach((line, index) => {
    const trimmedLine = line.trim()

    // 空行
    if (!trimmedLine) {
      flushList()
      return
    }

    // 处理标题
    if (trimmedLine.startsWith('#')) {
      flushList()
      const match = trimmedLine.match(/^(#+)\s*(.*)$/)
      if (match) {
        const level = Math.min(match[1].length, 6)
        const text = processInlineFormatting(match[2])
        const sizeClasses = {
          1: 'text-2xl mt-8 mb-4',
          2: 'text-xl mt-6 mb-3',
          3: 'text-lg mt-5 mb-2',
          4: 'text-base mt-4 mb-2',
          5: 'text-sm mt-3 mb-2',
          6: 'text-sm mt-3 mb-2'
        }
        html += `<h${level} class="text-white font-serif font-bold ${sizeClasses[level]}">${text}</h${level}>`
      }
      return
    }

    // 处理列表项（• 或 - 或 数字.）
    if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || /^\d+\.\s/.test(trimmedLine)) {
      inList = true
      const itemText = trimmedLine.replace(/^[•\-]\s*/, '').replace(/^\d+\.\s*/, '')
      listItems.push(`<li class="text-zinc-300">${processInlineFormatting(itemText)}</li>`)
      return
    }

    // 普通段落
    flushList()
    html += `<p class="text-zinc-300 leading-relaxed mb-4">${processInlineFormatting(trimmedLine)}</p>`
  })

  // 处理最后可能剩余的列表
  flushList()

  return html
})

// 方法
const handleBack = () => {
  if (currentArticle.value && props.subArticles.length > 0) {
    currentArticle.value = null
  } else {
    emit('back')
  }
}

const selectArticle = (article) => {
  currentArticle.value = article
  emit('selectArticle', article)
}

const toggleFontSize = () => {
  const sizes = ['small', 'normal', 'large']
  const currentIndex = sizes.indexOf(fontSize.value)
  fontSize.value = sizes[(currentIndex + 1) % sizes.length]
}

const handleTextSelection = async () => {
  const selection = window.getSelection()
  const text = selection.toString().trim()

  if (text) {
    selectedText.value = text
    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    const containerRect = contentRef.value.getBoundingClientRect()

    selectionMenuStyle.value = {
      top: `${rect.bottom - containerRect.top + contentRef.value.scrollTop + 10}px`,
      left: `${rect.left - containerRect.left + rect.width / 2}px`,
      transform: 'translateX(-50%)'
    }

    showSelectionMenu.value = true

    await nextTick()
    document.addEventListener('click', closeSelectionMenu)
  }
}

const closeSelectionMenu = (e) => {
  if (selectionMenuRef.value && !selectionMenuRef.value.contains(e.target)) {
    showSelectionMenu.value = false
    document.removeEventListener('click', closeSelectionMenu)
  }
}

const askAI = async () => {
  showSelectionMenu.value = false
  showAIPanel.value = true
  aiLoading.value = true
  aiResponse.value = ''

  try {
    const response = await explainMusicTheory(selectedText.value, currentTitle.value)
    aiResponse.value = response
  } catch (error) {
    console.error('AI请求失败:', error)
    aiResponse.value = '抱歉，无法获取AI解释。请稍后再试。'
  } finally {
    aiLoading.value = false
  }
}

const copySelection = () => {
  navigator.clipboard.writeText(selectedText.value)
  showSelectionMenu.value = false
}

const sendQuestion = async () => {
  if (!userQuestion.value.trim()) return

  const question = userQuestion.value
  userQuestion.value = ''
  aiLoading.value = true

  try {
    const fullQuestion = `关于"${selectedText.value}"，用户追问：${question}`
    const response = await explainMusicTheory(fullQuestion, currentTitle.value)
    aiResponse.value += '\n\n---\n\n' + response
  } catch (error) {
    console.error('AI请求失败:', error)
  } finally {
    aiLoading.value = false
  }
}

const closeAIPanel = () => {
  showAIPanel.value = false
  aiResponse.value = ''
  selectedText.value = ''
}

const openImageViewer = (image) => {
  currentImage.value = image
  showImageViewer.value = true
}

const closeImageViewer = () => {
  showImageViewer.value = false
  currentImage.value = null
}

// 监听子文章变化
watch(() => props.subArticles, (newVal) => {
  if (newVal && newVal.length > 0 && !currentArticle.value) {
    // 默认不选中任何文章，显示提示信息
  }
}, { immediate: true })
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

@keyframes scale-in {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-scale-in {
  animation: scale-in 0.2s ease-out;
}
</style>