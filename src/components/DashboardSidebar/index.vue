<script setup>
const props = defineProps({
  categories: Array,
  selectedCategory: Object,
  currentSubOption: Object,
  focusMode: Boolean,
  isMobile: Boolean
})

const emit = defineEmits(['select-category', 'select-sub-option'])

const handleSelectCategory = (category) => {
  emit('select-category', category)
}

const handleSelectSubOption = (sub, parentCategory) => {
  // 确保父分类被选中
  if (props.selectedCategory?.id !== parentCategory.id) {
    emit('select-category', parentCategory)
  }
  // 选择子选项
  emit('select-sub-option', sub)
}

// 磁吸式卡片悬停效果
const handleCardHover = (event, isEntering) => {
  const card = event.currentTarget
  if (isEntering) {
    card.addEventListener('mousemove', handleCardMouseMove)
  } else {
    card.removeEventListener('mousemove', handleCardMouseMove)
    card.style.transform = ''
  }
}

const handleCardMouseMove = (event) => {
  const card = event.currentTarget
  const rect = card.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  const centerX = rect.width / 2
  const centerY = rect.height / 2

  // 计算倾斜角度（非常轻微的 3D 效果）
  const rotateX = (y - centerY) / 20
  const rotateY = (centerX - x) / 20

  card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`
}
</script>

<template>
  <section
    class="flex flex-col gap-3 md:gap-6 overflow-y-auto overflow-x-hidden sidebar-transition relative z-20 custom-scrollbar"
    :class="[
      focusMode
        ? 'max-w-0 opacity-0 px-0 w-0 pointer-events-none'
        : isMobile
          ? 'w-full opacity-100'
          : 'w-full md:w-80 lg:w-96 shrink-0 opacity-100 animate-apple-fade-in'
    ]"
  >
    <!-- 固定宽度容器防止内容挤压 -->
    <div :class="focusMode ? 'w-0' : isMobile ? 'w-full' : 'w-full md:w-80 lg:w-96'">
      <!-- 标题区域 -->
      <div class="mb-4 md:mb-6" :class="{ 'animate-blur-in': !isMobile }">
        <h2 class="font-serif text-xl md:text-3xl lg:text-4xl mb-2 md:mb-3 text-white bg-gradient-to-r from-white to-violet-100 bg-clip-text text-transparent">
          {{ isMobile ? '选择功能' : '演奏技法剖析' }}
        </h2>
        <p class="text-zinc-500 text-xs md:text-sm font-light leading-relaxed">
          {{ isMobile ? '请选择您想要使用的功能模块' : 'AI 将综合视觉与听觉数据，为您生成精准的演奏建议。' }}
        </p>
      </div>

      <!-- 分类卡片列表 - 移动端使用更紧凑的布局 -->
      <div class="flex flex-col gap-2.5 md:gap-4 pb-10" :class="isMobile ? '' : 'max-w-[23rem]'">
        <div v-for="(category, index) in categories"
             :key="category.id"
             @click="handleSelectCategory(category)"
             @mouseenter="!isMobile && handleCardHover($event, true)"
             @mouseleave="!isMobile && handleCardHover($event, false)"
             class="group relative overflow-hidden p-3.5 md:p-5 rounded-xl border cursor-pointer ripple-container"
             :class="[
                isMobile ? 'spring-card-mobile' : 'spring-card animate-stagger-in',
                selectedCategory?.id === category.id
                  ? 'bg-gradient-to-r from-violin-gold/10 to-transparent border-violin-gold/50 shadow-[0_0_30px_-10px_rgba(212,175,55,0.15)] scale-[1.02] glow-pulse-soft'
                  : 'bg-zinc-900/40 border-white/5 hover:border-zinc-700 hover:bg-zinc-800/40'
             ]"
             :style="isMobile ? {} : { animationDelay: `${index * 60}ms` }">

          <!-- 激活指示条 - 带有更流畅的动画 -->
          <div class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-violin-gold to-yellow-500 transition-all duration-500 ease-apple-spring"
               :class="selectedCategory?.id === category.id ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 group-hover:opacity-50 group-hover:scale-y-100'"
               style="transform-origin: center;">
          </div>

          <!-- 背景光效 - 更细腻的渐变 -->
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

          <!-- 高亮扫光效果 - 仅桌面端 -->
          <div v-if="!isMobile" class="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none highlight-sweep-card"></div>

          <!-- 卡片主内容 -->
          <div class="flex justify-between items-center relative z-10">
            <div class="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
              <!-- 图标 - 带弹性动画 -->
              <div class="transition-all duration-500 ease-apple-spring shrink-0"
                   :class="[
                     isMobile ? '' : 'icon-hover-bounce',
                     selectedCategory?.id === category.id ? 'text-violin-gold scale-110' : 'text-zinc-500 group-hover:text-violin-gold group-hover:scale-110'
                   ]">
                <svg xmlns="http://www.w3.org/2000/svg" :width="isMobile ? 20 : 20" :height="isMobile ? 20 : 20" class="md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path :d="category.iconPath"></path>
                  <circle v-if="category.extraIcon" cx="12" cy="12" r="2"></circle>
                </svg>
              </div>
              <!-- 文字 -->
              <div class="min-w-0 flex-1">
                <h3 class="font-medium text-base md:text-lg tracking-wide transition-all duration-400 ease-apple-ease font-serif truncate"
                    :class="selectedCategory?.id === category.id ? 'text-white' : 'text-zinc-300 group-hover:text-white'">
                  {{ category.title }}
                </h3>
                <p class="text-[10px] md:text-xs text-zinc-500 mt-0.5 md:mt-1 font-light tracking-wide transition-colors duration-400 ease-apple-ease group-hover:text-zinc-400 truncate">{{ category.desc }}</p>
              </div>
            </div>
            <!-- 箭头 - 带弹性过渡 -->
            <div class="text-zinc-600 transition-all duration-400 ease-apple-spring shrink-0 ml-2"
                 :class="selectedCategory?.id === category.id ? 'translate-x-2 text-violin-gold rotate-90' : 'group-hover:translate-x-1 group-hover:text-violin-gold'">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </div>

          <!-- 子选项网格 - 移动端使用更紧凑的间距 -->
          <div class="grid grid-cols-2 gap-1.5 md:gap-2 transition-all duration-600 ease-spring-soft origin-top"
               :class="selectedCategory?.id === category.id ? 'sub-options-expanded' : 'sub-options-collapsed'">
            <button
              v-for="(sub, subIndex) in category.subOptions"
              :key="sub.name"
              @click.stop="handleSelectSubOption(sub, category)"
              class="px-2 md:px-3 py-2 md:py-2 text-[11px] md:text-xs text-left rounded-lg flex items-center justify-between group/sub backdrop-blur-sm apple-button sub-option-btn"
              :style="isMobile ? {} : { animationDelay: `${subIndex * 40}ms` }"
              :class="[
                currentSubOption?.name === sub.name
                  ? 'bg-violin-gold/20 text-violin-gold border border-violin-gold/30 shadow-sm shadow-violin-gold/20 scale-105'
                  : 'bg-black/20 text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10',
                !isMobile && selectedCategory?.id === category.id ? 'animate-spring-in' : ''
              ]">
              <span class="truncate">{{ sub.name }}</span>
              <span v-if="currentSubOption?.name === sub.name" class="w-1.5 h-1.5 rounded-full bg-violin-gold animate-breathe-soft shrink-0 ml-1"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  transition: background 0.3s ease;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(212, 175, 55, 0.3);
}

/* 子选项展开/折叠动画 */
.sub-options-expanded {
  max-height: 300px;
  opacity: 1;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.sub-options-collapsed {
  max-height: 0;
  opacity: 0;
  margin-top: 0;
  padding-top: 0;
  border-top: 0px solid transparent;
}

/* 卡片高亮扫光效果 */
.highlight-sweep-card {
  background: linear-gradient(
    105deg,
    transparent 40%,
    rgba(212, 175, 55, 0.08) 50%,
    transparent 60%
  );
  background-size: 250% 100%;
  animation: cardSweep 3s ease-in-out infinite;
}

@keyframes cardSweep {
  0% {
    background-position: 200% center;
  }
  100% {
    background-position: -200% center;
  }
}

/* 子选项按钮动画增强 */
.sub-option-btn {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: center;
}

.sub-option-btn:hover {
  transform: scale(1.05) translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.sub-option-btn:active {
  transform: scale(0.98);
  transition: transform 0.1s ease-out;
}

/* 错落进入动画 */
.animate-stagger-in {
  opacity: 0;
  animation: staggerSlideIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

@keyframes staggerSlideIn {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 移动端卡片触控优化 */
.spring-card-mobile {
  transition: transform 0.2s ease-out, background-color 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.spring-card-mobile:active {
  transform: scale(0.98);
  background-color: rgba(39, 39, 42, 0.6);
}

/* 移动端子选项按钮 */
@media (max-width: 767px) {
  .sub-option-btn {
    min-height: 40px;
    transition: all 0.2s ease-out;
  }

  .sub-option-btn:active {
    transform: scale(0.95);
  }
}
</style>