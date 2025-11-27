<template>
  <transition name="apple-blur">
    <div class="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center loading-overlay">
      <div class="flex flex-col items-center animate-spring-in">
        <!-- 中心小提琴图标 -->
        <div class="w-32 h-32 relative">
          <svg class="absolute inset-0 w-full h-full text-violin-gold animate-breathe-soft" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2c0 3 2 5 2 9 0 6-4 9-4 9s-4-3-4-9c0-4 2-6 2-9"></path>
            <line x1="12" y1="2" x2="12" y2="22"></line>
            <line x1="10" y1="14" x2="14" y2="14"></line>
          </svg>

          <!-- 旋转的音符 - 使用更流畅的动画 -->
          <div class="absolute inset-0 animate-spin-smooth">
            <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 text-violin-gold/80">
              <span class="text-2xl animate-float">♪</span>
            </div>
            <div class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-8 text-violin-gold/80">
              <span class="text-2xl animate-float" style="animation-delay: 0.5s">♫</span>
            </div>
            <div class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 text-violin-gold/80">
              <span class="text-2xl animate-float" style="animation-delay: 1s">♬</span>
            </div>
            <div class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-8 text-violin-gold/80">
              <span class="text-2xl animate-float" style="animation-delay: 1.5s">♭</span>
            </div>
          </div>

          <!-- 波纹效果 - 更流畅 -->
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="absolute w-32 h-32 rounded-full border border-violin-gold/30 ripple-wave"></div>
            <div class="absolute w-24 h-24 rounded-full border border-violin-gold/40 ripple-wave" style="animation-delay: 0.3s"></div>
            <div class="absolute w-16 h-16 rounded-full border border-violin-gold/50 ripple-wave" style="animation-delay: 0.6s"></div>
          </div>
        </div>

        <!-- 加载文字 - 添加文字动画 -->
        <div class="mt-8 text-center animate-fade-in" style="animation-delay: 0.2s">
          <h3 class="text-xl font-serif text-violin-gold mb-2">{{ title }}</h3>
          <p class="text-sm text-zinc-400 wave-loading">
            <span v-for="(char, index) in message.split('')" :key="index" :style="{ animationDelay: `${index * 0.05}s` }">{{ char }}</span>
          </p>

          <!-- 进度条 - 更流畅的动画 -->
          <div class="mt-4 w-64 h-1 bg-zinc-800 rounded-full overflow-hidden mx-auto">
            <div class="h-full bg-gradient-to-r from-violin-gold via-yellow-400 to-violin-gold rounded-full loading-bar-smooth progress-bar-animated"></div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '正在加载'
  },
  message: {
    type: String,
    default: '请稍候...'
  }
})
</script>

<style scoped>
/* 背景模糊进入动画 */
.loading-overlay {
  animation: overlayFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes overlayFadeIn {
  0% {
    opacity: 0;
    backdrop-filter: blur(0);
  }
  100% {
    opacity: 1;
    backdrop-filter: blur(12px);
  }
}

/* 更流畅的旋转动画 */
.animate-spin-smooth {
  animation: spinSmooth 12s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes spinSmooth {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 波纹效果 - 更流畅 */
.ripple-wave {
  animation: rippleExpand 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes rippleExpand {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

/* 更流畅的进度条 */
.loading-bar-smooth {
  animation: loadingBarSmooth 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes loadingBarSmooth {
  0% {
    width: 0%;
    transform: translateX(0);
  }
  30% {
    width: 60%;
  }
  60% {
    width: 100%;
    transform: translateX(0);
  }
  100% {
    width: 100%;
    transform: translateX(100%);
    opacity: 0;
  }
}
</style>