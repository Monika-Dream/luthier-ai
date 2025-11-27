<template>
  <div class="min-h-screen transition-colors duration-700" :style="backgroundStyle">
    <!-- Header -->
    <header class="sticky top-0 z-40 backdrop-blur-md border-b border-white/5">
      <div class="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600 to-amber-900 flex items-center justify-center">
            <Music class="w-5 h-5 text-amber-50" />
          </div>
          <div>
            <h1 class="text-xl font-serif font-bold text-amber-50">Luthier AI</h1>
            <p class="text-xs text-amber-100/60">Smart Diagnostic Lab</p>
          </div>
        </div>

        <!-- Mood Toggle -->
        <div class="flex items-center gap-4">
          <span class="text-sm text-amber-100/70">{{ moodLabel }}</span>
          <button
            @click="toggleMood"
            class="relative inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 group"
            :class="mood === 'focus' ? 'bg-blue-500/15' : 'bg-emerald-500/15'"
          >
            <div class="flex items-center gap-2">
              <component
                :is="mood === 'focus' ? Zap : Leaf"
                class="w-4 h-4 transition-colors"
                :class="mood === 'focus' ? 'text-blue-400' : 'text-emerald-400'"
              />
              <span class="text-xs font-medium text-amber-50">{{ mood === 'focus' ? 'Focus Mode' : 'Relax Mode' }}</span>
            </div>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-6xl mx-auto px-6 py-12">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Sidebar: Selection Panel -->
        <div class="lg:col-span-1">
          <Transition name="fade">
            <div v-if="!showDiagnosis" class="space-y-6">
              <!-- Title -->
              <div>
                <h2 class="text-sm uppercase tracking-widest text-amber-100/60 mb-1">Step 1</h2>
                <h3 class="text-2xl font-serif font-bold text-amber-50">Anatomy of Playing</h3>
                <p class="text-xs text-amber-100/50 mt-2">Select where you're experiencing tension</p>
              </div>

              <!-- Body Area Selection -->
              <div class="space-y-2">
                <label class="block text-xs uppercase tracking-widest text-amber-100/60 mb-3">Primary Area</label>
                <div class="space-y-2">
                  <button
                    v-for="area in bodyAreas"
                    :key="area.id"
                    @click="selectArea(area.id)"
                    class="w-full text-left px-4 py-3 rounded-lg backdrop-blur-sm border transition-all duration-300 group"
                    :class="
                      selectedArea === area.id
                        ? 'bg-amber-600/20 border-amber-500/50 shadow-lg shadow-amber-500/10'
                        : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/15'
                    "
                  >
                    <div class="flex items-center gap-3">
                      <component :is="area.icon" class="w-5 h-5 text-amber-400" />
                      <span class="text-sm font-medium text-amber-50">{{ area.label }}</span>
                    </div>
                  </button>
                </div>
              </div>

              <!-- Sub-Area Selection -->
              <Transition name="fadeSlide">
                <div v-if="selectedArea" class="space-y-2 pt-4 border-t border-white/5">
                  <label class="block text-xs uppercase tracking-widest text-amber-100/60 mb-3">Specific Point</label>
                  <div class="space-y-2">
                    <button
                      v-for="subArea in getSubAreas(selectedArea)"
                      :key="subArea.id"
                      @click="selectSubArea(subArea.id)"
                      class="w-full text-left px-4 py-3 rounded-lg backdrop-blur-sm border transition-all duration-300"
                      :class="
                        selectedSubArea === subArea.id
                          ? 'bg-emerald-600/20 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                          : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/15'
                      "
                    >
                      <span class="text-sm font-medium text-amber-50">{{ subArea.label }}</span>
                    </button>
                  </div>
                </div>
              </Transition>

              <!-- Issue Description -->
              <Transition name="fadeSlide">
                <div v-if="selectedSubArea" class="space-y-2 pt-4 border-t border-white/5">
                  <label class="block text-xs uppercase tracking-widest text-amber-100/60 mb-3">What's Happening?</label>
                  <textarea
                    v-model="issueDescription"
                    placeholder="Describe the sensation or difficulty..."
                    class="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-amber-50 text-sm placeholder-amber-100/30 focus:outline-none focus:border-amber-500/50 focus:bg-white/8 backdrop-blur-sm transition-all duration-300 resize-none"
                    rows="4"
                  ></textarea>
                </div>
              </Transition>

              <!-- Generate Button -->
              <Transition name="fadeSlide">
                <button
                  v-if="selectedSubArea && issueDescription"
                  @click="generateDiagnosis"
                  :disabled="isLoading"
                  class="w-full mt-6 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2"
                  :class="
                    isLoading
                      ? 'bg-amber-500/50 text-amber-50/50 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-amber-50 shadow-lg shadow-amber-600/20 hover:shadow-amber-600/40 active:scale-95'
                  "
                >
                  <Wand2 v-if="!isLoading" class="w-4 h-4" />
                  <Loader v-else class="w-4 h-4 animate-spin" />
                  {{ isLoading ? 'Analyzing...' : 'Generate Diagnosis' }}
                </button>
              </Transition>
            </div>
          </Transition>
        </div>

        <!-- Right Content: Diagnosis Display -->
        <div class="lg:col-span-2">
          <Transition name="scaleIn" mode="out-in">
            <div v-if="!showDiagnosis" class="flex flex-col items-center justify-center h-96 rounded-2xl backdrop-blur-sm border border-white/5 bg-gradient-to-br from-white/5 to-white/0">
              <div class="text-center space-y-4">
                <Stethoscope class="w-16 h-16 text-amber-500/40 mx-auto" />
                <div>
                  <p class="text-amber-100/50 text-sm">Complete the form to the left</p>
                  <p class="text-amber-100/30 text-xs mt-1">Your personalized diagnosis awaits</p>
                </div>
              </div>
            </div>

            <div v-else class="space-y-6">
              <!-- Back Button -->
              <button
                @click="resetForm"
                class="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors text-sm mb-2"
              >
                <ChevronLeft class="w-4 h-4" />
                New Diagnosis
              </button>

              <!-- Diagnosis Card -->
              <div class="group rounded-2xl backdrop-blur-xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/0 overflow-hidden shadow-2xl shadow-amber-600/10 hover:shadow-amber-600/20 transition-all duration-500">
                <!-- Card Header with Icon -->
                <div class="relative h-32 bg-gradient-to-br from-amber-600/30 via-amber-600/10 to-transparent overflow-hidden">
                  <div class="absolute inset-0 opacity-20">
                    <div class="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-amber-500/20 blur-2xl"></div>
                  </div>
                  <div class="relative h-full flex items-start justify-between p-6">
                    <div>
                      <p class="text-xs uppercase tracking-widest text-amber-200/60 mb-1">Diagnosis</p>
                      <h2 class="text-2xl font-serif font-bold text-amber-50 leading-tight">{{ diagnosis.title }}</h2>
                    </div>
                    <div class="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center">
                      <AlertCircle class="w-6 h-6 text-amber-400" />
                    </div>
                  </div>
                </div>

                <!-- Card Content -->
                <div class="p-6 space-y-6">
                  <!-- Issue Summary -->
                  <div class="space-y-2">
                    <p class="text-xs uppercase tracking-widest text-amber-200/60">Your Issue</p>
                    <p class="text-amber-100/80 text-sm leading-relaxed">{{ diagnosis.issue }}</p>
                  </div>

                  <!-- Root Cause -->
                  <div class="space-y-3 pt-4 border-t border-white/5">
                    <p class="text-xs uppercase tracking-widest text-amber-200/60">Root Cause</p>
                    <div class="bg-amber-600/10 border border-amber-500/20 rounded-lg p-4">
                      <p class="text-amber-50 text-sm font-medium">{{ diagnosis.rootCause }}</p>
                    </div>
                  </div>

                  <!-- Solution Steps -->
                  <div class="space-y-3 pt-4 border-t border-white/5">
                    <p class="text-xs uppercase tracking-widest text-amber-200/60 mb-3">How to Fix It</p>
                    <div class="space-y-3">
                      <div v-for="(step, index) in diagnosis.steps" :key="index" class="flex gap-4">
                        <div class="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
                          <span class="text-xs font-semibold text-emerald-400">{{ index + 1 }}</span>
                        </div>
                        <div class="flex-grow pt-1">
                          <p class="text-amber-50 text-sm leading-relaxed">{{ step }}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Practice Tips -->
                  <div class="space-y-3 pt-4 border-t border-white/5 bg-gradient-to-br from-blue-600/10 to-transparent rounded-lg p-4">
                    <div class="flex items-center gap-2 mb-2">
                      <Lightbulb class="w-4 h-4 text-blue-400" />
                      <p class="text-xs uppercase tracking-widest text-blue-300/80">Practice Tip</p>
                    </div>
                    <p class="text-blue-100/80 text-sm">{{ diagnosis.tip }}</p>
                  </div>

                  <!-- Visualization Placeholder -->
                  <div class="pt-4 border-t border-white/5">
                    <p class="text-xs uppercase tracking-widest text-amber-200/60 mb-4">Visual Reference</p>
                    <div class="relative h-48 rounded-lg bg-gradient-to-br from-amber-600/10 via-white/5 to-transparent border border-white/10 flex items-center justify-center overflow-hidden group/viz">
                      <div class="absolute inset-0 opacity-30">
                        <div class="absolute top-1/4 left-1/4 w-24 h-32 rounded-full border-2 border-amber-500/30 animate-pulse"></div>
                        <div class="absolute bottom-1/3 right-1/4 w-20 h-20 rounded-full border-2 border-emerald-500/20 animate-pulse" style="animation-delay: 0.2s"></div>
                      </div>
                      <div class="relative flex flex-col items-center justify-center gap-3">
                        <component :is="diagnosis.icon" class="w-12 h-12 text-amber-500/60" />
                        <p class="text-xs text-amber-100/50 text-center px-4">{{ diagnosis.visualLabel }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Card Footer -->
                <div class="px-6 py-4 border-t border-white/5 bg-gradient-to-r from-white/5 to-transparent flex items-center justify-between">
                  <div class="flex items-center gap-2 text-xs text-amber-100/50">
                    <CheckCircle2 class="w-4 h-4 text-emerald-400" />
                    <span>Ready to practice</span>
                  </div>
                  <button
                    @click="resetForm"
                    class="px-4 py-2 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 hover:text-amber-200 text-xs font-medium transition-all duration-300 border border-amber-500/20 hover:border-amber-500/40"
                  >
                    New Diagnosis
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-white/5 mt-16 py-8 text-center text-xs text-amber-100/40">
      <p>Luthier AI • Smart Diagnostic & Practice Companion • {{ new Date().getFullYear() }}</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  Music,
  Zap,
  Leaf,
  ChevronLeft,
  AlertCircle,
  Stethoscope,
  Lightbulb,
  CheckCircle2,
  Wand2,
  Loader,
  Hand2,
  Violin,
  Volume2,
  Waves,
  ArrowRight,
} from 'lucide-vue-next'

// State
const mood = ref('relax')
const selectedArea = ref(null)
const selectedSubArea = ref(null)
const issueDescription = ref('')
const showDiagnosis = ref(false)
const isLoading = ref(false)
const diagnosis = ref(null)

// Body Areas Configuration
const bodyAreas = [
  { id: 'left-hand', label: 'Left Hand', icon: 'Hand2' },
  { id: 'right-arm', label: 'Right Arm', icon: 'Waves' },
  { id: 'posture', label: 'Posture & Bow', icon: 'Violin' },
  { id: 'sound', label: 'Sound Quality', icon: 'Volume2' },
]

const subAreasMap = {
  'left-hand': [
    { id: 'pinky', label: 'Pinky Finger' },
    { id: 'thumb', label: 'Thumb' },
    { id: 'wrist', label: 'Wrist' },
    { id: 'stretch', label: 'Finger Stretch' },
  ],
  'right-arm': [
    { id: 'elbow', label: 'Elbow' },
    { id: 'shoulder', label: 'Shoulder' },
    { id: 'forearm', label: 'Forearm' },
    { id: 'bow-control', label: 'Bow Control' },
  ],
  'posture': [
    { id: 'chin-rest', label: 'Chin Rest Hold' },
    { id: 'bow-angle', label: 'Bow Angle' },
    { id: 'back-tension', label: 'Back Tension' },
  ],
  'sound': [
    { id: 'scratchy', label: 'Scratchy Sound' },
    { id: 'weak', label: 'Weak Tone' },
    { id: 'uneven', label: 'Uneven Pressure' },
  ],
}

// Diagnosis Database
const diagnosisData = {
  'left-hand-pinky': {
    title: "Elbow Supination Issue",
    issue: "Can't reach the G string with your pinky without stretching excessively",
    rootCause: "Your left elbow is rotated outward instead of being positioned underneath the violin. This keeps your hand frame too small to naturally reach higher positions.",
    steps: [
      "Stop trying to stretch your finger alone. Finger stretching won't solve this.",
      "Swing your left elbow inward (toward your right), positioning it directly under the violin body.",
      "This shifts your entire hand frame closer to the G string without individual finger effort.",
      "Practice slow bowing on the G string while focusing on elbow position, not finger length.",
      "Gradually increase speed as the new elbow position becomes natural."
    ],
    tip: "Remember: The violin comes to your hand through elbow rotation, not your hand stretching to the violin. Good elbow position eliminates 80% of reach problems.",
    icon: Hand2,
    visualLabel: "Adjust left elbow rotation inward"
  },
  'left-hand-thumb': {
    title: "Thumb Tension & Position",
    issue: "Thumb feels strained or inhibits finger movement",
    rootCause: "Your thumb is gripping too tightly or positioned too far around the neck, creating tension that affects all four fingers.",
    steps: [
      "Release grip pressure—your thumb should rest gently, not squeeze.",
      "Position thumb opposite your second finger (not behind it).",
      "Keep thumb joint slightly bent, never locked straight.",
      "Practice shifting positions with a relaxed thumb grip.",
      "Use slow scales to develop muscle memory for light contact."
    ],
    tip: "A relaxed thumb is like a shock absorber. It allows your fingers freedom while maintaining position stability.",
    icon: Hand2,
    visualLabel: "Thumb in neutral, relaxed position"
  },
  'right-arm-elbow': {
    title: "Bow Arm Tension & Coordination",
    issue: "Elbow feels locked or movement is restricted during bowing",
    rootCause: "Your elbow is either overextended at the frog or collapsing at the tip. This creates tension and reduces tonal control.",
    steps: [
      "Check your arm's angle at the frog—should be approximately 90 degrees.",
      "Practice keeping the same angle through the entire bow stroke.",
      "Focus on letting the elbow lead, not the wrist.",
      "Bow only on open strings while maintaining relaxed shoulders.",
      "Gradually add finger vibrato while keeping the arm relaxed."
    ],
    tip: "The bow arm has a natural radius of motion. Work with it, not against it, and let gravity do the heavy lifting.",
    icon: Waves,
    visualLabel: "Optimal 90-degree elbow angle"
  },
  'sound-scratchy': {
    title: "Bow Pressure & Angle Issues",
    issue: "Your tone sounds scratchy, thin, or unstable",
    rootCause: "Either your bow is at the wrong angle to the strings, or you're using too much pressure. Both kill tone clarity.",
    steps: [
      "Bow should be perpendicular to the strings—check in a mirror.",
      "Reduce pressure by 50%—let the bow's weight do the work.",
      "Practice slow scales on a single string (A string is easiest).",
      "Focus on consistent, smooth bow movement from frog to tip.",
      "Listen for the 'singing' quality and adjust pressure accordingly."
    ],
    tip: "Great tone comes from angle and weight distribution, not muscular pressure. Light, perpendicular, smooth = beautiful sound.",
    icon: Volume2,
    visualLabel: "90-degree bow angle to strings"
  },
}

const moodLabel = computed(() => (mood.value === 'focus' ? '🎯 Focus' : '🌿 Relax'))

const backgroundStyle = computed(() => {
  const baseColor = '#1a1a1a'
  if (mood.value === 'focus') {
    return {
      backgroundColor: '#1a1a2e',
      backgroundImage: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
    }
  }
  return {
    backgroundColor: '#1a1a1a',
    backgroundImage: 'linear-gradient(135deg, #1a1a1a 0%, #2d1f0a 100%)',
  }
})

const getSubAreas = (areaId) => {
  return subAreasMap[areaId] || []
}

const selectArea = (areaId) => {
  selectedArea.value = areaId
  selectedSubArea.value = null
}

const selectSubArea = (subAreaId) => {
  selectedSubArea.value = subAreaId
}

const toggleMood = () => {
  mood.value = mood.value === 'focus' ? 'relax' : 'focus'
}

const generateDiagnosis = async () => {
  isLoading.value = true

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1800))

  // Generate diagnosis based on selection
  const diagnosisKey = `${selectedArea.value}-${selectedSubArea.value}`
  let selectedDiagnosis = diagnosisData[diagnosisKey]

  // Fallback to a default diagnosis if not found
  if (!selectedDiagnosis) {
    selectedDiagnosis = {
      title: "Positioning & Muscle Memory Issue",
      issue: issueDescription.value,
      rootCause: "Your muscle memory hasn't developed the optimal physical pattern for this technique yet. This is completely normal and correctable.",
      steps: [
        "Isolate the problematic motion and practice it slowly 10 times.",
        "Increase speed by 5% each day until it feels natural.",
        "Record yourself to compare with reference videos.",
        "Practice this motion daily for consistent improvement.",
        "Celebrate small victories—progress compounds quickly."
      ],
      tip: "Building proper technique is about consistency, not intensity. 15 minutes daily beats sporadic cramming sessions.",
      icon: Violin,
      visualLabel: "Practice with focused intention"
    }
  }

  diagnosis.value = selectedDiagnosis
  showDiagnosis.value = true
  isLoading.value = false
}

const resetForm = () => {
  showDiagnosis.value = false
  selectedArea.value = null
  selectedSubArea.value = null
  issueDescription.value = ''
  diagnosis.value = null
}
</script>

<style scoped>
/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fadeSlide-enter-active,
.fadeSlide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fadeSlide-enter-from,
.fadeSlide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.scaleIn-enter-active,
.scaleIn-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.scaleIn-enter-from,
.scaleIn-leave-to {
  opacity: 0;
  transform: scale3d(0.95, 0.95, 1);
}

/* Smooth animations - GPU accelerated */
@keyframes subtle-float {
  0%, 100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(0, -8px, 0);
  }
}

.animate-float {
  animation: subtle-float 3s ease-in-out infinite;
  will-change: transform;
  backface-visibility: hidden;
}
</style>
