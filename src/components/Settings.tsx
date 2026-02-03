import { useState, useRef } from 'react'
import { useTimerStore, Theme, TimerScheme } from '../store/useTimerStore'
import { X, Moon, Sun, Trees, Volume2, Sparkles, Plus, Trash2, Upload, Music, CloudRain, Coffee } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'

interface SettingsProps {
  isOpen: boolean
  onClose: () => void
}

export const Settings = ({ isOpen, onClose }: SettingsProps) => {
  const { 
    settings, updateSettings, 
    theme, setTheme, 
    volume, setVolume, 
    ambientSound, setAmbientSound,
    customSound, setCustomSound,
    schemes, activeSchemeId, setActiveScheme, addScheme, deleteScheme
  } = useTimerStore()

  const [isAddingScheme, setIsAddingScheme] = useState(false)
  const [newScheme, setNewScheme] = useState<Omit<TimerScheme, 'id'>>({
    name: '',
    workDuration: 25 * 60,
    shortBreakDuration: 5 * 60,
    longBreakDuration: 15 * 60,
    longBreakInterval: 4,
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const url = event.target?.result as string
        setCustomSound(url, file.name)
        setAmbientSound('custom')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddScheme = () => {
    if (newScheme.name.trim()) {
      addScheme(newScheme)
      setIsAddingScheme(false)
      setNewScheme({
        name: '',
        workDuration: 25 * 60,
        shortBreakDuration: 5 * 60,
        longBreakDuration: 15 * 60,
        longBreakInterval: 4,
      })
    }
  }

  const themes: { id: Theme; icon: any; label: string }[] = [
    { id: 'dark', icon: Moon, label: '深邃夜空' },
    { id: 'minimal', icon: Sun, label: '极简白' },
    { id: 'forest', icon: Trees, label: '静谧森林' },
    { id: 'starry', icon: Sparkles, label: '璀璨星空' },
    { id: 'rain', icon: CloudRain, label: '林间细雨' },
    { id: 'cafe', icon: Coffee, label: '午后咖啡馆' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-background border border-accent rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-6 border-b border-accent">
          <h2 className="text-xl font-semibold">偏好设置</h2>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar flex-1">
          {/* Schemes Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">计时方案</h3>
              <button 
                onClick={() => setIsAddingScheme(!isAddingScheme)}
                className="flex items-center gap-1 text-xs text-primary hover:opacity-80 transition-opacity"
              >
                <Plus size={14} />
                {isAddingScheme ? '取消' : '添加自定义'}
              </button>
            </div>

            <AnimatePresence>
              {isAddingScheme && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-accent/30 p-4 rounded-2xl border border-accent space-y-4 overflow-hidden"
                >
                  <input
                    type="text"
                    placeholder="方案名称"
                    value={newScheme.name}
                    onChange={(e) => setNewScheme({ ...newScheme, name: e.target.value })}
                    className="w-full bg-background border-none rounded-xl px-3 py-2 text-sm focus:ring-2 ring-primary outline-none"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-muted-foreground uppercase">工作 (分钟)</label>
                      <input
                        type="number"
                        value={newScheme.workDuration / 60}
                        onChange={(e) => setNewScheme({ ...newScheme, workDuration: parseInt(e.target.value) * 60 || 0 })}
                        className="w-full bg-background border-none rounded-xl px-3 py-2 text-sm outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-muted-foreground uppercase">短休 (分钟)</label>
                      <input
                        type="number"
                        value={newScheme.shortBreakDuration / 60}
                        onChange={(e) => setNewScheme({ ...newScheme, shortBreakDuration: parseInt(e.target.value) * 60 || 0 })}
                        className="w-full bg-background border-none rounded-xl px-3 py-2 text-sm outline-none"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleAddScheme}
                    className="w-full py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90"
                  >
                    保存方案
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 gap-2">
              {schemes.map((s) => (
                <div 
                  key={s.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-2xl border-2 transition-all cursor-pointer group",
                    activeSchemeId === s.id ? "border-primary bg-primary/5" : "border-accent hover:bg-accent/50"
                  )}
                  onClick={() => setActiveScheme(s.id)}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{s.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {s.workDuration / 60} / {s.shortBreakDuration / 60} / {s.longBreakDuration / 60} 分钟
                    </span>
                  </div>
                  {s.id !== 'standard' && s.id !== 'long' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteScheme(s.id)
                      }}
                      className="p-2 opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Theme Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">视觉主题</h3>
            <div className="grid grid-cols-2 gap-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-2xl border-2 transition-all",
                    theme === t.id ? "border-primary bg-primary/10" : "border-accent hover:bg-accent"
                  )}
                >
                  <t.icon size={18} />
                  <span className="text-xs">{t.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Sound Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">专注音效</h3>
            <div className="space-y-3">
              {/* No Sound Option */}
              <div 
                className={cn(
                  "flex items-center justify-between p-3 rounded-2xl border-2 transition-all cursor-pointer",
                  ambientSound === null ? "border-primary bg-primary/5" : "border-accent hover:bg-accent/50"
                )}
                onClick={() => setAmbientSound(null)}
              >
                <div className="flex items-center gap-3">
                  <X size={18} className="text-muted-foreground" />
                  <span className="text-sm">无音效</span>
                </div>
                {ambientSound === null && <div className="w-2 h-2 rounded-full bg-primary" />}
              </div>

              {/* Built-in White Noise */}
              <div 
                className={cn(
                  "flex items-center justify-between p-3 rounded-2xl border-2 transition-all cursor-pointer",
                  ambientSound === 'white-noise' ? "border-primary bg-primary/5" : "border-accent hover:bg-accent/50"
                )}
                onClick={() => setAmbientSound('white-noise')}
              >
                <div className="flex items-center gap-3">
                  <Music size={18} className="text-muted-foreground" />
                  <span className="text-sm">静谧白噪音</span>
                </div>
                {ambientSound === 'white-noise' && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
              </div>

              {/* Custom Uploaded Sound */}
              <div 
                className={cn(
                  "flex items-center justify-between p-3 rounded-2xl border-2 transition-all cursor-pointer",
                  ambientSound === 'custom' ? "border-primary bg-primary/5" : "border-accent hover:bg-accent/50"
                )}
                onClick={() => customSound.url && setAmbientSound('custom')}
              >
                <div className="flex items-center gap-3">
                  <Upload size={18} className="text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-sm">{customSound.name || '上传自定义音效'}</span>
                    {!customSound.url && <span className="text-[10px] text-muted-foreground">支持 MP3/WAV 格式</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      fileInputRef.current?.click()
                    }}
                    className="p-1.5 hover:bg-accent rounded-lg transition-colors text-primary"
                    title="上传文件"
                  >
                    <Plus size={16} />
                  </button>
                  {customSound.url && ambientSound === 'custom' && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="audio/*" 
                className="hidden" 
              />
            </div>

            <div className="flex items-center gap-4 pt-2">
              <Volume2 size={18} className="text-muted-foreground" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="flex-1 accent-primary"
              />
            </div>
          </section>

          {/* Automation */}
          <section className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">自动化</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm">自动开始休息</span>
                <input
                  type="checkbox"
                  checked={settings.autoStartBreaks}
                  onChange={(e) => updateSettings({ autoStartBreaks: e.target.checked })}
                  className="w-4 h-4 rounded border-accent text-primary focus:ring-primary"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm">自动开始工作</span>
                <input
                  type="checkbox"
                  checked={settings.autoStartWork}
                  onChange={(e) => updateSettings({ autoStartWork: e.target.checked })}
                  className="w-4 h-4 rounded border-accent text-primary focus:ring-primary"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm">专注结束显示评分</span>
                <input
                  type="checkbox"
                  checked={settings.showRatingModal}
                  onChange={(e) => updateSettings({ showRatingModal: e.target.checked })}
                  className="w-4 h-4 rounded border-accent text-primary focus:ring-primary"
                />
              </label>
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-accent flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-primary text-primary-foreground rounded-2xl font-semibold hover:opacity-90 shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            完成并保存
          </button>
        </div>
      </motion.div>
    </div>
  )
}
