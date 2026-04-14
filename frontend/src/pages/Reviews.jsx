import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Star, Filter, ChevronDown, Loader2, Users, MessageSquare, Heart, Shield, Sparkles, MapPin, Search } from 'lucide-react';
import ReviewCard from '../components/ReviewCard';
import ReviewForm from '../components/ReviewForm';
import TripBuddies from '../components/TripBuddies';
import Button from '../components/Button';
import api from '../lib/api';

const Community = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('reviews'); // 'reviews' or 'buddies'
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    destination: '',
    venueType: '',
    minRating: '',
    soloOnly: false,
    sort: 'newest'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalCount: 0
  });

  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchReviews();
    }
  }, [activeTab, filters]);

  useEffect(() => {
    const destinationParam = searchParams.get('destination');
    if (destinationParam && !showForm) {
      setFilters(prev => ({ ...prev, destination: destinationParam }));
      setShowForm(true);
    }
  }, [searchParams]);

  const fetchReviews = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sort: filters.sort
      });

      if (filters.destination) params.append('destination', filters.destination);
      if (filters.venueType) params.append('venue_type', filters.venueType);
      if (filters.minRating) params.append('min_rating', filters.minRating);
      if (filters.soloOnly) params.append('solo_only', 'true');

      const response = await api.get(`/reviews?${params.toString()}`);
      setReviews(response.data.data.reviews || []);
      setStats(response.data.data.stats || null);
      setPagination({
        page: response.data.meta?.page || 1,
        totalPages: response.data.meta?.totalPages || 1,
        totalCount: response.data.meta?.totalCount || 0
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    fetchReviews(newPage);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={`star-${i}`}
        size={14}
        className={i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-base-content/20'}
      />
    ));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      {/* Header Hub */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8 border-b border-base-300/50 pb-10">
        <div>
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-vibrant/10 text-brand-vibrant text-[10px] font-black uppercase tracking-widest mb-4">
              The Solo Collective
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-base-content tracking-tight">Community <span className="text-gradient">Hub</span></h1>
           <p className="text-base-content/60 mt-2 font-medium text-lg leading-relaxed max-w-2xl">
             Share your experiences and find travel buddies for your next solo mission. 
             Built by solo travelers, for solo travelers.
           </p>
        </div>
        
        <div className="flex bg-base-200 p-1.5 rounded-xl">
           <button 
             onClick={() => setActiveTab('reviews')}
             className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black transition-all ${
               activeTab === 'reviews' 
                 ? 'bg-base-100 text-brand-vibrant shadow-sm shadow-slate-200' 
                 : 'text-base-content/60 hover:text-base-content/80'
             }`}
           >
             <MessageSquare size={18} /> Reviews
           </button>
           <button 
             onClick={() => setActiveTab('buddies')}
             className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black transition-all ${
               activeTab === 'buddies' 
                 ? 'bg-base-100 text-brand-vibrant shadow-sm shadow-slate-200' 
                 : 'text-base-content/60 hover:text-base-content/80'
             }`}
           >
             <Users size={18} /> Buddies
           </button>
        </div>
      </div>

      {activeTab === 'reviews' ? (
        <div className="grid lg:grid-cols-3 gap-10">
           {/* Review Sidebar Stats */}
           <div className="space-y-8">
              {stats && (
                 <div className="glass-card p-8 rounded-xl bg-brand-deep text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-vibrant/10 blur-3xl rounded-full"></div>
                    <h3 className="text-xl font-black mb-8">Overall Sentiment</h3>
                    <div className="space-y-6">
                       <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white/50">Total Reviews</span>
                          <span className="text-2xl font-black">{stats.count || 0}</span>
                       </div>
                       <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-white/50">
                            Rating <span>{stats.averageRating || 0}/5</span>
                         </div>
                         <div className="flex gap-1">{renderStars(stats.averageRating)}</div>
                      </div>
                      <div className="pt-6 border-t border-white/5 space-y-4">
                         <div className="flex items-center justify-between text-sm">
                            <span className="font-bold text-white/40">Solo-Friendly Avg.</span>
                            <div className="flex gap-1">{renderStars(stats.soloFriendlyAvg)}</div>
                         </div>
                         <div className="flex items-center justify-between text-sm">
                            <span className="font-bold text-white/40">Safety Index</span>
                            <div className="flex gap-1">{renderStars(stats.safetyAvg)}</div>
                         </div>
                      </div>
                   </div>
                </div>
              )}
              
              <div className="glass-card p-8 rounded-xl">
                 <Sparkles className="text-brand-vibrant mb-6" size={32} />
                 <h4 className="text-xl font-black text-base-content mb-4">Why Review?</h4>
                 <p className="text-sm text-base-content/60 leading-relaxed font-medium mb-8">
                   Solo travel is built on community trust. Your review helps others find safe stays, welcoming restaurants, and trustworthy transport.
                 </p>
                 <Button 
                   onClick={() => setShowForm(true)}
                   variant="primary" 
                   className="w-full rounded-xl py-4 font-black btn-premium shadow-xl shadow-brand-vibrant/10"
                 >
                   Write a Review
                 </Button>
              </div>
           </div>

           {/* Review Feed */}
           <div className="lg:col-span-2 space-y-8">
              {/* Filters Top Bar */}
              <div className="flex flex-col md:flex-row gap-4 p-4 glass-card rounded-xl border border-base-300/50 shadow-sm">
                 <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40" size={18} />
                    <input
                      type="text"
                      placeholder="Search destination..."
                      value={filters.destination}
                      onChange={e => handleFilterChange('destination', e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-base-300 outline-none focus:ring-2 focus:ring-brand-vibrant shadow-inner bg-base-200/50"
                    />
                 </div>
                  <div className="flex gap-2">
                     <select
                       value={filters.venueType}
                       onChange={e => handleFilterChange('venueType', e.target.value)}
                       className="px-4 py-3 rounded-xl border border-base-300 font-bold text-base-content/80 outline-none focus:ring-2 focus:ring-brand-vibrant bg-base-100"
                     >
                       <option value="">Categories</option>
                       <option value="restaurant">Dining</option>
                       <option value="hotel">Hotels</option>
                       <option value="attraction">Picks</option>
                     </select>
                     <select
                       value={filters.sort}
                       onChange={e => handleFilterChange('sort', e.target.value)}
                       className="px-4 py-3 rounded-xl border border-base-300 font-bold text-base-content/80 outline-none focus:ring-2 focus:ring-brand-vibrant bg-base-100"
                     >
                       <option value="newest">Newest</option>
                       <option value="highest">Highest Rated</option>
                       <option value="lowest">Lowest Rated</option>
                     </select>
                     <button
                      onClick={() => handleFilterChange('soloOnly', !filters.soloOnly)}
                      className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest border transition-all ${
                        filters.soloOnly 
                          ? 'bg-brand-vibrant text-white border-brand-vibrant shadow-lg shadow-brand-vibrant/20' 
                          : 'border-base-300 text-base-content/60 hover:bg-base-200'
                      }`}
                    >
                      Solo Verified
                    </button>
                 </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-base-content/30">
                  <div className="w-12 h-12 border-4 border-base-300/50 border-t-brand-vibrant rounded-full animate-spin mb-4" />
                  <p className="font-bold">Syncing collection...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="p-20 text-center glass-card rounded-xl">
                   <div className="w-20 h-20 mx-auto mb-6 bg-brand-vibrant/10 rounded-full flex items-center justify-center">
                     <Sparkles className="w-10 h-10 text-brand-vibrant" />
                   </div>
                   <h3 className="text-xl font-black text-base-content mb-2">AI-Generated Insights from FCDO Data</h3>
                   <p className="text-base-content/60 font-medium mb-6 max-w-md mx-auto">
                     No user reviews yet for this destination. Our AI analyzes real-time FCDO travel advisories to provide vetted safety insights.
                   </p>
                   <div className="flex items-center justify-center gap-3 mb-6">
                     <div className="px-4 py-2 bg-base-200 rounded-full text-sm font-bold text-base-content/80">Safety Ratings</div>
                     <div className="px-4 py-2 bg-base-200 rounded-full text-sm font-bold text-base-content/80">Solo-Friendly</div>
                     <div className="px-4 py-2 bg-base-200 rounded-full text-sm font-bold text-base-content/80">Local Tips</div>
                   </div>
                   <Button variant="outline" onClick={() => handleFilterChange('destination', '')}>Clear Filters</Button>
                </div>
              ) : (
                <div className="space-y-6">
                   {reviews.map(review => (
                     <ReviewCard key={review.id} review={review} />
                   ))}
                   
                   {/* Pagination */}
                   {pagination.totalPages > 1 && (
                     <div className="flex items-center justify-center gap-4 pt-8">
                        <button
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page === 1}
                          className="px-6 py-3 rounded-xl border border-base-300 font-black text-base-content/40 hover:bg-base-200 disabled:opacity-50 transition-all"
                        >
                          Previous
                        </button>
                        <span className="text-sm font-black text-base-content/40">Page {pagination.page} / {pagination.totalPages}</span>
                        <button
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page === pagination.totalPages}
                          className="px-6 py-3 rounded-xl border border-base-300 font-black text-base-content/40 hover:bg-base-200 disabled:opacity-50 transition-all"
                        >
                          Next
                        </button>
                     </div>
                   )}
                </div>
              )}
           </div>
        </div>
      ) : (
        <div className="animate-slide-up">
           <TripBuddies hubMode={true} />
        </div>
      )}

      {/* Review Form Modal */}
      {showForm && (
        <ReviewForm
          destination={searchParams.get('destination')}
          onSuccess={() => {
            fetchReviews();
            setShowForm(false);
          }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default Community;
