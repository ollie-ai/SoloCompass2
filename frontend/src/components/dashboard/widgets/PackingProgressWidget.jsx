import { motion } from 'framer-motion'
import { Luggage, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

const PackingProgressWidget = ({ tripId = null, packed = 0, total = 0, className = "" }) => {
  const progress = total > 0 ? Math.round((packed / total) * 100) : 0
  const isEmpty = total === 0
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`dashboard-widget ${className}`}
    >
      <div className="dashboard-widget-header">
        <div className="dashboard-widget-title">
          <Luggage size={18} className="text-brand-vibrant" />
          <h3>Packing List</h3>
        </div>
        {progress === 100 && <CheckCircle size={18} className="text-emerald-500" />}
      </div>
      
      {isEmpty ? (
        <div className="dashboard-empty-state py-4">
          <div className="dashboard-empty-icon">
            <Luggage size={20} />
          </div>
          <p className="dashboard-empty-title">No packing list yet</p>
          <p className="dashboard-empty-text">Add items to your packing list to track progress</p>
          {tripId && (
            <Link to={`/trips/${tripId}`} className="btn-brand text-sm px-4 py-2">
              Create Packing List
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="dashboard-progress-bar mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className={`dashboard-progress-fill ${progress === 100 ? 'from-emerald-400 to-emerald-500' : ''}`}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-base-content/60">{packed} of {total} items</span>
            {tripId && (
              <Link to={`/trips/${tripId}`} className="text-sm font-bold text-brand-vibrant hover:text-brand-vibrant/80 transition-colors">
                Manage
              </Link>
            )}
          </div>
        </>
      )}
    </motion.div>
  )
}

export default PackingProgressWidget
