<template>
  <div class="flex-1 flex flex-col p-6 animate-fade-in overflow-y-auto">
    <!-- 标题 -->
    <h2 class="text-2xl font-serif text-white mb-4">
      {{ title }}
    </h2>

    <!-- 内容区域 -->
    <div class="prose prose-invert max-w-none">
      <div class="bg-zinc-900/50 rounded-lg p-6 border border-zinc-800">
        <pre class="whitespace-pre-wrap text-sm text-zinc-300 leading-relaxed font-sans">{{ content }}</pre>
      </div>
    </div>

    <!-- 学习要点 -->
    <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="(metric, index) in metrics"
           :key="index"
           class="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700 hover:border-violin-gold/50 transition-all">
        <h4 class="text-violin-gold text-sm font-semibold mb-2">{{ metric }}</h4>
        <p class="text-xs text-zinc-400">
          {{ getMetricDescription(metric) }}
        </p>
      </div>
    </div>

    <!-- 练习建议 -->
    <div class="mt-6 p-4 bg-gradient-to-br from-violin-gold/10 to-transparent rounded-lg border border-violin-gold/20">
      <h3 class="text-violin-gold font-semibold mb-2 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        练习建议
      </h3>
      <p class="text-sm text-zinc-300">
        {{ getPracticeAdvice() }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { toRefs } from 'vue'

const props = defineProps({
  title: String,
  content: String,
  metrics: Array
})

const { title, content, metrics } = toRefs(props)

const metricDescriptions = {
  '巴赫风格': '对位技巧的运用，声部独立性',
  '对位技巧': '多声部同时进行的艺术',
  '装饰音处理': '颤音、回音、倚音的规范演奏',
  '舞曲节奏': '萨拉班德、库朗特等舞曲特征',
  '莫扎特风格': '优雅轻盈的音乐风格',
  '贝多芬表达': '强烈的戏剧性对比',
  '句法结构': '乐句的起承转合',
  '力度对比': 'piano到forte的层次变化',
  '空弦练习': '建立良好的弓弦接触',
  '音阶模式': '大调、小调及各种调式音阶',
  '琶音练习': '分解和弦的流畅演奏',
  '双音练习': '同时演奏两个音的技巧'
}

const getMetricDescription = (metric) => {
  return metricDescriptions[metric] || '深入理解和掌握此技术要点'
}

const getPracticeAdvice = () => {
  const advices = [
    '每天坚持15-30分钟的专项练习，注意质量而非数量',
    '使用节拍器，从慢速开始逐渐提高速度',
    '录音对比，发现并改正问题',
    '分段练习，逐步攻克难点',
    '保持放松的身体状态，避免过度紧张'
  ]
  return advices[Math.floor(Math.random() * advices.length)]
}
</script>