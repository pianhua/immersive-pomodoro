import { useEffect } from 'react'
import { useTimerStore } from '../store/useTimerStore'
import { cn } from '../lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Edit2 } from 'lucide-react'

export const Timer = () => {
  const { timeLeft, isRunning, mode, tick, currentTask, setCurrentTask } = useTimerStore()

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        tick()
      }, 1000)
    } else if (timeLeft === 0) {
      tick() // Trigger completeSession
    }
    return () => clearInterval(interval)
  }, [isRunning, timeLeft, tick])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getModeLabel = () => {
    switch (mode) {
      case 'work': return '专注中'
      case 'shortBreak': return '短休'
      case 'longBreak': return '长休'
    }
  }

  const getProgress = () => {
    const { settings } = useTimerStore.getState()
    const total = mode === 'work' ? settings.workDuration : 
                  mode === 'shortBreak' ? settings.shortBreakDuration : 
                  settings.longBreakDuration
    return (timeLeft / total) * 100
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-12">
      {/* Task Input */}
      <div className={cn(
        "flex flex-col items-center space-y-2 transition-all duration-500",
        mode !== 'work' ? "opacity-30 pointer-events-none scale-95" : "opacity-100"
      )}>
        <div className="relative group">
          <input
            type="text"
            value={currentTask}
            onChange={(e) => setCurrentTask(e.target.value)}
            placeholder="你在专注做什么？"
            className="bg-transparent border-none text-center text-lg md:text-xl font-medium focus:ring-0 placeholder:opacity-30 w-64 md:w-80"
          />
          <div className="absolute -bottom-1 left-0 right-0 h-px bg-primary scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500" />
        </div>
      </div>

      <div className="relative flex items-center justify-center w-64 h-64 md:w-80 md:h-80">
        {/* Progress Circle Background */}
        <svg className="absolute w-full h-full -rotate-90 transform">
          <circle
            cx="50%"
            cy="50%"
            r="48%"
            className="stroke-muted fill-none"
            strokeWidth="4"
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r="48%"
            className={cn(
              "fill-none transition-colors duration-500",
              mode === 'work' ? "stroke-primary" : "stroke-green-500"
            )}
            strokeWidth="4"
            strokeDasharray="100 100"
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: 100 - getProgress() }}
            transition={{ duration: 1, ease: "linear" }}
            strokeLinecap="round"
          />
        </svg>

        <div className="z-10 flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm font-medium tracking-widest uppercase text-muted-foreground"
            >
              {getModeLabel()}
            </motion.span>
          </AnimatePresence>
          <span className="text-6xl md:text-7xl font-bold tabular-nums tracking-tight">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>
    </div>
  )
}
