import { memo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion'
import { Phone, Car, Ambulance, Flame, ShieldCheck, AlertTriangle, Shield } from 'lucide-react'
import { useAuthStore } from '../../../stores/authStore'

const countryCodeMap = {
  'united kingdom': 'GB',
  'england': 'GB-ENG',
  'scotland': 'GB-SCT',
  'wales': 'GB-WLS',
  'france': 'FR',
  'germany': 'DE',
  'spain': 'ES',
  'italy': 'IT',
  'portugal': 'PT',
  'netherlands': 'NL',
  'belgium': 'BE',
  'switzerland': 'CH',
  'austria': 'AT',
  'greece': 'GR',
  'czech republic': 'CZ',
  'poland': 'PL',
  'hungary': 'HU',
  'japan': 'JP',
  'thailand': 'TH',
  'indonesia': 'ID',
  'bali': 'ID',
  'singapore': 'SG',
  'vietnam': 'VN',
  'india': 'IN',
  'china': 'CN',
  'south korea': 'KR',
  'korea': 'KR',
  'malaysia': 'MY',
  'philippines': 'PH',
  'usa': 'US',
  'united states': 'US',
  'canada': 'CA',
  'mexico': 'MX',
  'brazil': 'BR',
  'argentina': 'AR',
  'peru': 'PE',
  'australia': 'AU',
  'new zealand': 'NZ',
  'uae': 'AE',
  'dubai': 'AE',
  'israel': 'IL',
  'turkey': 'TR',
  'south africa': 'ZA',
  'egypt': 'EG',
  'morocco': 'MA',
  'kenya': 'KE',
  'hong kong': 'HK',
  'taiwan': 'TW',
}

const LocalEmergencyCard = memo(function LocalEmergencyCard({ 
  destination,
  className = '',
  showHeading = true
}) {
  const [emergencyData, setEmergencyData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const { token } = useAuthStore()

  useEffect(() => {
    if (!destination) {
      setLoading(false)
      setError(true)
      return
    }

    const destLower = destination.toLowerCase().trim()
    const countryCode = countryCodeMap[destLower] || destLower.toUpperCase().slice(0, 2)

    const fetchEmergencyNumbers = async () => {
      try {
        const response = await fetch(`/api/emergency-numbers/${countryCode}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setEmergencyData(data)
        } else {
          setError(true)
        }
      } catch (err) {
        console.error('Failed to fetch emergency numbers:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchEmergencyNumbers()
  }, [destination, token])

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={showHeading ? `dashboard-widget ${className}` : className}
      >
        {showHeading && (
        <div className="dashboard-widget-header">
          <div className="dashboard-widget-title">
            <div className="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center">
              <Phone size={16} className="text-error" />
            </div>
            <h3 className="text-base font-bold text-base-content">Local emergency numbers</h3>
          </div>
        </div>
        )}
        <div className="flex justify-center py-4">
          <span className="loading loading-spinner loading-md text-base-content/40"></span>
        </div>
      </motion.div>
    )
  }

  if (error || !emergencyData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={showHeading ? `dashboard-widget ${className}` : className}
      >
        {showHeading && (
        <div className="dashboard-widget-header">
          <div className="dashboard-widget-title">
            <div className="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center">
              <Phone size={16} className="text-error" />
            </div>
            <h3 className="text-base font-bold text-base-content">Local emergency</h3>
          </div>
        </div>
        )}
        
        <div className="text-center py-4">
          <p className="text-sm text-base-content/60 font-medium">
            We're building our emergency number database for {destination || 'your destination'}. For now, save your country's embassy contact details in your emergency contacts.
          </p>
        </div>
      </motion.div>
    )
  }

  const services = []
  if (emergencyData?.numbers) {
    const typeIcons = {
      police: { icon: Car, color: 'blue' },
      ambulance: { icon: Ambulance, color: 'red' },
      fire: { icon: Flame, color: 'orange' },
      general: { icon: AlertTriangle, color: 'slate' },
    }
    emergencyData.numbers.forEach(item => {
      if (item.available && typeIcons[item.type]) {
        services.push({
          name: item.type.charAt(0).toUpperCase() + item.type.slice(1),
          number: item.number,
          ...typeIcons[item.type]
        })
      }
    })
  }

  return (
    <div className={showHeading ? `dashboard-widget ${className}` : className}>
      {showHeading && (
      <div className="dashboard-widget-header">
        <div className="dashboard-widget-title">
          <div className="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center">
            <Phone size={16} className="text-error" />
          </div>
          <h3 className="text-base font-bold text-base-content">Local emergency numbers</h3>
        </div>
      </div>
      )}
      
      <p className="text-xs text-base-content/40 mb-4">
        {destination} emergency contact numbers
      </p>

      <div className="space-y-2">
        {services.map((service) => (
          <a 
            key={service.name}
            href={`tel:${service.number}`}
            className={`flex items-center justify-between p-3 rounded-xl bg-base-200 hover:bg-base-200 transition-all group`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                service.color === 'blue' ? 'bg-info/20' :
                service.color === 'red' ? 'bg-error/20' :
                service.color === 'orange' ? 'bg-warning/20' :
                service.color === 'violet' ? 'bg-secondary/20' :
                'bg-base-300'
              }`}>
                <service.icon size={14} className={
                  service.color === 'blue' ? 'text-info' :
                  service.color === 'red' ? 'text-error' :
                  service.color === 'orange' ? 'text-warning' :
                  service.color === 'violet' ? 'text-secondary' :
                  'text-base-content/80'
                } />
              </div>
              <span className="text-sm font-bold text-base-content/80">{service.name}</span>
            </div>
            <span className="text-lg font-black text-base-content group-hover:text-brand-vibrant transition-colors">
              {service.number}
            </span>
          </a>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-base-300/50 flex items-center gap-2">
        <Shield size={12} className="text-emerald-500" />
        <span className="text-xs text-base-content/40">
          Tap to call directly
        </span>
      </div>
    </div>
  );
});

LocalEmergencyCard.propTypes = {
  destination: PropTypes.string,
  className: PropTypes.string,
  showHeading: PropTypes.bool,
};

LocalEmergencyCard.defaultProps = {
  className: '',
  showHeading: true,
};

export default LocalEmergencyCard