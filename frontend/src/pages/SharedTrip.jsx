import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { 
  MapPin, 
  Calendar, 
  PoundSterling, 
  Plus,
  Sparkles,
  Navigation
} from 'lucide-react';

function SharedTrip() {
  const { shareCode } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSharedTrip();
  }, [shareCode]);

  const fetchSharedTrip = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/trips/shared/${shareCode}`);
      if (response.data?.data) {
        setTrip(response.data.data);
      } else {
        setError('Trip not found');
      }
    } catch (err) {
      console.error('Failed to fetch shared trip:', err);
      setError('This trip may not exist or the link has expired.');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'Sightseeing': return '📸';
      case 'Food & Dining': return '🍽️';
      case 'Transport': return '🚗';
      case 'Adventure': return '⚡';
      case 'Cultural': return '🏛️';
      case 'Relaxation': return '☕';
      case 'Nightlife': return '🌙';
      default: return '📍';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-vibrant/20 border-t-brand-vibrant rounded-full animate-spin mx-auto mb-4" />
          <p className="text-base-content/60 font-medium">Loading trip...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100 px-4">
        <div className="glass-card p-10 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">😕</span>
          </div>
          <h1 className="text-2xl font-black text-base-content mb-3">Trip Not Found</h1>
          <p className="text-base-content/60 font-medium mb-8">
            {error || "This shared trip link may be invalid or has expired."}
          </p>
          <Link 
            to="/trips/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-vibrant text-white rounded-xl font-black hover:bg-brand-vibrant/90 transition-all"
          >
            <Plus size={18} /> Create Your Own Trip
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const totalCost = trip.itinerary?.reduce((sum, day) => 
    sum + (day.activities?.reduce((daySum, act) => daySum + Number(act.cost || 0), 0) || 0), 0
  ) || 0;

  return (
    <div className="min-h-screen bg-base-100 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <p className="text-sm font-bold text-base-content/40 uppercase tracking-widest mb-3">
            This trip is shared by <span className="text-brand-vibrant">{trip.owner_name || 'a traveler'}</span>
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-base-content tracking-tight mb-4">
            {trip.name}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-base-200 rounded-full">
              <MapPin size={16} className="text-brand-vibrant" />
              <span className="font-bold text-base-content">{trip.destination}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-base-200 rounded-full">
              <Calendar size={16} className="text-indigo-500" />
              <span className="font-bold text-base-content">
                {formatDate(trip.start_date)} — {formatDate(trip.end_date)}
              </span>
            </div>
            {trip.budget > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-base-200 rounded-full">
                <PoundSterling size={16} className="text-emerald-500" />
                <span className="font-bold text-base-content">£{trip.budget?.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center mb-12">
          <Link 
            to="/trips/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-vibrant text-white rounded-xl font-black hover:bg-brand-vibrant/90 transition-all shadow-lg shadow-brand-vibrant/20"
          >
            <Plus size={18} /> Create Your Own Trip
          </Link>
        </div>

        {trip.notes && (
          <div className="glass-card p-8 rounded-2xl shadow-lg mb-10">
            <h2 className="text-lg font-black text-base-content mb-3">Planning Notes</h2>
            <p className="text-base-content/70 font-medium leading-relaxed italic">"{trip.notes}"</p>
          </div>
        )}

        {trip.itinerary && trip.itinerary.length > 0 && (
          <div className="space-y-10">
            <h2 className="text-2xl font-black text-base-content text-center">Daily Itinerary</h2>
            
            {trip.itinerary.map((day, dIdx) => (
              <div key={day.id || dIdx} className="relative pl-8 border-l-2 border-base-content/10">
                <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-brand-vibrant border-4 border-base-100 z-10" />
                
                <div className="mb-6">
                  <h3 className="text-2xl font-black text-base-content flex items-baseline gap-3">
                    Day {day.day_number}
                    {day.date && (
                      <span className="text-sm font-bold text-base-content/40">
                        — {new Date(day.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </h3>
                  {day.notes && (
                    <p className="text-brand-accent font-bold text-sm mt-2">{day.notes}</p>
                  )}
                </div>

                <div className="space-y-4">
                  {day.activities?.length > 0 ? (
                    day.activities.map((activity, aIdx) => (
                      <div 
                        key={activity.id || aIdx} 
                        className="glass-card p-6 rounded-xl border border-base-content/5 hover:shadow-lg transition-all"
                      >
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="w-12 h-12 rounded-xl bg-base-200 flex items-center justify-center text-2xl flex-shrink-0">
                            {getActivityIcon(activity.type)}
                          </div>
                          
                          <div className="flex-1 space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-xl font-extrabold text-base-content">{activity.name}</h4>
                                <p className="text-sm font-bold text-base-content/40 flex items-center gap-1 mt-1">
                                  <MapPin size={14} /> {activity.location}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-black text-base-content">{activity.time || 'Flexible'}</p>
                                {activity.duration_hours && (
                                  <p className="text-xs font-bold text-base-content/40">{activity.duration_hours}h</p>
                                )}
                              </div>
                            </div>
                            
                            {activity.description && (
                              <p className="text-sm text-base-content/70 font-medium leading-relaxed">
                                {activity.description}
                              </p>
                            )}
                            
                            <div className="flex flex-wrap items-center gap-4 pt-2">
                              {activity.cost > 0 && (
                                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-success/10 text-success text-xs font-black">
                                  <PoundSterling size={12} /> {activity.cost}
                                </div>
                              )}
                              <a 
                                href={`https://www.google.com/maps/search/${encodeURIComponent(activity.name + ' ' + activity.location)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-black text-brand-vibrant hover:underline flex items-center gap-1"
                              >
                                <Navigation size={12} /> View Map
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-base-content/40 font-medium italic">No activities planned yet.</p>
                  )}
                </div>
              </div>
            ))}

            {totalCost > 0 && (
              <div className="glass-card p-6 rounded-xl text-center">
                <p className="text-base-content/60 font-medium">Estimated total cost</p>
                <p className="text-3xl font-black text-brand-vibrant">£{totalCost.toLocaleString()}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-12 pt-10 border-t border-base-content/10 text-center">
          <Link 
            to="/trips/new"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-vibrant text-white rounded-xl font-black hover:bg-brand-vibrant/90 transition-all shadow-xl shadow-brand-vibrant/20 text-lg"
          >
            <Sparkles size={20} /> Create Your Own Trip
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SharedTrip;