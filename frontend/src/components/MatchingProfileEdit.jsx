import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Camera, User, AlertCircle, Sparkles, Users, Shield, Globe, MapPin, Utensils, Camera as CameraIcon, Building, Moon, Trees, ShoppingBag, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

import { ACTIVITY_INTERESTS, VIBE_INTERESTS } from '../constants/interests';

const MEET_OPTIONS = ['Solo travellers', 'Couples open to solo meetups', 'Digital nomads', 'Long-term travellers', 'Weekend explorers'];
const COMFORT_OPTIONS = ['Open to anyone', 'Prefer similar travel style', 'Only verified profiles'];

export default function MatchingProfileEdit({ profile, onClose, onSave }) {
  const [form, setForm] = useState({
    displayName: profile?.displayName || '',
    bio: profile?.bio || '',
    interests: profile?.interests || [],
    meetPreferences: profile?.meetPreferences || [],
    comfortLevel: profile?.comfortLevel || 'Open to anyone',
    visible: profile?.visible ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatarUrl || null);
  const [hasChanges, setHasChanges] = useState(false);
  const initialFormRef = useRef(form);
  const modalRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  useEffect(() => {
    setHasChanges(JSON.stringify(form) !== JSON.stringify(initialFormRef.current));
  }, [form]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, avatarUrl: avatarPreview };
      await api.put('/matching/profile', payload);
      // Refresh user to sync name/avatar across app
      const { refreshUser } = useAuthStore.getState();
      await refreshUser();
      onSave?.(payload);
      onClose();
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
    setSaving(false);
  };

  const handleAvatarClick = () => {
    if (uploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size too large (max 2MB)');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await api.post('/matching/avatar/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data.success) {
        setAvatarPreview(res.data.data.avatarUrl);
        setHasChanges(true);
        toast.success('Avatar uploaded');
      }
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const toggleInterest = (interest) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const toggleMeetOption = (option) => {
    setForm(prev => ({
      ...prev,
      meetPreferences: prev.meetPreferences.includes(option)
        ? prev.meetPreferences.filter(o => o !== option)
        : [...prev.meetPreferences, option]
    }));
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const travelDna = profile?.travelDna || profile?.quizResult;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
        ref={modalRef}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="bg-base-100 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-base-100/80 backdrop-blur-md z-10 px-6 py-4 border-b border-base-300/50 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-base-content">Edit Travel Profile</h2>
              <p className="text-xs text-base-content/60 font-medium mt-0.5">This is the identity other travellers use to understand your style</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-base-200 rounded-xl transition-colors" aria-label="Close" title="Close">
              <X size={20} className="text-base-content/40" />
            </button>
          </div>

          <div className="p-6 space-y-8">
            <div>
              <h3 className="text-sm font-black text-base-content uppercase tracking-wider mb-4 flex items-center gap-2">
                <User size={16} className="text-brand-vibrant" /> Identity
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-xl bg-slate-900 flex items-center justify-center overflow-hidden border-2 border-base-300/50 relative">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Your profile photo" className={`w-full h-full object-cover ${uploading ? 'opacity-40' : ''}`} />
                      ) : (
                        <span className="text-xl font-black text-brand-vibrant">
                          {getInitials(form.displayName || profile?.name)}
                        </span>
                      )}
                      {uploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="w-5 h-5 border-2 border-brand-vibrant border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={handleAvatarClick}
                      disabled={uploading}
                      className="absolute -bottom-1 -right-1 w-6 h-6 bg-brand-vibrant rounded-lg flex items-center justify-center text-white shadow-md hover:bg-emerald-600 transition-colors disabled:opacity-50"
                    >
                      <Camera size={12} />
                    </button>
                    <input 
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-base-content/60 mb-1">Display Name</label>
                    <input
                      type="text"
                      value={form.displayName}
                      onChange={(e) => setForm(prev => ({ ...prev, displayName: e.target.value }))}
                      placeholder="How should others see you?"
                      className="w-full px-4 py-2.5 rounded-xl border border-base-300 text-sm font-medium text-base-content/80 outline-none focus:ring-2 focus:ring-brand-vibrant/20 focus:border-brand-vibrant bg-base-200/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-base-content/60 mb-1">Public Bio</label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm(prev => ({ ...prev, bio: e.target.value.slice(0, 200) }))}
                    placeholder="Tell fellow travellers about yourself..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-base-300 text-sm font-medium text-base-content/80 outline-none focus:ring-2 focus:ring-brand-vibrant/20 focus:border-brand-vibrant bg-base-200/50 resize-none"
                  />
                  <p className={`text-xs font-medium mt-1 text-right ${form.bio.length >= 180 ? 'text-warning' : 'text-base-content/40'}`}>
                    {form.bio.length}/200
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black text-base-content uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles size={16} className="text-brand-vibrant" /> Travel DNA
              </h3>
              {travelDna ? (
                <div className="bg-base-200/80 rounded-xl border border-base-300/50 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-vibrant/10 flex items-center justify-center">
                      <span className="text-sm font-black text-brand-vibrant">{travelDna.adventureLevel || '—'}</span>
                    </div>
                    <div>
                      <p className="text-xs text-base-content/60 font-medium">Adventure Level</p>
                      <p className="text-sm font-bold text-base-content capitalize">{travelDna.adventureLevel || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <Users size={18} className="text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-xs text-base-content/60 font-medium">Social Style</p>
                      <p className="text-sm font-bold text-base-content capitalize">{travelDna.socialStyle || 'Not set'}</p>
                    </div>
                  </div>
                  {travelDna.summary && (
                    <p className="text-xs text-base-content/80 font-medium leading-relaxed italic border-t border-base-300/50 pt-3">
                      "{travelDna.summary}"
                    </p>
                  )}
                  <p className="text-[10px] text-base-content/40 font-medium flex items-center gap-1">
                    <AlertCircle size={10} /> Your Travel DNA is generated from your quiz responses. Retake the quiz to update.
                  </p>
                  <Link to="/quiz" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-brand-vibrant hover:text-success hover:bg-brand-vibrant/5 transition-all">
                    <Sparkles size={14} /> Retake Travel DNA Quiz
                  </Link>
                </div>
              ) : (
                <div className="bg-warning/10/80 rounded-xl border border-warning/20 p-4 text-center">
                  <p className="text-xs text-warning font-medium mb-3">No Travel DNA yet — take the quiz to generate it.</p>
                  <Link to="/quiz" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-brand-vibrant text-white shadow-md shadow-brand-vibrant/25 hover:bg-emerald-600 transition-colors">
                    <Sparkles size={14} /> Take Travel DNA Quiz
                  </Link>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-black text-base-content uppercase tracking-wider mb-4 flex items-center gap-2">
                <Heart size={16} className="text-brand-vibrant" /> Interests
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-base-content/40 uppercase tracking-wider mb-2">Activities</p>
                  <div className="flex flex-wrap gap-2">
                    {ACTIVITY_INTERESTS.map(({ value, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => toggleInterest(value)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                          form.interests.includes(value)
                            ? 'border-brand-vibrant text-brand-vibrant bg-brand-vibrant/5'
                            : 'border-base-300 text-base-content/60 hover:border-brand-vibrant hover:text-brand-vibrant hover:bg-brand-vibrant/5'
                        }`}
                      >
                        <Icon size={12} /> {value}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-base-content/40 uppercase tracking-wider mb-2">Vibes</p>
                  <div className="flex flex-wrap gap-2">
                    {VIBE_INTERESTS.map(({ value, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => toggleInterest(value)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                          form.interests.includes(value)
                            ? 'border-brand-vibrant text-brand-vibrant bg-brand-vibrant/5'
                            : 'border-base-300 text-base-content/60 hover:border-brand-vibrant hover:text-brand-vibrant hover:bg-brand-vibrant/5'
                        }`}
                      >
                        <Icon size={12} /> {value}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black text-base-content uppercase tracking-wider mb-4 flex items-center gap-2">
                <Users size={16} className="text-brand-vibrant" /> Matching Preferences
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-base-content/60 mb-2">Who would you like to meet?</p>
                  <div className="flex flex-wrap gap-2">
                    {MEET_OPTIONS.map(option => (
                      <button
                        key={option}
                        onClick={() => toggleMeetOption(option)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                          form.meetPreferences.includes(option)
                            ? 'border-brand-vibrant text-brand-vibrant bg-brand-vibrant/5'
                            : 'border-base-300 text-base-content/60 hover:border-brand-vibrant hover:text-brand-vibrant hover:bg-brand-vibrant/5'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-base-content/60 mb-2">Comfort level</p>
                  <select
                    value={form.comfortLevel}
                    onChange={(e) => setForm(prev => ({ ...prev, comfortLevel: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-base-300 text-sm font-medium text-base-content/80 outline-none focus:ring-2 focus:ring-brand-vibrant/20 focus:border-brand-vibrant bg-base-200/50"
                  >
                    {COMFORT_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black text-base-content uppercase tracking-wider mb-4 flex items-center gap-2">
                <Shield size={16} className="text-brand-vibrant" /> Visibility
              </h3>
              <div className="bg-base-200/80 rounded-xl border border-base-300/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-base-content">Visible in buddy matching</p>
                    <p className="text-xs text-base-content/60 font-medium mt-0.5">When off, other travellers won't see your profile in search results.</p>
                  </div>
                  <button
                    onClick={() => setForm(prev => ({ ...prev, visible: !prev.visible }))}
                    className={`relative w-12 h-7 rounded-full transition-colors ${form.visible ? 'bg-brand-vibrant' : 'bg-base-300'}`}
                  >
                    <span className={`absolute top-0.5 w-6 h-6 bg-base-100 rounded-full shadow-sm transition-transform ${form.visible ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-base-100/80 backdrop-blur-md px-6 py-4 border-t border-base-300/50">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-base-100 border border-base-300 text-base-content/80 hover:border-base-300/70 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-brand-vibrant text-white shadow-md shadow-brand-vibrant/25 hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Travel Profile'}
              </button>
            </div>
            {hasChanges && (
              <p className="text-[10px] font-bold text-brand-vibrant uppercase tracking-wider text-center mt-2 animate-pulse">
                Unsaved changes
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
