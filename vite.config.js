import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: '/luthier-ai/',
  plugins: [vue()],
  server: {
    host: '0.0.0.0', // 监听所有 IP 地址
    port: 8088, // 修改为所需端口号
    open: true // 启动后自动打开浏览器
  },
  build: {
    // 启用代码分割优化
    rollupOptions: {
      output: {
        // 手动分包策略
        manualChunks: {
          // Vue 核心库单独打包
          'vue-vendor': ['vue'],
          // 音频服务单独打包（较大的模块）
          'audio-services': ['./src/services/audioService.js'],
          // AI 服务单独打包
          'ai-services': ['./src/services/geminiService.js'],
          // 音乐内容数据单独打包
          'music-content': ['./src/data/musicContent.js']
        }
      }
    },
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 设置 chunk 大小警告阈值
    chunkSizeWarningLimit: 500
  }
})
