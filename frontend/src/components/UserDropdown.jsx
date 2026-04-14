import { useState, forwardRef, memo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useThemeStore } from '../stores/themeStore';
import { trackEvent } from '../lib/telemetry';
import { hasAdminAccess } from '../lib/adminAccess';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, LogOut, Crown, CreditCard, Plus, Shield, LayoutDashboard, HelpCircle, ChevronDown, Sun, Moon
} from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1];

const MenuItem = memo(forwardRef(({ to, children, onClick, icon: Icon, danger = false, highlight = false, onMenuClose }, ref) => {
  const handleMenuClick = (action) => {
    trackEvent('user_menu_action', { action });
  };

  return (
    <DropdownMenu.Item asChild>
      <Link
        ref={ref}
        to={to}
        onClick={() => { 
          handleMenuClick(to.split('/').pop() || to); 
          onClick?.(); 
          onMenuClose?.();
        }}
        className={`flex items-center gap-3 px-3 py-2 text-sm font-semibold transition-all outline-none cursor-pointer ${
          danger 
            ? 'text-base-content/60 hover:text-error hover:bg-error/10' 
            : highlight
              ? 'text-base-content/60 hover:text-primary hover:bg-primary/10'
              : 'text-base-content/60 hover:text-primary hover:bg-base-200/50'
        }`}
      >
        {Icon && (
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
            danger 
              ? 'bg-transparent text-base-content/30 group-hover:text-error' 
              : highlight
                ? 'bg-primary/10 text-primary'
                : 'bg-base-200 text-base-content/30'
          }`}>
            <Icon size={14} />
          </div>
        )}
        <span className="flex-1">{children}</span>
      </Link>
    </DropdownMenu.Item>
  );
}));

MenuItem.displayName = 'MenuItem';

MenuItem.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  icon: PropTypes.elementType,
  danger: PropTypes.bool,
  highlight: PropTypes.bool,
  onMenuClose: PropTypes.func,
};

const UserDropdown = forwardRef(({ user, onLogout, hasNotifications = false, activeTrip = null }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const closeMenu = () => setIsOpen(false);
  const { theme, toggleTheme } = useThemeStore();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getAvatarUrl = () => {
    // Try multiple possible avatar field names from the user object
    return user?.avatar_url || user?.avatarUrl || user?.photo_url || user?.profile_picture || null;
  };

  const isPremium = user?.is_premium === 1 || user?.is_premium === true;
  const isAdmin = hasAdminAccess(user);
  const avatarUrl = getAvatarUrl();

  return (
    <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          ref={ref}
          aria-label="User menu"
          className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-base-200 transition-all border-2 border-transparent hover:border-base-300 group outline-none"
        >
          <div className="relative">
            <motion.div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: avatarUrl 
                  ? `url(${avatarUrl}) center/cover` 
                  : 'linear-gradient(135deg, #10b981, #0ea5e9)'
              }}
            >
              {!avatarUrl && getInitials(user?.name)}
            </motion.div>
            {isPremium && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-md border-2 border-white">
                <Crown size={9} className="text-white" />
              </div>
            )}
            {hasNotifications && (
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-error/100 border-2 border-white rounded-full animate-pulse" />
            )}
          </div>
          <ChevronDown 
            size={16} 
            className="text-base-content/40 group-hover:text-base-content transition-colors" 
          />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <AnimatePresence>
          {isOpen && (
            <DropdownMenu.Content
              forceMount
              sideOffset={8}
              align="end"
              className="z-[60]"
            >
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ ease: EASE, duration: 0.2 }}
                className="min-w-[220px] bg-base-100 rounded-2xl shadow-2xl border border-base-300/60 overflow-hidden"
              >
                <div className="px-3 py-4 bg-base-200/50 border-b border-base-300/50">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                       <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md shrink-0 overflow-hidden" style={{
                          background: avatarUrl 
                            ? `url(${avatarUrl}) center/cover` 
                            : 'linear-gradient(135deg, #10b981, #22c55e)'
                        }}>
                          {!avatarUrl && getInitials(user?.name)}
                       </div>
                       {isPremium ? (
                         <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-400 rounded-full border-2 border-base-100 flex items-center justify-center shadow-sm">
                           <Crown size={8} className="text-white" />
                         </div>
                       ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-base-content truncate text-sm leading-tight">{user?.name || 'Explorer'}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                          user?.subscription_tier === 'guardian' ? 'bg-primary/10 text-primary' :
                          user?.subscription_tier === 'navigator' ? 'bg-purple-500/10 text-purple-400' :
                          'bg-base-300/50 text-base-content/40'
                        }`}>
                          {user?.subscription_tier === 'guardian' ? 'Guardian' : user?.subscription_tier === 'navigator' ? 'Navigator' : 'Explorer'}
                        </span>
                        {isPremium && <span className="text-[10px] text-base-content/40 font-medium">• Pro Account</span>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-2 space-y-1">
                  <MenuItem to="/dashboard" icon={LayoutDashboard} onMenuClose={closeMenu}>
                    Dashboard Overview
                  </MenuItem>
                  
                  <MenuItem to="/trips/new" icon={Plus} onMenuClose={closeMenu}>
                    New Adventure
                  </MenuItem>

                  <MenuItem to="/settings" icon={Settings} onMenuClose={closeMenu}>
                    Account Settings
                  </MenuItem>
                </div>

                <div className="border-t border-base-300/50 p-1.5 space-y-0.5">
                  {isPremium ? (
                    <MenuItem to="/settings?tab=billing" icon={CreditCard} onMenuClose={closeMenu}>
                      Manage Billing
                    </MenuItem>
                  ) : (
                    <MenuItem to="/settings?tab=billing" icon={Crown} highlight onMenuClose={closeMenu}>
                      Upgrade Plan
                    </MenuItem>
                  )}

                  <MenuItem to="/help" icon={HelpCircle} onMenuClose={closeMenu}>
                    Help Center
                  </MenuItem>
                </div>

                {isAdmin && (
                  <div className="border-t border-base-300/50 p-2">
                    <MenuItem to="/admin/dashboard" icon={Shield} onMenuClose={closeMenu}>
                      Staff Console
                    </MenuItem>
                  </div>
                )}
                
                <div className="border-t border-base-300/50 p-2">
                  <p className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-base-content/30">Theme</p>
                  <div className="mt-1 space-y-0.5">
                    <button
                      onClick={() => useThemeStore.getState().setTheme('solocompass')}
                      className={`flex items-center gap-3 w-full px-3 py-2 text-sm font-medium transition-all outline-none cursor-pointer rounded-lg ${
                        theme === 'solocompass' 
                          ? 'bg-primary/10 text-primary' 
                          : 'text-base-content/60 hover:text-base-content hover:bg-base-200/50'
                      }`}
                    >
                      <Sun size={14} className="shrink-0" />
                      <span className="flex-1 text-left">Light</span>
                      {theme === 'solocompass' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </button>
                    <button
                      onClick={() => useThemeStore.getState().setTheme('solocompass-dark')}
                      className={`flex items-center gap-3 w-full px-3 py-2 text-sm font-medium transition-all outline-none cursor-pointer rounded-lg ${
                        theme === 'solocompass-dark' 
                          ? 'bg-primary/10 text-primary' 
                          : 'text-base-content/60 hover:text-base-content hover:bg-base-200/50'
                      }`}
                    >
                      <Moon size={14} className="shrink-0" />
                      <span className="flex-1 text-left">Dark</span>
                      {theme === 'solocompass-dark' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="border-t border-base-300/50 p-2">
                  <MenuItem to="/logout" icon={LogOut} danger onClick={onLogout} onMenuClose={closeMenu}>
                    Log out of account
                  </MenuItem>
                </div>
              </motion.div>
            </DropdownMenu.Content>
          )}
        </AnimatePresence>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
});

UserDropdown.displayName = 'UserDropdown';

UserDropdown.propTypes = {
  user: PropTypes.object,
  onLogout: PropTypes.func,
  hasNotifications: PropTypes.bool,
  activeTrip: PropTypes.object,
};

export default UserDropdown;
