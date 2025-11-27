import * as Tone from 'tone'
import { PitchDetector } from 'pitchy'

// 音频上下文管理
let audioContext = null
let analyser = null
let microphone = null
let pitchDetector = null

// 初始化音频上下文 - 修改为支持用户交互触发
export async function initAudioContext() {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
      console.log('AudioContext created, initial state:', audioContext.state)

      // 如果上下文被暂停，尝试恢复它
      if (audioContext.state === 'suspended') {
        console.log('AudioContext suspended, trying to resume...')
        await audioContext.resume()
        console.log('AudioContext resumed, new state:', audioContext.state)
      }
    } catch (error) {
      console.error('Failed to create AudioContext:', error)
      throw error
    }
  } else if (audioContext.state === 'suspended') {
    // 如果已存在但被暂停，恢复它
    console.log('Existing AudioContext suspended, resuming...')
    await audioContext.resume()
    console.log('AudioContext resumed, new state:', audioContext.state)
  }

  // 同时确保 Tone.js 已启动
  if (typeof Tone !== 'undefined' && Tone.context) {
    if (Tone.context.state === 'suspended') {
      console.log('Tone.context suspended, starting Tone...')
      await Tone.start()
      console.log('Tone started, context state:', Tone.context.state)
    }
  }

  return audioContext
}

// 真实的调音器实现
export class RealTuner {
  constructor() {
    this.isActive = false
    this.stream = null
    this.analyserNode = null
    this.detector = null
    this.callbacks = {
      onPitchDetected: null,
      onError: null
    }
  }

  // 开始调音
  async start(onPitchDetected, onError) {
    try {
      this.callbacks.onPitchDetected = onPitchDetected
      this.callbacks.onError = onError

      // 获取麦克风权限
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false,
          channelCount: 1,
          sampleRate: 48000  // 使用更高的采样率以提高精度
        }
      })

      const context = await initAudioContext()
      const source = context.createMediaStreamSource(this.stream)
      this.analyserNode = context.createAnalyser()
      this.analyserNode.fftSize = 2048  // 减小FFT大小以提高响应速度
      this.analyserNode.smoothingTimeConstant = 0.3  // 减少平滑以获得更快响应
      source.connect(this.analyserNode)

      // 创建音高检测器
      const bufferLength = this.analyserNode.fftSize
      const buffer = new Float32Array(bufferLength)
      this.detector = PitchDetector.forFloat32Array(bufferLength)
      this.detector.minVolumeDecibels = -30  // 提高灵敏度

      this.isActive = true
      this.detectPitch(buffer)
    } catch (error) {
      if (onError) onError(error)
    }
  }

  // 检测音高
  detectPitch(buffer) {
    if (!this.isActive) return

    this.analyserNode.getFloatTimeDomainData(buffer)
    const [pitch, clarity] = this.detector.findPitch(buffer, audioContext.sampleRate)

    // 降低清晰度阈值以获得更频繁的更新
    if (clarity > 0.85 && pitch > 50 && pitch < 2000) {
      // 计算音符和偏差
      const noteData = this.frequencyToNote(pitch)
      if (this.callbacks.onPitchDetected) {
        this.callbacks.onPitchDetected({
          frequency: pitch,
          note: noteData.note,
          octave: noteData.octave,
          cents: noteData.cents,
          targetFrequency: noteData.targetFrequency,
          clarity: clarity
        })
      }
    }

    // 使用更短的延迟以提高更新频率（约60fps）
    setTimeout(() => this.detectPitch(buffer), 16)
  }

  // 频率转音符
  frequencyToNote(frequency) {
    const A4 = 440
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

    // 计算距离 A4 的半音数
    const halfSteps = 12 * Math.log2(frequency / A4)
    const noteIndex = Math.round(halfSteps) + 9 // A 在数组中的索引是 9
    const octave = Math.floor(noteIndex / 12) + 4
    const note = noteNames[((noteIndex % 12) + 12) % 12]

    // 计算音分偏差
    const targetFrequency = A4 * Math.pow(2, Math.round(halfSteps) / 12)
    const cents = Math.round(1200 * Math.log2(frequency / targetFrequency))

    return { note, octave, cents, targetFrequency }
  }

  // 停止调音
  stop() {
    this.isActive = false
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
      this.stream = null
    }
    this.analyserNode = null
    this.detector = null
  }
}

// 真实的节拍器实现 - 使用 Web Audio API 直接实现
export class RealMetronome {
  constructor() {
    this.isPlaying = false
    this.bpm = 120
    this.beatsPerMeasure = 4
    this.currentBeat = 0
    this.audioContext = null
    this.nextNoteTime = 0
    this.scheduleAheadTime = 0.1 // 提前调度时间（秒）
    this.lookahead = 25 // 调度频率（毫秒）
    this.intervalId = null
    this.onBeat = null
  }

  // 初始化音频上下文
  async init() {
    try {
      // 创建或获取音频上下文
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()

      // 如果上下文被暂停，恢复它
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }

      return true
    } catch (error) {
      console.error('Error initializing metronome:', error)
      return false
    }
  }

  // 播放单个节拍音
  playClick(time, beatNumber) {
    // 创建振荡器
    const osc = this.audioContext.createOscillator()
    const envelope = this.audioContext.createGain()

    // 根据节拍位置设置频率
    if (beatNumber === 0) {
      osc.frequency.value = 800 // 强拍 - 高音
    } else {
      osc.frequency.value = 600 // 弱拍 - 低音
    }

    // 设置音量包络
    envelope.gain.value = 0
    envelope.gain.setValueAtTime(0, time)
    envelope.gain.linearRampToValueAtTime(0.3, time + 0.001)
    envelope.gain.exponentialRampToValueAtTime(0.01, time + 0.02)

    // 连接节点
    osc.connect(envelope)
    envelope.connect(this.audioContext.destination)

    // 播放
    osc.start(time)
    osc.stop(time + 0.03)
  }

  // 调度下一个音符
  scheduler() {
    // 当下一个音符时间在调度范围内时
    while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
      // 播放音符
      this.playClick(this.nextNoteTime, this.currentBeat)

      // 触发UI回调
      if (this.onBeat) {
        // 使用 setTimeout 在正确的时间触发UI更新
        const delay = Math.max(0, (this.nextNoteTime - this.audioContext.currentTime) * 1000)
        setTimeout(() => {
          if (this.onBeat) {
            this.onBeat(this.currentBeat)
          }
        }, delay)
      }

      // 移动到下一拍
      this.currentBeat = (this.currentBeat + 1) % this.beatsPerMeasure

      // 计算下一拍的时间
      const secondsPerBeat = 60.0 / this.bpm
      this.nextNoteTime += secondsPerBeat
    }
  }

  // 开始播放
  async start(bpm = 120, beatsPerMeasure = 4, onBeat = null) {
    // 初始化音频上下文
    if (!this.audioContext) {
      const success = await this.init()
      if (!success) {
        throw new Error('Failed to initialize audio context')
      }
    }

    this.bpm = bpm
    this.beatsPerMeasure = beatsPerMeasure
    this.onBeat = onBeat
    this.currentBeat = 0
    this.nextNoteTime = this.audioContext.currentTime + 0.05 // 稍微延迟开始

    // 启动调度器
    this.intervalId = setInterval(() => this.scheduler(), this.lookahead)
    this.isPlaying = true
  }

  // 停止播放
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isPlaying = false
    this.currentBeat = 0
  }

  // 改变速度
  setBPM(bpm) {
    this.bpm = bpm
  }

  // 改变拍号
  setBeatsPerMeasure(beats) {
    this.beatsPerMeasure = beats
    this.currentBeat = 0
  }

  // 清理资源
  dispose() {
    this.stop()
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close()
      this.audioContext = null
    }
  }
}

// 声音发生器类 - 用于产生参考音
export class ToneGenerator {
  constructor() {
    this.synth = null
    this.isPlaying = false
  }

  // 初始化合成器
  async init() {
    await initAudioContext()
    if (!this.synth) {
      // 创建一个简单的正弦波合成器，模拟小提琴音色
      this.synth = new Tone.Synth({
        oscillator: {
          type: 'sawtooth' // 锯齿波更接近小提琴音色
        },
        envelope: {
          attack: 0.1,
          decay: 0.2,
          sustain: 0.8,
          release: 0.5
        }
      }).toDestination()

      // 添加一个轻微的颤音效果，更接近真实小提琴
      const vibrato = new Tone.Vibrato({
        frequency: 5,
        depth: 0.1
      }).toDestination()

      this.synth.connect(vibrato)
    }
  }

  // 播放指定频率的音
  async playFrequency(frequency, duration = 2) {
    if (this.isPlaying) {
      this.stop()
    }

    await this.init()
    this.isPlaying = true

    // 使用 Tone.js 播放音符
    this.synth.triggerAttack(frequency)

    // 自动停止
    if (duration > 0) {
      setTimeout(() => {
        if (this.isPlaying) {
          this.stop()
        }
      }, duration * 1000)
    }
  }

  // 停止播放
  stop() {
    if (this.synth && this.isPlaying) {
      this.synth.triggerRelease()
      this.isPlaying = false
    }
  }

  // 播放音符（如 A4, G3 等）
  async playNote(noteName, duration = 2) {
    const frequency = Tone.Frequency(noteName).toFrequency()
    await this.playFrequency(frequency, duration)
  }
}

// 音频分析器
export class AudioAnalyzer {
  constructor() {
    this.analyser = null
    this.dataArray = null
    this.isAnalyzing = false
  }

  async init(stream) {
    const context = await initAudioContext()
    const source = context.createMediaStreamSource(stream)

    this.analyser = context.createAnalyser()
    this.analyser.fftSize = 2048
    this.analyser.smoothingTimeConstant = 0.8

    source.connect(this.analyser)

    const bufferLength = this.analyser.frequencyBinCount
    this.dataArray = new Uint8Array(bufferLength)
  }

  // 获取频谱数据
  getFrequencyData() {
    if (!this.analyser) return null
    this.analyser.getByteFrequencyData(this.dataArray)
    return this.dataArray
  }

  // 获取时域数据
  getTimeDomainData() {
    if (!this.analyser) return null
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount)
    this.analyser.getByteTimeDomainData(dataArray)
    return dataArray
  }

  // 获取音量级别
  getVolumeLevel() {
    const data = this.getFrequencyData()
    if (!data) return 0

    let sum = 0
    for (let i = 0; i < data.length; i++) {
      sum += data[i]
    }
    return sum / data.length / 255
  }

  // 获取主频率
  getDominantFrequency() {
    const data = this.getFrequencyData()
    if (!data) return 0

    let maxValue = 0
    let maxIndex = 0

    for (let i = 0; i < data.length; i++) {
      if (data[i] > maxValue) {
        maxValue = data[i]
        maxIndex = i
      }
    }

    // 转换为实际频率
    const sampleRate = audioContext.sampleRate
    const frequency = (maxIndex * sampleRate) / (this.analyser.fftSize)

    return frequency
  }

  // 分析音频特征
  analyzeFeatures() {
    const frequencyData = this.getFrequencyData()
    const timeData = this.getTimeDomainData()

    if (!frequencyData || !timeData) return null

    // 计算各频段能量
    const bassEnergy = this.calculateBandEnergy(frequencyData, 0, 250)
    const midEnergy = this.calculateBandEnergy(frequencyData, 250, 2000)
    const trebleEnergy = this.calculateBandEnergy(frequencyData, 2000, 8000)

    // 计算动态范围
    let min = 255, max = 0
    for (let i = 0; i < timeData.length; i++) {
      if (timeData[i] < min) min = timeData[i]
      if (timeData[i] > max) max = timeData[i]
    }
    const dynamicRange = max - min

    return {
      bassEnergy,
      midEnergy,
      trebleEnergy,
      dynamicRange,
      volume: this.getVolumeLevel(),
      dominantFrequency: this.getDominantFrequency()
    }
  }

  // 计算频段能量
  calculateBandEnergy(data, minFreq, maxFreq) {
    const sampleRate = audioContext.sampleRate
    const binSize = sampleRate / this.analyser.fftSize

    const minBin = Math.floor(minFreq / binSize)
    const maxBin = Math.ceil(maxFreq / binSize)

    let sum = 0
    for (let i = minBin; i <= maxBin && i < data.length; i++) {
      sum += data[i]
    }

    return sum / (maxBin - minBin + 1) / 255
  }

  dispose() {
    this.analyser = null
    this.dataArray = null
    this.isAnalyzing = false
  }
}

// 导出小提琴特定的音符频率（标准音高 A442）
export const VIOLIN_NOTES = {
  'G3': 196.00,
  'D4': 293.66,
  'A4': 442.00,  // 现代标准音高
  'E5': 659.25
}

// 导出常用调音标准
export const TUNING_STANDARDS = {
  'A442': 442,  // 现代标准
  'A440': 440,  // 传统标准
  'A415': 415,  // 巴洛克调音
  'A432': 432   // 自然调音
}

// 高精度频谱分析器 - 用于频谱仪功能
export class HighPrecisionSpectrumAnalyzer {
  constructor() {
    this.audioContext = null
    this.analyser = null
    this.source = null
    this.stream = null
    this.dataArray = null
    this.isActive = false
  }

  // 初始化分析器
  async init(options = {}) {
    const {
      fftSize = 4096,
      smoothingTimeConstant = 0.8
    } = options

    try {
      // 获取麦克风权限
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false,
          channelCount: 1,
          sampleRate: 48000
        }
      })

      // 创建音频上下文
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 48000
      })

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }

      // 创建音频源
      this.source = this.audioContext.createMediaStreamSource(this.stream)

      // 创建分析器节点
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = fftSize
      this.analyser.smoothingTimeConstant = smoothingTimeConstant
      this.analyser.minDecibels = -90
      this.analyser.maxDecibels = -10

      // 连接节点
      this.source.connect(this.analyser)

      // 创建数据数组
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount)

      this.isActive = true
      return true
    } catch (error) {
      console.error('初始化频谱分析器失败:', error)
      throw error
    }
  }

  // 获取采样率
  getSampleRate() {
    return this.audioContext ? this.audioContext.sampleRate : 48000
  }

  // 设置 FFT 大小
  setFFTSize(size) {
    if (this.analyser) {
      this.analyser.fftSize = size
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount)
    }
  }

  // 设置平滑度
  setSmoothing(value) {
    if (this.analyser) {
      this.analyser.smoothingTimeConstant = value
    }
  }

  // 获取频谱数据
  getFrequencyData() {
    if (!this.analyser || !this.dataArray) return null
    this.analyser.getByteFrequencyData(this.dataArray)
    return this.dataArray
  }

  // 获取指定频段的能量级别
  getBandLevels(bands) {
    const data = this.getFrequencyData()
    if (!data) return bands.map(() => 0)

    const sampleRate = this.getSampleRate()
    const binCount = this.analyser.frequencyBinCount
    const binSize = sampleRate / 2 / binCount // 每个 bin 代表的频率范围

    return bands.map(band => {
      const minBin = Math.floor(band.minFreq / binSize)
      const maxBin = Math.min(binCount - 1, Math.ceil(band.maxFreq / binSize))

      if (minBin >= binCount || maxBin < 0) return 0

      let sum = 0
      let count = 0

      for (let i = Math.max(0, minBin); i <= maxBin; i++) {
        sum += data[i]
        count++
      }

      // 返回百分比值 (0-100)
      return count > 0 ? (sum / count / 255) * 100 : 0
    })
  }

  // 获取主频率
  getDominantFrequency() {
    const data = this.getFrequencyData()
    if (!data) return 0

    let maxValue = 0
    let maxIndex = 0

    // 跳过非常低频的噪声
    for (let i = 2; i < data.length; i++) {
      if (data[i] > maxValue) {
        maxValue = data[i]
        maxIndex = i
      }
    }

    if (maxValue < 10) return 0 // 太安静

    const sampleRate = this.getSampleRate()
    const frequency = (maxIndex * sampleRate) / (this.analyser.fftSize)

    return frequency
  }

  // 获取音量级别
  getVolumeLevel() {
    const data = this.getFrequencyData()
    if (!data) return 0

    let sum = 0
    for (let i = 0; i < data.length; i++) {
      sum += data[i]
    }
    return sum / data.length / 255
  }

  // 获取特定频率的能量
  getFrequencyEnergy(targetFreq, bandwidth = 50) {
    const data = this.getFrequencyData()
    if (!data) return 0

    const sampleRate = this.getSampleRate()
    const binSize = sampleRate / this.analyser.fftSize

    const minBin = Math.floor((targetFreq - bandwidth / 2) / binSize)
    const maxBin = Math.ceil((targetFreq + bandwidth / 2) / binSize)

    let sum = 0
    let count = 0

    for (let i = Math.max(0, minBin); i <= Math.min(data.length - 1, maxBin); i++) {
      sum += data[i]
      count++
    }

    return count > 0 ? (sum / count / 255) * 100 : 0
  }

  // 清理资源
  dispose() {
    this.isActive = false

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
      this.stream = null
    }

    if (this.source) {
      this.source.disconnect()
      this.source = null
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close()
      this.audioContext = null
    }

    this.analyser = null
    this.dataArray = null
  }
}

// 参考音播放器（用于调音器播放标准音）
export class ReferenceTonePlayer {
  constructor() {
    this.synth = null
    this.isPlaying = false
  }

  async init() {
    if (!this.synth) {
      await Tone.start()
      this.synth = new Tone.Synth({
        oscillator: {
          type: 'sine'
        },
        envelope: {
          attack: 0.1,
          decay: 0.2,
          sustain: 0.8,
          release: 0.5
        }
      }).toDestination()
    }
  }

  async play(frequency, duration = 2) {
    await this.init()
    this.isPlaying = true
    this.synth.triggerAttackRelease(frequency, duration)

    setTimeout(() => {
      this.isPlaying = false
    }, duration * 1000)
  }

  stop() {
    if (this.synth && this.isPlaying) {
      this.synth.triggerRelease()
      this.isPlaying = false
    }
  }

  dispose() {
    if (this.synth) {
      this.synth.dispose()
      this.synth = null
    }
  }
}