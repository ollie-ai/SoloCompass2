import { memo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion'
import { ShieldCheck, Clock, MapPin, Phone, AlertTriangle, UserCheck, UserX } from 'lucide-react'
import { Link } from 'react-router-dom'

const SafetyStatusCard = memo(function SafetyStatusCard({ 
  nextCheckIn = null, 
  checkInScheduled = false, 
  hasContacts = false, 
  contactCount = 0,
  hasSafeHavens = false, 
  guardianStatus = null,
  checkInSchedule = null,
  className = "",
  showHeading = true 
}) {
  const formatNextCheckIn = (time) => {
    if (!time) {
      if (checkInSchedule?.next_checkin_time) {
        time = checkInSchedule.next_checkin_time
      }
    }
    if (!time) return null
    const d = new Date(time)
    const now = new Date()
    const diff = Math.round((d - now) / 60000)
    if (diff <= 0) return "Now"
    if (diff < 60) return `In ${diff}m`
    if (diff < 1440) return `In ${Math.round(diff/60)}h`
    return d.toLocaleDateString()
  }
  
  const hasSetup = hasContacts && hasSafeHavens
  
  const getGuardianBadge = () => {
    if (guardianStatus === 'verified') {
      return { text: 'Verified', color: 'text-success', bg: 'bg-success/10' }
    }
    if (guardianStatus === 'pending') {
      return { text: 'Pending', color: 'text-warning', bg: 'bg-warning/10' }
    }
    return { text: 'Not set', color: 'text-base-content/40', bg: 'bg-base-200' }
  }
  
  const guardianBadge = getGuardianBadge()
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={showHeading ? `dashboard-widget ${className}` : className}
    >
      {showHeading && (
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck size={18} className="text-brand-vibrant" />
        <h3 className="text-base font-bold text-base-content">Safety Status</h3>
      </div>
      )}
      
      <div className="space-y-1">
        <div className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-base-200 transition-colors">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-base-content/40" />
            <span className="text-sm font-medium text-base-content/80">Next check-in</span>
          </div>
          <span className="text-sm font-bold text-base-content">
            {checkInScheduled ? (formatNextCheckIn(nextCheckIn) || "Scheduled") : "Not set"}
          </span>
        </div>
        
        <div className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-base-200 transition-colors">
          <div className="flex items-center gap-2">
            <Phone size={14} className={hasContacts ? "text-emerald-500" : "text-base-content/30"} />
            <span className="text-sm font-medium text-base-content/80">Emergency contacts</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${hasContacts ? "text-success" : "text-base-content/40"}`}>
              {hasContacts ? `${contactCount} set` : "Not set"}
            </span>
            <span className={`w-2 h-2 rounded-full ${hasContacts ? "bg-success" : "bg-base-300"}`} />
          </div>
        </div>
        
        <div className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-base-200 transition-colors">
          <div className="flex items-center gap-2">
            <UserCheck size={14} className={guardianStatus === 'verified' ? "text-emerald-500" : guardianStatus === 'pending' ? "text-warning" : "text-base-content/30"} />
            <span className="text-sm font-medium text-base-content/80">Guardian</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${guardianBadge.color}`}>
              {guardianBadge.text}
            </span>
            <span className={`w-2 h-2 rounded-full ${guardianStatus === 'verified' ? "bg-success" : guardianStatus === 'pending' ? "bg-warning" : "bg-base-300"}`} />
          </div>
        </div>
        
        <div className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-base-200 transition-colors">
          <div className="flex items-center gap-2">
            <MapPin size={14} className={hasSafeHavens ? "text-emerald-500" : "text-base-content/30"} />
            <span className="text-sm font-medium text-base-content/80">Safe havens</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${hasSafeHavens ? "text-success" : "text-base-content/40"}`}>
              {hasSafeHavens ? "Saved" : "None"}
            </span>
            <span className={`w-2 h-2 rounded-full ${hasSafeHavens ? "bg-success/100" : "bg-base-300"}`} />
          </div>
        </div>
      </div>
      
      {!hasSetup && (
        <div className="mt-3 p-2.5 bg-warning/10 rounded-lg flex items-center gap-2">
          <AlertTriangle size={14} className="text-warning shrink-0" />
          <span className="text-xs font-medium text-warning">Complete your safety setup for peace of mind</span>
        </div>
      )}
      
      <Link to="/safety" className="block mt-4">
        <div className="w-full text-center text-sm font-bold text-white bg-brand-vibrant hover:bg-emerald-600 py-2.5 rounded-lg transition-colors shadow-sm shadow-brand-vibrant/20">
          Manage Safety Settings
        </div>
      </Link>
    </motion.div>
  );
});

SafetyStatusCard.propTypes = {
  nextCheckIn: PropTypes.string,
  checkInScheduled: PropTypes.bool,
  hasContacts: PropTypes.bool,
  contactCount: PropTypes.number,
  hasSafeHavens: PropTypes.bool,
  guardianStatus: PropTypes.string,
  checkInSchedule: PropTypes.object,
  className: PropTypes.string,
  showHeading: PropTypes.bool,
};

SafetyStatusCard.defaultProps = {
  nextCheckIn: null,
  checkInScheduled: false,
  hasContacts: false,
  contactCount: 0,
  hasSafeHavens: false,
  guardianStatus: null,
  checkInSchedule: null,
  className: "",
  showHeading: true,
};

export default SafetyStatusCard
