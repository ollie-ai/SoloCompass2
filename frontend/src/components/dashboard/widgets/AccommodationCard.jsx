import { memo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion'
import { Home, MapPin, Calendar, Key, FileText, Plus, Clock, Building2 } from 'lucide-react'
import { Link } from 'react-router-dom'

const AccommodationCard = memo(function AccommodationCard({ 
  accommodation, 
  tripId,
  className = '',
  showHeading = true
}) {
  const hasAccommodation = accommodation && (accommodation.name || accommodation.address)
  
  const getStatusBadge = () => {
    if (!hasAccommodation) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-xs font-bold text-amber-500">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500/100" />
          Needs setup
        </span>
      )
    }
    if (accommodation.confirmation_number) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/100" />
          Confirmed
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/10 text-xs font-bold text-sky-500">
        <span className="w-1.5 h-1.5 rounded-full bg-sky-500/100" />
        In progress
      </span>
    )
  }

  const getWhyItMatters = () => {
    if (!hasAccommodation) return "Book accommodation to secure your stay"
    if (!accommodation.confirmation_number) return "Add confirmation number for easy check-in"
    return "Your accommodation is confirmed"
  }

  if (!hasAccommodation) {
    return (
      <div className={showHeading ? 'dashboard-widget' : ''}>
        {showHeading && (
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
            <Home size={16} className="text-sky-500" />
          </div>
          <h3 className="text-base font-bold text-base-content">Accommodation</h3>
        </div>
        )}
        
        <div className="dashboard-empty-state">
          <div className="dashboard-empty-icon">
            <Building2 size={20} />
          </div>
          <p className="dashboard-empty-title">No accommodation yet</p>
          <p className="dashboard-empty-text">{getWhyItMatters()}</p>
          {tripId && (
            <Link to={`/trips/${tripId}?tab=accommodation`} className="btn-brand text-sm px-4 py-2">
              <Plus size={14} /> Add
            </Link>
          )}
        </div>
      </div>
    )
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short' 
    })
  }

  return (
    <div className={showHeading ? 'dashboard-widget' : ''}>
      {showHeading && (
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
            <Home size={16} className="text-sky-500" />
          </div>
          <h3 className="text-base font-bold text-base-content">Accommodation</h3>
        </div>
        {getStatusBadge()}
      </div>
      )}

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-base-200 flex items-center justify-center flex-shrink-0">
            <Home size={14} className="text-base-content/60" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-base-content">{accommodation.name}</p>
            <p className="text-xs text-base-content/60 truncate">{accommodation.address}</p>
          </div>
        </div>

        {accommodation.confirmation_number && (
          <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-base-200">
            <Key size={14} className="text-base-content/40" />
            <span className="text-sm font-medium text-base-content/80">Confirmation:</span>
            <span className="text-sm font-bold text-base-content">{accommodation.confirmation_number}</span>
          </div>
        )}

        <div className="flex items-center gap-4 text-sm">
          {accommodation.check_in_date && (
            <div className="flex items-center gap-2">
              <Calendar size={12} className="text-base-content/40" />
              <span className="text-base-content/60">Check-in:</span>
              <span className="font-bold text-base-content/80">{formatDate(accommodation.check_in_date)}</span>
            </div>
          )}
          {accommodation.check_out_date && (
            <div className="flex items-center gap-2">
              <Calendar size={12} className="text-base-content/40" />
              <span className="text-base-content/60">Check-out:</span>
              <span className="font-bold text-base-content/80">{formatDate(accommodation.check_out_date)}</span>
            </div>
          )}
        </div>
      </div>

      {tripId && (
        <Link 
          to={`/trips/${tripId}?tab=accommodation`} 
          className="block mt-4 pt-3 border-t border-base-300/50 text-center text-sm font-bold text-brand-vibrant hover:text-brand-vibrant/80"
        >
          Manage accommodation →
        </Link>
      )}
    </div>
  );
});

AccommodationCard.propTypes = {
  accommodation: PropTypes.object,
  tripId: PropTypes.string,
  className: PropTypes.string,
  showHeading: PropTypes.bool,
};

AccommodationCard.defaultProps = {
  className: '',
  showHeading: true,
};

export default AccommodationCard;