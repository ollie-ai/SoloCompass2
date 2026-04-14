import { memo } from 'react';
import PropTypes from 'prop-types';
import { MessageCircle, Calendar, MapPin, X, CheckCircle, Zap, Sparkles, Crown, Shield } from 'lucide-react';

function MatchCard({ match, onConnect, onSkip, loading, matchReasons, emailVerified, profileCompleteness }) {
  const defaultReasons = [
    { icon: MapPin, label: 'Same destination', color: 'text-primary bg-primary/5 border-primary/20' },
    { icon: Calendar, label: 'Overlapping dates', color: 'text-warning bg-warning/10 border-warning/30' },
    { icon: Zap, label: 'Similar vibe', color: 'text-purple-500 bg-purple-50 border-purple-200' },
    { icon: Sparkles, label: 'Shared interests', color: 'text-rose-500 bg-rose-50 border-rose-200' },
  ];

  const reasons = matchReasons || match.matchReasons?.map((r, i) => ({
    icon: defaultReasons[i % defaultReasons.length].icon,
    label: r,
    color: defaultReasons[i % defaultReasons.length].color,
  })) || [];

  const completeness = profileCompleteness || { percent: 0, label: 'Incomplete' };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="bg-base-100 rounded-xl border border-base-300/60 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.10)] transition-all overflow-hidden group">
      <div className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center shrink-0 shadow-sm border border-white group-hover:scale-105 transition-transform duration-300">
            <span className="text-base font-black text-white">
              {getInitials(match.name)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base-content truncate group-hover:text-primary transition-colors">{match.name}</h3>
              {match.verificationTier >= 3 ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/30 shrink-0">
                  <Crown size={8} /> Solo Legend
                </span>
              ) : match.verificationTier >= 2 ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold text-primary bg-primary/10 border border-primary/30 shrink-0">
                  <Shield size={8} /> Trusted
                </span>
              ) : (emailVerified || match.emailVerified || match.verificationTier >= 1) && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold text-info bg-info/10 border border-info/30 shrink-0">
                  <CheckCircle size={8} /> Explorer
                </span>
              )}
            </div>
            <p className="text-xs text-base-content/40 font-medium truncate mt-0.5">{match.location || 'Location hidden'}</p>
          </div>
          <div className="text-center shrink-0 bg-primary/5 px-2.5 py-1.5 rounded-xl border border-primary/10">
            <div className="text-xl font-black text-primary leading-none">{match.compatibilityScore || 0}%</div>
            <p className="text-[10px] text-primary/60 font-bold uppercase tracking-wider mt-1">Match</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2 text-sm text-base-content/80 font-medium">
          <MapPin size={14} className="text-base-content/40 shrink-0" />
          <span className="truncate">{match.upcomingTrips?.[0]?.destination || 'No upcoming trips'}</span>
        </div>
        <div className="flex items-center gap-2 mb-4 text-sm text-base-content/80 font-medium">
          <Calendar size={14} className="text-base-content/40 shrink-0" />
          <span>{match.upcomingTrips?.[0]?.dates || 'Dates TBD'}</span>
        </div>

        {reasons.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {reasons.slice(0, 3).map((reason) => (
              <span key={reason.label} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${reason.color}`}>
                <reason.icon size={10} /> {reason.label}
              </span>
            ))}
          </div>
        )}

        <div className="mb-4">
          <div className="flex items-center justify-between text-[10px] font-bold text-base-content/40 uppercase tracking-wider mb-1">
            <span>Profile</span>
            <span>{completeness.label}</span>
          </div>
          <div className="w-full h-1.5 bg-base-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${completeness.percent}%` }}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onSkip?.(match.userId)}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold text-xs bg-base-200 text-base-content/60 border border-base-300 hover:border-base-300/70 transition-colors disabled:opacity-50"
          >
            <X size={14} /> Skip
          </button>
          <button
            onClick={() => onConnect?.(match.userId)}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold text-xs bg-primary text-primary-content shadow-sm shadow-primary/20 hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <MessageCircle size={14} /> Connect
          </button>
        </div>
      </div>
    </div>
  );
}

MatchCard.propTypes = {
  match: PropTypes.shape({
    userId: PropTypes.string,
    name: PropTypes.string,
    location: PropTypes.string,
    verificationTier: PropTypes.number,
    emailVerified: PropTypes.bool,
    compatibilityScore: PropTypes.number,
    upcomingTrips: PropTypes.array,
    matchReasons: PropTypes.array,
  }).isRequired,
  onConnect: PropTypes.func,
  onSkip: PropTypes.func,
  loading: PropTypes.bool,
  matchReasons: PropTypes.array,
  emailVerified: PropTypes.bool,
  profileCompleteness: PropTypes.object,
};

MatchCard.defaultProps = {
  loading: false,
};

export default memo(MatchCard);
