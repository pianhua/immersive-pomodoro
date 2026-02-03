import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TimerMode = 'work' | 'shortBreak' | 'longBreak'
export type Theme = 'dark' | 'minimal' | 'forest' | 'starry' | 'rain' | 'cafe'

export interface TimerScheme {
  id: string
  name: string
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  longBreakInterval: number
}

interface TimerSettings {
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  autoStartBreaks: boolean
  autoStartWork: boolean
  longBreakInterval: number
  showRatingModal: boolean
}

interface SessionRecord {
  id: string
  mode: TimerMode
  duration: number
  timestamp: number
  taskName?: string
  rating?: number // 1-5 stars
}

interface TimerState {
  timeLeft: number
  isRunning: boolean
  mode: TimerMode
  sessionsCompleted: number
  settings: TimerSettings
  history: SessionRecord[]
  theme: Theme
  isImmersive: boolean
  ambientSound: string | null
  customSound: { url: string | null, name: string | null }
  volume: number
  currentTask: string
  schemes: TimerScheme[]
  activeSchemeId: string
  
  // Actions
  tick: () => void
  toggleTimer: () => void
  resetTimer: () => void
  setMode: (mode: TimerMode) => void
  updateSettings: (settings: Partial<TimerSettings>) => void
  setTheme: (theme: Theme) => void
  toggleImmersive: () => void
  setAmbientSound: (sound: string | null) => void
  setCustomSound: (url: string | null, name: string | null) => void
  setVolume: (volume: number) => void
  setCurrentTask: (task: string) => void
  addScheme: (scheme: Omit<TimerScheme, 'id'>) => void
  deleteScheme: (id: string) => void
  setActiveScheme: (id: string) => void
  completeSession: (rating?: number) => void
  resetCycle: () => void
}

const DEFAULT_SCHEMES: TimerScheme[] = [
  {
    id: 'standard',
    name: '标准番茄',
    workDuration: 25 * 60,
    shortBreakDuration: 5 * 60,
    longBreakDuration: 15 * 60,
    longBreakInterval: 4,
  },
  {
    id: 'long',
    name: '深度专注',
    workDuration: 50 * 60,
    shortBreakDuration: 10 * 60,
    longBreakDuration: 30 * 60,
    longBreakInterval: 2,
  }
]

const DEFAULT_SETTINGS: TimerSettings = {
  workDuration: DEFAULT_SCHEMES[0].workDuration,
  shortBreakDuration: DEFAULT_SCHEMES[0].shortBreakDuration,
  longBreakDuration: DEFAULT_SCHEMES[0].longBreakDuration,
  autoStartBreaks: false,
  autoStartWork: false,
  longBreakInterval: DEFAULT_SCHEMES[0].longBreakInterval,
  showRatingModal: true,
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      timeLeft: DEFAULT_SETTINGS.workDuration,
      isRunning: false,
      mode: 'work',
      sessionsCompleted: 0,
      settings: DEFAULT_SETTINGS,
      history: [],
      theme: 'dark',
      isImmersive: false,
      ambientSound: 'white-noise',
      customSound: { url: null, name: null },
      volume: 0.5,
      currentTask: '',
      schemes: DEFAULT_SCHEMES,
      activeSchemeId: 'standard',

      tick: () => {
        const { timeLeft, isRunning, completeSession } = get()
        if (isRunning && timeLeft > 0) {
          set({ timeLeft: timeLeft - 1 })
        } else if (isRunning && timeLeft === 0) {
          completeSession()
        }
      },

      toggleTimer: () => set((state) => ({ isRunning: !state.isRunning })),

      resetTimer: () => {
        const { mode, settings } = get()
        let duration = settings.workDuration
        if (mode === 'shortBreak') duration = settings.shortBreakDuration
        if (mode === 'longBreak') duration = settings.longBreakDuration
        set({ timeLeft: duration, isRunning: false })
      },

      setMode: (mode) => {
        const { settings } = get()
        let duration = settings.workDuration
        if (mode === 'shortBreak') duration = settings.shortBreakDuration
        if (mode === 'longBreak') duration = settings.longBreakDuration
        set({ mode, timeLeft: duration, isRunning: false })
      },

      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      setTheme: (theme) => set({ theme }),

      toggleImmersive: () => set((state) => ({ isImmersive: !state.isImmersive })),

      setAmbientSound: (ambientSound) => set({ ambientSound }),

      setCustomSound: (url, name) => set({ customSound: { url, name } }),

      setVolume: (volume) => set({ volume }),

      setCurrentTask: (task) => set({ currentTask: task }),

      addScheme: (scheme) => set((state) => ({
        schemes: [...state.schemes, { ...scheme, id: crypto.randomUUID() }]
      })),

      deleteScheme: (id) => set((state) => {
        const newSchemes = state.schemes.filter(s => s.id !== id)
        const nextActiveId = state.activeSchemeId === id ? 'standard' : state.activeSchemeId
        return { 
          schemes: newSchemes,
          activeSchemeId: nextActiveId
        }
      }),

      setActiveScheme: (id) => {
        const scheme = get().schemes.find(s => s.id === id) || DEFAULT_SCHEMES[0]
        set({
          activeSchemeId: id,
          settings: {
            ...get().settings,
            workDuration: scheme.workDuration,
            shortBreakDuration: scheme.shortBreakDuration,
            longBreakDuration: scheme.longBreakDuration,
            longBreakInterval: scheme.longBreakInterval,
          },
          timeLeft: get().mode === 'work' ? scheme.workDuration : 
                   get().mode === 'shortBreak' ? scheme.shortBreakDuration : 
                   scheme.longBreakDuration,
          isRunning: false
        })
      },

      completeSession: (rating) => {
        const { mode, settings, sessionsCompleted, history, currentTask } = get()
        const newRecord: SessionRecord = {
          id: crypto.randomUUID(),
          mode,
          duration: mode === 'work' ? settings.workDuration : 
                    mode === 'shortBreak' ? settings.shortBreakDuration : 
                    settings.longBreakDuration,
          timestamp: Date.now(),
          taskName: mode === 'work' ? currentTask : undefined,
          rating: mode === 'work' ? rating : undefined,
        }

        let nextMode: TimerMode = 'work'
        let nextSessionsCompleted = sessionsCompleted

        if (mode === 'work') {
          nextSessionsCompleted += 1
          nextMode = nextSessionsCompleted % settings.longBreakInterval === 0 ? 'longBreak' : 'shortBreak'
        } else {
          nextMode = 'work'
        }

        const nextDuration = nextMode === 'work' ? settings.workDuration :
                            nextMode === 'shortBreak' ? settings.shortBreakDuration :
                            settings.longBreakDuration

        set({
          mode: nextMode,
          timeLeft: nextDuration,
          isRunning: (mode === 'work' && settings.autoStartBreaks) || (mode !== 'work' && settings.autoStartWork),
          sessionsCompleted: nextSessionsCompleted,
          history: [newRecord, ...history],
        })

        // Notify session completion
        if (Notification.permission === 'granted') {
          new Notification(mode === 'work' ? '该休息一下了！' : '休息结束，开始专注！', {
            body: mode === 'work' ? '太棒了，你完成了一次专注。' : '准备好开始新的一轮了吗？',
          })
        }
      },

      resetCycle: () => {
        const { settings } = get()
        set({
          sessionsCompleted: 0,
          mode: 'work',
          timeLeft: settings.workDuration,
          isRunning: false
        })
      },
    }),
    {
      name: 'immersive-pomodoro-storage',
    }
  )
)
