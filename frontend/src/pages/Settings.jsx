import { useState, useEffect, useMemo, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Skeleton from '../components/Skeleton';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { User, Shield, Bell, CreditCard, Zap } from 'lucide-react';
import VerificationModal from '../components/VerificationModal';
import DashboardShell from '../components/dashboard/DashboardShell';
import PageHeader from '../components/PageHeader';
import { useI18n } from '../i18n/I18nProvider';

const EASE = [0.16, 1, 0.3, 1];
const cardClass = "glass-card p-6 rounded-3xl border border-base-300/50";

function LanguagePreference() {
  const { locale, setLocale, t, supportedLocales } = useI18n();
  return (
    <div className={cardClass}>
      <div className="p-6 border-b border-base-300/50 flex items-center justify-between">
        <h3 className="text-base font-black text-base-content flex items-center gap-2">
          <Globe size={16} className="text-brand-vibrant" /> {t('settings.language')}
        </h3>
      </div>
      <div className="p-6">
        <p className="text-sm text-base-content/60 mb-4">{t('settings.languageDesc')}</p>
        <div className="flex gap-3">
          {supportedLocales.map((code) => (
            <button
              key={code}
              onClick={() => setLocale(code)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                locale === code
                  ? 'bg-brand-vibrant text-white border-brand-vibrant shadow-md shadow-brand-vibrant/20'
                  : 'border-base-300 text-base-content/60 hover:border-brand-vibrant/40 hover:text-base-content'
              }`}
            >
              {t(`locale.${code}`)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const Settings = () => {
  const { user, updateUser, logout, refreshUser, initialized } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    home_city: '',
    bio: '',
    travel_style: 'moderate',
    interests: [],
  });
  const [soloId, setSoloId] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [initialFormData, setInitialFormData] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null });
  const defaultNotifPrefs = {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    checkinReminders: true,
    checkinMissed: true,
    checkinEmergency: true,
    tripReminders: true,
    buddyRequests: true,
    budgetAlerts: true,
    reminderMinutesBefore: 15
  };

  const [notifPrefs, setNotifPrefs] = useState({ ...defaultNotifPrefs });
  const [savingNotifPrefs, setSavingNotifPrefs] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showAccountDeletionModal, setShowAccountDeletionModal] = useState(false);

  useEffect(() => {
    if (initialized && user?.id) {
      fetchUser();
      fetchSubscriptionStatus();
      fetchNotifPrefs();
      fetchSoloId();
    }
  }, [user?.id, initialized]);

  useEffect(() => {
    if (searchParams.get('tab') === 'notifications') {
      setActiveTab('notifications');
    }

    if (searchParams.get('payment') === 'success') {
      toast.success('Subscription activated! Welcome to SoloCompass Premium.');
      refreshUser();
      navigate('/settings?tab=billing', { replace: true });
    } else if (searchParams.get('payment') === 'cancel') {
      toast.error('Payment was cancelled. Your plan has not changed.');
      navigate('/settings?tab=billing', { replace: true });
    }
  }, [searchParams]);

  const fetchUser = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);

      const response = await api.get(`/users/${user.id}`);
      const userData = response.data.data.user;
      const newFormData = {
        name: userData.name || '',
        bio: userData.bio || '',
        phone: userData.phone || '',
        home_city: userData.home_city || '',
        travel_style: userData.travel_style || 'moderate',
        interests: userData.interests || [],
      };
      setFormData(newFormData);
      setInitialFormData(newFormData);
    } catch (err) {
      console.error('Failed to fetch user:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSoloId = async () => {
    try {
      const res = await api.get('/matching/solo-id');
      setSoloId(res.data.data);
    } catch (err) {
      console.error('Failed to fetch Solo ID:', err);
    }
  };

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await api.get('/billing/subscription-status');
      setSubscriptionStatus(response.data.data);
    } catch (err) {
      console.error('Failed to fetch subscription status:', err);
    }
  };

  const fetchNotifPrefs = async () => {
    try {
      const res = await api.get('/notifications/preferences');
      if (res.data.success) {
        setNotifPrefs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch notification preferences:', err);
    }
  };

  const handleSaveNotifPrefs = async () => {
    setSavingNotifPrefs(true);
    try {
      const res = await api.put('/notifications/preferences', notifPrefs);
      if (res.data.success) {
        toast.success('Notification preferences saved');
        setLastSaved(new Date());
      } else {
        toast.error(res.data.error || 'Failed to save');
      }
    } catch (err) {
      console.error('Save prefs error:', err);
      toast.error(err.response?.data?.error || 'Failed to save notification preferences');
    } finally {
      setTimeout(() => setSavingNotifPrefs(false), 500);
    }
  };

  const handleResetNotifPrefs = () => {
    setNotifPrefs({ ...defaultNotifPrefs });
    toast.success('Reset to default preferences');
  };

  const handleCancelSubscription = () => {
    setConfirmDialog({
      open: true,
      action: 'cancel_subscription',
    });
  };

  const executeCancelSubscription = async () => {
    setLoadingSubscription(true);
    try {
      await api.post('/billing/cancel-subscription');
      toast.success('Subscription cancelled. You will retain access until the end of your billing period.');
      await refreshUser();
      await fetchSubscriptionStatus();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || err.response?.data?.error || 'Failed to cancel subscription');
    } finally {
      setLoadingSubscription(false);
      setConfirmDialog({ open: false, action: null });
    }
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
    const uploadData = new FormData();
    uploadData.append('avatar', file);

    try {
      // 1. Upload to matching service
      const res = await api.post('/matching/avatar/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        const newAvatarUrl = res.data.data.avatarUrl;

        // 2. Parallel update to both tables for instant consistency
        await Promise.all([
          api.put('/matching/profile', { avatarUrl: newAvatarUrl }),
          api.put(`/users/${user?.id}`, { avatar_url: newAvatarUrl })
        ]);

        // 3. Update local state
        setSoloId(prev => ({ ...prev, avatarUrl: newAvatarUrl }));
        setFormData(prev => ({ ...prev, avatar_url: newAvatarUrl }));

        toast.success('Avatar updated successfully');
        refreshUser();
      }
    } catch (err) {
      console.error('Avatar upload error:', err);
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const previewSoloId = useMemo(() => {
    if (!soloId) return null;
    return {
      ...soloId,
      name: formData.name || soloId.name,
      displayName: formData.name || soloId.displayName,
      homeCity: formData.home_city || soloId.homeCity,
      bio: formData.bio || soloId.bio,
      interests: formData.interests || soloId.interests,
    };
  }, [soloId, formData]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    if (formData.phone && formData.phone.length > 0 && !/^\+?[0-9\s\-()\.]{7,20}$/.test(formData.phone)) {
      setError('Please enter a valid phone number');
      setSaving(false);
      return;
    }

    try {
      // Execute both updates in parallel for atomic-like visibility
      const [userRes] = await Promise.all([
        // 1. Core User & Profile Data (Name, Phone, Bio, Home City)
        api.put(`/users/${user?.id}`, {
          name: formData.name,
          phone: formData.phone,
          bio: formData.bio,
          home_city: formData.home_city,
          interests: formData.interests
        }),
        // 2. Matching Engine Metadata (Syncing relevant fields)
        api.put('/matching/profile', {
          displayName: formData.name,
          bio: formData.bio,
          home_city: formData.home_city,
          interests: formData.interests
        })
      ]);

      updateUser(userRes.data.data.user);
      await fetchSoloId();
      setInitialFormData({ ...formData });
      setLastSaved(new Date());
      setSuccess('Profile identity unified and saved');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setSaving(false);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      setSaving(false);
      return;
    }

    try {
      await api.put(`/users/${user?.id}`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setSuccess('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    setConfirmDialog({ open: true, action: 'delete_account' });
  };

  const executeDeleteAccount = async () => {
    setSaving(true);
    try {
      await api.delete(`/users/${user?.id}`);
      setConfirmDialog({ open: false, action: null });
      await logout();
      navigate('/');
      import('react-hot-toast').then(toast => toast.default.success('Your account has been deleted.'));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete account');
    } finally {
      setSaving(false);
      setConfirmDialog({ open: false, action: null });
    }
  };

  const [exporting, setExporting] = useState(false);
  const handleExportData = async () => {
    setExporting(true);
    try {
      const response = await api.get('/account/data-export', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `solocompass-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      import('react-hot-toast').then(toast => toast.default.success('Data archive generated successfully!'));
    } catch (err) {
      import('react-hot-toast').then(toast => toast.default.error('Failed to generate archive.'));
    } finally {
      setExporting(false);
    }
  };

  const handleLogoutOtherDevices = async () => {
    try {
      await api.post('/auth/logout-other-devices');
      toast.success('Logged out all other devices');
    } catch (err) {
      toast.error('Failed to log out other devices');
    }
  };

  const hasUnsavedChanges = useMemo(() => {
    if (!initialFormData) return false;
    return Object.keys(initialFormData).some(key => formData[key] !== initialFormData[key]);
  }, [formData, initialFormData]);

  if (loading) return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-6 w-96 font-medium" />
        </div>
        <div className="grid lg:grid-cols-[280px_1fr] gap-10">
          <div className="space-y-4">
            <div className="glass-card h-64 rounded-3xl animate-pulse" />
          </div>
          <div className="space-y-8">
            <div className="glass-card h-96 rounded-3xl animate-pulse" />
            <div className="glass-card h-64 rounded-3xl animate-pulse" />
          </div>
        </div>
      </div>
    </DashboardShell>
  );

  const tabs = [
    { id: 'profile', label: 'Profile & Preferences', icon: User, desc: 'Manage your personal identity' },
    { id: 'security', label: 'Security', icon: Shield, desc: 'Protect your account' },
    { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Communication preferences' },
    { id: 'billing', label: 'Billing & Data', icon: CreditCard, desc: 'Plans, Export, and Privacy' },
  ];

  return (
    <DashboardShell>
      <SEO
        title="Account Settings"
        description="Manage your SoloCompass profile, security, notifications, and billing preferences."
      />

      {/* Cancel Subscription dialog */}
      <ConfirmDialog
        open={confirmDialog.open && confirmDialog.action === 'cancel_subscription'}
        onConfirm={executeCancelSubscription}
        onCancel={() => setConfirmDialog({ open: false, action: null })}
        title="Cancel Subscription?"
        description="You will lose access to premium features at the end of your current billing period. This cannot be undone until you re-subscribe."
        confirmLabel="Yes, Cancel"
        cancelLabel="Keep Subscription"
        variant="warning"
        loading={loadingSubscription}
      />

      {/* Delete Account dialog */}
      <ConfirmDialog
        open={confirmDialog.open && confirmDialog.action === 'delete_account'}
        onConfirm={executeDeleteAccount}
        onCancel={() => setConfirmDialog({ open: false, action: null })}
        title="Permanently Delete Account?"
        description="This will permanently delete your SoloCompass account and ALL associated trip data, itineraries, and account information. This action CANNOT be undone."
        confirmLabel="Delete My Account"
        cancelLabel="Keep Account"
        variant="danger"
        loading={saving}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <PageHeader
            title={<>Control <span className="text-gradient">Centre</span></>}
            subtitle="Manage your global identity, security protocols, and mission data."
            badge="Root Access"
            icon={Shield}
          />
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-8 lg:gap-12 items-start">
          <div className="space-y-4 sticky top-24">
            <div className="glass-card-dark p-2 rounded-3xl border-white/5 shadow-2xl">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black transition-all text-left group ${activeTab === tab.id
                    ? 'bg-brand-vibrant text-white shadow-lg shadow-brand-vibrant/20 scale-[1.02]'
                    : 'text-base-content/40 hover:text-base-content/70 hover:bg-white/5'
                    }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-white/5 text-base-content/30'
                    }`}>
                    <tab.icon size={20} strokeWidth={activeTab === tab.id ? 3 : 2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-premium leading-none">{tab.label.split(' ')[0]}</p>
                    <p className={`text-[13px] font-black mt-1.5 tracking-tight truncate ${activeTab === tab.id ? 'text-white' : 'text-base-content/20 group-hover:text-base-content/40'}`}>
                      {tab.label.split(' ').slice(1).join(' ') || tab.label}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <div className="glass-card p-6 rounded-3xl border-brand-vibrant/10 bg-brand-vibrant/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-brand-vibrant/10 flex items-center justify-center">
                  <Zap size={16} className="text-brand-vibrant" />
                </div>
                <h4 className="font-outfit font-black text-xs text-brand-vibrant uppercase tracking-widest">Premium Status</h4>
              </div>
              <p className="text-[11px] font-bold text-base-content/60 uppercase leading-relaxed">
                {user?.isPremium ? 'Authorized for Navigator tier operations.' : 'Explore basic mission parameters. Upgrade for full access.'}
              </p>
            </div>
          </div>

          <div className="min-w-0">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ ease: EASE, duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-black text-base-content flex items-center gap-2">
                      <User size={20} className="text-brand-vibrant" /> Account Profile
                    </h2>
                    <p className="text-base-content/60 font-medium text-sm">Manage your private identity and core account details.</p>
                  </div>

                  <div className={cardClass}>
                    <div className="p-6 border-b border-base-300/50 flex items-center justify-between">
                      <h3 className="text-base font-black text-base-content flex items-center gap-2">
                        Core Identity
                      </h3>
                      <div className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Private
                      </div>
                    </div>
                    <div className="p-6">
                      <form onSubmit={handleProfileUpdate} className="space-y-6">
                        <div className="flex items-center gap-5 mb-4 p-4 rounded-2xl bg-base-200/50 border border-base-300/30">
                          <div className="relative group">
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileChange}
                              accept="image/*"
                              className="hidden"
                            />
                            <div
                              onClick={handleAvatarClick}
                              className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-vibrant to-emerald-500 p-0.5 shadow-lg shadow-brand-vibrant/10 transition-transform group-hover:scale-105 cursor-pointer ${uploading ? 'animate-pulse' : ''}`}
                            >
                              <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center overflow-hidden relative">
                                {soloId?.avatarUrl ? (
                                  <img src={soloId.avatarUrl} alt={soloId.name || "Profile avatar"} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-2xl font-black text-white">{(formData.name || user?.email || '?').charAt(0).toUpperCase()}</span>
                                )}
                                {uploading && (
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <RotateCcw size={20} className="text-white animate-spin" />
                                  </div>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleAvatarClick}
                              className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-brand-vibrant text-white shadow-lg border-2 border-base-100 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Camera size={12} />
                            </button>
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-base-content text-lg truncate">{formData.name || 'Set your name'}</p>
                            <p className="text-sm text-base-content/50 font-medium truncate mb-2">{user?.email}</p>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={handleAvatarClick}
                                disabled={uploading}
                                className="text-[10px] font-black text-brand-vibrant uppercase tracking-tight px-3 py-1 rounded-lg bg-brand-vibrant/5 hover:bg-brand-vibrant/10 transition-colors disabled:opacity-50"
                              >
                                {uploading ? 'Uploading...' : 'Change Photo'}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-5">
                          <Input
                            label="Preferred Display Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Alex"
                            desc="Used across the app and as default for buddy profile."
                          />
                          <Input
                            label="Email (Account ID)"
                            value={user?.email || ''}
                            disabled
                            desc="Cannot be changed via this form."
                          />
                        </div>

                        <Input
                          label="Home base (City)"
                          value={formData.home_city}
                          onChange={(e) => setFormData({ ...formData, home_city: e.target.value })}
                          placeholder="e.g. London, United Kingdom"
                          icon={<MapPin size={18} />}
                          desc="Used for context in your buddy matches."
                        />

                        <div className="flex justify-end pt-2">
                          <button
                            type="submit"
                            disabled={saving || !hasUnsavedChanges}
                            className="inline-flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl font-bold px-6 py-2.5 transition-all shadow-xl shadow-slate-900/10"
                          >
                            {saving ? <RotateCcw size={16} className="animate-spin" /> : <Save size={16} />}
                            {saving ? 'Saving...' : 'Save Profile'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>

                  <div className={cardClass}>
                    <div className="p-6 border-b border-base-300/50 flex items-center justify-between">
                      <h3 className="text-base font-black text-base-content flex items-center gap-2">
                        Travel DNA
                      </h3>
                      <div className="px-2.5 py-0.5 rounded-full bg-brand-vibrant/10 text-[10px] font-black text-brand-vibrant uppercase tracking-widest">
                        Shared
                      </div>
                    </div>
                    <div className="p-6">
                      {soloId?.travelDna ? (
                        <div className="space-y-6">
                          <div className="p-5 rounded-2xl bg-brand-vibrant/5 border border-brand-vibrant/10 flex flex-col sm:flex-row items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-brand-vibrant/20">
                              <Fingerprint size={32} className="text-brand-vibrant" />
                            </div>
                            <div className="flex-1 text-center sm:text-left min-w-0">
                              <p className="text-xs font-black text-brand-vibrant uppercase tracking-widest mb-1">Your DNA Vibe</p>
                              <h4 className="text-2xl font-black text-slate-900 capitalize leading-none mb-2">{soloId.travelDna.style}</h4>
                              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900 text-white">Social: {soloId.travelDna.socialStyle}</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900 text-white">Adventure: {soloId.travelDna.adventureLevel}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => navigate('/quiz')}
                              className="px-4 py-2 bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 rounded-xl font-bold text-xs transition-all shadow-sm whitespace-nowrap"
                            >
                              Retake Quiz
                            </button>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-black text-base-content/40 uppercase tracking-widest">Public Interests</h4>
                              <span className="text-[10px] font-bold text-brand-vibrant">{formData.interests?.length || 0} selected</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {VIBE_INTERESTS.concat(ACTIVITY_INTERESTS).map((interest) => (
                                <button
                                  key={interest.value}
                                  type="button"
                                  onClick={() => toggleInterest(interest.value)}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-bold transition-all ${formData.interests?.includes(interest.value)
                                    ? 'bg-brand-vibrant/10 border-brand-vibrant text-brand-vibrant shadow-sm shadow-brand-vibrant/10'
                                    : 'bg-base-100 border-base-300/60 text-base-content/60 hover:border-base-content/20'
                                    }`}
                                >
                                  <interest.icon size={12} />
                                  <span className="truncate">{interest.value}</span>
                                </button>
                              ))}
                            </div>
                            <p className="text-[10px] text-base-content/40 font-medium italic">Select at least 3 interests to increase your match accuracy.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-5 rounded-2xl bg-base-200/50 border border-dashed border-base-300 text-center">
                          <p className="text-sm font-bold text-base-content/60 mb-3">You haven't discovered your Travel DNA yet.</p>
                          <button
                            onClick={() => navigate('/quiz')}
                            className="px-6 py-2 bg-brand-vibrant text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-vibrant/20"
                          >
                            Start Discovery Quiz
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className={cardClass}>
                      <div className="p-6 border-b border-base-300/50 flex items-center justify-between">
                        <h3 className="text-base font-black text-base-content flex items-center gap-2">
                          Safety Contact
                        </h3>
                        <Shield size={16} className="text-blue-500" />
                      </div>
                      <div className="p-6 space-y-4">
                        <Input
                          label="Secondary Phone Number"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+1 (555) 000-0000"
                          icon={<Phone size={16} />}
                        />
                        <div className="flex items-center justify-between">
                          <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex-1 mr-3">
                            <p className="text-[10px] leading-relaxed text-blue-700/80 font-bold">
                              Private: only used for safety check-ins. Never shown to others.
                            </p>
                          </div>
                          {formData.phone && (
                            <button
                              onClick={async () => {
                                try {
                                  const res = await api.post('/verification/verify-phone', { phone: formData.phone });
                                  if (res.data.success) {
                                    toast.success('Verification code sent!');
                                  } else {
                                    toast.error('Failed to send code');
                                  }
                                } catch (err) {
                                  toast.error('Verification failed');
                                }
                              }}
                              className="px-3 py-2 bg-brand-vibrant text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors"
                            >
                              Verify
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={cardClass}>
                      <div className="p-6 border-b border-base-300/50 flex items-center justify-between">
                        <h3 className="text-base font-black text-base-content flex items-center gap-2">
                          Your Public Persona
                        </h3>
                        <p className="text-[10px] font-bold text-indigo-600/60 uppercase tracking-widest mt-0.5">Visible to other travellers</p>
                      </div>
                      <div className="p-6">
                        <div className="flex flex-col items-center gap-4 text-center">
                          <div className="scale-75 origin-top -mb-16 -mt-8">
                            <SoloIDCard data={previewSoloId} />
                          </div>
                          <div className="space-y-3 z-10 w-full mt-4">
                            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100/50 text-left">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest flex items-center gap-1.5">
                                  <ShieldCheck size={12} /> Basic Verification
                                </span>
                                <span className="text-[10px] font-black text-slate-500">Tier 1</span>
                              </div>
                              <p className="text-[10px] font-bold text-indigo-900/60 leading-relaxed">
                                Your profile is basic. Verify your identity in Buddies to build more community trust.
                              </p>
                            </div>

                            <div className="flex items-center justify-between text-[10px] font-bold text-base-content/40 uppercase tracking-widest">
                              <span>Completeness</span>
                              <span className="text-brand-vibrant">{soloId?.completeness?.percentage || 0}%</span>
                            </div>
                            <div className="w-full h-1 bg-base-200 rounded-full overflow-hidden">
                              <div className="h-full bg-brand-vibrant transition-all duration-1000" style={{ width: `${soloId?.completeness?.percentage || 0}%` }} />
                            </div>
                            <button
                              onClick={() => setShowVerificationModal(true)}
                              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                            >
                              <Sparkles size={14} className="text-brand-vibrant" /> Enhance My Persona
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {hasUnsavedChanges && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="sticky bottom-4 z-10"
                    >
                      <div className={`${cardClass} p-4 flex items-center justify-between`}>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                          <span className="text-base-content/80 font-medium">Unsaved changes</span>
                        </div>
                        <button
                          onClick={handleProfileUpdate}
                          disabled={saving}
                          className="inline-flex items-center gap-2 bg-brand-vibrant text-white shadow-md shadow-brand-vibrant/25 hover:bg-green-600 disabled:opacity-50 rounded-xl font-bold px-5 py-2 text-sm transition-all"
                        >
                          <Save size={14} /> Save changes
                        </button>
                      </div>
                    </motion.div>
                  )}

                  <LanguagePreference />

                  {lastSaved && !hasUnsavedChanges && (
                    <div className="flex items-center gap-2 text-xs text-base-content/40 font-medium">
                      <Check size={12} /> Saved just now
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'security' && (
                <SecurityTab
                  saving={saving}
                  passwordData={passwordData}
                  setPasswordData={setPasswordData}
                  handlePasswordChange={handlePasswordChange}
                  handleLogoutOtherDevices={handleLogoutOtherDevices}
                  user={user}
                />
              )}

              {activeTab === 'notifications' && (
                <NotificationsTab
                  notifPrefs={notifPrefs}
                  setNotifPrefs={setNotifPrefs}
                  savingNotifPrefs={savingNotifPrefs}
                  handleSaveNotifPrefs={handleSaveNotifPrefs}
                  handleResetNotifPrefs={handleResetNotifPrefs}
                />
              )}

              {activeTab === 'billing' && (
                <BillingTab
                  subscriptionStatus={subscriptionStatus}
                  loadingSubscription={loadingSubscription}
                  handleCancelSubscription={handleCancelSubscription}
                  navigate={navigate}
                  saving={saving}
                  exporting={exporting}
                  handleExportData={handleExportData}
                  handleDeleteAccount={handleDeleteAccount}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <AccountDeletionModal
        isOpen={showAccountDeletionModal}
        isDeleting={saving}
        onClose={() => !saving && setShowAccountDeletionModal(false)}
        onConfirm={handleDeleteAccount}
      />
    </DashboardShell>
  );
};

export default Settings;
