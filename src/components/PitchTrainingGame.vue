<template>
  <div class="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in">
    <h2 class="text-2xl font-serif text-white mb-6">音准训练游戏</h2>

    <!-- 游戏状态显示 -->
    <div class="mb-8 text-center">
      <div v-if="!gameStarted" class="text-zinc-400">
        点击开始按钮开始游戏
      </div>
      <div v-else-if="currentRound <= totalRounds">
        <div class="text-lg text-zinc-300 mb-2">
          第 {{ currentRound }} / {{ totalRounds }} 轮
        </div>
        <div class="text-3xl font-bold mb-4"
             :class="showResult ? (isCorrect ? 'text-green-500' : 'text-red-500') : 'text-white'">
          {{ showResult ? (isCorrect ? '正确！' : `错误！正确答案是 ${correctNote}`) : '请仔细聆听...' }}
        </div>
      </div>
      <div v-else class="text-center">
        <div class="text-2xl font-bold text-violet-gold mb-4">
          游戏结束！
        </div>
        <div class="text-xl text-white mb-2">
          得分：{{ score }} / {{ totalRounds }}
        </div>
        <div class="text-lg text-zinc-400">
          正确率：{{ ((score / totalRounds) * 100).toFixed(0) }}%
        </div>
      </div>
    </div>

    <!-- 分数显示 -->
    <div v-if="gameStarted && currentRound <= totalRounds" class="mb-6">
      <div class="flex gap-2">
        <div v-for="i in totalRounds" :key="i"
             class="w-3 h-3 rounded-full transition-all duration-300"
             :class="{
               'bg-green-500': i <= roundResults.length && roundResults[i-1],
               'bg-red-500': i <= roundResults.length && !roundResults[i-1],
               'bg-zinc-700': i > roundResults.length
             }">
        </div>
      </div>
    </div>

    <!-- 音符选择按钮 -->
    <div v-if="gameStarted && currentRound <= totalRounds && !showResult" class="grid grid-cols-2 gap-4 mb-8">
      <button v-for="note in availableNotes"
              :key="note"
              @click="selectNote(note)"
              :disabled="isPlaying || showResult"
              class="px-6 py-4 rounded-lg border-2 font-bold text-xl transition-all duration-300 transform hover:scale-105"
              :class="isPlaying || showResult
                ? 'bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed'
                : 'bg-zinc-800 text-white border-zinc-600 hover:border-violin-gold hover:bg-zinc-700'">
        {{ note }}弦
      </button>
    </div>

    <!-- 重播按钮 -->
    <button v-if="gameStarted && currentRound <= totalRounds && !showResult && !isPlaying"
            @click="playCurrentNote"
            class="mb-6 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-all duration-300">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="inline mr-2">
        <path d="M3 2v6h6"/>
        <path d="M3 13a9 9 0 1 0 3-7.7L3 8"/>
      </svg>
      重新播放
    </button>

    <!-- 继续/开始按钮 -->
    <div class="flex gap-4">
      <button v-if="!gameStarted || currentRound > totalRounds"
              @click="startGame"
              class="px-6 py-3 rounded-lg bg-violin-gold hover:bg-violin-gold-dim text-black font-semibold transition-all duration-300">
        {{ currentRound > totalRounds ? '重新开始' : '开始游戏' }}
      </button>
      <button v-else-if="showResult && currentRound < totalRounds"
              @click="nextRound"
              class="px-6 py-3 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold transition-all duration-300">
        下一轮
      </button>
      <button v-if="gameStarted && currentRound <= totalRounds"
              @click="endGame"
              class="px-6 py-3 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white transition-all duration-300">
        结束游戏
      </button>
    </div>

    <!-- 难度选择 -->
    <div v-if="!gameStarted" class="mt-6">
      <div class="text-xs text-zinc-500 mb-2 text-center">难度选择</div>
      <div class="flex gap-2">
        <button v-for="level in difficultyLevels"
                :key="level.name"
                @click="difficulty = level.name"
                class="px-4 py-2 text-sm rounded-md border transition-all duration-300"
                :class="difficulty === level.name
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-600'">
          {{ level.label }}
        </button>
      </div>
    </div>

    <!-- 游戏说明 -->
    <div v-if="!gameStarted" class="mt-8 max-w-md text-center">
      <p class="text-sm text-zinc-500">
        游戏说明：系统会播放一个音符，你需要识别出是哪根弦的音。
        选择难度后点击开始，仔细聆听并选择正确的答案。
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ToneGenerator } from '../services/audioService'

const props = defineProps({
  tunerNotes: Object
})

// 游戏状态
const gameStarted = ref(false)
const currentRound = ref(0)
const totalRounds = ref(10)
const score = ref(0)
const roundResults = ref([])

// 当前轮次状态
const correctNote = ref('')
const isPlaying = ref(false)
const showResult = ref(false)
const isCorrect = ref(false)

// 难度设置
const difficulty = ref('easy')
const difficultyLevels = [
  { name: 'easy', label: '简单', playDuration: 2, interval: 0 },
  { name: 'medium', label: '中等', playDuration: 1.5, interval: 200 },
  { name: 'hard', label: '困难', playDuration: 1, interval: 400 }
]

// 可选的音符
const availableNotes = ['G', 'D', 'A', 'E']

// 声音发生器
const toneGenerator = new ToneGenerator()

// 开始游戏
const startGame = () => {
  gameStarted.value = true
  currentRound.value = 1
  score.value = 0
  roundResults.value = []
  showResult.value = false
  playNewNote()
}

// 结束游戏
const endGame = () => {
  currentRound.value = totalRounds.value + 1
  toneGenerator.stop()
}

// 播放新音符
const playNewNote = async () => {
  // 随机选择一个音符
  const noteIndex = Math.floor(Math.random() * availableNotes.length)
  correctNote.value = availableNotes[noteIndex]

  // 获取难度设置
  const level = difficultyLevels.find(l => l.name === difficulty.value)

  // 根据难度添加音高偏移（使游戏更有挑战性）
  const frequency = props.tunerNotes[correctNote.value]?.frequency || 440
  const pitchOffset = level.interval ? (Math.random() - 0.5) * level.interval : 0
  const playFrequency = frequency * Math.pow(2, pitchOffset / 1200) // 音分转频率

  isPlaying.value = true

  // 延迟一下再播放，让用户有准备
  setTimeout(async () => {
    await toneGenerator.playFrequency(playFrequency, level.playDuration)
    isPlaying.value = false
  }, 500)
}

// 播放当前音符（重播）
const playCurrentNote = async () => {
  if (!correctNote.value || isPlaying.value) return

  const level = difficultyLevels.find(l => l.name === difficulty.value)
  const frequency = props.tunerNotes[correctNote.value]?.frequency || 440
  const pitchOffset = level.interval ? (Math.random() - 0.5) * level.interval : 0
  const playFrequency = frequency * Math.pow(2, pitchOffset / 1200)

  isPlaying.value = true
  await toneGenerator.playFrequency(playFrequency, level.playDuration)
  isPlaying.value = false
}

// 选择音符
const selectNote = (note) => {
  if (isPlaying.value || showResult.value) return

  isCorrect.value = note === correctNote.value
  showResult.value = true

  if (isCorrect.value) {
    score.value++
  }

  roundResults.value.push(isCorrect.value)

  // 如果是最后一轮，自动结束游戏
  if (currentRound.value === totalRounds.value) {
    setTimeout(() => {
      endGame()
    }, 2000)
  }
}

// 下一轮
const nextRound = () => {
  currentRound.value++
  showResult.value = false
  isCorrect.value = false
  playNewNote()
}
</script>

<style scoped>
/* 添加一些动画效果 */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.animate-pulse {
  animation: pulse 2s infinite;
}
</style>