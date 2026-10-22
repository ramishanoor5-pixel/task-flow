import { CheckCircle2, Clock, AlertTriangle, Layers } from 'lucide-react'

export default function StatsOverview({ tasks }) {
  const total = tasks.length
  const completed = tasks.filter((t) => t.status === 'Completed').length
  const inProgress = tasks.filter((t) => t.status === 'In Progress').length
  const highPriority = tasks.filter((t) => t.priority === 'High').length

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  const stats = [
    {
      label: 'Total Items',
      value: total,
      icon: Layers,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      label: 'In Progress',
      value: inProgress,
      icon: Clock,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      label: 'Completed',
      value: completed,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'High Priority',
      value: highPriority,
      icon: AlertTriangle,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10 border-rose-500/20',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-sm transition hover:border-slate-700/80"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{stat.label}</span>
                <div className={`p-2 rounded-xl border ${stat.bgColor}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold tracking-tight text-white">{stat.value}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Completion progress bar */}
      {total > 0 && (
        <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              <span className="text-slate-400">Completion Rate</span>
              <span className="text-indigo-300 font-semibold">{completionRate}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
