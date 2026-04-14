import { motion } from 'framer-motion'

const shimmer = "animate-pulse"

export const WidgetSkeleton = ({ className = "" }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className={`bg-base-100 rounded-xl border border-base-300/60 p-5 ${className}`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className={`w-10 h-10 rounded-xl bg-base-300 ${shimmer}`} />
        <div className={`h-4 bg-base-300 rounded w-24 ${shimmer}`} />
      </div>
      <div className={`h-4 bg-base-300 rounded w-16 ${shimmer}`} />
    </div>
    <div className="space-y-3">
      <div className={`h-4 bg-base-300 rounded w-full ${shimmer}`} />
      <div className={`h-3 bg-base-300 rounded w-3/4 ${shimmer}`} />
      <div className={`h-3 bg-base-300 rounded w-1/2 ${shimmer}`} />
    </div>
  </motion.div>
)

export const ListSkeleton = ({ items = 3, className = "" }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={'list-item-' + i} className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
        <div className={`w-8 h-8 rounded-lg bg-base-300 ${shimmer}`} />
        <div className="flex-1 space-y-2">
          <div className={`h-4 bg-base-300 rounded w-full ${shimmer}`} />
          <div className={`h-3 bg-base-300 rounded w-3/4 ${shimmer}`} />
        </div>
      </div>
    ))}
  </div>
)

export const ProgressSkeleton = ({ className = "" }) => (
  <div className={`bg-base-100 rounded-xl border border-base-300/60 p-5 ${className}`}>
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg bg-base-300 ${shimmer}`} />
        <div className={`h-4 bg-base-300 rounded w-20 ${shimmer}`} />
      </div>
    </div>
    <div className="w-full h-2 bg-base-200 rounded-full mb-3 overflow-hidden">
      <div className="h-full w-1/3 bg-base-300 rounded-full" />
    </div>
    <div className={`h-3 bg-base-300 rounded w-24 ${shimmer}`} />
  </div>
)

export const StatCardSkeleton = ({ className = "" }) => (
  <div className={`bg-base-100 rounded-xl border border-base-300/60 p-5 ${className}`}>
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg bg-base-300 ${shimmer}`} />
        <div className={`h-4 bg-base-300 rounded w-24 ${shimmer}`} />
      </div>
    </div>
    <div className={`h-8 bg-base-300 rounded w-32 mb-2 ${shimmer}`} />
    <div className={`h-3 bg-base-300 rounded w-20 ${shimmer}`} />
  </div>
)

export const EmptyStateSkeleton = ({ className = "" }) => (
  <div className={`bg-base-100 rounded-xl border border-base-300/60 p-5 ${className}`}>
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className={`w-12 h-12 rounded-xl bg-base-300 mb-3 ${shimmer}`} />
      <div className={`h-4 bg-base-300 rounded w-32 mb-1 ${shimmer}`} />
      <div className={`h-3 bg-base-300 rounded w-48 mb-4 ${shimmer}`} />
      <div className={`h-10 bg-base-300 rounded-lg w-32 ${shimmer}`} />
    </div>
  </div>
)

export { WidgetSkeleton, ListSkeleton, ProgressSkeleton, StatCardSkeleton, EmptyStateSkeleton }
export default WidgetSkeleton