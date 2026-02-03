import { useTimerStore } from '../store/useTimerStore'
import { motion } from 'framer-motion'
import { BarChart3, Clock, Star, Trophy, Download } from 'lucide-react'
import { cn } from '../lib/utils'

export const Stats = () => {
  const { history } = useTimerStore()

  const workSessions = history.filter(h => h.mode === 'work')
  const totalSessions = workSessions.length
  const totalFocusTime = workSessions.reduce((acc, curr) => acc + curr.duration, 0)
  
  const avgRating = workSessions.length > 0 
    ? (workSessions.reduce((acc, curr) => acc + (curr.rating || 0), 0) / (workSessions.filter(s => s.rating).length || 1)).toFixed(1)
    : 0

  const getFocusLevel = () => {
    if (totalSessions < 5) return '初学者'
    if (totalSessions < 20) return '进阶者'
    if (totalSessions < 50) return '专注达人'
    return '时间管理大师'
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    return hours > 0 ? `${hours}小时 ${mins}分` : `${mins}分`
  }

  // 7-day Heatmap Data
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    return d
  }).reverse()

  const dailyActivity = last7Days.map(date => {
    const daySessions = workSessions.filter(s => {
      const sessionDate = new Date(s.timestamp)
      sessionDate.setHours(0, 0, 0, 0)
      return sessionDate.getTime() === date.getTime()
    })
    const minutes = daySessions.reduce((acc, curr) => acc + curr.duration, 0) / 60
    return {
      date,
      minutes,
      intensity: Math.min(Math.floor(minutes / 30), 4) // 0-4 intensity
    }
  })

  const exportCSV = () => {
    const headers = ['ID', '模式', '时长(秒)', '时间戳', '任务名称', '评分']
    const rows = history.map(s => [
      s.id,
      s.mode === 'work' ? '专注' : '休息',
      s.duration,
      new Date(s.timestamp).toLocaleString(),
      s.taskName || '',
      s.rating || ''
    ])
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `pomodoro-history-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Focus Level Card */}
      <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-xl">
            <Trophy size={20} className="text-primary" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">当前等级</div>
            <div className="text-lg font-bold">{getFocusLevel()}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">平均评分</div>
          <div className="flex items-center gap-1 font-bold">
            <Star size={14} className="fill-primary text-primary" />
            {avgRating}
          </div>
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="bg-accent/30 p-4 rounded-2xl border border-accent space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">最近 7 日活跃度</h3>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map(i => (
              <div 
                key={i} 
                className={cn(
                  "w-2 h-2 rounded-sm",
                  i === 0 ? "bg-accent" : 
                  i === 1 ? "bg-primary/20" :
                  i === 2 ? "bg-primary/40" :
                  i === 3 ? "bg-primary/70" : "bg-primary"
                )} 
              />
            ))}
          </div>
        </div>
        <div className="flex justify-between items-end h-16 gap-2">
          {dailyActivity.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className={cn(
                  "w-full rounded-t-lg transition-all duration-500",
                  day.intensity === 0 ? "bg-accent/50" : "bg-primary"
                )}
                style={{ height: `${Math.max(day.minutes / 2, 8)}%`, opacity: 0.2 + (day.intensity * 0.2) }}
              />
              <span className="text-[8px] text-muted-foreground">
                {day.date.toLocaleDateString([], { weekday: 'narrow' })}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-accent/50 p-4 rounded-2xl border border-accent">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <BarChart3 size={16} />
            <span className="text-xs font-medium uppercase tracking-wider">专注次数</span>
          </div>
          <div className="text-2xl font-bold">{totalSessions}</div>
        </div>
        <div className="bg-accent/50 p-4 rounded-2xl border border-accent">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock size={16} />
            <span className="text-xs font-medium uppercase tracking-wider">总时长</span>
          </div>
          <div className="text-2xl font-bold">{formatTime(totalFocusTime)}</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">专注记录</h3>
          <button 
            onClick={exportCSV}
            className="flex items-center gap-1.5 text-[10px] font-bold text-primary hover:opacity-80 transition-opacity"
          >
            <Download size={12} />
            导出数据
          </button>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {history.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8 bg-accent/20 rounded-2xl border border-dashed border-accent">
              暂无记录，开始第一次专注吧！
            </div>
          ) : (
            history.slice(0, 20).map((session) => (
              <div key={session.id} className="flex flex-col p-3 bg-accent/30 rounded-xl border border-accent/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      session.mode === 'work' ? "bg-primary" : "bg-green-500"
                    )} />
                    <span className="text-sm font-medium">
                      {session.mode === 'work' ? (session.taskName || '无标题专注') : 
                       session.mode === 'shortBreak' ? '短休' : '长休'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                    <span>{formatTime(session.duration)}</span>
                    <span>{new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                {session.mode === 'work' && session.rating && (
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={10}
                        className={cn(
                          i < session.rating! ? "fill-primary text-primary" : "text-muted-foreground/30"
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
