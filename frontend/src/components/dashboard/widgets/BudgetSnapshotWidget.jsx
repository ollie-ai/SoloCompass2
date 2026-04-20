import { motion } from 'framer-motion'
import { CircleDollarSign, TrendingUp, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'

const BudgetSnapshotWidget = ({ tripId = null, budget = null, className = "", showHeading = true, loading = false }) => {
  if (loading) {
    return (
      <div className={`${className} space-y-2`}>
        {showHeading && <div className="h-6 w-28 rounded-lg bg-base-200 animate-pulse mb-4" />}
        <div className="h-20 rounded-xl bg-base-200 animate-pulse" />
        <div className="h-3 rounded-full bg-base-200 animate-pulse" />
      </div>
    );
  }
  const spent = budget?.totalSpent || 0
  const totalBudget = budget?.totalBudget || budget?.convertedTotalBudget || 0
  const currency = budget?.originalCurrency || budget?.displayCurrency || 'USD'
  
  const progress = totalBudget > 0 ? Math.round((spent / totalBudget) * 100) : 0
  const isOverBudget = progress > 100
  const isNearBudget = progress > 80 && progress <= 100
  const isEmpty = totalBudget === 0
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
  }
  
  const getStatusBadge = () => {
    if (isEmpty) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-xs font-bold text-amber-500">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500/100" />
          Needs setup
        </span>
      )
    }
    if (isOverBudget) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-xs font-bold text-red-500">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500/100" />
          Over budget
        </span>
      )
    }
    if (isNearBudget) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-xs font-bold text-amber-500">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500/100" />
          Near limit
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-500">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/100" />
        On track
      </span>
    )
  }

  const getWhyItMatters = () => {
    if (isEmpty) return "Set a budget to track spending and avoid overspending"
    if (isOverBudget) return "You've exceeded your budget - review expenses"
    if (isNearBudget) return "You're approaching your budget limit"
    return `You've spent ${formatCurrency(spent)} of ${formatCurrency(totalBudget)}`
  }
  
  return (
    <div className={showHeading ? 'dashboard-widget' : ''}>
      {showHeading && (
      <div className="dashboard-widget-header">
        <div className="dashboard-widget-title">
          <CircleDollarSign size={18} className="text-brand-vibrant" />
          <h3>Budget</h3>
        </div>
        {getStatusBadge()}
      </div>
      )}
      
      {isEmpty ? (
        <div className="dashboard-empty-state py-4">
          <div className="dashboard-empty-icon">
            <Wallet size={20} />
          </div>
          <p className="dashboard-empty-title">No budget set</p>
          <p className="dashboard-empty-text">{getWhyItMatters()}</p>
          {tripId && (
            <Link to={`/trips/${tripId}?tab=budget`} className="btn-brand text-sm px-4 py-2">
              Set Budget
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-xl font-black text-base-content">{formatCurrency(spent)}</span>
            <span className="text-sm font-medium text-base-content/40">of {formatCurrency(totalBudget)}</span>
          </div>
          
          <div className="dashboard-progress-bar mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className={`h-full rounded-full ${isOverBudget ? 'bg-gradient-to-r from-red-400 to-red-500' : isNearBudget ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'dashboard-progress-fill'}`}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <span className={`text-sm font-bold ${isOverBudget ? "text-error" : isNearBudget ? "text-warning" : "text-success"}`}>
              {progress}% used
            </span>
            {tripId && (
              <Link to={`/trips/${tripId}?tab=budget`} className="text-sm font-bold text-brand-vibrant hover:text-brand-vibrant/80 transition-colors">
                Manage
              </Link>
            )}
          </div>
          
          <p className="text-xs text-base-content/50 mt-3 pt-3 border-t border-base-300/50">
            {getWhyItMatters()}
          </p>
        </>
      )}
    </div>
  )
}

export default BudgetSnapshotWidget
