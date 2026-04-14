import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { 
  MapPin, 
  User, 
  Globe, 
  Palette, 
  Bell, 
  ShieldAlert, 
  AlertTriangle, 
  Edit2, 
  Activity,
  ChevronLeft,
  ChevronRight,
  Monitor,
  AlertCircle,
  Package,
  Zap,
  Shield,
  HeadphonesIcon,
  CreditCard,
  Settings
} from 'lucide-react';

const AdminSidebar = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('destinations');

  const tabs = [
    // Main
    { id: 'dashboard', label: 'Dashboard', icon: Activity, tooltip: 'Overview and quick actions' },
    { id: 'destinations', label: 'Destinations', icon: MapPin, tooltip: 'Manage travel destinations' },
    { id: 'users', label: 'Travelers', icon: User, tooltip: 'Manage user accounts' },
    { id: 'analytics', label: 'Intelligence', icon: Globe, tooltip: 'View analytics and reports' },
    
    // Operations
    { id: 'incidents', label: 'Incidents', icon: AlertCircle, tooltip: 'Manage launch blockers and issues' },
    { id: 'jobs', label: 'Jobs', icon: Package, tooltip: 'Monitor failed jobs and webhooks' },
    { id: 'errors', label: 'Errors', icon: AlertTriangle, tooltip: 'Monitor system errors' },
    { id: 'health', label: 'Health', icon: Activity, tooltip: 'Monitor system status' },
    
    // Management
    { id: 'sessions', label: 'Sessions', icon: Monitor, tooltip: 'Manage active user sessions' },
    { id: 'moderation', label: 'Moderation', icon: Edit2, tooltip: 'Content moderation queue' },
    { id: 'gdpr', label: 'GDPR', icon: Shield, tooltip: 'Privacy and data management' },
    
    // Settings
    { id: 'notifications', label: 'Notifications', icon: Bell, tooltip: 'Manage notification systems' },
    { id: 'theme', label: 'Theme', icon: Palette, tooltip: 'Customize application appearance' },
    { id: 'config', label: 'Config', icon: Settings, tooltip: 'Feature flags and integrations' },
    
    // Legacy/Admin
    { id: 'audit', label: 'Audit Logs', icon: ShieldAlert, tooltip: 'View system audit trails' }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    navigate(`/admin/${tabId}`);
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside className={`fixed inset-0 flex flex-col bg-base-100 text-base-content w-64 ${isCollapsed ? 'w-16' : ''} transition-all z-50 border-r border-base-300`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-base-300 bg-base-200/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
            <Palette size={20} />
          </div>
          <div className={`flex-1 min-w-0 ${isCollapsed ? 'hidden' : ''}`}>
            <h2 className="font-black text-base-content text-lg">SoloCompass</h2>
            <p className="text-xs text-base-content/60">Admin Command Center</p>
          </div>
        </div>
        <button
          onClick={handleToggleCollapse}
          className="p-2 hover:bg-base-100 hover:shadow-lg rounded-xl transition-all text-base-content/40 hover:text-primary"
          title="Toggle Sidebar"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1 p-4">
          {tabs.map(tab => (
            <li key={tab.id}>
              <button
                onClick={() => handleTabClick(tab.id)}
                className={`flex w-full items-center gap-3 p-3 rounded-xl text-left transition-all ${activeTab === tab.id ? 'bg-primary/10 text-primary border-l-4 border-primary' : 'hover:bg-base-200/50 hover:text-base-content'}`}
                title={tab.tooltip}
              >
                {tab.icon && (
                  <div className={`w-8 h-8 flex-shrink-0 ${activeTab === tab.id ? 'bg-primary/20 text-primary rounded-xl' : 'text-base-content/50'}`}>
                    {tab.icon} {tab.icon.props && tab.icon.props.size ? null : <span className="sr-only">{tab.label} icon</span>}
                  </div>
                )}
                <span className={`flex-1 min-w-0 ${isCollapsed ? 'hidden' : ''} font-medium`}>
                  {tab.label}
                </span>
                {!isCollapsed && (
                  <div className="w-2 h-2 flex-shrink-0">
                    {activeTab === tab.id && (
                      <div className="w-full h-full bg-primary rounded-full" />
                    )}
                  </div>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-base-300 bg-base-200/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
            <User size={18} className={isCollapsed ? 'hidden' : ''} />
          </div>
          <div className={`flex-1 min-w-0 ${isCollapsed ? 'hidden' : ''}`}>
            <p className="font-bold text-base-content">{user?.name || 'Admin'}</p>
            <p className="text-xs text-base-content/60">{user?.role || 'Administrator'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;