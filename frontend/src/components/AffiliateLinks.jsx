import { useState, useEffect } from 'react';
import { Building2, Plane, Ticket, Shield, ShoppingBag, ExternalLink, Loader2, CheckCircle } from 'lucide-react';
import api from '../lib/api';

const AFFILIATE_CATEGORIES = [
  {
    id: 'hotels',
    name: 'Hotels',
    icon: Building2,
    color: 'bg-blue-500',
    getQuery: (destination) => ({ city: destination }),
    placeholder: 'Search hotels in destination'
  },
  {
    id: 'flights',
    name: 'Flights',
    icon: Plane,
    color: 'bg-info/100',
    getQuery: (destination) => ({ city: destination }),
    placeholder: 'Search flights to destination'
  },
  {
    id: 'tours',
    name: 'Tours & Activities',
    icon: Ticket,
    color: 'bg-success/100',
    getQuery: (destination) => ({ query: 'tours', location: destination }),
    placeholder: 'Search tours in destination'
  },
  {
    id: 'insurance',
    name: 'Travel Insurance',
    icon: Shield,
    color: 'bg-purple-500',
    getQuery: () => ({}),
    placeholder: 'Get travel insurance quotes'
  },
  {
    id: 'shopping',
    name: 'Travel Gear',
    icon: ShoppingBag,
    color: 'bg-warning/100',
    getQuery: () => ({ query: 'travel packing list' }),
    placeholder: 'Find travel essentials'
  }
];

const AffiliateLinks = ({ destination, compact = false }) => {
  const [links, setLinks] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({});

  useEffect(() => {
    if (destination) {
      fetchAffiliateLinks();
    }
  }, [destination]);

  const fetchAffiliateLinks = async () => {
    setLoading(true);
    setStatus({});

    try {
      // Get all affiliate links for this destination
      const response = await api.get('/affiliates/destination', {
        params: { city: destination }
      });

      if (response.data.success) {
        setLinks(response.data.data);
      }

      // Check affiliate status
      const statusResponse = await api.get('/affiliates/status');
      if (statusResponse.data.success) {
        setStatus(statusResponse.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch affiliate links:', err);
    } finally {
      setLoading(false);
    }
  };

  const getLinkUrl = (categoryId) => {
    switch (categoryId) {
      case 'hotels':
        return links.hotels;
      case 'flights':
        return links.flights;
      case 'tours':
        return links.tours;
      case 'insurance':
        return links.insurance;
      case 'shopping':
        return links.shopping;
      default:
        return null;
    }
  };

  const isConfigured = (categoryId) => {
    if (categoryId === 'shopping') return status.amazon;
    if (categoryId === 'insurance') return status.safetyWing;
    if (categoryId === 'tours') return status.viator;
    if (categoryId === 'flights') return status.aviasales;
    if (categoryId === 'hotels') return status.agoda;
    return false;
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-base-content/40 uppercase tracking-wider">Book</h4>
        <div className="grid grid-cols-2 gap-2">
          {AFFILIATE_CATEGORIES.slice(0, 4).map(cat => {
            const Icon = cat.icon;
            const url = getLinkUrl(cat.id);
            
            return (
              <a
                key={cat.id}
                href={url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 p-2 rounded-lg border ${
                  url ? 'border-base-300 hover:border-brand-vibrant' : 'border-base-300/50 opacity-50'
                } transition-colors`}
              >
                <div className={`w-6 h-6 rounded-md ${cat.color} flex items-center justify-center`}>
                  <Icon size={12} className="text-white" />
                </div>
                <span className="text-xs font-bold text-base-content/80 truncate">{cat.name}</span>
              </a>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-xl">
      <div className="flex items-center gap-2 text-brand-vibrant font-black uppercase text-[10px] tracking-[0.2em] mb-4">
        <ExternalLink size={14} /> Book Your Trip
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="text-brand-vibrant animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {AFFILIATE_CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const url = getLinkUrl(cat.id);
            const configured = isConfigured(cat.id);

            return (
              <a
                key={cat.id}
                href={url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                disabled={!url}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  url
                    ? 'border-base-300 hover:border-brand-vibrant hover:bg-brand-vibrant/5 cursor-pointer'
                    : 'border-base-300/50 bg-base-200 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl ${cat.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={24} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base-content">{cat.name}</h4>
                    {configured && (
                      <CheckCircle size={14} className="text-emerald-500" />
                    )}
                  </div>
                  <p className="text-sm text-base-content/60 truncate">
                    {url ? cat.placeholder : 'Not yet configured'}
                  </p>
                </div>
                {url && (
                  <ExternalLink size={18} className="text-base-content/40" />
                )}
              </a>
            );
          })}
        </div>
      )}

      {/* Affiliate Disclosure */}
      <p className="text-xs text-base-content/40 mt-4 text-center">
        We may earn a commission from these links at no extra cost to you.
      </p>
    </div>
  );
};

export default AffiliateLinks;
