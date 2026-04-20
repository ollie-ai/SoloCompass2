import { memo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion'
import { CheckSquare, Square, CheckCircle, ListChecks } from 'lucide-react'

const ChecklistCard = memo(function ChecklistCard({ title, items = [], onToggle, loading = false, className = "" }) {
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`dashboard-widget ${className}`}
      >
        <div className="flex items-center gap-2 mb-4">
          <CheckSquare size={18} className="text-brand-vibrant" />
          <h3 className="text-base font-bold text-base-content">{title}</h3>
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-9 rounded-lg bg-base-200 animate-pulse" />
          ))}
        </div>
      </motion.div>
    )
  }
  if (!items?.length) return null
  
  const doneCount = items.filter(i => i.done).length
  const totalCount = items.length
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0
  const isComplete = doneCount === totalCount
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`dashboard-widget ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <CheckCircle size={18} className="text-emerald-500" />
          ) : (
            <CheckSquare size={18} className="text-brand-vibrant" />
          )}
          <h3 className="text-base font-bold text-base-content">{title}</h3>
        </div>
        <span className="text-sm font-bold text-base-content/40">{doneCount}/{totalCount}</span>
      </div>
      
      <div className="dashboard-progress-bar mb-4 h-1.5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={`h-full rounded-full ${isComplete ? 'from-emerald-400 to-emerald-500' : 'dashboard-progress-fill'}`}
        />
      </div>
      
      <div className="space-y-1">
        {items.map((item, i) => (
          <motion.button
            key={item.label || i}
            layout
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onToggle?.(i)}
            className="flex items-center gap-2.5 w-full text-left group py-1.5 rounded-lg px-2 -mx-2 hover:bg-base-200 transition-colors"
          >
            <motion.div
              animate={item.done ? { scale: [1, 1.3, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {item.done ? (
                <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
              ) : (
                <Square size={16} className="text-base-content/30 group-hover:text-brand-vibrant flex-shrink-0" />
              )}
            </motion.div>
            <motion.span
              animate={item.done ? { opacity: 0.5 } : { opacity: 1 }}
              className={`text-sm font-medium ${item.done ? 'text-base-content/40 line-through' : 'text-base-content/80'}`}
            >
              {item.label}
            </motion.span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
});

ChecklistCard.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.array,
  onToggle: PropTypes.func,
  loading: PropTypes.bool,
  className: PropTypes.string,
};

ChecklistCard.defaultProps = {
  items: [],
  loading: false,
  className: "",
};

export default ChecklistCard
