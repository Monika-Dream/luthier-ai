/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'violin-black': '#0a0a0a',
        'violin-charcoal': '#121212',
        'violin-panel': '#18181b',
        'violin-gold': '#d4af37',
        'violin-gold-dim': '#8a702a',
        'violin-text': '#a1a1aa',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-subtle': 'pulseSubtle 4s ease-in-out infinite',
        'scan': 'scan 4s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite',
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'floatSlow 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'slide-down': 'slideDown 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'rotate-in': 'rotateIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        // Apple/Google 风格弹性动画
        'spring-in': 'springIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'spring-out': 'springOut 0.4s cubic-bezier(0.36, 0, 0.66, -0.56)',
        'spring-bounce': 'springBounce 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'elastic-in': 'elasticIn 0.8s cubic-bezier(0.68, -0.6, 0.32, 1.6)',
        // 流畅滑动动画
        'slide-in-left': 'slideInLeft 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'slide-in-right': 'slideInRight 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'slide-in-bottom': 'slideInBottom 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        // 苹果风格淡入淡出
        'apple-fade-in': 'appleFadeIn 0.35s ease-out',
        'apple-fade-out': 'appleFadeOut 0.25s ease-in',
        // Material Design 涟漪展开
        'ripple-expand': 'rippleExpand 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        // 3D 翻转动画
        'flip-in': 'flipIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'flip-out': 'flipOut 0.4s cubic-bezier(0.55, 0.085, 0.68, 0.53)',
        // 模糊缩放 - GPU 加速版本
        'blur-in': 'blurIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
        'blur-out': 'blurOut 0.3s cubic-bezier(0.55, 0.085, 0.68, 0.53)',
        // 错落进入（用于列表）
        'stagger-in': 'staggerIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
        // 轻微抖动反馈
        'shake': 'shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
        // 成功/确认弹跳
        'success-bounce': 'successBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        // 呼吸脉冲（更精致）
        'breathe-soft': 'breatheSoft 3s ease-in-out infinite',
        // 悬浮提升
        'hover-lift': 'hoverLift 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        // 按下效果
        'press-down': 'pressDown 0.15s ease-out',
        // 光泽扫过（更流畅）
        'gleam': 'gleam 2s ease-in-out infinite',
        // 滑动淡入 - GPU 加速版本
        'slide-fade-in': 'slideFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%) translateZ(0)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(500%) translateZ(0)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) translateZ(0)' },
          '50%': { transform: 'translateY(-10px) translateZ(0)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '33%': { transform: 'translate3d(3px, -8px, 0)' },
          '66%': { transform: 'translate3d(-3px, -5px, 0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(212, 175, 55, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.8), 0 0 30px rgba(212, 175, 55, 0.4)' },
        },
        slideUp: {
          '0%': { transform: 'translate3d(0, 20px, 0)', opacity: '0' },
          '100%': { transform: 'translate3d(0, 0, 0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translate3d(0, -20px, 0)', opacity: '0' },
          '100%': { transform: 'translate3d(0, 0, 0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale3d(0.9, 0.9, 1)', opacity: '0' },
          '100%': { transform: 'scale3d(1, 1, 1)', opacity: '1' },
        },
        rotateIn: {
          '0%': { transform: 'rotate(-10deg) scale3d(0.9, 0.9, 1)', opacity: '0' },
          '100%': { transform: 'rotate(0deg) scale3d(1, 1, 1)', opacity: '1' },
        },
        // Apple/Google 风格弹性动画 - GPU 加速
        springIn: {
          '0%': { transform: 'scale3d(0.8, 0.8, 1) translate3d(0, 20px, 0)', opacity: '0' },
          '100%': { transform: 'scale3d(1, 1, 1) translate3d(0, 0, 0)', opacity: '1' },
        },
        springOut: {
          '0%': { transform: 'scale3d(1, 1, 1) translate3d(0, 0, 0)', opacity: '1' },
          '100%': { transform: 'scale3d(0.8, 0.8, 1) translate3d(0, -20px, 0)', opacity: '0' },
        },
        springBounce: {
          '0%': { transform: 'scale3d(0.3, 0.3, 1)', opacity: '0' },
          '50%': { transform: 'scale3d(1.05, 1.05, 1)' },
          '70%': { transform: 'scale3d(0.95, 0.95, 1)' },
          '100%': { transform: 'scale3d(1, 1, 1)', opacity: '1' },
        },
        elasticIn: {
          '0%': { transform: 'scale3d(0, 0, 1) rotate(-45deg)', opacity: '0' },
          '50%': { transform: 'scale3d(1.25, 1.25, 1) rotate(5deg)' },
          '75%': { transform: 'scale3d(0.9, 0.9, 1) rotate(-2deg)' },
          '100%': { transform: 'scale3d(1, 1, 1) rotate(0)', opacity: '1' },
        },
        // 流畅滑动 - GPU 加速
        slideInLeft: {
          '0%': { transform: 'translate3d(-100%, 0, 0) scale3d(0.95, 0.95, 1)', opacity: '0' },
          '100%': { transform: 'translate3d(0, 0, 0) scale3d(1, 1, 1)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translate3d(100%, 0, 0) scale3d(0.95, 0.95, 1)', opacity: '0' },
          '100%': { transform: 'translate3d(0, 0, 0) scale3d(1, 1, 1)', opacity: '1' },
        },
        slideInBottom: {
          '0%': { transform: 'translate3d(0, 100%, 0) scale3d(0.95, 0.95, 1)', opacity: '0' },
          '100%': { transform: 'translate3d(0, 0, 0) scale3d(1, 1, 1)', opacity: '1' },
        },
        // 苹果风格淡入淡出 - GPU 加速
        appleFadeIn: {
          '0%': { transform: 'scale3d(0.96, 0.96, 1)', opacity: '0', filter: 'blur(4px)' },
          '100%': { transform: 'scale3d(1, 1, 1)', opacity: '1', filter: 'blur(0)' },
        },
        appleFadeOut: {
          '0%': { transform: 'scale3d(1, 1, 1)', opacity: '1', filter: 'blur(0)' },
          '100%': { transform: 'scale3d(0.96, 0.96, 1)', opacity: '0', filter: 'blur(4px)' },
        },
        // Material 涟漪 - GPU 加速
        rippleExpand: {
          '0%': { transform: 'scale3d(0, 0, 1)', opacity: '0.5' },
          '100%': { transform: 'scale3d(4, 4, 1)', opacity: '0' },
        },
        // 3D 翻转 - GPU 加速
        flipIn: {
          '0%': { transform: 'perspective(400px) rotateY(-90deg)', opacity: '0' },
          '40%': { transform: 'perspective(400px) rotateY(20deg)' },
          '60%': { transform: 'perspective(400px) rotateY(-10deg)' },
          '80%': { transform: 'perspective(400px) rotateY(5deg)' },
          '100%': { transform: 'perspective(400px) rotateY(0)', opacity: '1' },
        },
        flipOut: {
          '0%': { transform: 'perspective(400px) rotateY(0)', opacity: '1' },
          '100%': { transform: 'perspective(400px) rotateY(90deg)', opacity: '0' },
        },
        // 模糊缩放 - GPU 加速
        blurIn: {
          '0%': { transform: 'scale3d(1.1, 1.1, 1)', opacity: '0', filter: 'blur(10px)' },
          '100%': { transform: 'scale3d(1, 1, 1)', opacity: '1', filter: 'blur(0)' },
        },
        blurOut: {
          '0%': { transform: 'scale3d(1, 1, 1)', opacity: '1', filter: 'blur(0)' },
          '100%': { transform: 'scale3d(0.9, 0.9, 1)', opacity: '0', filter: 'blur(10px)' },
        },
        // 错落进入 - GPU 加速
        staggerIn: {
          '0%': { transform: 'translate3d(0, 30px, 0) scale3d(0.9, 0.9, 1)', opacity: '0' },
          '100%': { transform: 'translate3d(0, 0, 0) scale3d(1, 1, 1)', opacity: '1' },
        },
        // 轻微抖动 - GPU 加速
        shake: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translate3d(-4px, 0, 0)' },
          '20%, 40%, 60%, 80%': { transform: 'translate3d(4px, 0, 0)' },
        },
        // 成功弹跳 - GPU 加速
        successBounce: {
          '0%': { transform: 'scale3d(0, 0, 1)' },
          '50%': { transform: 'scale3d(1.2, 1.2, 1)' },
          '100%': { transform: 'scale3d(1, 1, 1)' },
        },
        // 柔和呼吸 - GPU 加速
        breatheSoft: {
          '0%, 100%': { transform: 'scale3d(1, 1, 1)', opacity: '1' },
          '50%': { transform: 'scale3d(1.03, 1.03, 1)', opacity: '0.85' },
        },
        // 悬浮提升 - GPU 加速
        hoverLift: {
          '0%': { transform: 'translate3d(0, 0, 0)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
          '100%': { transform: 'translate3d(0, -4px, 0)', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' },
        },
        // 按下效果 - GPU 加速
        pressDown: {
          '0%': { transform: 'scale3d(1, 1, 1)' },
          '100%': { transform: 'scale3d(0.97, 0.97, 1)' },
        },
        // 光泽扫过
        gleam: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        // 滑动淡入 - GPU 加速
        slideFadeIn: {
          '0%': { transform: 'translate3d(0, 20px, 0)', opacity: '0' },
          '100%': { transform: 'translate3d(0, 0, 0)', opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-shine': 'linear-gradient(105deg, transparent 40%, rgba(212, 175, 55, 0.1) 50%, transparent 60%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'smooth-out': 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        // Apple/Google 专业曲线
        'apple-ease': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'apple-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'material-standard': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'material-decel': 'cubic-bezier(0, 0, 0.2, 1)',
        'material-accel': 'cubic-bezier(0.4, 0, 1, 1)',
        'spring-soft': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'spring-medium': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'spring-stiff': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
        'ease-out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'ease-out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'ease-in-out-quint': 'cubic-bezier(0.86, 0, 0.07, 1)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '1200': '1200ms',
      },
    },
  },
  plugins: [],
}