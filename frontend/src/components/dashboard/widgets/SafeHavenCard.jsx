import { motion } from 'framer-motion'
import { Shield, MapPin, Phone, Navigation, Building2, Cross, AlertTriangle, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'

const SafeHavenCard = ({ 
  destination,
  tripId,
  className = '',
  showHeading = true
}) => {
  const [safeHavens, setSafeHavens] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (destination || tripId) {
      fetchSafeHavens()
    }
  }, [destination, tripId])

  const fetchSafeHavens = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const destinationCoords = {
        'tokyo': { lat: 35.6762, lng: 139.6503 },
        'paris': { lat: 48.8566, lng: 2.3522 },
        'london': { lat: 51.5074, lng: -0.1278 },
        'new york': { lat: 40.7128, lng: -74.0060 },
        'berlin': { lat: 52.5200, lng: 13.4050 },
        'barcelona': { lat: 41.3874, lng: 2.1686 },
        'rome': { lat: 41.9028, lng: 12.4964 },
        'amsterdam': { lat: 52.3676, lng: 4.9044 },
        'bangkok': { lat: 13.7563, lng: 100.5018 },
        'singapore': { lat: 1.3521, lng: 103.8198 },
        'lisbon': { lat: 38.7223, lng: -9.1393 },
        'madrid': { lat: 40.4168, lng: -3.7038 },
        'istanbul': { lat: 41.0082, lng: 28.9784 },
        'sydney': { lat: -33.8688, lng: 151.2093 },
        'dubai': { lat: 25.2048, lng: 55.2708 },
        'bali': { lat: -8.3405, lng: 115.0920 },
        'chiang mai': { lat: 18.7883, lng: 98.9853 },
        'kyoto': { lat: 35.0116, lng: 135.7681 },
        'seoul': { lat: 37.5665, lng: 126.9780 },
        'osaka': { lat: 34.6937, lng: 135.5023 },
      }
      
      const destKey = destination?.toLowerCase() || ''
      const coords = destinationCoords[destKey] || { lat: 51.5074, lng: -0.1278 }
      const lat = coords.lat
      const lng = coords.lng
      
      const response = await fetch(`/api/safety/safe-haven?lat=${lat}&lng=${lng}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await response.json()
      
      if (data.success) {
        setSafeHavens(data.data || [])
      } else {
        setError('Could not fetch safe havens')
      }
    } catch (err) {
      console.error('[SafeHavenCard] Error:', err)
      setError('Failed to load safe havens')
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case 'police':
        return <Building2 size={16} className="text-blue-500" />
      case 'hospital':
        return <Cross size={16} className="text-red-500" />
      default:
        return <Shield size={16} className="text-emerald-500" />
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'police':
        return 'Police'
      case 'hospital':
        return 'Hospital'
      default:
        return 'Safe Haven'
    }
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`dashboard-widget ${className}`}
      >
        <div className="flex items-center justify-center gap-2 py-8">
          <Loader2 size={18} className="animate-spin text-base-content/40" />
          <span className="text-sm text-base-content/40">Finding safe places...</span>
        </div>
      </motion.div>
    )
  }

  if (error || safeHavens.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`dashboard-widget ${className}`}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Shield size={16} className="text-emerald-500" />
          </div>
          <h3 className="text-base font-bold text-base-content">Safe Havens</h3>
        </div>
        
        <div className="flex flex-col items-center py-6 px-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-sky-500/10 flex items-center justify-center mb-4 shadow-inner">
            <MapPin size={24} className="text-emerald-400" />
          </div>
          <p className="text-sm font-bold text-base-content/70 mb-1">
            Scouting your safety spots
          </p>
          <p className="text-xs text-base-content/40 max-w-[200px]">
            We'll identify hospitals, police stations, and safe areas near {destination || 'your destination'} before you arrive
          </p>
        </div>
      </motion.div>
    )
  }

  const nearbyHavens = safeHavens.slice(0, 5)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`dashboard-widget ${className}`}
    >
      {showHeading && (
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
          <Shield size={16} className="text-emerald-500" />
        </div>
        <h3 className="text-base font-bold text-base-content">Safe Havens</h3>
        <span className="ml-auto px-2 py-0.5 bg-emerald-500/10 text-emerald-600 text-xs font-bold rounded-full">
          {safeHavens.length} nearby
        </span>
      </div>
      )}
      
      {!showHeading && (
      <div className="flex items-center gap-2 mb-3">
        <span className="ml-auto px-2 py-0.5 bg-emerald-500/10 text-emerald-600 text-xs font-bold rounded-full">
          {safeHavens.length} nearby
        </span>
      </div>
      )}
      
      <div className="space-y-2">
        {nearbyHavens.map((haven, index) => (
          <a
            key={haven.place_id || index}
            href={`https://www.google.com/maps/search/?api=1&query=${haven.lat},${haven.lon}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-2.5 rounded-lg bg-base-200/50 hover:bg-emerald-500/5 border border-transparent hover:border-emerald-500/20 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-base-100 flex items-center justify-center">
              {getIcon(haven.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-base-content truncate">
                {haven.name || getTypeLabel(haven.type)}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] px-1.5 py-0.5 bg-base-200 text-base-content/60 rounded">
                  {getTypeLabel(haven.type)}
                </span>
                {haven.distance && (
                  <span className="text-[11px] text-base-content/40">
                    {(haven.distance / 1000).toFixed(1)}km away
                  </span>
                )}
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-base-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Navigation size={14} className="text-emerald-500" />
            </div>
          </a>
        ))}
      </div>
      
      {safeHavens.length > 5 && (
        <a
          href={`https://www.google.com/maps/search/police+hospital+near+${encodeURIComponent(destination || '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block text-center text-xs font-semibold text-emerald-600 hover:text-emerald-500"
        >
          View all {safeHavens.length} safe havens on map
        </a>
      )}
    </motion.div>
  )
}

export default SafeHavenCard
