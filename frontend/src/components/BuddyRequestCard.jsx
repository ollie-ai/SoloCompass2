import { memo } from 'react';
import PropTypes from 'prop-types';
import { Check, X, Clock, MapPin, Calendar } from 'lucide-react';

function BuddyRequestCard({ request, type = 'incoming', onAccept, onDecline, loading, matchReasons }) {
  const isIncoming = type === 'incoming';
  const user = isIncoming ? request.requester : request.recipient;
  
  return (
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shrink-0">
        <span className="text-base font-black text-primary">
          {user?.name?.charAt(0) || '?'}
        </span>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-bold text-base-content truncate">{user?.name || 'Unknown User'}</h4>
          {request.trip?.destination && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
              <MapPin size={10} /> {request.trip.destination}
            </span>
          )}
        </div>
        
        {request.message && (
          <p className="mt-1.5 text-sm italic text-base-content/60 font-medium">"{request.message}"</p>
        )}
        
        {matchReasons && matchReasons.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {matchReasons.map((reason) => (
              <span key={reason.label} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${reason.color}`}>
                <reason.icon size={10} /> {reason.label}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-1.5 mt-2.5 text-xs text-base-content/40 font-medium">
          <Clock size={12} />
          {new Date(request.createdAt).toLocaleDateString()}
        </div>
      </div>
      
      {isIncoming && request.status === 'pending' && (
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => onDecline?.(request.id)}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-error/30 text-error font-bold text-sm hover:bg-error/10 transition-colors disabled:opacity-50"
          >
            <X size={16} className="inline mr-1" /> Decline
          </button>
          <button
            onClick={() => onAccept?.(request.id)}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-primary text-primary-content font-bold text-sm shadow-md shadow-primary/25 hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Check size={16} className="inline mr-1" /> Accept
          </button>
        </div>
      )}
      
      {!isIncoming && request.status === 'pending' && (
        <div className="flex items-center gap-1.5 text-sm text-base-content/40 font-medium shrink-0">
          <Clock size={14} />
          Awaiting response
        </div>
      )}
    </div>
  );
}

BuddyRequestCard.propTypes = {
  request: PropTypes.shape({
    id: PropTypes.string,
    requester: PropTypes.object,
    recipient: PropTypes.object,
    message: PropTypes.string,
    status: PropTypes.string,
    trip: PropTypes.object,
    createdAt: PropTypes.string,
  }).isRequired,
  type: PropTypes.oneOf(['incoming', 'outgoing']),
  onAccept: PropTypes.func,
  onDecline: PropTypes.func,
  loading: PropTypes.bool,
  matchReasons: PropTypes.array,
};

BuddyRequestCard.defaultProps = {
  type: 'incoming',
  loading: false,
};

export default memo(BuddyRequestCard);
