import { Fragment } from 'react';
import { X } from 'lucide-react';

const AdminDrawer = ({ isOpen, onClose, title, children, size = 'lg', footer }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full'
  };

  return (
    <Fragment>
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-50 w-fullshadow-xl animate-slide-in">
        <div className={`absolute right-0 top-0 h-full w-full ${sizeClasses[size]} bg-base-100 shadow-2xl flex flex-col`}>
          <div className="flex items-center justify-between p-4 border-b border-base-300">
            <h3 className="text-lg font-black text-base-content uppercase tracking-widest">
              {title}
            </h3>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-base-200 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
          {footer && (
            <div className="p-4 border-t border-base-300 flex justify-end gap-2">
              {footer}
            </div>
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default AdminDrawer;