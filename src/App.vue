<script setup>
import { ref, onUnmounted, computed, onMounted } from 'vue'
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
const mobileMenuOpen = ref(false)     // 移动端菜单开关
// 初始化时就检测是否为移动端，避免闪烁
const isMobile = ref(typeof window !== 'undefined' && window.innerWidth < 768)

// 长按相关状态
const longPressTimer = ref(null)
const longPressProgress = ref(0)
const isLongPressing = ref(false)
const showLongPressTip = ref(false)
const LONG_PRESS_DURATION = 3000 // 3秒
const LONG_PRESS_TIP_DELAY = 500 // 500ms后显示提示

// 检测是否为移动端
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  document.body.classList.remove('focus-active')
  // 清理长按计时器
  if (longPressTimer.value) {
    clearInterval(longPressTimer.value)
  }
})

// 计算是否显示主面板（移动端：选中分类后显示；桌面端：始终显示）
const showMainPanel = computed(() => {
  // 在移动端，只有选中分类后才显示主面板
  return selectedCategory.value !== null
})

// 移动端是否显示侧边栏（未选择分类或打开菜单时显示）
const showMobileSidebar = computed(() => {
  return !selectedCategory.value || mobileMenuOpen.value
})

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
 * 移动端长按开始 - 进入/退出专注模式
 */
const handleLongPressStart = () => {
  if (!isMobile.value) return
  // 主界面不允许进入专注模式
  if (!selectedCategory.value && !focusMode.value) return

  isLongPressing.value = true
  longPressProgress.value = 0
  showLongPressTip.value = false

  const startTime = Date.now()
  longPressTimer.value = setInterval(() => {
    const elapsed = Date.now() - startTime
    longPressProgress.value = Math.min(elapsed / LONG_PRESS_DURATION * 100, 100)

    // 延迟显示提示文字
    if (elapsed >= LONG_PRESS_TIP_DELAY && !showLongPressTip.value) {
      showLongPressTip.value = true
    }

    if (elapsed >= LONG_PRESS_DURATION) {
      // 长按完成，切换专注模式
      clearInterval(longPressTimer.value)
      longPressTimer.value = null
      isLongPressing.value = false
      longPressProgress.value = 0
      showLongPressTip.value = false
      toggleFocusMode()
    }
  }, 50)
}

/**
 * 移动端长按结束
 */
const handleLongPressEnd = () => {
  if (!isMobile.value) return

  // 记录是否显示过提示（用于判断是否触发返回）
  const wasShowingTip = showLongPressTip.value

  if (longPressTimer.value) {
    clearInterval(longPressTimer.value)
    longPressTimer.value = null
  }
  isLongPressing.value = false
  longPressProgress.value = 0
  showLongPressTip.value = false

  // 如果没有显示过提示（短按），且不是专注模式，且有选中的分类，则返回主界面
  if (!wasShowingTip && !focusMode.value && selectedCategory.value) {
    handleClosePanel()
  }
}

/**
 * 处理左侧分类的选择
 */
const handleSelectCategory = (category) => {
  // 专注模式下禁止操作
  if (focusMode.value && isMobile.value) return

  if (selectedCategory.value?.id !== category.id) {
    selectedCategory.value = category
    currentSubOption.value = null
  }
  // 移动端选择分类后关闭菜单
  mobileMenuOpen.value = false
}

/**
 * 处理左侧子菜单的选择
 */
const handleSelectSubOption = (sub) => {
  // 专注模式下禁止操作
  if (focusMode.value && isMobile.value) return

  currentSubOption.value = sub
  // 移动端选择后关闭菜单
  mobileMenuOpen.value = false
}

/**
 * 处理右侧面板的关闭事件
 */
const handleClosePanel = () => {
  // 专注模式下禁止关闭
  if (focusMode.value && isMobile.value) return

  selectedCategory.value = null
  currentSubOption.value = null
}

/**
 * 切换移动端菜单
 */
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

/**
 * 移动端返回菜单
 */
const handleMobileBack = () => {
  if (currentSubOption.value) {
    currentSubOption.value = null
  } else if (selectedCategory.value) {
    selectedCategory.value = null
    mobileMenuOpen.value = false
  }
}

// [清理] 组件销毁时移除 body 上的类名，防止污染其他页面（已在上方 onUnmounted 中处理）
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
  <div class="h-screen flex flex-col p-3 md:p-6 lg:p-8 pb-6 max-w-[1800px] mx-auto antialiased text-zinc-200" :class="{ 'animate-blur-in': !isMobile }">

    <!-- =========================== -->
    <!-- 顶部导航栏 (Header) -->
    <!-- =========================== -->
    <header class="flex justify-between items-center mb-4 md:mb-8 shrink-0 relative z-50" :class="{ 'animate-spring-in': !isMobile }">

      <!-- Logo 区域 - 添加悬���动画 -->
      <div class="flex items-center gap-2 md:gap-3 transition-all duration-600 ease-apple-spring group logo-container flex-1"
           :class="{ 'opacity-30 blur-sm scale-95': focusMode }">
        <div class="text-violin-gold transition-transform duration-400 ease-apple-spring group-hover:scale-110 group-hover:rotate-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" class="md:w-8 md:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2c0 3 2 5 2 9 0 6-4 9-4 9s-4-3-4-9c0-4 2-6 2-9"></path>
            <line x1="12" y1="2" x2="12" y2="22"></line>
            <line x1="10" y1="14" x2="14" y2="14"></line>
          </svg>
        </div>
        <div>
          <h1 class="font-serif text-lg md:text-2xl tracking-wide text-gray-100">
            Luthier AI
            <span class="text-[10px] align-top text-violin-gold opacity-80 animate-breathe-soft">PRO</span>
          </h1>
          <p class="text-[8px] md:text-[10px] uppercase tracking-[0.15em] md:tracking-[0.2em] text-violin-gold font-medium hidden sm:block">Diagnostic Lab</p>
        </div>
      </div>

      <!-- 专注模式开关按钮 - 仅桌面端显示 -->
      <div class="relative group hidden md:block">
        <div class="flex items-center gap-2 md:gap-3 bg-violin-panel/50 border border-white/5 rounded-full px-3 md:px-4 py-1.5 md:py-2 backdrop-blur-sm shadow-inner cursor-pointer hover:border-violin-gold/30 transition-all duration-400 ease-apple-spring hover:scale-105 focus-toggle apple-button"
             @click="toggleFocusMode">
          <span class="text-xs text-zinc-400 font-medium tracking-wide group-hover:text-zinc-200 transition-colors duration-300 hidden md:inline">专注模式</span>

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

      <!-- 移动端当前选中显示 -->
      <div v-if="isMobile && selectedCategory" class="text-right">
        <p class="text-[10px] text-violin-gold uppercase tracking-wider">当前模块</p>
        <p class="text-sm text-white font-medium truncate max-w-[120px]">{{ currentSubOption?.name || selectedCategory.title }}</p>
      </div>
    </header>

    <!-- =========================== -->
    <!-- 主内容区域 (Main) -->
    <!-- =========================== -->
    <main class="flex-1 flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-8 overflow-hidden relative">

      <!-- 移动端: 侧边栏全屏覆盖 / 桌面端: 正常侧边栏 -->
      <transition name="mobile-slide">
        <DashboardSidebar
          v-show="!isMobile || showMobileSidebar"
          :categories="categories"
          :selected-category="selectedCategory"
          :current-sub-option="currentSubOption"
          :focus-mode="focusMode"
          :is-mobile="isMobile"
          @select-category="handleSelectCategory"
          @select-sub-option="handleSelectSubOption"
          :class="{
            'fixed inset-0 z-40 bg-violin-black/98 backdrop-blur-xl pt-20 px-4 pb-24': isMobile && mobileMenuOpen && selectedCategory,
            'flex-1': isMobile && !selectedCategory
          }"
        />
      </transition>

      <!-- 右侧：核心功能面板 -->
      <transition name="panel-slide">
        <DiagnosticPanel
          v-if="!isMobile || selectedCategory"
          :selected-category="selectedCategory"
          :current-sub-option="currentSubOption"
          :focus-mode="focusMode"
          :is-mobile="isMobile"
          @close-panel="handleClosePanel"
          @select-sub-option="handleSelectSubOption"
        />
      </transition>

    </main>
  </div>

  <!-- =========================== -->
  <!-- 移动端悬浮首页按钮 -->
  <!-- =========================== -->
  <div v-if="isMobile" class="fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500"
       :class="focusMode ? 'bottom-10' : 'bottom-6'">
    <!-- 长按进度环 -->
    <svg v-if="isLongPressing" class="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
      <circle
        cx="50" cy="50" r="46"
        fill="none"
        :stroke="focusMode ? '#8b5cf6' : '#d4af37'"
        stroke-width="3"
        stroke-linecap="round"
        :stroke-dasharray="289"
        :stroke-dashoffset="289 - (289 * longPressProgress / 100)"
        class="transition-all duration-100"
      />
    </svg>

    <button
      @touchstart.prevent="handleLongPressStart"
      @touchend="handleLongPressEnd"
      @touchcancel="handleLongPressEnd"
      @mousedown="handleLongPressStart"
      @mouseup="handleLongPressEnd"
      @mouseleave="handleLongPressEnd"
      class="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg relative"
      :class="[
        focusMode
          ? 'bg-zinc-900/95 border-2 border-violet-500/60 shadow-[0_0_20px_rgba(139,92,246,0.4),0_8px_30px_rgba(59,130,246,0.3)] text-violet-400'
          : !selectedCategory
            ? 'bg-violin-gold text-black shadow-violin-gold/30'
            : 'bg-zinc-800/90 backdrop-blur-md text-zinc-400 border border-white/10',
        isLongPressing ? 'scale-95' : 'active:scale-90'
      ]"
    >
      <!-- 专注模式下的底部蓝色荧光 -->
      <div v-if="focusMode" class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-4 bg-blue-500/40 rounded-full blur-lg"></div>

      <!-- 图标：专注模式显示锁定图标，普通模式显示首页图标 -->
      <svg v-if="focusMode" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="relative z-10">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    </button>

    <!-- 长按提示文字 -->
    <div v-show="showLongPressTip" class="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs px-2 py-1 rounded bg-black/80 backdrop-blur-sm"
         :class="focusMode ? 'text-violet-300' : 'text-violin-gold'">
      {{ focusMode ? '继续长按退出' : '继续长按进入专注' }}
    </div>
  </div>
</template>

<style scoped>
/* 移动端侧边栏滑入动画 */
.mobile-slide-enter-active,
.mobile-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.mobile-slide-enter-from {
  opacity: 0;
  transform: translateX(-100%);
}

.mobile-slide-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

/* 面板滑入动画 */
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.panel-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.panel-slide-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* 移动端面板离开时脱离文档流，避免挤压侧边栏 */
@media (max-width: 767px) {
  .panel-slide-leave-active {
    position: absolute;
    inset: 0;
  }
}

/* iOS 安全区域适配 */
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0);
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 移动端底部导航栏按钮触控优化 */
@media (max-width: 767px) {
  button {
    -webkit-tap-highlight-color: transparent;
  }

  button:active {
    transform: scale(0.95);
  }
}
</style>