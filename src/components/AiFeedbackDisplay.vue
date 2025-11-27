<template>
  <div class="flex flex-col h-full">
    <!-- 当前反馈 -->
    <div class="p-4 md:p-5 border border-violin-gold/20 bg-gradient-to-br from-violin-gold/5 to-transparent rounded-lg relative overflow-hidden backdrop-blur-sm flex-shrink-0">
      <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violin-gold to-yellow-500/50 animate-pulse-subtle"></div>
      <h4 class="text-violin-gold text-xs md:text-sm font-serif mb-2 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" class="md:w-3.5 md:h-3.5 animate-pulse-subtle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        AI 诊断报告
      </h4>

      <!-- 格式化的反馈内容 -->
      <div class="text-[10px] md:text-xs text-zinc-300 leading-relaxed font-light max-h-32 overflow-y-auto custom-scrollbar">
        <div v-html="formatFeedback(currentFeedback)"></div>
      </div>
    </div>

    <!-- 历史记录按钮 -->
    <button
      v-if="history.length > 0"
      @click="showHistory = !showHistory"
      class="mt-3 px-3 py-1.5 text-[10px] text-zinc-400 hover:text-violin-gold border border-zinc-800 hover:border-violin-gold/30 rounded-md transition-all flex items-center gap-2 justify-center bg-black/20 hover:bg-black/40 flex-shrink-0"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 3v18h18"></path>
        <path d="M18 17V9"></path>
        <path d="M13 17V5"></path>
        <path d="M8 17v-3"></path>
      </svg>
      {{ showHistory ? '隐藏历史' : `查看历史 (${history.length})` }}
    </button>

    <!-- 历史记录列表 -->
    <transition name="slide-down">
      <div v-if="showHistory" class="mt-3 flex-1 min-h-0 overflow-hidden flex flex-col">
        <h5 class="text-[10px] text-zinc-500 uppercase tracking-wider mb-2 flex-shrink-0">历史评价记录</h5>
        <div class="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-2">
          <div
            v-for="item in history"
            :key="item.id"
            class="p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-all group"
          >
            <div class="flex items-center justify-between mb-1">
              <span
                class="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded"
                :class="getTypeClass(item.type)"
              >
                {{ getTypeLabel(item.type) }}
              </span>
              <span class="text-[9px] text-zinc-600 font-mono">{{ item.timestamp }}</span>
            </div>
            <div class="text-[10px] text-zinc-400 leading-relaxed" v-html="formatFeedback(item.content)"></div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  currentFeedback: {
    type: String,
    default: '等待数据输入...'
  },
  history: {
    type: Array,
    default: () => []
  }
})

const showHistory = ref(false)

// 格式化反馈文本
const formatFeedback = (text) => {
  if (!text) return ''

  let formatted = text
    // 转换 emoji 和符号
    .replace(/✓/g, '<span class="text-green-400">✓</span>')
    .replace(/⚠/g, '<span class="text-yellow-400">⚠</span>')
    .replace(/✗|❌/g, '<span class="text-red-400">✗</span>')
    .replace(/💡/g, '<span class="text-blue-400">💡</span>')

    // 强调数字和单位
    .replace(/(\d+)\s*(cents|Hz|BPM|°|%)/g, '<strong class="text-violin-gold">$1$2</strong>')

    // 分段处理（支持换行）
    .replace(/\n/g, '<br>')

    // 列表项（• 或 - 开头）
    .replace(/^[•\-]\s+(.+)$/gm, '<li class="ml-3 mb-1">$1</li>')

    // 标题（数字+点号开头）
    .replace(/^(\d+)\.\s+(.+)$/gm, '<div class="font-semibold text-zinc-200 mt-2 mb-1">$1. $2</div>')

  // 如果有列表项，包裹在 ul 中
  if (formatted.includes('<li')) {
    formatted = formatted.replace(/(<li.+<\/li>)/s, '<ul class="space-y-1 my-2">$1</ul>')
  }

  return formatted
}

// 获取类型标签
const getTypeLabel = (type) => {
  const labels = {
    audio: '音频',
    pose: '姿势',
    pitch: '音准',
    general: '综合'
  }
  return labels[type] || '综合'
}

// 获取类型样式
const getTypeClass = (type) => {
  const classes = {
    audio: 'bg-blue-500/20 text-blue-300',
    pose: 'bg-purple-500/20 text-purple-300',
    pitch: 'bg-green-500/20 text-green-300',
    general: 'bg-zinc-700/50 text-zinc-400'
  }
  return classes[type] || classes.general
}
</script>

<style scoped>
/* 滑动动画 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 自定义滚动条 */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(212, 175, 55, 0.3);
  border-radius: 2px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(212, 175, 55, 0.5);
}
</style>
