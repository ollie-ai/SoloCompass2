import { memo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion'
import { File, FileText, ShieldCheck, AlertTriangle, Plus, CheckCircle, Clock, FolderOpen } from 'lucide-react'
import { Link } from 'react-router-dom'

const documentTypeIcons = {
  passport: File,
  visa: FileText,
  insurance: ShieldCheck,
  booking_conf: File,
  other: File,
}

const documentTypeLabels = {
  passport: 'Passport',
  visa: 'Visa',
  insurance: 'Travel Insurance',
  booking_conf: 'Booking Confirmation',
  other: 'Document',
}

const DocumentsCard = memo(function DocumentsCard({
  documents = [],
  tripId,
  className = '',
  showHeading = true,
  loading = false,
}) {
  if (loading) {
    return (
      <div className={showHeading ? 'dashboard-widget' : ''}>
        {showHeading && <div className="h-6 w-28 rounded-lg bg-base-200 animate-pulse mb-4" />}
        <div className="space-y-2">
          {[1, 2, 3].map(n => <div key={n} className="h-10 rounded-lg bg-base-200 animate-pulse" />)}
        </div>
      </div>
    );
  }

  const hasDocuments = documents && documents.length > 0
  
  const checkExpiry = (expiryDate) => {
    if (!expiryDate) return null
    const expiry = new Date(expiryDate)
    const now = new Date()
    const daysUntil = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))
    if (daysUntil < 0) return 'expired'
    if (daysUntil < 30) return 'expiring'
    return null
  }

  const getStatusBadge = () => {
    if (!hasDocuments) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-xs font-bold text-amber-500">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500/100" />
          Needs setup
        </span>
      )
    }
    
    const hasPassport = documents.some(d => d.document_type === 'passport')
    const hasInsurance = documents.some(d => d.document_type === 'insurance')
    
    if (!hasPassport || !hasInsurance) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/10 text-xs font-bold text-sky-500">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500/100" />
          In progress
        </span>
      )
    }
    
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-500">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/100" />
        Complete
      </span>
    )
  }

  const getWhyItMatters = () => {
    if (!hasDocuments) return "Upload passport, visa, and insurance for easy access"
    
    const hasPassport = documents.some(d => d.document_type === 'passport')
    const hasInsurance = documents.some(d => d.document_type === 'insurance')
    
    if (!hasPassport) return "Add passport for identification"
    if (!hasInsurance) return "Add travel insurance for peace of mind"
    return "Your essential documents are uploaded"
  }

  if (!hasDocuments) {
    return (
      <div className={showHeading ? 'dashboard-widget' : ''}>
        {showHeading && (
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
            <File size={16} className="text-warning" />
          </div>
          <h3 className="text-base font-bold text-base-content">Documents</h3>
        </div>
        )}
        
        <div className="dashboard-empty-state">
          <div className="dashboard-empty-icon">
            <FolderOpen size={20} />
          </div>
          <p className="dashboard-empty-title">No documents yet</p>
          <p className="dashboard-empty-text">{getWhyItMatters()}</p>
          {tripId && (
            <Link to={`/trips/${tripId}?tab=documents`} className="btn-brand text-sm px-4 py-2">
              <Plus size={14} /> Upload
            </Link>
          )}
        </div>
        
        <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/20">
          <p className="text-xs text-warning font-medium">
            💡 Tip: Upload passport, visa, and travel insurance for easy access during your trip.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={showHeading ? 'dashboard-widget' : ''}>
      {showHeading && (
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
            <File size={16} className="text-warning" />
          </div>
          <h3 className="text-base font-bold text-base-content">Documents</h3>
        </div>
        {getStatusBadge()}
      </div>
      )}

      <div className="space-y-2">
        {documents.map((doc) => {
          const IconComponent = documentTypeIcons[doc.document_type] || File
          const expiryStatus = checkExpiry(doc.expiry_date)
          
          return (
            <div 
              key={doc.id || doc.name}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                expiryStatus === 'expired' ? 'bg-error/10 border border-error/20' :
                expiryStatus === 'expiring' ? 'bg-warning/10 border border-warning/20' :
                'bg-base-200 hover:bg-base-200'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                expiryStatus === 'expired' ? 'bg-error/20' :
                expiryStatus === 'expiring' ? 'bg-warning/20' :
                'bg-base-100'
              }`}>
                <IconComponent size={14} className={
                  expiryStatus === 'expired' ? 'text-error' :
                  expiryStatus === 'expiring' ? 'text-warning' :
                  'text-base-content/60'
                } />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-base-content/80 truncate">{doc.name}</p>
                <p className="text-xs text-base-content/40">
                  {documentTypeLabels[doc.document_type] || 'Document'}
                  {doc.expiry_date && (
                    <span className={`ml-2 ${
                      expiryStatus === 'expired' ? 'text-error font-bold' :
                      expiryStatus === 'expiring' ? 'text-warning font-bold' :
                      ''
                    }`}>
                      • Expires {new Date(doc.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </p>
              </div>
              {expiryStatus === 'expired' && (
                <AlertTriangle size={14} className="text-error" />
              )}
              {expiryStatus === 'expiring' && (
                <Clock size={14} className="text-warning" />
              )}
              {!expiryStatus && doc.file_url && (
                <CheckCircle size={14} className="text-emerald-500" />
              )}
            </div>
          )
        })}
      </div>

      {tripId && (
        <Link 
          to={`/trips/${tripId}?tab=documents`} 
          className="block mt-4 pt-3 border-t border-base-300/50 text-center text-sm font-bold text-brand-vibrant hover:text-brand-vibrant/80"
        >
          Manage documents →
        </Link>
      )}
    </div>
  );
});

DocumentsCard.propTypes = {
  documents: PropTypes.array,
  tripId: PropTypes.string,
  className: PropTypes.string,
  showHeading: PropTypes.bool,
};

DocumentsCard.defaultProps = {
  documents: [],
  className: '',
  showHeading: true,
};

export default DocumentsCard