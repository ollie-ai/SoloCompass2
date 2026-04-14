import { useState } from 'react'
import { EyeOff, RefreshCw, Plus, Minus, GripVertical, Eye } from 'lucide-react'
import { formatFreshness, DATA_HEALTH_STATUS } from '../../lib/dashboardStatusSystem'

const CollapsibleWidget = ({
  children,
  title,
  icon: Icon,
  defaultExpanded = true,
  expanded: controlledExpanded,
  collapsible = true,
  hideable = false,
  onHide,
  onToggleExpand,
  hidden = false,
  freshness = null,
  dataHealth = null,
  badge = null,
  className = '',
  accentColor = 'blue',
  size = 'default',
  variant = 'default',
  dragHandleProps = null,
  draggable = false,
}) => {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const isControlled = controlledExpanded !== undefined
  const expanded = isControlled ? controlledExpanded : internalExpanded
  
  const handleToggle = (e) => {
    e?.stopPropagation()
    if (isControlled) {
      onToggleExpand?.()
    } else {
      setInternalExpanded(!internalExpanded)
    }
  }

  const accentColors = {
    emerald: {
      gradient: 'from-brand-vibrant/20 to-brand-vibrant/5',
      text: 'text-brand-vibrant',
      border: 'border-t-brand-vibrant/40',
    },
    amber: {
      gradient: 'from-amber-500/20 to-amber-500/5',
      text: 'text-amber-500',
      border: 'border-t-amber-400/40',
    },
    violet: {
      gradient: 'from-brand-accent/20 to-brand-accent/5',
      text: 'text-brand-accent',
      border: 'border-t-brand-accent/40',
    },
    blue: {
      gradient: 'from-sky-500/20 to-sky-500/5',
      text: 'text-sky-500',
      border: 'border-t-sky-400/40',
    },
    red: {
      gradient: 'from-red-500/20 to-red-500/5',
      text: 'text-red-500',
      border: 'border-t-red-400/40',
    },
  }

  const accent = accentColors[accentColor] || accentColors.blue

  const sizeClasses = {
    default: "p-5 min-h-[140px]",
    large: "p-8 min-h-[180px]",
  }
  
  const sizeClassesCollapsed = {
    default: "px-5 py-4",
    large: "px-8 py-5",
  }

  const variantClasses = {
    default: "glass-card !bg-base-100/70 backdrop-blur-xl rounded-2xl border border-base-content/5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]",
    premium: "bg-base-100/90 backdrop-blur-xl rounded-2xl border border-base-300/60 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)]",
    gradient: "bg-gradient-to-br from-brand-vibrant/5 to-brand-accent/5 border-brand-vibrant/20 rounded-2xl border border-brand-vibrant/20",
  }
  
  const variantClassesCollapsed = {
    default: "glass-card !bg-base-100/70 backdrop-blur-xl rounded-2xl border border-base-content/5 shadow-[0_4px_8px_-4px_rgba(0,0,0,0.03)] opacity-80 hover:opacity-100 transition-opacity",
    premium: "bg-base-100/90 backdrop-blur-xl rounded-2xl border border-base-300/40 shadow-[0_4px_8px_-4px_rgba(0,0,0,0.05)] opacity-80 hover:opacity-100 transition-opacity",
    gradient: "bg-gradient-to-br from-brand-vibrant/5 to-brand-accent/5 border-brand-vibrant/20 rounded-2xl border border-brand-vibrant/20 opacity-80 hover:opacity-100 transition-opacity",
  }

  const expandedClasses = `${variantClasses[variant] || variantClasses.default} ${sizeClasses[size] || sizeClasses.default} border-t-2`
  const collapsedClasses = `${variantClassesCollapsed[variant] || variantClassesCollapsed.default} ${sizeClassesCollapsed[size] || sizeClassesCollapsed.default} border-t-2 cursor-pointer`

  const baseClasses = expanded ? expandedClasses : collapsedClasses

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  if (hidden) return null

  return (
    <div 
      className={`${baseClasses} ${accent.border} ${className}`}
      onClick={!expanded ? handleToggle : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {draggable && dragHandleProps && (
            <div 
              className="drag-handle cursor-grab active:cursor-grabbing p-1 -ml-1 text-base-content/30 hover:text-base-content/50 transition-colors"
              title="Drag to reorder"
              {...dragHandleProps}
            >
              <GripVertical size={16} />
            </div>
          )}
          {Icon && (
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center shadow-inner`}>
              <Icon size={18} className={accent.text} />
            </div>
          )}
          <h3 className="text-lg font-outfit font-black text-base-content tracking-tight">{title}</h3>
          {badge && (
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              badge.type === 'success' ? 'bg-brand-vibrant/10 text-brand-vibrant' :
              badge.type === 'warning' ? 'bg-amber-500/10 text-amber-600' :
              badge.type === 'error' ? 'bg-red-500/10 text-red-600' :
              'bg-sky-500/10 text-sky-600'
            }`}>
              {badge.label}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {freshness && (
            <span className="text-[10px] text-base-content/40 font-medium">
              {formatFreshness(freshness)}
            </span>
          )}
          {dataHealth && dataHealth !== DATA_HEALTH_STATUS.CURRENT && (
            <button 
              onClick={handleRefresh}
              className="p-1.5 hover:bg-base-200 rounded-lg transition-colors"
              title="Refresh data"
            >
              <RefreshCw size={14} className={`text-base-content/40 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
          {collapsible && (
            <button 
              onClick={handleToggle}
              className="p-1.5 hover:bg-base-200 rounded-lg transition-colors"
              title={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? (
                <Minus size={18} className="text-base-content/60" />
              ) : (
                <Plus size={18} className="text-base-content/60" />
              )}
            </button>
          )}
          {hideable && (
            <button 
              onClick={(e) => { e.stopPropagation(); onHide?.(); }}
              className="p-1.5 hover:bg-base-200 rounded-lg transition-colors"
              title="Hide this widget"
            >
              <EyeOff size={16} className="text-base-content/40" />
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-4">{children}</div>
      )}
    </div>
  )
}

/**
 * HiddenWidgetItem - shown in the management panel for hidden widgets
 */
export const HiddenWidgetItem = ({ 
  title, 
  icon: Icon, 
  onShow, 
  accentColor = 'blue' 
}) => {
  const accentColors = {
    emerald: 'text-brand-vibrant',
    amber: 'text-amber-500',
    violet: 'text-brand-accent',
    blue: 'text-sky-500',
    red: 'text-red-500',
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-base-200/50 border border-base-300 hover:bg-base-200 transition-colors">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={`w-8 h-8 rounded-lg bg-base-300/50 flex items-center justify-center`}>
            <Icon size={16} className={accentColors[accentColor] || accentColors.blue} />
          </div>
        )}
        <span className="text-sm font-medium text-base-content/80">{title}</span>
      </div>
      <button
        onClick={onShow}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-brand-vibrant/10 text-brand-vibrant hover:bg-brand-vibrant/20 transition-colors"
      >
        <Eye size={14} />
        Show
      </button>
    </div>
  );
};

export default CollapsibleWidget