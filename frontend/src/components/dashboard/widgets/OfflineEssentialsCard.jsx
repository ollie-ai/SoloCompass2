import { motion } from 'framer-motion'
import { WifiOff, MapPin, Phone, Download, CheckCircle, Circle, Cloud, CircleDashed, FileText, Save } from 'lucide-react'
import { Link } from 'react-router-dom'

const OfflineEssentialsCard = ({ 
  essentials = {},
  tripId,
  className = '' 
}) => {
  const { 
    offlineMaps = false, 
    emergencyNumbers = false, 
    currencyOffline = false,
    documentsOffline = false,
    itineraryOffline = false
  } = essentials

  const items = [
    { key: 'offlineMaps', label: 'Offline maps', description: 'Download destination maps', icon: MapPin },
    { key: 'emergencyNumbers', label: 'Emergency numbers', description: 'Local emergency contacts offline', icon: Phone },
    { key: 'currencyOffline', label: 'Currency rates', description: 'Offline exchange rates', icon: Cloud },
    { key: 'documentsOffline', label: 'Documents', description: 'Passport & booking copies saved', icon: FileText },
    { key: 'itineraryOffline', label: 'Itinerary', description: 'Full trip plan available offline', icon: Save },
  ]

  const completedCount = items.filter(item => essentials[item.key]).length
  const allReady = completedCount === items.length
  const readyCount = completedCount

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`dashboard-widget ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            allReady ? 'bg-success/10' : 'bg-base-200'
          }`}>
            <Download size={16} className={allReady ? 'text-emerald-500' : 'text-base-content/40'} />
          </div>
          <h3 className="text-base font-bold text-base-content">Offline essentials</h3>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
          allReady 
            ? 'bg-success/10 text-success' 
            : readyCount > 0 
              ? 'bg-warning/10 text-warning'
              : 'bg-base-200 text-base-content/60'
        }`}>
          {allReady ? <CheckCircle size={10} /> : <CircleDashed size={10} />}
          {allReady ? 'All ready' : `${readyCount}/${items.length} ready`}
        </span>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-base-content/50">Download progress</span>
          <span className="font-bold text-base-content/70">{Math.round((readyCount / items.length) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-base-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(readyCount / items.length) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-full rounded-full ${allReady ? 'bg-emerald-500' : readyCount > 0 ? 'bg-amber-400' : 'bg-base-content/20'}`}
          />
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon
          const isReady = essentials[item.key]
          return (
            <div 
              key={item.key}
              className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${
                isReady 
                  ? 'bg-success/5' 
                  : 'bg-base-200 hover:bg-base-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  isReady ? 'bg-success/10' : 'bg-base-300'
                }`}>
                  <Icon size={12} className={isReady ? 'text-success' : 'text-base-content/40'} />
                </div>
                <div>
                  <span className="text-sm font-medium text-base-content/80 block">{item.label}</span>
                </div>
              </div>
              {isReady ? (
                <CheckCircle size={14} className="text-emerald-500" />
              ) : (
                <Circle size={14} className="text-base-content/20" />
              )}
            </div>
          )
        })}
      </div>

      {!allReady && (
        <div className="mt-4 pt-3 border-t border-base-300/50">
          {tripId ? (
            <Link
              to={`/trips/${tripId}`}
              className="block text-center text-sm font-bold text-brand-vibrant hover:text-brand-vibrant/80"
            >
              Complete offline setup →
            </Link>
          ) : (
            <p className="text-xs text-base-content/50 text-center">
              Start a trip to enable offline features
            </p>
          )}
        </div>
      )}

      {allReady && (
        <div className="mt-4 pt-3 border-t border-success/10">
          <div className="flex items-center justify-center gap-2 text-emerald-600">
            <WifiOff size={12} />
            <span className="text-xs font-medium">Ready to travel without connection</span>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default OfflineEssentialsCard