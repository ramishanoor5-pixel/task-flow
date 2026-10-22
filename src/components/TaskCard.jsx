import { CheckCircle2, Circle, Clock, Pencil, Trash2, Calendar, Tag } from 'lucide-react'

export default function TaskCard({ task, onEdit, onDelete, onStatusToggle }) {
  const isCompleted = task.status === 'Completed'
  const isInProgress = task.status === 'In Progress'

  const priorityStyles = {
    High: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
    Medium: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    Low: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  }

  const categoryStyles = {
    Work: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    Personal: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    Study: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    Urgent: 'bg-red-500/10 text-red-300 border-red-500/20',
    General: 'bg-slate-700/20 text-slate-300 border-slate-700/30',
  }

  const formatDate = (dateVal) => {
    if (!dateVal) return 'Just now'
    if (typeof dateVal.toDate === 'function') {
      return dateVal.toDate().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    }
    const d = new Date(dateVal)
    return isNaN(d) ? 'Recent' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div
      className={`group relative p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
        isCompleted
          ? 'bg-slate-900/30 border-slate-800/50 opacity-75'
          : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700 shadow-sm hover:shadow-md'
      }`}
    >
      <div>
        {/* Header: Status toggle & Badges */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category */}
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
                categoryStyles[task.category] || categoryStyles.General
              }`}
            >
              <Tag className="w-2.5 h-2.5" />
              {task.category || 'General'}
            </span>

            {/* Priority */}
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                priorityStyles[task.priority] || priorityStyles.Low
              }`}
            >
              {task.priority || 'Low'}
            </span>
          </div>

          {/* Quick status toggle button */}
          <button
            onClick={() => onStatusToggle(task)}
            className="text-slate-400 hover:text-indigo-400 transition cursor-pointer p-1 rounded-lg hover:bg-slate-800"
            title={`Status: ${task.status}. Click to change.`}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : isInProgress ? (
              <Clock className="w-5 h-5 text-amber-400" />
            ) : (
              <Circle className="w-5 h-5 text-slate-500 group-hover:text-slate-400" />
            )}
          </button>
        </div>

        {/* Title */}
        <h3
          className={`font-semibold text-base tracking-tight mb-1.5 ${
            isCompleted ? 'line-through text-slate-400' : 'text-white'
          }`}
        >
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-3">
            {task.description}
          </p>
        )}
      </div>

      {/* Footer: Date & CRUD actions */}
      <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 mt-2">
        <div className="flex items-center gap-1.5 text-[11px]">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{formatDate(task.createdAt)}</span>
        </div>

        {/* Edit and Delete action buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition cursor-pointer"
            title="Edit task"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(task)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
            title="Delete task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
