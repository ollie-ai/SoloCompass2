import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import NotificationTemplates from '../components/admin/NotificationTemplates';
import { hasAdminAccess } from '../lib/adminAccess';

const AdminNotifications = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeSubTab, setActiveSubTab] = useState('templates');
  
  useEffect(() => {
    if (user && !hasAdminAccess(user)) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in bg-base-100 text-base-content min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-base-content tracking-tighter">Notifications</h1>
        <p className="text-base-content/60 font-medium">Manage notification systems</p>
      </div>
      
      {/* Sub-tabs */}
      <div className="flex gap-4 border-b border-base-300 pb-px mb-8">
        {['types', 'ops', 'delivery', 'templates', 'test'].map(sub => (
          <button
            key={sub}
            onClick={() => setActiveSubTab(sub)}
            className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${
              activeSubTab === sub ? 'text-primary' : 'text-base-content/40 hover:text-base-content'
            }`}
          >
            {sub === 'types' ? 'Types' : sub === 'ops' ? 'Ops Alerts' : sub === 'delivery' ? 'Delivery' : sub === 'templates' ? 'Templates' : 'Test'}
            {activeSubTab === sub && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"></div>}
          </button>
        ))}
      </div>

      {activeSubTab === 'templates' && <NotificationTemplates />}
      
      {activeSubTab !== 'templates' && (
        <div className="text-center py-20 text-base-content/40">
          <p className="font-bold">{activeSubTab} section coming soon</p>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;