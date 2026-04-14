import { useState } from 'react';
import { Star, X, Upload, Plus, Minus } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

const VENUE_TYPES = ['restaurant', 'hotel', 'attraction', 'transport', 'other'];
const PRESET_TAGS = [
  'Quiet', 'Crowded', 'Solo-friendly', 'Safe', 'Accessible',
  'Budget-friendly', 'Mid-range', 'Luxury', 'Local food',
  'International cuisine', 'Counter seating', 'Group tables'
];

const ReviewForm = ({ destination, venueName, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    destination: destination || '',
    venueName: venueName || '',
    venueAddress: '',
    venueType: 'restaurant',
    overallRating: 0,
    soloFriendlyRating: 0,
    safetyRating: 0,
    valueRating: 0,
    title: '',
    content: '',
    tags: [],
    customTag: ''
  });

  const handleRating = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const addCustomTag = () => {
    if (formData.customTag.trim() && !formData.tags.includes(formData.customTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.customTag.trim()],
        customTag: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.overallRating === 0) {
      toast.error('Please provide an overall rating');
      return;
    }

    if (formData.title.length < 5) {
      toast.error('Title must be at least 5 characters');
      return;
    }

    if (formData.content.length < 50) {
      toast.error('Review must be at least 50 characters');
      return;
    }

    setLoading(true);
    try {
      await api.post('/reviews', formData);
      toast.success('Review submitted! Thank you.');
      onSuccess?.();
      onClose?.();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ value, onChange, label }) => (
    <div>
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star === value ? 0 : star)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star
              size={24}
              className={star <= value ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-base-100 p-6 border-b flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Write a Review</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Venue Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination
              </label>
              <input
                type="text"
                value={formData.destination}
                onChange={e => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                placeholder="e.g., Tokyo, Japan"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-vibrant focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Venue Name
              </label>
              <input
                type="text"
                value={formData.venueName}
                onChange={e => setFormData(prev => ({ ...prev, venueName: e.target.value }))}
                placeholder="e.g., Ichiran Ramen"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-vibrant focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Venue Type
              </label>
              <select
                value={formData.venueType}
                onChange={e => setFormData(prev => ({ ...prev, venueType: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-vibrant focus:border-transparent"
              >
                {VENUE_TYPES.map(type => (
                  <option key={type} value={type} className="capitalize">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address (optional)
              </label>
              <input
                type="text"
                value={formData.venueAddress}
                onChange={e => setFormData(prev => ({ ...prev, venueAddress: e.target.value }))}
                placeholder="Full address"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-vibrant focus:border-transparent"
              />
            </div>
          </div>

          {/* Ratings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Your Ratings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StarRating
                value={formData.overallRating}
                onChange={(v) => handleRating('overallRating', v)}
                label="Overall Rating *"
              />
              <StarRating
                value={formData.soloFriendlyRating}
                onChange={(v) => handleRating('soloFriendlyRating', v)}
                label="Solo-Friendly"
              />
              <StarRating
                value={formData.safetyRating}
                onChange={(v) => handleRating('safetyRating', v)}
                label="Safety"
              />
              <StarRating
                value={formData.valueRating}
                onChange={(v) => handleRating('valueRating', v)}
                label="Value for Money"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Review Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Summarize your experience"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-vibrant focus:border-transparent"
              maxLength={100}
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Review *
            </label>
            <textarea
              value={formData.content}
              onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Share your experience with other solo travelers. What made it good or bad for solo visitors?"
              rows={6}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-vibrant focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.content.length}/50 minimum characters
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (select all that apply)
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    formData.tags.includes(tag)
                      ? 'bg-brand-vibrant text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.customTag}
                onChange={e => setFormData(prev => ({ ...prev, customTag: e.target.value }))}
                placeholder="Add custom tag"
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-vibrant focus:border-transparent text-sm"
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomTag(); } }}
              />
              <button
                type="button"
                onClick={addCustomTag}
                className="px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || formData.overallRating === 0}
              className="flex-1 px-6 py-3 bg-brand-vibrant text-white rounded-xl font-medium hover:bg-brand-vibrant/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
