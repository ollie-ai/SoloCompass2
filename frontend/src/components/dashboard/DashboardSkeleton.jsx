import { motion } from 'framer-motion';
import Skeleton from '../Skeleton';

const DashboardSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Hero Skeleton */}
      <div className="relative h-[300px] rounded-3xl overflow-hidden bg-base-300/30 border border-base-content/5">
        <div className="absolute inset-0 p-8 flex flex-col justify-end gap-4">
          <Skeleton className="h-10 w-64 bg-base-content/10" />
          <Skeleton className="h-4 w-96 bg-base-content/5" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32 bg-base-content/10" />
            <Skeleton className="h-10 w-32 bg-base-content/5" />
          </div>
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={`skeleton-widget-${i}`} className="glass-card p-6 rounded-2xl bg-base-100/50 border border-base-content/5">
            <div className="flex items-center gap-3 mb-6">
              <Skeleton variant="circle" className="w-10 h-10 bg-base-content/10" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 bg-base-content/10" />
                <Skeleton className="h-3 w-48 bg-base-content/5" />
              </div>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full bg-base-content/5" />
              <Skeleton className="h-4 w-full bg-base-content/5" />
              <Skeleton className="h-4 w-2/3 bg-base-content/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardSkeleton;
