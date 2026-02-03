import { useState, useEffect, useMemo } from 'react'
import { Timer } from './components/Timer'
import { Controls } from './components/Controls'
import { Settings } from './components/Settings'
import { Stats } from './components/Stats'
import { AmbientAudio } from './components/AmbientAudio'
import { useTimerStore } from './store/useTimerStore'
import { cn } from './lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings as SettingsIcon, BarChart3, Maximize2, Minimize2, X, Star } from 'lucide-react'

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isStatsOpen, setIsStatsOpen] = useState(false)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)
  
  const { theme, isImmersive, toggleTimer, resetTimer, resetCycle, toggleImmersive, mode, timeLeft, history, settings } = useTimerStore()

  // Update document title and favicon with progress
  useEffect(() => {
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    const modeStr = mode === 'work' ? '专注中' : mode === 'shortBreak' ? '短休中' : '长休中'
    document.title = `${timeStr} - ${modeStr} | 沉浸式番茄钟`

    // Dynamic Favicon (Canvas based)
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const totalTime = mode === 'work' ? settings.workDuration : 
                        mode === 'shortBreak' ? settings.shortBreakDuration : 
                        settings.longBreakDuration
      const progress = 1 - (timeLeft / totalTime)
      
      ctx.clearRect(0, 0, 32, 32)
      
      // Draw background circle
      ctx.beginPath()
      ctx.arc(16, 16, 14, 0, 2 * Math.PI)
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.lineWidth = 4
      ctx.stroke()

      // Draw progress arc
      ctx.beginPath()
      ctx.arc(16, 16, 14, -Math.PI / 2, (-Math.PI / 2) + (2 * Math.PI * progress))
      ctx.strokeStyle = mode === 'work' ? '#ef4444' : '#10b981'
      ctx.lineWidth = 4
      ctx.stroke()

      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
      if (link) {
        link.href = canvas.toDataURL()
      }
    }
  }, [timeLeft, mode, settings])

  // Monitor mode changes for rating modal
  useEffect(() => {
    if (!settings.showRatingModal) return

    const lastSession = history[0]
    if (lastSession?.mode === 'work' && !lastSession.rating && (mode === 'shortBreak' || mode === 'longBreak')) {
      setShowRatingModal(true)
    }
  }, [mode, history, settings.showRatingModal])

  useEffect(() => {
    document.body.className = `theme-${theme}`
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        toggleTimer()
      } else if (e.code === 'KeyR') {
        if (e.shiftKey) {
          resetCycle()
        } else {
          resetTimer()
        }
      } else if (e.code === 'KeyF') {
        toggleImmersive()
      } else if (e.code === 'Escape') {
        setIsSettingsOpen(false)
        setIsStatsOpen(false)
        setShowRatingModal(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [theme, toggleTimer, resetTimer, toggleImmersive])

  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const stars = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 3}px`,
      duration: `${2 + Math.random() * 3}s`,
      delay: `${Math.random() * 5}s`,
    }))
  }, [])

  const rainDrops = useMemo(() => {
    return Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${0.5 + Math.random() * 0.5}s`,
      opacity: 0.1 + Math.random() * 0.3,
    }))
  }, [])

  const steamParticles = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: `${20 + Math.random() * 60}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${3 + Math.random() * 4}s`,
      size: `${40 + Math.random() * 100}px`,
    }))
  }, [])

  const handleRate = (rating: number) => {
    // We update the last history item
    const lastSession = history[0]
    if (lastSession) {
      const updatedHistory = [...history]
      updatedHistory[0] = { ...lastSession, rating }
      useTimerStore.setState({ history: updatedHistory })
    }
    setShowRatingModal(false)
  }

  return (
    <div className={cn(
      "min-h-screen transition-all duration-700 ease-in-out flex flex-col items-center justify-center p-4 overflow-hidden",
      "bg-background text-foreground",
      theme === 'starry' && "starry-bg"
    )}>
      <AmbientAudio />
      
      {/* Starry Background */}
      {theme === 'starry' && (
        <div className="absolute inset-0 pointer-events-none">
          {stars.map((star) => (
            <div
              key={star.id}
              className="star"
              style={{
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
                '--duration': star.duration,
                animationDelay: star.delay,
              } as any}
            />
          ))}
        </div>
      )}

      {/* Rain Background */}
      {theme === 'rain' && (
        <div className="rain-container">
          {rainDrops.map((drop) => (
            <div
              key={drop.id}
              className="drop"
              style={{
                left: drop.left,
                animationDelay: drop.delay,
                animationDuration: drop.duration,
                opacity: drop.opacity,
              }}
            />
          ))}
        </div>
      )}

      {/* Cafe Background */}
      {theme === 'cafe' && (
        <div className="steam-container">
          {steamParticles.map((particle) => (
            <div
              key={particle.id}
              className="steam-particle"
              style={{
                left: particle.left,
                width: particle.size,
                height: particle.size,
                animationDelay: particle.delay,
                animationDuration: particle.duration,
              }}
            />
          ))}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </div>
      )}

      {/* Background Decoration for Immersive Mode */}
      <AnimatePresence>
        {isImmersive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none overflow-hidden"
          >
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse-subtle" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] animate-pulse-subtle delay-700" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header / Navbar */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-40 p-6 flex justify-between items-center transition-all duration-500",
        isImmersive ? "opacity-0 hover:opacity-100 translate-y-[-10px] hover:translate-y-0" : "opacity-100"
      )}>
        <h1 className="text-xl font-bold tracking-tight opacity-50">专注</h1>
        <div className="flex items-center gap-2 bg-accent/30 backdrop-blur-md p-1 rounded-full border border-accent/50">
          <button
            onClick={() => setIsStatsOpen(true)}
            className="p-2 hover:bg-accent rounded-full transition-colors"
            title="统计"
          >
            <BarChart3 size={20} />
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 hover:bg-accent rounded-full transition-colors"
            title="设置"
          >
            <SettingsIcon size={20} />
          </button>
          <div className="w-px h-4 bg-accent/50 mx-1" />
          <button
            onClick={toggleImmersive}
            className="p-2 hover:bg-accent rounded-full transition-colors"
            title={isImmersive ? "退出沉浸" : "沉浸模式"}
          >
            {isImmersive ? <Minimize2 size={20} /> : <Maximize2 size={20} /> }
          </button>
        </div>
      </header>

      <main className={cn(
        "z-10 w-full max-w-4xl flex flex-col items-center justify-center space-y-12 transition-all duration-500",
        isImmersive ? "scale-110" : "scale-100"
      )}>
        <Timer />
        
        <div className={cn(
          "transition-opacity duration-500",
          isImmersive ? "opacity-0 hover:opacity-100" : "opacity-100"
        )}>
          <Controls />
        </div>
      </main>

      {/* Rating Modal */}
      <AnimatePresence>
        {showRatingModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-background border border-accent p-8 rounded-[2.5rem] shadow-2xl text-center max-w-sm w-full space-y-6"
            >
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">专注完成！</h3>
                <p className="text-muted-foreground text-sm">评价一下刚才的专注质量吧</p>
              </div>
              
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => handleRate(star)}
                    className="p-1 transition-transform hover:scale-125 active:scale-90"
                  >
                    <Star
                      size={32}
                      className={cn(
                        "transition-colors",
                        (hoverRating || 0) >= star ? "fill-primary stroke-primary" : "stroke-muted-foreground"
                      )}
                    />
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowRatingModal(false)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                跳过评价
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <Settings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      
      <AnimatePresence>
        {isStatsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-background border border-accent rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-accent">
                <h2 className="text-xl font-semibold">专注统计</h2>
                <button onClick={() => setIsStatsOpen(false)} className="p-2 hover:bg-accent rounded-full">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <Stats />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer Info */}
      <footer className={cn(
        "fixed bottom-8 z-40 px-6 py-3 rounded-2xl bg-accent/10 backdrop-blur-md border border-accent/20 transition-all duration-500",
        isImmersive ? "opacity-0 translate-y-4 pointer-events-none" : "opacity-100 translate-y-0"
      )}>
        <div className="flex items-center gap-8 text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <kbd className="min-w-[40px] h-6 flex items-center justify-center bg-accent/50 rounded-md border border-accent text-foreground shadow-sm">Space</kbd>
            <span>开始 / 暂停</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="w-6 h-6 flex items-center justify-center bg-accent/50 rounded-md border border-accent text-foreground shadow-sm">R</kbd>
            <span>重置时间</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <kbd className="px-1.5 h-6 flex items-center justify-center bg-accent/50 rounded-md border border-accent text-foreground shadow-sm text-[10px]">Shift</kbd>
              <kbd className="w-6 h-6 flex items-center justify-center bg-accent/50 rounded-md border border-accent text-foreground shadow-sm">R</kbd>
            </div>
            <span>重置循环</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="w-6 h-6 flex items-center justify-center bg-accent/50 rounded-md border border-accent text-foreground shadow-sm">F</kbd>
            <span>沉浸模式</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
