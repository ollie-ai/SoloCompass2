import { memo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Button from './Button';

function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  variant = 'default',
  className = ''
}) {
  const variants = {
    default: 'border-base-300',
    primary: 'border-primary',
    warning: 'border-warning/30 bg-warning/10',
    error: 'border-error/30 bg-error/10'
  };

  return (
    <div className={`glass-card p-16 rounded-xl text-center border-2 border-dashed ${variants[variant]} ${className}`}>
      {Icon && (
        <div className="w-20 h-20 bg-base-200 rounded-xl flex items-center justify-center mx-auto mb-8 text-base-content/30">
          <Icon size={40} />
        </div>
      )}
      <h2 className="text-2xl font-black text-base-content mb-4">{title}</h2>
      {description && (
        <p className="text-base-content/60 mb-10 text-lg max-w-sm mx-auto">{description}</p>
      )}
      {(actionLabel && actionHref) && (
        <Link to={actionHref} className="inline-block">
          <Button size="lg" variant="primary" className="rounded-xl px-10">
            {actionLabel}
          </Button>
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <Button 
          size="lg" 
          variant="primary" 
          className="rounded-xl px-10"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  actionLabel: PropTypes.string,
  actionHref: PropTypes.string,
  onAction: PropTypes.func,
  variant: PropTypes.oneOf(['default', 'primary', 'warning', 'error']),
  className: PropTypes.string,
};

EmptyState.defaultProps = {
  variant: 'default',
  className: '',
};

function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  className = ''
}) {
  return (
    <div className={`glass-card p-10 rounded-xl text-center border-2 border-error/20 bg-error/10 ${className}`}>
      <div className="w-16 h-16 bg-error/20 rounded-xl flex items-center justify-center mx-auto mb-6 text-error">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-2xl font-black text-base-content mb-3">{title}</h2>
      {message && <p className="text-base-content/80 font-medium mb-6">{message}</p>}
      {onRetry && (
        <Button variant="primary" onClick={onRetry} className="rounded-xl">
          Try Again
        </Button>
      )}
    </div>
  );
}

ErrorState.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  onRetry: PropTypes.func,
  className: PropTypes.string,
};

export default memo(EmptyState);
