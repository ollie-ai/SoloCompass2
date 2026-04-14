import { useState, useEffect } from 'react';
import { X, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import api from '../lib/api';

const typeConfig = {
  info: {
    bg: 'bg-sky-500',
    icon: Info,
    borderColor: 'border-sky-500/30'
  },
  warning: {
    bg: 'bg-amber-500',
    icon: AlertTriangle,
    borderColor: 'border-amber-500/30'
  },
  critical: {
    bg: 'bg-red-500',
    icon: AlertCircle,
    borderColor: 'border-red-500/30'
  }
};

const AnnouncementBanner = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [dismissedIds, setDismissedIds] = useState(() => {
    const saved = localStorage.getItem('dismissedAnnouncements');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get('/admin/announcements/public');
      if (response.data.success && response.data.data) {
        const active = response.data.data.filter(
          a => !dismissedIds.includes(a.id)
        );
        setAnnouncements(active);
      }
    } catch (error) {
      // Silently fail - announcements are non-critical
    }
  };

  const handleDismiss = (id) => {
    const newDismissed = [...dismissedIds, id];
    setDismissedIds(newDismissed);
    localStorage.setItem('dismissedAnnouncements', JSON.stringify(newDismissed));
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  if (announcements.length === 0) return null;

  return (
    <div className="fixed top-[64px] left-0 right-0 z-40 space-y-2 px-4 pt-3 pointer-events-none">
      {announcements.map((announcement) => {
        const config = typeConfig[announcement.type] || typeConfig.info;
        const Icon = config.icon;

        return (
          <div
            key={announcement.id}
            className={`
              pointer-events-auto
              max-w-4xl mx-auto
              flex items-start gap-3
              px-4 py-3
              ${config.bg} text-white
              rounded-xl shadow-lg
              border ${config.borderColor}
            `}
          >
            <Icon size={20} className="shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              {announcement.title && (
                <p className="font-bold text-sm">{announcement.title}</p>
              )}
              <p className="text-sm opacity-90">{announcement.message}</p>
            </div>
            <button
              onClick={() => handleDismiss(announcement.id)}
              className="shrink-0 p-1 hover:bg-white/20 rounded-lg transition-colors"
              title="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default AnnouncementBanner;