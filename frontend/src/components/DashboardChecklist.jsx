import { useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Circle, ChevronDown, ChevronRight, Sparkles, Clock } from 'lucide-react'
import { useReadinessStore } from '../stores/readinessStore'

const CATEGORY_ICONS = {
  'Trip Basics': '📅',
  'Documents': '📄',
  'Safety': '🛡️',
  'Travel-Day Prep': '✈️',
}

const CATEGORY_ORDER = ['Trip Basics', 'Documents', 'Safety', 'Travel-Day Prep']

const getStatusBadge = (item, completed) => {
  if (completed) {
    return { label: 'Complete', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' }
  }
  if (item.autoComplete) {
    return { label: 'In progress', className: 'bg-sky-500/10 text-sky-600 border-sky-500/20' }
  }
  return { label: 'Needs setup', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' }
}

const formatCompletedAt = (dateString) => {
  if (!dateString) return null
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

const ChecklistItem = ({ item, onToggle }) => {
  const status = getStatusBadge(item, item.completed)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="group"
    >
      <div className="flex items-start gap-3 py-3 px-2 rounded-lg hover:bg-base-200/50 transition-colors">
        <button
          onClick={() => onToggle(item.id, !item.completed)}
          className="mt-0.5 flex-shrink-0"
        >
          <AnimatePresence mode="wait">
            {item.completed ? (
              <motion.div
                key="checked"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
              >
                <CheckCircle2 size={20} className="text-emerald-500" />
              </motion.div>
            ) : (
              <motion.div
                key="unchecked"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
              >
                <Circle size={20} className="text-base-content/30 group-hover:text-sky-500 transition-colors" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-sm font-medium ${item.completed ? 'text-base-content/50 line-through' : 'text-base-content'}`}>
              {item.label}
            </span>
            {item.autoComplete && (
              <Sparkles size={12} className="text-sky-500" />
            )}
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${status.className}`}>
              {status.label}
            </span>
            {item.completed && item.completedAt && (
              <span className="flex items-center gap-1 text-xs text-base-content/40">
                <Clock size={10} />
                {formatCompletedAt(item.completedAt)}
              </span>
            )}
            {item.autoComplete && !item.completed && (
              <span className="text-xs text-sky-600/80">
                Auto-filled from trip data
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const CategorySection = ({ category, items, onToggle }) => {
  const completedCount = items.filter(i => i.completed).length
  const totalCount = items.length
  const isAllComplete = completedCount === totalCount

  return (
    <div className="border-b border-base-200 last:border-b-0">
      <div className="flex items-center gap-2 py-3 px-2">
        <span className="text-base">{CATEGORY_ICONS[category]}</span>
        <h4 className="text-sm font-bold text-base-content">{category}</h4>
        <span className="text-xs text-base-content/40 ml-auto">
          {completedCount}/{totalCount}
        </span>
        {isAllComplete && completedCount > 0 && (
          <CheckCircle2 size={14} className="text-emerald-500" />
        )}
      </div>
      <div className="pb-2">
        {items.map((item) => (
          <ChecklistItem key={item.id} item={item} onToggle={onToggle} />
        ))}
      </div>
    </div>
  )
}

const DashboardChecklist = ({ tripId, className = '' }) => {
  const { checklist, isLoading, error, fetchReadiness, updateChecklistItem } = useReadinessStore()

  useEffect(() => {
    if (tripId) {
      fetchReadiness(tripId)
    }
  }, [tripId, fetchReadiness])

  const groupedChecklist = useMemo(() => {
    const groups = {}
    CATEGORY_ORDER.forEach(cat => {
      groups[cat] = []
    })
    
    checklist.forEach(item => {
      const category = item.category || 'Trip Basics'
      if (groups[category]) {
        groups[category].push(item)
      } else {
        groups['Trip Basics'].push(item)
      }
    })

    return groups
  }, [checklist])

  const totalItems = checklist.length
  const completedItems = checklist.filter(i => i.completed).length
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  const handleToggle = async (itemId, completed) => {
    await updateChecklistItem(itemId, completed)
  }

  if (isLoading) {
    return (
      <div className={`bg-base-100 rounded-2xl border border-base-200 shadow-sm p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-5 bg-base-200 rounded w-1/3" />
          <div className="h-2 bg-base-200 rounded-full" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={'checklist-item-' + i} className="h-12 bg-base-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-base-100 rounded-2xl border border-error/20 shadow-sm p-6 ${className}`}>
        <p className="text-sm text-error">{error}</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-base-100 rounded-2xl border border-base-200 shadow-sm overflow-hidden ${className}`}
    >
      <div className="p-5 border-b border-base-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-base-content">Trip Checklist</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-base-content/60">{progress}%</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              progress >= 85 ? 'bg-emerald-500/10 text-emerald-600' :
              progress >= 60 ? 'bg-sky-500/10 text-sky-600' :
              progress >= 30 ? 'bg-amber-500/10 text-amber-600' :
              'bg-base-200 text-base-content/60'
            }`}>
              {progress >= 85 ? 'Ready' : progress >= 60 ? 'In progress' : progress >= 30 ? 'Needs work' : 'Just started'}
            </span>
          </div>
        </div>
        
        <div className="h-2 bg-base-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={`h-full rounded-full ${
              progress >= 85 ? 'bg-emerald-500' :
              progress >= 60 ? 'bg-sky-500' :
              progress >= 30 ? 'bg-amber-500' :
              'bg-base-300'
            }`}
          />
        </div>
        
        <p className="text-xs text-base-content/50 mt-2">
          {completedItems} of {totalItems} items complete
        </p>
      </div>

      <div className="divide-y divide-base-200">
        {CATEGORY_ORDER.map(category => {
          const items = groupedChecklist[category]
          if (!items?.length) return null
          
          return (
            <CategorySection
              key={category}
              category={category}
              items={items}
              onToggle={handleToggle}
            />
          )
        })}
      </div>

      {checklist.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-sm text-base-content/50">No checklist items available</p>
        </div>
      )}
    </motion.div>
  )
}

export default DashboardChecklist