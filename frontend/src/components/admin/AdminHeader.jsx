import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import api from '../../lib/api';
import { Button } from '../Button';
import Loading from '../components/Loading';
import { 
  Plus, 
  Globe, 
  RefreshCw, 
  Search, 
  Filter,
  Eye,
  Trash2,
  Pencil,
  User,
  ShieldAlert,
  Activity,
  Bell,
  MapPin,
  Palette
} from 'lucide-react';

const AdminHeader = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(false);
  const [newCityName, setNewCityName] = useState('');
  const [researching, setResearching] = useState(false);
  
  // Extract path to determine active tab
  const pathParts = location.pathname.split('/').filter(Boolean);
  const activeTab = pathParts[1] || 'destinations';

  const handleSearch = (e) => {
    e.preventDefault();
    // In a real implementation, this would trigger a search
    console.log('Searching for:', searchTerm);
  };

  const handleFilterToggle = () => {
    const newFilter = activeTab === 'destinations' 
      ? (filterType === 'high_safety' ? '' : 'high_safety')
      : (filterType === 'admins' ? '' : 'admins');
    setFilterType(newFilter);
  };

  const handleTriggerResearch = async (e) => {
    e.preventDefault();
    if (!newCityName) return;
    
    try {
      setResearching(true);
      // In a real implementation, this would call the API
      console.log('Researching destination:', newCityName);
      setNewCityName('');
    } catch (error) {
      console.error('Research failed:', error);
    } finally {
      setResearching(false);
    }
  };

  // Define tab-specific actions
  const getTabActions = () => {
    switch (activeTab) {
      case 'destinations':
        return (
          <>
            <form onSubmit={handleTriggerResearch} className="flex gap-2">
              <input 
                type="text"
                placeholder="New City to Research..."
                value={newCityName}
                onChange={(e) => setNewCityName(e.target.value)}
                className="w-48 pl-4 pr-4 py-2.5 rounded-xl border border-base-300 bg-base-100 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all text-xs font-bold"
              />
              <Button 
                variant="primary" 
                type="submit"
                disabled={researching || !newCityName}
                className="rounded-xl px-4 bg-success/100 hover:bg-emerald-600 border-none text-[10px] font-black"
              >
                {researching ? 'AI Researching...' : 'AI Research'}
              </Button>
            </form>
            <Button 
              variant="primary" 
              onClick={() => { /* setEditingDest(null); setShowModal(true); */ }}
              className="rounded-2xl flex items-center gap-2 shadow-xl hover:scale-105 transition-transform"
            >
              <Plus size={20} />
              Add Destination
            </Button>
          </>
        );
      case 'health':
        return (
          <Button 
            variant="outline" 
            onClick={() => { /* fetchSystemHealth(); */ }}
            className="rounded-2xl flex items-center gap-2 border-base-300"
          >
            <Globe size={20} />
            Refresh Stats
          </Button>
        );
      case 'users':
        return (
          <>
            <Button 
              variant="outline" 
              onClick={() => { /* setShowUserModal(true); */ }}
              className="rounded-2xl flex items-center gap-2"
            >
              <User size={20} />
              Invite Traveler
            </Button>
          </>
        );
      case 'theme':
        return null; // Theme editor has its own controls
      case 'notifications':
        return null; // Notification tabs handle their own actions
      case 'audit':
        return (
          <Button 
            variant="outline" 
            onClick={() => { /* fetchAuditLogs(); */ }}
            className="rounded-2xl flex items-center gap-2"
          >
            <RefreshCw size={20} />
            Refresh Logs
          </Button>
        );
      case 'errors':
        return (
          <Button 
            variant="outline" 
            onClick={() => { /* fetchErrorReports(); */ }}
            className="rounded-2xl flex items-center gap-2"
          >
            <RefreshCw size={20} />
            Refresh Reports
          </Button>
        );
      case 'moderation':
        return null; // Moderation has sub-tabs with their own actions
      default:
        return null;
    }
  };

  return (
    <header className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
      <div>
        <h1 className="text-4xl font-black text-base-content tracking-tighter">Mission Control</h1>
        <p className="text-base-content/60 font-medium">SoloCompass Central Intelligence & Moderation</p>
      </div>
      <div className="flex gap-4">
        <div className="flex flex-1 items-center justify-end gap-4">
          {activeTab === 'destinations' || activeTab === 'users' ? (
            <>
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={18} />
                  <input 
                    type="text"
                    placeholder={activeTab === 'users' ? "Search travelers..." : "Search destinations..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-base-300 bg-base-100 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-sm font-medium"
                  />
                </div>
                {activeTab === 'destinations' && (
                  <button 
                    type="submit" 
                    className="p-2 hover:bg-base-100 hover:shadow-lg rounded-xl transition-all text-base-content/40 hover:text-primary"
                  >
                    <Search size={16} />
                  </button>
                )}
              </form>
              <Button 
                variant="outline" 
                className="rounded-xl border-base-300 px-4 py-2.5 font-bold text-xs"
                onClick={handleFilterToggle}
              >
                <Filter size={16} className="mr-2" /> {filterType ? 'Clear Filter' : 'Filter'}
              </Button>
            </>
          ) : null}
          {getTabActions()}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;