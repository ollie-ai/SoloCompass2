import { motion } from 'framer-motion'
import { Clock, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react'

const HeroStatusCard = ({ 
  // State label (e.g., "Live", "Planning", "Draft", "Completed")
  label,
  labelColor = 'emerald',
  // Key metric (e.g., "Day 3", "5 days", "75%")
  metric,
  metricLabel,
  // Status indicator (optional)
  status,
  statusLabel,
  // Metadata lines (array of { icon, text })
  metadata = [],
  // Progress bar (optional)
  progress,
  progressLabel,
  // Timestamp (optional) - e.g., "Last checked 2h ago"
  lastChecked,
  // Children for custom content
  children,
  className = ''
}) => {
  const labelColors = {
    emerald: 'bg-success/10 text-success border-emerald-500/20',
    amber: 'bg-warning/10 text-warning border-amber-500/20',
    violet: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
    blue: 'bg-info/10 text-info border-sky-500/20',
    slate: 'bg-base-200 text-base-content/60 border-base-300',
  }

  const statusColors = {
    all_clear: { bg: 'bg-success/10', dot: 'bg-success', text: 'text-success' },
    caution: { bg: 'bg-warning/10', dot: 'bg-warning', text: 'text-warning' },
    warning: { bg: 'bg-error/10', dot: 'bg-error', text: 'text-error' },
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* State label */}
      {label && (
        <div className="flex items-center justify-center">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${labelColors[labelColor] || labelColors.slate}`}>
            {labelColor === 'emerald' && (
              <span className="w-1.5 h-1.5 rounded-full bg-success/100 animate-pulse" />
            )}
            {label}
          </span>
        </div>
      )}

      {/* Key metric */}
      {metric && (
        <div className="text-center">
          <div className="text-3xl font-black text-white">{metric}</div>
          {metricLabel && (
            <p className="text-xs font-bold text-white/50 uppercase tracking-wider">{metricLabel}</p>
          )}
        </div>
      )}

      {/* Status indicator */}
      {status && statusLabel && (
        <div className="flex items-center justify-center">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${statusColors[status]?.bg || 'bg-base-200'}`}>
            <span className={`w-2 h-2 rounded-full ${statusColors[status]?.dot || 'bg-slate-400'}`} />
            <span className={`text-xs font-bold ${statusColors[status]?.text || 'text-base-content/80'}`}>
              {statusLabel}
            </span>
          </div>
        </div>
      )}

      {/* Metadata lines */}
      {metadata.length > 0 && (
        <div className="space-y-1">
          {metadata.map((item, i) => (
            <div key={`metadata-${item.text}-${i}`} className="flex items-center justify-center gap-2">
              {item.icon && (
                <item.icon size={12} className="text-white/50" />
              )}
              <span className="text-sm font-medium text-white/60">{item.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Progress bar */}
      {progress !== undefined && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white/40 uppercase tracking-wider">{progressLabel || 'Progress'}</span>
            <span className="text-xs font-bold text-white/60">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-base-100/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6 }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-brand-vibrant"
            />
          </div>
        </div>
      )}

      {/* Last checked timestamp */}
      {lastChecked && (
        <div className="flex items-center justify-center pt-1">
          <div className="flex items-center gap-1.5">
            <Clock size={10} className="text-white/30" />
            <span className="text-[10px] font-medium text-white/40">{lastChecked}</span>
          </div>
        </div>
      )}

      {/* Custom children */}
      {children}
    </div>
  )
}

export default HeroStatusCard