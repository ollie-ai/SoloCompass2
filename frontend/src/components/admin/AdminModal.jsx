import { useEffect, useRef, memo } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminModal = memo(function AdminModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  footer,
  header,
  className = ''
}) {
  const modalRef = useRef(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (closeOnEscape && e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  // Handle click outside
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[90vw] max-h-[90vh]'
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleOverlayClick}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-base-content/50 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            ref={modalRef}
            className={`relative w-full ${sizeClasses[size]} bg-base-100 rounded-2xl border border-base-300 shadow-2xl overflow-hidden ${className}`}
          >
            {/* Header */}
            {(title || header || showCloseButton) && (
              <div className="flex items-center justify-between p-4 border-b border-base-300 bg-base-200/30">
                <div>
                  {title && (
                    <h3 className="text-lg font-black text-base-content">{title}</h3>
                  )}
                  {header}
                </div>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-base-100 hover:shadow-lg rounded-xl transition-all text-base-content/40 hover:text-primary"
                    title="Close"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className={`p-6 overflow-y-auto max-h-[70vh] ${size === 'full' ? 'flex-1' : ''}`}>
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="flex items-center justify-end gap-2 p-4 border-t border-base-300 bg-base-200/30">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
});

AdminModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  showCloseButton: PropTypes.bool,
  closeOnOverlayClick: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  footer: PropTypes.node,
  header: PropTypes.node,
  className: PropTypes.string,
};

AdminModal.defaultProps = {
  size: 'md',
  showCloseButton: true,
  closeOnOverlayClick: true,
  closeOnEscape: true,
  className: '',
};

export default AdminModal;