import { motion } from 'framer-motion';
import { Target, Heart, Sparkles, Calendar, Edit3, CheckCircle2, ListChecks, ShieldCheck, Mail, Phone, MapPin, Eye, EyeOff, User, Camera, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const CompletionRing = ({ percent, size = 48, strokeWidth = 4 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#10b981"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-black text-base-content">{percent}%</span>
      </div>
    </div>
  );
};

export default function MatchingProfile({ profile, showEdit = false, onEdit, user }) {
  if (!profile && !user) return null;

  const travelDna = profile?.travelDna || profile?.quizResult;
  const hasDisplayName = !!(profile?.displayName || profile?.name || user?.name);
  const hasBio = !!(profile?.bio);
  const hasAvatar = !!(profile?.avatarUrl);
  const hasTravelDna = !!(travelDna && (travelDna.adventureLevel || travelDna.socialStyle || travelDna.summary));
  const interests = Array.isArray(profile?.interests) ? profile.interests : [];
  const hasInterests = interests.length >= 3;
  const hasMatchingPrefs = Array.isArray(profile?.meetPreferences) && profile.meetPreferences.length > 0;
  const hasHomeBase = !!(profile?.homeBase || user?.home_city);
  const hasPhone = !!(user?.phone);
  const hasEmail = !!(user?.email);

  const completionScore =
    (hasDisplayName ? 20 : 0) +
    (hasBio ? 20 : 0) +
    (hasAvatar ? 20 : 0) +
    (hasTravelDna ? 20 : 0) +
    (hasInterests ? 20 : 0);

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const displayName = profile?.displayName || profile?.name || user?.name || 'Anonymous Traveller';
  const displayBio = profile?.bio || 'No public bio yet — share a bit about your travel style.';
  const displayHome = profile?.homeBase || user?.home_city || null;

  const lastUpdated = travelDna?.updatedAt ? new Date(travelDna.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;

  const trustSignals = [
    { icon: Mail, label: 'Email Verified', active: !!(profile?.verificationTier >= 1 || user?.emailVerified) },
    { icon: Phone, label: 'Phone Verified', active: !!(profile?.verificationTier >= 2) },
    { icon: CheckCircle2, label: `Profile ${completionScore}% Complete`, active: completionScore >= 80 },
    { icon: ShieldCheck, label: profile?.verificationTier >= 3 ? 'Established Buddy' : 'New Explorer', active: profile?.verificationTier >= 3 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      <div className="bg-base-100 rounded-xl border border-base-300/60 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="font-black text-lg text-base-content">My Travel Profile</h3>
              <p className="text-xs text-base-content/60 font-medium mt-0.5">This is the identity other travellers use to understand your travel style and decide whether to connect.</p>
            </div>
            <div className="flex items-center gap-3">
              <CompletionRing percent={completionScore} />
            </div>
          </div>

          <div className="flex items-start gap-4 mb-6 p-4 bg-base-200/80 rounded-xl border border-base-300/50">
            <div className="relative shrink-0">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt={`${displayName}'s profile photo`} className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-vibrant to-emerald-500 flex items-center justify-center shadow-md">
                  <span className="text-xl font-black text-white">
                    {getInitials(displayName)}
                  </span>
                </div>
              )}
              <button
                onClick={onEdit}
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-base-100 rounded-lg border border-base-300 shadow-sm flex items-center justify-center text-base-content/40 hover:text-brand-vibrant hover:border-brand-vibrant/30 transition-colors"
                title="Change avatar"
              >
                <Camera size={12} />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-base-content text-lg truncate">{displayName}</p>
              <p className="text-xs text-base-content/60 font-medium truncate mt-0.5">{displayBio}</p>
              {displayHome && (
                <div className="flex items-center gap-1 mt-1.5 text-xs text-base-content/40 font-medium">
                  <MapPin size={10} /> {displayHome}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2 text-xs text-base-content/40 font-medium">
            <CheckCircle2 size={12} className={completionScore >= 80 ? 'text-emerald-500' : completionScore >= 50 ? 'text-warning' : 'text-base-content/30'} />
            Profile {completionScore >= 80 ? 'complete' : completionScore >= 50 ? 'mostly complete' : 'incomplete'} — {completionScore}% filled
          </div>
          {completionScore < 80 && (
            <p className="text-xs text-warning font-medium mb-4">Better match quality with a completed profile</p>
          )}

          <button
            onClick={onEdit}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm bg-brand-vibrant text-white shadow-md shadow-brand-vibrant/25 hover:bg-emerald-600 transition-colors"
          >
            <Edit3 size={14} /> Edit Travel Profile
          </button>
        </div>
      </div>

      {travelDna && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="bg-base-100 rounded-xl border border-base-300/60 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-black text-base-content flex items-center gap-2">
                <Sparkles size={16} className="text-brand-vibrant" /> Travel DNA
              </h4>
              {lastUpdated && (
                <span className="text-[10px] font-medium text-base-content/40 flex items-center gap-1">
                  <Calendar size={10} /> {lastUpdated}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-3 p-3 bg-brand-vibrant/5 rounded-xl border border-brand-vibrant/10">
                <div className="w-10 h-10 rounded-xl bg-brand-vibrant/10 flex items-center justify-center shrink-0">
                  <Target size={16} className="text-brand-vibrant" />
                </div>
                <div>
                  <p className="text-[10px] text-base-content/60 font-medium uppercase tracking-wider">Adventure</p>
                  <p className="text-sm font-black text-base-content capitalize">{travelDna.adventureLevel || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-success/5 rounded-xl border border-emerald-500/10">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                  <Heart size={16} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] text-base-content/60 font-medium uppercase tracking-wider">Social Style</p>
                  <p className="text-sm font-black text-base-content capitalize">{travelDna.socialStyle || '—'}</p>
                </div>
              </div>
            </div>

            {travelDna.summary && (
              <p className="text-sm text-base-content/80 font-medium leading-relaxed italic bg-base-200 rounded-xl p-4 mb-4">
                "{travelDna.summary}"
              </p>
            )}

            <div className="flex gap-2">
              <Link
                to="/quiz"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-brand-vibrant text-white shadow-sm shadow-brand-vibrant/20 hover:bg-emerald-600 transition-colors"
              >
                <Sparkles size={12} /> Retake Quiz
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {!travelDna && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="bg-base-100 rounded-xl border border-base-300/60 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] overflow-hidden"
        >
          <div className="p-6">
            <div className="p-5 bg-warning/10 rounded-xl border border-warning/20 text-center mb-4">
              <AlertCircle size={24} className="text-warning mx-auto mb-2" />
              <p className="text-sm text-warning font-medium mb-3">No Travel DNA yet — take the quiz to unlock personalized matching.</p>
              <Link to="/quiz" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-vibrant text-white shadow-md shadow-brand-vibrant/25 hover:bg-emerald-600 transition-colors">
                <Sparkles size={14} /> Take Travel DNA Quiz
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {(profile?.interests?.length > 0 || profile?.meetPreferences?.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="bg-base-100 rounded-xl border border-base-300/60 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] overflow-hidden"
        >
          <div className="p-6">
            {profile.interests?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-bold text-base-content/40 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <ListChecks size={12} /> Interests
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <span key={interest} className="px-3 py-1.5 rounded-full text-xs font-bold border border-base-300 text-base-content/80 bg-base-200/50">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile.meetPreferences?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-base-content/40 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <ShieldCheck size={12} /> Looking to Meet
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.meetPreferences.map((pref) => (
                    <span key={pref} className="px-3 py-1.5 rounded-full text-xs font-bold border border-brand-vibrant/20 text-brand-vibrant bg-brand-vibrant/5">
                      {pref}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="bg-base-100 rounded-xl border border-base-300/60 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] overflow-hidden"
      >
        <div className="p-6">
          <h4 className="text-sm font-black text-base-content flex items-center gap-2 mb-4">
            <ShieldCheck size={16} className="text-brand-vibrant" /> Trust & Visibility
          </h4>
          <div className="space-y-2.5">
            {trustSignals.map((signal) => (
              <div key={signal.label} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${signal.active ? 'bg-success/5 border-success/20' : 'bg-base-200/50 border-base-300/50'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${signal.active ? 'bg-success/10' : 'bg-base-200'}`}>
                  <signal.icon size={14} className={signal.active ? 'text-success' : 'text-base-content/40'} />
                </div>
                <p className={`text-xs font-medium ${signal.active ? 'text-success' : 'text-base-content/60'}`}>{signal.label}</p>
                {signal.active && <CheckCircle2 size={14} className="text-emerald-500 ml-auto shrink-0" />}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-base-content/40 font-medium">
            {profile?.visible !== false ? (
              <>
                <Eye size={12} /> Profile visible to other travellers
              </>
            ) : (
              <>
                <EyeOff size={12} /> Profile hidden from other travellers
              </>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
        className="bg-base-100 rounded-xl border border-base-300/60 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] overflow-hidden"
      >
        <div className="p-6">
          <h4 className="text-sm font-black text-base-content flex items-center gap-2 mb-4">
            <User size={16} className="text-brand-vibrant" /> Buddy Preview
          </h4>
          <p className="text-xs text-base-content/60 font-medium mb-4">This is how other travellers will see your profile.</p>
          <div className="p-5 bg-base-200 rounded-xl border border-base-300/50">
            <div className="flex items-center gap-3 mb-3">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt={`${displayName}'s profile photo`} className="w-12 h-12 rounded-xl object-cover border border-base-300" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-vibrant/10 to-emerald-500/10 flex items-center justify-center">
                  <span className="text-sm font-black text-brand-vibrant">{getInitials(displayName)}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base-content text-sm truncate">{displayName}</p>
                {displayHome && (
                  <p className="text-xs text-base-content/40 font-medium truncate">{displayHome}</p>
                )}
              </div>
              {hasEmail && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-success bg-success/10 border border-success/30">
                  <CheckCircle2 size={8} /> Verified
                </span>
              )}
            </div>
            {travelDna && (
              <div className="flex items-center gap-2 text-xs text-base-content/60 font-medium">
                <Target size={12} className="text-brand-vibrant" />
                <span className="capitalize">{travelDna.adventureLevel || '—'}</span>
                <span className="text-base-content/30">·</span>
                <Heart size={12} className="text-emerald-500" />
                <span className="capitalize">{travelDna.socialStyle || '—'}</span>
              </div>
            )}
            {profile?.interests?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {profile.interests.slice(0, 3).map((interest) => (
                  <span key={interest} className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-base-300 text-base-content/60 bg-base-100">
                    {interest}
                  </span>
                ))}
                {profile.interests.length > 3 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-base-content/40">+{profile.interests.length - 3}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
