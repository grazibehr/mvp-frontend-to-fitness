<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import {
  PlusIcon,
  FireIcon,
  TrashIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/vue/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/vue/24/solid'

const authStore = useAuthStore()
const toast = useToastStore()

const loading = ref(true)
const selectedDay = ref(new Date().getDay())
const workouts = ref([])
const showAddWorkoutModal = ref(false)
const showExerciseSelector = ref(false)
const editingWorkout = ref(null)
const searchExercise = ref('')

// Estado do treino ativo
const activeWorkout = ref(null)
const activeExercises = ref([])
const timerInterval = ref(null)
const elapsedSeconds = ref(0)
const isPaused = ref(false)
const showActiveWorkoutModal = ref(false)
const showFinishedModal = ref(false)
const finishedWorkoutSummary = ref(null)
const motivationalMessage = ref('')

// Status types
const STATUS = {
  PLANNED: 'planned',
  IN_PROGRESS: 'in_progress',
  DONE: 'done'
}

const statusConfig = {
  planned: { label: 'Planejado', color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-700', dot: 'bg-gray-300 dark:bg-gray-500' },
  in_progress: { label: 'Em Andamento', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', dot: 'bg-blue-500' },
  done: { label: 'Concluído', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', dot: 'bg-green-500' }
}

const motivationalMessages = {
  complete: ['Treino completo! Você é demais!', 'Arrasou! Todos os exercícios feitos!', 'Perfeito! Esse é o espírito!', 'Incrível! Você é uma máquina!', 'Mandou muito bem! Continue assim!'],
  partial: ['Bom treino! Continue evoluindo!', 'Ótimo esforço! O importante é não parar!', 'Muito bem! Cada treino conta!', 'Parabéns! Você já está mais forte!', 'Legal! Amanhã vai ser ainda melhor!'],
  start: ['Bora! Você consegue!', 'Foco total! Vamos nessa!', 'É hora de evoluir!', 'Mais um dia de superação!', 'Seu eu do futuro agradece!']
}

// Exercícios disponíveis (mock)
const availableExercises = ref([
  { id: 1, name: 'Supino Reto', muscle_group: 'Peito', equipment: 'Barra e banco', difficulty: 'intermediate', contraindicated: ['shoulder_injury'] },
  { id: 2, name: 'Supino Inclinado', muscle_group: 'Peito', equipment: 'Halteres', difficulty: 'intermediate', contraindicated: ['shoulder_injury'] },
  { id: 3, name: 'Flexão de Braço', muscle_group: 'Peito', equipment: 'Corporal', difficulty: 'beginner', contraindicated: [] },
  { id: 4, name: 'Puxada Frontal', muscle_group: 'Costas', equipment: 'Máquina', difficulty: 'beginner', contraindicated: [] },
  { id: 5, name: 'Remada Curvada', muscle_group: 'Costas', equipment: 'Barra', difficulty: 'intermediate', contraindicated: ['back_pain'] },
  { id: 6, name: 'Desenvolvimento', muscle_group: 'Ombros', equipment: 'Halteres', difficulty: 'intermediate', contraindicated: ['shoulder_injury', 'hypertension'] },
  { id: 7, name: 'Elevação Lateral', muscle_group: 'Ombros', equipment: 'Halteres', difficulty: 'beginner', contraindicated: ['shoulder_injury'] },
  { id: 8, name: 'Rosca Direta', muscle_group: 'Bíceps', equipment: 'Barra', difficulty: 'beginner', contraindicated: [] },
  { id: 9, name: 'Tríceps Pulley', muscle_group: 'Tríceps', equipment: 'Cabo', difficulty: 'beginner', contraindicated: [] },
  { id: 10, name: 'Agachamento Livre', muscle_group: 'Pernas', equipment: 'Barra', difficulty: 'advanced', contraindicated: ['knee_problems', 'back_pain'] },
  { id: 11, name: 'Leg Press', muscle_group: 'Pernas', equipment: 'Máquina', difficulty: 'beginner', contraindicated: ['knee_problems'] },
  { id: 12, name: 'Stiff', muscle_group: 'Pernas', equipment: 'Barra', difficulty: 'intermediate', contraindicated: ['back_pain'] },
  { id: 13, name: 'Hip Thrust', muscle_group: 'Glúteos', equipment: 'Barra e banco', difficulty: 'intermediate', contraindicated: [] },
  { id: 14, name: 'Abdominal Crunch', muscle_group: 'Abdômen', equipment: 'Corporal', difficulty: 'beginner', contraindicated: ['back_pain'] },
  { id: 15, name: 'Prancha', muscle_group: 'Abdômen', equipment: 'Corporal', difficulty: 'beginner', contraindicated: [] },
])

const user = computed(() => authStore.user)

const formattedTime = computed(() => {
  const hours = Math.floor(elapsedSeconds.value / 3600)
  const minutes = Math.floor((elapsedSeconds.value % 3600) / 60)
  const seconds = elapsedSeconds.value % 60
  if (hours > 0) return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const workoutProgress = computed(() => {
  if (activeExercises.value.length === 0) return 0
  return Math.round((activeExercises.value.filter(e => e.completed).length / activeExercises.value.length) * 100)
})

const completedExercisesCount = computed(() => activeExercises.value.filter(e => e.completed).length)

const weekDays = [
  { value: 0, label: 'Dom', full: 'Domingo' },
  { value: 1, label: 'Seg', full: 'Segunda' },
  { value: 2, label: 'Ter', full: 'Terça' },
  { value: 3, label: 'Qua', full: 'Quarta' },
  { value: 4, label: 'Qui', full: 'Quinta' },
  { value: 5, label: 'Sex', full: 'Sexta' },
  { value: 6, label: 'Sáb', full: 'Sábado' }
]

const exercisesByMuscle = computed(() => {
  const groups = {}
  let list = availableExercises.value

  if (searchExercise.value) {
    const q = searchExercise.value.toLowerCase()
    list = list.filter(e => e.name.toLowerCase().includes(q) || e.muscle_group.toLowerCase().includes(q))
  }

  list.forEach(ex => {
    if (!groups[ex.muscle_group]) groups[ex.muscle_group] = []
    groups[ex.muscle_group].push(ex)
  })
  return groups
})

const todayWorkout = computed(() => workouts.value.find(w => w.day_of_week === selectedDay.value))

const workoutsByDay = computed(() => {
  const result = {}
  weekDays.forEach(day => {
    result[day.value] = workouts.value.find(w => w.day_of_week === day.value) || null
  })
  return result
})

// Semana resumo
const weekStats = computed(() => ({
  total: workouts.value.length,
  done: workouts.value.filter(w => w.status === STATUS.DONE).length,
  inProgress: workouts.value.filter(w => w.status === STATUS.IN_PROGRESS).length,
  exercises: workouts.value.reduce((s, w) => s + w.exercises.length, 0),
  rest: 7 - workouts.value.length
}))

const newWorkout = ref({ name: '', day_of_week: null, exercises: [] })

function getRandomMessage(type) {
  const msgs = motivationalMessages[type] || motivationalMessages.partial
  return msgs[Math.floor(Math.random() * msgs.length)]
}

function isContraindicated(exercise) {
  if (!user.value?.health_conditions) return false
  return exercise.contraindicated.some(c => user.value.health_conditions.includes(c))
}

// --- Status management ---
function markStatus(workoutId, status) {
  const idx = workouts.value.findIndex(w => w.id === workoutId)
  if (idx > -1) {
    workouts.value[idx].status = status
    localStorage.setItem('workouts', JSON.stringify(workouts.value))
    const labels = { planned: 'marcado como planejado', in_progress: 'marcado em andamento', done: 'marcado como concluído' }
    toast.success(`Treino ${labels[status]}`)
  }
}

// --- Workout CRUD ---
function openAddWorkout() {
  newWorkout.value = {
    name: `Treino ${weekDays[selectedDay.value].full}`,
    day_of_week: selectedDay.value,
    exercises: [],
    status: STATUS.PLANNED
  }
  editingWorkout.value = null
  showAddWorkoutModal.value = true
}

function editWorkout(workout) {
  newWorkout.value = JSON.parse(JSON.stringify(workout))
  editingWorkout.value = workout.id
  showAddWorkoutModal.value = true
}

function closeModal() {
  showAddWorkoutModal.value = false
  showExerciseSelector.value = false
  editingWorkout.value = null
}

function openExerciseSelector() {
  searchExercise.value = ''
  showExerciseSelector.value = true
}

function addExerciseToWorkout(exercise) {
  if (newWorkout.value.exercises.find(e => e.id === exercise.id)) {
    toast.info('Exercício já adicionado')
    return
  }
  newWorkout.value.exercises.push({ ...exercise, sets: 3, reps: '12', weight: null })
  toast.success(`${exercise.name} adicionado`)
}

function removeExercise(index) {
  newWorkout.value.exercises.splice(index, 1)
}

function updateExercise(index, field, value) {
  newWorkout.value.exercises[index][field] = value
}

function saveWorkout() {
  if (!newWorkout.value.name || newWorkout.value.exercises.length === 0) {
    toast.error('Adicione um nome e pelo menos um exercício')
    return
  }

  if (editingWorkout.value) {
    const idx = workouts.value.findIndex(w => w.id === editingWorkout.value)
    if (idx > -1) workouts.value[idx] = { ...newWorkout.value, id: editingWorkout.value }
    toast.success('Treino atualizado!')
  } else {
    const existIdx = workouts.value.findIndex(w => w.day_of_week === newWorkout.value.day_of_week)
    if (existIdx > -1) workouts.value.splice(existIdx, 1)
    workouts.value.push({ ...newWorkout.value, id: Date.now(), status: STATUS.PLANNED })
    toast.success('Treino criado!')
  }

  localStorage.setItem('workouts', JSON.stringify(workouts.value))
  // Navegar para o dia do treino salvo
  selectedDay.value = newWorkout.value.day_of_week
  closeModal()
}

function deleteWorkout(workoutId) {
  if (!confirm('Excluir este treino?')) return
  workouts.value = workouts.value.filter(w => w.id !== workoutId)
  localStorage.setItem('workouts', JSON.stringify(workouts.value))
  toast.success('Treino excluído')
}

// --- Active workout ---
function startWorkout(workout) {
  activeWorkout.value = workout
  activeExercises.value = workout.exercises.map(e => ({ ...e, completed: false, completedSets: 0 }))
  elapsedSeconds.value = 0
  isPaused.value = false
  showActiveWorkoutModal.value = true

  markStatus(workout.id, STATUS.IN_PROGRESS)
  timerInterval.value = setInterval(() => { if (!isPaused.value) elapsedSeconds.value++ }, 1000)
  toast.success(getRandomMessage('start'))
}

function togglePause() {
  isPaused.value = !isPaused.value
}

function toggleExerciseComplete(index) {
  activeExercises.value[index].completed = !activeExercises.value[index].completed
}

function incrementSet(index) {
  const ex = activeExercises.value[index]
  if (ex.completedSets < ex.sets) {
    ex.completedSets++
    if (ex.completedSets === ex.sets) {
      ex.completed = true
      toast.success(`${ex.name} concluído!`)
    }
  }
}

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}min`
  if (m > 0) return `${m}min ${s}s`
  return `${s}s`
}

function finishWorkout() {
  if (timerInterval.value) { clearInterval(timerInterval.value); timerInterval.value = null }

  const summary = {
    id: Date.now(),
    workoutId: activeWorkout.value.id,
    workoutName: activeWorkout.value.name,
    date: new Date().toISOString(),
    duration: elapsedSeconds.value,
    durationFormatted: formatDuration(elapsedSeconds.value),
    exercisesCompleted: completedExercisesCount.value,
    totalExercises: activeExercises.value.length,
    totalSets: activeExercises.value.reduce((s, e) => s + e.completedSets, 0),
    exercises: activeExercises.value
  }

  const history = JSON.parse(localStorage.getItem('workoutHistory') || '[]')
  history.push(summary)
  localStorage.setItem('workoutHistory', JSON.stringify(history))

  markStatus(activeWorkout.value.id, STATUS.DONE)

  const isComplete = summary.exercisesCompleted === summary.totalExercises
  motivationalMessage.value = getRandomMessage(isComplete ? 'complete' : 'partial')

  finishedWorkoutSummary.value = summary
  showActiveWorkoutModal.value = false
  showFinishedModal.value = true
}

function closeFinishedModal() {
  showFinishedModal.value = false
  finishedWorkoutSummary.value = null
  activeWorkout.value = null
  activeExercises.value = []
  elapsedSeconds.value = 0
}

function cancelWorkout() {
  if (!confirm('Deseja cancelar o treino?')) return
  if (timerInterval.value) { clearInterval(timerInterval.value); timerInterval.value = null }
  markStatus(activeWorkout.value.id, STATUS.PLANNED)
  showActiveWorkoutModal.value = false
  activeWorkout.value = null
  activeExercises.value = []
  elapsedSeconds.value = 0
  toast.info('Treino cancelado')
}

onUnmounted(() => { if (timerInterval.value) clearInterval(timerInterval.value) })

onMounted(async () => {
  await new Promise(resolve => setTimeout(resolve, 300))
  const saved = localStorage.getItem('workouts')
  if (saved) workouts.value = JSON.parse(saved)
  loading.value = false
})
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <div>
        <h1 class="page-title">Meus Treinos</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5 hidden lg:block">
          {{ weekStats.done }}/{{ weekStats.total }} treinos concluídos essa semana
        </p>
      </div>
      <button @click="openAddWorkout" class="btn-primary py-2.5 px-4 text-sm">
        <PlusIcon class="w-4 h-4 mr-1.5 inline" /> Novo Treino
      </button>
    </header>

    <div class="lg:grid lg:grid-cols-[260px_1fr] lg:gap-6 lg:items-start">

      <!-- Sidebar: seletor de dias + resumo -->
      <div class="lg:sticky lg:top-6 space-y-4 mb-6 lg:mb-0">

        <!-- Seletor de dias -->
        <div class="card !p-3">
          <p class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2 mb-2">
            Semana atual
          </p>

          <!-- Mobile: horizontal -->
          <div class="flex justify-between lg:hidden bg-gray-50 dark:bg-gray-700/50 rounded-xl p-1">
            <button
              v-for="day in weekDays"
              :key="day.value"
              @click="selectedDay = day.value"
              :class="[
                'flex-1 py-2 rounded-lg text-center transition-all relative',
                selectedDay === day.value ? 'bg-primary-500 text-white shadow-sm' :
                workoutsByDay[day.value] ? 'text-primary-500 font-medium' : 'text-gray-400'
              ]"
            >
              <span class="text-xs font-medium">{{ day.label }}</span>
              <div v-if="workoutsByDay[day.value]" class="w-1.5 h-1.5 rounded-full mx-auto mt-0.5"
                :class="[
                  selectedDay === day.value ? 'bg-white' :
                  workoutsByDay[day.value]?.status === STATUS.DONE ? 'bg-green-500' :
                  workoutsByDay[day.value]?.status === STATUS.IN_PROGRESS ? 'bg-blue-500' :
                  'bg-primary-500'
                ]"
              />
            </button>
          </div>

          <!-- Desktop: vertical list -->
          <div class="hidden lg:flex flex-col gap-0.5">
            <button
              v-for="day in weekDays"
              :key="day.value"
              @click="selectedDay = day.value"
              :class="[
                'w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all',
                selectedDay === day.value
                  ? 'bg-primary-500 text-white'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/60 text-gray-600 dark:text-gray-400'
              ]"
            >
              <span class="text-sm font-medium">{{ day.full }}</span>
              <div class="flex items-center gap-2">
                <span v-if="workoutsByDay[day.value]" class="text-xs opacity-80">
                  {{ workoutsByDay[day.value].exercises.length }} ex.
                </span>
                <!-- Status dot -->
                <div class="w-2 h-2 rounded-full flex-shrink-0"
                  :class="[
                    !workoutsByDay[day.value] ? (selectedDay === day.value ? 'bg-white/30' : 'bg-gray-200 dark:bg-gray-600') :
                    workoutsByDay[day.value].status === STATUS.DONE ? 'bg-green-400' :
                    workoutsByDay[day.value].status === STATUS.IN_PROGRESS ? 'bg-blue-400' :
                    selectedDay === day.value ? 'bg-white' : 'bg-primary-400'
                  ]"
                />
              </div>
            </button>
          </div>
        </div>

        <!-- Meus Treinos (atalhos) -->
        <div class="card !p-3">
          <div class="flex items-center justify-between mb-2">
            <p class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Meus Treinos</p>
            <button
              @click="openAddWorkout()"
              class="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center hover:bg-primary-200 dark:hover:bg-primary-900/60 transition-colors"
              title="Adicionar treino"
            >
              <PlusIcon class="w-3 h-3 text-primary-500" />
            </button>
          </div>

          <!-- Lista de treinos criados -->
          <div v-if="workouts.length > 0" class="flex flex-col gap-0.5">
            <button
              v-for="workout in [...workouts].sort((a, b) => a.day_of_week - b.day_of_week)"
              :key="workout.id"
              @click="selectedDay = workout.day_of_week"
              :class="[
                'w-full flex items-center gap-2 px-2.5 py-2 rounded-xl transition-all text-left',
                selectedDay === workout.day_of_week
                  ? 'bg-primary-500 text-white'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/60'
              ]"
            >
              <div class="w-1.5 h-1.5 rounded-full flex-shrink-0"
                :class="[
                  workout.status === STATUS.DONE ? 'bg-green-400' :
                  workout.status === STATUS.IN_PROGRESS ? 'bg-blue-400' :
                  selectedDay === workout.day_of_week ? 'bg-white' : 'bg-primary-400'
                ]"
              />
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium truncate" :class="selectedDay === workout.day_of_week ? 'text-white' : 'text-gray-700 dark:text-gray-300'">{{ workout.name }}</p>
                <p class="text-xs truncate" :class="selectedDay === workout.day_of_week ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'">{{ weekDays[workout.day_of_week]?.label }} · {{ workout.exercises.length }} ex.</p>
              </div>
            </button>
          </div>

          <!-- Empty state -->
          <button
            v-else
            @click="openAddWorkout()"
            class="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl border border-dashed border-gray-200 dark:border-gray-600 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all group"
          >
            <PlusIcon class="w-4 h-4 text-gray-300 dark:text-gray-500 group-hover:text-primary-500 flex-shrink-0" />
            <span class="text-xs text-gray-400 dark:text-gray-500 group-hover:text-primary-500">Adicionar treino</span>
          </button>
        </div>

        <!-- Legenda de status -->
        <div class="card !p-3 space-y-1.5">
          <p class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Status</p>
          <div class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <div class="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-500"></div>
            Planejado
          </div>
          <div class="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
            <div class="w-2 h-2 rounded-full bg-blue-500"></div>
            Em Andamento
          </div>
          <div class="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
            <div class="w-2 h-2 rounded-full bg-green-500"></div>
            Concluído
          </div>
        </div>

        <!-- Resumo semanal -->
        <div class="card">
          <p class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Resumo da semana</p>
          <div class="grid grid-cols-2 gap-2">
            <div class="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-center">
              <p class="text-2xl font-bold text-primary-500">{{ weekStats.total }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Treinos</p>
            </div>
            <div class="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
              <p class="text-2xl font-bold text-green-500">{{ weekStats.done }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Concluídos</p>
            </div>
            <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
              <p class="text-2xl font-bold text-blue-500">{{ weekStats.exercises }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Exercícios</p>
            </div>
            <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-center">
              <p class="text-2xl font-bold text-gray-500">{{ weekStats.rest }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Descanso</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Conteúdo principal -->
      <div>
        <div v-if="loading" class="skeleton h-64 rounded-2xl"></div>

        <template v-else>
          <!-- Treino do dia selecionado -->
          <div v-if="todayWorkout" class="card">
            <!-- Header do card -->
            <div class="flex items-start justify-between mb-5">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <h2 class="text-lg font-bold text-gray-800 dark:text-white">{{ todayWorkout.name }}</h2>
                  <!-- Badge de status -->
                  <span :class="['inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', statusConfig[todayWorkout.status || STATUS.PLANNED].bg, statusConfig[todayWorkout.status || STATUS.PLANNED].color]">
                    <span class="w-1.5 h-1.5 rounded-full" :class="statusConfig[todayWorkout.status || STATUS.PLANNED].dot"></span>
                    {{ statusConfig[todayWorkout.status || STATUS.PLANNED].label }}
                  </span>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ weekDays[selectedDay].full }} · {{ todayWorkout.exercises.length }} exercício{{ todayWorkout.exercises.length !== 1 ? 's' : '' }} ·
                  {{ todayWorkout.exercises.reduce((s, e) => s + e.sets, 0) }} séries
                </p>
              </div>
              <div class="flex items-center gap-2">
                <button @click="editWorkout(todayWorkout)" class="px-3 py-1.5 text-sm text-primary-500 font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors">
                  Editar
                </button>
                <button @click="deleteWorkout(todayWorkout.id)" class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Lista de exercícios -->
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-3 mb-5">
              <div
                v-for="(exercise, index) in todayWorkout.exercises"
                :key="exercise.id"
                class="flex items-center gap-3 p-3 rounded-xl"
                :class="todayWorkout.status === STATUS.DONE ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-700/60'"
              >
                <span class="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                  :class="todayWorkout.status === STATUS.DONE ? 'bg-green-100 dark:bg-green-900/40 text-green-600' : 'bg-primary-100 dark:bg-primary-900/40 text-primary-500'"
                >
                  {{ index + 1 }}
                </span>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-gray-800 dark:text-white text-sm truncate">{{ exercise.name }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {{ exercise.sets }} séries × {{ exercise.reps }} reps
                    <span v-if="exercise.weight" class="ml-1">· {{ exercise.weight }}kg</span>
                  </p>
                </div>
                <span class="text-xs text-gray-400 flex-shrink-0">{{ exercise.muscle_group }}</span>
                <CheckCircleSolidIcon v-if="todayWorkout.status === STATUS.DONE" class="w-4 h-4 text-green-500 flex-shrink-0" />
              </div>
            </div>

            <!-- Ações de status + iniciar -->
            <div v-if="todayWorkout.status === STATUS.DONE" class="flex items-center gap-3">
              <div class="flex-1 flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <CheckCircleSolidIcon class="w-5 h-5 text-green-500" />
                <span class="text-green-700 dark:text-green-300 font-medium text-sm">Treino concluído!</span>
              </div>
              <button @click="markStatus(todayWorkout.id, STATUS.PLANNED)" class="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                Desfazer
              </button>
            </div>

            <div v-else class="flex gap-3">
              <button @click="startWorkout(todayWorkout)" class="flex-1 btn-primary flex items-center justify-center gap-2">
                <PlayIcon class="w-5 h-5" />
                {{ todayWorkout.status === STATUS.IN_PROGRESS ? 'Continuar Treino' : 'Iniciar Treino' }}
              </button>
              <button
                v-if="todayWorkout.status !== STATUS.IN_PROGRESS"
                @click="markStatus(todayWorkout.id, STATUS.DONE)"
                class="px-4 py-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 font-medium text-sm rounded-xl hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors flex items-center gap-2"
              >
                <CheckIcon class="w-4 h-4" />
                Marcar como Feito
              </button>
            </div>
          </div>

          <!-- Empty state -->
          <div v-else class="card text-center py-16">
            <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
              <FireIcon class="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 class="font-semibold text-gray-800 dark:text-white mb-2">Dia de Descanso</h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm mb-6">
              Nenhum treino programado para {{ weekDays[selectedDay].full.toLowerCase() }}
            </p>
            <button @click="openAddWorkout" class="btn-primary inline-flex mx-auto">
              <PlusIcon class="w-4 h-4 mr-2" />
              Criar Treino para esse Dia
            </button>
          </div>
        </template>
      </div>
    </div>

    <!-- ==================== MODAL: TREINO ATIVO ==================== -->
    <Teleport to="body">
      <div v-if="showActiveWorkoutModal" class="fixed inset-0 z-50 bg-background-light dark:bg-background-dark flex flex-col">
        <!-- Header laranja com cronômetro -->
        <div class="bg-primary-500 text-white p-4 flex-shrink-0">
          <div class="flex items-center justify-between mb-4">
            <button @click="cancelWorkout" class="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <XMarkIcon class="w-6 h-6" />
            </button>
            <h2 class="text-lg font-semibold">{{ activeWorkout?.name }}</h2>
            <div class="w-10"></div>
          </div>

          <div class="text-center py-4">
            <div class="flex items-center justify-center gap-2 mb-2">
              <ClockIcon class="w-6 h-6" />
              <span class="text-4xl font-mono font-bold">{{ formattedTime }}</span>
            </div>
            <button @click="togglePause" class="px-4 py-2 bg-white/20 rounded-full text-sm font-medium hover:bg-white/30 transition-colors">
              <PauseIcon v-if="!isPaused" class="w-4 h-4 inline mr-1" />
              <PlayIcon v-else class="w-4 h-4 inline mr-1" />
              {{ isPaused ? 'Retomar' : 'Pausar' }}
            </button>
          </div>

          <div class="mt-4">
            <div class="flex justify-between text-sm mb-1">
              <span>{{ completedExercisesCount }}/{{ activeExercises.length }} exercícios</span>
              <span>{{ workoutProgress }}%</span>
            </div>
            <div class="h-2 bg-white/30 rounded-full overflow-hidden">
              <div class="h-full bg-white rounded-full transition-all duration-300" :style="{ width: `${workoutProgress}%` }" />
            </div>
          </div>
        </div>

        <!-- Lista de exercícios -->
        <div class="flex-1 overflow-y-auto p-4">
          <div class="space-y-3 max-w-2xl mx-auto">
            <div
              v-for="(exercise, index) in activeExercises"
              :key="exercise.id"
              :class="['p-4 rounded-xl border-2 transition-all', exercise.completed ? 'bg-green-50 dark:bg-green-900/20 border-green-500' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600']"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-3">
                  <button @click="toggleExerciseComplete(index)" class="flex-shrink-0">
                    <CheckCircleSolidIcon v-if="exercise.completed" class="w-7 h-7 text-green-500" />
                    <CheckCircleIcon v-else class="w-7 h-7 text-gray-300 dark:text-gray-500" />
                  </button>
                  <div>
                    <p :class="['font-semibold', exercise.completed ? 'text-green-700 dark:text-green-400 line-through' : 'text-gray-800 dark:text-white']">
                      {{ exercise.name }}
                    </p>
                    <p class="text-sm text-gray-500">{{ exercise.muscle_group }}</p>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between pl-10">
                <div class="flex gap-4 text-sm">
                  <span class="text-gray-600 dark:text-gray-300"><strong>{{ exercise.sets }}</strong> séries</span>
                  <span class="text-gray-600 dark:text-gray-300"><strong>{{ exercise.reps }}</strong> reps</span>
                  <span v-if="exercise.weight" class="text-gray-600 dark:text-gray-300"><strong>{{ exercise.weight }}</strong> kg</span>
                </div>

                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-500">{{ exercise.completedSets }}/{{ exercise.sets }}</span>
                  <button
                    @click="incrementSet(index)"
                    :disabled="exercise.completed"
                    :class="['px-3 py-1.5 rounded-lg text-sm font-medium transition-all', exercise.completed ? 'bg-green-100 text-green-600 cursor-not-allowed' : 'bg-primary-500 text-white hover:bg-primary-600 active:scale-95']"
                  >
                    <CheckIcon class="w-4 h-4 inline" /> Série
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0 modal-footer">
          <button @click="finishWorkout" class="w-full min-h-[48px] px-6 py-3 rounded-xl font-semibold bg-green-500 text-white hover:bg-green-600 transition-all flex items-center justify-center gap-2">
            <StopIcon class="w-5 h-5" /> Finalizar Treino
          </button>
        </div>
      </div>
    </Teleport>

    <!-- ==================== MODAL: TREINO FINALIZADO ==================== -->
    <Teleport to="body">
      <div v-if="showFinishedModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div class="w-full max-w-sm bg-white dark:bg-gray-800 rounded-3xl overflow-hidden animate-scale-in">
          <div class="bg-gradient-to-br from-green-400 to-green-600 p-8 text-center text-white">
            <div class="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
              <CheckCircleSolidIcon class="w-12 h-12 text-white" />
            </div>
            <h2 class="text-2xl font-bold mb-1">Treino Finalizado!</h2>
            <p class="text-white/80">Parabéns pelo esforço!</p>
          </div>

          <div class="p-6">
            <h3 class="font-semibold text-gray-800 dark:text-white mb-4 text-center">{{ finishedWorkoutSummary?.workoutName }}</h3>
            <div class="grid grid-cols-3 gap-4 mb-6">
              <div class="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <ClockIcon class="w-6 h-6 mx-auto mb-1 text-primary-500" />
                <p class="text-lg font-bold text-gray-800 dark:text-white">{{ finishedWorkoutSummary?.durationFormatted }}</p>
                <p class="text-xs text-gray-500">Duração</p>
              </div>
              <div class="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <FireIcon class="w-6 h-6 mx-auto mb-1 text-orange-500" />
                <p class="text-lg font-bold text-gray-800 dark:text-white">{{ finishedWorkoutSummary?.exercisesCompleted }}/{{ finishedWorkoutSummary?.totalExercises }}</p>
                <p class="text-xs text-gray-500">Exercícios</p>
              </div>
              <div class="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <CheckCircleIcon class="w-6 h-6 mx-auto mb-1 text-green-500" />
                <p class="text-lg font-bold text-gray-800 dark:text-white">{{ finishedWorkoutSummary?.totalSets }}</p>
                <p class="text-xs text-gray-500">Séries</p>
              </div>
            </div>

            <div class="text-center mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
              <p class="text-primary-700 dark:text-primary-300 font-medium">{{ motivationalMessage }}</p>
            </div>

            <button @click="closeFinishedModal" class="w-full min-h-[48px] px-6 py-3 rounded-xl font-semibold bg-primary-500 text-white hover:bg-primary-600 transition-all">
              Fechar
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ==================== MODAL: CRIAR/EDITAR TREINO ==================== -->
    <Teleport to="body">
      <div v-if="showAddWorkoutModal" class="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/50" @click.self="closeModal">
        <div class="w-full max-w-lg bg-white dark:bg-gray-800 rounded-t-3xl lg:rounded-2xl flex flex-col animate-slide-up modal-container lg:modal-desktop">
          <div class="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
            <h2 class="text-lg font-semibold text-gray-800 dark:text-white">{{ editingWorkout ? 'Editar Treino' : 'Novo Treino' }}</h2>
            <button @click="closeModal" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <XMarkIcon class="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-4 min-h-0">
            <div class="mb-4">
              <label class="input-label">Nome do Treino</label>
              <input v-model="newWorkout.name" type="text" class="input" placeholder="Ex: Treino A - Peito e Tríceps" />
            </div>

            <div class="mb-4">
              <label class="input-label">Dia da Semana</label>
              <div class="flex gap-1.5">
                <button
                  v-for="day in weekDays"
                  :key="day.value"
                  @click="newWorkout.day_of_week = day.value"
                  :class="['flex-1 py-2 rounded-lg text-xs font-medium transition-colors', newWorkout.day_of_week === day.value ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300']"
                >{{ day.label }}</button>
              </div>
            </div>

            <div class="mb-4">
              <div class="flex items-center justify-between mb-2">
                <label class="input-label mb-0">Exercícios ({{ newWorkout.exercises.length }})</label>
                <button @click="openExerciseSelector" class="text-sm text-primary-500 font-medium flex items-center gap-1">
                  <PlusIcon class="w-4 h-4" /> Adicionar
                </button>
              </div>

              <div v-if="newWorkout.exercises.length > 0" class="space-y-3">
                <div v-for="(exercise, index) in newWorkout.exercises" :key="exercise.id" class="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div class="flex items-start justify-between mb-2">
                    <div>
                      <p class="font-medium text-gray-800 dark:text-white text-sm">{{ exercise.name }}</p>
                      <p class="text-xs text-gray-500">{{ exercise.muscle_group }}</p>
                    </div>
                    <button @click="removeExercise(index)" class="p-1 text-red-500">
                      <TrashIcon class="w-4 h-4" />
                    </button>
                  </div>
                  <div class="grid grid-cols-3 gap-2">
                    <div>
                      <label class="text-xs text-gray-500">Séries</label>
                      <input :value="exercise.sets" @input="updateExercise(index, 'sets', Number($event.target.value))" type="number" class="input py-2 text-sm text-center" min="1" max="10" />
                    </div>
                    <div>
                      <label class="text-xs text-gray-500">Reps</label>
                      <input :value="exercise.reps" @input="updateExercise(index, 'reps', $event.target.value)" type="text" class="input py-2 text-sm text-center" placeholder="12" />
                    </div>
                    <div>
                      <label class="text-xs text-gray-500">Peso (kg)</label>
                      <input :value="exercise.weight" @input="updateExercise(index, 'weight', $event.target.value ? Number($event.target.value) : null)" type="number" class="input py-2 text-sm text-center" placeholder="-" />
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <p class="text-gray-500 text-sm">Nenhum exercício adicionado</p>
                <button @click="openExerciseSelector" class="text-primary-500 text-sm font-medium mt-2">+ Adicionar exercícios</button>
              </div>
            </div>
          </div>

          <div class="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0 modal-footer">
            <button @click="saveWorkout" :disabled="!newWorkout.name || newWorkout.exercises.length === 0" class="w-full min-h-[48px] px-6 py-3 rounded-xl font-semibold bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
              <CheckIcon class="w-4 h-4" /> Salvar Treino
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ==================== MODAL: SELETOR DE EXERCÍCIOS ==================== -->
    <Teleport to="body">
      <div v-if="showExerciseSelector" class="fixed inset-0 z-[60] flex items-end lg:items-center justify-center bg-black/50" @click.self="showExerciseSelector = false">
        <div class="w-full max-w-lg bg-white dark:bg-gray-800 rounded-t-3xl lg:rounded-2xl flex flex-col animate-slide-up modal-container-sm lg:modal-desktop">
          <div class="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
            <h2 class="text-lg font-semibold text-gray-800 dark:text-white">Escolher Exercício</h2>
            <button @click="showExerciseSelector = false" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <XMarkIcon class="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div class="p-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
            <div class="relative">
              <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input v-model="searchExercise" type="text" class="input pl-10" placeholder="Buscar exercício..." />
            </div>
          </div>

          <div class="flex-1 overflow-y-auto p-4 min-h-0">
            <div v-for="(exercises, muscle) in exercisesByMuscle" :key="muscle" class="mb-5">
              <h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{{ muscle }}</h3>
              <div class="space-y-2">
                <button
                  v-for="exercise in exercises"
                  :key="exercise.id"
                  @click="addExerciseToWorkout(exercise)"
                  :class="[
                    'w-full p-3 text-left rounded-xl transition-colors flex items-center justify-between',
                    isContraindicated(exercise) ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600',
                    newWorkout.exercises.find(e => e.id === exercise.id) ? 'ring-2 ring-primary-500' : ''
                  ]"
                >
                  <div>
                    <p class="font-medium text-gray-800 dark:text-white text-sm">{{ exercise.name }}</p>
                    <div class="flex items-center gap-2 mt-0.5">
                      <span :class="['text-xs px-2 py-0.5 rounded-full', exercise.difficulty === 'beginner' ? 'bg-green-100 text-green-700' : exercise.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700']">
                        {{ exercise.difficulty === 'beginner' ? 'Iniciante' : exercise.difficulty === 'intermediate' ? 'Intermediário' : 'Avançado' }}
                      </span>
                      <span v-if="isContraindicated(exercise)" class="text-xs text-red-500 flex items-center gap-1">
                        <ExclamationTriangleIcon class="w-3 h-3" /> Cuidado
                      </span>
                    </div>
                  </div>
                  <PlusIcon v-if="!newWorkout.exercises.find(e => e.id === exercise.id)" class="w-5 h-5 text-primary-500" />
                  <CheckIcon v-else class="w-5 h-5 text-green-500" />
                </button>
              </div>
            </div>
          </div>

          <div class="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0 modal-footer">
            <button @click="showExerciseSelector = false" class="w-full min-h-[48px] px-6 py-3 rounded-xl font-semibold bg-primary-500 text-white hover:bg-primary-600 transition-all">
              Concluir ({{ newWorkout.exercises.length }} exercício{{ newWorkout.exercises.length !== 1 ? 's' : '' }})
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.modal-container { max-height: 85vh; max-height: 85dvh; }
.modal-container-sm { max-height: 80vh; max-height: 80dvh; }
@media (min-width: 1024px) { .modal-desktop { max-height: 90vh; max-height: 90dvh; } }
.modal-footer { padding-bottom: max(1rem, env(safe-area-inset-bottom)); }
.animate-scale-in { animation: scaleIn 0.3s ease-out; }
@keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
</style>
