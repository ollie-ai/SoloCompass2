import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CloudSun, Clock, Thermometer, Wind, Droplets, Cloud, Sun, CloudRain, CloudLightning, Loader2 } from 'lucide-react'

const getWeatherIcon = (iconCode) => {
  if (!iconCode) return <CloudSun size={24} className="text-base-content/40" />
  if (iconCode.startsWith('01')) return <Sun size={24} className="text-yellow-400" />
  if (iconCode.startsWith('02') || iconCode.startsWith('03') || iconCode.startsWith('04')) return <Cloud size={24} className="text-base-content/40" />
  if (iconCode.startsWith('09') || iconCode.startsWith('10')) return <CloudRain size={24} className="text-emerald-500" />
  if (iconCode.startsWith('11')) return <CloudLightning size={24} className="text-amber-500" />
  return <CloudSun size={24} className="text-sky-500" />
}

const WeatherCard = ({ 
  weather = null, 
  destinationTimezone = null, 
  localTime = null, 
  timeDiff = null,
  destination = null,
  loading = false,
  className = ''
}) => {
  const [currentTime, setCurrentTime] = useState(null)
  const [timeError, setTimeError] = useState(false)

  useEffect(() => {
    if (!destinationTimezone) {
      setCurrentTime(localTime)
      return
    }

    const updateTime = () => {
      try {
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: destinationTimezone,
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          weekday: 'short'
        })
        setCurrentTime(formatter.format(new Date()))
        setTimeError(false)
      } catch (err) {
        setTimeError(true)
        setCurrentTime(localTime || '—')
      }
    }

    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [destinationTimezone, localTime])

  const hasWeatherData = weather && (weather.temp !== undefined || (weather.forecast && weather.forecast.length > 0))
  const hasTimezone = destinationTimezone || localTime

  const currentWeather = weather?.forecast?.[0] || (weather?.temp ? {
    temp: weather.temp,
    description: weather.description,
    icon: weather.icon
  } : null)

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`dashboard-widget ${className}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
              <Loader2 size={16} className="text-sky-500 animate-spin" />
            </div>
            <h3 className="text-base font-bold text-base-content">Local Weather</h3>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-base-content/40">Loading weather data...</div>
        </div>
      </motion.div>
    )
  }

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
          <h3 className="text-base font-bold text-base-content">Local Weather</h3>
        </div>
        {destination && (
          <span className="text-xs text-base-content/40 font-medium">{destination}</span>
        )}
      </div>

      {!hasWeatherData && !hasTimezone ? (
        <div className="text-center py-6">
          <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center mx-auto mb-3">
            <CloudSun size={20} className="text-base-content/30" />
          </div>
          <p className="text-sm text-base-content/50 font-medium">Weather data unavailable</p>
          <p className="text-xs text-base-content/30 mt-1">Add a trip destination to see local weather</p>
        </div>
      ) : (
        <div className="space-y-4">
          {hasTimezone && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-base-200/50 border border-base-content/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-500/10 flex items-center justify-center">
                  <Clock size={16} className="text-sky-500" />
                </div>
                <div>
                  <p className="text-xs text-base-content/40 uppercase tracking-wide">Local Time</p>
                  <p className="text-sm font-bold text-base-content">
                    {timeError ? localTime || '—' : currentTime || '—'}
                  </p>
                </div>
              </div>
              {timeDiff && (
                <span className="text-xs font-medium text-base-content/40">
                  {timeDiff}
                </span>
              )}
            </div>
          )}

          {hasWeatherData && currentWeather && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-sky-500/5 to-emerald-500/5 border border-sky-500/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/50 flex items-center justify-center shadow-sm">
                  {getWeatherIcon(currentWeather.icon)}
                </div>
                <div>
                  <p className="text-2xl font-black text-base-content leading-none">
                    {currentWeather.temp_min && currentWeather.temp_max 
                      ? `${currentWeather.temp_min}°–${currentWeather.temp_max}°`
                      : currentWeather.temp 
                        ? `${currentWeather.temp}°`
                        : '--°'
                    }
                  </p>
                  <p className="text-xs text-base-content/60 capitalize mt-0.5">
                    {currentWeather.condition || currentWeather.description || 'Clear'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {weather?.forecast && weather.forecast.length > 1 && (
            <div className="pt-3 border-t border-base-300/30">
              <p className="text-[10px] text-base-content/40 uppercase tracking-widest mb-2">5-Day Forecast</p>
              <div className="grid grid-cols-5 gap-1">
                {weather.forecast.slice(0, 5).map((day, idx) => (
                  <div key={idx} className="text-center p-2 rounded-lg hover:bg-base-200/50 transition-colors">
                    <p className="text-[10px] font-bold text-base-content/40 mb-1">{day.day_name}</p>
                    <div className="flex justify-center mb-1">
                      {getWeatherIcon(day.icon)}
                    </div>
                    <p className="text-xs font-black text-base-content">{day.temp_max}°</p>
                    <p className="text-[10px] text-base-content/30">{day.temp_min}°</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {weather?.wind_speed !== undefined && (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-base-200/30">
                <Wind size={14} className="text-base-content/40" />
                <div>
                  <p className="text-[10px] text-base-content/40 uppercase">Wind</p>
                  <p className="text-xs font-bold text-base-content">{weather.wind_speed} m/s</p>
                </div>
              </div>
              {weather.humidity !== undefined && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-base-200/30">
                  <Droplets size={14} className="text-base-content/40" />
                  <div>
                    <p className="text-[10px] text-base-content/40 uppercase">Humidity</p>
                    <p className="text-xs font-bold text-base-content">{weather.humidity}%</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

export default WeatherCard