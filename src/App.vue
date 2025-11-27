<script setup>
import { ref, onUnmounted } from 'vue'
// 1. 引入静态数据
import { categories } from './components/Data_categories/index.js'
// 2. 引入拆分后的子组件
import DashboardSidebar from './components/DashboardSidebar/index.vue'
import DiagnosticPanel from './components/DiagnosticPanel/index.vue'

// ------------------------
// 状态管理 (State)
// ------------------------
const focusMode = ref(false)          // 专注模式开关
const selectedCategory = ref(null)    // 当前选中的大分类
const currentSubOption = ref(null)    // 当前选中的子功能

// ------------------------
// 方法 (Actions)
// ------------------------

/**
 * 切换专注模式
 * 核心逻辑：不仅改变内部 UI 状态，还操作 Body 类名以触发全局 CSS 背景特效
 */
const toggleFocusMode = () => {
  focusMode.value = !focusMode.value
  
  // [关键] 同步更新 body 的类名
  // 这会触发 style.css 中 body.focus-active::before 的样式变化
  if (focusMode.value) {
    document.body.classList.add('focus-active')
  } else {
    document.body.classList.remove('focus-active')
  }
}

/**
 * 处理左侧分类的选择
 */
const handleSelectCategory = (category) => {
  if (selectedCategory.value?.id !== category.id) {
    selectedCategory.value = category
    currentSubOption.value = null
  }
}

/**
 * 处理左侧子菜单的选择
 */
const handleSelectSubOption = (sub) => {
  currentSubOption.value = sub
}

/**
 * 处理右侧面板的关闭事件
 */
const handleClosePanel = () => {
  selectedCategory.value = null
  currentSubOption.value = null
}

// [清理] 组件销毁时移除 body 上的类名，防止污染其他页面
onUnmounted(() => {
  document.body.classList.remove('focus-active')
})
</script>

<template>
  <!-- 专注模式背景网格层 -->
  <div
    class="fixed inset-0 pointer-events-none z-[1] transition-all duration-800 ease-apple-ease focus-grid-layer"
    :class="focusMode ? 'opacity-100 scale-100' : 'opacity-0 scale-105'"
  ></div>

  <!-- 专注模式光晕层 -->
  <div
    class="fixed inset-0 pointer-events-none z-[1] transition-all duration-800 ease-apple-ease focus-glow-layer"
    :class="focusMode ? 'opacity-100' : 'opacity-0'"
  ></div>

  <!--
    主容器
    h-screen: 占满全屏
    flex-col: 垂直布局
    max-w-[1800px]: 大屏限制宽度
  -->
  <div class="h-screen flex flex-col p-3 md:p-6 lg:p-8 max-w-[1800px] mx-auto antialiased text-zinc-200 animate-blur-in">

    <!-- =========================== -->
    <!-- 顶部导航栏 (Header) -->
    <!-- =========================== -->
    <header class="flex justify-between items-center mb-6 md:mb-8 shrink-0 relative z-50 animate-spring-in">

      <!-- Logo 区域 - 添加悬浮动画 -->
      <div class="flex items-center gap-2 md:gap-3 transition-all duration-600 ease-apple-spring group logo-container"
           :class="{ 'opacity-30 blur-sm scale-95': focusMode }">
        <div class="text-violin-gold transition-transform duration-400 ease-apple-spring group-hover:scale-110 group-hover:rotate-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" class="md:w-8 md:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2c0 3 2 5 2 9 0 6-4 9-4 9s-4-3-4-9c0-4 2-6 2-9"></path>
            <line x1="12" y1="2" x2="12" y2="22"></line>
            <line x1="10" y1="14" x2="14" y2="14"></line>
          </svg>
        </div>
        <div>
          <h1 class="font-serif text-xl md:text-2xl tracking-wide text-gray-100">
            Luthier AI
            <span class="text-[10px] align-top text-violin-gold opacity-80 animate-breathe-soft">PRO</span>
          </h1>
          <p class="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-violin-gold font-medium">Diagnostic Lab</p>
        </div>
      </div>

      <!-- 专注模式开关按钮 - 增强交互动画 -->
      <div class="relative group">
        <div class="flex items-center gap-2 md:gap-3 bg-violin-panel/50 border border-white/5 rounded-full px-3 md:px-4 py-1.5 md:py-2 backdrop-blur-sm shadow-inner cursor-pointer hover:border-violin-gold/30 transition-all duration-400 ease-apple-spring hover:scale-105 focus-toggle apple-button"
             @click="toggleFocusMode">
          <span class="text-xs text-zinc-400 font-medium tracking-wide group-hover:text-zinc-200 transition-colors duration-300 hidden md:inline">专注模式</span>
          <span class="text-xs text-zinc-400 font-medium tracking-wide group-hover:text-zinc-200 transition-colors duration-300 md:hidden">专注</span>

          <!-- 滑块动画 - 改进弹性效果 -->
          <button class="relative w-9 md:w-10 h-4 md:h-5 rounded-full transition-all duration-400 ease-apple-spring focus:outline-none pointer-events-none"
                  :class="focusMode ? 'bg-violin-gold/20 shadow-inner shadow-violin-gold/20' : 'bg-zinc-800'">
            <span class="absolute top-0.5 md:top-1 left-0.5 md:left-1 w-3 h-3 rounded-full transition-all duration-400 ease-apple-spring shadow-sm"
                  :class="[focusMode ? 'translate-x-5 bg-violin-gold shadow-[0_0_15px_rgba(212,175,55,0.8)] scale-110' : 'translate-x-0 bg-zinc-500']">
            </span>
          </button>
        </div>

        <!-- Hover 提示气泡 - 添加弹性出现动画 -->
        <div class="absolute top-full right-0 mt-3 w-56 p-3 bg-zinc-900/95 backdrop-blur-md border border-zinc-700 rounded-lg shadow-2xl opacity-0 scale-95 translate-y-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 transition-all duration-400 ease-apple-spring pointer-events-none z-50">
          <div class="text-[10px] text-zinc-300 leading-tight">
            <span class="text-violin-gold font-bold">Cinema Focus:</span>
            收起侧边栏并放大诊断区域，提供沉浸式的数据监测体验。
          </div>
        </div>
      </div>
    </header>

    <!-- =========================== -->
    <!-- 主内容区域 (Main) -->
    <!-- =========================== -->
    <main class="flex-1 flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-8 overflow-hidden relative">

      <!-- 左侧：侧边栏 -->
      <DashboardSidebar
        :categories="categories"
        :selected-category="selectedCategory"
        :current-sub-option="currentSubOption"
        :focus-mode="focusMode"
        @select-category="handleSelectCategory"
        @select-sub-option="handleSelectSubOption"
      />

      <!-- 右侧：核心功能面板 -->
      <DiagnosticPanel
        :selected-category="selectedCategory"
        :current-sub-option="currentSubOption"
        :focus-mode="focusMode"
        @close-panel="handleClosePanel"
      />

    </main>
  </div>
</template>