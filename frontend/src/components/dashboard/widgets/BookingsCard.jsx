import { memo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Plane, Train, Bus, MapPin, Calendar, Clock, Plus, ArrowRight, Ticket } from 'lucide-react'

const typeIcons = {
  flight: Plane,
  train: Train,
  bus: Bus,
  ferry: Ticket,
  activity: MapPin,
  restaurant: Ticket,
  other: Ticket,
}

const typeLabels = {
  flight: 'Flight',
  train: 'Train',
  bus: 'Bus',
  ferry: 'Ferry',
  activity: 'Activity',
  restaurant: 'Restaurant',
  other: 'Booking',
}

const BookingsCard = memo(function BookingsCard({ 
  bookings = [], 
  tripId,
  className = '',
  showHeading = true
}) {
  const hasBookings = bookings && bookings.length > 0
  
  const getStatusBadge = () => {
    if (!hasBookings) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-xs font-bold text-amber-500">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Needs setup
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-500">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        {bookings.length} booked
      </span>
    )
  }

  const getWhyItMatters = () => {
    if (!hasBookings) return "Add transport and activities to organize your trip"
    return `${bookings.length} booking${bookings.length > 1 ? 's' : ''} confirmed`
  }

  if (!hasBookings) {
    return (
      <div className={showHeading ? `dashboard-widget ${className}` : className}>
        {showHeading && (
        <div className="dashboard-widget-header">
          <div className="dashboard-widget-title">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <Ticket size={16} className="text-violet-500" />
            </div>
            <h3 className="text-base font-bold text-base-content">Bookings</h3>
          </div>
          {getStatusBadge()}
        </div>
        )}
        
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center mx-auto mb-3">
            <Ticket size={20} className="text-base-content/30" />
          </div>
          <p className="text-sm text-base-content/60 font-medium mb-3">
            No bookings added yet
          </p>
          <p className="text-xs text-base-content/40 mb-3">{getWhyItMatters()}</p>
          {tripId ? (
            <Link 
              to={`/trips/${tripId}?tab=bookings`} 
              className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-vibrant hover:text-brand-vibrant/80"
            >
              <Plus size={14} /> Add booking
            </Link>
          ) : null}
        </div>
      </div>
    )
  }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={showHeading ? `dashboard-widget ${className}` : className}>
      {showHeading && (
      <div className="dashboard-widget-header">
        <div className="dashboard-widget-title">
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <Ticket size={16} weight="duotone" className="text-violet-500" />
          </div>
          <h3 className="text-base font-bold text-base-content">Bookings</h3>
        </div>
        <span className="text-xs font-bold text-base-content/40">
          {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
        </span>
      </div>
      )}

      <div className="space-y-3">
        {bookings.slice(0, 3).map((booking) => {
          const IconComponent = typeIcons[booking.type] || Ticket
          return (
            <Link 
              key={booking.id || booking.provider || booking.name}
              to={`/trips/${tripId}?tab=bookings`}
              className="flex items-center gap-3 p-3 rounded-xl bg-base-200 hover:bg-brand-vibrant/5 border border-transparent hover:border-brand-vibrant/20 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-base-100 flex items-center justify-center flex-shrink-0">
                <IconComponent size={14} className="text-base-content/60" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-base-content/80 truncate">{booking.provider || booking.name}</p>
                <p className="text-xs text-base-content/40">
                  {typeLabels[booking.type] || 'Booking'}
                  {booking.departure_location && booking.arrival_location && (
                    <span className="ml-1">
                      • {booking.departure_location} → {booking.arrival_location}
                    </span>
                  )}
                </p>
              </div>
              <ArrowRight size={14} className="text-base-content/30 group-hover:text-brand-vibrant transition-colors" />
            </Link>
          )
        })}
        
        {bookings.length > 3 && (
          <Link 
            to={`/trips/${tripId}?tab=bookings`}
            className="block text-center text-sm font-bold text-brand-vibrant hover:text-brand-vibrant/80 py-2"
          >
            + {bookings.length - 3} more bookings
          </Link>
        )}
      </div>

      {tripId && (
        <Link 
          to={`/trips/${tripId}?tab=bookings`} 
          className="block mt-4 pt-3 border-t border-base-300/50 text-center text-sm font-bold text-brand-vibrant hover:text-brand-vibrant/80"
        >
          Manage bookings →
        </Link>
      )}
    </div>
  );
});

BookingsCard.propTypes = {
  bookings: PropTypes.array,
  tripId: PropTypes.string,
  className: PropTypes.string,
  showHeading: PropTypes.bool,
};

BookingsCard.defaultProps = {
  bookings: [],
  className: '',
  showHeading: true,
};

export default BookingsCard