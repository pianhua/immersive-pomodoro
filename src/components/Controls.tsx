import { useTimerStore } from '../store/useTimerStore'
import { Play, Pause, RotateCcw, SkipForward, RefreshCw } from 'lucide-react'
import { cn } from '../lib/utils'

export const Controls = () => {
  const { isRunning, toggleTimer, resetTimer, completeSession, resetCycle } = useTimerStore()

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center space-x-6">
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={resetCycle}
            className="p-3 rounded-full hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            title="重置循环 (重新开始第一轮)"
          >
            <RefreshCw size={24} />
          </button>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">重置循环</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button
            onClick={resetTimer}
            className="p-3 rounded-full hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            title="重置当前计时"
          >
            <RotateCcw size={24} />
          </button>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">重置时间</span>
        </div>

        <button
          onClick={toggleTimer}
          className={cn(
            "p-6 rounded-3xl transition-all transform hover:scale-105 active:scale-95 shadow-lg mx-2",
            isRunning ? "bg-accent text-foreground" : "bg-primary text-primary-foreground"
          )}
          title={isRunning ? "暂停" : "开始"}
        >
          {isRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
        </button>

        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => completeSession()}
            className="p-3 rounded-full hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            title="跳过当前阶段"
          >
            <SkipForward size={24} />
          </button>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">跳过</span>
        </div>
      </div>
    </div>
  )
}
