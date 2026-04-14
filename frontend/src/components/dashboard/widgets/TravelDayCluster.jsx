import { motion } from 'framer-motion'
import { CloudSun, Clock, ShieldCheck, Wifi, Plane, AlertCircle, CheckCircle } from 'lucide-react'

const statusIcons = {
  ready: CheckCircle,
  'needs-setup': AlertCircle,
  'check-later': Clock,
}

const statusColors = {
  ready: 'text-emerald-500',
  'needs-setup': 'text-amber-500',
  'check-later': 'text-sky-500',
}

const TravelDayCluster = ({
  weather = null,
  destinationTimezone = null,
  localTime = null,
  timeDiff = null,
  insurance = null,
  esim = null,
  transfer = null,
  className = ''
}) => {
  const hasWeather = weather && (weather.temp || weather.icon || weather.forecast?.length > 0)
  const hasTimezone = destinationTimezone
  const hasInsurance = insurance && insurance.confirmed
  const hasEsim = esim && esim.setup
  const hasTransfer = transfer && transfer.planned

  const getWeatherStatus = () => {
    if (!hasWeather) return { status: 'needs-setup', value: 'No data' }
    const firstDay = weather.forecast?.[0]
    if (firstDay) {
      return { status: 'ready', value: `${firstDay.temp_min}° - ${firstDay.temp_max}°` }
    }
    return { status: 'ready', value: `${weather.tempMin || '--'}° - ${weather.tempMax || '--'}°` }
  }

  const getTimeStatus = () => {
    if (!hasTimezone) return { status: 'needs-setup', value: 'Unknown' }
    if (localTime) {
      return { status: 'ready', value: localTime, timeDiff }
    }
    try {
      const now = new Date()
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: destinationTimezone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
      const timeStr = formatter.format(now)
      return { status: 'ready', value: timeStr }
    } catch {
      return { status: 'needs-setup', value: 'Unknown' }
    }
  }

  const getInsuranceStatus = () => {
    if (!insurance) return { status: 'needs-setup', value: 'Not confirmed' }
    return hasInsurance 
      ? { status: 'ready', value: 'Confirmed' }
      : { status: 'needs-setup', value: 'Not confirmed' }
  }

  const getEsimStatus = () => {
    if (!esim) return { status: 'needs-setup', value: 'Not setup' }
    return hasEsim
      ? { status: 'ready', value: 'Setup' }
      : { status: 'needs-setup', value: 'Not setup' }
  }

  const getTransferStatus = () => {
    if (!transfer) return { status: 'check-later', value: 'Not planned' }
    return hasTransfer
      ? { status: 'ready', value: 'Planned' }
      : { status: 'check-later', value: 'Not planned' }
  }

  const items = [
    { icon: CloudSun, label: 'Weather', ...getWeatherStatus() },
    { icon: Clock, label: 'Local Time', ...getTimeStatus(), timezone: destinationTimezone, timeDiff },
    { icon: ShieldCheck, label: 'Insurance', ...getInsuranceStatus() },
    { icon: Wifi, label: 'eSIM/Connectivity', ...getEsimStatus() },
    { icon: Plane, label: 'Airport Transfer', ...getTransferStatus() }
  ]

  const readyCount = items.filter(i => i.status === 'ready').length

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`dashboard-widget ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
            <CloudSun size={16} className="text-sky-500" />
          </div>
          <h3 className="text-base font-bold text-base-content">Travel-Day Prep</h3>
        </div>
        <span className="text-xs text-base-content/50 font-medium">
          {readyCount}/5 ready
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {items.map((item, index) => {
          const StatusIcon = statusIcons[item.status]
          return (
            <div
              key={index}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-base-200/50 hover:bg-base-200 transition-colors"
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                item.status === 'ready' ? 'bg-emerald-500/10' :
                item.status === 'needs-setup' ? 'bg-amber-500/10' :
                'bg-sky-500/10'
              }`}>
                <item.icon size={14} className={statusColors[item.status]} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-base-content/40 uppercase tracking-wide truncate">
                  {item.label}
                </p>
                <p className="text-sm font-bold text-base-content/80 truncate">
                  {item.value}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-base-300/30 flex flex-wrap gap-1.5">
        {items.map((item, index) => {
          const StatusIcon = statusIcons[item.status]
          return (
            <span
              key={index}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                item.status === 'ready' ? 'bg-emerald-500/10 text-emerald-500' :
                item.status === 'needs-setup' ? 'bg-amber-500/10 text-amber-500' :
                'bg-sky-500/10 text-sky-500'
              }`}
            >
              <StatusIcon size={10} />
              {item.value}
            </span>
          )
        })}
      </div>
    </motion.div>
  )
}

export default TravelDayCluster
